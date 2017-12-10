/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
var cCAGrid = function(piRows, piCols){
	//#######################################################################
	//# instance variables
	//#######################################################################
	this.rows = piRows;
	this.cols = piCols;
	this.rule = null;
	this.changed_count = 0;
	this.non_zero_count = 0;
	
	this.privates = {
		iLastRow : -1,
		oLastRow :null,
		cell_data:new Map(),
		changed_cells: null
	};
	
	//#######################################################################
	//# methods
	//#######################################################################
	this.action = function(piAction){
		if (this.rule == null) throw new CAException("no rule set");
		
		cDebug.write("running action: " + piAction);
		switch (piAction){
			case cCAConsts.action_types.step:
				this.step();
				break;
			default:
				throw new CAException("action not recognised: " + piAction);
		}
		cDebug.write("done action: " + piAction);
	},
	
	//****************************************************************
	this.step = function(){
		var oPrivates = this.privates;
		var oRule = this.rule;
		oPrivates.changed_cells = [];
		this.changed_count = 0;
		this.non_zero_count = 0;
		
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic,true);
				if (oCell.rule == null) oCell.rule = this.rule;
				oCell.apply_rule();
			}
	};
	
	//****************************************************************
	this.init = function(piInitType){
		cDebug.write("initialising grid:" + piInitType);
		switch(piInitType){
			case cCAConsts.init_values.blank:
				for (var ir=1; ir<= this.rows; ir++)
					for (var ic=1; ic<= this.cols; ic++){
						var oCell = this.getCell(ir,ic,true);
						oCell.value = 0;
					}
				this.non_zero_count = 0;
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
				this.non_zero_count = 4;
				this.changed_count = 4;
				break;
				
			//--------------------------------------------------------
			case cCAConsts.init_values.random:
				for (var ir=1; ir<= this.rows; ir++)
					for (var ic=1; ic<= this.cols; ic++){
						var oCell = this.getCell(ir,ic,true);
						var iRnd = Math.round(Math.random());
						oCell.value = iRnd;
						this.non_zero_count += iRnd;
					}
				this.changed_count = this.non_zero_count;
				break;
			//--------------------------------------------------------
			default:
				throw new CAException("unknown init_type: " + piInitType);
		}
		cDebug.write("done init grid: "+ piInitType);
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
	
	//****************************************************************
	// use a sparse array for the grid
	// but this causes a problem with neighbours that might not be there
	this.getCell = function(piRow,piCol,pbCreateCell){
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
			oCell.data.set("R", piRow);
			oCell.data.set("C", piCol);
			oRowMap.set(piCol, oCell);
		}
		
		return oCell;
	};

	//#######################################################################
	//# privates
	//#######################################################################
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
	
}