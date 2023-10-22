// ==MiruExtension==
// @name         Mangakatana
// @version      v0.0.3
// @author       shashankx86
// @lang         en
// @license      MIT
// @icon         https://mangakatana.com/static/img/fav.png
// @package      mangakatana.com
// @type         manga
// @webSite      https://mangakatana.com/
// ==/MiruExtension==

export default class extends Extension {
	async req(url) {
		return this.request(url, {
			headers: {
				"Miru-Url": await this.getSetting("mangakatana"),
			},
		});
	}

	async load() {
		this.registerSetting({
			title: "Mangakatana URL",
			key: "mangakatana",
			type: "input",
			description: "Homepage URL for Mangakatana",
			defaultValue: "https://mangakatana.com/",
		});

		this.registerSetting({
			title: "Reverse Order of Chapters",
			key: "reverseChaptersOrderMangakatana",
			type: "toggle",
			description: "Reverse the order of chapters in ascending order",
			defaultValue: "true",
		});
	}

	async latest(page) {
		const res = await this.req(`/page/${page}/`);
		const latest = await this.querySelectorAll(res, "#book_list .item");

		let manga = []
		for (const element of latest) {
			const html = await element.content;
			const url = await this.getAttributeText(html, "a", "href");
			const title = await this.querySelector(html, "h3.title a").text;
			const cover = await this.getAttributeText(html, ".wrap_img img", "src");

			manga.push({
				title: title.trim(),
				url,
				cover: cover
			})
		}
		return manga;
	}

	async search(kw, page) {
		const res = await this.req(`/?search=${kw}`);
		const searchList = await this.querySelectorAll(res, "#book_list .item");
		const result = await Promise.all(searchList.map(async (element) => {
			const html = await element.content;
			const url = await this.getAttributeText(html, "a", "href");
			const title = await this.querySelector(html, "h3.title a").text;
			const cover = await this.getAttributeText(html, ".wrap_img img", "src");
			return {
				title: title.trim(),
				url,
				cover,
			};
		}));
		return result;
	}


	async detail(url) {
		const res = await this.request("", {
			headers: {
				"Miru-Url": url,
			},
		});

		const title = await this.querySelector(res, "div.info > h1").text;
		const cover = await this.getAttributeText(res, ".cover img", "src");
		let descS = await this.querySelector(res, '.summary p').text;
		let desc = descS.replace(/<br>/g, '');

		const epiList = await this.querySelectorAll(res, "div.chapters > table > tbody > tr");
		const chapters = await Promise.all(epiList.map(async (element) => {
			const html = await element.content;
			const name = await this.querySelector(html, "div.chapter > a").text;
			const url = await this.getAttributeText(html, "div.chapter > a", "href");
			return {
				name,
				url: url,
			};
		}));

		if (await this.getSetting("reverseChaptersOrderMangakatana") === "true") {
			chapters.reverse();
		}

		return {
			title: title || "Unknown Title",
			cover,
			desc: desc || "N/A",
			chapters: [{
				title: "Chapters",
				urls: chapters,
			}, ],
		};
	}

	async watch(url) {
		const res = await fetch(url);
		const html = await res.text();
	
		const images = Array.from(html.matchAll(/<img[^>]+src="([^">]+)"/g)).map(match => match[1]);
	
		return {
			urls: images,
		};
	}						  
}
