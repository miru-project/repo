// ==MiruExtension==
// @name         SuperCartoons
// @version      v0.0.1
// @author       bachig26
// @lang         en
// @license      MIT
// @package      supercartoons.net
// @type         bangumi
// @icon         https://www.supercartoons.net/wp-content/uploads/logo.png
// @webSite      https://www.supercartoons.net
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request(`/`);
    const bsxList = await this.querySelectorAll(res, "div.item.col-lg-3.col-md-3");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
	const kwstring = kw.replace(/ /g, '+');
    const res = await this.request(`/?s=${kwstring}&search=Search`);
    const bsxList = await this.querySelectorAll(res, "div.item.col-lg-3.col-md-3");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
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

    const title = await this.querySelector(res, "div.col-lg-8.col-md-8 > h1").text;
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "div.post-content > p").text;     
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
              name: `Watch ${title}`,
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
