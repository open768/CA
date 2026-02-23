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
		status: "S",
		set_input: "SI",
		reset: "RE",
		draw_grid: "DG"
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
	/** @type {cSparseArray} */ _data=null
	/** @type number  */ inital_runs = -1
	/** @type string  */ plaintext = null
	/** @type number  */ initial_runs_completed = 0
	base_name = null
	_rows=0
	_cols=0
	static PREFIX = "#CAv1#["
	static SUFFIX = "]#END#"
	_grid_index = {
		row: 0, col: 0
	}

	constructor(base_name, rows,cols){
		this.base_name = base_name
		this._rows = rows
		this._cols = cols
		this._reset()
		cCAScramblerEvent.subscribe(
			this.base_name,
			poEvent=>this.onScramblerEvent(poEvent)
		)
	}

	//********************************************************************
	//* static methods
	static max_chars(rows, cols){
		if (rows === undefined || cols === undefined)
			throw new cCAScramblerException("rows and cols are required")

		return Math.floor(((rows * cols) - this.PREFIX.length - this.SUFFIX.length) / cConverterEncodings.BASE64_BITS)
	}

	//********************************************************************
	//* event handlers
	onScramblerEvent(poEvent){
		// handle scrambler events here
		switch(	poEvent.action){
			case cCAScramblerEvent.actions.update_text:
				this._set_plaintext(poEvent.data)
				break
		}
	}

	//********************************************************************
	// instance methods
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
		for (var i = 0; i < sText.length; i++)
			this._add_char_to_grid(sText.charAt(i))

		//tell consumers the grid has been updated and they should redraw
		cCAScramblerEvent.fire_event(
			this.base_name,
			cCAScramblerEvent.actions.draw_grid,
			self
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
		var sBinary = cConverterEncodings.char_to_binary(psChar)
	}
}

