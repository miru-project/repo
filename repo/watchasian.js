// ==MiruExtension==
// @name         WatchAsian
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      watchasian
// @type         bangumi
// @icon         https://www.watchasian.sk/favicon.png
// @webSite      https://www.watchasian.sk
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/most-popular-drama?page=${page}`);
    const bsxList = await this.querySelectorAll(res, "ul.switch-block > li");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "a > h3").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-original");
      //console.log(title+cover+url)
      novel.push({
        title: title.trim(),
        url: 'https://www.watchasian.sk' + url,
        cover,
      });
    }
    return novel;
  }

  async search(kw, page) {
    const res = await this.request(`/search?type=movies&keyword=${kw.replaceAll(" ", "+")}&page=${page}`);
    const bsxList = await this.querySelectorAll(res, "ul.switch-block > li");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "a > h3").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-original");
      //console.log(title+cover+url)
      novel.push({
        title: title.trim(),
        url: 'https://www.watchasian.sk' + url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request('', {
        headers: {
            "Miru-Url": url,
        },
    });

    const title = await this.querySelector(res, "h1").text;
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "div.info").text;
    const episodes = [];
    const epiList = await this.querySelectorAll(res, "ul.list-episode-item-2 > li");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "a > h3").text;
      const url = await this.getAttributeText(html, "a", "href");

      episodes.push({
        name: name.trim(),
        url: 'https://www.watchasian.sk' + url,
      });
    }

    return {
      title: title.trim(),
      cover,
      desc: desc.trim(),
      episodes: [
        {
          title: "Directory",
          urls: episodes.reverse(),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });
    
    const dwishLink = res.match(/https:\/\/dwish\.[^\s'"]+/);

    const dwishLinkRes = await this.request("", {
      headers: {
        "Miru-Url": dwishLink,
      },
    });

    const directUrlMatch = dwishLinkRes.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
    const directUrl = directUrlMatch ? directUrlMatch[0] : "";

    return {
      type: "hls",
      url: directUrl || "",
    };
  }
}
