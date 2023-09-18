// ==MiruExtension==
// @name         Aniwatch
// @version      v0.0.2
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://aniwatch.to/images/android-chrome-512x512.png
// @package      ani.watch
// @type         bangumi
// @webSite      https://api.consumet.org/anime/zoro
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("zoro"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Zoro API",
      key: "zoro",
      type: "input",
      description: "Zoro Api Url",
      defaultValue: "https://api.consumet.org/anime/zoro",
    });
  }

  async latest() {
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://aniwatch.to/most-popular",
      },
    });
    const bsxList = await this.querySelectorAll(res, "div.flw-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      //console.log(title+cover+url)
      novel.push({
        title,
        url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.req(`/info?id=${url}`);
    return {
      title: res.title,
      cover: res.image,
      desc: res.description,
      episodes: [
        {
          title: "Directory",
          urls: res.episodes.map((item) => ({
            name: item.title,
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
    const res = await this.req(`/watch?episodeId=${url}&server=vidcloud`);
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
