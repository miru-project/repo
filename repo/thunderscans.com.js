// ==MiruExtension==
// @name         thunderscans
// @version      v0.0.1
// @author       bethro
// @lang         ar
// @license      MIT
// @icon         https://i.ibb.co/XtNNVVT/AR-TH-WEB.png
// @package      thunderscans.com
// @type         manga
// @webSite      https://thunderscans.com
// ==/MiruExtension==



export default class extends Extension {

    async req(url, data = null) {

        let method = data ? "POST" : "GET";
        let ContentType = data ? "application/x-www-form-urlencoded; charset=UTF-8" : null;
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("thunderscans"),
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            method,
            data
        });
    }

    async load() {
        this.registerSetting({
            title: "thunderscans URL",
            key: "thunderscans",
            type: "input",
            description: "Homepage URL for thunderscans",
            defaultValue: "https://thunderscans.com",
        })
    }

    async latest(page) {
        const res = await this.req(`/wp-admin/admin-ajax.php`, { page, action: "load_more_manga_posts" });

        let result = await this.querySelectorAll(res, "div.bs > div.bsx");

        const items = await Promise.all(result.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img", "src"),
            title: await this.getAttributeText(item.content, "a", "title")
        })))

        return items;
    }

    async search(kw, page) {
        const res = await this.req(`/page/${page}/?s=${kw}&post_type=wp-manga`);

        const result = await this.querySelectorAll(res, "div.bs > div.bsx");

        const items = await Promise.all(result.map(async (item) => ({
            url: await this.getAttributeText(item.content, "a", "href"),
            cover: await this.getAttributeText(item.content, "img.wp-post-image", "src"),
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


        const title = (await this.querySelector(res, "div.titles > h1").text).trim();
        const cover = await this.getAttributeText(res, "div.thumb-half >div.thumb > img.wp-post-image", "src");
        const desc = (await this.querySelector(res, "div.summary > div > div.entry-content > p").text).trim();

        let chapters = await this.querySelectorAll(res, 'div#chapterlist ul > li');

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