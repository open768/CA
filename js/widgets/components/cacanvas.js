"use strict"
/**************************************************************************
Cellular Automata Simulator © 2013 by open768 
is licensed under Attribution-NonCommercial-ShareAlike 4.0 International. 
To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/
contact: https://github.com/open768/

For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk

USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

uses Jcanvas https://github.com/caleb531/jcanvas/ https://projects.calebevans.me/jcanvas/docs/

**************************************************************************/

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCACanvas {
	//#################################################################
	//# Definition
	//#################################################################
	CELL_LOAD_DELAY = 50 //fudge factor
	rows = 100
	cols = 100
	interactive = false

	#grid = null
	#grid_name = null
	#canvas = null
	#cells_to_draw = 0
	#cells_drawn = 0
	#mouse = {
		X: 0,
		Y: 0,
		has_events: false,
		is_down: false
	}
	#last_mouse_pos = {
		row: -1,
		col: -1
	}
	#has_mouseup = false

	//#################################################################
	//# Constructor
	//#################################################################`
	constructor(poOptions, poElement) {
		//check dependencies
		if (!bean) $.error("bean class is missing! check includes")
		if (!poOptions.grid_name) $.error("name must be provided")
		this.interactive = poOptions.interactive

		this.element = poElement
		this.rows = poOptions.rows
		this.cols = poOptions.cols
		this.#grid_name = poOptions.grid_name
		this.cell_size = poOptions.cell_size

		//set basic stuff
		poElement.uniqueId()
		poElement.addClass("ui-widget")
		poElement.addClass("CACanvas")

		//subscribe to CAEvents (see #set_grid for subscribing to grid events)
		var oThis = this
		cCAEventHelper.subscribe_to_action_events( this.#grid_name, poEvent => { oThis.#onCAActionEvent(poEvent) })
		cCAEventHelper.subscribe_to_grid_events( this.#grid_name, poEvent => { oThis.#onCAGridEvent(poEvent) })
	}

	//#################################################################
	//# events
	//#################################################################`
	/**
	 * @param {cCAGridEvent} poEvent
	 */
	#onCAGridEvent(poEvent) {
		var oEvent
		switch (poEvent.action) {
			case cCAGridEvent.notify.done:
				this.#on_grid_done(poEvent.data)
				break
			case cCAGridEvent.notify.clear:
				this.#on_grid_clear()
				break
			case cCAGridEvent.notify.nochange:
				alert("no change detected in grid")
				oEvent = new cCACanvasEvent(this.#grid_name, cCACanvasEvent.notify.nochange, null)
				oEvent.trigger()
				break
			case cCAGridEvent.notify.repeatPattern:
				alert("repeat pattern seen")
				oEvent = new cCACanvasEvent(this.#grid_name, cCACanvasEvent.notify.nochange, null)
				oEvent.trigger()
				break
			case cCAGridEvent.actions.import_grid:
				cDebug.write("action: import grid")
				var oGrid = poEvent.data
				this.#set_grid(oGrid)
				//draw the grid
				this.#on_grid_clear()
				this.#drawGrid(oGrid.get_changed_cells())

				//rule has been set
				oEvent = new cCARuleEvent(this.#grid_name, cCARuleEvent.actions.update_rule, oGrid.get_rule())
				oEvent.trigger()
				break
		}
	}

	//****************************************************************
	#onCAActionEvent(poEvent) {
		var oElement = this.element
		var oThis = this
		var oGrid

		cDebug.enter()
		switch (poEvent.action) {
			case cCAActionEvent.actions.ready:
				cDebug.write("action: ready")
				//associate a CA grid with the widget
				oGrid = new cCAGrid(this.#grid_name, this.rows, this.cols)
				this.#set_grid(oGrid)
				//put something in the widget
				this.#initCanvas()
				if (!this.#has_mouseup) { //only set #mouse event handler once
					oElement.mouseup(function () { oThis.#onMouseUp() })
					oElement.mousemove(function (poEvent) { oThis.#onMouseMove(poEvent) })
					oElement.mousedown(function (poEvent) { oThis.#onMouseDown(poEvent) })
					this.#has_mouseup = true
				}
				break
		}
		cDebug.leave()
	}

	//****************************************************************
	#count_drawn_cells(){
		//update the count of cells drawn
		this.#cells_drawn++
		var oThis = this

		// when all cells have been drawn, let the grid know that the cells have been consumed
		if (this.#cells_drawn >= this.#cells_to_draw) {
			//let the grid know that the canvas completed #drawing
			cDebug.write("finished drawing")

			setTimeout(				//canvas needs to yield to allow image to be drawn
				function () { 
					var oEvent = new cCAGridEvent(oThis.#grid_name, cCAGridEvent.notify.changedCellsConsumed);
					oEvent.trigger()
				}, 	
				this.CELL_LOAD_DELAY		//fudge factor to delay next grid cycle
			)	
		}
	}

	//****************************************************************
	#onMouseDown(poEvent) {
		if (!this.#grid) return
		if (!this.interactive) return

		this.#mouse.is_down = true
		this.#set_one_cell(poEvent)
	}

	//****************************************************************
	#onMouseMove(poEvent) {
		if (!this.interactive) return
		if (!this.#grid) return
		if (!this.#mouse.is_down) return
		
		this.#set_one_cell(poEvent)
	}

	//****************************************************************
	#onMouseUp() {
		this.#mouse.is_down = false
	}

	//#################################################################
	//# privates
	//#################################################################`
	#set_one_cell(poEvent) {
		if (this.#grid.is_running()) return

		var oRC = this.#get_cell_rc_from_event(poEvent, true)
		if (oRC) {
			var oChangedCell = new cCAGridCell(oRC.row, oRC.col, 1)
			var oEvent = new cCAGridEvent(this.#grid_name, cCAGridEvent.actions.set_cell, oChangedCell)
			oEvent.trigger()
		}
	}

	//****************************************************************
	#get_cell_rc_from_event(poEvent, pbChangedOnly) {
		var oElement = this.element
		var X = poEvent.offsetX - cJquery.get_padding_width(oElement) + this.cell_size
		var Y = poEvent.offsetY - cJquery.get_padding_height(oElement) + this.cell_size
		var ir = Math.trunc(Y / this.cell_size) + 1
		var ic = Math.trunc(X / this.cell_size) + 1

		if (ir < 1) ir = 1
		if (ir > this.rows) ir = this.rows
		if (ic < 1) ic = 1
		if (ic > this.cols) ir = this.cols

		var oRC = null
		if (ir != this.#last_mouse_pos.row || ic != this.#last_mouse_pos.col) {
			this.#last_mouse_pos.row = ir
			this.#last_mouse_pos.col = ic
			oRC = this.#last_mouse_pos
		} else if (!pbChangedOnly)
			oRC = this.#last_mouse_pos
		return oRC
	}

	//****************************************************************
	/**
	 * Description
	 * @param {cCAGridRunData} poData
	 * @returns {any}
	 */
	#on_grid_done(poData) {
		cDebug.enter()

		this.#drawGrid(poData.changed_cells)	//draw the changed cells

		//tell consumers about status
		var oEvent = new cCACanvasEvent(this.#grid_name, cCACanvasEvent.actions.grid_status, poData)
		oEvent.trigger()

		cDebug.leave()
	}

	//****************************************************************
	#on_grid_clear() {
		cDebug.enter()

		if (this.#canvas) {
			cDebug.write("Clearing canvas")
			this.#canvas.clearCanvas()
		}

		cDebug.leave()
	}

	//****************************************************************
	#set_grid(poGrid) {
		this.#grid = poGrid

		// publish grid details to anyone interested - eg to export grid data, or start/stop the grid
		var oEvent = new cCACanvasEvent(this.#grid_name, cCACanvasEvent.actions.set_grid, poGrid)
		oEvent.trigger()
	}

	//****************************************************************
	#initCanvas() {
		cDebug.enter()
		var oElement = this.element


		//create the html5 canvas to draw on
		oElement.empty()
		var oCanvas = $("<canvas>")
		oCanvas.attr("width", this.cols * this.cell_size)
		oCanvas.attr("height", this.rows * this.cell_size)
		oElement.append(oCanvas)
		this.#canvas = oCanvas

		//initialise the grid
		var oEvent = new cCAActionEvent(this.#grid_name, cCAActionEvent.actions.grid_init, cCAGridTypes.init.block.id)
		oEvent.trigger()
		cDebug.leave()
	}

	//****************************************************************
	/**
	 * draws the grid
	 * @param {array} paChangedCells
	 */
	#drawGrid(paChangedCells) {
		cDebug.enter()

		this.#cells_drawn = 0

		var oCell
		if (!paChangedCells) $.error("null changed cells")
		if (paChangedCells.length == 0) {
			cDebug.warn("no changed cells - nothing to draw")
			return
		}

		for (var i = 0; i < paChangedCells.length; i++) {
			oCell = paChangedCells[i]
			this.#draw_cell(oCell)
		}
		cDebug.leave()
	}

	//****************************************************************
	#drawFullGrid() {
		cDebug.enter()
		var oGrid = this.#grid

		this.#cells_to_draw = oGrid.rows * oGrid.cols
		this.#cells_drawn = 0

		for (var ir = 1; ir <= oGrid.rows; ir++) {
			for (var ic = 1; ic <= oGrid.cols; ic++) {
				var oCell = oGrid.getCell(ir, ic)
				this.#draw_cell(oCell)
			}
		}
		cDebug.leave()
	}

	//****************************************************************
	#draw_cell(poCell) {
		var oCanvas = this.#canvas


		//-----------------coords of cell
		var iRow, iCol
		iRow = poCell.data.get(cCACellTypes.hash_values.row)
		iCol = poCell.data.get(cCACellTypes.hash_values.col)
		var iy = (iRow - 1) * this.cell_size
		var ix = (iCol - 1) * this.cell_size

		//------------------draw
		var sFill = (poCell.value == 0 ? '#fff'  : '#000')
		oCanvas.drawRect({
			fillStyle: sFill,
			x: ix, y: iy,
			width: this.cell_size,
			height: this.cell_size,
			strokeStyle: "transparent"				
		})
		this.#count_drawn_cells()
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget("ck.cacanvas", {
	options: {
		cols: 100,
		rows: 100,
		cell_size: 5,
		grid_name: null,
		interactive: true
	},

	_create: function () {
		new cCACanvas(this.options, this.element)		//call the constructor of the class
	}
})
