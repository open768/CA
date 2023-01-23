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
/** Scrambler Events */
class cCAScramblerEvent extends cCAEvent{
	static hook = "cascramev";
	static types = {
		general: "G",
		progress: "P"
	};
	
	static actions = {
		status:"S"
	}

	trigger(poObject){
		bean.fire( poObject, this.constructor.hook, this);
	}
}

//###################################################################################
//#
//###################################################################################
/** class that performs data scrambling */
class cCAScrambler{
	/** @type cCAGrid */ grid=null;
	/** @type number  */ inital_runs = -1;
	/** @type string  */ plaintext = null;
	/** @type number  */ initial_runs_completed = 0;
	
	/**
	 * Description
	 * @param {cCAGrid} poGrid	CA grid to use to generate Scrambler instructions
	 * @param {number} piInitialRuns	how many iterations to advance the CA grid before scrambling starts
	 * @param {string} psPlainTxt	the plaintext to scramble
	 */
	constructor(poGrid, piInitialRuns, psPlainTxt){
		if (!poGrid) $.error("Grid param, missing");
		if (!poGrid.rule) $.error("no rule in the grid");
		if (piInitialRuns<5) $.error("initial runs invalid - must be at least 5");
		if (!psPlainTxt) $.error("plaintext missing");

		this.grid = poGrid;
		this.plaintext = psPlainTxt;
		this.inital_runs = piInitialRuns;
		this.initial_runs_completed = 0;

		bean.on(this.grid, )
	}
	
	//*******************************************************************************
	/**
	 * performs the initial runs of the grid
	 * @returns {Promise}
	 */
	async perform_inital_runs(){
	}
	
	//*******************************************************************************
	async scramble(){ 
		var oEvent = new cCAScramblerEvent( cCAScramblerEvent.types.general, cCAScramblerEvent.actions.status, "Started scrambler");
		oEvent.trigger(oThis);

		await this.perform_inital_runs();
	}
}