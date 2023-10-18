// ==MiruExtension==
// @name         gimy
// @version      v0.0.1
// @author       appdevelpo
// @lang         zh-tw
// @license      MIT
// @icon         https://gimy.su/favicon.ico
// @package      gimy.su
// @type         bangumi
// @webSite      https://gimy.su
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    async search(kw, page) {
        const res = await this.request(`/vodsearch/${kw}----------${page}---.html`);//kw:1 電影 2 電視劇 3 綜藝 4 動漫
        const bsxList = res.match(/<div class="col-md-3 col-sm-4 col-xs-3 news-box-txt-l clearfix">[\s\S]+?<\/div>/g);
        const bangumi = [];
        bsxList.forEach((element) => {
            const url = element.match(/href="(.+?)"/)[1];
            const title = element.match(/title="(.+?)"/)[1];
            const cover_match = element.match(/https/);
            const cover = cover_match ? element.match(/data-original="(.+?)"/)[1] : "https://gimy.su" + element.match(/data-original="(.+?)"/)[1];
            bangumi.push({
                title,
                url: url,
                cover,
            });
        });
        return bangumi;
    }

    async latest(page) {
        const p = parseInt(page / 4) + 1;
        const f = parseInt(page % 4) + 1;
        const res = await this.request(`/vod/${f}--------${p}---.html`);
        const bsxList = res.match(/<li class="col-md-2 col-sm-3 col-xs-4 ">[\s\S]+?<\/li>/g);
        const bangumi = [];
        bsxList.forEach((element) => {
            const url = element.match(/href="(.+?)"/)[1];
            const title = element.match(/title="(.+?)"/)[1];
            const cover_match = element.match(/https/);
            const cover = cover_match ? element.match(/data-original="(.+?)"/)[1] : "https://gimy.su" + element.match(/data-original="(.+?)"/)[1];
            bangumi.push({
                title,
                url: url,
                cover,
            });
        });
        return bangumi;
    }

    async detail(url) {
        const res = await this.request(url);
        const res_content = res.match(/<div class=" layout-box clearfix p-0 mt-0">[\s\S]+?<\/div>[\S\s]+?<\/div>/)[0];
        const patrial_cover_url = res_content.match(/url\((.+?)\)/)[1]
        const cover = patrial_cover_url.match(/https/)?patrial_cover_url:"https://gimy.su"+patrial_cover_url;
        const title = res_content.match(/title="(.+?)"/)[1];
        const desc = res.match(/<div class="box-comment">[\s\S]+?<span.+?>(.+?)<\/span>/)[1];
        const episodes = [];

        const res_list = res.match(/<li>[\s]<a class[\S\s]+?<\/ul>/g);
        res_list.forEach((element) => {
            const source = element.match(/">(.+?)<\/a>/)[1];
            const ep_links = element.match(/<li>(.+?)<\/a><\/li>/g);
            const urls = ep_links.map(index => {
                return {
                    name: index.match(/">(.+?)</)[1],
                    url: index.match(/href="(.+?)"/)[1]
                }
            });
            episodes.push({
                title: source || "None",
                urls

            });
        })
        return {
            title: title || "Unknown Title",
            cover: cover || "",
            desc: desc || "No description available.",
            episodes
        };
    }

    async watch(url) {
        const res = await this.request(url);
        const video_url = res.match(/https:.+?\.m3u8/)[0].replace(/\//g, "");
        return {
            type: "hls",
            url: video_url || null,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
              }
        };
    }
}

