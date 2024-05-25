// ==MiruExtension==
// @name         IDLIX
// @version      v0.0.2
// @author       Nazz
// @lang         id
// @license      MIT
// @type         bangumi
// @icon         https://vip.idlixofficial.net/wp-content/uploads/2020/06/idlix.png
// @package      idlix
// @webSite      https://vip.idlixofficial.net
// @nsfw         false
// @tags         movie,tvseries,anime,english
// ==/MiruExtension==
 

export default class extends Extension {
	async load() {
		this.registerSetting({
			title: "Idlix",
			key: "domain_idlix",
			type: "input",
			description: "Idlix Domain",
			defaultValue: "https://vip.idlixofficial.net",
		});
	}
	async requestWSetting(url) {
		return this.request(url, {
			headers: {
				"Miru-Url": await this.getSetting("domain_idlix"),
			},
		});
	}
	async search(query, page){
		try{
			const page_domain = await this.getSetting("domain_idlix");
			const query_parse = query.replaceAll(" ","+")
			const url = `/search/${query_parse}/page/${page}`
			const fetch_search = await this.requestWSetting(url);
			const $ = fetch_search
				.replace(/<!-- WP.+/, "</html>")
				.replace(/[\r\n]+/gm, "");
			
				// #contenedor > div.module > div.content.rigth.csearch > div.search-page > div:nth-child(2)
			const element_item_search = await this.querySelectorAll(
				$,
				"div.search-page > div.result-item"
			);
			let list_search = []
			for (const element of element_item_search) {
				const cover = await this.getAttributeText(
					element.content,
					"img",
					"src"
				);
				const title = await this.querySelector(element.content, "div.title > a").text;
				const urls = await this.getAttributeText(
					element.content,
					"div.title > a",
					"href"
				);
				const url = urls.replace(page_domain, "")
				list_search.push({
					title,
					url,
					cover
				})
			}
			list_search = list_search.filter(list_item =>{
				return !list_item.url.includes("season")
			})
			return list_search
		} catch{
			return []
		}
	}
	async latest(page) {
		const page_domain = await this.getSetting("domain_idlix");
		let list_item = [];
		if(page == 1){
			const fetch_featured = await this.requestWSetting(`/`);
			const $ = fetch_featured
				.replace(/<!-- WP.+/, "</html>")
				.replace(/[\r\n]+/gm, "");
			const element_featureds = await this.querySelectorAll(
				$,
				"div.items.featured > article"
			);
			for (const element of element_featureds) {
				const title = await this.querySelector(element.content, "h3").text;
				const cover = await this.getAttributeText(
					element.content,
					"div.poster > img",
					"src"
				);
				const elementUrl = await this.getAttributeText(
					element.content,
					"h3 > a",
					"href"
				);
				const url = await elementUrl.toString().replace(page_domain, "");
				list_item.push({
					title,
					cover,
					url,
				});
			}
		}
		const fetch_movie_latest = await this.requestWSetting(`/movie/page/${page}/`);
		const $$ = fetch_movie_latest
				.replace(/<!-- WP.+/, "</html>")
				.replace(/[\r\n]+/gm, "");
		const element_movie = await this.querySelectorAll(
			$$,
			"div#archive-content > article"
		);
		for (const element of element_movie) {
			const title = await this.querySelector(element.content, "h3").text;
			const cover = await this.getAttributeText(
				element.content,
				"div.poster > img",
				"src"
			);
			const elementUrl = await this.getAttributeText(
				element.content,
				"h3 > a",
				"href"
			);
			const url = await elementUrl.toString().replace(page_domain, "");
			list_item.push({
				title,
				cover,
				url,
			});
		}
		return list_item;
	}

	async detail(url) {
		const page_domain = await this.getSetting("domain_idlix");
		const fetch_detail_movie = await this.requestWSetting(`/${url}`);
		const $ = fetch_detail_movie
			.replace(/<!-- WP.+/, "</html>")
			.replace(/[\r\n]+/gm, "");
		const quality = ["360p", "720p", "1080p"];
		if (url.includes("movie")) {
			const title = await this.querySelector($, "div.sheader > div.data > h1")
				.text;
			const cover = await this.getAttributeText(
				$,
				"div.sheader > div.poster > img",
				"src"
			);
			const desc = await this.querySelector($, "#info > div.wp-content > p")
				.text;
			const episodes = quality.map((item, i) => {
				return {
					title: item,
					urls: [
						{
							name: title,
							url: url + `#${item}`,
						},
					],
				};
			});
			return {
				title,
				cover,
				desc,
				episodes,
			};
		} else if (url.includes("tvseries")) {
			const title = await this.querySelector(
				$,
				"#single > div > div.sheader > div.data > h1"
			).text;
			const cover = await this.getAttributeText(
				$,
				"#single > div > div.sheader > div.poster > img",
				"src"
			);
			const element_desc_1 = await this.querySelectorAll($, "center");
			const element_desc_2 = element_desc_1.filter((element) =>
				element.content.includes("Synopsis")
			)[0];
			const element_desc_3 = await this.querySelectorAll(
				element_desc_2.content,
				"p",
				"text"
			);
			const desc = element_desc_3
				.map((element) => element.content)
				.join()
				.replaceAll(/<p>|<\/p>/g, "");

			const element_seasons = await this.querySelectorAll(
				$,
				"#seasons > .se-c"
			);
			let episode_season = [];
			for (let element_season of element_seasons) {
				const title_season_1 = await this.querySelector(
					element_season.content,
					"span.title"
				).text;
				const title_season = await title_season_1
					.toString()
					.split(" ")
					.slice(0, 2)
					.join(" ");

				const element_episodes = await this.querySelectorAll(
					element_season.content,
					".episodios > li"
				);

				for (let element_episode of element_episodes) {
					const title = await this.querySelector(
						element_episode.content,
						".episodiotitle > a"
					).text;
					const elementUrl = await this.getAttributeText(
						element_episode.content,
						".episodiotitle > a",
						"href"
					);
					const urls = await elementUrl.toString().replace(page_domain, "");
					episode_season.push({
						name: `${title_season} ${title}`,
						url: urls,
					});
				}
			}
			const episodes = quality.map((item_quality, i) => {
				let temp_episode = episode_season.map((item_eps) => {
					return {
						...item_eps,
						url: `${item_eps.url}/#${item_quality}`,
					};
				});
				return {
					title: item_quality,
					urls: temp_episode,
				};
			});
			return {
				title,
				cover,
				desc,
				episodes,
			};
		}
	}

