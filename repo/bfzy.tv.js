// ==MiruExtension==
// @name         暴风资源[高清无水印]
// @version      v0.0.4
// @author       jason
// @lang         zh-cn
// @license      MIT
// @icon         https://bfzy.tv/favicon.ico
// @package      bfzy.tv
// @type         bangumi
// @webSite      https://bfzy.tv
// @nsfw         false
// ==/MiruExtension==
export default class extends Extension {
  genres = {};

  domains = [
    "apibfzy.com",      // 官网主接口
    "bfzyapi.com",      // 备用
    "bfzy.tv",
    "by.bfzyapi.com",
    "app.bfzyapi.com",
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

  async $get(params, count = 3, timeout = 8000) {
    try {
      const list = this.domains.map((domain) =>
        this.request("/api.php/provide/vod?ac=detail" + params, {
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
    const res = await this.$get("&ac=list");
    if (res?.class && Array.isArray(res.class)) {
      res.class.forEach((e) => {
        this.genres[e.type_id] = e.type_name;
      });
    } else {
      console.log("load: class data missing", res);
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
    const h = (new Date().getUTCHours() + 9) % 24;
    const res = await this.$get(`&pg=${page}&h=${h || 24}`);
    return (res.list || []).map((e) => ({
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
    const res = await this.$get(
      `&wd=${kw}&t=${filter?.genres?.[0] ?? ""}&pg=${page}`
    );
    return (res.list || []).map((e) => ({
      title: e.vod_name,
      url: `${e.vod_id}`,
      cover: e.vod_pic,
      update: e.vod_remarks,
    }));
  }

  async detail(id) {
    const res = await this.$get(`&ids=${id}`);
    const anime = res.list?.[0];
    if (!anime) throw new Error("详情获取失败");

    let desc = "无";
    const blurb = this.text(anime.vod_blurb);
    const content = this.text(anime.vod_content);
    desc = desc.length < (blurb?.length || 0) ? blurb : desc;
    desc = desc.length < (content?.length || 0) ? content : desc;

    // 解析多线路（$$$ 分隔）
    const playFrom = (anime.vod_play_from || "bfzym3u8").split("$$$");
    const playUrl = (anime.vod_play_url || "").split("$$$");

    const episodes = [];
    const originalLinks = []; // 收集所有原链接，放到描述里

    playFrom.forEach((from, idx) => {
      const urls = (playUrl[idx] || "")
        .split("#")
        .filter((e) => e)
        .map((e) => {
          const s = e.split("$");
          const name = s[0] || `第${idx + 1}集`;
          const url = s[1] || s[0];
          if (url && url.startsWith("http")) {
            originalLinks.push(`${name}: ${url}`);
          }
          return { name, url };
        });

      if (urls.length > 0) {
        episodes.push({
          title: from || "原链接",
          urls,
        });
      }
    });

    // 把原链接追加到描述末尾，方便复制
    if (originalLinks.length > 0) {
      desc += "\n\n—— 视频原链接 ——\n" + originalLinks.join("\n");
    }

    return {
      title: anime.vod_name,
      cover: anime.vod_pic,
      desc,
      episodes,
    };
  }

  async watch(url) {
    console.log("播放原链接:", url);
    return { type: "hls", url };
  }
}
