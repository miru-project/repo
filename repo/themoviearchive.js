// ==MiruExtension==
// @name         MoviesArc
// @version      v0.0.3
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg
// @package      themoviearchive
// @type         bangumi
// @webSite      https://api.themoviedb.org/3
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
      defaultValue: "https://api.themoviedb.org/3",
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
    const res = await this.req(`/movie/${url}?language=en-US&api_key=9990db75d12d4ecd4ed84628ebc96403`);
    return {
      title: res.title,
      cover: "https://image.tmdb.org/t/p/w300" + res.poster_path,
      desc: res.overview,
      episodes: [
        {
          title: "Ep",
          urls: [
            {
              name: `Watch ${res.title}`,
              url: res.id.toString(),
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
    const res = await this.request(`${url}`, {
      headers: {
        "Miru-Url": "https://vidsrc-api-js-eosin.vercel.app/vidsrc/",
      },
    });
    return {
      type: "hls",
      url: res.sources[0].url,
    };
  }
}
