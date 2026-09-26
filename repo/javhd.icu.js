// ==MiruExtension==
// @name         JAVHD.icu
// @version      v0.0.2
// @author       bachig26
// @lang         jp
// @license      MIT
// @package      javhd.icu
// @type         bangumi
// @icon         https://javhd.icu/wp-content/uploads/2020/04/javhdicuu-logO.png
// @webSite      https://javhd.icu
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/page/${page}/`);
    const bsxList = await this.querySelectorAll(res, "div.col-xl-3.col-lg-3.col-md-6.col-6, article.post");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const titleEl = await this.querySelector(html, "h3.post-title > a, h2.entry-title > a");
      const title = titleEl ? (await titleEl.text).trim() : "JAVHD Video";
      const cover = await this.getAttributeText(html, "img", "src");
      if (url) {
        novel.push({
          title,
          url,
          cover: cover || "",
        });
      }
    }
    return novel;
  }

  async search(kw) {
    const kwstring = kw.replace(/ /g, '+');
    const res = await this.request(`/?s=${kwstring}`);
    const bsxList = await this.querySelectorAll(res, "div.item.col-xl-4.col-lg-4.col-md-4.col-sm-6, article.post");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const titleEl = await this.querySelector(html, "h3.post-title > a, h2.entry-title > a");
      const title = titleEl ? (await titleEl.text).trim() : "JAVHD Video";
      const cover = await this.getAttributeText(html, "img", "src");
      if (url) {
        novel.push({
          title,
          url,
          cover: cover || "",
        });
      }
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request("", {
        headers: {
            "Miru-Url": url,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
    });

    const titleEl = await this.querySelector(res, "h1, meta[property='og:title']");
    const title = titleEl ? (await titleEl.text || await titleEl.getAttributeText("content")).trim() : "JAVHD Video";
    const coverEl = await this.querySelector(res, "meta[property='og:image']");
    const cover = coverEl ? await coverEl.getAttributeText("content") : "";
    const descEl = await this.querySelector(res, "div.post-entry > p, meta[property='og:description']");
    const desc = descEl ? (await descEl.text || await descEl.getAttributeText("content")).trim() : title;

    const urlPatterns = [
      /https?:\/\/emturbovid\.[^\s'"]+/i,
      /<iframe[^>]+src=["']([^"']+)["']/i,
      /https?:\/\/[^\s'"]+\.(?:m3u8|mp4)[^\s'"]*/i
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
      episodeUrl = url;
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
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://javhd.icu/"
        }
      };
    }

    const res = await this.request("", {
        headers: {
            "Miru-Url": url,
            "referer": "https://javhd.icu/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
    });

    const m3u8Match = res.match(/(https?:\/\/[^\s'"]+\.(?:m3u8|mp4)[^\s'"]*)/i);
    const playUrl = m3u8Match ? m3u8Match[1] : url;

    return {
        type: playUrl.includes(".mp4") ? "mp4" : "hls",
        url: playUrl || "",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://javhd.icu/"
        },
    };
  }
}
