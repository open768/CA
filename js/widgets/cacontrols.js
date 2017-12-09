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

		//check dependencies
		if (!oElement.selectmenu ) 	$.error("selectmenu class is missing! check includes");	
		if (!cCABase64Importer ) 	$.error("cCABase64Importer class is missing! check includes");	

		//put something in the widget
		var oDiv;
		oElement.empty();

		
		//---------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"});
		oDiv.append("login to facebook");
		oElement.append(oDiv);
		
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
		var oBox = $("<TEXTAREA>",{ID:sID,rows:5,columns:20 ,class:"rule"});				
		oBox.keyup( function(){oThis.onRuleChange()}	);
		oDiv.append(oBox);
		
		sID = oElement.attr("id")+"RULELIST";
		var oSelect = $("<SELECT>",{id:sID,width:200});
		oSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("Choose"));
		oSelect.append( $("<option>",{value:cCAConsts.rule_types.base64}).append("base64"));
		oSelect.append( $("<option>",{value:cCAConsts.rule_types.life}).append("life"));
		oSelect.append( $("<option>").append("random"));
		oDiv.append(oSelect);
		oSelect.selectmenu();
		
		var oButton = $("<button>").append("set rule");
		oButton.click(	function(){oThis.onSetRuleClick()}	);		
		oDiv.append(oButton);
		
		oElement.append(oDiv);
		
		//--initialise------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"});
		oDiv.append("Grid");
		oElement.append(oDiv);
		
		var oDiv = $("<DIV>",{class:"ui-widget-content"});
		sID = oElement.attr("id")+"INIT";
		var oSelect = $("<SELECT>",{id:sID,width:200});
		oSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("Choose"));
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
		var oButton = $("<button>").append("initialise");
		oButton.click(	function(){oThis.onInitClick()}	);		
		oDiv.append(oButton);

		oElement.append(oDiv);
		
		//--controls------------------------------------------------
		oDiv = $("<DIV>",{class:"ui-widget-header"});
		oDiv.append("controls");
		oElement.append(oDiv);
		
		var oDiv = $("<DIV>",{class:"ui-widget-content"});
		var oButton = $("<button>",{width:"20px",height:"20px",class:"ui-icon-stop"}).button();
		var oSpan = $("<SPAN>",{class:"ui-icon-stop"});
		oButton.append(oSpan);
		oDiv.append(oButton);
		var oButton = $("<button>",{width:"20px",height:"20px",class:"ui-icon-play"}).button();
		oDiv.append(oButton);
		var oButton = $("<button>",{width:"20px",height:"20px",class:"ui-icon-seek-next"}).button();
		oDiv.append(oButton);
		
		oElement.append(oDiv);
	},
	
	//#################################################################
	//# EVENTS
	//#################################################################`
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
					var oEvent = new cCAEvent( cCAConsts.event_types.set_rule, oRule);
					this._trigger("onCAEvent", null, oEvent);
					oOptions.rule_set = true;
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
		
		var oTextArea = $("#" +	oElement.attr("id")+"ENTRY");
		oTextArea.val(sBase64);		
	}
});
