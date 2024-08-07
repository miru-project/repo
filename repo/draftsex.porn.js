// ==MiruExtension==
// @name         Draftsex
// @version      v0.0.2
// @author       bachig26
// @lang         en
// @license      MIT
// @package      draftsex.porn
// @type         bangumi
// @icon         https://draftsex.porn/templates/ds/images/draftsex.png
// @webSite      https://draftsex.porn
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/page${page}.html`);
    const bsxList = await this.querySelectorAll(res, "div.item.col");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span.item__title-label").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title,
        url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
	const kwstring = kw.replace(/ /g, '-');
    const res = await this.request(`/search/${kwstring}/`);
    const bsxList = await this.querySelectorAll(res, "div.item.col");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span.item__title-label").text;
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
    const res = await this.request("", {
        headers: {
            "Miru-Url": url,
        },
    });

    const title = await this.querySelector(res, "h1.mhead__h").text;
	const cover = res.match(/posterImage: "(.+?)"/)[1];
	const desc = await this.querySelector(res, "ul.tag-list > span.tag-list__label").text;
	
	const urlPatterns = [/<source title='Best Quality' src="(.+?\.mp4)"/];
	
    let episodeUrl = "";

    for (const pattern of urlPatterns) {
      const match = res.match(pattern);
      if (match) {
        episodeUrl = match[1];
        break;
      }
    }

    return {
      title: title.trim(),
      cover,
	  desc,
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: title,
              url: episodeUrl,
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    let hh = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
         Referer: "https://draftsex.porn/",
      };    
    return {
      type: "hls",
      url: url || "",
      headers: hh,      
    };
  }
}
