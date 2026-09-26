// ==MiruExtension==
// @name         EroticMV
// @version      v0.0.4
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://eroticmv.com/wp-content/uploads/2020/05/cropped-favicon-32x32-1-192x192.png
// @package      eroticmv.com
// @type         bangumi
// @webSite      https://eroticmv.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  decodeBase64(str) {
    try {
      if (typeof atob === "function") {
        return atob(str);
      }
      if (typeof Buffer !== "undefined") {
        return Buffer.from(str, "base64").toString("utf-8");
      }
    } catch (e) {}
    return str;
  }

  cleanUrl(url) {
    if (!url) return "";
    let clean = url.trim();
    if (clean.startsWith("aHR0cHM6") || clean.startsWith("aHR0cD")) {
      clean = this.decodeBase64(clean);
    }
    return clean;
  }

  async latest(page) {
    const res = await this.request(`/page/${page}/`);
    const bsxList = await this.querySelectorAll(res, "article.float-video-box, article.post, div.video-item, div.col-md-4, article");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const titleEl = await this.querySelector(html, "h3 > a, h6 > a, h2 > a, a.title");
      const title = titleEl ? (await titleEl.text).trim() : "EroticMV Video";

      const cover = await this.getAttributeText(html, "img", "data-src") ||
                    await this.getAttributeText(html, "img", "data-lazy-src") ||
                    await this.getAttributeText(html, "img", "src") ||
                    await this.getAttributeText(html, "img", "data-original") || "";

      if (url && url.includes("eroticmv.com")) {
        novel.push({
          title,
          url,
          cover,
        });
      }
    }
    return novel;
  }

  async search(kw) {
    const kwstring = kw.replace(/ /g, '+');
    const res = await this.request(`/?s=${kwstring}`);
    const bsxList = await this.querySelectorAll(res, "article.float-video-box, article.post, div.video-item, div.col-md-4, article");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const titleEl = await this.querySelector(html, "h3 > a, h6 > a, h2 > a, a.title");
      const title = titleEl ? (await titleEl.text).trim() : "EroticMV Video";

      const cover = await this.getAttributeText(html, "img", "data-src") ||
                    await this.getAttributeText(html, "img", "data-lazy-src") ||
                    await this.getAttributeText(html, "img", "src") ||
                    await this.getAttributeText(html, "img", "data-original") || "";

      if (url && url.includes("eroticmv.com")) {
        novel.push({
          title,
          url,
          cover,
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

    const titleEl = await this.querySelector(res, "div.float-video-title > h6, h1.entry-title, meta[property='og:title']");
    const title = titleEl ? (await titleEl.text || await titleEl.getAttributeText("content")).trim() : "EroticMV Video";

    const coverEl = await this.querySelector(res, "img.blog-picture.tmdb-picture, meta[property='og:image']");
    const cover = coverEl ? (await coverEl.getAttributeText("data-src") || await coverEl.getAttributeText("src") || await coverEl.getAttributeText("content")) : "";

    const descEl = await this.querySelector(res, "div.actor-element.tmdb-section-overview > p, meta[property='og:description']");
    const desc = descEl ? (await descEl.text || await descEl.getAttributeText("content")).trim() : "EroticMV Video";

    const m3u8Match = res.match(/(https?:\/\/[^\s'"]+\.m3u8[^\s'"]*)/i) ||
                      res.match(/(https?:\/\/[^\s'"]+\.mp4[^\s'"]*)/i) ||
                      res.match(/(aHR0cHM6[a-zA-Z0-9+\/=]+)/);

    const iframeMatch = res.match(/<iframe[^>]+src=["']([^"']+)["']/i);

    let episodeUrl = m3u8Match ? m3u8Match[1] : (iframeMatch ? iframeMatch[1] : url);
    episodeUrl = this.cleanUrl(episodeUrl);

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
    let playUrl = this.cleanUrl(url);

    if (playUrl.includes(".m3u8") || playUrl.includes(".mp4")) {
      return {
        type: playUrl.includes(".mp4") ? "mp4" : "hls",
        url: playUrl,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://eroticmv.com/"
        }
      };
    }

    const res = await this.request("", {
      headers: {
        "Miru-Url": playUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://eroticmv.com/"
      },
    });

    const m3u8Match = res.match(/(https?:\/\/[^\s'"]+\.m3u8[^\s'"]*)/i) ||
                      res.match(/(https?:\/\/[^\s'"]+\.mp4[^\s'"]*)/i) ||
                      res.match(/(aHR0cHM6[a-zA-Z0-9+\/=]+)/);

    if (m3u8Match) {
      playUrl = this.cleanUrl(m3u8Match[1]);
    }

    return {
      type: playUrl.includes(".mp4") ? "mp4" : "hls",
      url: playUrl || "",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://eroticmv.com/"
      }
    };
  }
}
