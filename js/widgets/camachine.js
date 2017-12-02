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
		
		//test the  carule - create life
		var oImporter = new cCALifeImporter();
		var oRule = oImporter.makeRule(cCALifeRules.LIFE);
		var oExporter = new cCABase64Importer();
		var sBase64 = oExporter.toString(oRule,1);
		
		//test the  carule - recreate life
		var oImporter = new cCABase64Importer();
		var oRule = oImporter.makeRule(sBase64);
		cDebug.write("Done");
	}
	
});