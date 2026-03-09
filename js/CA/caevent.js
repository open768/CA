//* **************************************************************************
// subclasses of cBaseEvent for specific event types - these are the events that will be fired and listened for in the app
//* **************************************************************************
class cCAActionEvent extends cBaseEvent {
	static actions = {
		ready: 'AEAR',
		grid_init: 'AEAGI',
		control: 'AEAC',
		force_grid_redraw: 'AEAFGR',
	}

	static notify = {
		import_grid: 'AENIG',
	}

	static control_actions = {
		play: "AECAP",
		stop: "AECAS1",
		step: "AECAS2",
	}
}

//* **************************************************************************

class cCARuleEvent extends cBaseEvent {
	static actions = {
		update_rule: 'REU',
		set_rule: 'RESR',
		status: 'REST',
	}
}

//###############################################################################

class cCAGridEvent extends cBaseEvent {
	static actions = {
		init_grid: 'GEI',
		set_cell: 'GES',
		get_grid: 'GEGG'
	}

	static notify = {
		clear: 'GENC',
		done: 'GEND',
		changedCellsConsumed: 'GENCC',
		allConsumersDone: 'GENCD',
		nochange: 'GENNC',
		repeatPattern: 'GENRP',
		grid: 'GEGD'
	}

	static done = {
		cells_consumed: 'GEDDCC'
	}
}

class cCACanvasEvent extends cBaseEvent {
	static actions = {
		grid_status: 'CEG',
		set_grid: 'CESG',
		import: 'CEI',
	}
}
