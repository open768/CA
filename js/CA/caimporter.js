'use strict'

/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

// ###############################################################################
// # Binary
// ###############################################################################
class cCARuleBinaryExporter {
  /**
	 *
	 * @static
	 * @param {*} poRule
	 * @param {*} piState
	 * @returns {string}
	 */
  static export (poRule, piState) {
    cDebug.enter()
    if (!cCommon.obj_is(
      poRule,
      'cCARule'
    )) { throw new eCAException('export requires cCARule') }

    let sOut = ''
    if (piState > poRule.stateRules.length) { throw new eCAException('invalid state requested') }

    for (let i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
      sOut = sOut + poRule.get_rule_output(
        piState,
        i
      )
    }

    cDebug.leave()
    return sOut
  }
}

// ###############################################################################
/**
 *
 * @class cCARuleBinaryImporter
 */
class cCARuleBinaryImporter {
  /**
	 *
	 * @static
	 * @param {*} psInput
	 * @returns {*}
	 */
  static makeRule (psInput) {
    cDebug.enter()

    if (psInput.length < CACONSTS.MAX_INPUTS) {
      throw new eCAException(
        'incorrect length binary input:' + psInput.length + ' should be ' + CACONSTS.MAX_INPUTS
      )
    }

    if (psInput.length > CACONSTS.MAX_INPUTS) {
      psInput = psInput.slice(
        0,
        CACONSTS.MAX_INPUTS - 1
      )
    }

    // create  the rule
    const oRule = new cCARule()
    oRule.neighbour_type = CA_NEIGHBOURS.eightway
    oRule.has_state_transitions = false
    for (let i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
      const ch = psInput.charAt(i - 1)
      oRule.set_output(
        CA_STATES.default_state,
        i,
        parseInt(ch)
      )
    }

    cDebug.leave()
    return oRule
  }
}

// ###############################################################################
// # Base64
// ###############################################################################
class cCARuleRepeatBase64Importer {
  /**
	 *
	 * @static
	 * @param {*} psShort
	 * @returns {*}
	 */
  static makeRule (psShort) {
    cDebug.enter()

    const sInput = psShort.trim()
    if (sInput.length == 0) { throw new eCAException('no input provided.') }

    if (!cConverterEncodings.isBase64(sInput)) { throw new eCAException('input must be base64 string') }

    const iRepeat = Math.floor(CACONSTS.BASE64_LENGTH / sInput.length)
    let s64 = sInput.repeat(iRepeat)
    const iRemain = CACONSTS.BASE64_LENGTH - s64.length
    s64 = s64 + sInput.slice(
      0,
      iRemain
    )
    if (s64.length < CACONSTS.BASE64_LENGTH) { throw new eCAException('base64 not long enough, must be ' + CACONSTS.BASE64_LENGTH + 'chars') }

    const sBin = cSimpleBase64.toBinary(
      s64,
      CACONSTS.MAX_INPUTS
    )
    const oRule = cCARuleBinaryImporter.makeRule(sBin)

    cDebug.leave()
    return oRule
  }
}

// ###############################################################################
/**
 *
 * @class cCARuleBase64Exporter
 */
class cCARuleBase64Exporter {
  //* ****************************************************************************
  /**
	 *
	 * @static
	 * @param {*} poRule
	 * @param {*} piState
	 * @returns {*}
	 */
  static export (poRule, piState) {
    cDebug.enter()

    if (!cCommon.obj_is(
      poRule,
      'cCARule'
    )) { throw new eCAException('export requires cCARule') }

    if (piState > poRule.stateRules.length) { throw new eCAException('invalid state requested') }

    // a bit of a long way to go about it
    const sBin = cCARuleBinaryExporter.export(
      poRule,
      piState
    ) // convert rule to binary
    const sOut = cSimpleBase64.toBase64(sBin) // convert binary to base64string
    if (sOut.length !== CACONSTS.BASE64_LENGTH) { throw new eCAException('generated base64 is the wrong length') }

    cDebug.leave()
    return sOut
  }
}

