// ==MiruExtension==
// @name         MoviesArc
// @version      v0.0.2
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://themoviearchive.site/favicons/apple-touch-icon.png
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
    this.registerSetting({
      title: "Preferred quality",
      key: "prefQuality",
      type: "input",
      description: "Choose between 360/480/720/1080",
      defaultValue: "auto",
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
  const quality = await this.getSetting("prefQuality");
  const res = await this.request(`tmdbId=${url}`, {
    headers: {
      "Miru-Url": "https://flixquest-api.vercel.app/vidsrcto/watch-movie?",
    },
  });

  // Check if sources are empty
  if (!res.sources.length) {
    const proxiedRes = await this.request(`tmdbId=${url}&proxied=true`, {
      headers: {
        "Miru-Url": "https://flixquest-api.vercel.app/showbox/watch-movie?",
      },
    });

    if (!proxiedRes.sources.length) {
      throw new Error("No sources available");
    }

    return {
      type: "mp4",
      url: proxiedRes.sources.pop().url,
      subtitles: proxiedRes.subtitles.map((item) => ({
        title: item.lang,
        url: item.url,
        language: item.lang,
      })),
    };
  }

  const prefQuality = res.sources.find((source) => source.quality === quality);

  if (prefQuality) {
    return {
      type: "hls",
      url: prefQuality.url,
    };
  } else {
    return {
      type: "mp4",
      url: res.sources.pop().url,
      subtitles: res.subtitles.map((item) => ({
        title: item.lang,
        url: item.url,
        language: item.lang,
      })),
    };
  }
}}
