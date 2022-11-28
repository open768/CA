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
//# Binary
//###############################################################################
class cCABinaryExporter{
	static export (poRule,piState){
		if ( !cCommon.obj_is(poRule , "cCARule") ) throw new CAException("export requires cCARule")
		var sOut = "";
		if (piState > poRule.stateRules.length)	throw new CAException("invalid state requested");
		
		for (var i=1; i <=cCAConsts.max_inputs; i++)
			sOut = sOut + poRule.get_rule_output(piState,i);
		return sOut;		
	}
}

//###############################################################################
class cCABinaryImporter{
	static makeRule(psInput){
		if (psInput.length < cCAConsts.max_inputs) throw new CAException("incorrect length binary input:" + psInput.length + " should be " + cCAConsts.max_inputs);
		if (psInput.length > cCAConsts.max_inputs) psInput = psInput.slice(0,cCAConsts.max_inputs-1);

		//create  the rule 
		var oRule = new cCARule();
		oRule.neighbour_type = cCAConsts.neighbours.eightway;
		oRule.has_state_transitions = false;
		for (var i=1; i<=cCAConsts.max_inputs; i++){
			var ch = psInput.charAt(i-1);
			oRule.set_output(cCAConsts.default_state,i,parseInt(ch));
		}
		return oRule;
	}
	
	
	//***************************************************************
	test(){
		cDebug.write("Testing cCABinaryImporter");
		var oRule1 = cCALifeImporter.makeRule(cCALifeRules.LIFE); 
		
		var sBinaryIn = this.export(oRule1,1);
		var oRule2 = this.makeRule(sBinaryIn,1);
		
		var sBinaryOut = this.export(oRule2,1);
		if (sBinaryOut !== sBinaryIn) throw new Error("test failed");
		cDebug.write("Test passed");
	}
}

//###############################################################################
//# Base64
//###############################################################################
class cCARepeatBase64Importer{
	static makeRule(psShort){
		var sInput = psShort.trim();
		if (sInput.length == 0 ) throw new CAException("no input provided.");
		if (! cConverterEncodings.isBase64(sInput) ) throw new CAException("input must be base64 string");
		
		var iRepeat = Math.floor(cCAConsts.base64_length/ sInput.length);
		var s64 = sInput.repeat(iRepeat);
		var iRemain = cCAConsts.base64_length - s64.length;
		s64 = s64 + sInput.slice(0,iRemain);
		if (s64.length < cCAConsts.base64_length) throw new CAException("base64 not long enough, must be " + cCAConsts.base64_length + "chars");
		
		var sBin = cCASimpleBase64.toBinary(s64,cCAConsts.max_inputs);
		return cCABinaryImporter.makeRule(sBin);
	}
}

//###############################################################################
class cCABase64Exporter{
	//*****************************************************************************
	static export(poRule,piState){
		if ( !cCommon.obj_is(poRule , "cCARule") ) throw new CAException("export requires cCARule")
		if (piState > poRule.stateRules.length)	throw new CAException("invalid state requested");
		
		//a bit of a long way to go about it
		var sBin = cCABinaryExporter.export(poRule,piState);	//convert rule to binary
		var sOut = cCASimpleBase64.toBase64(sBin);			//convert binary to base64string
		if (sOut.length !== cCAConsts.base64_length) throw new CAException("generated base64 is the wrong length");	
		return sOut;
	}
}

//###############################################################################
class cCABase64Importer{
	static makeRule(ps64){
		if (ps64.length < cCAConsts.base64_length) throw new CAException("base64 not long enough, must be " + cCAConsts.base64_length + "chars");
		if (! cConverterEncodings.isBase64(ps64) ) throw new CAException("input must be base64  string");
		var sBin = cCASimpleBase64.toBinary(ps64,cCAConsts.max_inputs);
		return cCABinaryImporter.makeRule(sBin);
	}
}

//###############################################################################
//# Json
//###############################################################################
class cCAJsonExporter{
	static export(poRule){
		if ( !cCommon.obj_is(poRule , "cCARule") ) throw new CAException("export requires cCARule")
	}
}

//###############################################################################
//# Others
//###############################################################################
class cCaIdentityRule{
	static makeRule(){
		var oRule = new cCARule();
		oRule.neighbour_type = cCAConsts.neighbours.eightway;
		oRule.has_state_transitions = false;
		
		for (var i=1; i<=cCAConsts.max_inputs; i++){
			var iCentre = cCAIndexOps.get_value(i, cCAConsts.directions.centre);
			oRule.set_output(cCAConsts.default_state,i,iCentre);
		}
		
		return oRule;
	}
}

