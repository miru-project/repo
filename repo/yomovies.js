// ==MiruExtension==
// @name         YoMovies
// @version      v0.0.8
// @author       OshekharO
// @lang         hi
// @license      MIT
// @package      yomovies
// @type         bangumi
// @icon         https://dl.memuplay.com/new_market/img/com.wYoMovies_7822289.sc1.2024-05-21-17-59-43.jpg
// @webSite      https://yomovies.church
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    try {
      const res = await this.request(`/?page=${page}`);
      const bsxList = await this.querySelectorAll(res, "div.ml-item");
      const novel = [];
      for (const element of bsxList) {
        const html = await element.content;
        const url = await this.getAttributeText(html, "a", "href");
        const title = await this.querySelector(html, "div.qtip-title").text;
        const cover = await this.querySelector(html, "img").getAttributeText("data-original");

        novel.push({
          title: title.trim(),
          url,
          cover,
        });
      }
      return novel;
    } catch (e) {
      return [
        {
          title: "Need to use webview",
          url: "/",
          cover: null,
        },
      ];
    }
  }

  async search(kw) {
    try {
      const res = await this.request(`/?s=${kw}`);
      const bsxList = await this.querySelectorAll(res, "div.ml-item");
      const novel = [];

      for (const element of bsxList) {
        const html = await element.content;
        const url = await this.getAttributeText(html, "a", "href");
        const title = await this.querySelector(html, "div.qtip-title").text;
        const cover = await this.querySelector(html, "img").getAttributeText("data-original");
        novel.push({
          title: title.trim(),
          url,
          cover,
        });
      }
      return novel;
    } catch (e) {
      return [
        {
          title: "Need to use webview",
          url: "/",
          cover: null,
        },
      ];
    }
  }

  async detail(url) {
    if (url === "/") {
      return {
        title: "Use webview",
        cover: null,
        desc: "Please use webview to enter the website then close the webview window.",
      };
    }

    try {
      const res = await this.request("", {
        headers: {
          "Miru-Url": url,
        },
      });

      const title = await this.querySelector(res, "meta[property='og:title']").getAttributeText("content");
      const cover = await this.querySelector(res, "img[itemprop='image']").getAttributeText("src");
      const desc = await this.querySelector(res, "p.f-desc").text;

      const matchedUrls = res.match(/https:\/\/(?:minoplres|speedostream[0-9]*)\.[^\s'"]+(?:embed-[^\s'"]+|\.html)/g) || [];
      let episodeUrl = "";
      for (let u of matchedUrls) {
        if (!/\/embed-[a-zA-Z0-9]+/.test(u)) {
          u = u.replace(/\/([a-zA-Z0-9]+)\.html$/, "/embed-$1.html");
        }
        episodeUrl = u;
        break;
      }

      return {
        title: title.trim(),
        cover,
        desc,
        episodes: [
          {
            title: "Directory",
            urls: [
              {
                name: title.trim(),
                url: episodeUrl,
              },
            ],
          },
        ],
      };
    } catch (e) {
      return {
        title: "Use webview",
        cover: null,
        desc: "Please use webview to enter the website then close the webview window.",
      };
    }
  }

  async watch(url) {
    let directUrl = "";
    if (url) {
      try {
        const res = await this.request("", {
          headers: {
            "Miru-Url": url,
            Referer: "https://yomovies.church/",
          },
        });

        const directUrlMatch = res.match(/https:\/\/[^\s'"]+\.(?:mp4|m3u8)[^\s'"]*/);
        if (directUrlMatch) {
          directUrl = directUrlMatch[0];
        }
      } catch (e) {
        // Catch network/SSL HandshakeExceptions (e.g. CERTIFICATE_VERIFY_FAILED from Cloudflare protection)
      }
    }

    return {
      type: "hls",
      url: directUrl,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
        referer: "https://speedostream1.com/",
      },
    };
  }
}
