'use strict'
/**************************************************************************
Cellular Automata Simulator © 2013 by open768
is licensed under Attribution-NonCommercial-ShareAlike 4.0 International.
To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/
contact: https://github.com/open768/

For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk

USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

uses Jcanvas https://github.com/caleb531/jcanvas/ https://projects.calebevans.me/jcanvas/docs/

**************************************************************************/

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
class cCACanvas extends cJQueryWidgetClass {
	//#################################################################
	// # Definition
	//#################################################################
	CELL_LOAD_DELAY = 50 // fudge factor
	rows = 100
	cols = 100
	interactive = false

	grid = null
	base_name = null
	canvas = null
	cells_to_draw = 0
	cells_drawn = 0
	mouse = {
		X: 0,
		Y: 0,
		has_events: false,
		is_down: false,
	}

	last_mouse_pos = {
		row: -1,
		col: -1,
	}

	mouse_events_set = false

	//#################################################################
	// # Constructor
	// #################################################################`
	constructor(poOptions, poElement) {
		super(
			poOptions,
			poElement
		)
		// check dependencies

		if (!poOptions.base_name)
			$.error('name must be provided')

		this.interactive = poOptions.interactive

		this.rows = poOptions.rows
		this.cols = poOptions.cols
		this.base_name = poOptions.base_name
		this.cell_size = poOptions.cell_size

		// set basic stuff
		poElement.uniqueId()
		poElement.addClass('ui-widget') // css
		poElement.addClass('CACanvas') // css

		// subscribe to CAEvents (see #set_grid for subscribing to grid events)

		cCAActionEvent.subscribe(
			this.base_name,
			poEvent => this._onActionEvent(poEvent)
		)
		cCAGridEvent.subscribe(
			this.base_name,
			poEvent => this._onGridEvent(poEvent)
		)
		cCACanvasEvent.subscribe(
			this.base_name,
			poEvent => this._onCanvasEvent(poEvent)
		)
	}

	//#################################################################
	// # events
	// #################################################################`
	_onCanvasEvent(poEvent) {
		switch (poEvent.action) {
			case cCACanvasEvent.actions.import:
				if (this.canvas == null)
					$.error('canvas not initialised yet')

				cDebug.write('action: import')
				/** @type {cCAGrid} */ var oGrid = poEvent.data
				this._set_grid(oGrid)

				// clear and draw the grid
				this._on_grid_clear()
				this._drawGrid(oGrid.get_changed_cells())

				// inform subscribers
				cCARuleEvent.fire_event(
					this.base_name,
					cCARuleEvent.actions.update_rule,
					oGrid.get_rule()
				)
		}
	}

	//* ***************************************************************
	_onGridEvent(poEvent) {
		switch (poEvent.action) {
			case cCAGridEvent.notify.done:
				this._on_grid_done(poEvent.data)
				break
			case cCAGridEvent.notify.clear:
				this._on_grid_clear()
				break
			case cCAGridEvent.notify.nochange:
				var oData = poEvent.data
				if (oData == null || !oData.from_canvas)
					alert('no change detected in grid')
				break
			case cCAGridEvent.notify.repeatPattern:
				alert('repeat pattern seen')
				cCAGridEvent.fire_event(
					this.base_name,
					cCAGridEvent.actions.nochange,
					{
						from_canvas: true
					}
				)
				break
		}
	}

	//* ***************************************************************
	_onActionEvent(poEvent) {
		var oElement = this.element
		var oGrid

		cDebug.enter()
		switch (poEvent.action) {
			case cCAActionEvent.actions.ready:
				cDebug.write('action: ready')
				// associate a CA grid with the widget
				oGrid = new cCAGrid(
					this.base_name,
					this.rows,
					this.cols
				)
				this._set_grid(oGrid)
				// put something in the widget
				this._initCanvas()
				if (!this.mouse_events_set) {
					// only set #mouse event handler once
					oElement.mouseup(() => this._onMouseUp())
					oElement.mousemove(poEvent => this._onMouseMove(poEvent))
					oElement.mousedown(poEvent => this._onMouseDown(poEvent))
					this.mouse_events_set = true
				}

				break
		}

		cDebug.leave()
	}

	//* ***************************************************************
	_count_drawn_cells() {
		// update the count of cells drawn
		this.cells_drawn++

		// when all cells have been drawn, let the grid know that the cells have been consumed
		if (this.cells_drawn >= this.cells_to_draw) {
			// let the grid know that the canvas completed #drawing
			cDebug.write('finished drawing')

			setTimeout(
				// canvas needs to yield to allow image to be drawn
				() => cCAGridEvent.fire_event(
					this.base_name,
					cCAGridEvent.notify.changedCellsConsumed
				),
				this.CELL_LOAD_DELAY, // fudge factor to delay next grid cycle
			)
		}
	}

	//* ***************************************************************
	_onMouseDown(poEvent) {
		if (!this.grid)
			return

		if (!this.interactive)
			return

		this.mouse.is_down = true
		this._set_one_cell(poEvent)
	}

	//* ***************************************************************
	_onMouseMove(poEvent) {
		if (!this.interactive)
			return

		if (!this.grid)
			return

		if (!this.mouse.is_down)
			return

		this._set_one_cell(poEvent)
	}

	//* ***************************************************************
	_onMouseUp() {
		this.mouse.is_down = false
	}

