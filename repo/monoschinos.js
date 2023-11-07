// ==MiruExtension==
// @name         MonosChinos
// @version      v0.0.1
// @author       OshekharO
// @lang         es
// @license      MIT
// @package      monoschinos
// @type         bangumi
// @icon         https://monoschinos2.com/public/img/logo6.png
// @webSite      https://monoschinos2.com
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/animes?p=${page}`);
    const bsxList = await this.querySelectorAll(res, "div.row > div.col-md-4.col-lg-2.col-6");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3.seristitles").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      //console.log(title+cover+url)
      novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/buscar?q=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.row > div.col-md-4.col-lg-2.col-6");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3.seristitles").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
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

    const title = await this.querySelector(res, "h1.mobh1").text;
    const cover = await this.querySelector(res, "img.lozad.animeimghv").getAttributeText("data-src");
    const desc = await this.querySelector(res, "p.textShort").text;
    const episodes = [];
    const epiList = await this.querySelectorAll(res, "div.row.jpage > div.col-item");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "p.animetitles").text;
      const url = await this.getAttributeText(html, "a", "href");

      episodes.push({
        name: name.trim(),
        url,
      });
    }

    return {
      title: title.trim(),
      cover,
      desc,
      episodes: [
        {
          title: "Directory",
          urls: episodes,
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const urlPatterns = [/<p class="play-video" data-player="([^"]*)">embedwish<\/p>/, /<p class="play-video" data-player="([^"]*)">uqload<\/p>/, /<p class="play-video" data-player="([^"]*)">voe<\/p>/];

    let episodeUrl = "";

    for (const pattern of urlPatterns) {
      const match = res.match(pattern);
      if (match) {
        episodeUrl = match[0];
        break;
      }
    }

    const words = CryptoJS.enc.Base64.parse(episodeUrl.match(/data-player="(.+?)"/)[1]);
    var textString = CryptoJS.enc.Utf8.stringify(words);

    const dwishLinkRes = await this.request("", {
      headers: {
        "Miru-Url": textString,
      },
    });

    const directUrlMatch = dwishLinkRes.match(/https:\/\/[^\s'"]+\.(?:mp4|m3u8)[^\s'"]*/);
    const directUrl = directUrlMatch ? directUrlMatch[0] : "";

    return {
      type: "hls",
      url: directUrl || "",
    };
  }
}
