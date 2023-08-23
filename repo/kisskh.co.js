// ==MiruExtension==
// @name         Kisskh
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://kisskh.co/assets/icons/icon-192x192.png
// @package      kisskh.co
// @type         bangumi
// @webSite      https://kisskh.co
// ==/MiruExtension==

export default class extends Extension {
 async search(kw, page) {
  const res = await this.request(`/api/DramaList/Search?q=${kw}?page=${page}`);
  return res.map((item) => ({
   title: item.title,
   url: item.id.toString(),
   cover: item.thumbnail,
  }));
 }

 async latest(page) {
  const res = await this.request(`/api/DramaList/List?page=${page}&type=0&sub=0&country=0&status=0&order=1&pageSize=40`);
  return res.data.map((item) => ({
   title: item.title,
   url: item.id.toString(),
   cover: item.thumbnail,
  }));
 }

 async detail(url) {
  const res = await this.request(`/api/DramaList/Drama/${url}?isq=true`);
  return {
   title: res.title,
   cover: res.thumbnail,
   desc: res.description,
   episodes: [
    {
     title: "Directory",
     urls: res.episodes.map((item) => ({
      name: `Episode ${item.number}`,
      url: item.id.toString(),
     })),
    },
   ],
  };
 }

 async watch(url) {
  const res = await this.request(url);
  const res1 = res.replace(/\n/g, "");
  const m3u8 = res1.match(/,"url":"(.+?)","url_next/)[1].replace(/\\\//g, "/");

  return {
   type: "hls",
   url: m3u8,
  };
 }
}
