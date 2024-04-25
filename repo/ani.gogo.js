// ==MiruExtension==
// @name         AniGoGo
// @version      v0.0.3
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://anilist.co/img/icons/apple-touch-icon.png
// @package      ani.gogo
// @type         bangumi
// @webSite      https://api.amvstr.me/api/v2
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
      defaultValue: "https://api.amvstr.me/api/v2",
    });
  }

  async latest() {
    const res = await this.req(`/trending`);
    return res.results.map((item) => ({
      title: item.title.english != null ? item.title.english : "",
      url: item.id.toString(),
      cover: item.coverImage.extraLarge != null ? item.coverImage.extraLarge : "",
    }));
  }

  async detail(url) {
    const res = await this.req(`/info/${url}`);
    const epRes = await this.request(`/episode/${url}`);

    return {
      title: res.title.english != null ? res.title.english : "",
      cover: res.coverImage.large != null ? res.coverImage.large : "",
      desc: res.description != null ? res.description : "",
      episodes: [
        {
          title: "Episodes",
          urls: epRes.episodes.map((item) => ({
            name: item.title != null ? item.title : `Episode ${item.number}`,
            url: item.id != null ? item.id : "",
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
    const res = await this.req(`/stream/${url}`);
    return {
      type: "hls",
      url: res.stream.multi.main.url,
    };
  }
  }
