'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cIndexWidget extends cJQueryWidgetClass{

	constructor(poOptions, poElement){
		super(poOptions, poElement)

		// check for classes
		if (typeof cCARule !== 'function')
			$.error('missing cCARule class')

		if (!bean)
			$.error('missing bean class')

		if (!poOptions.name)
			$.error('missing name')	
	}

	init(){
		var oOptions = this.options
		var oElement = this.element

		var sCaName = oOptions.name

		// set basic stuff
		var oCell
		var oContainer = $('<div>')
		// ----------------------------------------------------------------------------------
		// left controls - rule configuration
		oCell = $('<div>', { class: 'w3-cell w3-cell-top w3-container' })
		var oLeftCtrlDiv = $('<DIV>', { width: 350, id: 'leftControl' })
		oLeftCtrlDiv.cacontrolsl({ grid_name: sCaName })
		oCell.append(oLeftCtrlDiv)
		oContainer.append(oCell)

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		oCell = $('<div>', { class: 'w3-cell w3-cell-top w3-container' })
		var oCanvasDiv = $('<SPAN>', {
			title: 'this is where the magic happens',
			id: 'canvas',
		})
		oCanvasDiv.cacanvas({
			cols: oOptions.cols,
			rows: oOptions.rows,
			cell_size: oOptions.cell_size,
			grid_name: sCaName,
		})
		oCell.append(oCanvasDiv)
		oContainer.append(oCell)

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		// right panel - grid initialisation, status and run controls
		oCell = $('<div>', { class: 'w3-cell w3-cell-top w3-container' })
		var oRightCtrlDiv = $('<DIV>', { width: 240, id: 'rightControl' })
		oRightCtrlDiv.cacontrolsr({ grid_name: sCaName })
		oCell.append(oRightCtrlDiv)
		oContainer.append(oCell)
		oContainer.append(oCell)
		oElement.append(oContainer)

		// ----------------------------------------------------------------------------------
		oContainer = $('<div>', { class: 'w3-cell-row' })
		// JSON panel
		oCell = $('<div>', { class: 'w3-cell' })
		var oJsonDiv = $('<DIV>', {
			title: 'json will appear here',
			id: 'JsonPanel',
		})
		oJsonDiv.cajson({ grid_name: sCaName })
		oCell.append(oJsonDiv)
		oContainer.append(oCell)
		oElement.append(oContainer)

		// check clipboard
		cBrowser.get_clipboard_permissions(true)

		// ---------------informs subscribers that UI is ready -------------------------------
		cCAActionEvent.fire_event(oOptions.name, cCAActionEvent.actions.ready, null)
	}
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget('ck.caindex', {
	//#################################################################
	// # Definition
	//#################################################################
	options: {
		cols: 100,
		rows: 100,
		cell_size: 5,
		name: null,
	},

	//#################################################################
	// # Constructor
	// #################################################################`
	_create: function () {
		var oWidget = new cIndexWidget(this.options, this.element)	
		oWidget.init()
	}
})
