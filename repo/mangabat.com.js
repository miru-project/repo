// ==MiruExtension==
// @name         MangaBat
// @version      v0.0.1
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://h.mangabat.com/favicon-96x96.png
// @package      mangabat.com
// @type         manga
// @webSite      https://h.mangabat.com
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("mangabat"),
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "MangaBat Base URL",
            key: "mangabat",
            type: "input",
            desc: "This is the URL where the comics are fetched from",
            defaultValue: "https://h.mangabat.com",
        });
    }

    async latest(page) {
        let res = await this.req(`/manga-list-all/${page}`);

        let items = await this.querySelectorAll(res, "div.panel-list-story > div.list-story-item");

        let respItems = await Promise.all(items.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "src"),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return respItems
    }

    async search(kw, page) {
        let res = await this.req(`/search/manga/${kw}?page=${page}`);

        let items = await this.querySelectorAll(res, "div.panel-list-story > div.list-story-item");

        let respItems = await Promise.all(items.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "src"),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return respItems
    }

    async detail(url) {
        let res  = await this.request('',{
            headers: {
                "Miru-Url": url,
            }
        })

        let title = (await this.querySelector(res, "div.story-info-right > h1").text).trim()
        let cover = await this.getAttributeText(res, "div.story-info-left > span.info-image > img")
        let desc = await this.querySelector(res, "#panel-story-info-description").text

        let epiList = await this.querySelectorAll(res, "div.panel-story-chapter-list > ul > li");

        let episodes = await Promise.all(epiList.map(async (element) => ({
            url: await this.getAttributeText(element.content, "a", "href"),
            name: (await this.querySelector(element.content, "a").text).trim()
        })))


        return {
            title,
            cover,
            desc,
            episodes: [
                {
                    title: "Chapters",
                    urls: episodes,
                },
            ],
        }
    }

    async watch(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });

        const images = await Promise.all((await this.querySelectorAll(res,"div.container-chapter-reader > img")).map(async (element) => {
            const html = await element.content;
            return this.getAttributeText(html, "img", "src");
        }));

        return {
            urls: images,
        };
    }
}
