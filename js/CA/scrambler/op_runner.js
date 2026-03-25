"use strict"

/**************************************************************************
This work is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.
To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/

Any Cryptography concepts demonstrated in this code are covered by the UK Govt Open General Export License for Cryptographic development
(see https://www.gov.uk/government/publications/open-general-export-licence-cryptographic-development)
and is not intended for any dual use as defined by the UK government license.
You the consumer of this code are solely and entirely responsible for importing this code into your own country..

For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk

USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

**************************************************************************/

//#######################################################################################
//# cIndexTransformOp
//#######################################################################################
class cIndexTransformOp {
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
			cOpConsts.MIN_INDEX_VALUE,
			this.data.rows
		)
		iDirection = oParams.get(cOpConsts.DIRECTION_PARAM	)
		iDistance = oParams.get(cOpConsts.DISTANCE_PARAM	)
		iDistance = cCommon.get_wraparound_value(
			iDistance,
			cOpConsts.MIN_INDEX_VALUE,
			this.data.rows
		)

		return [iRowOrCol, iIndex, iDirection, iDistance]
	}

	_get_param_value(piParamID, piMin, piMax){
		var iValue = this.params.get(piParamID)
		iValue = cCommon.get_wraparound_value(
			iValue,
			piMin,
			piMax
		)
		return iValue
	}

	/**
	 *
	 * @param {number} piRow
	 * @param {number} piCol
	 * @returns {cCellIndex}
	 */
	_bounded_cell_index(piRow, piCol){
		var oIndex = new cCellIndex()
		oIndex.row = cCommon.get_wraparound_value(
			piRow,
			cOpConsts.MIN_INDEX_VALUE,
			this.data.rows
		)
		oIndex.col = cCommon.get_wraparound_value(
			piCol,
			cOpConsts.MIN_INDEX_VALUE,
			this.data.cols
		)
		return oIndex
	}

	/**
	 * this is an abstract method
	 * @abstract
	 * @returns {Array<cCellTransform>}
	 */
	run( ){
		cCAScramblerUtils.throw_error(
			this.basename,
			"run method must be overridden for this operation"
		)
	}
}

//#######################################################################################
//#######################################################################################
class cScramblerOpMappings extends cStaticClass{
	static _mappings = new Map() /** @type {Map<number, typeof cIndexTransformOp>} */

	static add_mapping(piOpcode, poExemplar){
		this._mappings.set(
			piOpcode,
			poExemplar
		)
	}

	/**
	 * returns the class exmemplar for the given opcode - this can then be instantiated by the caller
	 *
	 * @param {number} piOpcode
	 * @returns {function}
	 */
	static get(piOpcode) {
		if (this._mappings.size == 0)
			throw "cScramblerOpMappings not initialised"

		var oExemplar = this._mappings.get(piOpcode)
		if (oExemplar == null)
			cDebug.write("DEBUG: unknown operation for opcode " + piOpcode)
		else
			cDebug.write("DEBUG: found operation for opcode " + piOpcode + " : " + oExemplar.name)

		return oExemplar
	}
}

//#######################################################################################
class cScramblerCellTracker{
	_changed_cells = new Map() /** @type {Map<number, number>} */
	rows = null
	cols = null
	basename = null

	/**
	 *
	 * @param {string} psBasename
	 * @param {number} piRows
	 * @param {number} piCols
	 */
	constructor(psBasename, piRows, piCols){
		this.basename = psBasename
		this.rows = piRows
		this.cols = piCols
	}

	/**
	 *
	 * @param {cChangedCell} poChangedCell
	 */
	add_cell(poChangedCell){
		var map_index = poChangedCell.row + poChangedCell.col * cCAScramblerTypes.MAX_SCRAMBLER_INDEX

		this._changed_cells.set(
			map_index,
			1
		)
	}

	/**
	 * @param {Array<cChangedCell>} paChangedCells
	 * */
	add_cells(paChangedCells){
		paChangedCells.forEach( oCell => this.add_cell(oCell))
	}

	//*******************************************************************************
	check_coverage(){
		var iPct = (this._changed_cells.size / this.rows * this.cols) * 100

		if (iPct < cCAScramblerTypes.MIN_CHANGED_COVERAGE){
			var sPct = iPct.toFixed(1)
			cDebug.write("coverage of changed cells is too low: " + sPct + " - min is " + cCAScramblerTypes.MIN_CHANGED_COVERAGE)
			cCAScramblerUtils.throw_error(
				this.basename,
				"coverage of changed cells is too low: " + sPct
			)
		}
	}
}

