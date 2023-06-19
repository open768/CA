//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/** initialises the grid */
/* eslint-disable-next-line no-unused-vars */
class cCAGridInitialiser {
	init(poGrid, piInitType) {
		cDebug.enter()
		cDebug.write("init_type:" + piInitType)
		var iMidC,iMidR,iNr, iNc
		//always blank first by creating new cells
		poGrid.create_cells()

		switch (piInitType) {
			case cCAGridTypes.init.blank.id:
				cDebug.write("init blank")
				break

			//------------------------------------------------------
			case cCAGridTypes.init.block.id:
				cDebug.write("init block")
				iMidC = Math.floor(poGrid.cols / 2)
				iMidR = Math.floor(poGrid.rows / 2)
				for (iNc = iMidC; iNc <= iMidC + 1; iNc++)
					for (iNr = iMidR; iNr <= iMidR + 1; iNr++)
						poGrid.setCellValue(iNr, iNc, 1)
				break

			//------------------------------------------------------
			case cCAGridTypes.init.checker.id:
				cDebug.write("init checker")
				var iStartCol = 1
				var iSize = 3
				for (var iRow = 1; iRow <= poGrid.rows; iRow += iSize) {
					for (var iCol = iStartCol; iCol <= poGrid.cols; iCol += (iSize * 2)) {
						for (var iDeltaR = 0; iDeltaR < iSize; iDeltaR++)
							for (var iDeltaC = 0; iDeltaC < iSize; iDeltaC++)
								poGrid.setCellValue(iRow + iDeltaR, iCol + iDeltaC, 1)
					}

					if (iStartCol == 1)
						iStartCol = iSize + 1
					else
						iStartCol = 1
				}
				break

			//------------------------------------------------------
			case cCAGridTypes.init.circle.id:
				cDebug.write("init circle")
				iMidC = Math.floor(poGrid.cols / 2)
				iMidR = Math.floor(poGrid.rows / 2)

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
				break

			//------------------------------------------------------
			case cCAGridTypes.init.cross.id:
				cDebug.write("init cross")
				iMidC = Math.floor(poGrid.cols / 2)
				iMidR = Math.floor(poGrid.rows / 2)

				poGrid.setCellValue(iMidR, iMidC, 1)
				for (var i = 1; i <= 4; i++) {
					poGrid.setCellValue(iMidR + i, iMidC, 1)
					poGrid.setCellValue(iMidR - i, iMidC, 1)
					poGrid.setCellValue(iMidR, iMidC + i, 1)
					poGrid.setCellValue(iMidR, iMidC - i, 1)
				}
				break

			//------------------------------------------------------
			case cCAGridTypes.init.diagonal.id:
				cDebug.write("init diagonal")
				for (iNr = 1; iNr <= poGrid.rows; iNr++) {
					if (iNr > poGrid.cols) break
					poGrid.setCellValue(iNr, iNr, 1)
				}
				break

			//------------------------------------------------------
			case cCAGridTypes.init.diamond.id:
				cDebug.write("init diamond")
				var iMidCol = Math.floor(poGrid.cols / 2)
				var iMidRow = Math.floor(poGrid.rows / 2)

				for (var iStep = 10; iStep >= 0; iStep--) { //10 point on each diamond side
					var dx = iStep
					var dy = 10 - dx

					poGrid.setCellValue(iMidRow - dy, iMidCol - dx, 1)
					poGrid.setCellValue(iMidRow - dy, iMidCol + dx, 1)
					poGrid.setCellValue(iMidRow + dy, iMidCol - dx, 1)
					poGrid.setCellValue(iMidRow + dy, iMidCol + dx, 1)
				}

				break

			//------------------------------------------------------
			case cCAGridTypes.init.horiz_line.id:
				cDebug.write("init hline")
				iNr = Math.floor(poGrid.rows / 2)
				for (iNc = 1; iNc <= poGrid.cols; iNc++)
					poGrid.setCellValue(iNr, iNc, 1)
				break

			//--------------------------------------------------------
			case cCAGridTypes.init.random.id:
				cDebug.write("init random")
				for (iNr = 1; iNr <= poGrid.rows; iNr++)
					for (iNc = 1; iNc <= poGrid.cols; iNc++) {
						var iRnd = Math.round(Math.random())
						poGrid.setCellValue(iNr, iNc, iRnd)
					}
				break
			//--------------------------------------------------------
			case cCAGridTypes.init.sine.id:
				cDebug.write("init sine")
				var dRadian = 2 * Math.PI / poGrid.cols
				iMidR = Math.floor(poGrid.rows / 2)
				var iRad = 0
				var iMidrow = Math.round(poGrid.rows / 2)

				for (iNc = 1; iNc <= poGrid.cols; iNc++) {
					var fSin = Math.sin(iRad)
					iNr = iMidrow + Math.round(fSin * iMidrow)
					poGrid.setCellValue(iNr, iNc, 1)
					iRad += dRadian
				}
				break

			//------------------------------------------------------
			case cCAGridTypes.init.vert_line.id:
				cDebug.write("init vline")
				iNc = Math.floor(poGrid.cols / 2)
				for (iNr = 1; iNr <= poGrid.cols; iNr++)
					poGrid.setCellValue(iNr, iNc, 1)
				break

			//--------------------------------------------------------
			default:
				throw new CAException("unknown init_type: " + piInitType)
		}
		cDebug.leave()
	}
}
