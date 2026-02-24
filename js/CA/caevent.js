class CAEventSubscriber {
	/** @type {boolean} */ active = true
	unsubscribe() {
		this.active = false
	}
}

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

//* **************************************************************************
// subclasses of cBaseEvent for specific event types - these are the events that will be fired and listened for in the app
//* **************************************************************************
class cCAActionEvent extends cBaseEvent {
	static event_type_id = 'CAAE'
	static actions = {
		ready: 'AER',
		grid_init: 'AEGI',
		control: 'AEC',
	}

	static control_actions = {
		play: "AEA",
		stop: "AEB",
		step: "AEC",
	}
}

//* **************************************************************************

class cCARuleEvent extends cBaseEvent {
	static event_type_id = 'CARE'
	static actions = {
		update_rule: 'REU',
		set_rule: 'RESR',
		status: 'REST',
	}
}

//###############################################################################

class cCAGridEvent extends cBaseEvent {
	static event_type_id = 'CAGE'
	static actions = {
		init_grid: 'GEI',
		set_cell: 'GES',
	}

	static notify = {
		clear: 'GENC',
		done: 'GEND',
		changedCellsConsumed: 'GENCC',
		nochange: 'GENNC',
		repeatPattern: 'GENRP',
	}
}

class cCACanvasEvent extends cBaseEvent {
	static event_type_id = 'CACE'
	static actions = {
		grid_status: 'CEG',
		set_grid: 'CESG',
		import: 'CEI',
	}
}
