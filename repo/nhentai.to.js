// ==MiruExtension==
// @name         Nhentai
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @package      comrademao
// @type         manga
// @icon         https://nhentai.to/favicon.ico
// @webSite      https://nhentai.to
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(res, "div.gallery");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "div.caption").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }

  async search(kw, page) {
    const res = await this.request(`/search?q=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.gallery");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "div.caption").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request(`${url}`, {
      headers: {
        "miru-referer": "https://nhentai.to/",
      },
    });

    const title = await this.querySelector(res, "h1").text;
    const cover = res.match(/https:\/\/cdn\.dogehls\.xyz\/[^"]+/)[0];
    const desc = await this.querySelector(res, "h2").text;

    const episodes = [];
    const epiList = await this.querySelectorAll(res, "#info-block");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "h1").text;
      const url = await this.querySelector(html, "h3#gallery_id").text;

      episodes.push({
        name,
        url: url.replace("#", ""),
      });
    }

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Chapters",
          urls: episodes,
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(`/chapters/${url}`, {
      headers: {
        "Miru-Url": "https://jimov-api.vercel.app/manga/nhentai",
      },
    });

    return {
      urls: res[0].images.map((item) => item.replace(/t\.jpg$/, ".jpg")),
    };
  }
}
