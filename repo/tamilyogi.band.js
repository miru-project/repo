// ==MiruExtension==
// @name         tamilyogi
// @version      v0.0.1
// @author       appdevelpo
// @lang         hi
// @license      MIT
// @icon         https://tamilyogi.band/wp-content/uploads/2021/06/ty.png
// @package      tamilyogi.band
// @type         bangumi
// @webSite      https://tamilyogi.band
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    async search(kw, page) {
        const res = await this.request(`/page/${page}/?s=${kw}`);
        const bsxList = res.match(/"cover[\s\S]+?postmetadata/g);
        const bangumi = [];
        bsxList.forEach((element) => {
            const url = element.match(/href="https:\/\/tamilyogi.band(.+?)"/)[1];
            // console.log(url);
            const title = element.match(/alt="(.+?)"/)[1];
            // console.log(title);
            const cover_match = element.match(/src="(.+?)"/)[1];
            bangumi.push({
                title,
                url: `${url};${cover_match}`,
                cover:cover_match,
            });
        });
        return bangumi;
    }

    async latest(page) {
        const url = `/category/tamilyogi-full-movie-online/page/${page}/`;
        const res = await this.request(url);
        const bsxList = res.match(/"cover[\s\S]+?postmetadata/g);
        const bangumi = [];
        bsxList.forEach((element) => {
            const url = element.match(/href="https:\/\/tamilyogi.band(.+?)"/)[1];
            const title = element.match(/alt="(.+?)"/)[1];
            const cover_match = element.match(/src="(.+?)"/)[1];
            bangumi.push({
                title,
                url: `${url};${cover_match}`,
                cover:cover_match,
            });
        });
        return bangumi;
    }

    async detail(url) {

        const res = await this.request(url.split(';')[0]);
        const embed_link = res.match(/IFRAME SRC="(.+?)"/)[1];
        const res_embed = await this.request("",{
            headers: {
                "Miru-Url": embed_link
            }
        });
        const link = res_embed.match(/window.top.location.href='.+?\?(.+?)'/);
        const res_video = await this.request("",{
            headers: {
                "Miru-Url": `https://vembx.one/xembed-${link[1]}.html`,
                "Referer": "https://tamilvip.live/"

            }
        });
        const title = res.match(/title=".+?">(.+?)<\/a><\/h1>/)[1];
        const cover = url.split(';')[1];
        const m3u8_link = res_video.match(/vembz.one\/\w+\/v\.mp4/g);
        const resolution = res_video.match(/label:"(.+?)"/g)
        const urls=[];
        const base_url = res_video.match(/https:.+?vembz.one/)[0];
        m3u8_link.forEach((element,index)=>{
            const ur = element.match(/vembz.one\/(.+?)\/v.mp4/)[1];
            const name = resolution[index].match(/label:"(.+?)"/)[1];
            
            urls.push({
                name: name,
                url: `${base_url}/hls/${ur}/index-v1-a1.m3u8`
            })
        })
        const episodes = [{
            title: "Directory",
            urls
        }];
        return {
            title: title || "Unknown Title",
            cover: cover || "",
            desc:"No description available.",
            episodes
        };
    }

    async watch(url) {
        return {
            type: "hls",
            url: url || null,
            headers: {
                "Referer": "https://vembx.one/",
                "Miru-Url": url,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
              }
        };
    }
}

