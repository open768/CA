"use strict"

class eScramblerOpReaderException extends Error {}
class eOpReaderBitsExhausted extends Error {}

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
		this.MAX_OP_ID = cOpConsts.SKEW_OP
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

class cTransformOp {
	opcode = null		/** @type {number} */
	params = null		/** @type {Map<number, number>} */
}

//############################################################
//#
//############################################################
class cBitStreamHelper {
	bitstream = null /** @type {jsbitstream} */

	/**
	 *
	 * @param {jsbitstream} poBitStream
	 */
	constructor(poBitStream){
		this.bitstream = poBitStream
	}

	/**
	 *
	 * @param {number} piBitLength
	 * @throws {eOpReaderBitsExhausted} if not enough bits available in the stream
	 * @throws {eScramblerOpReaderException} if unsupported bit length requested
	 * @returns {number}
	 */
	read_number(piBitLength, piMaxValue){
		if (this.bitstream.size() < piBitLength)
			throw new eOpReaderBitsExhausted("not enough bits available")

		var iValue = this.bitstream.readUBits(piBitLength)

		if (iValue > piMaxValue)
			iValue = iValue % (piMaxValue + 1) //wrap around if value exceeds max
		return iValue
	}
}

//############################################################
//#
//############################################################
class cRandomnessChecker extends cStaticClass{
	static MAX_DEVIATION = 0.2 // allow 20% deviation from expected
	/**
	 *reads u4 numbers and checks distribution
	 * @param {jsbitstream} poBitStream
	 */
	static check_randomness(poBitStream){
		//check that the pobitstream is a jsbitstream
		if (!(poBitStream instanceof jsbitstream))
			throw new eScramblerOpReaderException("randomness checker requires a jsbitstream")

		var oMap = new Map
		while	(poBitStream.size() > 4){
			var iValue = poBitStream.readU4()
			if (oMap.has(iValue))
				oMap.set(
					iValue,
					oMap.get(iValue) + 1
				)
			else
				oMap.set(
					iValue,
					1
				)
		}

		//work out the mean of the values
		var aCounts = Array.from(oMap.values())
		var iTotal = aCounts.reduce(
			(piAccumulator, piValue) => piAccumulator + piValue,
			0
		) // total of the values read
		var iMean = iTotal / aCounts.length

		//work out avg std devlation
		var iTotalVariance = aCounts.reduce(
			(piSum, piValue) => piSum + (piValue - iMean) ** 2,
			0
		) //works out the total variance of the frequencies
		var iAvgVariance = iTotalVariance / aCounts.length
		var iStdDev = Math.sqrt(iAvgVariance)

		// coefficient of variation: stddev relative to mean (0 = perfect uniform, higher = more skewed)
		var iCoeffOfVariation = iStdDev / iMean

		if (iCoeffOfVariation > this.MAX_DEVIATION) {
			cDebug.write("Not random enough: CoV" + iCoeffOfVariation.toFixed(3) + "> threshold"	+ this.MAX_DEVIATION)
			return false
		}

		cDebug.write("Randomness check passed: CoV" + iCoeffOfVariation.toFixed(3) + "<= threshold"	+ this.MAX_DEVIATION)
		return true
	}

}

//############################################################
//#
//############################################################
class cScramblerOpReader extends cEventSubscriber{
	basename = null
	_ops = null

	/**
	 *
	 * @param {string} psBaseName
	 */
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
		if (!this.active)
			return

		switch (poEvent.action){
			case cCAGridEvent.notify.grid:
				cDebug.write("got grid data, now convert to operations")
				var oGrid = poEvent.data /** @type {cCAGrid} */
				this._process_grid(oGrid)

		}
	}

	/** *****************************************************************
	 * for jsbitstream see: https://github.com/KonradKiss/JSBitStream
	 *
	 * @param {cCAGrid} poGrid
	 */
	_process_grid(poGrid){
		try{
		//check class is correct
			if (!(poGrid instanceof cCAGrid))
				throw new eCAScramblerException("grid data is not cCAGrid")

			//convert the grid to binary
			/** @type {jsbitstream} */ var oBitStream = cCAGridBitStreamExporter.get_grid_bitstream(poGrid)

			//the bitstream should have the same length as the grid (1 bit per cell)
			if (oBitStream.size() !== poGrid.rows * poGrid.cols)
				throw new eCAScramblerException("bitstream length does not match grid size")

			//check randomness
			oBitStream.backup_data()
			if (!cRandomnessChecker.check_randomness(oBitStream))
				throw new eCAScramblerException("grid data is not random enough to be converted to operations")

			//read operations from the bitstream
			oBitStream.restore_data(true)
			if (oBitStream.size() !== poGrid.rows * poGrid.cols)
				throw new eCAScramblerException("bitstream length does not match grid size")

			var aOps = this._read_ops(oBitStream)
			cDebug.write("imported " + aOps.length + " operations from grid data")

			//notify subscribers
			cCAScramblerEvent.fire_event(
				this.basename,
				cCAScramblerEvent.notify.imported_ops,
				aOps
			)
			this.active = false

		} catch (e) {
			if (e instanceof eCAScramblerException) {
				cDebug.write("Error processing grid: " + e.message)
				cCAScramblerEvent.fire_event(
					this.basename,
					cCAScramblerEvent.actions.error,
					e.message
				)
			}

			throw e
		}

		return aOps
	}

	//******************************************************************
	//* private methods
	//******************************************************************
	/**
	 * @param {jsbitstream} poBitStream
	 * @returns {Array}
	 */
	_read_ops(poBitStream){
		var aOps = []
		var oBit_helper = new cBitStreamHelper(poBitStream)
		while (poBitStream.size() > cOpDefs.OP_ID_BITS){
			//read the opcode
			var iop_code = oBit_helper.read_number(cOpDefs.OP_ID_BITS)
			if (iop_code > cOpDefs.MAX_OP_ID)
				iop_code = iop_code % cOpDefs.MAX_OP_ID //wrap around if invalid opcode

			//create the object
			var oTransform_op = new cTransformOp()
			{
				oTransform_op.opcode = iop_code
				var aParamDefs = cOpDefs.DEFS.get(iop_code)
				//check that there is anough bits left to read the params
				var iBitsRequired = aParamDefs.reduce(
					(piSum, piParam) => {
						var oParam = cOpDefs.PARAMS.get(piParam)
						return piSum + oParam.bits
					},
					0
				)
				if (poBitStream.size() < iBitsRequired)
					break //not enough bits left

				//populate params and values
				var oParams = new Map()
				for (var iParam of aParamDefs){
					// get param definition
					var oParam = cOpDefs.PARAMS.get(iParam)

					//read param value
					var iValue = oBit_helper.read_number(
						oParam.bits,
						oParam.max
					)

					//update map
					oParams.set(
						iParam,
						iValue
					)
					oTransform_op.params = oParams
				}

				aOps.push(oTransform_op)
			}
		}

		return aOps
	}
}
