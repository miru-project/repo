// ==MiruExtension==
// @name         PorCore
// @version      v0.0.3
// @author       javxsub.com
// @lang         en
// @license      MIT
// @icon         https://porcore.com/favicon-96x96.png
// @package      porcore.com
// @type         bangumi
// @webSite      https://porcore.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async createFilter(filter) {
        const filters = {
            sort_by: {
                title: "Sort By",
                max: 1,
                min: 1,
                default: "",
                options: {
                    "&sort=newest": "Newest",
                    "&sort=oldest": "Oldest",
                    "&sort=longest": "Longest",
                    "&sort=shortest": "Shortest",
                    "&sort=mostviewed": "Most Viewed",
                    "&sort=toprated": "Top Rated",
                    "&sort=relevancy": "Relevancy",
                    "": "None"
                }
            }
        }
        return filters
    }

    async latest(page) {
        const url = `/?ajax&p=${page}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "div.onevideothumb");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.getAttributeText(html, "h5", "title");
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.flipbookimages", "src");
            const updt = await this.querySelector(html, "div.floatlefttop").text;
            if (title && url && cover && cover.includes("res.php")) {
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

    async search(kw, page, filter) {
        if (kw) {
            var search_string = `/show/${kw}?p=${page}`;
        } else {
            var search_string = `/?ajax&p=${page}`;
        }
        if (filter) {
            search_string += filter['sort_by']
        }
        const res = await this.request(search_string);
        const videoList = await this.querySelectorAll(res, "div.onevideothumb");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.getAttributeText(html, "h5", "title");
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img.flipbookimages", "src");
            const updt = await this.querySelector(html, "div.floatlefttop").text;
            if (title && url && cover && cover.includes("res.php")) {
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
        const cover = await this.querySelector(res, 'video.video-js').getAttributeText("poster");
        const desc = await this.querySelector(res, 'p.small').text;
        const user = await this.querySelector(res, 'a.label-default').text;
        const video = await this.querySelector(res, 'source[type="application\/x-mpegURL"]').getAttributeText("src");
        return {
            title: title.trim(),
            cover: cover,
            desc,
            episodes: [{
                title: user.trim(),
                urls: [{
                    name: title.trim(),
                    url: video
                }]
            }]
        };
    }

    async watch(url) {
        return {
            type: "hls",
            url: url || ""
        };
    }
}
