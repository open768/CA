'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
/// load google charts

class cCAChartTypes {
	static is_charts_loaded = false

	static {
		if (!google.charts)
			$.error('google.charts class is missing! check includes')

		try {
			google.charts
				.load('current', { packages: ['corechart'] })
				.then(poEvent => this.is_charts_loaded = true)
		} catch (e) {
			cDebug.write('unable to load Google charts: ' + e.msg)
		}
	}

}

//#################################################################
// # Options
//#################################################################
class cCAChart extends cJQueryWidgetClass {
	runs = 0
	vis_data = null
	chart = null
	grid_name = null

	constructor(poOptions, poElement) {
		super(poOptions, poElement)
		// checks
		if (!poOptions.grid_name)
			$.error('grid name not provided')

		// store the element
		this.grid_name = poOptions.grid_name

		var oElement = this.element

		// basic stuff
		oElement.addClass('ui-widget')
		oElement.width(poOptions.width)

		// put something in the widget
		cJquery.add_widget_header(oElement, 'Chart')
		var oDiv = $('<DIV>', {
			class: 'ui-widget-content',
			id: cJquery.child_ID(oElement, 'chart'),
		})
		oDiv.width(poOptions.width)
		oDiv.height(poOptions.height)
		oElement.append(oDiv)
		this._clear_chart()

		// subscribe to CAEvents
		cCAActionEvent.subscribe(this.grid_name, poEvent => this.onCAActionEvent(poEvent))
		cCARuleEvent.subscribe(this.grid_name, poEvent => this.onCARuleEvent(poEvent))
		cCACanvasEvent.subscribe(this.grid_name, poEvent => this.onCACanvasEvent(poEvent))
	}

	//* ****************************************************************
	// # methods
	//* ****************************************************************

	//* ****************************************************************
	_create_data() {
		var oElement = this.element

		// check if the data has been previously created
		if (this.vis_data)
			return

		if (!google.visualization)
			$.error('google.visualization class is missing! check includes')

		this._clear_chart()

		// create the google data
		var oData = new google.visualization.DataTable()
		this.vis_data = oData
		oData.addColumn('number', 'Run')
		oData.addColumn('number', 'changed')
		oData.addColumn('number', 'active')
		oData.addColumn({ type: 'string', role: 'tooltip', p: { html: true } })

		// create the chart
		var oChartElement = $('#' + cJquery.child_ID(oElement, 'chart'))
		this.chart = new google.visualization.LineChart(oChartElement[0])
	}

	//* ****************************************************************
	// # events
	//* ****************************************************************
	onCACanvasEvent(poEvent) {
		cDebug.enter()
		switch (poEvent.action) {
			case cCACanvasEvent.actions.grid_status:
				// add the data to the data structure and draw
				cDebug.write('status action')
				if (!cCAChartTypes.is_charts_loaded) {
					cDebug.extra_debug('still waiting for google charts')
					cDebug.leave()
					return
				}
				var oData = poEvent.data
				if (!oData) {
					cDebug.extra_debug('no data')
					return
				}

				this._create_data()
				this.vis_data.addRow([this.runs, oData.changed, oData.active, 'Run: ' + this.runs])
				this.chart.draw(this.vis_data)

				this.runs++
				break
		}
		cDebug.leave()
	}

	//* ****************************************************************
	onCARuleEvent(poEvent) {
		cDebug.enter()
		switch (poEvent.action) {
			case cCARuleEvent.actions.set_rule:
				cDebug.write('set_rule action')
				this._clear_chart()
		}
		cDebug.leave()
	}

	//* ****************************************************************
	onCAActionEvent(poEvent) {
		cDebug.enter()
		switch (poEvent.action) {
			case cCAActionEvent.actions.grid_init:
				cDebug.write('grid_init action')
				this._clear_chart()
		}
		cDebug.leave()
	}

	_clear_chart() {
		var oElement = this.element
		var oChartElement = $('#' + cJquery.child_ID(oElement, 'chart'))
		this.vis_data = null
		this.chart = null
		this.runs = 0
		oChartElement.empty()
		oChartElement.append('Waiting for Data ...')
	}
}

//#################################################################
// # Options
//#################################################################
$.widget('ck.cachart', {
	options: {
		width: 240,
		height: 100,
		grid_name: null,
	},

	//* ****************************************************************
	_create: function () {
		new cCAChart(this.options, this.element) // call the class constructor
	},
})
