// ==MiruExtension==
// @name         AirWiki
// @version      v0.0.1
// @author       OshekharO
// @lang         jp
// @license      MIT
// @icon         https://wiki-img.airav.wiki/storage/settings/September2019/hj8LddG9oFlmPe0YFkUd.png
// @package      airav
// @type         bangumi
// @webSite      https://www.airav.wiki
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
 async req(url) {
  return this.request(url, {
   headers: {
    "Miru-Url": await this.getSetting("airav"),
   },
  });
 }

 async load() {
  this.registerSetting({
   title: "Airav",
   key: "airav",
   type: "input",
   description: "Airav Domain",
   defaultValue: "https://www.airav.wiki",
  });
 }

 async latest(page) {
  const res = await this.req(`/api/video/list?lang=en&lng=en&search=&page=${page}`);
  return res.result.map((item) => ({
   title: item.name != null ? item.name : "",
   url: item.barcode,
   cover: item.img_url != null ? item.img_url : "",
  }));
 }

 async detail(url) {
  const res = await this.req(`/api/video/barcode/${url}`);

  return {
   title: res.result.name != null ? res.result.name : "",
   cover: res.result.img_url != null ? res.result.img_url : "",
   desc: res.result.description != null ? res.result.description : "",
   episodes: [
    {
     title: "Directory",
     urls: [
      {
       name: res.result.name != null ? res.result.name : "",
       url: res.result.video_url.url_hls_cdn != null ? res.result.video_url.url_hls_cdn : "",
      },
     ],
    },
   ],
  };
 }

 async search(kw) {
  const res = await this.req(`/api/video/list?search=${kw}&lng=en`);
  return res.result.map((item) => ({
   title: item.name != null ? item.name : "",
   url: item.barcode,
   cover: item.img_url != null ? item.img_url : "",
  }));
 }

 async watch(url) {
  return {
   type: "hls",
   url: url,
  };
 }
}
