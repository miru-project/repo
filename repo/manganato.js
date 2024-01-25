// ==MiruExtension==
// @name         Manganato
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://manganato.com/themes/hm/images/logo.png
// @package      manganato
// @type         manga
// @webSite      https://manganato.com
// ==/MiruExtension==

export default class extends Extension {
 async req(url) {
  return this.request(url, {
   headers: {
    "Miru-Url": await this.getSetting("manganato"),
   },
  });
 }

 async load() {
  this.registerSetting({
   title: "Base URL",
   key: "manganato",
   type: "input",
   description: "Homepage URL for Manganato",
   defaultValue: "https://manganato.com",
  });

  this.registerSetting({
   title: "Reverse Order of Chapters",
   key: "reverseChaptersOrder",
   type: "toggle",
   description: "Reverse the order of chapters in ascending order",
   defaultValue: "true",
  });
 }

 async latest() {
  const res = await this.req(`/`);
  const latest = await this.querySelectorAll(res, "div.content-homepage-item");

  let comic = [];
  for (const element of latest) {
   const html = await element.content;
   const url = await this.getAttributeText(html, "a.a-h", "href");
   const title = await this.querySelector(html, "a.a-h").text;
   const cover = await this.querySelector(html, "img.img-loading").getAttributeText("src");

   comic.push({
    title: title.trim(),
    url,
    cover,
   });
  }
  return comic;
 }

 async search(kw) {
  const kwstring = kw.replace(/ /g, "_");
  const res = await this.req(`/search/story/${kwstring}`);
  const searchList = await this.querySelectorAll(res, "div.search-story-item");
  const result = await Promise.all(
   searchList.map(async (element) => {
    const html = await element.content;
    const url = await this.getAttributeText(html, "a.a-h", "href");
    const title = await this.querySelector(html, "a.a-h").text;
    const cover = await this.querySelector(html, "img.img-loading").getAttributeText("src");

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
  const cover = await this.querySelector(res, "img.img-loading").getAttributeText("src");
  const desc = await this.querySelector(res, "div.panel-story-info-description").text;

  const epiList = await this.querySelectorAll(res, "li.a-h");
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
  const res = await this.request("", {
   headers: {
    "Miru-Url": url,
   },
  });

  const images = await Promise.all(
   (await this.querySelectorAll(res, "div.container-chapter-reader > img")).map(async (element) => {
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
