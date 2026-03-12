"use strict"

//############################################################
//# initialise the operations and their parameters.
//############################################################
/**
 * The operations that can be applied to the grid. These are the building blocks of the scrambler,
 * TODO:they are simple (to show the concept) and could be replaced by more complex operations in the future.
 *
 * and are used to generate the scrambling sequence.
 *  Line – cells move along a line
 * Translate - a row or a column
 * 	Square - cells move along a predefined square
 * 	Translate cell - move a cell to another location
 * 	unzip row/col – alternating cells are moved in different directions
 * 	reflection – a block of cells flipped across an axis
 * 	transpose – swap a row with a column
 * 	skew – shift all rows or columns according to their index
 * 	TODO: block – apply the transforms to a defined block within the grid
 */
class cOpDefs extends cStaticClass{
	static IDS = null
	static PARAMS = null
	static DEFS = null
	static MAX_OP_ID = -1
	static OP_ID_BITS = -1

	//*********************************************************************
	static init(){
		this.IDS = {
			LINE: {
				id: 0, name: "line"
			},
			TRANSLATE: {
				id: 1, name: "translate"
			},
			SQUARE: {
				id: 2, name: "square"
			},
			TRANSLATE_CELL: {
				id: 3, name: "translate_cell"
			},
			UNZIP: {
				id: 4, name: "unzip"
			},
			REFLECTION: {
				id: 5, name: "reflection"
			},
			TRANSPOSE: {
				id: 6, name: "transpose"
			},
			SKEW: {
				id: 7, name: "skew"
			},
			/* TODO: phase 2 - implement block operations
				BLOCK: {
					id: 8, name: "block"
				}
			*/
		}

		//---------------------------------------------------------------------
		this.MAX_OP_ID = this.IDS.SKEW.id
		this.OP_ID_BITS = cCommon.intBitSize(this.MAX_OP_ID)

		//---------------------------------------------------------------------
		this.PARAMS = {
			ROWCOL: {
				id: 0,name: "row or col", max: 1
			},
			INDEX: {
				id: 1,name: "index", max: 200
			},
			ROW: {
				id: 2,name: "row", max: 200
			},
			COL: {
				id: 3,name: "col", max: 200
			},
			DIRECTION: {
				id: 4,name: "direction", max: 1
			},
			DISTANCE: {
				id: 5,name: "distance", max: 200
			}
		}

		//---------------------------------------------------------------------
		var aStandardParams = [
			this.PARAMS.ROWCOL.id,
			this.PARAMS.INDEX.id,
			this.PARAMS.DIRECTION.id,
			this.PARAMS.DISTANCE.id
		]

		//---------------------------------------------------------------------
		this.DEFS = new Map([
			[this.IDS.LINE.id, aStandardParams],
			[this.IDS.TRANSLATE.id, aStandardParams],
			[this.IDS.REFLECTION.id, aStandardParams],
			[this.IDS.SQUARE.id, aStandardParams],
			[this.IDS.UNZIP.id, aStandardParams],
			[this.IDS.TRANSPOSE.id, [this.PARAMS.INDEX.id, this.PARAMS.DISTANCE.id]],
			[this.IDS.SKEW.id, [this.PARAMS.ROWCOL.id, this.PARAMS.INDEX.id, this.PARAMS.DIRECTION.id, this.PARAMS.DISTANCE.id]],
			[this.IDS.TRANSLATE_CELL.id, [this.PARAMS.ROW.id, this.PARAMS.COL.id, this.PARAMS.ROW.id, this.PARAMS.COL.id]]
		])
	}
}
cOpDefs.init()

//############################################################
//#
//############################################################
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
		/** @type {jsbitstream} */ var oBitStream = cCAGridBitStreamExporter.get_grid_bitstream(poGrid)
		this._read_ops(oBitStream)
	}

	//******************************************************************
	//* private methods
	//******************************************************************
	/**
	 *
	 * @param {jsbitstream} poBitStream
	 */
	_read_ops(poBitStream){
	}
}
