// ==MiruExtension==
// @name         ReadComicsOnline
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://readcomicsonline.ru/images/banner.jpg
// @package      readcomicsonline.ru
// @type         manga
// @webSite      https://readcomicsonline.ru
// ==/MiruExtension==

export default class extends Extension {
 async req(url) {
  return this.request(url, {
   headers: {
    "Miru-Url": await this.getSetting("readcomicsonline"),
   },
  });
 }

 async load() {
  this.registerSetting({
   title: "Base URL",
   key: "readcomicsonline",
   type: "input",
   description: "Homepage URL for ReadComicsOnline",
   defaultValue: "https://readcomicsonline.ru",
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
  const res = await this.req(`/`);
  const latest = await this.querySelectorAll(res, "div.row > div.col-sm-6");

  let comic = [];
  for (const element of latest) {
   const html = await element.content;
   const url = await this.getAttributeText(html, "h5 > a", "href");
   const title = await this.querySelector(html, "h5 > a").text;
   const cover = await this.querySelector(html, "img").getAttributeText("src");

   comic.push({
    title: title.trim(),
    url,
    cover: "https:" + cover,
   });
  }
  return comic;
 }

 async search(kw) {
  const res = await this.req(`/search?query=${kw}`);
  return res.suggestions.map((item) => ({
   title: item.value,
   url: `https://readcomicsonline.ru/comic/${item.data}`,
   cover: `https://readcomicsonline.ru/uploads/manga/${item.data}/cover/cover_250x350.jpg`,
  }));
 }

 async detail(url) {
  const res = await this.request('', {
   headers: {
    "Miru-Url": url,
   },
  });

  const title = await this.querySelector(res, "h2").text;
  const cover = await this.querySelector(res, "img.img-responsive").getAttributeText("src");
  const desc = await this.querySelector(res, "div.manga.well > p").text;

  const epiList = await this.querySelectorAll(res, "ul.chapters > li");
  const episodes = await Promise.all(
   epiList.map(async (element) => {
    const html = await element.content;
    const name = await this.querySelector(html, "h5 > a").text;
    const url = await this.getAttributeText(html, "h5 > a", "href");
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
   cover: "https:" + cover,
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
  const res = await this.request('', {
   headers: {
    "Miru-Url": url,
   },
  });

  const images = await Promise.all(
   (await this.querySelectorAll(res, "div#all > img")).map(async (element) => {
    const html = await element.content;
    let dataSrc = await this.getAttributeText(html, "img", "data-src");
    dataSrc = dataSrc.trim();
    return dataSrc;
   })
  );

  return {
   urls: images,
  };
 }
}
