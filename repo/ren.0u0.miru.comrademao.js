// ==MiruExtension==
// @name         comrademao
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      ren.0u0.miru.comrademao
// @type         fikushon
// @webSite      https://comrademao.com
// @nsfw         false
// ==/MiruExtension==

export default class Comradmao extends Extension {
 async latest() {
  const res = await this.request("/");
  const bsxList = res.match(/<div class="bsx">([\s\S]+?)<\/div>/g);
  const novels = [];

  const urlRegex = /<a\s+href="([^"]+)"\s+title="[^"]+">/;
  const titleRegex = /<div\s+class="tt">\s*([^<]+)\s*<\/div>/;
  const coverRegex = /<img\s+src="([^"]+)"\s+width="300"\s+height="300">/;

  bsxList.forEach((element) => {
   const urlMatch = element.match(urlRegex);
   const url = urlMatch ? urlMatch[1] : null;

   const titleMatch = element.match(titleRegex);
   const title = titleMatch ? titleMatch[1] : null;

   const coverMatch = element.match(coverRegex);
   const cover = coverMatch ? coverMatch[1] : null;

   if (url && title && cover) {
    novels.push({
     title,
     url,
     cover,
    });
   }
  });

  return novels;
 }

 async search(kw, page) {
  const res = await this.request(`/page/${page}/?s=${kw}&post_type=novel`);
  const liList = res.match(/<div class="limit">([\s\S]+?)<\/div>/g);
  const novels = [];

  liList.forEach((element) => {
   const url = element.match(/href="(.+?)"/)[1];
   const title = element.match(/class="tt">(.+?)<\/div>/)[1];
   const cover = element.match(/src="(.+?)"/)[1];
   novels.push({
    title,
    url,
    cover,
   });
  });

  return novels;
 }

 async detail(url) {
  const res = await this.request(url, {
   headers: {
    "miru-referer": "https://comrademao.com/",
   },
  });

  const title = res.match(/<h1 class="entry-title">(.+?)<\/h1>/)[1];
  const cover = res.match(/<img src="(.+?)" class="attachment- size- wp-post-image"/)[1];
  const desc = res.match(/<b>Description: <\/b>\s*<span>(.+?)<\/span>/)[1];

  const liList = res.match(/<li data-num=".+?">([\s\S]+?)<\/li>/g);
  const episodes = [];

  liList.forEach((element) => {
   const chapterNum = element.match(/<span class="chapternum">(.+?)<\/span>/)[1];
   const chapterUrl = element.match(/<a href="(.+?)">/)[1];
   episodes.push({
    chapterNum,
    chapterUrl,
   });
  });

  return {
   title,
   cover,
   desc,
   episodes: [
    {
     title: "Directory",
     urls: episodes,
    },
   ],
  };
 }

 async watch(url) {
  const res = await this.request(url, {
   headers: {
    "miru-referer": "https://comrademao.com/",
   },
  });

  const title = res.match(/<h3 class="doc_header__name js-search-mark">(.+?)<\/h3>/)[1];
  const chapterContentDiv = res.match(/<div id="chaptercontent" class="chaptercontent"(.+?)<\/div>/)[0];

  const contents = chapterContentDiv.match(/&emsp;&emsp;(.+?)<br \/>/g);
  const content = contents.map((e) => e.match(/&emsp;&emsp;(.+?)<br \/>/)[1]);

  return {
   title,
   content,
  };
 }
}
