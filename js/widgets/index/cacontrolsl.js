"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cCAControlLTypes {
	static entry_ID="en";
	static rules_ID="ru";
	static rules_status_ID="rs";
	static name_ID="na";
	static init_ID="in";
	static wolf_ID="wo";
	static preset_ID="pr";
	static boredom_ID="bo";

	static random_ID= "rnd";
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAControlsL{
	grid=null;
	rule=null;
	element = null;
	grid_name=null;

	//#################################################################
	//# Constructor
	//#################################################################`
	constructor(poOptions, poElement){
		cDebug.enter();
		this.element = poElement;
		var oThis = this;
		var oElement;
		this.grid_name = poOptions.grid_name;

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
		bean.on(document, cCAEvent.hook, function(poEvent){ oThis.onCAEvent(poEvent)});
	}

	//#################################################################
	//# Initialise
	//#################################################################`
	 pr__init(){
		var oThis, oOptions, oElement;
		var oDiv, sID;

		oElement = this.element;
		oThis = this;


		//--rules widgets-------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.append("Rule");
				sID = cJquery.child_ID(oElement, cCAControlLTypes.rules_status_ID);
				var oSpan = $("<SPAN>",{id:sID}).html(" ??"); //STATUS div
				oDiv.append(oSpan);
			oElement.append(oDiv);

		oDiv = $("<DIV>",{class:"ui-widget-content"});
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append("<HR>");
			oDiv.append("Rule Presets");
			sID = cJquery.child_ID(oElement, cCAControlLTypes.preset_ID);
			var oSelect = $("<SELECT>",{id:sID,width:200,title:"pick a preset rule"});
				this.pr__populate_presets(oSelect);
				oDiv.append(oSelect);
				
				oSelect.selectmenu({
					select(poEvent){oThis.onPresetsClick(poEvent);}
				});

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
			oDiv.append("<HR>Boredom");
			sID = cJquery.child_ID(oElement, cCAControlLTypes.boredom_ID);
			oSelect = $("<SELECT>",{id:sID,width:50,title:"how many times will a cell see a pattern before it gets bored"});
				oSelect.append( $("<option>",{selected:1,disabled:1}).append("Select"));
				oSelect.append( $("<option>",{value:cCARuleTypes.no_boredom}).append("Never"));
				for ( var i=2; i<=10; i++){
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
	 onCAEvent(poEvent){
		cDebug.enter();
		
		switch(poEvent.event){
			case cCAEvent.types.rule:
				switch(poEvent.action){
					case cCARuleEvent.actions.update_rule:
						cDebug.write("update_rule");
						var oRule = poEvent.data;
						this.pr__set_rule(oRule);
						break;
				}
				break;
				
			case cCAActionEvent.types.canvas:
				switch(poEvent.action){
					case cCACanvasEvent.actions.set_grid:
						if (poEvent.data.grid_name == this.grid_name){
							cDebug.write("set_grid");
							this.grid = poEvent.data.data;
						}
				}
		}
		cDebug.leave();
	}
	
	//****************************************************************************
	 onSetNameClick(){
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
			this.pr__set_rule(oRule);
		}
		catch(e){
			alert("something went wrong:\n" + e.message);
		}
	}

	//****************************************************************************
	 onSetRuleClick(){
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
					this.pr__set_rule(oRule);
					break;
				case cCARuleTypes.rule_types.wolfram1d:
					var oRule = cCARuleWolfram1DImporter.makeRule(oTextArea.val());
					this.pr__set_rule(oRule);
					break;
				case cCARuleTypes.rule_types.base64:
					oRule = cCARuleBase64Importer.makeRule(oTextArea.val());
					caMachineTypes.rule = oRule;

					//set the boredom if chosen
					var oBoredomList = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.boredom_ID));
					if (!isNaN(oBoredomList.val())) oRule.boredom = oBoredomList.val();

					//inform subscribers
					var oEvent = new cCAEvent( cCAEvent.types.general, cCAGeneralEvent.actions.set_rule, oRule);
					oEvent.trigger(document);
					caMachineTypes.rule_set = true;
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
	 onRuleChange(){
		var oElement = this.element;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlLTypes.entry_ID));
		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rules_ID));
		var sSelected = oSelect.val();
		if (sSelected){
			var iSelected = parseInt(sSelected);
			if ( iSelected == cCARuleTypes.rule_types.base64){
				var sText = oTextArea.val();
				var iDiff = cCARuleTypes.base64_length - sText.length;
				this.pr__set_status( iDiff +" chars remaining");
			}
		}
	}

	//****************************************************************************
	 onPresetsClick(poEvent){
		var oElement = this.element;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlLTypes.entry_ID));
		var oRulesSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rules_ID));

		var sPreset = $(poEvent.target).val();
		if (!sPreset) return;
		
		if (sPreset===cCAControlLTypes.random_ID){
			var oRule= cCaRandomRule.makeRule();
			this.pr__set_rule(oRule);
		}else{
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
	}

	//****************************************************************************
	 onBoredomClick(poEvent){

		if (!caMachineTypes.rule_set){
			alert("set a rule first");
			return;
		}
		var iBoredem = parseInt($(poEvent.target).val());
		caMachineTypes.rule.set_boredom(iBoredem);
	}

	//#################################################################
	//# privates
	//#################################################################`
	pr__set_status(psText){
		var oElement = this.element;
		var oSpan = $("#" +	cJquery.child_ID(oElement, cCAControlLTypes.rules_status_ID));
		oSpan.html( psText);
	}

	//****************************************************************************
	 pr__set_rule( poRule){
		var oElement = this.element;

		var s64 = cCARuleBase64Exporter.export(poRule,cCACellTypes.default_state);
		this.rule = poRule;

		var oTextArea = $("#" +	cJquery.child_ID(oElement, cCAControlLTypes.entry_ID));
			oTextArea.val(s64);
			cBrowser.copy_to_clipboard(s64);

		var oSelect = $("#" + cJquery.child_ID(oElement, cCAControlLTypes.rules_ID));
			oSelect.val(cCARuleTypes.rule_types.base64);
			oSelect.selectmenu("refresh");
		this.onSetRuleClick();
	}

	//****************************************************************************
	 pr__populate_presets(poSelect){
		var aPresets = cCALexicon.get_presets();

		poSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("Select"));

		for (var i = 0; i < aPresets.length; i++){
			var oPreset = aPresets[i];
			var oOption = $("<option>",{value:JSON.stringify(oPreset)})
			oOption.append(oPreset.label);
			poSelect.append(oOption);
		}
		var oOption = $("<option>",{value:cCAControlLTypes.random_ID})
		oOption.append("Random");
		poSelect.append(oOption);
	}
}

//###############################################################################
//# widget
//###############################################################################
$.widget(
	"ck.cacontrolsl",
	{
		options:{
			grid_name:null
		},
		
		_create:function(){
			var oOptions = this.options;
			if (!oOptions.grid_name) $.error("grid name not provided");
			
			var oControls = new cCAControlsL(oOptions, this.element);
		}
	}
);
