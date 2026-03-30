// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/** initialises the grid */

/**
 * @param {cCAGrid} poGrid
 * @param {number} piInitType		fined in GRID_INIT_TYPES
 */
class cCAGridInitialiser {
	static init (poGrid, piInitType) {
		cDebug.enter()
		// cDebug.write('init_type:' + piInitType)
		// always blank first by creating new cells
		poGrid.create_cells()

		switch (piInitType) {
			case GRID_INIT_TYPES.blank.id:
				break

			case GRID_INIT_TYPES.block.id:
				this.init_block(poGrid)
				break

			case GRID_INIT_TYPES.checker.id:
				this.init_checker(poGrid)
				break

			case GRID_INIT_TYPES.circle.id:
				this.init_circle(poGrid)
				break

			case GRID_INIT_TYPES.cross.id:
				this.init_cross(poGrid)
				break

			case GRID_INIT_TYPES.diagonal.id:
				this.init_diagonal(poGrid)
				break

			case GRID_INIT_TYPES.diamond.id:
				this.init_diamond(poGrid)
				break

			case GRID_INIT_TYPES.horiz_line.id:
				this.init_horiz_line(poGrid)
				break

			case GRID_INIT_TYPES.random.id:
				this.init_random(poGrid)
				break

			case GRID_INIT_TYPES.sine.id:
				this.init_sine(poGrid)
				break

			case GRID_INIT_TYPES.vert_line.id:
				this.init_vert_line(poGrid)
				break

				// --------------------------------------------------------
			default:
				throw new eCAException('unknown init_type: ' + piInitType)
		}

		cDebug.leave()
	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_checker (poGrid) {
		// cDebug.write('init checker')
		let iStartCol = 1
		const iSize = 3
		for (let iRow = 1; iRow <= poGrid.rows; iRow += iSize) {
			for (let iCol = iStartCol; iCol <= poGrid.cols; iCol += iSize * 2)
				for (let iDeltaR = 0; iDeltaR < iSize; iDeltaR++)
					for (let iDeltaC = 0; iDeltaC < iSize; iDeltaC++)
						poGrid.setCellValue(
							iRow + iDeltaR,
							iCol + iDeltaC,
							1
						)

			if (iStartCol == 1)
				iStartCol = iSize + 1
			else
				iStartCol = 1
		}
	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_circle (poGrid) {
		// cDebug.write('init circle')
		const iMidC = Math.floor(poGrid.cols / 2)
		const iMidR = Math.floor(poGrid.rows / 2)

		const iDiameter = Math.min(
			iMidC,
			iMidR
		) / 2
		const iDSq = iDiameter * iDiameter
		for (let x = iDiameter; x >= 0; x--) {
			let y = Math.sqrt(iDSq - Math.pow(
				x,
				2
			))
			y = Math.round(Math.abs(y))
			poGrid.setCellValue(
				iMidR + y,
				iMidC - x,
				1
			)
			poGrid.setCellValue(
				iMidR - y,
				iMidC - x,
				1
			)
			poGrid.setCellValue(
				iMidR + y,
				iMidC + x,
				1
			)
			poGrid.setCellValue(
				iMidR - y,
				iMidC + x,
				1
			)
		}
	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_cross (poGrid) {
		// cDebug.write('init cross')
		const iMidC = Math.floor(poGrid.cols / 2)
		const iMidR = Math.floor(poGrid.rows / 2)

		poGrid.setCellValue(
			iMidR,
			iMidC,
			1
		)
		for (let i = 1; i <= 4; i++) {
			poGrid.setCellValue(
				iMidR + i,
				iMidC,
				1
			)
			poGrid.setCellValue(
				iMidR - i,
				iMidC,
				1
			)
			poGrid.setCellValue(
				iMidR,
				iMidC + i,
				1
			)
			poGrid.setCellValue(
				iMidR,
				iMidC - i,
				1
			)
		}
	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_diagonal (poGrid) {
		// cDebug.write('init diagonal')
		for (let iNr = 1; iNr <= poGrid.rows; iNr++) {
			if (iNr > poGrid.cols)
				break

			poGrid.setCellValue(
				iNr,
				iNr,
				1
			)
		}
	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_diamond (poGrid) {
		cDebug.write('init diamond')
		const iMidCol = Math.floor(poGrid.cols / 2)
		const iMidRow = Math.floor(poGrid.rows / 2)

		for (let iStep = 10; iStep >= 0; iStep--) {
			// 10 point on each diamond side
			const dx = iStep
			const dy = 10 - dx

			poGrid.setCellValue(
				iMidRow - dy,
				iMidCol - dx,
				1
			)
			poGrid.setCellValue(
				iMidRow - dy,
				iMidCol + dx,
				1
			)
			poGrid.setCellValue(
				iMidRow + dy,
				iMidCol - dx,
				1
			)
			poGrid.setCellValue(
				iMidRow + dy,
				iMidCol + dx,
				1
			)
		}
	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_horiz_line (poGrid) {
		cDebug.write('init hline')
		const iNr = Math.floor(poGrid.rows / 2)
		for (let iNc = 1; iNc <= poGrid.cols; iNc++)
			poGrid.setCellValue(
				iNr,
				iNc,
				1
			)

	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_random (poGrid) {
		// cDebug.write('init random')
		for (let iNr = 1; iNr <= poGrid.rows; iNr++)
			for (let iNc = 1; iNc <= poGrid.cols; iNc++) {
				const iRnd = Math.round(Math.random())
				poGrid.setCellValue(
					iNr,
					iNc,
					iRnd
				)
			}

	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_sine (poGrid) {
		// cDebug.write('init sine')
		const dRadian = (2 * Math.PI) / poGrid.cols
		let iRad = 0
		const iMidrow = Math.round(poGrid.rows / 2)

		for (let iNc = 1; iNc <= poGrid.cols; iNc++) {
			const fSin = Math.sin(iRad)
			const iNr = iMidrow + Math.round(fSin * iMidrow)
			poGrid.setCellValue(
				iNr,
				iNc,
				1
			)
			iRad += dRadian
		}
	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_vert_line (poGrid) {
		// cDebug.write('init vline')
		const iNc = Math.floor(poGrid.cols / 2)
		for (let iNr = 1; iNr <= poGrid.cols; iNr++)
			poGrid.setCellValue(
				iNr,
				iNc,
				1
			)

	}

	//* ***************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	static init_block (poGrid) {
		// cDebug.write('init block')
		const iMidC = Math.floor(poGrid.cols / 2)
		const iMidR = Math.floor(poGrid.rows / 2)
		for (let iNc = iMidC; iNc <= iMidC + 1; iNc++)
			for (let iNr = iMidR; iNr <= iMidR + 1; iNr++)
				poGrid.setCellValue(
					iNr,
					iNc,
					1
				)

	}
}
