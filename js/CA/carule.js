/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

var cCAStateRule = function() {
	this.neighbour_type = cCAConsts.neighbours.eightway;
	this.outputs = new Array(cCAConsts.max_inputs);
	this.nextStates = new Array(cCAConsts.max_inputs);	
}

var cCALifeRules = {
	LIFE:"B3/S23"
}

//###############################################################################
var cCArule = function(){
	this.init = function(){
		this.neighbour_type = cCAConsts.neighbours.eightway;
		this.has_state_transitions = false;
		this.stateRules = [];
	};
	this.init();

	//*****************************************************************
	this.parseJson = function (psJson){
		try{
			var oData = JSON.parse(psJson);
		}catch (e){
			throw new CAException("not valid json rule");
		}
		//TODO
	};

	//*****************************************************************
	this.toJson = function (){
		//TODO
		var oJson = {};
	};
			
	//*****************************************************************
	this.set_output = function (piState, piIndex, piBitValue){
		if (piState > this.stateRules.length){
			var oRule = new cCAStateRule();
			oRule.neighbour_type = this.neighbour_type;
			this.stateRules[piState-1] = oRule;
		}	
		this.stateRules[piState-1].outputs[piIndex] = piBitValue;
	};
	
	//*****************************************************************
	this.get_output = function (piState, piIndex){
		if (piState > this.stateRules.length)	throw new CAException("invalid state requested");
		return this.stateRules[piState-1].outputs[piIndex];
	};
	
	//*****************************************************************
	this.set_nextState = function (piInState, piIndex, piOutState){
		if (!this.has_state_transitions)	throw new CAException("no state transitions possible");
		if (piInState > this.stateRules.length)	throw new CAException("invalid state requested");
		this.stateRules[piInState-1].nextStates[piIndex] = piOutState;
	};
	//*****************************************************************
	this.get_nextState = function (piInState, piIndex){
		if (!this.has_state_transitions)	throw new CAException("no state transitions possible");
		if (piInState > this.stateRules.length)	throw new CAException("invalid state requested");
		return this.stateRules[piInState-1].nextStates[piIndex];
	};	
}