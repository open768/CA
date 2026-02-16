'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//###################################################################
//#
//###################################################################
class cCAGridStateInit extends cJQueryWidgetClass {
	grid_name = null

	//* **************************************************************
	constructor(poOptions, poElement) {
		super(poOptions, poElement)
		this.grid_name = poOptions.grid_name

		// set basic stuff
		poElement.addClass('ui-widget')

		// put something in the widget
		this._init()
	}

	//* **************************************************************
	//* Events
	//* **************************************************************
	onInitClick(poEvent) {
		var iSelected = parseInt($(poEvent.target).val()) // selected value in pulldown

		// ---------tell subscribers to init
		cCAActionEvent.fire_event(this.grid_name, cCAActionEvent.actions.grid_init, iSelected)
	}

	//* **************************************************************
	//* Privates
	//* **************************************************************
	_init() {
		var oElement = this.element

		var oDiv = $('<DIV>', { class: 'ui-widget-header' })
		oDiv.append('initialise')
		oElement.append(oDiv)

		oDiv = $('<DIV>', { class: 'ui-widget-content' })
		var oSelect = $('<SELECT>', {
			width: 200,
			title: 'choose a pattern to initialise the grid with',
		})
		oSelect.append($('<option>', { selected: 1, disabled: 1, value: -1 }).append('Initialise'))
		for (var sName in GRID_INIT_TYPES) {
			var oItem = GRID_INIT_TYPES[sName]
			var oOption = $('<option>', { value: oItem.id }).append(oItem.label)
			oSelect.append(oOption)
		}
		oDiv.append(oSelect)
		oSelect.selectmenu({
			select: poEvent => this.onInitClick(poEvent),
		})
		oElement.append(oDiv)
	}
}

//###################################################################
//#
//###################################################################
$.widget('ck.cagridinit', {
	options: {
		grid_name: null,
	},
	_create: function () {
		// checks
		var oOptions = this.options
		if (!oOptions.grid_name)
			$.error('grid name not provided')

		new cCAGridStateInit(oOptions, this.element) // call class constructor
	},
})
