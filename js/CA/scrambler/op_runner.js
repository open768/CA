"use strict"

/**************************************************************************
This work is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.
To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/

Any Cryptography concepts demonstrated in this code are covered by the UK Govt Open General Export License for Cryptographic development
(see https://www.gov.uk/government/publications/open-general-export-licence-cryptographic-development)
and is not intended for any dual use as defined by the UK government license.
You the consumer of this code are solely and entirely responsible for importing this code into your own country..

**************************************************************************/

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
			throw new eCAScramblerException("operations must be provided")

		if (!Array.isArray(paOps))
			throw new eCAScramblerException("operations must be an array")

		this._operations = paOps
		this._run_next_op()
	}

	//** ******************************************************************
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

		//perform the operation and build list of changed cells
		switch (oOp.opcode) {
			case cOpConsts.LINE_OP:
				this._op_line(oOp)
				break

			case cOpConsts.TRANSLATE_OP:
				this._op_translate(oOp)
				break

			case cOpConsts.SQUARE_OP:
				this._op_square(oOp)
				break

			case cOpConsts.TRANSLATE_CELL_OP:
				this._op_translate_cell(oOp)
				break

			case cOpConsts.UNZIP_OP:
				// Handle UNZIP_OP
				this._op_unzip(oOp)
				break

			case cOpConsts.REFLECTION_OP:
				// Handle REFLECTION_OP
				this._op_reflection(oOp)
				break

			case cOpConsts.TRANSPOSE_OP:
				// Handle TRANSPOSE_OP
				this._op_transpose(oOp)
				break

			case cOpConsts.SKEW_OP:
				// Handle SKEW_OP
				this._op_skew(oOp)
				break

			default:
				throw new eCAScramblerException("unknown operation code: " + oOp.opcode)
		}

		//notify consumers of the completed operation, passing the changed cells
		cCAScramblerEvent.fire_event(
			this._base_name,
			cCAScramblerEvent.notify.operation_complete,
			this._changed_cells
		)
		//the next operation will be triggered by the consumer firing a notify_consumed_operation event
	}

	/** ******************************************************************
	 * @param {cTransformOp} poOp
	 */
	_get_standard_op_params(poOp){
		var iRowOrCol, iIndex, iDirection, iDistance
		iRowOrCol = poOp.params.get(cOpConsts.ROWCOL_PARAM		)
		iIndex = poOp.params.get(cOpConsts.INDEX_PARAM		)
		iDirection = poOp.params.get(cOpConsts.DIRECTION_PARAM	)
		iDistance = poOp.params.get(cOpConsts.DISTANCE_PARAM	)

		return [iRowOrCol, iIndex, iDirection, iDistance]
	}

	//********************************************************************
	//* OPerations
	//********************************************************************

	/** ******************************************************************
	 * @param {cTransformOp} poOp
	 * @returns {Array<cChangedCell>}
	 */
	_op_line(poOp){
		var [iRowOrCol, iIndex, iDirection, iDistance] = this._get_standard_op_params(poOp)
		var irow, icol, icount, icol_inc, irow_inc, irow_delta, icol_delta, irow_target, icol_target
		var aChanged_cells = []

		//set up the params for the loop based on whether this is a row or column operation and the direction
		if (iRowOrCol == cOpConsts.ROW_VALUE){
			icount = this._data.cols
			irow_inc = 0
			icol = 0
			irow = iIndex
			icol_inc = 1
			irow_delta = 0
			icol_delta = (iDirection == cOpConsts.ROW_LEFT_VALUE?-iDistance:iDistance)
		}else{
			icount = this._data.rows
			icol = iIndex
			irow = 0
			icol_inc = 0
			irow_inc = 1
			irow_delta = (iDirection == cOpConsts.COL_UP_VALUE?-iDistance:iDistance)
			icol_delta = 0
		}

		//run the loop to get the changed cells - they will be applied to the data by the caller
		var ivalue
		while (icount--){
			//---- get the value from the current
			ivalue = this._data.get(
				irow,
				icol
			)

			// create a changed cell target
			irow_target = cCommon.get_wraparound_value(
				irow + irow_delta,
				this._data.rows -1,
				0
			)
			icol_target = cCommon.get_wraparound_value(
				icol + icol_delta,
				this._data.cols -1,
				0
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
					this._data.rows-1,
					0
				)

			if (icol_inc)
				icol = cCommon.get_wraparound_value(
					icol+ icol_inc,
					this._data.cols-1,
					0
				)

		}

		return aChanged_cells

	}

	/** ******************************************************************
	 * @param {cTransformOp} poOp
	 */
	_op_translate(poOp){
		cDebug.write("translate op not implemented yet")
	}

	/** ******************************************************************
	 * @param {cTransformOp} poOp
	 */
	_op_square(poOp){
		cDebug.write("square op not implemented yet")
	}

	/** ******************************************************************
	 * @param {cTransformOp} poOp
	 */
	_op_translate_cell(poOp){
		cDebug.write("translate cell op not implemented yet")
	}

	/** ******************************************************************
	 * @param {cTransformOp} poOp
	 */
	_op_unzip(poOp){
		cDebug.write("translate op not implemented yet")
	}

	/** ******************************************************************
	 * @param {cTransformOp} poOp
	 */
	_op_reflection(poOp){
		cDebug.write("translate op not implemented yet")
	}

	/** ******************************************************************
	 * @param {cTransformOp} poOp
	 */
	_op_transpose(poOp){
		cDebug.write("translate op not implemented yet")
	}

	/** ******************************************************************
	 * @param {cTransformOp} poOp
	 */
	_op_skew(poOp){
		cDebug.write("translate op not implemented yet")
	}

}