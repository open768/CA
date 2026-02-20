'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
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

	//#################################################################
	// # Constructor
	// #################################################################`
	constructor(poOptions, poElement) {
		super(poOptions, poElement)
		cDebug.enter()

		var oElement = this.element
		this.base_name = poOptions.base_name

		// check dependencies
		if (!oElement.selectmenu)
			$.error('selectmenu class is missing! check includes')

		// set basic stuff
		oElement.addClass('ui-widget')
		oElement.addClass('CAControls')
		$(oElement).tooltip()

		// put something in the widget
		this._init()

		// subscribe to CA Events
		cCARuleEvent.subscribe(this.base_name, poEvent => this._onRuleEvent(poEvent))
	}

	//#################################################################
	// # Initialise
	// #################################################################`
	_init() {
		var oHeader, oContent, sID

		var oElement = this.element
		/** @type cCAControlsL */

		// --rules widgets-------------------------------------------------
		oHeader = $('<DIV>', { class: 'ui-widget-header' })
		{
			oHeader.append('<SPAN>Rule</SPAN>')

			sID = cJquery.child_ID(oElement, LEFT_CTRL_IDS.status_ID)
			var oSpan = $('<SPAN>', { id: sID }).html(' ??') // STATUS div
			oHeader.append(oSpan)

			oElement.append(oHeader)
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		oContent = $('<DIV>', { class: 'ui-widget-content' })
		{
			this._init_presets(oContent)
			this._init_repeater(oContent)
			this._init_ruleentry(oContent)
			this._init_boredom(oContent)
		}

		oElement.append(oContent)
	}

	//* ****************************************************************************
	_init_boredom(poContent) {
		var oElement = this.element

		poContent.append('<HR>Boredom')
		var sID = cJquery.child_ID(oElement, LEFT_CTRL_IDS.boredom_ID)
		var oSelect = $('<SELECT>', {
			id: sID,
			width: 50,
			title: 'how many times will a cell see a pattern before it gets bored',
			disabled: true,
		})
		oSelect.append($('<option>', { selected: 1, disabled: 1 }).append('Select'))
		oSelect.append($('<option>', { value: CACONSTS.NO_BOREDOM }).append('Never'))
		for (var i = 2; i < 10; i++)
			oSelect.append($('<option>', { value: i }).append(i + ' times'))
		for (var i = 10; i <= 100; i+=10)
			oSelect.append($('<option>', { value: i }).append(i + ' times'))

		poContent.append(oSelect)
		oSelect.selectmenu({
			select: poEvent => this._onSetRuleClick()
		})
	}

	//* ****************************************************************************
	_init_ruleentry(poContent) {
		var oElement = this.element
		poContent.append('<HR>')
		//---------------- textbox
		var sID = cJquery.child_ID(oElement, LEFT_CTRL_IDS.rule_text_ID)
		var oBox = $('<TEXTAREA>', {
			ID: sID,
			class: 'rule',
			title: 'enter the rule here',
		})
		oBox.keyup(() => this._onTextareaChange())
		poContent.append(oBox)

		// -------------- controls
		sID = cJquery.child_ID(oElement, LEFT_CTRL_IDS.rule_type_id)
		var oSelect = $('<SELECT>', {
			id: sID,
			width: 200,
			title: 'choose the rule type to enter in the box above',
		})
		oSelect.append($('<option>', { selected: 1, disabled: 1, value: -1 }).append('Rule Type'))
		oSelect.append($('<option>', { value: CARULE_TYPES.base64 }).append('base64'))
		oSelect.append($('<option>', { value: CARULE_TYPES.life }).append('life'))
		oSelect.append($('<option>', { value: CARULE_TYPES.wolfram1d }).append('wolfram'))
		poContent.append(oSelect)
		oSelect.selectmenu()

		var oButton = $('<button>', {
			title: 'use the rule entered in the box above',
		}).button({ icon: 'ui-icon-circle-arrow-e' })
		oButton.click(() => this._onSetRuleClick())
		poContent.append(oButton)
	}

	//* ****************************************************************************
	_init_repeater(poContent) {
		var oElement = this.element
		poContent.append('<HR>')
		poContent.append('word repeater')

		var sID = cJquery.child_ID(oElement, LEFT_CTRL_IDS.repeater_ID)
		var oInput = $('<INPUT>', {
			type: 'text',
			id: sID,
			size: 12,
			title: 'put anything in this box - eg your name',
		})
		poContent.append(oInput)

		var oButton = $('<button>', {
			title: 'creates a rule from the word in the box',
		}).button({ icon: 'ui-icon-circle-arrow-e' })
		oButton.click(() => this._onSetRepeaterClick())

		poContent.append(oButton)
	}

	//* ****************************************************************************
	_init_presets(poContent){
		var oElement = this.element

		poContent.append('Rule Presets')
		var sID = cJquery.child_ID(oElement, LEFT_CTRL_IDS.preset_ID)
		var oSelect = $('<SELECT>', {
			id: sID,
			width: 200,
			title: 'pick a preset rule',
		})
		this._populate_presets(oSelect)
		poContent.append(oSelect)

		oSelect.selectmenu({
			select: poEvent => this._onPresetsClick(poEvent),
		})
	}

	//#################################################################
	// # EVENTS
	// #################################################################`
	_onRuleEvent(poEvent) {
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

	//#################################################################
	// # callbacks
	// #################################################################`
	_onSetRepeaterClick() {
		var oElement = this.element

		var oInput = cJquery.get_child(oElement, LEFT_CTRL_IDS.repeater_ID)
		var sInput = oInput.val().trim()
		if (sInput === '') {
			alert('empty input string :-(')
			return
		}

		try {
			var oRule = cCARuleRepeatBase64Importer.makeRule(sInput)
			this._update_rule_text(oRule)
		} catch (e) {
			alert('something went wrong:\n' + e.message)
		}
	}

	//* ***************************************************************************
	_onSetRuleClick() {
		var oElement = this.element

		var oTextArea = cJquery.get_child(oElement, LEFT_CTRL_IDS.rule_text_ID)
		var oRuleTypeSelect = cJquery.get_child(oElement, LEFT_CTRL_IDS.rule_type_id)

		if (!oRuleTypeSelect.val()) {
			alert('choose a rule type to import')
			return
		}

		//enable the boredom selector
		var sBoredomID = cJquery.child_ID(oElement, LEFT_CTRL_IDS.boredom_ID)
		cJquery.enable_element(sBoredomID,true)

		//parse the rule based on the type selected
		var iSelected = parseInt(oRuleTypeSelect.val())
		/** @type {cCARule} */ var oRule
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
					var oBoredomList = cJquery.get_child(oElement, LEFT_CTRL_IDS.boredom_ID)
					if (!isNaN(oBoredomList.val()))
						oRule.boredom_count = oBoredomList.val()
					else
						oRule.boredom_count = CACONSTS.NO_BOREDOM

					// inform subscribers
					cCARuleEvent.fire_event(this.base_name, cCARuleEvent.actions.set_rule, oRule)


					break
				default:
					throw new CAException('unknown rule type')
			}
		} catch (e) {
			alert('something went wrong:\n' + e.message)
			throw e
		}
	}

	//* ***************************************************************************
	_onTextareaChange() {
		var oElement = this.element

		var oTextArea = cJquery.get_child(oElement, LEFT_CTRL_IDS.rule_text_ID)
		var oSelect = cJquery.get_child(oElement, LEFT_CTRL_IDS.rule_type_id)
		var sSelected = oSelect.val()
		if (sSelected) {
			var iSelected = parseInt(sSelected)
			if (iSelected == CARULE_TYPES.base64) {
				var sText = oTextArea.val()
				var iDiff = CACONSTS.BASE64_LENGTH - sText.length
				this._set_status(iDiff + ' chars remaining')
			}
		}
	}

	//* ***************************************************************************
	_onPresetsClick(poEvent) {
		var oElement = this.element

		var oTextArea = cJquery.get_child(oElement, LEFT_CTRL_IDS.rule_text_ID)
		var oRulesSelect = cJquery.get_child(oElement, LEFT_CTRL_IDS.rule_type_id)

		var sPreset = $(poEvent.target).val()
		if (!sPreset)
			return

		if (sPreset === LEFT_CTRL_IDS.random_ID) {
			var oRule = cCaRandomRule.makeRule()
			this._update_rule_text(oRule)
		} else {
			var oRuleJson = JSON.parse(sPreset)

			switch (oRuleJson.type) {
				case CARULE_TYPES.life:
					oTextArea.val(oRuleJson.rule)
					oRulesSelect.val(CARULE_TYPES.life)
					oRulesSelect.selectmenu('refresh')
					this._onSetRuleClick()
					break
				default:
					alert('unknown rule type: ' + oRuleJson.type)
					throw new CAException('not implemented')
			}
		}
	}

	//#################################################################
	// # privates
	// #################################################################`
	_set_status(psText) {
		var oElement = this.element
		var oSpan = cJquery.get_child(oElement, LEFT_CTRL_IDS.status_ID)
		oSpan.html(psText)
	}

	//* ***************************************************************************
	_update_rule_text(poRule) {
		var oElement = this.element

		// convert to base64
		var s64 = cCARuleBase64Exporter.export(poRule, CA_STATES.default_state)
		this.rule = poRule

		// updatethe textarea with the rule and copy to clipboard
		var oTextArea = cJquery.get_child(oElement, LEFT_CTRL_IDS.rule_text_ID)
		oTextArea.val(s64)
		cBrowser.copy_to_clipboard(s64)

		// update the rule type and trigger the rule set
		var oSelect = cJquery.get_child(oElement, LEFT_CTRL_IDS.rule_type_id)
		oSelect.val(CARULE_TYPES.base64)
		oSelect.selectmenu('refresh')
		this._onSetRuleClick()
	}

	//* ***************************************************************************
	_populate_presets(poSelect) {
		var aPresets = cCALexicon.get_presets()

		poSelect.append($('<option>', { selected: 1, disabled: 1, value: -1 }).append('Select'))

		var oOption

		for (var i = 0; i < aPresets.length; i++) {
			var oPreset = aPresets[i]
			oOption = $('<option>', { value: JSON.stringify(oPreset) })
			oOption.append(oPreset.label)
			poSelect.append(oOption)
		}

		oOption = $('<option>', { value: LEFT_CTRL_IDS.random_ID })
		oOption.append('Random')
		poSelect.append(oOption)
	}
}

//###############################################################################
// # widget
//###############################################################################
$.widget('ck.cacontrolsl', {
	options: {
		base_name: null,
	},

	_create: function () {
		var oOptions = this.options
		if (!oOptions.base_name)
			$.error('grid name not provided')

		new cCAControlsL(oOptions, this.element) // call widget constructor
	},
})
