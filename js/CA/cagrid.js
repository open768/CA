"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
/* global $,bean,cDebug,CAException,cSparseArray,cCACell,cCACellTypes */

/**
 * Description placeholder
 * 
 *
 * @class cCAGridTypes
 * @typedef {cCAGridTypes}
 */class cCAGridTypes {
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @type {{ blank: { id: number; label: string; }; block: { id: number; label: string; }; checker: { id: number; label: string; }; circle: { id: number; label: string; }; cross: { id: number; label: string; }; diagonal: { id: number; label: string; }; ... 4 more ...; vert_line: { ...; }; }}
	 */
	static init = {
		blank: { id: 0, label: "Blank" },
		block: { id: 1, label: "Block" },
		checker: { id: 2, label: "Checker" },
		circle: { id: 3, label: "Circle" },
		cross: { id: 4, label: "Cross" },
		diagonal: { id: 5, label: "Diagonal" },
		diamond: { id: 6, label: "Diamond" },
		horiz_line: { id: 7, label: "H-Line" },
		sine: { id: 8, label: "Sine" },
		random: { id: 9, label: "Random" },
		vert_line: { id: 10, label: "V-Line" }
	}
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @type {{ play: number; stop: number; step: number; }}
	 */
	static actions = {
		play: 1,
		stop: 2,
		step: 3
	}
}

/**
 * Description placeholder
 * 
 *
 * @class cCAGridRunData
 * @typedef {cCAGridRunData}
 */
class cCAGridRunData {
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {number}
	 */
	active = 0
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {number}
	 */
	runs = 0
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {number}
	 */
	changed = 0
}

//*************************************************************************
/**
 * Description placeholder
 * 
 *
 * @class cCAGridEvent
 * @typedef {cCAGridEvent}
 */
class cCAGridEvent {
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @type {string}
	 */
	static hook = "CAGEVH"
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @type {{ done: string; clear: string; nochange: string; init_grid: string; }}
	 */
	static actions = {
		done: "GDN",
		clear: "GCL",
		nochange: "GNO",
		init_grid: "GID"
	}

	/**
	 * Description placeholder
	 * 
	 *
	 * @type {*}
	 */
	action = null
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {*}
	 */
	data = null
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {*}
	 */
	name = null

