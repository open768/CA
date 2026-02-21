//#############################################################################
class cCAScrambleCanvas extends cJQueryWidgetClass {
	canvas = null /** @type {Jquery} */
	rows = 100
	cols = 100
	_scrambler = null /** @type {cCAScrambler} */

	/*
	 * this widget is responsible for drawing the contents of the underlying scrambler onto a canvas
	 */
	constructor(poOptions, poElement){
		if (!poOptions.base_name )
			$.error("base_name  missing" )
		if (!poOptions.rows )
			$.error("rows  missing" )
		if (!poOptions.cols )
			$.error("cols  missing" )
		if (!poOptions.cell_size )
			$.error("cell_size  missing" )

		super(
			poOptions,
			poElement
		)

		this.rows = poOptions.rows
		this.cols = poOptions.cols
		this._scrambler = new cCAScrambler(
			poOptions.base_name,
			poOptions.rows,
			poOptions.cols
		)

		cCAActionEvent.subscribe(
			poOptions.base_name,
			poEvent=>this.onActionEvent(poEvent)
		)
		cCAScramblerEvent.subscribe(
			poOptions.base_name,
			poEvent=>this.onScramblerEvent(poEvent)
		)

	}

	//***********************************************************************
	//* event handlers
	//***********************************************************************
	/**
	 * @param {cCAActionEvent} poEvent
	 */
	onActionEvent( poEvent ){
		switch (poEvent.action) {
			case cCAActionEvent.actions.ready:
				this._init_canvas()
				break
		}
	}
	/**
	 * @param {cCAScramblerEvent} poEvent
	 */
	onScramblerEvent( poEvent ){
		switch (poEvent.action) {
			case cCAScramblerEvent.actions.set_input:
				//populate the canvas and redraw
				$.error("not implemented - set_input event received" )
				this._scrambler.set_plaintext(poEvent.data)
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
		this.canvas = oCanvas
		this._draw_canvas()

		oElement.append(this.canvas)
	}

	_draw_canvas(){
		if (!this.canvas)
			$.error("canvas not initialized - ready action not received?" )
	}
}

//#############################################################################
$.widget(
	'ck.cascramblecanvas',
	{
		options: {
			cols: 100,
			rows: 100,
			cell_size: 5,
			base_name: null
		},

		_create: function () {
			if (!this.options.base_name )
				$.error("base_name option is required for cascramblecanvas" )
			new cCAScrambleCanvas(
				this.options,
				this.element
			) // call the constructor of the class
		},
	}
)
