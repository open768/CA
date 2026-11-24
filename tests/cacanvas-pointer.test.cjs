const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const context = vm.createContext({
	cJQueryWidgetClass: class {},
	$: { widget () {} },
	CELL_DATA_KEYS: { row: 'R', col: 'C' }
})
const filename = path.join(__dirname, '..', 'js', 'widgets', 'components', 'cacanvas.js')
vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename })
const Canvas = vm.runInContext('cCACanvas', context)

function widget (bounds = { left: 113, top: 227, width: 50, height: 30 }) {
	const instance = Object.create(Canvas.prototype)
	instance.options = { rows: 6, cols: 10, cell_size: 5 }
	instance.last_mouse_pos = { row: -1, col: -1 }
	instance._canvas = [{ width: 50, height: 30, getBoundingClientRect: () => bounds }]
	return instance
}

function locate (instance, clientX, clientY, changedOnly = false) {
	const result = instance._get_cell_rc_from_event({ clientX, clientY, offsetX: 999, offsetY: 999 }, changedOnly)
	return result && { ...result }
}

test('pointer positions map to canvas cells independently of container padding', () => {
	const instance = widget()
	assert.deepEqual(locate(instance, 113, 227), { row: 1, col: 1 })
	assert.deepEqual(locate(instance, 117.9, 231.9), { row: 1, col: 1 })
	assert.deepEqual(locate(instance, 118, 232), { row: 2, col: 2 })
	assert.deepEqual(locate(instance, 162.9, 256.9), { row: 6, col: 10 })
})

test('display scaling maps back to the canvas drawing coordinates', () => {
	const instance = widget({ left: 20, top: 40, width: 100, height: 15 })
	assert.deepEqual(locate(instance, 45, 46), { row: 3, col: 3 })
	assert.deepEqual(locate(instance, 119.9, 54.9), { row: 6, col: 10 })
})

test('clicks outside the canvas do not change edge cells', () => {
	const instance = widget()
	for (const [x, y] of [[112, 230], [120, 226], [163, 230], [120, 257]])
		assert.equal(locate(instance, x, y), null)
})

test('a hidden canvas ignores clicks', () => {
	const instance = widget({ left: 0, top: 0, width: 0, height: 0 })
	assert.equal(locate(instance, 0, 0), null)
})

test('dragging suppresses repeated updates within a cell', () => {
	const instance = widget()
	assert.deepEqual(locate(instance, 114, 228, true), { row: 1, col: 1 })
	assert.equal(locate(instance, 115, 229, true), null)
	assert.deepEqual(locate(instance, 119, 229, true), { row: 1, col: 2 })
})

test('cell rectangles cover the same area used for pointer selection', () => {
	const instance = widget()
	const rectangles = []
	instance._canvas.drawRect = rectangle => rectangles.push(rectangle)
	instance._count_drawn_cells = () => {}
	for (const [row, col] of [[1, 1], [3, 4], [6, 10]]) {
		instance._draw_cell({ value: 1, data: new Map([['R', row], ['C', col]]) })
		const rect = rectangles.at(-1)
		assert.equal(rect.fromCenter, false)
		assert.deepEqual(locate(instance, 113 + rect.x + rect.width / 2, 227 + rect.y + rect.height / 2), { row, col })
	}
})
