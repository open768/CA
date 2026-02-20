//###############################################################################

class cCAIndexOps {
	// bits are created 	nw,n,ne,w,c,e,sw,s,se

	static get_value(piIndex, piDirection) {
		var iVal

		switch (piDirection) {
			case CA_DIRECTIONS.northwest:
				iVal = 256
				break
			case CA_DIRECTIONS.north:
				iVal = 128
				break
			case CA_DIRECTIONS.northeast:
				iVal = 64
				break
			case CA_DIRECTIONS.west:
				iVal = 32
				break
			case CA_DIRECTIONS.centre:
				iVal = 16
				break
			case CA_DIRECTIONS.east:
				iVal = 8
				break
			case CA_DIRECTIONS.southwest:
				iVal = 4
				break
			case CA_DIRECTIONS.south:
				iVal = 2
				break
			case CA_DIRECTIONS.southeast:
				iVal = 1
				break
			default:
				throw new CAException('unknown direction ' + piDirection)
		}

		var iAnd = piIndex & iVal // bitwise and
		if (iAnd == iVal)
			return 1
		else
			return 0
	}

	//* **************************************************************
	/**
	 * counts 1 bits in a number
	 \*	 * @static
	 * @param {*} piIndex
	 * @returns {number}
	 */
	static get_bit_count(piIndex) {
		var iTmp = piIndex
		var iCount = 0

		while (iTmp > 0) {
			if ((iTmp & 1) == 1)
				iCount++

			iTmp = iTmp >>> 1 // keep right shifting the value until nothing is left
		}

		return iCount
	}

	//* **************************************************************
	/**
	 *
	 * @static
	 * @param {number} piIndex
	 * @returns {number}
	 */
	static get_north_bits(piIndex) {
		var iVal = 0
		iVal |= this.get_value(
			piIndex,
			CA_DIRECTIONS.northwest
		)
		iVal <<= 1
		iVal |= this.get_value(
			piIndex,
			CA_DIRECTIONS.north
		)
		iVal <<= 1
		iVal |= this.get_value(
			piIndex,
			CA_DIRECTIONS.northeast
		)
		return iVal
	}

	//* **************************************************************
	/**
	 *
	 * @static
	 * @param {number} piIndex
	 * @returns {number}
	 */
	static get_centre_bits(piIndex) {
		var iVal = 0
		iVal |= this.get_value(
			piIndex,
			CA_DIRECTIONS.west
		)
		iVal <<= 1
		iVal |= this.get_value(
			piIndex,
			CA_DIRECTIONS.centre
		)
		iVal <<= 1
		iVal |= this.get_value(
			piIndex,
			CA_DIRECTIONS.east
		)
		return iVal
	}

	//* **************************************************************
	/**
	 *
	 * @static
	 * @param {*} piIndex
	 * @returns {number}
	 */
	static get_south_bits(piIndex) {
		var iVal = 0
		iVal |= this.get_value(
			piIndex,
			CA_DIRECTIONS.southwest
		)
		iVal <<= 1
		iVal |= this.get_value(
			piIndex,
			CA_DIRECTIONS.south
		)
		iVal <<= 1
		iVal |= this.get_value(
			piIndex,
			CA_DIRECTIONS.southeast
		)
		return iVal
	}
}
