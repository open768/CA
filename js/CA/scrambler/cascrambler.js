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

class cCAScrambler{
	static PREFIX = "#CAv1#["
	static SUFFIX = "]#END#"
	static BITS_PER_CHAR = 8

	/** @type number  */ inital_runs = 0
	/** @type string  */ plaintext = null
	/** @type string  */ base_name = null
	/** @type {cCAGrid} */ grid = null

	//-----------internal variables
	_data = null	/** @type {cSparseArray} */
	_initial_runs_completed = 0
	_rows=0
	_cols=0
	_stage = cCAScramblerStages.NOT_RUNNING
	_grid_index = {
		row: 0, col: 0
	}
	_rule_is_set = false

	//********************************************************************
	constructor(base_name, rows,cols){
		this.base_name = base_name
		this._rows = rows
		this._cols = cols
		this._reset()
		cCAScramblerEvent.subscribe(
			this.base_name,
			[cCAScramblerEvent.actions.set_input,cCAScramblerEvent.notify.consumed],
			poEvent=>this.onScramblerEvent(poEvent)
		)
		cCARuleEvent.subscribe(
			this.base_name,
			[cCARuleEvent.actions.update_rule],
			poEvent=>this.onRuleEvent(poEvent)
		)
		cCAActionEvent.subscribe(
			this.base_name,
			[cCAScramblerEvent.control_actions.scramble],
			poEvent=>this.onActionEvent(poEvent)
		)
		cCACanvasEvent.subscribe(
			this.base_name,
			[cCACanvasEvent.actions.set_grid],
			poEvent=>this.onCanvasEvent(poEvent)
		)
		cCAGridEvent.subscribe(
			this.base_name,
			[cCAGridEvent.notify.done,cCAGridEvent.notify.nochange,cCAGridEvent.notify.repeatPattern, cCAGridEvent.notify.allConsumersDone],
			poEvent=>this.onGridEvent(poEvent)
		)
	}

	//********************************************************************
	//* static methods
	//********************************************************************
	static max_chars(rows, cols){
		if (rows === undefined || cols === undefined)
			throw new cCAScramblerException("rows and cols are required")

		return Math.floor(rows * cols / cCAScrambler.BITS_PER_CHAR) - this.PREFIX.length - this.SUFFIX.length
	}

	//********************************************************************
	//* event handlers
	//********************************************************************
	/**
	 * @param {cCARuleEvent} poEvent
	 */
	onRuleEvent(poEvent){
		switch(	poEvent.action){
			case cCARuleEvent.actions.update_rule:
				this._rule_is_set = true
		}
	}

	//********************************************************************
	/**
	 * @param {cCAScramblerEvent} poEvent
	 */
	onScramblerEvent(poEvent){
		switch(	poEvent.action){
			case cCAScramblerEvent.actions.set_input:
				this._set_plaintext(poEvent.data)
				break
			case cCAScramblerEvent.notify.consumed:
				//the consumer has consumed the scrambled output and is ready for the next scramble
				this._on_notify_scrambler_consumed()
				break
		}
	}
	//********************************************************************
	/**
	 * @param {cCAActionEvent} poEvent
	 */
	onActionEvent(poEvent){
		switch(	poEvent.action){
			case cCAScramblerEvent.control_actions.scramble:
				this._onActionScramble(poEvent.data)
				break
		}
	}

	//********************************************************************
	/**
	 * @param {cCACanvasEvent} poEvent
	 */
	onCanvasEvent(poEvent){
		switch(	poEvent.action){
			case cCACanvasEvent.actions.set_grid:
				this.grid = poEvent.data
		}
	}

	//********************************************************************
	/**
	 * @param {cCAGridEvent} poEvent
	 */
	onGridEvent(poEvent){
		if (this._stage == cCAScramblerStages.NOT_RUNNING)
			return

		if (this._stage != cCAScramblerStages.INITIAL_RUNS && this._stage != cCAScramblerStages.SCRAMBLING)
			throw new cCAScramblerException("unexpected stage " + this._stage + " for grid done")

		switch(	poEvent.action){
			case cCAGridEvent.notify.done:
				this._on_ca_grid_notify_done()
				break

			case cCAGridEvent.notify.allConsumersDone:
				this._on_ca_grid_notify_all_consumers_done()
				break

			case cCAGridEvent.notify.nochange:
			case cCAGridEvent.notify.repeatPattern:
				//something went wrong with the scrambling - stop and report an error
				break
		}
	}




	//********************************************************************
	// public methods
	//********************************************************************
	/**
	 * @param {number} piRow - starts at 0
	 * @param {number} piCol - starts at 0
	 * @returns {number}
	 */
	get(piRow, piCol){
		return this._data.get(
			piRow,
			piCol
		)
	}

	//********************************************************************
	// private scrambling methods
	//********************************************************************
	_onActionScramble(poData){
		try{
			if (!poData || !poData.inital_runs)
				throw new cCAScramblerException("initial runs must be provided")

			this.initial_runs = poData.inital_runs
			this._scramble()
		} catch(err){
			if (err instanceof cCAScramblerException)
				cCAScramblerEvent.fire_event(
					this.base_name,
					cCAScramblerEvent.actions.error,
					err
				)
			throw err
		}
	}

	//********************************************************************
	_scramble(){
		cDebug.enter()
		//---------------checks
		if (this.grid == null)
			return
		if (this._stage !== cCAScramblerStages.NOT_RUNNING)
			throw new cCAScramblerException("already running")
		if (!this._rule_is_set)
			throw new cCAScramblerException("a scrambling rule must be set on the grid")
		if (!this.plaintext || this.plaintext.length === 0)
			throw new cCAScramblerException("plaintext must be set")
		if (!this.initial_runs)
			throw new cCAScramblerException("initial runs must be provided")

		//---------------
		//add random junk to the end of the scrambler text until the grid is full
		this._fillup_input()
		//then wait for the consumer to respond before going to the next stage
	}

