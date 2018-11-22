/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
var cCAEvaluatedCell = function(){
	this.done=false;
	this.state=0;
	this.value=1;
	this.index=-1;	
}

var cCACell = function(){
	this.rule = null;
	this.state = 1;
	this.value = 0;
	
	this.data = new Map();	//the cell doesnt know what the data means, only that there is some data in there. this leaves the implementation of the cell flexible.
	this.neighbours = new Map(); //using a different hash to neighbours 
	
	this.evaluated = new cCAEvaluatedCell();

	this.clear = function(){
		this.state = 1;
		this.value = 0;
		this.evaluated.done = false;
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
	this.get8WayIndex=function(piNeighbourType){
		var oNeigh, iValue, oNorth;
		oNeigh = this.neighbours;
		
		oNorth = oNeigh.get(cCAConsts.directions.north);
		if (oNorth.evaluated.done){
			//optimisated by looking at the N cell, reduces the number of ops by 2/3
			iValue = oNorth.evaluated.index;
			iValue <<= 3;		//get rid of the first 3 entries - not needed for this cells
			iValue &= cCAConsts.max_inputs;
			iValue >>>= 3;		//get ready for adding southerly cells
			
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.southwest).value;
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.south).value;
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.southeast).value;
		}else{
			//-------------------------------------------------------
			iValue = oNeigh.get(cCAConsts.directions.northwest).value;
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.north).value;
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.northeast).value;
			//-------------------------------------------------------
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.west).value;
			iValue <<= 1;iValue |= this.value;
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.east).value;
			//-------------------------------------------------------
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.southwest).value;
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.south).value;
			iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.southeast).value;
		}
		
		return iValue;
	}
	
	//*****************************************************************
	this.getIndex=function(piNeighbourType){
		var oHash, iValue;

		oHash = this.neighbours;
		switch (piNeighbourType){
			case cCAConsts.neighbours.eightway:
				iValue = this.get8WayIndex();
				break;
			case cCAConsts.neighbours.fourway:
				//-------------------------------------------------------
				iValue = oHash.get(cCAConsts.directions.northwest).value;
				iValue <<= 1; iValue |= oHash.get(cCAConsts.directions.north).value;
				//-------------------------------------------------------
				iValue <<= 1; iValue |= oHash.get(cCAConsts.directions.west).value;
				iValue <<= 1;iValue |= this.value;
				iValue <<= 1; iValue |= oHash.get(cCAConsts.directions.east).value;
				//-------------------------------------------------------
				iValue <<= 1; iValue |= oHash.get(cCAConsts.directions.south).value;
				break;
			default:
				throw new CAException("unknown neighbour type: " + piNeighbourType);
		}
		
		return iValue;
	}
	
	//*****************************************************************
	this.setNeighbour = function(piDirection, poCell){
		if (poCell == null) throw new CAException("no neighbour cell provided");
		this.neighbours.set(piDirection, poCell);
	}

}