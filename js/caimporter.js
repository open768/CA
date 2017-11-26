
//###############################################################################
var cCALifeImporter = function(){
	//***************************************************************
	this.makeRule = function(psInput){
		var sBorn, sSurvive;
		var aBorn = new Array(9);
		var aSurvive = new Array(9);
		
		//validate rule and extract rule components
		var aMatches = psInput.match(/B(\d+)\/S(\d+)/);
		if (aMatches == null ){
			alert (psInput+" is not a valid life notation - must be Bnnn/Snnn");
			$.error("invalid life notation");
			return
		}
		sBorn = aMatches[1];
		sSurvive = aMatches[2];
		
		cDebug.write(psInput + " is a valid life notation BORN:" + sBorn + " Survive:"+sSurvive);
		
		//populate importer arrays 		
		for ( var i = 0; i< sBorn.length; i++){
			var iPos = parseInt(sBorn.charAt(i));
			aBorn[iPos] = 1;
		}
		for ( var i = 0; i< sSurvive.length; i++){
			var iPos = parseInt(sSurvive.charAt(i));
			aSurvive[iPos] = 1;
		}
		
		//create  the rule 
		var oRule = new cCArule();
		oRule.neighbour_type = cCAConsts.Neighbour_8way;
		oRule.has_state_transitions = false;
		
		//populate the rule 
		for (var i=1; i <=cCAConsts.max_inputs; i++){
			var iCentre = cIndexOps.get_centre_value(i);
			var iCount = cIndexOps.get_bit_count(i);
			var iNewValue;
			
			iNewValue = iCentre;
			if (iCentre ==1){
				//check whether cell survives
				if ( aSurvive[iCount] != 1 ) iNewValue = 0;
			}else{
				//check whether cell is born				
				if ( aBorn[iCount] == 1 ) iNewValue = 1;
			}
			
			oRule.set_output(1,i,iNewValue);
		}
		var sRule = oRule.toString(1); 
		cDebug.write(sRule);
		return oRule;
	};
	
};