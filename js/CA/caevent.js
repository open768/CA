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
	static hook = "CAEVENT"
	static types = {
		canvas: "CNV",
		action: "ACT",
		general: "GNR"
	}
	name=null
	type = null
	action = null
	data = null

	/**
	 * Description
	 * @param {string} psType
	 * @param {string} psAction
	 * @param {any} poData
	 */
	constructor(psName, psType, psAction, poData) {
		if (psType === null) throw new Error("null type")
		if (psAction === null) throw new Error("null action")
		if (psName === null) throw new Error("null name")
		this.type = psType
		this.action = psAction
		this.data = poData
		this.name = psName
	}

	static hook_name(psName) {
		return (this.hook + psName)
	}

	/**
	 * Description
	 * @param {Element} poTarget
	 */
	trigger(poTarget) {
		if (!poTarget) throw new Error("target missing")
		var sHook = cCAEvent.hook_name(this.name)
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
		init_grid: "GAini",
		step_grid: "GAstep",
		set_cell: "GASet",
		control: "GAControl",
		set_rule: "GASetRule"

	}
	static notify = {
		clear: "GNclear",
		done: "GNDone",
		changedCellsConsumed: "GNccc",
		nochange: "GNnochg",
		repeatPattern: "GNPattern"
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
	constructor(poGrid, psAction, poData=null) {
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
/* eslint-disable-next-line no-unused-vars */
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
		grid_status: "CAstatus",
		set_grid: "CASetgrid"
	}
	static notify = {
		nochange: "CNnochange"
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

	trigger() {
		var sEventName = cCACanvasEvent.hook_name(this.grid_name)
		bean.fire(document, sEventName, this)
	}

	static hook_name(psName){
		return (this.hook + psName)
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

	static subscribe_to_ca_events(psName, pfn){
		bean.on(document, cCAEvent.hook_name(psName), pfn)
	}

	static subscribe_to_canvas_events(psName, pfn){
		bean.on(document, cCACanvasEvent.hook_name(psName), pfn)
	}
}
