// ==MiruExtension==
// @name         Omegascans
// @version      v0.0.2
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://omegascans.org/icon.png
// @package      omegascans.org
// @type         manga
// @webSite      https://api.omegascans.org
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("omegascans"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Omegascans URL",
      key: "omegascans",
      type: "input",
      description: "api URL for Omegascans",
      defaultValue: "https://api.omegascans.org",
    });
  }

  async latest(page) {
    const res = await this.req(`/query?query_string=&series_status=All&order=desc&orderBy=total_views&series_type=Comic&page=${page}&perPage=20`);
    return res.data.map((item) => ({
      url: item.series_slug,
      title: item.title,
      cover: item.thumbnail,
    }));
  }

  async detail(url) {
    const res = await this.req(`/series/${url}`);
    const id = res.id;
    const epRes = await this.req(`/chapter/query?page=1&perPage=10000&series_id=${id}`);

    return {
      title: res.title,
      cover: res.thumbnail,
      desc: res.description,
      episodes: [
        {
          title: "Chapters",
          urls: epRes.data.map((item) => ({
            name: item.chapter_name != null ? item.chapter_name : `Chapter ${item.title}`,
            url: `${item.series.series_slug}/${item.chapter_slug}`,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/query?query_string=${encodeURIComponent(kw)}&series_status=All&order=desc&orderBy=total_views&series_type=Comic&page=${page}&perPage=20`);
    return res.data.map((item) => ({
      url: item.series_slug,
      title: item.title,
      cover: item.thumbnail,
    }));
  }

  async watch(url) {
    const res = await this.request(`/chapter/${url}`);
    return {
      urls: res.chapter.chapter_data.images,
    };
  }
}
