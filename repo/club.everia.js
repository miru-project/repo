// ==MiruExtension==
// @name         EVERIA.CLUB[Photo]
// @version      v0.0.5
// @author       vvsolo
// @lang         all
// @license      MIT
// @type         manga
// @icon         https://everia.club/wp-content/uploads/2023/08/Everiaicon.jpg
// @package      club.everia
// @webSite      https://everia.club
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  #opts = {
    base: "https://everia.club",
    uptime: 0,
    expire: 5,
  };
  #cache = new Map([["@cover", {}]]);

  async createFilter(filter) {
    if (!this.checkCache("@genres")) {
      const res = await this.request(`/`);
      let genres = {
        All: "All",
      };
      await this.queryAll(res, ".main-navigation li.menu-item, #menu-menu > li.menu-item", async (html) => {
        const title = ((await this.querySelector(html, "a").text) || "").trim();
        let href = await this.getAttributeText(html, "a", "href");
        if (href) {
          href = href.replace(this.#opts.base, "");
          if (
            title &&
            href &&
            href !== "#" &&
            !href.includes("search") &&
            !href.includes("about") &&
            !href.includes("contact") &&
            !href.includes("disclaimer")
          ) {
            genres[href] = title;
          }
        }
      });
      this.#cache.set("@genres", genres);
    }
    return {
      data: {
        title: "Category",
        max: 1,
        min: 1,
        default: "All",
        options: this.#cache.get("@genres"),
      },
    };
  }

  async latest(page) {
    return await this.getMangas(`/page/${page}/`);
  }

  async search(kw, page, filter) {
    const filt = (filter?.data && filter.data[0]) || "All";
    let seaKW = `/page/${page}/`;
    if (filt != "All") {
      seaKW = filt + seaKW.replace(/^\//, "");
    }
    if (kw) {
      seaKW = `/page/${page}/?s=${encodeURIComponent(kw)}`;
    }
    return await this.getMangas(seaKW);
  }

  async detail(url) {
    const res = await this.req(url);
    const titleEl = await this.querySelector(res, "h2.single-post-title, .entry-title, h1");
    const title = titleEl ? ((await titleEl.text) || "").trim() : "";

    const imgs = await this.queryAll(res, "figure.wp-block-image, figure", async (html) => {
      return (
        (await this.getAttributeText(html, "img", "data-src")) ||
        (await this.getAttributeText(html, "img", "src")) ||
        (await this.getAttributeText(html, "img", "data-original")) ||
        ""
      );
    });

    const validImgs = imgs.filter((src) => src && !src.includes("gravatar") && !src.includes("logo"));
    const cover = this.#cache.get("@cover")[url] || (validImgs.length > 0 ? validImgs[0] : "");

    return {
      title,
      cover,
      episodes: [
        {
          title: "Full Gallery",
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
    if (!url.includes("everia.club")) {
      return {
        urls: [url],
      };
    }
    const res = await this.req(url);
    const imgs = await this.queryAll(res, "figure.wp-block-image, figure", async (html) => {
      return (
        (await this.getAttributeText(html, "img", "data-src")) ||
        (await this.getAttributeText(html, "img", "src")) ||
        (await this.getAttributeText(html, "img", "data-original")) ||
        ""
      );
    });

    const validImgs = imgs.filter((src) => src && !src.includes("gravatar") && !src.includes("logo"));
    return {
      urls: validImgs.length > 0 ? validImgs : [url],
    };
  }

  async getMangas(path) {
    const md5path = md5(path);
    if (this.checkCache(md5path)) {
      return this.#cache.get(md5path);
    }
    const res = await this.req(path);
    const seenUrls = new Set();
    const mangas = await this.queryAll(res, ".rt-img-holder, article.entry, .thumbnail", async (html) => {
      let title =
        (await this.getAttributeText(html, "img", "alt")) ||
        (await this.getAttributeText(html, "img", "title")) ||
        (await this.getAttributeText(html, ".entry-title a", "title")) ||
        "";

      let url =
        (await this.getAttributeText(html, "a", "href")) ||
        (await this.getAttributeText(html, ".entry-title a", "href")) ||
        "";

      let cover =
        (await this.getAttributeText(html, "img", "src")) ||
        (await this.getAttributeText(html, "img", "data-src")) ||
        "";

      if (!title) {
        const titleEl = await this.querySelector(html, ".entry-title a, a");
        if (titleEl) {
          title = (await titleEl.text) || "";
        }
      }

      title = title.trim().replace(/^Read more about the article\s*/i, "");

      if (!url || !cover || seenUrls.has(url)) {
        return null;
      }
      seenUrls.add(url);

      this.#cache.get("@cover")[url] = cover;
      return {
        title,
        url,
        cover,
      };
    });

    const filtered = mangas.filter((item) => item !== null);
    this.#cache.set(md5path, filtered);
    this.#opts.uptime = Date.now();
    return filtered;
  }

  async req(path) {
    return await this.request(path.replace(this.#opts.base, ""));
  }

  async queryAll(res, selector, func) {
    return (
      (await Promise.all(
        (await this.querySelectorAll(res, selector)).map(async (v, i) => {
          const html = await v.content;
          return await func(html, v, i);
        })
      )) || []
    );
  }

  checkCache(item) {
    const expire = +this.#opts.expire;
    return this.#cache.has(item) && expire > 0 && Date.now() - this.#opts.uptime < expire * 60 * 1000;
  }
}
