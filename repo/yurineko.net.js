// ==MiruExtension==
// @name         YuriNeko
// @version      v0.0.1
// @author       OshekharO
// @lang         vi
// @license      MIT
// @icon         https://yurineko.net/img/logo-footer.png
// @package      yurineko.net
// @type         manga
// @webSite      https://api.yurineko.net
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("yurineko"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "YURINEKO API",
      key: "yurineko",
      type: "input",
      description: "YURINEKO API URL",
      defaultValue: "https://api.yurineko.net",
    });
  }

  async latest(page) {
    const res = await this.req(`/lastest2?page=${page}`);
    return res.result.map((item) => ({
      url: "https://yurineko.net/manga/" + item.id,
      title: item.originalName,
      cover: item.thumbnail,
    }));
  }

  async detail(url) {
    const mangaId = url.match(/(\d+)/)[1];
    const res = await this.req(`/manga/${mangaId}`);

    return {
      title: res.originalName,
      cover: res.thumbnail,
      desc: res.description,
      episodes: [
        {
          title: "Chapters",
          urls: res.chapters.reverse().map((item) => ({
            name: `${item.name}`,
            url: `${item.id}|${item.mangaID}`,
          })),
        },
      ],
    };
  }

  async search(kw) {
    const res = await this.req(`/search?query=${kw}`);
    return res.result.map((item) => ({
      title: item.originalName,
      url: "https://yurineko.net/manga/" + item.id,
      cover: item.thumbnail,
    }));
  }

  async watch(url) {
    const [chap, manga] = url.split("|");
    const res = await this.request(`/${manga}/${chap}`, {
      headers: {
        "Miru-Url": "https://yurineko.net/read",
      },
    });

    const jsonData = res.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)[1];
    const parsedData = JSON.parse(jsonData);
    const chapterData = parsedData.props.pageProps.chapterData;

    return {
      urls: chapterData.url.map((item) => item),
    };
  }
}
