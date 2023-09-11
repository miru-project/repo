// ==MiruExtension==
// @name         Unimay
// @version      v0.0.1
// @author       CakesTwix
// @lang         uk
// @license      GPL3
// @icon         https://www.google.com/s2/favicons?domain=unimay.media&sz=256
// @package      unimay.media
// @type         bangumi
// @webSite      https://api.unimay.media
// ==/MiruExtension==

export default class extends Extension {

    async req(url) {
    return this.request(url, {
        headers: {
        "Miru-Url": await this.getSetting("unimay"),
        },
    });
  }

  async load() {
    this.registerSetting({
      title: "Unimay API",
      key: "unimay",
      type: "input",
      description: "Unimay API",
      defaultValue: "https://api.unimay.media",
    });
  }

  async latest(page) {
    const res = await this.req(`/api/release/all?page=${page}`);
    return res.releases.map((item) => ({
      title: item.name,
      url: `/api/release/${item.code}`,
      cover: `https://api.unimay.media/storage/images/${item.imageId}`,
    }));
  }

  async detail(url) {
    const res = await this.req(url);

    return {
        title: res.name,
        cover: `https://api.unimay.media/storage/images/${res.imageId}`,
        desc: res.description,
        episodes: [{
            title: "Епізоди",
            urls: res.playlist.map((item) => ({
                name: `${item.title}`,
                url: item.playlist,
          })),
        },],
      };
  }

  async search(kw, page) {
    const res = await this.req(`/api/release/search/?title=${kw}&page=${page}`);
    return res.releases.map((item) => ({
      title: item.name,
      url: `/api/release/${item.code}`,
      cover: `https://api.unimay.media/storage/images/${item.imageId}`,
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