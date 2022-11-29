"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAGridConsts {
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
		done:"D",
		clear:"C",
		nochange:"N",
		notify_finished:"F",
	};
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAGridInitialiser{
	
	init(poGrid, piInitType){
		//always blank first
		if (piInitType !== cCAGridConsts.init.blank.id)
			this.init(poGrid,cCAGridConsts.init.blank.id);
		
		switch(piInitType){
			case cCAGridConsts.init.blank.id:
				for (var ir=1; ir<= poGrid.rows; ir++)
					for (var ic=1; ic<= poGrid.cols; ic++){
						var oCell = poGrid.getCell(ir,ic,true);
						if (oCell) oCell.clear();
					}
				poGrid.non_zero_count = 0;
				poGrid.changed_cells = [];
				bean.fire(poGrid,cCAGridConsts.events.clear);
				break;
				
			//------------------------------------------------------
			case cCAGridConsts.init.block.id:
				var iMidC = Math.floor( poGrid.cols/2);
				var iMidR = Math.floor( poGrid.rows/2);
				for (var ic=iMidC; ic<= iMidC+1; ic++)
					for (var ir=iMidR; ir<= iMidR+1; ir++)
						poGrid.setCellValue(ir,ic,true,1);
				poGrid.non_zero_count = 4;
				poGrid.changed_count = 4;
				break;
				
			//------------------------------------------------------
			case cCAGridConsts.init.checker.id:
				var iStartCol = 1;
				var iSize = 3;
				for (var iRow=1; iRow<=poGrid.rows; iRow+=iSize){
					for (var iCol=iStartCol; iCol<=poGrid.cols; iCol+=(iSize*2)){
						for (var iDeltaR=0;iDeltaR<iSize;iDeltaR++)
							for (var iDeltaC=0;iDeltaC<iSize;iDeltaC++)
								poGrid.setCellValue	(iRow+ iDeltaR,iCol+iDeltaC,true,1);
					}

					if (iStartCol ==1)
						iStartCol=iSize +1;
					else
						iStartCol=1;
				}
			break;
			
			//------------------------------------------------------
			case cCAGridConsts.init.circle.id:
				var iMidC = Math.floor( poGrid.cols/2);
				var iMidR = Math.floor( poGrid.rows/2);
				
				for (var x=7; x>=0; x--){
					var y = Math.sqrt( 49 - Math.pow(x,2));
					y = Math.round(Math.abs(y));
					poGrid.setCellValue(iMidR+y,iMidC-x,true,1);
					poGrid.setCellValue(iMidR-y,iMidC-x,true,1);
					poGrid.setCellValue(iMidR+y,iMidC+x,true,1);
					poGrid.setCellValue(iMidR-y,iMidC+x,true,1);
				}
			break;
			
			//------------------------------------------------------
			case cCAGridConsts.init.cross.id:
				var iMidC = Math.floor( poGrid.cols/2);
				var iMidR = Math.floor( poGrid.rows/2);
				
				poGrid.setCellValue(iMidR,iMidC,true,1);
				for (var i=1; i<= 4; i++){
					poGrid.setCellValue(iMidR+i,iMidC,true,1);
					poGrid.setCellValue(iMidR-i,iMidC,true,1);
					poGrid.setCellValue(iMidR,iMidC+i,true,1);
					poGrid.setCellValue(iMidR,iMidC-i,true,1);
				}

				poGrid.non_zero_count = 17;
				poGrid.changed_count = 17;
				break;
				
			//------------------------------------------------------
			case cCAGridConsts.init.diagonal.id:
				for (var ir=1; ir<= poGrid.rows; ir++){
					if (ir>poGrid.cols) break;
					poGrid.setCellValue(ir,ir,true,1);
				}
				break;
				
			//------------------------------------------------------
			case cCAGridConsts.init.diamond.id:
				var icc = Math.floor(poGrid.cols / 2);
				var icr = Math.floor(poGrid.rows / 2);
				
				for (var i=10; i>= 0; i--){
					var dx = i;
					var dy = 10 - dx;
					
					poGrid.setCellValue(icr-dy,icc-dx,true,1);
					poGrid.setCellValue(icr-dy,icc+dx,true,1);
					poGrid.setCellValue(icr+dy,icc-dx,true,1);
					poGrid.setCellValue(icr+dy,icc+dx,true,1);
				}
				
				break;
				
			//------------------------------------------------------
			case cCAGridConsts.init.horiz_line.id:
				var ir = Math.floor(poGrid.rows / 2);
				for (var ic=1; ic<= poGrid.cols; ic++)
					poGrid.setCellValue(ir,ic,true,1);
				break;
				
			//--------------------------------------------------------
			case cCAGridConsts.init.random.id:
				for (var ir=1; ir<= poGrid.rows; ir++)
					for (var ic=1; ic<= poGrid.cols; ic++){
						var iRnd = Math.round(Math.random());
						poGrid.setCellValue(ir,ic,true,iRnd);
						poGrid.non_zero_count += iRnd;
					}
				poGrid.changed_count = poGrid.non_zero_count;
				break;
			//--------------------------------------------------------
			case cCAGridConsts.init.sine.id:
				var dRadian= 2*Math.PI/poGrid.cols;
				var iMidR = Math.floor( poGrid.rows/2);
				var iRad = 0;
				var iMidrow = Math.round(poGrid.rows/2);
				
				for (var ic=1; ic<= poGrid.cols; ic++){
					var fSin = Math.sin(iRad);					
					var ir = iMidrow + Math.round(fSin * iMidrow);
					poGrid.setCellValue(ir,ic,true,1);
					iRad += dRadian;
				}
				break;

			//------------------------------------------------------
			case cCAGridConsts.init.vert_line.id:
				var ic = Math.floor(poGrid.cols / 2);
				for (var ir=1; ir<= poGrid.cols; ir++)
					poGrid.setCellValue(ir,ic,true,1);
				break;
				
			//--------------------------------------------------------
			default:
				throw new CAException("unknown init_type: " + piInitType);
		}
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAGrid {
	//#######################################################################
	//# instance variables
	//#######################################################################
	constructor (piRows, piCols){
		this.rows = piRows;
		this.cols = piCols;
		this.rule = null;
		this.changed_cells = null;
		this.running = false;
		this.status = new cCARunData();
		
		this.privates = {
			iLastRow : -1,
			oLastRow :null,
			cell_data:new Map(),
		};
	}
	
	//#######################################################################
	//# methods
	//#######################################################################
	action(piAction){
		if (this.rule == null) throw new CAException("no rule set");
		
		cDebug.write("running action: " + piAction);
		switch (piAction){
			case cCAConsts.action_types.play:
				if (this.running) throw new CAException("CA is allready running");
				this.running = true;
				this.step();
				this.status.runs = 1;
				break;
			case cCAConsts.action_types.stop:
				if (! this.running)
					throw new CAException("CA is not running");
				this.running = false;
				break;
			case cCAConsts.action_types.step:
				this.step();
				break;
			default:
				throw new CAException("action not recognised: " + piAction);
		}
		cDebug.write("done action: " + piAction);
	}
	
	//****************************************************************
	set_rule(poRule){
		//clear rules from all cells
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic,false);
				if (oCell) oCell.rule = null;
			}
			
		//set the rule for the grid
		this.rule = poRule;
		this.pr__link_cells(poRule.neighbour_type);
	}
	
	//****************************************************************
	notify_drawn(){
		var oThis = this;
		if (this.running){
			cDebug.write("running again");
			this.status.runs ++;
			setTimeout(function(){ oThis.step();}, 50);
		}else
			cDebug.write("not running again");
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

		//promote changed cells
		var iChangedLen = this.changed_cells.length;
		this.status.changed = iChangedLen;
		if (iChangedLen == 0){
			this.running = false;
			bean.fire(this,cCAGridConsts.events.nochange);
			return;
		}
		
		for ( var ic = 0; ic < iChangedLen; ic++){
			var oCell = this.changed_cells[ic];
			oCell.promote();
			if (oCell.value == 0) 
				oStatus.active --;
			else
				oStatus.active ++;
		}
		bean.fire(this,cCAGridConsts.events.done, oStatus);
	}
	
	//****************************************************************
	init(piInitType){
		this.changed_cells = [];

		var oRule = this.rule;
		cDebug.write("initialising grid:" + piInitType);
		var oInitialiser = new cCAGridInitialiser();
		oInitialiser.init(this,piInitType);
		cDebug.write("done init grid: "+ piInitType);
		bean.fire(this,cCAGridConsts.events.done);
	}
	
	//****************************************************************
	pr__link_cells(piNeighbourType){
		cDebug.write("linking cells");
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic,false);
				this.pr__link_cell(oCell,cCAConsts.directions.north, ir-1, ic);
				this.pr__link_cell(oCell,cCAConsts.directions.east, ir, ic+1);
				this.pr__link_cell(oCell,cCAConsts.directions.south, ir+1, ic);
				this.pr__link_cell(oCell,cCAConsts.directions.west, ir, ic-1);
				if (piNeighbourType == cCAConsts.neighbours.eightway){
					this.pr__link_cell(oCell,cCAConsts.directions.northeast, ir-1, ic+1);
					this.pr__link_cell(oCell,cCAConsts.directions.southeast, ir+1, ic+1);
					this.pr__link_cell(oCell,cCAConsts.directions.southwest, ir+1, ic-1);
					this.pr__link_cell(oCell,cCAConsts.directions.northwest, ir-1, ic-1);
				}
			}
		cDebug.write("completed cell linking");
	}
	
	//****************************************************************
	setCellValue(piRow,piCol,pbCreateCell,iValue){
		if (piRow<1 || piRow>this.rows) return;
		if (piCol<1 || piCol>this.cols) return;
		var oCell = this.getCell(piRow, piCol, pbCreateCell);

		if (iValue !== oCell.value)this.changed_cells.push(oCell);
		oCell.value = iValue;
	}
	
	//****************************************************************
	// use a sparse array for the grid
	getCell(piRow,piCol,pbCreateCell){
		var oPrivates = this.privates;
		var oHash = oPrivates.cell_data;
		
		//get the row
		var oRowMap;
		if (oPrivates.iLastRow == piRow){
			oRowMap = oPrivates.oLastRow;
		}else{
			oRowMap = oHash.get(piRow);
			if (!oRowMap){
				if (!pbCreateCell) return null;
				oRowMap = new Map();
				oHash.set(piRow,oRowMap);
			}
			oPrivates.iLastRow = piRow;
			oPrivates.oLastRow = oRowMap;
		}
		
		//get the column
		var oCell = oRowMap.get(piCol);
		if (! oCell){
			if (!pbCreateCell) return null;
			oCell = new cCACell();
			oCell.data.set(cCAConsts.hash_values.row, piRow);
			oCell.data.set(cCAConsts.hash_values.col, piCol);
			oRowMap.set(piCol, oCell);
		}
		
		return oCell;
	}

	//#######################################################################
	//# privates
	//#######################################################################
	pr__link_cell (poCell, piNeigh, piRow, piCol){
		var ir, ic;
		ir=piRow;
		if (ir<1) ir= this.rows;
		if (ir>this.rows) ir=1;
		
		ic=piCol;
		if (ic<1) ic= this.cols;
		if (ic>this.cols) ic=1;
		
		var oNeigh = this.getCell(ir,ic,false);
		poCell.setNeighbour(piNeigh,oNeigh);		
	}
	
}