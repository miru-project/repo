// ==MiruExtension==
// @name         NyaFun动漫
// @version      v0.0.1
// @author       hualiong
// @lang         zh-cn
// @license      MIT
// @icon         https://files.superbed.cn/proxy/7468686c6f26333378737f75717b2f3278737f6f326d6d327f73713375717d7b79335d7b5d5d5f2a6931484a4c5d71757f28666d4650502b682c28702f4b2b566a6c326c727b
// @package      nyacg.net
// @type         bangumi
// @webSite      https://www.nyacg.net
// @nsfw         false
// ==/MiruExtension==
export default class extends Extension {
  dict = new Map([
    ["&nbsp;", " "],
    ["&quot;", '"'],
    ["&lt;", "<"],
    ["&gt;", ">"],
    ["&amp;", "&"],
    ["&sdot;", "·"],
  ]);

  text(content) {
    const str = [...content.matchAll(/>([^<]+?)</g)]
      .map((m) => m[1])
      .join("")
      .trim();
    return str.replace(/&[a-z]+;/g, (c) => this.dict.get(c) || c);
  }

  decrypt(src, key) {
    let ut = CryptoJS.enc.Utf8.parse("2890" + key + "tB959C"),
      mm = CryptoJS.enc.Utf8.parse("2F131BE91247866E"),
      decrypted = CryptoJS.AES.decrypt(src, ut, {
        iv: mm,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
    return CryptoJS.enc.Utf8.stringify(decrypted);
  }

  base64decode(str) {
    let words = CryptoJS.enc.Base64.parse(str);
    return CryptoJS.enc.Utf8.stringify(words);
  }

  async querySelector(content, selector) {
    const res = await this.querySelectorAll(content, selector);
    return res === null ? null : res[0];
  }

  async $req(url, options = {}, count = 3, timeout = 5000) {
    try {
      return await Promise.race([
        this.request(url, options),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out!"));
          }, timeout);
        }),
      ]);
    } catch (error) {
      if (count > 1) {
        console.log(`[Retry (${count})]: ${url}`);
        return this.$req(url, options, count - 1);
      } else {
        throw error;
      }
    }
  }

  async select(page, filter) {
    const res = await this.$req(
      `/show/${filter.channels[0] || 1}${filter.genres[0] ? "/class/" + filter.genres[0] : ""}/page/${page}${
        filter.years[0] ? "/year/" + filter.years[0] : ""
      }.html`
    );
    const list = await this.querySelectorAll(res, ".public-list-box");
    if (list === null) return [];
    const videos = list.map(async (e) => {
      const label = await this.querySelector(e.content, ".public-list-exp");
      const title = await label.getAttributeText("title");
      const cover = await this.getAttributeText(label.content, "img.gen-movie-img", "data-src");
      const update = await this.querySelector(label.content, "span.public-list-prb");
      const url = await label.getAttributeText("href");
      return { title, url: url.match(/\/bangumi\/(\d+)\.html/)[1], cover, update: this.text(update.content) };
    });
    return await Promise.all(videos);
  }

  // =============================== 分割线 ============================== //

  async createFilter() {
    const channels = {
      title: "频道",
      max: 1,
      min: 0,
      default: "",
      options: {
        1: "番剧",
        2: "剧场",
      },
    };
    const genres = {
      title: "类型（分类动漫不代表全部动漫）",
      max: 1,
      min: 0,
      default: "",
      options: {
        奇幻: "奇幻",
        战斗: "战斗",
        冒险: "冒险",
        热血: "热血",
        日常: "日常",
        搞笑: "搞笑",
        后宫: "后宫",
        异世界: "异世界",
        穿越: "穿越",
        治愈: "治愈",
        爱情: "爱情",
        狗粮: "狗粮",
        小说改: "小说改",
        漫画改: "漫画改",
        游戏改: "游戏改",
        偶像: "偶像",
        校园: "校园",
        催泪: "催泪",
        青春: "青春",
        恋爱: "恋爱",
        机战: "机战",
        科幻: "科幻",
        百合: "百合",
        音乐: "音乐",
        悬疑: "悬疑",
        恐怖: "恐怖",
        运动: "运动",
        性转: "性转",
        党争: "党争",
      },
    };
    const years = {
      title: "年份",
      max: 1,
      min: 0,
      default: "",
      options: Object.fromEntries(
        new Map(
          Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => [
            (2000 + i).toString(),
            (2000 + i).toString(),
          ])
        )
      ),
    };
    return { channels, genres, years };
  }

  async latest(page) {
    const h = (new Date().getUTCHours() + 9) % 24;
    const res = await this.$req(`/api.php/provide/vod?ac=detail&pg=${page}&h=${h || 24}`);
    return res.list.map((e) => ({
      title: e.vod_name,
      url: `${e.vod_id}`,
      cover: e.vod_pic,
      update: e.vod_remarks,
    }));
  }

  async search(kw, page, filter) {
    if (filter.channels?.[0] || filter.genres?.[0] || filter.years?.[0]) {
      if (kw) throw new Error("在使用筛选器时无法同时使用搜索功能！");
      return this.select(page, filter);
    } else if (!kw) return this.latest(page);
    const res = await this.$req(`/api.php/provide/vod?ac=detail&wd=${kw}&t=${filter.genres[0] ?? ""}&pg=${page}`);
    return res.list.map((e) => ({
      title: e.vod_name,
      url: `${e.vod_id}`,
      cover: e.vod_pic,
      update: e.vod_remarks,
    }));
  }

  async detail(id) {
    let desc = "无";
    const anime = (await this.$req(`/api.php/provide/vod?ac=detail&ids=${id}`)).list[0];
    const blurb = this.text(anime.vod_blurb);
    const content = this.text(anime.vod_content);
    desc = desc.length < blurb?.length ? blurb : desc;
    desc = desc.length < content.length ? content : desc;
    const urls = anime.vod_play_url
      .split("#")
      .filter((e) => e)
      .map((e) => {
        const s = e.split("$");
        return { name: s[0], url: s[1] };
      });
    return { title: anime.vod_name, cover: anime.vod_pic, desc, episodes: [{ title: this.name, urls }] };
  }

  async watch(url) {
    const resp = await this.$req(`/player/ec.php?code=qw&url=${url}`, {
      headers: { "Miru-Url": "https://play.nyacg.net", Referer: "https://www.nyacg.net" },
    });
    const json = JSON.parse(resp.match(/let ConFig = ({.+})/)[1]);
    const link = this.decrypt(json.url, json.config.uid);
    console.log(link);
    return { type: link.indexOf(".mp4") > 0 ? "mp4" : "hls", url: link };
  }

  async checkUpdate(id) {
    const anime = await this.$req(`/api.php/provide/vod?ids=${id}`);
    return anime.list[0].vod_remarks;
  }
}
