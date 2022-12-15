"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
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
class cCACryptData{
	element = null;
	ca_name = null;
	
	constructor(poOptions, poElement){
		this.element = poElement;
		if (!poOptions.ca_name) $.error("missing ca_name option");
		this.ca_name = poOptions.ca_name;

		var oElement = poElement;
		oElement.empty();
		this.init();
	}
	
	//*******************************************************************************
	init(){
		var oElement = this.element;
		var oInputDiv = $("<DIV>");
			oInputDiv.cacrypttext({id:cCACryptTypes.input_name, title:"text to encrypt", read_only:false});
			oElement.append(oInputDiv);
		oElement.append("<p>");
		
		var oControlDiv = $("<DIV>");
			oControlDiv.cacryptcontrol({ca_name:this.ca_name});
			oElement.append(oControlDiv);
		oElement.append("<p>");
		
		var oOutDiv = $("<DIV>");
			oOutDiv.cacrypttext({id:cCACryptTypes.output_name, title:"encrypted text", read_only:true});
			oElement.append(oOutDiv);
		oElement.append("<p>");
		
	}
}

//###################################################################################
//###################################################################################
class cCACryptText{
	element = null;
	read_only = false;
	title = "no title set";
	id=null;
	
	constructor(poOptions, poElement){
		this.element = poElement;
		var oElement = poElement;
		oElement.addClass("ui-widget");
		
		this.read_only = poOptions.read_only;
		this.title = poOptions.title;
		this.id = poOptions.id;
		
		oElement.empty();
		this.init();
	}
	
	//*******************************************************************************
	init(){
		var oElement = this.element;
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append(this.title);
			oElement.append(oDiv);
		oDiv = $("<DIV>", {class:"ui-widget-content"});
			var oBox = $("<TEXTAREA>",{id:this.id,class:"json"})
			if (this.read_only)
				oBox.prop("readonly",true);
			oDiv.append(oBox);
			oElement.append(oDiv);
	}
}

//###################################################################################
//###################################################################################
class cCACryptControl{
	element = null;
	ca_name = null;
	grid=null;
	
	child_names={
		crypt: "CRY",
		decrypt: "DCR",
		inital_runs:"IRU"
	}
	
	//*******************************************************************************
	constructor(poOptions, poElement){
		var oThis = this;
		this.element = poElement;
		var oElement = poElement;
		
		if (!poOptions.ca_name) $.error("missing ca_name option");
		this.ca_name = poOptions.ca_name;

		oElement.uniqueId();
		oElement.addClass("ui-widget");
		oElement.empty();
		this.init();
		//subscribe to CAEvents
		bean.on (document, cCAEvent.hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
	}
	
	//*******************************************************************************
	init(){
		var oThis = this;
		var oElement = this.element;
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append("Control");
			oElement.append(oDiv);
		oDiv = $("<DIV>", {class:"ui-widget-content"});
			var sID = cJquery.child_ID(oElement, this.child_names.crypt);
			var oButton = $("<button>", {id: sID});
				oButton.append("<span class='material-icons'>lock</span>");
				oButton.append("Encrypt");
				oButton.prop("disabled",true);
				oButton.click( function(){oThis.onEncryptClick()} );
				oDiv.append(oButton);
				
			sID = cJquery.child_ID(oElement, this.child_names.decrypt);
			oButton = $("<button>", {id: sID});
				oButton.append("<span class='material-icons'>lock_open</span>");
				oButton.append("Decrypt");
				oButton.prop("disabled",true);
				oButton.click( function(){oThis.onDecryptClick()} );
				oDiv.append(oButton);
			
			sID = cJquery.child_ID(oElement, this.child_names.inital_runs);
				var oInput = $("<input>",{type:"text", id:sID, maxlength:3, size:5});
				oDiv.append(" Initial runs: ");
				oDiv.append(oInput);
				
			oElement.append(oDiv);
	}
	
	//*******************************************************************************
	onDecryptClick(){
	}
	
	//*******************************************************************************
	onEncryptClick(){
		var oElement = this.element;
		var oThis = this;
		
		var runs_ID = cJquery.child_ID(oElement, this.child_names.inital_runs);
		var oTxtBox = $("#" + runs_ID);
		var iInitialruns = parseInt(oTxtBox.val());
		
		var sPlaintext = $("#" + cCACryptTypes.input_name).val();
		
		var oScrambler = new cCAScrambler(this.grid, iInitialruns, sPlaintext);
		bean.on(oScrambler, cScramblerEvent.hook, function(poEvent){oThis.onCAScramblerEvent(poEvent)} );
		oScrambler.scramble().then()
		var sID = cJquery.child_ID(oElement, this.child_names.crypt);
	}
	
	//*******************************************************************************
	onCAScramblerEvent(poEvent){
		//TODO
	}
	
	//*******************************************************************************
	onCAEvent(poEvent){
		var oElement = this.element;
		var oThis = this;
		
		switch (poEvent.type){
			case cCAEvent.types.canvas:
				if (poEvent.data.grid_name === this.grid_name)			
					if (poEvent.action === cCACanvasEvent.actions.set_grid)
						//remember the grid, its needed for encryption.
						this.grid = poEvent.data.grid;
				break;
					
			case cCAEvent.types.actions:
				if (poEvent.action === cCARuleEvent.actions.update_rule){
					//enable buttons when any rule is set
					var sID = cJquery.child_ID(oElement, this.child_names.crypt);
					$("#"+sID).prop("disabled",false);
					var sID = cJquery.child_ID(oElement, this.child_names.decrypt);
					$("#"+sID).prop("disabled",false);
				}
		}
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacryptdata",{
	_create: function(){
		var oWidget = new cCACryptData(this.options, this.element);
	}
});
$.widget( "ck.cacryptcontrol",{
	_create: function(){
		var oWidget = new cCACryptControl(this.options, this.element);
	}
});
$.widget( "ck.cacrypttext",{
	options:{
		read_only:false,
		title: "no title set",
		id:null
	},
	_create: function(){
		if (!this.options.id) $.error("id missing");
		var oWidget = new cCACryptText(this.options, this.element);
	}
});
