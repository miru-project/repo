// ==MiruExtension==
// @name         Mtlnation
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://mtlnation.com/favicon.png
// @package      mtlnation.com
// @type         fikushon
// @webSite      https://api.mtlnation.com
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
 async req(url) {
  return this.request(url, {
   headers: {
    "Miru-Url": await this.getSetting("mtlnation"),
   },
  });
 }

 async load() {
  this.registerSetting({
   title: "MTLNATION API",
   key: "mtlnation",
   type: "input",
   description: "MTLNATION API URL",
   defaultValue: "https://api.mtlnation.com",
  });
 }

 async latest(page) {
  const res = await this.req(`/api/v2/novels/?sort=chapter_new&page=${page}`);
  return res.data.map((item) => ({
   url: item.slug,
   title: item.title,
   cover: `https://api.mtlnation.com/media/${item.cover}`,
  }));
 }

 async detail(url) {
  const res = await this.req(`/api/v2/novels/${url}`);
  const id = res.data.id;
  const epRes = await this.req(`/api/v2/novels/${id}/chapters`);
  return {
   title: res.data.title,
   cover: `https://api.mtlnation.com/media/${res.data.cover}`,
   desc: res.data.synopsis,
   episodes: [
    {
     title: "Chapters",
     urls: epRes.data.map((item) => ({
      name: `${item.title}`,
      url: item.slug,
     })),
    },
   ],
  };
 }

 async search(kw, page) {
  const res = await this.req(`/api/v2/novels/?faloo=NaN&max_word_count=0&min_word_count=0&page=${page}&query=${kw}&sort=views_month`);
  return res.data.map((item) => ({
   title: item.title,
   url: item.slug,
   cover: `https://api.mtlnation.com/media/${item.cover}`,
  }));
 }

 async watch() {
  // todo
 }
}
