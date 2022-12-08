"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAControlRTypes {
	static ACTIVE_ID ="A";
	static CHANGED_ID ="C";
	static RUNS_ID ="R";
	static CHART_ID="CHI";
}

//###################################################################
//#
//###################################################################
class cCAControlsR{
	grid = null;
	element = null;
	grid_name = null;
	
	//***************************************************************
	constructor(poOptions, poElement){
		this.element = poElement;
		this.grid_name = poOptions.grid_name;

		var oThis = this;
		var oElement = this.element;
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		$(oElement).tooltip();

		//check dependencies
		if (!bean ) $.error("bean is missing , chack includes");
		if (!oElement.cachart) $.error("caChart is missing , chack includes");
		if (!oElement.caremotecontrols) $.error("caremotecontrols is missing , chack includes");
		
		//subscribe to CAEvents
		bean.on (document, cCAEvent.hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
		
		//put something in the widget
		oElement.empty();
		this.pr__init();

	}
	
	//***************************************************************
	//* Events
	//***************************************************************
	onInitClick(poEvent){
		var oElement = this.element;

		var iSelected = parseInt($(poEvent.target).val());
		
		//---------tell subscribers to init
		var oEvent = new cCAEvent( cCAEvent.types.action, cCAActionEvent.actions.grid_init, iSelected);
		oEvent.trigger(document);
	}
	
	
	//****************************************************************************
	onCAEvent(poEvent){
		var oElement;
		var oTarget;
		
		oElement = this.element;

		if (poEvent.type === cCAEvent.types.canvas)
			if (poEvent.data.grid_name === this.grid_name)			
				switch(poEvent.action){
					case cCACanvasEvent.actions.grid_status:
						if (!poEvent.data) return;
						
						oTarget = $("#"+cJquery.child_ID(oElement, cCAControlRTypes.ACTIVE_ID));
						oTarget.html(poEvent.data.data.active);
						oTarget = $("#"+cJquery.child_ID(oElement, cCAControlRTypes.CHANGED_ID));
						oTarget.html(poEvent.data.data.changed);
						oTarget = $("#"+cJquery.child_ID(oElement, cCAControlRTypes.RUNS_ID));
						oTarget.html(poEvent.data.data.runs);
						break;
				}
	}
	
	//***************************************************************
	//* Privates
	//***************************************************************
	pr__init(){
		var oDiv, oTable, oRow, oCell;
		var oElement;
		
		oElement = this.element;
		
		//--input-------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"}).append("Status");
		oElement.append(oDiv);
		
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			oTable = $("<Table>",{cellpadding:2});
				oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Active");
					oRow.append(oCell);
					oCell = $("<td>",{id:cJquery.child_ID(oElement, cCAControlRTypes.ACTIVE_ID)});
						oCell.append("??");
					oRow.append(oCell);
					oTable.append(oRow);
				oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Changed");
					oRow.append(oCell);
					oCell = $("<td>",{id:cJquery.child_ID(oElement, cCAControlRTypes.CHANGED_ID)});
						oCell.append("??");
					oRow.append(oCell);
					oTable.append(oRow);
				oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Runs");
					oRow.append(oCell);
					oCell = $("<td>",{id:cJquery.child_ID(oElement, cCAControlRTypes.RUNS_ID)});
						oCell.append("??");
					oRow.append(oCell);
					oTable.append(oRow);
				oDiv.append(oTable);
			oElement.append(oDiv);
		oElement.append("<P>");
		
		//-------------------------------------------------------------
		oElement.append("<HR>")
		oDiv = $("<DIV>",{class:"ui-widget-header"}).append("Chart");
			oElement.append(oDiv);
		oDiv = $("<DIV>",{class:"ui-widget-content",id:cJquery.child_ID(oElement, cCAControlRTypes.CHART_ID)});
			oDiv.cachart({grid_name:this.grid_name});
			oElement.append(oDiv);
			oElement.append("<P>");
		
		//--initialise------------------------------------------------		
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.append("Initialise");
			oElement.append(oDiv);
		
		var oThis = this;
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			var oSelect = $("<SELECT>",{width:200,title:"choose a pattern to initialise the grid with"});
			oSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("Initialise"));
			for (var sName in cCAGridTypes.init){
				var oItem = cCAGridTypes.init[sName];
				var oOption = $("<option>",{value:oItem.id}).append(oItem.label);
				oSelect.append ( oOption);
			}
			oDiv.append(oSelect);
			oSelect.selectmenu({
					select:function(poEvent){oThis.onInitClick(poEvent)}
			});
			oElement.append(oDiv);
		oElement.append("<P>");
		
		//--controls------------------------------------------------		
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.caremotecontrols({grid_name:this.grid_name});
		oElement.append(oDiv);
	}
	
}

//###################################################################
//#
//###################################################################
$.widget( 
	"ck.cacontrolsr",
	{
		options:{
			grid_name:null
		},
		_create: function(){
			//checks
			var oOptions = this.options;
			if (!oOptions.grid_name) $.error("grid name not provided");
			
			var oControls = new cCAControlsR(oOptions ,this.element);
		}
	}
);