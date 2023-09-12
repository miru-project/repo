// ==MiruExtension==
// @name         HentaiDexy
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://s1.cdnimg.me:9000/hentaidexy/opengraph-image.png
// @package      hentaidexy.net
// @type         manga
// @webSite      https://backend.hentaidexy.net
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async search(kw) {
    const res = await this.request(`/api/v1/mangas?page=$page&altTitles=${kw}&sort=createdAt`);
    return res.mangas.map((item) => ({
      title: item.title,
      url: item._id,
      cover: item.coverImage.replace("https://f004.backblazeb2.com/file/", "https://s1.cdnimg.me:9000/"),
    }));
  }

  async latest(page) {
    const res = await this.request(`/api/v1/mangas?page=${page}&limit=20`);
    return res.mangas.map((item) => ({
      title: item.title,
      url: item._id,
      cover: item.coverImage,
    }));
  }

  async detail(url, page) {
    const res = await this.request(`/api/v1/mangas/${url}`);
    const id = res.manga._id;
    const epres = await this.request(`/api/v1/mangas/${id}/chapters?sort=-serialNumber&limit=100&page=${page}`);
    return {
      title: res.manga.title,
      cover: res.manga.coverImage,
      desc: res.manga.summary,
      episodes: [
        {
          title: "Directory",
          urls: epres.chapters.map((item) => ({
            name: `Chapter ${item.serialNumber}`,
            url: item._id,
          })),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(`/api/v1/chapters/${url}`);
    return {
      urls: res.chapter.images,
    };
  }
}
