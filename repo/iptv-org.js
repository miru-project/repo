// ==MiruExtension==
// @name         IPTV-ORG
// @description  IPTV sources from iptv-org
// @version      v0.0.1
// @author       vvsolo
// @lang         all
// @license      MIT
// @package      iptv-org
// @type         bangumi
// @icon         https://avatars.githubusercontent.com/u/55937028?s=200&v=4
// @webSite      https://iptv-org.github.io/iptv
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
	//#sources = 'https://cdn.jsdelivr.net/gh/vvsolo/miru-extension-MyIPTV-sources@main/iptv-org.sources.json';

	#sources = {"categories":{"Animation[68]":"animation","Auto[16]":"auto","Business[66]":"business","Classic[55]":"classic","Comedy[53]":"comedy","Cooking[23]":"cooking","Culture[91]":"culture","Documentary[63]":"documentary","Education[106]":"education","Entertainment[390]":"entertainment","Family[43]":"family","General[1359]":"general","Kids[201]":"kids","Legislative[174]":"legislative","Lifestyle[81]":"lifestyle","Movies[295]":"movies","Music[555]":"music","News[762]":"news","Outdoor[43]":"outdoor","Relax[8]":"relax","Religious[523]":"religious","Science[25]":"science","Series[159]":"series","Shop[78]":"shop","Sports[202]":"sports","Travel[28]":"travel","Weather[13]":"weather","XXX[61]":"xxx","Undefined[5083]":"undefined"},"languages":{"Afghan Persian[5]":"prs","Afrikaans[3]":"afr","Albanian[61]":"sqi","Alemannic[1]":"gsw","Amharic[7]":"amh","Arabic[397]":"ara","Armenian[11]":"hye","Assamese[7]":"asm","Assyrian Neo-Aramaic[1]":"aii","Aymara[1]":"aym","Azerbaijani[23]":"aze","Bashkir[1]":"bak","Basque[7]":"eus","Belarusian[3]":"bel","Bengali[80]":"ben","Bhojpuri[1]":"bho","Bosnian[14]":"bos","Bulgarian[35]":"bul","Burmese[20]":"mya","Catalan[53]":"cat","Central Kurdish[1]":"ckb","Chhattisgarhi[1]":"hne","Chinese[147]":"zho","Croatian[19]":"hrv","Czech[35]":"ces","Danish[21]":"dan","Dhanwar (Nepal)[1]":"dhw","Dhivehi[3]":"div","Dholuo[1]":"luo","Dimili[1]":"zza","Dutch[201]":"nld","English[2145]":"eng","Estonian[9]":"est","Ewe[1]":"ewe","Faroese[1]":"fao","Fataleka[1]":"far","Filipino[1]":"fil","Finnish[24]":"fin","French[447]":"fra","Galician[15]":"glg","Galolen[1]":"gal","Georgian[9]":"kat","German[291]":"deu","Gikuyu[2]":"kik","Goan Konkani[1]":"gom","Greek[135]":"ell","Greenlandic[2]":"kal","Gujarati[10]":"guj","Haitian[5]":"hat","Hausa[2]":"hau","Hebrew[13]":"heb","Hindi[165]":"hin","Hungarian[110]":"hun","Icelandic[5]":"isl","Indonesian[162]":"ind","Inuktitut[1]":"iku","Irish[5]":"gle","Italian[326]":"ita","Japanese[101]":"jpn","Javanese[3]":"jav","Kannada[18]":"kan","Kazakh[28]":"kaz","Khmer[12]":"khm","Kinyarwanda[3]":"kin","Kirghiz[12]":"kir","Konkani (macrolanguage)[2]":"kok","Korean[118]":"kor","Kurdish[26]":"kur","Lahnda[1]":"lah","Lao[15]":"lao","Latin[3]":"lat","Latvian[13]":"lav","Letzeburgesch[3]":"ltz","Lithuanian[8]":"lit","Macedonian[34]":"mkd","Malay[18]":"msa","Malayalam[73]":"mal","Maltese[3]":"mlt","Mandarin Chinese[5]":"cmn","Maori[1]":"mri","Marathi[14]":"mar","Min Nan Chinese[1]":"nan","Mongolian[20]":"mon","Montenegrin[1]":"cnr","Mycenaean Greek[1]":"gmy","Nepali[9]":"nep","Norwegian[8]":"nor","Norwegian Bokmål[1]":"nob","Oriya (macrolanguage)[8]":"ori","Panjabi[26]":"pan","Papiamento[9]":"pap","Parsi-Dari[2]":"prd","Pashto[18]":"pus","Persian[143]":"fas","Polish[69]":"pol","Portuguese[371]":"por","Quechua[1]":"que","Romanian[124]":"ron","Romany[1]":"rom","Russian[305]":"rus","Saint Lucian Creole French[2]":"acf","Santali[1]":"sat","Serbian[57]":"srp","Serbo-Croatian[1]":"hbs","Sindhi[1]":"snd","Sinhala[10]":"sin","Slovak[48]":"slk","Slovenian[17]":"slv","Somali[9]":"som","Spanish[2096]":"spa","Swahili[17]":"swa","Swedish[20]":"swe","Tagalog[14]":"tgl","Tajik[2]":"tgk","Tamil[63]":"tam","Tatar[1]":"tat","Telugu[30]":"tel","Tetum[1]":"tet","Thai[76]":"tha","Tigrinya[1]":"tir","Turkish[218]":"tur","Turkmen[7]":"tuk","Ukrainian[80]":"ukr","Urdu[59]":"urd","Uzbek[18]":"uzb","Vietnamese[98]":"vie","Welsh[1]":"cym","Western Frisian[1]":"fry","Wolof[4]":"wol","Yucatec Maya[1]":"yua","Yue Chinese[9]":"yue","Undefined[1199]":"undefined"},"countries":{"🇦🇫 Afghanistan[33]":"af","🇦🇱 Albania[30]":"al","🇩🇿 Algeria[60]":"dz","🇦🇸 American Samoa[5]":"as","🇦🇩 Andorra[15]":"ad","🇦🇴 Angola[21]":"ao","🇦🇮 Anguilla[10]":"ai","🇦🇬 Antigua and Barbuda[12]":"ag","🇦🇷 Argentina[329]":"ar","@Buenos Aires[30]":"ar-b","@Catamarca[2]":"ar-k","@Chaco[5]":"ar-h","@Chubut[4]":"ar-u","@Ciudad Autonoma de Buenos Aires[2]":"ar-c","@Cordoba[8]":"ar-x","@Corrientes[4]":"ar-w","@Entre Rios[4]":"ar-e","@Formosa[2]":"ar-p","@Jujuy[5]":"ar-y","@La Pampa[4]":"ar-l","@La Rioja[4]":"ar-f","@Mendoza[2]":"ar-m","@Misiones[5]":"ar-n","@Neuquen[4]":"ar-q","@Rio Negro[1]":"ar-r","@Salta[6]":"ar-a","@San Juan[6]":"ar-j","@San Luis[1]":"ar-d","@Santa Cruz[4]":"ar-z","@Santa Fe[9]":"ar-s","@Santiago del Estero[1]":"ar-g","@Tucuman[7]":"ar-t","🇦🇲 Armenia[46]":"am","🇦🇼 Aruba[16]":"aw","🇦🇺 Australia[66]":"au","🇦🇹 Austria[54]":"at","🇦🇿 Azerbaijan[40]":"az","🇧🇸 Bahamas[12]":"bs","🇧🇭 Bahrain[40]":"bh","🇧🇩 Bangladesh[60]":"bd","🇧🇧 Barbados[11]":"bb","🇧🇾 Belarus[36]":"by","🇧🇪 Belgium[56]":"be","🇧🇿 Belize[7]":"bz","🇧🇯 Benin[31]":"bj","🇧🇲 Bermuda[5]":"bm","🇧🇹 Bhutan[9]":"bt","🇧🇴 Bolivia[115]":"bo","@Cochabamba[1]":"bo-c","@La Paz[2]":"bo-l","@Oruro[1]":"bo-o","@Santa Cruz[2]":"bo-s","🇧🇶 Bonaire[3]":"bq","🇧🇦 Bosnia and Herzegovina[30]":"ba","🇧🇼 Botswana[20]":"bw","🇧🇻 Bouvet Island[3]":"bv","🇧🇷 Brazil[331]":"br","@Alagoas[3]":"br-al","@Amazonas[1]":"br-am","@Bahia[5]":"br-ba","@Ceara[7]":"br-ce","@Distrito Federal[1]":"br-df","@Espirito Santo[4]":"br-es","@Goias[1]":"br-go","@Maranhao[1]":"br-ma","@Mato Grosso[3]":"br-mt","@Minas Gerais[14]":"br-mg","@Para[1]":"br-pa","@Paraiba[5]":"br-pb","@Parana[7]":"br-pr","@Pernambuco[1]":"br-pe","@Rio de Janeiro[10]":"br-rj","@Rio Grande do Norte[4]":"br-rn","@Rio Grande do Sul[8]":"br-rs","@Rondonia[1]":"br-ro","@Roraima[1]":"br-rr","@Santa Catarina[9]":"br-sc","@Sao Paulo[24]":"br-sp","🇻🇬 British Virgin Islands[11]":"vg","🇧🇳 Brunei[24]":"bn","🇧🇬 Bulgaria[42]":"bg","🇧🇫 Burkina Faso[24]":"bf","🇧🇮 Burundi[19]":"bi","🇰🇭 Cambodia[35]":"kh","🇨🇲 Cameroon[48]":"cm","🇨🇦 Canada[155]":"ca","@Alberta[4]":"ca-ab","@British Columbia[3]":"ca-bc","@Manitoba[3]":"ca-mb","@New Brunswick[3]":"ca-nb","@Newfoundland and Labrador[2]":"ca-nl","@Northwest Territories[1]":"ca-nt","@Nova Scotia[1]":"ca-ns","@Ontario[5]":"ca-on","@Prince Edward Island[1]":"ca-pe","@Quebec[14]":"ca-qc","@Saskatchewan[2]":"ca-sk","🇨🇻 Cape Verde[20]":"cv","@Boa Vista[1]":"cv-bv","@Sal[1]":"cv-sl","🇰🇾 Cayman Islands[10]":"ky","🇨🇫 Central African Republic[19]":"cf","🇹🇩 Chad[20]":"td","🇨🇱 Chile[267]":"cl","@Biobio[3]":"cl-bi","@Coquimbo[1]":"cl-co","@La Araucania[2]":"cl-ar","@Libertador General Bernardo O'Higgins[3]":"cl-li","@Los Lagos[1]":"cl-ll","@Maule[1]":"cl-ml","@Nuble[3]":"cl-nb","@Valparaiso[2]":"cl-vs","🇨🇳 China[575]":"cn","🇨🇴 Colombia[183]":"co","@Antioquia[1]":"co-ant","@Atlantico[1]":"co-atl","@Bolivar[1]":"co-bol","@Caldas[1]":"co-cal","@Cauca[3]":"co-cau","@Choco[1]":"co-cho","@Cundinamarca[1]":"co-cun","@Huila[2]":"co-hui","@Magdalena[1]":"co-mag","@Narino[3]":"co-nar","@Norte de Santander[2]":"co-nsa","@Quindio[1]":"co-qui","@Risaralda[1]":"co-ris","@San Andres, Providencia y Santa Catalina[1]":"co-sap","@Tolima[1]":"co-tol","@Valle del Cauca[5]":"co-vac","🇰🇲 Comoros[48]":"km","🇨🇰 Cook Islands[5]":"ck","🇨🇷 Costa Rica[133]":"cr","@Puntarenas[1]":"cr-p","@San Jose[1]":"cr-sj","🇭🇷 Croatia[32]":"hr","🇨🇺 Cuba[68]":"cu","🇨🇼 Curacao[16]":"cw","🇨🇾 Cyprus[42]":"cy","🇨🇿 Czech Republic[44]":"cz","🇨🇩 Democratic Republic of the Congo[46]":"cd","🇩🇰 Denmark[37]":"dk","🇩🇯 Djibouti[53]":"dj","🇩🇲 Dominica[11]":"dm","🇩🇴 Dominican Republic[221]":"do","@Distrito Nacional (Santo Domingo)[2]":"do-01","@La Altagracia[2]":"do-11","@La Vega[3]":"do-13","@Monsenor Nouel[2]":"do-28","@Puerto Plata[1]":"do-18","@San Juan[1]":"do-22","@Santiago[1]":"do-25","@Valverde[1]":"do-27","🇹🇱 East Timor[20]":"tl","🇪🇨 Ecuador[122]":"ec","@Azuay[1]":"ec-a","@Loja[1]":"ec-l","@Orellana[1]":"ec-d","🇪🇬 Egypt[86]":"eg","🇸🇻 El Salvador[83]":"sv","🇬🇶 Equatorial Guinea[21]":"gq","🇪🇷 Eritrea[19]":"er","🇪🇪 Estonia[28]":"ee","🇪🇹 Ethiopia[26]":"et","🇫🇰 Falkland Islands[3]":"fk","🇫🇴 Faroe Islands[2]":"fo","🇫🇯 Fiji[7]":"fj","🇫🇮 Finland[41]":"fi","@Keski-Suomi[1]":"fi-08","@Pohjanmaa[3]":"fi-12","🇫🇷 France[241]":"fr","🇬🇫 French Guiana[11]":"gf","🇵🇫 French Polynesia[6]":"pf","🇹🇫 French Southern Territories[19]":"tf","🇬🇦 Gabon[21]":"ga","🇬🇲 Gambia[21]":"gm","🇬🇪 Georgia[20]":"ge","🇩🇪 Germany[267]":"de","🇬🇭 Ghana[43]":"gh","🇬🇷 Greece[130]":"gr","🇬🇱 Greenland[8]":"gl","🇬🇩 Grenada[10]":"gd","🇬🇵 Guadeloupe[18]":"gp","🇬🇺 Guam[6]":"gu","🇬🇹 Guatemala[135]":"gt","@Escuintla[2]":"gt-05","@Huehuetenango[1]":"gt-13","@Izabal[1]":"gt-18","@Quiche[1]":"gt-14","@Sacatepequez[1]":"gt-03","@San Marcos[1]":"gt-12","@Santa Rosa[1]":"gt-06","@Solola[4]":"gt-07","@Totonicapan[1]":"gt-08","🇬🇬 Guernsey[1]":"gg","🇬🇳 Guinea[27]":"gn","🇬🇼 Guinea-Bissau[19]":"gw","🇬🇾 Guyana[4]":"gy","🇭🇹 Haiti[47]":"ht","🇭🇳 Honduras[138]":"hn","🇭🇰 Hong Kong[21]":"hk","🇭🇺 Hungary[118]":"hu","🇮🇸 Iceland[15]":"is","🇮🇳 India[441]":"in","🇮🇩 Indonesia[181]":"id","@Aceh[2]":"id-ac","@Bali[2]":"id-ba","@Banten[2]":"id-bt","@Bengkulu[3]":"id-be","@Gorontalo[1]":"id-go","@Jakarta Raya[4]":"id-jk","@Jambi[4]":"id-ja","@Jawa Barat[10]":"id-jb","@Jawa Tengah[6]":"id-jt","@Jawa Timur[11]":"id-ji","@Kalimantan Barat[2]":"id-kb","@Kalimantan Selatan[2]":"id-ks","@Kalimantan Tengah[1]":"id-kt","@Kalimantan Timur[2]":"id-ki","@Kepulauan Bangka Belitung[1]":"id-bb","@Lampung[3]":"id-la","@Maluku[1]":"id-ml","@Maluku Utara[1]":"id-mu","@Nusa Tenggara Barat[1]":"id-nb","@Nusa Tenggara Timur[1]":"id-nt","@Papua[2]":"id-pp","@Riau[3]":"id-ri","@Sulawesi Barat[1]":"id-sr","@Sulawesi Selatan[3]":"id-sn","@Sulawesi Tengah[1]":"id-st","@Sulawesi Tenggara[1]":"id-sg","@Sumatera Barat[2]":"id-sb","@Sumatera Selatan[2]":"id-ss","@Yogyakarta[4]":"id-yo","🇮🇷 Iran[137]":"ir","@Tehran[2]":"ir-23","🇮🇶 Iraq[109]":"iq","🇮🇪 Ireland[24]":"ie","🇮🇱 Israel[24]":"il","🇮🇹 Italy[397]":"it","🇨🇮 Ivory Coast[43]":"ci","🇯🇲 Jamaica[16]":"jm","🇯🇵 Japan[109]":"jp","@Chiba[2]":"jp-12","@Gunma[1]":"jp-10","@Ibaraki[1]":"jp-08","@Kanagawa[2]":"jp-14","@Osaka[1]":"jp-27","@Saitama[2]":"jp-11","@Tochigi[1]":"jp-09","@Tokyo[1]":"jp-13","🇯🇴 Jordan[64]":"jo","🇰🇿 Kazakhstan[47]":"kz","🇰🇪 Kenya[63]":"ke","🇰🇮 Kiribati[5]":"ki","🇽🇰 Kosovo[24]":"xk","🇰🇼 Kuwait[40]":"kw","🇰🇬 Kyrgyzstan[24]":"kg","🇱🇦 Laos[44]":"la","🇱🇻 Latvia[32]":"lv","🇱🇧 Lebanon[59]":"lb","🇱🇸 Lesotho[19]":"ls","🇱🇷 Liberia[19]":"lr","🇱🇾 Libya[64]":"ly","🇱🇮 Liechtenstein[14]":"li","🇱🇹 Lithuania[21]":"lt","🇱🇺 Luxembourg[23]":"lu","🇲🇴 Macao[8]":"mo","🇲🇬 Madagascar[21]":"mg","🇲🇼 Malawi[21]":"mw","🇲🇾 Malaysia[44]":"my","🇲🇻 Maldives[11]":"mv","🇲🇱 Mali[20]":"ml","🇲🇹 Malta[13]":"mt","🇲🇭 Marshall Islands[5]":"mh","🇲🇶 Martinique[16]":"mq","🇲🇷 Mauritania[50]":"mr","🇲🇺 Mauritius[20]":"mu","🇾🇹 Mayotte[20]":"yt","🇲🇽 Mexico[286]":"mx","@Aguascalientes[1]":"mx-agu","@Baja California[1]":"mx-bcn","@Chihuahua[4]":"mx-chh","@Ciudad de Mexico[1]":"mx-cmx","@Coahuila de Zaragoza[3]":"mx-coa","@Durango[1]":"mx-dur","@Guanajuato[1]":"mx-gua","@Guerrero[1]":"mx-gro","@Jalisco[1]":"mx-jal","@Morelos[2]":"mx-mor","@Nuevo Leon[2]":"mx-nle","@Puebla[3]":"mx-pue","@Queretaro[1]":"mx-que","@Quintana Roo[3]":"mx-roo","@San Luis Potosi[2]":"mx-slp","@Sinaloa[1]":"mx-sin","@Sonora[1]":"mx-son","@Tamaulipas[3]":"mx-tam","@Veracruz de Ignacio de la Llave[1]":"mx-ver","@Yucatan[2]":"mx-yuc","@Zacatecas[1]":"mx-zac","🇫🇲 Micronesia[5]":"fm","🇲🇩 Moldova[35]":"md","🇲🇨 Monaco[12]":"mc","🇲🇳 Mongolia[27]":"mn","🇲🇪 Montenegro[16]":"me","@Ulcinj[1]":"me-20","🇲🇸 Montserrat[10]":"ms","🇲🇦 Morocco[67]":"ma","🇲🇿 Mozambique[22]":"mz","🇲🇲 Myanmar (Burma)[40]":"mm","🇳🇦 Namibia[19]":"na","🇳🇷 Nauru[5]":"nr","🇳🇵 Nepal[22]":"np","🇳🇱 Netherlands[199]":"nl","🇳🇨 New Caledonia[5]":"nc","🇳🇿 New Zealand[30]":"nz","🇳🇮 Nicaragua[75]":"ni","🇳🇪 Niger[21]":"ne","🇳🇬 Nigeria[72]":"ng","🇳🇺 Niue[5]":"nu","🇳🇫 Norfolk Island[5]":"nf","🇰🇵 North Korea[7]":"kp","🇲🇰 North Macedonia[46]":"mk","🇲🇵 Northern Mariana Islands[5]":"mp","🇳🇴 Norway[22]":"no","🇴🇲 Oman[42]":"om","🇵🇰 Pakistan[75]":"pk","@Islamabad[1]":"pk-is","🇵🇼 Palau[5]":"pw","🇵🇸 Palestine[61]":"ps","🇵🇦 Panama[90]":"pa","🇵🇬 Papua New Guinea[5]":"pg","🇵🇾 Paraguay[116]":"py","@Alto Parana[2]":"py-10","@Boqueron[1]":"py-19","@Caaguazu[1]":"py-5","@Central[1]":"py-11","@Itapua[1]":"py-7","@Presidente Hayes[1]":"py-15","🇵🇪 Peru[209]":"pe","@Amazonas[1]":"pe-ama","@Ancash[1]":"pe-anc","@Apurimac[1]":"pe-apu","@Arequipa[4]":"pe-are","@Ayacucho[2]":"pe-aya","@Cusco[1]":"pe-cus","@Junin[3]":"pe-jun","@Lima[3]":"pe-lim","@Loreto[2]":"pe-lor","@Moquegua[3]":"pe-moq","@Puno[2]":"pe-pun","@San Martin[3]":"pe-sam","🇵🇭 Philippines[43]":"ph","🇵🇳 Pitcairn Islands[5]":"pn","🇵🇱 Poland[83]":"pl","🇵🇹 Portugal[61]":"pt","🇵🇷 Puerto Rico[103]":"pr","🇶🇦 Qatar[40]":"qa","🇨🇬 Republic of the Congo[23]":"cg","@Brazzaville[1]":"cg-bzv","🇷🇪 Réunion[20]":"re","🇷🇴 Romania[121]":"ro","@Gorj[1]":"ro-gj","🇷🇺 Russia[394]":"ru","🇷🇼 Rwanda[31]":"rw","🇧🇱 Saint Barthélemy[14]":"bl","🇸🇭 Saint Helena[19]":"sh","🇰🇳 Saint Kitts and Nevis[11]":"kn","🇱🇨 Saint Lucia[12]":"lc","🇲🇫 Saint Martin[14]":"mf","🇵🇲 Saint Pierre and Miquelon[5]":"pm","🇻🇨 Saint Vincent and the Grenadines[10]":"vc","🇼🇸 Samoa[5]":"ws","🇸🇲 San Marino[11]":"sm","🇸🇹 São Tomé and Príncipe[20]":"st","🇸🇦 Saudi Arabia[83]":"sa","🇸🇳 Senegal[40]":"sn","🇷🇸 Serbia[62]":"rs","🇸🇨 Seychelles[19]":"sc","🇸🇱 Sierra Leone[21]":"sl","🇸🇬 Singapore[28]":"sg","🇸🇽 Sint Maarten[14]":"sx","🇸🇰 Slovakia[65]":"sk","🇸🇮 Slovenia[38]":"si","🇸🇧 Solomon Islands[5]":"sb","🇸🇴 Somalia[57]":"so","🇿🇦 South Africa[52]":"za","🇬🇸 South Georgia and the South Sandwich Islands[3]":"gs","🇰🇷 South Korea[118]":"kr","@Busan-gwangyeoksi[3]":"kr-26","@Chungcheongbuk-do[2]":"kr-43","@Daegu-gwangyeoksi[3]":"kr-27","@Daejeon-gwangyeoksi[2]":"kr-30","@Gangwon-do[3]":"kr-42","@Gwangju-gwangyeoksi[1]":"kr-29","@Gyeonggi-do[1]":"kr-41","@Gyeongsangbuk-do[1]":"kr-47","@Gyeongsangnam-do[1]":"kr-48","@Jeju-teukbyeoljachido[1]":"kr-49","@Jeollabuk-do[1]":"kr-45","@Jeollanam-do[4]":"kr-46","@Seoul-teukbyeolsi[1]":"kr-11","@Ulsan-gwangyeoksi[2]":"kr-31","🇸🇸 South Sudan[19]":"ss","🇪🇸 Spain[318]":"es","@Andalucia[39]":"es-an","@Aragon[1]":"es-ar","@Asturias, Principado de[2]":"es-as","@Canarias[11]":"es-cn","@Castilla y Leon[1]":"es-cl","@Castilla-La Mancha[5]":"es-cm","@Catalunya[38]":"es-ct","@Ceuta[1]":"es-ce","@Extremadura[1]":"es-ex","@Galicia[5]":"es-ga","@Illes Balears[1]":"es-ib","@La Rioja[1]":"es-ri","@Madrid, Comunidad de[5]":"es-md","@Murcia, Region de[3]":"es-mc","@Navarra, Comunidad Foral de[1]":"es-nc","@Pais Vasco[6]":"es-pv","@Valenciana, Comunidad[15]":"es-vc","🇱🇰 Sri Lanka[21]":"lk","🇸🇩 Sudan[57]":"sd","🇸🇷 Suriname[4]":"sr","🇸🇿 Swaziland[20]":"sz","🇸🇪 Sweden[42]":"se","🇨🇭 Switzerland[73]":"ch","🇸🇾 Syria[47]":"sy","🇹🇼 Taiwan[75]":"tw","🇹🇯 Tajikistan[12]":"tj","🇹🇿 Tanzania[31]":"tz","🇹🇭 Thailand[95]":"th","🇹🇬 Togo[25]":"tg","🇹🇰 Tokelau[5]":"tk","🇹🇴 Tonga[5]":"to","🇹🇹 Trinidad and Tobago[13]":"tt","🇹🇳 Tunisia[62]":"tn","🇹🇷 Turkey[224]":"tr","🇹🇲 Turkmenistan[8]":"tm","🇹🇨 Turks and Caicos Islands[10]":"tc","🇹🇻 Tuvalu[5]":"tv","🇻🇮 U.S. Virgin Islands[10]":"vi","🇺🇬 Uganda[37]":"ug","🇺🇦 Ukraine[101]":"ua","🇦🇪 United Arab Emirates[81]":"ae","🇬🇧 United Kingdom[204]":"uk","@Wales[2]":"gb-wls","🇺🇸 United States[1719]":"us","@Alabama[3]":"us-al","@Alaska[1]":"us-ak","@Arizona[13]":"us-az","@Arkansas[5]":"us-ar","@California[147]":"us-ca","@Colorado[18]":"us-co","@Connecticut[19]":"us-ct","@Delaware[6]":"us-de","@District of Columbia[5]":"us-dc","@Florida[46]":"us-fl","@Georgia[8]":"us-ga","@Guam[1]":"us-gu","@Hawaii[5]":"us-hi","@Idaho[1]":"us-id","@Illinois[6]":"us-il","@Indiana[2]":"us-in","@Iowa[1]":"us-ia","@Kansas[13]":"us-ks","@Kentucky[7]":"us-ky","@Louisiana[4]":"us-la","@Maine[1]":"us-me","@Maryland[4]":"us-md","@Massachusetts[6]":"us-ma","@Michigan[8]":"us-mi","@Minnesota[6]":"us-mn","@Mississippi[3]":"us-ms","@Missouri[2]":"us-mo","@Montana[4]":"us-mt","@Nebraska[3]":"us-ne","@Nevada[1]":"us-nv","@New Hampshire[4]":"us-nh","@New Jersey[2]":"us-nj","@New Mexico[1]":"us-nm","@New York[17]":"us-ny","@North Carolina[6]":"us-nc","@North Dakota[3]":"us-nd","@Ohio[6]":"us-oh","@Oklahoma[3]":"us-ok","@Pennsylvania[11]":"us-pa","@South Carolina[1]":"us-sc","@Tennessee[4]":"us-tn","@Texas[19]":"us-tx","@Utah[1]":"us-ut","@Virginia[2]":"us-va","@Washington[7]":"us-wa","@Wisconsin[3]":"us-wi","🇺🇾 Uruguay[74]":"uy","🇺🇿 Uzbekistan[29]":"uz","🇻🇺 Vanuatu[5]":"vu","🇻🇦 Vatican City[17]":"va","🇻🇪 Venezuela[133]":"ve","@Aragua[2]":"ve-d","@Lara[1]":"ve-k","🇻🇳 Vietnam[106]":"vn","🇼🇫 Wallis and Futuna[5]":"wf","🇪🇭 Western Sahara[24]":"eh","🇾🇪 Yemen[45]":"ye","🇿🇲 Zambia[20]":"zm","🇿🇼 Zimbabwe[22]":"zw","🌍 International[68]":"int"},"regions":{"Africa[472]":"afr","Americas[3903]":"amer","Arab world[397]":"arab","Asia[3053]":"asia","Asia-Pacific[1990]":"apac","Association of Southeast Asian Nations[430]":"asean","Balkan[664]":"balkan","Benelux[236]":"benelux","Caribbean[271]":"carib","Central America[273]":"cenamer","Central and Eastern Europe[1146]":"cee","Central Asia[67]":"cas","Commonwealth of Independent States[523]":"cis","Europe[3352]":"eur","Europe, the Middle East and Africa[4198]":"emea","European Union[2187]":"eu","Hispanic America[1714]":"hispam","Latin America[2028]":"latam","Latin America and the Caribbean[2059]":"lac","Maghreb[61]":"maghreb","Middle East[688]":"mideast","Middle East and North Africa[739]":"mena","Nordics[93]":"nord","North America[2614]":"noram","Northern America[1866]":"nam","Northern Europe[128]":"neur","Oceania[82]":"oce","South America[1298]":"southam","South Asia[601]":"sas","Southeast Asia[443]":"sea","Southern Europe[1096]":"ser","Sub-Saharan Africa[380]":"ssa","West Africa[163]":"wafr","Western Europe[994]":"wer"}}
	
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
		return await this.request(path, {
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
		this.#cache.groups = this.#cache.items
			.map(v => v.group && v.group.split(';'))
			.flat()
			.reduce((g, v) => {
				return v ? {...g, [v]: v} : g;
			}, this.#defaultGroup);

		let title = "";
		const GroupBy = await this.getSetting('GroupBy');
		for (let [name, item] of Object.entries(this.#sources[GroupBy])) {
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
		const GroupBy = await this.getSetting('GroupBy');
		const baseUrl = await this.getSetting(GroupBy);
		if (!baseUrl) {
			baseUrl = this.#opts.source;
		}
		
		// cache source content
		const md5path = md5(baseUrl);
		if (
			md5path in this.#cache.res &&
			await this.checkExpire()
		) {
			return (this.#cache.items = this.#cache.res[md5path]);
		}
		const res = (await this.req(baseUrl))
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
		await res.split('\n').forEach(async (item) => {
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
		!~this.#cache.items.length && await this.latest();
		const filt = filter?.data && filter.data[0] || 'All';
		const bangumi = this.#cache.items;
		if (filt === 'All') {
			return !kw ? bangumi : bangumi.filter(v => ~v.title.indexOf(kw));
		}
		return bangumi.filter(v => (v.group && ~`;${v.group};`.indexOf(`;${filt};`)) && (kw ? ~v.title.indexOf(kw) : true));
	}

	async detail(url) {
		const bangumi = this.#cache.items.find((v) => v.url === url);
		const parseUrls = (item) => {
			const urls = item.url.split('#');
			const l = urls.length;
			return urls.map((v, i) => {
				return {
					name: l > 1 ? `${item.title} [${i + 1}]` : `${item.title}`,
					url: v
				};
			})
		};
		bangumi.episodes = [
			{
				title: bangumi.title,
				urls: parseUrls(bangumi)
			}
		];
		// multiple groups
		let groups;
		bangumi.group && bangumi.group.split(';').forEach(g => {
			groups = this.#cache.items
				.filter((v) => (v.group && ~`;${v.group};`.indexOf(`;${g};`)))
				.map((v) => parseUrls(v)) || [];

			~groups.length && bangumi.episodes.push({
				title: `[${g}]`,
				urls: groups.flat()
			})
		})
		return bangumi;
	}

	async watch(url) {
		const bangumi = this.#cache.items.find((v) => v.url === url || ~v.url.indexOf(url));
		const item = {
			type: 'hls',
			url
		}
		if (('headers' in bangumi) && ~Object.keys(bangumi.headers).length) {
			item['headers'] = bangumi.headers
		}
		return item;
	}
}
