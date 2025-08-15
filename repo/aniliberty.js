// ==MiruExtension==
// @name  AniLiberty
// @version v0.0.1
// @author Virus (viridius-hub)
// @lang ru
// @license      MIT
// @icon https://anilibria.top/static/favicon.svg
// @package aniliberty.top
// @type bangumi
// @webSite https://anilibria.top.
// @description  This project is an open source API for searching multimedia content such as anime, movies and TV series, and news in Russian.
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("aniliberty"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Aniliberty API",
      key: "aniliberty",
      type: "input",
      description: "Aniliberty API",
      defaultValue: "https://anilibria.top",
    });
  }

  async latest(page) {
    const res = await this.req(
        `/api/v1/anime/releases/latest?limit=42`
    );
    return res.results.map((item) => ({
      url: `/api/v1/anime/releases/${item.alias}`,
      title: item.name.main,
      cover: item.poster.src,
    }));
  }

  async detail(url) {
    const res = await this.req(`${url}`);
    return {
      title: res.name.main,
      cover: res.poster.src,
      desc: res.description,
      episodes: [
        {
          title: "Ep",
          urls: res.episodes.map((item) => ({
            name: `${item.ordinal}`,
            url: item.hls_1080,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/api/v1/app/search/releases?query=${kw}`);
    return res.results.map((item) => ({
      title: item.name.main,
      url: `/api/v1/anime/releases/${item.alias}`,
      cover: item.poster.src,
      desc: item.description,
    }));
  }

  async watch(url) {
    const res = await this.req(`${url}`);
    const srv = Object.values(res.servers).filter(
      (server) => server.name === "Our Server"
    );
    return {
      type: "hls",
      url: srv[0].file_url,
    };
  }
}
