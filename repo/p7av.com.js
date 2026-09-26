// ==MiruExtension==
// @name         在线影院
// @version      v0.0.3
// @author       OshekharO
// @lang         jp
// @license      MIT
// @package      p7av.com
// @type         bangumi
// @icon         https://cc.ovvtv.com/favicon.ico
// @webSite      https://cc.ovvtv.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const path = page > 1 ? `/bqgiw/page/${page}.html` : "/bqgiw/";
    const res = await this.request(path);
    const bsxList = await this.querySelectorAll(res, "div.entry-card");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2.entry-title > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url: url.startsWith("http") ? url : "https://cc.ovvtv.com" + url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/search/?q=${encodeURIComponent(kw)}`);
    const bsxList = await this.querySelectorAll(res, "div.entry-card");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2.entry-title > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url: url.startsWith("http") ? url : "https://cc.ovvtv.com" + url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const titleMatch = res.match(/<title>([\s\S]+?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace("- 在线影院", "").trim() : "Play";
    const coverMatch = res.match(/<meta property="og:image" content="([^"]+)"/);
    const cover = coverMatch ? coverMatch[1] : "";

    const urlPatterns = [/https?:\/\/[^\s'"]+\.(?:mp4|m3u8)/];
    let episodeUrl = "";

    for (const pattern of urlPatterns) {
      const match = res.match(pattern);
      if (match) {
        episodeUrl = match[0];
        break;
      }
    }

    return {
      title,
      cover,
      desc: title,
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: "Play",
              url: episodeUrl,
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    let hh = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
      Referer: "https://cc.ovvtv.com/",
    };
    return {
      type: "hls",
      url: url || "",
      headers: hh,
    };
  }
}
