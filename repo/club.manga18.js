// ==MiruExtension==
// @name         manga18.club
// @version      v0.0.5
// @author       vvsolo
// @lang         all
// @license      MIT
// @type         manga
// @icon         https://manga18.club/fav.png?v=1
// @package      club.manga18
// @webSite      https://manga18.club
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
	#opts = {
		base: 'https://manga18.club',
		sources: {
			'[en]manga18.club': 'https://manga18.club',
			'[zh-CN]hanman18.com': 'https://hanman18.com',
			'[fr]tumanhwas.club': 'https://tumanhwas.club',
			'[fr]leercapitulo.net': 'https://leercapitulo.net',
		},
		uptime: 0,
		expire: 5,
	}
	#cache = new Map([
		['@cover', {}]
	]);

	async load() {
		await this.registerSetting({
			title: 'Source',
			key: 'source',
			type: 'radio',
			defaultValue: this.#opts.base,
			options: this.#opts.sources
		});
	}
	
	async createFilter(filter) {
		if (!this.checkCache('@genres')) {
			try {
				const res = await this.req(`/list-manga`);
				let genres = {
					"All": "All"
				};
				await this.queryAll(res, '.grid_cate > ul > li', async (html) => {
					const title = (await this.querySelector(html, 'a').text || '').trim();
					const href = await this.getAttributeText(html, 'a', 'href');
					genres[href] = title
				})
				this.#cache.set('@genres', genres);
			} catch (e) {}
		}
		return {
			"data": {
				title: "Genres",
				max: 1,
				min: 0,
				default: "All",
				options: this.#cache.get('@genres') || { "All": "All" },
			}
		}
	}

	async latest(page) {
		try {
			return await this.getMangas(`/list-manga/${page}`);
		} catch (e) {
			return [
				{
					title: "Need to use webview",
					url: "/",
					cover: null,
				},
			];
		}
	}

	async search(kw, page, filter) {
		try {
			const filt = filter?.data && filter.data[0] || 'All';
			let seaKW = filt === 'All' ? `/list-manga/${page}` : `/${filt}/${page}`;
			if (kw) {
				seaKW += `?s=${encodeURIComponent(kw)}`;
			}
			return await this.getMangas(seaKW);
		} catch (e) {
			return [
				{
					title: "Need to use webview",
					url: "/",
					cover: null,
				},
			];
		}
	}

	async detail(url) {
		if (url === "/") {
			return {
				title: "Use webview",
				cover: null,
				desc: "Please use webview to enter the website then close the webview window.",
			};
		}

		try {
			const res = await this.req(url);
			const titleEl = await this.querySelector(res, '.detail_name > h1, .detail_name');
			const title = titleEl ? (await titleEl.text).trim() : '';

			const descEl = await this.querySelector(res, '.detail_reviewContent');
			const desc = descEl ? (await descEl.text).trim() : '';

			const imgs = await this.queryAll(res, '.chapter_box .item > a', async (html) => {
				return {
					name: (await this.querySelector(html, 'a').text || '').trim(),
					url: await this.getAttributeText(html, 'a', 'href')
				}
			})
			const cover = this.#cache.get('@cover')[url] || (await this.getAttributeText(res, '.detail_avatar > img', 'src')) || '';
			const subtitle = await this.queryAll(res, '.detail_listInfo > .item', async (html) => {
				const _label = (await this.querySelector(html, '.info_label').text || '');
				const _value = (await this.querySelector(html, '.info_value > a').text ||
					await this.querySelector(html, '.info_value > span').text || '');
				return `${_label.trim()}: ${_value.trim()}`;
			}) || [];
			subtitle.push(desc);
			return {
				title,
				cover,
				desc: subtitle.join('\n'),
				episodes: [
					{
						title: 'Directory',
						urls: imgs
					}
				]
			};
		} catch (e) {
			return {
				title: "Use webview",
				cover: null,
				desc: "Please use webview to enter the website then close the webview window.",
			};
		}
	}

	async watch(url) {
		try {
			const atob = (base64) => CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Utf8);
			const res = await this.req(url);
			const baseUrl = await this.getSetting('source');
			let urls;
			if ((urls = res.match(/"(?:aHR0|L3By)[^"]+"/g))) {
				urls = urls.map(v => {
					v = atob(v.slice(1,-1));
					if (v.startsWith('/proxy.php')) {
						v = baseUrl + v;
					}
					return v;
				});
			}
			return {
				urls,
				header: {
					referer: baseUrl
				}
			};
		} catch (e) {
			return {
				urls: [],
			};
		}
	}
	
	async req(path) {
		const baseUrl = await this.getSetting('source');
		let cleanPath = path;
		if (~cleanPath.indexOf(baseUrl)) cleanPath = cleanPath.replace(baseUrl, '');
		if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
		return await this.request('', {
			headers: {
				'Miru-Url': baseUrl + cleanPath,
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Referer': baseUrl + '/',
			}
		});
	}

	async getMangas(path) {
		const baseUrl = await this.getSetting('source');
		const md5path = md5(baseUrl + path);
		if (this.checkCache(md5path)) {
			return this.#cache.get(md5path);
		}
		const res = await this.req(path);
		const mangas = await this.queryAll(res, 'div.story_item > div.story_images', async (html) => {
			const title = (await this.getAttributeText(html, 'a', 'title')) || (await this.getAttributeText(html, 'img', 'alt')) || '';
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = await this.getAttributeText(html, 'img', 'src');
			this.#cache.get('@cover')[url] = cover;
			return {
				title: title.trim(),
				url,
				cover
			}
		})
		if (mangas.length === 0) {
			throw new Error("Cloudflare protection or empty list");
		}
		this.#cache.set(md5path, mangas);
		this.#opts.uptime = Date.now();
		return mangas;
	}

	async queryAll(res, selector, func) {
		return await Promise.all(
			(await this.querySelectorAll(res, selector)).map(async (v, i) => {
				const html = await v.content;
				return await func(html, v, i);
			})
		) || [];
	}

	checkCache(item) {
		const expire = +(this.#opts.expire);
		return this.#cache.has(item) &&
			expire > 0 &&
			(Date.now() - this.#opts.uptime) < expire * 60 * 1000;
	}
}
