// ==MiruExtension==
// @name         DramaCool
// @version      v0.0.3
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://proxy.techzbots1.workers.dev/?u=https://dramacool.pa/images/mobi/logo.png
// @package      dramacool.pa
// @type         bangumi
// @webSite      https://proxy.techzbots1.workers.dev/?u=https://nontan-source-kgw9jch3s-imkryp70n.vercel.app/movies/dramacool
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("dramacool"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Dramacool API",
      key: "dramacool",
      type: "input",
      description: "Dramacool Api Url",
      defaultValue: "https://proxy.techzbots1.workers.dev/?u=https://nontan-source-kgw9jch3s-imkryp70n.vercel.app/movies/dramacool",
    });
  }

  async latest() {
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://proxy.techzbots1.workers.dev/?u=https://dramacool.pa/most-popular-drama",
      },
    });
    const bsxList = await this.querySelectorAll(res, "ul.switch-block.list-episode-item > li");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-original");
      //console.log(title+cover+url)
      novel.push({
        title,
        url: url.replace("https://dramacool.pa/", ""),
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.req(`/info?id=${url}`);
    return {
      title: res.title,
      cover: res.image,
      desc: res.description,
      episodes: [
        {
          title: "Directory",
          urls: res.episodes.map((item) => ({
            name: item.title,
            url: item.id,
          })),
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/${kw}?page=${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id,
      cover: item.image,
    }));
  }

  async watch(url) {
    const res = await this.req(`/watch?episodeId=${url}&server=streamsb`);
    return {
      type: "hls",
      url: res.sources[0].url,
    };
  }
}
