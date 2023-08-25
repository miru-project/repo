// ==MiruExtension==
// @name         Comick
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://comick.app/static/icons/unicorn-256_maskable.png
// @package      comick.app
// @type         manga
// @webSite      https://api.comick.app
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
   defaultValue: "https://api.comick.app",
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
  return {
   title: res.comic.title,
   cover: `https://meo.comick.pictures/${res.comic.md_covers[0].b2key}`,
   desc: res.comic.desc,
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
  const res = await this.req(`/episode-srcs?id=${url}&server=vidstreaming&category=sub`);
  return {
   type: "hls",
   url: res.sources[0].url,
   subtitles: res.subtitles.map((item) => ({
    title: item.lang,
    url: item.url,
   })),
  };
 }
}
