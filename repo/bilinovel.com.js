// ==MiruExtension==
// @name         哔哩轻小说
// @version      v0.0.8
// @author       hualiong
// @lang         zh-cn
// @icon         https://www.bilinovel.com/favicon.ico
// @license      MIT
// @package      bilinovel.com
// @type         fikushon
// @webSite      https://www.bilinovel.com
// ==/MiruExtension==
export default class extends Extension {
  dict = {
    "“": "「", "”": "」", "‘": "『", "’": "』", "": "的", "": "一", "": "是", "": "了", "": "我", "": "不",
    "": "人", "": "在", "": "他", "": "有", "": "这", "": "个", "": "上", "": "们", "": "来", "": "到",
    "": "时", "": "大", "": "地", "": "为", "": "子", "": "中", "": "你", "": "说", "": "生", "": "国",
    "": "年", "": "着", "": "就", "": "那", "": "和", "": "要", "": "她", "": "出", "": "也", "": "得",
    "": "里", "": "后", "": "自", "": "以", "": "会", "": "家", "": "可", "": "下", "": "而", "": "过",
    "": "天", "": "去", "": "能", "": "对", "": "小", "": "多", "": "然", "": "于", "": "心", "": "学",
    "": "么", "": "之", "": "都", "": "好", "": "看", "": "起", "": "发", "": "当", "": "没", "": "成",
    "": "只", "": "如", "": "事", "": "把", "": "还", "": "用", "": "第", "": "样", "": "道", "": "想",
    "": "作", "": "种", "": "开", "": "美", "": "乳", "": "阴", "": "液", "": "茎", "": "欲", "": "呻",
    "": "肉", "": "交", "": "性", "": "胸", "": "私", "": "穴", "": "淫", "": "臀", "": "舔", "": "射",
    "": "脱", "": "裸", "": "骚", "": "唇", "&nbsp;": " ", "&lt;": "<", "&gt;": ">", "&amp;": "&", "&sdot;": "·",
  };

  text(element) {
    return [...element.content.matchAll(/>([^<]+?)</g)]
    .map((m) => m[1])
    .join("")
    .trim();
  }

  filter(element) {
    if (element.content.startsWith("<img")) {
      const match = [...element.content.matchAll(/src="(.*?)"/g)];
      return `【Miru 暂不支持查看插图${match.length ? "：" + match[match.length - 1][1] : ""}】`;
    }
    return this.text(element).replace(/&[a-z]+;|./g, (c) => this.dict[c] || c);
  }

  async querySelector(content, selector) {
    const res = await this.querySelectorAll(content, selector);
    return res === null ? null : res[0];
  }

