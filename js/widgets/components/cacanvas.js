"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cCACanvasTypes{
	static white_image = "images/whitebox.png";
	static black_image = "images/blackbox.png";
}

class caCanvasEvent{
	grid_name =null;
	
	//*****************************************************
	constructor (psGridName, psEvent, poData){
		if (!psGridName ) throw new CAException("no name provided");
		if (!psEvent ) throw new CAException("no event  provided");
		this.event = psEvent;
		this.data = poData;
		this.grid_name = psGridName;
	}
	
	//*****************************************************
	throw_event(){
		var oEvent = new cCAEvent( cCAEventTypes.events.canvas_event, this);
		bean.fire(document, cCAEventTypes.event_hook , oEvent);
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCACanvas{
	//#################################################################
	//# Definition
	//#################################################################
	grid =  null;
	rows = 100;
	cols=100;
	grid_name=null;
	canvas = null;
	drawing =false;
	image_count = 0;
	images_done = 0;
	
	//#################################################################
	//# Constructor
	//#################################################################`
	 constructor(poOptions, poElement){
		//check dependencies
		if (!bean ) 	$.error("bean class is missing! check includes");	
		if (!poOptions.name) $.error("name must be provided");	
		
		this.element = poElement;
		this.rows = poOptions.rows;
		this.cols = poOptions.cols;
		this.grid_name = poOptions.name;
		this.cell_size = poOptions.cell_size;
		
		//set basic stuff
		poElement.uniqueId();
		poElement.addClass("ui-widget");
		poElement.addClass("CACanvas");
		
		//subscribe to CAEvents
		var oThis = this;
		bean.on (document, cCAEventTypes.event_hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
		
	}
	
	//#################################################################
	//# events
	//#################################################################`
	//****************************************************************
	 onCAEvent( poEvent){
		cDebug.enter();
		
		switch (poEvent.type){
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.ready: //all widgets are ready
				cDebug.write("event: ready");
				//associate a CA grid with the widget
				var oGrid = new cCAGrid(this.grid_name, this.rows, this.cols);
				this.pr__set_grid(oGrid);
				//put something in the widget
				this.pr__initCanvas();
				
				break;
				
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.import_grid: //a new grid has been imported
				cDebug.write("event: import grid");
				var oGrid = poEvent.data;
				this.pr__set_grid(oGrid);
				//draw the grid
				this.pr__drawGrid();
				
				//rule has been set
				var oEvent = new cCAEvent( cCAEventTypes.event_types.update_rule, oGrid.rule);
				bean.fire(document, cCAEventTypes.event_hook , oEvent);
				break;
				
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.set_rule: //rule has been set 
				cDebug.write("event: set rule");
				this.grid.set_rule(poEvent.data);
				break;
				
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.grid_init: //grid to be initialised
				cDebug.write("event: initialise");
				var iInitType = poEvent.data;
				this.grid.init(iInitType);
				break;
				
			//-------------------------------------------------------------------
			case cCAEventTypes.event_types.action: //tell the grid to do something
				cDebug.write("event: acion");
				this.grid.action(poEvent.data);
				break;
				
			case null:	//should never get here
				cDebug.warn("null event type");
			
		}
		cDebug.leave();
	}
	
	//****************************************************************
	 onNoChange(){
		cDebug.enter();
		var oEvent = new cCAEvent( cCAEventTypes.event_types.nochange, null);
		cDebug.write("no change");
		bean.fire(document, cCAEventTypes.event_hook, oEvent);
		cDebug.leave();
	}
	
	//****************************************************************
	 onGridDone(poData){
		cDebug.enter();
		this.pr__drawGrid();
		var oEvent = new cCAEvent( cCAEventTypes.event_types.grid_status, poData);
		bean.fire(document, cCAEventTypes.event_hook, oEvent);
		cDebug.leave();
	}

	//****************************************************************
	 onGridClear(){
		cDebug.enter();
		cDebug.write("Clearing canvas");
		this.canvas.clearCanvas();
		cDebug.leave();
	}
	
	//****************************************************************
	 onImageLoad(){
		this.images_done ++;
		
		if (this.images_done >= this.image_count){
			cDebug.write("finished drawing");
			this.drawing = false;
			var oGrid = this.grid;
			var oEvent = new cCAGridEvent(this.grid_name, cCAGridTypes.events.notify_drawn,null);
			bean.fire(document, cCAGridTypes.event_hook, oEvent);
		}
	}
	
	//#################################################################
	//# privates
	//#################################################################`
	 pr__set_grid(poGrid){
		var oThis = this;
		this.grid = poGrid;
		bean.on(poGrid, cCAGridTypes.events.done, function(poData){oThis.onGridDone(poData)});
		bean.on(poGrid, cCAGridTypes.events.clear, function(){oThis.onGridClear()});
		bean.on(poGrid, cCAGridTypes.events.nochange, function(){oThis.onNoChange()});
		
		// publish grid details to anyone interested - eg to export grid data, or start/stop the grid
		var oEvent = new cCAEvent( cCAEventTypes.event_types.set_grid, poGrid);
		bean.fire (document, cCAEventTypes.event_hook, oEvent );
	}
	
	//****************************************************************
	 pr__initCanvas(){
		cDebug.enter();
		var oElement = this.element;

		
		//create the html5 canvas to draw on
		oElement.empty();
		var oCanvas = $("<canvas>");
			oCanvas.attr("width",this.cols*this.cell_size);
			oCanvas.attr("height",this.rows*this.cell_size);
			oElement.append(oCanvas);
			this.canvas = oCanvas;
				
		//initialise the grid
		this.grid.init(cCAGridTypes.init.block.id);
		cDebug.leave();
	}
		
	//****************************************************************
	 pr__drawGrid(){
		cDebug.enter();
		var oGrid = this.grid;

		this.image_count = oGrid.changed_cells.length;
		this.images_done = 0;		
		this.drawing = true;
		
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
	 pr__drawFullGrid(){
		cDebug.enter();
		var oGrid = this.grid;
		
		this.image_count = oGrid.rows * oGrid.cols;
		this.images_done = 0;		
		this.drawing = true;
		
		for (var ir=1; ir<= oGrid.rows; ir++){
			for (var ic=1; ic<= oGrid.cols; ic++){
				var oCell = oGrid.getCell(ir,ic);
				this.pr__draw_cell(oCell);
			}
		}
		cDebug.leave();
	}	
	
	//****************************************************************
	 pr__draw_cell(poCell){
		var oThis = this;
		var oCanvas = this.canvas;
		
		//-----------------what img to use
		var sImg = (poCell.value==0?cCACanvasTypes.white_image:cCACanvasTypes.black_image);
		
		//-----------------coords of cell
		var iRow, iCol;
		iRow = poCell.data.get(cCACellTypes.hash_values.row);
		iCol = poCell.data.get(cCACellTypes.hash_values.col);
		var iy = (iRow -1) * this.cell_size;
		var ix = (iCol-1) * this.cell_size;
		
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
		cell_size:5,
		name:null
	},
	
	_create(){
		var oControl = new cCACanvas(this.options, this.element );
	}
});
