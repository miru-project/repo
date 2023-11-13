// ==MiruExtension==
// @name         GakiArchives
// @version      v0.0.1
// @author       bachig26
// @lang         en
// @license      MIT
// @package      gakiarchives.com
// @type         bangumi
// @icon         https://gakiarchives.com/images/logo.png
// @webSite      https://gakiarchives.com
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/all`);
    const bsxList = await this.querySelectorAll(res, "div.owl-items.w-25");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url: "https://gakiarchives.com" + url,
        cover: "https://gakiarchives.com" + cover,
      });
    }
    return novel;
  }

  async search(kw) {
	const kwstring = kw.replace(/ /g, '+');
    const res = await this.request(`/search/${kwstring}`);
    const bsxList = await this.querySelectorAll(res, "div.owl-items.w-25");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url: "https://gakiarchives.com" + url,
        cover: "https://gakiarchives.com" + cover,
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

    const title = await this.querySelector(res, "div.card-header > h3").text;
    //const cover = await this.querySelector(res, "").getAttributeText("");
	//const desc = await this.querySelector(res, "i.far.fa-folder > a").text;
    const urlPatterns = [/https?:\/\/[^\s'"]+\.(?:m3u8)/];

    let episodeUrl = "";

    for (const pattern of urlPatterns) {
      const match = res.match(pattern);
      if (match) {
        episodeUrl = match[0];
        break;
      }
    }

    return {
      title: title.trim(),
      //cover: "https://gakiarchives.com" + cover,
	  //desc,
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
    return {
      type: "hls",
      url: url || "",
    };
  }
}