	async watch(url) {
		const quality = url.split("#")[1] || "720p";
		const page_domain = await this.getSetting("domain_idlix");
		const fetch_watch = await this.requestWSetting(`/${url}`);

		const $ = fetch_watch
			.replace(/<!-- WP.+/, "</html>")
			.replace(/[\r\n]+/gm, "");

		const element_option = "li#player-option-1";
		const data_type = await this.getAttributeText(
			$,
			element_option,
			"data-type"
		);
		const data_nume = await this.getAttributeText(
			$,
			element_option,
			"data-nume"
		);
		const data_post = await this.getAttributeText(
			$,
			element_option,
			"data-post"
		);

		const raw_data_embed_url = `action=doo_player_ajax&post=${data_post}&nume=${data_nume}&type=${data_type}`;
		const fetch_embed_url = await this.request("", {
			method: "POST",
			data: raw_data_embed_url,
			headers: {
				"Miru-Url": "https://vip.idlixofficial.net/wp-admin/admin-ajax.php",
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
		});
		const embed_url = await this.decryptAES(
			fetch_embed_url.embed_url,
			fetch_embed_url.key
		);

		const parsedUrl = this.parseUrl(embed_url);
		const videoUrlHash = parsedUrl.pathname.indexOf("video") >= 0 ? parsedUrl.pathname.replace("/video/","") : "data" in parseUrl.searchParams ? parseUrl.searchParams["data"] : false
		let raw_data_m3u8_url = `hash=${videoUrlHash}&r=https%3A%2F%2Fvip.idlixofficial.net%2F`
		const fetch_m3u8_url = await this.request("", {
			method: "POST",
			data: raw_data_m3u8_url,
			headers: {
				"Miru-Url": `https://jeniusplay.com/player/index.php?data=${videoUrlHash}&do=getVideo`,
				"Accept": "*/*",
				"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
				"X-Requested-With": "XMLHttpRequest"
			}
		});
		const fetch_m3u8_data = await this.request("",{
			headers: {
				"Miru-Url": fetch_m3u8_url.videoSource
			}
		})
		function extractLinksAndQuality(m3u8Content) {
			const lines = m3u8Content.split('\n');
			const results = {};
			
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
					let quality = lines[i].match(/NAME="(\d+p)"/);
					if (!quality) { 
						quality = lines[i].match(/RESOLUTION=\d+x(\d+)/);
						if (quality) {
							quality = quality[1] + 'p'; 
						}
					} else {
						quality = quality[1];
					}
					const link = lines[i + 1].trim();
					if (quality) {
						results[quality] = { url: link };
					}
				}
			}
			return results; 
		}
		const parsedM3u8 = extractLinksAndQuality(fetch_m3u8_data)
		const m3u8_url = parsedM3u8[quality].url || fetch_m3u8_url.videoSource
		
