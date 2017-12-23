/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacontrols",{
	//#################################################################
	//# Options
	//#################################################################
	options:{
		onCAEvent: null,
		rule_set:false
	},

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		oElement.addClass("CAControls");
		$(oElement).tooltip();

		//check dependencies
		if (!oElement.selectmenu ) 	$.error("selectmenu class is missing! check includes");	
		if (!cCABase64Importer ) 	$.error("cCABase64Importer class is missing! check includes");	

		//put something in the widget
		var oDiv;
		oElement.empty();

		
		//--input-------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"});
		oDiv.append("Rule");
		sID = oElement.attr("id")+"EXTRA";
		var oSpan = $("<SPAN>",{id:sID}).html("??");
		oDiv.append("&nbsp;");		
		oDiv.append(oSpan);		
		oElement.append(oDiv);
		
		var oDiv = $("<DIV>",{class:"ui-widget-content"});
		sID = oElement.attr("id")+"ENTRY";
		var oBox = $("<TEXTAREA>",{ID:sID,rows:5,columns:20 ,class:"rule", title:"enter the rule here"});				
		oBox.keyup( function(){oThis.onRuleChange()}	);
		oDiv.append(oBox);
		
		sID = oElement.attr("id")+"RULELIST";
		var oSelect = $("<SELECT>",{id:sID,width:200,title:"choose the rule type to enter in the box above"});
		oSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("Rule Type"));
		oSelect.append( $("<option>",{value:cCAConsts.rule_types.base64}).append("base64"));
		oSelect.append( $("<option>",{value:cCAConsts.rule_types.life}).append("life"));
		oSelect.append( $("<option>").append("random"));
		oDiv.append(oSelect);
		oSelect.selectmenu();
		
		var oButton = $("<button>",{title:"use the rule entered in the box above"}).button({icon:"ui-icon-circle-arrow-e" });
		oButton.click(	function(){oThis.onSetRuleClick()}	);		
		oDiv.append(oButton);
		
		oElement.append(oDiv);
		
		//--yourname------------------------------------------------		
		var oDiv = $("<DIV>",{class:"ui-widget-content"});
		sID = oElement.attr("id")+"NAME";
		var oInput = $("<INPUT>",{type:"text",id:sID,size:12,icon:"ui-icon-circle-arrow-e",title:"put anything in this box - eg your name"});
		oDiv.append(oInput);
		var oButton = $("<button>",{title:"creates a rule from the word in the box"}).button({icon:"ui-icon-circle-arrow-e"});
		oButton.click(	function(){oThis.onSetNameClick()}	);		
		oDiv.append(oButton);
		oElement.append(oDiv);

		//--initialise------------------------------------------------		
		var oDiv = $("<DIV>",{class:"ui-widget-content"});
		sID = oElement.attr("id")+"INIT";
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
		oSelect.selectmenu();
		var oButton = $("<button>",{title:"initialise the grid"}).button({icon:"ui-icon-circle-arrow-e"});
		oButton.click(	function(){oThis.onInitClick()}	);		
		oDiv.append(oButton);

		oElement.append(oDiv);
		
		//--rules------------------------------------------------		
		var oDiv = $("<DIV>",{class:"ui-widget-content"});
		sID = oElement.attr("id")+"LEXICON";
		var oSelect = $("<SELECT>",{id:sID,width:200,title:"pick a rule"});
		this.pr__populate_lexicon(oSelect);
		oDiv.append(oSelect);
		oSelect.selectmenu();
		
		var oButton = $("<button>",{width:"30px",height:"30px",title:"use the picked rule"}).button({icon:"ui-icon-seek-end"});
		oButton.click(	function(){ oThis.onLexicon();}	);
		oDiv.append(oButton);
		
		oElement.append(oDiv);
		
		//--controls------------------------------------------------		
		var oDiv = $("<DIV>",{class:"ui-widget-content"});
		var oButton = $("<button>",{width:"30px",height:"30px"}).button({icon:"ui-icon-stop"});
		oButton.click(	function(){ oThis.onClickButton(cCAConsts.action_types.stop);}	);
		oDiv.append(oButton);

		var oButton = $("<button>",{width:"30px",height:"30px"}).button({icon:"ui-icon-circle-triangle-e"});
		oButton.click(	function(){ oThis.onClickButton(cCAConsts.action_types.play);}	);
		oDiv.append(oButton);

		var oButton = $("<button>",{width:"30px",height:"30px",title:"step"}).button({icon:"ui-icon-seek-end"});
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
		if (!oOptions.rule_set)
			alert("set a rule first!!");
		else{
			var oEvent = new cCAEvent( cCAConsts.event_types.action, parseInt(piAction));
			this._trigger("onCAEvent", null, oEvent);			
		}

	},
	
	//****************************************************************************
	onSetNameClick: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;

		var oInput = $("#" +	oElement.attr("id")+"NAME");
		var sInput = oInput.val().trim();
		if (sInput === ""){
			alert ("empty input string :-(");
			return;
		}
		try{
			var oImporter = new cCARepeatBase64Importer();
			var oRule = oImporter.makeRule(sInput);
			var oExporter = new cCABase64Importer();
			var s64 = oExporter.toString(oRule,1);
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

		var oTextArea = $("#" +	oElement.attr("id")+"ENTRY");
		var oSelect = $("#" + oElement.attr("id")+"RULELIST");
		
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
					var s64 = oExporter.toString(oRule,1);
					this.pr_setBase64Rule(s64);
					break;
				case cCAConsts.rule_types.base64:
					var oImporter = new cCABase64Importer();
					oRule = oImporter.makeRule(oTextArea.val());
					var oEvent = new cCAEvent( cCAConsts.event_types.set_rule, oRule);
					this._trigger("onCAEvent", null, oEvent);
					oOptions.rule_set = true;
					break;
				default:
					if (oSelect.val() === "random"){
						this.pr_makeRandomBase64();
					}else{
						alert("unknown rule type");
					}
			}
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

		
		var oSelect = $("#" +oElement.attr("id")+"INIT");
		if (!oSelect.val()) {
			alert("choose a init method");
			return;
		}
		var iSelected = parseInt(oSelect.val());
		var oEvent = new cCAEvent( cCAConsts.event_types.initialise, iSelected);
		this._trigger("onCAEvent", null, oEvent);
	},

	//****************************************************************************
	onRuleChange:function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		var oTextArea = $("#" +	oElement.attr("id")+"ENTRY");
		var oSelect = $("#" + oElement.attr("id")+"RULELIST");
		var sSelected = oSelect.val();
		if (sSelected){
			var iSelected = parseInt(sSelected);
			if ( iSelected == cCAConsts.rule_types.base64){
				var sText = oTextArea.val();
				var iDiff = cCAConsts.base64_length - sText.length;
				var oSpan = $("#" +	oElement.attr("id")+"EXTRA");
				oSpan.html( iDiff +" chars remaining");
			}
		}
		
	},
	
	//#################################################################
	//# privates
	//#################################################################`
	pr_makeRandomBase64: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;

		var oImporter = new cCABinaryImporter();
		oRule= oImporter.randomRule();
		
		var oImporter = new cCABase64Importer();
		var sBase64 = oImporter.toString(oRule,1);
		
		this.pr_setBase64Rule(sBase64);
	},
	
	//****************************************************************************
	pr_setBase64Rule:function( psBase64){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		var oTextArea = $("#" +	oElement.attr("id")+"ENTRY");
		oTextArea.val(psBase64);		

		var oSelect = $("#" + oElement.attr("id")+"RULELIST");
		oSelect.val(cCAConsts.rule_types.base64);
		oSelect.selectmenu("refresh");
		this.onSetRuleClick();
	},
	
	//****************************************************************************
	pr__populate_lexicon:function(poSelect){
		var aRules = cCALexicon.get_rules();
		
		poSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("pick one"));
		
		for (var i = 0; i < aRules.length; i++){
			var oRule = aRules[i];
			var oOption = $("<option>",{value:oRule}).append(oRule.label);
			poSelect.append(oOption);
		}
	}

	
});