// ###############################################################################
/**
 *
 * @class cCARuleBase64Importer
 */
class cCARuleBase64Importer {
  /**
	 *
	 * @static
	 * @param {*} ps64
	 * @returns {*}
	 */
  static makeRule (ps64) {
    cDebug.enter()

    if (ps64.length < CACONSTS.BASE64_LENGTH) { throw new eCAException('base64 not long enough, must be ' + CACONSTS.BASE64_LENGTH + 'chars') }

    if (!cConverterEncodings.isBase64(ps64)) { throw new eCAException('input must be base64  string') }

    const sBin = cSimpleBase64.toBinary(
      ps64,
      CACONSTS.MAX_INPUTS
    )
    const oRule = cCARuleBinaryImporter.makeRule(sBin)

    cDebug.leave()
    return oRule
  }
}

// ###############################################################################
// # Json
// ###############################################################################
/**
 *
 *
 * @class cCAExportedState

 */
class cCAExportedState {
  state = null
  rule = null
  state_transitions = null

  constructor (piState) {
    this.state = piState
  }
}

/**
 *
 *
 * @class cCAExportedRule

 */
class cCAExportedRule {
  version = 1.0
  neighbour_type = null
  boredom_count = null
  states = []

  /**
	 * checks whether an object is an exported object
	 \*	 * @static
	 * @param {*} poObj
	 * @returns {boolean}
	 */
  static is_valid_obj (poObj) {
    if (!poObj.version) { throw new Error('no version') }

    if (!poObj.neighbour_type) { throw new Error('no neighbour_type') }

    if (!poObj.states) { throw new Error('no states') }

    if (poObj.version !== 1) { throw new Error('incompatible version') }

    if (poObj.states.length !== 1) { throw new Error('unsupported number of states') }

    return true
  }
}

/**
 *
 *
 * @class cCARuleObjExporter

 */

class cCARuleObjExporter {
  /**
	 *
	 * @static
	 * @param {cCARule} poRule
	 * @returns {cCAExportedRule}
	 */
  static export (poRule) {
    cDebug.enter()

    if (!cCommon.obj_is(
      poRule,
      'cCARule'
    )) { throw new eCAException('export requires cCARule') }

    const oExport = new cCAExportedRule()
    oExport.neighbour_type = poRule.neighbour_type
    for (let iState = 1; iState <= poRule.stateRules.length; iState++) {
      const oState = new cCAExportedState(iState)
      oState.rule = cCARuleBase64Exporter.export(
        poRule,
        iState
      )
      oExport.states.push(oState)
    }

    oExport.boredom_count = poRule.boredom_count

    cDebug.leave()
    return oExport
  }
}

/**
 *
 *
 * @class cCARuleObjImporter

 */

class cCARuleObjImporter {
  /**
	 *
	 * @static
	 * @param {cCAExportedRule} poObj
	 * @returns {*}
	 */
  static makeRule (poObj) {
    cDebug.enter()

    if (!cCAExportedRule.is_valid_obj(poObj)) { throw new eCAException('import requires cCAExportedRule') }

    const oRule = cCARuleBase64Importer.makeRule(poObj.states[0].rule)
    oRule.neighbour_type = poObj.neighbour_type
    oRule.boredom_count = poObj.boredom_count

    cDebug.leave()
    return oRule
  }
}

// ###############################################################################
// # Others
// ###############################################################################
class cCARuleMaker {
  /**
	 * @abstract
	 * @static
	 * @returns {cCARule}
	 * @throws {Error} If not implemented by subclass.
	 */
  static makeRule () {
    throw new Error('Abstract method `makeRule()` must be implemented.')
  }
}

//* **************************************************************
class cCaIdentityRule extends cCARuleMaker {
  /**
	 * @static
	 * @override
	 * @returns {cCARule}
	 */
  static makeRule () {
    cDebug.enter()

    const oRule = new cCARule()
    oRule.neighbour_type = CA_NEIGHBOURS.eightway
    oRule.has_state_transitions = false

    for (let i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
      const iCentre = cCAIndexOps.get_value(
        i,
        CA_DIRECTIONS.centre
      )
      oRule.set_output(
        CA_STATES.default_state,
        i,
        iCentre
      )
    }

    cDebug.leave()
    return oRule
  }
}

