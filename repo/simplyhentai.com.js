// ==MiruExtension==
// @name         SimplyHentai
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://www.simply-hentai.com/favicon.ico
// @package      simplyhentai.com
// @type         manga
// @webSite      https://api.simply-hentai.com/v3
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async search(kw) {
    const res = await this.request(`/search/complex?query=${kw}`);

    const mangaList = res.data.map((item) => ({
      title: item.object.title,
      url: item.object.slug,
      cover: item.object.preview.sizes.thumb,
    }));

    return mangaList;
  }

  async latest() {
    const res = await this.request(`/albums`);
    return res.data.map((item) => ({
      title: item.title,
      url: item.slug,
      cover: item.preview.sizes.thumb,
    }));
  }

  async detail(url) {
    const res = await this.request(`/manga/${url}`);

    return {
      title: res.meta.title,
      cover: res.data.preview.sizes.thumb,
      desc: res.meta.description,
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: `${res.meta.title}`,
              url: `${res.util.host}|${url}`,
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    const [img, id] = url.split("|");
    const res = await this.request(`/manga/${id}/pages`);

    if (res.data.pages && Array.isArray(res.data.pages)) {
      return {
        urls: res.data.pages.map((item) => item.sizes.full),
      };
    } else {
      return {
        error: "Invalid data format for pages",
      };
    }
  }
}
