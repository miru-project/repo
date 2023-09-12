// ==MiruExtension==
// @name         ZeroScans
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://zeroscans.com/favicon.ico
// @package      zeroscans.com
// @type         manga
// @webSite      https://zeroscans.com
// ==/MiruExtension==

export default class extends Extension {
  async search(kw) {
    const res = await this.request(`/swordflake/comic/${kw}`);
    return res.data.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: item.cover.full.replace(/\\\//g, "/"),
    }));
  }

  async latest(page) {
    const res = await this.request(`/swordflake/new-chapters`);
    return res.all.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: item.cover.vertical.replace(/\\\//g, "/"),
    }));
  }

  async detail(url, page) {
    const res = await this.request(`/swordflake/comic/${url}`);
    const id = res.data.id;
    const epres = await this.request(`/swordflake/comic/${id}/chapters?sort=desc&page=${page}`);

    return {
      title: res.data.name,
      cover: res.data.cover.full.replace(/\\\//g, "/"),
      desc: res.data.summary,
      episodes: [
        {
          title: "Directory",
          urls: epres.data.data.map((item) => ({
            name: `Chapter ${item.name}`,
            url: `${item.id}|${url}`,
          })),
        },
      ],
    };
  }

  async watch(url) {
    const [ep, manga] = url.split("|");
    const res = await this.request(`/swordflake/comic/${manga}/chapters/${ep}`);
    return {
      urls: res.data.chapter.high_quality,
    };
  }
}
