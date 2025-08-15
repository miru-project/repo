// ==MiruExtension==
// @name         AniLiberty
// @version      v0.0.2
// @author       Virus (viridius-hub)
// @lang         ru
// @license      MIT
// @icon         https://anilibria.top/static/favicon-96x96.png
// @package      aniliberty.top
// @type         bangumi
// @webSite      https://anilibria.top/api/v1
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": "https://anilibria.top/api/v1",
      },
    });
  }

  async load() {

  }

  async latest(page) {
    const res = await this.req(
        `/anime/releases/latest?limit=42`
    );
    return res.results.map((item) => ({
      url: `/anime/releases/${item.alias}`,
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
          title: "Episodes",
          urls: res.episodes.map((item) => ({
            name: `${item.ordinal}`,
            url: item.hls_1080,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/app/search/releases?query=${kw}`);
    return res.results.map((item) => ({
      title: item.name.main,
      url: `/anime/releases/${item.alias}`,
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
