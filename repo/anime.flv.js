// ==MiruExtension==
// @name  AnimeFlv
// @version v0.0.2
// @author Yako (koikiss-dev)
// @lang es
// @license      MIT
// @icon https://animeflv.vc/static/img/icon/logo.png
// @package anime.flv
// @type bangumi
// @webSite https://jimov-api.vercel.app/
// @description  This project is an open-source API for retrieving multimedia content such as anime, movies and series, news, and manga in both Spanish and English. https://github.com/koikiss-dev/jimov_api
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("animeflv"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Jimov API",
      key: "animeflv",
      type: "input",
      description: "Multimedia API",
      defaultValue: "https://jimov-api.vercel.app",
    });
  }

  async latest(page) {
    const res = await this.req(
      `/anime/flv/filter?status=En_emision&ord=1&page=${page}`
    );
    return res.results.map((item) => ({
      url: item.url,
      title: item.name,
      cover: item.image.replace("https://img.animeflv.bz", "https://img.animeflv.ws"),
    }));
  }

  async detail(url) {
    const res = await this.req(`${url}`);
    return {
      title: res.name,
      cover: res.image.url,
      desc: res.synopsis,
      episodes: [
        {
          title: "Ep",
          urls: res.episodes.map((item) => ({
            name: `${item.number}`,
            url: item.url,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/anime/flv/filter?title=${kw}&page=${page}`);
    return res.results.map((item) => ({
      title: item.name,
      url: item.url,
      cover: item.image.replace("https://img.animeflv.bz", "https://img.animeflv.ws"),
      desc: item.type,
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
