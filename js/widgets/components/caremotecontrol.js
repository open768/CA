"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//###################################################################
//#
//###################################################################
class cCARemoteControls {
	static buttonNames = {
		play: "P",
		stop: "O",
		step: "E"
	}

	element = null
	grid_name = null
	rule_set = false
	grid_set = false

	//***************************************************************
	constructor(poOptions, poElement) {
		this.element = poElement
		this.grid_name = poOptions.grid_name
		var oThis = this	/** @type cCARemoteControls */
		var oElement = poElement

		//check dependencies
		if (!bean) $.error("bean is missing , check includes")

		//set basic stuff
		oElement.uniqueId()
		oElement.addClass("ui-widget")

		//subscribe to CAEvents
		cCAEventHelper.subscribe_to_rule_events(this.grid_name, poEvent => oThis.onCARuleEvent(poEvent))
		cCAEventHelper.subscribe_to_canvas_events(this.grid_name, poEvent => oThis.onCACanvasEvent(poEvent))

		//put something in the widget
		oElement.empty()
		this._init()

	}


	//****************************************************************************
	onClickControl(piAction) {
		if (!this.rule_set) {
			alert("set a rule first!!")
			return
		}

		switch (piAction) {
			case cCAGridTypes.actions.stop:
				this._enable_controls(false)
				break
			case cCAGridTypes.actions.play:
				this._enable_controls(true)
				break
		}
		var oEvent = new cCAActionEvent(this.grid_name, cCAActionEvent.actions.control, parseInt(piAction))
		oEvent.trigger()	//triggers the event on the document
	}


	//****************************************************************************
	onCACanvasEvent(poEvent) {
		var oThis = this	/** @type cCARemoteControls */
		cDebug.enter()
		switch (poEvent.action) {
			case cCACanvasEvent.actions.set_grid:
				this.grid_set = true
				this._enable_buttons()
				break
			case cCACanvasEvent.notify.nochange:
				setTimeout(() => oThis._enable_controls(false), 100) //stop
		}
		cDebug.leave()
	}

	//****************************************************************************
	onCARuleEvent(poEvent) {
		if (poEvent.action === cCARuleEvent.actions.set_rule) {
			this.rule_set = true
			this._enable_buttons()
		}
	}

	//***************************************************************
	//* Privates
	//***************************************************************
	_enable_buttons() {
		if (this.grid_set && this.rule_set)
			this._enable_controls(false)
	}

	/**
	 * Description
	 * @param {boolean} pbRunning
	 */
	_enable_controls(pbRunning) {
		var oElement = this.element
		var sID = cJquery.child_ID(oElement, cCARemoteControls.buttonNames.play)
		cJquery.enable_element(sID, !pbRunning)

		sID = cJquery.child_ID(oElement, cCARemoteControls.buttonNames.step)
		cJquery.enable_element(sID, !pbRunning)

		sID = cJquery.child_ID(oElement, cCARemoteControls.buttonNames.stop)
		cJquery.enable_element(sID, pbRunning)
	}

	//***************************************************************
	_init() {
		var oDiv
		var oElement = this.element
		var oThis = this /** @type cCARemoteControls */

		function _add_button(psID, psiIcon, psTitle, piAction) {
			var sID = cJquery.child_ID(oElement, psID)
			var oButton = $("<button>", { width: "30px", height: "30px", id: sID, title: psTitle })
			oButton.button({ icon: psiIcon, showLabel: false })
			cJquery.enable_element(oButton, false)
			oButton.click(() => oThis.onClickControl(piAction))
			oDiv.append(oButton)
		}

		//--widget header------------------------------------------------		
		cJquery.add_widget_header(oElement, "controls")

		//---widget body
		oDiv = $("<DIV>", { class: "ui-widget-content" })

		//--- stop button----------------------------------------
		_add_button(cCARemoteControls.buttonNames.stop, "ui-icon-stop", "stop", cCAGridTypes.actions.stop)
		_add_button(cCARemoteControls.buttonNames.play, "ui-icon-circle-triangle-e", "play", cCAGridTypes.actions.play)
		_add_button(cCARemoteControls.buttonNames.step, "icon", "step", cCAGridTypes.actions.step)

		oElement.append(oDiv)
	}

}

//###################################################################
//#
//###################################################################
$.widget(
	"ck.caremotecontrols",
	{
		options: {
			grid_name: null
		},
		_create: function () {
			//checks
			var oOptions = this.options
			if (!oOptions.grid_name) $.error("grid name not provided")

			new cCARemoteControls(oOptions, this.element)		//call class constructor
		}
	}
)