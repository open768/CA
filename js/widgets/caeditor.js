"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAWidgetTypes{
	static click_event = "CAWidclick";
	static IDs = {
		RULE : "RU",
		STATUS : "ST",
		CELL_CONTAINER : "CC",
		RULE_NEIGHBOUR_COUNT : "RNC",
		RULE_VERB : "RVE",
		RULE_OUT_STATE : "ROS"
	};
}

//#######################################################################
//#
//#######################################################################
$.widget( "ck.caeditwidget",{
	//*****************************************************************
	//# Options
	//*****************************************************************
	options:{
		index:-1,
		value: 0, 
		cell_size:-1,
		debug:false
	},
	
	//*****************************************************************
	//# Constructor
	//*****************************************************************
	_create: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;

		oElement.uniqueId();
		var sID = oElement.attr("id");
		oElement.addClass("ui-widget");
		oElement.addClass("caindex");
		oElement.click( function(){ oThis.onClick()} );

		//add a canvas
		var oCanvas = $("<canvas>");
		var iSize = oOptions.cell_size*3 + 2;
		oCanvas.attr("width",iSize);
		oCanvas.attr("height",iSize);
		oElement.append(oCanvas);
		
		//add the label
		if (oOptions.debug){
			var oDiv = $("<div>");
			oDiv.append(oOptions.index);
			oElement.append(oDiv);
		}
		
		//draw the canvas
		this._drawGrid(oCanvas);
		this._drawNeighbourhood(oCanvas);
		this._set_value(oOptions.value);
	},
	
	//*****************************************************************
	//# privates
	//*****************************************************************
	_drawGrid: function(oCanvas){
		var oThis = this;
		var oOptions = oThis.options;

		//-------------draw the 2 vertical and 2 horizontal lines for the grid
		var iMax = oOptions.cell_size*3 + 2; 
		for ( var iLine=1 ; iLine<=2; iLine++){
			var iLineX = oOptions.cell_size*iLine +iLine;
			oCanvas.drawLine({
			  strokeStyle: 'black',
			  strokeWidth: 1,
			  x1: iLineX , y1: 0,
			  x2: iLineX , y2: iMax
			});
			oCanvas.drawLine({
			  strokeStyle: 'black',
			  strokeWidth: 1,
			  x1: 0 , y1: iLineX,
			  x2: iMax , y2: iLineX
			});
		}		
	},
	
	//******************************************************************
	_drawNeighbourhood: function(oCanvas){
		var oThis = this;
		var oOptions = oThis.options;
		
		//----------- draw the cells
		var iDir, iCount, iBit;
		var x,y;
		
		iCount = 1
		x = y= oOptions.cell_size /2;
		
		for (iDir = cCAConsts.directions.northwest; iDir <= cCAConsts.directions.southeast; iDir++){
			iBit = cCAIndexOps.get_value(oOptions.index, iDir);
			if (iBit >0)
				oCanvas.drawRect({
					fillStyle: 'black',
					x:x, y:y,
					width:oOptions.cell_size * 0.8, 
					height:oOptions.cell_size * 0.8,
					fromCenter: true
				});

			x += (oOptions.cell_size + 1);
			iCount++;
			if (iCount >3){
				iCount = 1;
				x = oOptions.cell_size /2;;
				y += (oOptions.cell_size + 1);
			}
		}
	},
	
	//******************************************************************
	_set_value: function(piValue){
		var oThis = this;
		var oElement = oThis.element;
		var oOptions = oThis.options;

		oOptions.value = piValue;
		
		//change cell style if its value 
		if (piValue == 0)
			oElement.removeClass("caindexon"); 
		else
			oElement.addClass("caindexon");
	},
	
	//*****************************************************************
	//# Events
	//*****************************************************************
	onClick: function(){
		var oThis = this;
		var oElement = oThis.element;
		
		var oOptions = oThis.options;
		if (oOptions.value == 0)
			this._set_value(1);
		else
			this._set_value(0);
		
		bean.fire(document, cCAWidgetTypes.click_event, oOptions );
	}
});

