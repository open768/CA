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

	// #################################################################
	// # Constructor
	// #################################################################`
	constructor (poOptions, poElement) {
		super(
			poOptions,
			poElement
		)

		cDebug.enter()
		this.base_name = poOptions.base_name
		this.create_button = poOptions.create_button

		let oElement
		oElement = this.element

		// Bootstrap card; native title attributes provide control hints.
		oElement.addClass('card')

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

	// #################################################################
	// # Initialise
	// #################################################################`
	_init () {
		const oElement = this.element
		const sBodyID = cJquery.child_ID(oElement, cCAJsonTypes.BODY_ID)
		const oHeader = $('<div>', { class: 'card-header text-bg-primary p-0' })
		const oToggle = $('<button>', {
			type: 'button',
			id: cJquery.child_ID(oElement, cCAJsonTypes.BTN_ID),
			class: 'btn btn-primary w-100 text-start',
			'aria-expanded': 'false',
			'aria-controls': sBodyID
		}).text('JSON +')
		oToggle.on('click', () => this._showHide())
		oHeader.append(oToggle)

		const oBody = $('<div>', { id: sBodyID, class: 'card-body' })
		oBody.append($('<textarea>', {
			id: cJquery.child_ID(oElement, cCAJsonTypes.TEXTAREA_ID),
			class: 'form-control font-monospace mb-2',
			rows: 8,
			title: 'JSON goes here',
			'aria-label': 'Grid JSON'
		}))
		const oActions = $('<div>', { class: 'd-flex flex-wrap gap-2' })
		if (this.create_button) {
			const oCreate = $('<button>', { type: 'button', class: 'btn btn-outline-primary' }).text('Create')
			oCreate.on('click', () => this._onClickExport())
			oActions.append(oCreate)
		}

		const oImport = $('<button>', { type: 'button', class: 'btn btn-primary' }).text('Import')
		oImport.on('click', () => this._onClickImport())
		oActions.append(oImport)
		oBody.append(oActions).hide()
		oElement.append(oHeader, oBody)
	}

	_showHide () {
		const oBody = cJquery.get_child(this.element, cCAJsonTypes.BODY_ID)
		const oButton = cJquery.get_child(this.element, cCAJsonTypes.BTN_ID)
		const bExpanded = oButton.attr('aria-expanded') !== 'true'
		oBody.toggle(bExpanded)
		oButton.attr('aria-expanded', String(bExpanded)).text(bExpanded ? 'JSON −' : 'JSON +')
	}

	//* ****************************************************************
	_onClickExport () {
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
	_onClickImport () {
		cDebug.enter()

		const oElement = this.element

		// get the json
		const sID = cJquery.child_ID(
			oElement,
			cCAJsonTypes.TEXTAREA_ID
		)
		const sJson = $(`#${sID}`).val()
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
		/** @type {cCAGrid} */ const oGrid = cCAGridJSONImporter.populate(
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
	async _onCanvasEvent (poEvent) {
		cDebug.enter()
		if (poEvent.action === cCACanvasEvent.actions.set_grid)
			this.grid = poEvent.data

		cDebug.leave()
	}

	// #################################################################
	// # EVENTS
	// #################################################################`
	_create_json () {
		cDebug.enter()
		const oElement = this.element

		// export the grid
		const oObj = cCAGridJSONExporter.export(this.grid)
		const sJson = JSON.stringify(oObj)

		// updatethe UI with JSON
		const sID = cJquery.child_ID(
			oElement,
			cCAJsonTypes.TEXTAREA_ID
		)
		$(`#${sID}`).val(sJson)
		cDebug.leave()
	}
}

// ###############################################################################
// # widget
// ###############################################################################
$.widget(
	'ck.cajson',
	{
		options: {
			base_name: null,
			create_button: true
		},
		_create: function () {
			const oOptions = this.options
			if (!oOptions.base_name)
				$.error('base name not provided')

			new cCAJson(
				oOptions,
				this.element
			) // call class constructor
		}
	}
)
