// ==MiruExtension==
// @name         Hanime
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://hanime.tv/favicon.ico
// @package      hanime.tv
// @type         bangumi
// @webSite      https://apikatsu.otakatsu.studio/api
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async search() {
    // ToDo
  }

  async latest(page) {
    const res = await this.request(`/hanime/recent?page=${page}`);
    return res.reposone.map((item) => ({
      title: item.titles[0],
      url: item.id.toString(),
      cover: item.cover_url,
    }));
  }

  async detail(url) {
    const res = await this.request(`/hanime/details?id=${url}`);
    return {
      title: res.name,
      cover: res.poster,
      desc: res.description,
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: `${res.name}`,
              url: `${res.id}`,
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(`/hanime/link?id=${url}`);
    return {
      type: "hls",
      url: res.data[1].url,
    };
  }
}
