/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

Any Cryptography concepts demonstrated in this code are covered by the UK Govt Open General Export License for Cryptographic development
(see https://www.gov.uk/government/publications/open-general-export-licence-cryptographic-development)
and is not intended for any dual use as defined by the UK government license.
You the consumer of this code are solely and entirely responsible for importing this code into your own country..
**************************************************************************/

//############################################################################
//# scrambler types and constants
//############################################################################
class cCAScramblerCanvasEvent extends cBaseEvent{
	static notify = {
		consumed_changes: "NCC",
	}
}

class cCAScramblerEvent extends cBaseEvent{
	static actions = {
		status: "AST",
		set_input: "ASI",
		error: "AERR",
		get_scrambled_data: "AGS"
	}
	static notify = {
		draw_scrambler: "ADSG",
		consumed: "NC",
		imported_ops: "NIO",
		scrambling_complete: "NSC",
		operation_complete: "NOC",
		changes_consumed: "NCC",
		reset: "NR",
		scrambled_data: "NSD"
	}

	static control_actions = {
		scramble: "CS"
	}
}

class cCAScramblerUtils extends cStaticClass{
	/**
	 *
	 * @param {string} psBaseName
	 * @param {string} psMessage
	 * @throws {eCAScramblerException}
	 */
	static throw_error(psBaseName,psMessage){
		cCAScramblerEvent.fire_event(
			psBaseName,
			cCAScramblerEvent.actions.error,
			psMessage
		)
		throw new eCAScramblerException(psMessage)
	}
}

class eCAScramblerException extends Error {
}

class cCAScramblerTypes extends cStaticClass{
	static status = {
		dormant: null,
		initialRuns: 1
	}
	static STEP_DELAY_MS = 50
	static MAX_SCRAMBLER_INDEX = 200
	static MIN_CHANGED_COVERAGE = 99 //percentage of cells that should be changed by the scrambling process to be considered effective
	static MAX_RANDOMNESS_DEVIATION = 0.2	//the maximum deviation (in percentage) that is acceptable for the scrambling process to start
	static MIN_SQUARE_SIDE = 3
}

class cCAScramblerStages extends cStaticClass{
	static NOT_RUNNING = "SSNR"
	static FILL_INPUT = "SSFI"
	static INITIAL_RUNS = "SSIR"
	static XOR = "SSXO"
	static STEP_AGAIN = "SSSA"
	static IMPORTING_OPS = "SSIO"
	static SCRAMBLING = "SSS"
}

//############################################################################
//# scrambling operations
//############################################################################
/**
 * The operations that can be applied to the grid. These are the building blocks of the scrambler,
 * TODO:they are simple (to show the concept) and could be replaced by more complex operations in the future.
 */

class cOpConsts extends cStaticClass{
	static LINE_OP = 0		//cells move along a line
	static SWAP_OP = 1		//move a cell to another location
	static SQUARE_OP = 2	//cells move along a predefined square
	static TRANSLATE_OP = 3	//translate a row or a column
	static UNZIP_OP = 4	//alternating cells are moved in different directions
	static REFLECTION_OP = 5	//a block of cells flipped across an axis
	static TRANSPOSE_OP = 6	//swap a row with a column
	static SKEW_OP = 7	//shift all rows or columns according to their index
	// * 	TODO: block – apply the transforms to a defined block within the grid

	static ROWCOL_PARAM = 0
	static INDEX_PARAM = 1
	static ROW_PARAM = 2
	static COL_PARAM = 3
	static DIRECTION_PARAM = 4
	static DISTANCE_PARAM = 5
	static ROW2_PARAM = 6
	static COL2_PARAM = 7
	static SIZE_PARAM = 8

	static ROW_VALUE = 0
	static COL_VALUE = 1
	static ROW_LEFT_VALUE = 0
	static ROW_RIGHT_VALUE = 1
	static COL_UP_VALUE = 0
	static COL_DOWN_VALUE = 1

	static MIN_INDEX_VALUE = 1
}

// #############################################################################################
class cOpDefs extends cStaticClass{
	static IDS = null
	static PARAMS = null
	static OP_DEFS = null	/** @type {Map<number, Array} */
	static MAX_OP_ID = cOpConsts.SKEW_OP
	static MIN_OP_ID = cOpConsts.LINE_OP
	static OP_ID_BITS = cCommon.intBitSize(cOpConsts.SKEW_OP)

	//*********************************************************************
	static init(){
		this.IDS = new Map([
			[cOpConsts.LINE_OP,"line"],
			[cOpConsts.SWAP_OP,"swap"],
			[cOpConsts.SQUARE_OP,"square"],
			[cOpConsts.TRANSLATE_OP,"translate"],
			[cOpConsts.UNZIP_OP,"unzip"],
			[cOpConsts.REFLECTION_OP,"reflection"],
			[cOpConsts.TRANSPOSE_OP,"transpose"],
			[cOpConsts.SKEW_OP,"skew"]
		])

		//---------------------------------------------------------------------
		var iIndexbits = cCommon.intBitSize(cCAScramblerTypes.MAX_SCRAMBLER_INDEX)

		this.PARAMS = new Map([
			[cOpConsts.ROWCOL_PARAM, {
				name: "row or col", min: 0, max: 1, bits: 1
			}],
			[cOpConsts.INDEX_PARAM, {
				name: "index", min: cOpConsts.MIN_INDEX_VALUE, max: cCAScramblerTypes.MAX_SCRAMBLER_INDEX, bits: iIndexbits
			}],
			[cOpConsts.ROW_PARAM, {
				name: "row", min: cOpConsts.MIN_INDEX_VALUE, max: cCAScramblerTypes.MAX_SCRAMBLER_INDEX, bits: iIndexbits
			}],
			[cOpConsts.COL_PARAM, {
				name: "col", min: cOpConsts.MIN_INDEX_VALUE, max: cCAScramblerTypes.MAX_SCRAMBLER_INDEX, bits: iIndexbits
			}],
			[cOpConsts.ROW2_PARAM, {
				name: "row2", min: cOpConsts.MIN_INDEX_VALUE, max: cCAScramblerTypes.MAX_SCRAMBLER_INDEX, bits: iIndexbits
			}],
			[cOpConsts.COL2_PARAM, {
				name: "col2", min: cOpConsts.MIN_INDEX_VALUE, max: cCAScramblerTypes.MAX_SCRAMBLER_INDEX, bits: iIndexbits
			}],
			[cOpConsts.SIZE_PARAM, {
				name: "size", min: cOpConsts.MIN_INDEX_VALUE, max: cCAScramblerTypes.MAX_SCRAMBLER_INDEX, bits: iIndexbits
			}],
			[cOpConsts.DIRECTION_PARAM, {
				name: "direction", min: 0, max: 1, bits: 1
			}],
			[cOpConsts.DISTANCE_PARAM, {
				name: "distance", min: cOpConsts.MIN_INDEX_VALUE, max: cCAScramblerTypes.MAX_SCRAMBLER_INDEX, bits: iIndexbits
			}]
		])

		//---------------------------------------------------------------------
		var aStandardParams = [
			cOpConsts.ROWCOL_PARAM,
			cOpConsts.INDEX_PARAM,
			cOpConsts.DIRECTION_PARAM,
			cOpConsts.DISTANCE_PARAM
		]

		//---------------------------------------------------------------------
		this.OP_DEFS = new Map([
			[cOpConsts.LINE_OP, aStandardParams],
			[cOpConsts.SWAP_OP, [cOpConsts.ROW_PARAM, cOpConsts.COL_PARAM, cOpConsts.ROW2_PARAM, cOpConsts.COL2_PARAM]],
			[cOpConsts.SQUARE_OP, [cOpConsts.ROW_PARAM, cOpConsts.COL_PARAM, cOpConsts.DISTANCE_PARAM, cOpConsts.SIZE_PARAM]],
			[cOpConsts.TRANSLATE_OP, aStandardParams],
			[cOpConsts.UNZIP_OP, aStandardParams],
			[cOpConsts.REFLECTION_OP, aStandardParams],
			[cOpConsts.TRANSPOSE_OP, [cOpConsts.INDEX_PARAM, cOpConsts.DISTANCE_PARAM]],
			[cOpConsts.SKEW_OP, [cOpConsts.ROWCOL_PARAM, cOpConsts.INDEX_PARAM, cOpConsts.DIRECTION_PARAM, cOpConsts.DISTANCE_PARAM]],
		])
	}
}
cOpDefs.init()

// #############################################################################################
class cTransformOp {
	opcode = null		/** @type {number} */
	params = new Map()		/** @type {Map<number, number>} */

	constructor(piOpcode){
		this.opcode = piOpcode
	}
}

// #############################################################################################
class cCellIndex{
	row = null
	col = null
	constructor(piRow = null, piCol = null){
		this.row = piRow
		this.col = piCol
	}
	//add a method to add another cellIndex so that it can be used in + operations
	/**
	 *
	 * @param {cCellIndex} poOther
	 * @returns {cCellIndex}
	 */
	add(poOther){
		if (!(poOther instanceof cCellIndex))
			throw "other must be an instance of cCellIndex"

		this.row += poOther.row,
		this.col += poOther.col
		return this
	}
}

class cCellTransform {
	source = null		/** @type {cCellIndex} */
	target = null		/** @type {cCellIndex} */

	constructor(poSource, poTarget){
		if (!(poSource instanceof cCellIndex))
			throw new Error("source must be an instance of cCellIndex")
		if (!(poTarget instanceof cCellIndex))
			throw new Error("target must be an instance of cCellIndex")

		this.source = poSource
		this.target = poTarget
	}
}

class cChangedCell {
	row = null
	col = null
	value = null

	constructor(piRow, piCol, piValue){
		this.row = piRow
		this.col = piCol
		this.value = piValue
	}
}