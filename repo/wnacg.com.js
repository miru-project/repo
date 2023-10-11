// ==MiruExtension==
// @name         紳士漫畫
// @version      v0.0.1
// @author       appdevelpo
// @lang         zh-tw
// @license      MIT
// @type         manga
// @icon         https://www.wnacg.com/favicon.ico
// @package      wnacg.com
// @webSite      https://www.wnacg.com
// @nsfw         true
// ==/MiruExtension==

export default class Mangafx extends Extension {
    async latest(page) {
     const res = await this.request(`/albums-index-page-${page}.html`);
     const bsxList = res.match(/<li class="li[\S\s]+?<\/li>/gm);
     const mangas = [];
     bsxList.forEach((element) => {
      const url = element.match(/href="(.+?)"/)[1];
      const title = element.match(/title="(.+?)"/)[1];
      const cover = "https:"+element.match(/src="(.+?)"/)[1];
      mangas.push({
       title,
       url,
       cover,
      });
     });
     return mangas;
    }
   
    async search(kw, page) {
      const res = await this.request(`/search/index.php?q=${kw}&m=&syn=yes&f=_all&s=create_time_DESC&p=${page}`);
     const bsxList = res.match(/<li class="li[\S\s]+?<\/li>/gm);
     const mangas = [];
     bsxList.forEach((element) => {
      const url = element.match(/href="(.+?)"/)[1];
      const title = element.match(/title="(.+?)"/)[1];
      const cover = "https:"+element.match(/src="(.+?)"/)[1];
      mangas.push({
       title,
       url,
       cover,
      });
     });
     return mangas;
    }
   
    async detail(url) {
      
     const res = await this.request(url);
     const titleRegex = /<h2>(.+?)<\/h2>/;
     const titleMatch = res.match(titleRegex);
     const title = titleMatch ? titleMatch[1] : null;
     const coverRegex = /<img alt=".+src="\/\/(\/\/t4.+?)"/;
     const coverMatch = "https:"+res.match(coverRegex)[1];
     const cover = coverMatch ? coverMatch : null;
     const descriptionRegex = /<p>([\s\S^]+?)<\/p>/;
     const descriptionMatch = res.match(descriptionRegex);
     const desc = descriptionMatch ? descriptionMatch[1] : null;
  
     const button_match = res.match(/<a class="btn"[\s\S]+?<\/a>/g)
     const id  = button_match[0].match(/\d{6}/)[0];
     return {
      title: title || "Unknown Title",
      cover: cover || "",
      desc: desc || "No description available.",
      episodes: [
       {
        title: "正常畫質",
        urls: [{name:"1",url:`/photos-gallery-aid-${id}.html`}],
       },
       {
        title: "低畫質",
        urls: [{name:"1",url:`/photos-webp-aid-${id}.html`}],
       }
      ],
     };
    }
   
    async watch(url) {
     const res = await this.request(url,{
      headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36",
                   referer: "https://www.wnacg.com"}
  });
    const urls = []
     const url_list = res.match(/\/\/img4.qy0.ru\/data.+?.jpg/g)
     url_list.forEach((element) => {
       urls.push("https:"+element)
     })
     return {
      urls,
      header: {
       "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
       referer: "https://www.wnacg.com"
      }
     };
    }
   }
   
