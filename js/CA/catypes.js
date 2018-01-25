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
var cCALifeRules = {
	LIFE:"B3/S23"
}

//###############################################################################
var cCAConsts = {
	events:{
		done:"D",
		clear:"C",
		nochange:"N",
		notify_finished:"F"
	},
	event_types:{
		set_rule:1,
		initialise:2,
		resize:3,
		action:4,
		nochange:5,
		status:6
	},
	neighbours:{
		fourway: 0,
		eightway: 1,
		maximum:8
	},
	directions:{	
		northwest:1,
		north:2,
		northeast:3,
		west:4,
		centre:5,
		east:6,
		southwest:7,
		south:8,
		southeast:9
	},
	max_inputs:Math.pow(2,9)-1,
	base64_length: Math.ceil((Math.pow(2,9)-1)/6),
	states:{
		same: 0,
		up: 1,
		down:2,
		reset:3
	},
	rule_types:{
		life:1,
		binary:2,
		base64:3
	},
	init_values:{
		block:1,
		random:2,
		horiz_line:3,
		vert_line:4,
		diagonal:5,
		diamond:6,
		cross:7,
		circle:8,
		sine:9,
		blank:10
	},
	action_types:{
		play:1,
		stop:2,
		step:3
	},
	
	
	hash_values:{
		row:"R",
		col:"C"
	}
	
};

//###############################################################################
function CAException(psMessage) {
   this.message = psMessage;
   this.name = 'CAException';
}


//###############################################################################
var cCAIndexOps = {
	//bits are created 	nw,n,ne,w,c,e,sw,s,se

	get_value: function(piIndex, piDirection){
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
	},
		
	//***************************************************************
	get_bit_count:function(piIndex){
		var iTmp = piIndex;
		var iCount = 0;
	
		while (iTmp > 0){
			if ((iTmp & 1) == 1) iCount ++;
			iTmp = iTmp >>> 1;				
		}
		return iCount;
	}
};
