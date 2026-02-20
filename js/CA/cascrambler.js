"use strict"
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

Any Cryptography concepts demonstrated in this code are covered by the UK Govt Open General Export License for Cryptographic development 
(see https://www.gov.uk/government/publications/open-general-export-licence-cryptographic-development) 
and is not intended for any dual use as defined by the UK government license. 
You the consumer of this code are solely and entirely responsible for importing this code into your own country..

**************************************************************************/
/** Scrambler Events */
class cCAScramblerEvent extends cBaseEvent{
	static event_type_id = "cascramev"

	static types = {
		general: "G",
		progress: "P"
	}
	
	static actions = {
		status:"S"
	}
}

class cCAScramblerTypes{
	static status = {
		dormant: null,
		initialRuns: 1
	}
}
//###################################################################################
//#
//###################################################################################
/** class that performs data scrambling */
 
class cCAScrambler{
	/** @type cCAGrid */ grid=null
	/** @type number  */ inital_runs = -1
	/** @type string  */ plaintext = null
	/** @type number  */ initial_runs_completed = 0
	/** @type cCAScramblerTypes */ status = null

	
	/**
	 * Description
	 * @param {cCAGrid} poGrid	CA grid to use to generate Scrambler instructions
	 * @param {number} piInitialRuns	how many iterations to advance the CA grid before scrambling starts
	 * @param {string} psPlainTxt	the plaintext to scramble
	 */
	constructor(poGrid, piInitialRuns, psPlainTxt){
		if (!poGrid) 
			$.error("Grid param, missing")
		if (!poGrid.rule) 
			$.error("no rule in the grid")
		if (piInitialRuns<5) 
			$.error("initial runs invalid - must be at least 5")
		if (!psPlainTxt) 
			$.error("plaintext missing")

		this.grid = poGrid
		this.plaintext = psPlainTxt
		this.inital_runs = piInitialRuns
		this.initial_runs_completed = 0
		this.status = cCAScramblerTypes.status.dormant

		var oThis = this /** @type cCAScrambler */

		//subscribe to grid events
		cCAGridEvent.subscribe(this.grid.name, poEvent=>
			oThis.onCAGridEvent(poEvent)
		)
	}
	
	//*******************************************************************************
	/**
	 * performs the initial runs of the grid
	 */
	async perform_inital_runs(){
		if (this.initial_runs_completed < this.inital_runs){
			this.status = cCAScramblerTypes.status.initialRuns
			var oActionEvent = new cCAActionEvent(this.grid.name, cCAActionEvent.actions.step)
			oActionEvent.trigger()
		}else
			throw new Error("not implemented")
	}
	
	//*******************************************************************************
	async scramble(){ 
		var oScramblerEvent = new cCAScramblerEvent( cCAScramblerEvent.types.general, cCAScramblerEvent.actions.status, "Started scrambler")
		oScramblerEvent.trigger()

		this.initial_runs_completed = 0
		this.perform_inital_runs()
	}

	//*******************************************************************************
	onCAGridEvent(poEvent){
		cDebug.write(poEvent)
		if (poEvent.action == cCAGridEvent.notify.done)
			if (this.status == cCAScramblerTypes.status.initialRuns){
				this.initial_runs_completed++
				this.perform_inital_runs()
			}
	}
}