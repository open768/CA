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
		oCanvas: null,
		oStatus: null
	},

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		//check for classes
		if (typeof cCArule !== 'function') { $.error("missing cCARule class");}
		
		//set basic stuff
		oElement.uniqueId();
		
		//machine has 2 child widgets: a control panel and machine canvas
		// all this widget does is to tell the widgets about each other
		oElement.empty();
		var oTable = $("<table>");
			var oRow = $("<TR>");
			var oCell = $("<TD>", {width:240,valign:"top"});
				var oControlDiv = $("<DIV>",{width:240});
				oControlDiv.cacontrols({
					onCAEvent:function(poEvent,poData){oThis.onControlEvent(poData);} 
				});
				oCell.append(oControlDiv);
				var oStatusDiv = $("<DIV>", {width:240}).castatus({});
				oOptions.oStatus = oStatusDiv;
				oCell.append(oStatusDiv);
			oRow.append(oCell);
			var oCell = $("<TD>");
				var oCanvasDiv = $("<SPAN>",{title:"this is where the magic happens"});
				oCanvasDiv.cacanvas({
					width:oOptions.width,
					height:oOptions.height,
					cell_size:oOptions.cell_size,
					onCanvasEvent: function(poEvent,poData){oThis.onCanvasEvent(poData);}
				});
				oOptions.oCanvas = oCanvasDiv;
				oCell.append(oCanvasDiv);
			oRow.append(oCell);
		oTable.append(oRow);
		oElement.append(oTable);
	},
	
	
	//#################################################################
	//# Events
	//#################################################################`
	onControlEvent:function(poData){
		var oOptions = this.options;
		try{
			oOptions.oCanvas.cacanvas("onCAEvent",poData);
		}catch(e){
			cDebug.write_exception(e);
			alert ("Whooops - something went wrong:" + e.message );
		}
	},
	
	onCanvasEvent:function(poData){
		if (poData == null) return;
		
		var oOptions = this.options;
		try{
			oOptions.oStatus.castatus("onCAEvent",poData);
		}catch(e){
			cDebug.write_exception(e);
			alert ("Whooops - something went wrong:" + e.message );
		}
	}
	
	
});