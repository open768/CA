const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

// Isolate calculation from browser events, rendering and repetition detection.
const context = vm.createContext({})
vm.runInContext(`
class cStaticClass {}
class cEventSubscriber {}
class cBaseEvent {
	static subscribe () {}
	static fire_event () {}
}
class cSparseArray {
	_data = new Map()
	get (row, col) { return this._data.get(row)?.get(col) }
	set (row, col, value) {
		if (!this._data.has(row)) this._data.set(row, new Map())
		this._data.get(row).set(col, value)
	}
}
const md5 = () => ''
const cDebug = { enter () {}, leave () {}, write () {}, extra_debug () {} }
`, context)
for (const name of ['catypes', 'caevent', 'cacell', 'carule', 'cagrid']) {
	const filename = path.join(__dirname, '..', 'js', 'CA', `${name}.js`)
	vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename })
}
const { cCAGrid, cCARule } = vm.runInContext('({ cCAGrid, cCARule })', context)

function makeGrid (rows, cols, values, outputs) {
	const grid = new cCAGrid('cache-test', rows, cols)
	grid._add_to_history = () => {}
	grid._informGridDone = () => {}
	grid.create_cells()
	const rule = new cCARule()
	for (let bitmap = 0; bitmap < 512; bitmap++)
		rule.set_output(1, bitmap, outputs[bitmap])
	grid.set_rule(rule)
	values.forEach((value, index) => grid.setCellValue(Math.floor(index / cols) + 1, index % cols + 1, value))
	return grid
}

function referenceStep (values, rows, cols, outputs) {
	return values.map((_, index) => {
		const row = Math.floor(index / cols)
		const col = index % cols
		let bitmap = 0
		for (let dr = -1; dr <= 1; dr++)
			for (let dc = -1; dc <= 1; dc++)
				bitmap = (bitmap << 1) | values[((row + dr + rows) % rows) * cols + (col + dc + cols) % cols]
		return bitmap === 0 ? 0 : outputs[bitmap]
	})
}

function stepAndCompare (grid, expected, outputs) {
	const next = referenceStep(expected, grid.rows, grid.cols, outputs)
	grid.runData.clear_cell_counters()
	grid._step()
	const actual = next.map((_, index) => grid.getCellValue(Math.floor(index / grid.cols) + 1, index % grid.cols + 1))
	assert.deepEqual(actual, next)
	return next
}

const life = Array.from({ length: 512 }, (_, bitmap) => {
	let neighbours = 0
	for (let bit = 0; bit < 9; bit++)
		if (bit !== 4) neighbours += (bitmap >> bit) & 1
	return +(neighbours === 3 || (neighbours === 2 && ((bitmap >> 4) & 1)))
})

test('unchanged cells cannot supply patterns from the previous generation', () => {
	const initial = [1, 1, 1, 1, 1, 0, 0, 0, 0]
	const grid = makeGrid(3, 3, initial, life)
	const first = stepAndCompare(grid, initial, life)
	const second = stepAndCompare(grid, first, life)
	assert.deepEqual(second, Array(9).fill(0))
})

test('all small wrapped Life grids match a reference for repeated steps', () => {
	for (const [rows, cols] of [[1, 1], [1, 3], [3, 1], [2, 3], [3, 3]])
		for (let mask = 0; mask < 2 ** (rows * cols); mask++) {
			let expected = Array.from({ length: rows * cols }, (_, index) => (mask >> index) & 1)
			const grid = makeGrid(rows, cols, expected, life)
			for (let generation = 0; generation < 6; generation++)
				expected = stepAndCompare(grid, expected, life)
		}
})

test('different rule tables and rectangular grids match a reference', () => {
	let seed = 12345
	const randomBit = () => {
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
		return seed >>> 31
	}
	for (let sample = 0; sample < 20; sample++) {
		const outputs = Array.from({ length: 512 }, randomBit)
		let expected = Array.from({ length: 35 }, randomBit)
		const grid = makeGrid(5, 7, expected, outputs)
		for (let generation = 0; generation < 20; generation++)
			expected = stepAndCompare(grid, expected, outputs)
	}
})

test('a manual edit after a no-change step does not reuse stale patterns', () => {
	let expected = Array(16).fill(0)
	const grid = makeGrid(4, 4, expected, life)
	expected = stepAndCompare(grid, expected, life)
	for (const index of [0, 1, 4]) {
		expected[index] = 1
		grid.setCellValue(Math.floor(index / 4) + 1, index % 4 + 1, 1)
	}
	for (let generation = 0; generation < 6; generation++)
		expected = stepAndCompare(grid, expected, life)
})

test('bitmap calls without a generation ignore cached patterns', () => {
	const grid = makeGrid(3, 3, Array(9).fill(1), life)
	const cell = grid.getCell(2, 2)
	const north = grid.getCell(1, 2)
	north.evaluated.done = true
	north.evaluated.pattern = 0
	assert.equal(cell.get8Bitmap(), 511)
})

test('current-generation north and west patterns still enable bitwise reuse', () => {
	const grid = makeGrid(3, 3, Array(9).fill(1), life)
	grid.rule.evaluateCell(grid.getCell(1, 2), 1)
	grid.rule.evaluateCell(grid.getCell(2, 1), 1)
	const cell = grid.getCell(2, 2)
	const getNeighbour = cell.neighbours.get.bind(cell.neighbours)
	let lookups = 0
	cell.neighbours.get = direction => {
		lookups++
		return getNeighbour(direction)
	}
	assert.equal(cell.get8Bitmap(1), 511)
	assert.equal(lookups, 3, 'only north, west and southeast references are needed')
})

test('per-cell status events supply the grid ID, action and status payload', () => {
	const events = vm.runInContext('cCARuleEvent', context)
	const originalFire = events.fire_event
	const calls = []
	events.fire_event = (...args) => calls.push(args)
	try {
		const initial = [1, 1, 1, 1, 1, 0, 0, 0, 0]
		const grid = makeGrid(3, 3, initial, life)
		const expected = stepAndCompare(grid, initial, life)
		assert.equal(calls.length, 9)
		const totals = { active: 0, inactive: 0, changed: 0, bored: 0 }
		for (const args of calls) {
			assert.equal(args.length, 3)
			assert.equal(args[0], grid.name)
			assert.equal(args[1], events.actions.status)
			for (const key of Object.keys(totals)) totals[key] += args[2][key]
		}
		const active = expected.reduce((sum, value) => sum + value, 0)
		assert.deepEqual(totals, {
			active,
			inactive: 9 - active,
			changed: expected.filter((value, index) => value !== initial[index]).length,
			bored: 0
		})
	} finally {
		events.fire_event = originalFire
	}
})
