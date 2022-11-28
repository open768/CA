"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//###############################################################################
var cCAEvent = function(piType, poData){
	this.type = piType;
	this.data = poData;
}

var cCARunData = function(){
	this.active = 0;
	this.runs = 0;
	this.changed = 0;
}

//###############################################################################
class cCALifeRules {
	static LIFE ="B3/S23"
}

//###############################################################################
class cCAConsts {
	static event_hook = "CAEV";
	static events = {
		done:"D",
		clear:"C",
		nochange:"N",
		notify_finished:"F",
	};
	static event_types={
		set_rule:1,
		initialise:2,
		resize:3,
		action:4,
		nochange:5,
		status:6
	};
	static neighbours={
		fourway: 0,
		eightway: 1,
		maximum:8
	};
	static directions={	
		northwest:1,
		north:2,
		northeast:3,
		west:4,
		centre:5,
		east:6,
		southwest:7,
		south:8,
		southeast:9
	};
	static max_inputs =Math.pow(2,9)-1;
	static base64_length =  Math.ceil((Math.pow(2,9)-1)/6);
	static default_state = 1;
	static states={
		same: 0,
		up: 1,
		down:2,
		reset:3
	};
	static no_boredom= -1;
	static rule_types={
		life:1,
		binary:2,
		base64:3,
		wolfram1d:4,
		random:5
	};
	static action_types={
		play:1,
		stop:2,
		step:3
	};
	
	static hash_values={
		row:"R",
		col:"C"
	};	
}

//###############################################################################
function CAException(psMessage) {
   this.message = psMessage;
   this.name = 'CAException';
}


//###############################################################################
class cCAIndexOps {
	//bits are created 	nw,n,ne,w,c,e,sw,s,se

	static get_value(piIndex, piDirection){
		var iVal;
		
		switch (piDirection){
			case cCAConsts.directions.northwest:
				iVal = 256;
				break;
			case cCAConsts.directions.north:
				iVal = 128;
				break;
			case cCAConsts.directions.northeast:
				iVal = 64;
				break;
			case cCAConsts.directions.west:
				iVal = 32;
				break;
			case cCAConsts.directions.centre:
				iVal = 16;
				break;
			case cCAConsts.directions.east:
				iVal = 8;
				break;
			case cCAConsts.directions.southwest:
				iVal = 4;
				break;
			case cCAConsts.directions.south:
				iVal = 2;
				break;
			case cCAConsts.directions.southeast:
				iVal = 1;
				break;
			default:
				throw new CAException("unknown direction " + piDirection);
		}
		
		var iAnd = piIndex & iVal;
		if (iAnd == iVal)
			return 1;
		else	
			return 0;
	}
		
	//***************************************************************
	static get_bit_count(piIndex){
		var iTmp = piIndex;
		var iCount = 0;
	
		while (iTmp > 0){
			if ((iTmp & 1) == 1) iCount ++;
			iTmp = iTmp >>> 1;		//keep right shifting the value until nothing is left		
		}
		return iCount;
	}
	
	//***************************************************************
	static get_north_bits(piIndex){
		var iVal = 0;
		iVal |= this.get_value(piIndex, cCAConsts.directions.northwest );
		iVal <<=1; iVal |= this.get_value(piIndex, cCAConsts.directions.north );
		iVal <<=1; iVal |= this.get_value(piIndex, cCAConsts.directions.northeast );
		return iVal;
	}
	
	//***************************************************************
	static get_centre_bits(piIndex){
		var iVal = 0;
		iVal |= this.get_value(piIndex, cCAConsts.directions.west );
		iVal <<=1; iVal |= this.get_value(piIndex, cCAConsts.directions.centre );
		iVal <<=1; iVal |= this.get_value(piIndex, cCAConsts.directions.east );
		return iVal;
	}
	
	//***************************************************************
	static get_south_bits(piIndex){
		var iVal = 0;
		iVal |= this.get_value(piIndex, cCAConsts.directions.southwest );
		iVal <<=1; iVal |= this.get_value(piIndex, cCAConsts.directions.south );
		iVal <<=1; iVal |= this.get_value(piIndex, cCAConsts.directions.southeast );
		return iVal;
	}
};
