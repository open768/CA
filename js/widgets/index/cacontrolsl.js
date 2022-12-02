"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cCAControlLTypes {
	static entry_ID="en";
	static rules_ID="ru";
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
class cCAControlsL{
	static _state={
		grid:null,
		rule:null
	};
	static element = null;

	//#################################################################
	//# Constructor
	//#################################################################`
	static create(poElement){
		cDebug.enter();
		this.element = poElement;
		var oThis = this;
		var oElement;

		oElement = this.element;

		//check dependencies
		if (!bean ) 	$.error("bean class is missing! check includes");
		if (!oElement.selectmenu ) 	$.error("selectmenu class is missing! check includes");
		if (!cCARuleBase64Importer ) 	$.error("cCARuleBase64Importer class is missing! check includes");

		//set basic stuff
		oElement.addClass("ui-widget");
		oElement.addClass("CAControls");
		$(oElement).tooltip();

		//put something in the widget
		oElement.empty();
		this.pr__init();

		//subscribe to CA Events
		bean.on(document, cCAEventTypes.event_hook, function(poEvent){ oThis.onCAEvent(poEvent)});
	}

	//#################################################################
	//# Initialise
	//#################################################################`
	static pr__init(){
		var oThis, oOptions, oElement;
		var oDiv, sID;

		oElement = this.element;
		oThis = this;


		//--rules widgets-------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.append("Rule");
			sID = cJquery.child_ID(oElement, cCAControlLTypes.rules_status_ID);
			var oSpan = $("<SPAN>",{id:sID}).html("??");
			oDiv.append(oSpan);
		oElement.append(oDiv);

		oDiv = $("<DIV>",{class:"ui-widget-content"});
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			sID = cJquery.child_ID(oElement, cCAControlLTypes.entry_ID);
			var oBox = $("<TEXTAREA>",{ID:sID,class:"rule", title:"enter the rule here"});
				oBox.keyup( function(){oThis.onRuleChange()}	);
			oDiv.append(oBox)

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			sID = cJquery.child_ID(oElement, cCAControlLTypes.rules_ID);
			var oSelect = $("<SELECT>",{id:sID,width:200,title:"choose the rule type to enter in the box above"});
				oSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("Rule Type"));
				oSelect.append( $("<option>",{value:cCARuleTypes.rule_types.base64}).append("base64"));
				oSelect.append( $("<option>",{value:cCARuleTypes.rule_types.life}).append("life"));
				oSelect.append( $("<option>",{value:cCARuleTypes.rule_types.wolfram1d}).append("wolfram"));
			oDiv.append(oSelect);
			oSelect.selectmenu();

