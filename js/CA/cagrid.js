'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
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

	constructor (piRow, piCol, piValue) {
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
class cCAGrid extends cEventSubscriber {
	// #######################################################################
	// # instance variables
	// #######################################################################
	/** @type {cSparseArray} */ cell_data = null
	/** @type {string} */ name = null
	/** @type {boolean} */ running = false
	/** @type {number} */ rows = 0
	/** @type {number} */ cols = 0
	/** @type {cCARule} */ rule = null
	/** @type {cCARunData} */ runData = new cCARunData()
	/** @type {Array} */ history = []
	/** @type {cCAStatus} */ counts = new cCAStatus()
	/** @type {number} */ _consumed_responses = 0

	static HISTORY_LEN = 40

	/**
	 * Creates an instance of cCAGrid.
	 \*	 * @constructor
	 * @param {string} psName
	 * @param {number} piRows
	 * @param {number} piCols
	 */
	constructor (psName, piRows, piCols) {
		super()
		if (!md5)
			$.error('js-md5 library missing')
		if (!psName)
			throw new eCAException('no base name')
		if (piRows == null || piCols == null)
			throw new eCAException('bad size information')

		this.rows = piRows
		this.cols = piCols
		this.name = psName // gridname

		cCAGridEvent.subscribe(
			this.name,
			[cCAGridEvent.notify.changedCellsConsumed, cCAGridEvent.actions.set_cell, cCAGridEvent.actions.get_grid],
			poEvent => this.onGridEvent(poEvent)
		)
		cCAActionEvent.subscribe(
			this.name,
			[cCAActionEvent.actions.grid_init, cCAActionEvent.actions.control, cCAActionEvent.actions.force_grid_redraw],
			poEvent => this.onActionEvent(poEvent)
		)
		cCARuleEvent.subscribe(
			this.name,
			[cCARuleEvent.actions.set_rule, cCARuleEvent.actions.status],
			poEvent => this.onRuleEvent(poEvent)
		)
	}

	// #######################################################################
	// # event handlers
	// #######################################################################
	async onRuleEvent (poEvent) {
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

	async onActionEvent (poEvent) {
		if (!this.active)
			return

		switch (poEvent.action) {
			case cCAActionEvent.actions.grid_init:
				this._init(poEvent.data)
				break

			case cCAActionEvent.actions.control:
				this._on_control_action(poEvent.data)
				break

			case cCAActionEvent.actions.force_grid_redraw:
				this._on_force_grid_redraw()
				break
		}
	}

	/**
	 * @param {cCAGridEvent} poEvent
	 */
	async onGridEvent (poEvent) {
		if (!this.active)
			return

		switch (poEvent.action) {
			case cCAGridEvent.notify.changedCellsConsumed:
				this._on_notify_cells_consumed(poEvent)
				break

			case cCAGridEvent.actions.set_cell:
				this._onSetOneCellOnly(poEvent.data)
				break

			case cCAGridEvent.actions.get_grid:
				cCAGridEvent.fire_event(
					this.name,
					cCAGridEvent.notify.grid,
					this
				)

				break
		}
	}

	// #######################################################################
	// # methods
	// #######################################################################
	/**
	 *
	 * @param {cCAStatus} poStatus
	 */
	_update_counts (poStatus) {
		this.runData.active += poStatus.active
		this.runData.inactive += poStatus.inactive
		this.runData.changed += poStatus.changed
		this.runData.bored += poStatus.bored
	}

	is_running () {
		return this.running
	}

	//* ***************************************************************
	/**
	 * @param {cCARule} poRule
	 * @param {boolean} pbLinkCells	 establish links between cells and rules
	 */
	set_rule (poRule, pbLinkCells = true) {
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
	get_rule () {
		return this.rule
	}

	//* ***************************************************************
	/**
	 * @returns {void}
	 */
	create_cells () {
		cDebug.enter()

		// clear out existing cells
		this.cell_data = new cSparseArray(
			this.rows,
			this.cols
		)

		// create blank cells
		for (let iNr = 1; iNr <= this.rows; iNr++)
			for (let iNc = 1; iNc <= this.cols; iNc++)
				this.setCellValue(
					iNr,
					iNc,
					0
				)

		// reset instance state
		this.runData.changed_cells = []
		this.history = []
		this._consumed_responses = 0

		// link if there is a rule
		if (this.rule)
			this._link_cells()

		cCAGridEvent.fire_event(
			this.name,
			cCAGridEvent.notify.clear
		)
		cDebug.leave()
	}

	//* ***************************************************************
	/**
	 * @param {number} piRow
	 * @param {number} piCol
	 * @param {number} iValue
	 * @returns {cCACell}
	 */
	setCellValue (piRow, piCol, iValue) {
		if (this.cell_data == null)
			throw new eCAException('grid not initialised')

		let oCell = this.getCell(
			piRow,
			piCol,
			false
		)
		if (oCell == null) {
			oCell = new cCACell()
			oCell.data.set(
				CELL_DATA_KEYS.row,
				piRow
			)
			oCell.data.set(
				CELL_DATA_KEYS.col,
				piCol
			)
			this.cell_data.set(
				piRow,
				piCol,
				oCell
			)
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
	getCell (piRow, piCol, pbCreate = false) {
		if (this.cell_data == null)
			return null
		let oCell = this.cell_data.get(
			piRow,
			piCol
		)
		if (pbCreate && oCell == null)
			oCell = this.setCellValue(
				piRow,
				piCol,
				0
			)

		return oCell
	}

	getCellValue (piRow, piCol) {
		const oCell = this.getCell(
			piRow,
			piCol,
			false
		)
		return oCell ? oCell.value : null
	}

	//* ***************************************************************
	//* ***************************************************************
	/**
	 *  @returns {Array}
	 */
	get_changed_cells () {
		return this.runData.changed_cells
	}

	// #######################################################################
	// Privates
	// #######################################################################
	_on_control_action (piAction) {
		cDebug.enter()
		if (this.rule == null)
			throw new eCAException('no rule set')

		switch (piAction) {
			case cCAActionEvent.control_actions.play:
				if (this.running)
					throw new eCAException('CA is allready running')
				this.running = true
				this._step()
				this.runData.runs = 1
				break

			case cCAActionEvent.control_actions.stop:
				if (!this.running)
					throw new eCAException('CA is not running')
				this.running = false
				break

			case cCAActionEvent.control_actions.step:
				if (this.running)
					throw new eCAException('CA is allready running')
				this.runData.clear_cell_counters()
				this._step()
				break

			default:
				throw new eCAException('action not recognised: ' + piAction)
		}

		cDebug.leave()
	}

	//* ***************************************************************`
	_on_force_grid_redraw () {
		cDebug.enter()

		this.runData.clear_cell_counters()

		// mark all cells as changed
		for (let iRow = 1; iRow <= this.rows; iRow++)
			for (let iCol = 1; iCol <= this.cols; iCol++) {
				const oCell = this.getCell(
					iRow,
					iCol
				)
				if (oCell !== null)
					this.runData.changed_cells.push(oCell)
			}

		this.runData.changed = this.runData.changed_cells.length
		this._informGridDone()

		cDebug.leave()
	}

	//* ***************************************************************
	_step () {
		// cant step until changed_cells are consumed
		if (this.runData.changed_cells.length > 0)
			throw new eCAException('changed cells must be consumed before stepping')

		// reset counters

		cDebug.extra_debug('stepping')

		// apply rules
		/** @type {boolean} */let bHasChanged
		/** @type {cCACell} */ let oCell
		for (let iRow = 1; iRow <= this.rows; iRow++)
			for (let iCol = 1; iCol <= this.cols; iCol++) {
				oCell = this.getCell(
					iRow,
					iCol,
					true
				)
				if (oCell.rule == null)	// if no rule is associated with a cell, set it here

					oCell.rule = this.rule

				bHasChanged = oCell.apply_rule()

				// check if the cell has changed
				if (bHasChanged)
					this.runData.changed_cells.push(oCell)
			}

		// check how many cells changed
		const iChangedLen = this.runData.changed_cells.length
		this.runData.changed = iChangedLen
		if (iChangedLen == 0) {
			this.running = false
			cCAGridEvent.fire_event(
				this.name,
				cCAGridEvent.notify.nochange
			)
			return
		}

		// promote changed cells
		for (let iIndex = 0; iIndex < iChangedLen; iIndex++) {
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
	_init (piInitType) {
		cDebug.enter()
		if (this.running)
			throw new eCAException('cant init when running')

		this.runData = new cCARunData()
		this.history = []

		cCAGridInitialiser.init(
			this,
			piInitType
		)

		this._informGridDone()
		cDebug.leave()
	}

	/**
	 *  rules are associated to each individual cell,
	 *  when setting a new rule, all rules must be removed from cells
	 *
	 *  the new rule will be associated to the cells when the rule is run
	 */
	_clear_cell_rules () {
		cDebug.enter()
		let oCell
		for (let iNr = 1; iNr <= this.rows; iNr++)
			for (let iNc = 1; iNc <= this.cols; iNc++) {
				oCell = this.getCell(
					iNr,
					iNc
				)
				if (oCell !== null)
					oCell.rule = null
			}

		cDebug.leave()
	}

	// #######################################################################
	// # events
	// #######################################################################
	_informGridDone () {
		this._consumed_responses = 0
		cCAGridEvent.fire_event(
			this.name,
			cCAGridEvent.notify.done,
			this.runData
		)
	}

	/**
	 * Sets a single cell
	 * @param {cCAGridCell} poCell
	 */
	_onSetOneCellOnly (poCell) {
		this.runData.clear_cell_counters()
		this.setCellValue(
			poCell.row,
			poCell.col,
			poCell.value
		)
		this._informGridDone()
	}

	/**
	 */
	_on_notify_cells_consumed (poEvent) {
		cDebug.enter()

		this._consumed_responses++
		const sConsumer = poEvent.data

		const iSubscriber_count = cCAGridEvent.get_subscriber_count(
			this.name,
			cCAGridEvent.notify.done
		)

		if (iSubscriber_count > 1) {
			// cDebug.write('ℹ️ grid: notified consumed response from ' + sConsumer)

			if (this._consumed_responses > iSubscriber_count) {
				cDebug.error('🤔more consumed responses than subscribers: ' + this._consumed_responses + ' of ' + iSubscriber_count)
				return
			}

			if (this._consumed_responses < iSubscriber_count)
				return

			// cDebug.write('✅ grid: changed cells consumed by all consumers')
		}

		this.runData.clear_cell_counters() // clean out the changed cells

		cCAGridEvent.fire_event(
			this.name,
			cCAGridEvent.notify.allConsumersDone,
			cCAGridEvent.done.cells_consumed
		)

		if (this.running) {
			// cDebug.write('running again')
			this.runData.runs++
			this._step()
		}

		cDebug.leave()
	}

	// #######################################################################
	// # privates
	// #######################################################################
	_add_to_history () {
		// trim the history
		const aHistory = this.history

		// is history too long?
		while (aHistory.length > cCAGrid.HISTORY_LEN)
			aHistory.shift() // remove first history entry

		const sHash = this._changed_cells_hash()
		if (aHistory.includes(sHash)) {
			this.running = false
			cCAGridEvent.fire_event(
				this.name,
				cCAGridEvent.notify.repeatPattern
			)
			return
		}

		aHistory.push(sHash)
	}

	_changed_cells_hash () {
		// create a hash code
		let sBinary = ''
		let iCountOnes = 0
		let iCountZeros = 0

		this.runData.changed_cells.forEach(function (poCell) {
			sBinary += poCell.value
			if (poCell.value !== 0) {
				iCountOnes++
			} else {
				iCountZeros++
			}
		})

		const sHash = md5(sBinary) + '_' + iCountOnes + ',' + iCountZeros

		return sHash
	}

	//* ***************************************************************
	_link_cells () {
		cDebug.enter()
		if (!this.rule)
			throw new Error('no rule set')

		const iType = this.rule.neighbour_type

		cDebug.write('linking cells')
		for (let iNr = 1; iNr <= this.rows; iNr++)
			for (let iNc = 1; iNc <= this.cols; iNc++) {
				const oCell = this.getCell(
					iNr,
					iNc,
					true
				) // create cells
				this._link_cell(
					oCell,
					CA_DIRECTIONS.north,
					iNr - 1,
					iNc
				)
				this._link_cell(
					oCell,
					CA_DIRECTIONS.east,
					iNr,
					iNc + 1
				)
				this._link_cell(
					oCell,
					CA_DIRECTIONS.south,
					iNr + 1,
					iNc
				)
				this._link_cell(
					oCell,
					CA_DIRECTIONS.west,
					iNr,
					iNc - 1
				)
				if (iType == CA_NEIGHBOURS.eightway) {
					this._link_cell(
						oCell,
						CA_DIRECTIONS.northeast,
						iNr - 1,
						iNc + 1
					)
					this._link_cell(
						oCell,
						CA_DIRECTIONS.southeast,
						iNr + 1,
						iNc + 1
					)
					this._link_cell(
						oCell,
						CA_DIRECTIONS.southwest,
						iNr + 1,
						iNc - 1
					)
					this._link_cell(
						oCell,
						CA_DIRECTIONS.northwest,
						iNr - 1,
						iNc - 1
					)
				}
			}

		cDebug.write('completed cell linking')
		cDebug.leave()
	}

	//* ***************************************************************
	_link_cell (poCell, piDirection, piNRow, piNCol) {
		let iNr, iNc
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
		const oNeigh = this.getCell(
			iNr,
			iNc,
			true
		) // shouldnt need to create cells, but just in case
		poCell.setNeighbour(
			piDirection,
			oNeigh
		)
	}
}
