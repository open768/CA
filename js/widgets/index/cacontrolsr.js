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
	
	//***************************************************************
	constructor(poElement){
		this.element = poElement;

		var oThis = this;
		var oElement = this.element;
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		$(oElement).tooltip();

		//check dependencies
		if (!bean ) $.error("bean is missing , chack includes");
		if (!oElement.cachart) $.error("caChart is missing , chack includes");
		
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
	
	pr__set_controls(pbRunning){
		$("#btnStep").prop("disabled",pbRunning);
		$("#btnPlay").prop("disabled",pbRunning);
		$("#btnStop").prop("disabled",!pbRunning);
	}
	
	//****************************************************************************
	onCAEvent(poEvent){
		var oElement,  sID;
		var oTarget;
		
		oElement = this.element;
		sID = oElement.attr("id");

		if (poEvent.type === cCAEvent.types.canvas)
			switch(poEvent.action){
				case cCACanvasEvent.actions.grid_status:
					if (!poEvent.data) return;
					
					oTarget = $("#"+sID+cCAControlRTypes.ACTIVE_ID);
					oTarget.html(poEvent.data.active);
					oTarget = $("#"+sID+cCAControlRTypes.CHANGED_ID);
					oTarget.html(poEvent.data.changed);
					oTarget = $("#"+sID+cCAControlRTypes.RUNS_ID);
					oTarget.html(poEvent.data.runs);
					break;
				case cCACanvasEvent.actions.nochange:
					var oThis = this;
					setTimeout( function(){	oThis.pr__set_controls(false);}, 100);
			}
	}
	
	//***************************************************************
	//* Privates
	//***************************************************************
	pr__init(){
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
					oCell = $("<td>",{id:sID+cCAControlRTypes.ACTIVE_ID}).append("??");
					oRow.append(oCell);
					oTable.append(oRow);
				oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Changed");
					oRow.append(oCell);
					oCell = $("<td>",{id:sID+cCAControlRTypes.CHANGED_ID}).append("??");
					oRow.append(oCell);
					oTable.append(oRow);
				oRow = $("<tr>");
					oCell = $("<td>", {align:"right"}).append("Runs");
					oRow.append(oCell);
					oCell = $("<td>",{id:sID+cCAControlRTypes.RUNS_ID}).append("??");
					oRow.append(oCell);
					oTable.append(oRow);
				oDiv.append(oTable);
			oElement.append(oDiv);
		oElement.append("<P>");
		
		//-------------------------------------------------------------
		oElement.append("<HR>")
		oDiv = $("<DIV>",{class:"ui-widget-header"}).append("Chart");
			oElement.append(oDiv);
		oDiv = $("<DIV>",{class:"ui-widget-content",id:sID+cCAControlRTypes.CHART_ID}).cachart();
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
			oDiv.append("controls");
		oElement.append(oDiv);
		
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			var oButton = $("<button>",{width:"30px",height:"30px",id:"btnStop"}).button({icon:"ui-icon-stop"});
				oButton.prop("disabled", true);
				oButton.click(	function(){ oThis.onClickControl(cCAGridTypes.actions.stop);}	);
				oDiv.append(oButton);

			var oButton = $("<button>",{width:"30px",height:"30px",id:"btnPlay"}).button({icon:"ui-icon-circle-triangle-e"});
				oButton.prop("disabled", true);
				oButton.click(	function(){ oThis.onClickControl(cCAGridTypes.actions.play);}	);
				oDiv.append(oButton);

			var oButton = $("<button>",{width:"30px",height:"30px",title:"step",id:"btnStep"}).button({icon:"ui-icon-seek-end"});
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
	"ck.cacontrolsr",
	{
		_create(){
			var oControls = new cCAControlsR(this.element);
		}
	}
);