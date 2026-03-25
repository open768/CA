"use strict"

/**************************************************************************
This work is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.
To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/

For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk

USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cDataXorOp extends cDataOp{
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
class cDataLineOp extends cDataOp {
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
	cDataLineOp
)

//#######################################################################################
class cDataSwapOp extends cDataOp {
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
	cDataSwapOp
)

//#######################################################################################
//#######################################################################################
/**
 * this operation rotates the cells on the perimeter of a square - the square can be any size and the cells do not have to be contiguous.
 * The mapping is not regular - as the cells are interleaved from the source data into the square
 * */
class cDataSquareOp extends cDataOp {
	run(){
		/* eslint-disable @stylistic/function-call-argument-newline */

		//-----------------------------get the parameters
		{
			//get the square offset

			var oOffset = new cCellIndex()
			{
				oOffset.row = this._get_param_value(cOpConsts.ROW_PARAM, cOpConsts.MIN_INDEX_VALUE, this.data.rows)
				oOffset.col = this._get_param_value(cOpConsts.COL_PARAM, cOpConsts.MIN_INDEX_VALUE, this.data.cols)
			}

			//get the square size
			var iMax_size = Math.min(this.data.rows, this.data.cols)
			var iSide_size = this._get_param_value(cOpConsts.SIZE_PARAM, cCAScramblerTypes.MIN_SQUARE_SIDE, iMax_size)

			//get the distance to move the cells in the square
			var iDistance = this._get_param_value(cOpConsts.DISTANCE_PARAM, cOpConsts.MIN_INDEX_VALUE, iSide_size*3)
		}

		//-------build the array of cells that  make up the square - it doesnt matter if the cells are contiguous
		{
			var aSqCells = [] /** @type {Array<cCellIndex>} */
			var oTop, oLeft, oBottom, oRight
			oBottom = this._bounded_cell_index(oOffset.row , oOffset.col)
			oRight = this._bounded_cell_index(oOffset.row , oOffset.col + iSide_size-1)
			oTop = this._bounded_cell_index(oOffset.row + iSide_size-1, oOffset.col + iSide_size-1)
			oLeft = this._bounded_cell_index(oOffset.row + iSide_size-1, oOffset.col )

			for (var iInc = 0; iInc < iSide_size - 1; iInc++){
				//create cell indexes for all 4 sides of the square -
				var oBottomNew = this._bounded_cell_index(oBottom.row , oBottom.col + iInc )
				var oRightNew = this._bounded_cell_index(oRight.row + iInc, oRight.col )
				var oTopNew = this._bounded_cell_index(oTop.row , oTop.col - iInc)
				var oLeftNew = this._bounded_cell_index(oLeft.row - iInc, oLeft.col )

				aSqCells.push (oBottomNew, oRightNew, oTopNew, oLeftNew	)
			}
		}

		//-------create the transforms
		var aTransforms = []
		for (var iSrcIndex = 0; iSrcIndex < aSqCells.length; iSrcIndex++){
			var iTargetIndex = cCommon.get_wraparound_value(iSrcIndex + iDistance, 0, aSqCells.length-1)
			var oTransform = new cCellTransform(aSqCells[iSrcIndex], aSqCells[iTargetIndex])
			aTransforms.push(oTransform)
		}

		/* eslint-enable @stylistic/function-call-argument-newline */
		return aTransforms
	}
}
cScramblerOpMappings.add_mapping(
	cOpConsts.SQUARE_OP,
	cDataSquareOp
)
