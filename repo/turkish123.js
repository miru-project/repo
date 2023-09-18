// ==MiruExtension==
// @name         Turkish123
// @version      v0.0.1
// @author       OshekharO
// @lang         tr
// @license      MIT
// @package      turkish123
// @type         bangumi
// @icon         https://turkish123.com/wp-content/uploads/favicon.png
// @webSite      https://turkish123.com
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/series-list/");
    const bsxList = await this.querySelectorAll(res, "div.ml-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      //console.log(title+cover+url)
      novel.push({
        title,
        url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/?s=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.ml-item");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title,
        url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const title = await this.querySelector(res, "h1[itemprop=name]").text;
    const cover = await this.querySelector(res, "img[itemprop='image']").getAttributeText("src");
    const desc = await this.querySelector(res, "p.f-desc").text;
    const episodes = [];
    const epiList = await this.querySelectorAll(res, "div.les-content > a");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "a").text;
      const url = await this.getAttributeText(html, "a", "href");

      episodes.push({
        name: name.trim(),
        url,
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

    const dwishLink = res.match(/https:\/\/tukipasti\.[^\s'"]+/);

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
