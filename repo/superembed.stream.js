// ==MiruExtension==
// @name         SuperEmbed M
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://www.superembed.stream/favicon.ico
// @package      superembed.stream
// @type         bangumi
// @webSite      https://api.themoviedb.org/3
// ==/MiruExtension==

export default class extends Extension {
  async search(kw, page) {
    const res = await this.request(`/search/movie?api_key=c2facfc70a02549f7258e485c0fd73cc&query=${kw}&page=${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: `https://image.tmdb.org/t/p/w1280${item.poster_path}`,
    }));
  }

  async latest(page) {
    const res = await this.request(`/trending/movie/week?api_key=c2facfc70a02549f7258e485c0fd73cc&page=${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: `https://image.tmdb.org/t/p/w1280${item.poster_path}`,
    }));
  }

  async detail(url) {
    const res = await this.request(`/movie/${url}?api_key=c2facfc70a02549f7258e485c0fd73cc&language=en-US`);
    return {
      title: res.original_title,
      cover: `https://image.tmdb.org/t/p/w1280${res.backdrop_path}`,
      desc: res.overview,
    };
  }

  async watch(url) {
    const videoUrl = `https://multiembed.mov/directstream.php?video_id=${url}&tmdb=1`;
    return {
      type: "hls",
      url: videoUrl,
    };
  }
}
