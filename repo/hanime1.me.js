// ==MiruExtension==
// @name         Hanime
// @version      v0.0.3
// @author       appdevelpo
// @lang         zh
// @license      MIT
// @icon         https://img4.qy0.ru/data/2205/36/tab_logo.png
// @package      hanime1.me
// @type         bangumi
// @webSite      https://hanime1.me
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async request(url, options = {}) {
      try {
        let res = await super.request(url, options);

        if (
          typeof res === "string" &&
          (res.includes("Just a moment...") ||
            res.includes("cf-mitigation") ||
            res.includes("Attention Required! | Cloudflare") ||
            res.includes("Enable JavaScript and cookies to continue") ||
            res.includes("Cloudflare"))
        ) {
          const targetUrl = options?.headers?.["Miru-Url"] || (url.startsWith("http") ? url : `https://hanime1.me${url.startsWith("/") ? "" : "/"}${url}`);
          await this.openWebView(targetUrl);
          res = await super.request(url, options);
        }

        return res;
      } catch (e) {
        const targetUrl = options?.headers?.["Miru-Url"] || (url.startsWith("http") ? url : `https://hanime1.me${url.startsWith("/") ? "" : "/"}${url}`);
        await this.openWebView(targetUrl);
        return await super.request(url, options);
      }
    }

    parseList(res) {
        if (!res || typeof res !== "string") return [];

        const cardList = res.match(/<a[^>]+href="([^"]*hanime1\.me\/watch\?v=[^"]*|\/watch\?v=[^"]*)"[\s\S]+?<\/a>/g) || 
                         res.match(/<div class="col-xs-6 col-sm-4 col-md-2 search-doujin-videos hidden-xs hover-lighter multiple-link-wrapper[\s\S]+?<\/div>[\s\S]+?<\/div>/g) || 
                         res.match(/<div class="[^\"]*search-doujin-videos[^\"]*"[\s\S]+?<\/div>[\s\S]+?<\/div>/g) || [];

        const bangumi = [];
        cardList.forEach((element) => {
            const urlMatch = element.match(/href="(?:https:\/\/hanime1\.me)?(\/watch\?v=[^"]+)"/) || 
                             element.match(/href="https:\/\/hanime1\.me(\/.+?)"/) || 
                             element.match(/href="(\/.+?)"/);
            const titleMatch = element.match(/class="home-rows-videos-title"[\s\S]*?>([\s\S]+?)<\/div>/) ||
                               element.match(/"card-mobile-title".+?>(.+?)<\/div>/) || 
                               element.match(/title="([^"]+)"/);
            const coverMatch = element.match(/src="([^"]+)"/);

            if (urlMatch) {
                const titleStr = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "Hanime Video";
                bangumi.push({
                    title: titleStr || "Hanime Video",
                    url: urlMatch[1],
                    cover: coverMatch ? coverMatch[1] : "",
                });
            }
        });
        return bangumi;
    }

    async search(kw, page) {
        const res = await this.request(`/search?query=${kw}&type=&genre=&sort=&year=&month=&page=${page}`);
        return this.parseList(res);
    }
  
    async latest(page) {
      const res = await this.request(`/search?genre=%E8%A3%8F%E7%95%AA&page=${page}`);
      return this.parseList(res);
    }
  
    async detail(url) {
        const res = await this.request(url);

        const coverMatch = res.match(/"thumbnailUrl":[\s]*["']([^"']+)["']/) || res.match(/meta property="og:image" content="([^"]+)"/);
        const titleMatch = res.match(/<title>(.+?)(?:&nbsp;|- hanime1\.me|<\/title>)/) || res.match(/meta property="og:title" content="([^"]+)"/);
        const descMatch = res.match(/"description":[\s]*["']([\s\S]+?)["']/) || res.match(/meta property="og:description" content="([^"]+)"/);

        const cover = coverMatch ? coverMatch[1] : "";
        const title = titleMatch ? titleMatch[1].trim() : "Hanime Video";
        const desc = descMatch ? descMatch[1] : "No description available.";

        const res_list = res.match(/<source\s+[^>]*src="([^"]+)"[^>]*>/gi) || res.match(/source src="([^"]+)"/gi) || [];
        const ep = [];
        res_list.forEach(item => {
            const srcM = item.match(/src="([^"]+)"/);
            const sizeM = item.match(/size="([^"]+)"/);
            if (srcM) {
                ep.push({
                    name: sizeM ? `${sizeM[1]}P` : "Play",
                    url: srcM[1]
                });
            }
        });

        if (ep.length === 0) {
            const mp4Match = res.match(/(https?:\/\/[^\s'"]+\.mp4[^\s'"]*)/i) || res.match(/(https?:\/\/[^\s'"]+\.m3u8[^\s'"]*)/i);
            if (mp4Match) {
                ep.push({
                    name: "Default",
                    url: mp4Match[1]
                });
            } else {
                ep.push({
                    name: "Play Video",
                    url: url.startsWith("http") ? url : `https://hanime1.me${url}`
                });
            }
        }

        return {
            title,
            cover,
            desc,
            episodes: [{
                title: "播放列表",
                urls: ep
            }]
        };
    }
  
    async watch(url) {
      if (url.includes(".mp4") || url.includes(".m3u8")) {
        return {
          type: url.includes(".m3u8") ? "hls" : "mp4",
          url: url,
          headers: {
            "Referer": "https://hanime1.me/"
          }
        };
      }

      const res = await this.request("", {
        headers: {
          "Miru-Url": url,
          "Referer": "https://hanime1.me/"
        }
      });

      const videoMatch = res.match(/(https?:\/\/[^\s'"]+\.(?:mp4|m3u8)[^\s'"]*)/i);
      const playUrl = videoMatch ? videoMatch[1] : url;

      return {
        type: playUrl.includes(".m3u8") ? "hls" : "mp4",
        url: playUrl || "",
        headers: {
          "Referer": "https://hanime1.me/"
        }
      };
    }
}
