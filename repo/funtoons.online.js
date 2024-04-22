// ==MiruExtension==
// @name         Funtoons
// @version      v0.0.1
// @author       funtoons
// @lang         th
// @license      MIT
// @icon         https://funtoons.online/wp-content/themes/mangareader/assets/images/android-chrome-192x192.png
// @package      funtoons.online
// @type         manga
// @webSite      https://funtoons.online
// ==/MiruExtension==

export default class extends Extension {

    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("funtoons"),
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "FunToons URL",
            key: "funtoons",
            type: "input",
            description: "Homepage URL for FunToons",
            defaultValue: "https://funtoons.online",
        });
    }

    async latest(page) {
        const res = await this.req(`/manga/?page=${page}&order=update`);

        let result = await this.querySelectorAll(res, "div.listupd > div.cards > div.card");

        const items = await Promise.all(result.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "div.card__img", "data-background-image"),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return items;
    }

    async search(kw, page) {
        const res = await this.req(`/page/${page}/?s=${kw}`);

        const result = await this.querySelectorAll(res, "div.listupd > div.cards > div.card");

        const items = await Promise.all(result.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "div.card__img", "data-background-image"),
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


        const title = (await this.querySelector(res, "h1.entry-title").text).trim();
        const cover = await this.getAttributeText(res, "div.info-image > div.cover > div.imgbox > div.thumb > img", "data-src");
        const desc = (await this.querySelector(res, "div.info-detail > div.info-genres > div.wd-full > div.entry-content > p").text).trim();

        let chapters = await this.querySelectorAll(res, 'div.eplister ul > li');

        let episodes = await Promise.all(chapters.map(async (chapter) => ({
            url: await this.getAttributeText(chapter.content, "a", "href"),
            name: (await this.querySelector(chapter.content, "span.chapternum").text).trim().replace(/[\n\t]/g, '')
        })))

        return {
            title,
            cover,
            desc,
            episodes: [
                {
                    title: "ตอนทั้งหมด",
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
        
        let imageUrlsMatch = res.match(/"images":\[(.*?)\]/);
        
        let images = [];
        if (imageUrlsMatch && imageUrlsMatch.length > 1) {
            let imageUrlsContent = imageUrlsMatch[1];
            images = imageUrlsContent.match(/"([^"]+)"/g).map(function(url) {
                return url.replace(/\\/g, '').replace(/"/g, '');
            });
        }
        return {
            urls: images,
        };
    }
}
