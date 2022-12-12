"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED

Cryptography code demonstrated in this application is covered by the UK Govt 
Open General Export License for Cryptographic development 
(see https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1101784/open-general-export-licence-cryptographic-development.pdf) 
and is not intended for dual use as defined by this license. 
You the consumer of this application are entirely responsible for importing this code into your own country. if you disagree please close this page.

**************************************************************************/

//###################################################################################
//###################################################################################
class cCACryptTypes{
	static name =  "cacryptgrid";
}

//###################################################################################
//###################################################################################
class cCACryptData{
	element = null;
	constructor(poElement){
		this.element = poElement;
		var oElement = poElement;
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		oElement.empty();
		this.init();
	}
	
	//*******************************************************************************
	init(){
		var oElement = this.element;
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append("Data");
			oElement.append(oDiv);
		oDiv = $("<DIV>", {class:"ui-widget-content"});
			oDiv.append("Crypt goes here");
			oDiv.append("<li>initial rule executions");
			oDiv.append("<li>text to encrypt");
			oDiv.append("<li>text to decrypt");
			oDiv.append("<li>encrypt and decrypt buttons");
			oElement.append(oDiv);
	}
}
	
//###################################################################################
//###################################################################################
class cCACryptCA{
	element = null;
	constructor(poOptions, poElement){
		if (!bean ) 	$.error("bean class is missing! check includes");	
		this.element = poElement;
		this.ca_name = poOptions.ca_name;
		var oElement = poElement;
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		oElement.empty();
		this.init();
	}
	
	//*******************************************************************************
	init(){
		var oElement = this.element;
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append("Cellular Automata");
			oElement.append(oDiv);
		oDiv = $("<DIV>", {class:"ui-widget-content"});
			oDiv.append("CA goes here");
			oDiv.append("<li>BASE64 rule");
			oDiv.append("<li>initial pattern");
			oDiv.append("<li>Json import and export");
			oElement.append(oDiv);
	}
}

//###################################################################################
//###################################################################################
class cCACryptStatus{
	element = null;
	constructor(poElement){
		if (!bean ) 	$.error("bean class is missing! check includes");	
		this.element = poElement;
		var oElement = poElement;
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		oElement.empty();
		this.init();
	}
	
	//*******************************************************************************
	init(){
		var oElement = this.element;
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append("Status");
			oElement.append(oDiv);
		oDiv = $("<DIV>", {class:"ui-widget-content"});
			oDiv.append("Status goes here");
			oElement.append(oDiv);
	}
}

//###################################################################################
//###################################################################################
class cCACrypt {
	element = null;
	ca_name = null;
	
	constructor(psCAName, poElement){
		if (!bean ) 	$.error("bean class is missing! check includes");	
		this.element = poElement;
		this.ca_name = psCAName;
		var oElement = poElement;
		oElement.uniqueId();
		
		if (!oElement.cacryptstatus) $.error("missing status widget");
		if (!oElement.cacryptca) $.error("missing CA widget");
		if (!oElement.cacryptdata) $.error("missing CA data widget");
		this.init();
	}
	
	//*******************************************************************************
	init(){
		var oElement = this.element;
		var oDiv;
		
		//build the UI
		var oTable, oTR, oTD
		oTable = $("<table>", {border:0, cellspacing:0, cellpadding:5,width:"100%"});
			oTR = $("<tr>");
				oTD = $("<TD>",{width:"50%", id:"ca",valign:"top"});
					oDiv = $("<DIV>").append("CA goes here");
						oDiv.cacryptca({ca_name: this.ca_name});
						oTD.append(oDiv);
					oTR.append(oTD);
				oTD = $("<TD>",{width:"50%", id:"crypt",valign:"top"});
					oDiv = $("<DIV>").append("Data goes here");
						oDiv.cacryptdata();
						oTD.append(oDiv);
					oTR.append(oTD);
				oTable.append(oTR);
			oTR = $("<tr>", {height:100});
				oTD = $("<TD>",{colspan:2, id:"status",valign:"top"});
					oDiv = $("<DIV>").append("statuc goes here");
						oDiv.cacryptstatus();
						oTD.append(oDiv);
					oTR.append(oTD);
				oTable.append(oTR);
		oElement.append(oTable);
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacrypt",{
	_create: function(){
		var oWidget = new cCACrypt(cCACryptTypes.name, this.element);
	}
});
$.widget( "ck.cacryptca",{
	_create: function(){
		var oWidget = new cCACryptCA(this.options, this.element);
	}
});
$.widget( "ck.cacryptdata",{
	_create: function(){
		var oWidget = new cCACryptData(this.element);
	}
});
$.widget( "ck.cacryptstatus",{
	_create: function(){
		var oWidget = new cCACryptStatus(this.element);
	}
});
