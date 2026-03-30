'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAWidgetTypes {
	static click_event = 'CAWidclick'
	static IDs = {
		RULE: 'RU',
		STATUS: 'ST',
		CELL_CONTAINER: 'CC',
		RULE_NEIGHBOUR_COUNT: 'RNC',
		RULE_VERB: 'RVE',
		RULE_OUT_STATE: 'ROS',
		RULE_IN_STATE: 'RIS'
	}
}

// #######################################################################
// #
// #######################################################################
$.widget(
	'ck.caeditwidget',
	{
		//* ****************************************************************
		// # Options
		//* ****************************************************************
		options: {
			index: -1,
			value: 0,
			cell_size: -1,
			debug: false
		},

		//* ****************************************************************
		// # Constructor
		//* ****************************************************************
		_create: function () {
			const oOptions = this.options
			const oElement = this.element

			oElement.uniqueId()
			oElement.addClass('ui-widget')
			oElement.addClass('caindex')
			oElement.click(() => this.onClick())

			// add a canvas
			const oCanvas = $('<canvas>')
			const iSize = oOptions.cell_size * 3 + 2
			oCanvas.attr(
				'width',
				iSize
			)
			oCanvas.attr(
				'height',
				iSize
			)
			oElement.append(oCanvas)

			// add the label
			if (oOptions.debug) {
				const oDiv = $('<div>')
				oDiv.append(oOptions.index)
				oElement.append(oDiv)
			}

			// draw the canvas
			this._drawGrid(oCanvas)
			this._drawNeighbourhood(oCanvas)
			this._set_value(oOptions.value)
		},

		//* ****************************************************************
		// # privates
		//* ****************************************************************
		_drawGrid: function (oCanvas) {
			const oOptions = this.options

			// -------------draw the 2 vertical and 2 horizontal lines for the grid
			const iMax = oOptions.cell_size * 3 + 2
			for (let iLine = 1; iLine <= 2; iLine++) {
				const iLineX = oOptions.cell_size * iLine + iLine
				oCanvas.drawLine({
					strokeStyle: 'black',
					strokeWidth: 1,
					x1: iLineX,
					y1: 0,
					x2: iLineX,
					y2: iMax
				})
				oCanvas.drawLine({
					strokeStyle: 'black',
					strokeWidth: 1,
					x1: 0,
					y1: iLineX,
					x2: iMax,
					y2: iLineX
				})
			}
		},

		//* *****************************************************************
		_drawNeighbourhood: function (oCanvas) {
			const oOptions = this.options

			// ----------- draw the cells
			let iDir, iCount, iBit
			let x, y

			iCount = 1
			x = y = oOptions.cell_size / 2

			for (iDir = CA_DIRECTIONS.northwest; iDir <= CA_DIRECTIONS.southeast; iDir++) {
				iBit = cCAIndexOps.get_value(
					oOptions.index,
					iDir
				)
				if (iBit > 0)
					oCanvas.drawRect({
						fillStyle: 'black',
						x,
						y,
						width: oOptions.cell_size * 0.8,
						height: oOptions.cell_size * 0.8,
						fromCenter: true
					})

				x += oOptions.cell_size + 1
				iCount++
				if (iCount > 3) {
					iCount = 1
					x = oOptions.cell_size / 2
					y += oOptions.cell_size + 1
				}
			}
		},

		//* *****************************************************************
		_set_value: function (piValue) {
			const oElement = this.element
			const oOptions = this.options

			oOptions.value = piValue

			// change cell style if its value
			if (piValue == 0)
				oElement.removeClass('caindexon')
			else
				oElement.addClass('caindexon')
		},

		//* ****************************************************************
		// # Events
		//* ****************************************************************
		onClick: function () {
			const oOptions = this.options
			if (oOptions.value == 0)
				this._set_value(1)
			else
				this._set_value(0)

			bean.fire(
				document,
				cCAWidgetTypes.click_event,
				oOptions
			)
		}
	}
)

// #######################################################################
// #
// #######################################################################
class cCAEditorWidget extends cJQueryWidgetClass {
	rule = null

	//* ***************************************************************
	constructor (poOptions, poElement) {
		super(
			poOptions,
			poElement
		)

		// -------------------------------------------------------------------
		this._render()

		// -------------------------------------------------------------------
		// get the contents of the clipboard
		// async fetch from clipboard, will display a warning to user
		cBrowser.get_clipboard_permissions()
		this._set_status('waiting for clipboard')
		try {
			cBrowser.paste_from_clipboard(psText => this.onGotClipText(psText))
		} catch (e) {
			cBrowser.writeConsoleWarning(e.message)
			this._set_identity_rule()
		}

		// add event listener
		bean.on(
			document,
			cCAWidgetTypes.click_event,
			poOptions => this.onEditWidgetClick(poOptions)
		)
	}

