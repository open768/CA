'use strict'

/**************************************************************************
Copyright (C) Chicken Katsu 2013-2024
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//###############################################################################
// # Binary
//###############################################################################
class cCARuleBinaryExporter {
	/**
	 *
	 * @static
	 * @param {*} poRule
	 * @param {*} piState
	 * @returns {string}
	 */
	static export(poRule, piState) {
		cDebug.enter()
		if (!cCommon.obj_is(poRule, 'cCARule'))
			throw new CAException('export requires cCARule')

		var sOut = ''
		if (piState > poRule.stateRules.length)
			throw new CAException('invalid state requested')

		for (var i = 1; i <= CACONSTS.MAX_INPUTS; i++)
			sOut = sOut + poRule.get_rule_output(piState, i)

		cDebug.leave()
		return sOut
	}
}

//###############################################################################
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
	static makeRule(psInput) {
		cDebug.enter()

		if (psInput.length < CACONSTS.MAX_INPUTS)
			throw new CAException(
				'incorrect length binary input:' + psInput.length + ' should be ' + CACONSTS.MAX_INPUTS,
			)

		if (psInput.length > CACONSTS.MAX_INPUTS)
			psInput = psInput.slice(0, CACONSTS.MAX_INPUTS - 1)

		// create  the rule
		var oRule = new cCARule()
		oRule.neighbour_type = CA_NEIGHBOURS.eightway
		oRule.has_state_transitions = false
		for (var i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
			var ch = psInput.charAt(i - 1)
			oRule.set_output(CA_STATES.default_state, i, parseInt(ch))
		}

		cDebug.leave()
		return oRule
	}
}

//###############################################################################
// # Base64
//###############################################################################
class cCARuleRepeatBase64Importer {
	/**
	 *
	 * @static
	 * @param {*} psShort
	 * @returns {*}
	 */
	static makeRule(psShort) {
		cDebug.enter()

		var sInput = psShort.trim()
		if (sInput.length == 0)
			throw new CAException('no input provided.')

		if (!cConverterEncodings.isBase64(sInput))
			throw new CAException('input must be base64 string')

		var iRepeat = Math.floor(CACONSTS.BASE64_LENGTH / sInput.length)
		var s64 = sInput.repeat(iRepeat)
		var iRemain = CACONSTS.BASE64_LENGTH - s64.length
		s64 = s64 + sInput.slice(0, iRemain)
		if (s64.length < CACONSTS.BASE64_LENGTH)
			throw new CAException('base64 not long enough, must be ' + CACONSTS.BASE64_LENGTH + 'chars')

		var sBin = cSimpleBase64.toBinary(s64, CACONSTS.MAX_INPUTS)
		var oRule = cCARuleBinaryImporter.makeRule(sBin)

		cDebug.leave()
		return oRule
	}
}

//###############################################################################
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
	static export(poRule, piState) {
		cDebug.enter()

		if (!cCommon.obj_is(poRule, 'cCARule'))
			throw new CAException('export requires cCARule')

		if (piState > poRule.stateRules.length)
			throw new CAException('invalid state requested')

		// a bit of a long way to go about it
		var sBin = cCARuleBinaryExporter.export(poRule, piState) // convert rule to binary
		var sOut = cSimpleBase64.toBase64(sBin) // convert binary to base64string
		if (sOut.length !== CACONSTS.BASE64_LENGTH)
			throw new CAException('generated base64 is the wrong length')

		cDebug.leave()
		return sOut
	}
}

//###############################################################################
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
	static makeRule(ps64) {
		cDebug.enter()

		if (ps64.length < CACONSTS.BASE64_LENGTH)
			throw new CAException('base64 not long enough, must be ' + CACONSTS.BASE64_LENGTH + 'chars')

		if (!cConverterEncodings.isBase64(ps64))
			throw new CAException('input must be base64  string')

		var sBin = cSimpleBase64.toBinary(ps64, CACONSTS.MAX_INPUTS)
		var oRule = cCARuleBinaryImporter.makeRule(sBin)

		cDebug.leave()
		return oRule
	}
}

//###############################################################################
// # Json
//###############################################################################
/**
 *
 *
 * @class cCAExportedState

 */
class cCAExportedState {
	state = null
	rule = null
	state_transitions = null

	constructor(piState) {
		this.state = piState
	}
}

/**
 *
 *
 * @class cCAExportedObj

 */
