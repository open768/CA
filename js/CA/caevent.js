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

//***************************************************************************
class cCABaseEvent{
	grid_name = null
	action = null
	data = null
	hook = "***NOT SET***"

	constructor(psGridName, psAction, poData = null) {
		if (!psGridName || !psAction) $.error("incorrect number of arguments")
		this.grid_name = psGridName
		this.action = psAction
		this.data = poData
	}

	hook_name(){
		return (this.hook + this.grid_name)
	}

	trigger() {
		var sEventName = this.hook_name()
		bean.fire(document, sEventName, this)
	}
}

//***************************************************************************
/* eslint-disable-next-line no-unused-vars */
class cCAActionEvent extends cCABaseEvent{
	hook = "CAACTEV"
	static actions = {
		ready: "AERD",
		grid_init: "AEGI",
		control: "AECN"
	}
}

//***************************************************************************
/* eslint-disable-next-line no-unused-vars */
class cCAGeneralEvent extends cCABaseEvent{
	hook = "CAGENEV"
	static actions = {
		import_grid: "GEIG",
		set_rule: "GESR"
	}
}

//***************************************************************************
/* eslint-disable-next-line no-unused-vars */
class cCARuleEvent extends cCABaseEvent{
	hook = "CARULEEV"
	static actions = {
		update_rule: "REUR"
	}
}


//###############################################################################
/* eslint-disable-next-line no-unused-vars */
class cCAGridEvent extends cCABaseEvent{
	hook = "CAGRIDEV"
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
}


/* eslint-disable-next-line no-unused-vars */
class cCACanvasEvent extends cCABaseEvent{
	hook = "CACANVASEV"
	static actions = {
		grid_status: "CAstatus",
		set_grid: "CASetgrid"
	}
	static notify = {
		nochange: "CNnochange"
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
	static subscribe_to_grid_events(psName, pfn){
		var oDummyEvent = new cCAGridEvent(psName,"dummy")
		bean.on(document, oDummyEvent.hook_name(), pfn)
	}

	static subscribe_to_ca_events(psName, pfn){
		bean.on(document, cCAEvent.hook_name(psName), pfn)
	}

	static subscribe_to_canvas_events(psName, pfn){
		var oDummyEvent = new cCACanvasEvent(psName,"dummy")
		bean.on(document, oDummyEvent.hook_name(), pfn)
	}
	
	static subscribe_to_rule_events(psName, pfn){
		var oDummyEvent = new cCARuleEvent(psName,"dummy")
		bean.on(document, oDummyEvent.hook_name(), pfn)
	}
}
