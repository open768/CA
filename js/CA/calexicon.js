"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
//for more rules see: http://psoup.math.wisc.edu/mcell/ca_rules.html

//###############################################################################
var cCaLexiconRule = function(piType, psLabel, psRule){
	this.type = piType
	this.label = psLabel
	this.rule = psRule
}

/**
 * Description placeholder
 * 
 *
 * @class cCALexicon
 * @typedef {cCALexicon}
 */
/* eslint-disable-next-line no-unused-vars */
class cCALexicon {
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @returns {{}}
	 */
	static get_presets(){
		var aPresets = []
		aPresets.push( this.#make_life_rule("2x2", "B36/S125"))
		aPresets.push( this.#make_life_rule("34 life", "B34/S34"))
		aPresets.push( this.#make_life_rule("Anneal", "B4678/S35678"))
		aPresets.push( this.#make_life_rule("Amoeba", "B357/S1358"))
		aPresets.push( this.#make_life_rule("Assimilation", "B345/S4567"))
		aPresets.push( this.#make_life_rule("Coagulations", "B378/S235678"))
		aPresets.push( this.#make_life_rule("Conways","B3/S23"))
		aPresets.push( this.#make_life_rule("Coral", "B3/S45678"))
		aPresets.push( this.#make_life_rule("Diamoeba", "B35678/S5678"))
		aPresets.push( this.#make_life_rule("Maze", "B3/S1234"))
		aPresets.push( this.#make_life_rule("Replicator","B1357/S1357"))
		aPresets.push( this.#make_life_rule("Walled Cities", "B45678/S2345"))
		
		return aPresets
	}
	
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @param {*} psName
	 * @param {*} psRule
	 * @returns {cCaLexiconRule}
	 */
	static #make_life_rule(psName, psRule){
		return new cCaLexiconRule(cCARuleTypes.rule_types.life,psName,psRule)
	}
	
}