//***************************************************************
class cCaRandomRule{
	static makeRule(){
		var oRule = new cCARule();
		oRule.neighbour_type = cCAConsts.neighbours.eightway;
		oRule.has_state_transitions = false;
		
		for (var i=1; i<=cCAConsts.max_inputs; i++){
			var iRnd = Math.floor(Math.random() * 1.99);
			oRule.set_output(cCAConsts.default_state,i,iRnd);
		}
		return oRule;
	}
}


//###############################################################################
class cCAWolfram1DImporter {
	static makeRule(piRule){
		if ( isNaN(piRule) ) throw new CAException("rule must be a number.");
		if (piRule < 1 || piRule > 256) throw new CAException("rule must be between 1 and 256");
		
		//create an identity rule
		var oRule = cCaIdentityRule.makeRule();
		
		//create a wolfram lookup table
		var aWolfram = new Array(8);
		var i = 0;
		while (piRule > 0){
			aWolfram[i] = piRule && 1;
			i++;
			piRule >>>= 1;
		}
		
		//make wolfram changes to the rule
		//when the middle row is empty apply the wolfram rule to the row above
		for (var i=1; i<=cCAConsts.max_inputs; i++){
			var iCentreBits = cCAIndexOps.get_centre_bits(i);
			if (iCentreBits == 0){
				var iNorthBits = cCAIndexOps.get_north_bits(i);
				var iCentre;
				if (iNorthBits == 0)
					iCentre = cCAIndexOps.get_value(i, cCAConsts.directions.centre);
				else
					iCentre = aWolfram[iNorthBits];
				oRule.set_output(cCAConsts.default_state,i,iCentre);
			}
		}
				
		return oRule;
	}
}

//###############################################################################
class cCALifeImporter{
	//***************************************************************
	static makeRule(psInput){
		var sBorn, sSurvive;
		var aBorn = new Array(9);
		var aSurvive = new Array(9);
		
		if (psInput == null)	throw new CAException(" no rule to import");
		
		//validate rule and extract rule components
		var aMatches = psInput.match(/B(\d+)\/S(\d+)/i);
		if (aMatches == null ){
			var aMatches = psInput.match(/S(\d+)\/B(\d+)/i);
			if (aMatches == null )  throw new CAException(psInput+" is not a valid life notation - must be Bnnn/Snnn");
			sBorn = aMatches[2];
			sSurvive = aMatches[1];			
		}else{
			sBorn = aMatches[1];
			sSurvive = aMatches[2];			
		}
		
		cDebug.write(psInput + " is a valid life notation BORN:" + sBorn + " Survive:"+sSurvive);
		
		//populate importer arrays 		
		for ( var i = 0; i< sBorn.length; i++){
			var iPos = parseInt(sBorn.charAt(i));
			if (iPos<1 || iPos > cCAConsts.neighbours.maximum) throw new CAException(iPos+" is not a valid born count");
			aBorn[iPos] = 1;
		}
		for ( var i = 0; i< sSurvive.length; i++){
			if (iPos<0 || iPos > cCAConsts.neighbours.maximum) throw new CAException(iPos+" is not a valid survivor count");
			var iPos = parseInt(sSurvive.charAt(i));
			aSurvive[iPos] = 1;
		}
		
		//create  the rule 
		var oRule = new cCARule();
		oRule.neighbour_type = cCAConsts.Neighbour_8way;
		oRule.has_state_transitions = false;
		
		//populate the rule 
		for (var i=1; i <=cCAConsts.max_inputs; i++){
			var iCentre = cCAIndexOps.get_value(i, cCAConsts.directions.centre);
			var iCount = cCAIndexOps.get_bit_count(i) - iCentre;
			var iNewValue;
			
			iNewValue = iCentre;
			if (iCentre ==1){
				//check whether cell survives
				if ( aSurvive[iCount] != 1 ) iNewValue = 0;
			}else{
				//check whether cell is born				
				if ( aBorn[iCount] == 1 ) iNewValue = 1;
			}
			
			oRule.set_output(cCAConsts.default_state,i,iNewValue);
		}
		return oRule;
	}
};

class cCaModifierTypes{
	static verbs = {
		at_least: {id:1, label:"At least"},
		exactly: {id:2, label:"Exactly"},
		at_most: {id:3, label:"At Most"}
	};
}

//###############################################################################
class cCARuleModifier{
	static modify_neighbours(poRule, piVerb, piCount, piValue){
		if ( !cCommon.obj_is(poRule , "cCARule") ) throw new CAException("function requires cCARule");
		throw "work in progress";
	}
}

//var oTester = new cCABinaryImporter();
//oTester.test();
