'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//###############################################################################

const CA_NEIGHBOURS = {
	fourway: 0,
	eightway: 1,
	maximum: 8,
}

const CA_DIRECTIONS = {
	northwest: 1,
	north: 2,
	northeast: 3,
	west: 4,
	centre: 5,
	east: 6,
	southwest: 7,
	south: 8,
	southeast: 9,
}

const CA_STATES = {
	same: 0,
	up: 1,
	down: 2,
	reset: 3,
	default_state : 1
}


const CELL_DATA_KEYS = {
	row: 'R',
	col: 'C',
	BOREDOM_BITMAP : 'BBK',
	BOREDOM_BITMAP_COUNT : 'BBCK',
	BORED_STATE : 'BSK'
}

const CARULE_TYPES = {
	life: 1,
	binary: 2,
	base64: 3,
	wolfram1d: 4,
	random: 5,
}

const CACONSTS = {
	MAX_INPUTS : Math.pow(2, 9) - 1,
	BASE64_LENGTH : Math.ceil((Math.pow(2, 9) - 1) / 6),
	NO_BOREDOM : -1,
}

const GRID_INIT_TYPES = {
	blank: { id: 0, label: 'Blank' },
	block: { id: 1, label: 'Block' },
	checker: { id: 2, label: 'Checker' },
	circle: { id: 3, label: 'Circle' },
	cross: { id: 4, label: 'Cross' },
	diagonal: { id: 5, label: 'Diagonal' },
	diamond: { id: 6, label: 'Diamond' },
	horiz_line: { id: 7, label: 'H-Line' },
	sine: { id: 8, label: 'Sine' },
	random: { id: 9, label: 'Random' },
	vert_line: { id: 10, label: 'V-Line' },
}

//###############################################################################
class cCAStatus {
	changed = 0
	active = 0
	inactive = 0
	bored = 0
}

class cCARunData {
	/** @type {number} */ active = 0
	/** @type {number} */ inactive = 0
	/** @type {number} */ runs = 0
	/** @type {number} */ changed = 0
	/** @type {Array} */ changed_cells = []
	/** @type {number} */ bored = 0

	clear_cell_counters() {
		this.active = 0
		this.inactive = 0
		this.changed = 0
		this.bored = 0
		this.changed_cells = []
	}
}
