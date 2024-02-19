// ==MiruExtension==
// @name         MangaKomi
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://mangakomi.io/wp-content/uploads/2019/12/v-I-BhKu.jpeg
// @package      mangakomi
// @type         manga
// @webSite      https://mangakomi.io
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("mangakomi"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Base URL",
      key: "mangakomi",
      type: "input",
      description: "Homepage URL for MangaKomi",
      defaultValue: "https://mangakomi.io",
    });

    this.registerSetting({
      title: "Reverse Order of Chapters",
      key: "reverseChaptersOrder",
      type: "toggle",
      description: "Reverse the order of chapters in ascending order",
      defaultValue: "true",
    });
  }

  async latest(page) {
    const res = await this.req(`/manga/page/${page}/?m_orderby=latest`);
    const latest = await this.querySelectorAll(res, "div.row.row-eq-height > div.col-12.col-md-6");

    let comic = [];
    for (const element of latest) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "h3 > a", "href");
      const title = await this.querySelector(html, "h3 > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");

      comic.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return comic;
  }

  async search(kw) {
    const kwstring = kw.replace(/ /g, "+");
    const res = await this.req(`/?s=${kwstring}&post_type=wp-manga`);
    const searchList = await this.querySelectorAll(res, "div.c-tabs-item > div.row.c-tabs-item__content");
    const result = await Promise.all(
      searchList.map(async (element) => {
        const html = await element.content;
        const url = await this.getAttributeText(html, "h3 > a", "href");
        const title = await this.querySelector(html, "h3 > a").text;
        const cover = await this.querySelector(html, "img").getAttributeText("data-src");

        return {
          title: title.trim(),
          url,
          cover,
        };
      })
    );
    return result;
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const title = await this.querySelector(res, "h1").text;
    const cover = await this.querySelector(res, "div.summary_image > a > img.img-responsive.lazyload").getAttributeText("data-src");
    const desc = await this.querySelector(res, "div.summary__content.show-more").text;

    const epiList = await this.querySelectorAll(res, "ul.main.version-chap > li");
    const episodes = await Promise.all(
      epiList.map(async (element) => {
        const html = await element.content;
        const name = await this.querySelector(html, "a").text;
        const url = await this.getAttributeText(html, "a", "href");
        return {
          name: name.trim(),
          url,
        };
      })
    );

    if ((await this.getSetting("reverseChaptersOrder")) === "true") {
      episodes.reverse();
    }

    return {
      title: title.trim(),
      cover,
      desc: desc.trim(),
      episodes: [
        {
          title: "Chapters",
          urls: episodes,
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const images = await Promise.all(
      (await this.querySelectorAll(res, "div.reading-content > div.page-break > img")).map(async (element) => {
        const html = await element.content;
        let dataSrc = await this.getAttributeText(html, "img", "data-src");
        dataSrc = dataSrc.trim();
        return dataSrc;
      })
    );

    return {
      urls: images,
    };
  }
}