//* **************************************************************
class cCaRandomRule extends cCARuleMaker {
  /**
	 * @static
	 * @override
	 * @returns {cCARule}
	 */
  static makeRule () {
    cDebug.enter()

    const oRule = new cCARule()
    oRule.neighbour_type = CA_NEIGHBOURS.eightway
    oRule.has_state_transitions = false

    for (let i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
      const iRnd = Math.floor(Math.random() * 1.99)
      oRule.set_output(
        CA_STATES.default_state,
        i,
        iRnd
      )
    }

    cDebug.leave()
    return oRule
  }
}

// ###############################################################################
class cCARuleWolfram1DImporter extends cCARuleMaker {
  /**
	 * @static
	 * @override
	 * @returns {cCARule}
	 */
  static makeRule (piRule) {
    cDebug.enter()

    if (isNaN(piRule)) { throw new eCAException('rule must be a number.') }

    if (piRule < 1 || piRule > 256) { throw new eCAException('rule must be between 1 and 256') }

    // create an identity rule
    const oRule = cCaIdentityRule.makeRule()

    // create a wolfram lookup table
    const aWolfram = new Array(8)
    let i = 0
    while (piRule > 0) {
      aWolfram[i] = piRule && 1
      i++
      piRule >>>= 1
    }

    // make wolfram changes to the rule
    // when the middle row is empty apply the wolfram rule to the row above
    for (let iInput = 1; iInput <= CACONSTS.MAX_INPUTS; iInput++) {
      const iCentreBits = cCAIndexOps.get_centre_bits(iInput)
      if (iCentreBits == 0) {
        const iNorthBits = cCAIndexOps.get_north_bits(iInput)
        var iCentre
        if (iNorthBits == 0) {
          iCentre = cCAIndexOps.get_value(
            iInput,
            CA_DIRECTIONS.centre
          )
        } else { iCentre = aWolfram[iNorthBits] }

        oRule.set_output(
          CA_STATES.default_state,
          iInput,
          iCentre
        )
      }
    }

    cDebug.leave()
    return oRule
  }
}

// ###############################################################################
/**
 *
 *
 * @class cCARuleLifeImporter

 */
class cCARuleLifeImporter extends cCARuleMaker {
  /**
	 * @static
	 * @override
	 * @returns {cCARule}
	 */
  static makeRule (psInput) {
    cDebug.enter()

    let sBorn, sSurvive
    const aBorn = new Array(9)
    const aSurvive = new Array(9)

    if (psInput == null) { throw new eCAException(' no rule to import') }

    // validate rule and extract rule components
    let aMatches = psInput.match(/B(\d+)\/S(\d+)/i) // check for Bnnn/Snnn format
    if (aMatches == null) {
      aMatches = psInput.match(/S(\d+)\/B(\d+)/i) // check for Snnn/Bnnn format
      if (aMatches == null) { throw new eCAException(psInput + ' is not a valid life notation - must be Bnnn/Snnn') }

      sBorn = aMatches[2]
      sSurvive = aMatches[1]
    } else {
      sBorn = aMatches[1]
      sSurvive = aMatches[2]
    }

    cDebug.write(psInput + ' is a valid life notation BORN:' + sBorn + ' Survive:' + sSurvive)

    // populate importer arrays
    for (let iBorn = 0; iBorn < sBorn.length; iBorn++) {
      const iBornPos = parseInt(sBorn.charAt(iBorn))
      if (iBornPos < 1 || iBornPos > CA_NEIGHBOURS.maximum) { throw new eCAException(iBornPos + ' is not a valid born count') }

      aBorn[iBornPos] = 1
    }

    for (let iSurvive = 0; iSurvive < sSurvive.length; iSurvive++) {
      const iSurvivePos = parseInt(sSurvive.charAt(iSurvive))
      if (iSurvivePos < 0 || iSurvivePos > CA_NEIGHBOURS.maximum) { throw new eCAException(iSurvivePos + ' is not a valid survivor count') }

      aSurvive[iSurvivePos] = 1
    }

    // create  the rule
    const oRule = new cCARule()
    oRule.neighbour_type = CA_NEIGHBOURS.eightway
    oRule.has_state_transitions = false

    // populate the rule
    for (let i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
      const iCentre = cCAIndexOps.get_value(
        i,
        CA_DIRECTIONS.centre
      )
      const iCount = cCAIndexOps.get_bit_count(i) - iCentre
      var iNewValue

      iNewValue = iCentre
      if (iCentre == 1) {
        // check whether cell survives
        if (aSurvive[iCount] != 1) { iNewValue = 0 }
      } else
      // check whether cell is born
        if (aBorn[iCount] == 1) { iNewValue = 1 }

      oRule.set_output(
        CA_STATES.default_state,
        i,
        iNewValue
      )
    }

    cDebug.leave()
    return oRule
  }
}

