"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

Cryptography code demonstrated in this application is covered by the UK Govt 
Open General Export License for Cryptographic development 
(see https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1101784/open-general-export-licence-cryptographic-development.pdf) 
and is not intended for dual use as defined by this license. 
You the consumer of this application are entirely responsible for importing this code into your own country. if you disagree please close this page.

**************************************************************************/
class cScramblerEvent{
	static hook = "cascramev";
}

//###################################################################################
//#
//###################################################################################
class cCAScrambler{
	grid=null;
	inital_runs = -1;
	plaintext = null;
	
	constructor(poGrid, piInitialRuns, psPlainTxt){
		if (!poGrid) $.error("Grid param, missing");
		if (!poGrid.rule) $.error("no rule in the grid");
		if (piInitialRuns<5) $.error("initial runs invalid - must be at least 5");
		if (!psPlainTxt) $.error("plaintext missing");

		this.grid = poGrid;
		this.plaintext = psPlainTxt;
		this.inital_runs = piInitialRuns;
	}
	
	//*******************************************************************************
	async scramble(){ //returns a promise
		var oThis = this;
	}
}