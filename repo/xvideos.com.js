// ==MiruExtension==
// @name         XVIDEOS
// @version      v0.0.2
// @author       bachig26
// @lang         en
// @license      MIT
// @package      xvideos.com
// @type         bangumi
// @icon         https://static-ss.xvideos-cdn.com/v3/img/skins/default/logo/xv.white.180.png
// @webSite      https://www.xvideos.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/new/${page}`);
    const bsxList = await this.querySelectorAll(res, "div.thumb-block, div.mozaique > div");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const titleEl = await this.querySelector(html, "p.title > a, a.title, p.title");
      let title = titleEl ? (await titleEl.text).trim() : "";
      if (!title) {
        title = await this.getAttributeText(html, "img", "alt") || "XVIDEOS Video";
      }
      const cover = await this.getAttributeText(html, "img", "data-src") || await this.getAttributeText(html, "img", "src");
      if (url && (url.includes("/video") || url.includes("xvideos.com"))) {
        const fullUrl = url.startsWith("http") ? url : `https://www.xvideos.com${url.startsWith("/") ? "" : "/"}${url}`;
        novel.push({
          title,
          url: fullUrl,
          cover: cover || "",
        });
      }
    }
    return novel;
  }

  async search(kw) {
    const kwstring = kw.replace(/ /g, '+');
    const res = await this.request(`/?k=${kwstring}`);
    const bsxList = await this.querySelectorAll(res, "div.thumb-block, div.mozaique > div");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const titleEl = await this.querySelector(html, "p.title > a, a.title, p.title");
      let title = titleEl ? (await titleEl.text).trim() : "";
      if (!title) {
        title = await this.getAttributeText(html, "img", "alt") || "XVIDEOS Video";
      }
      const cover = await this.getAttributeText(html, "img", "data-src") || await this.getAttributeText(html, "img", "src");
      if (url && (url.includes("/video") || url.includes("xvideos.com"))) {
        const fullUrl = url.startsWith("http") ? url : `https://www.xvideos.com${url.startsWith("/") ? "" : "/"}${url}`;
        novel.push({
          title,
          url: fullUrl,
          cover: cover || "",
        });
      }
    }
    return novel;
  }

  async detail(url) {
    const fullUrl = url.startsWith("http") ? url : `https://www.xvideos.com${url.startsWith("/") ? "" : "/"}${url}`;
    const res = await this.request("", {
      headers: {
        "Miru-Url": fullUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const titleEl = await this.querySelector(res, "meta[property='og:title'], h1");
    const title = titleEl ? (await titleEl.getAttributeText("content") || await titleEl.text).trim() : "XVIDEOS Video";
    const coverEl = await this.querySelector(res, "meta[property='og:image']");
    const cover = coverEl ? await coverEl.getAttributeText("content") : "";
    const descEl = await this.querySelector(res, "li.main-uploader > a > span.name, meta[property='og:description']");
    const desc = descEl ? (await descEl.text || await descEl.getAttributeText("content")).trim() : title;

    const urlPatterns = [
      /html5player\.setVideoHLS\(['"]([^"']+)['"]\)/i,
      /html5player\.setVideoUrlHigh\(['"]([^"']+)['"]\)/i,
      /(https?:\/\/[^\s'"]+\.m3u8[^\s'"]*)/i,
      /(https?:\/\/[^\s'"]+\.mp4[^\s'"]*)/i
    ];

    let episodeUrl = "";

    for (const pattern of urlPatterns) {
      const match = res.match(pattern);
      if (match) {
        episodeUrl = match[1] || match[0];
        break;
      }
    }

    if (!episodeUrl) {
      episodeUrl = fullUrl;
    }

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: title,
              url: episodeUrl,
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    if (url.includes(".m3u8") || url.includes(".mp4")) {
      return {
        type: url.includes(".mp4") ? "mp4" : "hls",
        url: url,
        headers: {
          "referer": "https://www.xvideos.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      };
    }

    const fullUrl = url.startsWith("http") ? url : `https://www.xvideos.com${url.startsWith("/") ? "" : "/"}${url}`;
    const res = await this.request("", {
      headers: {
        "Miru-Url": fullUrl,
        "referer": "https://www.xvideos.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const m3u8Match = res.match(/html5player\.setVideoHLS\(['"]([^"']+)['"]\)/i) || res.match(/(https?:\/\/[^\s'"]+\.(?:m3u8|mp4)[^\s'"]*)/i);
    const playUrl = m3u8Match ? m3u8Match[1] : fullUrl;

    return {
      type: playUrl.includes(".mp4") ? "mp4" : "hls",
      url: playUrl || "",
      headers: {
        "referer": "https://www.xvideos.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    };
  }
}