		const fetch_m3u8_subtitle = await this.request("", {
			headers: {
				"Miru-Url": `https://jeniusplay.com/video/${videoUrlHash}`,
				'Referer': 'https://vip.idlixofficial.net/',
				"X-Requested-With": "XMLHttpRequest"
			}
		});
		const element_scripts = await this.querySelectorAll(fetch_m3u8_subtitle, "script");
		let scriptss = ""
		element_scripts.forEach(element => {
			if(element.content.includes('playerjsSubtitle')){
				scriptss = element.content
			}
		})
		let subtitles = []
		if(scriptss){
			const subtitle_url = this.cariMatch(scriptss, /playerjsSubtitle = "(.+?)"/)
			const arr_subtitle_url = subtitle_url.split(",")
			subtitles = arr_subtitle_url.map((item,i)=>{
				const title_subtitle = this.cariMatch(item, /\[(.+?)\]/)
				const url_subtitle = item.replace( /\[.+?\]/, "")
				return {
					title: title_subtitle,
					url: url_subtitle
				}
			})
		}
		return {
			type: "hls",
			url: m3u8_url,
			subtitles
		}
	}

	async decryptAES(decrypted, key) {
		var CryptoJS_ = (function (t, e) {
			var r = {},
				i = (r.lib = {}),
				n = function () {},
				s = (i.Base = {
					extend: function (t) {
						n.prototype = this;
						var e = new n();
						return (
							t && e.mixIn(t),
							e.hasOwnProperty("init") ||
								(e.init = function () {
									e.$super.init.apply(this, arguments);
								}),
							(e.init.prototype = e),
							(e.$super = this),
							e
						);
					},
					create: function () {
						var t = this.extend();
						return t.init.apply(t, arguments), t;
					},
					init: function () {},
					mixIn: function (t) {
						for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e]);
						t.hasOwnProperty("toString") && (this.toString = t.toString);
					},
					clone: function () {
						return this.init.prototype.extend(this);
					},
				}),
				o = (i.WordArray = s.extend({
					init: function (t, e) {
						(t = this.words = t || []),
							(this.sigBytes = void 0 != e ? e : 4 * t.length);
					},
					toString: function (t) {
						return (t || a).stringify(this);
					},
					concat: function (t) {
						var e = this.words,
							r = t.words,
							i = this.sigBytes;
						if (((t = t.sigBytes), this.clamp(), i % 4))
							for (var n = 0; n < t; n++)
								e[(i + n) >>> 2] |=
									((r[n >>> 2] >>> (24 - 8 * (n % 4))) & 255) <<
									(24 - 8 * ((i + n) % 4));
						else if (65535 < r.length)
							for (n = 0; n < t; n += 4) e[(i + n) >>> 2] = r[n >>> 2];
						else e.push.apply(e, r);
						return (this.sigBytes += t), this;
					},
					clamp: function () {
						var e = this.words,
							r = this.sigBytes;
						(e[r >>> 2] &= 4294967295 << (32 - 8 * (r % 4))),
							(e.length = t.ceil(r / 4));
					},
					clone: function () {
						var t = s.clone.call(this);
						return (t.words = this.words.slice(0)), t;
					},
					random: function (e) {
						for (var r = [], i = 0; i < e; i += 4)
							r.push((4294967296 * t.random()) | 0);
						return new o.init(r, e);
					},
				})),
				c = (r.enc = {}),
				a = (c.Hex = {
					stringify: function (t) {
						var e = t.words;
						t = t.sigBytes;
						for (var r = [], i = 0; i < t; i++) {
							var n = (e[i >>> 2] >>> (24 - 8 * (i % 4))) & 255;
							r.push((n >>> 4).toString(16)), r.push((15 & n).toString(16));
						}
						return r.join("");
					},
					parse: function (t) {
						for (var e = t.length, r = [], i = 0; i < e; i += 2)
							r[i >>> 3] |= parseInt(t.substr(i, 2), 16) << (24 - 4 * (i % 8));
						return new o.init(r, e / 2);
					},
				}),
				f = (c.Latin1 = {
					stringify: function (t) {
						var e = t.words;
						t = t.sigBytes;
						for (var r = [], i = 0; i < t; i++)
							r.push(
								String.fromCharCode((e[i >>> 2] >>> (24 - 8 * (i % 4))) & 255)
							);
						return r.join("");
					},
					parse: function (t) {
						for (var e = t.length, r = [], i = 0; i < e; i++)
							r[i >>> 2] |= (255 & t.charCodeAt(i)) << (24 - 8 * (i % 4));
						return new o.init(r, e);
					},
				}),
				h = (c.Utf8 = {
					stringify: function (t) {
						try {
							return decodeURIComponent(escape(f.stringify(t)));
						} catch (e) {
							throw Error("Malformed UTF-8 data");
						}
					},
					parse: function (t) {
						return f.parse(unescape(encodeURIComponent(t)));
					},
				}),
				u = (i.BufferedBlockAlgorithm = s.extend({
					reset: function () {
						(this._data = new o.init()), (this._nDataBytes = 0);
					},
					_append: function (t) {
						"string" == typeof t && (t = h.parse(t)),
							this._data.concat(t),
							(this._nDataBytes += t.sigBytes);
					},
					_process: function (e) {
						var r = this._data,
							i = r.words,
							n = r.sigBytes,
							s = this.blockSize,
							c = n / (4 * s),
							c = e ? t.ceil(c) : t.max((0 | c) - this._minBufferSize, 0);
						if (((e = c * s), (n = t.min(4 * e, n)), e)) {
							for (var a = 0; a < e; a += s) this._doProcessBlock(i, a);
							(a = i.splice(0, e)), (r.sigBytes -= n);
						}
						return new o.init(a, n);
					},
					clone: function () {
						var t = s.clone.call(this);
						return (t._data = this._data.clone()), t;
					},
					_minBufferSize: 0,
				}));
			i.Hasher = u.extend({
				cfg: s.extend(),
				init: function (t) {
					(this.cfg = this.cfg.extend(t)), this.reset();
				},
				reset: function () {
					u.reset.call(this), this._doReset();
				},
				update: function (t) {
					return this._append(t), this._process(), this;
				},
				finalize: function (t) {
					return t && this._append(t), this._doFinalize();
				},
				blockSize: 16,
				_createHelper: function (t) {
					return function (e, r) {
						return new t.init(r).finalize(e);
					};
				},
				_createHmacHelper: function (t) {
					return function (e, r) {
						return new _.HMAC.init(t, r).finalize(e);
					};
				},
			});
			var _ = (r.algo = {});
			return r;
		})(Math);
		!(function () {
			var t = CryptoJS_,
				e = t.lib.WordArray;
			t.enc.Base64 = {
				stringify: function (t) {
					var e = t.words,
						r = t.sigBytes,
						i = this._map;
					t.clamp(), (t = []);
					for (var n = 0; n < r; n += 3)
						for (
							var s =
									(((e[n >>> 2] >>> (24 - 8 * (n % 4))) & 255) << 16) |
									(((e[(n + 1) >>> 2] >>> (24 - 8 * ((n + 1) % 4))) & 255) <<
										8) |
									((e[(n + 2) >>> 2] >>> (24 - 8 * ((n + 2) % 4))) & 255),
								o = 0;
							4 > o && n + 0.75 * o < r;
							o++
						)
							t.push(i.charAt((s >>> (6 * (3 - o))) & 63));
					if ((e = i.charAt(64))) for (; t.length % 4; ) t.push(e);
					return t.join("");
				},
				parse: function (t) {
					var r = t.length,
						i = this._map,
						n = i.charAt(64);
					n && -1 != (n = t.indexOf(n)) && (r = n);
					for (var n = [], s = 0, o = 0; o < r; o++)
						if (o % 4) {
							var c = i.indexOf(t.charAt(o - 1)) << (2 * (o % 4)),
								a = i.indexOf(t.charAt(o)) >>> (6 - 2 * (o % 4));
							(n[s >>> 2] |= (c | a) << (24 - 8 * (s % 4))), s++;
						}
					return e.create(n, s);
				},
				_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
			};
		})(),
			(function (t) {
				function e(t, e, r, i, n, s, o) {
					return (
						(((t = t + ((e & r) | (~e & i)) + n + o) << s) | (t >>> (32 - s))) +
						e
					);
				}
				function r(t, e, r, i, n, s, o) {
					return (
						(((t = t + ((e & i) | (r & ~i)) + n + o) << s) | (t >>> (32 - s))) +
						e
					);
				}
				function i(t, e, r, i, n, s, o) {
					return (((t = t + (e ^ r ^ i) + n + o) << s) | (t >>> (32 - s))) + e;
				}
				function n(t, e, r, i, n, s, o) {
					return (
						(((t = t + (r ^ (e | ~i)) + n + o) << s) | (t >>> (32 - s))) + e
					);
				}
				for (
					var s = CryptoJS_,
						o = s.lib,
						c = o.WordArray,
						a = o.Hasher,
						o = s.algo,
						f = [],
						h = 0;
					64 > h;
					h++
				)
					f[h] = (4294967296 * t.abs(t.sin(h + 1))) | 0;
				(o = o.MD5 =
					a.extend({
						_doReset: function () {
							this._hash = new c.init([
								1732584193, 4023233417, 2562383102, 271733878,
							]);
						},
						_doProcessBlock: function (t, s) {
							for (var o = 0; 16 > o; o++) {
								var c = s + o,
									a = t[c];
								t[c] =
									(((a << 8) | (a >>> 24)) & 16711935) |
									(((a << 24) | (a >>> 8)) & 4278255360);
							}
							var o = this._hash.words,
								c = t[s + 0],
								a = t[s + 1],
								h = t[s + 2],
								u = t[s + 3],
								_ = t[s + 4],
								p = t[s + 5],
								d = t[s + 6],
								l = t[s + 7],
								y = t[s + 8],
								v = t[s + 9],
								g = t[s + 10],
								$ = t[s + 11],
								B = t[s + 12],
								x = t[s + 13],
								k = t[s + 14],
								S = t[s + 15],
								m = o[0],
								z = o[1],
								w = o[2],
								C = o[3],
								m = e(m, z, w, C, c, 7, f[0]),
								C = e(C, m, z, w, a, 12, f[1]),
								w = e(w, C, m, z, h, 17, f[2]),
								z = e(z, w, C, m, u, 22, f[3]),
								m = e(m, z, w, C, _, 7, f[4]),
								C = e(C, m, z, w, p, 12, f[5]),
								w = e(w, C, m, z, d, 17, f[6]),
								z = e(z, w, C, m, l, 22, f[7]),
								m = e(m, z, w, C, y, 7, f[8]),
								C = e(C, m, z, w, v, 12, f[9]),
								w = e(w, C, m, z, g, 17, f[10]),
								z = e(z, w, C, m, $, 22, f[11]),
								m = e(m, z, w, C, B, 7, f[12]),
								C = e(C, m, z, w, x, 12, f[13]),
								w = e(w, C, m, z, k, 17, f[14]),
								z = e(z, w, C, m, S, 22, f[15]),
								m = r(m, z, w, C, a, 5, f[16]),
								C = r(C, m, z, w, d, 9, f[17]),
								w = r(w, C, m, z, $, 14, f[18]),
								z = r(z, w, C, m, c, 20, f[19]),
								m = r(m, z, w, C, p, 5, f[20]),
								C = r(C, m, z, w, g, 9, f[21]),
								w = r(w, C, m, z, S, 14, f[22]),
								z = r(z, w, C, m, _, 20, f[23]),
								m = r(m, z, w, C, v, 5, f[24]),
								C = r(C, m, z, w, k, 9, f[25]),
								w = r(w, C, m, z, u, 14, f[26]),
								z = r(z, w, C, m, y, 20, f[27]),
								m = r(m, z, w, C, x, 5, f[28]),
								C = r(C, m, z, w, h, 9, f[29]),
								w = r(w, C, m, z, l, 14, f[30]),
								z = r(z, w, C, m, B, 20, f[31]),
								m = i(m, z, w, C, p, 4, f[32]),
								C = i(C, m, z, w, y, 11, f[33]),
								w = i(w, C, m, z, $, 16, f[34]),
								z = i(z, w, C, m, k, 23, f[35]),
								m = i(m, z, w, C, a, 4, f[36]),
								C = i(C, m, z, w, _, 11, f[37]),
								w = i(w, C, m, z, l, 16, f[38]),
								z = i(z, w, C, m, g, 23, f[39]),
								m = i(m, z, w, C, x, 4, f[40]),
								C = i(C, m, z, w, c, 11, f[41]),
								w = i(w, C, m, z, u, 16, f[42]),
								z = i(z, w, C, m, d, 23, f[43]),
								m = i(m, z, w, C, v, 4, f[44]),
								C = i(C, m, z, w, B, 11, f[45]),
								w = i(w, C, m, z, S, 16, f[46]),
								z = i(z, w, C, m, h, 23, f[47]),
								m = n(m, z, w, C, c, 6, f[48]),
								C = n(C, m, z, w, l, 10, f[49]),
								w = n(w, C, m, z, k, 15, f[50]),
								z = n(z, w, C, m, p, 21, f[51]),
								m = n(m, z, w, C, B, 6, f[52]),
								C = n(C, m, z, w, u, 10, f[53]),
								w = n(w, C, m, z, g, 15, f[54]),
								z = n(z, w, C, m, a, 21, f[55]),
								m = n(m, z, w, C, y, 6, f[56]),
								C = n(C, m, z, w, S, 10, f[57]),
								w = n(w, C, m, z, d, 15, f[58]),
								z = n(z, w, C, m, x, 21, f[59]),
								m = n(m, z, w, C, _, 6, f[60]),
								C = n(C, m, z, w, $, 10, f[61]),
								w = n(w, C, m, z, h, 15, f[62]),
								z = n(z, w, C, m, v, 21, f[63]);
							(o[0] = (o[0] + m) | 0),
								(o[1] = (o[1] + z) | 0),
								(o[2] = (o[2] + w) | 0),
								(o[3] = (o[3] + C) | 0);
						},
						_doFinalize: function () {
							var e = this._data,
								r = e.words,
								i = 8 * this._nDataBytes,
								n = 8 * e.sigBytes;
							r[n >>> 5] |= 128 << (24 - (n % 32));
							var s = t.floor(i / 4294967296);
							for (
								r[(((n + 64) >>> 9) << 4) + 15] =
									(((s << 8) | (s >>> 24)) & 16711935) |
									(((s << 24) | (s >>> 8)) & 4278255360),
									r[(((n + 64) >>> 9) << 4) + 14] =
										(((i << 8) | (i >>> 24)) & 16711935) |
										(((i << 24) | (i >>> 8)) & 4278255360),
									e.sigBytes = 4 * (r.length + 1),
									this._process(),
									r = (e = this._hash).words,
									i = 0;
								4 > i;
								i++
							)
								(n = r[i]),
									(r[i] =
										(((n << 8) | (n >>> 24)) & 16711935) |
										(((n << 24) | (n >>> 8)) & 4278255360));
							return e;
						},
						clone: function () {
							var t = a.clone.call(this);
							return (t._hash = this._hash.clone()), t;
						},
					})),
					(s.MD5 = a._createHelper(o)),
					(s.HmacMD5 = a._createHmacHelper(o));
			})(Math),
			(function () {
				var t = CryptoJS_,
					e = t.lib,
					r = e.Base,
					i = e.WordArray,
					e = t.algo,
					n = (e.EvpKDF = r.extend({
						cfg: r.extend({
							keySize: 4,
							hasher: e.MD5,
							iterations: 1,
						}),
						init: function (t) {
							this.cfg = this.cfg.extend(t);
						},
						compute: function (t, e) {
							for (
								var r = this.cfg,
									n = r.hasher.create(),
									s = i.create(),
									o = s.words,
									c = r.keySize,
									r = r.iterations;
								o.length < c;

							) {
								a && n.update(a);
								var a = n.update(t).finalize(e);
								n.reset();
								for (var f = 1; f < r; f++) (a = n.finalize(a)), n.reset();
								s.concat(a);
							}
							return (s.sigBytes = 4 * c), s;
						},
					}));
				t.EvpKDF = function (t, e, r) {
					return n.create(r).compute(t, e);
				};
			})(),
			CryptoJS_.lib.Cipher ||
				(function (t) {
					var e = CryptoJS_,
						r = e.lib,
						i = r.Base,
						n = r.WordArray,
						s = r.BufferedBlockAlgorithm,
						o = e.enc.Base64,
						c = e.algo.EvpKDF,
						a = (r.Cipher = s.extend({
							cfg: i.extend(),
							createEncryptor: function (t, e) {
								return this.create(this._ENC_XFORM_MODE, t, e);
							},
							createDecryptor: function (t, e) {
								return this.create(this._DEC_XFORM_MODE, t, e);
							},
							init: function (t, e, r) {
								(this.cfg = this.cfg.extend(r)),
									(this._xformMode = t),
									(this._key = e),
									this.reset();
							},
							reset: function () {
								s.reset.call(this), this._doReset();
							},
							process: function (t) {
								return this._append(t), this._process();
							},
							finalize: function (t) {
								return t && this._append(t), this._doFinalize();
							},
							keySize: 4,
							ivSize: 4,
							_ENC_XFORM_MODE: 1,
							_DEC_XFORM_MODE: 2,
							_createHelper: function (t) {
								return {
									encrypt: function (e, r, i) {
										return ("string" == typeof r ? d : p).encrypt(t, e, r, i);
									},
									decrypt: function (e, r, i) {
										e = JSON.parse(e);
										var r = r.split("\\x"),
											n = "";
										const bb = CryptoJS.enc.Utf8.stringify(
											CryptoJS.enc.Base64.parse(
												e.m.split("").reduce((t, e) => e + t, "") + "=="
											)
										);
										for (var s of bb.split("|"))
											n += "\\x" + r[parseInt(s) + 1];
										return (
											(r = n),
											(e = JSON.stringify(e)),
											("string" == typeof r ? d : p).decrypt(t, e, r, i)
										);
									},
								};
							},
						}));
					r.StreamCipher = a.extend({
						_doFinalize: function () {
							return this._process(!0);
						},
						blockSize: 1,
					});
					var f = (e.mode = {}),
						h = function (t, e, r) {
							var i = this._iv;
							i ? (this._iv = void 0) : (i = this._prevBlock);
							for (var n = 0; n < r; n++) t[e + n] ^= i[n];
						},
						u = (r.BlockCipherMode = i.extend({
							createEncryptor: function (t, e) {
								return this.Encryptor.create(t, e);
							},
							createDecryptor: function (t, e) {
								return this.Decryptor.create(t, e);
							},
							init: function (t, e) {
								(this._cipher = t), (this._iv = e);
							},
						})).extend();
					(u.Encryptor = u.extend({
						processBlock: function (t, e) {
							var r = this._cipher,
								i = r.blockSize;
							h.call(this, t, e, i),
								r.encryptBlock(t, e),
								(this._prevBlock = t.slice(e, e + i));
						},
					})),
						(u.Decryptor = u.extend({
							processBlock: function (t, e) {
								var r = this._cipher,
									i = r.blockSize,
									n = t.slice(e, e + i);
								r.decryptBlock(t, e),
									h.call(this, t, e, i),
									(this._prevBlock = n);
							},
						})),
						(f = f.CBC = u),
						(u = (e.pad = {}).Pkcs7 =
							{
								pad: function (t, e) {
									for (
										var r = 4 * e,
											r = r - (t.sigBytes % r),
											i = (r << 24) | (r << 16) | (r << 8) | r,
											s = [],
											o = 0;
										o < r;
										o += 4
									)
										s.push(i);
									(r = n.create(s, r)), t.concat(r);
								},
								unpad: function (t) {
									t.sigBytes -= 255 & t.words[(t.sigBytes - 1) >>> 2];
								},
							}),
						(r.BlockCipher = a.extend({
							cfg: a.cfg.extend({
								mode: f,
								padding: u,
							}),
							reset: function () {
								a.reset.call(this);
								var t = this.cfg,
									e = t.iv,
									t = t.mode;
								if (this._xformMode == this._ENC_XFORM_MODE)
									var r = t.createEncryptor;
								else (r = t.createDecryptor), (this._minBufferSize = 1);
								this._mode = r.call(t, this, e && e.words);
							},
							_doProcessBlock: function (t, e) {
								this._mode.processBlock(t, e);
							},
							_doFinalize: function () {
								var t = this.cfg.padding;
								if (this._xformMode == this._ENC_XFORM_MODE) {
									t.pad(this._data, this.blockSize);
									var e = this._process(!0);
								} else (e = this._process(!0)), t.unpad(e);
								return e;
							},
							blockSize: 4,
						}));
					var _ = (r.CipherParams = i.extend({
							init: function (t) {
								this.mixIn(t);
							},
							toString: function (t) {
								return (t || this.formatter).stringify(this);
							},
						})),
						f = ((e.format = {}).OpenSSL = {
							stringify: function (t) {
								var e = t.ciphertext;
								return (
									(t = t.salt)
										? n.create([1398893684, 1701076831]).concat(t).concat(e)
										: e
								).toString(o);
							},
							parse: function (t) {
								var e = (t = o.parse(t)).words;
								if (1398893684 == e[0] && 1701076831 == e[1]) {
									var r = n.create(e.slice(2, 4));
									e.splice(0, 4), (t.sigBytes -= 16);
								}
								return _.create({
									ciphertext: t,
									salt: r,
								});
							},
						}),
						p = (r.SerializableCipher = i.extend({
							cfg: i.extend({
								format: f,
							}),
							encrypt: function (t, e, r, i) {
								i = this.cfg.extend(i);
								var n = t.createEncryptor(r, i);
								return (
									(e = n.finalize(e)),
									(n = n.cfg),
									_.create({
										ciphertext: e,
										key: r,
										iv: n.iv,
										algorithm: t,
										mode: n.mode,
										padding: n.padding,
										blockSize: t.blockSize,
										formatter: i.format,
									})
								);
							},
							decrypt: function (t, e, r, i) {
								return (
									(i = this.cfg.extend(i)),
									(e = this._parse(e, i.format)),
									t.createDecryptor(r, i).finalize(e.ciphertext)
								);
							},
							_parse: function (t, e) {
								return "string" == typeof t ? e.parse(t, this) : t;
							},
						})),
						e = ((e.kdf = {}).OpenSSL = {
							execute: function (t, e, r, i) {
								return (
									i || (i = n.random(8)),
									(t = c
										.create({
											keySize: e + r,
										})
										.compute(t, i)),
									(r = n.create(t.words.slice(e), 4 * r)),
									(t.sigBytes = 4 * e),
									_.create({
										key: t,
										iv: r,
										salt: i,
									})
								);
							},
						}),
						d = (r.PasswordBasedCipher = p.extend({
							cfg: p.cfg.extend({
								kdf: e,
							}),
							encrypt: function (t, e, r, i) {
								return (
									(r = (i = this.cfg.extend(i)).kdf.execute(
										r,
										t.keySize,
										t.ivSize
									)),
									(i.iv = r.iv),
									(t = p.encrypt.call(this, t, e, r.key, i)).mixIn(r),
									t
								);
							},
							decrypt: function (t, e, r, i) {
								return (
									(i = this.cfg.extend(i)),
									(e = this._parse(e, i.format)),
									(r = i.kdf.execute(r, t.keySize, t.ivSize, e.salt)),
									(i.iv = r.iv),
									p.decrypt.call(this, t, e, r.key, i)
								);
							},
						}));
				})(),
			(function () {
				for (
					var t = CryptoJS_,
						e = t.lib.BlockCipher,
						r = t.algo,
						i = [],
						n = [],
						s = [],
						o = [],
						c = [],
						a = [],
						f = [],
						h = [],
						u = [],
						_ = [],
						p = [],
						d = 0;
					256 > d;
					d++
				)
					p[d] = 128 > d ? d << 1 : (d << 1) ^ 283;
				for (var l = 0, y = 0, d = 0; 256 > d; d++) {
					var v = y ^ (y << 1) ^ (y << 2) ^ (y << 3) ^ (y << 4),
						v = (v >>> 8) ^ (255 & v) ^ 99;
					(i[l] = v), (n[v] = l);
					var g = p[l],
						$ = p[g],
						B = p[$],
						x = (257 * p[v]) ^ (16843008 * v);
					(s[l] = (x << 24) | (x >>> 8)),
						(o[l] = (x << 16) | (x >>> 16)),
						(c[l] = (x << 8) | (x >>> 24)),
						(a[l] = x),
						(x = (16843009 * B) ^ (65537 * $) ^ (257 * g) ^ (16843008 * l)),
						(f[v] = (x << 24) | (x >>> 8)),
						(h[v] = (x << 16) | (x >>> 16)),
						(u[v] = (x << 8) | (x >>> 24)),
						(_[v] = x),
						l ? ((l = g ^ p[p[p[B ^ g]]]), (y ^= p[p[y]])) : (l = y = 1);
				}
				var k = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
					r = (r.AES = e.extend({
						_doReset: function () {
							for (
								var t = this._key,
									e = t.words,
									r = t.sigBytes / 4,
									t = 4 * ((this._nRounds = r + 6) + 1),
									n = (this._keySchedule = []),
									s = 0;
								s < t;
								s++
							)
								if (s < r) n[s] = e[s];
								else {
									var o = n[s - 1];
									s % r
										? 6 < r &&
										  4 == s % r &&
										  (o =
												(i[o >>> 24] << 24) |
												(i[(o >>> 16) & 255] << 16) |
												(i[(o >>> 8) & 255] << 8) |
												i[255 & o])
										: ((o =
												(i[(o = (o << 8) | (o >>> 24)) >>> 24] << 24) |
												(i[(o >>> 16) & 255] << 16) |
												(i[(o >>> 8) & 255] << 8) |
												i[255 & o]),
										  (o ^= k[(s / r) | 0] << 24)),
										(n[s] = n[s - r] ^ o);
								}
							for (r = 0, e = this._invKeySchedule = []; r < t; r++)
								(s = t - r),
									(o = r % 4 ? n[s] : n[s - 4]),
									(e[r] =
										4 > r || 4 >= s
											? o
											: f[i[o >>> 24]] ^
											  h[i[(o >>> 16) & 255]] ^
											  u[i[(o >>> 8) & 255]] ^
											  _[i[255 & o]]);
						},
						encryptBlock: function (t, e) {
							this._doCryptBlock(t, e, this._keySchedule, s, o, c, a, i);
						},
						decryptBlock: function (t, e) {
							var r = t[e + 1];
							(t[e + 1] = t[e + 3]),
								(t[e + 3] = r),
								this._doCryptBlock(t, e, this._invKeySchedule, f, h, u, _, n),
								(r = t[e + 1]),
								(t[e + 1] = t[e + 3]),
								(t[e + 3] = r);
						},
						_doCryptBlock: function (t, e, r, i, n, s, o, c) {
							for (
								var a = this._nRounds,
									f = t[e] ^ r[0],
									h = t[e + 1] ^ r[1],
									u = t[e + 2] ^ r[2],
									_ = t[e + 3] ^ r[3],
									p = 4,
									d = 1;
								d < a;
								d++
							)
								var l =
										i[f >>> 24] ^
										n[(h >>> 16) & 255] ^
										s[(u >>> 8) & 255] ^
										o[255 & _] ^
										r[p++],
									y =
										i[h >>> 24] ^
										n[(u >>> 16) & 255] ^
										s[(_ >>> 8) & 255] ^
										o[255 & f] ^
										r[p++],
									v =
										i[u >>> 24] ^
										n[(_ >>> 16) & 255] ^
										s[(f >>> 8) & 255] ^
										o[255 & h] ^
										r[p++],
									_ =
										i[_ >>> 24] ^
										n[(f >>> 16) & 255] ^
										s[(h >>> 8) & 255] ^
										o[255 & u] ^
										r[p++],
									f = l,
									h = y,
									u = v;
							(l =
								((c[f >>> 24] << 24) |
									(c[(h >>> 16) & 255] << 16) |
									(c[(u >>> 8) & 255] << 8) |
									c[255 & _]) ^
								r[p++]),
								(y =
									((c[h >>> 24] << 24) |
										(c[(u >>> 16) & 255] << 16) |
										(c[(_ >>> 8) & 255] << 8) |
										c[255 & f]) ^
									r[p++]),
								(v =
									((c[u >>> 24] << 24) |
										(c[(_ >>> 16) & 255] << 16) |
										(c[(f >>> 8) & 255] << 8) |
										c[255 & h]) ^
									r[p++]),
								(_ =
									((c[_ >>> 24] << 24) |
										(c[(f >>> 16) & 255] << 16) |
										(c[(h >>> 8) & 255] << 8) |
										c[255 & u]) ^
									r[p++]),
								(t[e] = l),
								(t[e + 1] = y),
								(t[e + 2] = v),
								(t[e + 3] = _);
						},
						keySize: 8,
					}));
				t.AES = e._createHelper(r);
			})();
		var CryptoJSAesJson = {
			encrypt: function (value, password) {
				return CryptoJS_.AES.encrypt(JSON.stringify(value), password, {
					format: CryptoJSAesJson,
				}).toString();
			},

			decrypt: function (jsonStr, password) {
				const a = CryptoJS_.AES.decrypt(jsonStr, password, {
					format: CryptoJSAesJson,
				});

				const b = a.toString(CryptoJS_.enc.Utf8);
				return JSON.parse(b);
			},

			stringify: function (cipherParams) {
				var j = { ct: cipherParams.ciphertext.toString(CryptoJS_.enc.Base64) };
				if (cipherParams.iv) j.iv = cipherParams.iv.toString();
				if (cipherParams.salt) j.s = cipherParams.salt.toString();
				return JSON.stringify(j).replace(/\s/g, "");
			},

			parse: function (jsonStr) {
				var j = JSON.parse(jsonStr);
				var cipherParams = CryptoJS_.lib.CipherParams.create({
					ciphertext: CryptoJS_.enc.Base64.parse(j.ct),
				});
				if (j.iv) cipherParams.iv = CryptoJS_.enc.Hex.parse(j.iv);
				if (j.s) cipherParams.salt = CryptoJS_.enc.Hex.parse(j.s);
				return cipherParams;
			},
		};
		const decrypting = await CryptoJSAesJson.decrypt(decrypted, key);
		return decrypting;
	}
	cariMatch(input, regex) {
		const match = input.match(regex);
		return match ? (match.length > 2 ? match : match[1]) : null;
	}
	parseUrl(url) {
		function getUrlParamsRegex(queryString) {
			// Regular expression to match key-value pairs
			const paramRegex = /([^&=]+)=?([^&]*)/g;
			const params = {};
	
			// Match all key-value pairs in the query string
			let match;
			while ((match = paramRegex.exec(queryString)) !== null) {
				const key = decodeURIComponent(match[1]);
				const value = decodeURIComponent(match[2]);
	
				// Handle multiple values for the same key
				if (params.hasOwnProperty(key)) {
					if (!Array.isArray(params[key])) {
						params[key] = [params[key]];
					}
					params[key].push(value);
				} else {
					params[key] = value;
				}
			}
			return params;
		}
		const urlRegex =
			/^(([^ :/?#]+):\/\/)?([^/?#]*)(?:[:]([^/?#]*))?([^?#]*)(?:[?]([^#]*))?(#.*)?/;
		const match = url.match(urlRegex);
		if (!match) {
			return null;
		}
		const parsedUrl = {};
		parsedUrl.protocol = match[2] || ""; 
		parsedUrl.host = match[3] || "";
		parsedUrl.port = match[4] || "";
		parsedUrl.pathname = match[5] || "";
		parsedUrl.search = match[6] || "";
		parsedUrl.hash = match[7] || "";
		if (parsedUrl.search) {
			parsedUrl.searchParams = getUrlParamsRegex(parsedUrl.search);
		} else {
			parsedUrl.searchParams = {};
		}
		return parsedUrl;
	}
}