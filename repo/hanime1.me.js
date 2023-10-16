// ==MiruExtension==
// @name         Hanime
// @version      v0.0.1
// @author       appdevelpo
// @lang         zh
// @license      MIT
// @icon         https://img4.qy0.ru/data/2205/36/tab_logo.png
// @package      hanime1.me
// @type         bangumi
// @webSite      https://hanime1.me
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async search(kw, page) {
        const res = await this.request(`/search?query=${kw}&type=&genre=&sort=&year=&month=&page=${page}`);
        const bsxList = res.match(/<div class="col-xs-6 col-sm-4 col-md-2 search-doujin-videos hidden-xs hover-lighter multiple-link-wrapper[\s\S]+?<\/div>[\s\S]+?<\/div>/g);
        const bangumi = [];
        bsxList.forEach((element) => {
         const url = element.match(/href="https:\/\/hanime1.me(\/.+?)"/)[1];
         const title = element.match(/"card-mobile-title".+?>(.+?)<\/div>/)[1];
         const cover = element.match(/src="(https:\/\/vdownload.hembed.com\/image\/thumbnail.+?)"/)[1];
         bangumi.push({
          title,
          url:url,
          cover,
         });
        });
        return bangumi;
      }
  
    async latest(page) {
      const res = await this.request(`/search?genre=%E5%85%A8%E9%83%A8&sort=%E6%9C%80%E6%96%B0%E4%B8%8A%E5%B8%82&page=${page}`);
      const bsxList = res.match(/<div class="col-xs-6 col-sm-4 col-md-2 search-doujin-videos hidden-xs hover-lighter multiple-link-wrapper[\s\S]+?<\/div>[\s\S]+?<\/div>/g);
       const bangumi = [];
       bsxList.forEach((element) => {
        const url = element.match(/href="https:\/\/hanime1.me(\/.+?)"/)[1];
        const title = element.match(/"card-mobile-title".+?>(.+?)<\/div>/)[1];
        const cover = element.match(/src="(https:\/\/vdownload.hembed.com\/image\/thumbnail.+?)"/)[1];
        // console.log(url);
        bangumi.push({
         title,
         url:url,
         cover,
        });
       });
       return bangumi;
    }
  
    async detail(url) {
        const res = await this.request(url,{
            headers:{ 'Content-Type': 'text/html; charset=UTF-8',
                   'Content-Encoding': 'br'}
        });
        const cover = res.match(/"thumbnailUrl":[\s\S]+?"(.+?)"[\s\S]+?\]/)[1];
        const title = res.match(/<title>(.+?)&nbsp/)[1];
        const desc = res.match(/"description":[\s]+?"([\s\S]+?)"/)[1];

        const res_list = res.match(/source src=.+?>/g)
        console.log(res_list);
        const ep = res_list.map(item=>{
                return{
                    name:item.match(/size="(.+?)"/)[1],
                    url:item.match(/"(.+?)"/)[1]
                }
            })
        console.log(ep);
         return {
            title: title || "Unknown Title",
            cover: cover || "",
            desc: desc || "No description available.",
            episodes: [{
                title: "畫質",
                urls: ep
            }]
           };
       }
  
    async watch(url) {
      return {
        type: "mp4",
        url: url||null,
      };
    }
  }
  
