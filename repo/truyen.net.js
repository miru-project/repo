// ==MiruExtension==
// @name         Truyen
// @version      v0.0.1
// @author       OshekharO
// @lang         vi
// @license      MIT
// @icon         https://st.nettruyenmax.com/data/logos/logo-nettruyen.png
// @package      truyen.net
// @type         manga
// @webSite      https://comics-api.vercel.app
// ==/MiruExtension==

export default class extends Extension {
 async req(url) {
  return this.request(url, {
   headers: {
    "Miru-Url": await this.getSetting("truyen"),
   },
  });
 }

 async load() {
  this.registerSetting({
   title: "Truyen API",
   key: "truyen",
   type: "input",
   description: "Truyen Api Url",
   defaultValue: "https://comics-api.vercel.app",
  });
 }

 async latest(page) {
  const res = await this.req(`/trending-comics?page=${page}`);
  return res.comics.map((item) => ({
   title: item.title,
   url: item.id.toString(),
   cover: item.thumbnail,
  }));
 }

 async detail(url) {
  const res = await this.req(`/comics/${url}`);
  return {
   title: res.title,
   cover: res.thumbnail,
   desc: res.description,
   episodes: [
    {
     title: "Chapters",
     urls: res.chapters.map((item) => ({
      name: `Episode ${item.name}`,
      url: item.id.toString(),
     })),
    },
   ],
  };
 }

 async search(kw, page) {
  const res = await this.req(`/search?q=${kw}&page=${page}`);
  return res.comics.map((item) => ({
   title: item.title,
   url: item.id.toString(),
   cover: item.thumbnail,
  }));
 }

 async watch(url) {
  const res = await this.request(`/comics/${url}/chapters/${url}`);
  return {
   urls: res.images.map((item) => item.src),
  };
 }
}
