"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAGridTypes {
	static event_hook = "CAGEVH";
	static init={
		blank:		{id:0,label:"Blank"},
		block:		{id:1,label:"Block"},
		checker:	{id:2,label:"Checker"},
		circle:		{id:3,label:"Circle"},
		cross:		{id:4,label:"Cross"},
		diagonal:	{id:5,label:"Diagonal"},
		diamond:	{id:6,label:"Diamond"},
		horiz_line:	{id:7,label:"H-Line"},
		sine:		{id:8,label:"Sine"},
		random:		{id:9,label:"Random"},
		vert_line:	{id:10,label:"V-Line"}
	};
	static events = {
		done:"GD",
		clear:"GC",
		nochange:"GN",
		notify_finished:"GF",
		init_grid:"GI",
		set_rule:"GSR",
		notify_drawn: "GND"
	};
	static actions={
		play:1,
		stop:2,
		step:3
	};
}

class cCAGridRunData{
	active = 0;
	runs = 0;
	changed = 0;
}

//*************************************************************************
class cCAGridEvent{
	constructor (psEvent, poData){
		this.event = psEvent;
		this.data = poData;
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAGridInitialiser{
	
	init(poGrid, piInitType){
		//always blank first
		cDebug.enter();
		cDebug.write("init_type:" + piInitType);
		
		poGrid.init_cells();
		
		switch(piInitType){
			case cCAGridTypes.init.blank.id:
				cDebug.write("init blank");
				break;
				
			//------------------------------------------------------
			case cCAGridTypes.init.block.id:
				cDebug.write("init block");
				var iMidC = Math.floor( poGrid.cols/2);
				var iMidR = Math.floor( poGrid.rows/2);
				for (var ic=iMidC; ic<= iMidC+1; ic++)
					for (var ir=iMidR; ir<= iMidR+1; ir++)
						poGrid.setCellValue(ir,ic,1);
				poGrid.non_zero_count = 4;
				poGrid.changed_count = 4;
				break;
				
			//------------------------------------------------------
			case cCAGridTypes.init.checker.id:
				cDebug.write("init checker");
				var iStartCol = 1;
				var iSize = 3;
				for (var iRow=1; iRow<=poGrid.rows; iRow+=iSize){
					for (var iCol=iStartCol; iCol<=poGrid.cols; iCol+=(iSize*2)){
						for (var iDeltaR=0;iDeltaR<iSize;iDeltaR++)
							for (var iDeltaC=0;iDeltaC<iSize;iDeltaC++)
								poGrid.setCellValue	(iRow+ iDeltaR,iCol+iDeltaC,1);
					}

					if (iStartCol ==1)
						iStartCol=iSize +1;
					else
						iStartCol=1;
				}
			break;
			
			//------------------------------------------------------
			case cCAGridTypes.init.circle.id:
				cDebug.write("init circle");
				var iMidC = Math.floor( poGrid.cols/2);
				var iMidR = Math.floor( poGrid.rows/2);
				
				var iDiameter = Math.min (iMidC, iMidR)/2;
				var iDSq = iDiameter * iDiameter;
				for (var x=iDiameter; x>=0; x--){
					var y = Math.sqrt( iDSq - Math.pow(x,2));
					y = Math.round(Math.abs(y));
					poGrid.setCellValue(iMidR+y,iMidC-x,1);
					poGrid.setCellValue(iMidR-y,iMidC-x,1);
					poGrid.setCellValue(iMidR+y,iMidC+x,1);
					poGrid.setCellValue(iMidR-y,iMidC+x,1);
				}
			break;
			
			//------------------------------------------------------
			case cCAGridTypes.init.cross.id:
				cDebug.write("init cross");
				var iMidC = Math.floor( poGrid.cols/2);
				var iMidR = Math.floor( poGrid.rows/2);
				
				poGrid.setCellValue(iMidR,iMidC,1);
				for (var i=1; i<= 4; i++){
					poGrid.setCellValue(iMidR+i,iMidC,1);
					poGrid.setCellValue(iMidR-i,iMidC,1);
					poGrid.setCellValue(iMidR,iMidC+i,1);
					poGrid.setCellValue(iMidR,iMidC-i,1);
				}

				poGrid.non_zero_count = 17;
				poGrid.changed_count = 17;
				break;
				
			//------------------------------------------------------
			case cCAGridTypes.init.diagonal.id:
				cDebug.write("init diagonal");
				for (var ir=1; ir<= poGrid.rows; ir++){
					if (ir>poGrid.cols) break;
					poGrid.setCellValue(ir,ir,1);
				}
				break;
				
			//------------------------------------------------------
			case cCAGridTypes.init.diamond.id:
				cDebug.write("init diamond");
				var icc = Math.floor(poGrid.cols / 2);
				var icr = Math.floor(poGrid.rows / 2);
				
				for (var i=10; i>= 0; i--){
					var dx = i;
					var dy = 10 - dx;
					
					poGrid.setCellValue(icr-dy,icc-dx,1);
					poGrid.setCellValue(icr-dy,icc+dx,1);
					poGrid.setCellValue(icr+dy,icc-dx,1);
					poGrid.setCellValue(icr+dy,icc+dx,1);
				}
				
				break;
				
			//------------------------------------------------------
			case cCAGridTypes.init.horiz_line.id:
				cDebug.write("init hline");
				var ir = Math.floor(poGrid.rows / 2);
				for (var ic=1; ic<= poGrid.cols; ic++)
					poGrid.setCellValue(ir,ic,1);
				break;
				
			//--------------------------------------------------------
			case cCAGridTypes.init.random.id:
				cDebug.write("init random");
				for (var ir=1; ir<= poGrid.rows; ir++)
					for (var ic=1; ic<= poGrid.cols; ic++){
						var iRnd = Math.round(Math.random());
						poGrid.setCellValue(ir,ic,iRnd);
						poGrid.non_zero_count += iRnd;
					}
				poGrid.changed_count = poGrid.non_zero_count;
				break;
			//--------------------------------------------------------
			case cCAGridTypes.init.sine.id:
				cDebug.write("init sine");
				var dRadian= 2*Math.PI/poGrid.cols;
				var iMidR = Math.floor( poGrid.rows/2);
				var iRad = 0;
				var iMidrow = Math.round(poGrid.rows/2);
				
				for (var ic=1; ic<= poGrid.cols; ic++){
					var fSin = Math.sin(iRad);					
					var ir = iMidrow + Math.round(fSin * iMidrow);
					poGrid.setCellValue(ir,ic,1);
					iRad += dRadian;
				}
				break;

			//------------------------------------------------------
			case cCAGridTypes.init.vert_line.id:
				cDebug.write("init vline");
				var ic = Math.floor(poGrid.cols / 2);
				for (var ir=1; ir<= poGrid.cols; ir++)
					poGrid.setCellValue(ir,ic,1);
				break;
				
			//--------------------------------------------------------
			default:
				throw new CAException("unknown init_type: " + piInitType);
		}
		cDebug.leave();
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAGridExported {
	version = 1;
	grid = {
		rows:0,
		cols:0,
		data:null
	};
	rule = null;
	
	static is_valid_obj( poObj){
		if (!poObj.version) throw new Error("no version");
		if (!poObj.grid) throw new Error("no grid");
		if (!poObj.rule) throw new Error("no Rule");
		if (poObj.version !== 1) throw new Error("incompatible version");
		return true;
	}
}

class cCAGridJSONExporter{
	static export(poGrid){
		cDebug.enter();
		if ( !cCommon.obj_is(poGrid , "cCAGrid") ) throw new CAException("param 1 is not cCAGrid")
		
		var oObj = new cCAGridExported;
			//get the rule from the grid
			oObj.rule = cCARuleObjExporter.export(poGrid.rule);
			
			//get the status of the cells from the grid
			oObj.grid.rows = poGrid.rows;
			oObj.grid.cols = poGrid.cols;
			
			//todo
			oObj.grid.data = this.get_grid_base64(poGrid);
		cDebug.leave();
		return oObj;
	}
	
	//*************************************************************************
	static get_grid_base64(poGrid)
	{
		if ( !cCommon.obj_is(poGrid , "cCAGrid") ) throw new CAException("param 1 is not cCAGrid")
		if (poGrid.rule.stateRules.length > 1) throw new CAException("rules can only have 1 state")
			
		var sBin = "";
		var s64 = null;
		
		for (var iRow=1; iRow <= poGrid.rows; iRow++)
			for (var iCol=1; iCol <= poGrid.cols; iCol++){
				var oCell  = poGrid.getCell(iRow,iCol,true);
				sBin = sBin + oCell.value;
			}
			
		var s64 = cCASimpleBase64.toBase64(sBin);
			
		return s64;
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAGridJSONImporter{
	//*********************************************
	static populate(poJson){
		if (!cCAGridExported.is_valid_obj(poJson)) throw new CAException("invalid object")
		//-------------------------------------------------------------------
		var oGrid = new cCAGrid(poJson.grid.rows, poJson.grid.cols);

		//-------------------------------------------------------------------
		var oRule = cCARuleObjImporter.makeRule(poJson.rule);
		oGrid.rule = oRule;
		
		//-------------------------------------------------------------------
		oGrid.init_cells();		
		var s64 = poJson.grid.data;
		var sBin = cCASimpleBase64.toBinary(s64);
		var iIndex = 0;
		
		for (var iRow=1; iRow <= oGrid.rows; iRow++)
			for (var iCol=1; iCol <= oGrid.cols; iCol++){
				var sBinDigit = sBin[iIndex];
				oGrid.setCellValue(iRow,iCol,parseInt(sBinDigit));
			}
		return oGrid;
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAGrid {
	//#######################################################################
	//# instance variables
	//#######################################################################
	cell_data = null;
	
	constructor (piRows, piCols){
		this.rows = piRows;
		this.cols = piCols;
		this.rule = null;
		this.changed_cells = null;
		this.running = false;
		this.status = new cCAGridRunData();
		var oThis = this;
		bean.on(document, cCAGridTypes.event_hook, function(poEvent){oThis.onCAEvent(poEvent)});
	}
	
	//#######################################################################
	//# methods
	//#######################################################################
	action(piAction){
		cDebug.enter();
		if (this.rule == null) throw new CAException("no rule set");
		
		cDebug.write("running action: " + piAction);
		switch (piAction){
			case cCAGridTypes.actions.play:
				if (this.running) throw new CAException("CA is allready running");
				this.running = true;
				this.step();
				this.status.runs = 1;
				break;
			case cCAGridTypes.actions.stop:
				if (! this.running)
					throw new CAException("CA is not running");
				this.running = false;
				break;
			case cCAGridTypes.actions.step:
				this.step();
				break;
			default:
				throw new CAException("action not recognised: " + piAction);
		}
		cDebug.write("done action: " + piAction);
		cDebug.leave();
	}
	
	//****************************************************************
	set_rule(poRule){
		cDebug.enter();
		//clear rules from all cells
		this.clear_cell_rules()
			
		//set the rule for the grid
		this.rule = poRule;
		this.pr__link_cells(poRule.neighbour_type);
		cDebug.leave();
	}
	


	//****************************************************************
	step(){
		var oRule = this.rule;
		var oStatus = this.status;
		
		this.changed_cells = [];
		this.status.changed = 0;
		this.status.active = 0;
		
		cDebug.write("stepping");
		//apply rules
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic,true);
				if (oCell.rule == null) oCell.rule = this.rule;
				if (oCell.apply_rule()){
					this.changed_count++;
					this.changed_cells.push(oCell);
				}
				if (oCell.value > 0) oStatus.active ++;
			}

		//check how many cells changed
		var iChangedLen = this.changed_cells.length;
		this.status.changed = iChangedLen;
		if (iChangedLen == 0){
			this.running = false;
			bean.fire(this,cCAGridTypes.events.nochange);
			return;
		}
		
		//promote changed cells
		for ( var ic = 0; ic < iChangedLen; ic++){
			var oCell = this.changed_cells[ic];
			oCell.promote();
			if (oCell.value == 0) 
				oStatus.active --;
			else
				oStatus.active ++;
		}
		bean.fire(this,cCAGridTypes.events.done, oStatus);
	}
	
	//****************************************************************
	init(piInitType){
		cDebug.enter();
		if (this.running) throw new CAException("cant init when running");

		this.changed_cells = [];
		var oRule = this.rule;
		cDebug.write("initialising grid:" + piInitType);
		var oInitialiser = new cCAGridInitialiser();
		oInitialiser.init(this,piInitType);
		cDebug.write("done init grid: "+ piInitType);
		
		bean.fire(this,cCAGridTypes.events.done);
		cDebug.leave();
	}
	
	//****************************************************************
	init_cells(){
		cDebug.enter();
		this.cell_data = new cSparseArray(this.rows, this.cols);
		
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++)
				this.setCellValue(ir,ic,0);
		
		//reset instance state
		this.non_zero_count = 0;
		this.changed_cells = [];
		bean.fire(this,cCAGridTypes.events.clear);
		cDebug.leave();
	}
	
	//****************************************************************
	clear_cell_rules(){
		cDebug.enter();
		var oCell;
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				oCell = this.getCell(ir,ic);
				if (oCell !== null ) oCell.rule = null;
			}
		cDebug.leave();
	}
	
	//****************************************************************
	setCellValue(piRow,piCol,iValue){
		if (this.cell_data == null)
			throw new CAException("grid not initialised");
			
		var oCell = this.getCell(piRow, piCol, false);
		if (oCell == null) {
			oCell = new cCACell;
			oCell.data.set(cCACellTypes.hash_values.row, piRow);
			oCell.data.set(cCACellTypes.hash_values.col, piCol);
			this.cell_data.set(piRow,piCol, oCell);
		}

		if (iValue !== oCell.value){
			oCell.value = iValue;
			this.changed_cells.push(oCell);
		}
		return oCell;
	}
	
	//****************************************************************
	getCell(piRow,piCol, pbCreate = false){
		if (this.cell_data == null) return null;
		var oCell = this.cell_data.get(piRow,piCol);
		if (pbCreate && oCell == null)
			oCell = this.setCellValue(piRow,piCol,0);
		
		return oCell;
	}
	
	//#######################################################################
	//# events
	//#######################################################################
	onCAEvent(poEvent){
		if (poEvent.event === cCAGridTypes.events.notify_drawn)
			this.OnNotifyDrawn();
	}
	//****************************************************************
	OnNotifyDrawn(){
		cDebug.enter();
		var oThis = this;
		if (this.running){
			cDebug.write("running again");
			this.status.runs ++;
			setTimeout(function(){ oThis.step();}, 50);
		}else
			cDebug.write("not running again");
		cDebug.leave();
	}
	
	//#######################################################################
	//# privates
	//#######################################################################
	pr__link_cells(piNeighbourType){
		cDebug.enter();
		cDebug.write("linking cells");
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic);
				this.pr__link_cell(oCell,cCACellTypes.directions.north, ir-1, ic);
				this.pr__link_cell(oCell,cCACellTypes.directions.east, ir, ic+1);
				this.pr__link_cell(oCell,cCACellTypes.directions.south, ir+1, ic);
				this.pr__link_cell(oCell,cCACellTypes.directions.west, ir, ic-1);
				if (piNeighbourType == cCACellTypes.neighbours.eightway){
					this.pr__link_cell(oCell,cCACellTypes.directions.northeast, ir-1, ic+1);
					this.pr__link_cell(oCell,cCACellTypes.directions.southeast, ir+1, ic+1);
					this.pr__link_cell(oCell,cCACellTypes.directions.southwest, ir+1, ic-1);
					this.pr__link_cell(oCell,cCACellTypes.directions.northwest, ir-1, ic-1);
				}
			}
		cDebug.write("completed cell linking");
		cDebug.leave();
	}
	
	//****************************************************************
	pr__link_cell (poCell, piDirection, piRow, piCol){
		var ir, ic;
		ir=piRow;
		if (ir<1) ir= this.rows;
		if (ir>this.rows) ir=1;
		
		ic=piCol;
		if (ic<1) ic= this.cols;
		if (ic>this.cols) ic=1;
		
		var oNeigh = this.getCell(ir,ic,false);
		poCell.setNeighbour(piDirection,oNeigh);		
	}
	
}