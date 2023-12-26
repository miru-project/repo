// ==MiruExtension==
// @name         NETFAPX
// @version      v0.0.1
// @author       bachig26
// @lang         en
// @license      MIT
// @package      netfapx.com
// @type         bangumi
// @icon         https://netfapx.com/wp-content/uploads/2017/11/netfapx-lg-1_319381e1f227e13ae1201bfa30857622.png
// @webSite      https://netfapx.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/page/${page}/?orderby=newest`);
    const bsxList = await this.querySelectorAll(res, "article.pinbox");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3.title-2").text;
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
	const kwstring = kw.replace(/ /g, '+');
    const res = await this.request(`/?s=${kwstring}`);
    const bsxList = await this.querySelectorAll(res, "article.pinbox");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3.title-2").text;
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

    const title = await this.querySelector(res, "h1").text;
	const cover = res.match(/"posterImage": "(.+?)"/)[1];
	const desc = await this.querySelector(res, "div.su-expand-content > p").text;
	
	const urlPatterns = [/<video id="player-id" style="width: 100%;height: 100%"><source src="(.+?\.mp4)"/];
	
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
	  desc: desc.trim(),
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