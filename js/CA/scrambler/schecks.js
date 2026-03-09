"use strict"

//#############################################################################
// NIST SP 800-22 (subset) randomness checks for binary strings
// this code was entirely created by copilot
//#############################################################################
class eComplexityException extends Error {
	constructor(message) {
		super(message)
	}
}

class cComplexityChecks {
	static DEFAULT_ALPHA = 0.01
	static DEFAULT_BLOCK_SIZE = 128

	_binary = null
	_length = 0
	_ones = 0

	/**
	 * @param {string} psBinary - a string of 0/1 bits
	 */
	constructor(psBinary) {
		this._set_binary(psBinary)
	}

	//********************************************************************
	// public methods
	//********************************************************************
	/**
	 * @param {object} poOptions
	 * @returns {object}
	 */
	run_all(poOptions = {
	}) {
		//----------------set default options
		var alpha = (poOptions.alpha == null)
			? cComplexityChecks.DEFAULT_ALPHA
			: poOptions.alpha
		var block_size = (poOptions.block_size == null)
			? cComplexityChecks.DEFAULT_BLOCK_SIZE
			: poOptions.block_size

		//----------------run tests
		var otest_frequency = this.test_frequency(alpha)
		var otest_block_frequency = this.test_block_frequency(
			block_size,
			alpha
		)
		var otest_runs = this.test_runs(alpha)

		//----------------return results
		return {
			frequency: otest_frequency,
			block_frequency: otest_block_frequency,
			runs: otest_runs
		}
	}

	//********************************************************************
	// tests
	//********************************************************************
	/**
	 * Monobit Frequency Test
	 * @param {number} pfAlpha
	 * @returns {object}
	 */
	test_frequency(pfAlpha = cComplexityChecks.DEFAULT_ALPHA) {
		var n = this._length
		if (n <= 0)
			return this._pass_fail(false)

		var s = (2 * this._ones) - n
		var sObs = Math.abs(s) / Math.sqrt(n)
		var pValue = this._erfc(sObs / Math.SQRT2)

		return this._pass_fail(pValue >= pfAlpha)
	}

	/**
	 * Block Frequency Test
	 * @param {number} piBlockSize
	 * @param {number} pfAlpha
	 * @returns {object}
	 */
	test_block_frequency(
		piBlockSize = cComplexityChecks.DEFAULT_BLOCK_SIZE,
		pfAlpha = cComplexityChecks.DEFAULT_ALPHA
	) {
		var n = this._length
		if (n <= 0)
			return this._pass_fail(false)

		if (!piBlockSize || piBlockSize <= 0)
			return this._pass_fail(false)

		var iBlocks = Math.floor(n / piBlockSize)
		if (iBlocks <= 0)
			return this._pass_fail(false)

		var iStart = 0
		var fSum = 0
		for (var i = 0; i < iBlocks; i++) {
			var iOnes = 0
			for (var j = 0; j < piBlockSize; j++)
				if (this._binary[iStart + j] === '1')
					iOnes++

			var pi = iOnes / piBlockSize
			fSum += Math.pow(
				pi - 0.5,
				2
			)
			iStart += piBlockSize
		}

		var chi2 = 4 * piBlockSize * fSum
		var pValue = this._igamc(
			iBlocks / 2,
			chi2 / 2
		)

		return this._pass_fail(pValue >= pfAlpha)
	}

	/**
	 * Runs Test
	 * @param {number} pfAlpha
	 * @returns {object}
	 */
	test_runs(pfAlpha = cComplexityChecks.DEFAULT_ALPHA) {
		var n = this._length
		if (n <= 1)
			return this._pass_fail(false)

		var pi = this._ones / n
		var tau = 2 / Math.sqrt(n)
		if (Math.abs(pi - 0.5) >= tau)
			return this._pass_fail(false)

		var vObs = 1
		for (var i = 1; i < n; i++)
			if (this._binary[i] !== this._binary[i - 1])
				vObs++

		var fExpected = 2 * n * pi * (1 - pi)
		var denom = 2 * Math.sqrt(2 * n) * pi * (1 - pi)
		var pValue = this._erfc(Math.abs(vObs - fExpected) / denom)

		return this._pass_fail(pValue >= pfAlpha)
	}

