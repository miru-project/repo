// ==MiruExtension==
// @name         Aniwatch
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://aniwatch.to/images/android-chrome-512x512.png
// @package      ani.watch
// @type         bangumi
// @webSite      https://api-aniwatch.onrender.com/anime
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("aniwatch"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Aniwatch API",
      key: "aniwatch",
      type: "input",
      description: "Aniwatch Api Url",
      defaultValue: "https://api-aniwatch.onrender.com/anime",
    });
  }

  async latest() {
    const res = await this.req(`/home`);
    return res.spotlightAnimes.map((item) => ({
      title: item.name,
      url: item.id,
      cover: item.poster,
    }));
  }

  async detail(url) {
    const res = await this.req(`/info?id=${url}`);
    const epRes = await this.req(`/episodes/${url}`);
    return {
      title: res.anime.info.name,
      cover: res.anime.info.poster,
      desc: res.anime.info.description,
      episodes: [
        {
          title: "Ep",
          urls: epRes.episodes.map((item) => ({
            name: `Episode ${item.number}`,
            url: item.episodeId,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/search?q=${kw}&page=${page}`);
    return res.animes.map((item) => ({
      title: item.name,
      url: item.id,
      cover: item.poster,
    }));
  }

  async watch(url) {
    const res = await this.req(
      `/episode-srcs?id=${url}&server=vidstreaming&category=sub`
    );
    return {
      type: "hls",
      url: res.sources[0].url,
      subtitles: res.subtitles.map((item) => ({
        title: item.lang,
        url: item.url,
      })),
    };
  }
}
