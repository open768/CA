/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

$.widget( "ck.indexeditor",{
	//#################################################################
	//# Options
	//#################################################################
	options:{
		index:-1,
		value: 0, 
		cell_size:15
	},
	
	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;

		oElement.uniqueId();
		var sID = oElement.attr("id");
		oElement.addClass("ui-widget");
		oElement.addClass("caindex");
		oElement.click( function(){ oThis.onClick()} );

		//add a canvas
		var oCanvas = $("<canvas>", {id: oElement.attr("id") + "c"});
		var iSize = oOptions.cell_size*3 + 2;
		oCanvas.attr("width",iSize);
		oCanvas.attr("height",iSize);
		oElement.append(oCanvas);
		
		//draw the canvas
		this._drawCanvas(oCanvas);
	},
	
	//#################################################################
	//# privates
	//#################################################################`
	_drawCanvas: function(oCanvas){
		var oThis = this;
		var oOptions = oThis.options;

		//-------------draw the grid
		var iSize = oOptions.cell_size*3 + 2;
		for ( l=1 ; l<=2; l++){
			var p = oOptions.cell_size*l +l;
			oCanvas.drawLine({
			  strokeStyle: 'black',
			  strokeWidth: 1,
			  x1: p , y1: 0,
			  x2: p , y2: iSize
			});
			oCanvas.drawLine({
			  strokeStyle: 'black',
			  strokeWidth: 1,
			  x1: 0 , y1: p,
			  x2: iSize , y2: p
			});
		}		
		
		//----------- draw the configuration
	},
	
	//#################################################################
	//# Events
	//#################################################################`
	onClick: function(){
		var oThis = this;
		var oElement = oThis.element;
		
		var oOptions = oThis.options;
		if (oOptions.value == 0){
			oOptions.value = 1;
			oElement.addClass("caindexon");
		}else{
			oOptions.value = 0;			
			oElement.removeClass("caindexon");
		}
	}
});

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.caeditor",{
	//#################################################################
	//# Options
	//#################################################################
	options:{
		rule:null,
		onCAEvent: null
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
		
		//there are 511 editor widgets - each is contained in a span
		for (i=1; i<=cCAConsts.max_inputs; i++){
			var oSpan = $("<SPAN>").indexeditor({index:i})
			oElement.append(oSpan);
		}
	}
});
