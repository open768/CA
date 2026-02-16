class cScrambleWidget extends cJQueryWidgetClass {

	constructor(poOptions, poElement){
		super(poOptions, poElement)

		// check for classes
		if (typeof cCARule !== 'function')
			$.error('missing cCARule class')

		if (!bean)
			$.error('missing bean class')

		if (!poOptions.name)
			$.error('missing name')	

	}

	init(){
		var oOptions = this.options
		var oElement = this.element 

		//this container has 
		// *an input box - in which text to be scrambled can be entered
		// *an output box - in which output of the scrambler goes
		// * a rule input box - in which the rule for cellular automaata can be pasted
		// * two grids
		//   - one for the status of the scrambling
		//  - the other for the cellular auomata
		// *a button - to trigger the scrambling and descrambling
	}
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget('ck.cascrambler', {
	//#################################################################
	// # Definition
	//#################################################################
	options: {
		cols: 100,
		rows: 100,
		cell_size: 5,
		name: null,
	},

	//#################################################################
	// # Constructor
	// #################################################################`
	_create: function () {
		var oWidget = new cScrambleWidget(this.options, this.element)	
		oWidget.init()
	}
})