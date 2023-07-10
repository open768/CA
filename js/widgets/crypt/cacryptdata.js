"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

Cryptography code demonstrated in this application is covered by the UK Govt 
Open General Export License for Cryptographic development 
(see https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1101784/open-general-export-licence-cryptographic-development.pdf) 
and is not intended for dual use as defined by this license. 
You the consumer of this application are entirely responsible for importing this code into your own country. if you disagree please close this page.

**************************************************************************/

//###################################################################################
//###################################################################################
class cCACryptData {
	/** @type Element */ element = null
	ca_name = null

	/**
	 * Description
	 * @param {Object} poOptions
	 * @param {Element} poElement
	 */
	constructor(poOptions, poElement) {
		this.element = poElement
		if (!poOptions.ca_name) $.error("missing ca_name option")
		this.ca_name = poOptions.ca_name

		var oElement = poElement
		oElement.empty()
		this.init()
	}

	//*******************************************************************************
	init() {
		var oElement = this.element
		var oInputDiv = $("<DIV>")
		oInputDiv.cacrypttext({ id: cCACryptTypes.input_name, title: "text to encrypt", read_only: false })
		oElement.append(oInputDiv)
		oElement.append("<p>")

		var oControlDiv = $("<DIV>")
		oControlDiv.cacryptcontrol({ ca_name: this.ca_name })
		oElement.append(oControlDiv)
		oElement.append("<p>")

		var oOutDiv = $("<DIV>")
		oOutDiv.cacrypttext({ id: cCACryptTypes.output_name, title: "encrypted text", read_only: true })
		oElement.append(oOutDiv)
		oElement.append("<p>")

	}
}


//###############################################################################
class CACryptException {
	/**
	 * Description
	 * @param {string} psMessage
	 */
	constructor(psMessage) {
		this.message = psMessage
		this.name = 'CAException'
	}
}

//###################################################################################
//###################################################################################
class cCACryptText {
	element = null
	read_only = false
	title = "no title set"
	id = null

	/**
	 * Description
	 * @param {Object} poOptions
	 * @param {Element} poElement
	 */
	constructor(poOptions, poElement) {
		this.element = poElement
		var oElement = poElement
		oElement.addClass("ui-widget")

		this.read_only = poOptions.read_only
		this.title = poOptions.title
		this.id = poOptions.id

		oElement.empty()
		this.init()
	}

	//*******************************************************************************
	init() {
		var oElement = this.element
		var oDiv = $("<DIV>", { class: "ui-widget-header" })
		oDiv.append(this.title)
		oElement.append(oDiv)
		oDiv = $("<DIV>", { class: "ui-widget-content" })
		var oBox = $("<TEXTAREA>", { id: this.id, class: "json" })
		if (this.read_only)
			oBox.prop("readonly", true)
		oDiv.append(oBox)
		oElement.append(oDiv)
	}
}

//###################################################################################
//###################################################################################
class cCACryptControl {
	element = null
	ca_name = null
	grid = null

	child_names = {
		crypt: "CRY",
		decrypt: "DCR",
		inital_runs: "IRU"
	}

	//*******************************************************************************
	constructor(poOptions, poElement) {
		var oThis = this
		this.element = poElement
		var oElement = poElement

		if (!poOptions.ca_name) $.error("missing ca_name option")
		this.ca_name = poOptions.ca_name

		oElement.uniqueId()
		oElement.addClass("ui-widget")
		oElement.empty()
		this.init()

		//subscribe to CAEvents
		cCAEventHelper.subscribe_to_ca_events( this.ca_name, poEvent => { oThis.onCAEvent(poEvent) })
		cCAEventHelper.subscribe_to_rule_events( this.ca_name, poEvent => { oThis.onCARuleEvent(poEvent) })
		cCAEventHelper.subscribe_to_canvas_events(this.ca_name, poEvent => { oThis.onCACanvasEvent(poEvent) })
	}

