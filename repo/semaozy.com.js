// ==MiruExtension==
// @name         色猫资源
// @version      v0.0.3
// @author       hualiong
// @lang         zh-cn
// @license      MIT
// @icon         https://semaozy3.com/template/svpro/img/logo.png
// @package      semaozy.com
// @type         bangumi
// @webSite      https://semaozy.com
// @nsfw         true
// ==/MiruExtension==
export default class extends Extension {
  genres = {};

  domains = [
    "semaozy1.com",
    "semaozy2.com",
    "semaozy4.com",
    "semaozy5.com",
    "semaozy6.com",
    "semaozy7.com",
    "semaozy8.com",
    "semaozy9.com",
    "caiji.semaozy.net",
  ];

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
      const list = this.domains.map((domain) =>
        this.request("/inc/apijson_vod.php?ac=detail" + params, {
          headers: { "Miru-Url": `https://${domain}` },
        })
      );
      list.push(
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out!"));
          }, timeout);
        })
      );
      return await Promise.any(list);
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
    try {
      const res = await this.$get("&ac=list");
      if (res?.class && Array.isArray(res.class)) {
        res.class.forEach((e) => {
          this.genres[e.type_id] = e.type_name;
        });
      }
    } catch (error) {
      console.error("load error:", error);
    }
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
    try {
      const h = (new Date().getUTCHours() + 9) % 24;
      const res = await this.$get(`&pg=${page}&h=${h || 24}`);
      if (!res?.list || !Array.isArray(res.list)) {
        return [];
      }
      return res.list.map((e) => ({
        title: e.vod_name,
        url: `${e.vod_id}`,
        cover: e.vod_pic,
        update: e.vod_remarks,
      }));
    } catch (error) {
      console.error("latest error:", error);
      return [];
    }
  }

  async search(kw, page, filter) {
    try {
      if (!kw && !(filter?.genres?.[0])) {
        return this.latest(page);
      }
      const res = await this.$get(`&wd=${kw}&t=${filter?.genres?.[0] ?? ""}&pg=${page}`);
      if (!res?.list || !Array.isArray(res.list)) {
        return [];
      }
      return res.list.map((e) => ({
        title: e.vod_name,
        url: `${e.vod_id}`,
        cover: e.vod_pic,
        update: e.vod_remarks,
      }));
    } catch (error) {
      console.error("search error:", error);
      return [];
    }
  }

  async detail(id) {
    try {
      let desc = "无";
      const res = await this.$get(`&ids=${id}`);
      const anime = res?.list?.[0];
      if (!anime) {
        return { title: "", cover: "", desc: "无", episodes: [] };
      }
      const blurb = this.text(anime.vod_blurb);
      const content = this.text(anime.vod_content);
      desc = desc.length < blurb?.length ? blurb : desc;
      desc = desc.length < content.length ? content : desc;
      const urls = (anime.vod_play_url || "")
        .split("#")
        .filter((e) => e)
        .map((e) => {
          const s = e.split("$");
          return { name: s[0], url: s[1] };
        });
      return { title: anime.vod_name, cover: anime.vod_pic, desc, episodes: [{ title: this.name, urls }] };
    } catch (error) {
      console.error("detail error:", error);
      return { title: "", cover: "", desc: "无", episodes: [] };
    }
  }

  async watch(url) {
    console.log(url);
    return { type: "hls", url: url || "" };
  }
}
