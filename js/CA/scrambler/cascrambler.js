"use strict"

/**************************************************************************
This work is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.
To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/

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
		row: 1, col: 1
	}

	fill_with_random_bits(){
		var oIndex = this.index

		while (oIndex.row <= this.rows) {
			while (oIndex.col <= this.cols) {
				this.set(
					oIndex.row,
					oIndex.col,
					Math.random() < 0.5 ? 1 : 0
				)
				oIndex.col++
			}

			oIndex.col = 1
			oIndex.row++
		}

	}
	//********************************************************************
	/**
	 *
	 * @param {string} psChar
	 */
	add_char(psChar) {
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
		//iterate every bit in the string
		for (let sCh of sBinary){
			if (this.index.row > this.rows && this.index.col > this.cols)
				throw new eCAScramblerException("overflow - too much data for scrambler size")

			var iValue = (sCh === "1" ? 1 : 0)

			this.set(
				this.index.row,
				this.index.col++,
				iValue
			)

			if (this.index.col > this.cols) {
				this.index.col = 1
				this.index.row++
			}
		}
	}

	/**
	 *
	 * @param {string} psText
	 * @returns {void}
	 */
	add_string(psText){
		if ( typeof psText !== "string")
			throw new eCAScramblerException("only strings supported")

		for (var i = 0; i < psText.length; i++){
			var sChar = psText.charAt(i)
			this.add_char(sChar)
		}

	}

	/**
	 *
	 * @param {Array<cChangedCell>} paList
	 */
	set_multiple( paList){
		if (!Array.isArray(paList))
			throw new eCAScramblerException("expecting an array")

		paList.forEach(
			poCell=>this.set(
				poCell.row,
				poCell.col,
				poCell.value
			)
		)
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
		this._data.starts_at_zero = false

		this.initial_runs = 0
		this.initial_runs_completed = 0
		this._stage = cCAScramblerStages.NOT_RUNNING

		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.notify.reset
		)
	}

	//********************************************************************
	// public methods
	//********************************************************************
	/**
	 * @param {number} piRow - starts at 1
	 * @param {number} piCol - starts at 1
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
				cCAScramblerUtils.throw_error(
					this.base_name,
					"initial runs must be provided"
				)

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
		this._stage = cCAScramblerStages.FILL_INPUT
		this._fillup_data()
		//then wait for the consumer to respond before going to the next stage
	}

	//********************************************************************
	//* import grid
	//********************************************************************
	_import_ops_from_grid() {
		if (this._stage !== cCAScramblerStages.IMPORTING_OPS)
			throw new eCAScramblerException("incorrect stage for scrambling")

		//read the ca grid and convert into a set of operations to perform on the data  to scramble it
		var oReader = new cScramblerOpReader(
			this.base_name,
			this.grid
		)
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

		cDebug.write("starting to run operations to scramble the data")
		this._stage = cCAScramblerStages.SCRAMBLING
		var oRunner = new cScramblerOpRunner(
			this.base_name,
			this._data,
		)
		oRunner.run_ops( paOps )
		//events will be fired by the runner as it executes the operations to indicate progress and when the scrambling is complete
	}

	//********************************************************************
	//* xor
	//********************************************************************
	_xor_grid() {
		if (this._stage !== cCAScramblerStages.XOR)
			throw new eCAScramblerException("incorrect stage for XOR")
		//perform XOr

		var oXor_runner = new cScramblerXOROp(
			this._data ,
			this.grid
		)
		oXor_runner.do_xor()
		cDebug.write("xor complete")

		//inform consumers to redraw the grid with the new scrambled data
		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.notify.draw_scrambler,
			this
		)
	}

	//********************************************************************
	//* scrambler ops
	//********************************************************************
	_on_notify_scrambler_consumed() {
		switch (this._stage) {
			case cCAScramblerStages.FILL_INPUT:
				this._stage = cCAScramblerStages.INITIAL_RUNS
				this._step_grid_initial()
				break

			case cCAScramblerStages.XOR:
				this._stage = cCAScramblerStages.STEP_AGAIN
				this._step_grid_again()
				break
		}
	}

	//********************************************************************
	// grid operation methods
	//********************************************************************
	_on_ca_grid_notify_all_consumers_done() {
		switch (this._stage) {
			case cCAScramblerStages.INITIAL_RUNS:
				this._initial_runs_completed++
				if (this._initial_runs_completed < this.initial_runs){
					//step the grid again
					setTimeout(
						() => this._step_grid_initial(),
						cCAScramblerTypes.STEP_DELAY_MS
					)
					return
				}

				//start scrambling
				cDebug.write("initial runs completed - starting xor")
				this._stage = cCAScramblerStages.XOR
				this._xor_grid()
				break

			case cCAScramblerStages.STEP_AGAIN:
				this._stage = cCAScramblerStages.IMPORTING_OPS
				this._import_ops_from_grid()
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
	_step_grid_again() {
		if (this._stage !== cCAScramblerStages.STEP_AGAIN)
			throw new eCAScramblerException("unexpected stage " + this._stage + " for step grid again")

		if (this.grid == null)
			throw new eCAScramblerException("no grid set")

		cDebug.write("stepping grid again")
		cCAActionEvent.fire_event(
			this.base_name,
			cCAActionEvent.actions.control,
			cCAActionEvent.control_actions.step
		)
	}

	//********************************************************************
	_step_grid_initial() {
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
		}
		//no else needed, will not get here

		// the grid done event will trigger the next step of the scrambling process
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

		//binary format and populate the grid
		this.plaintext = psText
		var sText = cCAScrambler.PREFIX + psText + cCAScrambler.SUFFIX
		this._data.add_string(sText)

		//tell consumers the grid has been updated and they should redraw
		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.notify.draw_scrambler,
			this
		)
	}

	//********************************************************************
	_fillup_data() {

		if (this._stage !== cCAScramblerStages.FILL_INPUT)
			throw new eCAScramblerException("incorrect stage for filling input")

		this._data.fill_with_random_bits()

		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.notify.draw_scrambler,
			this
		)
		//next stage of scrambling will be triggered by the subscriber firing a notify_consumed event
	}

}
