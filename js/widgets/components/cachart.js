'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
// #################################################################
// # Options
// #################################################################
class cCAChart extends cJQueryWidgetClass {
	runs = 0
	vis_data = null
	chart = null
	base_name = null
	CHART_ID = 'UP'
	/** @type {jQuery<HTMLElement>} */ _chart_element = null

	constructor (poOptions, poElement) {
		super(
			poOptions,
			poElement
		)
		// checks
		if (!poOptions.base_name)
			$.error('base name not provided')
		if (typeof uPlot === 'undefined')
			$.error('uPlot library is missing! check includes')

		// store the element
		this.base_name = poOptions.base_name

		const oElement = this.element

		// basic stuff
		oElement.addClass('card CAChart')
		oElement.width(poOptions.width)

		// put something in the widget
		oElement.append($(
			'<div>',
			{
				class: 'card-header py-1 px-2'
			}
		).text('Chart'))
		const oDiv = $(
			'<DIV>',
			{
				class: 'p-0',
				id: cJquery.child_ID(
					oElement,
					this.CHART_ID
				)
			}
		)
		oDiv.width(poOptions.width)
		oElement.append(oDiv)
		this._chart_element = oDiv
		this._clear_chart()

		// subscribe to CAEvents
		cCAActionEvent.subscribe(
			this.base_name,
			[cCAActionEvent.actions.grid_init],
			poEvent => this.onActionEvent(poEvent)
		)
		cCARuleEvent.subscribe(
			this.base_name,
			[cCARuleEvent.actions.set_rule],
			poEvent => this.onRuleEvent(poEvent)
		)
		cCACanvasEvent.subscribe(
			this.base_name,
			[cCACanvasEvent.actions.grid_status],
			poEvent => this.onCanvasEvent(poEvent)
		)
	}

	//* ****************************************************************
	// # methods
	//* ****************************************************************

	//* ****************************************************************
	_create_data () {
		// check if the data has been previously created
		if (this.vis_data)
			return

		const oChartElement = this._chart_element
		oChartElement.empty()
		// uPlot expects aligned columns: generation, changed cells, active cells.
		this.vis_data = [[], [], []]
		this.chart = new uPlot(
			{
				width: this.options.width,
				height: this.options.height,
				scales: {
					x: {
						time: false
					},
					y: {
						range: (poChart, piMin, piMax) => [0, Math.max(
							1,
							piMax
						) * 1.1]
					}
				},
				series: [
					{
						label: 'Run'
					},
					{
						label: 'changed',
						stroke: '#3366cc',
						width: 1
					},
					{
						label: 'active',
						stroke: '#dc3912',
						width: 1
					}
				],
				axes: [
					{
						size: 24,
						font: '10px sans-serif',
						values: (poChart, paSplits) => paSplits.map(piValue => Number.isInteger(piValue) ? String(piValue) : '')
					},
					{
						size: 42,
						space: 25,
						font: '10px sans-serif'
					}
				]
			},
			this.vis_data,
			oChartElement[0]
		)
	}

	//* ****************************************************************
	// # events
	//* ****************************************************************
	async onCanvasEvent (poEvent) {
		cDebug.enter()
		switch (poEvent.action) {
			case cCACanvasEvent.actions.grid_status:
				// add the data to the data structure and draw
				cDebug.write('status action')
				var oData = poEvent.data
				if (!oData) {
					cDebug.extra_debug('no data')
					return
				}

				this._create_data()
				this.vis_data[0].push(this.runs)
				this.vis_data[1].push(oData.changed)
				this.vis_data[2].push(oData.active)
				this.chart.setData(this.vis_data)

				this.runs++
				break
		}

		cDebug.leave()
	}

	//* ****************************************************************
	async onRuleEvent (poEvent) {
		cDebug.enter()
		switch (poEvent.action) {
			case cCARuleEvent.actions.set_rule:
				cDebug.write('set_rule action')
				this._clear_chart()
		}

		cDebug.leave()
	}

	//* ****************************************************************
	async onActionEvent (poEvent) {
		cDebug.enter()
		switch (poEvent.action) {
			case cCAActionEvent.actions.grid_init:
				cDebug.write('grid_init action')
				this._clear_chart()
		}

		cDebug.leave()
	}

	_clear_chart () {
		if (this.chart)
			this.chart.destroy()

		const oChartElement = this._chart_element
		this.vis_data = null
		this.chart = null
		this.runs = 0
		oChartElement.empty()
		oChartElement.append('Waiting for Data ...')
	}
}

// #################################################################
// # Options
// #################################################################
$.widget(
	'ck.cachart',
	{
		options: {
			width: 240,
			height: 100,
			base_name: null
		},

		//* ****************************************************************
		_create: function () {
			new cCAChart(
				this.options,
				this.element
			) // call the class constructor
		}
	}
)
