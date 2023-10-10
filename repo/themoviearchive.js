// ==MiruExtension==
// @name         MoviesArc
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://themoviearchive.site/favicons/apple-touch-icon.png
// @package      themoviearchive
// @type         bangumi
// @webSite      https://prod.omega.themoviearchive.site/v3
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("moviesarc"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "MoviesArc API",
      key: "moviesarc",
      type: "input",
      description: "MoviesArc Api Url",
      defaultValue: "https://prod.omega.themoviearchive.site/v3",
    });
  }

  async latest() {
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://api.themoviedb.org/3/trending/movie/day?language=en-US&api_key=9990db75d12d4ecd4ed84628ebc96403",
      },
    });
    return res.results.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: "https://image.tmdb.org/t/p/w300/" + item.poster_path,
    }));
  }

  async detail(url) {
    const res = await this.req(`/movie/details/${url}`);
    return {
      title: res.details.title,
      cover: "https://image.tmdb.org/t/p/w300/" + res.details.poster_path,
      desc: res.details.overview,
      episodes: [
        {
          title: "Watch",
          urls: [
            {
              name: res.details.title,
              url: res.details.id.toString(),
            },
          ],
        },
      ],
    };
  }

  async search(kw) {
    const res = await this.request(`query=${kw}&include_adult=false&language=en-US&page=1&region=US&api_key=9990db75d12d4ecd4ed84628ebc96403`, {
      headers: {
        "Miru-Url": "https://api.themoviedb.org/3/search/movie?",
      },
    });

    return res.results.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: "https://image.tmdb.org/t/p/w300" + item.poster_path,
    }));
  }

  async watch(url) {
    const res = await this.req(`/movie/sources/${url}`);
    return {
      type: "hls",
      url: res.sources[0].sources[0].url,
      subtitles: res.subtitles.map((item) => ({
        title: item.language,
        url: item.url,
      })),
    };
  }
}
