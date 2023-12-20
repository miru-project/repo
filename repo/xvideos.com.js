// ==MiruExtension==
// @name         XVIDEOS
// @version      v0.0.1
// @author       bachig26
// @lang         en
// @license      MIT
// @package      xvideos.com
// @type         bangumi
// @icon         https://static-ss.xvideos-cdn.com/v3/img/skins/default/logo/xv.white.180.png
// @webSite      https://www.xvideos.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/new/${page}`);
    const bsxList = await this.querySelectorAll(res, "div.thumb-block");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "div.thumb > a", "href");
      const title = await this.querySelector(html, "p.title > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title,
        url: "https://www.xvideos.com" + url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
	const kwstring = kw.replace(/ /g, '+');
    const res = await this.request(`/?k=${kwstring}`);
    const bsxList = await this.querySelectorAll(res, "div.thumb-block");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "div.thumb > a", "href");
      const title = await this.querySelector(html, "p.title > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title,
        url: "https://www.xvideos.com" + url,
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

    const title = await this.querySelector(res, "meta[property='og:title']").getAttributeText("content");
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
	const desc = await this.querySelector(res, "li.main-uploader > a > span.name").text;

	const urlPatterns = [/https?:\/\/[^\s'"]+\.(?:m3u8)/];
	//const urlPatterns = [/https:\/\/cdn77-vid.xvideos-cdn.com\/(.+?).m3u8/];
	
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
      cover,
	  desc,
	  //desc: desc.trim(),
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