	/**
	 * Creates an instance of cCAGridEvent.
	 * 
	 *
	 * @constructor
	 * @param {*} psName
	 * @param {*} psAction
	 * @param {*} poData
	 */
	constructor(psName, psAction, poData) {
		if (psName == null || psAction == null) $.error("missing params")
		this.name = psName
		this.action = psAction
		this.data = poData
	}

	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} poObject
	 */
	trigger(poObject) {
		bean.fire(poObject, cCAGridEvent.hook_name(this.name), this)
	}

	/**
	 * Description
	 * @param {cCAGrid|string} pvGrid
	 * @returns {any}
	 */
	static hook_name(pvGrid) {
		if (typeof pvGrid == "string")
			return (this.hook + pvGrid)
		else
			return (this.hook + pvGrid.name)
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/** initialises the grid */
class cCAGridInitialiser {

	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} poGrid
	 * @param {*} piInitType
	 */
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

				for (var i = 10; i >= 0; i--) {
					var dx = i
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

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/**
 * Description placeholder
 * 
 *
 * @class cCAGrid
 * @typedef {cCAGrid}
 */
/* eslint-disable-next-line no-unused-vars */
class cCAGrid {
	//#######################################################################
	//# instance variables
	//#######################################################################
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {*}
	 */
	cell_data = null
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {*}
	 */
	name = null

	/**
	 * Creates an instance of cCAGrid.
	 * 
	 *
	 * @constructor
	 * @param {*} psName
	 * @param {*} piRows
	 * @param {*} piCols
	 */
	constructor(psName, piRows, piCols) {
		if (!psName) throw new CAException("no grid name")
		if (piRows == null || piCols == null) throw new CAException("bad size information")

		this.rows = piRows
		this.cols = piCols
		this.name = psName
		this.rule = null
		this.changed_cells = null
		this.running = false
		this.status = new cCAGridRunData()
	}

	//#######################################################################
	//# methods
	//#######################################################################
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} piAction
	 */
	action(piAction) {
		cDebug.enter()
		if (this.rule == null) throw new CAException("no rule set")

		cDebug.write("running action: " + piAction)
		switch (piAction) {
			case cCAGridTypes.actions.play:
				if (this.running) throw new CAException("CA is allready running")
				this.running = true
				this.step()
				this.status.runs = 1
				break
			case cCAGridTypes.actions.stop:
				if (!this.running)
					throw new CAException("CA is not running")
				this.running = false
				break
			case cCAGridTypes.actions.step:
				this.step()
				break
			default:
				throw new CAException("action not recognised: " + piAction)
		}
		cDebug.write("done action: " + piAction)
		cDebug.leave()
	}

	//****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} poRule
	 */
	set_rule(poRule) {
		cDebug.enter()
		//clear rules from all cells
		this.clear_cell_rules()

		//set the rule for the grid
		this.rule = poRule
		this.pr__link_cells()
		cDebug.leave()
	}



	//****************************************************************
	/**
	 * Description placeholder
	 * 
	 */
	step() {
		//TODO shouldnt be able to step until changed_cells are consumed

		this.changed_cells = []
		this.status.changed = 0
		this.status.active = 0

		cDebug.write("stepping")

		//apply rules
		var bHasChanged, oCell, oEvent
		for (var iRow = 1; iRow <= this.rows; iRow++)
			for (var iCol = 1; iCol <= this.cols; iCol++) {
				cDebug.write("cell row: " + iRow + " col:" + iCol)
				oCell = this.getCell(iRow, iCol, true)
				if (oCell.rule == null) oCell.rule = this.rule
				bHasChanged = oCell.apply_rule() //apply rule to each cell
				if (bHasChanged) this.changed_cells.push(oCell)
				if (oCell.value > 0) this.status.active++
			}

		//check how many cells changed
		var iChangedLen = this.changed_cells.length
		this.status.changed = iChangedLen
		if (iChangedLen == 0) {
			this.running = false
			oEvent = new cCAGridEvent(this.name, cCAGridEvent.actions.nochange)
			oEvent.trigger(this)
			return
		}

		//promote changed cells
		for (var iIndex = 0; iIndex < iChangedLen; iIndex++) {
			oCell = this.changed_cells[iIndex]
			oCell.promote()
			if (oCell.value == 0)
				this.status.active--
			else
				this.status.active++
		}
		oEvent = new cCAGridEvent(this.name, cCAGridEvent.actions.done, this.status)
		oEvent.trigger(this)
	}

	//****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} piInitType
	 */
	init(piInitType) {
		cDebug.enter()
		if (this.running) throw new CAException("cant init when running")

		this.changed_cells = []
		cDebug.write("initialising grid:" + piInitType)
		var oInitialiser = new cCAGridInitialiser()
		oInitialiser.init(this, piInitType)
		cDebug.write("done init grid: " + piInitType)

		var oEvent = new cCAGridEvent(this.name, cCAGridEvent.actions.done, this.status)
		oEvent.trigger(this)

		cDebug.leave()
	}

	//****************************************************************
	/**
	 * Description placeholder
	 * 
	 */
	create_cells() {
		cDebug.enter()

		//clear out existing cells
		this.cell_data = new cSparseArray(this.rows, this.cols)

		//create blank cells
		for (var iNr = 1; iNr <= this.rows; iNr++)
			for (var iNc = 1; iNc <= this.cols; iNc++)
				this.setCellValue(iNr, iNc, 0)

		//reset instance state
		this.changed_cells = []

		//link if there is a rule
		if (this.rule) this.pr__link_cells()

		var oEvent = new cCAGridEvent(this.name, cCAGridEvent.actions.clear)
		oEvent.trigger(this)
		cDebug.leave()
	}

	//****************************************************************
	/**
	 * Description placeholder
	 * 
	 */
	clear_cell_rules() {
		cDebug.enter()
		var oCell
		for (var iNr = 1; iNr <= this.rows; iNr++)
			for (var iNc = 1; iNc <= this.cols; iNc++) {
				oCell = this.getCell(iNr, iNc)
				if (oCell !== null) oCell.rule = null
			}
		cDebug.leave()
	}

	//****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} piRow
	 * @param {*} piCol
	 * @param {*} iValue
	 * @returns {*}
	 */
	setCellValue(piRow, piCol, iValue) {
		if (this.cell_data == null)
			throw new CAException("grid not initialised")

		var oCell = this.getCell(piRow, piCol, false)
		if (oCell == null) {
			oCell = new cCACell
			oCell.data.set(cCACellTypes.hash_values.row, piRow)
			oCell.data.set(cCACellTypes.hash_values.col, piCol)
			this.cell_data.set(piRow, piCol, oCell)
		}

		if (iValue !== oCell.value) {
			oCell.value = iValue
			this.changed_cells.push(oCell)
		}
		return oCell
	}

	//****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} piRow
	 * @param {*} piCol
	 * @param {boolean} [pbCreate=false]
	 * @returns {*}
	 */
	getCell(piRow, piCol, pbCreate = false) {
		if (this.cell_data == null) return null
		var oCell = this.cell_data.get(piRow, piCol)
		if (pbCreate && oCell == null)
			oCell = this.setCellValue(piRow, piCol, 0)

		return oCell
	}

	//#######################################################################
	//# events
	//#######################################################################
	/**
	 * Description
	 * @param {Function} pFn
	 */
	on_event(pFn) {
		bean.on(this, cCAGridEvent.hook_name(this), pFn)
	}

	//****************************************************************
	/**
	 * Description placeholder
	 * 
	 */
	notifyDrawn() {
		cDebug.enter()
		var oThis = this
		if (this.running) {
			cDebug.write("running again")
			this.status.runs++
			setTimeout(function () { oThis.step() }, 50) //delay is needed to yield
		}
		cDebug.leave()
	}

	//#######################################################################
	//# privates
	//#######################################################################
	/**
	 * Description placeholder
	 * 
	 */
	pr__link_cells() {
		cDebug.enter()
		if (!this.rule) throw new Error("no rule set")

		var iType = this.rule.neighbour_type

		cDebug.write("linking cells")
		for (var iNr = 1; iNr <= this.rows; iNr++)
			for (var iNc = 1; iNc <= this.cols; iNc++) {
				var oCell = this.getCell(iNr, iNc, true) //create cells
				this.pr__link_cell(oCell, cCACellTypes.directions.north, iNr - 1, iNc)
				this.pr__link_cell(oCell, cCACellTypes.directions.east, iNr, iNc + 1)
				this.pr__link_cell(oCell, cCACellTypes.directions.south, iNr + 1, iNc)
				this.pr__link_cell(oCell, cCACellTypes.directions.west, iNr, iNc - 1)
				if (iType == cCACellTypes.neighbours.eightway) {
					this.pr__link_cell(oCell, cCACellTypes.directions.northeast, iNr - 1, iNc + 1)
					this.pr__link_cell(oCell, cCACellTypes.directions.southeast, iNr + 1, iNc + 1)
					this.pr__link_cell(oCell, cCACellTypes.directions.southwest, iNr + 1, iNc - 1)
					this.pr__link_cell(oCell, cCACellTypes.directions.northwest, iNr - 1, iNc - 1)
				}
			}
		cDebug.write("completed cell linking")
		cDebug.leave()
	}

	//****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} poCell
	 * @param {*} piDirection
	 * @param {*} piNRow
	 * @param {*} piNCol
	 */
	pr__link_cell(poCell, piDirection, piNRow, piNCol) {
		var iNr, iNc
		//wrap around neighbour row and col
		iNr = piNRow
		if (iNr < 1) iNr = this.rows
		if (iNr > this.rows) iNr = 1

		iNc = piNCol
		if (iNc < 1) iNc = this.cols
		if (iNc > this.cols) iNc = 1

		//get the neighbour
		var oNeigh = this.getCell(iNr, iNc, true) //shouldnt need to create cells, but just in case
		poCell.setNeighbour(piDirection, oNeigh)
	}

}