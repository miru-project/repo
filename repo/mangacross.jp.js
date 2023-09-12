// ==MiruExtension==
// @name         マンガクロス
// @version      v0.0.1
// @author       OshekharO
// @lang         jp
// @license      MIT
// @icon         https://mangacross.jp/favicon.ico
// @package      mangacross.jp
// @type         manga
// @webSite      https://mangacross.jp
// ==/MiruExtension==

export default class extends Extension {
  async search(kw) {
    const res = await this.request(`/api/comics/keywords/${kw}.json`);
    return res.comics.map((item) => ({
      title: item.title,
      url: item.dir_name,
      cover: item.image_url,
    }));
  }

  async latest(page) {
    const res = await this.request(`/api/comics.json?count=30`);
    return res.comics.map((item) => ({
      title: item.title,
      url: item.dir_name,
      cover: item.image_url,
    }));
  }

  async detail(url) {
    const res = await this.request(`/api/comics/${url}.json`);
    return {
      title: res.comic.title,
      cover: res.comic.image_url,
      desc: res.comic.outline,
      episodes: [
        {
          title: "Directory",
          urls: res.comic.episodes.map((item) => ({
            name: `Chapter ${item.volume}`,
            url: item.page_url,
          })),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(`/${url}/viewer.json`);
    return {
      urls: res.episode_pages.map((item) => item.image.pc_url),
    };
  }
}
