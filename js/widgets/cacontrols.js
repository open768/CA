"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cCAControlTypes {
	static entry_ID="en";
	static rules_ID="ru";
	static json_ID="js";
	static rules_status_ID="rs";
	static rule_random_ID= "rr";
	static name_ID="na";
	static init_ID="in";
	static wolf_ID="wo";
	static preset_ID="pr";
	static boredom_ID="bo";

	static random_value= "Random";
}


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacontrols",{
	//#################################################################
	//# Options
	//#################################################################

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
			sID = cJquery.child_ID(oElement, cCAControlTypes.rules_status_ID);
			var oSpan = $("<SPAN>",{id:sID}).html("??");
			oDiv.append(oSpan);
		oElement.append(oDiv);

		oDiv = $("<DIV>",{class:"ui-widget-content"});
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			var oParentDiv = $("<DIV>", {id:"tcontainer"});
			oParentDiv.append(
				"<ul>" +
					"<li><a href='#tbase64'>base64</a></li>" +
					"<li><a href='#tjson'>JSON</a></li>" +
				"</ul>");

				var oChildDiv = $("<div>",{id:"tbase64"});
					sID = cJquery.child_ID(oElement, cCAControlTypes.entry_ID);
					var oBox = $("<TEXTAREA>",{ID:sID,rows:5,cols:80 ,class:"rule", title:"enter the rule here"});
						oBox.keyup( function(){oThis.onRuleChange()}	);
					oChildDiv.append(oBox);
				oParentDiv.append(oChildDiv);

				var oChildDiv = $("<div>",{id:"tjson"});
					sID = cJquery.child_ID(oElement, cCAControlTypes.json_ID);
					var oBox = $("<TEXTAREA>",{ID:sID,rows:5,cols:80 ,class:"rule", title:"jSON will appear here", readonly:1});
					oChildDiv.append(oBox);
				oParentDiv.append(oChildDiv);

			oDiv.append(oParentDiv)
			oParentDiv.tabs();

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			sID = cJquery.child_ID(oElement, cCAControlTypes.rules_ID);
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
			sID = cJquery.child_ID(oElement, cCAControlTypes.preset_ID);
			var oSelect = $("<SELECT>",{id:sID,width:200,title:"pick a preset rule"});
				this.pr__populate_presets(oSelect);
				oDiv.append(oSelect);
				oSelect.selectmenu({
					select:function(poEvent){oThis.onPresetsClick(poEvent);}
				});

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			oDiv.append("Random ");
				var oButton = $("<button>",{title:"Random Rule"}).button({icon:"ui-icon-circle-arrow-e"});
				oDiv.append(oButton);
				oButton.click(	function(){oThis.pr_makeRandomBase64()}	);

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			sID = cJquery.child_ID(oElement, cCAControlTypes.name_ID);
			oDiv.append("word repeater");
			var oInput = $("<INPUT>",{type:"text",id:sID,size:12,icon:"ui-icon-circle-arrow-e",title:"put anything in this box - eg your name"});
				oDiv.append(oInput);
			oButton = $("<button>",{title:"creates a rule from the word in the box"}).button({icon:"ui-icon-circle-arrow-e"});
			oButton.click(	function(){oThis.onSetNameClick()}	);
			oDiv.append(oButton);


			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			sID = cJquery.child_ID(oElement, cCAControlTypes.boredom_ID);
			oSelect = $("<SELECT>",{id:sID,width:50,title:"how many times will a cell see a pattern before it gets bored"});
				oSelect.append( $("<option>",{selected:1,disabled:1}).append("Boredom"));
				oSelect.append( $("<option>",{value:cCAConsts.no_boredom}).append("Never"));
				for ( var i=3; i<=10; i++){
					oSelect.append( $("<option>",{value:i}).append(i + " times"));
				}
				oDiv.append(oSelect);
				oSelect.selectmenu({
					select:function(poEvent){oThis.onBoredomClick(poEvent);}
				});
			oElement.append(oDiv);
	},

	//#################################################################
	//# EVENTS
	//#################################################################`
	onSetNameClick: function(){
		var oElement = this.element;

		var sID = cJquery.child_ID(oElement, cCAControlTypes.name_ID);
		var oInput = $("#" + sID);
		var sInput = oInput.val().trim();
		if (sInput === ""){
			alert ("empty input string :-(");
			return;
		}
		try{
			var oRule = cCARepeatBase64Importer.makeRule(sInput);
			this.pr_setBase64Rule(oRule);
		}
		catch(e){
			alert("something went wrong:\n" + e.message);
		}
	},

	//****************************************************************************
	onSetRuleClick: function(){
		var oElement = this.element;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlTypes.entry_ID));
		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlTypes.rules_ID));

		if (!oSelect.val()) {
			alert("choose a rule type to import");
			return;
		}

		var iSelected = parseInt(oSelect.val());
		var oRule;
		try{
			switch(iSelected){
				case cCAConsts.rule_types.life:
					oRule = cCALifeImporter.makeRule(oTextArea.val());
					this.pr_setBase64Rule(oRule);
					break;
				case cCAConsts.rule_types.wolfram1d:
					var oRule = cCAWolfram1DImporter.makeRule(oTextArea.val());
					this.pr_setBase64Rule(oRule);
					break;
				case cCAConsts.rule_types.base64:
					oRule = cCABase64Importer.makeRule(oTextArea.val());
					caMachineOptions.rule = oRule;

					//set the boredom if chosen
					var oBoredomList = $("#" + cJquery.child_ID(oElement, cCAControlTypes.boredom_ID));
					if (!isNaN(oBoredomList.val())) oRule.boredom = oBoredomList.val();

					//create JSON
					this.pr__update_json(oRule);

					//inform subscribers
					var oEvent = new cCAEvent( cCAConsts.event_types.set_rule, oRule);
					bean.fire(document, cCAConsts.event_hook, oEvent);
					caMachineOptions.rule_set = true;
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
	onRuleChange:function(){
		var oElement = this.element;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlTypes.entry_ID));
		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlTypes.rules_ID));
		var sSelected = oSelect.val();
		if (sSelected){
			var iSelected = parseInt(sSelected);
			if ( iSelected == cCAConsts.rule_types.base64){
				var sText = oTextArea.val();
				var iDiff = cCAConsts.base64_length - sText.length;
				var oSpan = $("#" +	cJquery.child_ID(oElement, cCAControlTypes.rules_status_ID));
				oSpan.html( iDiff +" chars remaining");
			}
		}
	},

	//****************************************************************************
	onPresetsClick: function(poEvent){
		var oElement = this.element;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlTypes.entry_ID));
		var oRulesSelect = $("#" + cJquery.child_ID(oElement, cCAControlTypes.rules_ID));

		var sPreset = $(poEvent.target).val();
		var oRuleJson = JSON.parse(sPreset);

		switch (oRuleJson.type){
			case cCAConsts.rule_types.life:
				oTextArea.val(oRuleJson.rule);
				oRulesSelect.val(cCAConsts.rule_types.life);
				oRulesSelect.selectmenu("refresh");
				this.onSetRuleClick();
				break;
			default:
				alert("unknown rule type: ", oRuleJson.type);
				throw new CAException("not implemented");
		}
	},

	//****************************************************************************
	onBoredomClick: function(poEvent){

		if (!caMachineOptions.rule_set){
			alert("set a rule first");
			return;
		}
		var iBoredem = parseInt($(poEvent.target).val());
		caMachineOptions.rule.boredom = iBoredem;
	},

	//#################################################################
	//# privates
	//#################################################################`

	//****************************************************************************
	pr_makeRandomBase64: function(){
		var oRule= cCaRandomRule.makeRule();
		this.pr_setBase64Rule(oRule);
	},

	//****************************************************************************
	pr_setBase64Rule:function( poRule){
		var oElement = this.element;

		var s64 = cCABase64Exporter.export(poRule,cCAConsts.default_state);

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlTypes.entry_ID));
			oTextArea.val(s64);
			cBrowser.copy_to_clipboard(s64);

		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlTypes.rules_ID));
			oSelect.val(cCAConsts.rule_types.base64);
			oSelect.selectmenu("refresh");
		this.onSetRuleClick();
	},

	//****************************************************************************
	pr__populate_presets:function(poSelect){
		var aRules = cCALexicon.get_rules();

		poSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("presets"));

		for (var i = 0; i < aRules.length; i++){
			var oRule = aRules[i];
			var oOption = $("<option>",{value:JSON.stringify(oRule)}).append(oRule.label);
			poSelect.append(oOption);
		}
	},

	//****************************************************************************
	pr__update_json: function(poRule){
		var oElement = this.element;
		var sID = cJquery.child_ID(oElement, cCAControlTypes.json_ID);
		$("#"+sID).val("work in progress");
	}

});
