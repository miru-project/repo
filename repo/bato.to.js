// ==MiruExtension==
// @name         Bato
// @version      v0.0.2
// @author       bethro
// @lang         all
// @license      MIT
// @icon         https://bato.to/amsta/img/batoto/favicon.ico?v0
// @package      bato.to
// @type         manga
// @webSite      https://bato.to
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("bato"),
            },
        });
    }
    
    async load() {
        this.registerSetting({
            title: "Bato Base URL",
            key: "bato",
            type: "input",
            desc: "this is the url where the comics are fetched from",
            defaultValue: "https://bato.to",
        });
    }

    async latest(page) {
        let latestResponse = await this.req(`/latest?page=${page}`);
        let html = latestResponse.res ? latestResponse.res.html : latestResponse;

        const cleanHtml = html.replace(/\n/g, "");
        let items = await this.querySelectorAll(cleanHtml, "div.item");

        let respItems = await Promise.all(items.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a.item-cover", "href"),
            cover: await this.getAttributeText(item.content, "img", "src"),
            title: await this.querySelector(item.content, "a.item-title").text
        })));

        return respItems;
    }


    async search(kw, page) {
        let searchResponse = await this.req(`/search?q=${kw}&page=${page}`);

        let items = await this.querySelectorAll(searchResponse, "div.item");

        let respItems = await Promise.all(items.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a.item-cover", "href"),
            cover: await this.getAttributeText(item.content, "img", "src"),
            title: await this.querySelector(item.content, "a.item-title").text
        })))

        return respItems
    }
    async detail(url) {
        let detailResponse = await this.req(url);

        const title = (await this.querySelector(detailResponse, "#mainer > div > div > h3 > a").text).trim();
        const cover = await this.getAttributeText(detailResponse, "#mainer > div > div > div > img", "src");
        const desc = await this.querySelector(detailResponse, "#limit-height-body-summary > div").text;

        const episodeList = await this.querySelectorAll(detailResponse, "#mainer > div > div > div.main > div");

        const episodes = await Promise.all(episodeList.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            name: (await this.querySelector(item.content, "a").text).trim()
        })))

        return {
            title,
            cover,
            desc,
            episodes: [
                {
                    title: "Chapters",
                    urls: episodes,
                }
            ]
        };
    }

    async watch(url) {
    let watchResponse = await this.req(url);
    const urlPattern = /https:\/\/xfs[^\s'"]+/g;
    let urls = watchResponse.match(urlPattern);
    return {urls}; }
}
