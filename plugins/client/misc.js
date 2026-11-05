function getCurrencyByPhoneNumber(phoneNumber) {
  const dialingToCurrency = {
    "1": "USD",       // USA, Canada
    "7": "RUB",       // Russia
    "20": "EGP",      // Egypt
    "27": "ZAR",      // South Africa
    "30": "EUR",      // Greece
    "31": "EUR",      // Netherlands
    "32": "EUR",      // Belgium
    "33": "EUR",      // France
    "34": "EUR",      // Spain
    "36": "HUF",      // Hungary
    "39": "EUR",      // Italy
    "40": "RON",      // Romania
    "41": "CHF",      // Switzerland
    "43": "EUR",      // Austria
    "44": "GBP",      // UK
    "45": "DKK",      // Denmark
    "46": "SEK",      // Sweden
    "47": "NOK",      // Norway
    "48": "PLN",      // Poland
    "49": "EUR",      // Germany
    "51": "PEN",      // Peru
    "52": "MXN",      // Mexico
    "53": "CUP",      // Cuba
    "54": "ARS",      // Argentina
    "55": "BRL",      // Brazil
    "56": "CLP",      // Chile
    "57": "COP",      // Colombia
    "58": "VES",      // Venezuela
    "60": "MYR",      // Malaysia
    "61": "AUD",      // Australia
    "62": "IDR",      // Indonesia
    "63": "PHP",      // Philippines
    "64": "NZD",      // New Zealand
    "65": "SGD",      // Singapore
    "66": "THB",      // Thailand
    "81": "JPY",      // Japan
    "82": "KRW",      // South Korea
    "84": "VND",      // Vietnam
    "86": "CNY",      // China
    "90": "TRY",      // Turkey
    "91": "INR",      // India
    "92": "PKR",      // Pakistan
    "93": "AFN",      // Afghanistan
    "94": "LKR",      // Sri Lanka
    "95": "MMK",      // Myanmar
    "98": "IRR",      // Iran
    "211": "SSP",     // South Sudan
    "212": "MAD",     // Morocco
    "213": "DZD",     // Algeria
    "216": "TND",     // Tunisia
    "218": "LYD",     // Libya
    "220": "GMD",     // Gambia
    "221": "XOF",     // Senegal
    "223": "XOF",     // Mali
    "225": "XOF",     // Côte d’Ivoire
    "226": "XOF",     // Burkina Faso
    "227": "XOF",     // Niger
    "228": "XOF",     // Togo
    "229": "XOF",     // Benin
    "230": "MUR",     // Mauritius
    "231": "LRD",     // Liberia
    "234": "NGN",     // Nigeria
    "235": "XAF",     // Chad
    "237": "XAF",     // Cameroon
    "254": "KES",     // Kenya
    "255": "TZS",     // Tanzania
    "256": "UGX",     // Uganda
    "260": "ZMW",     // Zambia
    "263": "ZWL",     // Zimbabwe
    "264": "NAD",     // Namibia
    "265": "MWK",     // Malawi
    "267": "BWP",     // Botswana
    "268": "SZL",     // Eswatini
    "850": "KPW",     // North Korea
    "852": "HKD",     // Hong Kong
    "853": "MOP",     // Macao
    "855": "KHR",     // Cambodia
    "856": "LAK",     // Laos
    "880": "BDT",     // Bangladesh
    "886": "TWD",     // Taiwan
    "961": "LBP",     // Lebanon
    "962": "JOD",     // Jordan
    "963": "SYP",     // Syria
    "964": "IQD",     // Iraq
    "965": "KWD",     // Kuwait
    "966": "SAR",     // Saudi Arabia
    "967": "YER",     // Yemen
    "968": "OMR",     // Oman
    "971": "AED",     // UAE
    "972": "ILS",     // Israel
    "973": "BHD",     // Bahrain
    "974": "QAR",     // Qatar
    "975": "BTN",     // Bhutan
    "976": "MNT",     // Mongolia
    "977": "NPR",     // Nepal
  };

  const numStr = phoneNumber.toString();

  for (let len = 4; len > 0; len--) {
    const prefix = numStr.substring(0, len);
    if (dialingToCurrency[prefix]) {
      return dialingToCurrency[prefix];
    }
  }

  return 'USD';
};

module.exports = { 
  getCurrencyByPhoneNumber
};
