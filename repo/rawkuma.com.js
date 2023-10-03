// ==MiruExtension==
// @name         rawkuma
// @version      v0.0.1
// @author       appdevelpo
// @lang         en
// @license      MIT
// @type         manga
// @icon         https://rawkuma.com/wp-content/uploads/2020/01/cropped-Yuna.Kuma_.Kuma_.Kuma_.Bear_.full_.2385251-32x32.png
// @package      rawkuma.com
// @webSite      https://rawkuma.com
// @nsfw         false
// ==/MiruExtension==

export default class Mangafx extends Extension {
    async latest(page) {
     const res = await this.request(`/manga/?page=${page}&status=&type=&order=update`);
     const bsxList = res.match(/<div class="bs">([\s\S]+?)a>[\s\S]+?<\/div>/gm);
    //  console.log(bsxList[6]);
     const mangas = [];
     bsxList.forEach((element) => {
      const url = element.match(/href="https:\/\/rawkuma.com\/manga(.+?)"/)[1];
    //   console.log(url);
      const title = element.match(/<div class="tt">\s*([^<>\s]+[^<]*)\s*<\/div>/)[1];
    //   console.log(title);
      const cover = element.match(/img src="(.+?)" class="ts-post-image/)[1];
      // console.log(cover);
      mangas.push({
       title,
       url,
       cover,
      });
     });
     return mangas;
    }
   
    async search(kw, page) {
      const res = await this.request(`/page/${page}/?s=${kw}`);
      const bsxList = res.match(/<div class="bs">([\s\S]+?)a>[\s\S]+?<\/div>/gm);
      const mangas = [];
      bsxList.forEach((element) => {
       const url = element.match(/href="https:\/\/rawkuma.com\/manga(.+?)"/)[1];
       const title = element.match(/<div class="tt">\s*([^<>\s]+[^<]*)\s*<\/div>/)[1];
       const cover = element.match(/img src="(.+?)"/)[1];
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
     const titleRegex = /<h1 class="entry-title" itemprop="name">(.+?)<\/h1>/;
     const titleMatch = res.match(titleRegex);
     const title = titleMatch ? titleMatch[1] : null;
     const coverRegex = /img src="(.+?)" class/;
     const coverMatch = "https:"+res.match(coverRegex)[1];
     const cover = coverMatch ? coverMatch : null;
     const descriptionRegex = /<p>([\s\S^]+?)<\/p>/;
     const descriptionMatch = res.match(descriptionRegex);
     const desc = descriptionMatch ? descriptionMatch[1] : null;
  

     const liListRegex = /<li data-num=([\s\S]+?)<\/li>/g;
     const liListMatch = res.match(liListRegex);
     const episodes = [];
     if (liListMatch) {
      liListMatch.forEach((element) => {
       const chapterNumRegex = /"(.+?)"/;
       const chapterNumMatch = element.match(chapterNumRegex);
       const name = chapterNumMatch ? chapterNumMatch[1] : null;
       const chapterUrlRegex = /href="(.+?)"/;
       const chapterUrlMatch = element.match(chapterUrlRegex);
      url = chapterUrlMatch ? chapterUrlMatch[1] : null;
      url = url.slice(20,-1);
       if (name&& url) {
        episodes.push({
         name,
         url,
        });
       }
      });
     }
     return {
      title: title || "Unknown Title",
      cover: cover || "default-cover.jpg",
      desc: desc || "No description available.",
      episodes: [
       {
        title: "Directory",
        urls: episodes,
       },
      ],
     };
    }
   
    async watch(url) {
     const res = await this.request(`/${url}`);
     const contentRegex = /"images":([\s\S]*?)(])/;
     const contentMatch = res.match(contentRegex);
    
     const content = contentMatch ? contentMatch[1] : null;
     const imgMatches = JSON.parse(content+"]");
     console.log(imgMatches);
     let urls = imgMatches
     return {
      urls,
     };
    }
   }
   