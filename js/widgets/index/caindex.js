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

		if (!poOptions.name)
			$.error('missing name')	
	}

	init(){
		var oOptions = this.options
		var oElement = this.element

		var sCaName = oOptions.name

		// set basic stuff
		var oTopContainer = $('<div>') //this will contain 3 cells
		{
		// ----------------------------------------------------------------------------------
		// left controls - rule configuration
			var oCell = $('<div>', { class: 'w3-cell w3-cell-top w3-container' })
			{
				var oLeftCtrlDiv = $('<DIV>', { width: 350, id: 'leftControl' })
				oLeftCtrlDiv.cacontrolsl({ grid_name: sCaName })
				oCell.append(oLeftCtrlDiv)
			}
			oTopContainer.append(oCell)

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oCell = $('<div>', { class: 'w3-cell w3-cell-top w3-container' })
			{
				var oCanvasDiv = $('<SPAN>', {
					title: 'this is where the magic happens'
				})
				oCanvasDiv.cacanvas({
					cols: oOptions.cols,
					rows: oOptions.rows,
					cell_size: oOptions.cell_size,
					grid_name: sCaName,
				})
				oCell.append(oCanvasDiv)
			}
			oTopContainer.append(oCell)

			// right panel - grid initialisation, status and run controls
			oCell = $('<div>', { class: 'w3-cell w3-cell-top w3-container' })
			{
				var oRightCtrlDiv = $('<DIV>', { width: 240, id: 'rightControl' })
				oRightCtrlDiv.cacontrolsr({ grid_name: sCaName })
				oCell.append(oRightCtrlDiv)
				oTopContainer.append(oCell)
			}
			oElement.append(oTopContainer)		
		}
		// ----------------------------------------------------------------------------------
		var oBottomContainer = $('<div>', { class: 'w3-cell-row' })
		{
		// JSON panel
			oCell = $('<div>', { class: 'w3-cell' })
			{
				var oJsonDiv = $('<DIV>', {
					title: 'json will appear here'
				})
				oJsonDiv.cajson({ grid_name: sCaName })
				oCell.append(oJsonDiv)
			}
			oBottomContainer.append(oCell)
		}
		oElement.append(oBottomContainer)

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
