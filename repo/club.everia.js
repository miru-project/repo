// ==MiruExtension==
// @name         EVERIA.CLUB[Photo]
// @version      v0.0.2
// @author       vvsolo
// @lang         all
// @license      MIT
// @type         manga
// @icon         https://everiaeveria.b-cdn.net/wp-content/uploads/2023/08/Everiaicon.jpg
// @package      club.everia
// @webSite      https://everia.club
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
	#genres = {};
	#baseUrl = 'https://everia.club';
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
	
	async createFilter(filter) {
		const res = await this.request(`/`);
		const cates = {"All": "All"};
		await this.queryAll(res, '#menu-mainmenu > li.menu-item', async (html) => {
			let title = await this.querySelector(html, 'a').text;
			title = title.trim();
			cates[title] = title;
			this.#genres[title] = await this.getAttributeText(html, 'a', 'href');
		})
		return {
			"data": {
				title: "Category",
				max: 1,
				min: 1,
				default: "All",
				options: cates,
			}
		}
	}
	
	async getMangas(path) {
		const res = await this.request(path);
		return await this.queryAll(res, '#content .thumbnail', async (html) => {
			let title = await this.getAttributeText(html, 'img', 'alt');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = await this.getAttributeText(html, 'img', 'src');
			title = title.trim().replace('Read more about the article ', '');
			this.#cacheCover[url] = cover;
			return {
				title,
				url,
				cover
			}
		})
	}

	async latest(page) {
		return await this.getMangas(`/page/${page}/`);
	}

	async search(kw, page, filter) {
		const filt = filter?.data && filter.data[0] || 'All';
		let seaKW = `/page/${page}/`;
		if (kw) {
			seaKW += `?s=${kw}`;
		} else if (filt != 'All' && filt in this.#genres) {
			seaKW = this.#genres[filt] + seaKW;
		}
		return await this.getMangas(seaKW.replace(this.#baseUrl, ''));
	}

	async detail(url) {
		const res = await this.request(url.replace(this.#baseUrl, ''));
		const title = await this.querySelector(res, 'header > h1').text;
		const imgs = await this.queryAll(res, '.wp-block-image', async (html, i) => {
			return {
				name: `[P${(i + 1 + '').padStart(3, '0')}]`,
				url: await this.getAttributeText(html, 'img', 'src')
			}
		})
		const cover = this.#cacheCover[url] || imgs[0].url || '';
		return {
			title: title.trim(),
			cover,
			episodes: [
				{
					title: 'Graphis',
					urls: imgs
				}
			]
		};
	}

	async watch(url) {
		return {
			urls: [url]
		};
	}
}
