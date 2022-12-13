"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class caMachineTypes{
	static rule_set = false;
	static rule = null;
	static grid_name = "agridname";
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.camachine",{
	//#################################################################
	//# Definition
	//#################################################################
	options:{
		cols:100,
		rows:100,
		cell_size:5,
	},

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oOptions, oElement;
		
		oOptions = this.options;
		oElement = this.element;
		
		//check for classes
		if (typeof cCARule !== 'function') { $.error("missing cCARule class");}
		if (!bean ) { $.error("missing bean class");}
		
		//set basic stuff
		oElement.uniqueId();
		
		//machine has 3 child widgets: control panel and machine canvas, status
		//widgets will subscribe and publish events themselves
		oElement.empty();
		var oTable = $("<table>");
			//----------------------------------------------------------------------------------
			var oRow = $("<TR>");
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
				var oCell = $("<TD>", {width:350,valign:"top"});
					var oLeftCtrlDiv = $("<DIV>",{width:350,id:"leftControl", canvas_id:"canvas"});
					oLeftCtrlDiv.cacontrolsl({grid_name:caMachineTypes.grid_name});
						oCell.append(oLeftCtrlDiv);
					oRow.append(oCell);
				
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
				var oCell = $("<TD>");
					var oCanvasDiv = $("<SPAN>",{title:"this is where the magic happens", id:"canvas"});
					oCanvasDiv.cacanvas({
						cols:oOptions.cols,
						rows:oOptions.rows,
						cell_size:oOptions.cell_size,
						grid_name: caMachineTypes.grid_name
					});
					oCell.append(oCanvasDiv);
				oRow.append(oCell);
				
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
				var oCell = $("<TD>", {width:240,valign:"top",canvas_id:"canvas"});
					var oRightCtrlDiv = $("<DIV>", {width:240});
					oRightCtrlDiv.cacontrolsr({grid_name:caMachineTypes.grid_name});
					oCell.append(oRightCtrlDiv);
				oRow.append(oCell);
			oTable.append(oRow);
			
			//----------------------------------------------------------------------------------
			var oRow = $("<TR>");
				var oCell = $("<TD>", {valign:"top",colspan:3});
					var oJsonDiv = $("<DIV>", {title:"json will appear here"});
						oJsonDiv.cajson({grid_name:caMachineTypes.grid_name});
						oCell.append(oJsonDiv);
				oRow.append(oCell);
			oTable.append(oRow);
		oElement.append(oTable);
		
		//check clipboard
		cBrowser.get_clipboard_permissions(true);
		
		//---------------informs subscribers that UI is ready -------------------------------
		var oEvent = new cCAEvent( cCAEvent.types.action, cCAActionEvent.actions.ready,null);
		oEvent.trigger(document);

	},
});