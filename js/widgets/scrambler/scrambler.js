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
		var oInputDiv = $('<div>', {class: 'w3-card w3-margin'})
		{
			var oHeader = $('<header>', {class: 'w3-container w3-blue'})
			{
				oHeader.append($('<h3>').text('Scrambler Input'))
				oInputDiv.append(oHeader)
			}

			var sID = cJquery.child_ID(oElement, SCRAMBLE_CONTROL_IDS.input_text_ID)
			var oInputText = $('<textarea>', {
				id: sID,
				placeholder: 'Enter text to be scrambled here'
			})
			oInputDiv.append(oInputText)

			oElement.append(oInputDiv)	
		}
		
		//------------------------------------------the rule
		var oRuleDiv = $('<div>', {class: 'w3-card w3-margin'})
		{
			var oHeader = $('<header>', {class: 'w3-container w3-blue'})
			{
				oHeader.append($('<h3>').text('Rule'))
				oRuleDiv.append(oHeader)
			}

			sID = cJquery.child_ID(oElement, SCRAMBLE_CONTROL_IDS.base64_rule_text_ID)
			var oRuleText = $('<textarea>', {
				id: sID,
				placeholder: 'rule goes here',
			})
			oRuleDiv.append(oRuleText)

			oElement.append(oRuleDiv)	
		}	

		//------------------------------------------the rule
		var oGridDiv = $('<div>', {class: 'w3-card w3-margin'})
		{
			var oHeader = $('<header>', {class: 'w3-container w3-blue'})
			{
				oHeader.append($('<h3>').text('Grids'))
				oGridDiv.append(oHeader)
			}

			var oGridContainer = $('<div>', {class: 'w3-container'})
			{
				var oLeftCell = $('<div>', {class: 'w3-cell w3-cell-top w3-container'})
				{
					oLeftCell.text("This is where the scrambling happens")
					oGridContainer.append(oLeftCell)
				}
				oGridDiv.append(oGridContainer)

				var oRightCell = $('<div>', {class: 'w3-cell w3-cell-top w3-container'})
				{
					oRightCell.text("This is where the Cellular Automata goes")
					oGridContainer.append(oRightCell)
				}
				oGridDiv.append(oGridContainer)
			}
			oElement.append(oGridDiv)
		}

		//------------------------------------------output text
		var oOutputDiv = $('<div>', {class: 'w3-card w3-margin'})
		{
			var oHeader = $('<header>', {class: 'w3-container w3-blue'})
			{
				oHeader.append($('<h3>').text('Scrambler Output'))
				oOutputDiv.append(oHeader)
			}

			var sID = cJquery.child_ID(oElement, SCRAMBLE_CONTROL_IDS.output_text_ID)
			var oOutputText = $('<textarea>', {
				id: sID,
				placeholder: 'scrambled text will appear here'
			})
			oOutputDiv.append(oOutputText)

			oElement.append(oOutputDiv)	
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