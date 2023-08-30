// ==MiruExtension==
// @name         Comrademao
// @version      v0.0.3
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      comrademao
// @type         fikushon
// @icon         https://revuestarlight.bushimo.jp/wp-content/themes/revuestarlight/assets/images/common/favicon.ico
// @webSite      https://comrademao.com
// ==/MiruExtension==

export default class extends Extension {
 async latest() {
  const res = await this.request("/novel/");
  const bsxList = await this.querySelectorAll(res, "body > div.layout > div.bixbox > div#releases > div.listupd > div.bs");
  const novel = [];
  for (const element of bsxList) {
   const html = await element.content;
   const url = await this.getAttributeText(html, "div.bsx > a", "href");
   const title = await this.querySelector(html, "div.tt").text;
   const cover = await this.querySelector(html, ".ts-post-image.wp-post-image.attachment-medium.size-medium").getAttributeText("src");
   novel.push({
    title,
    url,
    cover,
   });
  }
  return novel;
 }

 async search(kw, page) {
  const res = await this.request(`/page/${page}/?s=${kw}&post_type=novel`);
  const bsxList = await this.querySelectorAll(res, "div.listupd > div.bs");
  const novel = [];

  for (const element of bsxList) {
   const html = await element.content;
   const url = await this.getAttributeText(html, "div.bsx > a", "href");
   const title = await this.querySelector(html, "div.tt").text;
   const cover = await this.querySelector(html, "img").getAttributeText("src");
   novel.push({
    title,
    url,
    cover,
   });
  }
  return novel;
 }

 async detail(url) {
  const res = await this.request(`/${url}`, {
   headers: {
    "miru-referer": "https://comrademao.com/",
   },
  });

  const title = await this.querySelector(res, ".entry-title").text;
  const cover = await this.querySelector(res, ".attachment-.size-.wp-post-image").getAttributeText("src");
  const desc = await this.querySelector(res, "div.infox > div.wd-full > span > p").text;

  const episodes = [];
  const epiList = await this.querySelectorAll(res, "#chapterlist > ul > li");

  for (const element of epiList) {
   const html = await element.content;
   const name = await this.querySelector(html, ".eph-num span.chapternum").text;
   const url = await this.getAttributeText(html, "div.eph-num > a", "href");

   episodes.push({
    name,
    url,
   });
  }

  return {
   title,
   cover,
   desc,
   episodes: [
    {
     title: "Chapters",
     urls: episodes.reverse(),
    },
   ],
  };
 }

 async watch(url) {
   const res = await this.request(`/${url}`);
   const content = await this.querySelectorAll(res, "div[readability] > p");
   const title = await this.querySelector(res, ".doc_header__name.js-search-mark").text;
    return {
      title,
      content,
    };
  }
}
