// ==MiruExtension==
// @name         PornTrex
// @version      v0.0.1
// @author       bachig26
// @lang         en
// @license      MIT
// @package      porntrex.com
// @type         bangumi
// @icon         https://ptx.cdntrex.com/images/logo.png
// @webSite      https://www.porntrex.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/latest-updates/${page}/`,{
          headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
			"referer": "https://www.porntrex.com/",
          },
    });
    const bsxList = await this.querySelectorAll(res, "div.video-preview-screen.video-item.thumb-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.thumb.rotator-screen", "href");
      const title = await this.querySelector(html, "p.inf > a").text;
      const cover = await this.querySelector(html, "img.cover").getAttributeText("data-src");
      novel.push({
        title,
        url,
        cover: "https:" + cover,
      });
    }
    return novel;
  }

  async search(kw) {
	const kwstring = kw.replace(/ /g, '-');
    const res = await this.request(`/search/${kwstring}/`,{
          headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
			"referer": "https://www.porntrex.com/",
          },
    });
    const bsxList = await this.querySelectorAll(res, "div.video-preview-screen.video-item.thumb-item");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.thumb.rotator-screen", "href");
      const title = await this.querySelector(html, "p.inf > a").text;
      const cover = await this.querySelector(html, "img.cover").getAttributeText("data-src");
      novel.push({
        title,
        url,
        cover: "https:" + cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request("", {
        headers: {
            "Miru-Url": url,
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
			"referer": "https://www.porntrex.com/",
        },
    });

    const title = await this.querySelector(res, "meta[property='og:title']").getAttributeText("content");
	const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
	const desc = await this.querySelector(res, "meta[property='og:description']").getAttributeText("content");
	
	const urlPatterns = [/video_alt_url3: '(.+?\.mp4)\/'/];
	
	//video_url: 'https://www.porntrex.com/get_file/21/fcdf102574d8ccd37d1f7933d87728037c25926675/885000/885818/885818_360p.mp4/',
	
	//video_alt_url: 'https://www.porntrex.com/get_file/21/7e1dbc164406cb902072084d45577d73c9cfb59170/885000/885818/885818.mp4/',
	
	//video_alt_url2: 'https://www.porntrex.com/get_file/21/40c4d89d07ef1d5e24219762be3c3518ee32880725/885000/885818/885818_720p.mp4/',
	
	//video_alt_url3: 'https://www.porntrex.com/get_file/21/828d90312b10255370ba258bed6d3d5dc20fab595f/885000/885818/885818_1080p.mp4/',
	
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
      cover: "https:" + cover,
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
	  headers: {
        "referer": "https://www.porntrex.com/",
        "origin": "https://www.porntrex.com",
        "Miru-Url": url,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
      }
    };
  }
}