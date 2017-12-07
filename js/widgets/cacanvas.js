/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacanvas",{
	//#################################################################
	//# Definition
	//#################################################################
	options:{
		cols:100,
		rows:100,
		cell_size:5,
		oGrid: null,
		oCanvas:null	
	},
	
	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		//check dependencies
		if (!oElement.selectmenu ) 	$.error("selectmenu class is missing! check includes");	
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		oElement.addClass("CACanvas");
		
		//put something in the widget
		oElement.empty();
		this.pr__initCanvas();
		
		//associate a CA grid with the widget
		var oGrid = new cCAGrid(oOptions.rows, oOptions.cols);
		oOptions.oGrid = oGrid;
		
		//test the  carule - create life
		//var oImporter = new cCALifeImporter();
		//var oRule = oImporter.makeRule(cCALifeRules.LIFE);
		//cDebug.write("Done");
	},
	
	//****************************************************************
	pr__initCanvas: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		var oCanvas = $("<canvas>");
		oCanvas.attr("width",500);
		oCanvas.attr("height",500);
		oOptions.oCanvas = oCanvas;
		oElement.append(oCanvas);
		
		oCanvas.drawText({
		  fillStyle: '#9cf',
		  strokeStyle: '#25a',
		  strokeWidth: 2,
		  x: 100, y: 100,
		  fontSize: 48,
		  fontFamily: 'Verdana, sans-serif',
		  text: 'Ready'
		});
		
	},
	
	//****************************************************************
	onCAEvent: function( poEvent){
		var oThis = this;
		var oOptions = oThis.options;
		
		switch (poEvent.type){
			case cCAConsts.event_types.set_rule:
				oOptions.oGrid.rule = poEvent.data;
				break;
			case cCAConsts.event_types.initialise:
				alert ("not implemented");
				break;
		}
	}
	
	
});
