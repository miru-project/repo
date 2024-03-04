// ==MiruExtension==
// @name         GoGoAnime
// @version      v0.0.5
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://play-lh.googleusercontent.com/MaGEiAEhNHAJXcXKzqTNgxqRmhuKB1rCUgb15UrN_mWUNRnLpO5T1qja64oRasO7mn0
// @package      gogo.anime
// @type         bangumi
// @webSite      https://goraku-api.vercel.app/anime/gogoanime
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("gogoApi"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "GoGo API",
      key: "gogoApi",
      type: "input",
      description: "API URL",
      defaultValue: "https://goraku-api.vercel.app/anime/gogoanime",
    });
    this.registerSetting({
      title: "Preferred quality",
      key: "prefQuality",
      type: "input",
      description: "Choose between 360p/480p/720p/1080p",
      defaultValue: "480p",
    });
  }

  async latest(page) {
    const res = await this.req(`/top-airing?page=${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id,
      cover: item.image,
    }));
  }

  async detail(url) {
    const res = await this.req(`/info/${url}`);
    return {
      title: res.title,
      cover: res.image,
      desc: res.description,
      episodes: [
        {
          title: "Ep",
          urls: res.episodes.map((item) => ({
            name: `Episode ${item.number}`,
            url: item.id,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/${kw}?page=${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id,
      cover: item.image,
    }));
  }

  async watch(url) {
    const quality = await this.getSetting("prefQuality");
    const res = await this.req(`/watch/${url}?server=gogocdn`);
    const prefQuality = res.sources.find(source => source.quality === quality);

    if (prefQuality) {
      return {
        type: "hls",
        url: prefQuality.url,
      };
    } else {
      return {
        type: "hls",
        url: res.sources.pop().url,
      };
    }
  }
}
