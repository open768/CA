"use strict"

// ##############################################################
class cScramblerOpParam{
	name = null /** @type {string} */
	max = null /** @type {number} */
	bits = null /** @type {number} */

	/**
	 *
	 * @param {string} psName
	 * @param {number} piMax
	 */
	constructor(psName, piMax){
		this.name = psName
		this.max = piMax
		this.bits = cCommon.intBitSize(piMax)
	}
}

// ##############################################################
class cScramblerOp{
	id = null	/** @type {number} */
	name = null /** @type {string} */
	params = null /** @type {Array<cScramblerOpParam>} */

	/**
	 *
	 * @param {number} piID
	 * @param {string} psName
	 * @param {Array<cScramblerOpParam>} paParams
	 */
	constructor(piID, psName, paParams){
		this.id = piID
		this.name = psName

		this.params = paParams
	}
}

/**
 * The operations that can be applied to the grid. These are the building blocks of the scrambler,
 * and are used to generate the scrambling sequence.
 *  Line – cells move along a line
 * Translate - a row or a column
 * 	Square - cells move along a predefined square
 * 	Translate cell - move a cell to another location
 * 	unzip row/col – alternating cells are moved in different directions
 * 	reflection – a block of cells flipped across an axis
 * 	transpose – swap a row with a column
 * 	skew – shift all rows or columns according to their index
 * 	block – apply the transforms to a defined block within the grid
 */
const MAX_OP_ID=7
const OP_ID_BITS = cCommon.intBitSize(MAX_OP_ID)

const OP_IDS = {
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
const OP_PARAMS = {
	ROWCOL: {
		id: 0,name: "row or col", max: 1
	},
	INDEX: {
		id: 1,name: "index", max: 200
	},
	ROW: {
		id: 1,name: "row", max: 200
	},
	COL: {
		id: 1,name: "col", max: 200
	},
	DIRECTION: {
		id: 2,name: "direction", max: 1
	},
	DISTANCE: {
		id: 3,name: "distance", max: 200
	}
}
const OP_STANDARD_PARAMS = [OP_PARAMS.ROWCOL.id, OP_PARAMS.INDEX.id, OP_PARAMS.DIRECTION.id, OP_PARAMS.DISTANCE.id]]

const OP_DEFS = [
	[OP_IDS.LINE.id , OP_STANDARD_PARAMS],
	[OP_IDS.TRANSLATE.id, OP_STANDARD_PARAMS],
	[OP_IDS.REFLECTION.id , OP_STANDARD_PARAMS],
	[OP_IDS.SQUARE.id, OP_STANDARD_PARAMS],
	[OP_IDS.UNZIP.id, OP_STANDARD_PARAMS],
	[OP_IDS.TRANSPOSE.id, [OP_PARAMS.INDEX.id, OP_PARAMS.DISTANCE.id]],
	[OP_IDS.SKEW.id, [OP_PARAMS.ROWCOL.id, OP_PARAMS.INDEX.id, OP_PARAMS.DIRECTION.id, OP_PARAMS.DISTANCE.id]],
	[OP_IDS.TRANSLATE_CELL.id, [OP_PARAMS.ROW.id,OP_PARAMS.COL.id,OP_PARAMS.ROW.id,OP_PARAMS.COL.id]],
]

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
		this._read_ops(oBitStream)
	}

	//******************************************************************
	//* private methods
	//******************************************************************
	_read_ops(poBitStream){
	}
}
