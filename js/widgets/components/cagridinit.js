"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/


//###################################################################
//#
//###################################################################
class cCAGridInit{
	element = null
	grid_name = null
	
	//***************************************************************
	constructor(poOptions, poElement){
		this.element = poElement
		this.grid_name = poOptions.grid_name

		var oElement = this.element
		
		//set basic stuff
		oElement.uniqueId()
		oElement.addClass("ui-widget")

		//check dependencies
		if (!bean ) $.error("bean is missing , check includes")
		
		//put something in the widget
		oElement.empty()
		this.#init()

	}
	
	//***************************************************************
	//* Events
	//***************************************************************
	onInitClick(poEvent){
		var iSelected = parseInt($(poEvent.target).val())
		
		//---------tell subscribers to init
		var oEvent = new cCAActionEvent( this.grid_name, cCAActionEvent.actions.grid_init, iSelected)
		oEvent.trigger()
	}
	
	
	
	//***************************************************************
	//* Privates
	//***************************************************************
	#init(){
		var oElement = this.element
		var oThis = this
		
		var oDiv = $("<DIV>",{class:"ui-widget-header"})
			oDiv.append("initialise")
			oElement.append(oDiv)
			
		oDiv = $("<DIV>",{class:"ui-widget-content"})
			var oSelect = $("<SELECT>",{width:200,title:"choose a pattern to initialise the grid with"})
			oSelect.append( $("<option>",{selected:1,disabled:1,value:-1}).append("Initialise"))
			for (var sName in cCAGridTypes.init){
				var oItem = cCAGridTypes.init[sName]
				var oOption = $("<option>",{value:oItem.id}).append(oItem.label)
				oSelect.append ( oOption)
			}
			oDiv.append(oSelect)
			oSelect.selectmenu({
					select:function(poEvent){oThis.onInitClick(poEvent)}
			})
			oElement.append(oDiv)
	}
	
}

//###################################################################
//#
//###################################################################
$.widget( 
	"ck.cagridinit",
	{
		options:{
			grid_name:null
		},
		_create: function(){
			//checks
			var oOptions = this.options
			if (!oOptions.grid_name) $.error("grid name not provided")
			
			new cCAGridInit(oOptions ,this.element) //call class constructor
		}
	}
)