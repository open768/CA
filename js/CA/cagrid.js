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
	changed_cells = null
}

/* eslint-disable-next-line no-unused-vars */
class cCAGridCell {
	row = null
	col=null
	value=null
	
	constructor (piRow, piCol, piValue){
		this.row = piRow
		this.col = piCol
		this.value = piValue
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/* eslint-disable-next-line no-unused-vars */
class cCAGrid {
	//#######################################################################
	//# instance variables
	//#######################################################################
	#cell_data = null
	#name = null
	#running = false
	rows=0
	cols=0
	#rule=null
	#changed_cells = null
	#runData = null
	#history = []
	static HISTORY_LEN = 40

	/**
	 * Creates an instance of cCAGrid.
	 *
	 * @constructor
	 * @param {string} psName
	 * @param {number} piRows
	 * @param {number} piCols
	 */
	constructor(psName, piRows, piCols) {
		if (!md5) $.error("js-md5 library missing")
		if (!psName) throw new CAException("no grid name")
		if (piRows == null || piCols == null) throw new CAException("bad size information")

		this.rows = piRows
		this.cols = piCols
		this.#name = psName
		this.#rule = null
		this.#changed_cells = null
		this.#running = false
		this.#runData = new cCAGridRunData()

		var oThis = this
		cCAEventHelper.subscribe_to_grid_events(this.#name, (poEvent)=>{oThis.onCAGridEvent(poEvent)})
		cCAEventHelper.subscribe_to_action_events(this.#name, (poEvent)=>{oThis.onCAActionEvent(poEvent)})
		cCAEventHelper.subscribe_to_rule_events(this.#name, (poEvent)=>{oThis.onCARuleEvent(poEvent)})
	}

	//#######################################################################
	//# event handlers
	//#######################################################################
	onCARuleEvent(poEvent){
		switch(poEvent.action){
			case cCARuleEvent.actions.set_rule:
				this.set_rule(poEvent.data)
		}
	}

	onCAActionEvent(poEvent){
		switch(poEvent.action){
			case cCAActionEvent.actions.grid_init:
				this.#init(poEvent.data)
				break
			case cCAActionEvent.actions.control:
				this.#action(poEvent.data)
				break
		}
	}

		/**
	 * @param {cCAGridEvent} poEvent
	 */
	onCAGridEvent(poEvent){
		switch(poEvent.action){
			case cCAGridEvent.notify.changedCellsConsumed:
				this.#onNotifyCellsConsumed()
				break
			case cCAGridEvent.actions.set_cell:
				this.#onSetOneCellOnly(poEvent.data)
				break
		}
	}

	//#######################################################################
	//# methods
	//#######################################################################
	is_running(){
		return this.#running
	}

	//****************************************************************
	/**
	 * @param {cCARule} poRule
	 */
	set_rule(poRule, pbLinkCells = true) {
		cDebug.enter()
		//clear rules from all cells
		this.#clear_cell_rules()

		//set the rule for the grid
		this.#rule = poRule
		if (pbLinkCells) this.#link_cells()
		cDebug.leave()
	}
	
	//****************************************************************
	get_rule(){
		return this.#rule
	}

	//****************************************************************
	//****************************************************************
	create_cells() {
		cDebug.enter()

		//clear out existing cells
		this.#cell_data = new cSparseArray(this.rows, this.cols)
		this.#changed_cells = []

		//create blank cells
		for (var iNr = 1; iNr <= this.rows; iNr++)
			for (var iNc = 1; iNc <= this.cols; iNc++)
				this.setCellValue(iNr, iNc, 0)

		//reset instance state
		this.#changed_cells = null
		this.#history = []

		//link if there is a rule
		if (this.#rule) this.#link_cells()

		var oEvent = new cCAGridEvent(this.#name, cCAGridEvent.notify.clear)
		oEvent.trigger()
		cDebug.leave()
	}

	//****************************************************************
	/**
	 * @param {number} piRow
	 * @param {number} piCol
	 * @param {number} iValue
	 * @returns {cCACell}
	 */
	setCellValue(piRow, piCol, iValue) {
		if (this.#cell_data == null)
			throw new CAException("grid not initialised")

		var oCell = this.getCell(piRow, piCol, false)
		if (oCell == null) {
			oCell = new cCACell
			oCell.data.set(cCACellTypes.hash_values.row, piRow)
			oCell.data.set(cCACellTypes.hash_values.col, piCol)
			this.#cell_data.set(piRow, piCol, oCell)
		}

		if (iValue !== oCell.value) {
			oCell.value = iValue
			if (this.#changed_cells == null) this.#changed_cells = []
			this.#changed_cells.push(oCell)
		}
		return oCell
	}

	//****************************************************************
	/**
	 * @param {number} piRow
	 * @param {number} piCol
	 * @param {boolean} pbCreate
	 * @returns {cCACell}
	 */
	getCell(piRow, piCol, pbCreate = false) {
		if (this.#cell_data == null) return null
		var oCell = this.#cell_data.get(piRow, piCol)
		if (pbCreate && oCell == null)
			oCell = this.setCellValue(piRow, piCol, 0)

		return oCell
	}

	//****************************************************************
	//****************************************************************
	get_changed_cells(){
		return this.#changed_cells
	}

	//#######################################################################
	//Privates
	//#######################################################################
	#action(piAction) {
		cDebug.enter()
		if (this.#rule == null) throw new CAException("no rule set")

		cDebug.write("running action: " + piAction)
		switch (piAction) {
			case cCAGridTypes.actions.play:
				if (this.#running) throw new CAException("CA is allready running")
				this.#running = true
				this.#step()
				this.#runData.runs = 1
				break
			case cCAGridTypes.actions.stop:
				if (!this.#running)
					throw new CAException("CA is not running")
				this.#running = false
				break
			case cCAGridTypes.actions.step:
				this.#step()
				break
			default:
				throw new CAException("action not recognised: " + piAction)
		}
		cDebug.write("done action: " + piAction)
		cDebug.leave()
	}

	//****************************************************************
	#step(){
		//cant step until changed_cells are consumed
		if (this.#changed_cells)
			throw new CAException("changed cells must be consumed before stepping")

		//reset counters
		this.#changed_cells = []
		this.#runData.changed = 0
		this.#runData.active = 0
		cDebug.write("stepping")

		//apply rules
		var bHasChanged, oCell, oEvent
		for (var iRow = 1; iRow <= this.rows; iRow++)
			for (var iCol = 1; iCol <= this.cols; iCol++) {
				cDebug.write("cell row: " + iRow + " col:" + iCol)
				oCell = this.getCell(iRow, iCol, true)
				if (oCell.rule == null) oCell.rule = this.#rule
				bHasChanged = oCell.apply_rule() //apply rule to each cell
				if (bHasChanged) this.#changed_cells.push(oCell) //if the cell has changed remember it
				if (oCell.value > 0) this.#runData.active++
			}

		//check how many cells changed
		var iChangedLen = this.#changed_cells.length
		this.#runData.changed = iChangedLen
		if (iChangedLen == 0) {
			this.#running = false
			cDebug.warn("no change detected in grid")
			this.#changed_cells = null
			oEvent = new cCAGridEvent(this.#name, cCAGridEvent.notify.nochange)			
			oEvent.trigger()
			return
		}

		//promote changed cells
		for (var iIndex = 0; iIndex < iChangedLen; iIndex++) {
			oCell = this.#changed_cells[iIndex]
			oCell.promote()
			if (oCell.value == 0)
				this.#runData.active--
			else
				this.#runData.active++
		}

		this.#add_to_history()

		this.#informGridDone()
	}

	//****************************************************************
	#init(piInitType) {
		cDebug.enter()
		if (this.#running) throw new CAException("cant init when running")

		this.#changed_cells = []
		this.#history = []
		cDebug.write("initialising grid:" + piInitType)
		var oInitialiser = new cCAGridInitialiser()
		oInitialiser.init(this, piInitType)
		cDebug.write("done init grid: " + piInitType)

		this.#informGridDone()
		cDebug.leave()
	}

	//****************************************************************
	#clear_cell_rules() {
		cDebug.enter()
		var oCell
		for (var iNr = 1; iNr <= this.rows; iNr++)
			for (var iNc = 1; iNc <= this.cols; iNc++) {
				oCell = this.getCell(iNr, iNc)
				if (oCell !== null) oCell.rule = null
			}
		cDebug.leave()
	}

	//#######################################################################
	//# events
	//#######################################################################
	#informGridDone(){
		//inform consumers that grid has executed
		this.#runData.changed_cells = this.#changed_cells
		this.#changed_cells = null
		var oEvent = new cCAGridEvent(this.#name, cCAGridEvent.notify.done, this.#runData)
		oEvent.trigger()
	}

	/**
	 * Sets a single cell
	 * @param {cCAGridCell} poCell
	 */
	#onSetOneCellOnly(poCell){
		this.#changed_cells = []
		this.setCellValue(poCell.row, poCell.col, poCell.value)
		this.#informGridDone()
	}

	/**
	 * Description
	 */
	#onNotifyCellsConsumed() {
		cDebug.enter()
		this.#changed_cells = null		//always clean out the changed cells
		
		if (this.#running) {
			cDebug.write("running again")
			this.#runData.runs++
			var oEvent = new cCAActionEvent(this.#name,  cCAActionEvent.actions.control, cCAGridTypes.actions.step);
			oEvent.trigger()
		}
		cDebug.leave()
	}

	//#######################################################################
	//# privates
	//#######################################################################
	#add_to_history(){
		//trim the history
		var aHistory = this.#history
		while (aHistory.length > cCAGrid.HISTORY_LEN)
			aHistory.shift()


		var sHash = this.#changed_cells_hash()
		if (aHistory.includes(sHash)){
			this.#running = false
			cDebug.warn("repeat pattern seen")
			var oEvent = new cCAGridEvent(this.#name, cCAGridEvent.notify.repeatPattern)
			oEvent.trigger()
			return
		}
		aHistory.push(sHash)
	}

	#changed_cells_hash(){
		//create a hash code
		var sBinary = ""
		var iCountOnes = 0
		var iCountZeros = 0
		
		this.#changed_cells.forEach(poCell => {
			sBinary += poCell.value
			if (poCell.value !== 0) 
				iCountOnes ++;
			else
				iCountZeros ++;
		})

		var sHash = md5(sBinary) + "_"+iCountOnes+","+ iCountZeros

		return sHash
	}

	//****************************************************************
	#link_cells() {
		cDebug.enter()
		if (!this.#rule) throw new Error("no rule set")

		var iType = this.#rule.neighbour_type

		cDebug.write("linking cells")
		for (var iNr = 1; iNr <= this.rows; iNr++)
			for (var iNc = 1; iNc <= this.cols; iNc++) {
				var oCell = this.getCell(iNr, iNc, true) //create cells
				this.#link_cell(oCell, cCACellTypes.directions.north, iNr - 1, iNc)
				this.#link_cell(oCell, cCACellTypes.directions.east, iNr, iNc + 1)
				this.#link_cell(oCell, cCACellTypes.directions.south, iNr + 1, iNc)
				this.#link_cell(oCell, cCACellTypes.directions.west, iNr, iNc - 1)
				if (iType == cCACellTypes.neighbours.eightway) {
					this.#link_cell(oCell, cCACellTypes.directions.northeast, iNr - 1, iNc + 1)
					this.#link_cell(oCell, cCACellTypes.directions.southeast, iNr + 1, iNc + 1)
					this.#link_cell(oCell, cCACellTypes.directions.southwest, iNr + 1, iNc - 1)
					this.#link_cell(oCell, cCACellTypes.directions.northwest, iNr - 1, iNc - 1)
				}
			}
		cDebug.write("completed cell linking")
		cDebug.leave()
	}

	//****************************************************************
	#link_cell(poCell, piDirection, piNRow, piNCol) {
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