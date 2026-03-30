'use strict'
/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

// ###################################################################
// #
// ###################################################################
class cCARemoteControls extends cJQueryWidgetClass {
  static buttonNames = {
    play: 'P',
    stop: 'O',
    step: 'E'
  }

  base_name = null
  rule_set = false
  grid_set = false

  //* **************************************************************
  constructor (poOptions, poElement) {
    super(
      poOptions,
      poElement
    )
    this.base_name = poOptions.base_name
    const oElement = poElement

    // set basic stuff
    oElement.addClass('ui-widget')

    // subscribe to CAEvents
    cCARuleEvent.subscribe(
      this.base_name,
      [cCARuleEvent.actions.set_rule],
      poEvent => this.onRuleEvent(poEvent)
    )
    cCACanvasEvent.subscribe(
      this.base_name,
      [cCACanvasEvent.actions.set_grid],
      poEvent => this.onCanvasEvent(poEvent)
    )
    cCAGridEvent.subscribe(
      this.base_name,
      [cCAGridEvent.notify.nochange, cCAGridEvent.notify.repeatPattern],
      poEvent => this.onGridEvent(poEvent)
    )

    // put something in the widget
    this._init()
  }

  //* ***************************************************************************
  onClickControl (piAction) {
    if (!this.rule_set) {
      alert('set a rule first!!')
      return
    }

    switch (piAction) {
      case cCAActionEvent.control_actions.stop:
        this._enable_controls(false)
        break

      case cCAActionEvent.control_actions.play:
        this._enable_controls(true)
        break
    }

    cCAActionEvent.fire_event(
      this.base_name,
      cCAActionEvent.actions.control,
      piAction
    )
  }

  //* **************************************************************
  //* Events
  //* **************************************************************
  async onCanvasEvent (poEvent) {
    cDebug.enter()
    if (poEvent.action === cCACanvasEvent.actions.set_grid) {
      this.grid_set = true
      this._enable_buttons()
    }

    cDebug.leave()
  }

  //* ***************************************************************************
  async onRuleEvent (poEvent) {
    if (poEvent.action === cCARuleEvent.actions.set_rule) {
      this.rule_set = true
      this._enable_buttons()
    }
  }

  //* ***************************************************************************
  async onGridEvent (poEvent) {
    switch (poEvent.action) {
      case cCAGridEvent.notify.nochange:

      case cCAGridEvent.notify.repeatPattern:
        this._enable_controls(false)
    }
  }

  //* **************************************************************
  //* Privates
  //* **************************************************************
  _enable_buttons () {
    if (this.grid_set && this.rule_set) { this._enable_controls(false) }
  }

  /**
	 * @param {boolean} pbRunning
	 */
  _enable_controls (pbRunning) {
    const oElement = this.element
    let sID = cJquery.child_ID(
      oElement,
      cCARemoteControls.buttonNames.play
    )
    cJquery.enable_element(
      sID,
      !pbRunning
    )

    sID = cJquery.child_ID(
      oElement,
      cCARemoteControls.buttonNames.step
    )
    cJquery.enable_element(
      sID,
      !pbRunning
    )

    sID = cJquery.child_ID(
      oElement,
      cCARemoteControls.buttonNames.stop
    )
    cJquery.enable_element(
      sID,
      pbRunning
    )
  }

  //* **************************************************************
  _init () {
    let oDiv
    const oElement = this.element
    const oThis = this // needed for closure

    function _add_button (psID, psiIcon, psTitle, piAction) {
      const sID = cJquery.child_ID(
        oElement,
        psID
      )
      const oButton = $(
        '<button>',
        {
          width: '30px',
          height: '30px',
          id: sID,
          title: psTitle
        }
      )
      oButton.button({
        icon: psiIcon, showLabel: false
      })
      cJquery.enable_element(
        oButton,
        false
      )
      oButton.click(() => oThis.onClickControl(piAction)) // retain oThis in closure
      oDiv.append(oButton)
    }

    // --widget header------------------------------------------------
    cJquery.add_widget_header(
      oElement,
      'controls'
    )

    // ---widget body
    oDiv = $(
      '<DIV>',
      {
        class: 'ui-widget-content'
      }
    )

    // --- stop button----------------------------------------
    _add_button(
      cCARemoteControls.buttonNames.stop,
      'ui-icon-stop',
      'stop',
      cCAActionEvent.control_actions.stop
    )
    _add_button(
      cCARemoteControls.buttonNames.play,
      'ui-icon-circle-triangle-e',
      'play',
      cCAActionEvent.control_actions.play
    )
    _add_button(
      cCARemoteControls.buttonNames.step,
      'ui-icon-circle-arrow-e',
      'step',
      cCAActionEvent.control_actions.step
    )

    oElement.append(oDiv)
  }
}

// ###################################################################
// #
// ###################################################################
$.widget(
  'ck.caremotecontrols',
  {
    options: {
      base_name: null
    },
    _create: function () {
      // checks
      const oOptions = this.options
      if (!oOptions.base_name) { $.error('base name not provided') }

      new cCARemoteControls(
        oOptions,
        this.element
      ) // call class constructor
    }
  }
)
