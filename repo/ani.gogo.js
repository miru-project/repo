// ==MiruExtension==
// @name         AniGoGo
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://anilist.co/img/icons/apple-touch-icon.png
// @package      ani.gogo
// @type         bangumi
// @webSite      https://api-amvstrm.nyt92.eu.org/api/v2
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("amvstrm"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Amvstrm API",
      key: "amvstrm",
      type: "input",
      description: "Amvstrm Api Url",
      defaultValue: "https://api-amvstrm.nyt92.eu.org/api/v2",
    });
  }

  async latest(page) {
    const res = await this.req(`/trending?limit=15&p=${page}`);
    return res.results.map((item) => ({
      title: item.title.english,
      url: item.id.toString(),
      cover: item.coverImage.extraLarge,
    }));
  }

  async detail(url) {
    const res = await this.req(`/info/${url}`);
    const epRes = await this.req(`/episode/${url}?dub=false`);
    return {
      title: res.title.english,
      cover: res.coverImage.large,
      desc: res.description,
      episodes: [
        {
          title: "Episodes",
          urls: epRes.episodes.map((item) => ({
            name: item.title,
            url: item.id,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
  const res = await this.req(`/search?q=${kw}&p=${page}&limit=10`);
  return res.results.map((item) => {
    const title = item.title && item.title.english ? item.title.english : "N/A";
    const cover = item.coverImage && item.coverImage.large ? item.coverImage.large : "N/A";
    
    return {
      title,
      url: item.id.toString(),
      cover,
    };
  });
}

  async watch(url) {
    const res = await this.req( `/stream/${url}`);
   return {
      type: "hls",
      url: res.stream.multi.main.url,
    };
  }
}
