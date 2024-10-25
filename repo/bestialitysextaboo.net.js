// ==MiruExtension==
// @name         BestialitySexTaboo
// @version      v0.0.3
// @author       javxsub.com
// @lang         en
// @license      MIT
// @icon         https://bestialitysextaboo.net/favicon.ico
// @package      bestialitysextaboo.net
// @type         bangumi
// @webSite      https://bestialitysextaboo.net
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        const res = await this.request("", {
            "Miru-Url": url,
            "Referer": "https://bestialitysextaboo.net",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
        });
        return url;
    }

    async latest(page) {
        // Latest updates
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
        // Search
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
        // Details
        const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
        const res = await this.request(strippedpath);
        const title = await this.querySelector(res, 'h1').text;
        const covst = await this.querySelector(res, 'img[alt="Thumb 1"]').getAttributeText("src");
        const cover = await covst.match(/.*\//) + "player.jpg";
        const desc = await this.querySelector(res, 'div.content-info > span').text;
        const user = await this.querySelector(res, 'div.content-info > a > strong').text;
        //const video  = await this.querySelector(res, 'source[type="video\/mp4"]').getAttributeText("src");
        const videos = await this.querySelector(res, 'video[id="player-fluid"]').innerHTML;

        const jsonRegex = /https[^"]*/gm
        const result = videos.match(jsonRegex);
        const nomer = result.length - 1;

        //
        //for (const element of result) {
        //        const xurl  = element;
        //        const name  = xurl.substring(video.length-9, video.length-4).replace("_", "");
        //}
        //

        return {
            title: title.trim(),
            cover: cover,
            desc,
            episodes: [{
                title: user.trim(),
                urls: [{
                        name: result[0].substring(result[0].length - 9, result[0].length - 4).replace("_", ""),
                        url: result[0],
                    },
                    {
                        name: result[nomer].substring(result[nomer].length - 9, result[nomer].length - 4).replace("_", ""),
                        url: result[nomer],
                    }
                ]
            }, ],
        };
    }

    async watch(url) {
        return {
            type: "mp4",
            url: url || "",
        };
    }
}
