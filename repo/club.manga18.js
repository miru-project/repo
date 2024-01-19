// ==MiruExtension==
// @name         manga18.club
// @version      v0.0.2
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

	#sources = {
		'[en]manga18.club': 'https://manga18.club',
		'[zh-CN]hanman18.com': 'https://hanman18.com',
		'[fr]tumanhwas.club': 'https://tumanhwas.club',
		'[fr]leercapitulo.net': 'https://leercapitulo.net',
		//'[en]comic1000.com': 'https://comic1000.com',
		//'[en]18porncomic.com': 'https://18porncomic.com',
		//'[en]manga18.us': 'https://manga18.us',
		//'[en]manhuascan.us': 'https://manhuascan.us',
	};

	#genres = {};
	#cacheCover = {};

	async queryAll(res, selector, func) {
		const finds = await Promise.all(
			(await this.querySelectorAll(res, selector)).map(async (v, i) => {
				const html = await v.content;
				return await func(html, i);
			})
		);
		return finds || [];
	}
	
	async load() {
		await this.registerSetting({
			title: 'Source',
			key: 'source',
			type: 'radio',
			defaultValue: 'https://manga18.club',
			options: this.#sources
		});
	}
	
	async req(path) {
		const baseUrl = await this.getSetting('source');
		if (~path.indexOf(baseUrl)) path = path.replace(baseUrl, '');
		return await this.request('', {
			headers: {
				//'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
				'Miru-Url': baseUrl + path
			}
		});
	}

	async createFilter(filter) {
		const res = await this.req(`/list-manga`);
		const cates = {"All": "All"};
		await this.queryAll(res, '.grid_cate > ul > li', async (html) => {
			let title = await this.querySelector(html, 'a').text;
			title = title.trim();
			cates[title] = title;
			this.#genres[title] = await this.getAttributeText(html, 'a', 'href');
		})
		return {
			"data": {
				title: "GENRES",
				max: 1,
				min: 0,
				default: "All",
				options: cates,
			}
		}
	}
	
	async getMangas(path) {
		const res = await this.req(path);
		return await this.queryAll(res, 'div.story_item > div.story_images', async (html) => {
			const title = await this.getAttributeText(html, 'a', 'title');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = await this.getAttributeText(html, 'img', 'src');
			this.#cacheCover[url] = cover;
			return {
				title: title.trim(),
				url,
				cover
			}
		})
	}

	async latest(page) {
		return await this.getMangas(`/list-manga/${page}`);
	}

	async search(kw, page, filter) {
		const filt = filter?.data && filter.data[0] || 'All';
		let seaKW = `/list-manga/${page}`;
		if (kw) {
			seaKW += `?search=${encodeURIComponent(kw)}`;
		} else if (filt != 'All' && filt in this.#genres) {
			seaKW = this.#genres[filt] + `/${page}`;
		}
		return await this.getMangas(seaKW);
	}

	async detail(url) {
		const res = await this.req(url);
		const title = await this.querySelector(res, '.detail_name > h1').text;
		const desc = await this.querySelector(res, '.detail_reviewContent').text;
		const imgs = await this.queryAll(res, '.chapter_box .item > a', async (html, i) => {
			return {
				name: (await this.querySelector(html, 'a').text || '').trim(),
				url: await this.getAttributeText(html, 'a', 'href')
			}
		})
		const cover = this.#cacheCover[url] || (await this.getAttributeText(res, '.detail_avatar > img', 'src')) || '';
		const subtitle = await this.queryAll(res, '.detail_listInfo > .item', async (html, i) => {
			const _label = (await this.querySelector(html, '.info_label').text || '');
			const _value = (await this.querySelector(html, '.info_value > a').text ||
				await this.querySelector(html, '.info_value > span').text || '');
			return `${_label.trim()}: ${_value.trim()}`;
		}) || [];
		subtitle.push(desc.trim());
		return {
			title: title.trim(),
			cover,
			desc: subtitle.join('\n'),
			episodes: [
				{
					title: 'Directory',
					urls: imgs
				}
			]
		};
	}

	async watch(url) {
		const atob = (base64) => CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Utf8);
		const res = await this.req(url);
		const baseUrl = this.getSetting('source');
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
	}
}
