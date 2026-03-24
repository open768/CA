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

//#######################################################################################
//#######################################################################################
class cScramblerOpMappings extends cStaticClass{
	static _mappings = new Map() /** @type {Map<number, typeof cScramblerOp>} */

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
		var map_index = poChangedCell.row + poChangedCell.col * cOpDefs.MAX_INDEX
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
		this._tracker = new cScramblerCellTracker(
			this._base_name,
			this._data.rows,
			this._data.cols
		)
		this._run_next_op()
	}

	//********************************************************************
	// privates
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
		/** @type {cTransformOp} */ var oOp = this._operations.pop()

		//get the runner class
		var oExemplar = cScramblerOpMappings.get(oOp.opcode)	/** @type {typeof cScramblerOp} */
		if (oExemplar == null){
			cDebug.write("DEBUG: skipping unknown operation " + oOp.opcode)
			//cCAScramblerUtils.throw_error(this._base_name, "unknown operation code: " + oOp.opcode)
			this._run_next_op()
			return
		}

		// instantiate the operation
		//@ts-expect-error
		var oRunner = new oExemplar(
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
		if (!aChanged_cells == null || aChanged_cells.length == 0){
			cDebug.write("DEBUG: skipping nochanged cells")
			//cCAScramblerUtils.throw_error(this._base_name, "no changed cells found")
			this._run_next_op()
			return
		}

		//----apply the changed cells
		this._tracker.add_cells(aChanged_cells)
		this._data.set_multiple(aChanged_cells)

		//----notify consumers of the completed operation, passing the changed cells
		cCAScramblerEvent.fire_event(
			this._base_name,
			cCAScramblerEvent.notify.operation_complete,
			aChanged_cells
		)
		//the next operation will be triggered by the consumer firing a changes_consumed event
	}

}