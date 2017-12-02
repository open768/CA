var cCASimpleBase64 = {
	toBase64:function (psBin) {
		var s64 = "";
		for ( var istart = 0; istart<psBin.length; istart+=6 ){
			var sFragment = psBin.substr(istart,6);
			var iIndex = cConverter.binToInt(sFragment);
			var sChar = cConverterEncodings.BASE64.charAt(iIndex);
			s64 = s64 + sChar;
		}
		return s64;
	},
	
	//*********************************************************************
	toBinary:function (ps64, piLen) {
		var sOutBin = "";
		for (var i = 0; i< ps64.length; i++){
			var ch = ps64.charAt(i);
			var iVal = cConverter.base64ToDec(ch);
			var sBin = cConverter.intToBin(iVal);
			var iPadLen = (piLen >5?6:piLen);
			sBin = sBin.padLeft("0",iPadLen);
			sOutBin = sOutBin + sBin;
			piLen -= 6;
		}
		return sOutBin;
	},
	
	//*********************************************************************
	test:function(){
		var sBinIn = "";
		var iLength = Math.floor(50 + Math.random() * 50);
		
		cDebug.write("Testing cCASimpleBase64");
		for (var i = 0; i< iLength; i++){
			iRand = Math.floor(Math.random() * 1.99);
			sBinIn = sBinIn + iRand;
		}
		cDebug.write("- in Bin: " + sBinIn);
		var s64 = this.toBase64(sBinIn);
		cDebug.write("- base64: " + s64);
		var sBinOut = this.toBinary(s64, iLength);
		cDebug.write("-out Bin: " + sBinOut);
		
		if (sBinIn !== sBinOut) throw new Error("test Failed");
		cDebug.write("test succeeded")
	}
}

//###############################################################################
var cCABinaryImporter = function(){
	//*****************************************************************************
	this.makeRule = function(psInput){
		if (psInput.length !== cCAConsts.max_inputs) throw new CAException("incorrect length input");

		//create  the rule 
		var oRule = new cCArule();
		oRule.neighbour_type = cCAConsts.Neighbour_8way;
		oRule.has_state_transitions = false;
		for (var i=1; i<=cCAConsts.max_inputs; i++){
			var ch = psInput.charAt(i-1);
			oRule.set_output(1,i,parseInt(ch));
		}
		return oRule;
	}
	
	//*****************************************************************************
	this.toString = function(poRule,piState){
		var sOut = "";
		if (piState > poRule.stateRules.length)	throw new CAException("invalid state requested");
		
		for (var i=1; i <=cCAConsts.max_inputs; i++)
			sOut = sOut + poRule.get_output(piState,i);
		return sOut;		
	}
	
	//***************************************************************
	this.test = function(){
		cDebug.write("Testing cCABinaryImporter");
		var oLifeImporter = new cCALifeImporter();
		var oRule1 = oLifeImporter.makeRule(cCALifeRules.LIFE); 
		
		var sBinaryIn = this.toString(oRule1,1);
		var oRule2 = this.makeRule(sBinaryIn,1);
		
		var sBinaryOut = this.toString(oRule2,1);
		if (sBinaryOut !== sBinaryIn) throw new Error("test failed");
		cDebug.write("Test passed");
	}
}

//###############################################################################
var cCABase64Importer = function(){
	this.makeRule = function(ps64){
		if (! cConverterEncodings.isBase64(ps64) ) throw new CAException("not a valid base64 string");
		var sBin = cCASimpleBase64.toBinary(ps64,cCAConsts.max_inputs);
		var oImporter = new cCABinaryImporter();
		return oImporter.makeRule(sBin);
	};

	//*****************************************************************************
	this.toString = function(poRule,piState){
		if (piState > poRule.stateRules.length)	throw new CAException("invalid state requested");
		
		var oExporter = new cCABinaryImporter()
		var sBin = oExporter.toString(poRule,piState);
		var sOut = cCASimpleBase64.toBase64(sBin);
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

//var oTester = new cCABinaryImporter();
//oTester.test();
