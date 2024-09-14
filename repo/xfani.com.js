// ==MiruExtension==
// @name         稀饭动漫
// @version      v0.0.7
// @author       hualiong
// @lang         zh
// @license      MIT
// @icon         https://dick.xfani.com/upload/site/20240308-1/813e41f81d6f85bfd7a44bf8a813f9e5.png
// @package      xfani.com
// @type         bangumi
// @webSite      https://dick.xfani.com
// @nsfw         false
// ==/MiruExtension==
export default class extends Extension {
  async load() {
    this.decrypt = () => {
      const time = Math.ceil(new Date().getTime() / 1000);
      return { time, key: CryptoJS.MD5("DS" + time + "DCC147D11943AF75").toString() }; // EC.Pop.Uid: DCC147D11943AF75
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
      default: "1",
      options: {
        1: "连载新番",
        2: "完结旧番",
        3: "剧场版",
        21: "美漫",
      },
    };
    const genres = {
      title: "类型",
      max: 1,
      min: 0,
      default: "",
      options: {
        搞笑: "搞笑",
        原创: "原创",
        轻小说改: "轻小说改",
        恋爱: "恋爱",
        百合: "百合",
        漫改: "漫改",
        校园: "校园",
        战斗: "战斗",
        治愈: "治愈",
        奇幻: "奇幻",
        日常: "日常",
        青春: "青春",
        乙女向: "乙女向",
        悬疑: "悬疑",
        后宫: "后宫",
        科幻: "科幻",
        冒险: "冒险",
        热血: "热血",
        异世界: "异世界",
        游戏改: "游戏改",
        音乐: "音乐",
        偶像: "偶像",
        美食: "美食",
        耽美: "耽美",
      },
    };
    return { channels, genres };
  }

  async latest(page) {
    if (page > 1) {
      return [];
    }
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const { time, key } = this.decrypt();
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
    const { time, key } = this.decrypt();
    const res = await this.request("/index.php/api/vod", {
      method: "post",
      data: { type: filter.channels[0], class: filter.genres[0], page, time, key },
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
    if (res.length < 25000) {
      throw Error("您没有权限访问此数据，请升级会员 -【稀饭动漫】");
    }
    const desc = res.match(/\bid="height_limit".*?>([\s\S]*?)</)[1].replace("&nbsp;", " ");
    const labelTask = this.querySelectorAll(res, ".anthology-tab a");
    const sources = await this.querySelectorAll(res, ".anthology-list-play");
    const labels = (await labelTask).map((e) => e.content.match(/i>(.*?)</)[1].replace("&nbsp;", ""));
    let reg = /href="(.*?)">(.*?)</;
    const episodes = sources.map(async (source, i) => {
      const urls = (await this.querySelectorAll(source.content, "a")).map((a) => {
        const match = reg.exec(a.content);
        return { name: match[2], url: match[1] };
      })
      return { title: labels[i], urls };
    });
    return { title: data[1], cover: data[2], desc, episodes: await Promise.all(episodes) };
  }

  async watch(url) {
    const res = await this.request(url);
    const json = JSON.parse(res.match(/var player_aaaa=({.+?})</)[1]);
    const link = decodeURIComponent(json.encrypt ? this.base64decode(json.url) : json.url);
    console.log(link);
    return { type: link.indexOf(".mp4") > 0 ? "mp4" : "hls", url: link };
  }

  async checkUpdate(str) {
    const url = str.split("|")[0];
    const res = await this.request(url);
    return this.text(await this.querySelector(res, ".slide-info > .slide-info-remarks:nth-child(1)"));
  }
}
