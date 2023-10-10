// ==MiruExtension==
// @name         AsuraScan
// @version      v0.0.1
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://asuratoon.com/wp-content/uploads/2021/03/Group_1.png
// @package      asuratoon.com
// @type         manga
// @webSite      https://asuratoon.com
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("asurascans"),
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "AsuraScan URL",
            key: "asurascans",
            type: "input",
            description: "Homepage URL for AsuraScan",
            defaultValue: "https://asuratoon.com",
        });

        this.registerSetting({
            title: "Reverse Order of Chapters",
            key: "reverseChaptersOrderAsura",
            type: "toggle",
            description: "Reverse the order of chapters in ascending order",
            defaultValue: "true",
        });
    }

    async latest(page) {
        const res = await this.req(`/page/${page}/`);
        const latest = await this.querySelectorAll(res, "div.utao.styletwo");

        let comic = []
        for (const element of latest) {
            const html = await element.content;
            const url = await this.getAttributeText(html, "a", "href");
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
                cover,
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
        const desclist = await this.querySelectorAll(res, "div.entry-content.entry-content-single > p");
        const desc = await Promise.all(desclist.map(async (element) => {
            const decHtml = await element.content;
            return await this.querySelector(decHtml, "p").text;
        })).then((texts) => texts.join(""));

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

        if (await this.getSetting("reverseChaptersOrderAsura") === "true") {
            episodes.reverse();
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
    }

    async watch(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });

        const images = await Promise.all((await this.querySelectorAll(res, "div#readerarea > p > img")).map(async (element) => {
            const html = await element.content;
            return this.getAttributeText(html, "img", "src");
        }));

        return {
            urls: images,
        };
    }
}
