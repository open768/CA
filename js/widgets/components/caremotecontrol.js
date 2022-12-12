"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//###################################################################
//#
//###################################################################
class cCARemoteControls{
	element = null;
	grid_name = null;
	rule_set = false;
	grid_set = false;
	
	//***************************************************************
	constructor(poOptions, poElement){
		this.element = poElement;
		this.grid_name = poOptions.grid_name;
		var oThis = this;
		var oElement = poElement;
		
		//check dependencies
		if (!bean ) $.error("bean is missing , chack includes");
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");

		//subscribe to CAEvents
		bean.on (document, cCAEvent.hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
		
		//put something in the widget
		oElement.empty();
		this.pr__init();

	}
	
	
	//****************************************************************************
	onClickControl(piAction){
		var oThis = this;
		
		if (!caMachineTypes.rule_set){
			alert("set a rule first!!");
			return;
		}
	
		switch (piAction){
			case cCAGridTypes.actions.stop:
				this.pr__set_controls(false);
				break;
			case cCAGridTypes.actions.play:
				this.pr__set_controls(true);
				break;
		}
		var oEvent = new cCAEvent( cCAEvent.types.action, cCAActionEvent.actions.control, parseInt(piAction));
		oEvent.trigger(document);
	}
	
	
	//****************************************************************************
	onCAEvent(poEvent){
		var oElement = this.element;
		var oThis = this;
		
		switch (poEvent.type){
			case cCAEvent.types.canvas:
				if (poEvent.data.grid_name === this.grid_name)			
					switch(poEvent.action){
						case cCACanvasEvent.actions.set_grid:
							this.grid_set = true;
							this.pr__enable_buttons();
							break;
						case cCACanvasEvent.actions.nochange:
							setTimeout( function(){	oThis.pr__set_controls(false);}, 100); //stop
					}
				break;
				
			case cCAEvent.types.general:
				if (poEvent.action === cCAGeneralEvent.actions.set_rule){
					this.rule_set = true;
					this.pr__enable_buttons();
				}
		}
}
	
	//***************************************************************
	//* Privates
	//***************************************************************
	pr__enable_buttons(){
		if (this.grid_set && this.rule_set )
			this.pr__set_controls(false);
	}

	pr__set_controls(pbRunning){
		var oElement = this.element;
		if (pbRunning){
			$("#"+cJquery.child_ID(oElement,"Step")).prop("disabled",true);
			$("#"+cJquery.child_ID(oElement,"Play")).prop("disabled",true);
			$("#"+cJquery.child_ID(oElement,"Stop")).removeAttr("disabled");
		}else{
			$("#"+cJquery.child_ID(oElement,"Step")).removeAttr("disabled");
			$("#"+cJquery.child_ID(oElement,"Play")).removeAttr("disabled");
			$("#"+cJquery.child_ID(oElement,"Stop")).prop("disabled",true);
		}
	}
	
	pr__init(){
		var oDiv, oButton;
		var oElement = this.element;
		var oThis = this;
		
		//--controls------------------------------------------------		
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.append("controls");
		oElement.append(oDiv);
		
		//disabled until grid and rule are set
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			oButton = $("<button>",{width:"30px",height:"30px",id:cJquery.child_ID(oElement, "Stop")});
				oButton.button({icon:"ui-icon-stop"});
				oButton.prop("disabled", true);
				oButton.click(	function(){ oThis.onClickControl(cCAGridTypes.actions.stop);}	);
				oDiv.append(oButton);

			oButton = $("<button>",{width:"30px",height:"30px",id:cJquery.child_ID(oElement, "Play")});
				oButton.button({icon:"ui-icon-circle-triangle-e"});
				oButton.prop("disabled", true);
				oButton.click(	function(){ oThis.onClickControl(cCAGridTypes.actions.play);}	);
				oDiv.append(oButton);

			oButton = $("<button>",{width:"30px",height:"30px",title:"step",id:cJquery.child_ID(oElement, "Step")});
				oButton.button({icon:"ui-icon-seek-end"});
				oButton.prop("disabled", true);
				oButton.click(	function(){ oThis.onClickControl(cCAGridTypes.actions.step);}	);
				oDiv.append(oButton);
		oElement.append(oDiv);
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
			var oOptions = this.options;
			if (!oOptions.grid_name) $.error("grid name not provided");
			
			var oControls = new cCARemoteControls(oOptions ,this.element);
		}
	}
);