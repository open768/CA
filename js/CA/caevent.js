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
class cCARuleEvent extends cCABaseEvent{
	hook = "CARULEEV"
	static actions = {
		update_rule: "REUR",
		set_rule: "GESR"
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
		set_rule: "GASetRule",
		import_grid: "GEIG"
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
	static subscribe_to_action_events(psName, pfn){
		var oDummyEvent = new cCAActionEvent(psName,"dummy")
		this.#do_subscribe(oDummyEvent.hook_name(), pfn)
	}

	static subscribe_to_canvas_events(psName, pfn){
		var oDummyEvent = new cCACanvasEvent(psName,"dummy")
		this.#do_subscribe(oDummyEvent.hook_name(), pfn)
	}
	
	static subscribe_to_grid_events(psName, pfn){
		var oDummyEvent = new cCAGridEvent(psName,"dummy")
		this.#do_subscribe(oDummyEvent.hook_name(), pfn)
	}

	static subscribe_to_rule_events(psName, pfn){
		var oDummyEvent = new cCARuleEvent(psName,"dummy")
		this.#do_subscribe(oDummyEvent.hook_name(), pfn)
	}

	//***************************************************************
	static #do_subscribe(psHookName, pfn){
		if (pfn == null ) $.error("callback missing")
		bean.on(document, psHookName, pfn)
	}
}