	//* ****************************************************************
	// # privates
	//* ****************************************************************
	_render () {
		const oElement = this.element

		oElement.addClass('ui-widget')

		let oDiv, sID

		// -------------------------------------------------------------------
		// status window
		sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.STATUS
		)
		oDiv = $(
			'<DIV>',
			{
				class: 'ui-widget-header', id: sID
			}
		)
		oDiv.append('??')
		oElement.append(oDiv)

		// -------------------------------------------------------------------
		// rule box
		oDiv = $(
			'<DIV>',
			{
				class: 'ui-widget-content'
			}
		)
		sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE
		)
		const oBox = $(
			'<TEXTAREA>',
			{
				ID: sID,
				rows: 5,
				cols: 80,
				class: 'rule rule_wide',
				title: 'enter the base64 rule here'
			}
		)
		oBox.keyup(() => this.onRuleInputKeyUp())
		oDiv.append(oBox)

		let oButton = $(
			'<button>',
			{
				title: 'use the rule entered in the box above'
			}
		).button({
			icon: 'ui-icon-circle-arrow-e'
		})
		oButton.click(() => this.onSetRuleClick())
		oDiv.append(oButton)
		oElement.append(oDiv)
		oElement.append('<hr>')

		// -------------------------------------------------------------------
		// panel for description

		oDiv = $(
			'<DIV>',
			{
				class: 'ui-widget-header'
			}
		)
		oDiv.append('Rule Widgets')
		oElement.append(oDiv)

		oDiv = $(
			'<DIV>',
			{
				class: 'ui-widget-content'
			}
		)
		oDiv.append(
			'input configurations below show the output for a particular configuration of a cell and its neighbours. Those highlighted in blue will output 1 (alive) otherwise 0 (dead). Click to change'
		)
		oElement.append(oDiv)

		// -------------------------------------------------------------------
		// individual widgets that can be clicked
		sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.CELL_CONTAINER
		)
		oDiv = $(
			'<DIV>',
			{
				class: 'ui-widget-content', id: sID
			}
		)
		oElement.append(oDiv)
		oElement.append('<hr>')

		// -------------------------------------------------------------------
		// rule controls
		oDiv = $(
			'<DIV>',
			{
				class: 'ui-widget-header'
			}
		)
		oDiv.append('Rule Controls')
		oElement.append(oDiv)

		oDiv = $(
			'<DIV>',
			{
				class: 'ui-widget-content'
			}
		)
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		oDiv.append('Set widgets with state: ')
		sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE_IN_STATE
		)
		const oStateSelect = $(
			'<Select>',
			{
				id: sID
			}
		)
		let sProp, oOption
		for (sProp in cCAModifierTypes.states) {
			const oState = cCAModifierTypes.states[sProp]
			oOption = $(
				'<option>',
				{
					value: oState.id
				}
			).append(oState.label)
			oStateSelect.append(oOption)
		}

		oDiv.append(oStateSelect)

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		oDiv.append(' and ')
		sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE_VERB
		)
		const oVerbSelect = $(
			'<Select>',
			{
				id: sID
			}
		)
		for (sProp in cCAModifierTypes.verbs) {
			const oVerb = cCAModifierTypes.verbs[sProp]
			oOption = $(
				'<option>',
				{
					value: oVerb.id
				}
			).append(oVerb.label)
			oVerbSelect.append(oOption)
		}

		oDiv.append(oVerbSelect)

		sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.NEIGHBOUR_COUNT
		)
		const oCountSelect = $(
			'<Select>',
			{
				id: sID
			}
		)
		for (let i = 1; i <= 8; i++) {
			oOption = $('<option>').append(i)
			oCountSelect.append(oOption)
		}

		oDiv.append(oCountSelect)

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		oDiv.append(' Neighbours to output ')
		sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE_OUT_STATE
		)
		// any cell with X neighbours will output 1 0r zero
		const oOutSelect = $(
			'<Select>',
			{
				id: sID
			}
		)
		oOutSelect.append($('<option>').append(0))
		oOutSelect.append($('<option>').append(1))
		oDiv.append(oOutSelect)

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		oButton = $('<button>').append('Apply')
		oDiv.append(oButton)
		oButton.click(() => this.onNeighbourRuleClick())
		oElement.append(oDiv)
	}

	//* ****************************************************************
	_set_status (psText) {
		const oElement = this.element
		const sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.STATUS
		)
		$('#' + sID).html(psText)
	}

	//* ************************************************************
	_add_edit_widgets () {
		const oOptions = this.options
		const oElement = this.element
		const oRule = this.rule

		// clear out any cells present
		const sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.CELL_CONTAINER
		)
		const oDiv = $('#' + sID)
		oDiv.empty()

		// add the cells
		let iVal
		for (let iIndex = 1; iIndex <= CACONSTS.MAX_INPUTS; iIndex++) {
			try {
				iVal = oRule.get_rule_output(
					CA_STATES.default_state,
					iIndex
				)
			} catch (e) {
				iVal = 0
				console.log(e.message)
			}

			const oSpan = $('<SPAN>').caeditwidget({
				index: iIndex,
				value: iVal,
				cell_size: oOptions.cell_size
			})
			oDiv.append(oSpan)
		}
	}

	//* ************************************************************
	_set_identity_rule () {
		const oRule = cCaIdentityRule.makeRule()
		const s64 = cCARuleBase64Exporter.export(
			oRule,
			CA_STATES.default_state
		)
		this._set_base64Rule(s64)
		this._set_status('Identity Rule')
		this.onSetRuleClick()
	}

	//* ************************************************************
	_set_base64Rule (ps64) {
		const oElement = this.element
		const sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE
		)
		$('#' + sID).val(ps64)
	}

	//* ****************************************************************
	// # Events
	//* ****************************************************************
	onGotClipText (psText) {
		if (psText === '') {
			cBrowser.writeConsoleWarning('nothing in clipboard!')
			this._set_identity_rule()
			return
		}

		try {
			this.rule = cCARuleBase64Importer.makeRule(psText)
			this._set_base64Rule(psText)
			this.onSetRuleClick()
			this._set_status('rule loaded from clipboard')
		} catch (e) {
			cBrowser.writeConsoleWarning('not a valid rule in clipboard!')
			this._set_identity_rule()
		}
	}

	//* ************************************************************
	onSetRuleClick () {
		const oElement = this.element
		const sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE
		)
		const oTextArea = $('#' + sID)

		try {
			this.rule = cCARuleBase64Importer.makeRule(oTextArea.val())
			this._add_edit_widgets()
		} catch (e) {
			alert('Whoops - something went wrong!\n\n' + e.message)
		}
	}

	//* ************************************************************
	onEditWidgetClick (poData) {
		const oRule = this.rule

		try {
			oRule.set_output(
				CA_STATES.default_state,
				poData.index,
				poData.value
			)
			const s64 = cCARuleBase64Exporter.export(
				oRule,
				CA_STATES.default_state
			)
			this._set_base64Rule(s64)
		} catch (e) {
			alert('Whoops - something went wrong!\n\n' + e.message)
		}
	}

	//* ************************************************************
	onRuleInputKeyUp () {
		const oElement = this.element
		const sID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE
		)
		const oTextArea = $('#' + sID)
		const sText = oTextArea.val()
		const iDiff = CACONSTS.BASE64_LENGTH - sText.length

		this._set_status(iDiff + ' chars remaining')
	}

	//* ************************************************************
	onNeighbourRuleClick () {
		const oElement = this.element
		const oRule = this.rule

		const sInID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE_IN_STATE
		)
		const iInEnum = parseInt($('#' + sInID).val())
		const sCountID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.NEIGHBOUR_COUNT
		)
		const iCount = parseInt($('#' + sCountID).val())
		const sVerbID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE_VERB
		)
		const iVerb = parseInt($('#' + sVerbID).val())
		const sOutID = cJquery.child_ID(
			oElement,
			cCAWidgetTypes.IDs.RULE_OUT_STATE
		)
		const iValue = parseInt($('#' + sOutID).val())

		cCARuleModifier.modify_neighbours(
			oRule,
			iInEnum,
			iVerb,
			iCount,
			iValue
		)
		const s64 = cCARuleBase64Exporter.export(
			oRule,
			CA_STATES.default_state
		)
		this._set_base64Rule(s64)
		this.onSetRuleClick()
	}
}

$.widget(
	'ck.caeditor',
	{
		//* ***************************************************************
		// # Options
		//* ***************************************************************
		options: {
			cell_size: 10
		},

		//* ****************************************************************
		// # Constructor
		//* ****************************************************************
		_create: function () {
			new cCAEditorWidget(
				this.options,
				this.element
			)
		}
	}
)
