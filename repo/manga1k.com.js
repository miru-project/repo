// ==MiruExtension==
// @name         Manga1k
// @version      v0.0.1
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://manga1k.com/wp-content/uploads/2023/08/6-2-1.png
// @package      manga1k.com
// @type         manga
// @webSite      https://manga1k.com
// @nsfw         true
// ==/MiruExtension==



export default class extends Extension {

    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("manga1k"),
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "Manga1k URL",
            key: "manga1k",
            type: "input",
            description: "Homepage URL for manga1k",
            defaultValue: "https://manga1k.com",
        })
    }

    async latest(page) {
        const res = await this.req(`/page/${page}/?m_orderby=latest`);
        const latest = await this.querySelectorAll(res, "div.page-listing-item > div > div > div.page-item-detail");

        let items = await Promise.all(latest.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "src"),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return items;
    }

    async search(kw, page) {
        const res = await this.req(`/page/${page}/?s=${kw}&post_type=wp-manga`);

        const result = await this.querySelectorAll(res, "div.tab-content-wrap > div.c-tabs-item > div.row");

        const items = await Promise.all(result.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "src"),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return items;
    }

    async detail(url) {
        let res = await this.request('', {
            headers: {
                "Miru-Url": url,
            }
        })


        const title = (await this.querySelector(res, "div.post-title > h1").text).trim();
        const cover = await this.getAttributeText(res, "div.summary_image > a > img", "src");
        const desc = (await this.querySelector(res, "div.description-summary > div.summary__content > p").text).trim();

        let chapters = await this.querySelectorAll(res, 'ul.main > li.wp-manga-chapter');

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
            return (await this.getAttributeText(element.content, "img", "src")).trim();
        }));

        return {
            urls: images,
        }
    }
}