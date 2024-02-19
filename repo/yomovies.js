// ==MiruExtension==
// @name         YoMovies
// @version      v0.0.5
// @author       OshekharO
// @lang         hi
// @license      MIT
// @package      yomovies
// @type         bangumi
// @icon         https://yomovies.town/wp-content/uploads/2023/12/120.jpg
// @webSite      https://yomovies.town
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/");
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
  }

  async search(kw) {
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
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const title = await this.querySelector(res, "meta[property='og:title']").getAttributeText("content");
    const cover = await this.querySelector(res, "img[itemprop='image']").getAttributeText("src");
    const desc = await this.querySelector(res, "p.f-desc").text;
    const episodeUrl = res.match(/https:\/\/minoplres\.[^\s'"]+/);

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
              url: episodeUrl ? episodeUrl[0] : "",
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
        Referer: "https://minoplres.xyz/",
      },
    });

    const directUrlMatch = res.match(/https:\/\/[^\s'"]+\.(?:mp4|m3u8)[^\s'"]*/);
    const directUrl = directUrlMatch ? directUrlMatch[0] : "";

    return {
      type: "hls",
      url: directUrl || "",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
        referer: directUrl,
      },
    };
  }
}
