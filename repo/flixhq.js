// ==MiruExtension==
// @name         FlixHQ
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://flixhq.vip/wp-content/uploads/2024/04/flixhq-logo-2.png
// @package      flixhq
// @type         bangumi
// @webSite      https://consumet8.vercel.app/movies/flixhq
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("flixhq"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Flixhq API",
      key: "flixhq",
      type: "input",
      description: "Flixhq Api Url",
      defaultValue: "https://consumet8.vercel.app/movies/flixhq",
    });
  }

  async latest() {
    const res = await this.req(`/trending`);
    return res.results.map((item) => ({
      title: item.title != null ? item.title : "",
      url: item.id.toString(),
      cover: item.image != null ? item.image : "",
    }));
  }

  async detail(url) {
    const res = await this.req(`/info?id=${url}`);

    return {
      title: res.title != null ? res.title : "",
      cover: res.cover != null ? res.cover : "",
      desc: res.description != null ? res.description : "",
      episodes: [
        {
          title: "Episodes",
          urls: res.episodes.map((item) => ({
            name: item.title,
            url: `${item.id.toString()};${url}`,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/${kw}?page=${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: item.image,
    }));
  }

  async watch(url) {
    const res = await this.req(`/watch?episodeId=${url.split(";")[0]}&mediaId=${url.split(";")[1]}`);
    return {
      type: "hls",
      url: res.sources[0].url,
      subtitles: res.subtitles.map((item) => ({
        title: item.lang,
        url: item.url,
        language: item.lang,
      })),
    };
  }
}
