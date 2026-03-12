"use strict"

class eScramblerOpReaderException extends Error {}

//############################################################
//# initialise the operations and their parameters.
//############################################################
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

}

class cOpDefs extends cStaticClass{
	static IDS = null
	static PARAMS = null
	static DEFS = null
	static MAX_OP_ID = -1
	static OP_ID_BITS = -1

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
		this.MAX_OP_ID = this.IDS.SKEW.id
		this.OP_ID_BITS = cCommon.intBitSize(this.MAX_OP_ID)

		//---------------------------------------------------------------------
		var i200bits = cCommon.intBitSize(200)
		this.PARAMS = new Map([
			[cOpConsts.ROWCOL_PARAM, {
				name: "row or col", max: 1, bits: 1
			}],
			[cOpConsts.INDEX_PARAM, {
				name: "index", max: 200, bits: i200bits
			}],
			[cOpConsts.ROW_PARAM, {
				name: "row", max: 200, bits: i200bits
			}],
			[cOpConsts.COL_PARAM, {
				name: "col", max: 200, bits: i200bits
			}],
			[cOpConsts.DIRECTION_PARAM, {
				name: "direction", max: 1, bits: 1
			}],
			[cOpConsts.DISTANCE_PARAM, {
				name: "distance", max: 200, bits: i200bits
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

class cTranformOp {
	opcode = null		/** @type {number} */
	params = null		/** @type {Map<number, number>} */
}

//############################################################
//#
//############################################################
class cScramblerOpReader extends cEventSubscriber{
	basename = null
	_ops = null

	constructor(psBaseName){
		super()
		this.basename = psBaseName
		cCAGridEvent.subscribe(
			this.basename,
			[cCAGridEvent.notify.grid],
			poEvent =>this.onGridEvent(poEvent)
		)

	}

	//******************************************************************
	//* public methods
	//******************************************************************
	import_grid(){
		//fire the event to get the data from the grid
		cCAGridEvent.fire_event(
			this.basename,
			cCAGridEvent.actions.get_grid
		)

	}

	//******************************************************************
	//* Events
	//******************************************************************
	async onGridEvent(poEvent){
		switch (poEvent.action){
			case cCAGridEvent.notify.grid:
				cDebug.write("got grid data, now convert to operations")
				var oGrid = poEvent.data /** @type {cCAGrid} */
				this._on_got_grid(oGrid)

		}
	}

	/** *****************************************************************
	 *
	 * @param {cCAGrid} poGrid
	 */
	_on_got_grid(poGrid){
		//check class is correct
		if (!(poGrid instanceof cCAGrid))
			throw new eCAScramblerException("grid data is not cCAGrid")

		//convert the grid to binary
		/** @type {jsbitstream} */ var oBitStream = cCAGridBitStreamExporter.get_grid_bitstream(poGrid)
		this._read_ops(oBitStream)
	}

	//******************************************************************
	//* private methods
	//******************************************************************
	/**
	 *
	 * @param {jsbitstream} poBitStream
	 */
	_read_ops(poBitStream){
		var aOps = []
		while (poBitStream.bits_available() > 0){

			//read the opcode
			var iop_code = poBitStream.read_bits(cOpDefs.OP_ID_BITS)
			if (iop_code > cOpDefs.MAX_OP_ID)
				iop_code = iop_code % cOpDefs.MAX_OP_ID //wrap around if invalid opcode

			//create the object
			var oOp = new cTranformOp()
			{
				oOp.opcode = iop_code

				//populate params and values
				var oParams = new Map
				var aParamDefs = cOpDefs.DEFS.get(iop_code)
				for (var iParam of aParamDefs){
					// get param definition
					var oParam = cOpDefs.PARAMS.get(iParam)
					var ibits = oParam.bits
					if (poBitStream.bits_available() < ibits)
						throw new eScramblerOpReaderException("not enough bits available")

					//read param value
					var iValue = poBitStream.read_bits(ibits)

					//update map
					oParams.set(
						iParam,
						iValue
					)
					oOp.params = oParams
				}

				aOps.push(oOp)
			}
		}
	}
}
