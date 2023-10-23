// ==MiruExtension==
// @name         MoviesArc
// @version      v0.0.2
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
    const mov_id = res.details.id.toString()
    const vid_res = await this.req(`/movie/sources/${mov_id}`);
    const re = {
        title: res.details.title,
        cover: "https://image.tmdb.org/t/p/w300/" + res.details.poster_path,
        desc: res.details.overview,
        episodes: vid_res.sources.map((item) => ({
            title: `Server ${item.label}`,
            urls: item.sources.map((item_1) => ({
                name: item_1.quality,
                url: `${item_1.url};/movie/sources/${mov_id}`
            })),
        }))
    }
    return re 
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
    const url_split = url.split(';');
    const res = await this.req(`${url_split[1]}`);
    if (url_split[0].includes("mp4")){
        return {
            type: "mp4",
            url: url_split[0],
            subtitles: res.subtitles.map((item) => ({
              title: item.language,
              url: item.url,
            })),
          };
    }
    return {
      type: "hls",
      url: url_split[0],
      subtitles: res.subtitles.map((item) => ({
        title: item.language,
        url: item.url,
      })),
    };
  }
}