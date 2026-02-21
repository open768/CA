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
	}
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

	/**
	 */
	constructor(base_name, rows,cols){
		this.base_name = base_name
		this._rows = rows
		this._cols = cols
		this._data = new cSparseArray(
			rows,
			cols
		)
	}

	_reset(){

	}

	static max_chars(rows, cols){
		return Math.floor(rows * cols / cConverterEncodings.BASE64_BITS)
	}

	set_plaintext(psText){	
		this._reset()
		this.plaintext = psText
		

