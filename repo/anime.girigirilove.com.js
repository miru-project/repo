// ==MiruExtension==
// @name         girigiri爱动漫
// @version      v0.3.1
// @author       appdevelpo
// @lang         zh
// @license      MIT
// @icon         https://jpg.girigirilove.com/brand/icon.png
// @package      anime.girigirilove.com
// @type         bangumi
// @webSite      https://anime.girigirilove.com
// @nsfw         false
// ==/MiruExtension==
export default class extends Extension {
  async load() {
    this.imgBase = "https://jpg.girigirilove.com/";
    this.site = "https://anime.girigirilove.com";
    this.apiBase = "https://m3u8.girigirilove.com";
    this.playerPrefix =
      "https://giri.moemoekyu.com/addons/aplyer/atom.php?key=0&url=";
  }

  async req(path, options = {}) {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      Origin: this.site,
      Referer: this.site + "/",
      ...(options.headers || {}),
    };
    // 强制走 m3u8 API 域名
    return this.request(path, {
      ...options,
      headers: {
        ...headers,
        "Miru-Url": this.apiBase,
      },
    });
  }

  parseApi(res) {
    let data = res;
    if (typeof res === "string") {
      try {
        data = JSON.parse(res);
      } catch (e) {
        throw new Error("API JSON 解析失败");
      }
    }
    if (data.code !== 1) {
      throw new Error(data.msg || "API 返回错误");
    }
    return data.info || data.data || data;
  }

  fixCover(pic) {
    if (!pic) return "";
    if (pic.startsWith("http")) return pic;
    return this.imgBase.replace(/\/$/, "") + "/" + pic.replace(/^\//, "");
  }

  isSimplified(name) {
    if (!name) return false;
    const n = String(name).toLowerCase();
    return (
      n.includes("简") ||
      n.includes("国语") ||
      n === "chs" ||
      n.includes("zh-cn") ||
      n.includes("sc")
    );
  }

  isNumericName(name) {
    const n = String(name).trim();
    return /^(\d+|第?\d+[集话]?|ep?\s*\d+|e\d+)$/i.test(n);
  }

  parsePlaySources(fromStr, urlStr) {
    if (!urlStr) return [];
    const froms = (fromStr || "默认").split("$$$");
    const urls = urlStr.split("$$$");
    const sources = [];
    for (let i = 0; i < urls.length; i++) {
      const title = (froms[i] || `线路${i + 1}`).trim();
      const epList = urls[i]
        .split("#")
        .map((seg) => {
          const idx = seg.indexOf("$");
          if (idx === -1) return null;
          const name = seg.slice(0, idx).trim();
          const url = seg.slice(idx + 1).trim();
          if (!name || !url) return null;
          return { name, url };
        })
        .filter(Boolean);
      if (epList.length > 0) {
        sources.push({ title, urls: epList });
      }
    }
    sources.sort((a, b) => {
      const aSimp = this.isSimplified(a.title) ? 0 : 1;
      const bSimp = this.isSimplified(b.title) ? 0 : 1;
      return aSimp - bSimp;
    });
    return sources;
  }

  async latest(page) {
    const offset = ((page || 1) - 1) * 20;
    const res = await this.req(
      `/api.php/Vod/get_list?type_id=2&offset=${offset}&limit=20&orderby=hits`
    );
    const info = this.parseApi(res);
    const rows = info.rows || [];
    return rows.map((item) => ({
      title: item.vod_name || "",
      url: String(item.vod_id),
      cover: this.fixCover(item.vod_pic || item.vod_pic_thumb),
      update: item.vod_remarks || item.vod_score || "",
    }));
  }

  async search(kw, page, filter) {
    const offset = ((page || 1) - 1) * 20;
    const res = await this.req(
      `/api.php/Vod/get_list?vod_name=${encodeURIComponent(
        kw
      )}&offset=${offset}&limit=20`
    );
    const info = this.parseApi(res);
    const rows = info.rows || [];
    return rows.map((item) => ({
      title: item.vod_name || "",
      url: String(item.vod_id),
      cover: this.fixCover(item.vod_pic || item.vod_pic_thumb),
      update: item.vod_remarks || "",
    }));
  }

  async detail(url) {
    const vodId = String(url).replace(/[^\d]/g, "");
    const res = await this.req(
      `/api.php/Vod/get_detail?vod_id=${vodId}`
    );
    const info = this.parseApi(res);
    const title = info.vod_name || "";
    const cover = this.fixCover(info.vod_pic || info.vod_pic_thumb);
    let desc = info.vod_blurb || info.vod_content || "";
    const episodes = this.parsePlaySources(
      info.vod_play_from,
      info.vod_play_url
    );

    // 追加原视频链接
    if (episodes.length > 0) {
      let extra = "\n\n—— 原视频链接 ——";
      for (const source of episodes) {
        const allNumeric = source.urls.every((u) => this.isNumericName(u.name));
        if (allNumeric) {
          const first = source.urls[0];
          extra += `\n\n【${source.title}】\n${first.name}\n${first.url}`;
          extra += `\n播放器：${this.playerPrefix}${encodeURIComponent(
            first.url
          )}`;
        } else {
          extra += `\n\n【${source.title}】`;
          source.urls.forEach((u, i) => {
            extra += `\n${i + 1}. ${u.name}\n${u.url}`;
          });
        }
      }
      desc = (desc || "") + extra;
    }

    return {
      title,
      cover,
      desc,
      episodes,
    };
  }

  async watch(url) {
    const u = String(url || "");
    const isMp4 = /\.mp4(\?|$)/i.test(u);
    return {
      type: isMp4 ? "mp4" : "hls",
      url: u,
      headers: {
        Referer: this.site + "/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    };
  }
}
