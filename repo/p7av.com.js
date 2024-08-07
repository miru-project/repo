// ==MiruExtension==
// @name         在线影院
// @version      v0.0.2
// @author       OshekharO
// @lang         jp
// @license      MIT
// @package      p7av.com
// @type         bangumi
// @icon         https://haha888.xyz/wp-content/uploads/2024/03/cropped-Screenshot-from-2024-03-02-10-42-19-192x192.png
// @webSite      https://www.haha888.xyz
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/page/${page}/`);
    const bsxList = await this.querySelectorAll(res, "article.entry-card");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2 > a").text;
      const cover = await this.querySelector(html, "img.attachment-medium.size-medium.wp-post-image").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url: "https://www.haha888.xyz" + url,
        cover,
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

    const title = await this.querySelector(res, "h1.page-title").text;
    const cover = await this.querySelector(res, "meta[name='twitter:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "meta[name='twitter:card']").getAttributeText("content");
    const name = await this.querySelector(res, "h6").text;
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
      cover,
      desc,
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: name,
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
      Referer: "https://www.haha888.xyz/",
    };
    return {
      type: "hls",
      url: url || "",
      headers: hh,
    };
  }
}
