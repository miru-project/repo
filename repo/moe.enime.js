// ==MiruExtension==
// @name         Enime
// @version      v0.0.5
// @author       MiaoMint
// @lang         all
// @license      MIT
// @icon         https://avatars.githubusercontent.com/u/74993083?s=200&v=4
// @package      moe.enime
// @type         bangumi
// @webSite      https://api.enime.moe
// @description  Enime API is an open source API service for developers to access anime info (as well as their video sources) https://github.com/Enime-Project/api.enime.moe
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("enimeApi"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Enime API",
      key: "enimeApi",
      type: "input",
      description: "Enime Api Url",
      defaultValue: "https://api.enime.moe",
    });
    this.registerSetting({
      title: "Use nade.me Proxy",
      key: "nadeProxy",
      type: "toggle",
      description: "Use nade.me Proxy",
      defaultValue: "true",
    });
  }

  async latest(page) {
    const res = await this.req(`/recent?page=${page}`);
    return res.data.map((item) => ({
      title: item.anime.title.native,
      url: item.animeId,
      cover: item.anime.coverImage,
      desc: item.description,
      update: item.number.toString(),
    }));
  }

  async detail(url) {
    const res = await this.req(`/anime/${url}`);
    return {
      title: res.title.native,
      cover: res.coverImage,
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
    const res = await this.req(`/search/${kw}?page=${page}`);
    return res.data.map((item) => ({
      title: item.title.native,
      url: item.id,
      cover: item.coverImage,
      desc: item.description,
      update: item.currentEpisode.toString(),
    }));
  }

  async watch(url) {
    const res = await this.req(`/episode/${url}`);

    const getM3u8 = async (sourcesId) => {
      const res = await this.req(`/source/${sourcesId}`);
      if ((await this.getSetting("nadeProxy")) == "true") {
        const url = await (
          await fetch("https://enime.moe/api/generate-cdn", {
            method: "POST",
            body: sourcesId,
          })
        ).text();
        console.log(url);
        return url;
      }
      return res.url;
    };

    return {
      type: "hls",
      url: await getM3u8(res.sources[0].id),
      controls: [
        {
          name: "source",
          html: "Source",
          position: "right",
          selector: res.sources.map((item) => ({
            name: item.id,
            html: item.url,
          })),
          onSelect: async function (item) {
            const m3u8 = await getM3u8(item.name);
            this.switchUrl(m3u8);
          },
        },
      ],
    };
  }
}
