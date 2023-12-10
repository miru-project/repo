// ==MiruExtension==
// @name         ReadLN
// @version      v0.0.2
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://readlightnovels.net/wp-content/uploads/2020/01/rln-logo-ret.png
// @package      readlightnovels
// @type         fikushon
// @webSite      https://api-consumet-h3n5a059y-kingarthurs-projects.vercel.app/light-novels/readlightnovels
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("readlightnovels"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "ReadLN API",
      key: "readlightnovels",
      type: "input",
      description: "ReadLN Api Url",
      defaultValue: "https://api-consumet-h3n5a059y-kingarthurs-projects.vercel.app/light-novels/readlightnovels",
    });
  }

  async latest() {
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://readlightnovels.net/latest",
      },
    });
    const bsxList = await this.querySelectorAll(res, "div.home-truyendecu");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");

      if (!url.includes("%")) {
        novel.push({
          title,
          url,
          cover,
        });
      }
    }
    return novel;
  }

  async detail(url) {
    const res = await this.req(`/info?id=${url}`);
    return {
      title: res.title,
      cover: res.image,
      desc: res.description,
      episodes: [
        {
          title: "Directory",
          urls: res.chapters.map((item) => ({
            name: item.title,
            url: item.id,
          })),
        },
      ],
    };
  }

  async search(kw) {
    const res = await this.req(`/${kw}`);
    return res.results
      .filter((item) => !item.id.includes("%"))
      .map((item) => ({
        title: item.title,
        url: item.id,
        cover: item.image,
      }));
  }

  async watch(url) {
    const res = await this.req(`/read?chapterId=${url}`);
    let chapterContentDiv = res.text;
    chapterContentDiv = chapterContentDiv.replace(/<\/?p>|<br\s*\/?>/gi, "\n");
    chapterContentDiv = chapterContentDiv.replace(/\n{2,}/g, "\n");
    const content = chapterContentDiv.split("\n");

    return {
      title: res.novelTitle,
      content: content,
    };
  }
}
