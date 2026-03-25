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
				/* eslint-disable @stylistic/function-call-argument-newline */

				iData_value = this.data.get(irow,icol)
				iGrid_value = this._grid.getCellValue(irow,icol)
				iXor_value = iData_value ^ iGrid_value
				this.data.set(irow,icol,iXor_value)

				/* eslint-enable @stylistic/function-call-argument-newline */
			}
	}
}

//#######################################################################################
class cScramblerLineOp extends cScramblerOp {
	run(){
		var [iRowOrCol, iIndex, iDirection, iDistance] = this._get_standard_op_params()
		var irow, icol, icount, icol_inc, irow_inc, irow_delta, icol_delta, irow_target, icol_target
		var aTransforms = []	/** @type {Array<cCellTransform>} */

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
			/* eslint-disable @stylistic/function-call-argument-newline */

			// create a changed cell
			irow_target = cCommon.get_wraparound_value(irow + irow_delta,cOpConsts.MIN_INDEX_VALUE,this.data.rows)
			icol_target = cCommon.get_wraparound_value(icol + icol_delta,cOpConsts.MIN_INDEX_VALUE,this.data.cols)
	
			var oTransform = new cCellTransform( new cCellIndex(irow, icol), new cCellIndex(irow_target, icol_target))
			aTransforms.push(oTransform)

			//---- next row_col
			if (irow_inc)
				irow = cCommon.get_wraparound_value(irow+ irow_inc,cOpConsts.MIN_INDEX_VALUE,this.data.rows)

			if (icol_inc)
				icol = cCommon.get_wraparound_value(icol+ icol_inc,cOpConsts.MIN_INDEX_VALUE,this.data.cols)

			/* eslint-enable @stylistic/function-call-argument-newline */
		}

		return aTransforms
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
		var aTransforms = []	/** @type {Array<cCellTransform>} */

		/* eslint-disable @stylistic/function-call-argument-newline */
		iRow1 = this._get_param_value(cOpConsts.ROW_PARAM, cOpConsts.MIN_INDEX_VALUE, this.data.rows)
		iCol1 = this._get_param_value(cOpConsts.COL_PARAM, cOpConsts.MIN_INDEX_VALUE, this.data.cols)
		iRow2 = this._get_param_value(cOpConsts.ROW2_PARAM, cOpConsts.MIN_INDEX_VALUE, this.data.rows)
		iCol2 = this._get_param_value(cOpConsts.COL2_PARAM, cOpConsts.MIN_INDEX_VALUE, this.data.cols)

		var oTransform = new cCellTransform( new cCellIndex(iRow1,iCol1), new cCellIndex(iRow2,iCol2))
		aTransforms.push(oTransform)
		oTransform = new cCellTransform( new cCellIndex(iRow2,iCol2), new cCellIndex(iRow1,iCol1))
		aTransforms.push(oTransform)

		/* eslint-enable @stylistic/function-call-argument-newline */

		return aTransforms
	}
}
cScramblerOpMappings.add_mapping(
	cOpConsts.SWAP_OP,
	cScramblerSwapOp
)

//#######################################################################################
//#######################################################################################
class cScramblerSquare extends cScramblerOp {
	run(){
		var aChangedCells = []
		var iRow, iCol, iDistance, iSquare_size, iMax_size
		/* eslint-disable @stylistic/function-call-argument-newline */

		//get the parameters
		iRow = this._get_param_value(cOpConsts.ROW_PARAM, cOpConsts.MIN_INDEX_VALUE, this.data.rows)
		iCol = this._get_param_value(cOpConsts.COL_PARAM, cOpConsts.MIN_INDEX_VALUE, this.data.cols)
		iDistance = this._get_param_value(cOpConsts.DISTANCE_PARAM, cOpConsts.MIN_INDEX_VALUE, this.data.rows)
		iMax_size = Math.min(this.data.rows, this.data.cols)
		iSquare_size = this._get_param_value(cOpConsts.SIZE_PARAM, cOpConsts.MIN_INDEX_VALUE, iMax_size) 

		//create an array representing the cell coordinates in the square, this will be used to shift the values around the square
		var aSquare_coords = []
		var iX = iCol, iY = iRow, iMax_col = iCol + iSquare_size -1
		for (var i=1; i<iSquare_size; i++){
			var iNewX = cCommon.get_wraparound_value(iX++, iCol, iMax_col),
			aSquare_coords.push( new cCoordinate(iY, iNewX))
		}

		var iMax_row = iRow + iSquare_size -1
		for (var i=1; i<iSquare_size; i++){
			var iNewY = cCommon.get_wraparound_value(iY++, iRow, iMax_col),
			aSquare_coords.push( new cCoordinate(iNewY, iX))
		}

		//shift the square coordinates by the distance in the required direction

		/* eslint-enable @stylistic/function-call-argument-newline */
		return aChangedCells
	}
}
cScramblerOpMappings.add_mapping(
	cOpConsts.SQUARE_OP,
	cScramblerSquare
)
