// ==MiruExtension==
// @name         IPTV-ORG
// @version      v0.0.2
// @author       vvsolo
// @lang         all
// @license      MIT
// @type         bangumi
// @icon         https://avatars.githubusercontent.com/u/55937028?s=200&v=4
// @package      iptv-org
// @webSite      https://iptv-org.github.io/iptv
// @description  iptv-org
// ==/MiruExtension==

export default class extends Extension {
	#sources = {"categories":{"Auto-generated[27]":"@auto","Animation[235]":"animation","Auto[25]":"auto","Business[146]":"business","Classic[38]":"classic","Comedy[98]":"comedy","Cooking[62]":"cooking","Culture[139]":"culture","Documentary[246]":"documentary","Entertainment[834]":"entertainment","Family[170]":"family","General[2087]":"general","Kids[287]":"kids","Legislative[148]":"legislative","Lifestyle[127]":"lifestyle","Movies[460]":"movies","Music[674]":"music","News[1179]":"news","Outdoor[37]":"outdoor","Relax[32]":"relax","Religious[478]":"religious","Series[303]":"series","Science[38]":"science","Shop[80]":"shop","Sports[463]":"sports","Travel[34]":"travel","Weather[36]":"weather","XXX[38]":"xxx"},"languages":{"Afar[2]":"aar","Abkhazian[2]":"abk","Afrikaans[12]":"afr","Akan[6]":"aka","Amharic[18]":"amh","Arabic[460]":"ara","Assamese[10]":"asm","Aymara[3]":"aym","Azerbaijani[20]":"aze","Bashkir[2]":"bak","Bambara[2]":"bam","Bengali[98]":"ben","Bislama[3]":"bis","Tibetan[2]":"bod","Bosnian[18]":"bos","Bulgarian[30]":"bul","Catalan[34]":"cat","Czech[40]":"ces","Chechen[2]":"che","Chinese[299]":"zho","Church Slavic[1]":"chu","Chuvash[1]":"chv","Corsican[1]":"cos","Welsh[2]":"cym","Danish[23]":"dan","German[222]":"deu","Maldivian[6]":"div","Dzongkha[2]":"dzo","Ewe[3]":"ewe","Greek[98]":"ell","English[1781]":"eng","Esperanto[2]":"epo","Spanish[1147]":"spa","Estonian[10]":"est","Basque[6]":"eus","Persian[82]":"fas","Fula[5]":"ful","Finnish[22]":"fin","Fijian[2]":"fij","Faroese[2]":"fao","French[304]":"fra","Western Frisian[2]":"fry","Irish[4]":"gle","Gaelic[2]":"gla","Galician[5]":"glg","Guarani[2]":"grn","Gujarati[15]":"guj","Manx[1]":"glv","Hausa[8]":"hau","Hebrew[32]":"heb","Hindi[146]":"hin","Hiri Motu[1]":"hmo","Croatian[42]":"hrv","Haitian[10]":"hat","Hungarian[42]":"hun","Armenian[23]":"hye","Interlingua[1]":"ina","Indonesian[111]":"ind","Igbo[3]":"ibo","Sichuan Yi[1]":"iii","Inuktitut[2]":"iku","Icelandic[6]":"isl","Italian[221]":"ita","Inupiaq[1]":"ipk","Japanese[78]":"jpn","Javanese[2]":"jav","Georgian[29]":"kat","Kikuyu[1]":"kik","Kazakh[27]":"kaz","Kalaallisut[2]":"kal","Khmer[25]":"khm","Kannada[29]":"kan","Korean[115]":"kor","Kashmiri[1]":"kas","Kurdish[40]":"kur","Komi[1]":"kom","Kirghiz[7]":"kir","Latin[13]":"lat","Luxembourgish[7]":"ltz","Ganda[2]":"lug","Limburgish[2]":"lim","Lingala[4]":"lin","Lao[8]":"lao","Lithuanian[22]":"lit","Luba-Katanga[1]":"lub","Latvian[15]":"lav","Malagasy[6]":"mlg","Macedonian[10]":"mkd","Malayalam[65]":"mal","Mongolian[13]":"mon","Marathi[31]":"mar","Malay[40]":"msa","Maltese[6]":"mlt","Burmese[8]":"mya","Nauru[1]":"nau","Navajo[1]":"nav","North Ndebele[1]":"nde","Nepali[28]":"nep","Dutch[112]":"nld","Norwegian Nynorsk[1]":"nno","Norwegian[29]":"nor","South Ndebele[1]":"nbl","Chichewa[2]":"nya","Occitan[2]":"oci","Oromo[2]":"orm","Oriya[16]":"ori","Ossetian[1]":"oss","Panjabi[38]":"pan","Pali[1]":"pli","Polish[93]":"pol","Pashto[16]":"pus","Portuguese[283]":"por","Quechua[2]":"que","Romansh[1]":"roh","Rundi[1]":"run","Romanian[116]":"ron","Russian[380]":"rus","Kinyarwanda[4]":"kin","Sanskrit[2]":"san","Sardinian[1]":"srd","Sindhi[7]":"snd","Northern Sami[1]":"sme","Sango[1]":"sag","Sinhala[14]":"sin","Slovak[46]":"slk","Slovenian[17]":"slv","Samoan[2]":"smo","Shona[1]":"sna","Somali[24]":"som","Albanian[86]":"sqi","Serbian[68]":"srp","Swati[1]":"ssw","Southern Sotho[1]":"sot","Sundanese[1]":"sun","Swedish[39]":"swe","Swahili[20]":"swa","Tamil[69]":"tam","Telugu[47]":"tel","Tajik[10]":"tgk","Thai[71]":"tha","Tigrinya[2]":"tir","Turkmen[8]":"tuk","Tagalog[41]":"tgl","Tswana[2]":"tsn","Tonga[3]":"ton","Turkish[200]":"tur","Tsonga[1]":"tso","Tatar[6]":"tat","Twi[5]":"twi","Tahitian[2]":"tah","Uighur[2]":"uig","Ukrainian[94]":"ukr","Urdu[69]":"urd","Uzbek[26]":"uzb","Venda[1]":"ven","Vietnamese[101]":"vie","Walloon[1]":"wln","Wolof[3]":"wol","Xhosa[1]":"xho","Yiddish[2]":"yid","Yoruba[6]":"yor","Zhuang[1]":"zha","Zulu[4]":"zul"},"countries":{"🇦🇫 Afghanistan[32]":"af","🇦🇱 Albania[82]":"al","🇩🇿 Algeria[39]":"dz","🇦🇸 American Samoa[5]":"as","🇦🇩 Andorra[4]":"ad","🇦🇴 Angola[18]":"ao","🇦🇮 Anguilla[5]":"ai","🇦🇬 Antigua and Barbuda[5]":"ag","🇦🇷 Argentina[136]":"ar","@Buenos Aires[4]":"ar-b","@Cordoba[3]":"ar-x","@Santa Fe[1]":"ar-s","🇦🇲 Armenia[25]":"am","🇦🇼 Aruba[9]":"aw","🇦🇺 Australia[73]":"au","@New South Wales[10]":"au-nsw","@Northern Territory[1]":"au-nt","@Queensland[4]":"au-qld","@South Australia[1]":"au-sa","@Tasmania[2]":"au-tas","@Victoria[3]":"au-vic","@Western Australia[3]":"au-wa","🇦🇹 Austria[50]":"at","🇦🇿 Azerbaijan[20]":"az","🇧🇸 Bahamas[5]":"bs","🇧🇭 Bahrain[10]":"bh","🇧🇩 Bangladesh[56]":"bd","🇧🇧 Barbados[5]":"bb","🇧🇾 Belarus[25]":"by","🇧🇪 Belgium[52]":"be","🇧🇿 Belize[5]":"bz","🇧🇯 Benin[14]":"bj","🇧🇲 Bermuda[5]":"bm","🇧🇹 Bhutan[2]":"bt","🇧🇴 Bolivia[50]":"bo","🇧🇦 Bosnia and Herzegovina[32]":"ba","🇧🇼 Botswana[5]":"bw","🇧🇷 Brazil[493]":"br","@Acre[1]":"br-ac","@Alagoas[4]":"br-al","@Amapa[2]":"br-ap","@Amazonas[6]":"br-am","@Bahia[20]":"br-ba","@Ceara[12]":"br-ce","@Distrito Federal[1]":"br-df","@Espirito Santo[12]":"br-es","@Goias[8]":"br-go","@Maranhao[3]":"br-ma","@Mato Grosso[5]":"br-mt","@Mato Grosso do Sul[3]":"br-ms","@Minas Gerais[17]":"br-mg","@Para[2]":"br-pa","@Paraiba[3]":"br-pb","@Parana[19]":"br-pr","@Pernambuco[11]":"br-pe","@Piaui[2]":"br-pi","@Rio de Janeiro[11]":"br-rj","@Rio Grande do Norte[4]":"br-rn","@Rio Grande do Sul[17]":"br-rs","@Rondonia[5]":"br-ro","@Roraima[2]":"br-rr","@Santa Catarina[21]":"br-sc","@Sao Paulo[34]":"br-sp","@Sergipe[3]":"br-se","@Tocantins[1]":"br-to","🇻🇬 British Virgin Islands[5]":"vg","🇧🇳 Brunei[5]":"bn","🇧🇬 Bulgaria[40]":"bg","🇧🇫 Burkina Faso[9]":"bf","🇧🇮 Burundi[5]":"bi","🇰🇭 Cambodia[27]":"kh","🇨M Cameroon[18]":"cm","🇨🇦 Canada[78]":"ca","@Alberta[3]":"ca-ab","@British Columbia[3]":"ca-bc","@Manitoba[1]":"ca-mb","@New Brunswick[1]":"ca-nb","@Newfoundland and Labrador[1]":"ca-nl","@Nova Scotia[1]":"ca-ns","@Ontario[11]":"ca-on","@Prince Edward Island[1]":"ca-pe","@Quebec[5]":"ca-qc","@Saskatchewan[1]":"ca-sk","🇨🇻 Cape Verde[6]":"cv","🇰🇾 Cayman Islands[5]":"ky","🇨🇫 Central African Republic[5]":"cf","🇹🇩 Chad[6]":"td","🇨🇱 Chile[79]":"cl","🇨🇳 China[199]":"cn","@Anhui[1]":"cn-ah","@Beijing[2]":"cn-bj","@Chongqing[2]":"cn-cq","@Fujian[2]":"cn-fj","@Guangdong[6]":"cn-gd","@Guangxi[1]":"cn-gx","@Guizhou[1]":"cn-gz","@Hainan[1]":"cn-hi","@Hebei[1]":"cn-he","@Heilongjiang[1]":"cn-hl","@Henan[1]":"cn-ha","@Hong Kong[32]":"hk","@Hubei[1]":"cn-hb","@Hunan[1]":"cn-hn","@Inner Mongolia[1]":"cn-nm","@Jiangsu[1]":"cn-js","@Jiangxi[1]":"cn-jx","@Jilin[1]":"cn-jl","@Liaoning[1]":"cn-ln","@Macau[8]":"mo","@Ningxia[1]":"cn-nx","@Qinghai[1]":"cn-qh","@Shaanxi[1]":"cn-sn","@Shandong[1]":"cn-sd","@Shanghai[2]":"cn-sh","@Shanxi[1]":"cn-sx","@Sichuan[1]":"cn-sc","@Tianjin[2]":"cn-tj","@Xinjiang[1]":"cn-xj","@Xizang[1]":"cn-xz","@Yunnan[1]":"cn-yn","@Zhejiang[1]":"cn-zj","🇨🇴 Colombia[86]":"co","🇰🇲 Comoros[5]":"km","🇨🇬 Congo[5]":"cg","🇨🇰 Cook Islands[5]":"ck","🇨🇷 Costa Rica[35]":"cr","🇭🇷 Croatia[48]":"hr","🇨🇺 Cuba[10]":"cu","🇨🇼 Curaçao[9]":"cw","🇨🇾 Cyprus[27]":"cy","🇨🇿 Czech Republic[52]":"cz","🇨🇩 DR Congo[12]":"cd","🇩🇰 Denmark[25]":"dk","🇩🇯 Djibouti[5]":"dj","🇩🇲 Dominica[5]":"dm","🇩🇴 Dominican Republic[62]":"do","🇪🇨 Ecuador[44]":"ec","🇪🇬 Egypt[87]":"eg","🇸🇻 El Salvador[28]":"sv","🇬🇶 Equatorial Guinea[5]":"gq","🇪🇷 Eritrea[5]":"er","🇪🇪 Estonia[12]":"ee","🇪🇹 Ethiopia[19]":"et","🇫🇴 Faroe Islands[5]":"fo","🇫🇯 Fiji[6]":"fj","🇫🇮 Finland[26]":"fi","🇫🇷 France[158]":"fr","@Auvergne-Rhone-Alpes[2]":"fr-ara","@Bourgogne-Franche-Comte[1]":"fr-bfc","@Bretagne[2]":"fr-bre","@Centre-Val de Loire[1]":"fr-cvl","@Corsica[1]":"fr-cor","@Grand Est[3]":"fr-ges","@Hauts-de-France[1]":"fr-hdf","@Ile-de-France[1]":"fr-idf","@Normandie[1]":"fr-nor","@Nouvelle-Aquitaine[1]":"fr-naq","@Occitanie[2]":"fr-occ","@Pays de la Loire[1]":"fr-pdl","@Provence-Alpes-Cote d'Azur[1]":"fr-pac","🇬🇫 French Guiana[5]":"gf","🇵🇫 French Polynesia[7]":"pf","🇹🇫 French Southern Territories[2]":"tf","🇬🇦 Gabon[7]":"ga","🇬🇲 Gambia[5]":"gm","🇬🇪 Georgia[28]":"ge","🇩🇪 Germany[230]":"de","@Baden-Wurttemberg[4]":"de-bw","@Bayern[9]":"de-by","@Berlin[2]":"de-be","@Brandenburg[1]":"de-bb","@Bremen[1]":"de-hb","@Hamburg[1]":"de-hh","@Hessen[2]":"de-he","@Mecklenburg-Vorpommern[1]":"de-mv","@Niedersachsen[3]":"de-ni","@Nordrhein-Westfalen[8]":"de-nw","@Rheinland-Pfalz[1]":"de-rp","@Saarland[1]":"de-sl","@Sachsen[2]":"de-sn","@Sachsen-Anhalt[1]":"de-st","@Schleswig-Holstein[1]":"de-sh","@Thuringen[1]":"de-th","🇬🇭 Ghana[18]":"gh","🇬🇮 Gibraltar[5]":"gi","🇬🇷 Greece[106]":"gr","🇬🇱 Greenland[5]":"gl","🇬🇩 Grenada[5]":"gd","🇬🇵 Guadeloupe[6]":"gp","🇬🇺 Guam[5]":"gu","🇬🇹 Guatemala[31]":"gt","🇬🇬 Guernsey[5]":"gg","🇬🇳 Guinea[6]":"gn","🇬🇼 Guinea-Bissau[5]":"gw","🇬🇾 Guyana[5]":"gy","🇭🇹 Haiti[13]":"ht","🇭🇳 Honduras[40]":"hn","🇭🇺 Hungary[47]":"hu","🇮🇸 Iceland[7]":"is","🇮🇳 India[398]":"in","@Andhra Pradesh[2]":"in-ap","@Assam[1]":"in-as","@Bihar[1]":"in-br","@Chandigarh[1]":"in-ch","@Delhi[1]":"in-dl","@Gujarat[3]":"in-gj","@Haryana[1]":"in-hr","@Himachal Pradesh[1]":"in-hp","@Jammu and Kashmir[1]":"in-jk","@Karnataka[2]":"in-ka","@Kerala[1]":"in-kl","@Madhya Pradesh[1]":"in-mp","@Maharashtra[1]":"in-mh","@Odisha[1]":"in-or","@Puducherry[1]":"in-py","@Punjab[1]":"in-pb","@Rajasthan[1]":"in-rj","@Tamil Nadu[1]":"in-tn","@Telangana[1]":"in-tg","@Uttar Pradesh[2]":"in-up","@West Bengal[1]":"in-wb","🇮🇩 Indonesia[116]":"id","🇮🇷 Iran[91]":"ir","🇮🇶 Iraq[44]":"iq","🇮🇪 Ireland[18]":"ie","🇮🇲 Isle of Man[5]":"im","🇮🇱 Israel[35]":"il","🇮🇹 Italy[239]":"it","@Abruzzo[2]":"it-65","@Basilicata[2]":"it-77","@Calabria[4]":"it-78","@Campania[12]":"it-72","@Emilia-Romagna[10]":"it-45","@Friuli-Venezia Giulia[2]":"it-36","@Lazio[13]":"it-62","@Liguria[2]":"it-42","@Lombardia[22]":"it-25","@Marche[2]":"it-57","@Molise[1]":"it-67","@Piemonte[6]":"it-21","@Puglia[9]":"it-75","@Sardegna[2]":"it-88","@Sicilia[10]":"it-82","@Toscana[13]":"it-52","@Trentino-Alto Adige[4]":"it-32","@Umbria[1]":"it-55","@Valle d'Aosta[1]":"it-23","@Veneto[7]":"it-34","🇨🇮 Ivory Coast[13]":"ci","🇯🇲 Jamaica[11]":"jm","🇯🇵 Japan[78]":"jp","🇯🇪 Jersey[5]":"je","🇯🇴 Jordan[19]":"jo","🇰🇿 Kazakhstan[33]":"kz","🇰🇪 Kenya[17]":"ke","🇰🇮 Kiribati[5]":"ki","🇽🇰 Kosovo[28]":"xk","🇰🇼 Kuwait[17]":"kw","🇰🇬 Kyrgyzstan[11]":"kg","🇱🇦 Laos[8]":"la","🇱🇻 Latvia[18]":"lv","🇱🇧 Lebanon[26]":"lb","🇱🇸 Lesotho[5]":"ls","🇱🇷 Liberia[5]":"lr","🇱🇾 Libya[16]":"ly","🇱🇮 Liechtenstein[5]":"li","🇱🇹 Lithuania[23]":"lt","🇱🇺 Luxembourg[9]":"lu","🇲🇰 North Macedonia[14]":"mk","🇲🇬 Madagascar[8]":"mg","🇲🇼 Malawi[5]":"mw","🇲🇾 Malaysia[45]":"my","🇲🇻 Maldives[8]":"mv","🇲🇱 Mali[12]":"ml","🇲🇹 Malta[7]":"mt","🇲🇭 Marshall Islands[5]":"mh","🇲🇶 Martinique[6]":"mq","🇲🇷 Mauritania[7]":"mr","🇲🇺 Mauritius[7]":"mu","🇾🇹 Mayotte[5]":"yt","🇲🇽 Mexico[128]":"mx","@Aguascalientes[1]":"mx-agu","@Baja California[2]":"mx-bcn","@Chihuahua[1]":"mx-chh","@Coahuila[1]":"mx-coa","@Colima[2]":"mx-col","@Durango[2]":"mx-dur","@Guanajuato[2]":"mx-gua","@Guerrero[1]":"mx-gro","@Hidalgo[2]":"mx-hid","@Jalisco[6]":"mx-jal","@Mexico[2]":"mx-mex","@Michoacan[3]":"mx-mic","@Morelos[1]":"mx-mor","@Nayarit[1]":"mx-nay","@Nuevo Leon[4]":"mx-nle","@Oaxaca[2]":"mx-oax","@Puebla[3]":"mx-pue","@Queretaro[1]":"mx-que","@Quintana Roo[1]":"mx-roo","@San Luis Potosi[2]":"mx-slp","@Sinaloa[1]":"mx-sin","@Sonora[2]":"mx-son","@Tabasco[1]":"mx-tab","@Tamaulipas[1]":"mx-tam","@Veracruz[1]":"mx-ver","@Yucatan[1]":"mx-yuc","@Zacatecas[1]":"mx-zac","🇫🇲 Micronesia[5]":"fm","🇲🇩 Moldova[26]":"md","🇲🇨 Monaco[5]":"mc","🇲🇳 Mongolia[16]":"mn","🇲🇪 Montenegro[18]":"me","🇲🇸 Montserrat[5]":"ms","🇲🇦 Morocco[28]":"ma","🇲🇿 Mozambique[8]":"mz","🇲🇲 Myanmar[9]":"mm","🇳🇦 Namibia[5]":"na","🇳🇷 Nauru[5]":"nr","🇳🇵 Nepal[29]":"np","🇳🇱 Netherlands[85]":"nl","NC New Caledonia[5]":"nc","🇳🇿 New Zealand[11]":"nz","🇳🇮 Nicaragua[15]":"ni","🇳🇪 Niger[7]":"ne","🇳🇬 Nigeria[32]":"ng","🇳🇺 Niue[5]":"nu","🇳🇫 Norfolk Island[5]":"nf","🇰🇵 North Korea[7]":"kp","🇲🇵 Northern Mariana Islands[5]":"mp","🇳🇴 Norway[31]":"no","🇴🇲 Oman[10]":"om","🇵🇰 Pakistan[76]":"pk","🇵🇼 Palau[5]":"pw","🇵🇸 Palestine[21]":"ps","🇵🇦 Panama[17]":"pa","🇵🇬 Papua New Guinea[5]":"pg","🇵🇾 Paraguay[22]":"py","🇵🇪 Peru[81]":"pe","🇵🇭 Philippines[55]":"ph","🇵🇳 Pitcairn Islands[2]":"pn","🇵🇱 Poland[96]":"pl","🇵🇹 Portugal[57]":"pt","🇵🇷 Puerto Rico[14]":"pr","🇶🇦 Qatar[17]":"qa","🇷🇪 Réunion[5]":"re","🇷🇴 Romania[129]":"ro","🇷🇺 Russia[396]":"ru","@Adygeya[1]":"ru-ad","@Altai Krai[2]":"ru-alt","@Amur Oblast[2]":"ru-amu","@Arkhangelsk Oblast[1]":"ru-ark","@Astrakhan Oblast[1]":"ru-ast","@Bashkortostan[3]":"ru-ba","@Belgorod Oblast[1]":"ru-bel","@Bryansk Oblast[1]":"ru-bry","@Buryatiya[1]":"ru-bu","@Chechenskaya[2]":"ru-ce","@Chelyabinsk Oblast[2]":"ru-che","@Chuvashskaya[2]":"ru-cu","@Dagestan[2]":"ru-da","@Irkutsk Oblast[2]":"ru-irk","@Ivanovo Oblast[1]":"ru-iva","@Kabardino-Balkarskaya[1]":"ru-kb","@Kaliningrad Oblast[1]":"ru-kgd","@Kaluga Oblast[1]":"ru-klu","@Kamchatka Krai[1]":"ru-kam","@Karachayevo-Cherkesskaya[1]":"ru-kc","@Kareliya[1]":"ru-kr","@Kemerovo Oblast[1]":"ru-kem","@Khabarovsk Krai[1]":"ru-khb","@Khakasiya[1]":"ru-kk","@Khanty-Mansiysky[2]":"ru-khm","@Kirov Oblast[1]":"ru-kir","@Komi[1]":"ru-ko","@Kostroma Oblast[1]":"ru-kst","@Krasnodar Krai[6]":"ru-kda","@Krasnoyarsk Krai[2]":"ru-kya","@Kurgan Oblast[1]":"ru-kgn","@Kursk Oblast[1]":"ru-krs","@Leningradskaya Oblast[1]":"ru-len","@Lipetsk Oblast[1]":"ru-lip","@Marii El[1]":"ru-me","@Mordoviya[1]":"ru-mo","@Moskva[4]":"ru-mow","@Moskovskaya Oblast[1]":"ru-mos","@Murmansk Oblast[1]":"ru-mur","@Nizhny Novgorod Oblast[1]":"ru-niz","@Novgorod Oblast[1]":"ru-nvr","@Novosibirsk Oblast[1]":"ru-nvs","@Omsk Oblast[1]":"ru-oms","@Orenburg Oblast[1]":"ru-ore","@Oryol Oblast[1]":"ru-orl","@Penza Oblast[1]":"ru-pnz","@Perm Krai[2]":"ru-per","@Primorsky Krai[1]":"ru-pri","@Pskov Oblast[1]":"ru-psk","@Rostov Oblast[2]":"ru-ros","@Ryazan Oblast[1]":"ru-rya","@Sakha[2]":"ru-sa","@Sakhalin Oblast[1]":"ru-sak","@Samara Oblast[2]":"ru-sam","@Sankt-Peterburg[2]":"ru-spe","@Saratov Oblast[2]":"ru-sar","@Sevastopol[1]":"ru-sev","@Smolensk Oblast[1]":"ru-smo","@Stavropol Krai[1]":"ru-sta","@Sverdlovsk Oblast[2]":"ru-sve","@Tambov Oblast[1]":"ru-tam","@Tatarstan[4]":"ru-ta","@Tomsk Oblast[1]":"ru-tom","@Tula Oblast[1]":"ru-tul","@Tver Oblast[1]":"ru-tve","@Tyumen Oblast[1]":"ru-tyu","@Udmurtskaya[1]":"ru-ud","@Ulyanovsk Oblast[1]":"ru-uly","@Vladimir Oblast[1]":"ru-vla","@Volgograd Oblast[1]":"ru-vlg","@Vologda Oblast[1]":"ru-vlg","@Voronezh Oblast[1]":"ru-vor","@Yamalo-Nenetsky[1]":"ru-yan","@Yaroslavl Oblast[1]":"ru-yar","@Zabaykalsky Krai[1]":"ru-zab","🇷🇼 Rwanda[8]":"rw","🇸🇱 Saint Helena[5]":"sh","🇰🇳 Saint Kitts and Nevis[5]":"kn","🇱🇨 Saint Lucia[5]":"lc","🇵🇲 Saint Pierre and Miquelon[5]":"pm","🇻🇨 Saint Vincent and the Grenadines[5]":"vc","🇼🇸 Samoa[5]":"ws","🇸🇲 San Marino[5]":"sm","🇸🇹 Sao Tome and Principe[5]":"st","🇸🇦 Saudi Arabia[59]":"sa","🇸🇳 Senegal[14]":"sn","🇷🇸 Serbia[73]":"rs","🇸🇨 Seychelles[5]":"sc","🇸🇱 Sierra Leone[5]":"sl","🇸🇬 Singapore[16]":"sg","🇸🇽 Sint Maarten[14]":"sx","🇸🇰 Slovakia[65]":"sk","🇸🇮 Slovenia[38]":"si","🇸🇧 Solomon Islands[5]":"sb","🇸🇴 Somalia[57]":"so","🇿🇦 South Africa[52]":"za","🇬🇸 South Georgia and the South Sandwich Islands[3]":"gs","🇰🇷 South Korea[118]":"kr","@Busan-gwangyeoksi[3]":"kr-26","@Chungcheongbuk-do[2]":"kr-43","@Daegu-gwangyeoksi[3]":"kr-27","@Daejeon-gwangyeoksi[2]":"kr-30","@Gangwon-do[3]":"kr-42","@Gwangju-gwangyeoksi[1]":"kr-29","@Gyeonggi-do[1]":"kr-41","@Gyeongsangbuk-do[1]":"kr-47","@Gyeongsangnam-do[1]":"kr-48","@Jeju-teukbyeoljachido[1]":"kr-49","@Jeollabuk-do[1]":"kr-45","@Jeollanam-do[4]":"kr-46","@Seoul-teukbyeolsi[1]":"kr-11","@Ulsan-gwangyeoksi[2]":"kr-31","🇸🇸 South Sudan[19]":"ss","🇪🇸 Spain[318]":"es","@Andalucia[39]":"es-an","@Aragon[1]":"es-ar","@Asturias, Principado de[2]":"es-as","@Canarias[11]":"es-cn","@Castilla y Leon[1]":"es-cl","@Castilla-La Mancha[5]":"es-cm","@Catalunya[38]":"es-ct","@Ceuta[1]":"es-ce","@Extremadura[1]":"es-ex","@Galicia[5]":"es-ga","@Illes Balears[1]":"es-ib","@La Rioja[1]":"es-ri","@Madrid, Comunidad de[5]":"es-md","@Murcia, Region de[3]":"es-mc","@Navarra, Comunidad Foral de[1]":"es-nc","@Pais Vasco[6]":"es-pv","@Valenciana, Comunidad[15]":"es-vc","🇱🇰 Sri Lanka[21]":"lk","🇸🇩 Sudan[57]":"sd","🇸🇷 Suriname[4]":"sr","🇸🇿 Swaziland[20]":"sz","🇸🇪 Sweden[42]":"se","🇨🇭 Switzerland[73]":"ch","🇸🇾 Syria[47]":"sy","🇹🇼 Taiwan[75]":"tw","🇹🇯 Tajikistan[12]":"tj","🇹🇿 Tanzania[31]":"tz","🇹🇭 Thailand[95]":"th","🇹🇬 Togo[25]":"tg","🇹🇰 Tokelau[5]":"tk","🇹🇴 Tonga[5]":"to","🇹🇹 Trinidad and Tobago[13]":"tt","🇹🇳 Tunisia[62]":"tn","🇹🇷 Turkey[224]":"tr","🇹🇲 Turkmenistan[8]":"tm","🇹🇨 Turks and Caicos Islands[10]":"tc","🇹🇻 Tuvalu[5]":"tv","🇻🇮 U.S. Virgin Islands[10]":"vi","🇺🇬 Uganda[37]":"ug","🇺🇦 Ukraine[101]":"ua","🇦🇪 United Arab Emirates[81]":"ae","🇬🇧 United Kingdom[204]":"uk","@Wales[2]":"gb-wls","🇺🇸 United States[1719]":"us","@Alabama[3]":"us-al","@Alaska[1]":"us-ak","@Arizona[13]":"us-az","@Arkansas[5]":"us-ar","@California[147]":"us-ca","@Colorado[18]":"us-co","@Connecticut[19]":"us-ct","@Delaware[6]":"us-de","@District of Columbia[5]":"us-dc","@Florida[46]":"us-fl","@Georgia[8]":"us-ga","@Guam[1]":"us-gu","@Hawaii[5]":"us-hi","@Idaho[1]":"us-id","@Illinois[6]":"us-il","@Indiana[2]":"us-in","@Iowa[1]":"us-ia","@Kansas[13]":"us-ks","@Kentucky[7]":"us-ky","@Louisiana[4]":"us-la","@Maine[1]":"us-me","@Maryland[4]":"us-md","@Massachusetts[6]":"us-ma","@Michigan[8]":"us-mi","@Minnesota[6]":"us-mn","@Mississippi[3]":"us-ms","@Missouri[2]":"us-mo","@Montana[4]":"us-mt","@Nebraska[3]":"us-ne","@Nevada[1]":"us-nv","@New Hampshire[4]":"us-nh","@New Jersey[2]":"us-nj","@New Mexico[1]":"us-nm","@New York[17]":"us-ny","@North Carolina[6]":"us-nc","@North Dakota[3]":"us-nd","@Ohio[6]":"us-oh","@Oklahoma[3]":"us-ok","@Pennsylvania[11]":"us-pa","@South Carolina[1]":"us-sc","@Tennessee[4]":"us-tn","@Texas[19]":"us-tx","@Utah[1]":"us-ut","@Virginia[2]":"us-va","@Washington[7]":"us-wa","@Wisconsin[3]":"us-wi","🇺🇾 Uruguay[74]":"uy","🇺🇿 Uzbekistan[29]":"uz","🇻🇺 Vanuatu[5]":"vu","🇻🇦 Vatican City[17]":"va","🇻🇪 Venezuela[133]":"ve","@Aragua[2]":"ve-d","@Lara[1]":"ve-k","🇻🇳 Vietnam[106]":"vn","🇼🇫 Wallis and Futuna[5]":"wf","🇪🇭 Western Sahara[24]":"eh","🇾🇪 Yemen[45]":"ye","🇿🇲 Zambia[20]":"zm","🇿🇼 Zimbabwe[22]":"zw","🌍 International[68]":"int"},"regions":{"Africa[472]":"afr","Americas[3903]":"amer","Arab world[397]":"arab","Asia[3053]":"asia","Asia-Pacific[1990]":"apac","Association of Southeast Asian Nations[430]":"asean","Balkan[664]":"balkan","Benelux[236]":"benelux","Caribbean[271]":"carib","Central America[273]":"cenamer","Central and Eastern Europe[1146]":"cee","Central Asia[67]":"cas","Commonwealth of Independent States[523]":"cis","Europe[3352]":"eur","Europe, the Middle East and Africa[4198]":"emea","European Union[2187]":"eu","Hispanic America[1714]":"hispam","Latin America[2028]":"latam","Latin America and the Caribbean[2059]":"lac","Maghreb[61]":"maghreb","Middle East[688]":"mideast","Middle East and North Africa[739]":"mena","Nordics[93]":"nord","North America[2614]":"noram","Northern America[1866]":"nam","Northern Europe[128]":"neur","Oceania[82]":"oce","South America[1298]":"southam","South Asia[601]":"sas","Southeast Asia[443]":"sea","Southern Europe[1096]":"ser","Sub-Saharan Africa[380]":"ssa","West Africa[163]":"wafr","Western Europe[994]":"wer"}}
	
