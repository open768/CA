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
		width:100,
		height:200,
		cell_size:5,
		oControls: null
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
		if (!oOptions.oControls) $.error("controls not specified!");	
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		oElement.addClass("CACanvas");
		
		//put something in the widget
		oElement.empty();
		oElement.append("canvas");

		// chain this widget to events generated by  the controls
		oOptions.oControls.on("CAEvent", 	function(poEvent,poData){oThis.onCAEvent(poData)}	);
		
		//test the  carule - create life
		var oImporter = new cCALifeImporter();
		var oRule = oImporter.makeRule(cCALifeRules.LIFE);
		cDebug.write("Done");
	},
	
	//****************************************************************
	onCAEvent: function( poData){
		
	}
	
	
});
