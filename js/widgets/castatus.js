"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class caStatusConsts {
	static ACTIVE_ID ="A";
	static CHANGED_ID ="C";
	static RUNS_ID ="R";
	static CHART_ID="CHI";
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.castatus",{
	//#################################################################
	//# Options
	//#################################################################

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oElement;
		var oThis = this;
		
		oElement = this.element;
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		$(oElement).tooltip();

		//check dependencies
		if (!bean ) $.error("bean is missing , chack includes");
		if (!oElement.cachart) $.error("caChart is missing , chack includes");
		
		//subscribe to CAEvents
		bean.on (document, cCAConsts.event_hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
		
		//put something in the widget
		oElement.empty();
		this.pr__init();

	},
	
	//*************************************************************************
	pr__init: function(){
		var oDiv, oTable, oRow, oCell;
		var oElement, sID;
		
		oElement = this.element;
		sID = oElement.attr("id");
		
		//--input-------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"}).append("Status");
		oElement.append(oDiv);
		
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			oTable = $("<Table>",{cellpadding:2});
				oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Active");
					oRow.append(oCell);
					oCell = $("<td>",{id:sID+caStatusConsts.ACTIVE_ID}).append("??");
					oRow.append(oCell);
				oTable.append(oRow);
				oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Changed");
					oRow.append(oCell);
					oCell = $("<td>",{id:sID+caStatusConsts.CHANGED_ID}).append("??");
					oRow.append(oCell);
				oTable.append(oRow);
				oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Runs");
					oRow.append(oCell);
					oCell = $("<td>",{id:sID+caStatusConsts.RUNS_ID}).append("??");
					oRow.append(oCell);
				oTable.append(oRow);
			oDiv.append(oTable);
		oElement.append(oDiv);
		
		//-------------------------------------------------------------
		oElement.append("<p>")
		oDiv = $("<DIV>",{class:"ui-widget-header"}).append("Chart");
		oElement.append(oDiv);
		oDiv = $("<DIV>",{class:"ui-widget-content",id:sID+caStatusConsts.CHART_ID}).cachart();
		oElement.append(oDiv);
	},
	
	//#################################################################
	//#################################################################
	onCAEvent: function(poEvent){
		var oElement, oOptions, sID;
		var oTarget;
		
		oElement = this.element;
		oOptions = this.options;
		sID = oElement.attr("id");

		switch (poEvent.type){
			case  cCAConsts.event_types.status:
				if (!poEvent.data) return;
				
				oTarget = $("#"+sID+caStatusConsts.ACTIVE_ID);
				oTarget.html(poEvent.data.active);
				oTarget = $("#"+sID+caStatusConsts.CHANGED_ID);
				oTarget.html(poEvent.data.changed);
				oTarget = $("#"+sID+caStatusConsts.RUNS_ID);
				oTarget.html(poEvent.data.runs);
				
				oTarget = $("#"+sID+caStatusConsts.CHART_ID);
				oTarget.cachart("onCAEvent",poEvent);
				break;
				
			case cCAConsts.event_types.set_rule:
			case cCAConsts.event_types.initialise:
				oTarget = $("#"+sID+caStatusConsts.CHART_ID);
				oTarget.cachart("onCAEvent",poEvent);
				break;
		}
	}
	
});