			var oButton = $("<button>",{title:"use the rule entered in the box above"}).button({icon:"ui-icon-circle-arrow-e" });
				oButton.click(	function(){oThis.onSetRuleClick()}	);
			oDiv.append(oButton);

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			sID = cJquery.child_ID(oElement, cCAControlLTypes.preset_ID);
			var oSelect = $("<SELECT>",{id:sID,width:200,title:"pick a preset rule"});
				this.pr__populate_presets(oSelect);
				oDiv.append(oSelect);
				oSelect.selectmenu({
					select(poEvent){oThis.onPresetsClick(poEvent);}
				});

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			oDiv.append("Random ");
				var oButton = $("<button>",{title:"Random Rule"}).button({icon:"ui-icon-circle-arrow-e"});
				oDiv.append(oButton);
				oButton.click(	function(){oThis.pr_makeRandomBase64()}	);

			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			sID = cJquery.child_ID(oElement, cCAControlLTypes.name_ID);
			oDiv.append("word repeater");
			var oInput = $("<INPUT>",{type:"text",id:sID,size:12,icon:"ui-icon-circle-arrow-e",title:"put anything in this box - eg your name"});
				oDiv.append(oInput);
			oButton = $("<button>",{title:"creates a rule from the word in the box"}).button({icon:"ui-icon-circle-arrow-e"});
			oButton.click(	function(){oThis.onSetNameClick()}	);
			oDiv.append(oButton);


			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			sID = cJquery.child_ID(oElement, cCAControlLTypes.boredom_ID);
			oSelect = $("<SELECT>",{id:sID,width:50,title:"how many times will a cell see a pattern before it gets bored"});
				oSelect.append( $("<option>",{selected:1,disabled:1}).append("Boredom"));
				oSelect.append( $("<option>",{value:cCARuleTypes.no_boredom}).append("Never"));
				for ( var i=3; i<=10; i++){
					oSelect.append( $("<option>",{value:i}).append(i + " times"));
				}
				oDiv.append(oSelect);
				oSelect.selectmenu({
					select(poEvent){oThis.onBoredomClick(poEvent);}
				});
			oElement.append(oDiv);
	}

	//#################################################################
	//# EVENTS
	//#################################################################`
	static onCAEvent(poEvent){
		cDebug.enter();
		switch(poEvent.event){
			case cCAEventTypes.event_types.update_rule:
				cDebug.write("update_rule");
				var oRule = poEvent.data;
				this.pr_setBase64Rule(oRule);
				break;
			case cCAEventTypes.event_types.set_grid:
				cDebug.write("set_grid");
				this._state.grid = poEvent.data;
		}
		cDebug.leave();
	}
	
	//****************************************************************************
	static onSetNameClick(){
		var oElement = this.element;

		var sID = cJquery.child_ID(oElement, cCAControlLTypes.name_ID);
		var oInput = $("#" + sID);
		var sInput = oInput.val().trim();
		if (sInput === ""){
			alert ("empty input string :-(");
			return;
		}
		try{
			var oRule = cCARuleRepeatBase64Importer.makeRule(sInput);
			this.pr_setBase64Rule(oRule);
		}
		catch(e){
			alert("something went wrong:\n" + e.message);
		}
	}

	//****************************************************************************
	static onSetRuleClick(){
		var oElement = this.element;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlLTypes.entry_ID));
		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rules_ID));

		if (!oSelect.val()) {
			alert("choose a rule type to import");
			return;
		}

		var iSelected = parseInt(oSelect.val());
		var oRule;
		try{
			switch(iSelected){
				case cCARuleTypes.rule_types.life:
					oRule = cCARuleLifeImporter.makeRule(oTextArea.val());
					this.pr_setBase64Rule(oRule);
					break;
				case cCARuleTypes.rule_types.wolfram1d:
					var oRule = cCARuleWolfram1DImporter.makeRule(oTextArea.val());
					this.pr_setBase64Rule(oRule);
					break;
				case cCARuleTypes.rule_types.base64:
					oRule = cCARuleBase64Importer.makeRule(oTextArea.val());
					caMachineOptions.rule = oRule;

					//set the boredom if chosen
					var oBoredomList = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.boredom_ID));
					if (!isNaN(oBoredomList.val())) oRule.boredom = oBoredomList.val();

					//inform subscribers
					var oEvent = new cCAEvent( cCAEventTypes.event_types.set_rule, oRule);
					bean.fire(document, cCAEventTypes.event_hook, oEvent);
					caMachineOptions.rule_set = true;
					break;
				default:
					throw new Exception("unknown rule type");

			}
			$("#btnPlay").prop("disabled",false);
		}
		catch(e){
			alert("something went wrong:\n" + e.message);
			throw e;
		}

	}


	//****************************************************************************
	static onRuleChange(){
		var oElement = this.element;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlLTypes.entry_ID));
		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rules_ID));
		var sSelected = oSelect.val();
		if (sSelected){
			var iSelected = parseInt(sSelected);
			if ( iSelected == cCARuleTypes.rule_types.base64){
				var sText = oTextArea.val();
				var iDiff = cCARuleTypes.base64_length - sText.length;
				var oSpan = $("#" +	cJquery.child_ID(oElement, cCAControlLTypes.rules_status_ID));
				oSpan.html( iDiff +" chars remaining");
			}
		}
	}

	//****************************************************************************
	static onPresetsClick(poEvent){
		var oElement = this.element;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlLTypes.entry_ID));
		var oRulesSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rules_ID));

		var sPreset = $(poEvent.target).val();
		var oRuleJson = JSON.parse(sPreset);

		switch (oRuleJson.type){
			case cCARuleTypes.rule_types.life:
				oTextArea.val(oRuleJson.rule);
				oRulesSelect.val(cCARuleTypes.rule_types.life);
				oRulesSelect.selectmenu("refresh");
				this.onSetRuleClick();
				break;
			default:
				alert("unknown rule type: ", oRuleJson.type);
				throw new CAException("not implemented");
		}
	}

	//****************************************************************************
	static onBoredomClick(poEvent){

		if (!caMachineOptions.rule_set){
			alert("set a rule first");
			return;
		}
		var iBoredem = parseInt($(poEvent.target).val());
		caMachineOptions.rule.boredom = iBoredem;
	}

	//#################################################################
	//# privates
	//#################################################################`

	//****************************************************************************
	static pr_makeRandomBase64(){
		var oRule= cCaRandomRule.makeRule();
		this.pr_setBase64Rule(oRule);
	}

	//****************************************************************************
	static pr_setBase64Rule( poRule){
		var oElement = this.element;

		var s64 = cCARuleBase64Exporter.export(poRule,cCACellTypes.default_state);
		this._state.rule = poRule;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlLTypes.entry_ID));
			oTextArea.val(s64);
			cBrowser.copy_to_clipboard(s64);

		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rules_ID));
			oSelect.val(cCARuleTypes.rule_types.base64);
			oSelect.selectmenu("refresh");
		this.onSetRuleClick();
	}

	//****************************************************************************
	static pr__populate_presets(poSelect){
		var aPresets = cCALexicon.get_presets();

		poSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("presets"));

		for (var i = 0; i < aPresets.length; i++){
			var oPreset = aPresets[i];
			var oOption = $("<option>",{value:JSON.stringify(oPreset)}).append(oPreset.label);
			poSelect.append(oOption);
		}
	}
}

//###############################################################################
//# widget
//###############################################################################
$.widget(
	"ck.cacontrolsl",
	{
		_create(){
			cCAControlsL.create(this.element);
		}
	}
);
