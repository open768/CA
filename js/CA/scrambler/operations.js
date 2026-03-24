"use strict"

/**************************************************************************
This work is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.
To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/

For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk

USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cScramblerXOROp extends cScramblerOp{
	_grid = null /** @type {cCAGrid} */

	/**
	 *
	 * @param {string} psBaseName
	 * @param {cCAScramblerData} poData
	 * @param {cCAGrid} poGrid
	 */
	constructor(psBaseName, poData, poGrid){
		super(
			psBaseName,
			poData,
			null
		)
		this._grid = poGrid

		if (poData.rows != poGrid.rows || poData.cols != poGrid.cols)
			cCAScramblerUtils.throw_error(
				this.basename,
				"data and grid size mismatch"
			)
	}

	do_xor(){
		//for each row and col, update ther data value with the xor of the data value and the grid value
		var irow, icol, iData_value, iGrid_value, iXor_value
		for ( irow = 1; irow <= this.data.rows; irow++)
			for ( icol = 1; icol <= this.data.cols; icol++){
				iData_value = this.data.get(
					irow,
					icol
				)
				iGrid_value = this._grid.getCellValue(
					irow,
					icol
				)
				iXor_value = iData_value ^ iGrid_value
				this.data.set(
					irow,
					icol,
					iXor_value
				)
			}
	}
}

//#######################################################################################
class cScramblerLineOp extends cScramblerOp {
	run(){
		var [iRowOrCol, iIndex, iDirection, iDistance] = this._get_standard_op_params()
		var irow, icol, icount, icol_inc, irow_inc, irow_delta, icol_delta, irow_target, icol_target
		var aChanged_cells = []

		//set up the params for the loop based on whether this is a row or column operation and the direction
		if (iRowOrCol == cOpConsts.ROW_VALUE){
			icount = this.data.cols
			irow_inc = 0
			icol = cOpConsts.MIN_INDEX_VALUE
			irow = iIndex
			icol_inc = 1
			irow_delta = 0
			icol_delta = (iDirection == cOpConsts.ROW_LEFT_VALUE?-iDistance:iDistance)
		}else{
			icount = this.data.rows
			icol = iIndex
			irow = cOpConsts.MIN_INDEX_VALUE
			icol_inc = 0
			irow_inc = 1
			irow_delta = (iDirection == cOpConsts.COL_UP_VALUE?-iDistance:iDistance)
			icol_delta = 0
		}

		//run the loop to get the changed cells - they will be applied to the data by the caller
		var ivalue
		while (icount--){
			//---- get the value from the current
			ivalue = this.data.get(
				irow,
				icol
			)
			if (ivalue == null)
				cCAScramblerUtils.throw_error(
					this.basename,
					"found a null value"
				)

			// create a changed cell
			irow_target = cCommon.get_wraparound_value(
				irow + irow_delta,
				cOpConsts.MIN_INDEX_VALUE,
				this.data.rows
			)
			icol_target = cCommon.get_wraparound_value(
				icol + icol_delta,
				cOpConsts.MIN_INDEX_VALUE,
				this.data.cols
			)

			aChanged_cells.push(new cChangedCell(
				irow_target,
				icol_target,
				ivalue
			))

			//---- next row_col
			if (irow_inc)
				irow = cCommon.get_wraparound_value(
					irow+ irow_inc,
					cOpConsts.MIN_INDEX_VALUE,
					this.data.rows
				)

			if (icol_inc)
				icol = cCommon.get_wraparound_value(
					icol+ icol_inc,
					cOpConsts.MIN_INDEX_VALUE,
					this.data.cols
				)

		}

		return aChanged_cells
	}

}
cScramblerOpMappings.add_mapping(
	cOpConsts.LINE_OP,
	cScramblerLineOp
)

//#######################################################################################
class cScramblerSwapOp extends cScramblerOp {
	run(){
		var iRow1,iCol1, iRow2, iCol2
		var oParams = this.params
		iRow1 = oParams.get(cOpConsts.ROW_PARAM)
		iCol1 = oParams.get(cOpConsts.COL_PARAM)
		iRow2 = oParams.get(cOpConsts.ROW2_PARAM)
		iCol2 = oParams.get(cOpConsts.COL2_PARAM)

		var ivalue1 = this.data.get(
			iRow1,
			iCol1
		)
		var ivalue2 = this.data.get(
			iRow2,
			iCol2
		)
		var oCell1 = new cChangedCell(
			iRow1,
			iCol1,
			ivalue2
		)
		var oCell2 = new cChangedCell(
			iRow2,
			iCol2,
			ivalue1
		)

		var aChangedCells = [oCell1, oCell2]
		return aChangedCells
	}
}
cScramblerOpMappings.add_mapping(
	cOpConsts.SWAP_OP,
	cScramblerSwapOp
)

//#######################################################################################
