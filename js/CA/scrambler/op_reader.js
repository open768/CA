"use strict"

/**************************************************************************
This work is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.
To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/

Any Cryptography concepts demonstrated in this code are covered by the UK Govt Open General Export License for Cryptographic development
(see https://www.gov.uk/government/publications/open-general-export-licence-cryptographic-development)
and is not intended for any dual use as defined by the UK government license.
You the consumer of this code are solely and entirely responsible for importing this code into your own country..

**************************************************************************/

class eScramblerOpReaderException extends Error {}
class eOpReaderBitsExhausted extends Error {}

//############################################################
//# initialise the operations and their parameters.
//############################################################

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
	read_number(piBitLength, piMaxValue, piMinValue){
		if (this.bitstream.size() < piBitLength)
			throw new eOpReaderBitsExhausted("not enough bits available")

		var iValue = this.bitstream.readUBits(piBitLength)
		iValue = cCommon.get_wraparound_value(
			iValue,
			piMinValue,
			piMaxValue
		)

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
		)
		var iMean = iTotal / aCounts.length

		//work out avg std devlation
		var iTotalVariance = aCounts.reduce(
			(piSum, piValue) => piSum + (piValue - iMean) ** 2,
			0
		)
		var iAvgVariance = iTotalVariance / aCounts.length
		var iStdDev = Math.sqrt(iAvgVariance)
		var iCoeffOfVariation = iStdDev / iMean

		if (iCoeffOfVariation > this.MAX_DEVIATION) {
			cDebug.write("Not random enough: " + iCoeffOfVariation.toFixed(3) + " > threshold "	+ this.MAX_DEVIATION)
			return false
		}

		cDebug.write("Randomness check passed: " + iCoeffOfVariation.toFixed(3) + " <= threshold "	+ this.MAX_DEVIATION)
		return true
	}

}

//############################################################
//#
//############################################################
class cScramblerOpReader{
	basename = null /** @type {string} */
	_ops = null /** @type {Array<cTransformOp>} */
	_grid = null /** @type {cCAGrid} */

	/**
	 *
	 * @param {string} psBaseName
	 * @param {cCAGrid} poGrid
	 */
	constructor(psBaseName, poGrid){

		if (!(poGrid instanceof cCAGrid))
			throw new eCAScramblerException("grid is not cCAGrid")

		this.basename = psBaseName
		this._grid = poGrid
	}

	/** *****************************************************************
	 * for jsbitstream see: https://github.com/KonradKiss/JSBitStream
	 *
	 */
	import_grid(){
		try{
		//check class is correct
			if (!(this._grid instanceof cCAGrid))
				throw new eCAScramblerException("grid data is not cCAGrid")
			var oGrid = this._grid

			//convert the grid to binary
			/** @type {jsbitstream} */ var oBitStream = cCAGridBitStreamExporter.get_grid_bitstream(oGrid)

			//the bitstream should have the same length as the grid (1 bit per cell)
			if (oBitStream.size() !== oGrid.rows * oGrid.cols)
				throw new eCAScramblerException("bitstream length does not match grid size")

			//check randomness
			oBitStream.backup_data()
			if (!cRandomnessChecker.check_randomness(oBitStream))
				throw new eCAScramblerException("grid data is not random enough to be converted to operations")

			//read operations from the bitstream
			oBitStream.restore_data(true)
			if (oBitStream.size() !== oGrid.rows * oGrid.cols)
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
			var iop_code = oBit_helper.read_number(
				cOpDefs.OP_ID_BITS,
				cOpDefs.MAX_OP_ID,
				cOpDefs.MIN_OP_ID
			)

			//create the object
			var oTransform_op = new cTransformOp(iop_code)
			{
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
				for (var iParam of aParamDefs){
					// get param definition
					var oParam = cOpDefs.PARAMS.get(iParam)

					//read param value
					var iValue = oBit_helper.read_number(
						oParam.bits,
						oParam.max,
						oParam.min
					)

					//update map
					oTransform_op.params.set(
						iParam,
						iValue
					)
				}

				aOps.push(oTransform_op)
			}
		}

		return aOps
	}
}
