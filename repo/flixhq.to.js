// ==MiruExtension==
// @name         Flixhq
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://flixhq.ws/images/logo.png
// @package      flixhq.to
// @type         bangumi
// @webSite      https://anipuff-consumet.vercel.app/movies/flixhq
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
      title: "FLIXHQ API",
      key: "flixhq",
      type: "input",
      description: "Flixhq Api Url",
      defaultValue: "https://anipuff-consumet.vercel.app/movies/flixhq",
    });
  }

  async latest() {
    const res = await this.req(`/A`);
    const novelPromises = res.results.map(async (item) => {
      const imgResponse = await fetch("https://api.waifu.pics/sfw/waifu");
      const imgData = await imgResponse.json();

      return {
        title: item.title,
        url: item.id,
        cover: imgData.url,
      };
    });

    return Promise.all(novelPromises);
  }

  async detail(url) {
    const res = await this.req(`/info?id=${url}`);
    const imgResponse = await fetch("https://api.waifu.pics/sfw/waifu");
    const imgData = await imgResponse.json();

    return {
      title: res.title,
      cover: imgData.url,
      desc: res.description,
      episodes: [
        {
          title: "Directory",
          urls: res.episodes.map((item) => ({
            name: `${item.title}`,
            url: `${item.id}|${url}`,
          })),
        },
      ],
    };
  }

  async search(kw) {
    const res = await this.req(`/${kw}`);
    const novelPromises = res.results.map(async (item) => {
      const imgResponse = await fetch("https://api.waifu.pics/sfw/waifu");
      const imgData = await imgResponse.json();

      return {
        title: item.title,
        url: item.id,
        cover: imgData.url,
      };
    });

    return Promise.all(novelPromises);
  }

  async watch(url) {
    const [ep, md] = url.split("|");
    const res = await this.req(`/watch?episodeId=${ep}&mediaId=${md}&server=vidcloud`);
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
