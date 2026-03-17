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
				this._do_op_line(oOp)
				break

			case cOpConsts.TRANSLATE_OP:
				this._do_op_translate(oOp)
				break

			case cOpConsts.SQUARE_OP:
				this._do_op_square(oOp)
				break

			case cOpConsts.TRANSLATE_CELL_OP:
				this._do_op_translate_cell(oOp)
				break

			case cOpConsts.UNZIP_OP:
				// Handle UNZIP_OP
				this._do_op_unzip(oOp)
				break

			case cOpConsts.REFLECTION_OP:
				// Handle REFLECTION_OP
				this._do_op_reflection(oOp)
				break

			case cOpConsts.TRANSPOSE_OP:
				// Handle TRANSPOSE_OP
				this._do_op_transpose(oOp)
				break

			case cOpConsts.SKEW_OP:
				// Handle SKEW_OP
				this._do_op_skew(oOp)
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

	//** ******************************************************************
	//** ******************************************************************
	_do_op_line(poOp){

	}
	//** ******************************************************************
	//** ******************************************************************
	_do_op_translate(poOp){

	}
	//** ******************************************************************
	//** ******************************************************************
	_do_op_square(poOp){

	}
	//** ******************************************************************
	//** ******************************************************************
	_do_op_translate_cell(poOp){

	}
	//** ******************************************************************
	//** ******************************************************************
	_do_op_unzip(poOp){

	}
	//** ******************************************************************
	//** ******************************************************************
	_do_op_reflection(poOp){

	}
	//** ******************************************************************
	//** ******************************************************************
	_do_op_transpose(poOp){

	}
	//** ******************************************************************
	//** ******************************************************************
	_do_op_skew(poOp){

	}

}