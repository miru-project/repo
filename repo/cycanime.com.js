// ==MiruExtension==
// @name         次元城动漫
// @version      v0.0.6
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
    this.decrypt = {
      player: (src, key1, key2) => {
        let prefix = new Array(key2.length);
        for (let i = 0; i < key2.length; i++) {
          prefix[key1[i]] = key2[i];
        }
        let a = CryptoJS.MD5(prefix.join("") + "YLwJVbXw77pk2eOrAnFdBo2c3mWkLtodMni2wk81GCnP94ZltW").toString(),
          key = CryptoJS.enc.Utf8.parse(a.substring(16)),
          iv = CryptoJS.enc.Utf8.parse(a.substring(0, 16)),
          dec = CryptoJS.AES.decrypt(src, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          });
        return dec.toString(CryptoJS.enc.Utf8);
      },
      timestamp: () => {
        const time = Math.ceil(new Date().getTime() / 1000);
        return { time, key: CryptoJS.MD5("DS" + time + "DCC147D11943AF75").toString() }; // EC.Pop.Uid: DCC147D11943AF75
      },
    };
    this.base64decode = (str) => {
      var words = CryptoJS.enc.Base64.parse(str);
      return CryptoJS.enc.Utf8.stringify(words);
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

  async createFilter() {
    const channels = {
      title: "频道",
      max: 1,
      min: 1,
      default: "20",
      options: {
        20: "TV动画",
        21: "剧场版",
        // "21.html": "排行榜",
      },
    };
    const genres = {
      title: "类型（分类资源不代表全部资源）",
      max: 1,
      min: 0,
      default: "",
      options: {
        原创: "原创",
        漫画改: "漫画改",
        小说改: "小说改",
        游戏改: "游戏改",
        特摄: "特摄",
        热血: "热血",
        穿越: "穿越",
        奇幻: "奇幻",
        战斗: "战斗",
        搞笑: "搞笑",
        日常: "日常",
        科幻: "科幻",
        治愈: "治愈",
        校园: "校园",
        泡面: "泡面",
        恋爱: "恋爱",
        少女: "少女",
        魔法: "魔法",
        冒险: "冒险",
        历史: "历史",
        架空: "架空",
        机战: "机战",
        运动: "运动",
        励志: "励志",
        音乐: "音乐",
        推理: "推理",
        社团: "社团",
        智斗: "智斗",
        催泪: "催泪",
        美食: "美食",
        偶像: "偶像",
        乙女: "乙女",
        职场: "职场",
      },
    };
    const years = {
      title: "年份",
      max: 1,
      min: 0,
      default: "",
      options: Object.fromEntries(
        new Map(
          Array.from({ length: new Date().getFullYear() - 2006 }, (_, i) => [
            (2007 + i).toString(),
            (2007 + i).toString(),
          ])
        )
      ),
    };
    return { channels, genres, years };
  }

  async latest(page) {
    if (page > 1) {
      return [];
    }
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const { time, key } = this.decrypt.timestamp();
    let res = await this.request("/index.php/api/weekday", {
      method: "post",
      data: { weekday: weekdays[new Date().getDay()], num: 20, time, key },
    });
    return res.list.map((e) => ({
      title: e.vod_name,
      url: `/bangumi/${e.vod_id}.html|${e.vod_name}|${e.vod_pic}`,
      cover: e.vod_pic,
      update: e.vod_remarks,
    }));
  }

  // async latest(page) {
  //   if (page > 1) {
  //     return [];
  //   }
  //   const res = await this.request("");
  //   const list = await this.querySelectorAll(res, `#week-module-${new Date().getDay()} .public-list-box`);
  //   if (list === null) {
  //     return [];
  //   }
  //   const videos = list.map(async (e) => {
  //     const label = await this.querySelector(e.content, ".public-list-exp");
  //     const cover = await this.getAttributeText(label.content, "img.gen-movie-img", "data-src");
  //     const update = this.text(await this.querySelector(e.content, "div.public-list-subtitle"));
  //     const title = await label.getAttributeText("title");
  //     const url = `${await label.getAttributeText("href")}|${title}|${cover}`;
  //     return { title, url, cover, update };
  //   });
  //   return await Promise.all(videos);
  // }

  async search(kw, page, filter) {
    if (!kw) {
      return this.select(page, filter);
    }
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

  async select(page, filter) {
    const { time, key } = this.decrypt.timestamp();
    const res = await this.request(`/index.php/api/vod`, {
      method: "post",
      data: { type: filter.channels[0], class: filter.genres[0], year: filter.years[0], page, time, key },
    });
    return res.list.map((e) => ({
      title: e.vod_name,
      url: `/bangumi/${e.vod_id}.html|${e.vod_name}|${e.vod_pic}`,
      cover: e.vod_pic,
      update: e.vod_remarks,
    }));
  }

  async detail(str) {
    const data = str.split("|");
    const res = await this.request(data[0]);
    const descTask = this.querySelector(res, "#height_limit");
    const labelTask = this.querySelectorAll(res, ".anthology-tab a");
    const sources = await this.querySelectorAll(res, ".anthology-list-play");
    const labels = (await labelTask).map((e) => e.content.match(/i>(.*?)</)[1].replace("&nbsp;", ""));
    const episodes = await Promise.all(
      sources.map(async (source, i) => {
        const urls = (await this.querySelectorAll(source.content, "a")).map(async (a) => {
          const resp = await this.request(await a.getAttributeText("href"));
          const json = JSON.parse(resp.match(/var player_aaaa=({.+?})</)[1]);
          const url = json.encrypt ? decodeURIComponent(this.base64decode(json.url)) : decodeURIComponent(json.url);
          return { name: this.text(a), url };
        });
        return { title: labels[i], urls: await Promise.all(urls) };
      })
    );
    const desc = this.text(await descTask).replace("&nbsp;", "");
    return { title: data[1], cover: data[2], desc, episodes };
  }

  async watch(url) {
    const resp = await this.request(`/?url=${url}`, { headers: { "Miru-Url": "https://player.cycanime.com" } });
    const reg = /now_(\w+)/g;
    const link = this.decrypt.player(resp.match(/"url": "([^:]+?)"/)[1], reg.exec(resp)[1], reg.exec(resp)[1]);
    return { type: link.indexOf(".mp4") > 0 ? "mp4" : "hls", url: link };
  }

  async checkUpdate(str) {
    const url = str.split("|")[0];
    const res = await this.request(url);
    return this.text(await this.querySelector(res, ".slide-info > .slide-info-remarks:nth-child(1)"));
  }
}
