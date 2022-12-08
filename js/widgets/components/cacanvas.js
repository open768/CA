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

class cCACanvasEventData{
	grid_name=null;
	data=null;
	
	constructor(psGridName, poData){
		this.grid_name = psGridName;
		this.data = poData;
	}
}

class cCACanvasEvent{
	static actions = {
		nochange:"CENC",
		grid_status:"CEGS",
		set_grid:"CESG"
	};

	action=null;
	data=null;
	constructor(psGridName, psAction, poData){
		if (!psGridName || !psAction) $.error("incorrect number of arguments");
		this.grid_name = psGridName;
		this.action = psAction;
		this.data = poData;
	}
	
	trigger(poSubject){
		var oData = new cCACanvasEventData(this.grid_name,this.data); 
		var oEvent = new cCAEvent(cCAEvent.types.canvas, this.action, oData);
		oEvent.trigger(poSubject);
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
	mouse={
		X : 0,
		Y : 0,
		has_events : false,
		is_down : false
	};
	last ={
		row : -1,
		col : -1
	};
	
	//#################################################################
	//# Constructor
	//#################################################################`
	 constructor(poOptions, poElement){
		//check dependencies
		if (!bean ) 	$.error("bean class is missing! check includes");	
		if (!poOptions.grid_name) $.error("name must be provided");	
		
		this.element = poElement;
		this.rows = poOptions.rows;
		this.cols = poOptions.cols;
		this.grid_name = poOptions.grid_name;
		this.cell_size = poOptions.cell_size;
		
		//set basic stuff
		poElement.uniqueId();
		poElement.addClass("ui-widget");
		poElement.addClass("CACanvas");
		
		//subscribe to CAEvents
		var oThis = this;
		bean.on (document, cCAEvent.hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
	 }
	
	//#################################################################
	//# events
	//#################################################################`
	onCAGridEvent(poEvent){
		switch (poEvent.action){
			case cCAGridEvent.actions.done:
				this.pr__grid_done(poEvent.data);
				break;
			case cCAGridEvent.actions.clear:
				this.pr__grid_clear();
				break;
			case cCAGridEvent.actions.nochange:
				this.pr__grid_nochange();
				break;
		}
	}
		
	//****************************************************************
	onCAEvent( poEvent){
		var oElement = this.element;
		var oThis = this;
		
		cDebug.enter();
		
		switch (poEvent.type){
			//----------------------------------------------------------------------
			case cCAEvent.types.action:
				cDebug.write("event: action");
				switch(poEvent.action){
					case cCAActionEvent.actions.ready:
						cDebug.write("action: ready");
						//associate a CA grid with the widget
						var oGrid = new cCAGrid(this.grid_name, this.rows, this.cols);
						this.pr__set_grid(oGrid);
						//put something in the widget
						this.pr__initCanvas();
						if (!this.has_mouseup){
							oElement.mouseup( function(){ oThis.onMouseUp(); } );
							oElement.mousemove( function(poEvent){ oThis.onMouseMove(poEvent); } );
							oElement.mousedown( function(poEvent){ oThis.onMouseDown(poEvent); } );
							this.has_mouseup = true;
						}
						break;
						
					//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
					case cCAActionEvent.actions.grid_init: //grid to be initialised
						cDebug.write("event: initialise");
						var iInitType = poEvent.data;
						this.grid.init(iInitType);
						break;
						
					//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
					case cCAActionEvent.actions.control: //grid to be initialised
						cDebug.write("event: acion");
						this.grid.action(poEvent.data);
						break;
				}
				break;
			//----------------------------------------------------------------------
			case cCAEvent.types.general:
				cDebug.write("event: general");
				switch (poEvent.action){
					case cCAGeneralEvent.actions.import_grid:
						cDebug.write("action: import grid");
						var oGrid = poEvent.data;
						this.pr__set_grid(oGrid);
						//draw the grid
						this.pr__grid_clear();
						this.pr__drawGrid();
						
						//rule has been set
						var oEvent = new cCAEvent( cCAEvent.types.rule, cCARuleEvent.actions.update_rule, oGrid.rule);
						oEvent.trigger(document);
						break;
						
					//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
					case cCAGeneralEvent.actions.set_rule:
						cDebug.write("action: set rule");
						this.grid.set_rule(poEvent.data);
						break;
				}
				break;
				
		}
		cDebug.leave();
	}
	
	//****************************************************************
	 onImageLoad(){
		this.images_done ++;
		
		if (this.images_done >= this.image_count){
			//let the grid know that the canvas completed drawing
			cDebug.write("finished drawing");
			this.drawing = false;
			var oGrid = this.grid;
			
			setTimeout( function(){ oGrid.notifyDrawn();}, 50); //async
		}
	}
	
	//****************************************************************
	onMouseDown(poEvent){
		if (!this.grid) return;
		
		this.mouse.is_down = true;
		this.pr__set_one_cell(poEvent);
	}
	
	//****************************************************************
	onMouseMove(poEvent){
		if (this.grid && this.mouse.is_down){
			this.pr__set_one_cell(poEvent);
		}
	}
	
	//****************************************************************
	onMouseUp(){
		this.mouse.is_down = false;
	}
	
	//#################################################################
	//# privates
	//#################################################################`
	pr__set_one_cell(poEvent){
		if (this.grid.running) return;
		
		var oRC = this.pr__get_cell_rc_from_event(poEvent);
		if (oRC){
			this.grid.changed_cells = [];
			this.grid.setCellValue(oRC.row, oRC.col, 1);
			this.pr__drawGrid();
		}
	}
	
	//****************************************************************
	pr__get_cell_rc_from_event(poEvent){
		var oElement = this.element;
		var X = poEvent.offsetX - cJquery.get_padding_width(oElement) + this.cell_size;
		var Y = poEvent.offsetY - cJquery.get_padding_height(oElement)+ this.cell_size;
		var ir = Math.trunc(Y / this.cell_size) +1;
		var ic = Math.trunc(X / this.cell_size) +1;
		
		if (ir<1) ir = 1;
		if (ir > this.rows) ir=this.rows;
		if (ic<1) ic = 1;
		if (ic > this.cols) ir=this.cols;
		
		var oRC = null;
		if (ir != this.last.row || ic != this.last.col){
			this.last.row = ir;
			this.last.col = ic;
			oRC = {
				row:ir,
				col:ic
			}
		}
		return oRC;
	}
	
	//****************************************************************
	 pr__grid_nochange(){
		cDebug.enter();
		
		cDebug.write("no change");
		
		var oEvent = new cCACanvasEvent( this.grid_name, cCACanvasEvent.actions.nochange, null);
		oEvent.trigger(document);
		
		cDebug.leave();
	}
	
	//****************************************************************
	 pr__grid_done(poData){
		cDebug.enter();
		
		this.pr__drawGrid();
		var oEvent = new cCACanvasEvent( this.grid_name, cCACanvasEvent.actions.grid_status, poData);
		oEvent.trigger(document);
		
		cDebug.leave();
	}

	//****************************************************************
	 pr__grid_clear(){
		cDebug.enter();
		
		cDebug.write("Clearing canvas");
		this.canvas.clearCanvas();
		
		cDebug.leave();
	}
	
	pr__set_grid(poGrid){
		var oThis = this;
		this.grid = poGrid;
		
		bean.on(poGrid, cCAGridEvent.hook, function(poEvent){oThis.onCAGridEvent(poEvent)});
		
		// publish grid details to anyone interested - eg to export grid data, or start/stop the grid
		var oEvent = new cCACanvasEvent( this.grid_name, cCACanvasEvent.actions.set_grid, poGrid);
		oEvent.trigger(document);
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
		grid_name:null
	},
	
	_create:function(){
		var oOptions = this.options;
		if (!oOptions.grid_name) $.error("grid name not provided");
		
		var oControl = new cCACanvas(this.options, this.element );
	}
});
