'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
const LEFT_CTRL_IDS = {
	rule_text_ID: 'txi',
	rule_type_id: 'tyi',
	status_ID: 'si',
	repeater_ID: 'rei',
	preset_ID: 'pi',
	boredom_ID: 'bi',
	random_ID: 'rni'
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//* this could be broken down into smaller widgets
class cCAControlsL extends cJQueryWidgetClass {
	/** @type cCAGrid */ grid = null
	/** @type cCARule */ rule = null
	/** @type string */ base_name = null

	// #################################################################
	// # Constructor
	// #################################################################`
	constructor (poOptions, poElement) {
		super(
			poOptions,
			poElement
		)
		cDebug.enter()

		const oElement = this.element
		this.base_name = poOptions.base_name

		// set basic stuff
		oElement.addClass('card')
		oElement.addClass('CAControls')

		// put something in the widget
		this._init()

		// subscribe to CA Events
		cCARuleEvent.subscribe(
			this.base_name,
			[cCARuleEvent.actions.update_rule],
			poEvent => this._onRuleEvent(poEvent)
		)
	}

	// #################################################################
	// # Initialise
	// #################################################################`
	_init () {
		let oHeader, oContent, sID

		const oElement = this.element
		/** @type cCAControlsL */

		// --rules widgets-------------------------------------------------
		oHeader = $(
			'<DIV>',
			{
				class: 'card-header py-1 px-2 d-flex flex-wrap align-items-center gap-2'
			}
		)
		{
			oHeader.append('<SPAN>Rule</SPAN>')

			sID = cJquery.child_ID(
				oElement,
				LEFT_CTRL_IDS.status_ID
			)
			const oSpan = $(
				'<SPAN>',
				{
					id: sID,
					class: 'small text-body-secondary',
					'aria-live': 'polite'
				}
			).html(' ??') // STATUS div
			oHeader.append(oSpan)

			oElement.append(oHeader)
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		oContent = $(
			'<DIV>',
			{
				class: 'card-body p-2'
			}
		)
		{
			this._init_presets(oContent)
			this._init_repeater(oContent)
			this._init_ruleentry(oContent)
			this._init_boredom(oContent)
		}

		oElement.append(oContent)
	}

	//* ****************************************************************************
	_init_boredom (poContent) {
		const oElement = this.element

		// ---------------- section
		const oSection = $(
			'<DIV>',
			{
				class: 'border-top pt-2'
			}
		)
		poContent.append(oSection)

		// ---------------- label
		const sID = cJquery.child_ID(
			oElement,
			LEFT_CTRL_IDS.boredom_ID
		)
		const oLabel = $(
			'<LABEL>',
			{
				for: sID,
				class: 'form-label'
			}
		)
		oLabel.append('Boredom')
		oSection.append(oLabel)

		// ---------------- selector
		const oSelect = $(
			'<SELECT>',
			{
				id: sID,
				class: 'form-select',
				title: 'how many times will a cell see the same neighbourhood before it gets bored and flips',
				disabled: true
			}
		)
		oSelect.append($(
			'<option>',
			{
				selected: 1, disabled: 1
			}
		).append('Select'))
		oSelect.append($(
			'<option>',
			{
				value: CACONSTS.NO_BOREDOM
			}
		).append('Never'))
		for (var i = 2; i < 10; i++)
			oSelect.append($(
				'<option>',
				{
					value: i
				}
			).append(i + ' times'))

		for (var i = 10; i <= 100; i += 10)
			oSelect.append($(
				'<option>',
				{
					value: i
				}
			).append(i + ' times'))

		oSection.append(oSelect)
		oSelect.on(
			'change',
			() => this._onSetRuleClick()
		)
	}

	//* ****************************************************************************
	_init_ruleentry (poContent) {
		const oElement = this.element

		// ---------------- section
		const oSection = $(
			'<DIV>',
			{
				class: 'border-top pt-2 mb-2'
			}
		)
		poContent.append(oSection)

		// ---------------- textbox
		let sID = cJquery.child_ID(
			oElement,
			LEFT_CTRL_IDS.rule_text_ID
		)
		let oLabel = $(
			'<LABEL>',
			{
				for: sID,
				class: 'form-label'
			}
		)
		oLabel.append('Rule')
		oSection.append(oLabel)

		const oBox = $(
			'<TEXTAREA>',
			{
				ID: sID,
				class: 'form-control font-monospace mb-2',
				rows: 4,
				title: 'enter the rule here'
			}
		)
		oBox.on(
			'input',
			() => this._onTextareaChange()
		)
		oSection.append(oBox)

		// -------------- controls
		sID = cJquery.child_ID(
			oElement,
			LEFT_CTRL_IDS.rule_type_id
		)
		oLabel = $(
			'<LABEL>',
			{
				for: sID,
				class: 'form-label'
			}
		)
		oLabel.append('Rule type')
		oSection.append(oLabel)

		const oControls = $(
			'<DIV>',
			{
				class: 'input-group'
			}
		)
		oSection.append(oControls)

		const oSelect = $(
			'<SELECT>',
			{
				id: sID,
				class: 'form-select',
				title: 'choose the rule type to enter in the box above'
			}
		)
		oSelect.append($(
			'<option>',
			{
				selected: 1, disabled: 1, value: -1
			}
		).append('Rule Type'))
		oSelect.append($(
			'<option>',
			{
				value: CARULE_TYPES.base64
			}
		).append('base64'))
		oSelect.append($(
			'<option>',
			{
				value: CARULE_TYPES.life
			}
		).append('life'))
		oSelect.append($(
			'<option>',
			{
				value: CARULE_TYPES.wolfram1d
			}
		).append('wolfram'))
		oControls.append(oSelect)

		const oButton = $(
			'<button>',
			{
				type: 'button',
				class: 'btn btn-primary',
				title: 'use the rule entered in the box above'
			}
		)
		oButton.append('Apply')
		oButton.click(() => this._onSetRuleClick())
		oControls.append(oButton)
	}

	//* ****************************************************************************
	_init_repeater (poContent) {
		const oElement = this.element

		// ---------------- section
		const oSection = $(
			'<DIV>',
			{
				class: 'border-top pt-2 mb-2'
			}
		)
		poContent.append(oSection)

		// ---------------- label
		const sID = cJquery.child_ID(
			oElement,
			LEFT_CTRL_IDS.repeater_ID
		)
		const oLabel = $(
			'<LABEL>',
			{
				for: sID,
				class: 'form-label'
			}
		)
		oLabel.append('Word repeater')
		oSection.append(oLabel)

		// ---------------- input group
		const oControls = $(
			'<DIV>',
			{
				class: 'input-group'
			}
		)
		oSection.append(oControls)

		// ---------------- textbox
		const oInput = $(
			'<INPUT>',
			{
				type: 'text',
				id: sID,
				class: 'form-control',
				title: 'put anything in this box - eg your name'
			}
		)
		oControls.append(oInput)

		// ---------------- button
		const oButton = $(
			'<button>',
			{
				type: 'button',
				class: 'btn btn-outline-primary',
				title: 'creates a rule from the word in the box'
			}
		)
		oButton.append('Generate')
		oButton.click(() => this._onSetRepeaterClick())

		oControls.append(oButton)
	}

	//* ****************************************************************************
	_init_presets (poContent) {
		const oElement = this.element

		// ---------------- section
		const oSection = $(
			'<DIV>',
			{
				class: 'mb-2'
			}
		)
		poContent.append(oSection)

		// ---------------- label
		const sID = cJquery.child_ID(
			oElement,
			LEFT_CTRL_IDS.preset_ID
		)
		const oLabel = $(
			'<LABEL>',
			{
				for: sID,
				class: 'form-label'
			}
		)
		oLabel.append('Rule presets')
		oSection.append(oLabel)

		// ---------------- selector
		const oSelect = $(
			'<SELECT>',
			{
				id: sID,
				class: 'form-select',
				title: 'pick a preset rule'
			}
		)
		this._populate_presets(oSelect)
		oSection.append(oSelect)

		oSelect.on(
			'change',
			poEvent => this._onPresetsClick(poEvent)
		)
	}

	// #################################################################
	// # EVENTS
	// #################################################################`
	_onRuleEvent (poEvent) {
		cDebug.enter()
		switch (poEvent.action) {
			case cCARuleEvent.actions.update_rule:
				cDebug.write('update_rule')
				var oRule = poEvent.data
				this._update_rule_text(oRule)
				break
		}

		cDebug.leave()
	}

	// #################################################################
	// # callbacks
	// #################################################################`
	_onSetRepeaterClick () {
		const oElement = this.element

		const oInput = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.repeater_ID
		)
		const sInput = oInput.val().trim()
		if (sInput === '') {
			alert('empty input string :-(')
			return
		}

		try {
			const oRule = cCARuleRepeatBase64Importer.makeRule(sInput)
			this._update_rule_text(oRule)
		} catch (e) {
			alert(`something went wrong:\n${e.message}`)
		}
	}

	//* ***************************************************************************
	_onSetRuleClick () {
		const oElement = this.element

		const oTextArea = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.rule_text_ID
		)
		const oRuleTypeSelect = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.rule_type_id
		)

		if (!oRuleTypeSelect.val()) {
			alert('choose a rule type to import')
			return
		}

		// enable the boredom selector
		const oBoredomSelect = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.boredom_ID
		)
		oBoredomSelect.prop(
			'disabled',
			false
		)

		// parse the rule based on the type selected
		const iSelected = parseInt(oRuleTypeSelect.val())
		/** @type {cCARule} */ let oRule
		try {
			switch (iSelected) {
				case CARULE_TYPES.life:
					oRule = cCARuleLifeImporter.makeRule(oTextArea.val())
					this._update_rule_text(oRule)
					break

				case CARULE_TYPES.wolfram1d:
					oRule = cCARuleWolfram1DImporter.makeRule(oTextArea.val())
					this._update_rule_text(oRule)
					break

				case CARULE_TYPES.base64:
					oRule = cCARuleBase64Importer.makeRule(oTextArea.val())

					// set the boredom if chosen
					var oBoredomList = cJquery.get_child(
						oElement,
						LEFT_CTRL_IDS.boredom_ID
					)
					if (!isNaN(oBoredomList.val()))
						oRule.boredom_count = oBoredomList.val()
					else
						oRule.boredom_count = CACONSTS.NO_BOREDOM

					// inform subscribers
					cCARuleEvent.fire_event(
						this.base_name,
						cCARuleEvent.actions.set_rule,
						oRule
					)

					break

				default:
					throw new eCAException('unknown rule type')
			}
		} catch (e) {
			alert(`something went wrong:\n${e.message}`)
			throw e
		}
	}

	//* ***************************************************************************
	_onTextareaChange () {
		const oElement = this.element

		const oTextArea = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.rule_text_ID
		)
		const oSelect = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.rule_type_id
		)
		const sSelected = oSelect.val()
		if (sSelected) {
			const iSelected = parseInt(sSelected)
			if (iSelected == CARULE_TYPES.base64) {
				const sText = oTextArea.val()
				const iDiff = CACONSTS.BASE64_LENGTH - sText.length
				this._set_status(iDiff + ' chars remaining')
			}
		}
	}

	//* ***************************************************************************
	_onPresetsClick (poEvent) {
		const oElement = this.element

		const oTextArea = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.rule_text_ID
		)
		const oRulesSelect = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.rule_type_id
		)

		const sPreset = $(poEvent.target).val()
		if (!sPreset)
			return

		if (sPreset === LEFT_CTRL_IDS.random_ID) {
			const oRule = cCaRandomRule.makeRule()
			this._update_rule_text(oRule)
		} else {
			const oRuleJson = JSON.parse(sPreset)

			switch (oRuleJson.type) {
				case CARULE_TYPES.life:
					oTextArea.val(oRuleJson.rule)
					oRulesSelect.val(CARULE_TYPES.life)
					this._onSetRuleClick()
					break

				default:
					alert(`unknown rule type: ${oRuleJson.type}`)
					throw new eCAException('not implemented')
			}
		}
	}

	// #################################################################
	// # privates
	// #################################################################`
	_set_status (psText) {
		const oElement = this.element
		const oSpan = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.status_ID
		)
		oSpan.html(psText)
	}

	//* ***************************************************************************
	_update_rule_text (poRule) {
		const oElement = this.element

		// convert to base64
		const s64 = cCARuleBase64Exporter.export(
			poRule,
			CA_STATES.default_state
		)
		this.rule = poRule

		// updatethe textarea with the rule and copy to clipboard
		const oTextArea = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.rule_text_ID
		)
		oTextArea.val(s64)
		cBrowser.copy_to_clipboard(s64)

		// update the rule type and trigger the rule set
		const oSelect = cJquery.get_child(
			oElement,
			LEFT_CTRL_IDS.rule_type_id
		)
		oSelect.val(CARULE_TYPES.base64)
		this._onSetRuleClick()
	}

	//* ***************************************************************************
	_populate_presets (poSelect) {
		const aPresets = cCALexicon.get_presets()

		poSelect.append($(
			'<option>',
			{
				selected: 1, disabled: 1, value: -1
			}
		).append('Select'))

		let oOption

		for (let i = 0; i < aPresets.length; i++) {
			const oPreset = aPresets[i]
			oOption = $(
				'<option>',
				{
					value: JSON.stringify(oPreset)
				}
			)
			oOption.append(oPreset.label)
			poSelect.append(oOption)
		}

		oOption = $(
			'<option>',
			{
				value: LEFT_CTRL_IDS.random_ID
			}
		)
		oOption.append('Random')
		poSelect.append(oOption)
	}
}

// ###############################################################################
// # widget
// ###############################################################################
$.widget(
	'ck.cacontrolsl',
	{
		options: {
			base_name: null
		},

		_create: function () {
			const oOptions = this.options
			if (!oOptions.base_name)
				$.error('base name not provided')

			new cCAControlsL(
				oOptions,
				this.element
			) // call widget constructor
		}
	}
)
