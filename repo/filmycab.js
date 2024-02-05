// ==MiruExtension==
// @name         FilmyCab
// @version      v0.0.1
// @author       OshekharO
// @lang         hi
// @license      MIT
// @package      filmycab
// @type         bangumi
// @icon         https://i.postimg.cc/SNhTmxT5/FilmyCab.png
// @webSite      https://filmycab.skin
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/?to-page=${page}`);
    const bsxList = await this.querySelectorAll(res, "div.artist-mv > table");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "a > font").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      //console.log(title+cover+url)
      novel.push({
        title,
        url: "https://filmycab.skin" + url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/site-search.html?to-search=${kw}`);
    const bsxList = await this.querySelectorAll(res, ".home-wrapper.thumbnail-wrapper > div.thumb.rsz");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "a > p").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      //console.log(title+cover+url)
      novel.push({
        title,
        url: "https://filmycab.skin" + url,
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

    const title = await this.querySelector(res, "meta[property='og:title']").getAttributeText("content");
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "div.info").text;
    const linkmake = await this.getAttributeText(res, "div.dlbtn > a", "href");

    const ses = await this.request("", {
      headers: {
        "Miru-Url": linkmake,
      },
    });
    const episodes = [];
    const epiList = await this.querySelectorAll(ses, "div.dlink.dl");

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

    const dwishLink = res.match(/https:\/\/fastxyz\.[^\s'"]+/);

    const dwishLinkRes = await this.request("", {
      headers: {
        "Miru-Url": dwishLink,
        "Miru-Referer": dwishLink,
      },
    });
    const fast = await this.getAttributeText(dwishLinkRes, "span.flb_download_buttons > a", "href");
    const LinkRes = await this.request("", {
      headers: {
        "Miru-Url": fast,
        "Miru-Referer": fast,
      },
    });
    const directUrlMatch = LinkRes.match(/(https:\/\/[^\s'"]*\.mkv[^\s'"]*)/);
    const directUrl = directUrlMatch ? directUrlMatch[0] : "";

    return {
      type: "hls",
      url: directUrl || "",
    };
  }
}
