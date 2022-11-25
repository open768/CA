"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//contains widgets: ck.caeditorcell and ck.caeditor

$.widget( "ck.caeditorcell",{
	//#################################################################
	//# Options
	//#################################################################
	options:{
		index:-1,
		value: 0, 
		cell_size:-1,
		debug:false
	},
	
	//#################################################################
	//# Constructor
	//#################################################################`
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
	
	//#################################################################
	//# privates
	//#################################################################`
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
	
	//#################################################################
	//# Events
	//#################################################################`
	onClick: function(){
		var oThis = this;
		var oElement = oThis.element;
		
		var oOptions = oThis.options;
		if (oOptions.value == 0)
			this._set_value(1);
		else
			this._set_value(0);
		
		var oEvent = new cCAEvent( cCAConsts.event_types.click, oOptions);
		bean.fire(document, cCAConsts.event_hook, oEvent );
	}
});

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.caeditor",{
	//#################################################################
	//# Options
	//#################################################################
	rule:null,
	IDs:{
		RULE : "RU",
		STATUS : "ST",
		CELL_CONTAINER : "CC"
	},
	
	options:{
		onCAEvent: null,
		cell_size:10
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
		$(oElement).tooltip();
		oElement.empty();
		
		//if no Rule - create an empty one
		if (this.rule == null) this.rule = new  cCArule();

		//Add a status window
		var sID = cJquery.child_ID(oElement, this.IDs.STATUS);
		var oDiv = $("<DIV>", {class:"ui-widget-header",id:sID});
			oDiv.append("??");
		oElement.append(oDiv);
		
		//Add a rule box
		oDiv = $("<DIV>", {class:"ui-widget-content"});
			var sID = cJquery.child_ID(oElement, this.IDs.RULE);
			var oBox = $("<TEXTAREA>",{ID:sID,rows:5,cols:80 ,class:"rule rule_wide", title:"enter the base64 rule here"});				
			oBox.keyup( function(){oThis.onRuleKeyUp()}	);
			oDiv.append(oBox);
			
			var oButton = $("<button>",{title:"use the rule entered in the box above"}).button({icon:"ui-icon-circle-arrow-e" });
			oButton.click(	function(){oThis.onSetRuleClick()}	);		
			oDiv.append(oButton);
		oElement.append(oDiv);

		
		//Add a panel for description
		oDiv = $("<DIV>", {class:"ui-widget-content"});
		oDiv.append("input configurations below show the output for a particular configuration of a cell and its neighbours. Those highlighted in blue will output 1 (alive) otherwise 0 (dead). Click to change");
		oElement.append(oDiv);
		
		//Add the individual widgets that can be clicked
		var sID = cJquery.child_ID(oElement, this.IDs.CELL_CONTAINER);
		oDiv = $("<DIV>", {class:"ui-widget-content",id:sID});
		oElement.append(oDiv);
		this.pr_add_cells();
		
		//get the contents of the clipboard
		cBrowser.get_clipboard_permissions();
		this.pr_set_status("waiting for clipboard");
		cBrowser.paste_from_clipboard( function(psText){ oThis.onGotClipText(psText)} );	//async fetch from clipboard, will display a warning to user
		
		//add event listener
		bean.on(document, cCAConsts.event_hook, function(poEvent){oThis.onCaEvent(poEvent)});
	},
	
	//#################################################################
	//# privates
	//#################################################################`
	pr_set_status: function(psText){
		var oElement = this.element;
		var sID = cJquery.child_ID(oElement, this.IDs.STATUS);
		$("#"+sID).html(psText);
	},
	
	pr_add_cells: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		var oRule = this.rule;
		
		//clear out any cells present
		var sID = cJquery.child_ID(oElement, this.IDs.CELL_CONTAINER);
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
			var oSpan = $("<SPAN>").caeditorcell({
				index:iIndex, value:iVal,
				cell_size:oOptions.cell_size
			})
			oDiv.append(oSpan);
		}
	},
		
	//#################################################################
	//# Events
	//#################################################################`
	onGotClipText: function(psText){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		var sID = cJquery.child_ID(oElement, this.IDs.RULE)
		
		if (psText === "") {
			this.pr_set_status( "nothing in clipboard");
			return;
		}
			
		try{
			var oImporter = new cCABase64Importer();
			this.rule = oImporter.makeRule(psText);
			$("#"+sID).val(psText);
			this.onSetRuleClick();
			this.pr_set_status( "rule loaded from clipboard");
		}catch (e){
			this.pr_set_status( "not a valid rule in clipboard!");
		}
	},
		
	//*************************************************************
	onSetRuleClick: function(){
		var oThis = this;
		var oElement = oThis.element;
		var oOptions = oThis.options;
		var sID = cJquery.child_ID(oElement, this.IDs.RULE)
		var oTextArea = $("#"+sID);
		
		try{
			var oImporter = new cCABase64Importer();
			this.rule = oImporter.makeRule(oTextArea.val());
			this.pr_add_cells();
		}catch (e){
			alert ("Whoops - something went wrong!\n\n" + e.message);
		}
		
	},
	
	//*************************************************************
	onCaEvent: function(poEvent){
		if (poEvent.type == cCAConsts.event_types.click)
			this.onCellClick(poEvent.data);
	},
	
	//*************************************************************
	onCellClick: function(poData){
		var oThis = this;
		var oElement = oThis.element;
		var oOptions = oThis.options;
		var oRule = this.rule;

		try{
			oRule.set_output(cCAConsts.default_state, poData.index, poData.value);
			var oExporter = new cCABase64Importer();
			var s64 = oExporter.toString(oRule,cCAConsts.default_state);
			var sID = cJquery.child_ID(oElement, this.IDs.RULE)
			var oTextArea = $("#"+sID);
			oTextArea.val(s64);
		}catch (e){
			alert ("Whoops - something went wrong!\n\n" + e.message);
		}
	},
	
	//*************************************************************
	onRuleKeyUp: function(){
		var oThis = this;
		var oElement = oThis.element;
		var sID = cJquery.child_ID(oElement, this.IDs.RULE)
		var oTextArea = $("#" + sID);
		var sText = oTextArea.val();
		var iDiff = cCAConsts.base64_length - sText.length;
		
		this.pr_set_status( iDiff +" chars remaining");
	}
});
