// ==MiruExtension==
// @name         AsuraScan
// @version      v0.0.3
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://asuracomic.net/images/logo.webp
// @package      asuratoon.com
// @type         manga
// @webSite      https://asuracomic.net
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("asurascans"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "AsuraScan URL",
      key: "asurascans",
      type: "input",
      description: "Homepage URL for AsuraScan",
      defaultValue: "https://asuracomic.net",
    });

    this.registerSetting({
      title: "Reverse Order of Chapters",
      key: "reverseChaptersOrderAsura",
      type: "toggle",
      description: "Reverse the order of chapters in ascending order",
      defaultValue: "true",
    });
  }

  async latest(page) {
    const res = await this.req(`/series?page=${page}/`);
    const latest = await this.querySelectorAll(res, "div.grid.grid-cols-2 > a");

    let comic = [];
    for (const element of latest) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span.block").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");

      comic.push({
        title: title.trim(),
        url,
        cover: cover,
      });
    }
    return comic;
  }

  async search(kw, page) {
    const res = await this.req(`/series?page=${page}&name=${kw}`);
    const searchList = await this.querySelectorAll(res, "div.grid.grid-cols-2.sm\\:grid-cols-2.md\\:grid-cols-5.gap-3.p-4 > a");

    const result = await Promise.all(
      searchList.map(async (element) => {
        const html = await element.content;
        const url = await this.getAttributeText(html, "a", "href");
        const title = await this.querySelector(html, "span.block.text-\\[13\\.3px\\].font-bold").text;
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
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://asuracomic.net/" + url,
      },
    });

    const title = await this.querySelector(res, "div.text-center.sm\\:text-left span.text-xl.font-bold").text;
    const cover = await this.querySelector(res, "img[alt='poster']").getAttributeText("src");
    const desc = await this.querySelector(res, "span.font-medium.text-sm.text-\\[\\#A2A2A2\\]").text;

    const epiList = await this.querySelectorAll(res, "div.pl-4.pr-2.pb-4.overflow-y-auto > div");
    const episodes = await Promise.all(
      epiList.map(async (element) => {
        const html = await element.content;
        const name = await this.querySelector(html, "h3.text-sm.text-white.font-medium a").text;
        const url = await this.getAttributeText(html, "h3.text-sm.text-white.font-medium a", "href");
        return {
          name: name.trim(),
          url: url,
        };
      })
    );

    if ((await this.getSetting("reverseChaptersOrderAsura")) === "true") {
      episodes.reverse();
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
    const res = await this.request('', {
      headers: {
        "Miru-Url": "https://asuracomic.net/series/" + url,
        "referer": "https://asuracomic.net/",
        "origin": "https://asuracomic.net",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
      },
    });

    const images = await Promise.all(
      (await this.querySelectorAll(res, "div.w-full.mx-auto.center > img")).map(async (element) => {
        const html = await element.content;
        return this.getAttributeText(html, "img", "src");
      })
    );

    return {
      urls: images,
    };
  }
}
