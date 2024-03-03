// ==MiruExtension==
// @name         MangaClash
// @version      v0.0.1
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://mangaclash.com/wp-content/uploads/2020/03/cropped-22.jpg
// @package      mangaclash.com
// @type         manga
// @webSite      https://mangaclash.com
// ==/MiruExtension==



export default class extends Extension {

    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("mangaclash"),
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "MangaClash URL",
            key: "mangaclash",
            type: "input",
            description: "Homepage URL for MangaClash",
            defaultValue: "https://mangaclash.com",
        })

        this.registerSetting({
            title: "resize cover images",
            key: "imageResize",
            type: "input",
            description: "Image dimensions in pixels. Available '175x238', '350x476' and '110x150'",
            defaultValue: "175x238",
          });
    }

    async latest(page) {
        const res = await this.req(`/page/${page}/`);
        const latest = await this.querySelectorAll(res, "#loop-content > div > div > div > div.page-item-detail");

        let items = await Promise.all(latest.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: (await this.getAttributeText(item.content, "img", "data-src")).replace("110x150", await this.getSetting("imageResize")),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return items;
    }

    async search(kw, page) {
        const res = await this.req(`/page/${page}/?s=${kw}&post_type=wp-manga`);

        const result = await this.querySelectorAll(res, "div.tab-content-wrap > div.c-tabs-item > div.row");

        const items = await Promise.all(result.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "data-src"),
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
        const cover = (await this.getAttributeText(res, "div.summary_image > a > img", "data-src")).trim();
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
            return (await this.getAttributeText(element.content, "img", "data-src")).trim();
        }));

        return {
            urls: images,
        }
    }
}