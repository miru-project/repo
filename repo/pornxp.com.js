// ==MiruExtension==
// @name         PornXP
// @version      v0.0.1
// @author       bachig26
// @lang         en
// @license      MIT
// @package      pornxp.com
// @type         bangumi
// @icon         https://www.pornxp.com/logo2.png
// @webSite      https://www.pornxp.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request("/released/?page={page}");
    const bsxList = await this.querySelectorAll(res, "div.item_cont");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "div.item_title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title,
        url: "https://www.pornxp.com" + url,
        cover: "https:" + cover,
      });
    }
    return novel;
  }

  async search(kw) {
	const kwstring = kw.replace(/ /g, '+');
    const res = await this.request(`/?q=${kwstring}`);
    const bsxList = await this.querySelectorAll(res, "div.item_cont");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "div.item_title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title,
        url: "https://www.pornxp.com" + url,
        cover: "https:" + cover,
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

    const title = await this.querySelector(res, "h1").text;
    const cover = await this.querySelector(res, "video").getAttributeText("poster");
    const urlPatterns = [/\/\/[^\s'"]+\.(?:mp4|m3u8)/];

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
      cover: "https:" + cover,
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: title,
              url: "https:" + episodeUrl,
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
