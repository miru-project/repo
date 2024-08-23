// ==MiruExtension==
// @name         次元城动漫
// @version      v1.0.0
// @author       hualiang
// @lang         zh
// @license      MIT
// @icon         https://www.cycanime.com/upload/site/20240319-1/25e700991446a527804c82a744731b60.png
// @package      cycanime.com
// @type         bangumi
// @webSite      https://www.cycanime.com
// @nsfw         false
// ==/MiruExtension==
export default class extends Extension {
  async load() {
    this.base64decode = (str) => {
      var base64DecodeChars = [
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59,
        60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
        43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1,
      ];
      var c1, c2, c3, c4;
      var i, len, out;
      len = str.length;
      i = 0;
      out = "";
      while (i < len) {
        do {
          c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1) break;
        do {
          c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1) break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        do {
          c3 = str.charCodeAt(i++) & 0xff;
          if (c3 == 61) return out;
          c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1) break;
        out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));
        do {
          c4 = str.charCodeAt(i++) & 0xff;
          if (c4 == 61) return out;
          c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1) break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
      }
      return out;
    };
    this.querySelector = async (content, selector) => {
      const res = await this.querySelectorAll(content, selector);
      return res === null ? null : res[0];
    };
    this.text = (element) => {
      const match = element.content.match(/<[^>]+>([^<]+)<\/[^>]+>/);
      return !match ? "" : match[1].trim();
    };
  }

  async search(kw, page) {
    const res = await this.request(`/search/wd/${encodeURI(kw)}/page/${page}.html`);
    const bsxList = await this.querySelectorAll(res, "div.search-box");
    if (bsxList === null) {
      return [];
    }
    const videos = [];
    for (const e of bsxList) {
      const label = await this.querySelector(e.content, ".public-list-exp");
      const title = this.text(await this.querySelector(e.content, ".right .thumb-txt"));
      const cover = await this.getAttributeText(label.content, "img.gen-movie-img", "data-src");
      const update = this.text(await this.querySelector(label.content, "span.public-list-prb"));
      const url = `${await label.getAttributeText("href")}|${title}|${cover}`;
      videos.push({ title, url, cover, update });
    }
    return videos;
  }

  async latest(page) {
    if (page > 1) {
      return [];
    }
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(res, `#week-module-${new Date().getDay()} .public-list-box`);
    if (bsxList === null) {
      return [];
    }
    const videos = [];
    for (const e of bsxList) {
      const label = await this.querySelector(e.content, ".public-list-exp");
      const cover = await this.getAttributeText(label.content, "img.gen-movie-img", "data-src");
      const update = this.text(await this.querySelector(e.content, "div.public-list-subtitle"));
      const title = await label.getAttributeText("title");
      const url = `${await label.getAttributeText("href")}|${title}|${cover}`;
      videos.push({ title, url, cover, update });
    }
    return videos;
  }

  async detail(str) {
    const data = str.split("|");
    const res = await this.request(data[0]);
    const info = await this.querySelectorAll(res, ".slide-info");
    const metadata = new Map();
    info.shift();
    for (const e of info) {
      const key = this.text(await this.querySelector(e.content, "strong")).slice(0, -1);
      const value = (await this.querySelectorAll(e.content, "a")).map(this.text).join(" ");
      metadata.set(key, value);
    }
    const desc = this.text(await this.querySelector(res, "#height_limit")).replace("&nbsp;", "");
    const sources = (await this.querySelectorAll(res, ".anthology-tab a")).map((e) =>
      e.content.match(/i>(.*?)</)[1].replace("&nbsp;", "")
    );
    const videos = await this.querySelectorAll(res, ".anthology-list-play");
    const episodes = [];
    for (let i = 0; i < videos.length; i++) {
      const urls = await this.querySelectorAll(videos[i].content, "a");
      for (let j = 0; j < urls.length; j++) {
        urls[j] = { name: this.text(urls[j]), url: `${await urls[j].getAttributeText("href")}|${data[1]}` };
      }
      episodes.push({ title: sources[i], urls });
    }
    return { title: data[1], cover: data[2], metadata: Object.fromEntries(metadata), desc, episodes };
  }

  async watch(str) {
    const d = str.split("|");
    const ep = d[0].split("/")[4];
    const res = await this.request(`/api/anime?msg=${d[1]}&n=1&type=1&j=${ep.split(".")[0]}`, {
      headers: { "Miru-Url": "https://oiapi.net" },
    });
    const { data } = JSON.parse(JSON.stringify(res));
    return { type: data.play_url.indexOf(".mp4") > 0 ? "mp4" : "hls", url: data.play_url };
  }

  // async watch(url) {
  //   const res = await this.request(url);
  //   const json = JSON.parse(this.text(await this.querySelector(res, ".player-left > script:nth-child(1)")).substring(16));
  //   const link = json.encrypt == 1 ? decodeURIComponent(json.url) : decodeURIComponent(this.base64decode(json.url));
  //   return { type: link.indexOf(".mp4") > 0 ? "mp4" : "hls", url: link };
  // }
}
