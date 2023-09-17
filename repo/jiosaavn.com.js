// ==MiruExtension==
// @name         JioSaavn
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://staticfe.saavn.com/web6/jioindw/dist/1694666047/_i/favicon.ico
// @package      jiosaavn.com
// @type         bangumi
// @webSite      https://saavn.me
// ==/MiruExtension==

export default class extends Extension {
  async search(kw, page) {
    const res = await this.request(`/search/songs?query=${kw}&page=${page}&limit=10`);

    const songList = res.data.results.map((item) => ({
      title: item.name,
      url: item.url,
      cover: item.image?.[2]?.link || "",
    }));

    return songList;
  }

  async latest() {
    const res = await this.request(`/modules?trending`);
    return res.data.albums
      .filter((item) => item.url.includes("song"))
      .map((item) => ({
        title: item.name,
        url: item.url,
        cover: item.image?.[2]?.link || "",
      }));
  }

  async detail(url) {
  const res = await this.request(`/songs?link=${url}`);
  if (res.data.length > 0) {
    const item = res.data[0];
    const downloadUrls = item.downloadUrl || [];
    return {
      title: item.name || '',
      cover: (item.image && item.image[2] && item.image[2].link) || '',
      desc: item.label || '',
      episodes: [
        {
          title: "Episodes",
          urls: downloadUrls.map((downloadItem) => ({
            name: downloadItem.quality || '',
            url: downloadItem.link || '',
          })),
        },
      ],
    };
  } else {
    return {};
  }
}

  async watch(url) {
    return {
      type: "hls",
      url: url,
    };
  }
}
