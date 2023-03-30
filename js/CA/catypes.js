"use strict";
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2022
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
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {string}
	 */
	static hook = "CAEV";
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
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
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @type {*}
	 */
	type=null;
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @type {*}
	 */
	action=null;
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
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
 * @date 3/29/2023 - 9:53:50 AM
 *
 * @class cCAActionEvent
 * @typedef {cCAActionEvent}
 */
class cCAActionEvent{
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
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
 * @date 3/29/2023 - 9:53:50 AM
 *
 * @class cCAGeneralEvent
 * @typedef {cCAGeneralEvent}
 */
class cCAGeneralEvent{
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
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
 * @date 3/29/2023 - 9:53:50 AM
 *
 * @class cCARuleEvent
 * @typedef {cCARuleEvent}
 */
class cCARuleEvent{
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {{ update_rule: string; }}
	 */
	static actions = {
		update_rule:"REUR"
	};
}

//###############################################################################
/**
 * Description placeholder
 * @date 3/29/2023 - 9:53:50 AM
 *
 * @class cCACellTypes
 * @typedef {cCACellTypes}
 */
class cCACellTypes {
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {{ fourway: number; eightway: number; maximum: number; }}
	 */
	static neighbours={
		fourway: 0,
		eightway: 1,
		maximum:8
	};
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {{ northwest: number; north: number; northeast: number; west: number; centre: number; east: number; southwest: number; south: number; southeast: number; }}
	 */
	static directions={	
		northwest:1,
		north:2,
		northeast:3,
		west:4,
		centre:5,
		east:6,
		southwest:7,
		south:8,
		southeast:9
		};
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {number}
	 */
	static default_state = 1;
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {{ same: number; up: number; down: number; reset: number; }}
	 */
	static states={
		same: 0,
		up: 1,
		down:2,
		reset:3
	};
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {{ row: string; col: string; }}
	 */
	static hash_values={
		row:"R",
		col:"C"
	};	
}

//###############################################################################
/**
 * Description placeholder
 * @date 3/29/2023 - 9:53:50 AM
 *
 * @class cCARuleTypes
 * @typedef {cCARuleTypes}
 */
class cCARuleTypes {
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {number}
	 */
	static max_inputs =Math.pow(2,9)-1;
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {*}
	 */
	static base64_length =  Math.ceil((Math.pow(2,9)-1)/6);
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {*}
	 */
	static no_boredom= null;
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @type {{ life: number; binary: number; base64: number; wolfram1d: number; random: number; }}
	 */
	static rule_types={
		life:1,
		binary:2,
		base64:3,
		wolfram1d:4,
		random:5
	};
}

//###############################################################################
/**
 * Description placeholder
 * @date 3/29/2023 - 9:53:50 AM
 *
 * @class CAException
 * @typedef {CAException}
 */
class CAException{
	/**
	 * Creates an instance of CAException.
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @constructor
	 * @param {*} psMessage
	 */
	constructor (psMessage) {
   		this.message = psMessage;
		this.name = 'CAException';
	}
}


//###############################################################################
/**
 * Description placeholder
 * @date 3/29/2023 - 9:53:50 AM
 *
 * @class cCAIndexOps
 * @typedef {cCAIndexOps}
 */
class cCAIndexOps {
	//bits are created 	nw,n,ne,w,c,e,sw,s,se

	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @param {*} piIndex
	 * @param {*} piDirection
	 * @returns {(0 | 1)}
	 */
	static get_value(piIndex, piDirection){
		var iVal;
		
		switch (piDirection){
			case cCACellTypes.directions.northwest:
				iVal = 256;
				break;
			case cCACellTypes.directions.north:
				iVal = 128;
				break;
			case cCACellTypes.directions.northeast:
				iVal = 64;
				break;
			case cCACellTypes.directions.west:
				iVal = 32;
				break;
			case cCACellTypes.directions.centre:
				iVal = 16;
				break;
			case cCACellTypes.directions.east:
				iVal = 8;
				break;
			case cCACellTypes.directions.southwest:
				iVal = 4;
				break;
			case cCACellTypes.directions.south:
				iVal = 2;
				break;
			case cCACellTypes.directions.southeast:
				iVal = 1;
				break;
			default:
				throw new CAException("unknown direction " + piDirection);
		}
		
		var iAnd = piIndex & iVal;
		if (iAnd == iVal)
			return 1;
		else	
			return 0;
	}
		
	//***************************************************************
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @param {*} piIndex
	 * @returns {number}
	 */
	static get_bit_count(piIndex){
		var iTmp = piIndex;
		var iCount = 0;
	
		while (iTmp > 0){
			if ((iTmp & 1) == 1) iCount ++;
			iTmp = iTmp >>> 1;		//keep right shifting the value until nothing is left		
		}
		return iCount;
	}
	
	//***************************************************************
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @param {*} piIndex
	 * @returns {number}
	 */
	static get_north_bits(piIndex){
		var iVal = 0;
		iVal |= this.get_value(piIndex, cCACellTypes.directions.northwest );
		iVal <<=1; iVal |= this.get_value(piIndex, cCACellTypes.directions.north );
		iVal <<=1; iVal |= this.get_value(piIndex, cCACellTypes.directions.northeast );
		return iVal;
	}
	
	//***************************************************************
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @param {*} piIndex
	 * @returns {number}
	 */
	static get_centre_bits(piIndex){
		var iVal = 0;
		iVal |= this.get_value(piIndex, cCACellTypes.directions.west );
		iVal <<=1; iVal |= this.get_value(piIndex, cCACellTypes.directions.centre );
		iVal <<=1; iVal |= this.get_value(piIndex, cCACellTypes.directions.east );
		return iVal;
	}
	
	//***************************************************************
	/**
	 * Description placeholder
	 * @date 3/29/2023 - 9:53:50 AM
	 *
	 * @static
	 * @param {*} piIndex
	 * @returns {number}
	 */
	static get_south_bits(piIndex){
		var iVal = 0;
		iVal |= this.get_value(piIndex, cCACellTypes.directions.southwest );
		iVal <<=1; iVal |= this.get_value(piIndex, cCACellTypes.directions.south );
		iVal <<=1; iVal |= this.get_value(piIndex, cCACellTypes.directions.southeast );
		return iVal;
	}
};