class cCAExportedObj {
	version = 1.0
	neighbour_type = null
	boredom = null
	states = []

	/**
	 * checks whether an object is an exported object
	 \*	 * @static
	 * @param {*} poObj
	 * @returns {boolean}
	 */
	static is_valid_obj(poObj) {
		if (!poObj.version)
			throw new Error('no version')

		if (!poObj.neighbour_type)
			throw new Error('no neighbour_type')

		if (!poObj.states)
			throw new Error('no states')

		if (poObj.version !== 1)
			throw new Error('incompatible version')

		if (poObj.states.length !== 1)
			throw new Error('unsupported number of states')

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
	 * @returns {cCAExportedObj}
	 */
	static export(poRule) {
		cDebug.enter()

		if (!cCommon.obj_is(poRule, 'cCARule'))
			throw new CAException('export requires cCARule')

		var oExport = new cCAExportedObj()
		oExport.neighbour_type = poRule.neighbour_type
		for (var iState = 1; iState <= poRule.stateRules.length; iState++) {
			var oState = new cCAExportedState(iState)
			oState.rule = cCARuleBase64Exporter.export(poRule, iState)
			oExport.states.push(oState)
		}
		oExport.boredom = poRule.boredom_count

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
	 * @param {cCAExportedObj} poObj
	 * @returns {*}
	 */
	static makeRule(poObj) {
		cDebug.enter()

		if (!cCAExportedObj.is_valid_obj(poObj))
			throw new CAException('import requires cCAExportedObj')

		var oRule = cCARuleBase64Importer.makeRule(poObj.states[0].rule)
		oRule.neighbour_type = poObj.neighbour_type
		oRule.boredom_count = poObj.boredom

		cDebug.leave()
		return oRule
	}
}

//###############################################################################
// # Others
//###############################################################################
/**
 *
 *
 * @class cCaIdentityRule

 */
class cCaIdentityRule {
	/**
	 *
	 * @static
	 * @returns {*}
	 */
	static makeRule() {
		cDebug.enter()

		var oRule = new cCARule()
		oRule.neighbour_type = CA_NEIGHBOURS.eightway
		oRule.has_state_transitions = false

		for (var i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
			var iCentre = cCAIndexOps.get_value(i, CA_DIRECTIONS.centre)
			oRule.set_output(CA_STATES.default_state, i, iCentre)
		}

		cDebug.leave()
		return oRule
	}
}

//* **************************************************************
/**
 *
 *
 * @class cCaRandomRule

 */

class cCaRandomRule {
	/**
	 *
	 * @static
	 * @returns {*}
	 */
	static makeRule() {
		cDebug.enter()

		var oRule = new cCARule()
		oRule.neighbour_type = CA_NEIGHBOURS.eightway
		oRule.has_state_transitions = false

		for (var i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
			var iRnd = Math.floor(Math.random() * 1.99)
			oRule.set_output(CA_STATES.default_state, i, iRnd)
		}

		cDebug.leave()
		return oRule
	}
}

//###############################################################################
/**
 *
 *
 * @class cCARuleWolfram1DImporter

 */

class cCARuleWolfram1DImporter {
	/**
	 *
	 * @static
	 * @param {*} piRule
	 * @returns {*}
	 */
	static makeRule(piRule) {
		cDebug.enter()

		if (isNaN(piRule))
			throw new CAException('rule must be a number.')

		if (piRule < 1 || piRule > 256)
			throw new CAException('rule must be between 1 and 256')

		// create an identity rule
		var oRule = cCaIdentityRule.makeRule()

		// create a wolfram lookup table
		var aWolfram = new Array(8)
		var i = 0
		while (piRule > 0) {
			aWolfram[i] = piRule && 1
			i++
			piRule >>>= 1
		}

		// make wolfram changes to the rule
		// when the middle row is empty apply the wolfram rule to the row above
		for (var iInput = 1; iInput <= CACONSTS.MAX_INPUTS; iInput++) {
			var iCentreBits = cCAIndexOps.get_centre_bits(iInput)
			if (iCentreBits == 0) {
				var iNorthBits = cCAIndexOps.get_north_bits(iInput)
				var iCentre
				if (iNorthBits == 0)
					iCentre = cCAIndexOps.get_value(iInput, CA_DIRECTIONS.centre)
				else
					iCentre = aWolfram[iNorthBits]

				oRule.set_output(CA_STATES.default_state, iInput, iCentre)
			}
		}

		cDebug.leave()
		return oRule
	}
}

//###############################################################################
/**
 *
 *
 * @class cCARuleLifeImporter

 */
class cCARuleLifeImporter {
	//* **************************************************************
	/**
	 *
	 * @static
	 * @param {*} psInput
	 * @returns {*}
	 */
	static makeRule(psInput) {
		cDebug.enter()

		var sBorn, sSurvive
		var aBorn = new Array(9)
		var aSurvive = new Array(9)

		if (psInput == null)
			throw new CAException(' no rule to import')

		// validate rule and extract rule components
		var aMatches = psInput.match(/B(\d+)\/S(\d+)/i) // check for Bnnn/Snnn format
		if (aMatches == null) {
			aMatches = psInput.match(/S(\d+)\/B(\d+)/i) // check for Snnn/Bnnn format
			if (aMatches == null)
				throw new CAException(psInput + ' is not a valid life notation - must be Bnnn/Snnn')

			sBorn = aMatches[2]
			sSurvive = aMatches[1]
		} else {
			sBorn = aMatches[1]
			sSurvive = aMatches[2]
		}

		cDebug.write(psInput + ' is a valid life notation BORN:' + sBorn + ' Survive:' + sSurvive)

		// populate importer arrays
		for (var iBorn = 0; iBorn < sBorn.length; iBorn++) {
			var iBornPos = parseInt(sBorn.charAt(iBorn))
			if (iBornPos < 1 || iBornPos > CA_NEIGHBOURS.maximum)
				throw new CAException(iBornPos + ' is not a valid born count')

			aBorn[iBornPos] = 1
		}
		for (var iSurvive = 0; iSurvive < sSurvive.length; iSurvive++) {
			var iSurvivePos = parseInt(sSurvive.charAt(iSurvive))
			if (iSurvivePos < 0 || iSurvivePos > CA_NEIGHBOURS.maximum)
				throw new CAException(iSurvivePos + ' is not a valid survivor count')

			aSurvive[iSurvivePos] = 1
		}

		// create  the rule
		var oRule = new cCARule()
		oRule.neighbour_type = CA_NEIGHBOURS.eightway
		oRule.has_state_transitions = false

		// populate the rule
		for (var i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
			var iCentre = cCAIndexOps.get_value(i, CA_DIRECTIONS.centre)
			var iCount = cCAIndexOps.get_bit_count(i) - iCentre
			var iNewValue

			iNewValue = iCentre
			if (iCentre == 1) {
				// check whether cell survives
				if (aSurvive[iCount] != 1)
					iNewValue = 0
			} else
			// check whether cell is born
				if (aBorn[iCount] == 1)
					iNewValue = 1

			oRule.set_output(CA_STATES.default_state, i, iNewValue)
		}

		cDebug.leave()
		return oRule
	}
}

//###############################################################################
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
		at_least: { id: 1, label: 'At least' },
		exactly: { id: 2, label: 'Exactly' },
		at_most: { id: 3, label: 'At Most' },
	}

