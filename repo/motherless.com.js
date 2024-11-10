// ==MiruExtension==
// @name         Motherless
// @version      v0.0.2
// @author       ijs77
// @lang         en
// @license      MIT
// @icon         https://motherless.com/favicon.ico
// @package      motherless.com
// @type         bangumi
// @webSite      https://motherless.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async latest(page) {
        // Latest updates
        if (page == 1) {
            var rpage = "";
        } else {
            var rpage = "?page=" + page;
        }
        const url = `/videos/recent${rpage}`;
        const res = await this.request(url, {
            headers: {
                cookie: `_force_mobile=false`,
            },
        });
        const videoList = await this.querySelectorAll(res, "div.thumb-container.video");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.querySelector(html, "div.captions > a").text;
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.static", "src");
            const updt = await this.querySelector(html, "span.size").text;
            if (title && url && cover) {
                videos.push({
                    title: title,
                    url: url,
                    cover: cover,
                    update: updt,
                });
            }
        }
        return videos;
    }

    async search(kw, page) {
        // Search
        if (page == 1) {
            var rpage = "";
        } else {
            var rpage = "&page=" + page;
        }
        const url = `/search?type=videos&sort=date&term=${kw}${rpage}`;
        const res = await this.request(url, {
            headers: {
                cookie: `_force_mobile=false`,
            },
        });
        const videoList = await this.querySelectorAll(res, "div.thumb-container.video");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.querySelector(html, "div.captions > a").text;
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.static", "src");
            const updt = await this.querySelector(html, "span.size").text;
            if (title && url && cover) {
                videos.push({
                    title: title,
                    url: url,
                    cover: cover,
                    update: updt,
                });
            }
        }
        return videos;
    }

    async detail(url) {
        // Details
        const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
        const res = await this.request(strippedpath, {
            headers: {
                cookie: `_force_mobile=false`,
            },
        });
        const title = await this.querySelector(res, 'div.media-meta-title > h1').text;
        const cover = await this.querySelector(res, 'video.video-js').getAttributeText("data-poster");
        const desc = await this.querySelector(res, 'meta[name="keywords"]').getAttributeText("content");
        const videos = await this.querySelector(res, 'video.video-js').innerHTML;
      
        const jsonRegex = /https[^"]*/gm
        const result = videos.match(jsonRegex);
        const nomer = result.length;
        if (nomer > 1) {
            return {
                title: title.trim(),
                cover: cover,
                desc: desc,
                episodes: [{
                    title: "Directory",
                    urls: [{
                            name: "[SD] " + title.trim(),
                            url: result[0],
                        }, {
                            name: "[HD] " + title.trim(),
                            url: result[1],
                        }

                    ]
                }]
            }
        } else {
            return {
                title: title.trim(),
                cover: cover,
                desc: desc,
                episodes: [{
                    title: "Directory",
                    urls: [{
                        name: "[SD] " + title.trim(),
                        url: result[0],
                    }]
                }]
            }
        }
    }

    async watch(url) {
        return {
            type: "mp4",
            url: url,
        }
    }
}
