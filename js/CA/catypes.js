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

//###############################################################################
var cCALifeRules = {
	LIFE:"B3/S23"
}

//###############################################################################
var cCAConsts = {
	events:{
		done:"cadone",
		clear:"caclear",
		nochange:"caDead"
	},
	neighbours:{
		fourway: 0,
		eightway: 1,
		maximum:8,
		
		northwest:1,
		north:2,
		northeast:3,
		west:4,
		east:5,
		southwest:6,
		south:7,
		southeast:8
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
		sine:9,
		blank:10
	},
	action_types:{
		play:1,
		stop:2,
		step:3
	},
	
	event_types:{
		set_rule:1,
		initialise:2,
		resize:3,
		action:4
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

	//***************************************************************
	get_centre_value:function(piIndex){
		//000010000 = 16
		var iAnd = piIndex & 16;
		if (iAnd == 16)
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
