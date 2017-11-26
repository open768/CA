
//###############################################################################
var cCArule = function(){
	this.init = function(){
		this.state_count =1;
		this.neighbour_type = cCAConsts.Neighbour_8way;
		this.has_state_transitions = false;
		this.outputs = new Array(cCAConsts.max_inputs);
		this.state_transitions = new Array(cCAConsts.max_inputs);
	};
	this.init();

	//*****************************************************************
	this.parseJson = function (psJson){
		try{
			var oData = JSON.parse(psJson);
		}catch (e){
			alert ("not valid json rule");
			$.error("not valid rule")
		}
	};

	//*****************************************************************
	this.toJson = function (){
		
	};
		
	//*****************************************************************
	this.run= function (poCell){
		
	};
	
	//*****************************************************************
	this.set_output = function (piIndex, piBitValue){
		this.outputs[piIndex] = piBitValue;
	};
	
	//*****************************************************************
	this.get_output = function (piIndex){
		return this.outputs[piIndex];
	};
	
	//*****************************************************************
	this.toBinaryString = function (){
		var sOut = "";
		
		for (var i=1; i <=cCAConsts.max_inputs; i++)
			sOut = sOut + this.get_output(i);
		return sOut;
	}
}