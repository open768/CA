const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

function setup () {
	class Element {
		constructor () { this[0] = {}; this.children = []; this.content = '' }
		addClass () { return this }
		attr () { return this }
		on () { return this }
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
		setSize (size) { Object.assign(this.options, size) }
	}
	const event = actions => ({ actions, subscribe () {} })
	const popovers = []
	const listeners = new Map()
	const context = vm.createContext({
		$: jquery,
		window: {
			innerHeight: 800,
			innerWidth: 390,
			addEventListener: (type, listener) => listeners.set(type, listener),
			removeEventListener: type => listeners.delete(type)
		},
		document: {
			createElement: () => ({
				style: {},
				values: [{}, {}, {}],
				offsetWidth: 120,
				offsetHeight: 70,
				setAttribute () {},
				querySelectorAll () { return this.values },
				remove () { this.removed = true }
			}),
			body: { append: popover => popovers.push(popover) }
		},
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
	return { chart, target, popovers, listeners }
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

test('detail chart shares the history and receives live updates only while open', async () => {
	const { chart } = setup()
	chart._modal_chart_element = chart._chart_element
	chart._modal_chart_element[0].clientWidth = 900
	await chart.onCanvasEvent(status({ changed: 3, active: 8 }))
	assert.equal(chart._modal_chart, null)
	chart._modal_open = true
	chart._render_detail()
	const detail = chart._modal_chart
	assert.equal(detail.data, chart.vis_data)
	assert.equal(detail.options.width, 900)
	assert.equal(detail.options.height, 480)
	assert.equal(detail.options.axes[0].label, 'Run')
	assert.equal(detail.options.axes[1].label, 'Cells')
	await chart.onCanvasEvent(status({ changed: 2, active: 9 }))
	assert.equal(detail.updates, 1)
	assert.equal(detail.data[0].length, 2)
	chart._modal_open = false
	chart._clear_detail()
	assert.equal(detail.destroyed, true)
	await chart.onCanvasEvent(status({ changed: 1, active: 10 }))
	assert.equal(chart._modal_chart, null)
	assert.equal(chart.chart.data[0].length, 3)
})

test('an open detail chart resets with the grid and rebuilds when new data arrives', async () => {
	const { chart } = setup()
	chart._modal_chart_element = chart._chart_element
	chart._modal_chart_element[0].clientWidth = 800
	chart._modal_open = true
	chart._render_detail()
	assert.equal(chart._modal_chart, null)
	await chart.onCanvasEvent(status({ changed: 3, active: 8 }))
	const detail = chart._modal_chart
	await chart.onActionEvent({ action: 'init' })
	assert.equal(detail.destroyed, true)
	assert.equal(chart._modal_chart, null)
	await chart.onCanvasEvent(status({ changed: 1, active: 4 }))
	assert.notEqual(chart._modal_chart, detail)
	assert.deepEqual(dataOf(chart), [[0], [1], [4]])
	chart._modal_chart_element[0].clientWidth = 600
	chart._resize_detail()
	assert.equal(chart._modal_chart.options.width, 600)
})

test('both chart sizes use popovers instead of legends', () => {
	const { chart } = setup()
	assert.equal(chart._plot_options(240, 100).legend.show, false)
	const detail = chart._plot_options(900, 480, true)
	assert.equal(detail.legend.show, false)
	assert.equal(detail.plugins.length, 1)
})

test('mini popover shows point values, stays in the viewport and cleans up', async () => {
	const { chart, popovers, listeners } = setup()
	await chart.onCanvasEvent(status({ changed: 0, active: 8 }))
	const hooks = chart.chart.options.plugins[0].hooks
	hooks.init[0]()
	const popover = popovers[0]
	const plot = {
		data: chart.vis_data,
		cursor: { idx: 0, left: 50, top: 20 },
		over: { getBoundingClientRect: () => ({ left: 360, top: 780 }) }
	}
	hooks.setCursor[0](plot)
	assert.equal(popover.hidden, false)
	assert.deepEqual(popover.values.map(value => value.textContent), [0, 0, 8])
	assert.equal(popover.style.left, '262px')
	assert.equal(popover.style.top, '722px')
	listeners.get('scroll')()
	assert.equal(popover.hidden, true)
	plot.cursor.left = -10
	hooks.setCursor[0](plot)
	assert.equal(popover.hidden, true)
	plot.cursor.left = 50
	chart._modal_element = { hasClass: () => true }
	hooks.setCursor[0](plot)
	assert.equal(popover.hidden, true)
	hooks.destroy[0]()
	assert.equal(popover.removed, true)
	assert.equal(chart._popover, null)
	assert.equal(listeners.has('scroll'), false)
})

test('detail popover works over the modal without replacing the mini popover', async () => {
	const { chart, popovers } = setup()
	await chart.onCanvasEvent(status({ changed: 3, active: 8 }))
	const miniHooks = chart.chart.options.plugins[0].hooks
	const detailHooks = chart._plot_options(900, 480, true).plugins[0].hooks
	miniHooks.init[0]()
	detailHooks.init[0]()
	chart._modal_element = { hasClass: () => true }
	const plot = {
		data: chart.vis_data,
		cursor: { idx: 0, left: 50, top: 20 },
		over: { getBoundingClientRect: () => ({ left: 20, top: 30 }) }
	}
	miniHooks.setCursor[0](plot)
	detailHooks.setCursor[0](plot)
	assert.equal(popovers[0].hidden, true)
	assert.equal(popovers[1].hidden, false)
	assert.deepEqual(popovers[1].values.map(value => value.textContent), [0, 3, 8])
	assert.equal(chart._popover, popovers[0])
	plot.cursor.idx = null
	detailHooks.setCursor[0](plot)
	assert.equal(popovers[1].hidden, true)
	detailHooks.destroy[0]()
	assert.equal(popovers[1].removed, true)
	assert.equal(chart._popover, popovers[0])
})
