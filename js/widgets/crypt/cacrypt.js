"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

Cryptography code demonstrated in this application is covered by the UK Govt 
Open General Export License for Cryptographic development 
(see https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1101784/open-general-export-licence-cryptographic-development.pdf) 
and is not intended for dual use as defined by this license. 
You the consumer of this application are entirely responsible for importing this code into your own country. if you disagree please close this page.

**************************************************************************/

//###################################################################################
//###################################################################################
class cCACryptTypes{
	static name =  "cacryptgrid"
	static rows = 100
	static cols = 100
	static cell_size = 5
	static input_name = "CRinput"	
	static output_name = "CROutput"
}

//###############################################################################
class cCACryptEvent extends cCAEvent{
	static hook = "CACRYEV"
	static types = {
		general: "GNR"
	}
	static actions = {
		status: "STA"
	}
	
	/**
	 * Description
	 * @param {string} psMessage
	 * @returns {null}
	 */
	static triggerStatus( psMessage){
		var oEvent = new cCACryptEvent(this.types.general, this.actions.status, psMessage)
		oEvent.trigger()
	}
}

//###################################################################################
//###################################################################################
class cCACryptStatus{
	/** @type Element */ element = null
	/** @type boolean */ first_message = true
	constructor(poElement){
		if (!bean ) 	$.error("bean class is missing! check includes")	
		this.element = poElement
		var oElement = poElement
		oElement.uniqueId()
		oElement.addClass("ui-widget")
		oElement.empty()
		this.init()
	}
	
	//*******************************************************************************
	init(){
		var oElement = this.element
		var oDiv = $("<DIV>", {class:"ui-widget-header"})
			oDiv.append("Status")
			oElement.append(oDiv)
		var sID = cJquery.child_ID(oElement,"status")
		oDiv = $("<DIV>", {class:"ui-widget-content",id:sID})
			oDiv.append("Status goes here")
			oElement.append(oDiv)

			
		//subscribe to CAEvents
		var oThis = this
		bean.on (document, cCACryptEvent.hook, function(poEvent){ oThis.onCACryptEvent(poEvent)} )
	}
	
	//*******************************************************************************
	/**
		@param {cCACryptEvent} poEvent
	*/
	onCACryptEvent(poEvent){
		var oElement = this.element
		
		if (poEvent.type === cCACryptEvent.types.general)
			if (poEvent.action === cCACryptEvent.actions.status){
				var sID = cJquery.child_ID(oElement,"status")
				var oDiv = $("#" + sID)
				if (this.first_message) 
					oDiv.empty()
				else
					oDiv.append("<br>")
				oDiv.append(poEvent.data)
				this.first_message = false
			}

	}
}

//###################################################################################
//###################################################################################
class cCACrypt {
	element = null
	ca_name = null
	
	constructor(psCAName, poElement){
		if (!bean ) 	$.error("bean class is missing! check includes")	
		this.element = poElement
		this.ca_name = psCAName
		var oElement = poElement
		oElement.uniqueId()
		
		if (!oElement.cacryptstatus) $.error("missing status widget")
		if (!oElement.cacryptca) $.error("missing CA widget")
		if (!oElement.cacryptdata) $.error("missing CA data widget")
		this.init()
	}
	
	//*******************************************************************************
	init(){
		var oElement = this.element
		var oDiv
		
		//build the UI
		var oTable, oTR, oTD
		oTable = $("<table>", {border:0, cellspacing:0, cellpadding:5,width:"100%"})
			oTR = $("<tr>")
				oTD = $("<TD>",{width:"50%", id:"ca",valign:"top"})
					oDiv = $("<DIV>").append("CA goes here")
						oDiv.cacryptca({ca_name: this.ca_name, rows:cCACryptTypes.rows, cols:cCACryptTypes.cols})
						oTD.append(oDiv)
					oTR.append(oTD)
				oTD = $("<TD>",{width:"50%", id:"crypt",valign:"top"})
					oDiv = $("<DIV>").append("Data goes here")
						oDiv.cacryptdata({ca_name: this.ca_name})
						oTD.append(oDiv)
					oDiv = $("<DIV>").append("Data goes here")
						oDiv.cacryptstatus()
						oTD.append(oDiv)
					oTR.append(oTD)
				oTable.append(oTR)
		oElement.append(oTable)
		
		//---------------informs subscribers that UI is ready -------------------------------
		var sTxt = "the quick brown fox jumped over the lazy dog".repeat(10)
		$("#"+cCACryptTypes.input_name).val(sTxt)
		var oEvent = new cCAActionEvent( this.ca_name, cCAActionEvent.actions.ready,null)
		oEvent.trigger()

		cCACryptEvent.triggerStatus("UI is ready")
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cacrypt",{
	_create: function(){
		new cCACrypt(cCACryptTypes.name, this.element) //call widgetclass
	}
})
$.widget( "ck.cacryptstatus",{
	_create: function(){
		new cCACryptStatus(this.element) //call widgetclass
	}
})
