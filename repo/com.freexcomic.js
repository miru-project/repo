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

export default class extends Extension {
	#sources = {
		'mxsmh01.top': 'http://www.mxsmh01.top',
		'mxsmh1.com': 'http://www.mxsmh1.com',
		'mxs2.com': 'http://www.mxs2.com',
		'mxs02.top': 'http://www.mxs02.top',
		'mxs03.top': 'http://www.mxs03.top',
		'mxs04.top': 'http://www.mxs04.top',
		'92hm.life': 'http://www.92hm.life'
	};
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

	async getMangas(path) {
		const res = await this.req(path);
		return await this.queryAll(res, 'div.mh-item > a', async (html) => {
			const title = await this.getAttributeText(html, 'a', 'title');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = html.match(/background\-image: *url\((.+)\)/)[1] || '';
			this.#cacheCover[url] = cover;
			return {
				title: title.trim(),
				url,
				cover
			}
		})
	}
	
	async latest(page) {
		return await this.getMangas(`/booklist?page=${page}`);
	}

	async createFilter(filter) {
		return {
			"data": {
				title: "状态",
				max: 1,
				min: 0,
				default: "全部",
				options: {
					"全部": "全部",
					"连载": "连载",
					"完结": "完结"
				},
			}
		}
	}
	async search(kw, page, filter) {
		if (kw && page > 1) {
			return [];
		}
		const gens = {
			"全部": "All",
			"连载": "-1",
			"完结": "1"
		}
		const filt = filter?.data && filter.data[0] || '全部';
		let seaKW = `/booklist?page=${page}`;
		if (kw) {
			seaKW = `/search?keyword=${encodeURIComponent(kw)}`;
		} else if (filt != '全部') {
			seaKW += `&end=` + gens[filt];
		}
		return await this.getMangas(seaKW);
	}

	async detail(url) {
		const res = await this.req(url);
		const title = await this.querySelector(res, '.info > h1').text;
		const desc = await this.querySelector(res, 'p.content').text;
		const imgs = await this.queryAll(res, '#detail-list-select > li', async (html, i) => {
			return {
				name: (await this.querySelector(html, 'a').text || '').trim(),
				url: await this.getAttributeText(html, 'a', 'href')
			}
		})
		const cover = this.#cacheCover[url] || (await this.getAttributeText(res, '.cover > img', 'src')) || '';
		const subtitle = [];
		(await this.querySelector(res, '.info').content || '').replace(/<p class="subtitle">(.+?)<\/p>/g, (m, m1) => {
			subtitle.push(m1.replace(/&amp;/g, '&'));
		})
		subtitle.push(desc.trim());
		return {
			title: title.trim(),
			cover,
			desc: subtitle.join('\n'),
			episodes: [
				{
					title: 'Directory',
					urls: imgs.reverse()
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
