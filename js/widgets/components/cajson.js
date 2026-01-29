"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAJsonTypes {
	static textarea_id = "txt"
	static tabs_id = "tab"
	static body_id = "body"
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCAJson {
	grid = null
	grid_name = null
	create_button = false

	//#################################################################
	//# Constructor
	//#################################################################`
	constructor(poOptions, poElement) {
		cDebug.enter()
		this.element = poElement
		this.grid_name = poOptions.grid_name
		this.create_button = poOptions.create_button
		var oThis = this
		var oElement
		oElement = this.element

		//check dependencies
		if (!bean) $.error("bean class is missing! check includes")
		if (!oElement.tabs) $.error("tabs class is missing! check includes")

		//set basic stuff
		oElement.uniqueId()
		oElement.addClass("ui-widget")
		$(oElement).tooltip()

		//put something in the widget
		oElement.empty()
		this.#init()

		//subscribe to CA Events
		cCAEventHelper.subscribe_to_canvas_events(this.grid_name, poEvent => { oThis.#onCACanvasEvent(poEvent) })
		cDebug.leave()
	}

	//#################################################################
	//# Initialise
	//#################################################################`
	#init() {
		var oThis, oElement
		var oHeaderDiv, oBodyDiv, sBodyID, sID, oButton

		cDebug.enter()
		oElement = this.element
		sBodyID = cJquery.child_ID(oElement, cCAJsonTypes.body_id)
		oThis = this

		oHeaderDiv = $("<DIV>", { class: "ui-widget-header" })
			oHeaderDiv.append("Json")

		var sButtonID = cJquery.child_ID(oElement, "btnJson")
		oButton = $("<button>",{ ID: sButtonID }).append("+")
		oButton.click(function () { oThis.#showHide(sButtonID,sBodyID)})
		oHeaderDiv.append(oButton)
		oElement.append(oHeaderDiv)

		sBodyID = cJquery.child_ID(oElement, cCAJsonTypes.body_id)
		oBodyDiv = $("<DIV>", { class: "ui-widget-content", ID: sBodyID })
			//---------textbox
			sID = cJquery.child_ID(oElement, cCAJsonTypes.textarea_id)
			var oBox = $("<TEXTAREA>", { ID: sID, class: "json", title: "Json goes here" })
			oBodyDiv.append(oBox)

			//---------buttons
			if (this.create_button) {
				oButton = $("<button>").append("Create")
				oButton.click(function () { oThis.#onClickExport() })
				oBodyDiv.append(oButton)
			}

			oButton = $("<button>").append("import")
			oButton.click(function () { oThis.#onClickImport() })
			oBodyDiv.append(oButton)

		oElement.append(oBodyDiv)
		oBodyDiv.hide()

		cDebug.leave()
	}

	//#################################################################
	//# EVENTS
	//#################################################################`
	#showHide(sButtonID, sBodyID){
			var oBody = $("#" + sBodyID)
			var oButton = $("#" + sButtonID)
			var bVisible = oBody.is(":visible")
			oBody.toggle(!bVisible)
			oButton.text(bVisible ? "+" : "-")
	}

	//*****************************************************************
	#onClickExport() {
		cDebug.enter()
		if (this.grid == null){
			alert("cant create json - grid is not set")
			throw new Error("cant create json - grid is not set")
		}
		else if (!this.grid.get_rule()){
			alert("no rule set")
			throw new Error("cant create json - rule is not set")
		}
		else
			this.#create_json()
		cDebug.leave()
	}

	//*****************************************************************
	#onClickImport() {
		cDebug.enter()

		var oElement = this.element

		//get the json
		var sID = cJquery.child_ID(oElement, cCAJsonTypes.textarea_id)
		var sJson = $("#" + sID).val()
		if (sJson === "") {
			alert("no JSON to import")
			return
		}

		try {
			var oJson = JSON.parse(sJson)
		} catch (e) {
			alert("unable to import JSON")
			return
		}

		//create the grid
		var oGrid = cCAGridJSONImporter.populate(this.grid_name, oJson)

		//fire events to tell other controls there is a new rule and grid in town
		var oEvent = new cCAGridEvent(this.grid_name, cCAGridEvent.actions.import_grid, oGrid)
		oEvent.trigger()
		cDebug.leave()
	}


	//*****************************************************************
	#onCACanvasEvent(poEvent) {
		cDebug.enter()
		if (poEvent.action === cCACanvasEvent.actions.set_grid){
			cDebug.write("set_grid")
			this.grid = poEvent.data
		}
		cDebug.leave()
	}

	//#################################################################
	//# EVENTS
	//#################################################################`
	#create_json() {
		cDebug.enter()
		var oElement = this.element

		//export the grid
		var oObj = cCAGridJSONExporter.export(this.grid)
		var sJson = JSON.stringify(oObj)

		//updatethe UI with JSON
		var sID = cJquery.child_ID(oElement, cCAJsonTypes.textarea_id)
		$("#" + sID).val(sJson)
		cDebug.leave()
	}
}

//###############################################################################
//# widget
//###############################################################################
$.widget(
	"ck.cajson",
	{
		options: {
			grid_name: null,
			create_button: true
		},
		_create: function () {
			var oOptions = this.options
			if (!oOptions.grid_name) $.error("grid name not provided")

			new cCAJson(oOptions, this.element) 		//call class constructor
		}
	}
)
