//#############################################################################
class cCAScrambleCanvas extends cJQueryWidgetClass {
	_canvas = null /** @type {Jquery} */
	_scrambler = null /** @type {cCAScrambler} */
	ACTIVE_COLOUR = "black"
	INACTIVE_COLOUR = "white"
	HILITE_COLOUR = "red"
	HILITE_DELAY_MS = 100

	/*
	 * this widget is responsible for drawing the contents of the underlying scrambler onto a canvas
	 */
	constructor(poOptions, poElement){
		if (!poOptions.base_name )
			throw new eCAScramblerException("base_name  missing" )
		if (!poOptions.rows )
			throw new eCAScramblerException("rows  missing" )
		if (!poOptions.cols )
			throw new eCAScramblerException("cols  missing" )
		if (!poOptions.cell_size )
			throw new eCAScramblerException("cell_size  missing" )

		super(
			poOptions,
			poElement
		)

		this._scrambler = new cCAScrambler(
			poOptions.base_name,
			poOptions.rows,
			poOptions.cols
		)

		cCAActionEvent.subscribe(
			poOptions.base_name,
			[cCAActionEvent.actions.ready],
			poEvent=>this.onActionEvent(poEvent)
		)
		cCAScramblerEvent.subscribe(
			poOptions.base_name,
			[cCAScramblerEvent.notify.reset, cCAScramblerEvent.notify.draw_scrambler, cCAScramblerEvent.notify.operation_complete],
			poEvent=>this.onScramblerEvent(poEvent)
		)

	}

	//***********************************************************************
	//* event handlers
	//***********************************************************************
	/**
	 * @param {cCAActionEvent} poEvent
	 */
	async onActionEvent( poEvent ){
		switch (poEvent.action) {
			case cCAActionEvent.actions.ready:
				this._init_canvas()
				break
		}
	}
	/**
	 * @param {cCAScramblerEvent} poEvent
	 */
	async onScramblerEvent( poEvent ){
		switch (poEvent.action) {
			case cCAScramblerEvent.actions.reset:
				this._clear_canvas()
				break

			case cCAScramblerEvent.notify.draw_scrambler:
				this._clear_canvas()
				this._draw_canvas( )
				break

			case cCAScramblerEvent.notify.operation_complete:
				this._draw_changes(
					poEvent.data,
					true
				)
				break
		}
	}

	//***********************************************************************
	//* internal functions
	//***********************************************************************
	_init_canvas(){
		var oOptions = this.options
		var oElement = this.element

		oElement.empty() // clear the element

		var oCanvas = $("<canvas>")
		oCanvas.attr(
			'width',
			oOptions.cols * oOptions.cell_size
		)
		oCanvas.attr(
			'height',
			oOptions.rows * oOptions.cell_size
		)
		this._canvas = oCanvas
		this._draw_canvas()

		oElement.append(this._canvas)
	}

	//********************************************************************
	_clear_canvas(){
		if (!this._canvas)
			throw new eCAScramblerException("canvas not initialized - ready action not received?" )

		this._canvas.clearCanvas()
	}

	//********************************************************************
	async _draw_canvas( ){
		if (!this._canvas)
			throw new eCAScramblerException("canvas not initialized - ready action not received?" )
		if (!this._scrambler)
			throw new eCAScramblerException("scrambler not initialized" )

		var oOptions = this.options
		for (var ir = 1; ir <= oOptions.rows; ir++)
			for (var ic = 1; ic <= oOptions.cols; ic++) {
				var iValue = this._scrambler.get(
					ir,
					ic
				)
				this._draw_cell(
					iValue,
					ir,
					ic
				)
			}

		cCAScramblerEvent.fire_event(
			this.options.base_name,
			cCAScramblerEvent.notify.consumed
		)
	}

	//********************************************************************
	/**
	 *
	 * @param {number} piValue
	 * @param {number} piRow
	 * @param {number} piCol
	 * @param {boolean} pbHighlight
	 */
	_draw_cell(piValue, piRow, piCol, pbHighlight = false){
		var oOptions = this.options
		var iy = (piRow -1)* oOptions.cell_size
		var ix = (piCol -1)* oOptions.cell_size

		// ------------------draw
		var sFill = piValue ? this.ACTIVE_COLOUR : this.INACTIVE_COLOUR
		this._canvas.drawRect({
			fillStyle: sFill,
			x: ix,
			y: iy,
			width: oOptions.cell_size,
			height: oOptions.cell_size,
			strokeStyle: 'transparent',
		})

		if (pbHighlight)
			this._canvas.drawRect({
				strokeStyle: this.HILITE_COLOUR,
				strokeWidth: 2,
				x: ix,
				y: iy,
				width: oOptions.cell_size,
				height: oOptions.cell_size,
			})

	}

	/**
	 *
	 * @param {Array<cChangedCell>} paCells
	 * @param {boolean} pbHighlight
	 */
	_draw_changes(paCells, pbHighlight ){
		//for each of the cells that changed, redraw the cell
		paCells.forEach(oCell =>
			this._draw_cell(
				oCell.value,
				oCell.row,
				oCell.col,
				true
			))

		//then after a delay redraw the cells without the highlight
		if (pbHighlight)
			setTimeout(
				()=>this._draw_changes(
					paCells,
					false
				),
				this.HILITE_DELAY_MS
			)
		else
			//fire the consumed event to indicate that the changes have been drawn
			cCAScramblerEvent.fire_event(
				this.options.base_name,
				cCAScramblerCanvasEvent.notify.consumed_changes
			)
	}

}

//#############################################################################
$.widget(
	'ck.cascramblecanvas',
	{
		options: {
			cols: 0,
			rows: 0,
			cell_size: 5,
			base_name: null
		},

		_create: function () {
			if (!this.options.base_name )
				throw new eCAScramblerException("base_name option is required for cascramblecanvas" )

			new cCAScrambleCanvas(
				this.options,
				this.element
			)
		},
	}
)