  async handle(url, count = 3) {
    try {
      const response = await this.request(url, {
        headers: { "Accept-Language": "zh-cn", Accept: "*/*", Cookie: "night=0" },
      });
      const row = await this.querySelectorAll(response, "#acontent > p, img");
      return row.map(e => this.filter.call(this, e));
    } catch (error) {
      if (count > 0) {
        console.log(`Retry ${count} times: ${url}`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return this.handle(url, count - 1);
      } else {
        throw error;
      }
    }
  }

  /* =============================== 分割线 ============================== */

  async createFilter() {
    const ranks = {
      title: "轻小说榜单",
      max: 1,
      min: 1,
      default: "lastupdate",
      options: {
        monthvisit: "月点击榜",
        weekvisit: "周点击榜",
        monthvote: "月推荐榜",
        weekvote: "周推荐榜",
        monthflower: "月鲜花榜",
        weekflower: "周鲜花榜",
        monthegg: "月鸡蛋榜",
        weekegg: "周鸡蛋榜",
        lastupdate: "最近更新",
        postdate: "最新入库",
        goodnum: "收藏榜",
        newhot: "新书榜",
      },
    };
    return { ranks };
  }

  async latest(page, filter) {
    const res = await this.request(`/top/${filter?.ranks[0] ?? "lastupdate"}/${page}.html`);
    const list = await this.querySelectorAll(res, ".book-li > a");
    const tasks = list.map(async (e) => {
      const img = await this.querySelector(e.content, "img");
      const cover = await img.getAttributeText("data-src");
      const title = await img.getAttributeText("alt");
      const update = this.text(await this.querySelector(e.content, ".book-author"));
      const url = `${e.content.match(/href="(.*?)"/)[1]}|${title}|${cover}`;
      return { title, url, cover, update };
    });
    return await Promise.all(tasks);
  }

  async search(kw, page, filter) {
    if (!kw) return this.latest(page, filter);
    const res = await this.request(`/search/${encodeURI(kw)}_${page}.html`);
    const total = await this.querySelector(res, "#pagelink > span");
    if (total) {
      if (parseInt(this.text(total).split("/")[1].slice(0, -1)) < page) {
        return [];
      }
      const list = await this.querySelectorAll(res, ".book-li > a");
      const tasks = list.map(async (e) => {
        const img = await this.querySelector(e.content, "img");
        const cover = await img.getAttributeText("data-src");
        const title = await img.getAttributeText("alt");
        let author = await this.querySelector(e.content, ".book-author");
        author = author.content.match(/svg>(.*)<\/span>/)[1].trim();
        if (author.indexOf("hot") > 0) {
          author = author.match(/class="hot">(.*)<\/span>/)[1].trim() + author.split("</span>")[1];
        }
        const url = `${e.content.match(/href="(.*?)"/)[1]}|${title}|${cover}`;
        return { title, url, cover, update: author };
      });
      return await Promise.all(tasks);
    }
    // 此时已经在详情页
    // const desc = this.querySelector(res, "#bookSummary > content");
    const head = await this.querySelector(res, "head");
    const title = await this.getAttributeText(head.content, "meta[property='og:title']", "content");
    const cover = await this.getAttributeText(head.content, "meta[property='og:image']", "content");
    const url = this.getAttributeText(head.content, "meta[property='og:url']", "content");
    const remark = this.getAttributeText(head.content, "meta[property='og:novel:author']", "content");
    return [
      {
        title,
        cover,
        url: `${(await url).substring(25)}|${title}|${cover}`,
        update: await remark,
      },
    ];
  }

  async detail(string) {
    const data = string.split("|");
    const desc = (async (data) => {
      const res = await this.request(data[0]);
      const desc = await this.querySelector(res, "#bookSummary > content");
      return this.text(desc);
    })(data);
    const prefix = data[0].slice(0, -5);
    const catalog = await this.request(prefix + "/catalog");
    const volumes = await this.querySelectorAll(catalog, ".volume-chapters");
    const episodes = volumes.map(async (volume) => {
      const title = this.text(await this.querySelector(volume.content, ".chapter-bar > h3"));
      const urls = await this.querySelectorAll(volume.content, ".chapter-li-a");
      const tasks = urls.map((url, i) => {
        const regex = /\/novel\/\d+\/([0-9_]+)/;
        let match = regex.exec(url.content);
        if (!match) {
          const id = i ? parseInt(regex.exec(urls[i - 1].content)[1]) + 1 : parseInt(regex.exec(urls[i + 1].content)[1]) - 1;
          match = [`${prefix}/${id}`];
        }
        return { name: this.text(url), url: match[0] };
      });
      return { title, urls: await Promise.all(tasks) };
    });
    return { title: data[1], cover: data[2], desc: await desc, episodes: await Promise.all(episodes) };
  }

  async watch(url) {
    let tasks = [this.handle(`${url}.html`)];
    const res = await this.request(`${url}_2.html`, {
      headers: { "Accept-Language": "zh-cn", Accept: "*/*", Cookie: "night=0" },
    });
    const subtitle = this.text(await this.querySelector(res, "#apage h1"));
    const total = parseInt(subtitle.split("/")[1].slice(0, -1)) || 1;
    for (let i = 3; i <= total; i++) {
      tasks.push(this.handle(`${url}_${i}.html`));
    }
    tasks = await Promise.all(tasks);
    if (total > 1) {
      tasks.splice(1, 0, (await this.querySelectorAll(res, "#acontent > p, img")).map(e => this.filter.call(this, e)));
    }
    return {
      title: "Why is this 'title' attribute not valid?",
      subtitle: subtitle.split("（")[0],
      content: tasks.flat(),
    };
  }
}
