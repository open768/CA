"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAGridRunData {
	active = 0
	runs = 0
	changed = 0
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/* eslint-disable-next-line no-unused-vars */
class cCAGrid {
	//#######################################################################
	//# instance variables
	//#######################################################################
	cell_data = null
	name = null
	STEP_DELAY = 50 //more for 

	/**
	 * Creates an instance of cCAGrid.
	 *
	 * @constructor
	 * @param {string} psName
	 * @param {number} piRows
	 * @param {number} piCols
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

		var oThis = this
		cCAEventHelper.subscribe_to_grid_events(this, (poEvent)=>{oThis.onCAGridEvent(poEvent)})
	}

	//#######################################################################
	//# event handlers
	//#######################################################################
	onCAGridEvent(poEvent){
		var oThis = this
		switch(poEvent.action){
			case cCAGridEvent.actions.step_grid:
				setTimeout(function () { oThis.step() }, this.STEP_DELAY)	//needs to yield
				break
			case cCAGridEvent.actions.notifyDrawn:
				this.onNotifyDrawn()
				break
		}

	}

	//#######################################################################
	//# methods
	//#######################################################################
	action(piAction) {
		cDebug.enter()
		var oThis = this
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
				setTimeout(function () { oThis.step() }, this.STEP_DELAY)	//needs to yield
				break
			default:
				throw new CAException("action not recognised: " + piAction)
		}
		cDebug.write("done action: " + piAction)
		cDebug.leave()
	}

	//****************************************************************
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
	step() {
		//cant step until changed_cells are consumed
		if (this.changed_cells)
			throw new CAException("changed cells must be consumed before stepping")

		//reset counters
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
				if (bHasChanged) this.changed_cells.push(oCell) //if the cell has changed remember it
				if (oCell.value > 0) this.status.active++
			}

		//check how many cells changed
		var iChangedLen = this.changed_cells.length
		this.status.changed = iChangedLen
		if (iChangedLen == 0) {
			this.running = false
			oEvent = new cCAGridEvent(this, cCAGridEvent.actions.nochange)
			oEvent.trigger()
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

		//inform consumers that grid has executed
		oEvent = new cCAGridEvent(this, cCAGridEvent.actions.done, this.status)
		oEvent.trigger()
	}

	//****************************************************************
	init(piInitType) {
		cDebug.enter()
		if (this.running) throw new CAException("cant init when running")

		this.changed_cells = []
		cDebug.write("initialising grid:" + piInitType)
		var oInitialiser = new cCAGridInitialiser()
		oInitialiser.init(this, piInitType)
		cDebug.write("done init grid: " + piInitType)

		var oEvent = new cCAGridEvent(this, cCAGridEvent.actions.done, this.status)
		oEvent.trigger()

		cDebug.leave()
	}

	//****************************************************************
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

		var oEvent = new cCAGridEvent(this, cCAGridEvent.actions.clear)
		oEvent.trigger()
		cDebug.leave()
	}

	//****************************************************************
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

	onNotifyDrawn() {
		cDebug.enter()
		var oThis = this
		this.changed_cells = null
		
		if (this.running) {
			cDebug.write("running again")
			this.status.runs++
			var oEvent = new cCAGridEvent(this, cCAGridEvent.actions.step_grid);
			oEvent.trigger()
		}
		cDebug.leave()
	}

	//#######################################################################
	//# privates
	//#######################################################################
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