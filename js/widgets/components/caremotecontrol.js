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
class cCARemoteControls{
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
	constructor(poOptions, poElement){
		this.element = poElement
		this.grid_name = poOptions.grid_name
		var oThis = this
		var oElement = poElement
		
		//check dependencies
		if (!bean ) $.error("bean is missing , chack includes")
		
		//set basic stuff
		oElement.uniqueId()
		oElement.addClass("ui-widget")

		//subscribe to CAEvents
		cCAEventHelper.subscribe_to_rule_events( this.grid_name, poEvent => { oThis.onCARuleEvent(poEvent) })
		cCAEventHelper.subscribe_to_canvas_events(this.grid_name, poEvent => { oThis.onCACanvasEvent(poEvent) })
		
		//put something in the widget
		oElement.empty()
		this.#init()

	}
	
	
	//****************************************************************************
	onClickControl(piAction){
		if (!this.rule_set){
			alert("set a rule first!!")
			return
		}
	
		switch (piAction){
			case cCAGridTypes.actions.stop:
				this.#set_controls(false)
				break
			case cCAGridTypes.actions.play:
				this.#set_controls(true)
				break
		}
		var oEvent = new cCAActionEvent( this.grid_name, cCAActionEvent.actions.control, parseInt(piAction))
		oEvent.trigger()
	}
	
	
	//****************************************************************************
	onCACanvasEvent(poEvent) {
		var oThis = this
		cDebug.enter()
		switch (poEvent.action) {
			case cCACanvasEvent.actions.set_grid:
				this.grid_set = true
				this.#enable_buttons()
				break
			case cCACanvasEvent.notify.nochange:
				setTimeout( function(){	oThis.#set_controls(false)}, 100) //stop
		}
	}

	//****************************************************************************
	onCARuleEvent(poEvent){
		if (poEvent.action === cCARuleEvent.actions.set_rule){
			this.rule_set = true
			this.#enable_buttons()
		}
	}
	
	//***************************************************************
	//* Privates
	//***************************************************************
	#enable_buttons(){
		if (this.grid_set && this.rule_set )
			this.#set_controls(false)
	}

	/**
	 * Description
	 * @param {boolean} pbRunning
	 */
	#set_controls(pbRunning){
		var oElement = this.element
		var sID = cJquery.child_ID(oElement,cCARemoteControls.buttonNames.play)
		cJquery.enable_element(sID, !pbRunning)

		sID = cJquery.child_ID(oElement,cCARemoteControls.buttonNames.step)
		cJquery.enable_element(sID, !pbRunning)
		
		sID = cJquery.child_ID(oElement,cCARemoteControls.buttonNames.stop)
		cJquery.enable_element(sID, pbRunning)
	}
	
	#init(){
		var oDiv, oButton
		var oElement = this.element
		var oThis = this
		
		//--controls------------------------------------------------		
		oDiv = $("<DIV>",{class:"ui-widget-header"})
			oDiv.append("controls")
		oElement.append(oDiv)
		
		//disabled until grid and rule are set
		oDiv = $("<DIV>",{class:"ui-widget-content"})
			var sID
			sID = cJquery.child_ID(oElement, cCARemoteControls.buttonNames.stop)
			oButton = $("<button>",{width:"30px",height:"30px",id:sID})
				oButton.button({icon:"ui-icon-stop"})
				cJquery.enable_element(oButton,false)
				oButton.click(	function(){ oThis.onClickControl(cCAGridTypes.actions.stop)}	)
				oDiv.append(oButton)

			sID = cJquery.child_ID(oElement, cCARemoteControls.buttonNames.play)
			oButton = $("<button>",{width:"30px",height:"30px",id:sID})
				oButton.button({icon:"ui-icon-circle-triangle-e"})
				cJquery.enable_element(oButton,false)
				oButton.click(	function(){ oThis.onClickControl(cCAGridTypes.actions.play)}	)
				oDiv.append(oButton)

			sID = cJquery.child_ID(oElement, cCARemoteControls.buttonNames.step)
			oButton = $("<button>",{width:"30px",height:"30px",title:"step",id:sID})
				oButton.button({icon:"ui-icon-seek-end"})
				cJquery.enable_element(oButton,false)
				oButton.click(	function(){ oThis.onClickControl(cCAGridTypes.actions.step)}	)
				oDiv.append(oButton)
		oElement.append(oDiv)
	}
	
}

//###################################################################
//#
//###################################################################
$.widget( 
	"ck.caremotecontrols",
	{
		options:{
			grid_name:null
		},
		_create: function(){
			//checks
			var oOptions = this.options
			if (!oOptions.grid_name) $.error("grid name not provided")
			
			new cCARemoteControls(oOptions ,this.element)		//call class constructor
		}
	}
)