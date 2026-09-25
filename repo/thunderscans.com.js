// ==MiruExtension==
// @name         thunderscans
// @version      v0.0.2
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://i.ibb.co/XtNNVVT/AR-TH-WEB.png
// @package      thunderscans.com
// @type         manga
// @webSite      https://en-thunderscans.com
// ==/MiruExtension==

export default class extends Extension {

    async req(url, data = null) {
        let method = data ? "POST" : "GET";
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
        await this.registerSetting({
            title: "thunderscans URL",
            key: "thunderscans",
            type: "input",
            description: "Homepage URL for thunderscans",
            defaultValue: "https://en-thunderscans.com",
        })
    }

    async latest(page) {
        try {
            const res = await this.req(`/wp-admin/admin-ajax.php`, { page, action: "load_more_manga_posts" });

            let result = await this.querySelectorAll(res, "div.bs > div.bsx");

            const items = await Promise.all(result.map(async (item) => ({
                url: await this.getAttributeText(item.content, "a", "href"),
                cover: await this.getAttributeText(item.content, "img", "src"),
                title: await this.getAttributeText(item.content, "a", "title")
            })));

            return items;
        } catch (e) {
            return [];
        }
    }

    async search(kw, page) {
        try {
            const res = await this.req(`/page/${page}/?s=${kw}&post_type=wp-manga`);

            const result = await this.querySelectorAll(res, "div.bs > div.bsx");

            const items = await Promise.all(result.map(async (item) => ({
                url: await this.getAttributeText(item.content, "a", "href"),
                cover: await this.getAttributeText(item.content, "img", "src"),
                title: await this.getAttributeText(item.content, "a", "title")
            })));

            return items;
        } catch (e) {
            return [];
        }
    }

    async detail(url) {
        try {
            let res = await this.request('', {
                headers: {
                    "Miru-Url": url,
                }
            });

            let title = "";
            try {
                title = (await this.querySelector(res, "h1.entry-title").text).trim();
            } catch (e) {}

            let cover = "";
            try {
                cover = await this.getAttributeText(res, "div.thumb > img", "src");
            } catch (e) {}

            let desc = "";
            try {
                desc = (await this.querySelector(res, "div.entry-content").text).trim();
            } catch (e) {}

            let chapters = await this.querySelectorAll(res, 'div#chapterlist ul > li');

            let episodes = [];
            for (const chapter of chapters) {
                const epUrl = await this.getAttributeText(chapter.content, "a", "href");
                if (!epUrl || epUrl === "#" || epUrl === "/") continue;

                let name = "";
                try {
                    name = (await this.querySelector(chapter.content, "span.chapternum").text).trim().replace(/[\n\t]/g, '').replace(/\s+/g, ' ');
                } catch (e) {
                    name = "Chapter";
                }

                episodes.push({
                    url: epUrl,
                    name,
                });
            }

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
        } catch (e) {
            return {
                title: "",
                cover: "",
                desc: "",
                episodes: [],
            };
        }
    }

    async watch(url) {
        try {
            let res = await this.request('', {
                headers: {
                    "Miru-Url": url,
                }
            });

            let imageUrlsMatch = res.match(/"images":\[(.*?)\]/);

            let images = [];
            if (imageUrlsMatch && imageUrlsMatch.length > 1) {
                let imageUrlsContent = imageUrlsMatch[1];
                images = imageUrlsContent.match(/"([^"]+)"/g).map(function(imgUrl) {
                    return imgUrl.replace(/\\/g, '').replace(/"/g, '');
                });
            }

            return {
                urls: images,
            };
        } catch (e) {
            return {
                urls: [],
            };
        }
    }
}
