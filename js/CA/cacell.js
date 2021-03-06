/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cCAEvaluatedCell {
	constructor(){
		this.done=false;
		this.state=0;
		this.value=1;
		this.pattern=-1;	
	}
}

//###################################################################################
//#
//###################################################################################
class cCACell{
	constructor(){
		this.rule = null;
		this.state = 1;
		this.value = 0;
		this.lastPattern = -1;
		this.samePatternCount = 0;
		
		this.data = new Map();	//the cell doesnt know what the data means, only that there is some data in there. this leaves the implementation of the cell flexible.
		this.neighbours = new Map(); //hash map of neighbours
		
		this.evaluated = new cCAEvaluatedCell();
	}

	//****************************************************************
	clear(){
		this.lastPattern = -1;
		this.samePatternCount = 0;
		this.state = 1;
		this.value = 0;
		this.evaluated = new cCAEvaluatedCell();
	}
	
	//****************************************************************
	apply_rule(){
		//just calls the rules apply method. the benefit of doing it this way is 
		//that each cell could have a different rule.
		if (this.rule == null) throw new CAException("no rule defined");
		return this.rule.evaluateCell(this);
	}
	
	//****************************************************************
	promote(){
		this.state = this.evaluated.state;
		this.value = this.evaluated.value;
		this.evaluated.done = false;
	}
	
	//*****************************************************************
	get8WayPattern(piNeighbourType){
		var oNeigh, iValue, oNorth, oWest, iWPattern;
		oNeigh = this.neighbours;
		
		oNorth = oNeigh.get(cCAConsts.directions.north);
		if (oNorth.evaluated.done){
			//optimisated by looking at the North cell, reduces the number of ops from 8 to 4
			iValue = oNorth.evaluated.pattern;
			iValue <<= 3;		//remove cells not in neighbourhood of this cell (makes number 12 bit, and bits are not in the right place)
			iValue &= cCAConsts.max_inputs; //truncate number to 9 bit number (but bits are not in the right place)
			iValue >>>= 3;		//get ready for adding southerly cells (bits in correct place)
			
			//further optimise by 1 op by looking at the evaluated West cell			
			oWest = oNeigh.get(cCAConsts.directions.west);
			if (oWest.evaluated.done){
				iWPattern = oWest.evaluated.pattern ;
				iWPattern &= 0b11; //only interested in last 2 bits from west cell
				iValue <<=2;		//make space to copy pattern from west
				iValue |= iWPattern; //copy pattern
				
				iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.southeast).value; 
				iValue &= cCAConsts.max_inputs;
			}else{		
				iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.southwest).value;
				iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.south).value;
				iValue <<= 1; iValue |= oNeigh.get(cCAConsts.directions.southeast).value;
			}
		}else{
			//create a 9 bit number consisting of the values of the neighbours
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
	getPattern(piNeighbourType){
		var oHash, iValue;

		oHash = this.neighbours;
		switch (piNeighbourType){
			case cCAConsts.neighbours.eightway:
				iValue = this.get8WayPattern();
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
	setNeighbour(piDirection, poCell){
		if (poCell == null) throw new CAException("no neighbour cell provided");
		this.neighbours.set(piDirection, poCell);
	}

}