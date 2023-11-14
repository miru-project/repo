// ==MiruExtension==
// @name         Flixhq
// @version      v0.0.3
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://flixhq.ws/images/logo.png
// @package      flixhq.to
// @type         bangumi
// @webSite      https://api-consumet-dki0eyw6n-shirogohan.vercel.app/movies/flixhq
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
      defaultValue: "https://api-consumet-dki0eyw6n-shirogohan.vercel.app/movies/flixhq",
    });
  }

  async latest() {
    const res = await this.req(`/A`);
    return res.results.map((item) => ({
      title: item.title != null ? item.title : "",
      url: item.id,
      cover: item.image != null ? item.image : "",
   }));
  }
  
  async detail(url) {
    const res = await this.req(`/info?id=${url}`);
    
    return {
      title: res.title != null ? res.title : "",
      desc: res.description.trim() != null ? res.description.trim() : "",
      cover: res.image != null ? res.image : "",
      episodes: [
        {
          title: "Directory",
          urls: res.episodes.map((item) => ({
            name: `Watch ${item.title}`,
            url: `${item.id}|${url}`,
          })),
        },
      ],
    };
  }

  async search(kw) {
    const res = await this.req(`/${kw}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id,
      cover: item.image,
   }));
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
