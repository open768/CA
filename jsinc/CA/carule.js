"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAStateRule {
	constructor(){
		this.neighbour_type = cCAConsts.neighbours.eightway;
		this.outputs = new Array(cCAConsts.max_inputs);
		this.nextStates = new Array(cCAConsts.max_inputs);	
	}
}

//###############################################################################
class cCArule{
	constructor(){
		this.neighbour_type = cCAConsts.neighbours.eightway;
		this.has_state_transitions = false;
		this.stateRules = [];
		this.boredom = cCAConsts.no_boredom;
	}
	
	copy_to(poRule){
		poRule.neighbour_type = this.neighbour_type ;
		poRule.has_state_transitions = this.has_state_transitions;
		poRule.boredom = this.boredom ;
		poRule.stateRules = cCommon.deep_copy(this.stateRules);
	}
			
	//*****************************************************************
	set_output(piState, piPattern, piValue){
		if (piState <1 ) throw new CAException("invalid state");
		if (piState > this.stateRules.length)			//create a new state if the state is unknown 
			this.create_state(piState);
		this.stateRules[piState-1].outputs[piPattern] = piValue;
	}
	
	//*****************************************************************
	get_rule_output (piState, piPattern){
		if (piPattern == 0) return 0;
		if (piState > this.stateRules.length)	throw new CAException("invalid state requested");
		try{
			var iOutput = this.stateRules[piState-1].outputs[piPattern]; //TBD should be using a method
			if (iOutput == null) iOutput = 0;
			return iOutput;
		} catch (e){
			cDebug.write_err("unable to get output for state " + piState);
			throw e;
		}
	}
	
	//*****************************************************************
	create_state(piState){
		if (piState <= this.stateRules.length)	return; 
		if ( (!this.has_state_transitions) && (piState !== cCAConsts.default_state))
			throw new CAException("state not possible");
		
		var oStateRule = new cCAStateRule(); 
		oStateRule.neighbour_type = this.neighbour_type;
		this.stateRules[piState-1] = oStateRule;
	}
	
	//*****************************************************************
	set_nextState(piInState, piPattern, piNextState){
		if (!this.has_state_transitions)	throw new CAException("no state transitions possible");
		if (piInState > this.stateRules.length)	throw new CAException("invalid input state ");
		if (piNextState > this.stateRules.length)	throw new CAException("invalid next state ");
		this.stateRules[piInState-1].nextStates[piPattern] = piNextState; //TBD should be using a method
	}

	//*****************************************************************
	get_nextState(piInState, piPattern){
		if (piPattern == 0) return piInState;
		if (!this.has_state_transitions)	throw new CAException("no state transitions possible");
		if (piInState > this.stateRules.length)	throw new CAException("invalid state requested");
		var iOutState = this.stateRules[piInState-1].nextStates[piPattern]; //TBD should be using a method
		return iOutState;
	}	
	
	//*****************************************************************
	evaluateCell(poCell){
		if (poCell == null) throw new CAException("no cell provided");

		//get the cell neighbour value
		var iBitmap = poCell.getPattern(this.neighbour_type);
		
		//get the output
		poCell.evaluated.value = this.get_rule_output(poCell.state, iBitmap);
		
		//check for boredom
		if (this.has_state_transitions) 
			poCell.evaluated.state = this.get_nextState(poCell.state, iBitmap);
		else
			poCell.evaluated.state = poCell.state;
		poCell.evaluated.done = true;
		poCell.evaluated.pattern = iBitmap;
		
		//set the evaluated state
		return (poCell.evaluated.value !== poCell.value);
		
	}
}