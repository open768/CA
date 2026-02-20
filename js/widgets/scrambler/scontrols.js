const SCRAMBLE_CONTROL_IDS = {
	input_text_ID: 'a',
	input_steps_ID: 'b',
	output_text_ID: 'c',
	rule_text_id: 'd',
}
const SCRAMBLE_CONSTS={
	MAX_INPUT_LENGTH: null,
	GRID_ROWS: 100,
	GRID_COLS: 100,
	CELL_SIZE: 5,
	BAD_INPUT_COLOUR: 'red',
	MIN_STEPS: 5,
	MAX_STEPS: 100
}

//#############################################################################
//#############################################################################
class cScrambleWidget extends cJQueryWidgetClass {

	constructor(poOptions, poElement){
		super(poOptions, poElement)

		if (!poOptions.name)
			$.error('missing name')

	}

	//*************************************************************************
	//* rendering
	//*************************************************************************
	render(){
		this._render_inputs()
		this._render_rule()
		this._render_grids()
		this._render_outputs()
		this._render_importer()

		var sName = this.options.name
		cCAGridEvent.subscribe( sName, poEvent => this.onGridEvent(poEvent))
		cCACanvasEvent.subscribe( sName, poEvent => this.onCanvasEvent(poEvent))
		cCARuleEvent.subscribe( sName,	 poEvent => this.onRuleEvent(poEvent))

		cCAActionEvent.fire_event(sName, cCAActionEvent.actions.ready)	// sent ready event
	}

	//*************************************************************************
	/**
	 * the grid area shows the current state of the scrambled data and the
	 * cellular automata from where the scrambling rules are read
	 */

	_render_grids(){
		var oElement = this.element
		var oOptions = this.options
		//------------------------------------------grids
		var oGridDiv = $('<div>', {class: 'w3-card w3-margin'})
		{
			var oHeader = $('<header>', {class: 'w3-container w3-blue'})
			{
				oHeader.append($('<h3>').text('Grids'))
				oGridDiv.append(oHeader)
			}

			var oGridContainer = $('<div>', {class: 'w3-container'})
			{
				// the left grid shows the scrambled data,
				var oLeftCell = $('<div>', {class: 'w3-cell w3-cell-top w3-container'})
				{
					oLeftCell.text("This is where the scrambling happens")
					oGridContainer.append(oLeftCell)
				}

				oGridDiv.append(oGridContainer)

				//the right grid shows the cellular automata from where the scrambling rules are read
				var oRightCell = $('<div>', {class: 'w3-cell w3-cell-top w3-container'})
				{
					var oCanvasSpan = $('<SPAN>', {
						title: 'cellular automata grid - this is where the instructions are read from'
					})
					{
						oCanvasSpan.cacanvas({base_name: oOptions.name, cols: SCRAMBLE_CONSTS.GRID_COLS, rows: SCRAMBLE_CONSTS.GRID_ROWS, cell_size: SCRAMBLE_CONSTS.CELL_SIZE})
						oRightCell.append(oCanvasSpan)
					}

					oGridContainer.append(oRightCell)
				}

				oGridDiv.append(oGridContainer)
			}

			oElement.append(oGridDiv)
		}
	}

	//*************************************************************************
	/*
		the rule text is readonly, it is displayed for info only.
		the user can change the rule by importing it from index.html
	*/
	_render_rule(){
		var oElement = this.element
		//------------------------------------------the rule
		var oRuleDiv = $('<div>', {class: 'w3-card w3-margin'})
		{
			var oHeader = $('<header>', {class: 'w3-container w3-blue'})
			{
				oHeader.append($('<h3>').text('Rule'))
				oRuleDiv.append(oHeader)
			}

			var sID = cJquery.child_ID(oElement, SCRAMBLE_CONTROL_IDS.rule_text_id)
			var oRuleText = $('<textarea>', {
				id: sID,
				placeholder: 'rule goes here',
				rows: 1,
				style: "width: 100%",
				disabled: true
			})
			oRuleDiv.append(oRuleText)

			oElement.append(oRuleDiv)
		}
	}

	//*************************************************************************
	/* the importer is a common component that the user can use to import data from index.html */
	_render_importer(){
		var oOptions = this.options
		var oElement = this.element
		//------------------------------------------importer
		var oJsonDiv = $('<div>', {class: 'w3-card w3-margin'})
		{
			oJsonDiv.text("This is where the importer goes")
			oJsonDiv.cajson({ base_name: oOptions.name , create_button: false})	//make into widget

		}

		oElement.append(oJsonDiv)

	}

