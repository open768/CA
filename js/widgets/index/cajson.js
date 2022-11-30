"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAJsonTypes {
	static textarea_id = "txt";
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAJson{
	static _state ={
		grid:null
	};
	
	//#################################################################
	//# Constructor
	//#################################################################`
	static create(poElement){
		cDebug.enter();
		this.element = poElement;
		var oThis = this;
		var oElement;
		oElement = this.element;

		//check dependencies
		if (!bean ) 	$.error("bean class is missing! check includes");

		//set basic stuff
		oElement.addClass("ui-widget");
		$(oElement).tooltip();

		//put something in the widget
		oElement.empty();
		this.pr__init();

		//subscribe to CA Events
		bean.on(document, cCAGridTypes.event_hook, function(poEvent){ oThis.onGridEvent(poEvent)});
	}

	//#################################################################
	//# Initialise
	//#################################################################`
	static pr__init(){
		var oThis, oOptions, oElement;
		var oDiv, sID;

		oElement = this.element;
		oThis = this;
		
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.append("Json");
			oElement.append(oDiv);
			
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			sID = cJquery.child_ID(oElement, cCAJsonTypes.textarea_id);
			var oBox = $("<TEXTAREA>",{ID:sID,class:"json", title:"Json goes here", readonly:1});
				oDiv.append(oBox);
			var oButton = $("<button>").append("Get Json");
				oButton.click( function(){oThis.onClickButton()} );
				oDiv.append(oButton);
			oElement.append(oDiv);

	}

	//#################################################################
	//# EVENTS
	//#################################################################`
	static onClickButton(){
		cDebug.enter();
		if ( this._state.grid == null)
			alert("no rule set");
		else
			this.pr__update_json()
		cDebug.leave();
	}
	
	
	static onGridEvent(poEvent){
		cDebug.enter();
		if (poEvent.event == cCAGridTypes.events.set_rule){
			this._state.grid = poEvent.data;
			//create JSON
			this.pr__update_json();
		}
		cDebug.leave();
	}

	//****************************************************************************
	static pr__update_json(){
		var oElement = this.element;

		//export the grid
		var oObj = cCAGridJSONExporter.export(this._state.grid);
		var sJson = JSON.stringify(oObj);

		//updatethe UI with JSON
		var sID = cJquery.child_ID(oElement, cCAJsonTypes.textarea_id)
		$("#"+sID).val(sJson);
	}
}

//###############################################################################
//# widget
//###############################################################################
$.widget(
	"ck.cajson",
	{
		_create(){
			cCAJson.create(this.element);
		}
	}
);
