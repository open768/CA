"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
//###############################################################################
/**
 * Description placeholder
 * 
 *
 * @class cCACellTypes
 * @typedef {cCACellTypes}
 */
class cCACellTypes {
	static neighbours = {
		fourway: 0,
		eightway: 1,
		maximum: 8
	}
	static directions = {
		northwest: 1,
		north: 2,
		northeast: 3,
		west: 4,
		centre: 5,
		east: 6,
		southwest: 7,
		south: 8,
		southeast: 9
	}
	static default_state = 1
	static states = {
		same: 0,
		up: 1,
		down: 2,
		reset: 3
	}
	static hash_values = {
		row: "R",
		col: "C"
	}
}

//###############################################################################
/**
 * Description placeholder
 * 
 *
 * @class cCARuleTypes
 * @typedef {cCARuleTypes}
 */
/* eslint-disable-next-line no-unused-vars */
class cCARuleTypes {
	static max_inputs = Math.pow(2, 9) - 1
	static base64_length = Math.ceil((Math.pow(2, 9) - 1) / 6)
	static no_boredom = null
	static rule_types = {
		life: 1,
		binary: 2,
		base64: 3,
		wolfram1d: 4,
		random: 5
	}
}



/* eslint-disable-next-line no-unused-vars */
class cCAGridTypes {
	static init = {
		blank: { id: 0, label: "Blank" },
		block: { id: 1, label: "Block" },
		checker: { id: 2, label: "Checker" },
		circle: { id: 3, label: "Circle" },
		cross: { id: 4, label: "Cross" },
		diagonal: { id: 5, label: "Diagonal" },
		diamond: { id: 6, label: "Diamond" },
		horiz_line: { id: 7, label: "H-Line" },
		sine: { id: 8, label: "Sine" },
		random: { id: 9, label: "Random" },
		vert_line: { id: 10, label: "V-Line" }
	}
	static actions = {
		play: 1,
		stop: 2,
		step: 3
	}
}

