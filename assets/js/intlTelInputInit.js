jQuery(".form-tel").intlTelInput({
	initialCountry: "auto",
	autoPlaceholder: "aggressive",
	geoIpLookup: function(callback) {
		try {
			$.get(adlots_obj.adlots_url + 'api/geo/getcountrycode', function() {}, "json")
			.always(function(resp) {
				var countryCode = (resp && resp.country) ? resp.country : "";
				if (countryCode == "")
				{
					var lang = navigator.language || navigator.userLanguage;
					if (lang != undefined)
					{
						lang_parsed = lang.split('-');
						countryCode = (lang_parsed[1] ? lang_parsed[1] : "");
						if (countryCode == "")
						{
							countryCode = lang;
						}
					}
				}
				if (countryCode == 'uk')
				{
					countryCode = "UA"
				}
				countryCode = countryCode.toUpperCase();
				callback(countryCode);
			});
		} catch (err) {
		}
	},
	customPlaceholder: function(selectedCountryPlaceholder, selectedCountryData) {
		var country_code = '+'+selectedCountryData['dialCode'];
		var rest_of_phone = selectedCountryPlaceholder.replace('+'+selectedCountryData['dialCode'], '');
		rest_of_phone = rest_of_phone.trim();
		var rest_of_phone_processed = '';
		for (var i = 0; i < rest_of_phone.length; i++)
		{
			if (rest_of_phone[i] == ' ' || rest_of_phone[i] == '-')
			{
				rest_of_phone_processed = rest_of_phone_processed+'-';
			}
			else
			{
				rest_of_phone_processed = rest_of_phone_processed+'_';
			}
		}

		return country_code+rest_of_phone_processed;
	},
	formatOnDisplay: false,
	nationalMode: false,
	utilsScript: adlots_obj.utils
});
