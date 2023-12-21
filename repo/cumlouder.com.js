// ==MiruExtension==
// @name         CUMLOUDER
// @version      v0.0.1
// @author       bachig26
// @lang         en
// @license      MIT
// @package      cumlouder.com
// @type         bangumi
// @icon         https://logos-world.net/wp-content/uploads/2020/12/CumLouder-Logo-New-700x394.png
// @webSite      https://www.cumlouder.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/series/newest/${page}/`);
    const bsxList = await this.querySelectorAll(res, "div.medida > a.muestra-escena");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title: title.trim(),
        url: "https://www.cumlouder.com" + url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://www.cumlouder.com/search/?q=${kw}",
        "Content-Type": "application/x-www-form-urlencoded",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/jxl,image/webp,*/*;q=0.8',
		'Accept-Encoding': 'gzip',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
		"referer": "https://www.cumlouder.com/",
        "origin": "https://www.cumlouder.com",
      },
      data: {
        'form[search]': kw,
		//'form[_token]':
      },
      method: "POST",
    });
	
    const bsxList = await this.querySelectorAll(res, "a.muestra-escena");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      novel.push({
        title: title.trim(),
        urll: "https://www.cumlouder.com" + url,
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
	const cover = await this.querySelector(res, "video.video-js.vjs-cumlouder-skin").getAttributeText("poster");
	const desc = await this.querySelector(res, "meta[name='description']").getAttributeText("content");
	const urlPatterns = [/<source src="(.+?)"/];
	
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