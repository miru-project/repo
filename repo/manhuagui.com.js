// ==MiruExtension==
// @name         漫画柜
// @version      v0.0.1
// @author       appdevelpo
// @lang         zh-cn
// @license      MIT
// @type         manga
// @icon         https://www.manhuagui.com/favicon.ico
// @package      manhuagui.com
// @webSite      https://api-manhuagui.aoihosizora.top/v1
// @nsfw         false
// ==/MiruExtension==
export default class Mangafx extends Extension {
  async latest(page) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://www.manhuagui.com/update/d30.html",
      },
    });
   const bsxList = res.match(/<li>[\s\S]?<a class="cover"[\s\S]+?<\/li>/g);
   const mangas = [];
   bsxList.forEach((element) => {
    const url = element.match(/src="\/\/cf.mhgui.com\/cpic\/m\/(\d+)/)[1];
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
    const res = await this.request("", {
      headers: {
        "Miru-Url": `https://www.manhuagui.com/s/${kw}.html`,
      },
    });
   const bsxList = res.match(/<li class="cf">[\s\S]+?<\/li>/g);
   const mangas = [];
   bsxList.forEach((element) => {
    const url = element.match(/href="\/comic\/(\d+)/)[1];
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
    const res = await this.request(`/manga/${url}`);
    const dat = res.data;
    return {
      title: dat.title,
      cover: dat.cover,
      desc: dat.introduction,
      episodes: [
        {
          title: "Directory",
          urls: dat.chapter_groups[0].chapters.reverse().map((item) => ({
            name: item.title,
            url: `${dat.mid}/${item.cid}`,
          })),
        },
      ],
    };
  }
 
  async watch(url) {
    const res = await this.request(`/manga/${url}`);
    return {
      urls: res.data.pages,
      headers:{
        "Referer": "https://tw.manhuagui.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56"
    }
    };
  }
 }
 
