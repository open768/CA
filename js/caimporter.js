var cCASimpleBase64 = {
	toBase64:function (psBin) {
		cDebug.write("encoding base64");
		var s64 = "";
		for ( var istart = 0; istart<psBin.length; istart+=6 ){
			var sFragment = psBin.substr(istart,6);
			var sIndex = cConverter.binToInt(sFragment);
			var sChar = cConverterEncodings.BASE64.charAt(sIndex);
			s64 = s64 + sChar;
		}
		return s64;
	},
	
	//*********************************************************************
	toBinary:function (ps64) {
		cDebug.write("decoding base64");
		var sOutBin = "";
		for (var i = 0; i< ps64.length; i++){
			var ch = ps64.charAt(i);
			var iVal = cConverterEncodings.BASE64.indexOf(ch);
			var sBin = cConverter.intToBin(iVal);
			sBin = sBin.padLeft("0",6);
			sOutBin = sOutBin + sBin;
		}
		return sOutBin;
	},

}

//###############################################################################
var cCABinaryImporter = function(){
	this.makeRule = function(psInput){
		var sPadded = psInput.padLeft("0",cCAConsts.max_inputs);
		cDebug.write("binary:"+sPadded + " length:"+sPadded.length);
	}
	
	//*****************************************************************************
	this.toString = function(poRule,piState){
		var sOut = "";
		if (piState > poRule.stateRules.length)	throw new CAException("invalid state requested");
		
		for (var i=1; i <=cCAConsts.max_inputs; i++)
			sOut = sOut + poRule.get_output(piState,i);
		cDebug.write("binary:"+sOut + " length:"+sOut.length);
		return sOut;		
	}
}

//###############################################################################
var cCABase64Importer = function(){
	this.makeRule = function(ps64){
		if (! cConverterEncodings.isBase64(ps64) ) throw new CAException("not a valid base64 string");
		cDebug.write("base64:" + ps64 + " length:" + ps64.length);
		var sBin = cCASimpleBase64.toBinary(ps64);
		var oImporter = new cCABinaryImporter();
		return oImporter.makeRule(sBin);
	};

	//*****************************************************************************
	this.toString = function(poRule,piState){
		if (piState > poRule.stateRules.length)	throw new CAException("invalid state requested");
		
		var oExporter = new cCABinaryImporter()
		var sBin = oExporter.toString(poRule,piState);
		var sOut = cCASimpleBase64.toBase64(sBin);
		cDebug.write("base64:" + sOut +" length:" + sOut.length);
		return sOut;
	};
}

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
			throw new CAException(psInput+" is not a valid life notation - must be Bnnn/Snnn");
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
		return oRule;
	};
	
};