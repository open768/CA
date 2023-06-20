//###############################################################################
/* eslint-disable-next-line no-unused-vars */
class CAException {
	/**
	 * Creates an instance of CAException.
	 * 
	 *
	 * @constructor
	 * @param {string} psMessage
	 */
	constructor(psMessage) {
		this.message = psMessage
		this.name = 'CAException'
	}
}


//###############################################################################
/** cCAEvent class */
/* eslint-disable-next-line no-unused-vars */
class cCAEvent {
	static hook = "CAEV"
	static types = {
		canvas: "CNV",
		action: "ACT",
		general: "GNR"
	}
	type = null
	action = null
	data = null

	/**
	 * Description
	 * @param {string} psType
	 * @param {string} psAction
	 * @param {any} poData
	 */
	constructor(psType, psAction, poData) {
		if (psType === null) throw new Error("null type")
		if (psAction === null) throw new Error("null action")
		this.type = psType
		this.action = psAction
		this.data = poData
	}

	/**
	 * Description
	 * @param {Element} poTarget
	 */
	trigger(poTarget) {
		if (!poTarget) $.error("target missing")
		var sHook = this.constructor.hook
		bean.fire(poTarget, sHook, this)
	}
}

//###############################################################################
/* eslint-disable-next-line no-unused-vars */
class cCAActionEvent {
	static actions = {
		ready: "AERD",
		grid_init: "AEGI",
		control: "AECN"
	}
}

//###############################################################################
/* eslint-disable-next-line no-unused-vars */
class cCAGeneralEvent {
	static actions = {
		import_grid: "GEIG",
		set_rule: "GESR"
	}
}

//###############################################################################
/* eslint-disable-next-line no-unused-vars */
class cCARuleEvent {
	static actions = {
		update_rule: "REUR"
	}
}

//###############################################################################
/* eslint-disable-next-line no-unused-vars */
class cCAGridEvent {
	static hook = "CAGRIDEV"
	static actions = {
		done: "GDN",
		clear: "GCL",
		nochange: "GNO",
		init_grid: "GID"
	}

	action = null
	data = null
	grid = null

	/**
	 * Description
	 * @param {cCAGrid} poGrid
	 * @param {psAction} psAction
	 * @param {any} poData
	 */
	constructor(poGrid, psAction, poData) {
		if (poGrid == null || psAction == null) $.error("missing params")
		this.grid = poGrid
		this.action = psAction
		this.data = poData
	}

	trigger() {
		var sEventName = cCAGridEvent.hook_name(this.grid)
		bean.fire(this.grid, sEventName, this)
	}


	/**
	 * Description
	 * @param {cCAGrid} poGrid	CA grid to receive/send events
	 */	
	static hook_name(poGrid) {
		return (this.hook + poGrid.name)
	}

}

//###############################################################################
class cCACanvasEventData {
	grid_name = null
	data = null

	constructor(psGridName, poData) {
		this.grid_name = psGridName
		this.data = poData
	}
}

/* eslint-disable-next-line no-unused-vars */
class cCACanvasEvent {
	static hook = "CACANVASEV"
	static actions = {
		nochange: "CENC",
		grid_status: "CEGS",
		set_grid: "CESG"
	}

	action = null
	data = null
	grid_name = null

	constructor(psGridName, psAction, poData) {
		if (!psGridName || !psAction) $.error("incorrect number of arguments")
		this.grid_name = psGridName
		this.action = psAction
		this.data = poData
	}

	trigger(poSubject) {
		var oData = new cCACanvasEventData(this.grid_name, this.data)
		var oEvent = new cCAEvent(cCAEvent.types.canvas, this.action, oData)
		oEvent.trigger(poSubject)
	}
}

//###############################################################################
/* eslint-disable-next-line no-unused-vars */
class cCAEventHelper {
	/**
	 * helper function
	 * @param {cCAGrid} poGrid	CA grid to send events
	 * @param {function} pfn	callback
	 */	
	static subscribe_to_grid_events(poGrid, pfn){
		bean.on(poGrid, cCAGridEvent.hook_name(poGrid), pfn)
	}

	static subscribe_to_ca_events(pfn){
		bean.on(document, cCAEvent.hook, pfn)
	}
}
