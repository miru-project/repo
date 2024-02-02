// ==MiruExtension==
// @name         EVERIA.CLUB[Photo]
// @version      v0.0.3
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
	#opts = {
		base: 'https://everia.club',
		uptime: 0,
		expire: 5,
	}
	#cache = new Map([
		['@cover', {}]
	]);

	async createFilter(filter) {
		if (!this.checkCache('@genres')) {
			const res = await this.request(`/`);
			let genres = {
				"All": "All"
			};
			await this.queryAll(res, '#menu-mainmenu > li.menu-item', async (html) => {
				const title = (await this.querySelector(html, 'a').text || '').trim();
				let href = await this.getAttributeText(html, 'a', 'href');
				href = href.replace(this.#opts.base, '');
				genres[href] = title;
			})
			this.#cache.set('@genres', genres);
		}
		return {
			"data": {
				title: "Category",
				max: 1,
				min: 1,
				default: "All",
				options: this.#cache.get('@genres'),
			}
		}
	}
	
	async latest(page) {
		return await this.getMangas(`/page/${page}/`);
	}

	async search(kw, page, filter) {
		const filt = filter?.data && filter.data[0] || 'All';
		let seaKW = `/page/${page}/`;
		if (filt != 'All') {
			seaKW = filt + seaKW;
		}
		if (kw) {
			seaKW = `/page/${page}/?s=${kw}`;
		}
		return await this.getMangas(seaKW);
	}

	async detail(url) {
		const res = await this.req(url);
		const title = await this.querySelector(res, 'header > h1').text;
		const imgs = await this.queryAll(res, '.wp-block-image', async (html, v, i) => {
			return {
				name: `[P${(i + 1 + '').padStart(3, '0')}]`,
				url: await this.getAttributeText(html, 'img', 'src')
			}
		})
		const cover = this.#cache.get('@cover')[url] || imgs[0].url || '';
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

	async getMangas(path) {
		const md5path = md5(path);
		if (this.checkCache(md5path)) {
			return this.#cache.get(md5path);
		}
		const res = await this.req(path);
		const mangas = await this.queryAll(res, '#content .thumbnail', async (html) => {
			let title = await this.getAttributeText(html, 'img', 'alt');
			const url = await this.getAttributeText(html, 'a', 'href');
			const cover = await this.getAttributeText(html, 'img', 'src');
			title = title.trim().replace('Read more about the article ', '');
			this.#cache.get('@cover')[url] = cover;
			return {
				title,
				url,
				cover
			}
		})
		//this.#cache.clear();
		this.#cache.set(md5path, mangas);
		this.#opts.uptime = Date.now();
		return mangas;
	}

	async req(path) {
		return await this.request(path.replace(this.#opts.base, ''));
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
