// ==MiruExtension==
// @name         Nhentai
// @version      v0.0.4
// @author       OshekharO
// @lang         all
// @license      MIT
// @package      nhentai.to
// @type         manga
// @icon         https://nhentai.to/favicon.ico
// @webSite      https://nhentai.to
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/go?page=${page}`, {
      headers: {
        "miru-referer": "https://nhentai.to/",
      },
    });

    const bsxList = await this.querySelectorAll(res, "div.gallery");
    const mangas = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.cover", "href");
      if (!url) continue;

      const titleEl = await this.querySelector(html, "div.caption");
      let title = (titleEl ? await titleEl.text : "") || (await this.getAttributeText(html, "img", "alt")) || "";
      let cover = (await this.getAttributeText(html, "img", "src")) || (await this.getAttributeText(html, "img", "data-src")) || "";

      mangas.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return mangas;
  }

  async search(kw, page) {
    const res = await this.request(`/search?q=${encodeURIComponent(kw)}&page=${page}`, {
      headers: {
        "miru-referer": "https://nhentai.to/",
      },
    });

    const bsxList = await this.querySelectorAll(res, "div.gallery");
    const mangas = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.cover", "href");
      if (!url) continue;

      const titleEl = await this.querySelector(html, "div.caption");
      let title = (titleEl ? await titleEl.text : "") || (await this.getAttributeText(html, "img", "alt")) || "";
      let cover = (await this.getAttributeText(html, "img", "src")) || (await this.getAttributeText(html, "img", "data-src")) || "";

      mangas.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return mangas;
  }

  async detail(url) {
    const res = await this.request(`${url}`, {
      headers: {
        "miru-referer": "https://nhentai.to/",
      },
    });

    const titleEl = await this.querySelector(res, "h1, h2");
    const title = titleEl ? (await titleEl.text).trim() : "";

    const cover =
      (await this.getAttributeText(res, "#cover img", "src")) ||
      (await this.getAttributeText(res, "#cover img", "data-src")) ||
      "";

    const descEl = await this.querySelector(res, "#info");
    const desc = descEl ? (await descEl.text).trim() : "";

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Chapters",
          urls: [
            {
              name: title || "Gallery",
              url: url,
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(`${url}`, {
      headers: {
        "miru-referer": "https://nhentai.to/",
      },
    });

    const imgList = await this.querySelectorAll(res, "#thumbnail-container img");
    const images = [];
    for (const element of imgList) {
      const html = await element.content;
      let src =
        (await this.getAttributeText(html, "img", "data-src")) ||
        (await this.getAttributeText(html, "img", "src")) ||
        "";

      if (src && !src.startsWith("data:image")) {
        const fullSrc = src.replace(/t\.([a-zA-Z0-9]+)$/, ".$1");
        images.push(fullSrc);
      }
    }

    return {
      urls: images.length > 0 ? images : [url],
    };
  }
}
