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
	this.data = new Map();
	
	this.randomise = function(){
		for (var ir=1; ir<= this.rows; ir++){
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic);
				var iRnd = Math.round(Math.random());
				oCell.value = iRnd;
			}
		}
		bean.fire(this,"done");
	};
	
	//****************************************************************
	this.getCell = function(piRow,piCol){
		var oHash = this.data;
		
		//get the row
		var oRowMap = oHash.get(piRow);
		if (!oRowMap){
			oRowMap = new Map();
			oHash.set(piRow,oRowMap);
		}
		
		//get the column
		var oCell = oRowMap.get(piCol);
		if (! oCell){
			oCell = new cCACell();
			oRowMap.set(piCol, oCell);
		}
		
		return oCell;
	};
}