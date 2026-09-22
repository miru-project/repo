// ==MiruExtension==
// @name         Taotu[Photo]
// @version      v0.0.3
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
  async req(path) {
    let cleanPath = path
      .replace("https://taotu.org", "")
      .replace("https://en.taotu.org", "")
      .replace(/\/m(\/|$)/g, "/");
    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }
    return await this.request("", {
      headers: {
        "Miru-Url": `https://en.taotu.org${cleanPath}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://en.taotu.org/",
      },
    });
  }

  async latest(page) {
    const res = await this.req(`/page-${page}.html`);
    const elList = await this.querySelectorAll(res, "div.piclist > div");
    const mangas = [];
    for (const element of elList) {
      const html = await element.content;
      const titleEl = await this.querySelector(html, "h2");
      let title = (titleEl ? await titleEl.text : "") || (await this.getAttributeText(html, "img", "alt")) || "";
      let url = await this.getAttributeText(html, "a", "href");
      const cover = await this.getAttributeText(html, "img", "src");
      if (url) {
        url = url.replace("https://taotu.org", "").replace("https://en.taotu.org", "").replace(/\/m(\/|$)/g, "/");
      }
      if (url && cover) {
        mangas.push({
          title: title.trim(),
          url,
          cover,
        });
      }
    }
    return mangas;
  }

  async search(kw, page) {
    const res = await this.req(`/s?q=${encodeURIComponent(kw)}&page=${page}`);
    const elList = await this.querySelectorAll(res, "div.piclist > div");
    const mangas = [];
    for (const element of elList) {
      const html = await element.content;
      const titleEl = await this.querySelector(html, "h2");
      let title = (titleEl ? await titleEl.text : "") || (await this.getAttributeText(html, "img", "alt")) || "";
      let url = await this.getAttributeText(html, "a", "href");
      const cover = await this.getAttributeText(html, "img", "src");
      if (url) {
        url = url.replace("https://taotu.org", "").replace("https://en.taotu.org", "").replace(/\/m(\/|$)/g, "/");
      }
      if (url && cover) {
        mangas.push({
          title: title.trim(),
          url,
          cover,
        });
      }
    }
    return mangas;
  }

  async detail(url) {
    const res = await this.req(url);
    const titleEl = await this.querySelector(res, "h1, a.active");
    const title = titleEl ? (await titleEl.text).trim() : "";
    const cover = await this.getAttributeText(res, "div.piclist img", "src");
    const descEl = await this.querySelector(res, "meta[name='description']");
    const desc = descEl ? await this.getAttributeText(res, "meta[name='description']", "content") : "";

    const cleanUrl = url.replace("https://taotu.org", "").replace("https://en.taotu.org", "").replace(/\/m(\/|$)/g, "/");

    return {
      title,
      cover: cover || "",
      desc: desc || "",
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: title || "Gallery",
              url: cleanUrl,
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.req(url);
    const elList = await this.querySelectorAll(res, "div.piclist > a");
    const images = [];
    for (const element of elList) {
      const html = await element.content;
      const href = (await this.getAttributeText(html, "a", "href")) || (await this.getAttributeText(html, "img", "src"));
      if (href) {
        images.push(href);
      }
    }

    return {
      urls: images.length > 0 ? images : [url],
    };
  }
}