	//#################################################################
	// # privates
	// #################################################################`
	_set_one_cell(poEvent) {
		if (this.grid.is_running())
			return

		var oRC = this._get_cell_rc_from_event(
			poEvent,
			true
		)
		if (oRC) {
			var oChangedCell = new cCAGridCell(
				oRC.row,
				oRC.col,
				1
			)
			cCAGridEvent.fire_event(
				this.base_name,
				cCAGridEvent.actions.set_cell,
				oChangedCell
			)
		}
	}

	//* ***************************************************************
	_get_cell_rc_from_event(poEvent, pbChangedOnly) {
		var oElement = this.element
		var X = poEvent.offsetX - cJquery.get_padding_width(oElement) + this.cell_size
		var Y = poEvent.offsetY - cJquery.get_padding_height(oElement) + this.cell_size
		var ir = Math.trunc(Y / this.cell_size) + 1
		var ic = Math.trunc(X / this.cell_size) + 1

		if (ir < 1)
			ir = 1

		if (ir > this.rows)
			ir = this.rows

		if (ic < 1)
			ic = 1

		if (ic > this.cols)
			ir = this.cols

		var oRC = null
		if (ir != this.last_mouse_pos.row || ic != this.last_mouse_pos.col) {
			this.last_mouse_pos.row = ir
			this.last_mouse_pos.col = ic
			oRC = this.last_mouse_pos
		} else if (!pbChangedOnly)
			oRC = this.last_mouse_pos

		return oRC
	}

	//* ***************************************************************
	/**
	 * @param {cCARunData} poData
	 * @returns {void}
	 */
	_on_grid_done(poData) {
		cDebug.enter()

		this._drawGrid(poData.changed_cells) // draw the changed cells

		// tell consumers about status
		cCACanvasEvent.fire_event(
			this.base_name,
			cCACanvasEvent.actions.grid_status,
			poData
		)

		cDebug.leave()
	}

	//* ***************************************************************
	_on_grid_clear() {
		cDebug.enter()

		if (this.canvas) {
			cDebug.write('Clearing canvas')
			this.canvas.clearCanvas()
		}

		cDebug.leave()
	}

	//* ***************************************************************
	_set_grid(poGrid) {
		if (this.grid !== null){
			this.grid.unsubscribe()
			this.grid = null
		}

		this.grid = poGrid

		// publish grid details to anyone interested - eg to export grid data, or start/stop the grid
		cCACanvasEvent.fire_event(
			this.base_name,
			cCACanvasEvent.actions.set_grid,
			poGrid
		)
	}

	//* ***************************************************************
	_initCanvas() {
		cDebug.enter()
		var oElement = this.element

		// create the html5 canvas to draw on
		oElement.empty()
		var oCanvas = $('<canvas>')
		oCanvas.attr(
			'width',
			this.cols * this.cell_size
		)
		oCanvas.attr(
			'height',
			this.rows * this.cell_size
		)
		oElement.append(oCanvas)
		this.canvas = oCanvas

		// initialise the grid
		cCAActionEvent.fire_event(
			this.base_name,
			cCAActionEvent.actions.grid_init,
			GRID_INIT_TYPES.block.id
		)
		cDebug.leave()
	}

	//* ***************************************************************
	/**
	 * draws the grid
	 * @param {array} paChangedCells
	 */
	_drawGrid(paChangedCells) {
		cDebug.enter()

		this.cells_drawn = 0

		var oCell
		if (!paChangedCells)
			$.error('null changed cells')

		if (paChangedCells.length == 0) {
			cDebug.warn('no changed cells - nothing to draw')
			return
		}

		for (var i = 0; i < paChangedCells.length; i++) {
			oCell = paChangedCells[i]
			this._draw_cell(oCell)
		}

		cDebug.leave()
	}

	//* ***************************************************************
	_drawFullGrid() {
		cDebug.enter()
		var oGrid = this.grid

		this.cells_to_draw = oGrid.rows * oGrid.cols
		this.cells_drawn = 0

		for (var ir = 1; ir <= oGrid.rows; ir++)
			for (var ic = 1; ic <= oGrid.cols; ic++) {
				var oCell = oGrid.getCell(
					ir,
					ic
				)
				this._draw_cell(oCell)
			}

		cDebug.leave()
	}

	//* ***************************************************************
	_draw_cell(poCell) {
		var oCanvas = this.canvas

		// -----------------coords of cell
		var iRow, iCol
		iRow = poCell.data.get(CELL_DATA_KEYS.row)
		iCol = poCell.data.get(CELL_DATA_KEYS.col)
		var iy = (iRow - 1) * this.cell_size
		var ix = (iCol - 1) * this.cell_size

		// ------------------draw
		var sFill = poCell.value == 0 ? '#fff' : '#000'
		oCanvas.drawRect({
			fillStyle: sFill,
			x: ix,
			y: iy,
			width: this.cell_size,
			height: this.cell_size,
			strokeStyle: 'transparent',
		})
		this._count_drawn_cells()
	}
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget(
	'ck.cacanvas',
	{
		options: {
			cols: 100,
			rows: 100,
			cell_size: 5,
			base_name: null,
			interactive: true,
		},

		_create: function () {
			new cCACanvas(
				this.options,
				this.element
			) // call the constructor of the class
		},
	}
)