//#######################################################################
//#
//#######################################################################
$.widget( "ck.caeditor",{
	//****************************************************************
	//# Options
	//****************************************************************
	rule:null,
	
	options:{
		cell_size:10
	},

	//*****************************************************************
	//# Constructor
	//*****************************************************************
	_create: function(){
		var oThis = this;
		var oElement = this.element;
		
		//set basic stuff
		oElement.uniqueId();
		
		this.pr_render();
		
		//-------------------------------------------------------------------
		//get the contents of the clipboard
		//async fetch from clipboard, will display a warning to user
		cBrowser.get_clipboard_permissions();
		this.pr_set_status("waiting for clipboard");
		try{
			cBrowser.paste_from_clipboard( function(psText){ oThis.onGotClipText(psText)} );
		}catch(e){
			cBrowser.writeConsoleWarning(e.message);
			this.pr_set_identity_rule();
		}
		
		//add event listener
		bean.on(document, cCAWidgetTypes.click_event, function(poOptions){oThis.onEditWidgetClick(poOptions)});
	},
	
	//*****************************************************************
	//# privates
	//*****************************************************************
	pr_render: function(){
		var oThis = this;
		var oElement = this.element;
		
		oElement.empty();
		oElement.addClass("ui-widget");
		
		//-------------------------------------------------------------------
		//status window
		var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.STATUS);
		var oDiv = $("<DIV>", {class:"ui-widget-header",id:sID});
			oDiv.append("??");
		oElement.append(oDiv);
		
		//-------------------------------------------------------------------
		//rule box
		oDiv = $("<DIV>", {class:"ui-widget-content"});
			var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.RULE);
			var oBox = $("<TEXTAREA>",{ID:sID,rows:5,cols:80 ,class:"rule rule_wide", title:"enter the base64 rule here"});				
			oBox.keyup( function(){oThis.onRuleInputKeyUp()}	);
			oDiv.append(oBox);
			
			var oButton = $("<button>",{title:"use the rule entered in the box above"}).button({icon:"ui-icon-circle-arrow-e" });
			oButton.click(	function(){oThis.onSetRuleClick()}	);		
			oDiv.append(oButton);
		oElement.append(oDiv);
		oElement.append("<hr>");

		
		//-------------------------------------------------------------------
		//panel for description
		
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append("Rule Widgets");
		oElement.append(oDiv);
		
		oDiv = $("<DIV>", {class:"ui-widget-content"});
		oDiv.append("input configurations below show the output for a particular configuration of a cell and its neighbours. Those highlighted in blue will output 1 (alive) otherwise 0 (dead). Click to change");
		oElement.append(oDiv);
		
		//-------------------------------------------------------------------
		//individual widgets that can be clicked
		var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.CELL_CONTAINER);
		oDiv = $("<DIV>", {class:"ui-widget-content",id:sID});
		oElement.append(oDiv);
		oElement.append("<hr>");
		
		//-------------------------------------------------------------------
		//rule controls
		var oDiv = $("<DIV>", {class:"ui-widget-header"});
			oDiv.append("Rule Controls");
		oElement.append(oDiv);
		
		var oDiv = $("<DIV>", {class:"ui-widget-content"});
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append ("Set widgets with");
			
			var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.RULE_VERB);
			var oVerbSelect = $("<Select>", {id:sID});
			for (var sProp in cCAModifierTypes.verbs)	{
				var oVerb = cCAModifierTypes.verbs[sProp];
				var oOption = $("<option>",{value:oVerb.id}).append(oVerb.label);
				oVerbSelect.append(oOption);
			}
			oDiv.append(oVerbSelect);
			
			var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.NEIGHBOUR_COUNT);
			var oCountSelect = $("<Select>", {id:sID});
				for (var i=1; i<=8; i++){
					var oOption = $("<option>").append(i);
					oCountSelect.append(oOption);
				}
			oDiv.append(oCountSelect);
			
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			oDiv.append (" Neighbours to output ");
			var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.RULE_OUT_STATE);
			//any cell with X neighbours will output 1 0r zero
			var oOutSelect = $("<Select>", {id:sID});
				oOutSelect.append( $("<option>").append(0) );
				oOutSelect.append( $("<option>").append(1) );
			oDiv.append(oOutSelect);
				
			//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			var oButton = $("<button>").append("Apply");
			oDiv.append (oButton);
			oButton.click(function(){ oThis.onNeighbourRuleClick() });
		oElement.append(oDiv);
	},
	
	//*****************************************************************
	pr_set_status: function(psText){
		var oElement = this.element;
		var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.STATUS);
		$("#"+sID).html(psText);
	},
	
	//*************************************************************
	pr_add_edit_widgets: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		var oRule = this.rule;
		
		//clear out any cells present
		var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.CELL_CONTAINER);
		var oDiv = $("#"+sID);
		oDiv.empty();
		
		//add the cells
		var iVal;
		for (var iIndex=1; iIndex<=cCAConsts.max_inputs; iIndex++){
			try{
				iVal = oRule.get_rule_output(cCAConsts.default_state, iIndex);
			}
			catch (e){
				iVal = 0;
				console.log(e.message)
			}
			var oSpan = $("<SPAN>").caeditwidget({
				index:iIndex, value:iVal,
				cell_size:oOptions.cell_size
			})
			oDiv.append(oSpan);
		}
	},
	
	//*************************************************************
	pr_set_identity_rule: function(){
		var oElement = this.element;
		var oRule = cCaIdentityRule.makeRule();
		var s64 = cCABase64Exporter.export(oRule,cCAConsts.default_state);
		this.pr_set_base64Rule(s64);
		this.pr_set_status( "Identity Rule");
		this.onSetRuleClick();
	},
	
	//*************************************************************
	pr_set_base64Rule: function( ps64){
		var oElement = this.element;
		var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.RULE)
		$("#"+sID).val(ps64);
	},
		
	//*****************************************************************
	//# Events
	//*****************************************************************
	onGotClipText: function(psText){
		var oElement = this.element;
		
		if (psText === "") {
			cBrowser.writeConsoleWarning("nothing in clipboard!");
			this.pr_set_identity_rule();
			return;
		}
			
		try{
			this.rule = cCABase64Importer.makeRule(psText);
			this.pr_set_base64Rule(psText);
			this.onSetRuleClick();
			this.pr_set_status( "rule loaded from clipboard");
		}catch (e){
			cBrowser.writeConsoleWarning("not a valid rule in clipboard!");
			this.pr_set_identity_rule();
		}
	},
		
	//*************************************************************
	onSetRuleClick: function(){
		var oElement = this.element;
		var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.RULE)
		var oTextArea = $("#"+sID);
		
		try{
			this.rule = cCABase64Importer.makeRule(oTextArea.val());
			this.pr_add_edit_widgets();
		}catch (e){
			alert ("Whoops - something went wrong!\n\n" + e.message);
		}
		
	},
	
	//*************************************************************
	onEditWidgetClick: function(poData){
		var oElement = this.element;
		var oRule = this.rule;

		try{
			oRule.set_output(cCAConsts.default_state, poData.index, poData.value);
			var s64 = cCABase64Exporter.export(oRule,cCAConsts.default_state);
			this.pr_set_base64Rule(s64);
		}catch (e){
			alert ("Whoops - something went wrong!\n\n" + e.message);
		}
	},
	
	//*************************************************************
	onRuleInputKeyUp: function(){
		var oThis = this;
		var oElement = oThis.element;
		var sID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.RULE)
		var oTextArea = $("#" + sID);
		var sText = oTextArea.val();
		var iDiff = cCAConsts.base64_length - sText.length;
		
		this.pr_set_status( iDiff +" chars remaining");
	},
	
	//*************************************************************
	onNeighbourRuleClick: function(){
		var oElement = this.element;
		var oRule = this.rule;

		var sCountID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.NEIGHBOUR_COUNT);
		var iCount = parseInt( $("#"+sCountID).val());
		var sVerbID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.RULE_VERB);
		var iVerb = parseInt( $("#"+sVerbID).val());
		var sOutID = cJquery.child_ID(oElement, cCAWidgetTypes.IDs.RULE_OUT_STATE);
		var iValue = parseInt( $("#"+sOutID).val());
		
		cCARuleModifier.modify_neighbours(oRule, iCount, iVerb, iValue);
		var s64 = cCABase64Exporter.export(oRule,cCAConsts.default_state);
		this.pr_set_base64Rule(s64);
		this.onSetRuleClick();
	}
});
