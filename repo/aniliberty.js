// ==MiruExtension==
// @name         AniLiberty
// @version      v0.0.8
// @author       Virus (viridius-hub)
// @lang         ru
// @license      MIT
// @icon         https://anilibria.top/static/favicon-96x96.png
// @package      aniliberty
// @type         bangumi
// @webSite      https://anilibria.top/api/v1
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  domain = 'https://anilibria.top'

  async load() {
    this.registerSetting({
      title: "AniLiberty",
      key: "domain_aniliberty",
      type: "input",
      description: "AniLiberty Domain",
      defaultValue: this.domain,
    });

    this.domain = await this.getSetting("domain_aniliberty")
  }

  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": this.domain,
      },
    });
  }

  async latest(page) {
    const res = await this.req(`/api/v1/anime/releases/latest?limit=42`);

    return res.map((item) => ({
      url: `/api/v1/anime/releases/${item.alias}`,
      title: item.name.main,
      cover: this.domain + item.poster.src,
    }));
  }

  async detail(url) {
    const res = await this.req(`${url}`);
    return {
      title: res.name.main,
      cover: this.domain + res.poster.src,
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
      cover: this.domain + item.poster.src,
      desc: item.description,
    }));
  }

  async watch(url) {
    return {
      type: "hls",
      url: url,
    };
  }
}
