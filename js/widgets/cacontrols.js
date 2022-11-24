"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
var cCAControlTypes = {
	entry_ID:"ent",
	rules_ID:"rul",
	rules_extra_ID:"rulex",
	rule_random_ID: "rulernd",
	name_ID:"nam",
	init_ID:"ini",
	wolf_ID:"wolf",
	preset_ID:"lex",
	boredom_ID:"bor",
	
	random_value: "Random"	
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacontrols",{
	//#################################################################
	//# Options
	//#################################################################
	options:{
		rule_set:false,
		rule: null
	},

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oElement;
		
		oElement = this.element;
		
		//check dependencies
		if (!bean ) 	$.error("bean class is missing! check includes");	
		if (!oElement.selectmenu ) 	$.error("selectmenu class is missing! check includes");	
		if (!cCABase64Importer ) 	$.error("cCABase64Importer class is missing! check includes");	
		
		//set basic stuff
		oElement.addClass("ui-widget");
		oElement.addClass("CAControls");
		$(oElement).tooltip();

		//put something in the widget
		oElement.empty();
		this.pr__init();
	},
	
	//#################################################################
	//# Initialise
	//#################################################################`
	pr__init:function(){
		var oThis, oOptions, oElement;
		var oDiv, sID;
		
		oElement = this.element;
		oThis = this;

		
		//--rules widgets-------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.append("Rule");
			sID = oElement.attr("id")+cCAControlTypes.rules_extra_ID;
			var oSpan = $("<SPAN>",{id:sID}).html("??");
			oDiv.append(oSpan);		
		oElement.append(oDiv);
			
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			sID = oElement.attr("id")+cCAControlTypes.entry_ID;
			var oBox = $("<TEXTAREA>",{ID:sID,rows:5,cols:30 ,class:"rule", title:"enter the rule here"});				
				oBox.keyup( function(){oThis.onRuleChange()}	);
			oDiv.append(oBox);
			
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			sID = oElement.attr("id")+cCAControlTypes.rules_ID;
			var oSelect = $("<SELECT>",{id:sID,width:200,title:"choose the rule type to enter in the box above"});
				oSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("Rule Type"));
				oSelect.append( $("<option>",{value:cCAConsts.rule_types.base64}).append("base64"));
				oSelect.append( $("<option>",{value:cCAConsts.rule_types.life}).append("life"));
				oSelect.append( $("<option>",{value:cCAConsts.rule_types.wolfram1d}).append("wolfram"));
			oDiv.append(oSelect);
			oSelect.selectmenu();
			
			var oButton = $("<button>",{title:"use the rule entered in the box above"}).button({icon:"ui-icon-circle-arrow-e" });
				oButton.click(	function(){oThis.onSetRuleClick()}	);		
			oDiv.append(oButton);
			
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			var oButton = $("<button>",{title:"Random Rule"}).append("Set Random Rule");
				oButton.click(	function(){oThis.pr_makeRandomBase64()}	);		
			oDiv.append(oButton);
			
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			sID = oElement.attr("id")+cCAControlTypes.name_ID;
			var oInput = $("<INPUT>",{type:"text",id:sID,size:12,icon:"ui-icon-circle-arrow-e",title:"put anything in this box - eg your name"});
			oDiv.append(oInput);
			oButton = $("<button>",{title:"creates a rule from the word in the box"}).button({icon:"ui-icon-circle-arrow-e"});
			oButton.click(	function(){oThis.onSetNameClick()}	);		
			oDiv.append(oButton);
			
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			sID = oElement.attr("id")+cCAControlTypes.preset_ID;
			var oSelect = $("<SELECT>",{id:sID,width:200,title:"pick a preset rule"});
				this.pr__populate_presets(oSelect);
			oDiv.append(oSelect);
			oSelect.selectmenu({
				select:function(){oThis.onPresetsClick();}
			});
			
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			/*
			oDiv.append("<HR>");
			sID = oElement.attr("id")+cCAControlTypes.boredom_ID;
			oSelect = $("<SELECT>",{id:sID,width:50,title:"how many times will a cell see a pattern before it gets bored"});
			oSelect.append( $("<option>",{selected:1,disabled:1}).append("Boredom"));
			oSelect.append( $("<option>",{value:cCAConsts.no_boredom}).append("Never"));
			for ( var i=3; i<=10; i++){
				oSelect.append( $("<option>",{value:i}).append(i + " times"));
			}
			oDiv.append(oSelect);
			oSelect.selectmenu({
				select:function(){oThis.onBoredomClick();}
			});
			*/
		oElement.append(oDiv);
		oElement.append("<P>");
		

		//--initialise------------------------------------------------		
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.append("Initialise");
		oElement.append(oDiv);
		
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			sID = oElement.attr("id")+cCAControlTypes.init_ID;
			var oSelect = $("<SELECT>",{id:sID,width:200,title:"choose a pattern to initialise the grid with"});
			oSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("Initialise"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.blank}).append("blank"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.block}).append("block"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.random}).append("random"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.horiz_line}).append("horiz line"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.vert_line}).append("vert line"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.diagonal}).append("diagonal"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.diamond}).append("diamond"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.cross}).append("cross"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.circle}).append("circle"));
			oSelect.append ( $("<option>",{value:cCAConsts.init_values.sine}).append("sine"));
			oDiv.append(oSelect);
			oSelect.selectmenu({
					select:function(){oThis.onInitClick()}
			});
		oElement.append(oDiv);
		oElement.append("<P>");
		
		
		//--controls------------------------------------------------		
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.append("controls");
		oElement.append(oDiv);
		
		oDiv = $("<DIV>",{class:"ui-widget-content"});
			var oButton = $("<button>",{width:"30px",height:"30px",id:"btnStop"}).button({icon:"ui-icon-stop"});
			oButton.prop("disabled", true);
			oButton.click(	function(){ oThis.onClickButton(cCAConsts.action_types.stop);}	);
			oDiv.append(oButton);

			var oButton = $("<button>",{width:"30px",height:"30px",id:"btnPlay"}).button({icon:"ui-icon-circle-triangle-e"});
			oButton.prop("disabled", true);
			oButton.click(	function(){ oThis.onClickButton(cCAConsts.action_types.play);}	);
			oDiv.append(oButton);

			var oButton = $("<button>",{width:"30px",height:"30px",title:"step",id:"btnStep"}).button({icon:"ui-icon-seek-end"});
			oButton.prop("disabled", true);
			oButton.click(	function(){ oThis.onClickButton(cCAConsts.action_types.step);}	);
			oDiv.append(oButton);
		oElement.append(oDiv);
	},
		
	//#################################################################
	//# EVENTS
	//#################################################################`
	//****************************************************************************
	onClickButton: function(piAction){
		var oThis = this;
		var oOptions = oThis.options;
		if (!oOptions.rule_set){
			alert("set a rule first!!");
			return;
		}
	
		switch (piAction){
			case cCAConsts.action_types.stop:
				$("#btnStep").prop("disabled",false);
				$("#btnPlay").prop("disabled",false);
				$("#btnStop").prop("disabled",true);
				break;
			case cCAConsts.action_types.play:
				$("#btnStep").prop("disabled",true);
				$("#btnPlay").prop("disabled",true);
				$("#btnStop").prop("disabled",false);
				break;
		}
		var oEvent = new cCAEvent( cCAConsts.event_types.action, parseInt(piAction));
		bean.fire(document, cCAConsts.event_hook, oEvent);
	},
	
	
	//****************************************************************************
	onSetNameClick: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;

		var oInput = $("#" +	oElement.attr("id")+cCAControlTypes.name_ID);
		var sInput = oInput.val().trim();
		if (sInput === ""){
			alert ("empty input string :-(");
			return;
		}
		try{
			var oImporter = new cCARepeatBase64Importer();
			var oRule = oImporter.makeRule(sInput);
			var oExporter = new cCABase64Importer();
			var s64 = oExporter.toString(oRule,cCAConsts.default_state);
			this.pr_setBase64Rule(s64);
		}
		catch(e){
			alert("something went wrong:\n" + e.message);
		}
	},
	
	//****************************************************************************
	onSetRuleClick: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;

		var oTextArea = $("#" +	oElement.attr("id")+cCAControlTypes.entry_ID);
		var oSelect = $("#" + oElement.attr("id")+cCAControlTypes.rules_ID);
		
		if (!oSelect.val()) {
			alert("choose a rule type to import");
			return;
		}
		
		var iSelected = parseInt(oSelect.val());
		try{
			switch(iSelected){
				case cCAConsts.rule_types.life:
					var oImporter = new cCALifeImporter();
					oRule = oImporter.makeRule(oTextArea.val());
					var oExporter = new cCABase64Importer();
					var s64 = oExporter.toString(oRule,cCAConsts.default_state);
					this.pr_setBase64Rule(s64);
					break;
				case cCAConsts.rule_types.wolfram1d:
					var oImporter = new cCAWolfram1DImporter();
					var oRule = oImporter.makeRule(oTextArea.val());
					var oExporter = new cCABase64Importer();
					var s64 = oExporter.toString(oRule,cCAConsts.default_state);
					this.pr_setBase64Rule(s64);
					break;
				case cCAConsts.rule_types.base64:
					var oImporter = new cCABase64Importer();
					oRule = oImporter.makeRule(oTextArea.val());
					oOptions.rule = oRule;
					
					//set the boredom if chosen
					var oBoredomList = $("#" + oElement.attr("id")+cCAControlTypes.boredom_ID);
					if (!isNaN(oBoredomList.val())) oRule.boredom = oBoredomList.val();
					
					//inform subscribers
					var oEvent = new cCAEvent( cCAConsts.event_types.set_rule, oRule);
					bean.fire(document, cCAConsts.event_hook, oEvent);
					oOptions.rule_set = true;
					break;
				case cCAConsts.rule_types.random:
					this.pr_makeRandomBase64();
					break;
				default:
					throw new Exception("unknown rule type");
					
			}
			$("#btnPlay").prop("disabled",false);

		}
		catch(e){
			alert("something went wrong:\n" + e.message);
		}
		
	},
	
	//****************************************************************************
	onInitClick: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;

		
		var oSelect = $("#" +oElement.attr("id")+cCAControlTypes.init_ID);
		if (!oSelect.val()) {
			alert("choose a init method");
			return;
		}
		var iSelected = parseInt(oSelect.val());
		var oEvent = new cCAEvent( cCAConsts.event_types.initialise, iSelected);
		bean.fire(document, cCAConsts.event_hook, oEvent);
	},

	//****************************************************************************
	onRuleChange:function(){
		var oThis = this;
		var oElement = oThis.element;
		
		var oTextArea = $("#" +	oElement.attr("id")+cCAControlTypes.entry_ID);
		var oSelect = $("#" + oElement.attr("id")+cCAControlTypes.rules_ID);
		var sSelected = oSelect.val();
		if (sSelected){
			var iSelected = parseInt(sSelected);
			if ( iSelected == cCAConsts.rule_types.base64){
				var sText = oTextArea.val();
				var iDiff = cCAConsts.base64_length - sText.length;
				var oSpan = $("#" +	oElement.attr("id")+cCAControlTypes.rules_extra_ID);
				oSpan.html( iDiff +" chars remaining");
			}
		}
	},
	
	//****************************************************************************
	onPresetsClick: function(){
		var oThis = this;
		var oElement = oThis.element;
		
		var oTextArea = $("#" +	oElement.attr("id")+cCAControlTypes.entry_ID);
		var oRulesSelect = $("#" + oElement.attr("id")+cCAControlTypes.rules_ID);
		
		var oPresetSelect = $("#" + oElement.attr("id")+cCAControlTypes.preset_ID);
		var sPreset = oPresetSelect.val();
		var oJson = JSON.parse(sPreset);
		
		switch (oJson.type){
			case cCAConsts.rule_types.life:
				oTextArea.val(oJson.rule);		
				oRulesSelect.val(cCAConsts.rule_types.life);
				oRulesSelect.selectmenu("refresh");
				this.onSetRuleClick();
				break;
			default:
				alert("unknown rule type: ", oJson.type);
				throw new CAException("not implemented");
		}
	},
	
	//****************************************************************************
	/*
	onBoredomClick: function(){
		var oOptions = this.options;
		
		if (!oOptions.rule_set){
			alert("set a rule first");
			return;
		}
		
		this.onSetRuleClick();
	},
	*/
	
	//#################################################################
	//# privates
	//#################################################################`
	
	//****************************************************************************
	pr_makeRandomBase64: function(){
		var oBinImporter = new cCABinaryImporter();
		var oRule= oBinImporter.randomRule();
		var o64Importer = new cCABase64Importer();
		var sBase64 = o64Importer.toString(oRule,cCAConsts.default_state);
		this.pr_setBase64Rule(sBase64);
	},
	
	//****************************************************************************
	pr_setBase64Rule:function( psBase64){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		var oTextArea = $("#" +	oElement.attr("id")+cCAControlTypes.entry_ID);
			oTextArea.val(psBase64);		
			cBrowser.copy_to_clipboard(psBase64);

		var oSelect = $("#" + oElement.attr("id")+cCAControlTypes.rules_ID);
			oSelect.val(cCAConsts.rule_types.base64);
			oSelect.selectmenu("refresh");
		this.onSetRuleClick();
	},
	
	//****************************************************************************
	pr__populate_presets:function(poSelect){
		var aRules = cCALexicon.get_rules();
		
		poSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("preset rules"));
		
		for (var i = 0; i < aRules.length; i++){
			var oRule = aRules[i];
			var oOption = $("<option>",{value:JSON.stringify(oRule)}).append(oRule.label);
			poSelect.append(oOption);
		}
	}

	
});
