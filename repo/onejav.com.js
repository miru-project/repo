// ==MiruExtension==
// @name         OneJav
// @version      v0.0.1
// @author       OshekharO
// @lang         jp
// @license      MIT
// @package      onejav.com
// @type         bangumi
// @icon         https://onejav.com/static/img/onejav.5468a5a7d373.png
// @webSite      https://onejav.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/popular/");
    const bsxList = await this.querySelectorAll(res, "div.card.mb-3");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "h5.title.is-4.is-spaced > a", "href");
      const title = await this.querySelector(html, "h5.title.is-4.is-spaced > a").text;
      const cover = await this.querySelector(html, ".image").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/search/${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.card.mb-3");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "h5.title.is-4.is-spaced > a", "href");
      const title = await this.querySelector(html, "h5.title.is-4.is-spaced > a").text;
      const cover = await this.querySelector(html, ".image").getAttributeText("src");
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
        "miru-referer": "https://onejav.com/",
      },
    });

    const title = await this.querySelector(res, "h5.title.is-4.is-spaced > a").text;
    const cover = await this.querySelector(res, ".image").getAttributeText("src");
    const desc = await this.querySelector(res, "p.level.has-text-grey-dark").text;

    const episodes = [];
    const epiList = await this.querySelectorAll(res, "p.control.is-expanded");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "a").text;
      const url = await this.getAttributeText(html, "a", "href");

      episodes.push({
        name: `Stream Torrent`,
        url,
      });
    }

    return {
      title: title.trim(),
      cover,
      desc: desc.trim(),
      episodes: [
        {
          title: "Directory",
          urls: episodes,
        },
      ],
    };
  }

  async watch(url) {
    const torrent = `https://onejav.com${url}`;
    return {
      type: "torrent",
      url: torrent,
    };
  }
}
