'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAGridCell {
	row = null
	col = null
	value = null

	constructor(piRow, piCol, piValue) {
		this.row = piRow
		this.col = piCol
		this.value = piValue
	}
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/**
 * 	cCAGrid is the main class for the cellular automata.
 *  It contains the cells and applies the rules to them.
 *  It also fires events as the grid changes.
 */
class cCAGrid extends CAEventSubscriber {
	//#######################################################################
	// # instance variables
	//#######################################################################
	cell_data = null
	/** @type {string} */ name = null
	/** @type {boolean} */ running = false
	/** @type {number} */ rows = 0
	/** @type {number} */ cols = 0
	/** @type {cCARule} */ rule = null
	/** @type {cCARunData} */ runData = new cCARunData()
	/** @type {Array} */ history = []
	/** @type {cCAStatus} */ counts = new cCAStatus()

	static HISTORY_LEN = 40

	/**
	 * Creates an instance of cCAGrid.
	 \*	 * @constructor
	 * @param {string} psName
	 * @param {number} piRows
	 * @param {number} piCols
	 */
	constructor(psName, piRows, piCols) {
		super()
		if (!md5)
			$.error('js-md5 library missing')
		if (!psName)
			throw new CAException('no base name')
		if (piRows == null || piCols == null)
			throw new CAException('bad size information')

		this.rows = piRows
		this.cols = piCols
		this.name = psName // gridname

		cCAGridEvent.subscribe(this.name, poEvent => this.onCAGridEvent(poEvent))
		cCAActionEvent.subscribe(this.name, poEvent => this.onCAActionEvent(poEvent))
		cCARuleEvent.subscribe(this.name, poEvent => this.onCARuleEvent(poEvent))
	}

	//#######################################################################
	// # event handlers
	//#######################################################################
	onCARuleEvent(poEvent) {
		if (!this.active)
			return

		switch (poEvent.action) {
			case cCARuleEvent.actions.set_rule:
				this.set_rule(poEvent.data)
				break
			case cCARuleEvent.actions.status:
				this._update_counts(poEvent.data)
				break
		}
	}

	onCAActionEvent(poEvent) {
		if (!this.active)
			return

		switch (poEvent.action) {
			case cCAActionEvent.actions.grid_init:
				this._init(poEvent.data)
				break
			case cCAActionEvent.actions.control:
				this._on_control_action(poEvent.data)
				break
		}
	}

	/**
	 * @param {cCAGridEvent} poEvent
	 */
	onCAGridEvent(poEvent) {
		if (!this.active)
			return

		switch (poEvent.action) {
			case cCAGridEvent.notify.changedCellsConsumed:
				this._onNotifyCellsConsumed()
				break
			case cCAGridEvent.actions.set_cell:
				this._onSetOneCellOnly(poEvent.data)
				break
		}
	}

	//#######################################################################
	// # methods
	//#######################################################################
	/**
	 *
	 * @param {cCAStatus} poStatus
	 */
	_update_counts(poStatus){
		this.runData.active += poStatus.active
		this.runData.inactive += poStatus.inactive
		this.runData.changed += poStatus.changed
		this.runData.bored += poStatus.bored
	}

	is_running() {
		return this.running
	}

	//* ***************************************************************
	/**
	 * @param {cCARule} poRule
	 * @param {boolean} pbLinkCells	 establish links between cells and rules
	 */
	set_rule(poRule, pbLinkCells = true) {
		cDebug.enter()
		// clear rules from all cells
		this._clear_cell_rules()

		// set the rule for the grid
		this.rule = poRule
		if (pbLinkCells)
			this._link_cells()
		cDebug.leave()
	}

	//* ***************************************************************
	/**
	 *
	 * @returns {cCARule}
	 */
	get_rule() {
		return this.rule
	}


	//* ***************************************************************
	/**
	 * @returns {void}
	 */
	create_cells() {
		cDebug.enter()

		// clear out existing cells
		this.cell_data = new cSparseArray(this.rows, this.cols)

		// create blank cells
		for (var iNr = 1; iNr <= this.rows; iNr++)
			for (var iNc = 1; iNc <= this.cols; iNc++)
				this.setCellValue(iNr, iNc, 0)

		// reset instance state
		this.runData.changed_cells = []
		this.history = []

		// link if there is a rule
		if (this.rule)
			this._link_cells()

		cCAGridEvent.fire_event(this.name, cCAGridEvent.notify.clear)
		cDebug.leave()
	}

