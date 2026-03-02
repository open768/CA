/**************************************************************************
Copyright (C) Chicken Katsu 2013-2026
This code is protected by copyright under the terms of the
Creative Commons Attribution 4.0 International License
https://creativecommons.org/licenses/by/4.0/legalcode
contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OF ANY FORM ARE EITHER EXPRESSED OR IMPLIED

Any Cryptography concepts demonstrated in this code are covered by the UK Govt Open General Export License for Cryptographic development
(see https://www.gov.uk/government/publications/open-general-export-licence-cryptographic-development)
and is not intended for any dual use as defined by the UK government license.
You the consumer of this code are solely and entirely responsible for importing this code into your own country..
**************************************************************************/

/** Scrambler Events */
class cCAScramblerEvent extends cBaseEvent{
	static actions = {
		status: "SEST",
		set_input: "SESI",
		reset: "SER",
		draw_grid: "SED",
		error: "SERR"
	}
	static notify = {
		consumed: "SENC"
	}

	static control_actions = {
		scramble: "SEA"
	}
}


class cCAScramblerException extends Error {
}

class cCAScramblerTypes extends cStaticClass{
	static status = {
		dormant: null,
		initialRuns: 1
	}
}

class cCAScramblerStages extends cStaticClass{
	static NOT_RUNNING = "SSNR"
	static INIT = "SSI"
	static FILL_INPUT = "SSFI"
	static VALIDATE_GRID = "SSVG"
	static INITIAL_RUNS = "SSIR"
	static SCRAMBLING = "SSS"
}