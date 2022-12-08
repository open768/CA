"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/



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
		if ( !poGrid.rule ) throw new CAException("no rule set!");
		
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

		var iBinLength = poGrid.rows * poGrid.cols;
		if (sBin.length !== iBinLength)
			throw new CAException("wrong binary length");
			
		var s64 = cCASimpleBase64.toBase64(sBin);
			
		return s64;
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAGridJSONImporter{
	//*********************************************
	static populate(psName, poJson){
		if (!cCAGridExported.is_valid_obj(poJson)) throw new CAException("invalid object")
		//-------------------------------------------------------------------
		var oGrid = new cCAGrid(psName, poJson.grid.rows, poJson.grid.cols);

		//-------------------------------------------------------------------
		var oRule = cCARuleObjImporter.makeRule(poJson.rule);
		oGrid.rule = oRule;
		
		//-------------------------------------------------------------------
		oGrid.create_cells();		
		var s64 = poJson.grid.data;
		var iBinLength = oGrid.rows * oGrid.cols;
		var sBin = cCASimpleBase64.toBinary(s64, iBinLength); //have to set expected bin length
		var iIndex = 0;
		
		for (var iRow=1; iRow <= oGrid.rows; iRow++)
			for (var iCol=1; iCol <= oGrid.cols; iCol++){
				var sBinDigit = sBin[iIndex];
				oGrid.setCellValue(iRow,iCol,parseInt(sBinDigit));
				iIndex++;
			}
		return oGrid;
	}
}