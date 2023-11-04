// ==MiruExtension==
// @name         SunPorno
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @package      sunporno.com
// @type         bangumi
// @icon         https://www.sunporno.com/favicon-32x32.png
// @webSite      https://www.sunporno.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(res, "div.th.hide");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span.video-title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title,
        url: "https://www.sunporno.com" + url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/search/${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.th.hide");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span.video-title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title,
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

    const title = await this.querySelector(res, "span.movie-title-text").text;
    const cover = await this.querySelector(res, "link[itemprop='thumbnailUrl']").getAttributeText("href");
    const desc = await this.querySelector(res, "span[itemprop='description']").text;
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
      title: title.trim(),
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
    return {
      type: "hls",
      url: url || "",
    };
  }
}
