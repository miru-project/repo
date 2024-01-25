// ==MiruExtension==
// @name         ComicExtra
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://comicextra.me/favicon.ico
// @package      comicextra
// @type         manga
// @webSite      https://comicextra.me
// ==/MiruExtension==

export default class extends Extension {
 async req(url) {
  return this.request(url, {
   headers: {
    "Miru-Url": await this.getSetting("comicextra"),
   },
  });
 }

 async load() {
  this.registerSetting({
   title: "Base URL",
   key: "comicextra",
   type: "input",
   description: "Homepage URL for ComicExtra",
   defaultValue: "https://comicextra.me",
  });

  this.registerSetting({
   title: "Reverse Order of Chapters",
   key: "reverseChaptersOrder",
   type: "toggle",
   description: "Reverse the order of chapters in ascending order",
   defaultValue: "true",
  });
 }

 async latest(page) {
  const res = await this.req(`/popular-comic/${page}`);
  const latest = await this.querySelectorAll(res, "div.movie-list-index.home-v2 > div.cartoon-box");

  let comic = [];
  for (const element of latest) {
   const html = await element.content;
   const url = await this.getAttributeText(html, "h3 > a", "href");
   const title = await this.querySelector(html, "h3 > a").text;
   const cover = await this.querySelector(html, "img").getAttributeText("src");

   comic.push({
    title: title.trim(),
    url,
    cover,
   });
  }
  return comic;
 }

 async search(kw, page) {
  const res = await this.req(`/comic-search?key=${kw}&page=${page}`);
  const searchList = await this.querySelectorAll(res, "div.movie-list-index.home-v2 > div.cartoon-box");
  const result = await Promise.all(
   searchList.map(async (element) => {
    const html = await element.content;
    const url = await this.getAttributeText(html, "h3 > a", "href");
    const title = await this.querySelector(html, "h3 > a").text;
    const cover = await this.querySelector(html, "img").getAttributeText("src");

    return {
     title: title.trim(),
     url,
     cover,
    };
   })
  );
  return result;
 }

 async detail(url) {
  const res = await this.request("", {
   headers: {
    "Miru-Url": url,
   },
  });

  const title = await this.querySelector(res, "h1").text;
  const cover = await this.querySelector(res, "div.movie-l-img > img").getAttributeText("src");
  const desc = await this.querySelector(res, "div.content").text;

  const epiList = await this.querySelectorAll(res, "tbody#list > tr");
  const episodes = await Promise.all(
   epiList.map(async (element) => {
    const html = await element.content;
    const name = await this.querySelector(html, "a").text;
    const url = await this.getAttributeText(html, "a", "href");
    return {
     name,
     url: url,
    };
   })
  );

  if ((await this.getSetting("reverseChaptersOrder")) === "true") {
   episodes.reverse();
  }

  return {
   title: title.trim(),
   cover,
   desc: desc.trim(),
   episodes: [
    {
     title: "Chapters",
     urls: episodes,
    },
   ],
  };
 }

 async watch(url) {
  const res = await this.request(`/full`, {
   headers: {
    "Miru-Url": url,
   },
  });

  const images = await Promise.all(
   (await this.querySelectorAll(res, "div.chapter-container > img")).map(async (element) => {
    const html = await element.content;
    let dataSrc = await this.getAttributeText(html, "img", "src");
    dataSrc = dataSrc.trim();
    return dataSrc;
   })
  );

  return {
   urls: images,
  };
 }
}