// ###############################################################################
/**
 *
 *
 * @class cCAModifierTypes

 */
class cCAModifierTypes {
  /**
	 *
	 * @static
	 * @type {{ at_least: { id: number; label: string; }; exactly: { id: number; label: string; }; at_most: { id: number; label: string; }; }}
	 */
  static verbs = {
    at_least: {
      id: 1, label: 'At least'
    },
    exactly: {
      id: 2, label: 'Exactly'
    },
    at_most: {
      id: 3, label: 'At Most'
    }
  }

  /**
	 *
	 * @static
	 * @type {{ one: { id: number; label: string; }; zero: { id: number; label: string; }; any: { id: number; label: string; }; }}
	 */
  static states = {
    one: {
      id: 1, label: '1'
    },
    zero: {
      id: 2, label: '0'
    },
    any: {
      id: 3, label: 'any'
    }
  }
}

/**
 *
 *
 * @class cCARuleModifier

 */

class cCARuleModifier {
  /**
	 *
	 * @static
	 * @param {*} poRule
	 * @param {*} piInState
	 * @param {*} piVerb
	 * @param {*} piCount
	 * @param {*} piOutState
	 * @returns {*}
	 */
  static modify_neighbours (poRule, piInState, piVerb, piCount, piOutState) {
    if (!cCommon.obj_is(
      poRule,
      'cCARule'
    )) { throw new eCAException('function requires cCARule') }

    if (piCount < 1 || piCount > 8) { throw new eCAException('invalid neighbour count') }

    if (piOutState < 0 || piOutState > 1) { throw new eCAException('invalid output state :' + piOutState) }

    for (let i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
      const iCentre = cCAIndexOps.get_value(
        i,
        CA_DIRECTIONS.centre
      )
      // ---------------------------------------------------------------
      let bMatches = false
      switch (piInState) {
        case cCAModifierTypes.states.one.id:
          bMatches = iCentre == 1
          break

        case cCAModifierTypes.states.zero.id:
          bMatches = iCentre == 0
          break

        case cCAModifierTypes.states.any.id:
          bMatches = true
          break
      }

      if (!bMatches) { continue }

      // ---------------------------------------------------------------
      const iCount = cCAIndexOps.get_bit_count(i) - iCentre
      bMatches = false

      switch (piVerb) {
        case cCAModifierTypes.verbs.at_least.id:
          bMatches = iCount >= piCount
          break

        case cCAModifierTypes.verbs.exactly.id:
          bMatches = piCount == iCount
          break

        case cCAModifierTypes.verbs.at_most.id:
          bMatches = iCount <= piCount
          break

        default:
          throw new eCAException('invalid verb')
      }

      if (bMatches) {
        poRule.set_output(
          CA_STATES.default_state,
          i,
          piOutState
        )
      }
    }

    return poRule
  }
}