	//*******************************************************************************
	init() {
		var oThis = this
		var oElement = this.element
		var oDiv = $("<DIV>", { class: "ui-widget-header" })
		oDiv.append("Control")
		oElement.append(oDiv)
		oDiv = $("<DIV>", { class: "ui-widget-content" })
		var sID = cJquery.child_ID(oElement, this.child_names.crypt)
		var oButton = $("<button>", { id: sID })
		oButton.append("<span class='material-icons'>lock</span>")
		oButton.append("Encrypt")
		oButton.prop("disabled", true)
		oButton.click(function () { oThis.onEncryptClick() })
		oDiv.append(oButton)

		sID = cJquery.child_ID(oElement, this.child_names.decrypt)
		oButton = $("<button>", { id: sID })
		oButton.append("<span class='material-icons'>lock_open</span>")
		oButton.append("Decrypt")
		oButton.prop("disabled", true)
		oButton.click(function () { oThis.onDecryptClick() })
		oDiv.append(oButton)

		sID = cJquery.child_ID(oElement, this.child_names.inital_runs)
		var oInput = $("<input>", { type: "text", id: sID, maxlength: 3, size: 5 })
		oDiv.append(" Initial runs: ")
		oDiv.append(oInput)

		oElement.append(oDiv)
	}

	//*******************************************************************************
	onDecryptClick() {
	}

	//*******************************************************************************
	async onEncryptClick() {
		var oElement = this.element
		var oThis = this

		//check that a grid is definitely there
		if (!this.grid) throw new CACryptException("no Grid")

		//get the control values from the UI
		var runs_ID = cJquery.child_ID(oElement, this.child_names.inital_runs)
		var oTxtBox = $("#" + runs_ID)
		var iInitialruns = parseInt(oTxtBox.val())
		if (isNaN(iInitialruns)) {
			alert("number of runs must be an integer")
			return
		}

		//get plaintext to encrypt from the UI
		var /* @type String */ sPlaintext = $("#" + cCACryptTypes.input_name).val()
		if (sPlaintext.trim() === "") {
			alert("no plaintext")
			return
		}

		//disable buttons
		var sID = cJquery.child_ID(oElement, this.child_names.decrypt)
		cJquery.enable_element(sID, false)
		sID = cJquery.child_ID(oElement, this.child_names.crypt)
		cJquery.enable_element(sID, false)

		//start the scrambling
		cCACryptEvent.triggerStatus("scrambling started")
		var oScrambler = new cCAScrambler(this.grid, iInitialruns, sPlaintext)
		bean.on(oScrambler, cCAScramblerEvent.hook, function (poEvent) { oThis.onCAScramblerEvent(poEvent) })
		oScrambler.scramble()
	}

	//*******************************************************************************
	/* eslint-disable-next-line no-unused-vars */
	onCAScramblerEvent(poEvent) {
		//TODO
	}

	//*******************************************************************************
	onCACanvasEvent(poEvent) {
		cDebug.enter()
		if (poEvent.action === cCACanvasEvent.actions.set_grid)
			if (poEvent.data.grid_name === this.ca_name) {
				//remember the grid, its needed for encryption.
				this.grid = poEvent.data.data
				cCACryptEvent.triggerStatus("grid initialised")
			}
		cDebug.leave()
	}

	//*******************************************************************************
	onCARuleEvent(poEvent) {
		if (poEvent.action === cCARuleEvent.actions.update_rule) {
			var oElement = this.element
			//enable buttons when any rule is set
			var sID = cJquery.child_ID(oElement, this.child_names.crypt)
			$("#" + sID).prop("disabled", false)
			sID = cJquery.child_ID(oElement, this.child_names.decrypt)
			$("#" + sID).prop("disabled", false)
		}
	}

	//*******************************************************************************
	onCAEvent(poEvent) {
		switch (poEvent.type) {
			case cCAEvent.types.general:
				if (poEvent.action === cCAGeneralEvent.actions.import_grid)
					if (poEvent.data.name === this.ca_name) {
						this.grid = poEvent.data
						cCACryptEvent.triggerStatus("grid imported - ready to rock")
					}
				break
		}
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget("ck.cacryptdata", {
	_create: function () {
		new cCACryptData(this.options, this.element) //call widgetclass
	}
})
$.widget("ck.cacryptcontrol", {
	_create: function () {
		new cCACryptControl(this.options, this.element) //call widgetclass
	}
})
$.widget("ck.cacrypttext", {
	options: {
		read_only: false,
		title: "no title set",
		id: null
	},
	_create: function () {
		if (!this.options.id) $.error("id missing")
		new cCACryptText(this.options, this.element) //call widgetclass
	}
})
