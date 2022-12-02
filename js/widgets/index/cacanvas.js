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
		
				
		//subscribe to CAEvents
		bean.on (document, cCAEventTypes.event_hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
		
	}
	
	//#################################################################
	//# events
	//#################################################################`
	//****************************************************************
	static onCAEvent( poEvent){
		cDebug.enter();
		var oState = this._state;
		var oOptions = this.options;
		
		switch (poEvent.type){
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.ready:
				cDebug.write("event: ready");
				//associate a CA grid with the widget
				var oGrid = new cCAGrid(oOptions.rows, oOptions.cols);
				this.pr__set_grid(oGrid);
				//put something in the widget
				this.pr__initCanvas();
				
				break;
				
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.import_grid:
				cDebug.write("event: import grid");
				var oGrid = poEvent.data;
				this.pr__set_grid(oGrid);
				bean.fire(oGrid,cCAGridTypes.events.done);
				
				//rule has been set
				var oEvent = new cCAEvent( cCAEventTypes.events.update_rule, oGrid.rule);
				bean.fire(document, cCAEventTypes.event_hook , oEvent);
				break;
				
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.set_rule:
				cDebug.write("event: set rule");
				oState.grid.set_rule(poEvent.data);
				var oGridEvent = new cCAGridEvent( cCAGridTypes.events.set_rule, oState.grid);
				bean.fire(document, cCAGridTypes.event_hook , oGridEvent);
				break;
				
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.grid_init:
				cDebug.write("event: initialise");
				var iInitType = poEvent.data;
				oState.grid.init(iInitType);
				break;
				
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.action:
				cDebug.write("event: acion");
				oState.grid.action(poEvent.data);
				break;
				
			case null:
				cDebug.warn("null event type");
			
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
	static pr__set_grid(poGrid){
		var oThis = this;
		this._state.grid = poGrid;
		bean.on(poGrid, cCAGridTypes.events.done, function(poData){oThis.onGridDone(poData)});
		bean.on(poGrid, cCAGridTypes.events.clear, function(){oThis.onGridClear()});
		bean.on(poGrid, cCAGridTypes.events.nochange, function(){oThis.onNoChange()});
		
		// publish grid details to anyone interested - eg to export grid data, or start/stop the grid
		var oEvent = new cCAEvent( cCAEventTypes.event_types.set_grid, poGrid);
		bean.fire (document, cCAEventTypes.event_hook, oEvent );
	}
	
	//****************************************************************
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
			this.pr__draw_cell(oCell);
		}
		cDebug.leave();
	}
	
	//****************************************************************
	static pr__drawFullGrid(){
		cDebug.enter();
		var oState = this._state;
		var oGrid = oState.grid;
		
		oState.image_count = oGrid.rows * oGrid.cols;
		oState.images_done = 0;		
		oState.drawing = true;
		
		for (var ir=1; ir<= oGrid.rows; ir++){
			for (var ic=1; ic<= oGrid.cols; ic++){
				var oCell = oGrid.getCell(ir,ic);
				this.pr__draw_cell(oCell);
			}
		}
		cDebug.leave();
	}	
	
	//****************************************************************
	static pr__draw_cell(poCell){
		var oThis = this;
		var oCanvas = this._state.canvas;
		var oOptions = this.options;
		
		//-----------------what img to use
		var sImg = (poCell.value==0?cCACanvasConsts.white_image:cCACanvasConsts.black_image);
		
		//-----------------coords of cell
		var iRow, iCol;
		iRow = poCell.data.get(cCACellTypes.hash_values.row);
		iCol = poCell.data.get(cCACellTypes.hash_values.col);
		var iy = (iRow -1) * oOptions.cell_size;
		var ix = (iCol-1) * oOptions.cell_size;
		
		//------------------draw
		//its faster to blit images than it is to draw vectors
		oCanvas.drawImage({
			source: sImg, x: ix, y: iy,
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
