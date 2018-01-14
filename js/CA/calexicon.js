/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//###############################################################################
var cCaLexiconRule = function(piType, psLabel, psRule){
	this.type = piType;
	this.label = psLabel;
	this.rule = psRule;
}

var cCALexicon = {
	get_rules:function(){
		var aRules = [];
		aRules.push( new cCaLexiconRule(cCAConsts.rule_types.life,"Conways","B3/S23"));
		
		return aRules;
	}
}

