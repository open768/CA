"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

class cCAJsonTypes {
	static textarea_id = "txt"
	static tabs_id = "tab"
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
		this.pr__init()

		//subscribe to CA Events
		cCAEventHelper.subscribe_to_canvas_events(this.grid_name, (poEvent) => { oThis.onCACanvasEvent(poEvent) })
		cDebug.leave()
	}

	//#################################################################
	//# Initialise
	//#################################################################`
	pr__init() {
		var oThis, oElement
		var oDiv, sID, oButton

		cDebug.enter()
		oElement = this.element
		oThis = this

		oDiv = $("<DIV>", { class: "ui-widget-header" })
		oDiv.append("Json")
		oElement.append(oDiv)

		oDiv = $("<DIV>", { class: "ui-widget-content" })
		sID = cJquery.child_ID(oElement, cCAJsonTypes.textarea_id)
		var oBox = $("<TEXTAREA>", { ID: sID, class: "json", title: "Json goes here" })
		oDiv.append(oBox)
		if (this.create_button) {
			oButton = $("<button>").append("Create")
			oButton.click(function () { oThis.onClickExport() })
			oDiv.append(oButton)
		}

		oButton = $("<button>").append("import")
		oButton.click(function () { oThis.onClickImport() })
		oDiv.append(oButton)
		oElement.append(oDiv)

		cDebug.leave()
	}

	//#################################################################
	//# EVENTS
	//#################################################################`
	onClickExport() {
		cDebug.enter()
		if (this.grid == null){
			alert("cant create json - grid is not set")
			throw new Error("cant create json - grid is not set")
		}
		else if (!this.grid.rule){
			alert("no rule set")
			throw new Error("cant create json - rule is not set")
		}
		else
			this.pr__create_json()
		cDebug.leave()
	}

	//*****************************************************************
	onClickImport() {
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
		var oEvent = new cCAEvent(this.grid_name, cCAEvent.types.general, cCAGeneralEvent.actions.import_grid, oGrid)
		oEvent.trigger(document)
		cDebug.leave()
	}


	//*****************************************************************
	onCACanvasEvent(poEvent) {
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
	pr__create_json() {
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
