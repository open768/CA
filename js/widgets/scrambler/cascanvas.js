//#############################################################################
class cCAScrambleCanvas extends cJQueryWidgetClass {
	_canvas = null /** @type {Jquery} */
	_scrambler = null /** @type {cCAScrambler} */

	/*
	 * this widget is responsible for drawing the contents of the underlying scrambler onto a canvas
	 */
	constructor(poOptions, poElement){
		if (!poOptions.base_name )
			throw new cCAScramblerException("base_name  missing" )
		if (!poOptions.rows )
			throw new cCAScramblerException("rows  missing" )
		if (!poOptions.cols )
			throw new cCAScramblerException("cols  missing" )
		if (!poOptions.cell_size )
			throw new cCAScramblerException("cell_size  missing" )

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
			[cCAScramblerEvent.actions.reset, cCAScramblerEvent.actions.draw_scrambler_grid],
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

			case cCAScramblerEvent.actions.draw_scrambler_grid:
				this._clear_canvas()
				this._draw_canvas( )
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
			throw new cCAScramblerException("canvas not initialized - ready action not received?" )

		this._canvas.clearCanvas()
	}

	//********************************************************************
	async _draw_canvas( ){
		if (!this._canvas)
			throw new cCAScramblerException("canvas not initialized - ready action not received?" )
		if (!this._scrambler)
			throw new cCAScramblerException("scrambler not initialized" )

		var oOptions = this.options
		for (var ir = 0; ir < oOptions.rows; ir++)
			for (var ic = 0; ic < oOptions.cols; ic++) {
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
	_draw_cell(piValue, piRow, piCol){
		var oOptions = this.options
		var iy = piRow * oOptions.cell_size
		var ix = piCol * oOptions.cell_size

		// ------------------draw
		var sFill = piValue ? '#000': '#fff'
		this._canvas.drawRect({
			fillStyle: sFill,
			x: ix,
			y: iy,
			width: oOptions.cell_size,
			height: oOptions.cell_size,
			strokeStyle: 'transparent',
		})
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
				throw new cCAScramblerException("base_name option is required for cascramblecanvas" )

			new cCAScrambleCanvas(
				this.options,
				this.element
			)
		},
	}
)
