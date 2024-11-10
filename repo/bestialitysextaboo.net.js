// ==MiruExtension==
// @name         BestialitySexTaboo
// @version      v0.0.6
// @author       ijs77
// @lang         en
// @license      MIT
// @icon         https://bestialitysextaboo.net/favicon.ico
// @package      bestialitysextaboo.net
// @type         bangumi
// @webSite      https://bestialitysextaboo.net
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async latest(page) {
        if (page == 1) {
            var rpage = "";
        } else {
            var rpage = page + "/";
        }
        const url = `/videos/${rpage}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "li.video");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.getAttributeText(html, "span.title > a", "title");
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img", "src");
            const updt = await this.querySelector(html, "span.duration").text;
            const check = await this.getAttributeText(html, "div.video-thumb", "class");
            if (title && url && cover && !check.includes("private")) {
                videos.push({
                    title: title,
                    url: url,
                    cover: cover,
                    update: updt.trim().replace("HD", "[HD]"),
                });
            }
        }
        return videos;
    }

    async search(kw, page) {
        const url = `/search/video/?s=${kw}&page=${page}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "li.video");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.getAttributeText(html, "span.title > a", "title");
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img", "src");
            const updt = await this.querySelector(html, "span.duration").text;
            const check = await this.getAttributeText(html, "div.video-thumb", "class");
            if (title && url && cover && !check.includes("private")) {
                videos.push({
                    title: title,
                    url: url,
                    cover: cover,
                    update: updt.trim().replace("HD", "[HD]"),
                });
            }
        }
        return videos;
    }

    async detail(url) {
        const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
        const res = await this.request(strippedpath);
        const title = await this.querySelector(res, 'h1').text;
        const covst = await this.querySelector(res, 'img[alt="Thumb 1"]').getAttributeText("src");
        const cover = await covst.match(/.*\//) + "player.jpg";
        const desc1 = await this.querySelector(res, 'meta[property="og:description"]').getAttributeText("content");
        const desc2 = await this.querySelector(res, 'div.content-info > span').text;
        if (desc1 == title.trim()) {
            var desc = desc2;
        } else {
            var desc = desc1;
        }
        const video = await this.querySelectorAll(res, 'video#player-fluid > source');

        const episodes = [];
        for (const element of video) {
            const html = await element.content;
            const name = await this.querySelector(html, "source").getAttributeText("title");
            const url = await this.querySelector(html, "source").getAttributeText("src");
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
