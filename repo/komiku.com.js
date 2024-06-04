// ==MiruExtension==
// @name         Komiku.com
// @version      v0.0.1
// @author       Nazz
// @lang         id
// @license      MIT
// @icon         https://komiku.com/wp-content/uploads/2022/03/cropped-ico-komiku-180x180.jpg
// @package      komiku.com
// @type         manga
// @webSite      https://komiku.com
// @nsfw         false
// @tags         manhwa, manhua, manga, indonesia
// ==/MiruExtension==

export default class extends Extension {
    #opts = {
		uptime: 0,
		expire: 5,
	}
    #cache = new Map([
		['@cover', {}]
	]);

    async load() {
		this.registerSetting({
			title: "Komiku.com",
			key: "domain_komiku.com",
			type: "input",
			description: "Komiku.com Domain",
			defaultValue: "https://komiku.com",
		});
    }
    async requestWSetting(url) {
		return this.request(url, {
			headers: {
				"Miru-Url": await this.getSetting("domain_komiku.com"),
			},
		});
	}
    async get_filter(){
        const res = await this.requestWSetting(`/manga/`);
		if (!this.checkCache('@genres')) {
			let genres = {
				"All": "All"
			};
            const element_genres = await this.querySelectorAll(res, "ul.genrez > li")
            for(const html of element_genres){
                const title = (await this.querySelector(html.content, 'label').text || '').trim();
                const href = await this.getAttributeText(html.content, 'input', 'value');
                const genreQuery = `genre[]=${href}`
				genres[genreQuery] = title
            }
			this.#cache.set('@genres', genres);
		}
        if (!this.checkCache('@status')) {
            let status = {};
            const element_status = await this.querySelectorAll(res, "div:nth-child(1) > ul > li")
            for(const html of element_status){
                const title = (await this.querySelector(html.content, 'label').text || '').trim();
                const href = await this.getAttributeText(html.content, 'input', 'value');
                const statusQuery = `status=${href}`
				if(title) status[statusQuery] = title
            }
            this.#cache.set('@status', status);
        }
		if (!this.checkCache('@types')) {
            let types = {};
            const element_type = await this.querySelectorAll(res, "div:nth-child(2) > ul > li")
            for(const html of element_type){
                const title = (await this.querySelector(html.content, 'label').text || '').trim();
                const href = await this.getAttributeText(html.content, 'input', 'value');
                const typeQuery = `type=${href}`
                if(title) types[typeQuery] = title
            }
            this.#cache.set('@types', types);
        }
        if (!this.checkCache('@orders')) {
            let orders = {};
            const element_order = await this.querySelectorAll(res, "div:nth-child(3) > ul > li")
            for(const html of element_order){
                const title = (await this.querySelector(html.content, 'label').text || '').trim();
                const href = await this.getAttributeText(html.content, 'input', 'value');
                const orderQuery = `order=${href}`
				orders[orderQuery] = title
            }
            this.#cache.set('@orders', orders);
        }
    }
    async createFilter() {
		return {
            "type": {
                title: "Types",
                max: 1,
                min: 0,
                default: "type=",
                options: this.#cache.get('@types'),
            },
            "order": {
                title: "Orders",
                max: 1,
                min: 0,
                default: "order=update",
                options: this.#cache.get('@orders'),
            },
            "status": {
                title: "Status",
                max: 1,
                min: 0,
                default: "status=",
                options: this.#cache.get('@status'),
            },
			"genre": {
				title: "Genres",
				max: 1,
				min: 0,
				default: "genre[]=",
				options: this.#cache.get('@genres'),
			},
		}
	}
    async latest(page) {
        await this.get_filter();
        let url_page = page > 1 ? `/` : `/page/${page}/`
        let res = await this.requestWSetting(url_page);

        let items = await this.querySelectorAll(res, ".listupd > div.utao");
        let list_items = []
        for (const element of items){
            const url = await this.getAttributeText(element.content, "div.luf > a.series", "href")
            const cover = await this.getAttributeText(element.content, "img", "src")
            const title = (await this.querySelector(element.content, "div.luf > a.series").text).trim()
            list_items.push({
                url,
                cover,
                title
            })
        }
        return list_items
    }
    async search(kw, page, filter) {
        const filter_genre = filter?.genre && filter.genre.length > 0 ? filter.genre[0] : ""
        const filter_type = filter?.type && filter.type.length > 0 ? filter.type[0] : ""
        const filter_order = filter?.order && filter.order.length > 0 ? filter.order[0] : ""
        const filter_status = filter?.status && filter.status.length > 0 ? filter.status[0] : ""
        let arr_query = []
        if(kw){
            arr_query.push(`s=${kw}`)
        }
        if(page > 1){
            arr_query.push(`page=${page}`)
        }
        if(filter_genre){
            arr_query.push(filter_genre)
        }
        if(filter_type){
            arr_query.push(filter_type)
        }
        if(filter_order){
            arr_query.push(filter_order)
        }
        if(filter_status){
            arr_query.push(filter_status)
        }
        let params = arr_query.join("&")
        let url = `/manga/?`+ params
        let res = await this.requestWSetting(url); 
        let items = await this.querySelectorAll(res, ".listupd > div.bs");
        let list_items = []
        for (const element of items){
            const url = await this.getAttributeText(element.content, "a", "href")
            const cover = await this.getAttributeText(element.content, "div.limit > img", "src")
            const title = (await this.querySelector(element.content, "div.bigor > div.tt").text).trim()
            list_items.push({
                url,
                cover,
                title
            })
        }
        return list_items
    }
    async detail(url) {
        let detailResponse = await this.request('',{
            headers: {
                "Miru-Url": url,
            },
        });

        const title = (await this.querySelector(detailResponse, "div.seriestucon > div.seriestuhead > h1").text).trim();
        const cover = await this.getAttributeText(detailResponse, "div.seriestucontl > div.thumb > img", "src");
        const desc = await this.querySelector(detailResponse, "div.entry-content.entry-content-single > p").text;

        const episodeList = await this.querySelectorAll(detailResponse, "#chapterlist > ul > li");
        let episodes = []
        for (const element of episodeList){
            const url = await this.getAttributeText(element.content, "a", "href")
            const name = (await this.querySelector(element.content, "a > span.chapternum").text).trim()
            episodes.push({
                url,
                name
            })
        }
        return {
            title,
            cover,
            desc,
            episodes: [
                {
                    title: "Chapters",
                    urls: episodes.reverse(),
                }
            ]
        };
    }
    async watch(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });
        const list_images_raw = this.cariMatch(res.toString(), /ts_reader\.run\((.+?)\)/)
        if(!list_images_raw) return
        const list_images_oarse = JSON.parse(list_images_raw)
        const list_image = list_images_oarse.sources[0].images
        
        return {
            urls: list_image,
        };
    }
    cariMatch(input, regex) {
		const match = input.match(regex);
		return match ? (match.length > 2 ? match : match[1]) : null;
	}
    checkCache(item) {
		const expire = +(this.#opts.expire);
		return this.#cache.has(item) &&
			expire > 0 &&
			(Date.now() - this.#opts.uptime) < expire * 60 * 1000;
	}
}