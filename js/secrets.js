class cSecrets {
	static GOOGLEANALYTICS_ID = 'UA-51550338-3' //put your own Google Analytics ID here

	static add_googletag() {
		var document = $('body')

		$('<script/>', {
			async: true,
			src: 'https://www.googletagmanager.com/gtag/js?id=' + cSecrets.GOOGLEANALYTICS_ID
		}).appendTo(document)

		$('<script/>', {
			text:
				'window.dataLayer = window.dataLayer || [];' +
				'function gtag(){ dataLayer.push(arguments); }' +
				"gtag('js', new Date());" +
				"gtag('config', '" +
				cSecrets.GOOGLEANALYTICS_ID +
				"');"
		}).appendTo(document)
	}
}
