/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.castatus",{
	//#################################################################
	//# Options
	//#################################################################
	options:{
		ACTIVE_ID :"A",
		CHANGED_ID :"C",
		RUNS_ID :"R"
	},

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		//set basic stuff
		oElement.uniqueId();
		var sID = oElement.attr("id");
		oElement.addClass("ui-widget");
		$(oElement).tooltip();

		//put something in the widget
		var oDiv;
		oElement.empty();

		
		//--input-------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"}).append("Status");
		oElement.append(oDiv);
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			var oTable = $("<Table>",{cellpadding:2});
				var oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Active");
					oRow.append(oCell);
					oCell = $("<td>",{id:sID+oOptions.ACTIVE_ID}).append("??");
					oRow.append(oCell);
				oTable.append(oRow);
				var oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Changed");
					oRow.append(oCell);
					oCell = $("<td>",{id:sID+oOptions.CHANGED_ID}).append("??");
					oRow.append(oCell);
				oTable.append(oRow);
				var oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Runs");
					oRow.append(oCell);
					oCell = $("<td>",{id:sID+oOptions.RUNS_ID}).append("??");
					oRow.append(oCell);
				oTable.append(oRow);
			oDiv.append(oTable);
		oElement.append(oDiv);
	},
	
	//#################################################################
	//#################################################################
	onCAEvent: function(poEvent){
		var oThis = this;
		var oElement = oThis.element;
		var oOptions = oThis.options;
		var sID = oElement.attr("id");

		if (poEvent.type !== cCAConsts.event_types.status) return;
		if (!poEvent.data) return;
		
		var oTarget = $("#"+sID+oOptions.ACTIVE_ID);
		oTarget.html(poEvent.data.active);
		var oTarget = $("#"+sID+oOptions.CHANGED_ID);
		oTarget.html(poEvent.data.changed);
		var oTarget = $("#"+sID+oOptions.RUNS_ID);
		oTarget.html(poEvent.data.runs);
	}
	
});
