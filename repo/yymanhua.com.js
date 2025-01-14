// ==MiruExtension==
// @name         YY漫画
// @version      v0.0.4
// @author       hualiong
// @lang         zh-cn
// @license      MIT
// @package      yymanhua.com
// @type         manga
// @icon         https://www.yymanhua.com/favicon.ico
// @webSite      https://www.yymanhua.com
// ==/MiruExtension==
export default class extends Extension {
  async asyncPool(limit, items, f) {
    const ret = [];
    const executing = [];
    for (const item of items) {
      const p = Promise.resolve().then(() => f(item));
      ret.push(p);
      if (limit <= items.length) {
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
    }
    return Promise.all(ret);
  }

  deobfuscator(string) {
    const match = string.match(/return p;}\('(.*?)',(\d+),(\d+),'(.*?)'/);
    let d = {};
    match[4] = match[4].split("|");
    let e = function (c) {
      return (c = c % match[2]) > 35 ? String.fromCharCode(c + 29) : c.toString(36);
    };
    while (match[3]--) d[e(match[3])] = match[4][match[3]] || e(match[3]);
    return match[1].replace(/\b\w+\b/g, (e) => d[e]);
  }

  async querySelector(content, selector) {
    const res = await this.querySelectorAll(content, selector);
    return res === null ? null : res[0];
  }

  text(element) {
    const match = element.content.match(/<[^>]+>([^<]+)<\/[^>]+>/);
    return !match ? "" : match[1].trim();
  }

  async $get(url, count = 3, timeout = 5000) {
    try {
      return await Promise.race([
        this.request(url, {
          headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 EdgA/131.0.0.0",
            cookie: "yymanhua_lang=2;image_time_cookie=;mangabzimgpage=",
            referer: "https://www.yymanhua.com/",
          },
        }),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out!"));
          }, timeout);
        }),
      ]);
    } catch (error) {
      if (count > 1) {
        console.log(`[Retry]: ${url}`);
        return this.$get(url, count - 1);
      } else {
        throw error;
      }
    }
  };

  /* =============================== 分割线 ============================== */

  async createFilter() {
    const theme = {
      title: "题材",
      max: 1,
      min: 1,
      default: "0",
      options: {
        0: "全部",
        31: "热血",
        26: "恋爱",
        1: "校园",
        2: "冒险",
        25: "科幻",
        11: "生活",
        17: "悬疑",
        15: "魔法",
        34: "运动",
      },
    };
    const status = {
      title: "状态",
      max: 1,
      min: 1,
      default: "0",
      options: {
        0: "全部",
        1: "连载中",
        2: "完结",
      },
    };
    const sort = {
      title: "排序",
      max: 1,
      min: 1,
      default: "2",
      options: {
        10: "人气",
        2: "更新时间",
      },
    };
    return { theme, status, sort };
  }

  async latest(page, filter = { theme: [0], status: [0], sort: [2] }) {
    const res = await this.$get(`/manga-list-${filter.theme[0]}-${filter.status[0]}-${filter.sort[0]}-p${page}/`);
    const list = await this.querySelectorAll(res, ".mh-list li");
    if (list === null) {
      return [];
    }
    let reg = /<span.*?>(.*?)<\/span>\s*?<a.*?>(.*?)<\/a>/;
    const videos = list.map(async (e) => {
      const cover = await this.getAttributeText(e.content, "img", "src");
      const match = reg.exec((await this.querySelector(e.content, ".chapter")).content);
      const title = this.text(await this.querySelector(e.content, ".title"));
      const url = `${await this.getAttributeText(e.content, ".title a", "href")}|${title}|${cover}`;
      return { title, url, cover, update: `${match[1]} | ${match[2].replace(title, "").trim()}` };
    });
    return await Promise.all(videos);
  }

  async search(kw, page, filter) {
    if (!kw) return this.latest(page, filter);
    const res = await this.$get(`/search?title=${encodeURI(kw)}&page=${page}`);
    const list = await this.querySelectorAll(res, ".mh-list li");
    if (list === null) {
      return [];
    }
    let reg = /<span.*?>(.*?)<\/span>\s*?<a.*?>(.*?)<\/a>/;
    const videos = list.map(async (e) => {
      const cover = await this.getAttributeText(e.content, "img", "src");
      const match = reg.exec((await this.querySelector(e.content, ".chapter")).content);
      const title = this.text(await this.querySelector(e.content, ".title"));
      const url = `${await this.getAttributeText(e.content, ".title a", "href")}|${title}|${cover}`;
      return { title, url, cover, update: `${match[1]} | ${match[2].replace(title, "").trim()}` };
    });
    return await Promise.all(videos);
  }

  async detail(str) {
    const data = str.split("|");
    const res = await this.$get(data[0]);
    const descTask = this.querySelector(res, ".detail-info-content");
    const items = await this.querySelectorAll(res, "#chapterlistload a");
    const urls = items.map((e) => {
      const match = e.content.match(/>(.*?)<.*?>(.*?)<\/span>/);
      return {
        name: match[1].trim() + match[2].trim(),
        url: `${e.content.match(/href="([^"]+)"/)[1]}|${match[2].match(/\d+/)[0]}`,
      };
    });
    const txt = (await descTask).content;
    const extra = txt.match(/none">([\s\S]*?)</);
    const desc = txt.match(/content">([\s\S]*?)</)[1] + (extra ? extra[1] : "");
    return { title: data[1], cover: data[2], desc: desc.trim(), episodes: [{ title: this.name, urls: urls.reverse() }] };
  }

  async watch(str) {
    const data = str.split("|");
    const cid = data[0].match(/\d+/)[0];
    const seq = Array.from({ length: parseInt(data[1]) }, (_, i) => i);
    const urls = await this.asyncPool(40, seq, async (i) => {
      const resp = await this.$get(`${data[0]}chapterimage.ashx?cid=${cid}&page=${i + 1}`);
      const match = this.deobfuscator(resp).match(/var pix="(.*?)".*var pvalue=\["(.*?)"/);
      return match[1] + match[2];
    });
    return { urls };
  }
}