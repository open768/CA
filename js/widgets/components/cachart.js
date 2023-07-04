"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
///load google charts

class cCAChartTypes {
	static is_charts_loaded= false
	
	static{
		var oThis = this
		if (!google.charts)  $.error("google.charts class is missing! check includes")	
		
		try{
			google.charts.load('current', {'packages':['corechart']}).then( 
				function(poEvent){oThis.OnGoogleChartsLoaded(poEvent)}
			)
		}catch (e){
			cDebug.write("unable to load Google charts: " + e.msg)
		}
	}
	
	static OnGoogleChartsLoaded(){
		this.is_charts_loaded = true
	}
}


//#################################################################
//# Options
//#################################################################
class cCAChart{
	#runs =0
	#vis_data= null
	#chart= null
	#element = null
	#grid_name = null
	
	constructor(poOptions, poElement){
		
		//checks
		if (!poOptions.grid_name) $.error("grid name not provided")

		//store the element
		this.#element = poElement
		this.#grid_name = poOptions.grid_name
		
		var oElement = this.#element
		var oThis = this
		
		//basic stuff
		oElement.empty()
		oElement.uniqueId()
		oElement.addClass("ui-widget")
		oElement.width(poOptions.width)
		
		//put something in the widget
		var oDiv = $("<DIV>",{class:"ui-widget-header"}).append("Chart")
			oDiv.width(poOptions.width)
			oElement.append(oDiv)
		oDiv = $("<DIV>",{class:"ui-widget-content",id:cJquery.child_ID(oElement, "chart")})
			oDiv.width(poOptions.width)
			oDiv.height(poOptions.height)
			oElement.append(oDiv)
		this.#clear_chart()

		//subscribe to CAEvents
		cCAEventHelper.subscribe_to_ca_events( this.#grid_name, (poEvent) => { oThis.onCAEvent(poEvent) })
		cCAEventHelper.subscribe_to_canvas_events(this.#grid_name, (poEvent) => { oThis.onCACanvasEvent(poEvent) })
	}
	
	//*****************************************************************
	//# methods
	//*****************************************************************
	
	//*****************************************************************
	#create_data(){
		var oElement = this.#element
		
		//check if the data has been previously created
		if (this.#vis_data) return
		if (!google.visualization)  $.error("google.visualization class is missing! check includes")	
		this.#clear_chart()

		//create the google data
		var oData = new google.visualization.DataTable()
		this.#vis_data = oData
		oData.addColumn('number', 'Run')
		oData.addColumn('number', 'changed')		
		oData.addColumn('number', 'active')		
		oData.addColumn({type: 'string', role: 'tooltip', p: {html: true}})				

		//create the chart
		var oChartElement = $("#"+cJquery.child_ID(oElement, "chart"))
		this.#chart = new google.visualization.LineChart( oChartElement[0] )
	}
	
	//*****************************************************************
	//# events
	//*****************************************************************
	onCACanvasEvent(poEvent) {
		cDebug.enter()
		switch (poEvent.action) {
			case cCACanvasEvent.actions.grid_status:
				//add the data to the data structure and draw
				cDebug.write("status action")
				if (!cCAChartTypes.is_charts_loaded){
					cDebug.extra_debug("still waiting for google charts")
					cDebug.leave()
					return
				}
				var oData = poEvent.data
				if (!oData){
					cDebug.extra_debug("no data")
					return
				}
				
				this.#create_data()
				this.#vis_data.addRow([this.#runs, oData.changed, oData.active, "Run: " + this.#runs])
				this.#chart.draw(this.#vis_data)
				
				this.#runs ++
				break
		}
		cDebug.leave()
	}
	
	//*****************************************************************
	onCAEvent(poEvent){
		cDebug.enter()
		
		switch (poEvent.type){
			//----------------------------------------------------------------------
			case cCAEvent.types.rule:
				cDebug.write("rule event")
				switch (poEvent.action){
					case cCARuleEvent.actions.set_rule:
						cDebug.write("set_rule action")
						this.#clear_chart()
				}
				break
			//----------------------------------------------------------------------
			case cCAEvent.types.action:
				cDebug.write("action event")
				switch (poEvent.action){
					case cCAActionEvent.actions.grid_init:
						cDebug.write("grid_init action")
						this.#clear_chart()
				}
				break
		}
		cDebug.leave()
	}
	
	#clear_chart(){
		var oElement = this.#element
		var oChartElement = $("#"+cJquery.child_ID(oElement, "chart"))
		this.#vis_data = null
		this.#chart = null
		this.#runs = 0
		oChartElement.empty()
		oChartElement.append("Waiting for Data ...")
	}

}

//#################################################################
//# Options
//#################################################################
$.widget( "ck.cachart",{
	options:{
		width: 240,
		height:100,
		grid_name:null
	},

	//*****************************************************************
	_create: function(){
		new cCAChart(this.options, this.element) //call the class constructor
	}
})
