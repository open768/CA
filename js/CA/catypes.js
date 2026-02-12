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

class CELL_DATA_KEYS extends cStaticClass{
	static row = 'R'
	static col = 'C'
	static BOREDOM_BITMAP = 'BBK'
	static BOREDOM_BITMAP_COUNT = 'BBCK'
	static BORED_STATE = 'BSK'
}

class CARULE_TYPES extends cStaticClass {
	static life = 1
	static binary = 2
	static base64 = 3
	static wolfram1d = 4
	static random = 5
}

class CACONSTS extends cStaticClass {
	static MAX_INPUTS = Math.pow(2, 9) - 1
	static BASE64_LENGTH = Math.ceil((Math.pow(2, 9) - 1) / 6)
	static NO_BOREDOM = -1
}

class GRID_INIT_TYPES extends cStaticClass {
	static blank = { id: 0, label: 'Blank' }
	static block = { id: 1, label: 'Block' }
	static checker = { id: 2, label: 'Checker' }
	static circle = { id: 3, label: 'Circle' }
	static cross = { id: 4, label: 'Cross' }
	static diagonal = { id: 5, label: 'Diagonal' }
	static diamond = { id: 6, label: 'Diamond' }
	static horiz_line = { id: 7, label: 'H-Line' }
	static sine = { id: 8, label: 'Sine' }
	static random = { id: 9, label: 'Random' }
	static vert_line = { id: 10, label: 'V-Line' }
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
