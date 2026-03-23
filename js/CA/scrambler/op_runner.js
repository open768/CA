"use strict"

/**************************************************************************
This work is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.
To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/

Any Cryptography concepts demonstrated in this code are covered by the UK Govt Open General Export License for Cryptographic development
(see https://www.gov.uk/government/publications/open-general-export-licence-cryptographic-development)
and is not intended for any dual use as defined by the UK government license.
You the consumer of this code are solely and entirely responsible for importing this code into your own country..

**************************************************************************/

//#######################################################################################
class cScramblerXOROp{
	_data = null /** @type {cCAScramblerData} */
	_grid = null /** @type {cCAGrid} */

	/**
	 *
	 * @param {cCAScramblerData} poData
	 * @param {cCAGrid} poGrid
	 */
	constructor(poData, poGrid){
		this._data = poData
		this._grid = poGrid

		if (poData.rows != poGrid.rows || poData.cols != poGrid.cols)
			throw new eCAScramblerException("data and grid size mismatch")
	}

	do_xor(){
		//for each row and col, update ther data value with the xor of the data value and the grid value
		var irow, icol, iData_value, iGrid_value, iXor_value
		for ( irow = 1; irow <= this._data.rows; irow++)
			for ( icol = 1; icol <= this._data.cols; icol++){
				iData_value = this._data.get(
					irow,
					icol
				)
				iGrid_value = this._grid.get(
					irow,
					icol
				)
				iXor_value = iData_value ^ iGrid_value
				this._data.set(
					irow,
					icol,
					iXor_value
				)
			}
	}
}

//#######################################################################################
//# cScramblerOp
//#######################################################################################
class cScramblerOp {
	data = null /** @type {cCAScramblerData} */
	params = null /** @type {Map} */
	/**
	 *
	 * @param {cCAScramblerData} poData
	 * @param {Map} poParams
	 */
	constructor (poData, poParams){
		this.data = poData
		this.params = poParams
	}

	_get_standard_op_params(){
		var iRowOrCol, iIndex, iDirection, iDistance
		var oParams = this.params

		iRowOrCol = oParams.get(cOpConsts.ROWCOL_PARAM		)
		iIndex = oParams.get(cOpConsts.INDEX_PARAM		)
		iIndex = cCommon.get_wraparound_value(
			iIndex,
			this.data.rows -1,
			0
		)
		iDirection = oParams.get(cOpConsts.DIRECTION_PARAM	)
		iDistance = oParams.get(cOpConsts.DISTANCE_PARAM	)
		iDistance = cCommon.get_wraparound_value(
			iDistance,
			this.data.rows-1,
			0
		)

		return [iRowOrCol, iIndex, iDirection, iDistance]
	}

	/**
	 * this is an abstract method
	 * @abstract
	 * @returns {Array<cChangedCell>}
	 */
	run( ){
		throw new eCAScramblerException("run method must be overridden for this operation")
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
				cDebug.error("found a null value")

			// create a changed cell
			irow_target = cCommon.get_wraparound_value(
				irow + irow_delta,
				this.data.rows,
				cOpConsts.MIN_INDEX_VALUE
			)
			icol_target = cCommon.get_wraparound_value(
				icol + icol_delta,
				this.data.cols,
				cOpConsts.MIN_INDEX_VALUE
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
					this.data.rows,
					cOpConsts.MIN_INDEX_VALUE
				)

			if (icol_inc)
				icol = cCommon.get_wraparound_value(
					icol+ icol_inc,
					this.data.cols,
					cOpConsts.MIN_INDEX_VALUE
				)

		}

		return aChanged_cells
	}

}

//#######################################################################################
class cScramblerTranslateOp extends cScramblerOp {
	run(){
		return []
	}
}

//#######################################################################################
//#######################################################################################
class cScramblerOpMappings extends cStaticClass{
	static mappings = new Map() /** @type {Map<number, cScramblerOp>} */

	static init(){
		this.mappings.set (
			[
				[cOpConsts.LINE_OP,
					cScramblerLineOp],
				[cOpConsts.TRANSLATE_OP,
					cScramblerTranslateOp]
			]
		)
	}
}

//#######################################################################################
class cScramblerOpRunner extends cEventSubscriber{
	_base_name = null
	_data = null /** @type {cCAScramblerData} */
	_operations = null
	_changed_cells = []

	/**
	 *
	 * @param {string} psBaseName
	 * @param {cCAScramblerData} poData
	 */
	constructor(psBaseName, poData){
		super()
		this._base_name = psBaseName
		this._data = poData
		this._operations = null
	}

	/** ******************************************************************
	 *
	 * @param {Array<cTransformOp>} paOps
	 */
	async run_ops(paOps){
		if (!paOps)
			this.throw_error("operations must be provided")

		if (!Array.isArray(paOps))
			this.throw_error("operations must be an array")

		this._operations = paOps
		this._run_next_op()
	}

	//********************************************************************
	async _run_next_op(){
		//------- check if finished
		if (this._operations.length == 0){
			cDebug.write("all operations completed")
			cCAScramblerEvent.fire_event(
				this._base_name,
				cCAScramblerEvent.notify.scrambling_complete,
			)
			return
		}

		//get the next operation to perform
		this._changed_cells = []
		/** @type {cTransformOp} */ var oOp = this._operations.pop()

		//get the runner
		var oRunner = cScramblerOpMappings.mappings.get(oOp.opcode)	/** @type {cScramblerOp} */
		if (oRunner == null){
			cDebug.write("DEBUG: skipping unknown operation " + oOp.opcode)
			//this.throw_error("unknown operation code: " + oOp.opcode)
			this._run_next_op()
			return
		}

		//perform the runner
		var aChanged_cells /**@type {Array<cChangedCell>} */
		aChanged_cells = oRunner.run()

		//----check changed cells
		if (!aChanged_cells){
			cDebug.write("DEBUG: skipping nochanged cells")
			//this.throw_error("no changed cells found")
			this._run_next_op()
			return
		}

		//----apply the changed cells
		this._data.set_multiple(aChanged_cells)

		//----notify consumers of the completed operation, passing the changed cells
		cCAScramblerEvent.fire_event(
			this._base_name,
			cCAScramblerEvent.notify.operation_complete,
			aChanged_cells
		)
		//the next operation will be triggered by the consumer firing a notify_operation_consumed event
	}

	throw_error(psMessage){
		cCAScramblerEvent.fire_event(
			this._base_name,
			cCAScramblerEvent.actions.error,
			psMessage
		)
		throw new eCAScramblerException(psMessage)
	}

}

cScramblerOpMappings.init()