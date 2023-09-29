// ==MiruExtension==
// @name         YTS.mx
// @version      v0.0.6
// @author       MiaoMint
// @lang         all
// @license      MIT
// @icon         https://yts.mx/assets/images/website/apple-touch-icon-144x144.png
// @package      mx.yts
// @type         bangumi
// @webSite      https://yts.mx
// @description  YTS.mx API is an open source API service for developers to access torrent info
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/api/v2/list_movies.json?page=${page}`);
    return res.data.movies.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: item.medium_cover_image,
    }));
  }

  async detail(url) {
    const res = await this.request(
      `/api/v2/movie_details.json?movie_id=${url}`
    );
    const data = res.data.movie;
    return {
      title: data.title,
      cover: data.medium_cover_image,
      desc: data.description_full,
      episodes: [
        {
          title: "torrents",
          urls: data.torrents.map((item) => ({
            name: `${item.quality} ${item.type}`,
            url: item.url,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.request(
      `/api/v2/list_movies.json?page=${page}&query_term=${kw}`
    );
    return res.data.movies.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: item.medium_cover_image,
    }));
  }

  async watch(url) {
    return {
      type: "torrent",
      url: url,
    };
  }
}
