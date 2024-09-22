// ==MiruExtension==
// @name         次元城动漫
// @version      v0.1.0
// @author       hualiong
// @lang         zh-cn
// @license      MIT
// @icon         https://www.cycanime.com/upload/site/20240319-1/25e700991446a527804c82a744731b60.png
// @package      cycanime.com
// @type         bangumi
// @webSite      https://www.cycanime.com
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
    if (!content) return "";
    const str =
      [...content.matchAll(/>([^<]+?)</g)]
        .map((m) => m[1])
        .join("")
        .trim() || content;
    return str.replace(/&[a-z]+;/g, (c) => this.dict.get(c) || c);
  }

  decrypt() {
    const time = Math.ceil(new Date().getTime() / 1000);
    return { time, key: CryptoJS.MD5("DS" + time + "DCC147D11943AF75").toString() }; // EC.Pop.Uid: DCC147D11943AF75
  }

  base64decode(str) {
    let words = CryptoJS.enc.Base64.parse(str);
    return CryptoJS.enc.Utf8.stringify(words);
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
    const { time, key } = this.decrypt();
    const res = await this.$req("/index.php/api/vod", {
      method: "post",
      data: { type: filter.channels[0], class: filter.genres[0], year: filter.years[0], page, time, key },
    });
    return res.list.map((e) => ({
      title: e.vod_name,
      url: `${e.vod_id}`,
      cover: e.vod_pic,
      update: e.vod_remarks,
    }));
  }

  // =============================== 分割线 ============================== //

  async createFilter() {
    const channels = {
      title: "频道",
      max: 1,
      min: 0,
      default: "",
      options: {
        20: "TV动画",
        21: "剧场版",
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
    const res = await this.$req(`/api.php/provide/vod?ac=detail&pg=${page}&pagesize=20`);
    return res.list.map((e) => ({
      title: e.vod_name,
      url: `${e.vod_id}`,
      cover: e.vod_pic,
      update: e.vod_remarks,
    }));
  }

  async search(kw, page, filter) {
    if (filter?.channels?.[0] || filter?.genres?.[0] || filter?.years?.[0]) {
      if (kw) throw new Error("在使用筛选器时无法同时使用搜索功能！");
      return this.select(page, filter);
    } else if (!kw) return this.latest(page);
    const res = await this.$req(`/api.php/provide/vod?ac=detail&wd=${kw}&pg=${page}`);
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
    console.log(url);
    return { type: url.indexOf(".mp4") > 0 ? "mp4" : "hls", url };
  }

  async checkUpdate(id) {
    const anime = await this.$req(`/api.php/provide/vod?ids=${id}`);
    return anime.list[0].vod_remarks;
  }
}
