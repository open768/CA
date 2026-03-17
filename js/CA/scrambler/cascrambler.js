"use strict"

/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

Any Cryptography concepts demonstrated in this code are covered by the UK Govt Open General Export License for Cryptographic development
(see https://www.gov.uk/government/publications/open-general-export-licence-cryptographic-development)
and is not intended for any dual use as defined by the UK government license.
You the consumer of this code are solely and entirely responsible for importing this code into your own country..

**************************************************************************/

//####################################################################################################
//#
//####################################################################################################
class cCAScramblerData extends cSparseArray{
	index = {
		row: 0, col: 0
	}

	fill_with_random_bits(){
		var oIndex = this.index

		if (oIndex.row <= this.rows && oIndex.col < this.cols)
			while (oIndex.row < this.rows) {
				while (oIndex.col < this.cols) {
					this.set(
						oIndex.row,
						oIndex.col,
						Math.random() < 0.5 ? 1 : 0
					)
					oIndex.col++
				}

				oIndex.col = 0
				oIndex.row++
			}

	}
	//********************************************************************
	/**
	 *
	 * @param {string} psChar
	 */
	add_char_to_data(psChar) {
		if (psChar.length !== 1)
			throw new eCAScramblerException("only single characters can be added")
		//get the binary representation of the character
		var iAscii = psChar.charCodeAt(0)
		var sBinary = cConverter.intToBinstr(iAscii)
		if (sBinary.length > cCAScrambler.BITS_PER_CHAR)
			throw new eCAScramblerException("character too long for the number of bits allocated per character")
		sBinary = sBinary.padStart(
			cCAScrambler.BITS_PER_CHAR,
			"0"
		)
		for (var i = 0; i < sBinary.length; i++) {
			var cBit = sBinary.charAt(i)
			var iValue = (cBit === "1" ? 1 : 0)

			this.set(
				this.index.row,
				this.index.col++,
				iValue
			)

			if (this.index.col >= this.cols) {
				this.index.col = 0
				this.index.row++

				if (this.index.row >= this.rows && this.index.col > 0)
					throw new eCAScramblerException("overflow - too much data for scrambler size")
			}
		}
	}
}

//####################################################################################################
//#
//####################################################################################################
class cCAScrambler extends cEventSubscriber{
	static PREFIX = "#CAv1#["
	static SUFFIX = "]#END#"
	static BITS_PER_CHAR = 8

	/** @type number  */ inital_runs = 0
	/** @type string  */ plaintext = null
	/** @type string  */ base_name = null
	/** @type {cCAGrid} */ grid = null

	//-----------internal variables
	_data = null	/** @type {cCAScramblerData} */
	_initial_runs_completed = 0
	_rows = 0
	_cols = 0
	_stage = cCAScramblerStages.NOT_RUNNING

	_rule_is_set = false

	//********************************************************************
	constructor(base_name, rows, cols) {
		super()
		this.base_name = base_name
		this._rows = rows
		this._cols = cols
		this._reset()
		cCAScramblerEvent.subscribe(
			this.base_name,
			[cCAScramblerEvent.actions.set_input, cCAScramblerEvent.notify.consumed, cCAScramblerEvent.notify.imported_ops],
			poEvent => this.onScramblerEvent(poEvent)
		)
		cCARuleEvent.subscribe(
			this.base_name,
			[cCARuleEvent.actions.update_rule],
			poEvent => this.onRuleEvent(poEvent)
		)
		cCAActionEvent.subscribe(
			this.base_name,
			[cCAScramblerEvent.control_actions.scramble],
			poEvent => this.onActionEvent(poEvent)
		)
		cCACanvasEvent.subscribe(
			this.base_name,
			[cCACanvasEvent.actions.set_grid],
			poEvent => this.onCanvasEvent(poEvent)
		)
		cCAGridEvent.subscribe(
			this.base_name,
			[cCAGridEvent.notify.nochange, cCAGridEvent.notify.repeatPattern, cCAGridEvent.notify.done, cCAGridEvent.notify.allConsumersDone],
			poEvent => this.onGridEvent(poEvent)
		)
	}

	//********************************************************************
	//* static methods
	//********************************************************************
	static max_chars(rows, cols) {
		if (rows === undefined || cols === undefined)
			throw new eCAScramblerException("rows and cols are required")

		return Math.floor(rows * cols / cCAScrambler.BITS_PER_CHAR) - this.PREFIX.length - this.SUFFIX.length
	}

	//********************************************************************
	//* event handlers
	//********************************************************************
	/**
	 * @param {cCARuleEvent} poEvent
	 */
	async onRuleEvent(poEvent) {
		switch (poEvent.action) {
			case cCARuleEvent.actions.update_rule:
				this._rule_is_set = true
		}
	}

	//********************************************************************
	/**
	 * @param {cCAScramblerEvent} poEvent
	 */
	async onScramblerEvent(poEvent) {
		switch (poEvent.action) {
			case cCAScramblerEvent.actions.set_input:
				this._set_plaintext(poEvent.data)
				break

			case cCAScramblerEvent.notify.consumed:
			//the consumer has consumed the scrambled output and is ready for the next scramble
				this._on_notify_scrambler_consumed()
				break

			case cCAScramblerEvent.notify.imported_ops:
				this._on_notify_imported_ops( poEvent.data )
				break
		}
	}
	//********************************************************************
	/**
	 * @param {cCAActionEvent} poEvent
	 */
	async onActionEvent(poEvent) {
		switch (poEvent.action) {
			case cCAScramblerEvent.control_actions.scramble:
				this._onActionScramble(poEvent.data)
				break
		}
	}

	//********************************************************************
	/**
	 * @param {cCACanvasEvent} poEvent
	 */
	async onCanvasEvent(poEvent) {
		switch (poEvent.action) {
			case cCACanvasEvent.actions.set_grid:
				this.grid = poEvent.data
		}
	}

	//********************************************************************
	/**
	 * @param {cCAGridEvent} poEvent
	 */
	async onGridEvent(poEvent) {
		switch (poEvent.action) {
			case cCAGridEvent.notify.done:
				this._on_ca_grid_notify_done()
				break

			case cCAGridEvent.notify.allConsumersDone:
				this._on_ca_grid_notify_all_consumers_done()
				break

			case cCAGridEvent.notify.nochange, cCAGridEvent.notify.repeatPattern:
				//something went wrong with the scrambling - stop and report an error
				throw new eCAScramblerException("Cellular automata stopped unexpectedly")

			default:
				throw new eCAScramblerException("unexpected grid event " + poEvent.action )
		}
	}

	//********************************************************************
	// reset  methods
	//********************************************************************
	_reset() {
		this._data = new cCAScramblerData(
			this._rows,
			this._cols
		)
		this.initial_runs = 0
		this.initial_runs_completed = 0

		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.actions.reset
		)
	}

	//********************************************************************
	// public methods
	//********************************************************************
	/**
	 * @param {number} piRow - starts at 0
	 * @param {number} piCol - starts at 0
	 * @returns {number}
	 */
	get(piRow, piCol) {
		return this._data.get(
			piRow,
			piCol
		)
	}

	//********************************************************************
	// private scrambling methods
	//********************************************************************
	_onActionScramble(poData) {
		try {
			if (!poData || !poData.inital_runs)
				throw new eCAScramblerException("initial runs must be provided")

			this.initial_runs = poData.inital_runs
			this._begin_scramble_process()
		} catch (err) {
			if (err instanceof eCAScramblerException)
				cCAScramblerEvent.fire_event(
					this.base_name,
					cCAScramblerEvent.actions.error,
					err
				)
			throw err
		}
	}

	//********************************************************************
	_begin_scramble_process() {
		cDebug.enter()
		//---------------checks
		if (this.grid == null)
			return
		if (this._stage !== cCAScramblerStages.NOT_RUNNING)
			throw new eCAScramblerException("already running")
		if (!this._rule_is_set)
			throw new eCAScramblerException("a CA rule must be set before scrambling")
		if (!this.plaintext || this.plaintext.length === 0)
			throw new eCAScramblerException("plaintext must be set")
		if (!this.initial_runs)
			throw new eCAScramblerException("initial runs must be provided")

		//---------------
		//add random junk to the end of the scrambler text until the grid is full
		this._fillup_data()
		//then wait for the consumer to respond before going to the next stage
	}

	//********************************************************************
	//* scramble methods
	//********************************************************************
	_import_grid() {
		if (this._stage !== cCAScramblerStages.IMPORTING_OPS)
			throw new eCAScramblerException("incorrect stage for scrambling")

		//read the ca grid and convert into a set of operations to perform on the data  to scramble it
		var oReader = new cScramblerOpReader(this.base_name)
		oReader.import_grid()

		//next stage of scrambling will be triggered by the reader firing a notify_imported event
		// once it has finished reading the grid and converting to operations
	}

	//********************************************************************
	/**
	 *
	 * @param {Array<cTransformOp>} paOps
	 */
	_on_notify_imported_ops( paOps) {
		//this function will be called once the operations have been imported and are ready to be executed to perform the scrambling
		if (this._stage !== cCAScramblerStages.IMPORTING_OPS)
			throw new eCAScramblerException("incorrect stage for importing ops")

		this._stage = cCAScramblerStages.SCRAMBLING
		cDebug.error("scrambling - not implemented")
	}

	//********************************************************************
	_on_notify_scrambler_consumed() {
		switch (this._stage) {
			case cCAScramblerStages.FILL_INPUT:
				this._stage = cCAScramblerStages.INITIAL_RUNS
				this._step()
				break

			case cCAScramblerStages.SCRAMBLING:
				throw new eCAScramblerException("scrambling not implemented")

			case cCAScramblerStages.NOT_RUNNING:
				break

			default:
				throw new eCAScramblerException("unexpected stage " + this._stage + " for notify consumed")
		}
	}

	//********************************************************************
	// grid operation methods
	//********************************************************************
	_on_ca_grid_notify_all_consumers_done() {
		switch (this._stage) {
			case cCAScramblerStages.INITIAL_RUNS:
				this._initial_runs_completed++
				if (this._initial_runs_completed >= this.initial_runs) {
				//start scrambling
					cDebug.write("initial runs completed - starting import")
					this._stage = cCAScramblerStages.IMPORTING_OPS
					this._import_grid()
				} else
				//step the grid again
					setTimeout(
						() => this._step(),
						cCAScramblerTypes.STEP_DELAY_MS
					)
				break

			case cCAScramblerStages.SCRAMBLING:
				throw new eCAScramblerException("scrambling not implemented")

			case cCAScramblerStages.NOT_RUNNING:
				break

			default:
				throw new eCAScramblerException("unexpected stage " + this._stage + " for grid all consumers done")
		}

	}

	//********************************************************************
	_on_ca_grid_notify_done() {
		//always tell the grid to that changed cells have been consumed as the scrambler doesnt use this information
		//and grid will be waiting for this event before continuing to the next step
		cCAGridEvent.fire_event(
			this.base_name,
			cCAGridEvent.notify.changedCellsConsumed,
			this.constructor.name
		)
	}

	//********************************************************************
	_step() {
		//step the CA grid
		if (this.grid == null)
			throw new eCAScramblerException("no grid set")

		if (this._stage !== cCAScramblerStages.INITIAL_RUNS)
			throw new eCAScramblerException("unexpected stage " + this._stage + " for grid done")

		if (this._initial_runs_completed < this.initial_runs){
			//step the grid by sending an event
			cDebug.write("stepping grid - " + this._initial_runs_completed + " of " + this.initial_runs)
			cCAActionEvent.fire_event(
				this.base_name,
				cCAActionEvent.actions.control,
				cCAActionEvent.control_actions.step
			)
		}else {
			this._stage = cCAScramblerStages.IMPORTING_OPS
			this._import_grid()
		}
		// the grid done event will caLL this function
	}

	//********************************************************************
	// other methods
	//********************************************************************

	//********************************************************************
	_set_plaintext(psText) {

		//checkthe length of the text against the grid size
		if (psText.length > cCAScrambler.max_chars(
			this._rows,
			this._cols
		))
			throw new eCAScramblerException("text too long for the grid size")

		this._reset()

		//convert text into binary format and populate the grid
		this.plaintext = psText
		var sText = cCAScrambler.PREFIX + psText + cCAScrambler.SUFFIX
		//for each character in the text, add to the data
		for (var i = 0; i < sText.length; i++) {
			var sChar = sText.charAt(i)
			this._data.add_char_to_data(sChar)
		}

		//tell consumers the grid has been updated and they should redraw
		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.actions.draw_scrambler_grid
		)
	}

	//********************************************************************
	_fillup_data() {

		if (this._stage !== cCAScramblerStages.NOT_RUNNING)
			throw new eCAScramblerException("incorrect stage fo filling input")
		this._stage = cCAScramblerStages.FILL_INPUT

		this._data.fill_with_random_bits()

		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.actions.draw_scrambler_grid
		)
		//next stage of scrambling will be triggered by the subscriber firing a notify_consumed event
	}

}
