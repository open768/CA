//###############################################################################
class CAException {
	/**
	 * Creates an instance of CAException.
	 * @constructor
	 * @param {string} psMessage
	 */
	constructor(psMessage) {
		this.message = psMessage
		this.name = 'CAException'
	}
}

//***************************************************************************
// subclasses of cBaseEvent for specific event types - these are the events that will be fired and listened for in the app
//***************************************************************************
class cCAActionEvent extends cBaseEvent {
	static event_type_id = 'CAACTEV'
	static actions = {
		ready: 'AAready',
		grid_init: 'AAinit',
		control: 'AAcontrol'
	}
	static control_actions = {
		play: 1,
		stop: 2,
		step: 3
	}
}

//***************************************************************************

class cCARuleEvent extends cBaseEvent {
	static event_type_id = 'CARULEEV'
	static actions = {
		update_rule: 'RAupdate',
		set_rule: 'RAset'
	}
}

//###############################################################################

class cCAGridEvent extends cBaseEvent {
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

class cCACanvasEvent extends cBaseEvent {
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
