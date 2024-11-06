// ==MiruExtension==
// @name         MkvDrama
// @version      v0.0.2
// @author       bachig26
// @lang         en
// @license      MIT
// @package      stream.mkvdrama.org
// @type         bangumi
// @icon         https://mkvdrama.org/wp-content/uploads/2023/03/474a064744e1d9fe02e1124b2b071c70.png
// @webSite      https://stream.mkvdrama.org
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/popular?page=${page}`);
    const bsxList = await this.querySelectorAll(res, "div.list-upd > div.drama-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "b").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");

      novel.push({
        title: title.trim(),
        url: "https://stream.mkvdrama.org" + url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/search.html?keyword=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.list-upd > div.drama-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "b").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");

      novel.push({
        title: title.trim(),
        url: "https://stream.mkvdrama.org" + url,
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

    const title = await this.querySelector(res, "span.date").text;
    const cover = await this.querySelector(res, "img.episode-picture").getAttributeText("src");
    const desc = await this.querySelector(res, "div.content-more-js > p").text;
    const episodes = [];
    const epiList = await this.querySelectorAll(res, "div.episode-grid > article.episode-card");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "h2").text;
      const url = await this.getAttributeText(html, "a", "href");

      episodes.push({
        name: name.trim(),
        url,
      });
    }

    return {
      title: title.trim(),
      cover,
      desc: desc.trim(),
      episodes: [
        {
          title: "Directory",
          urls: episodes.reverse(),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": `https://stream.mkvdrama.org${url}`,
      },
    });
    const urlPatterns = [/<iframe id="iframe-to-load" src="(.+?)"/];

    let episodeUrl = "";

    for (const pattern of urlPatterns) {
      const match = res.match(pattern);
      if (match) {
        episodeUrl = match[1];
        break;
      }
    }

    const iframeLinkRes = await this.request("", {
      headers: {
        "Miru-Url": "https://stream.mkvdrama.org" + episodeUrl,
      },
    });

    const directUrlMatch = iframeLinkRes.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
    const directUrl = directUrlMatch ? directUrlMatch[0] : "";

    return {
      type: "hls",
      url: directUrl || "",
      headers: {
        referer: "https://stream.mkvdrama.org/",
        origin: "https://stream.mkvdrama.org",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
      },
    };
  }
}
