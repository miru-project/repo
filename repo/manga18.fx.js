// ==MiruExtension==
// @name         Manga18fx
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      manga18.fx
// @type         manga
// @webSite      https://manga18fx.com
// @nsfw         true
// ==/MiruExtension==

export default class Mangafx extends Extension {
 async latest() {
  const res = await this.request("/");
  const bsxList = res.match(/<div class="hot-item mycover">([\s\S]+?)a>[\s\S]+?<\/div>/g);
  const mangas = [];
  bsxList.forEach((element) => {
   const url = element.match(/href="(.+?)"/)[1];
   const title = element.match(/<h3>(.+?)<\/h3>/)[1];
   const cover = element.match(/src="(.+?)"/)[1];
   mangas.push({
    title,
    url,
    cover,
   });
  });
  return mangas;
 }

 async search(kw, page) {
  const res = await this.request(`/search?q=${kw}&page=${page}`);
  const bsxList = res.match(/<div class="hot-item mycover">([\s\S]+?)a>[\s\S]+?<\/div>/g);
  const mangas = [];

  bsxList.forEach((element) => {
   console.log(element);
   const url = element.match(/href="(.+?)"/)[1];
   const title = element.match(/<h3>(.+?)<\/h3>/)[1];
   const cover = element.match(/src="(.+?)"/)[1];
   mangas.push({
    title,
    url,
    cover,
   });
  });
  return mangas;
 }

 async detail(url) {
  const res = await this.request(url, {
   headers: {
    "miru-referer": "https://manga18fx.com/",
   },
  });

  const titleRegex = /property="og:title" content="(.+?)"/;
  const titleMatch = res.match(titleRegex);
  const title = titleMatch ? titleMatch[1] : null;

  const coverRegex = /data-src="(.+?)"/;
  const coverMatch = res.match(coverRegex);
  const cover = coverMatch ? coverMatch[1] : null;

  const descriptionRegex = /property="og:description" content="(.+?)"/;
  const descriptionMatch = res.match(descriptionRegex);
  const desc = descriptionMatch ? descriptionMatch[1] : null;

  const liListRegex = /<li class="a-h">([\s\S]+?)<\/a>[\s\S]+?<\/li>/g;
  const liListMatch = res.match(liListRegex);
  const episodes = [];

  if (liListMatch) {
   liListMatch.forEach((element) => {
    const chapterNumRegex = /<a class="chapter-name text-nowrap mycover>([^<]+?)<\/a>/;
    const chapterNumMatch = element.match(chapterNumRegex);
    const chapterNum = chapterNumMatch ? chapterNumMatch[1] : null;

    const chapterUrlRegex = /<a href="(.+?)">/;
    const chapterUrlMatch = element.match(chapterUrlRegex);
    const chapterUrl = chapterUrlMatch ? chapterUrlMatch[1] : null;

    if (chapterNum && chapterUrl) {
     episodes.push({
      chapterNum,
      chapterUrl,
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

  const contentRegex = /<div class="read-content">([\s\S]+?)<\/div>/;
  const contentMatch = res.match(contentRegex);
  const content = contentMatch ? contentMatch[1] : null;

  if (!content) {
   return {
    imageUrls: [],
   };
  }

  const imgRegex = /<img class="p\d+" data-src="([^"]+)" src=""/g;
  const imgMatches = Array.from(content.matchAll(imgRegex));
  const imageUrls = imgMatches.map((match) => match[1]);

  return {
   imageUrls: imageUrls || [],
  };
 }
}