	//* ***************************************************************
	/**
	 * @param {number} piRow
	 * @param {number} piCol
	 * @param {number} iValue
	 * @returns {cCACell}
	 */
	setCellValue(piRow, piCol, iValue) {
		if (this.cell_data == null)
			throw new CAException('grid not initialised')

		var oCell = this.getCell(piRow, piCol, false)
		if (oCell == null) {
			oCell = new cCACell()
			oCell.data.set(CELL_DATA_KEYS.row, piRow)
			oCell.data.set(CELL_DATA_KEYS.col, piCol)
			this.cell_data.set(piRow, piCol, oCell)
		}

		if (iValue !== oCell.value) {
			oCell.value = iValue
			this.runData.changed_cells.push(oCell)
		}

		return oCell
	}

	//* ***************************************************************
	/**
	 * @param {number} piRow
	 * @param {number} piCol
	 * @param {boolean} pbCreate
	 * @returns {cCACell}
	 */
	getCell(piRow, piCol, pbCreate = false) {
		if (this.cell_data == null)
			return null
		var oCell = this.cell_data.get(piRow, piCol)
		if (pbCreate && oCell == null)
			oCell = this.setCellValue(piRow, piCol, 0)

		return oCell
	}

	//* ***************************************************************
	//* ***************************************************************
	/**
	 *  @returns {Array}
	 */
	get_changed_cells() {
		return this.runData.changed_cells
	}

	//#######################################################################
	// Privates
	//#######################################################################
	_on_control_action(piAction) {
		cDebug.enter()
		if (this.rule == null)
			throw new CAException('no rule set')

		cDebug.write('running action: ' + piAction)
		switch (piAction) {
			case cCAActionEvent.control_actions.play:
				if (this.running)
					throw new CAException('CA is allready running')
				this.running = true
				this._step()
				this.runData.runs = 1
				break
			case cCAActionEvent.control_actions.stop:
				if (!this.running)
					throw new CAException('CA is not running')
				this.running = false
				break
			case cCAActionEvent.control_actions.step:
				this._step()
				break
			default:
				throw new CAException('action not recognised: ' + piAction)
		}

		cDebug.write('done action: ' + piAction)
		cDebug.leave()
	}

	//* ***************************************************************
	_step() {
		// cant step until changed_cells are consumed
		if (this.runData.changed_cells.length > 0)
			throw new CAException('changed cells must be consumed before stepping')

		// reset counters
		this.runData.clear_cell_counters()
		cDebug.write('stepping')

		// apply rules
		/** @type {boolean} */var bHasChanged
		/** @type {cCACell} */ var oCell
		for (var iRow = 1; iRow <= this.rows; iRow++)
			for (var iCol = 1; iCol <= this.cols; iCol++) {
				oCell = this.getCell(iRow, iCol, true)
				if (oCell.rule == null)	// if no rule is associated with a cell, set it here
					oCell.rule = this.rule

				bHasChanged = oCell.apply_rule()

				// check if the cell has changed
				if (bHasChanged)
					this.runData.changed_cells.push(oCell)
			}

		// check how many cells changed
		var iChangedLen = this.runData.changed_cells.length
		this.runData.changed = iChangedLen
		if (iChangedLen == 0) {
			this.running = false
			cDebug.warn('no change detected in grid')
			cCAGridEvent.fire_event(this.name, cCAGridEvent.notify.nochange)
			return
		}

		// promote changed cells
		for (var iIndex = 0; iIndex < iChangedLen; iIndex++) {
			oCell = this.runData.changed_cells[iIndex]
			oCell.promote()
		}

		this._add_to_history()

		this._informGridDone()
	}

	//* ***************************************************************
	/*
	 * @param {number} piInitType   defined in GRID_INIT_TYPES
	 * @description initializes the grid with a pattern
	 */
	_init(piInitType) {
		cDebug.enter()
		if (this.running)
			throw new CAException('cant init when running')

		this.runData = new cCARunData()
		this.history = []
		cDebug.write('initialising grid:' + piInitType)
		cCAGridInitialiser.init(this, piInitType)
		cDebug.write('done init grid: ' + piInitType)

		this._informGridDone()
		cDebug.leave()
	}

