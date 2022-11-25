"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.camachine",{
	//#################################################################
	//# Definition
	//#################################################################
	options:{
		width:100,
		height:200,
		cell_size:5,
	},

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oThis, oOptions, oElement;
		
		oThis = this;
		oOptions = oThis.options;
		oElement = oThis.element;
		
		//check for classes
		if (typeof cCArule !== 'function') { $.error("missing cCARule class");}
		if (!bean ) { $.error("missing bean class");}
		
		//set basic stuff
		oElement.uniqueId();
		
		//machine has 3 child widgets: control panel and machine canvas, status
		//widgets will subscribe and publish events themselves
		oElement.empty();
		var oTable = $("<table>");
			var oRow = $("<TR>");
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
				var oCell = $("<TD>", {width:240,valign:"top"});
					var oControlDiv = $("<DIV>",{width:240,id:"leftControl", canvas_id:"canvas"});
					oControlDiv.cacontrols();
					oCell.append(oControlDiv);
				oRow.append(oCell);
				
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
				var oCell = $("<TD>");
					var oCanvasDiv = $("<SPAN>",{title:"this is where the magic happens", id:"canvas"});
					oCanvasDiv.cacanvas({
						width:oOptions.width,
						height:oOptions.height,
						cell_size:oOptions.cell_size,
					});
					oCell.append(oCanvasDiv);
				oRow.append(oCell);
				
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
				var oCell = $("<TD>", {width:240,valign:"top",canvas_id:"canvas"});
					var oStatusDiv = $("<DIV>", {width:240}).castatus({});
					oCell.append(oStatusDiv);
				oRow.append(oCell);
				
			oTable.append(oRow);
		oElement.append(oTable);
		
		//check clipboard
		cBrowser.get_clipboard_permissions();
	},
});