//#######################################################################################
class cScramblerOpRunner extends cEventSubscriber{
	_base_name = null
	_data = null /** @type {cCAScramblerData} */
	_operations = null
	_tracker = null /** @type {cScramblerCellTracker} */
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
		cCAScramblerEvent.subscribe(
			psBaseName,
			[cCAScramblerEvent.notify.changes_consumed],
			poEvent=>this.onScramblerEvent(poEvent)
		)

	}

	//** ******************************************************************
	//* Events
	//** ******************************************************************
	async onScramblerEvent( poEvent ){
		switch (poEvent.action) {
			case cCAScramblerEvent.notify.changes_consumed:
				cDebug.write("operation consumed event received, running next operation")
				this._run_next_op()
				break
		}
	}

	//** ******************************************************************
	//* Operations
	//** ******************************************************************
	/**
	 *
	 * @param {Array<cTransformOp>} paOps
	 */
	async run_ops(paOps){
		/* eslint-disable @stylistic/function-call-argument-newline */

		if (!paOps){
			cCAScramblerUtils.throw_error(this._base_name,"operations must be provided")
			return
		}

		if (!Array.isArray(paOps)){
			cCAScramblerUtils.throw_error(this._base_name,"operations must be an array")
			return
		}

		this._operations = paOps
		this._tracker = new cScramblerCellTracker(this._base_name,this._data.rows,this._data.cols)

		/* eslint-enable @stylistic/function-call-argument-newline */
		this._run_next_op()
	}

	//********************************************************************
	// privates
	//********************************************************************
	async _run_next_op(){
		//------- check if finished
		if (this._operations.length == 0){
			cDebug.write("all operations completed checking coverage")
			this._tracker.check_coverage()

			cDebug.write("all good, scrambling complete")
			cCAScramblerEvent.fire_event(
				this._base_name,
				cCAScramblerEvent.notify.scrambling_complete,
			)
			return
		}

		//-----get the next operation to perform
		/** @type {cTransformOp} */ var oOp = this._operations.pop()

		//-----get the runner exemplar for the operation
		var oExemplar = cScramblerOpMappings.get(oOp.opcode)	/** @type {typeof cIndexTransformOp} */
		if (oExemplar == null){
			cDebug.write("⚒️ DEBUG: for POC skipping unknown operation " + oOp.opcode)
			//cCAScramblerUtils.throw_error(this._base_name, "unknown operation code: " + oOp.opcode)
			this._run_next_op()
			return
		}

		// instantiate the operation
		/* eslint-disable @stylistic/function-call-argument-newline */
		{
			//@ts-expect-error
			var oRunner = new oExemplar(this._base_name,this._data,oOp.params)
			if (!(oRunner instanceof cIndexTransformOp) )
				cCAScramblerUtils.throw_error(this._base_name,"invalid operation for " + oRunner)

			//perform the runner
			var aTransforms /**@type {Array<cCellTransform>} */
			try{
				aTransforms = oRunner.run()
			} catch (e){
				cCAScramblerUtils.throw_error(this._base_name,e.message)
			}

			// get the changed cells from the transforms and apply them to the data
			if (aTransforms == null || aTransforms.length == 0)
				cCAScramblerUtils.throw_error(this._base_name,"no changed cells found")

			var aChanged_cells = [] /** @type {Array<cChangedCell>} */
			for (var oTransform of aTransforms){
			//get all the values from the source
				var iValue = this._data.get(oTransform.source.row,oTransform.source.col)
				if (iValue == null)
					cCAScramblerUtils.throw_error(this._base_name,"found a null value")

				var oChanged_cell = new cChangedCell(oTransform.target.row,oTransform.target.col,iValue)
				aChanged_cells.push(oChanged_cell)
			}

			//----apply the changed cells
			this._data.set_multiple(aChanged_cells)
			this._tracker.add_cells(aChanged_cells)
		}
		/* eslint-enable @stylistic/function-call-argument-newline */

		//----notify consumers of the completed operation, passing the changed cells
		cCAScramblerEvent.fire_event(
			this._base_name,
			cCAScramblerEvent.notify.operation_complete,
			aChanged_cells
		)
		//the next operation will be triggered by the consumer firing a changes_consumed event
	}

}