/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

$.widget( "ck.caeditortoggle",{
	//#################################################################
	//# Options
	//#################################################################
	options:{
		index:-1,
		value: 0, 
		cell_size:-1,
		debug:false,
		onClick:null
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
		var oCanvas = $("<canvas>", {id: oElement.attr("id") + "c"});
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
	},
	
	//#################################################################
	//# privates
	//#################################################################`
	_drawGrid: function(oCanvas){
		var oThis = this;
		var oOptions = oThis.options;

		//-------------draw the grid
		var iSize = oOptions.cell_size*3 + 2;
		for ( l=1 ; l<=2; l++){
			var p = oOptions.cell_size*l +l;
			oCanvas.drawLine({
			  strokeStyle: 'black',
			  strokeWidth: 1,
			  x1: p , y1: 0,
			  x2: p , y2: iSize
			});
			oCanvas.drawLine({
			  strokeStyle: 'black',
			  strokeWidth: 1,
			  x1: 0 , y1: p,
			  x2: iSize , y2: p
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
		
		this._trigger("onClick",null,oOptions);
	}
});

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.caeditor",{
	//#################################################################
	//# Options
	//#################################################################
	options:{
		rule:null,
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
		if (oOptions.rule == null) oOptions.rule = new  cCArule();

		//Add a status window
		var sID = oElement.attr("id") + "S";
		var oDiv = $("<DIV>", {class:"ui-widget-header",id:sID});
			oDiv.append("??");
		oElement.append(oDiv);
		
		//Add a rule box
		oDiv = $("<DIV>", {class:"ui-widget-content"});
			var sID = oElement.attr("id") + "T";
			var oBox = $("<TEXTAREA>",{ID:sID,rows:5,cols:80 ,class:"rule rule_wide", title:"enter the base64 rule here"});				
			oBox.keyup( function(){oThis.onRuleChange()}	);
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
		var sID = oElement.attr("id") + "W";
		oDiv = $("<DIV>", {class:"ui-widget-content",id:sID});
		oElement.append(oDiv);
		this._addToggleWidgets();
	},
	
	//#################################################################
	//# privates
	//#################################################################`
	_addToggleWidgets: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		var sID = oElement.attr("id") + "W";
		var oDiv = $("#"+sID);
		oDiv.empty();
		
		//there are 511 editor widgets - each is contained in a span
		for (iIndex=1; iIndex<=cCAConsts.max_inputs; iIndex++){
			var oSpan = $("<SPAN>").caeditortoggle({
				index:iIndex, 
				cell_size:oOptions.cell_size, 
				onClick:function(poEvent,poData){oThis.onToggleClick(poData);}
			})
			oDiv.append(oSpan);
		}
	},
	
	//#################################################################
	//# Events
	//#################################################################`
	onSetRuleClick: function(){
		var oThis = this;
		var oElement = oThis.element;
		var oOptions = oThis.options;
		var sID = oElement.attr("id") + "T";
		var oTextArea = $("#"+sID);
		var oImporter = new cCABase64Importer();
		
		try{
			oOptions.rule = oImporter.makeRule(oTextArea.val());
			this._addToggleWidgets();
		}catch (e){
			alert ("Whoops - something went wrong!\n\n" + e.message);
		}
		
	},
	
	//*************************************************************
	onToggleClick: function(poData){
		var oThis = this;
		var oElement = oThis.element;
		var oOptions = oThis.options;
		var oRule = oOptions.rule;

		try{
			oRule.set_output(cCAConsts.default_state, poData.index, poData.value);
			var oExporter = new cCABase64Importer();
			var s64 = oExporter.toString(oRule,cCAConsts.default_state);
			var sID = oElement.attr("id") + "T";
			var oTextArea = $("#"+sID);
			oTextArea.val(s64);
		}catch (e){
			alert ("Whoops - something went wrong!\n\n" + e.message);
		}
	},
	
	//*************************************************************
	onRuleChange: function(){
		var oThis = this;
		var oElement = oThis.element;
		var oTextArea = $("#" +	oElement.attr("id")+"T");
		var sText = oTextArea.val();
		var iDiff = cCAConsts.base64_length - sText.length;
		var oStatus = $("#" +	oElement.attr("id")+"S");
		oStatus.html( iDiff +" chars remaining");
	}
});
