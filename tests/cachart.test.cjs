const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

function setup () {
	class Element {
		constructor () { this[0] = {}; this.children = []; this.content = '' }
		addClass () { return this }
		width () { return this }
		append (child) { this.children.push(child); return this }
		text (value) { this.content = value; return this }
		empty () { this.children = []; return this }
	}
	const target = new Element()
	const jquery = (tag, attributes) => attributes?.id === 'chart' ? target : new Element()
	jquery.widget = () => {}
	jquery.error = message => { throw new Error(message) }
	class Plot {
		constructor (options, data, element) {
			this.options = options
			this.data = data
			this.element = element
			this.destroyed = false
			this.updates = 0
		}
		setData (data) { this.data = data; this.updates++ }
		destroy () { this.destroyed = true }
	}
	const event = actions => ({ actions, subscribe () {} })
	const context = vm.createContext({
		$: jquery,
		uPlot: Plot,
		cJQueryWidgetClass: class {
			constructor (options, element) { this.options = options; this.element = element }
		},
		cJquery: {
			child_ID: () => 'chart',
			get_child: () => { throw new Error('Document lookup cannot find a detached chart') }
		},
		cDebug: { enter () {}, leave () {}, write () {}, extra_debug () {} },
		cCACanvasEvent: event({ grid_status: 'status' }),
		cCAActionEvent: event({ grid_init: 'init' }),
		cCARuleEvent: event({ set_rule: 'rule' })
	})
	const filename = path.join(__dirname, '..', 'js', 'widgets', 'components', 'cachart.js')
	vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename })
	const Chart = vm.runInContext('cCAChart', context)
	const chart = new Chart({ base_name: 'test', width: 240, height: 100 }, new Element())
	return { chart, target }
}

const status = data => ({ action: 'status', data })
const dataOf = chart => Array.from(chart.vis_data, column => Array.from(column))

test('chart initializes before its container is attached to the document', () => {
	const { chart, target } = setup()
	assert.equal(chart._chart_element, target)
	assert.equal(target.children.at(-1), 'Waiting for Data ...')
})

test('chart waits for data and plots aligned numeric generations and both cell counts', async () => {
	const { chart, target } = setup()
	assert.equal(chart.chart, null)
	assert.equal(target.children.at(-1), 'Waiting for Data ...')
	await chart.onCanvasEvent(status({ changed: 3, active: 8 }))
	const plot = chart.chart
	assert.equal(plot.options.scales.x.time, false)
	assert.equal(plot.options.width, 240)
	assert.equal(plot.options.height, 100)
	assert.deepEqual(Array.from(plot.options.series, series => series.label), ['Run', 'changed', 'active'])
	await chart.onCanvasEvent(status({ changed: 0, active: 0 }))
	assert.equal(chart.chart, plot)
	assert.equal(plot.updates, 2)
	assert.deepEqual(dataOf(chart), [[0, 1], [3, 0], [8, 0]])
	assert.equal(chart.runs, 2)
})

test('grid and rule resets destroy the plot and restart generation numbering', async () => {
	const { chart } = setup()
	for (const reset of [() => chart.onActionEvent({ action: 'init' }), () => chart.onRuleEvent({ action: 'rule' })]) {
		await chart.onCanvasEvent(status({ changed: 2, active: 5 }))
		const plot = chart.chart
		await reset()
		assert.equal(plot.destroyed, true)
		assert.equal(chart.chart, null)
		assert.equal(chart.vis_data, null)
		assert.equal(chart.runs, 0)
	}
	await chart.onCanvasEvent(status({ changed: 1, active: 4 }))
	assert.deepEqual(dataOf(chart), [[0], [1], [4]])
})

test('empty or unrelated events do not create a chart', async () => {
	const { chart } = setup()
	await chart.onCanvasEvent(status(null))
	await chart.onCanvasEvent({ action: 'other', data: { changed: 1, active: 1 } })
	assert.equal(chart.chart, null)
	assert.equal(chart.runs, 0)
})
