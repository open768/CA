"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the 
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//###############################################################################
/** cCAEvent class */
class cCAEvent{
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @type {string}
	 */
	static hook = "CAEV";
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @type {{ canvas: string; action: string; general: string; }}
	 */
	static types = {
		canvas: "CNV",
		action: "ACT",
		general: "GNR"
	};
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {*}
	 */
	type=null;
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {*}
	 */
	action=null;
	/**
	 * Description placeholder
	 * 
	 *
	 * @type {*}
	 */
	data = null;
	
	/**
	 * Description
	 * @param {string} psType
	 * @param {string} psAction
	 * @param {any} poData
	 */
	constructor(psType, psAction, poData){
		if (psType === null) throw new Error("null type");	
		if (psAction === null) throw new Error("null action");	
		this.type = psType;
		this.action = psAction;
		this.data = poData;
	}

	/**
	 * Description
	 * @param {Element} poTarget
	 */
	trigger(poTarget){
		if (!poTarget) $.error("target missing");
		var sHook = this.constructor.hook;
		bean.fire(poTarget, sHook, this);
	}
}

/**
 * Description placeholder
 * 
 *
 * @class cCAActionEvent
 * @typedef {cCAActionEvent}
 */
class cCAActionEvent{
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @type {{ ready: string; grid_init: string; control: string; }}
	 */
	static actions = {
		ready: "AERD",
		grid_init: "AEGI",
		control: "AECN"
	};
}

/**
 * Description placeholder
 * 
 *
 * @class cCAGeneralEvent
 * @typedef {cCAGeneralEvent}
 */
class cCAGeneralEvent{
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @type {{ import_grid: string; set_rule: string; }}
	 */
	static actions = {
		import_grid: "GEIG",
		set_rule: "GESR"
	};
}

/**
 * Description placeholder
 * 
 *
 * @class cCARuleEvent
 * @typedef {cCARuleEvent}
 */
class cCARuleEvent{
	/**
	 * Description placeholder
	 * 
	 *
	 * @static
	 * @type {{ update_rule: string; }}
	 */
	static actions = {
		update_rule:"REUR"
	};
}