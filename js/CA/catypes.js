/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

var cCAEvent = function(piType, poData){
	this.type = piType;
	this.data = poData;
}

//###############################################################################
var cCAConsts = {
	neighbours:{
		fourway: 0,
		eightway: 1,
		
		north:1,
		northeast:2,
		east:3,
		southeast:4,
		south:5,
		southwest:6,
		west:7,
		northwest:8
	},
	max_inputs:Math.pow(2,10)-1,
	base64_length: Math.ceil((Math.pow(2,10)-1)/6),
	
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
		sine:9
	},
	event_types:{
		set_rule:1,
		initialise:2,
		resize:3
	}
};

//###############################################################################
function CAException(psMessage) {
   this.message = psMessage;
   this.name = 'CAException';
}


//###############################################################################
var cIndexOps = {
	//***************************************************************
	get_centre_value:function(piIndex){
		return piIndex & 1;
	},
	
	//***************************************************************
	get_bit_count:function(piIndex){
		var iTmp = piIndex;
		var iCount = 0;
		iTmp = iTmp >>> 1 ;	//skip the centre bit
		while (iTmp > 0){
			if ((iTmp & 1) == 1) iCount ++;
			iTmp = iTmp >>> 1;				
		}
		return iCount;
	}
};
