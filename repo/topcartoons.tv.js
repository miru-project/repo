// ==MiruExtension==
// @name         TopCartoons
// @version      v0.0.1
// @author       bachig26
// @lang         en
// @license      MIT
// @package      topcartoons.tv
// @type         bangumi
// @icon         https://www.topcartoons.tv/wp-content/uploads/logo.png
// @webSite      https://www.topcartoons.tv
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/page/${page}/`);
    const bsxList = await this.querySelectorAll(res, "article.post-item.site__col");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3 > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
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
    const bsxList = await this.querySelectorAll(res, "article.post-item.site__col");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3 > a").text;
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

    const title = await this.querySelector(res, "div.float-video-title > h6").text;
    const cover = await this.querySelector(res, "img.poster-preload").getAttributeText("src");
    const desc = await this.querySelector(res, "div.entry-content > p").text;     
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
