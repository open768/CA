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
	_modal_element = null
	_modal_chart_element = null
	_modal_chart = null
	_modal_open = false
	_popover = null
	_detail_resize = () => this._resize_detail()

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
		oElement.attr({
			role: 'button',
			tabindex: 0,
			'aria-haspopup': 'dialog',
			'aria-label': 'Open activity chart in detail'
		})
		oElement.on(
			'click',
			() => this._open_detail()
		)
		oElement.on(
			'keydown',
			poEvent => {
				if (poEvent.target === oElement[0] && (poEvent.key === 'Enter' || poEvent.key === ' ')) {
					poEvent.preventDefault()
					this._open_detail()
				}
			}
		)

		// put something in the widget
		oElement.append($(
			'<div>',
			{
				class: 'card-header py-1 px-2'
			}
		).text('activity'))
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
			this._plot_options(
				this.options.width,
				this.options.height
			),
			this.vis_data,
			oChartElement[0]
		)
	}

	_plot_options (piWidth, piHeight, pbDetail = false) {
		return {
			width: piWidth,
			height: piHeight,
			legend: {
				show: false
			},
			plugins: [this._point_popover(pbDetail)],
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
					size: pbDetail ? 48 : 24,
					label: pbDetail ? 'Run' : undefined,
					font: pbDetail ? '12px sans-serif' : '10px sans-serif',
					values: (poChart, paSplits) => paSplits.map(piValue => Number.isInteger(piValue) ? String(piValue) : '')
				},
				{
					size: pbDetail ? 64 : 42,
					label: pbDetail ? 'Cells' : undefined,
					space: pbDetail ? 40 : 25,
					font: pbDetail ? '12px sans-serif' : '10px sans-serif'
				}
			]
		}
	}

	_point_popover (pbDetail) {
		let oPopover
		let aValues
		const fnHide = () => {
			oPopover.hidden = true
		}

		return {
			hooks: {
				init: [() => {
					oPopover = document.createElement('div')
					oPopover.className = 'CAChartPopover'
					oPopover.hidden = true
					oPopover.setAttribute(
						'role',
						'tooltip'
					)
					oPopover.innerHTML = '<div>Run: <strong></strong></div><div class="changed">Changed: <strong></strong></div><div class="active">Active: <strong></strong></div>'
					aValues = oPopover.querySelectorAll('strong')
					document.body.append(oPopover)
					if (!pbDetail)
						this._popover = oPopover
					window.addEventListener(
						'scroll',
						fnHide,
						true
					)
				}],
				setCursor: [poPlot => {
					const oCursor = poPlot.cursor
					if (oCursor.idx == null || oCursor.left < 0 || oCursor.top < 0 || (!pbDetail && this._modal_element?.hasClass('show'))) {
						fnHide()
						return
					}

					for (let iSeries = 0; iSeries < 3; iSeries++)
						aValues[iSeries].textContent = poPlot.data[iSeries][oCursor.idx]
					oPopover.hidden = false
					const oBounds = poPlot.over.getBoundingClientRect()
					oPopover.style.left = `${Math.max(
						8,
						Math.min(
							window.innerWidth - oPopover.offsetWidth - 8,
							oBounds.left + oCursor.left + 12
						)
					)}px`
					oPopover.style.top = `${Math.max(
						8,
						Math.min(
							window.innerHeight - oPopover.offsetHeight - 8,
							oBounds.top + oCursor.top + 12
						)
					)}px`
				}],
				destroy: [() => {
					window.removeEventListener(
						'scroll',
						fnHide,
						true
					)
					oPopover.remove()
					if (!pbDetail)
						this._popover = null
				}]
			}
		}
	}

	_open_detail () {
		if (this._popover)
			this._popover.hidden = true
		if (!this._modal_element) {
			const sTitleId = cJquery.child_ID(
				this.element,
				'ActivityTitle'
			)
			this._modal_element = $(
				'<div>',
				{
					class: 'modal fade CAChart',
					tabindex: -1,
					'aria-hidden': 'true',
					'aria-labelledby': sTitleId
				}
			).html(`
				<div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">activity</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body"><div class="CAChartDetail"></div></div>
					</div>
				</div>
			`).appendTo('body')
			this._modal_element.find('.modal-title').attr(
				'id',
				sTitleId
			)
			this._modal_chart_element = this._modal_element.find('.CAChartDetail')
			this._modal_element.on(
				'shown.bs.modal',
				() => {
					this._modal_open = true
					this._render_detail()
					window.addEventListener(
						'resize',
						this._detail_resize
					)
				}
			)
			this._modal_element.on(
				'hidden.bs.modal',
				() => {
					this._modal_open = false
					this._clear_detail()
					window.removeEventListener(
						'resize',
						this._detail_resize
					)
					this.element.trigger('focus')
				}
			)
		}

		window.bootstrap.Modal.getOrCreateInstance(this._modal_element[0]).show()
	}

	_detail_size () {
		return {
			width: this._modal_chart_element[0].clientWidth,
			height: Math.max(
				100,
				Math.min(
					480,
					window.innerHeight - 220
				)
			)
		}
	}

	_render_detail () {
		if (!this._modal_open)
			return
		if (!this.vis_data) {
			this._modal_chart_element.text('Waiting for Data ...')
			return
		}

		if (!this._modal_chart) {
			const oSize = this._detail_size()
			this._modal_chart_element.empty()
			this._modal_chart = new uPlot(
				this._plot_options(
					oSize.width,
					oSize.height,
					true
				),
				this.vis_data,
				this._modal_chart_element[0]
			)
		} else
			this._modal_chart.setData(this.vis_data)
	}

	_resize_detail () {
		if (this._modal_chart && this._modal_open)
			this._modal_chart.setSize(this._detail_size())
	}

	_clear_detail () {
		if (this._modal_chart)
			this._modal_chart.destroy()
		this._modal_chart = null
		if (this._modal_chart_element)
			this._modal_chart_element.text('Waiting for Data ...')
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
				this._render_detail()

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
		this._clear_detail()

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
