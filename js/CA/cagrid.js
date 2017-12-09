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
	this.init = function(piInitType){
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
		bean.fire(this,"done");
	};
	
	//****************************************************************
	this.link_cells = function(piNeighbourType){
		
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