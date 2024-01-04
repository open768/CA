"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

Cryptography code demonstrated in this application is covered by the UK Govt 
Open General Export License for Cryptographic development 
(see https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1101784/open-general-export-licence-cryptographic-development.pdf) 
and is not intended for dual use as defined by this license. 
You the consumer of this application are entirely responsible for importing this code into your own country. if you disagree please close this page.

**************************************************************************/

	
//###################################################################################
//###################################################################################
class cCACryptCA{
	element = null;
	rows = 100;
	cols = 100;
	
	constructor(poOptions, poElement){
		if (!bean ) 				$.error("bean class is missing! check includes");	
		if (!poOptions.rows ) 		$.error("rows option missing");	
		if (!poOptions.cols ) 		$.error("cols option missing");	
		if (!poOptions.ca_name ) 	$.error("caname option missing");	
		
		this.element = poElement;
		this.ca_name = poOptions.ca_name;
		this.rows = poOptions.rows
		this.cols = poOptions.cols
		
		var oElement = poElement;
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		oElement.empty();
		this.init();
	}
	
	//*******************************************************************************
	init(){
		var oElement = this.element;
		oElement.append("<DIV class='ui-widget-header'>Cellular Automata</DIV>");
		var oBody = $("<DIV>", {class:"ui-widget-content"});
			var oJson = $("<DIV>").append("please wait loading JSON control");
				oJson.cajson({grid_name:this.ca_name,create_button:false});
				oBody.append(oJson);
			
			var oCA =  $("<DIV>").append("please wait loading grid control");
				oCA.cacanvas({
					cols:this.cols,
					rows:this.rows,
					cell_size:cCACryptTypes.cell_size,
					grid_name: this.ca_name,
					interactive:false
					
				});
				oBody.append(oCA);
			oElement.append(oBody);
	}
}
//###################################################################################
//###################################################################################
$.widget( "ck.cacryptca",{
	_create: function(){
		var oWidget = new cCACryptCA(this.options, this.element);
	}
});
