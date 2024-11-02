// ==MiruExtension==
// @name         Mat6tube
// @version      v0.0.1
// @author       javxsub.com
// @lang         en
// @license      MIT
// @icon         https://cdn.nmcorp.video/static/extend/dark/favicon-96x96.png
// @package      mat6tube.com
// @type         bangumi
// @webSite      https://mat6tube.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async latest(page) {
        const url = `/video/fc2?sort=0&p=${page-1}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "div.item");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.querySelector(html, "div.title").text;
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.lazyload", "data-src");
            const updt = await this.querySelector(html, "div.m_time").text;
            if (title && url && cover && updt) {
                videos.push({
                    title: title,
                    url: url,
                    cover: cover,
                    update: updt.trim()
                });
            }
        }
        return videos;
    }

    async search(kw, page) {
        const url = `/video/${kw}?p=${page-1}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "div.item");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.querySelector(html, "div.title").text;
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.lazyload", "data-src");
            const updt = await this.querySelector(html, "div.m_time").text;
            if (title && url && cover && updt) {
                videos.push({
                    title: title,
                    url: url,
                    cover: cover,
                    update: updt.trim()
                });
            }
        }
        return videos;
    }

    async detail(url) {
        const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
        const res = await this.request(strippedpath);
        const title = await this.querySelector(res, 'h1').text;
        const cover = await this.querySelector(res, 'meta[property="og:image"]').getAttributeText("content");
        const desc = await this.querySelector(res, 'meta[property="og:description"]').getAttributeText("content");
        const regex = /"file":"(.*?)","label":"(.*?)"/g;
        const result = res.matchAll(regex);
        const episodes = [];
        for (const element of result) {
            var name = element[2];
            var url = element[1];
            if (name && url) {
                episodes.push({
                        title: name,
                        urls: [{
                            name: "[" + name + "] " + title,
                            url: url
                        }]
                    }

                );
            }
        }
        return {
            title: title.trim(),
            cover: cover,
            desc: desc,
            episodes: episodes
        }
    }

    async watch(url) {
        return {
            type: "mp4",
            url: url || "",
        };
    }
}
