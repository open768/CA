"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAStateRule {
	/**
   * Creates an instance of cCAStateRule.
   * @constructor
   */
	constructor() {
		this.neighbour_type = cCACellTypes.neighbours.eightway
		this.outputs = new Array(cCAConsts.MAX_INPUTS)
		this.nextStates = new Array(cCAConsts.MAX_INPUTS) //for future use
	}
}

//###############################################################################
/**
 * 
 * 
 * @class cCARule
 
 */

class cCARule {
	/** @type number */ neighbour_type = cCACellTypes.neighbours.eightway
	/** @type boolean */ has_state_transitions = false
	/** @type Array */ stateRules = null
	/** @type number */ boredom_count = cCAConsts.NO_BOREDOM //how many times a pattern is seen before a cell is bored
	/** @type number */ bored_cells = 0 //how many cells were bored

	NO_BOREDOM_BITMAP = -1
	BOREDOM_BITMAP_KEY = "BBK"
	BOREDOM_BITMAP_COUNT_KEY = "BBCK"
	BORED_STATE_KEY = "BSK"

	/**
   * Creates an instance of cCARule.
   * @constructor
   */
	constructor() {
		this.neighbour_type = cCACellTypes.neighbours.eightway
		this.has_state_transitions = false
		this.stateRules = []
		this.boredom_count = cCAConsts.NO_BOREDOM
	}

	//***************************************************************
	/**
   *
   * @static
   * @returns {cCARule}
   */
	static randomRule() {
		cDebug.enter()
		/** @type {cCARule}	 */ var oRule = new cCARule()
		oRule.neighbour_type = cCACellTypes.neighbours.eightway
		oRule.has_state_transitions = false

		for (var i = 1; i <= cCAConsts.MAX_INPUTS; i++) {
			var iRnd = Math.floor(Math.random() * 1.99)
			oRule.set_output(cCACellTypes.default_state, i, iRnd)
		}
		cDebug.leave()
		return oRule
	}

	//***************************************************************
	/**
   * @param {cCARule} poRule
   */
	copy_to(poRule) {
		cDebug.enter()
		poRule.neighbour_type = this.neighbour_type
		poRule.has_state_transitions = this.has_state_transitions
		poRule.boredom_count = this.boredom_count
		poRule.stateRules = cCommon.deep_copy(this.stateRules)
	}

	//*****************************************************************
	//rule State level functions
	//*****************************************************************
	/**
	 * sets the output for a particular bitmap for a state
	 \*	 * @param {number} piState
	 * @param {number} piBitmap
	 * @param {number} piValue
	 */
	set_output(piState, piBitmap, piValue) {
		if (piState < 1) 
			throw new CAException("invalid state")

		if (piState > this.stateRules.length) 
			this.create_state(piState) //create a new state if the state is unknown

		this.stateRules[piState - 1].outputs[piBitmap] = piValue
	}

	//*****************************************************************
	/**
   * @param {number} piBoredom
   */
	set_boredom(piBoredom) {
		if (piBoredom != cCAConsts.NO_BOREDOM && piBoredom < 2)
			throw new CAException("boredom must be at least 2")

		this.boredom_count = piBoredom
	}

	//*****************************************************************
	/**
	 * returns the output for a given bitmap for a state
	 \*	 * @param {number} piState
	 * @param {number} piBitmap
	 * @returns {number}
	 */
	get_rule_output(piState, piBitmap) {
		if (piBitmap == 0) 
			return 0
		// cells must have neighbours - 0 doesnt become 1

		if (piState > this.stateRules.length)
			throw new CAException("invalid state requested - too big")

		try {
			var iOutput = this.stateRules[piState - 1].outputs[piBitmap] //TBD should be using a method
			if (iOutput == null) 
				iOutput = 0

			return iOutput
		} catch (e) {
			cDebug.write_err("unable to get output for state " + piState)
			throw e
		}
	}

	//*****************************************************************
	/**
   *
   * @param {number} piState
   */
	create_state(piState) {
		if (piState <= this.stateRules.length) 
			return
		// dont create existing states
		if (!this.has_state_transitions && piState !== cCACellTypes.default_state)
			throw new CAException(
				"state not possible without state transitions enabled",
			)

		var oStateRule = new cCAStateRule()
		oStateRule.neighbour_type = this.neighbour_type
		this.stateRules[piState - 1] = oStateRule
	}

