// ==MiruExtension==
// @name         愛看漫畫
// @version      v0.0.1
// @author       vvsolo
// @lang         zh-tw
// @license      MIT
// @type         manga
// @icon         http://mxsmh01.top/static/images/favicon.ico
// @package      com.freexcomic
// @webSite      http://
// @nsfw         true
// ==/MiruExtension==

export default class Mangafx extends Extension {
	#sources = {
		'mxsmh01.top': 'http://www.mxsmh01.top',
		'mxsmh1.com': 'http://www.mxsmh1.com',
		'mxs2.com': 'http://www.mxs2.com',
		'mxs02.top': 'http://www.mxs02.top',
		'mxs03.top': 'http://www.mxs03.top',
		'mxs04.top': 'http://www.mxs04.top',
		'92hm.life': 'http://www.92hm.life'
	};

	async load() {
		await this.registerSetting({
			title: 'Source',
			key: 'source',
			type: 'radio',
			defaultValue: 'http://www.mxsmh01.top',
			options: this.#sources
		});
	}
	async req(path) {
		const baseUrl = await this.getSetting('source');
		return await this.request('', {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
				'Miru-Url': baseUrl + path
			}
		});
	}

	async latest(page) {
		const res = await this.req(`/booklist?page=${page}`);
		const bsxList = await this.querySelectorAll(res, 'div.mh-item > a');
		const mangas = [];
		for (const element of bsxList) {
			const html = await element.content;
			const title = await this.getAttributeText(html, 'a', 'title');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = html.match(/background\-image: *url\((.+)\)/)[1] || '';
			mangas.push({
				title: title.trim(),
				url,
				cover
			});
		}
		return mangas;
	}

	async search(kw, page) {
		const res = await this.req(`/search?keyword=${encodeURIComponent(kw)}`);
		const bsxList = await this.querySelectorAll(res, 'div.mh-item > a');
		const mangas = [];
		for (const element of bsxList) {
			const html = await element.content;
			const title = await this.getAttributeText(html, 'a', 'title');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = html.match(/background\-image: *url\((.+)\)/)[1] || '';
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
		const title = await this.querySelector(res, '.info > h1').text;
		const cover = await this.querySelector(res, '.cover > img').getAttributeText('src');
		const desc = await this.querySelector(res, 'p.content').text;
		const urls = await this.querySelectorAll(res, '#detail-list-select > li');
		const episodeUrl = [];
		for (const element of urls) {
			const html = await element.content;
			const etitle = await this.querySelector(html, 'a').text;
			const eurl = await this.querySelector(html, 'a').getAttributeText('href');
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
					urls: episodeUrl.reverse()
				}
			]
		};
	}

	async watch(url) {
		const res = await this.req(url);
		let urls = res.match(/data\-original="([^"]+)"/g).map((v) => v.slice(15, -1));
		return {
			urls
		};
	}
}
