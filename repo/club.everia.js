// ==MiruExtension==
// @name         EVERIA.CLUB [Photo]
// @version      v0.0.1
// @author       vvsolo
// @lang         all
// @license      MIT
// @type         manga
// @icon         https://everiaeveria.b-cdn.net/wp-content/uploads/2023/08/Everiaicon.jpg
// @package      club.everia
// @webSite      https://everia.club
// @nsfw         true
// ==/MiruExtension==

export default class Mangafx extends Extension {
	#genres = {};
	#baseUrl = 'https://everia.club';

	async latest(page) {
		const res = await this.request(`/page/${page}/`);
		const elList = await this.querySelectorAll(res, '#blog-entries .thumbnail');
		const mangas = [];
		for (const element of elList) {
			const html = await element.content;
			const title = await this.getAttributeText(html, 'img', 'alt');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = await this.getAttributeText(html, 'img', 'src');
			mangas.push({
				title: title.trim().replace('Read more about the article ', ''),
				url,
				cover
			});
		}
		return mangas;
	}

	async createFilter(filter) {
		const res = await this.request(`/`);
		const cateList = await this.querySelectorAll(res, '#menu-mainmenu > li.menu-item');
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
				title: "Category",
				max: 1,
				min: 0,
				default: "All",
				options: cates,
			}
		}
	}
	
	async search(kw, page, filter) {
		const filt = filter?.data && filter.data[0] || 'All';
		let seaKW = `/page/${page}/`;
		if (kw) {
			seaKW += `?s=${kw}`;
		} else if (filt != 'All' && filt in this.#genres) {
			seaKW = this.#genres[filt] + seaKW;
		}
		const mangas = [];
		const res = await this.request(seaKW.replace(this.#baseUrl, ''));
		const elList = await this.querySelectorAll(res, '#content .thumbnail');
		for (const element of elList) {
			const html = await element.content;
			const title = await this.getAttributeText(html, 'img', 'alt');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = await this.getAttributeText(html, 'img', 'src');
			mangas.push({
				title: title.trim().replace('Read more about the article ', ''),
				url,
				cover
			});
		}
		return mangas;
	}

	async detail(url) {
		const res = await this.request(url.replace(this.#baseUrl, ''));
		const title = await this.querySelector(res, 'header > h1').text;
		const urls = await this.querySelectorAll(res, '.wp-block-image');
		let cover = '';
		let i = 0;
		const imgs = [];
		for (const element of urls) {
			const html = await element.content;
			const iurl = await this.getAttributeText(html, 'img', 'src');
			
			imgs.push({
				name: `P-${i++}`,
				url: iurl
			})
			if (i === 1) {
				cover = iurl;
			}
		}
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
