//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/** initialises the grid */

class cCAGridInitialiser {
	init(poGrid, piInitType) {
		cDebug.enter()
		cDebug.write('init_type:' + piInitType)
		//always blank first by creating new cells
		poGrid.create_cells()

		switch (piInitType) {
			case cCAGridTypes.init.blank.id:
				break
			case cCAGridTypes.init.block.id:
				this.init_block(poGrid)
				break
			case cCAGridTypes.init.checker.id:
				this.init_checker(poGrid)
				break
			case cCAGridTypes.init.circle.id:
				this.init_circle(poGrid)
				break
			case cCAGridTypes.init.cross.id:
				this.init_cross(poGrid)
				break
			case cCAGridTypes.init.diagonal.id:
				this.init_diagonal(poGrid)
				break
			case cCAGridTypes.init.diamond.id:
				this.init_diamond(poGrid)
				break
			case cCAGridTypes.init.horiz_line.id:
				this.init_horiz_line(poGrid)
				break
			case cCAGridTypes.init.random.id:
				this.init_random(poGrid)
				break
			case cCAGridTypes.init.sine.id:
				this.init_sine(poGrid)
				break
			case cCAGridTypes.init.vert_line.id:
				this.init_vert_line(poGrid)
				break
			//--------------------------------------------------------
			default:
				throw new CAException('unknown init_type: ' + piInitType)
		}
		cDebug.leave()
	}

	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_checker(poGrid) {
		cDebug.write('init checker')
		var iStartCol = 1
		var iSize = 3
		for (var iRow = 1; iRow <= poGrid.rows; iRow += iSize) {
			for (var iCol = iStartCol; iCol <= poGrid.cols; iCol += iSize * 2) {
				for (var iDeltaR = 0; iDeltaR < iSize; iDeltaR++) {
					for (var iDeltaC = 0; iDeltaC < iSize; iDeltaC++) {
						poGrid.setCellValue(iRow + iDeltaR, iCol + iDeltaC, 1)
					}
				}
			}

			if (iStartCol == 1) {
				iStartCol = iSize + 1
			} else {
				iStartCol = 1
			}
		}
	}

	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_circle(poGrid) {
		cDebug.write('init circle')
		var iMidC = Math.floor(poGrid.cols / 2)
		var iMidR = Math.floor(poGrid.rows / 2)

		var iDiameter = Math.min(iMidC, iMidR) / 2
		var iDSq = iDiameter * iDiameter
		for (var x = iDiameter; x >= 0; x--) {
			var y = Math.sqrt(iDSq - Math.pow(x, 2))
			y = Math.round(Math.abs(y))
			poGrid.setCellValue(iMidR + y, iMidC - x, 1)
			poGrid.setCellValue(iMidR - y, iMidC - x, 1)
			poGrid.setCellValue(iMidR + y, iMidC + x, 1)
			poGrid.setCellValue(iMidR - y, iMidC + x, 1)
		}
	}

	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_cross(poGrid) {
		cDebug.write('init cross')
		var iMidC = Math.floor(poGrid.cols / 2)
		var iMidR = Math.floor(poGrid.rows / 2)

		poGrid.setCellValue(iMidR, iMidC, 1)
		for (var i = 1; i <= 4; i++) {
			poGrid.setCellValue(iMidR + i, iMidC, 1)
			poGrid.setCellValue(iMidR - i, iMidC, 1)
			poGrid.setCellValue(iMidR, iMidC + i, 1)
			poGrid.setCellValue(iMidR, iMidC - i, 1)
		}
	}

	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_diagonal(poGrid) {
		cDebug.write('init diagonal')
		for (var iNr = 1; iNr <= poGrid.rows; iNr++) {
			if (iNr > poGrid.cols) {
				break
			}
			poGrid.setCellValue(iNr, iNr, 1)
		}
	}

	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_diamond(poGrid) {
		cDebug.write('init diamond')
		var iMidCol = Math.floor(poGrid.cols / 2)
		var iMidRow = Math.floor(poGrid.rows / 2)

		for (var iStep = 10; iStep >= 0; iStep--) {
			//10 point on each diamond side
			var dx = iStep
			var dy = 10 - dx

			poGrid.setCellValue(iMidRow - dy, iMidCol - dx, 1)
			poGrid.setCellValue(iMidRow - dy, iMidCol + dx, 1)
			poGrid.setCellValue(iMidRow + dy, iMidCol - dx, 1)
			poGrid.setCellValue(iMidRow + dy, iMidCol + dx, 1)
		}
	}

	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_horiz_line(poGrid) {
		cDebug.write('init hline')
		var iNr = Math.floor(poGrid.rows / 2)
		for (var iNc = 1; iNc <= poGrid.cols; iNc++) {
			poGrid.setCellValue(iNr, iNc, 1)
		}
	}

	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_random(poGrid) {
		cDebug.write('init random')
		for (var iNr = 1; iNr <= poGrid.rows; iNr++) {
			for (var iNc = 1; iNc <= poGrid.cols; iNc++) {
				var iRnd = Math.round(Math.random())
				poGrid.setCellValue(iNr, iNc, iRnd)
			}
		}
	}

	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_sine(poGrid) {
		cDebug.write('init sine')
		var dRadian = (2 * Math.PI) / poGrid.cols
		var iRad = 0
		var iMidrow = Math.round(poGrid.rows / 2)

		for (var iNc = 1; iNc <= poGrid.cols; iNc++) {
			var fSin = Math.sin(iRad)
			var iNr = iMidrow + Math.round(fSin * iMidrow)
			poGrid.setCellValue(iNr, iNc, 1)
			iRad += dRadian
		}
	}

	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_vert_line(poGrid) {
		cDebug.write('init vline')
		var iNc = Math.floor(poGrid.cols / 2)
		for (var iNr = 1; iNr <= poGrid.cols; iNr++) {
			poGrid.setCellValue(iNr, iNc, 1)
		}
	}
	//****************************************************************************
	/**
	 * @param {cCAGrid} poGrid
	 */
	init_block(poGrid) {
		cDebug.write('init block')
		var iMidC = Math.floor(poGrid.cols / 2)
		var iMidR = Math.floor(poGrid.rows / 2)
		for (var iNc = iMidC; iNc <= iMidC + 1; iNc++) {
			for (var iNr = iMidR; iNr <= iMidR + 1; iNr++) {
				poGrid.setCellValue(iNr, iNc, 1)
			}
		}
	}
}
