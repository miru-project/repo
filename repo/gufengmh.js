// ==MiruExtension==
// @name        古风漫画
// @version      v0.0.1
// @author       瑜君之学-杨瑜候
// @lang         zh
// @license      MIT
// @type         manga
// @icon         https://www.gufengmh.com/favicon.ico
// @package      gufengmh
// @webSite      https://www.gufengmh.com
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/list/click/?page=${page}`);
    const bsxList = await this.querySelectorAll(res, "li.item-lg");
    const novel = await Promise.all(
      bsxList.map(async (element) => {
        const html = await element.content;
        const img = await this.getAttributeText(html, "img", "src");
        const upImg = img.replace("webp", "jpg");
        return {
          title: await this.getAttributeText(html, "img", "alt"),
          url: await this.getAttributeText(html, "a", "href"),
          img: upImg,
        };
      })
    );

    return novel;
  }

  async search(keyword, page) {
    const res = await this.request(`/search/?keywords=${keyword}&page=${page}`);
    const bsxList = await this.querySelectorAll(res, "li.item-lg");

    const lieBiao = await Promise.all(
      bsxList.map(async (element) => {
        const html = await element.content;
        const img = await this.getAttributeText(html, "img", "src");
        const upImg = img.replace("webp", "jpg");
        return {
          title: await this.getAttributeText(html, "img", "alt"),
          url: await this.getAttributeText(html, "a", "href"),
          img: upImg,
        };
      })
    );
    return lieBiao;
  }

  async detail(url) {
    const res = await this.request("", { headers: { "Miru-Url": url } });

    const coverTitle =
      (await this.querySelector(res, ".book-title > h1 > span")?.text) ?? "";
    const coverImg = await this.getAttributeText(
      res,
      "div.book-cover > p > img",
      "src"
    );
    const coverDesc =
      (await this.querySelector(res, "#intro-all > p")?.text) ?? "";
    const selectList = await this.querySelectorAll(
      res,
      "div.chapter-body > ul > li"
    );
    const muLuDAta = [];
    for (const element of selectList) {
      const html = element.content;
      const title = await this.querySelector(html, "span").text;
      const url = await this.getAttributeText(html, "a", "href");
      muLuDAta.push({
        name: title,
        url: url,
      });
    }

    return {
      title: coverTitle,
      cover: coverImg,
      coverDesc,
      episodes: [
        {
          title: "Directory",
          urls: muLuDAta,
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(url);

    const chapterImagesMatch = res.match(/var chapterImages = \[(.*?)\];/s);
    const chapterPathMatch = res.match(/var chapterPath = "([^"]+)";/);

    if (chapterImagesMatch && chapterPathMatch) {
      const chapterImages = chapterImagesMatch[1]
        .split(",")
        .map((item) => item.replace(/["\s]/g, ""));
      const chapterPath = chapterPathMatch[1];

      return {
        urls: chapterImages.map(
          (image) => `https://res.xiaoqinre.com/${chapterPath}${image}`
        ),
      };
    }
  }
}
