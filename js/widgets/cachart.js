"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//load google charts
try{
	google.charts.load('current', {'packages':['corechart']});
}
catch (e){
	cDebug.write("unable to load Google charts: " + e.msg);
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.cachart",{
	//#################################################################
	//# Options
	//#################################################################
	options:{
		width: 240,
		height:100,
		runs:0,
		_data: null,
		_chart: null
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
		oElement.width(oOptions.width);
		oElement.height(oOptions.height);

		//check dependencies
		if (!google.charts)  $.error("google.charts class is missing! check includes");	

		//put something in the widget
		var oDiv;
		oElement.empty();
		oElement.append("Waiting for Data ...");
	},
	
	//#################################################################
	//# methods
	//#################################################################`
	_createData: function(){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		if (oOptions._data) return;

		if (!google.visualization)  $.error("google.visualization class is missing! check includes");	

		//create the google data
		var oData = new google.visualization.DataTable();
		oOptions._data = oData;
		oData.addColumn('number', 'Run');
		oData.addColumn('number', 'changed');		
		oData.addColumn('number', 'active');		
		oData.addColumn({type: 'string', role: 'tooltip', p: {html: true}});				


		oOptions._chart = new google.visualization.LineChart( oElement[0] );
	},
	
	onCAEvent: function(poEvent){
		var oThis = this;
		var oOptions = oThis.options;
		var oElement = oThis.element;
		
		cDebug.write("got a chart event");
		switch (poEvent.type){
			case cCAConsts.event_types.status:
				//add the data to the data structure and draw
				this._createData();
				var oData = poEvent.data;
				oOptions._data.addRow([oOptions.runs, oData.changed, oData.active, "Run: " + oOptions.runs]);
				oOptions._chart.draw(oOptions._data);
				oOptions.runs ++;
				break;
			case cCAConsts.event_types.set_rule:
			case cCAConsts.event_types.initialise:
				oOptions._data = null;
				oOptions._chart = null;
				oOptions.runs = 0;
				oElement.empty();
				oElement.append("Waiting for Data ...");
		}
	}
});
