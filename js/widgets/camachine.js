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
		oCanvas: null
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
		var oControlDiv = $("<SPAN>").cacontrols({onCAEvent:function(poEvent,poData){oThis.onCAEvent(poData);} });
		var oCanvasDiv = $("<SPAN>").cacanvas(oOptions);
		oOptions.oCanvas = oCanvasDiv;

		oElement.append(oControlDiv);
		oElement.append(oCanvasDiv);
	},
	
	
	//#################################################################
	//# Constructor
	//#################################################################`
	onCAEvent:function(poEvent){
		var oOptions = this.options;
		try{
			oOptions.oCanvas.cacanvas("onCAEvent",poEvent);
		}catch(e){
			alert ("Whooops - something went wrong:" + e.message);
		}
	}
	
	
});