"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
///load google charts

class cCAChartTypes {
	static is_charts_loaded= false;
	static event_hook = "CEVHook";
	static event_types={
		charts_loaded: "gcl"
	};
	
	static{
		var oThis = this;
		if (!google.charts)  $.error("google.charts class is missing! check includes");	
		
		try{
			google.charts.load('current', {'packages':['corechart']}).then( 
				function(poEvent){oThis.OnGoogleChartsLoaded(poEvent)}
			);
		}catch (e){
			cDebug.write("unable to load Google charts: " + e.msg);
		}
	}
	
	static OnGoogleChartsLoaded(poEvent){
		this.is_charts_loaded = true;
		bean.fire(document, cCAChartTypes.event_hook, cCAChartTypes.event_types.charts_loaded);
	}
}


//#################################################################
//# Options
//#################################################################
class cCAChart{
	runs =0;
	vis_data= null;
	chart= null;
	element = null;
	
	constructor(poElement){
		this.element = poElement;
		var oElement = poElement;
		var oThis = this;
		
		//put something in the widget
		var oDiv;
		oElement.empty();
		oElement.append("Waiting for Data ...");
		
		//subscribe to CAEvents
		bean.on (document, cCAEventTypes.event_hook, function(poEvent){ oThis.onCAEvent(poEvent)} );
	}
	
	//*****************************************************************
	//# methods
	//*****************************************************************
	
	//*****************************************************************
	pr__create_data(){
		var oElement = this.element;
		
		if (this.vis_data) return;

		if (!google.visualization)  $.error("google.visualization class is missing! check includes");	

		//create the google data
		var oData = new google.visualization.DataTable();
		this.vis_data = oData;
		oData.addColumn('number', 'Run');
		oData.addColumn('number', 'changed');		
		oData.addColumn('number', 'active');		
		oData.addColumn({type: 'string', role: 'tooltip', p: {html: true}});				


		this.chart = new google.visualization.LineChart( oElement[0] );
	}
	
	//*****************************************************************
	//# events
	//*****************************************************************
	onCAEvent(poEvent){
		var oElement = this.element;
		cDebug.enter();
		
		cDebug.write("got a chart event");
		switch (poEvent.type){
			case cCAEventTypes.event_types.grid_status:
				//add the data to the data structure and draw
				cDebug.write("status event");
				if (!cCAChartTypes.is_charts_loaded){
					cDebug.extra_debug("still waiting for google charts");
					cDebug.leave();
					return;
				}
				var oData = poEvent.data;
				if (!oData){
					cDebug.extra_debug("no data");
					return;
				}
				this.pr__create_data();
				this.vis_data.addRow([this.runs, oData.changed, oData.active, "Run: " + this.runs]);
				this.chart.draw(this.vis_data);
				this.runs ++;
				break;
			case cCAEventTypes.event_types.set_rule:
				cDebug.write("set_rule event");
			case cCAEventTypes.event_types.grid_init:
				cDebug.write("grid_init event");
				this.vis_data = null;
				this.chart = null;
				this.runs = 0;
				oElement.empty();
				oElement.append("Waiting for Data ...");
		}
		cDebug.leave();
	}
}

//#################################################################
//# Options
//#################################################################
$.widget( "ck.cachart",{
	options:{
		width: 240,
		height:100,
	},

	//*****************************************************************
	_create: function(){
		var oThis = this;
		var oOptions = this.options;
		var oElement = this.element;
		
		//set basic stuff
		oElement.uniqueId();
		oElement.addClass("ui-widget");
		$(oElement).tooltip();
		oElement.width(oOptions.width);
		oElement.height(oOptions.height);
		
		var oWidget = new cCAChart(oElement);

	}
});
