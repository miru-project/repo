// ==MiruExtension==
// @name         YoMovies
// @version      v0.0.1
// @author       OshekharO
// @lang         hi
// @license      MIT
// @package      yomovies
// @type         bangumi
// @icon         https://yomovies.makeup/wp-content/uploads/2023/09/lCTCOE-file-play-oranje-png-wikimedia-commons.png
// @webSite      https://yomovies.cheap
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(res, "div.ml-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "div.qtip-title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-original");

      novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/?s=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.ml-item");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "div.qtip-title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-original");
       novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request('', {
        headers: {
            "Miru-Url": url,
        },
    });

    const title = await this.querySelector(res, "meta[property='og:title']").getAttributeText("content");
    const cover = await this.querySelector(res, "img[itemprop='image']").getAttributeText("src");
    const desc = await this.querySelector(res, "p.f-desc").text;

    const episodeUrl = res.match(/https:\/\/minoplres\.[^\s'"]+/);
    //console.log(episodeUrl)
    return {
        title: title.trim(),
        cover,
        desc,
        episodes: [
            {
                title: "Directory",
                urls: [
                    {
                        name: title.trim(),
                        url: episodeUrl ? episodeUrl[0] : "",
                    },
                ],
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
    //console.log(res)
    const dwishLink = res.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
    const directUrl = dwishLink ? dwishLink[0] : "https://download.samplelib.com/mp4/sample-5s.mp4";
    //console.log(directUrl)
    return {
      type: "hls",
      url: directUrl || "",
    };
  }
}
