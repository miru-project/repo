// ==MiruExtension==
// @name         Omegascans
// @version      v0.0.1
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
    const res = await this.request(
      `/query?query_string=&series_status=All&order=desc&orderBy=total_views&series_type=Comic&page=${page}&perPage=22`
    );
    const latestList = res.data.map((item) => ({
      title: item.title,
      url: item.series_slug,
      cover: item.thumbnail,
    }));

    return latestList;
  }

async search(kw, page) {
  const res = await this.request(
    `/query?query_string=${encodeURIComponent(kw)}&page=${page}`
  );

  const searchList = res.data.map((item) => ({
    title: item.title,
    url: item.series_slug,
    cover: item.thumbnail,
  }));

  return searchList;
}

async detail(url) {
  const res = await this.request(`/series/${url}`);

  const { title, thumbnail: cover, description: desc, seasons } = res;

  const episodes = seasons.map(({ season_name: title, chapters }) => ({
    title,
    urls: chapters.map(({ chapter_name: name, chapter_slug: slug }) => ({
      name,
      url: `${url}/${slug}`,
    })),
  }));

  return {
    title,
    cover,
    desc,
    episodes,
  };
}

  async watch(url) {
    const res = await this.request("/chapter/" + url);
    return {
      urls: res.data,
    };
  }
}
