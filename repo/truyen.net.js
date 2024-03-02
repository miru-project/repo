// ==MiruExtension==
// @name         NetTruyen
// @version      v0.0.5
// @author       OshekharO
// @lang         vi
// @license      MIT
// @icon         https://st.nettruyenus.com/data/logos/logo-nettruyen.png
// @package      truyen.net
// @type         manga
// @webSite      https://comics-api.vercel.app
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("truyen"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Truyen API",
      key: "truyen",
      type: "input",
      description: "Truyen Api Url",
      defaultValue: "https://comics-api.vercel.app",
    });
  }

  async latest(page) {
    const res = await this.req(`/trending-comics?page=${page}`);
    return res.comics.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: item.thumbnail,
    }));
  }

  async detail(url) {
    const [id, chapter] = url.split("|");
    const res = await this.req(`/comics/${id}`);

    // Reverse the order of chapters to load in ascending order
    const reversedChapters = [...res.chapters].reverse();

    return {
      title: res.title,
      cover: res.thumbnail,
      desc: res.description,
      episodes: [
        {
          title: "Chapters",
          urls: reversedChapters.map((item) => ({
            name: `Chapter ${item.name}`,
            url: `${id}|${item.id}`,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/search?q=${kw}&page=${page}`);
    return res.comics.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: item.thumbnail,
    }));
  }

  async watch(url) {
    const [id, chapter] = url.split("|");
    const res = await this.request(`/comics/${id}/chapters/${chapter}`);
    return {
      urls: res.images.map((item) => item.src),
    };
  }
}
