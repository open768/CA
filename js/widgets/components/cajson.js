'use strict'

/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAJsonTypes {
	static TEXTAREA_ID = 'txt'
	static BODY_ID = 'body'
	static BTN_ID = 'btn'
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAJson extends cJQueryWidgetClass {
	/** @type {cCAGrid} */ grid = null
	/** @type {string} */ base_name = null
	/** @type {boolean} */ create_button = false

	//#################################################################
	// # Constructor
	// #################################################################`
	constructor(poOptions, poElement) {
		super(
			poOptions,
			poElement
		)

		cDebug.enter()
		this.base_name = poOptions.base_name
		this.create_button = poOptions.create_button

		var oElement
		oElement = this.element

		// check dependencies
		if (!oElement.tabs)
			$.error('tabs class is missing! check includes')

		// set basic stuff
		oElement.addClass('ui-widget')
		$(oElement).tooltip()

		// put something in the widget
		this._init()

		// subscribe to CA Events
		cCACanvasEvent.subscribe(
			this.base_name,
			[cCACanvasEvent.actions.set_grid],
			poEvent => this._onCanvasEvent(poEvent)
		)
		cDebug.leave()
	}

	//#################################################################
	// # Initialise
	// #################################################################`
	_init() {
		var oElement
		var oHeaderDiv, oBodyDiv, sBodyID, sID, oButton

		cDebug.enter()
		oElement = this.element
		sBodyID = cJquery.child_ID(
			oElement,
			cCAJsonTypes.BODY_ID
		)

		// -----------header----------------------------------------
		oHeaderDiv = $(
			'<header>',
			{
				class: 'w3-container w3-blue'
			}
		)
		{
			oHeaderDiv.append('<font size="+2">Json</font> ')

			var sButtonID = cJquery.child_ID(
				oElement,
				cCAJsonTypes.BTN_ID
			)
			oButton = $(
				'<button>',
				{
					ID: sButtonID,
					class: 'w3-button'
				}
			)
			{
				oButton.append('+')
				oButton.on(
					"click",
					() => this._showHide()
				)
				oHeaderDiv.append(oButton)
				//add the same click to the header
				oHeaderDiv.on(
					"click",
					() => this._showHide()
				)
			}
		}

		oElement.append(oHeaderDiv)

		// ----------------body-------------------------------------
		oBodyDiv = $(
			'<DIV>',
			{
				class: 'w3-container', ID: sBodyID
			}
		)
		{
			// ---------textbox
			sID = cJquery.child_ID(
				oElement,
				cCAJsonTypes.TEXTAREA_ID
			)
			{
				var oBox = $(
					'<TEXTAREA>',
					{
						ID: sID,
						class: 'json',
						title: 'Json goes here',
					}
				)
				oBodyDiv.append(oBox)
			}

			// ---------buttons
			if (this.create_button) {
				oButton = $(
					'<button>',
					{
						class: 'w3-button'
					}
				)
				{
					oButton.append('Create')
					oButton.on(
						"click",
						() => this._onClickExport()
					)
					oBodyDiv.append(oButton)
				}
			}

			oButton = $(
				'<button>',
				{
					class: 'w3-button w3-purple'
				}
			)
			{
				oButton.append('Import')
				oButton.on(
					"click",
					() => this._onClickImport()
				)
				oBodyDiv.append(oButton)
			}
		}

		oElement.append(oBodyDiv)
		oBodyDiv.hide()

		cDebug.leave()
	}

	//#################################################################
	// # EVENTS
	// #################################################################`
	_showHide() {
		var oElement = this.element
		var oBody = cJquery.get_child(
			oElement,
			cCAJsonTypes.BODY_ID
		)

		var oButton = cJquery.get_child(
			oElement,
			cCAJsonTypes.BTN_ID
		)

		if (oButton.text() === '-'){
			oBody.hide()
			oButton.text('+')
		}else{
			oBody.show()
			oButton.text('-')
		}

		//prevent the click from doing anything else
		return false
	}

	//* ****************************************************************
	_onClickExport() {
		cDebug.enter()
		if (this.grid == null) {
			alert('cant create json - grid is not set')
			throw new Error('cant create json - grid is not set')
		} else if (!this.grid.get_rule()) {
			alert('no rule set')
			throw new Error('cant create json - rule is not set')
		} else
			this._create_json()

		cDebug.leave()
	}

	//* ****************************************************************
	_onClickImport() {
		cDebug.enter()

		var oElement = this.element

		// get the json
		var sID = cJquery.child_ID(
			oElement,
			cCAJsonTypes.TEXTAREA_ID
		)
		var sJson = $('#' + sID).val()
		if (sJson === '') {
			alert('no JSON to import')
			return
		}

		try {
			var oJson = JSON.parse(sJson)
		} catch (e) {
			alert('unable to import JSON')
			throw e
		}

		// create the grid
		/** @type {cCAGrid} */ var oGrid = cCAGridJSONImporter.populate(
			this.base_name,
			oJson
		)

		// fire event to triiger the use of the imported grid
		cCAActionEvent.fire_event(
			this.base_name,
			cCAActionEvent.notify.import_grid,
			oGrid
		)
		cDebug.leave()
	}

	//* ****************************************************************
	async _onCanvasEvent(poEvent) {
		cDebug.enter()
		if (poEvent.action === cCACanvasEvent.actions.set_grid)
			this.grid = poEvent.data

		cDebug.leave()
	}

	//#################################################################
	// # EVENTS
	// #################################################################`
	_create_json() {
		cDebug.enter()
		var oElement = this.element

		// export the grid
		var oObj = cCAGridJSONExporter.export(this.grid)
		var sJson = JSON.stringify(oObj)

		// updatethe UI with JSON
		var sID = cJquery.child_ID(
			oElement,
			cCAJsonTypes.TEXTAREA_ID
		)
		$('#' + sID).val(sJson)
		cDebug.leave()
	}
}

//###############################################################################
// # widget
//###############################################################################
$.widget(
	'ck.cajson',
	{
		options: {
			base_name: null,
			create_button: true,
		},
		_create: function () {
			var oOptions = this.options
			if (!oOptions.base_name)
				$.error('base name not provided')

			new cCAJson(
				oOptions,
				this.element
			) // call class constructor
		},
	}
)
