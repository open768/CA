const SCRAMBLE_CONTROL_IDS = {
	input_text_ID: 'txi',
	output_text_ID: 'txo',
	base64_rule_text_ID: 'txr',
}

class cScrambleWidget extends cJQueryWidgetClass {

	constructor(poOptions, poElement){
		super(poOptions, poElement)

		// check for classes
		if (!bean)
			$.error('missing bean class')

		if (!poOptions.name)
			$.error('missing name')	

	}

	//this container has 
	// *an input box - in which text to be scrambled can be entered
	// *an output box - in which output of the scrambler goes
	// * a rule input box - in which the rule for cellular automaata can be pasted
	// * two grids
	//   - one for the status of the scrambling
	//  - the other for the cellular auomata
	// *a button - to trigger the scrambling and descrambling
	init(){
		var oOptions = this.options
		var oElement = this.element 

		//------------------------------------------input text
		var oInputDiv = $('<div>', {class: 'w3-card'})
		{
			var oHeader = $('<header>', {class: 'w3-container w3-blue'})
			oHeader.append($('<h3>').text('Scrambler Input'))
			oInputDiv.append(oHeader)

			var oInputText = $('<textarea>', {
				id: SCRAMBLE_CONTROL_IDS.input_text_ID,
				placeholder: 'Enter text to be scrambled here'
			})
			oInputDiv.append(oInputText)
			oElement.append(oInputDiv)	
		}
		

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