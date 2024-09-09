// ==MiruExtension==
// @name         YY漫画
// @version      v0.0.2
// @author       hualiong
// @lang         zh-cn
// @license      MIT
// @package      yymanhua.com
// @type         manga
// @icon         https://www.yymanhua.com/favicon.ico
// @webSite      https://www.yymanhua.com
// ==/MiruExtension==
export default class extends Extension {
  async load() {
    this.asyncPool = async (limit, items, f) => {
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
    };
    this.deobfuscator = (string) => {
      const match = string.match(/return p;}\('(.*?)',(\d+),(\d+),'(.*?)'/);
      let d = {};
      match[4] = match[4].split("|");
      let e = function (c) {
        return (c = c % match[2]) > 35 ? String.fromCharCode(c + 29) : c.toString(36);
      };
      while (match[3]--) d[e(match[3])] = match[4][match[3]] || e(match[3]);
      return match[1].replace(/\b\w+\b/g, (e) => d[e]);
    };
    this.querySelector = async (content, selector) => {
      const res = await this.querySelectorAll(content, selector);
      return res === null ? null : res[0];
    };
    this.text = (element) => {
      const match = element.content.match(/<[^>]+>([^<]+)<\/[^>]+>/);
      return !match ? "" : match[1].trim();
    };
    this.$get = async (url, count = 3) => {
      try {
        return await this.request(url, {
          headers: { cookie: "yymanhua_lang=2;image_time_cookie=;mangabzimgpage=", referer: "https://www.yymanhua.com/" },
        });
      } catch (error) {
        if (count > 0) {
          console.log(`Retry ${count} times: ${url}`);
          return this.$get(url, count - 1);
        } else {
          throw error;
        }
      }
    };
  }

  async search(kw, page) {
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

  async latest(page) {
    const res = await this.$get(`/manga-list-0-0-2-p${page}/`);
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
    return { title: data[1], cover: data[2], desc: desc.trim(), episodes: [{ title: "独家源", urls: urls.reverse() }] };
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
