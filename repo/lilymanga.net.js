// ==MiruExtension==
// @name         LilyManga
// @version      v0.0.2
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://lilymanga.net/wp-content/uploads/2019/12/cropped-2Prancheta-1-192x192.png
// @package      lilymanga.net
// @type         manga
// @webSite      https://lilymanga.net
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("lilymanga"),
            },
        });
    }

    async load() {
        await this.registerSetting({
            title: "LilyManga Base URL",
            key: "lilymanga",
            type: "input",
            desc: "This is the URL where the comics are fetched from",
            defaultValue: "https://lilymanga.net",
        });
    }

    async latest(page) {
        let res = await this.req(`/gl/page/${page}/?m_orderby=latest`);

        let items = await this.querySelectorAll(res, "div.page-item-detail");

        let respItems = await Promise.all(items.map(async (item) => {
            const url = await this.getAttributeText(item.content, "div.post-title h3 a", "href");
            const title = (await this.querySelector(item.content, "div.post-title h3 a").text).trim();
            let cover = await this.getAttributeText(item.content, "div.item-thumb img", "data-src");
            if (!cover) {
                cover = await this.getAttributeText(item.content, "div.item-thumb img", "src");
            }

            return {
                url: url ? url.trim() : "",
                cover: cover ? cover.trim() : "",
                title: title || ""
            };
        }));

        return respItems.filter(item => item.url && item.title);
    }

    async search(kw, page) {
        let res = await this.req(`/page/${page}/?s=${kw}&post_type=wp-manga&m_orderby=trending`);

        let items = await this.querySelectorAll(res, "div.page-item-detail");

        let respItems = await Promise.all(items.map(async (item) => {
            const url = await this.getAttributeText(item.content, "div.post-title h3 a", "href");
            const title = (await this.querySelector(item.content, "div.post-title h3 a").text).trim();
            let cover = await this.getAttributeText(item.content, "div.item-thumb img", "data-src");
            if (!cover) {
                cover = await this.getAttributeText(item.content, "div.item-thumb img", "src");
            }

            return {
                url: url ? url.trim() : "",
                cover: cover ? cover.trim() : "",
                title: title || ""
            };
        }));

        return respItems.filter(item => item.url && item.title);
    }

    async detail(url) {
        let res = await this.request('', {
            headers: {
                "Miru-Url": url,
            }
        });

        const title = (await this.querySelector(res, "div.post-title > h1").text).trim();
        let cover = await this.getAttributeText(res, "div.summary_image img", "data-src");
        if (!cover) {
            cover = await this.getAttributeText(res, "div.summary_image img", "src");
        }
        cover = cover ? cover.trim() : "";

        let desc = "";
        try {
            desc = (await this.getAttributeText(res, "head > meta[name='description']", "content")).trim();
        } catch (e) {
            desc = "";
        }

        let chapters_res = await this.request('ajax/chapters/', {
            headers: {
                "Miru-Url": url,
            },
            method: "POST",
        });

        let chapters = await this.querySelectorAll(chapters_res, 'ul.main > li.wp-manga-chapter');

        let episodes = await Promise.all(chapters.map(async (chapter) => ({
            url: (await this.getAttributeText(chapter.content, "a", "href")).trim(),
            name: (await this.querySelector(chapter.content, "a").text).trim()
        })));

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
        };
    }

    async watch(url) {
        let res = await this.request('', {
            headers: {
                "Miru-Url": url,
            }
        });

        const elements = await this.querySelectorAll(res, "div.reading-content img");

        const images = await Promise.all(elements.map(async (element) => {
            let src = await this.getAttributeText(element.content, "img", "data-src");
            if (!src) {
                src = await this.getAttributeText(element.content, "img", "src");
            }
            return src ? src.trim() : "";
        }));

        return {
            urls: images.filter(src => src.length > 0 && !src.includes("avatar") && !src.includes("logo")),
        };
    }
}