	//*************************************************************************
	/**
	 * the output area will contain the scrambled text in base64 format
	 */
	_render_outputs(){
		var oElement = this.element
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
				placeholder: 'scrambled text will appear here',
				rows: 10,
				style: "width: 100%;"
			})
			oOutputDiv.append(oOutputText)

			oElement.append(oOutputDiv)
		}
	}

	//*************************************************************************
	_render_inputs(){
		var oElement = this.element

		//------------------------------------------input text
		var oInputDiv = $('<div>', {class: 'w3-card w3-margin'})
		{
			var oHeader = $('<header>', {class: 'w3-container w3-blue'})
			{
				oHeader.append($('<h3>').text('Scrambler Input'))
				oInputDiv.append(oHeader)
			}

			//the text to be scrambled
			SCRAMBLE_CONSTS.MAX_INPUT_LENGTH = Math.floor(SCRAMBLE_CONSTS.GRID_ROWS * SCRAMBLE_CONSTS.GRID_COLS / cConverterEncodings.BASE64_BITS)
			var sID = cJquery.child_ID(oElement, SCRAMBLE_CONTROL_IDS.input_text_ID)
			var oInputText = $('<textarea>', {
				id: sID,
				placeholder: 'Enter text to be scrambled here, it must contain at most ' + SCRAMBLE_CONSTS.MAX_INPUT_LENGTH + ' characters',
				rows: 10,
				style: "width: 100%;"
			})
			{
				//when the text area loses focus, and the text has changed, reset the scrambler
				oInputDiv.append(oInputText)
			}


			//number of initial CA steps to perform before reading the operations from the grid
			var oStepsdiv = $('<div>', {class: 'w3-container'})
			{
				var oLabel = $('<label>', {class: "w3-text-blue"})
				{
					oLabel.text("Number of steps to scramble must an integer between " + SCRAMBLE_CONSTS.MIN_STEPS + " and " + SCRAMBLE_CONSTS.MAX_STEPS)
					oStepsdiv.append(oLabel)
				}


				sID = cJquery.child_ID(oElement, SCRAMBLE_CONTROL_IDS.input_steps_ID)
				var oStepsInput = $('<input>', {
					id: sID,
					name: sID,
					type: 'number',
					min: SCRAMBLE_CONSTS.MIN_STEPS,
					max: SCRAMBLE_CONSTS.MAX_STEPS,
					value: 10,
					title: "number of steps to scramble"	,
					class: 'w3-input scrambler-input-steps'
				})
				{
					oStepsInput.on('blur input', () => this._onInputStepsBlur())
					oStepsdiv.append(oStepsInput)
				}

				oInputDiv.append(oStepsdiv)
			}

			oElement.append(oInputDiv)
		}
	}

	//*************************************************************************
	//* callbacks
	//*************************************************************************
	_onInputStepsBlur(){
		var oElement = this.element
		var oInput = cJquery.get_child(oElement, SCRAMBLE_CONTROL_IDS.input_steps_ID)

		var sValue = oInput.val()
		var bValid = false
		if (!sValue.includes('.')) {
			var iValue = parseInt(sValue)
			bValid = iValue >= SCRAMBLE_CONSTS.MIN_STEPS && iValue <= SCRAMBLE_CONSTS.MAX_STEPS
		}

		oInput.css('border-color', bValid ? '' : SCRAMBLE_CONSTS.BAD_INPUT_COLOUR)
		return bValid
	}

	//*************************************************************************
	onClickScramble(){
		alert("not implemented yet")
	}

	//*************************************************************************
	//* event handlers
	//*************************************************************************
	onGridEvent( poEvent ){

	}

	//*************************************************************************
	onCanvasEvent( poEvent ){

	}

	//*************************************************************************
	onRuleEvent( poEvent ){
		switch (poEvent.action) {
			case cCARuleEvent.actions.update_rule:
				cDebug.write('update_rule')
				var oRule = poEvent.data
				this._update_rule_text(oRule)
				break
		}
	}

	//*************************************************************************
	//* privates
	//*************************************************************************
	_update_rule_text(poRule){
		var oElement = this.element
		var s64 = cCARuleBase64Exporter.export(poRule, CA_STATES.default_state)
		var oTextArea = cJquery.get_child(oElement, SCRAMBLE_CONTROL_IDS.rule_text_id)
		oTextArea.val(s64)
	}
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget('ck.cascrambler', {
	options: {
		cols: 100,
		rows: 100,
		cell_size: 5,
		name: null,
	},

	_create: function () {
		var oWidget = new cScrambleWidget(this.options, this.element)
		oWidget.render()
	}
})