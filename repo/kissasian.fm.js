// ==MiruExtension==
// @name         Kissasian
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      kissasian.fm
// @type         bangumi
// @icon         https://kissasian.fm/img/icon/logo-mobile.png
// @webSite      https://kissasian.fm
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/drama-list.html");
    const bsxList = await this.querySelectorAll(res, "div.item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span.title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      //console.log(title+cover+url)
      novel.push({
        title: title.trim(),
        url,
        cover: "https:" + cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/search.html?keyword=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.item");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span.title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover: "https:" + cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request(`${url}`);

    const title = await this.querySelector(res, "a.bigChar").text;
    const cover = await this.querySelector(res, "meta[itemprop='image']").getAttributeText("content");
    const desc = await this.querySelector(res, "p.des").text;
    const episodes = [];
    const epiList = await this.querySelectorAll(res, ".barContentEpisode > ul > li");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "span").text;
      const url = await this.getAttributeText(html, "a", "href");

      episodes.push({
        name: name.trim(),
        url,
      });
    }

    return {
      title: title.trim(),
      cover: "https:" + cover,
      desc,
      episodes: [
        {
          title: "Chapters",
          urls: episodes,
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(`${url}`);
    const dwishLink = res.match(/https:\/\/dwish\.[^\s'"]+/);
  //  console.log(dwishLink);

    const dwishLinkRes = await this.request('', {
      headers: {
        "Miru-Url": dwishLink,
      },
    });

 //   console.log(dwishLinkRes);

    const directUrl = dwishLinkRes.match(/https:\/\/[^.]+\.m3u8[^"]*/);
  
    return {
      type: "hls",
      url: directUrl || "",
    };
  }
}
