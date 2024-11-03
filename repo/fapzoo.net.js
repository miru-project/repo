// ==MiruExtension==
// @name         FapZoo
// @version      v0.0.1
// @author       javxsub.com
// @lang         en
// @license      MIT
// @icon         https://i0.wp.com/fapzoo.net/wp-content/uploads/2024/04/favicon.png?fit=80,80&ssl=1
// @package      fapzoo.net
// @type         bangumi
// @webSite      https://fapzoo.net
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async latest(page) {
        if (page == 1) {
            var rpage = "";
        } else {
            var rpage = "/page" + page + "/";
        }
        const url = `${rpage}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "section.latest > div.videos > article");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.querySelector(html, "a.video__link").text;
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img", "src");
            const updt = await this.querySelector(html, "div.video__badges").text;
            if (title && url && cover && updt) {
                videos.push({
                    title: title.trim(),
                    url: url,
                    cover: cover,
                    update: updt.trim().replaceAll('\t', '').replaceAll('\n', ' ')
                });
            }
        }
        return videos;
    }

    async search(kw, page) {
        const url = `/page/${page}/?s=${kw}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "section.search > div.videos > article");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.querySelector(html, "a.video__link").text;
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img", "src");
            const updt = await this.querySelector(html, "div.video__badges").text;
            if (title && url && cover && updt) {
                videos.push({
                    title: title.trim(),
                    url: url,
                    cover: cover,
                    update: updt.trim().replaceAll('\t', '').replaceAll('\n', ' ')
                });
            }
        }
        return videos;
    }

    async detail(url) {
        const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
        const res = await this.request(strippedpath);
        const title = await this.querySelector(res, 'h1.video__name').text;
        const cover = await this.querySelector(res, 'meta[property="og:image"]').getAttributeText('content');
        const desc = await this.querySelector(res, 'div.video__date').text;

        const sregex = /iframeSrc_vars = {(.*?)}/g;
        const sresult = res.match(sregex)[0];
        const regex = /":"(.*?)"/g;
        const result = sresult.matchAll(regex);
        const episodes = [];

        let numb = 1;
        for (const element of result) {
            //var name = element[1];
            var name = "Server " + numb;
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
            numb += 1;
        }
        return {
            title: title.trim(),
            cover: cover,
            desc: desc,
            episodes: episodes
        }
    }

    async watch(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
                "Referer": "https://fapzoo.net/"
            }
        });

        const match = res.match(/eval(.+?)<\/script>/gs);
        if (match) {
            var rawh = eval(match[0].replace("eval", "").replace("</script>", ""));
        } else {
            var rawh = res;
        }

        let arr_url_video = this.cariMatch(rawh, /sources:\s*(\[[\s\S]*?\])/);
        if (arr_url_video.includes("file:")) {
            arr_url_video = arr_url_video.replace("file:", '"file":');
        }
        const obj_url_video = JSON.parse(arr_url_video.replaceAll("'", '"'));
        if (obj_url_video.length < 1) {
            return
        }
        return {
            type: "hls",
            url: obj_url_video[0].file,
        }
    }

    cariMatch(input, regex) {
        const match = input.match(regex);
        return match ? (match.length > 2 ? match : match[1]) : null;
    }
}
