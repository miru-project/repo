// ==MiruExtension==
// @name         TeamxNovel
// @version      v0.0.1
// @author       OshekharO
// @lang         ar
// @license      MIT
// @icon         https://teamxnovel.com/assets/images/favicon.png
// @package      teamxnovel.com
// @type         manga
// @webSite      https://teamxnovel.com
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("teamxnovel"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "TeamxNovel URL",
      key: "teamxnovel",
      type: "input",
      description: "Homepage URL for TeamxNovel",
      defaultValue: "https://teamxnovel.com",
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
    const res = await this.req(`/series?page=${page}`);
    const latest = await this.querySelectorAll(res, "div.listupd > .bs > .bsx");

    let comic = [];
    for (const element of latest) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "div.tt").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");

      comic.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return comic;
  }

  async search(kw) {
    const res = await this.request('', {
      headers: {
        "Miru-Url": `https://teamxnovel.com/ajax/search?keyword=${kw}`,
      },
    });

    const searchList = await this.querySelectorAll(res, "ol.list-group > li");
    const result = await Promise.all(
      searchList.map(async (element) => {
        const html = await element.content;
        const url = await this.getAttributeText(html, "a", "href");
        const title = await this.querySelector(html, "a.fw-bold").text;
        const cover = await this.querySelector(html, "img").getAttributeText("src");
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
    const res = await this.request('', {
      headers: {
        "Miru-Url": url,
      },
    });

    const title = await this.querySelector(res, "h6").text;
    const cover = await this.querySelector(res, "img.shadow-sm").getAttributeText("src");
    const desclist = await this.querySelectorAll(res, "div.review-content > p");
    const desc = await Promise.all(
      desclist.map(async (element) => {
        const decHtml = await element.content;
        return await this.querySelector(decHtml, "p").text;
      })
    ).then((texts) => texts.join(""));

    const epiList = await this.querySelectorAll(res, "div.eplister > ul > li");
    const episodes = await Promise.all(
      epiList.map(async (element) => {
        const html = await element.content;
        const name = await this.querySelector(html, "div.epl-title").text;
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
      title,
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
    const res = await this.request('', {
      headers: {
        "Miru-Url": url,
      },
    });

    const images = await Promise.all(
      (await this.querySelectorAll(res, "div.image_list > div.page-break > img")).map(async (element) => {
        const html = await element.content;
        let dataSrc = await this.getAttributeText(html, "img", "src");
        dataSrc = dataSrc.trim();
        return dataSrc;
      })
    );

    return {
      urls: images,
    };
  }
}
