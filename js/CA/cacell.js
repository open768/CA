"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
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
	rule = null;
	
	constructor(){ 
		//not passing in row and col as cells dont have to be limited to 2d
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
		var bHasChanged = this.rule.evaluateCell(this);
		return bHasChanged;
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
		
		oNorth = oNeigh.get(cCACellTypes.directions.north);
		if (oNorth.evaluated.done){
			//optimisated by looking at the North cell, reduces the number of ops from 8 to 4
			iValue = oNorth.evaluated.pattern;
			iValue <<= 3;		//remove cells not in neighbourhood of this cell (makes number 12 bit, and bits are not in the right place)
			iValue &= cCARuleTypes.max_inputs; //truncate number to 9 bit number (but bits are not in the right place)
			iValue >>>= 3;		//get ready for adding southerly cells (bits in correct place)
			
			//further optimise by 1 op by looking at the evaluated West cell			
			oWest = oNeigh.get(cCACellTypes.directions.west);
			if (oWest.evaluated.done){
				iWPattern = oWest.evaluated.pattern ;
				iWPattern &= 0b11; //only interested in last 2 bits from west cell
				iValue <<=2;		//make space to copy pattern from west
				iValue |= iWPattern; //copy pattern
				
				iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.southeast).value; 
				iValue &= cCARuleTypes.max_inputs;
			}else{		
				iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.southwest).value;
				iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.south).value;
				iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.southeast).value;
			}
		}else{
			//create a 9 bit number consisting of the values of the neighbours
			//-------------------------------------------------------
			iValue = oNeigh.get(cCACellTypes.directions.northwest).value;
			iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.north).value;
			iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.northeast).value;
			//-------------------------------------------------------
			iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.west).value;
			iValue <<= 1;iValue |= this.value;
			iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.east).value;
			//-------------------------------------------------------
			iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.southwest).value;
			iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.south).value;
			iValue <<= 1; iValue |= oNeigh.get(cCACellTypes.directions.southeast).value;
		}
		
		return iValue;
	}
	
	//*****************************************************************
	getPattern(piNeighbourType){
		var oHash, iValue;

		oHash = this.neighbours;
		switch (piNeighbourType){
			case cCACellTypes.neighbours.eightway:
				iValue = this.get8WayPattern();
				break;
			case cCACellTypes.neighbours.fourway:
				//-------------------------------------------------------
				iValue = oHash.get(cCACellTypes.directions.northwest).value;
				iValue <<= 1; iValue |= oHash.get(cCACellTypes.directions.north).value;
				//-------------------------------------------------------
				iValue <<= 1; iValue |= oHash.get(cCACellTypes.directions.west).value;
				iValue <<= 1;iValue |= this.value;
				iValue <<= 1; iValue |= oHash.get(cCACellTypes.directions.east).value;
				//-------------------------------------------------------
				iValue <<= 1; iValue |= oHash.get(cCACellTypes.directions.south).value;
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