// ==MiruExtension==
// @name         LayarKaca
// @version      v0.0.2
// @author       OshekharO
// @lang         id
// @license      MIT
// @package      lk21official
// @type         bangumi
// @icon         https://s8.lk21static.xyz/wp-content/themes/dunia21/images/favicon-set/apple-icon-144x144.png
// @webSite      https://tv3.lk21official.wiki
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/latest/");
    const bsxList = await this.querySelectorAll(res, "article.mega-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h1.grid-title > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");

      if (!/season|episode|series/i.test(title)) {
        novel.push({
          title,
          url,
          cover: "https:" + cover,
        });
      }
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/search.php?s=${kw}#gsc.tab=0&gsc.q=${kw}&gsc.page=1`);
    const bsxList = await this.querySelectorAll(res, "div.search-item");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3 > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");

      if (!/season|episode|series/i.test(title)) {
        novel.push({
          title,
          url: "https://tv3.lk21official.wiki" + url,
          cover: "https://tv3.lk21official.wiki" + cover,
        });
      }
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const title = await this.querySelector(res, "blockquote > a").text;
    const cover = await this.querySelector(res, "img.img-thumbnail").getAttributeText("src");
    const desc = await this.querySelector(res, "div.content > blockquote").text;

    const urlPatterns = [
      /https:\/\/playeriframe\.shop\/iframe\.php\?url=https%3A%2F%2Femturbovid\.[^'"\s]+/,
      /https:\/\/playeriframe.shop\/iframe\.php\?url=https%3A%2F%2Flayarkacaxxi\.[^'"\s]+/,
      /https:\/\/emturbovid\.[^\s'"]+/,
    ];

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
      desc: desc.replace("Synopsis", "").trim(),
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: `Watch ${title}`,
              url: episodeUrl,
            },
          ],
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

    let directUrl = "";

    if (url.startsWith("https://playeriframe.shop/iframe.php?url=https%3A%2F%2Flayarkacaxxi.icu")) {

      const mbedLink = res.match(/https:\/\/layarkacaxxi\.[^\s'"]+/);

      const emturbovidRes = await this.request("", {
        headers: {
          "Miru-Url": mbedLink,
          "referer": "https://emturbovid.com/",
          "origin": "https://emturbovid.com",
        },
        method: "Get",
      });

      const directUrlMatch = emturbovidRes.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
      directUrl = directUrlMatch ? directUrlMatch[0] : "";
    } else if (url.startsWith("https://emturbovid")) {
      
      const directUrlMatch = res.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
      directUrl = directUrlMatch ? directUrlMatch[0] : "";
    } else if (url.startsWith("https://playeriframe.shop/iframe.php?url=https%3A%2F%2Femturbovid.com")) {

      const embedLink = res.match(/https:\/\/emturbovid\.[^\s'"]+/);

      const emturbovidRes = await this.request("", {
        headers: {
          "Miru-Url": embedLink,
          "referer": "https://emturbovid.com/",
          "origin": "https://emturbovid.com",
        },
        method: "Get",
      });

      const directUrlMatch = emturbovidRes.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
      directUrl = directUrlMatch ? directUrlMatch[0] : "";
    }

    return {
      type: "hls",
      url: directUrl || "",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
        referer: directUrl,
      },
    };
  }
}
