/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
var cCACell = function(){
	this.rule = null;
	this.state = 1;
	this.value = 0;
	
	this.data = new Map();	//the cell doesnt know what the data means, only that there is some data in there. this leaves the implementation of the cell flexible.
	
	this.evaluated = {
		done:false,
		state:0,
		value:1,
		bitmap:-1
	};

	//****************************************************************
	this.apply_rule = function(){
		//just calls the rules apply method. the benefit of doing it this way is 
		//that each cell could have a different rule.
		return this.rule.evaluateCell(this);
	};
	
	//****************************************************************
	this.promote = function(){
		this.state = this.evaluated.state;
		this.value = this.evaluated.value;
		this.evaluated.done = false;
	}
}