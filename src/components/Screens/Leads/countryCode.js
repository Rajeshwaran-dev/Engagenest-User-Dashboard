const countryCodeLengthMap = {
  91: 10, // India
  93: 9, // Afghanistan
  355: 9, // Albania
  213: 9, // Algeria
  1684: 7, // American Samoa
  376: 6, // Andorra
  244: 9, // Angola
  1264: 7, // Anguilla
  672: 6, // Antarctica
  1268: 7, // Antigua and Barbuda
  54: 10, // Argentina
  374: 8, // Armenia
  297: 7, // Aruba
  61: 9, // Australia
  43: 10, // Austria
  994: 9, // Azerbaijan
  1242: 7, // Bahamas
  973: 8, // Bahrain
  880: 10, // Bangladesh
  1246: 7, // Barbados
  375: 9, // Belarus
  32: 9, // Belgium
  501: 7, // Belize
  229: 8, // Benin
  1441: 7, // Bermuda
  975: 8, // Bhutan
  591: 8, // Bolivia
  387: 8, // Bosnia and Herzegovina
  267: 7, // Botswana
  55: 11, // Brazil
  246: 7, // British Indian Ocean Territory
  1284: 7, // British Virgin Islands
  673: 7, // Brunei
  359: 9, // Bulgaria
  226: 8, // Burkina Faso
  257: 8, // Burundi
  855: 9, // Cambodia
  237: 9, // Cameroon
  1: 10, // USA/Canada
  238: 7, // Cape Verde
  1345: 7, // Cayman Islands
  236: 8, // Central African Republic
  235: 9, // Chad
  56: 9, // Chile
  86: 11, // China
  57: 10, // Colombia
  269: 7, // Comoros
  682: 5, // Cook Islands
  506: 8, // Costa Rica
  385: 9, // Croatia
  53: 8, // Cuba
  599: 7, // Curacao
  357: 8, // Cyprus
  420: 9, // Czech Republic
  243: 9, // Congo (DRC)
  45: 8, // Denmark
  253: 6, // Djibouti
  1767: 7, // Dominica
  1809: 10, // Dominican Republic
  670: 8, // East Timor
  593: 9, // Ecuador
  20: 10, // Egypt
  503: 8, // El Salvador
  240: 9, // Equatorial Guinea
  291: 7, // Eritrea
  372: 7, // Estonia
  251: 9, // Ethiopia
  500: 5, // Falkland Islands
  298: 6, // Faroe Islands
  679: 7, // Fiji
  358: 10, // Finland
  33: 9, // France
  241: 9, // Gabon
  220: 7, // Gambia
  995: 9, // Georgia
  49: 10, // Germany
  233: 9, // Ghana
  350: 8, // Gibraltar
  30: 10, // Greece
  299: 6, // Greenland
  1473: 7, // Grenada
  1671: 7, // Guam
  502: 8, // Guatemala
  224: 9, // Guinea
  245: 9, // Guinea-Bissau
  592: 7, // Guyana
  509: 8, // Haiti
  504: 8, // Honduras
  852: 8, // Hong Kong
  36: 9, // Hungary
  354: 7, // Iceland
  62: 10, // Indonesia
  98: 10, // Iran
  964: 10, // Iraq
  353: 9, // Ireland
  972: 9, // Israel
  39: 10, // Italy
  225: 8, // Ivory Coast
  1876: 7, // Jamaica
  81: 10, // Japan
  962: 9, // Jordan
  7: 10, // Kazakhstan
  254: 9, // Kenya
  686: 8, // Kiribati
  383: 9, // Kosovo
  850: 17, //korea
  965: 8, // Kuwait
  996: 9, // Kyrgyzstan
  856: 8, // Laos
  371: 8, // Latvia
  961: 8, // Lebanon
  266: 8, // Lesotho
  231: 9, // Liberia
  218: 9, // Libya
  423: 7, // Liechtenstein
  370: 8, // Lithuania
  352: 9, // Luxembourg
  853: 8, // Macau
  389: 8, // Macedonia
  261: 9, // Madagascar
  265: 9, // Malawi
  60: 10, // Malaysia
  960: 7, // Maldives
  223: 8, // Mali
  356: 8, // Malta
  692: 7, // Marshall Islands
  222: 8, // Mauritania
  230: 8, // Mauritius
  262: 9, // Reunion
  52: 10, // Mexico
  691: 7, // Micronesia
  373: 8, // Moldova
  377: 9, // Monaco
  976: 8, // Mongolia
  382: 9, // Montenegro
  1664: 7, // Montserrat
  212: 9, // Morocco
  258: 9, // Mozambique
  95: 9, // Myanmar
  264: 8, // Namibia
  977: 10, // Nepal
  31: 9, // Netherlands
  687: 6, // New Caledonia
  64: 10, // New Zealand
  505: 8, // Nicaragua
  227: 8, // Niger
  234: 10, // Nigeria
  47: 8, // Norway
  968: 8, // Oman
  92: 10, // Pakistan
  680: 7, // Palau
  507: 8, // Panama
  675: 8, // Papua New Guinea
  595: 9, // Paraguay
  51: 9, // Peru
  63: 10, // Philippines
  48: 9, // Poland
  351: 9, // Portugal
  974: 8, // Qatar
  40: 10, // Romania
  7: 10, // Russia
  250: 9, // Rwanda
  590: 9, // Saint Martin
  966: 9, // Saudi Arabia
  221: 9, // Senegal
  381: 9, // Serbia
  248: 7, // Seychelles
  232: 9, // Sierra Leone
  65: 8, // Singapore
  421: 9, // Slovakia
  386: 9, // Slovenia
  677: 7, // Solomon Islands
  27: 9, // South Africa
  82: 10, // South Korea
  94: 10, // Sri Lanka
  46: 9, // Sweden
  41: 9, // Switzerland
  963: 9, // Syria
  886: 10, // Taiwan
  255: 9, // Tanzania
  66: 9, // Thailand
  228: 8, // Togo
  676: 7, // Tonga
  1868: 7, // Trinidad and Tobago
  216: 8, // Tunisia
  90: 10, // Turkey
  993: 8, // Turkmenistan
  256: 9, // Uganda
  380: 9, // Ukraine
  971: 9, // UAE
  44: 10, // UK
  598: 9, // Uruguay
  998: 9, // Uzbekistan
  678: 7, // Vanuatu
  58: 10, // Venezuela
  84: 10, // Vietnam
  260: 9, // Zambia
  263: 9, // Zimbabwe
};

export default countryCodeLengthMap;