	/**
	 *  rules are associated to each individual cell,
	 *  when setting a new rule, all rules must be removed from cells
	 *
	 *  the new rule will be associated to the cells when the rule is run
	 */
	_clear_cell_rules() {
		cDebug.enter()
		var oCell
		for (var iNr = 1; iNr <= this.rows; iNr++)
			for (var iNc = 1; iNc <= this.cols; iNc++) {
				oCell = this.getCell(iNr, iNc)
				if (oCell !== null)
					oCell.rule = null
			}

		cDebug.leave()
	}

	//#######################################################################
	// # events
	//#######################################################################
	_informGridDone() {
		// inform consumers that grid has executed
		cCAGridEvent.fire_event(this.name, cCAGridEvent.notify.done, this.runData)
	}

	/**
	 * Sets a single cell
	 * @param {cCAGridCell} poCell
	 */
	_onSetOneCellOnly(poCell) {
		this.runData.clear_cell_counters()
		this.setCellValue(poCell.row, poCell.col, poCell.value)
		this._informGridDone()
	}

	/**
	 */
	_onNotifyCellsConsumed() {
		cDebug.enter()
		this.runData.clear_cell_counters() // always clean out the changed cells

		if (this.running) {
			cDebug.write('running again')
			this.runData.runs++
			cCAActionEvent.fire_event(this.name, cCAActionEvent.actions.control, cCAActionEvent.control_actions.step)
		}

		cDebug.leave()
	}

	//#######################################################################
	// # privates
	//#######################################################################
	_add_to_history() {
		// trim the history
		var aHistory = this.history

		// is history too long?
		while (aHistory.length > cCAGrid.HISTORY_LEN)
			aHistory.shift() // remove first history entry

		var sHash = this._changed_cells_hash()
		if (aHistory.includes(sHash)) {
			this.running = false
			cDebug.warn('repeat pattern seen')
			cCAGridEvent.fire_event(this.name, cCAGridEvent.notify.repeatPattern)
			return
		}

		aHistory.push(sHash)
	}

	_changed_cells_hash() {
		// create a hash code
		var sBinary = ''
		var iCountOnes = 0
		var iCountZeros = 0

		this.runData.changed_cells.forEach(function (poCell) {
			sBinary += poCell.value
			if (poCell.value !== 0)
				iCountOnes++
			else
				iCountZeros++
		})

		var sHash = md5(sBinary) + '_' + iCountOnes + ',' + iCountZeros

		return sHash
	}

	//* ***************************************************************
	_link_cells() {
		cDebug.enter()
		if (!this.rule)
			throw new Error('no rule set')

		var iType = this.rule.neighbour_type

		cDebug.write('linking cells')
		for (var iNr = 1; iNr <= this.rows; iNr++)
			for (var iNc = 1; iNc <= this.cols; iNc++) {
				var oCell = this.getCell(iNr, iNc, true) // create cells
				this._link_cell(oCell, CA_DIRECTIONS.north, iNr - 1, iNc)
				this._link_cell(oCell, CA_DIRECTIONS.east, iNr, iNc + 1)
				this._link_cell(oCell, CA_DIRECTIONS.south, iNr + 1, iNc)
				this._link_cell(oCell, CA_DIRECTIONS.west, iNr, iNc - 1)
				if (iType == CA_NEIGHBOURS.eightway) {
					this._link_cell(oCell, CA_DIRECTIONS.northeast, iNr - 1, iNc + 1)
					this._link_cell(oCell, CA_DIRECTIONS.southeast, iNr + 1, iNc + 1)
					this._link_cell(oCell, CA_DIRECTIONS.southwest, iNr + 1, iNc - 1)
					this._link_cell(oCell, CA_DIRECTIONS.northwest, iNr - 1, iNc - 1)
				}
			}

		cDebug.write('completed cell linking')
		cDebug.leave()
	}

	//* ***************************************************************
	_link_cell(poCell, piDirection, piNRow, piNCol) {
		var iNr, iNc
		// wrap around neighbour row and col
		iNr = piNRow
		if (iNr < 1)
			iNr = this.rows
		if (iNr > this.rows)
			iNr = 1

		iNc = piNCol
		if (iNc < 1)
			iNc = this.cols
		if (iNc > this.cols)
			iNc = 1

		// get the neighbour
		var oNeigh = this.getCell(iNr, iNc, true) // shouldnt need to create cells, but just in case
		poCell.setNeighbour(piDirection, oNeigh)
	}
}
