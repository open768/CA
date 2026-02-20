//#############################################################################
class cCAScrambleCanvas extends cJQueryWidgetClass {
	canvas = null
	/*
	 * this widget is responsible for drawing the contents of the underlying scrambler onto a canvas
	 */
	constructor(poOptions, poElement){
		if (!poOptions.base_name )
			$.error("base_name option is required for cascramblecanvas" )

		super(
			poOptions,
			poElement
		)
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
