// ==MiruExtension==
// @name         次元城动漫
// @version      v0.0.1
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
    this.getEp = (url, sources) => {
      const n = url.split("/");
      let ep = parseInt(n[4].split(".")[0]);
      for (let i = 0; i < n[3] - 1; i++) {
        ep += sources[i].total;
      }
      return ep;
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
    const list = await this.querySelectorAll(res, "div.search-box");
    if (list === null) {
      return [];
    }
    const videos = list.map(async (e) => {
      const label = await this.querySelector(e.content, ".public-list-exp");
      const title = this.text(await this.querySelector(e.content, ".right .thumb-txt"));
      const cover = await this.getAttributeText(label.content, "img.gen-movie-img", "data-src");
      const update = this.text(await this.querySelector(label.content, "span.public-list-prb"));
      const url = `${await label.getAttributeText("href")}|${title}|${cover}`;
      return { title, url, cover, update };
    });
    return await Promise.all(videos);
  }

  async latest(page) {
    if (page > 1) {
      return [];
    }
    const res = await this.request("");
    const list = await this.querySelectorAll(res, `#week-module-${new Date().getDay()} .public-list-box`);
    if (list === null) {
      return [];
    }
    const videos = list.map(async (e) => {
      const label = await this.querySelector(e.content, ".public-list-exp");
      const cover = await this.getAttributeText(label.content, "img.gen-movie-img", "data-src");
      const update = this.text(await this.querySelector(e.content, "div.public-list-subtitle"));
      const title = await label.getAttributeText("title");
      const url = `${await label.getAttributeText("href")}|${title}|${cover}`;
      return { title, url, cover, update };
    });
    return await Promise.all(videos);
  }

  async detail(str) {
    const data = str.split("|");
    const res = await this.request(data[0]);
    const descTask = this.querySelector(res, "#height_limit");
    const labelTask = this.querySelectorAll(res, ".anthology-tab a");
    // const info = await this.querySelectorAll(res, ".slide-info");
    // const metadata = new Map();
    // info.shift();
    // for (const e of info) {
    //   const key = this.text(await this.querySelector(e.content, "strong")).slice(0, -1);
    //   const value = (await this.querySelectorAll(e.content, "a")).map(this.text).join(" ");
    //   metadata.set(key, value);
    // }
    // Object.fromEntries(metadata)
    const sources = await this.querySelectorAll(res, ".anthology-list-play");
    const labels = (await labelTask).map((e) => {
      const ep = e.content.match(/<span class="badge">(.*?)</);
      return {
        name: e.content.match(/i>(.*?)</)[1].replace("&nbsp;", ""),
        total: !ep ? 1 : parseInt(ep[1]),
      };
    });
    const episodes = await Promise.all(sources.map(async (source, i) => {
      const urls = await this.querySelectorAll(source.content, "a");
      for (let j = 0; j < urls.length; j++) {
        urls[j] = {
          name: this.text(urls[j]),
          url: `${this.getEp(await urls[j].getAttributeText("href"), labels)}|${data[1]}`,
        };
      }
      return { title: labels[i].name, urls };
    }));
    const desc = this.text(await descTask).replace("&nbsp;", "");
    return { title: data[1], cover: data[2], desc, episodes };
  }

  async watch(str) {
    const d = str.split("|");
    const res = await this.request(`/api/anime?msg=${d[1]}&n=1&type=1&j=${d[0]}`, {
      headers: { "Miru-Url": "https://oiapi.net" },
    });
    const { data } = JSON.parse(JSON.stringify(res));
    return { type: data.play_url.indexOf(".mp4") > 0 ? "mp4" : "hls", url: data.play_url };
  }
  
  async checkUpdate(str) {
    const url = str.split("|")[0];
    const res = await this.request(url);
    return this.text(await this.querySelector(res, ".slide-info > .slide-info-remarks:nth-child(1)"));
  }
}
