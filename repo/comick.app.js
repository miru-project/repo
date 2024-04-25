// ==MiruExtension==
// @name         Comick
// @version      v0.0.5
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://comick.app/static/icons/unicorn-256_maskable.png
// @package      comick.app
// @type         manga
// @webSite      https://api.comick.io
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
      return this.request(url, {
        headers: {
          "Miru-Url": await this.getSetting("comick"),
        },
      });
    }

    async load() {
      this.registerSetting({
        title: "COMICK API",
        key: "comick",
        type: "input",
        description: "COMICK API URL",
        defaultValue: "https://api.comick.io",
      });
    }

    async latest(page) {
      const res = await this.req(`/top?accept_mature_content=false`);
      return res.rank.map((item) => ({
        url: item.slug,
        title: item.title,
        cover: `https://meo.comick.pictures/${item.md_covers[0].b2key}`,
      }));
    }

    async detail(url) {
      const res = await this.req(`/comic/${url}`);
      const hid = res.comic.hid;
      const epRes = await this.req(`/comic/${hid}/chapters?limit=99999`);

      epRes.chapters.reverse();

      const chapMap = new Map();
      epRes.chapters.forEach((item) => {
        const lang = item.lang;
        let list = chapMap.get(lang);
        if (!list) {
          list = [];
          chapMap.set(lang, list);
        }
        list.push(item);
      });

      return {
        title: res.comic.title,
        cover: `https://meo.comick.pictures/${res.comic.md_covers[0].b2key}`,
        desc: res.comic.desc,
        episodes: [...chapMap.entries()].map(([lang, list]) => ({
          title: lang,
          urls: list.map((item) => ({
            name: `Chapter ${item.chap}`,
            url: item.hid,
          })),
        })),
      };
    }

    async search(kw, page) {
      const res = await this.req(`/v1.0/search/?page=${page}&limit=30&q=${kw}&t=false`);
      return res.map((item) => ({
        title: item.title,
        url: item.slug,
        cover: `https://meo.comick.pictures/${item.md_covers[0].b2key}`,
      }));
    }

    async watch(url) {
      const res = await this.request(`/chapter/${url}?tachiyomi=true`);
      return {
        urls: res.chapter.images.map((item) => item.url),
      };
    }
  }
