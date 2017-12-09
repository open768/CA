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
		white_image:"images/whitebox.png",
		black_image:"images/blackbox.png",
		_privates:{
			oGrid: null,
			oCanvas:null,
			bDrawing:false,
			iImageCount:0
		}
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
		
		//associate a CA grid with the widget
		var oGrid = new cCAGrid(oOptions.rows, oOptions.cols);
		oOptions._privates.oGrid = oGrid;
		bean.on(oGrid, "done", function(){oThis.onGridDone()});
		
		//put something in the widget
		this.pr__initCanvas();
	},
	
	//#################################################################
	//# events
	//#################################################################`
	//****************************************************************
	onCAEvent: function( poEvent){
		var oThis = this;
		var oOptions = oThis.options;
		var oPrivOptions = oOptions._privates;
		
		
		switch (poEvent.type){
			case cCAConsts.event_types.set_rule:
				oPrivOptions.oGrid.rule = poEvent.data;
				break;
			case cCAConsts.event_types.initialise:
				oPrivOptions.oGrid.init(poEvent.data);
				break;
		}
	},
	
	//****************************************************************
	onGridDone:function(){
		this.pr__drawGrid();
	},
	
	//****************************************************************
	onImageLoad:function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oPrivOptions = oOptions._privates;
		
		oPrivOptions.iImageCount --;
		if (! oPrivOptions.bDrawing && (oPrivOptions.iImageCount ==0)){
			cDebug.write("finished drawing");
		}
		
	},
	
	//#################################################################
	//# privates
	//#################################################################`
	pr__initCanvas: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oPrivOptions = oOptions._privates;
		var oElement = oThis.element;

		
		//create the html5 canvas to draw on
		oElement.empty();
		var oCanvas = $("<canvas>");
		oCanvas.attr("width",oOptions.cols*oOptions.cell_size);
		oCanvas.attr("height",oOptions.rows*oOptions.cell_size);
		oPrivOptions.oCanvas = oCanvas;
		oElement.append(oCanvas);
				
		//fill the canvas with a pretty random pattern
		oPrivOptions.oGrid.init(cCAConsts.init_values.block);
		
		//link the cells in the grid
		oPrivOptions.oGrid.link_cells(cCAConsts.neighbours.eightway);
	},
	
	
	//****************************************************************
	pr__drawGrid: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oPrivOptions = oOptions._privates;
		var oCanvas = oPrivOptions.oCanvas;
		var oGrid = oPrivOptions.oGrid;
		oPrivOptions.iImageCount = 0;
		oPrivOptions.bDrawing = true;
		
		oCanvas.clearCanvas();
		var y=0;
		for (var ir=1; ir<= oGrid.rows; ir++){
			var x=0;
			for (var ic=1; ic<= oGrid.cols; ic++){
				var oCell = oGrid.getCell(ir,ic);
				var sImg = (oCell.value==0?oOptions.white_image:oOptions.black_image);
				oCanvas.drawImage({  
					source: sImg, 
					x: x, y: y,fromCenter:false, 
					load:function(){	oThis.onImageLoad();	}
				});
				oPrivOptions.iImageCount++;
				x+= oOptions.cell_size;
			}
			y+= oOptions.cell_size;
		}
		oPrivOptions.bDrawing = false;
	}	
	
	
});
