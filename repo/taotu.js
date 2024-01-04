// ==MiruExtension==
// @name         Taotu[Photo]
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @package      taotu
// @type         manga
// @icon         https://res.taotu.org/favicon.ico
// @webSite      https://en.taotu.org
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request('', {
      headers: {
        "Miru-Url": `https://en.taotu.org/page-${page}.html`,
      },
    });

    const elList = await this.querySelectorAll(res, "div.piclist > div");
    const mangas = [];
    for (const element of elList) {
      const html = await element.content;
      const title = await this.getAttributeText(html, "img", "alt");
      const url = await this.getAttributeText(html, "a", "href");
      const cover = await this.getAttributeText(html, "img", "src");
      mangas.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return mangas;
  }

  async search(kw, page) {
    const res = await this.request(`/s?q=${kw}&page=${page}`);
    const elList = await this.querySelectorAll(res, "div.piclist > div");
    const mangas = [];
    for (const element of elList) {
      const html = await element.content;
      const title = await this.getAttributeText(html, "img", "alt");
      const url = await this.getAttributeText(html, "a", "href");
      const cover = await this.getAttributeText(html, "img", "src");
      mangas.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return mangas;
  }

  async detail(url) {
    const res = await this.request('', {
      headers: {
        "Miru-Url": `https://en.taotu.org${url}`,
      },
    });

    const title = await this.querySelector(res, "a.active").text;
    const cover = await this.querySelector(res, "link[rel='shortcut icon']").getAttributeText("href");
    const desc = await this.querySelector(res, "meta[name='description']").getAttributeText("content");

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: title,
              url: url,
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request('', {
      headers: {
        "Miru-Url": `https://en.taotu.org${url}`,
      },
    });

    const images = await Promise.all(
      (await this.querySelectorAll(res, "div.piclist > a > img")).map(async (element) => {
        const html = await element.content;
        return this.getAttributeText(html, "img", "src");
      })
    );

    return {
      urls: images,
    };
  }
}
