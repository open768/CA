"use strict"
/**************************************************************************
Cellular Automata Simulator © 2013 by open768 
is licensed under Attribution-NonCommercial-ShareAlike 4.0 International. 
To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/
contact: https://github.com/open768/

For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk

USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cCACanvasTypes {
	static white_image = "images/whitebox.png"
	static black_image = "images/blackbox.png"
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCACanvas {
	//#################################################################
	//# Definition
	//#################################################################
	GRID_STEP_DELAY = 30 //more for 
	rows = 100
	cols = 100
	interactive = false
	draw_images = true

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
		cCAEventHelper.subscribe_to_ca_events( this.#grid_name, (poEvent) => { oThis.#onCAEvent(poEvent) })
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
		}
	}

	//****************************************************************
	#onCAEvent(poEvent) {
		var oElement = this.element
		var oThis = this
		var oGrid,oEvent

		cDebug.enter()

		switch (poEvent.type) {
			//----------------------------------------------------------------------
			case cCAEvent.types.action:
				cDebug.write("event: action")
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

					//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
					case cCAActionEvent.actions.grid_init:
						cDebug.write("event: initialise")
						var iInitType = poEvent.data
						oEvent = new cCAGridEvent(this.#grid, cCAGridEvent.actions.init_grid, iInitType)
						oEvent.trigger()
						break

					//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
					case cCAActionEvent.actions.control:
						cDebug.write("event: action")
						oEvent = new cCAGridEvent(this.#grid, cCAGridEvent.actions.control, poEvent.data)
						oEvent.trigger()
						break
				}
				break
			//----------------------------------------------------------------------
			case cCAEvent.types.general:
				cDebug.write("event: general")
				switch (poEvent.action) {
					case cCAGeneralEvent.actions.import_grid:
						cDebug.write("action: import grid")
						oGrid = poEvent.data
						this.#set_grid(oGrid)
						//draw the grid
						this.#on_grid_clear()
						this.#drawGrid()

						//rule has been set
						oEvent = new cCAEvent(this.#grid_name, cCAEvent.types.rule, cCARuleEvent.actions.update_rule, oGrid.rule)
						oEvent.trigger(document)
						break

					//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
					case cCAGeneralEvent.actions.set_rule:
						cDebug.write("action: set rule")
						oEvent = new cCAGridEvent(this.#grid, cCAGridEvent.actions.set_rule, poEvent.data)
						oEvent.trigger()
						break
				}
				break

		}
		cDebug.leave()
	}

	//****************************************************************
	#onCellDrawn() {
		//update the count of cells drawn
		this.#cells_drawn++

		if (this.#cells_drawn >= this.#cells_to_draw) {
			//let the grid know that the canvas completed #drawing
			cDebug.write("finished drawing")
			var oGrid = this.#grid

			setTimeout(				//canvas needs to yield
				function () { 
					var oEvent = new cCAGridEvent(oGrid, cCAGridEvent.notify.changedCellsConsumed);
					oEvent.trigger()
				}, 
				this.GRID_STEP_DELAY
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
			var oEvent = new cCAGridEvent(this.#grid, cCAGridEvent.actions.set_cell, oChangedCell)
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

		this.#drawGrid(poData.changed_cells)

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
		var oThis = this
		this.#grid = poGrid

		//subscribe to grid events
		cCAEventHelper.subscribe_to_grid_events(this.#grid, (poEvent)=>{oThis.#onCAGridEvent(poEvent)})

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
		var oEvent = new cCAGridEvent(this.#grid, cCAGridEvent.actions.init_grid, cCAGridTypes.init.block.id)
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
		var oThis = this
		var oCanvas = this.#canvas

		//-----------------what img to use
		var sImg = (poCell.value == 0 ? cCACanvasTypes.white_image : cCACanvasTypes.black_image)

		//-----------------coords of cell
		var iRow, iCol
		iRow = poCell.data.get(cCACellTypes.hash_values.row)
		iCol = poCell.data.get(cCACellTypes.hash_values.col)
		var iy = (iRow - 1) * this.cell_size
		var ix = (iCol - 1) * this.cell_size

		//------------------draw
		//its faster to blit images than it is to draw vectors
		if (this.draw_images)
			oCanvas.drawImage({
				source: sImg, 
				x: ix, 
				y: iy,
				fromCenter: false, 
				load() { oThis.#onCellDrawn() }
			})
		else{

		}
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
