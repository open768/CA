"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cCACanvasConsts{
	static white_image = "images/whitebox.png";
	static black_image = "images/blackbox.png";
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacanvas",{
	//#################################################################
	//# Definition
	//#################################################################
	_state:{
		grid: null,
		canvas:null,
		drawing:false,
		image_count:0,
		images_done:0
	},
	options:{
		cols:100,
		rows:100,
		cell_size:5
	},
	
	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oThis = this;
		var oOptions = this.options;
		var oElement = this.element;
		
		//check dependencies
		if (!bean ) 	$.error("bean class is missing! check includes");	
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		oElement.addClass("CACanvas");
		
		//associate a CA grid with the widget
		var oGrid = new cCAGrid(oOptions.rows, oOptions.cols);
		this._state.grid = oGrid;
		bean.on(oGrid, cCAGridConsts.events.done, function(poData){oThis.onGridDone(poData)});
		bean.on(oGrid, cCAGridConsts.events.clear, function(){oThis.onGridClear()});
		bean.on(oGrid, cCAGridConsts.events.nochange, function(){oThis.onNoChange()});
		
		// publish grid details to anyone interested
		var oGridEvent = new cCAGridEvent( cCAGridConsts.events.init_grid, oGrid);
		var oEvent = new cCAEvent( cCAEventTypes.event_types.grid_event, oGridEvent);
		bean.fire (document, cCAEventTypes.event_hook, oEvent );
				
		//subscribe to CAEvents
		bean.on (document, cCAEventTypes.event_hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
		
		//put something in the widget
		this.pr__initCanvas();
	},
	
	//#################################################################
	//# events
	//#################################################################`
	//****************************************************************
	onCAEvent: function( poEvent){
		var oState = this._state;
		
		switch (poEvent.type){
			case cCAEventTypes.event_types.set_rule:
				oState.grid.set_rule(poEvent.data);
				break;
			case cCAEventTypes.event_types.initialise:
				oState.grid.init(poEvent.data);
				break;
			case cCAEventTypes.event_types.action:
				oState.grid.action(poEvent.data);
				break;
		}
	},
	
	//****************************************************************
	onNoChange:function(){
		var oEvent = new cCAEvent( cCAEventTypes.event_types.nochange, null);
		cDebug.write("no change");
		bean.fire(document, cCAEventTypes.event_hook, oEvent);
	},
	
	//****************************************************************
	onGridDone:function(poData){
		this.pr__drawGrid();
		var oEvent = new cCAEvent( cCAEventTypes.event_types.status, poData);
		bean.fire(document, cCAEventTypes.event_hook, oEvent);
	},

	//****************************************************************
	onGridClear:function(){
		var oCanvas = this._state.canvas;
		cDebug.write("Clearing canvas");
		oCanvas.clearCanvas();
	},
	
	//****************************************************************
	onImageLoad:function(){
		var oState = this._state;
		
		oState.images_done ++;
		
		if (oState.images_done >= oState.image_count){
			cDebug.write("finished drawing");
			oState.drawing = false;
			var oGrid = this._state.grid;
			setTimeout(function(){ oGrid.notify_drawn();}, 0);
		}
	},
	
	//#################################################################
	//# privates
	//#################################################################`
	pr__initCanvas: function(){
		var oOptions = this.options;
		var oState = this._state;
		var oElement = this.element;

		
		//create the html5 canvas to draw on
		oElement.empty();
		var oCanvas = $("<canvas>");
			oCanvas.attr("width",oOptions.cols*oOptions.cell_size);
			oCanvas.attr("height",oOptions.rows*oOptions.cell_size);
			oElement.append(oCanvas);
			oState.canvas = oCanvas;
				
		//initialise the grid
		oState.grid.init(cCAGridConsts.init.block.id);
	},
		
	//****************************************************************
	pr__drawGrid: function(){
		var oOptions = this.options;
		var oState = this._state;
		var oGrid = oState.grid;

		oState.image_count = oGrid.changed_cells.length;
		oState.images_done = 0;		
		oState.drawing = true;
		
		var x,y,oCell;
		for ( var i=0; i< oGrid.changed_cells.length; i++){
			oCell = oGrid.changed_cells[i];
			y = oCell.data.get(cCACellTypes.hash_values.row) * oOptions.cell_size;
			x = oCell.data.get(cCACellTypes.hash_values.col) * oOptions.cell_size;
			this.pr__draw_cell(oCell, x,y);
		}
	},
	
	//****************************************************************
	pr__drawFullGrid: function(){
		var oOptions = this.options;
		var oState = this._state;
		var oGrid = oState.grid;
		
		oState.image_count = oGrid.rows * oGrid.cols;
		oState.images_done = 0;		
		oState.drawing = true;
		
		var x,y=0;
		for (var ir=1; ir<= oGrid.rows; ir++){
			x=0;
			for (var ic=1; ic<= oGrid.cols; ic++){
				var oCell = oGrid.getCell(ir,ic);
				this.pr__draw_cell(oCell, x,y);
				x+= oOptions.cell_size;
			}
			y+= oOptions.cell_size;
		}
	},	
	
	//****************************************************************
	pr__draw_cell(poCell,piX, piY){
		var sImg = (poCell.value==0?cCACanvasConsts.white_image:cCACanvasConsts.black_image);
		var oThis = this;
		var oCanvas = this._state.canvas;
		
		//its faster to blit images than it is to draw vectors
		oCanvas.drawImage({
			source: sImg, x: piX, y: piY,
			fromCenter:false, load:function(){	oThis.onImageLoad();}
		});
	}
	
	
});
