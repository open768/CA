var cCAStateRule = function() {
	this.neighbour_type = cCAConsts.Neighbour_8way;
	this.outputs = new Array(cCAConsts.max_inputs);
	this.state_transitions = new Array(cCAConsts.max_inputs);	
}

//###############################################################################
function CAException(psMessage) {
   this.message = psMessage;
   this.name = 'CAException';
}

//###############################################################################
var cCArule = function(){
	this.init = function(){
		this.neighbour_type = cCAConsts.Neighbour_8way;
		this.has_state_transitions = false;
		this.stateRules = [];
	};
	this.init();

	//*****************************************************************
	this.parseJson = function (psJson){
		try{
			var oData = JSON.parse(psJson);
		}catch (e){
			alert ("not valid json rule");
			$.error("not valid rule");
		}
		//TODO
	};

	//*****************************************************************
	this.toJson = function (){
		//TODO
	};
			
	//*****************************************************************
	this.set_output = function (piState, piIndex, piBitValue){
		if (piState > this.stateRules.length)	this.stateRules[piState-1] = new cCAStateRule();
		this.stateRules[piState-1].outputs[piIndex] = piBitValue;
	};
	
	//*****************************************************************
	this.get_output = function (piState, piIndex){
		if (piState > this.stateRules.length)	throw new CAException("invalid state requested");
		return this.stateRules[piState-1].outputs[piIndex];
	};
	
	//*****************************************************************
	this.toBinaryString = function (piState){
		var sOut = "";
		if (piState > this.stateRules.length)	throw new CAException("invalid state requested");
		
		for (var i=1; i <=cCAConsts.max_inputs; i++)
			sOut = sOut + this.get_output(piState,i);
		return sOut;
	}
	
	this.toString = function (piState){
		if (piState > this.stateRules.length)	throw new CAException("invalid state requested");
		
		var sBinary = this.toBinaryString(piState);
		cDebug.write("binary:" + sBinary);
		var oBigInt = new BigInteger();
		oBigInt.fromString(sBinary,2);
		var sHex = oBigInt.toString(16);
		cDebug.write("hex:" + sHex);
		var sOut = hex2b64(sHex);
		
		return sOut;
			
	}
	
}