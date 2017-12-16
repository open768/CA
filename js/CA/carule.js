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

//###############################################################################
var cCArule = function(){
	this.neighbour_type = cCAConsts.neighbours.eightway;
	this.has_state_transitions = false;
	this.stateRules = [];
			
	//*****************************************************************
	this.set_output = function (piState, piIndex, piValue){
		if (piState > this.stateRules.length){
			var oStateRule = new cCAStateRule();
			oStateRule.neighbour_type = this.neighbour_type;
			this.stateRules[piState-1] = oStateRule;
		}	
		this.stateRules[piState-1].outputs[piIndex] = piValue;
	};
	
	//*****************************************************************
	this.get_output = function (piState, piIndex){
		if (piIndex == 0) return 0;
		if (piState > this.stateRules.length)	throw new CAException("invalid state requested");
		try{
			return this.stateRules[piState-1].outputs[piIndex];
		} catch (e){
			cDebug.write_err("unable to get output for state " + piState);
			throw e;
		}
	};
	
	//*****************************************************************
	this.set_nextState = function (piInState, piIndex, piNextState){
		if (!this.has_state_transitions)	throw new CAException("no state transitions possible");
		if (piInState > this.stateRules.length)	throw new CAException("invalid input state ");
		if (piNextState > this.stateRules.length)	throw new CAException("invalid next state ");
		this.stateRules[piInState-1].nextStates[piIndex] = piNextState;
	};

	//*****************************************************************
	this.get_nextState = function (piInState, piIndex){
		if (piIndex == 0) return piInState;
		if (!this.has_state_transitions)	throw new CAException("no state transitions possible");
		if (piInState > this.stateRules.length)	throw new CAException("invalid state requested");
		var iOutState = this.stateRules[piInState-1].nextStates[piIndex];
		return iOutState;
	};	
	
	//*****************************************************************
	this.evaluateCell = function(poCell){
		if (poCell == null) throw new CAException("no cell provided");

		//get the cell neighbour value
		var iIndex;
		switch (this.neighbour_type){
			case cCAConsts.neighbours.eightway:
				iIndex = this.get8NeighbourIndex(poCell);
				break;
			case cCAConsts.neighbours.fourway:
				iIndex = this.get4NeighbourIndex(poCell);
				break;
			default:
				throw new CAException("unknown neighbour type " + this.neighbour_type);
		}
		
		//get the output
		poCell.evaluated.value = this.get_output(poCell.state, iIndex);
		if (this.has_state_transitions) 
			poCell.evaluated.state = this.get_nextState(poCell.state, iIndex);
		else
			poCell.evaluated.state = poCell.state;
		
		//set the evaluated state
		return (poCell.evaluated.value !== poCell.value);
		
	};
	
	//*****************************************************************
	this.get8NeighbourIndex=function(poCell){
		var iNei, oNei,iValue, oData;

		oHash = poCell.data;
		//-------------------------------------------------------
		iValue = oHash.get(cCAConsts.neighbours.northwest).value;
		iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.north).value;
		iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.northeast).value;
		//-------------------------------------------------------
		iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.west).value;
		iValue <<= 1;iValue |= poCell.value;
		iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.east).value;
		//-------------------------------------------------------
		iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.southwest).value;
		iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.south).value;
		iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.southeast).value;
		
		return iValue;
	}

	//*****************************************************************
	this.get4NeighbourIndex=function(poCell){
		var iValue = 0;
	}

}