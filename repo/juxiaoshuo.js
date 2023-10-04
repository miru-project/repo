// ==MiruExtension==
// @name         聚小说
// @version      v0.0.1
// @author       OshekharO
// @lang         zh-cn
// @license      MIT
// @package      juxiaoshuo
// @type         fikushon
// @icon         https://www.juxiaoshuo.net/images/nocover.png
// @webSite      https://www.juxiaoshuo.net
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(res, "div.item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title: title.trim(),
        url,
        cover: "https://www.juxiaoshuo.net" + cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/page/search?query=${kw}&source=12`);
    const bsxList = await this.querySelectorAll(res, "div.so_list.bookcase");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h4.bookname > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title: title.trim(),
        url,
        cover: "https://www.juxiaoshuo.net" + cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request(`${url}`, {
      headers: {
        "miru-referer": "https://www.juxiaoshuo.net/",
      },
    });

    const title = await this.querySelector(res, "span.title").text;
    const cover = await this.querySelector(res, "img").getAttributeText("data-src");
    const desc = await this.querySelector(res, "div.intro > dl > dd").text;

    const episodes = [];
    const epiList = await this.querySelectorAll(res, "div.listmain > dl > dd");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "a").text;
      const url = await this.querySelector(html, "a").getAttributeText("href");

      episodes.push({
        name,
        url,
      });
    }

    return {
      title,
      cover: "https://www.juxiaoshuo.net" + cover,
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
    const res = await this.request(`${url}`);
    const contentList = await this.querySelectorAll(res, "div.Readarea.ReadAjax_content");
    const title = await this.querySelector(res, "h1.wap_none").text;
    const content = [];

    for (const c of contentList) {
      content.push(await this.querySelector(c.content, "div").text);
    }

    return {
      title,
      content,
    };
  }
}
