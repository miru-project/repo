// ==MiruExtension==
// @name         Hanime
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://hanime.tv/favicon.ico
// @package      hanime.tv
// @type         bangumi
// @webSite      https://apikatsu.otakatsu.studio/api
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async search(kw) {
    const requestBody = {
      search_text: kw,
      tags: [],
      tags_mode: "AND",
      brands: [],
      blacklist: [],
      order_by: "created_at_unix",
      ordering: "desc",
      page: 0,
    };

    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://search.htv-services.com/",
      },
      data: requestBody,
      method: "post",
    });

    const mangaList = [];

    const hitsArray = JSON.parse(res.hits);

    for (const comic of hitsArray) {
      const id = comic.id;
      const title = comic.name;
      if (!title || !comic.cover_url) continue;

      mangaList.push({
        title: title,
        url: id.toString(),
        cover: comic.cover_url,
      });
    }

    return mangaList;
  }

  async latest(page) {
    const res = await this.request(`/hanime/recent?page=${page}`);
    return res.reposone.map((item) => ({
      title: item.name,
      url: item.id.toString(),
      cover: item.cover_url,
    }));
  }

  async detail(url) {
    const res = await this.request(`/hanime/details?id=${url}`);
    const epRes = await this.request(`/hanime/link?id=${url}`);

    return {
      title: res.name,
      cover: res.poster,
      desc: res.description,
      episodes: [
        {
          title: "Episodes",
          urls: epRes.data
            .filter((item) => item.is_guest_allowed !== false)
            .map((item) => ({
              name: item.filename != null ? item.filename : `Quality ${item.height}`,
              url: item.url != null ? item.url : "",
            })),
        },
      ],
    };
  }

  async watch(url) {
    return {
      type: "hls",
      url: url,
    };
  }
}
