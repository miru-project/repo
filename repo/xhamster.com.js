// ==MiruExtension==
// @name         xHamster
// @version      v0.0.1
// @author       bachig26
// @lang         en
// @license      MIT
// @package      xhamster.com
// @type         bangumi
// @icon         https://static-lvlt.xhcdn.com/xh-desktop/images/favicon/favicon-512x512.png?v=1
// @webSite      https://xhamster.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/newest/${page}`);
    const bsxList = await this.querySelectorAll(res, "div.thumb-list__item.video-thumb");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.video-thumb__image-container.role-pop", "href");
      const title = await this.querySelector(html, "a.root-9d8b4.primary-9d8b4.video-thumb-info__name").text;
      const cover = await this.querySelector(html, "img.thumb-image-container__image").getAttributeText("src");
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
    const res = await this.request(`/search/${kwstring}`);
    const bsxList = await this.querySelectorAll(res, "div.thumb-list__item.video-thumb");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.video-thumb__image-container.role-pop", "href");
      const title = await this.querySelector(html, "a.root-9d8b4.primary-9d8b4.video-thumb-info__name").text;
      const cover = await this.querySelector(html, "img.thumb-image-container__image").getAttributeText("src");
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

    const title = await this.querySelector(res, "meta[property='og:title']").getAttributeText("content");
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
	
	//const urlPatterns = [/<video class="player-container__no-script-video" preload="auto"[^\"]*src="(.+?\.mp4)"/];
	//just 1080p mp4 stream
	//const urlPatterns = [/"h264":{"url":"(.+?)"}/]; //m3u8 stream, some videos doesn't play with this url
	
	const urlPatterns = [/<link rel="preload" href="(.+?)"/]; //m3u8 stream
	
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
	  headers: {
        "referer": "https://xhamster.com/",
        "origin": "https://xhamster.com",
        "Miru-Url": url,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
      }
    };
  }
}
