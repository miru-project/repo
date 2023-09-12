// ==MiruExtension==
// @name         Wnmtl
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://wnmtl.com/logo.png
// @package      wnmtl.org
// @type         fikushon
// @webSite      https://api.mystorywave.com/story-wave-backend/api/v1/content
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("mystorywave"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "MYSTORYWAVE API",
      key: "mystorywave",
      type: "input",
      description: "MYSTORYWAVE API URL",
      defaultValue: "https://api.mystorywave.com/story-wave-backend/api/v1/content",
    });
  }

  async latest(page) {
    const res = await this.req(`/books?pageNumber=${page}&pageSize=10`);
    return res.data.list.map((item) => ({
      url: item.id.toString(),
      title: item.title,
      cover: item.coverImgUrl,
    }));
  }

  async detail(url, page) {
    const res = await this.req(`/books/${url}`);
    const id = res.data.id;
    const epRes = await this.req(`/chapters/page?sortDirection=ASC&bookId=${id}&pageNumber=${page}&pageSize=1000`);
    return {
      title: res.data.title,
      cover: res.data.coverImgUrl,
      desc: res.data.synopsis,
      episodes: [
        {
          title: "Chapters",
          urls: epRes.data.list.map((item) => ({
            name: item.title,
            url: item.id,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/books/search?keyWord=${kw}&pageNumber=${page}&pageSize=12`);
    return res.data.list.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: item.coverImgUrl,
    }));
  }

  async watch(url) {
    const [ep, novel] = url.split("|");
    const res = await this.req(`/chapters/${novel}/${ep}`);
    let chapterContentDiv = res.data.content;
    chapterContentDiv = chapterContentDiv.replace(/<\/p><br>|<\/p><br \/>/g, "");
    const content = chapterContentDiv.split("<p>");

    return {
      title: res.data.title,
      content: content,
    };
  }
}
