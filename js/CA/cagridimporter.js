'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/**
 * produced when the cCAGrid is exported
 * @class cCAGridExported
 */
class cCAGridExported {
	version = 1
	grid = {
		rows: 0,
		cols: 0,
		data: null
	}

	/** @type {cCARule}	 */ rule = null

	/**
	 *
	 * @static
	 * @param {*} poObj
	 * @returns {boolean}
	 */
	static is_valid_obj (poObj) {
		if (!poObj.version)
			throw new Error('no version')

		if (!poObj.grid)
			throw new Error('no grid')

		if (!poObj.rule)
			throw new Error('no Rule')

		if (poObj.version !== 1)
			throw new Error('incompatible version')

		return true
	}
}

//* ************************************************************************
class cCAGridBase64Exporter {
	static get_grid_base64 (poGrid) {
		if (!cCommon.obj_is(
			poGrid,
			'cCAGrid'
		))
			throw new eCAException('param 1 is not cCAGrid')

		const oRule = poGrid.get_rule()
		if (oRule.stateRules.length > 1)
			throw new eCAException('rules can only have 1 state')

		const sBin = cCAGridBinaryExporter.get_grid_binary(poGrid)
		const s64 = cSimpleBase64.toBase64(sBin)
		return s64
	}
}

//* ************************************************************************
/**
 * exports a cCAGrid as a bitstream
 * see: https://github.com/KonradKiss/JSBitStream
 * see: https://cdn.jsdelivr.net/npm/jsbitstream/jsbitstream.js
 *
 * @param {cCAGrid} poGrid
 * @returns {jsbitstream}
 */
class cCAGridBitStreamExporter {
	/**
	 *
	 * @param {*} poGrid
	 * @returns {jsbitstream}
	 */
	static get_grid_bitstream (poGrid) {
		if (!cCommon.obj_is(
			poGrid,
			'cCAGrid'
		))
			throw new eCAException('param 1 is not cCAGrid')

		const oRule = poGrid.get_rule()
		if (oRule.stateRules.length > 1)
			throw new eCAException('rules can only have 1 state')

		const oStream = new jsbitstream()

		for (let iRow = 1; iRow <= poGrid.rows; iRow++)
			for (let iCol = 1; iCol <= poGrid.cols; iCol++) {
				const oCell = poGrid.getCell(
					iRow,
					iCol,
					true
				)
				oStream.writeFlag(oCell.value !== 0)
			}

		if (oStream.size() !== poGrid.rows * poGrid.cols)
			throw new eCAException('bitstream length does not match grid size')

		return oStream
	}
}

//* ************************************************************************
/**
 * a simple exporter that creates a binary string of the grid data
 * TODO: this is not efficient, but it is simple and works for now
 * TODO: in future convert to a bit array
 */
class cCAGridBinaryExporter {
	//* ************************************************************************
	static get_grid_binary (poGrid) {
		if (!cCommon.obj_is(
			poGrid,
			'cCAGrid'
		))
			throw new eCAException('param 1 is not cCAGrid')

		const oRule = poGrid.get_rule()
		if (oRule.stateRules.length > 1)
			throw new eCAException('rules can only have 1 state')

		let sBin = ''

		for (let iRow = 1; iRow <= poGrid.rows; iRow++)
			for (let iCol = 1; iCol <= poGrid.cols; iCol++) {
				const oCell = poGrid.getCell(
					iRow,
					iCol,
					true
				)
				sBin = sBin + oCell.value
			}

		const iBinLength = poGrid.rows * poGrid.cols
		if (sBin.length !== iBinLength)
			throw new eCAException('wrong binary length')

		return sBin
	}
}

//* ************************************************************************
/**
 * exports a cCAGrid as  JSON
 * @class cCAGridJSONExporter
 */

class cCAGridJSONExporter {
	/**
	 *
	 * @static
	 * @param {cCAGrid} poGrid
	 * @returns {cCAGridExported}
	 */
	static export (poGrid) {
		cDebug.enter()
		if (!cCommon.obj_is(
			poGrid,
			'cCAGrid'
		))
			throw new eCAException('param 1 is not cCAGrid')

		const oRule = poGrid.get_rule() /** @type {cCARule} */

		if (!oRule)
			throw new eCAException('no rule set!')

		const oExport = new cCAGridExported()
		{
			const oRuleExport = cCARuleObjExporter.export(oRule) /** @type {cCAExportedRule} */
			// @ts-expect-error
			oExport.rule = oRuleExport

			// get the status of the cells from the grid
			oExport.grid.rows = poGrid.rows
			oExport.grid.cols = poGrid.cols
			oExport.grid.data = cCAGridBase64Exporter.get_grid_base64(poGrid)
		}

		cDebug.leave()
		return oExport
	}

	//* ************************************************************************
	/**
	 *
	 * @static
	 * @param {cCAGrid} poGrid
	 * @returns {string}
	 */
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/**
 * imports a cCAGrid from JSON
 */

class cCAGridJSONImporter {
	//* ********************************************
	/**
	 *
	 * @static
	 * @param {string} psName
	 * @param {JSON} poJson
	 * @returns {cCAGrid}
	 */
	static populate (psName, poJson) {
		if (!cCAGridExported.is_valid_obj(poJson))
			throw new eCAException('invalid object')

		// -------------------------------------------------------------------
		const oGrid = new cCAGrid(/** @type {cCAGrid}	 */
			psName,					// @ts-expect-error
			poJson.grid.rows,		// @ts-expect-error
			poJson.grid.cols
		)

		// -------------------------------------------------------------------
		// 	@ts-expect-error
		const oRule = cCARuleObjImporter.makeRule(poJson.rule) 		/** @type {cCARule}	 */
		oGrid.set_rule(
			oRule,
			false
		)

		// -------------------------------------------------------------------
		oGrid.create_cells()
		const iBinLength = oGrid.rows * oGrid.cols
		// @ts-expect-error
		const s64 = poJson.grid.data
		const sBin = cSimpleBase64.toBinary(
			s64,
			iBinLength
		) // convert base64 to binary - have to set expected bin length
		let iIndex = 0

		for (let iRow = 1; iRow <= oGrid.rows; iRow++)
			for (let iCol = 1; iCol <= oGrid.cols; iCol++) {
				const sBinDigit = sBin[iIndex]
				oGrid.setCellValue(
					iRow,
					iCol,
					parseInt(sBinDigit)
				)
				iIndex++
			}

		return oGrid
	}
}
