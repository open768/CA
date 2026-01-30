"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/**
 * produced when the cCAGrid is exported
 *
 * @class cCAGridExported
 */
class cCAGridExported {
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {number}
	 */
	version = 1
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {{ rows: number; cols: number; data: any; }}
	 */
	grid = {
		rows: 0,
		cols: 0,
		data: null
	}
	
	/** @type {cCARule}	 */ rule = null 				

	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @param {*} poObj
	 * @returns {boolean}
	 */
	static is_valid_obj(poObj) {
		if (!poObj.version) throw new Error("no version")
		if (!poObj.grid) throw new Error("no grid")
		if (!poObj.rule) throw new Error("no Rule")
		if (poObj.version !== 1) throw new Error("incompatible version")
		return true
	}
}

//*************************************************************************
/**
 * exports a cCAGrid as  JSON
 *
 * @class cCAGridJSONExporter
 */
/* eslint-disable-next-line no-unused-vars */
class cCAGridJSONExporter {
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @param {cCAGrid} poGrid
	 * @returns {cCAGridExported}
	 */
	static export(poGrid) {
		cDebug.enter()
		if (!cCommon.obj_is(poGrid, "cCAGrid")) throw new CAException("param 1 is not cCAGrid")
		var oRule = poGrid.get_rule()

		if (!oRule) throw new CAException("no rule set!")

		var oObj = new cCAGridExported
		//get the rule from the grid
		oObj.rule = cCARuleObjExporter.export(oRule)

		//get the status of the cells from the grid
		oObj.grid.rows = poGrid.rows
		oObj.grid.cols = poGrid.cols

		//todo
		oObj.grid.data = this.get_grid_base64(poGrid)
		cDebug.leave()
		return oObj
	}

	//*************************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @param {cCAGrid} poGrid
	 * @returns {string}
	 */
	static get_grid_base64(poGrid) {
		if (!cCommon.obj_is(poGrid, "cCAGrid")) throw new CAException("param 1 is not cCAGrid")
		var oRule = poGrid.get_rule()
		if (oRule.stateRules.length > 1) throw new CAException("rules can only have 1 state")

		var sBin = ""
		/** @type {string}	 */var s64 = null

		for (var iRow = 1; iRow <= poGrid.rows; iRow++)
			for (var iCol = 1; iCol <= poGrid.cols; iCol++) {
				var oCell = poGrid.getCell(iRow, iCol, true)
				sBin = sBin + oCell.value
			}

		var iBinLength = poGrid.rows * poGrid.cols
		if (sBin.length !== iBinLength)
			throw new CAException("wrong binary length")

		s64 = cSimpleBase64.toBase64(sBin)
		return s64
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/**
 * imports a cCAGrid from JSON
 */
/* eslint-disable-next-line no-unused-vars */
class cCAGridJSONImporter {
	//*********************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @param {string} psName
	 * @param {JSON} poJson
	 * @returns {cCAGrid}
	 */
	static populate(psName, poJson) {
		if (!cCAGridExported.is_valid_obj(poJson)) throw new CAException("invalid object")
		//-------------------------------------------------------------------
		/** @type {cCAGrid}	 */ var oGrid = new cCAGrid(psName, poJson.grid.rows, poJson.grid.cols)

		//-------------------------------------------------------------------
		/** @type {cCARule}	 */ var oRule = cCARuleObjImporter.makeRule(poJson.rule)
		oGrid.set_rule(oRule, false)

		//-------------------------------------------------------------------
		oGrid.create_cells()
		var iBinLength = oGrid.rows * oGrid.cols
		var s64 = poJson.grid.data
		var sBin = cSimpleBase64.toBinary(s64, iBinLength) //convert base64 to binary - have to set expected bin length
		var iIndex = 0

		for (var iRow = 1; iRow <= oGrid.rows; iRow++)
			for (var iCol = 1; iCol <= oGrid.cols; iCol++) {
				var sBinDigit = sBin[iIndex]
				oGrid.setCellValue(iRow, iCol, parseInt(sBinDigit))
				iIndex++
			}
		return oGrid
	}
}