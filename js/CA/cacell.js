/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
var cCACell = function(){
	this.rule = null;
	this.state = 1;
	this.value = 0;
	
	this.data = new Map();	//the cell doesnt know what the data means, only that there is some data in there. this leaves the implementation of the cell flexible.
	
	this.evaluated = {
		state:0,
		value:1
	};

	//****************************************************************
	this.apply_rule = function(){
		//just calls the rules apply method. the benefit of doing it this way is 
		//that each cell could have a different rule.
		if (this.rule == null) throw new CAException("no rule defined");
		return this.rule.evaluateCell(this);
	};
	
	//****************************************************************
	this.promote = function(){
		this.state = this.evaluated.state;
		this.value = this.evaluated.value;
		this.evaluated.done = false;
	}
	
	//*****************************************************************
	this.getIndex=function(piNeighbourType){
		var oHash, iValue;

		oHash = this.data;
		switch (piNeighbourType){
			case cCAConsts.neighbours.eightway:
				//-------------------------------------------------------
				iValue = oHash.get(cCAConsts.neighbours.northwest).value;
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.north).value;
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.northeast).value;
				//-------------------------------------------------------
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.west).value;
				iValue <<= 1;iValue |= this.value;
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.east).value;
				//-------------------------------------------------------
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.southwest).value;
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.south).value;
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.southeast).value;
				break;
			case cCAConsts.neighbours.fourway:
				//-------------------------------------------------------
				iValue = oHash.get(cCAConsts.neighbours.northwest).value;
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.north).value;
				//-------------------------------------------------------
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.west).value;
				iValue <<= 1;iValue |= this.value;
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.east).value;
				//-------------------------------------------------------
				iValue <<= 1; iValue |= oHash.get(cCAConsts.neighbours.south).value;
				break;
			default:
				throw new CAException("unknown neighbour type: " + piNeighbourType);
		}
		
		return iValue;
	}
	
	//*****************************************************************
	this.setNeighbour = function(piDirection, poCell){
		if (poCell == null) throw new CAException("no neighbour cell provided");
		this.data.set(piDirection, poCell);
	}

}