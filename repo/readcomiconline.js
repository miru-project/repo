// ==MiruExtension==
// @name         ReadComicOnline
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      readcomiconline
// @type         manga
// @icon         https://readcomiconline.li/Content/images/favicon.ico
// @webSite      https://readcomiconline.li
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/ComicList/Newest/");
    const bsxList = await this.querySelectorAll(res, "div.item-list > div.section.group.list");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "div.col.info > p > a", "href");
      const title = await this.querySelector(html, "div.col.info > p > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover: "https://readcomiconline.li" + cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/Search/Comic?keyword=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.item-list > div.section.group.list");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "div.col.info > p > a", "href");
      const title = await this.querySelector(html, "div.col.info > p > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover: "https://readcomiconline.li" + cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request(url);

    const title = await this.querySelector(res, "div.heading > h3").text;
    const desc = await this.querySelector(res, "meta[name='description']").getAttributeText("content");
    const cover = await this.querySelector(res, "link[rel='image_src']").getAttributeText("href");

    const episodes = [];
    const epiList = await this.querySelectorAll(res, "ul.list > li");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "a > span").text;
      const url = await this.getAttributeText(html, "a", "href");

      episodes.push({
        name,
        url: "https://readcomiconline.li" + url,
      });
    }

    return {
      title,
      cover: "https://readcomiconline.li/" + cover,
      desc: desc.trim(),
      episodes: [
        {
          title: "Chapters",
          urls: episodes.reverse(),
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
      (await this.querySelectorAll(res, "div#readerarea > p > img")).map(async (element) => {
        const html = await element.content;
        return this.getAttributeText(html, "img", "src");
      })
    );

    return {
      urls: images,
    };
  }
}
