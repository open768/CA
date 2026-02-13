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
		ready: 'AAR',
		grid_init: 'AAGI',
		control: 'AAC',
	}

	static control_actions = {
		play: 1,
		stop: 2,
		step: 3,
	}
}

//* **************************************************************************

class cCARuleEvent extends cBaseEvent {
	static event_type_id = 'CARE'
	static actions = {
		update_rule: 'RAU',
		set_rule: 'RASE',
		status: 'RAST',
	}
}

//###############################################################################

class cCAGridEvent extends cBaseEvent {
	static event_type_id = 'CAGE'
	static actions = {
		init_grid: 'GAI',
		set_cell: 'GAS',
	}

	static notify = {
		clear: 'GNC',
		done: 'GND',
		changedCellsConsumed: 'GNCCC',
		nochange: 'GNNC',
		repeatPattern: 'GNRP',
	}
}

class cCACanvasEvent extends cBaseEvent {
	static event_type_id = 'CACE'
	static actions = {
		grid_status: 'CAGS',
		set_grid: 'CASG',
		import: 'CAIM',
	}
}
