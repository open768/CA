"use strict"

const SCRAMBLE_CONTROL_IDS = {
	input_text_ID: 'a1',
	input_text_status_ID: 'a2',
	input_steps_ID: 'b',
	output_text_ID: 'c',
	rule_text_id: 'd',
	btn_scramble_ID: 'e',
	btn_descramble_ID: 'f'
}
const SCRAMBLE_CONSTS = {
	CELL_SIZE: 5,
	BAD_INPUT_COLOUR: 'red',
	MIN_STEPS: 5,
	MAX_STEPS: 100
}

//#############################################################################
//#############################################################################
class cScrambleWidget extends cJQueryWidgetClass {

	_initial_runs = 0
	_rule_is_set = false

	constructor(poOptions, poElement){
		super(
			poOptions,
			poElement
		)

		if (!poOptions.base_name)
			$.error('missing base_name')

	}

	//*************************************************************************
	//* rendering
	//*************************************************************************
	render(){
		this._render_importer()
		this._render_inputs()
		this._render_rule()
		this._render_grids()
		this._render_outputs()

		this._subscribe_to_events()
	}

	//*************************************************************************
	_subscribe_to_events(){
		var sName = this.options.base_name
		cCARuleEvent.subscribe(
			sName,
			[cCARuleEvent.actions.update_rule],
			poEvent => this.onRuleEvent(poEvent)
		)
		cCAScramblerEvent.subscribe(
			sName,
			[cCAScramblerEvent.actions.error, cCAScramblerEvent.notify.scrambling_complete],
			poEvent => this.onScramblerEvent(poEvent)
		)

		cCAActionEvent.fire_event(
			sName,
			cCAActionEvent.actions.ready
		)	// sent ready event
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
		var oGridDiv = $(
			'<div>',
			{
				class: 'w3-card w3-margin'
			}
		)
		{
			var oHeader = $(
				'<header>',
				{
					class: 'w3-container w3-blue'
				}
			)
			{
				oHeader.append($('<h3>').text('Grids'))
				oGridDiv.append(oHeader)
			}

			var oGridContainer = $(
				'<div>',
				{
					class: 'w3-container'
				}
			)
			{
				// the left grid shows the scrambled data,
				var oLeftCell = $(
					'<div>',
					{
						class: 'w3-cell w3-cell-top w3-container'
					}
				)
				{
					oLeftCell.text("This is where the scrambling happens")
					oLeftCell.cascramblecanvas(
						{
							base_name: oOptions.base_name,
							cols: oOptions.cols,
							rows: oOptions.rows,
							cell_size: SCRAMBLE_CONSTS.CELL_SIZE
						}
					)
					oGridContainer.append(oLeftCell)
				}

				oGridDiv.append(oGridContainer)

				//the right grid shows the cellular automata from where the scrambling rules are read
				var oRightCell = $(
					'<div>',
					{
						class: 'w3-cell w3-cell-top w3-container'
					}
				)
				{
					var oCanvasSpan = $(
						'<SPAN>',
						{
							title: 'cellular automata grid - this is where the instructions are read from'
						}
					)
					{
						oCanvasSpan.cacanvas(
							{
								base_name: oOptions.base_name,
								rows: oOptions.rows,
								cols: oOptions.cols,
								cell_size: SCRAMBLE_CONSTS.CELL_SIZE
							}
						)
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
		var oRuleDiv = $(
			'<div>',
			{
				class: 'w3-card w3-margin'
			}
		)
		{
			var oHeader = $(
				'<header>',
				{
					class: 'w3-container w3-blue'
				}
			)
			{
				oHeader.append($('<h3>').text('Rule'))
				oRuleDiv.append(oHeader)
			}

			var sID = cJquery.child_ID(
				oElement,
				SCRAMBLE_CONTROL_IDS.rule_text_id
			)
			var oRuleText = $(
				'<textarea>',
				{
					id: sID,
					placeholder: 'rule goes here',
					rows: 1,
					style: "width: 100%",
					disabled: true
				}
			)
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
		var oJsonDiv = $(
			'<div>',
			{
				class: 'w3-card w3-margin'
			}
		)
		{
			oJsonDiv.text("This is where the importer goes")
			oJsonDiv.cajson({
				base_name: oOptions.base_name , create_button: false
			})	//make into widget

		}

		oElement.append(oJsonDiv)

	}

	//*************************************************************************
	/**
	 * the output area will contain the scrambled text in base64 format
	 */
	_render_outputs(){
		var oElement = this.element
		var oOutputDiv = $(
			'<div>',
			{
				class: 'w3-card w3-margin'
			}
		)
		{
			var oHeader = $(
				'<header>',
				{
					class: 'w3-container w3-blue'
				}
			)
			{
				oHeader.append($('<h3>').text('Scrambler Output'))
				oOutputDiv.append(oHeader)
			}

			var sID = cJquery.child_ID(
				oElement,
				SCRAMBLE_CONTROL_IDS.output_text_ID
			)
			var oOutputText = $(
				'<textarea>',
				{
					id: sID,
					placeholder: 'scrambled text will appear here',
					rows: 10,
					style: "width: 100%;"
				}
			)
			oOutputDiv.append(oOutputText)

			oElement.append(oOutputDiv)
		}
	}

	//*************************************************************************
	_render_inputs(){
		var oElement = this.element

		var oInputDiv = $(
			'<div>',
			{
				class: 'w3-card w3-margin'
			}
		)
		{
			//--------------------header
			var oHeader = $(
				'<header>',
				{
					class: 'w3-container w3-blue'
				}
			)
			{
				oHeader.append($('<h3>').text('Scrambler Input'))
				oInputDiv.append(oHeader)
			}

			//--------------------header
			//the text to be scrambled
			var iMaxLen = cCAScrambler.max_chars(
				this.options.rows,
				this.options.cols
			)
			var sID = cJquery.child_ID(
				oElement,
				SCRAMBLE_CONTROL_IDS.input_text_ID
			)
			var oInputText = $(
				'<textarea>',
				{
					id: sID,
					placeholder: 'Enter text to be scrambled here, it must contain at most ' + iMaxLen + ' characters',
					rows: 10,
					style: "width: 100%;"
				}
			)
			{
				oInputText.val("the text to be scrambled goes here")
				//when a key is pressed check how may keys are still available and change the border colour of the input accordingly
				oInputText.on(
					'blur input',
					() => this._onInputChange()
				)
				oInputDiv.append(oInputText)
			}

			//--------------------status
			var sID = cJquery.child_ID(
				oElement,
				SCRAMBLE_CONTROL_IDS.input_text_status_ID
			)
			var oStatusDiv = $(
				"<div>",
				{
					id: sID
				}
			)
			{
				oStatusDiv.html("<i>...please enter some text to scramble</i>")
				oInputDiv.append(oStatusDiv)
			}

			//--------------------steps
			//number of initial CA steps to perform before reading the operations from the grid
			var oStepsdiv = $(
				'<div>',
				{
					class: 'w3-container'
				}
			)
			{
				var oLabel = $(
					'<label>',
					{
						class: "w3-text-blue"
					}
				)
				{
					oLabel.text("Number of steps to scramble must an integer between " + SCRAMBLE_CONSTS.MIN_STEPS + " and " + SCRAMBLE_CONSTS.MAX_STEPS)
					oStepsdiv.append(oLabel)
				}

				sID = cJquery.child_ID(
					oElement,
					SCRAMBLE_CONTROL_IDS.input_steps_ID
				)
				var oStepsInput = $(
					'<input>',
					{
						id: sID,
						name: sID,
						type: 'number',
						min: SCRAMBLE_CONSTS.MIN_STEPS,
						max: SCRAMBLE_CONSTS.MAX_STEPS,
						value: 10,
						title: "number of steps to scramble"	,
						class: 'w3-input scrambler-input-steps'
					}
				)
				{
					oStepsInput.on(
						'blur input',
						() => this._onInputStepsBlur()
					)
					oStepsdiv.append(oStepsInput)
				}

				oInputDiv.append(oStepsdiv)
			}

			//--------------------header
			var oFooter = $(
				'<footer>',
				{
					class: 'w3-container w3-blue'
				}
			)
			{
				sID = cJquery.child_ID(
					oElement,
					SCRAMBLE_CONTROL_IDS.btn_scramble_ID
				)
				var oButton = $(
					'<button>',
					{
						id: sID,
						text: 'Scramble',
						disabled: true,
					}
				)
				{
					oButton.on(
						'click',
						() => this._onClickScramble()
					)
					oFooter.append(oButton)
				}

				oInputDiv.append(oFooter)
			}

			oElement.append(oInputDiv)
		}
	}

	//*************************************************************************
	//* callbacks
	//*************************************************************************
	async _onInputStepsBlur(){
		var oElement = this.element
		var oInput = cJquery.get_child(
			oElement,
			SCRAMBLE_CONTROL_IDS.input_steps_ID
		)

		var sValue = oInput.val() /** @type {string} */
		var bValid = false

		//check that the value is numeric
		if ( cCommon.is_integer(sValue) ) {
			var iValue = parseInt(sValue)
			bValid = iValue >= SCRAMBLE_CONSTS.MIN_STEPS && iValue <= SCRAMBLE_CONSTS.MAX_STEPS
			if (bValid)
				this._initial_runs = iValue
		}

		oInput.css(
			'border-color',
			bValid ? '' : SCRAMBLE_CONSTS.BAD_INPUT_COLOUR
		)

		return bValid
	}

	//*************************************************************************
	async _onClickScramble(){

		//check that there is text
		var oElement = this.element
		var oInput = cJquery.get_child(
			oElement,
			SCRAMBLE_CONTROL_IDS.input_text_ID
		)
		var sValue = oInput.val()
		if (sValue.length == 0) {
			alert("please enter some text to scramble")
			return
		}

		var bValid = this._onInputStepsBlur()
		if (!bValid){
			alert("please enter a valid number of initial steps")
			return
		}

		//disable button to prevent multiple clicks
		var oButton = cJquery.get_child(
			oElement,
			SCRAMBLE_CONTROL_IDS.btn_scramble_ID
		)
		cJquery.disable_element(oButton)

		//fire the scramble event
		cCAActionEvent.fire_event(
			this.options.base_name,
			cCAScramblerEvent.control_actions.scramble,
			{
				inital_runs: this._initial_runs
			}
		)
	}

	//*************************************************************************
	//* event handlers
	//*************************************************************************
	/**
	 *
	 * @param {cCAScramblerEvent} poEvent
	 */
	async onScramblerEvent( poEvent ){
		switch (poEvent.action ){
			case cCAScramblerEvent.actions.error:
				alert("An error occurred: " + poEvent.data)
				break

			case cCAScramblerEvent.notify.scrambling_complete:
				alert("scrambling complete")
		}
	}

	//*************************************************************************
	/**
	 *
	 * @param {cCARuleEvent} poEvent
	 */
	async onRuleEvent( poEvent ){
		switch (poEvent.action) {
			case cCARuleEvent.actions.update_rule:

				//update the rule text
				var oRule = poEvent.data
				this._update_rule_text(oRule)

				//enable button
				this._onInputChange()
				break
		}
	}

	//*************************************************************************
	//*************************************************************************
	_invalid_input(psText, bInvalid = true){
		var oElement = this.element

		var oStatus = cJquery.get_child(
			oElement,
			SCRAMBLE_CONTROL_IDS.input_text_status_ID
		)
		var oButton = cJquery.get_child(
			oElement,
			SCRAMBLE_CONTROL_IDS.btn_scramble_ID
		)
		var oInput = cJquery.get_child(
			oElement,
			SCRAMBLE_CONTROL_IDS.input_text_ID
		)

		if (bInvalid){
			oStatus.html("<font color='red'>" + psText + "</font>")
			oInput.css(
				'border-color',
				SCRAMBLE_CONSTS.BAD_INPUT_COLOUR
			)
			cJquery.disable_element(oButton)
		}else{
			oStatus.html(psText )
			oInput.css(
				'border-color',
				''
			)
			cJquery.enable_element(oButton)
		}
	}

	//*************************************************************************
	_onInputChange (){
		var oElement = this.element

		//a rule must be set
		if (!this._rule_is_set){
			this._invalid_input("set a rule first")
			return
		}

		//get the input text
		var oInput = cJquery.get_child(
			oElement,
			SCRAMBLE_CONTROL_IDS.input_text_ID
		)

		//check if text is there
		var sText = oInput.val()
		if (!sText){
			this._invalid_input("no text entered")
			return
		}

		// check if text has valid length
		var iMax = cCAScrambler.max_chars(
			this.options.rows,
			this.options.cols
		)
		if (sText.length <= iMax){
			//fire an event so that the scrambler grid updates
			cCAScramblerEvent.fire_event(
				this.options.base_name,
				cCAScramblerEvent.actions.set_input,
				sText
			)
			this._invalid_input(
				"<i>chars remaining:" + (iMax - sText.length) + "</i>",
				false
			)
		}else
			this._invalid_input("text too long " + sText.length + " - must be less than " + iMax + " characters")

	}

	//*************************************************************************
	//* privates
	//*************************************************************************
	_update_rule_text(poRule){
		var oElement = this.element
		var s64 = cCARuleBase64Exporter.export(
			poRule,
			CA_STATES.default_state
		)
		var oTextArea = cJquery.get_child(
			oElement,
			SCRAMBLE_CONTROL_IDS.rule_text_id
		)
		oTextArea.val(s64)
		this._rule_is_set = true
	}
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget(
	'ck.cascontrols',
	{
		options: {				//default options can be overriden when the widget is created
			cols: 100,
			rows: 100,
			cell_size: 5,
			base_name: null			//always passed in
		},

		_create: function () {
			var oWidget = new cScrambleWidget(
				this.options,
				this.element
			)
			oWidget.render()
		}
	}
)