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
class cCAControlsR  extends cJQueryWidgetClass {
	grid = null
	grid_name = null

	//* **************************************************************
	constructor(poOptions, poElement) {
		super(poOptions, poElement)
		this.grid_name = poOptions.grid_name

		var oElement = this.element

		// set basic stuff
		oElement.addClass('ui-widget')

		// check dependencies
		if (!bean)
			$.error('bean is missing , chack includes')

		if (!oElement.cagridinit)
			$.error('cainit is missing , chack includes')

		if (!oElement.castatus)
			$.error('castatus is missing , chack includes')

		if (!oElement.cachart)
			$.error('caChart is missing , chack includes')

		if (!oElement.caremotecontrols)
			$.error('caremotecontrols is missing , chack includes')

		// put something in the widget
		this._init()
	}

	//* **************************************************************
	//* Privates
	//* **************************************************************
	_init() {
		var oDiv
		var oElement

		oElement = this.element

		// --status-------------------------------------------------
		oDiv = $('<DIV>')
		oDiv.castatus({ grid_name: this.grid_name })
		oElement.append(oDiv)
		oElement.append('<P>')

		// ---chart----------------------------------------------------------
		oDiv = $('<DIV>')
		oDiv.cachart({ grid_name: this.grid_name })
		oElement.append(oDiv)
		oElement.append('<P>')

		// --initialise------------------------------------------------
		oDiv = $('<DIV>')
		oDiv.cagridinit({ grid_name: this.grid_name })
		oElement.append(oDiv)
		oElement.append('<P>')

		// --controls------------------------------------------------
		oDiv = $('<DIV>', { class: 'ui-widget-header' })
		oDiv.caremotecontrols({ grid_name: this.grid_name })
		oElement.append(oDiv)
	}
}

//###################################################################
//#
//###################################################################
$.widget('ck.cacontrolsr', {
	options: {
		grid_name: null,
	},
	_create: function () {
		// checks
		var oOptions = this.options
		if (!oOptions.grid_name)
			$.error('grid name not provided')

		new cCAControlsR(oOptions, this.element) // call widgetclass
	},
})
