'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAStatusTypes {
	static ACTIVE_ID = 'A'
	static CHANGED_ID = 'C'
	static RUNS_ID = 'R'
	static HEAP_ID = 'H'
}

// ###################################################################
// #
// ###################################################################
class cCAStatusWidget extends cJQueryWidgetClass {
	base_name = null
	HEAP_INTERVAL = 100
	heap_timer_running = false
	stop_heap_timer = false

	//* **************************************************************
	constructor (poOptions, poElement) {
		super(
			poOptions,
			poElement
		)
		this.base_name = poOptions.base_name

		// set basic stuff
		poElement.addClass('ui-widget')

		// subscribe to CAEvents
		cCACanvasEvent.subscribe(
			this.base_name,
			[cCACanvasEvent.actions.grid_status],
			poEvent => this.onCanvasEvent(poEvent)
		)
		cCAActionEvent.subscribe(
			this.base_name,
			[cCAActionEvent.actions.control],
			poEvent => this.onActionEvent(poEvent)
		)

		// put something in the widget
		this._init()
	}

	//* ***************************************************************************
	//*
	//* ***************************************************************************
	async onHeapTimer () {
		const oElement = this.element

		cDebug.write('heap timer running')

		// display the heap used
		const oTarget = cJquery.get_child(
			oElement,
			cCAStatusTypes.HEAP_ID
		)
		const iHeapBytes = await cBrowser.getHeapMemoryUsed()
		const sHeapValue = cCommon.bytesToSize(iHeapBytes)
		oTarget.html(sHeapValue)
		cDebug.write(`heap: ${sHeapValue}`)

		// next heap timer
		if (this.stop_heap_timer) {
			this.heap_timer_running = false
			this.stop_heap_timer = false
		} else {
			// next timer
			setTimeout(
				() => this.onHeapTimer(),
				this.HEAP_INTERVAL
			)
			this.heap_timer_running = true
		}
	}

	//* ***************************************************************************
	//*
	//* ***************************************************************************
	async onActionEvent (poEvent) {
		if (poEvent.action == cCAActionEvent.actions.control) {
			const iAction = poEvent.data
			switch (iAction) {
				case cCAActionEvent.control_actions.play: // start watching the heap when CA is played
					if (this.heap_timer_running)
						cDebug.warn('heap timer allready running')
					else
						setTimeout(
							() => this.onHeapTimer(),
							this.HEAP_INTERVAL
						)

					break

				case cCAActionEvent.control_actions.stop:
					this.stop_heap_timer = true // stop watching heap when stop pressed, or CA stops
			}
		}
	}

	//* ***************************************************************************
	async onCanvasEvent (poEvent) {
		const oElement = this.element
		let oTarget

		switch (poEvent.action) {
			case cCACanvasEvent.actions.grid_status:
				if (!poEvent.data)
					return

				oTarget = cJquery.get_child(
					oElement,
					cCAStatusTypes.ACTIVE_ID
				)
				oTarget.html(poEvent.data.active)
				oTarget = cJquery.get_child(
					oElement,
					cCAStatusTypes.CHANGED_ID
				)
				oTarget.html(poEvent.data.changed)
				oTarget = cJquery.get_child(
					oElement,
					cCAStatusTypes.RUNS_ID
				)
				oTarget.html(poEvent.data.runs)
		}
	}

	//* **************************************************************
	//* Privates
	//* **************************************************************
	_add_row (poTable, psID, psLabel) {
		const oElement = this.element
		let oCell, oRow

		oRow = $('<tr>')
		oCell = $(
			'<td>',
			{
				align: 'right'
			}
		).append(psLabel)
		oRow.append(oCell)
		oCell = $(
			'<td>',
			{
				id: cJquery.child_ID(
					oElement,
					psID
				)
			}
		)
		oCell.append('??')
		oRow.append(oCell)
		poTable.append(oRow)
	}

	_init () {
		let oDiv, oTable
		const oElement = this.element

		// --create the UI-------------------------------------------------
		oDiv = $(
			'<DIV>',
			{
				class: 'ui-widget-header'
			}
		).append('Status')
		oElement.append(oDiv)

		oDiv = $(
			'<DIV>',
			{
				class: 'ui-widget-content'
			}
		)
		oTable = $(
			'<Table>',
			{
				cellpadding: 2
			}
		)
		this._add_row(
			oTable,
			cCAStatusTypes.ACTIVE_ID,
			'Active'
		)
		this._add_row(
			oTable,
			cCAStatusTypes.CHANGED_ID,
			'Changed'
		)
		this._add_row(
			oTable,
			cCAStatusTypes.RUNS_ID,
			'Runs'
		)
		this._add_row(
			oTable,
			cCAStatusTypes.HEAP_ID,
			'Heap'
		)
		oDiv.append(oTable)
		oElement.append(oDiv)
	}
}

// ###################################################################
// #
// ###################################################################
$.widget(
	'ck.castatus',
	{
		options: {
			base_name: null
		},
		_create: function () {
			// checks
			const oOptions = this.options
			if (!oOptions.base_name)
				$.error('base name not provided')

			new cCAStatusWidget(
				oOptions,
				this.element
			) // call widget constructor
		}
	}
)
