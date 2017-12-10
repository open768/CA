/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
var cCAGrid = function(piRows, piCols){
	this.rows = piRows;
	this.cols = piCols;
	this.rule = null;
	this.celldata = new Map();
	this.changed_count = 0;
	this.non_zero = 0;
	this.iLastRow = -1;
	this.oLastRow = null;
	
	//****************************************************************
	this.action = function(piAction){
		cDebug.write("running action " + piAction);
	},
	//****************************************************************
	this.init = function(piInitType){
		cDebug.write("initialising " + piInitType);
		switch(piInitType){
			case cCAConsts.init_values.blank:
				for (var ir=1; ir<= this.rows; ir++)
					for (var ic=1; ic<= this.cols; ic++){
						var oCell = this.getCell(ir,ic,true);
						oCell.value = 0;
					}
				this.non_zero = 0;
				break;
				
			//--------------------------------------------------------
			case cCAConsts.init_values.block:
				this.init(cCAConsts.init_values.blank);
				var iMidC = Math.floor( this.cols/2);
				var iMidR = Math.floor( this.rows/2);
				for (var ic=iMidC; ic<= iMidC+1; ic++)
					for (var ir=iMidR; ir<= iMidR+1; ir++){
						var oCell = this.getCell(ir,ic,true);
						oCell.value = 1;
					}
				this.non_zero = 4;
				this.changed_count = 4;
				break;
				
			//--------------------------------------------------------
			case cCAConsts.init_values.random:
				for (var ir=1; ir<= this.rows; ir++)
					for (var ic=1; ic<= this.cols; ic++){
						var oCell = this.getCell(ir,ic,true);
						var iRnd = Math.round(Math.random());
						oCell.value = iRnd;
						this.non_zero += iRnd;
					}
				this.changed_count = this.non_zero;
				break;
			//--------------------------------------------------------
			default:
				throw new CAException("unknown init_type: " + piInitType);
		}
		cDebug.write("completed initialising "+ piInitType);
		bean.fire(this,"done");
	};
	
	//****************************************************************
	this.link_cells = function(piNeighbourType){
		cDebug.write("linking cells");
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic,false);
				this.pr__link_cell(oCell,cCAConsts.neighbours.north, ir-1, ic);
				this.pr__link_cell(oCell,cCAConsts.neighbours.east, ir, ic+1);
				this.pr__link_cell(oCell,cCAConsts.neighbours.south, ir+1, ic);
				this.pr__link_cell(oCell,cCAConsts.neighbours.west, ir, ic-1);
				if (piNeighbourType == cCAConsts.eightway){
					this.pr__link_cell(oCell,cCAConsts.neighbours.northeast, ir-1, ic+1);
					this.pr__link_cell(oCell,cCAConsts.neighbours.southeast, ir+1, ic+1);
					this.pr__link_cell(oCell,cCAConsts.neighbours.southwest, ir+1, ic-1);
					this.pr__link_cell(oCell,cCAConsts.neighbours.northwest, ir-1, ic-1);
				}
			}
		cDebug.write("completed cell linking");
	};
	
	this.pr__link_cell = function(poCell, piNeigh, piRow, piCol){
		var ir, ic;
		ir=piRow;
		if (ir<1) ir= this.rows;
		if (ir>this.rows) ir=1;
		
		ic=piCol;
		if (ic<1) ic= this.cols;
		if (ic>this.cols) ic=1;
		
		var oCell = this.getCell(ir,ic,false);
		if (oCell == null)	throw new CAException("unable to link cell");
		poCell.data.set(piNeigh,oCell);		
	};
	
	//****************************************************************
	// use a sparse array for the grid
	// but this causes a problem with neighbours that might not be there
	this.getCell = function(piRow,piCol,pbCreateCell){
		var oHash = this.celldata;
		
		//get the row
		var oRowMap;
		if (this.iLastRow == piRow){
			oRowMap = this.oLastRow;
		}else{
			oRowMap = oHash.get(piRow);
			if (!oRowMap){
				if (!pbCreateCell) return null;
				oRowMap = new Map();
				oHash.set(piRow,oRowMap);
			}
			this.iLastRow = piRow;
			this.oLastRow = oRowMap;
		}
		
		//get the column
		var oCell = oRowMap.get(piCol);
		if (! oCell){
			if (!pbCreateCell) return null;
			oCell = new cCACell();
			oRowMap.set(piCol, oCell);
		}
		
		return oCell;
	};
}