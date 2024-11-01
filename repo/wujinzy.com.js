// ==MiruExtension==
// @name         无尽资源网
// @version      v0.0.2
// @author       hualiong
// @lang         zh-cn
// @license      MIT
// @icon         https://wujinzy.com/template/ziyuan2/images/logo.jpg
// @package      wujinzy.com
// @type         bangumi
// @webSite      https://wujinzy.com
// @nsfw         false
// ==/MiruExtension==
export default class extends Extension {
  genres = {};

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

  async $get(params, count = 2, timeout = 4000) {
    try {
      return await Promise.race([
        this.request("/api.php/provide/vod?ac=detail" + params, {
          headers: { "Miru-Url": "https://api.wujinapi.me" },
        }),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out!"));
          }, timeout);
        }),
      ]);
    } catch (error) {
      if (count > 1) {
        console.log(`[Retry (${count})]: ${params}`);
        return this.$get(params, count - 1);
      } else {
        throw error;
      }
    }
  }

  async load() {
    const res = await this.$get("&ac=list");
    res.class.forEach((e) => {
      this.genres[e.type_id] = e.type_name;
    });
  }

  async createFilter() {
    const genres = {
      title: "影片类型",
      max: 1,
      min: 0,
      default: "",
      options: this.genres,
    };
    return { genres };
  }

  async latest(page) {
    const h = (new Date().getUTCHours() + 9) % 24;
    const res = await this.$get(`&pg=${page}&h=${h || 24}`);
    return res.list.map((e) => ({
      title: e.vod_name,
      url: `${e.vod_id}`,
      cover: e.vod_pic,
      update: e.vod_remarks,
    }));
  }

  async search(kw, page, filter) {
    if (!kw && !(filter?.genres?.[0])) {
      return this.latest(page);
    }
    const res = await this.$get(`&wd=${kw}&t=${filter?.genres?.[0] ?? ""}&pg=${page}`);
    return res.list.map((e) => ({
      title: e.vod_name,
      url: `${e.vod_id}`,
      cover: e.vod_pic,
      update: e.vod_remarks,
    }));
  }

  async detail(id) {
    let desc = "无";
    const anime = (await this.$get(`&ids=${id}`)).list[0];
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
    return { type: "hls", url };
  }
}
