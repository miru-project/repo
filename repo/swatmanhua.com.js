// ==MiruExtension==
// @name         swatmanhua
// @version      v0.0.1
// @author       bethro
// @lang         ar
// @license      MIT
// @icon         https://swatmanhua.com/images/logo_light.png
// @package      swatmanhua.com
// @type         manga
// @webSite      https://swatmanhua.com
// ==/MiruExtension==



export default class extends Extension {

    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("swatmanhua"),
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "swatmanhua URL",
            key: "swatmanhua",
            type: "input",
            description: "Homepage URL for swatmanhua",
            defaultValue: "https://swatmanhua.com",
        })
    }

    async latest(page) {
        const res = await this.req(`?page=${page}`);
        const latest = await this.querySelectorAll(res, "div#more-listupd-box > div.utao div.uta");

        let items = await Promise.all(latest.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "data-lazy-src"),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return items;
    }

    async search(kw, page) {
        const res = await this.req(`?s=${kw}&page=${page}`);

        const result = await this.querySelectorAll(res, "div.bs > div.bsx");

        const items = await Promise.all(result.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "data-lazy-src"),
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


        const title = (await this.querySelector(res, "div.infox > h1").text).trim();
        const cover = await this.getAttributeText(res, "div.bigcover > div > img", "src");
        const desc = (await this.querySelector(res, "div.desc > div> span.desc > p").text).trim();

        let chapters = await this.querySelectorAll(res, 'div.bixbox ul > li');

        let episodes = await Promise.all(chapters.map(async (chapter) => ({
            url: await this.getAttributeText(chapter.content, "span.lchx > a", "href"),
            name: (await this.querySelector(chapter.content, "span.lchx > a").text).trim()
        })))

        return {
            title,
            cover,
            desc,
            episodes: [
                {
                    title: "الفصول",
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