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
    const Epres = await this.request(`/manga/${url}/pages`);

    return {
      title: res.meta.title,
      cover: res.data.preview.sizes.thumb,
      desc: res.meta.description,
      episodes: [
        {
          title: "Directory",
          urls: Epres.data.pages.map((item) => ({
            name: `Page ${item.page_num}`,
            url: item.sizes.thumb,
          })),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "miru-url": url,
      },
    });

    return {
      url: url,
    };
  }
}
