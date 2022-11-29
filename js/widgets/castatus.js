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
		bean.on (document, cCAEventTypes.event_hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
		
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
		oElement.append("<P>");
		
		//-------------------------------------------------------------
		oElement.append("<HR>")
		oDiv = $("<DIV>",{class:"ui-widget-header"}).append("Chart");
			oElement.append(oDiv);
		oDiv = $("<DIV>",{class:"ui-widget-content",id:sID+caStatusConsts.CHART_ID}).cachart();
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
			for (var sName in cCAGridConsts.init){
				var oItem = cCAGridConsts.init[sName];
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
			oDiv.append("controls");
		oElement.append(oDiv);
		
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			var oButton = $("<button>",{width:"30px",height:"30px",id:"btnStop"}).button({icon:"ui-icon-stop"});
				oButton.prop("disabled", true);
				oButton.click(	function(){ oThis.onClickControl(cCAGridConsts.actions.stop);}	);
				oDiv.append(oButton);

			var oButton = $("<button>",{width:"30px",height:"30px",id:"btnPlay"}).button({icon:"ui-icon-circle-triangle-e"});
				oButton.prop("disabled", true);
				oButton.click(	function(){ oThis.onClickControl(cCAGridConsts.actions.play);}	);
				oDiv.append(oButton);

			var oButton = $("<button>",{width:"30px",height:"30px",title:"step",id:"btnStep"}).button({icon:"ui-icon-seek-end"});
				oButton.prop("disabled", true);
				oButton.click(	function(){ oThis.onClickControl(cCAGridConsts.actions.step);}	);
				oDiv.append(oButton);
		oElement.append(oDiv);
	},
	
	//#################################################################
	//#################################################################
	onInitClick: function(poEvent){
		var oElement = this.element;

		
		var iSelected = parseInt($(poEvent.target).val());
		var oEvent = new cCAEvent( cCAEventTypes.event_types.initialise, iSelected);
		bean.fire(document, cCAEventTypes.event_hook, oEvent);
	},
	
	//****************************************************************************
	onClickControl: function(piAction){
		var oThis = this;
		if (!caMachineOptions.rule_set){
			alert("set a rule first!!");
			return;
		}
	
		switch (piAction){
			case cCAGridConsts.actions.stop:
				$("#btnStep").prop("disabled",false);
				$("#btnPlay").prop("disabled",false);
				$("#btnStop").prop("disabled",true);
				break;
			case cCAGridConsts.actions.play:
				$("#btnStep").prop("disabled",true);
				$("#btnPlay").prop("disabled",true);
				$("#btnStop").prop("disabled",false);
				break;
		}
		var oEvent = new cCAEvent( cCAEventTypes.event_types.action, parseInt(piAction));
		bean.fire(document, cCAEventTypes.event_hook, oEvent);
	},
	
	//****************************************************************************
	onCAEvent: function(poEvent){
		var oElement,  sID;
		var oTarget;
		
		oElement = this.element;
		sID = oElement.attr("id");

		switch (poEvent.type){
			case  cCAEventTypes.event_types.status:
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
				
			case cCAEventTypes.event_types.set_rule:
			case cCAEventTypes.event_types.initialise:
				oTarget = $("#"+sID+caStatusConsts.CHART_ID);
				oTarget.cachart("onCAEvent",poEvent);
				break;
		}
	}
	
});
