// ==MiruExtension==
// @name         Ravenscans
// @version      v0.0.1
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://i0.wp.com/ravenscans.com/wp-content/uploads/2022/12/cropped-33-192x192.png
// @package      ravenscans.com
// @type         manga
// @webSite      https://ravenscans.com
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("ravenscans"),
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "Ravenscans URL",
            key: "ravenscans",
            type: "input",
            description: "Homepage URL for Ravenscans",
            defaultValue: "https://ravenscans.com",
        });
    }

    async latest(page) {
        const res = await this.req(`/page/${page}/`);
        const latest = await this.querySelectorAll(res, "div.utao.styletwo");

        let comic = []
        for (const element of latest) {
            const html = await element.content;
            const url = (await this.getAttributeText(html, "a", "href"));
            const title = await this.querySelector(html, "h4").text;
            const cover = await this.querySelector(html, "img").getAttributeText("src");

            comic.push({
                title: title.trim(),
                url,
                cover: cover
            })
        }
        return comic;
    }

    async search(kw, page) {
        const res = await this.req(`/page/${page}/?s=${kw}`);
        const searchList = await this.querySelectorAll(res, "div.bsx");
        const result = await Promise.all(searchList.map(async (element) => {
            const html = await element.content;
            const url = await this.getAttributeText(html, "a", "href");
            const title = await this.getAttributeText(html, "a", "title");
            const cover = await this.querySelector(html, "img").getAttributeText("src");
            return {
                title: title.trim(),
                url,
                cover: cover
            };
        }));
        return result;
    }
    async detail(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });

        const title = await this.querySelector(res, "div.infox > h1").text;
        const cover = await this.querySelector(res, "img.wp-post-image").getAttributeText("src");
        const desc = await this.querySelector(res, "div.entry-content.entry-content-single > p").text;
        const epiList = await this.querySelectorAll(res, "div.eplister > ul > li");
        const episodes = await Promise.all(epiList.map(async (element) => {
            const html = await element.content;
            const name = await this.querySelector(html, "span.chapternum").text;
            const url = await this.getAttributeText(html, "a", "href");
            return {
                name,
                url: url,
            };
        }));

        return {
            title: title || "Unknown Title",
            cover,
            desc: desc || "",
            episodes: [
                {
                    title: "Chapters",
                    urls: episodes,
                },
            ],
        };
    }

    async watch(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });

        const match = res.match(/"images":\s*\[([^\]]+)\]/);

        if (!match) {
            return { urls: [] };
        }

        const imagesContent = match[1];

        const imageUrls = imagesContent.match(/"([^"]+)"/g).map(match => match.slice(1, -1).replace(/\\/g, ''));

        return { urls: imageUrls };
    }
} 