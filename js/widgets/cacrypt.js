"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacrypt",{
	//#################################################################
	//# check for stuff
	//#################################################################

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oElement = this.element;
		
		//checks
		if (!bean ) 	$.error("bean class is missing! check includes");	
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		
		//build the UI
		var oTable, oTR, oTD
		oTable = $("<table>", {border:1, cellspacing:0, cellpadding:5,width:"100%"});
			oTR = $("<tr>", {height:700});
				oTD = $("<TD>",{width:"50%", id:"ca",valign:"top"});
					oTR.append(oTD);
					this.pr__init_ca(oTD);
				oTD = $("<TD>",{width:"50%", id:"crypt",valign:"top"});
					oTR.append(oTD);
					this.pr__init_crypt(oTD);
				oTable.append(oTR);
			oTR = $("<tr>", {height:100});
				oTD = $("<TD>",{colspan:2, id:"status",valign:"top"});
					oTR.append(oTD);
					this.pre__init_status(oTD);
				oTable.append(oTR);
		oElement.append(oTable);
		
		//event listeners
	},
	
	//#################################################################
	//# Privates (initialising)
	//#################################################################
	pr__init_ca: function(poContainer){
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append("Cellular Automata");
			poContainer.append(oDiv);
		poContainer.append("CA goes here");
		poContainer.append("<li>BASE64 rule");
		poContainer.append("<li>initial pattern");
		poContainer.append("<li>Json import and export");
	},

	//******************************************************************
	pr__init_crypt: function(poContainer){
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append("Data");
			poContainer.append(oDiv);
		poContainer.append("Crypt goes here");
		poContainer.append("<li>initial rule executions");
		poContainer.append("<li>text to encrypt");
		poContainer.append("<li>text to decrypt");
		poContainer.append("<li>encrypt and decrypt buttons");
	},

	//******************************************************************
	pre__init_status: function(poContainer){
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append("Status");
			poContainer.append(oDiv);
		poContainer.append("Status goes here");
	},
	
	//#################################################################
	//# Privates (other)
	//#################################################################
});