	//********************************************************************
	_step(){
		//step the CA grid
		if (this.grid == null)
			throw new cCAScramblerException("no grid set")

		if (this._stage !== cCAScramblerStages.INITIAL_RUNS)
			throw new cCAScramblerException("unexpected stage " + this._stage + " for grid done")

		if (this._initial_runs_completed < this.initial_runs)
			//step the grid by sending an event
			cCAActionEvent.fire_event(
				this.base_name,
				cCAActionEvent.actions.control,
				cCAActionEvent.control_actions.step
			)
		else{
			this._stage = cCAScramblerStages.SCRAMBLING
			this._do_scramble()
		}
		// the grid done event will caLL this function
	}

	//********************************************************************
	_do_scramble(){
		if (this._stage !== cCAScramblerStages.SCRAMBLING)
			throw new cCAScramblerException("incorrect stage for scrambling")

		throw new cCAScramblerException("NOT IMPLEMENTED YET")
	}

	//********************************************************************
	_on_notify_scrambler_consumed(){
		switch (this._stage){
			case cCAScramblerStages.FILL_INPUT:
				this._stage = cCAScramblerStages.INITIAL_RUNS
				this._step()
				break
			case cCAScramblerStages.SCRAMBLING:
				throw new cCAScramblerException("scrambling not implemented")
			case cCAScramblerStages.NOT_RUNNING:
				break
			default:
				throw new cCAScramblerException("unexpected stage " + this._stage + " for notify consumed")
		}
	}

	//********************************************************************
	_on_ca_grid_notify_all_consumers_done(){
		if (this._stage !== cCAScramblerStages.INITIAL_RUNS)
			throw new cCAScramblerException("unexpected stage " + this._stage + " for grid all consumers done")
		cDebug.write("all consumers done")

		this._initial_runs_completed++
		this._stage = cCAScramblerStages.SCRAMBLING
		setTimeout(
			()=>this._scramble(),
			cCAScramblerTypes.STEP_DELAY_MS
		)
	}

	//********************************************************************
	_on_ca_grid_notify_done(){
		if (this._stage !== cCAScramblerStages.INITIAL_RUNS)
			throw new cCAScramblerException("unexpected stage " + this._stage + " for grid done")

		// fire a cCAGridEvent.notify.changedCellsConsumed,
		cDebug.write("stepping")

		cCAGridEvent.fire_event(
			this.base_name,
			cCAGridEvent.notify.changedCellsConsumed,
			this.constructor.name
		)
	}

	//********************************************************************
	// other scrambling methods
	//********************************************************************
	_reset(){
		this._data = new cSparseArray(
			this._rows,
			this._cols
		)
		this.initial_runs = 0
		this.initial_runs_completed = 0
		this._grid_index = {
			row: 0, col: 0
		}

		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.actions.reset
		)
	}


	//********************************************************************
	_set_plaintext(psText){

		//checkthe length of the text against the grid size
		if (psText.length > cCAScrambler.max_chars(
			this._rows,
			this._cols
		))
			throw new cCAScramblerException("text too long for the grid size")

		this._reset()

		//convert text into binary format and populate the grid
		this.plaintext = psText
		var sText = cCAScrambler.PREFIX + psText + cCAScrambler.SUFFIX
		//for each character in the text, add to the grid
		for (var i = 0; i < sText.length; i++){
			var sChar = sText.charAt(i)
			this._add_char_to_grid(sChar)
		}

		//tell consumers the grid has been updated and they should redraw
		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.actions.draw_scrambler_grid
		)
	}

	//********************************************************************
	_fillup_input(){

		if (this._stage !== cCAScramblerStages.NOT_RUNNING)
			throw new cCAScramblerException("incorrect stage fo filling input")
		this._stage = cCAScramblerStages.FILL_INPUT

		var oIndex = this._grid_index

		if (oIndex.row <= this._rows && oIndex.col < this._cols) {
			var oData = this._data /** @type {cSparseArray} @ */
			while (oIndex.row < this._rows){
				while (oIndex.col < this._cols){
					oData.set(
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

		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.actions.draw_scrambler_grid
		)
		//next stage of scrambling will be triggered by the subscriber firing a notify_consumed event
	}


	//********************************************************************
	/**
	 *
	 * @param {string} psChar
	 */
	_add_char_to_grid(psChar){
		if (psChar.length !== 1)
			throw new cCAScramblerException("only single characters can be added to the grid")
		//get the binary representation of the character
		var iAscii = psChar.charCodeAt(0)
		var sBinary = cConverter.intToBinstr(iAscii)
		if (sBinary.length > cCAScrambler.BITS_PER_CHAR)
			throw new cCAScramblerException("character too long the number of bits allocated per character")
		sBinary = sBinary.padStart(
			cCAScrambler.BITS_PER_CHAR,
			"0"
		)
		var oGrid = this._data /** @type {cSparseArray} @ */
		for (var i = 0; i < sBinary.length; i++){
			var cBit = sBinary.charAt(i)
			var iValue = (cBit === "1" ? 1 : 0)

			oGrid.set(
				this._grid_index.row,
				this._grid_index.col++,
				iValue
			)

			if (this._grid_index.col >= this._cols){
				this._grid_index.col = 0
				this._grid_index.row++

				if (this._grid_index.row >= this._rows && this._grid_index.col > 0)
					throw new cCAScramblerException("grid overflow - too much data for the grid size")
			}
		}
	}
}