	#opts = {
		types: {
			countries: 'countries',
			languages: 'languages',
			categories: 'categories',
			regions: 'regions',
		},
		type: 'countries',
		source: '/countries/int.m3u',
	}

	#defaultGroup = {"All": "All"};
	#cache = {
		res: {},
		items: [],
		groups: this.#defaultGroup,
		uptime: 0,
		sources: {},
	}

	async load() {
		await this.registerSetting({
			title: 'Cache Expire Time',
			key: 'Expire',
			type: 'radio',
			description: 'Set `none` is no cache\nTips: After changing your country, the delay will be refreshed',
			defaultValue: '60',
			options: {
				'none': '0',
				'15 minute': '15',
				'30 minute': '30',
				'1 hour': '60',
				'6 hour': '360',
				'12 hour': '720',
				'1 day': '1440',
			}
		});
		await this.registerSetting({
			title: 'Choose Group by →→→',
			description: `First select the group type,\nand then select the source in the following corresponding grouping`,
			key: 'GroupBy',
			type: 'radio',
			defaultValue: this.#opts.type,
			options: this.#opts.types
		});

		for(let v in this.#opts.types) {
			let groups = {};
			for (let k in this.#sources[v]) {
				if (k.startsWith('@')) {
					groups[`     ${k.slice(1)}`] = `/subdivisions/${this.#sources[v][k]}.m3u`;
				} else {
					groups[k] = `/${v}/${this.#sources[v][k]}.m3u`
				}
			}
			this.#sources[v] = groups;
			await this.registerSetting({
				title: `　　choose from these ${v}`,
				key: v,
				type: 'radio',
				defaultValue: this.#opts.source,
				options: groups
			});
		}
	}

	async req(path) {
		const url = path.startsWith('http') ? path : `https://iptv-org.github.io/iptv${path.startsWith('/') ? '' : '/'}${path}`;
		return await this.request(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
			}
		});
	}

	async checkExpire() {
		const expire = +(await this.getSetting('Expire'));
		return expire > 0 && (Date.now() - this.#cache.uptime) < expire*60*1000;
	}

	async createFilter(filter) {
		const filt = filter?.data && filter.data[0] || '';
		// multiple groups
		this.#cache.groups = (this.#cache.items || [])
			.map(v => v.group && v.group.split(';'))
			.flat()
			.reduce((g, v) => {
				return v ? {...g, [v]: v} : g;
			}, this.#defaultGroup);

		let title = "";
		const rawGroupBy = await this.getSetting('GroupBy');
		const GroupBy = this.#opts.types[rawGroupBy] || rawGroupBy || 'countries';
		const groupDict = this.#sources[GroupBy] || {};
		for (let [name, item] of Object.entries(groupDict)) {
			if (item === this.#opts.source) {
				title = `${GroupBy} - ${name.trim()}`;
				break;
			}
		}

		return {
			"data": {
				title,
				max: 1,
				min: 1,
				default: filt || "All",
				options: this.#cache.groups,
			}
		}
	}
	
	async latest(page) {
		if (page > 1) {
			return [];
		}
		const rawGroupBy = await this.getSetting('GroupBy');
		const GroupBy = this.#opts.types[rawGroupBy] || rawGroupBy || 'countries';
		const rawSource = await this.getSetting(GroupBy);
		const groupDict = this.#sources[GroupBy] || {};
		let baseUrl = groupDict[rawSource] || rawSource || this.#opts.source;
		
		// cache source content
		const md5path = md5(baseUrl);
		if (
			md5path in this.#cache.res &&
			await this.checkExpire()
		) {
			return (this.#cache.items = this.#cache.res[md5path]);
		}
		const resRaw = await this.req(baseUrl);
		if (!resRaw) {
			return (this.#cache.items = []);
		}
		const res = resRaw
			.replace(/\r?\n/g, '\n')
			.replace(/\n+/g, '\n')
			.trim();

		let title, cover, group;
		let headers = {};
		const vlcopt = {
			'User-Agent': '#EXTVLCOPT:http-user-agent=',
			'Referer': '#EXTVLCOPT:http-referrer=',
		}
		const bangumi = [];
		res.split('\n').forEach((item) => {
			if (item.startsWith('#EXTINF:')) {
				title = item.slice(item.lastIndexOf(',') + 1).trim();
				group = item.match(/group\-title\="([^"]+)"/)?.[1] || '';
				cover = item.match(/tvg\-logo\="([^"]+)"/)?.[1] || null;
			} else if (item.startsWith('#EXTVLCOPT:')) {
				for (let v in vlcopt) if (item.startsWith(vlcopt[v])) {
					headers[v] = item.slice(vlcopt[v].length);
				}
			} else if (title && ~item.search(/^(?:https?|rs[tcm]p|rsp|mms)/) && !~item.search(/\.mpd/)) {
				bangumi.push({
					title,
					url: item.trim(),
					cover,
					group,
					headers,
				});
				title = '';
				headers = {};
			}
		})
		this.#opts.source = baseUrl;
		this.#cache.uptime = Date.now();
		return (this.#cache.items = this.#cache.res[md5path] = bangumi);
	}

	async search(kw, page, filter) {
		if (page > 1) {
			return [];
		}
		if (!this.#cache.items || !this.#cache.items.length) {
			await this.latest(1);
		}
		const filt = filter?.data && filter.data[0] || 'All';
		const bangumi = this.#cache.items || [];
		if (filt === 'All') {
			return !kw ? bangumi : bangumi.filter(v => ~v.title.indexOf(kw));
		}
		return bangumi.filter(v => (v.group && ~`;${v.group};`.indexOf(`;${filt};`)) && (kw ? ~v.title.indexOf(kw) : true));
	}

	async detail(url) {
		const bangumi = (this.#cache.items || []).find((v) => v.url === url) || {
			title: "IPTV Channel",
			url: url,
			group: "",
			headers: {}
		};
		const parseUrls = (item) => {
			const urls = (item.url || "").split('#');
			const l = urls.length;
			return urls.map((v, i) => {
				return {
					name: l > 1 ? `${item.title} [${i + 1}]` : `${item.title}`,
					url: v
				};
			})
		};
		const result = {
			...bangumi,
			episodes: [
				{
					title: bangumi.title || "Stream",
					urls: parseUrls(bangumi)
				}
			]
		};
		let groups;
		bangumi.group && bangumi.group.split(';').forEach(g => {
			groups = (this.#cache.items || [])
				.filter((v) => (v.group && ~`;${v.group};`.indexOf(`;${g};`)))
				.map((v) => parseUrls(v)) || [];

			if (groups.length) {
				result.episodes.push({
					title: `[${g}]`,
					urls: groups.flat()
				});
			}
		})
		return result;
	}

	async watch(url) {
		const bangumi = (this.#cache.items || []).find((v) => v.url === url || (v.url && v.url.indexOf(url) >= 0));
		const item = {
			type: 'hls',
			url
		}
		if (bangumi && bangumi.headers && Object.keys(bangumi.headers).length > 0) {
			item['headers'] = bangumi.headers
		}
		return item;
	}
}
