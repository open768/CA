
//###############################################################################
var cCAConsts = {
	Neighbour_4way: 0,
	Neighbour_8way: 1, 
	max_inputs:Math.pow(2,10)-1
};

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

//###############################################################################
var cBaseOps = {
	binary_to_base64: function(psBinary){
		var sBase64 = "";
		//TODO
	},
	
	//***************************************************************
	base64_to_binary: function(psBase64){
		
	}
}