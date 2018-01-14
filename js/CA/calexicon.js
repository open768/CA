/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/


//for more rules see: http://psoup.math.wisc.edu/mcell/ca_rules.html

//###############################################################################
var cCaLexiconRule = function(piType, psLabel, psRule){
	this.type = piType;
	this.label = psLabel;
	this.rule = psRule;
}

var cCALexicon = {
	get_rules:function(){
		var aRules = [];
		aRules.push( this.pr__make_life_rule("Anneal", "B4678/S35678"));
		aRules.push( this.pr__make_life_rule("Amoeba", "B1358/S357"));
		aRules.push( this.pr__make_life_rule("Conways","B3/S23"));
		aRules.push( this.pr__make_life_rule("Diamoeba", "B5678/S35678"));
		aRules.push( this.pr__make_life_rule("Coral", "B45678/S3"));
		aRules.push( this.pr__make_life_rule("Replicator","B1357/S1357"));
		aRules.push( this.pr__make_life_rule("Walled Cities", "B2345/S45678"));
		
		return aRules;
	},
	
	pr__make_life_rule: function(psName, psRule){
		return new cCaLexiconRule(cCAConsts.rule_types.life,psName,psRule);
	}
	
}