	//********************************************************************
	// internal helpers
	//********************************************************************
	_set_binary(psBinary) {
		this._validate_binary(psBinary)
		this._binary = psBinary
		this._length = psBinary.length
		this._ones = this._count_ones(psBinary)
	}

	_validate_binary(psBinary) {
		if (typeof psBinary !== 'string')
			throw new eComplexityException("binary input must be a string")
		if (psBinary.length === 0)
			throw new eComplexityException("binary input cannot be empty")
		if (/[^01]/.test(psBinary))
			throw new eComplexityException("binary input must contain only 0 or 1")
	}

	_count_ones(psBinary) {
		var iOnes = 0
		for (var i = 0; i < psBinary.length; i++)
			if (psBinary[i] === '1')
				iOnes++

		return iOnes
	}

	_pass_fail(pbPass) {
		return pbPass ? "pass" : "fail"
	}

	//********************************************************************
	// math helpers
	//********************************************************************
	_erf(x) {
		var sign = (x < 0) ? -1 : 1
		x = Math.abs(x)

		// Abramowitz & Stegun 7.1.26 erf approximation coefficients
		var a1 = 0.254829592
		var a2 = -0.284496736
		var a3 = 1.421413741
		var a4 = -1.453152027
		var a5 = 1.061405429
		var p = 0.3275911

		var t = 1 / (1 + p * x)
		var y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
		return sign * y
	}

	_erfc(x) {
		return 1 - this._erf(x)
	}

	_gammaln(x) {
		// Lanczos approximation coefficients for ln(Gamma(x))
		var cof = [
			76.18009172947146,
			-86.50532032941677,
			24.01409824083091,
			-1.231739572450155,
			0.1208650973866179e-2,
			-0.5395239384953e-5
		]
		var y = x
		// 5.5 and 2.5066... are constants from the Lanczos form
		var tmp = x + 5.5
		tmp -= (x + 0.5) * Math.log(tmp)
		// 1.000000000190015 is a Lanczos series constant
		var ser = 1.000000000190015
		for (var j = 0; j < cof.length; j++) {
			y += 1
			ser += cof[j] / y
		}

		return -tmp + Math.log(2.5066282746310005 * ser / x)
	}

	_igam(a, x) {
		if (x <= 0 || a <= 0)
			return 0

		var gln = this._gammaln(a)
		var sum = 1 / a
		var del = sum
		var ap = a

		// Limit iterations and epsilon for convergence
		for (var n = 1; n <= 100; n++) {
			ap += 1
			del *= x / ap
			sum += del
			if (Math.abs(del) < Math.abs(sum) * 1e-10)
				break
		}

		return sum * Math.exp(-x + a * Math.log(x) - gln)
	}

	_igamc(a, x) {
		if (x <= 0 || a <= 0)
			return 1

		if (x < 1 || x < a)
			return 1 - this._igam(
				a,
				x
			)

		var gln = this._gammaln(a)
		var b = x + 1 - a
		// 1e-30 is a tiny value to prevent division underflow
		var c = 1 / 1e-30
		var d = 1 / b
		var h = d

		// Limit iterations and epsilon for convergence
		for (var i = 1; i <= 100; i++) {
			var an = -i * (i - a)
			b += 2
			d = an * d + b
			if (Math.abs(d) < 1e-30)
				d = 1e-30
			c = b + an / c
			if (Math.abs(c) < 1e-30)
				c = 1e-30
			d = 1 / d
			var del = d * c
			h *= del
			if (Math.abs(del - 1) < 1e-10)
				break
		}

		return Math.exp(-x + a * Math.log(x) - gln) * h
	}
}
