"use strict"

class cScramblerOpReader extends cEventSubscriber{
	basename = null
	_ops = null

	constructor(psBaseName){
		super()
		this.basename = psBaseName
		cCAGridEvent.subscribe(
			this.basename,
			[cCAGridEvent.notify.grid],
			poEvent =>this.onGridEvent(poEvent)
		)

	}

	//******************************************************************
	//* public methods
	//******************************************************************
	import_grid(){
		//fire the event to get the data from the grid
		cCAGridEvent.fire_event(
			this.basename,
			cCAGridEvent.actions.get_grid
		)

	}

	//******************************************************************
	//* Events
	//******************************************************************
	async onGridEvent(poEvent){
		switch (poEvent.action){
			case cCAGridEvent.notify.grid:
				cDebug.write("got grid data, now convert to operations")
				var oGrid = poEvent.data /** @type {cCAGrid} */
				this._on_got_grid(oGrid)

		}
	}

	/** *****************************************************************
	 *
	 * @param {cCAGrid} poGrid
	 */
	_on_got_grid(poGrid){
		//check class is correct
		if (!(poGrid instanceof cCAGrid))
			throw new cCAScramblerException("grid data is not cCAGrid")

		//convert the grid to binary
		var oBitStream = cCAGridBitStreamExporter.get_grid_bitstream(poGrid)
	}

	//******************************************************************
	//* private methods
	//******************************************************************
}
