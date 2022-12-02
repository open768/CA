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
	static tabs_id = "tab";
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
		if (!oElement.tabs ) 	$.error("tabs class is missing! check includes");

		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		$(oElement).tooltip();

		//put something in the widget
		oElement.empty();
		this.pr__init();

		//subscribe to CA Events
		bean.on (document, cCAEventTypes.event_hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
		cDebug.leave();
	}

	//#################################################################
	//# Initialise
	//#################################################################`
	static pr__init(){
		var oThis, oOptions, oElement;
		var oDiv, sID;

		cDebug.enter();
		oElement = this.element;
		oThis = this;
		
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.append("Json");
			oElement.append(oDiv);
			
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			sID = cJquery.child_ID(oElement, cCAJsonTypes.textarea_id);
			var oBox = $("<TEXTAREA>",{ID:sID,class:"json", title:"Json goes here"});
				oDiv.append(oBox);
			var oButton = $("<button>").append("Create");
				oButton.click( function(){oThis.onClickExport()} );
				oDiv.append(oButton);
			
			var oButton = $("<button>").append("import");
				oButton.click( function(){oThis.onClickImport()} );
				oDiv.append(oButton);
			oElement.append(oDiv);

		cDebug.leave();
	}

	//#################################################################
	//# EVENTS
	//#################################################################`
	static onClickExport(){
		cDebug.enter();
		if ( this._state.grid == null)
			alert("no grid set");
		else
			this.pr__create_json()
		cDebug.leave();
	}
	
	//*****************************************************************
	static onClickImport(){
		cDebug.enter();
	
		var oElement = this.element;
		var sID = cJquery.child_ID(oElement, cCAJsonTypes.textarea_id)
		var sJson = $("#" + sID).val();
		var oJson = JSON.parse(sJson)
		var oGrid = cCAGridJSONImporter.populate(oJson);
		
		//fire events to tell other controls there is a new rule and grid in town
		var oEvent = new cCAEvent( cCAEventTypes.event_types.import_grid, oGrid);
		bean.fire(document, cCAEventTypes.event_hook, oEvent);
		cDebug.leave();
	}
	
	
	//*****************************************************************
	static onCAEvent(poEvent){
		cDebug.enter();
		switch(poEvent.type){
			case cCAEventTypes.event_types.set_grid:
				cDebug.write("set_grid");
				this._state.grid = poEvent.data;
		}
		cDebug.leave();
	}

	//#################################################################
	//# EVENTS
	//#################################################################`
	static pr__create_json(){
		cDebug.enter();
		var oElement = this.element;

		//export the grid
		var oObj = cCAGridJSONExporter.export(this._state.grid);
		var sJson = JSON.stringify(oObj);

		//updatethe UI with JSON
		var sID = cJquery.child_ID(oElement, cCAJsonTypes.textarea_id);
		$("#"+sID).val(sJson);
		cDebug.leave();
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