	//*****************************************************************
	/**
   *
   * @param {*} piInState
   * @param {*} piPattern
   * @param {*} piNextState
   */
	set_nextState(piInState, piPattern, piNextState) {
		if (!this.has_state_transitions)
			throw new CAException("no state transitions possible")

		if (piInState > this.stateRules.length)
			throw new CAException("invalid input state ")

		if (piNextState > this.stateRules.length)
			throw new CAException("invalid next state ")

		this.stateRules[piInState - 1].nextStates[piPattern] = piNextState //TBD should be using a method
	}

	//*****************************************************************
	/**
   *
   * @param {*} piInState
   * @param {*} piPattern
   * @returns {*}
   */
	get_nextState(piInState, piPattern) {
		if (piPattern == 0) 
			return piInState

		if (!this.has_state_transitions)
			throw new CAException("no state transitions possible")

		if (piInState > this.stateRules.length)
			throw new CAException("invalid state requested")

		var iOutState = this.stateRules[piInState - 1].nextStates[piPattern] //TBD should be using a method
		return iOutState
	}

	//*****************************************************************
	/**
   * @param {cCACell} poCell
   * @param {number} piBitmap
   * @return {boolean}
   */
	_evaluate_simple_boredom(poCell, piBitmap) {
		if (this.boredom_count == cCAConsts.NO_BOREDOM) 
			return false

		/** @type Map */ var cell_data = poCell.data

		// check if boredom bitmap key is not there
		if (!cell_data.has(this.BOREDOM_BITMAP_KEY)) {
			cell_data.set(this.BOREDOM_BITMAP_KEY, piBitmap)
			cell_data.set(this.BOREDOM_BITMAP_COUNT_KEY, 1)
			cell_data.set(this.BORED_STATE_KEY, false)
			return false
		}

		// check if boredom bitmap is different bitmap
		var previous_bitmap = cell_data.get(this.BOREDOM_BITMAP_KEY)
		if (previous_bitmap != piBitmap) {
			cell_data.set(this.BOREDOM_BITMAP_KEY, piBitmap)
			cell_data.set(this.BOREDOM_BITMAP_COUNT_KEY, 1)
			cell_data.set(this.BORED_STATE_KEY, false)
			return false
		}

		// bitmap is the same - increase count and check if bored
		var count = cell_data.get(this.BOREDOM_BITMAP_COUNT_KEY) + 1
		if (count >= this.boredom_count) {
			cell_data.set(this.BOREDOM_BITMAP_COUNT_KEY, 0) //reset count
			cell_data.set(this.BORED_STATE_KEY, true)
			return true
		} else {
			cell_data.set(this.BOREDOM_BITMAP_COUNT_KEY, count)
			cell_data.set(this.BORED_STATE_KEY, false)
			return false
		}
	}

	//*****************************************************************
	/**
   * @param {cCACell} poCell
   */
	evaluateCell(poCell) {
		if (poCell == null) 
			throw new CAException("no cell provided")

		//get the cell neighbour value
		var iBitmap = poCell.getBitmap(this.neighbour_type)

		if (iBitmap == 0)
		//cells that are completely isolated remain dead
			poCell.evaluated.value = 0
		else {
			//check for cell boredom
			/** @type Boolean */ var bBored = false
			if (this.boredom_count !== cCAConsts.NO_BOREDOM)
				bBored = this._evaluate_simple_boredom(poCell, iBitmap)

			if (bBored)
			//flip the cell if bored
				poCell.evaluated.value = poCell.value == 1 ? 0 : 1
			else 
				poCell.evaluated.value = this.get_rule_output(poCell.state, iBitmap)

			//mark cell as done
			if (this.has_state_transitions) {
				// TBD state _transitions not implemented
			} else 
				poCell.evaluated.state = poCell.state
		}
		poCell.evaluated.done = true
		poCell.evaluated.pattern = iBitmap //the pattern evaluated - used to optimise cell evaluation

		//set the evaluated state
		var bHasChanged = poCell.evaluated.value !== poCell.value
		return bHasChanged
	}
}
