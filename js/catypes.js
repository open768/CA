/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//###############################################################################
var cCAConsts = {
	neighbours:{
		fourway: 0,
		eightway: 1
	},
	max_inputs:Math.pow(2,10)-1,
	states:{
		same: 0,
		up: 1,
		down:2,
		reset:3
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
