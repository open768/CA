"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cCAControlLTypes {
	static rule_text_ID = "text"
	static rule_type_id = "type"
	static status_ID = "status"
	static repeater_ID = "repeat"
	static preset_ID = "presets"
	static boredom_ID = "bored"

	static random_ID = "random"
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAControlsL {
	grid = null
	rule = null
	element = null
	grid_name = null

	//#################################################################
	//# Constructor
	//#################################################################`
	constructor(poOptions, poElement) {
		cDebug.enter()
		this.element = poElement
		var oThis = this
		var oElement
		this.grid_name = poOptions.grid_name

		oElement = this.element

		//check dependencies
		if (!bean) $.error("bean class is missing! check includes")
		if (!oElement.selectmenu) $.error("selectmenu class is missing! check includes")
		if (!cCARuleBase64Importer) $.error("cCARuleBase64Importer class is missing! check includes")

		//set basic stuff
		oElement.addClass("ui-widget")
		oElement.addClass("CAControls")
		$(oElement).tooltip()

		//put something in the widget
		oElement.empty()
		this.#init()

		//subscribe to CA Events
		cCAEventHelper.subscribe_to_rule_events( this.grid_name, poEvent => { oThis.#onCARuleEvent(poEvent) })
	}

	//#################################################################
	//# Initialise
	//#################################################################`
	#init() {
		var oThis, oElement
		var oHeader, oContent, sID

		oElement = this.element
		oThis = this


		//--rules widgets-------------------------------------------------
		oHeader= $("<DIV>", { class: "ui-widget-header" })
			oHeader.append("Rule")
			sID = cJquery.child_ID(oElement, cCAControlLTypes.status_ID)
			var oSpan = $("<SPAN>", { id: sID }).html(" ??") //STATUS div
			oHeader.append(oSpan)
		oElement.append(oHeader)

		//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		oContent = $("<DIV>", { class: "ui-widget-content" })
			oContent.append("Rule Presets")
			sID = cJquery.child_ID(oElement, cCAControlLTypes.preset_ID)
			var oSelect = $("<SELECT>", { id: sID, width: 200, title: "pick a preset rule" })
				this.#populate_presets(oSelect)
			oContent.append(oSelect)

			oSelect.selectmenu({
				select(poEvent) { oThis.#onPresetsClick(poEvent) }
			})

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oContent.append("<HR>")
			sID = cJquery.child_ID(oElement, cCAControlLTypes.repeater_ID)
			oContent.append("word repeater")

			var oInput = $("<INPUT>", { type: "text", id: sID, size: 12, icon: "ui-icon-circle-arrow-e", title: "put anything in this box - eg your name" })
			oContent.append(oInput)

			var oButton = $("<button>", { title: "creates a rule from the word in the box" }).button({ icon: "ui-icon-circle-arrow-e" })
				oButton.click(function () { oThis.#onSetNameClick() })
			oContent.append(oButton)

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oContent.append("<HR>")
			sID = cJquery.child_ID(oElement, cCAControlLTypes.rule_text_ID)
			var oBox = $("<TEXTAREA>", { ID: sID, class: "rule", title: "enter the rule here" })
			oBox.keyup(function () { oThis.#onTextareaChange() })
			oContent.append(oBox)

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			sID = cJquery.child_ID(oElement, cCAControlLTypes.rule_type_id)
			oSelect = $("<SELECT>", { id: sID, width: 200, title: "choose the rule type to enter in the box above" })
				oSelect.append($("<option>", { selected: 1, disabled: 1, value: -1 }).append("Rule Type"))
				oSelect.append($("<option>", { value: cCARuleTypes.rule_types.base64 }).append("base64"))
				oSelect.append($("<option>", { value: cCARuleTypes.rule_types.life }).append("life"))
				oSelect.append($("<option>", { value: cCARuleTypes.rule_types.wolfram1d }).append("wolfram"))
			oContent.append(oSelect)
			oSelect.selectmenu()

			oButton = $("<button>", { title: "use the rule entered in the box above" }).button({ icon: "ui-icon-circle-arrow-e" })
				oButton.click(function () { oThis.#onSetRuleClick() })
			oContent.append(oButton)

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oContent.append("<HR>Boredom")
			sID = cJquery.child_ID(oElement, cCAControlLTypes.boredom_ID)
			oSelect = $("<SELECT>", { id: sID, width: 50, title: "how many times will a cell see a pattern before it gets bored" })
				oSelect.append($("<option>", { selected: 1, disabled: 1 }).append("Select"))
				oSelect.append($("<option>", { value: cCARuleTypes.no_boredom }).append("Never"))
				for (var i = 2; i <= 10; i++) {
					oSelect.append($("<option>", { value: i }).append(i + " times"))
				}
			oContent.append(oSelect)
			oSelect.selectmenu({
				select(poEvent) { oThis.#onBoredomClick(poEvent) }
			})
		oElement.append(oContent)
	}

	//#################################################################
	//# EVENTS
	//#################################################################`

	//*****************************************************************************
	#onCARuleEvent(poEvent) {
		cDebug.enter()
		switch (poEvent.action) {
			case cCARuleEvent.actions.update_rule:
				cDebug.write("update_rule")
				var oRule = poEvent.data
				this.#set_rule(oRule)
				break
		}
		cDebug.leave()
	}

	//****************************************************************************
	#onSetNameClick() {
		var oElement = this.element

		var sID = cJquery.child_ID(oElement, cCAControlLTypes.repeater_ID)
		var oInput = $("#" + sID)
		var sInput = oInput.val().trim()
		if (sInput === "") {
			alert("empty input string :-(")
			return
		}
		try {
			var oRule = cCARuleRepeatBase64Importer.makeRule(sInput)
			this.#set_rule(oRule)
		}
		catch (e) {
			alert("something went wrong:\n" + e.message)
		}
	}

	//****************************************************************************
	#onSetRuleClick() {
		var oElement = this.element

		var oTextArea = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rule_text_ID))
		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rule_type_id))

		if (!oSelect.val()) {
			alert("choose a rule type to import")
			return
		}

		var iSelected = parseInt(oSelect.val())
		var oRule
		try {
			switch (iSelected) {
				case cCARuleTypes.rule_types.life:
					oRule = cCARuleLifeImporter.makeRule(oTextArea.val())
					this.#set_rule(oRule)
					break
				case cCARuleTypes.rule_types.wolfram1d:
					oRule = cCARuleWolfram1DImporter.makeRule(oTextArea.val())
					this.#set_rule(oRule)
					break
				case cCARuleTypes.rule_types.base64:
					oRule = cCARuleBase64Importer.makeRule(oTextArea.val())

					//set the boredom if chosen
					var oBoredomList = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.boredom_ID))
					if (!isNaN(oBoredomList.val())) oRule.boredom = oBoredomList.val()

					//inform subscribers
					var oEvent = new cCARuleEvent(this.grid_name, cCARuleEvent.actions.set_rule, oRule)
					oEvent.trigger()
					break
				default:
					throw new CAException("unknown rule type")

			}
			$("#btnPlay").prop("disabled", false)
		}
		catch (e) {
			alert("something went wrong:\n" + e.message)
			throw e
		}

	}


	//****************************************************************************
	#onTextareaChange() {
		var oElement = this.element

		var oTextArea = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rule_text_ID))
		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rule_type_id))
		var sSelected = oSelect.val()
		if (sSelected) {
			var iSelected = parseInt(sSelected)
			if (iSelected == cCARuleTypes.rule_types.base64) {
				var sText = oTextArea.val()
				var iDiff = cCARuleTypes.base64_length - sText.length
				this.#set_status(iDiff + " chars remaining")
			}
		}
	}

	//****************************************************************************
	#onPresetsClick(poEvent) {
		var oElement = this.element

		var oTextArea = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rule_text_ID))
		var oRulesSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rule_type_id))

		var sPreset = $(poEvent.target).val()
		if (!sPreset) return

		if (sPreset === cCAControlLTypes.random_ID) {
			var oRule = cCaRandomRule.makeRule()
			this.#set_rule(oRule)
		} else {
			var oRuleJson = JSON.parse(sPreset)

			switch (oRuleJson.type) {
				case cCARuleTypes.rule_types.life:
					oTextArea.val(oRuleJson.rule)
					oRulesSelect.val(cCARuleTypes.rule_types.life)
					oRulesSelect.selectmenu("refresh")
					this.#onSetRuleClick()
					break
				default:
					alert("unknown rule type: ", oRuleJson.type)
					throw new CAException("not implemented")
			}
		}
	}

	//****************************************************************************
	#onBoredomClick(poEvent) {

		if (!this.rule) {
			alert("set a rule first")
			return
		}
		var iBoredem = parseInt($(poEvent.target).val())
		this.rule.set_boredom(iBoredem)
	}

	//#################################################################
	//# privates
	//#################################################################`
	#set_status(psText) {
		var oElement = this.element
		var oSpan = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.status_ID))
		oSpan.html(psText)
	}

	//****************************************************************************
	#set_rule(poRule) {
		var oElement = this.element

		var s64 = cCARuleBase64Exporter.export(poRule, cCACellTypes.default_state)
		this.rule = poRule

		var oTextArea = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rule_text_ID))
		oTextArea.val(s64)
		cBrowser.copy_to_clipboard(s64)

		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rule_type_id))
		oSelect.val(cCARuleTypes.rule_types.base64)
		oSelect.selectmenu("refresh")
		this.#onSetRuleClick()
	}

	//****************************************************************************
	#populate_presets(poSelect) {
		var aPresets = cCALexicon.get_presets()

		poSelect.append($("<option>", { selected: 1, disabled: 1, value: -1 }).append("Select"))

		var oOption

		for (var i = 0; i < aPresets.length; i++) {
			var oPreset = aPresets[i]
			oOption = $("<option>", { value: JSON.stringify(oPreset) })
			oOption.append(oPreset.label)
			poSelect.append(oOption)
		}
		oOption = $("<option>", { value: cCAControlLTypes.random_ID })
		oOption.append("Random")
		poSelect.append(oOption)
	}
}

//###############################################################################
//# widget
//###############################################################################
$.widget(
	"ck.cacontrolsl",
	{
		options: {
			grid_name: null
		},

		_create: function () {
			var oOptions = this.options
			if (!oOptions.grid_name) $.error("grid name not provided")

			new cCAControlsL(oOptions, this.element) //call widget constructor
		}
	}
)
