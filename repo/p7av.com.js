// ==MiruExtension==
// @name         在线影院
// @version      v0.0.1
// @author       OshekharO
// @lang         jp
// @license      MIT
// @package      p7av.com
// @type         bangumi
// @icon         https://javgg.net/wp-content/uploads/2020/07/140_Gg_logo_logos-512.png
// @webSite      https://www.haha888.xyz
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/page/${page}/`);
    const bsxList = await this.querySelectorAll(res, "div.video-block.thumbs-rotation");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span.title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title: title.trim(),
        url: "https://www.haha888.xyz" + url,
        cover: "https:" + cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/search/${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.video-block.thumbs-rotation");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "span.title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title: title.trim(),
        url: "https://www.haha888.xyz" + url,
        cover: "https:" + cover,
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

    const title = await this.querySelector(res, "div.video-title > h1").text;
    const cover = await this.querySelector(res, "meta[name='twitter:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "meta[name='twitter:card']").getAttributeText("content");
    const urlPatterns = [/https?:\/\/[^\s'"]+\.(?:mp4|m3u8)/];

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
      cover: "https:" + cover,
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
    return {
      type: "hls",
      url: url || "",
    };
  }
}
