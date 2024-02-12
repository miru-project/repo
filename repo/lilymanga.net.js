// ==MiruExtension==
// @name         LilyManga
// @version      v0.0.1
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
        this.registerSetting({
            title: "LilyManga Base URL",
            key: "lilymanga",
            type: "input",
            desc: "This is the URL where the comics are fetched from",
            defaultValue: "https://lilymanga.net",
        });
    }

    async latest(page) {
        let res = await this.req(`/ys/page/${page}/?m_orderby=latest`);

        let items = await this.querySelectorAll(res, "div.page-content-listing.item-default > div > div > div > div.manga");

        let respItems = await Promise.all(items.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "data-src"),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return respItems
    }

    async search(kw, page) {
        let res = await this.req(`/page/${page}/?s=${kw}&post_type=wp-manga&m_orderby=trending`);

        let items = await this.querySelectorAll(res, "div.main-col-inner > div > div.tab-content-wrap > div.c-tabs-item > div.row");

        let respItems = await Promise.all(items.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "data-src"),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return respItems
    }

    async detail(url) {
        let res = await this.request('', {
            headers: {
                "Miru-Url": url,
            }
        })


        const title = (await this.querySelector(res, "div.post-title > h1").text).trim();
        const cover = (await this.getAttributeText(res, "div.summary_image > a > img", "data-src")).trim();
        const desc = (await this.getAttributeText(res, "head > meta[name='description']","content")).trim();

        let chapters_res = await this.request('ajax/chapters/', {
            headers: {
                "Miru-Url": url,
            },
            method: "POST",
        });

        let chapters = await this.querySelectorAll(chapters_res, 'ul.main > li.wp-manga-chapter');

        let episodes = await Promise.all(chapters.map(async (chapter) => ({
            url: await this.getAttributeText(chapter.content, "a", "href"),
            name: (await this.querySelector(chapter.content, "a").text).trim()
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
        };
    }

    async watch(url) {
        let res = await this.request('', {
            headers: {
                "Miru-Url": url,
            }
        })

        const images = await Promise.all((await this.querySelectorAll(res, "div.reading-content> div > img")).map(async (element) => {
            return (await this.getAttributeText(element.content, "img", "data-src")).trim();
        }));

        return {
            urls: images, 
        }
    }
}
