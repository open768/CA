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
class cCAScramblerEvent extends cBaseEvent{
	static actions = {
		status: "AST",
		set_input: "ASI",
		draw_scrambler_grid: "ADSG",
		error: "AERR"
	}
	static notify = {
		consumed: "NC",
		imported_ops: "NIO",
		scrambling_complete: "NSC",
		operation_complete: "NOCOM",
		operation_consumed: "NOCON",
		reset: "NR",
	}

	static control_actions = {
		scramble: "CS"
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
}

class cCAScramblerStages extends cStaticClass{
	static NOT_RUNNING = "SSNR"
	static INIT = "SSI"
	static FILL_INPUT = "SSFI"
	static VALIDATE_GRID = "SSVG"
	static INITIAL_RUNS = "SSIR"
	static IMPORTING_OPS = "SSIO"
	static
		SCRAMBLING = "SSS"
}

//############################################################################
//# scrambling operations
//############################################################################
/**
 * The operations that can be applied to the grid. These are the building blocks of the scrambler,
 * TODO:they are simple (to show the concept) and could be replaced by more complex operations in the future.
 *
 * and are used to generate the scrambling sequence.
 *  Line – cells move along a line
 * Translate - a row or a column
 * 	Square - cells move along a predefined square
 * 	Translate cell - move a cell to another location
 * 	unzip row/col – alternating cells are moved in different directions
 * 	reflection – a block of cells flipped across an axis
 * 	transpose – swap a row with a column
 * 	skew – shift all rows or columns according to their index
 * 	TODO: block – apply the transforms to a defined block within the grid
 */
class cOpConsts extends cStaticClass{
	static LINE_OP = 0
	static TRANSLATE_OP = 1
	static SQUARE_OP = 2
	static TRANSLATE_CELL_OP = 3
	static UNZIP_OP = 4
	static REFLECTION_OP = 5
	static TRANSPOSE_OP = 6
	static SKEW_OP = 7

	static ROWCOL_PARAM = 0
	static INDEX_PARAM = 1
	static ROW_PARAM = 2
	static COL_PARAM = 3
	static DIRECTION_PARAM = 4
	static DISTANCE_PARAM = 5

	static ROW_VALUE = 0
	static COL_VALUE = 1
	static ROW_LEFT_VALUE = 0
	static ROW_RIGHT_VALUE = 1
	static COL_UP_VALUE = 0
	static COL_DOWN_VALUE = 1
}

// #############################################################################################
class cOpDefs extends cStaticClass{
	static IDS = null
	static PARAMS = null
	static DEFS = null
	static MAX_OP_ID = -1
	static OP_ID_BITS = -1
	static MAX_INDEX = 199

	//*********************************************************************
	static init(){
		this.IDS = new Map([
			[cOpConsts.LINE_OP,"line"],
			[cOpConsts.TRANSLATE_OP,"translate"],
			[cOpConsts.SQUARE_OP,"square"],
			[cOpConsts.TRANSLATE_CELL_OP,"translate_cell"],
			[cOpConsts.UNZIP_OP,"unzip"],
			[cOpConsts.REFLECTION_OP,"reflection"],
			[cOpConsts.TRANSPOSE_OP,"transpose"],
			[cOpConsts.SKEW_OP,"skew"]
		])

		//---------------------------------------------------------------------
		this.MAX_OP_ID = cOpConsts.SKEW_OP
		this.OP_ID_BITS = cCommon.intBitSize(this.MAX_OP_ID)

		//---------------------------------------------------------------------
		var iIndexbits = cCommon.intBitSize(this.MAX_INDEX)

		this.PARAMS = new Map([
			[cOpConsts.ROWCOL_PARAM, {
				name: "row or col", max: 1, bits: 1
			}],
			[cOpConsts.INDEX_PARAM, {
				name: "index", max: this.MAX_INDEX, bits: iIndexbits
			}],
			[cOpConsts.ROW_PARAM, {
				name: "row", max: this.MAX_INDEX, bits: iIndexbits
			}],
			[cOpConsts.COL_PARAM, {
				name: "col", max: this.MAX_INDEX, bits: iIndexbits
			}],
			[cOpConsts.DIRECTION_PARAM, {
				name: "direction", max: 1, bits: 1
			}],
			[cOpConsts.DISTANCE_PARAM, {
				name: "distance", max: this.MAX_INDEX, bits: iIndexbits
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
		this.DEFS = new Map([
			[cOpConsts.LINE_OP, aStandardParams],
			[cOpConsts.TRANSLATE_OP, aStandardParams],
			[cOpConsts.REFLECTION_OP, aStandardParams],
			[cOpConsts.SQUARE_OP, aStandardParams],
			[cOpConsts.UNZIP_OP, aStandardParams],
			[cOpConsts.TRANSPOSE_OP, [cOpConsts.INDEX_PARAM, cOpConsts.DISTANCE_PARAM]],
			[cOpConsts.SKEW_OP, [cOpConsts.ROWCOL_PARAM, cOpConsts.INDEX_PARAM, cOpConsts.DIRECTION_PARAM, cOpConsts.DISTANCE_PARAM]],
			[cOpConsts.TRANSLATE_CELL_OP, [cOpConsts.ROW_PARAM, cOpConsts.COL_PARAM, cOpConsts.ROW_PARAM, cOpConsts.COL_PARAM]]
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