"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
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
/** Scrambler Events */
class cCAScramblerEvent extends cBaseEvent{
	static event_type_id = "cascramev"

	static actions = {
		status: "SEST",
		set_input: "SESI",
		reset: "SER",
		draw_grid: "SED"
	}

	static control_actions = {
		scramble: "SEA"
	}
}


class cCAScramblerException extends Error {
}

class cCAScramblerTypes{
	static status = {
		dormant: null,
		initialRuns: 1
	}
}

//###################################################################################
//#
//###################################################################################
/** class that performs data scrambling */

class cCAScrambler{
	static PREFIX = "#CAv1#["
	static SUFFIX = "]#END#"
	static BITS_PER_CHAR = 8

	/** @type number  */ inital_runs = 0
	/** @type string  */ plaintext = null
	/** @type string  */ base_name = null

	//-----------internal variables
	_data = null	/** @type {cSparseArray} */
	_initial_runs_completed = 0
	_rows=0
	_cols=0
	_grid_index = {
		row: 0, col: 0
	}
	_rule_is_set = false
	_scrambling = false

	//********************************************************************
	constructor(base_name, rows,cols){
		this.base_name = base_name
		this._rows = rows
		this._cols = cols
		this._reset()
		cCAScramblerEvent.subscribe(
			this.base_name,
			poEvent=>this.onScramblerEvent(poEvent)
		)
		cCARuleEvent.subscribe(
			this.base_name,
			poEvent=>this.onRuleEvent(poEvent)
		)
		cCAActionEvent.subscribe(
			this.base_name,
			poEvent=>this.onActionEvent(poEvent)
		)
	}

	//********************************************************************
	//* static methods
	//********************************************************************
	static max_chars(rows, cols){
		if (rows === undefined || cols === undefined)
			throw new cCAScramblerException("rows and cols are required")

		return Math.floor((rows * cols / cCAScrambler.BITS_PER_CHAR) - this.PREFIX.length - this.SUFFIX.length)
	}

	//********************************************************************
	//* event handlers
	//********************************************************************
	onRuleEvent(poEvent){
		switch(	poEvent.action){
			case cCARuleEvent.actions.update_rule:
				this._rule_is_set = true
		}
	}

	//********************************************************************
	onScramblerEvent(poEvent){
		switch(	poEvent.action){
			case cCAScramblerEvent.actions.set_input:
				this._set_plaintext(poEvent.data)
				break
		}
	}
	//********************************************************************
	onActionEvent(poEvent){
		switch(	poEvent.action){
			case cCAScramblerEvent.control_actions.scramble:
				if (!poEvent.data || poEvent.data.inital_runs == null)
					throw new cCAScramblerException("initial runs must be provided")

				this.inital_runs = poEvent.data.inital_runs

				this._scramble()
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
	// private methods
	//********************************************************************
	_scramble(){
		cDebug.enter()
		//---------------checks
		if (this._scrambling)
			throw new cCAScramblerException("already scrambling")
		if (!this._rule_is_set)
			throw new cCAScramblerException("a scrambling rule must be set on the grid")
		if (!this.plaintext || this.plaintext.length === 0)
			throw new cCAScramblerException("plaintext must be set")
		if (this.inital_runs == null)
			throw new cCAScramblerException("initial runs must be provided")

		//---------------
		this._scrambling = true
		this._initial_runs_completed

		this._scrambling = true
	}

	//********************************************************************
	_reset(){
		this._data = new cSparseArray(
			this._rows,
			this._cols
		)
		this.inital_runs = -1
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
			cCAScramblerEvent.actions.draw_grid
		)
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

				if (this._grid_index.row >= this._rows)
					throw new cCAScramblerException("grid overflow - too much data for the grid size")
			}
		}
	}
}

