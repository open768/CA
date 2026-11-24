'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
class cIndexWidget extends cJQueryWidgetClass {
	constructor (poOptions, poElement) {
		super(
			poOptions,
			poElement
		)

		// check for classes
		if (typeof cCARule !== 'function')
			$.error('missing cCARule class')

		if (!poOptions.name)
			$.error('missing name')
	}

	init () {
		const oOptions = this.options
		const oElement = this.element

		const sCaName = oOptions.name

		// Settings slide over the page without changing the workspace layout.
		const sSettingsID = cJquery.child_ID(oElement, 'settings')
		const sSettingsHeadingID = cJquery.child_ID(oElement, 'settingsHeading')
		const oSettings = $('<aside>', {
			class: 'ca-settings-rail flex-shrink-0 align-self-stretch d-flex position-relative',
			'aria-label': 'Settings'
		})
		const oSettingsButton = $('<button>', {
			type: 'button',
			class: 'ca-settings-toggle btn btn-outline-secondary d-flex align-items-start justify-content-center',
			title: 'Open settings',
			'aria-label': 'Open settings',
			'data-bs-toggle': 'offcanvas',
			'data-bs-target': '#' + sSettingsID,
			'aria-expanded': 'false',
			'aria-controls': sSettingsID
		}).html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 6h16M4 12h16M4 18h16"/></svg>')
		const oSettingsPanel = $('<div>', {
			id: sSettingsID,
			class: 'offcanvas offcanvas-start ca-settings-panel',
			tabindex: -1,
			'aria-labelledby': sSettingsHeadingID
		})
		oSettingsPanel.on('show.bs.offcanvas hide.bs.offcanvas', poEvent => {
			const bExpanded = poEvent.type === 'show'
			const sLabel = bExpanded ? 'Close settings' : 'Open settings'
			oSettingsButton.attr({
				'aria-expanded': String(bExpanded),
				'aria-label': sLabel,
				title: sLabel
			})
		})
		const oSettingsHeader = $('<div>', { class: 'offcanvas-header' })
		oSettingsHeader.append($('<h2>', {
			id: sSettingsHeadingID,
			class: 'offcanvas-title h5'
		}).text('Settings'))
		oSettingsHeader.append($('<button>', {
			type: 'button',
			class: 'btn-close',
			'data-bs-dismiss': 'offcanvas',
			'aria-label': 'Close settings'
		}))
		const oSettingsBody = $('<div>', { class: 'offcanvas-body' })
		const oLeftCtrlDiv = $('<div>', {
			id: 'leftControl',
			width: 350,
			css: { maxWidth: '100%' }
		})
		oLeftCtrlDiv.cacontrolsl({ base_name: sCaName })
		oSettingsBody.append(oLeftCtrlDiv)
		const oGridSection = $(
			'<section>',
			{
				class: 'mt-3',
				'aria-label': 'Grid'
			}
		)
		oGridSection.append($(
			'<h3>',
			{
				class: 'h6 mb-2'
			}
		).text('Grid'))
		const oGridInit = $('<div>')
		oGridInit.cagridinit({
			base_name: sCaName
		})
		oGridSection.append(oGridInit)
		oSettingsBody.append(oGridSection)
		oSettingsPanel.append(oSettingsHeader, oSettingsBody)
		oSettings.append(oSettingsButton)

		// Analysis workspace: canvas and right controls.
		const oTopContainer = $('<div>', { class: 'd-flex flex-wrap align-items-start gap-3 position-relative' })
		oTopContainer.append(oSettings, oSettingsPanel)
		{
			var oCell = $(
				'<div>',
				{
					class: 'flex-shrink-0'
				}
			)
			{
				const oCanvasDiv = $(
					'<SPAN>',
					{
						title: 'this is where the magic happens'
					}
				)
				oCanvasDiv.cacanvas({
					cols: oOptions.cols,
					rows: oOptions.rows,
					cell_size: oOptions.cell_size,
					base_name: sCaName
				})
				oCell.append(oCanvasDiv)
			}

			oTopContainer.append(oCell)

			// right panel - status, activity and run controls
			oCell = $(
				'<div>',
				{
					class: 'flex-shrink-0'
				}
			)
			{
				const oRightCtrlDiv = $(
					'<DIV>',
					{
						width: 240, id: 'rightControl'
					}
				)
				oRightCtrlDiv.cacontrolsr({
					base_name: sCaName
				})
				oCell.append(oRightCtrlDiv)
				oTopContainer.append(oCell)
			}

			oElement.append(oTopContainer)
		}

		// ----------------------------------------------------------------------------------
		const oBottomContainer = $(
			'<div>',
			{
				class: 'mt-3'
			}
		)
		{
			// JSON panel
			oCell = $(
				'<div>',
				{
					class: 'w-100'
				}
			)
			{
				const oJsonDiv = $(
					'<DIV>',
					{
						title: 'json will appear here'
					}
				)
				oJsonDiv.cajson({
					base_name: sCaName
				})
				oCell.append(oJsonDiv)
			}

			oBottomContainer.append(oCell)
		}

		oElement.append(oBottomContainer)

		// check clipboard
		cBrowser.get_clipboard_permissions(true)

		// ---------------informs subscribers that UI is ready -------------------------------
		cCAActionEvent.fire_event(
			oOptions.name,
			cCAActionEvent.actions.ready,
			null
		)
	}
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget(
	'ck.caindex',
	{
		// #################################################################
		// # Definition
		// #################################################################
		options: {
			cols: 100,
			rows: 100,
			cell_size: 5,
			name: null
		},

		// #################################################################
		// # Constructor
		// #################################################################`
		_create: function () {
			const oWidget = new cIndexWidget(
				this.options,
				this.element
			)
			oWidget.init()
		}
	}
)
