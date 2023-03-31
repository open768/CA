class cCATestBoredom{
    static test(){
        document.write("testing...")
        var oRule = cCARuleBase64Importer.makeRule("0yMK,2Pg,t0IQfTgQg7h02Pg,t3h0t40Qg7h0g01000IQfTgQg7h0d41Qg400g00Qg7h0g0100400g00000000") //conways 
		var oGrid = new cCAGrid("test",3,3)
        oGrid.set_rule(oRule)
    }
}