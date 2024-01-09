// ==MiruExtension==
// @name         manga18.club
// @version      v0.0.1
// @author       vvsolo
// @lang         all
// @license      MIT
// @type         manga
// @icon         https://manga18.club/fav.png?v=1
// @package      club.manga18
// @webSite      https://manga18.club
// @nsfw         true
// ==/MiruExtension==

export default class Mangafx extends Extension {

	#sources = {
		'[en]manga18.club': 'https://manga18.club',
		'[zh-tw]hanman18.com': 'https://hanman18.com',
		'[es]tumanhwas.club': 'https://tumanhwas.club',
		'[es]leercapitulo.net': 'https://leercapitulo.net',
		//'[en]comic1000.com': 'https://comic1000.com',
		//'[en]18porncomic.com': 'https://18porncomic.com',
		//'[en]manga18.us': 'https://manga18.us',
		//'[en]manhuascan.us': 'https://manhuascan.us',
	};

	#genres = {};

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

	async latest(page) {
		const res = await this.req(`/list-manga/${page}`);
		const elList = await this.querySelectorAll(res, 'div.story_item > div.story_images');
		const mangas = [];
		for (const element of elList) {
			const html = await element.content;
			const title = await this.getAttributeText(html, 'a', 'title');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = await this.getAttributeText(html, 'img', 'src');
			mangas.push({
				title: title.trim(),
				url,
				cover
			});
		}
		return mangas;
	}

	async createFilter(filter) {
		const res = await this.req(`/list-manga`);
		const cateList = await this.querySelectorAll(res, '.grid_cate > ul > li');
		const cates = {"All": "All"};
		for (const element of cateList) {
			const html = await element.content;
			let title = await this.querySelector(html, 'a').text;
			let url = await this.getAttributeText(html, 'a', 'href');
			title = title.trim();
			cates[title] = title;
			this.#genres[title] = url;
		}
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
	
	async search(kw, page, filter) {
		const filt = filter?.data && filter.data[0] || 'All';
		let seaKW = `/list-manga/${page}`;
		if (kw) {
			seaKW += `?search=${encodeURIComponent(kw)}`;
		} else if (filt != 'All' && filt in this.#genres) {
			seaKW = this.#genres[filt] + `/${page}`;
		}
		const res = await this.req(seaKW);
		const elList = await this.querySelectorAll(res, 'div.story_item > div.story_images');
		const mangas = [];
		for (const element of elList) {
			const html = await element.content;
			const title = await this.getAttributeText(html, 'a', 'title');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = await this.getAttributeText(html, 'img', 'src');
			mangas.push({
				title: title.trim(),
				url,
				cover
			});
		}
		return mangas;
	}

	async detail(url) {
		const res = await this.req(url);
		const title = await this.querySelector(res, '.detail_name > h1').text;
		//const cover = await this.querySelector(res, '.detail_avatar > img').getAttributeText('src');
		const cover = res.match(/img src="([^"]+\/cover_250x350\.jpg)"/)[1] || '';
		const desc = await this.querySelector(res, '.detail_reviewContent').text;
		const urls = await this.querySelectorAll(res, '.chapter_box .item > a');
		const episodeUrl = [];
		for (const element of urls) {
			const html = await element.content;
			const etitle = await this.querySelector(html, 'a').text;
			const eurl = await this.getAttributeText(html, 'a', 'href');
			episodeUrl.push({
				name: etitle.trim(),
				url: eurl
			});
		}
		return {
			title: title.trim(),
			cover,
			desc: desc.trim(),
			episodes: [
				{
					title: 'Directory',
					urls: episodeUrl
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
