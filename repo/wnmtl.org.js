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
    const res = await this.req(`/books?pageNumber=${page}&pageSize=30`);
    return res.data.list.map((item) => ({
      url: item.id.toString(),
      title: item.title,
      cover: item.coverImgUrl,
    }));
  }

  async detail(url) {
    const res = await this.req(`/books/${url}`);
    const id = res.data.id;
    let page = 1;
    let allEpisodes = [];

    while (true) {
      const epres = await this.req(`/chapters/page?sortDirection=ASC&bookId=${id}&pageNumber=${page}&pageSize=1000`);
      const episodesOnPage = epres.data.list.map((item) => ({
        name: item.title,
        url: item.id.toString(),
      }));

      if (episodesOnPage.length === 0) {
        break;
      }

      allEpisodes = allEpisodes.concat(episodesOnPage);
      page++;
    }

    return {
      title: res.data.title,
      cover: res.data.coverImgUrl,
      desc: res.data.synopsis,
      episodes: [
        {
          title: "Chapters",
          urls: allEpisodes,
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/books/search?keyWord=${kw}&pageNumber=${page}&pageSize=50`);
    return res.data.list.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: item.coverImgUrl,
    }));
  }

  async watch(url) {
    const res = await this.req(`/chapters/${url}`);
    let chapterContentDiv = res.data.content;
    chapterContentDiv = chapterContentDiv.replace(/<\/?p>|<br\s*\/?>/gi, "\n");
    chapterContentDiv = chapterContentDiv.replace(/\n{2,}/g, "\n");
    const content = chapterContentDiv.split("\n");

    return {
      title: res.data.title,
      content: content,
    };
  }
}
