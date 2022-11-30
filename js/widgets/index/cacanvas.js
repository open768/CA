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
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCACanvas{
	//#################################################################
	//# Definition
	//#################################################################
	static _state={
		grid: null,
		canvas:null,
		drawing:false,
		image_count:0,
		images_done:0
	};
	
	//#################################################################
	//# Constructor
	//#################################################################`
	static _create(poOptions, poElement){
		this.element = poElement;
		this.options = poOptions;
		
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
		bean.on(oGrid, cCAGridTypes.events.done, function(poData){oThis.onGridDone(poData)});
		bean.on(oGrid, cCAGridTypes.events.clear, function(){oThis.onGridClear()});
		bean.on(oGrid, cCAGridTypes.events.nochange, function(){oThis.onNoChange()});
		
		// publish grid details to anyone interested
		var oGridEvent = new cCAGridEvent( cCAGridTypes.events.init_grid, oGrid);
		var oEvent = new cCAEvent( cCAEventTypes.event_types.grid_event, oGridEvent);
		bean.fire (document, cCAEventTypes.event_hook, oEvent );
				
		//subscribe to CAEvents
		bean.on (document, cCAEventTypes.event_hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
		
		//put something in the widget
		this.pr__initCanvas();
	}
	
	//#################################################################
	//# events
	//#################################################################`
	//****************************************************************
	static onCAEvent( poEvent){
		cDebug.enter();
		var oState = this._state;
		
		switch (poEvent.type){
			case cCAEventTypes.event_types.set_rule:
				cDebug.write("event: set rule");
				oState.grid.set_rule(poEvent.data);
				var oGridEvent = new cCAGridEvent( cCAGridTypes.events.set_rule, oState.grid);
				bean.fire(document, cCAGridTypes.event_hook , oGridEvent);
				break;
			case cCAEventTypes.event_types.initialise:
				cDebug.write("event: initialise");
				oState.grid.init(poEvent.data);
				break;
			case cCAEventTypes.event_types.action:
				cDebug.write("event: acion");
				oState.grid.action(poEvent.data);
				break;
		}
		cDebug.leave();
	}
	
	//****************************************************************
	static onNoChange(){
		cDebug.enter();
		var oEvent = new cCAEvent( cCAEventTypes.event_types.nochange, null);
		cDebug.write("no change");
		bean.fire(document, cCAEventTypes.event_hook, oEvent);
		cDebug.leave();
	}
	
	//****************************************************************
	static onGridDone(poData){
		cDebug.enter();
		this.pr__drawGrid();
		var oEvent = new cCAEvent( cCAEventTypes.event_types.status, poData);
		bean.fire(document, cCAEventTypes.event_hook, oEvent);
		cDebug.leave();
	}

	//****************************************************************
	static onGridClear(){
		cDebug.enter();
		var oCanvas = this._state.canvas;
		cDebug.write("Clearing canvas");
		oCanvas.clearCanvas();
		cDebug.leave();
	}
	
	//****************************************************************
	static onImageLoad(){
		var oState = this._state;
		
		oState.images_done ++;
		
		if (oState.images_done >= oState.image_count){
			cDebug.write("finished drawing");
			oState.drawing = false;
			var oGrid = this._state.grid;
			var oEvent = new cCAGridEvent(cCAGridTypes.events.notify_drawn,null);
			bean.fire(document, cCAGridTypes.event_hook, oEvent);
		}
	}
	
	//#################################################################
	//# privates
	//#################################################################`
	static pr__initCanvas(){
		cDebug.enter();
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
		oState.grid.init(cCAGridTypes.init.block.id);
		cDebug.leave();
	}
		
	//****************************************************************
	static pr__drawGrid(){
		cDebug.enter();
		var oOptions = this.options;
		var oState = this._state;
		var oGrid = oState.grid;

		oState.image_count = oGrid.changed_cells.length;
		oState.images_done = 0;		
		oState.drawing = true;
		
		var x,y,oCell;
		if (oGrid.changed_cells.length == 0){
			cDebug.warn ("no changed cells - nothing to draw");
			return;
		}
		
		for ( var i=0; i< oGrid.changed_cells.length; i++){
			oCell = oGrid.changed_cells[i];
			y = oCell.data.get(cCACellTypes.hash_values.row) * oOptions.cell_size;
			x = oCell.data.get(cCACellTypes.hash_values.col) * oOptions.cell_size;
			this.pr__draw_cell(oCell, x,y);
		}
		cDebug.leave();
	}
	
	//****************************************************************
	static pr__drawFullGrid(){
		cDebug.enter();
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
		cDebug.leave();
	}	
	
	//****************************************************************
	static pr__draw_cell(poCell,piX, piY){
		var sImg = (poCell.value==0?cCACanvasConsts.white_image:cCACanvasConsts.black_image);
		var oThis = this;
		var oCanvas = this._state.canvas;
		
		//its faster to blit images than it is to draw vectors
		oCanvas.drawImage({
			source: sImg, x: piX, y: piY,
			fromCenter:false, load(){	oThis.onImageLoad();}
		});
	}
	
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacanvas",{
	options:{
		cols:100,
		rows:100,
		cell_size:5
	},
	
	_create(){
		cCACanvas._create(this.options, this.element);
	}
});
