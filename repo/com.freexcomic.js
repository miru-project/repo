// ==MiruExtension==
// @name         愛看漫畫
// @version      v0.0.3
// @author       vvsolo
// @lang         zh-tw
// @license      MIT
// @type         manga
// @icon         http://mxsmh01.top/static/images/favicon.ico
// @package      com.freexcomic
// @webSite      http://
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  #opts = {
    base: 'http://www.mxsmh01.top',
    sources: {
      'mxsmh01.top': 'http://www.mxsmh01.top',
      'mxsmh1.com': 'http://www.mxsmh1.com',
      'mxs2.com': 'http://www.mxs2.com',
      'mxs02.top': 'http://www.mxs02.top',
      'mxs03.top': 'http://www.mxs03.top',
      'mxs04.top': 'http://www.mxs04.top',
      '92hm.life': 'http://www.92hm.life'
    },
    filter: "/booklist",
    filters: {
      //"/update": "更新",
      "/booklist": "全部",
      "/booklist&end=-1": "连载",
      "/booklist&end=1": "完结"
    },
    uptime: 0,
    expire: 12 * 60,
  }
  #cache = new Map([
    ['@cover', {}]
  ]);

  async load() {
    await this.registerSetting({
      title: 'Source',
      key: 'source',
      type: 'radio',
      defaultValue: this.#opts.base,
      options: this.#opts.sources
    });
  }

  async latest(page) {
    return this.getMangas(`/booklist?page=${page}`);
  }

  async search(kw, page, filter) {
    if (kw && page > 1) {
      return [];
    }
    const filt = filter?.data?.[0] || this.#opts.filter;
    const seaKW = kw ? `/search?keyword=${encodeURIComponent(kw)}` : `${filt}?page=${page}`;
    return this.getMangas(seaKW);
  }

  async createFilter(filter) {
    return {
      data: {
        title: "",
        max: 1,
        min: 1,
        default: this.#opts.filter,
        options: this.#opts.filters,
      }
    };
  }

  async detail(url) {
    const res = await this.req(url);
    const title = await this.querySelector(res, '.info > h1').text;
    const desc = await this.querySelector(res, 'p.content').text;
    const imgs = await this.queryAll(res, '#detail-list-select > li', async (html) => {
      const name = (await this.querySelector(html, 'a').text || '').trim();
      const imgURL = await this.getAttributeText(html, 'a', 'href');
      return { name, url: imgURL };
    });
    const cover = this.#cache.get('@cover')[url] || (await this.getAttributeText(res, '.cover > img', 'src')) || '';
    const subtitle = [];
    (await this.querySelector(res, '.info').content || '').replace(/<p class="subtitle">(.+?)<\/p>/g, (m, m1) => {
      subtitle.push(m1.replace(/&amp;/g, '&'));
    });
    subtitle.push(desc.trim());
    return {
      title: title.trim(),
      cover,
      desc: subtitle.join('\n'),
      episodes: [{
        title: '目录',
        urls: imgs
      }]
    };
  }

  async watch(url) {
    const res = await this.req(url);
    const matchResult = res.match(/data\-original="([^"]+)"/g);
    const uniqueUrlsSet = new Set(matchResult.map((v) => v.slice(15, -1)));
    const urls = [...uniqueUrlsSet];
    return { urls };
  }


  async getMangas(path) {
    const baseUrl = await this.getSetting('source');
    const md5path = md5(baseUrl + path);
    if (this.checkCache(md5path)) {
      return this.#cache.get(md5path);
    }
    const res = await this.req(path);
    const mangas = await this.queryAll(res, 'div.mh-item > a', async (html) => {
      const title = await this.getAttributeText(html, 'a', 'title');
      const url = await this.getAttributeText(html, 'a', 'href');
      const cover = html.match(/background\-image: *url\((.+)\)/)[1] || '';
      this.#cache.get('@cover')[url] = cover;
      return { title: title.trim(), url, cover };
    });
    this.#cache.set(md5path, mangas);
    this.#opts.uptime = Date.now();
    return mangas;
  }

  async req(path) {
    const baseUrl = await this.getSetting('source');
    if (~path.indexOf(baseUrl)) path = path.replace(baseUrl, '');
    return this.request('', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
        'Miru-Url': baseUrl + path
      }
    });
  }

  async queryAll(res, selector, func) {
    const elements = await this.querySelectorAll(res, selector);
    return Promise.all(
      elements.map(async (v, i) => {
        const html = await v.content;
        return func(html, v, i);
      })
    ) || [];
  }

  checkCache(item) {
    const expire = +(this.#opts.expire);
    return this.#cache.has(item) &&
      expire > 0 &&
      (Date.now() - this.#opts.uptime) < expire * 60 * 1000;
  }
}
