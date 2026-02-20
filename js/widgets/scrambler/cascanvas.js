class cCAScrambleCanvas extends cJQueryWidgetClass {
}

$.widget('ck.cascramblecanvas', {
	options: {
		cols: 100,
		rows: 100,
		cell_size: 5,
		grid_name: null
	},

	_create: function () {
		new cCAScrambleCanvas(this.options, this.element) // call the constructor of the class
	},
})
