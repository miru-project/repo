// ==MiruExtension==
// @name         Myasiantv
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      myasiantv
// @type         bangumi
// @icon         https://myasiantv.ac/favicon.ico
// @webSite      https://myasiantv.ac
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(res, "ul.items > li");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "h2 > a", "href");
      const title = await this.querySelector(html, "h2 > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      //console.log(title+cover+url)
      novel.push({
        title,
        url: 'https://myasiantv.ac' + url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/search.html?key=${kw.replaceAll(" ", "+")}`);
    const bsxList = await this.querySelectorAll(res, "ul.items > li");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "h2 > a", "href");
      const title = await this.querySelector(html, "h2 > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      //console.log(title+cover+url)
      novel.push({
        title,
        url: 'https://myasiantv.ac' + url,
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

    const title = await this.querySelector(res, "div.movie > a > h1").text;
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "div.info").text;
    const episodes = [];
    const epiList = await this.querySelectorAll(res, "ul.list-episode > li");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "h2 > a").text;
      const url = await this.getAttributeText(html, "h2 > a", "href");

      episodes.push({
        name: name.trim(),
        url: 'https://myasiantv.ac' + url,
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
