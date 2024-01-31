// ==MiruExtension==
// @name         Komikcast
// @version      v0.0.1
// @author       bethro
// @lang         all
// @license      MIT
// @icon         https://komikcast.lol/wp-content/uploads/2021/02/cropped-logo-kc-180x180.png
// @package      komikcast.lol
// @type         manga
// @webSite      https://komikcast.lol
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("komikcast"),
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "Komikcast Base URL",
            key: "komikcast",
            type: "input",
            desc: "This is the URL where the comics are fetched from",
            defaultValue: "https://komikcast.lol",
        });
    }

    async latest(page) {
        let res = await this.req(`/daftar-komik/page/${page}/?orderby=update`);

        let items = await this.querySelectorAll(res, "div.list-update > div.list-update_items > div.list-update_items-wrapper > div");

        let respItems = await Promise.all(items.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a.data-tooltip", "href"),
            cover: await this.getAttributeText(item.content, "img", "src"),
            title: (await this.querySelector(item.content, "div.list-update_item-info > h3").text).trim()
        })))

        return respItems
    }

    async search(kw, page) {
        let res = await this.req(`/page/${page}/?s=${kw}`);

        let items = await this.querySelectorAll(res, "div.list-update_items > div.list-update_items-wrapper > div");

        let respItems = await Promise.all(items.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a.data-tooltip", "href"),
            cover: await this.getAttributeText(item.content, "img", "src"),
            title: (await this.querySelector(item.content, "div.list-update_item-info > h3").text).trim()
        })))

        return respItems
    }

    async detail(url) {
        let detailResponse = await this.request('',{
            headers: {
                "Miru-Url": url,
            },
        });

        const title = (await this.querySelector(detailResponse, "div.komik_info-content > div.komik_info-content-body > h1").text).trim();
        const cover = await this.getAttributeText(detailResponse, "div.komik_info-content > div.komik_info-content-thumbnail > img", "src");
        const desc = await this.querySelector(detailResponse, "div.komik_info-description > div > p").text;

        const episodeList = await this.querySelectorAll(detailResponse, "#chapter-wrapper > li.komik_info-chapters-item");

        const episodes = await Promise.all(episodeList.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a.chapter-link-item", "href"),
            name: (await this.querySelector(item.content, "a.chapter-link-item").text).trim().replace(/[\n\t]/g, '')
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
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });

        const images = await Promise.all((await this.querySelectorAll(res, "div.main-reading-area > img")).map(async (element) => {
            const html = await element.content;
            return this.getAttributeText(html, "img", "src");
        }));

        return {
            urls: images,
        };
    }
}
