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
//# cScramblerOp
//#######################################################################################
class cScramblerOp {
	data = null /** @type {cCAScramblerData} */
	params = null /** @type {Map} */
	basename = null /** @type {string} */
	/**
	 *
	 * @param {cCAScramblerData} poData
	 * @param {Map} poParams
	 */
	constructor (psBaseName, poData, poParams){
		this.data = poData
		this.params = poParams
		this.basename = psBaseName
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
		cCAScramblerUtils.throw_error(
			this.basename,
			"run method must be overridden for this operation"
		)
	}
}

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
	static mappings = new Map() /** @type {Map<number, typeof cScramblerOp>} */

	static init(){
		this.mappings = new Map ([
			[cOpConsts.LINE_OP, cScramblerLineOp],
			[cOpConsts.TRANSLATE_OP, cScramblerTranslateOp]
		])
	}

	/**
	 *
	 * @param {number} piOpcode
	 * @returns {typeof cScramblerOp}
	 */
	static get(piOpcode){
		var oRunner = this.mappings.get(piOpcode)
		if (oRunner == null)
			cDebug.write("DEBUG: unknown operation for opcode " + piOpcode)
		return oRunner
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
		if (!paOps){
			cCAScramblerUtils.throw_error(
				this._base_name,
				"operations must be provided"
			)
			return
		}

		if (!Array.isArray(paOps)){
			cCAScramblerUtils.throw_error(
				this._base_name,
				"operations must be an array"
			)
			return
		}

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

		//get the runner class
		var oRunnerClass = cScramblerOpMappings.get(oOp.opcode)	/** @type {typeof cScramblerOp} */
		if (oRunnerClass == null){
			cDebug.write("DEBUG: skipping unknown operation " + oOp.opcode)
			//cCAScramblerUtils.throw_error(this._base_name, "unknown operation code: " + oOp.opcode)
			this._run_next_op()
			return
		}

		// instantiate the operation
		var oRunner = new oRunnerClass(
			this._base_name,
			this._data,
			oOp.params
		)

		if (!(oRunner instanceof cScramblerOp) )
			cCAScramblerUtils.throw_error(
				this._base_name,
				"invalid operation for " + oRunner
			)

		//perform the runner
		var aChanged_cells /**@type {Array<cChangedCell>} */
		try{
			aChanged_cells = oRunner.run()
		} catch (e){
			cDebug.write( e.message)
		}

		//----check changed cells
		if (!aChanged_cells){
			cDebug.write("DEBUG: skipping nochanged cells")
			//cCAScramblerUtils.throw_error(this._base_name, "no changed cells found")
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

}

cScramblerOpMappings.init()