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
	grid_name = null					//grid name is used
	action = null
	data = null
	#event_type_id = "***NOT SET***"				//this is an abstract property

	constructor(psGridName, psAction, poData = null) {
		if (!psGridName || !psAction) $.error("incorrect number of arguments")
		this.grid_name = psGridName
		this.action = psAction
		this.data = poData
	}

	/**
	 * @return {*} 
	 * @memberof cCABaseEvent
	 */
	channel_id(){
		return (this.event_type_id + this.grid_name) //creates a unique ID for a specific grid
	}

	async trigger() {
		var sEventName = this.channel_id()
		bean.fire(document, sEventName, this)
	}
}

//***************************************************************************
/* eslint-disable-next-line no-unused-vars */
class cCAActionEvent extends cCABaseEvent{
	#event_type_id = "CAACTEV"
	static actions = {
		ready: "AERD",
		grid_init: "AEGI",
		control: "AECN"
	}
}


//***************************************************************************
/* eslint-disable-next-line no-unused-vars */
class cCARuleEvent extends cCABaseEvent{
	#event_type_id = "CARULEEV"
	static actions = {
		update_rule: "REUR",
		set_rule: "GESR"
	}
}


//###############################################################################
/* eslint-disable-next-line no-unused-vars */
class cCAGridEvent extends cCABaseEvent{
	#event_type_id = "CAGRIDEV"
	static actions = {
		init_grid: "GAini",
		set_cell: "GASet",
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
	#event_type_id = "CACANVASEV"
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
	static #dummy_action = "dummy"

	static subscribe_to_action_events(psGridName, pfnCallback){
		var oEvent = new cCAActionEvent(psGridName, this.#dummy_action) //create an event to get the channel ID
		this._do_subscribe(oEvent.channel_id(), pfnCallback)
	}

	static subscribe_to_canvas_events(psGridName, pfnCallback){
		var oEvent = new cCACanvasEvent(psGridName,this.#dummy_action)
		this._do_subscribe(oEvent.channel_id(), pfnCallback)
	}
	
	static subscribe_to_grid_events(psGridName, pfnCallback){
		var oEvent = new cCAGridEvent(psGridName,this.#dummy_action)
		this._do_subscribe(oEvent.channel_id(), pfnCallback)
	}

	static subscribe_to_rule_events(psGridName, pfnCallback){
		var oEvent = new cCARuleEvent(psGridName,this.#dummy_action)
		this._do_subscribe(oEvent.channel_id(), pfnCallback)
	}

	//***************************************************************
	static _do_subscribe(psChannelID, pfnCallback){
		if (pfnCallback == null ) $.error("callback missing")
		bean.on(document, psChannelID, pfnCallback)
	}
}
