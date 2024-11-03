// ==MiruExtension==
// @name         Javtiful
// @version      v0.0.2
// @author       javxsub.com
// @lang         en
// @license      MIT
// @icon         https://javtiful.com/favicon.ico
// @package      javtiful.com
// @type         bangumi
// @webSite      https://javtiful.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async latest(page) {
        const url = `/videos?page=${page}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "div.pb-3 > div.card");
        const videos = [];
        for (const element of videoList) {
            const html  = await element.content;
            const title = await this.querySelector(html, "a.video-link").text;
            const url   = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.lazy", "data-src");
            const updt  = await this.querySelector(html, "div.label-hd-duration").text;
            if (title && url && cover && updt && url.includes("/video/")) {
                videos.push({
                    title: title.trim(),
                    url: url,
                    cover: cover.replace('//', '//i1.wp.com/')+"?crop=53,0,53,288",
                    update: updt.trim()
                });
            }
        }
        return videos;
    }

    async search(kw, page) {
        const url = `/search/videos?search_query=${kw}&page=${page}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "div.pb-3 > div.card");
        const videos = [];
        for (const element of videoList) {
            const html  = await element.content;
            const title = await this.querySelector(html, "a.video-link").text;
            const url   = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.lazy", "data-src");
            const updt  = await this.querySelector(html, "div.label-hd-duration").text;
            if (title && url && cover && updt && url.includes("/video/")) {
                videos.push({
                    title: title.trim(),
                    url: url,
                    cover: cover.replace('//', '//i1.wp.com/')+"?crop=53,0,53,288",
                    update: updt.trim()
                });
            }
        }
        return videos;
    }

    async detail(url) {
        const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
        const res   = await this.request(strippedpath);
        const title = await this.querySelector(res, 'h1.video-title').text;
        const cover = await this.querySelector(res, 'meta[property="og:image"]').getAttributeText("content");
        const descr = await this.querySelector(res, 'p.fw-bold').text;
        var descn   = title.length;
        if (descn > 100) {
            var desc = title;
        } else {
            var desc = descr;
        }
        return {
            title: title.trim(),
            cover: cover,
            desc: desc,
            episodes: [{
                title: "Directory",
                urls: [{
                    name: title.trim(),
                    url: url
                }]
            }]

        }
    }

    async watch(url) {
        const reg  = /\/video\/(.*?)\//;
        const id   = url.match(reg)[1];
        const aurl = 'https://javtiful.com/ajax/get_cdn';
        const data = "video_id=" + id;
        const res  = await fetch(aurl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data
        });
        const text   = await res.text();
        const regex  = /"playlists":"(.*?)"/;
        const result = text.match(regex)[1];
        return {
            type: "hls",
            url: result || ""
        };
    }
}
