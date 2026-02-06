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
		if (typeof bean === 'undefined') $.error('bean library is missing')

		if (this.constructor === cCABaseEvent) $.error('cCABaseEvent is abstract')
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
		cDebug.write('event>> grid:"' + this.grid_name + '" type:' + this.constructor.name + ' action:' + this.action)
		bean.fire(document, sEventName, this)
	}

	static async fire_event(psGridName, psAction, poData = null) {
		if (this === cCABaseEvent) throw new CAException('cCABaseEvent is abstract')
		if (!psGridName) throw new CAException('grid name is required')
		if (!psAction) throw new CAException('action is required')

		var oEvent = new this(psGridName, psAction, poData) //create specific instance
		oEvent.trigger()
	}

	static async subscribe(psGridName, pfnCallback) {
		if (this === cCABaseEvent) throw new CAException('cCABaseEvent is abstract')
		if (typeof pfnCallback !== 'function') throw new CAException('callback must be a function')
		if (!psGridName) throw new CAException('grid name is required')

		var oEvent = new this(psGridName, 'dummy') //create an event to get the channel ID
		bean.on(document, oEvent.channel_id(), pfnCallback)
	}
}

//***************************************************************************
// subclasses of cCABaseEvent for specific event types - these are the events that will be fired and listened for in the app
//***************************************************************************
class cCAActionEvent extends cCABaseEvent {
	static event_type_id = 'CAACTEV'
	static actions = {
		ready: 'AAready',
		grid_init: 'AAinit',
		control: 'AAcontrol'
	}
}

//***************************************************************************

class cCARuleEvent extends cCABaseEvent {
	static event_type_id = 'CARULEEV'
	static actions = {
		update_rule: 'RAupdate',
		set_rule: 'RAset'
	}
}

//###############################################################################

class cCAGridEvent extends cCABaseEvent {
	static event_type_id = 'CAGRIDEV'
	static actions = {
		init_grid: 'GAini',
		set_cell: 'GASet'
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
		set_grid: 'CAset',
		import_grid: 'CAimport'
	}
	static notify = {
		nochange: 'CNnochange'
	}
}
