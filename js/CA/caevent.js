//###############################################################################
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
class cCABaseEvent {
	grid_name = null //grid name is used to create a
	action = null
	data = null
	/**
	 * @abstract
	 * @type {string}
	 */
	static event_type_id = null // this is an abstract property

	/**
	 * Creates a new CA event instance.
	 *
	 * @param {string} psGridName - The grid name associated with the event.
	 * @param {string} psAction - The action type for the event.
	 * @param {*} [poData=null] - Optional payload for the event.
	 * @throws {Error} If required arguments are missing or the class does not override event_type_id.
	 */
	constructor(psGridName, psAction, poData = null) {
		if (!psGridName || !psAction) $.error('incorrect number of arguments')

		// @ts-expect-error
		if (!this.constructor.event_type_id) $.error('event_type_id not overridden in class:' + this.constructor.name)

		this.grid_name = psGridName
		this.action = psAction
		this.data = poData
	}

	/**
	 * @return {*}
	 * @memberof cCABaseEvent
	 */
	channel_id() {
		// @ts-expect-error
		return this.constructor.event_type_id + this.grid_name //creates a unique ID for a specific grid
	}

	async trigger() {
		var sEventName = this.channel_id()
		bean.fire(document, sEventName, this)
	}

	static async fire_event(psGridName, psAction, poData = null) {
		var oEvent = new this(psGridName, psAction, poData)
		oEvent.trigger()
	}

	static async subscribe(psGridName, pfnCallback) {
		var oEvent = new this(psGridName, 'dummy') //create an event to get the channel ID
		bean.on(document, oEvent.channel_id(), pfnCallback)
	}
}

//***************************************************************************

class cCAActionEvent extends cCABaseEvent {
	static event_type_id = 'CAACTEV'
	static actions = {
		ready: 'AERD',
		grid_init: 'AEGI',
		control: 'AECN'
	}
}

//***************************************************************************

class cCARuleEvent extends cCABaseEvent {
	static event_type_id = 'CARULEEV'
	static actions = {
		update_rule: 'REUR',
		set_rule: 'GESR'
	}
}

//###############################################################################

class cCAGridEvent extends cCABaseEvent {
	static event_type_id = 'CAGRIDEV'
	static actions = {
		init_grid: 'GAini',
		set_cell: 'GASet',
		import_grid: 'GEIG'
	}
	static notify = {
		clear: 'GNclear',
		done: 'GNDone',
		changedCellsConsumed: 'GNccc',
		nochange: 'GNnochg',
		repeatPattern: 'GNPattern'
	}
}

class cCACanvasEvent extends cCABaseEvent {
	static event_type_id = 'CACANVASEV'
	static actions = {
		grid_status: 'CAstatus',
		set_grid: 'CASetgrid'
	}
	static notify = {
		nochange: 'CNnochange'
	}
}
