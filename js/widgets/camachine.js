//###############################################################################
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.camachine",{
	//#################################################################
	//# Definition
	//#################################################################
	options:{
		width:100,
		height:200,
		cell_size:5
	},
	

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oThis, oElement;
		
		//check for classes
		if (typeof cCArule !== 'function') { $.error("missing cCARule class");}
		
		//set basic stuff
		oThis = this;
		oElement = oThis.element;
		oElement.uniqueId();
		
		//test the  carule
		var oImporter = new cCALifeImporter();
		var oRule = oImporter.makeRule("B3/S23");
		cDebug.write("Done");
		
	}
	
});