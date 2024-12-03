// ==MiruExtension==
// @name         G站漫画
// @version      v0.0.1
// @author       瑜君之学-杨瑜候
// @lang         zh
// @license      MIT
// @type         manga
// @icon         https://m.g-mh.org/assets/images/Logo.png
// @package      gzhanmh
// @webSite      https://m.g-mh.org
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  // 截取url
  extractImageUrl(imageUrl) {
    const urlIndex = imageUrl.indexOf("url=");

    const webpIndex = imageUrl.indexOf("&");

    const extractedUrl = imageUrl.substring(urlIndex + 4, webpIndex);
    return extractedUrl;
  }

  async latest(page) {
    const res = await this.request(`/manga/page/${page}`);
    const bsxList = await this.querySelectorAll(res, "div.pb-2");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3").text;
      const img = await this.getAttributeText(html, "img", "src");
      const cover = decodeURIComponent(this.extractImageUrl(img));
      novel.push({
        title,
        url: url,
        cover,
      });
    }

    return novel;
  }

  async search(keyword, page) {
    const res = await this.request(`/s/${keyword}?page=${page}`);
    const bsxList = await this.querySelectorAll(res, "div.pb-2");

    const lieBiao = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3").text;
      const img = await this.getAttributeText(html, "img", "src");
      const cover = decodeURIComponent(img);
      lieBiao.push({
        title,
        url: url,
        cover,
      });
    }

    return lieBiao;
  }

  async detail(url) {
    const coverRes = await this.request(`${url}`);
    const midMatch = /data-mid="(\d+)"/.exec(coverRes);
    const mid = midMatch ? midMatch[1] : null;
    let imgSrc = "";
    const regex = /<div class="aspect-3-4"[^>]*>([\s\S]*?)<\/div>/g;
    let match;
    while ((match = regex.exec(coverRes)) !== null) {
      const imgRegex = /<img[^>]*src="([^"]+)"/g;
      let imgMatch;
      while ((imgMatch = imgRegex.exec(match[1])) !== null) {
        imgSrc = imgMatch[1];
        break;
      }
      break;
    }

    // 获取目录列表json  headrs中的参数是用来绕过403
    const muLuRes = await this.request("", {
      headers: {
        "Miru-Url":
          "https://api-get-v2.mgsearcher.com/api/manga/get?mid=" +
          mid +
          "&mode=all",
        Accept: "*/*",
        Connection: "keep-alive",
        Origin: "https://m.g-mh.org",
        Priority: "u=1,i",
        Referer: "https://m.g-mh.org/",
        "User-Agent":
          "Mozilla/5.0(Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko)Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
      },
    });
    let chapterUrl;
    const muLuDAta = [];
    const data = muLuRes["data"];
    const chapters = data["chapters"];
    if (chapters && Array.isArray(chapters) && chapters.length > 0) {
      chapters.forEach((chapter) => {
        if (chapter["attributes"]) {
          chapterUrl = `https://m.g-mh.org/manga/${data["slug"]}/${chapter["attributes"]["slug"]}`;
        } else {
          chapterUrl = `https://m.g-mh.org/manga/${data["slug"]}/${chapter.id}`;
        }
        muLuDAta.push({
          name: chapter["attributes"]
            ? chapter["attributes"]["title"]
            : `Chapter ${chapter.id}`,
          url: chapterUrl,
        });
      });
    }

    const desc =
      (await this.querySelector(
        coverRes,
        "p.text-medium.line-clamp-4.my-unit-md"
      )?.text) ?? "";

    const title =
      (await this.querySelector(coverRes, "h1.mb-2.text-xl.font-medium")
        ?.text) ?? "";

    return {
      title: title,
      cover: decodeURIComponent(imgSrc),
      desc,
      episodes: [
        {
          title: "Directory",
          urls: muLuDAta,
        },
      ],
    };
  }
  async watch(url) {
    var res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });
    const ms = /data-ms="(\d+)"/.exec(res)
      ? /data-ms="(\d+)"/.exec(res)[1]
      : null;
    const cs = /data-cs="(\d+)"/.exec(res)
      ? /data-cs="(\d+)"/.exec(res)[1]
      : null;

    const manHuaYe = await this.request("", {
      headers: {
        "Miru-Url": `https://api-get-v2.mgsearcher.com/api/chapter/getinfo?m=${ms}&c=${cs}`,
        Accept: "*/*",
        Connection: "keep-alive",
        Origin: "https://m.g-mh.org",
        Priority: "u=1,i",
        Referer: "https://m.g-mh.org/",
        "User-Agent":
          "Mozilla/5.0(Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko)Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
      },
    });

    const info = manHuaYe["data"]["info"];
    let fullImageUrls = [];
    if (
      info &&
      info.images &&
      Array.isArray(info.images.images) &&
      info.images.images.length > 0
    ) {
      info.images.images.forEach((image) => {
        const fullUrl = `https://f40-1-4.g-mh.online${image.url}`;
        fullImageUrls.push(fullUrl);
      });
    }

    return {
      urls: fullImageUrls,
      headers: {
        "User-Agent":
          "Mozilla/5.0(Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko)Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
        Referer: "https://m.g-mh.org/",
      },
    };
  }
}
