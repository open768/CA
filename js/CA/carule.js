"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

/**
 * Description placeholder
 * 
 *
 * @class cCAStateRule
 * @typedef {cCAStateRule}
 */class cCAStateRule {
	/**
	 * Creates an instance of cCAStateRule.
	 * 
	 *
	 * @constructor
	 */
	constructor(){
		this.neighbour_type = cCACellTypes.neighbours.eightway;
		this.outputs = new Array(cCARuleTypes.max_inputs);
		this.nextStates = new Array(cCARuleTypes.max_inputs);	//for future use
	}
}

//###############################################################################
/**
 * Description placeholder
 * 
 *
 * @class cCARule
 * @typedef {cCARule}
 */
class cCARule{
	/** @type number */ neighbour_type = cCACellTypes.neighbours.eightway;
	/** @type boolean */ has_state_transitions = false;
	/** @type Array */ 	 stateRules = null;  
	/** @type number */  boredom = cCARuleTypes.no_boredom;

	/**
	 * Creates an instance of cCARule.
	 * 
	 *
	 * @constructor
	 */
	constructor(){
		this.neighbour_type = cCACellTypes.neighbours.eightway;
		this.has_state_transitions = false;
		this.stateRules = [];  
		this.boredom = cCARuleTypes.no_boredom;
	}
	
	//***************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @returns {cCARule}
	 */
	static randomRule(){
		cDebug.enter();
		var oRule = new cCARule();
		oRule.neighbour_type = cCACellTypes.neighbours.eightway;
		oRule.has_state_transitions = false;
		
		for (var i=1; i<=cCARuleTypes.max_inputs; i++){
			var iRnd = Math.floor(Math.random() * 1.99);
			oRule.set_output(cCACellTypes.default_state,i,iRnd);
		}
		cDebug.leave();
		return oRule;
	}
	
	//***************************************************************
	/**
	 * Description
	 * @param {cCARule} poRule
	 */
	copy_to(poRule){
		cDebug.enter();
		poRule.neighbour_type = this.neighbour_type ;
		poRule.has_state_transitions = this.has_state_transitions;
		poRule.boredom = this.boredom ;
		poRule.stateRules = cCommon.deep_copy(this.stateRules);
	}
			
	//*****************************************************************
	//rule State level functions
	//*****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} piState
	 * @param {*} piPattern
	 * @param {*} piValue
	 */
	set_output(piState, piPattern, piValue){
		if (piState <1 ) throw new CAException("invalid state");
		if (piState > this.stateRules.length)			//create a new state if the state is unknown 
			this.create_state(piState);
		this.stateRules[piState-1].outputs[piPattern] = piValue;
	}

	//*****************************************************************
	/**
	 * Description
	 * @param {number} piBoredom
	 */
	set_boredom(piBoredom){
		if (piBoredom < 2) throw new CAException("boredom must be at least 2");
		this.boredom = piBoredom;
	}
	
	//*****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} piState
	 * @param {*} piBitmap
	 * @returns {*}
	 */
	get_rule_output (piState, piBitmap){
		if (piBitmap == 0) return 0;	// cells must have neighbours - 0 doesnt become 1 
		if (piState > this.stateRules.length)	throw new CAException("invalid state requested");
		try{
			var iOutput = this.stateRules[piState-1].outputs[piBitmap]; //TBD should be using a method
			if (iOutput == null) iOutput = 0;
			return iOutput;
		} catch (e){
			cDebug.write_err("unable to get output for state " + piState);
			throw e;
		}
	}
	
	//*****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} piState
	 */
	create_state(piState){
		if (piState <= this.stateRules.length)	return; 
		if ( (!this.has_state_transitions) && (piState !== cCACellTypes.default_state))
			throw new CAException("state not possible");
		
		var oStateRule = new cCAStateRule(); 
		oStateRule.neighbour_type = this.neighbour_type;
		this.stateRules[piState-1] = oStateRule;
	}
	
	//*****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} piInState
	 * @param {*} piPattern
	 * @param {*} piNextState
	 */
	set_nextState(piInState, piPattern, piNextState){
		if (!this.has_state_transitions)	throw new CAException("no state transitions possible");
		if (piInState > this.stateRules.length)	throw new CAException("invalid input state ");
		if (piNextState > this.stateRules.length)	throw new CAException("invalid next state ");
		this.stateRules[piInState-1].nextStates[piPattern] = piNextState; //TBD should be using a method
	}

	//*****************************************************************
	/**
	 * Description placeholder
	 * 
	 *
	 * @param {*} piInState
	 * @param {*} piPattern
	 * @returns {*}
	 */
	get_nextState(piInState, piPattern){
		if (piPattern == 0) return piInState;
		if (!this.has_state_transitions)	throw new CAException("no state transitions possible");
		if (piInState > this.stateRules.length)	throw new CAException("invalid state requested");
		var iOutState = this.stateRules[piInState-1].nextStates[piPattern]; //TBD should be using a method
		return iOutState;
	}	
	


	//*****************************************************************
	/**
	 * Description
	 * @param {cCACell} poCell
	 */
	evaluateCell(poCell){
		if (poCell == null) throw new CAException("no cell provided");

		//get the cell neighbour value
		var iBitmap = poCell.getPattern(this.neighbour_type);
		
		//modify rule if cell boredom
		/** @type Boolean */ var bBored = poCell.check_boredom(iBitmap);

		//get the output
		poCell.evaluated.value = this.get_rule_output(poCell.state, iBitmap);
		if (bBored){
			console.log("bored");
		}
		
		//mark cell as done
		if (this.has_state_transitions) {
			// TBD state _transitions not implemented
		}else
			poCell.evaluated.state = poCell.state;
		poCell.evaluated.done = true;
		poCell.evaluated.pattern = iBitmap; //the pattern evaluated - used to optimise cell evaluation
		
		//set the evaluated state
		var bHasChanged = (poCell.evaluated.value !== poCell.value);
		return bHasChanged;
	}

	//******************************************************************************************************* */
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 */
	static test_boredom(){
        var oRule = cCARuleBase64Importer.makeRule("0yMK,2Pg,t0IQfTgQg7h02Pg,t3h0t40Qg7h0g01000IQfTgQg7h0d41Qg400g00Qg7h0g0100400g00000000") //conways 
		var oCell = new cCACell()
		oCell.rule = oRule
	}
}