	/**
	 *
	 * @static
	 * @type {{ one: { id: number; label: string; }; zero: { id: number; label: string; }; any: { id: number; label: string; }; }}
	 */
	static states = {
		one: { id: 1, label: '1' },
		zero: { id: 2, label: '0' },
		any: { id: 3, label: 'any' },
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
	static modify_neighbours(poRule, piInState, piVerb, piCount, piOutState) {
		if (!cCommon.obj_is(poRule, 'cCARule'))
			throw new CAException('function requires cCARule')

		if (piCount < 1 || piCount > 8)
			throw new CAException('invalid neighbour count')

		if (piOutState < 0 || piOutState > 1)
			throw new CAException('invalid output state :' + piOutState)

		for (var i = 1; i <= CACONSTS.MAX_INPUTS; i++) {
			var iCentre = cCAIndexOps.get_value(i, CA_DIRECTIONS.centre)
			// ---------------------------------------------------------------
			var bMatches = false
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
			if (!bMatches)
				continue

			// ---------------------------------------------------------------
			var iCount = cCAIndexOps.get_bit_count(i) - iCentre
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
					throw new CAException('invalid verb')
			}

			if (bMatches)
				poRule.set_output(CA_STATES.default_state, i, piOutState)
		}

		return poRule
	}
}

// var oTester = new cCARuleBinaryImporter();
// oTester.test();
