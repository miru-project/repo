// ==MiruExtension==
// @name         3hentai
// @version      v0.0.1
// @author       javxsub.com
// @lang         all
// @license      MIT
// @icon         https://3hentai.net/favicon.ico
// @package      3hentai.net
// @type         manga
// @webSite      https://3hentai.net
// @nsfw         true
// ==/MiruExtension==


export default class extends Extension {
    async latest(page) {
        // Latest updates
        if (page == 1) {
            var rpage = "";
        } else {
            var rpage = "/" + page;
        }

        const url = `${rpage}`;
        const res = await this.request(url);
        const mangaList = await this.querySelectorAll(res, "div.doujin-col");
        const mangas = [];

        for (const element of mangaList) {
            const html = await element.content;
            const title = await this.querySelector(html, "div.title").text;
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.lazy", "data-src");
            const updt = await this.getAttributeText(html, "div.title", "class");

            if (title && url && cover) {
                mangas.push({
                    title: title.trim(),
                    url: url,
                    cover: cover.replace("//", "//i1.wp.com/"),
                    update: updt.substring(updt.indexOf("-") + 1).toUpperCase(),
                });
            }
        }

        return mangas;
    }

    async search(kw, page) {
        // Search
        const url = `/search?q=${kw}&page=${page}`;
        const res = await this.request(url);
        const mangaList = await this.querySelectorAll(res, "div.doujin-col");
        const mangas = [];

        for (const element of mangaList) {
            const html = await element.content;
            const title = await this.querySelector(html, "div.title").text;
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.lazy", "data-src");
            const updt = await this.getAttributeText(html, "div.title", "class");

            if (title && url && cover) {
                mangas.push({
                    title: title.trim(),
                    url: url,
                    cover: cover.replace("//", "//i2.wp.com/"),
                    update: updt.substring(updt.indexOf("-") + 1).toUpperCase(),
                });
            }
        }

        return mangas;
    }



    async detail(url) {
        const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
        const res = await this.request(strippedpath);

        const title = await this.querySelector(res, "h1.text-left").text;
        const cover = await this.getAttributeText(res, "img.lazy", "data-src");
        const desc = await this.querySelector(res, "div.tag-container > time").text;


        return {
            title: title,
            cover: cover.replace("//", "//i3.wp.com/"),
            desc: desc,
            episodes: [{
                title: "Directory",
                urls: [{
                    name: title,
                    url: url,
                }, ],
            }, ],
        };
    }

    async watch(url) {
        const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
        const res = await this.request(strippedpath);

        const images = await Promise.all((await this.querySelectorAll(res, "div.single-thumb-col > div > a > img")).map(async (element) => {
            return (await this.getAttributeText(element.content, "img.lazy", "data-src")).trim().replace("t.", ".").replace("//", "//i3.wp.com/");
        }));

        return {
            urls: images,
        }
    }
}
