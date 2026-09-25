// ==MiruExtension==
// @name         秀色女神
// @version      v0.0.1
// @author       OshekharO
// @lang         zh-cn
// @license      MIT
// @package      m.xsnvshen.com
// @type         manga
// @icon         https://res.xsnvshen.com/images/pwalogo.png
// @webSite      https://m.xsnvshen.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async req(path) {
    try {
      let cleanPath = path
        .replace("https://m.xsnvshen.com", "")
        .replace("https://www.xsnvshen.com", "");
      if (!cleanPath.startsWith("/")) {
        cleanPath = "/" + cleanPath;
      }
      return await this.request("", {
        headers: {
          "Miru-Url": `https://m.xsnvshen.com${cleanPath}`,
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
          Referer: "https://m.xsnvshen.com/",
        },
      });
    } catch (e) {
      return "";
    }
  }

  fixUrl(url) {
    if (!url) return "";
    if (url.startsWith("//")) {
      return "https:" + url;
    }
    if (url.startsWith("/")) {
      return "https://m.xsnvshen.com" + url;
    }
    return url;
  }

  async latest(page) {
    const res = await this.req(`/album/?p=${page}`);
    if (!res) return [];

    const elList = await this.querySelectorAll(res, "ul.list li, ul.list_3c li, li");
    const mangas = [];
    const seenUrls = new Set();

    for (const element of elList) {
      const html = await element.content;
      let url = await this.getAttributeText(html, "a", "href");
      if (!url || !url.includes("/album/") || seenUrls.has(url)) {
        continue;
      }

      let title =
        (await this.getAttributeText(html, "img", "alt")) ||
        (await this.getAttributeText(html, "a", "title")) ||
        "";

      if (!title) {
        const txtEl = await this.querySelector(html, ".txtbts3, .titlebox");
        if (txtEl) {
          title = await txtEl.text;
        }
      }

      let cover =
        (await this.getAttributeText(html, "img", "src")) ||
        (await this.getAttributeText(html, "img", "data-original")) ||
        "";

      seenUrls.add(url);
      mangas.push({
        title: (title || "").trim(),
        url,
        cover: this.fixUrl(cover),
      });
    }

    return mangas;
  }

  async search(kw, page) {
    const res = await this.req(`/search?w=${encodeURIComponent(kw)}&p=${page}`);
    if (!res) return [];

    const elList = await this.querySelectorAll(res, "ul.list_3c li, ul.list li, li");
    const mangas = [];
    const seenUrls = new Set();

    for (const element of elList) {
      const html = await element.content;
      let url = await this.getAttributeText(html, "a", "href");
      if (!url || !url.includes("/album/") || seenUrls.has(url)) {
        continue;
      }

      let title =
        (await this.getAttributeText(html, "img", "alt")) ||
        (await this.getAttributeText(html, "a", "title")) ||
        "";

      if (!title) {
        const txtEl = await this.querySelector(html, ".titlebox, .txtbts3");
        if (txtEl) {
          title = await txtEl.text;
        }
      }

      let cover =
        (await this.getAttributeText(html, "img", "src")) ||
        (await this.getAttributeText(html, "img", "data-original")) ||
        "";

      seenUrls.add(url);
      mangas.push({
        title: (title || "").trim(),
        url,
        cover: this.fixUrl(cover),
      });
    }

    return mangas;
  }

  async detail(url) {
    const cleanUrl = url
      .replace("https://m.xsnvshen.com", "")
      .replace("https://www.xsnvshen.com", "");

    const res = await this.req(cleanUrl);
    const titleEl = await this.querySelector(res, "h1, .titlebox h1");
    const title = titleEl ? (await titleEl.text).trim() : "";

    const cover =
      (await this.getAttributeText(res, "#arcbox img", "datafull")) ||
      (await this.getAttributeText(res, "#arcbox img", "src")) ||
      "";

    const descEl = await this.querySelector(res, "meta[name='description']");
    const desc = descEl ? await this.getAttributeText(res, "meta[name='description']", "content") : "";

    return {
      title,
      cover: this.fixUrl(cover),
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
    const cleanUrl = url
      .replace("https://m.xsnvshen.com", "")
      .replace("https://www.xsnvshen.com", "")
      .split("?")[0];

    const res = await this.req(cleanUrl);
    if (!res) {
      return { urls: [] };
    }

    const images = [];
    const extractImages = async (htmlContent) => {
      const imgList = await this.querySelectorAll(htmlContent, "#arcbox img");
      for (const imgEl of imgList) {
        const imgHtml = await imgEl.content;
        const src =
          (await this.getAttributeText(imgHtml, "img", "datafull")) ||
          (await this.getAttributeText(imgHtml, "img", "src"));
        if (src) {
          images.push(this.fixUrl(src));
        }
      }
    };

    await extractImages(res);

    // Check pagination options in page 1 HTML
    const options = await this.querySelectorAll(res, "#touch_page option, select.pg_select option");
    let maxPage = 1;
    for (const opt of options) {
      const optHtml = await opt.content;
      const valStr = await this.getAttributeText(optHtml, "option", "value");
      const val = parseInt(valStr, 10);
      if (!isNaN(val) && val > maxPage) {
        maxPage = val;
      }
    }

    // Fetch remaining pages if maxPage > 1
    for (let p = 2; p <= maxPage; p++) {
      const pageRes = await this.req(`${cleanUrl}?p=${p}`);
      if (pageRes) {
        await extractImages(pageRes);
      }
    }

    return {
      urls: images,
    };
  }
}
