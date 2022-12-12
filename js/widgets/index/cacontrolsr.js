"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/


//###################################################################
//#
//###################################################################
class cCAControlsR{
	grid = null;
	element = null;
	grid_name = null;
	
	//***************************************************************
	constructor(poOptions, poElement){
		this.element = poElement;
		this.grid_name = poOptions.grid_name;

		var oThis = this;
		var oElement = this.element;
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");

		//check dependencies
		if (!bean ) $.error("bean is missing , chack includes");
		if (!oElement.cagridinit) $.error("cainit is missing , chack includes");
		if (!oElement.castatus) $.error("castatus is missing , chack includes");
		if (!oElement.cachart) $.error("caChart is missing , chack includes");
		if (!oElement.caremotecontrols) $.error("caremotecontrols is missing , chack includes");
		
		//put something in the widget
		oElement.empty();
		this.pr__init();

	}
	
	
	
	//***************************************************************
	//* Privates
	//***************************************************************
	pr__init(){
		var oDiv, oTable, oRow, oCell;
		var oElement;
		
		oElement = this.element;
		
		//--input-------------------------------------------------
		oDiv = $("<DIV>");
			oDiv.castatus({grid_name:this.grid_name});
			oElement.append(oDiv);
		oElement.append("<P>");
		
		//-------------------------------------------------------------
		oDiv = $("<DIV>");
			oDiv.cachart({grid_name:this.grid_name});
			oElement.append(oDiv);
		oElement.append("<P>");
		
		//--initialise------------------------------------------------		
		oDiv = $("<DIV>");
			oDiv.cagridinit({grid_name:this.grid_name});
			oElement.append(oDiv);
		oElement.append("<P>");
		
		//--controls------------------------------------------------		
		oDiv = $("<DIV>",{class:"ui-widget-header"});
			oDiv.caremotecontrols({grid_name:this.grid_name});
		oElement.append(oDiv);
	}
	
}

//###################################################################
//#
//###################################################################
$.widget( 
	"ck.cacontrolsr",
	{
		options:{
			grid_name:null
		},
		_create: function(){
			//checks
			var oOptions = this.options;
			if (!oOptions.grid_name) $.error("grid name not provided");
			
			var oControls = new cCAControlsR(oOptions ,this.element);
		}
	}
);