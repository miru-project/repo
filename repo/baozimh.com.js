// ==MiruExtension==
// @name         包子漫画
// @version      v0.0.2
// @author       appdevelpo
// @lang         zh
// @license      MIT
// @type         manga
// @icon         https://www.baozimh.com/favicon.ico
// @package      baozimh.com
// @webSite      https://www.baozimh.com
// @nsfw         false
// ==/MiruExtension==
export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/api/bzmhq/amp_comic_list?type=all&region=all&filter=*&page=${page}&limit=36&language=tw`, {
    });
    const jsonRes = JSON.parse(JSON.stringify(res));
    const mangas = jsonRes["items"].map((element) => {
      return {
        title: element.name,
        url: element["comic_id"],
        cover: `https://static-tw.baozimh.com/cover/${element["topic_img"]}`,
      }
    })
    return mangas;
  }

  async search(kw) {
    const res = await this.request(`/search?q=${kw}`);
    const select = await this.querySelectorAll(res, "div.pure-u-lg-1-6.pure-u-md-1-4.pure-u-sm-1-2");
    const mangas = [];
    for (const element of select) {
      const html = element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const cover = await this.getAttributeText(html, "amp-img", "src");
      const title = await this.getAttributeText(html, "a", "title");
      mangas.push({
        title,
        url,
        cover,
      })

    }
    return mangas;
  }

  async detail(url) {
    const res = await this.request((url.indexOf("comic") === -1) ? `/comic/${url}` : url);
    const select = await this.querySelectorAll(res, "#chapter-items > div.comics-chapters.pure-u-lg-1-4.pure-u-md-1-3.pure-u-sm-1-2.pure-u-1-1 > .comics-chapters__item");
    const select_extended = await this.querySelectorAll(res, "#chapters_other_list > div.comics-chapters.pure-u-lg-1-4.pure-u-md-1-3.pure-u-sm-1-2.pure-u-1-1 > .comics-chapters__item");
    const title = await this.querySelector(res, ".comics-detail__title").text
    const coverselector = await this.querySelectorAll(res, "div.pure-u-md-1-6.pure-u-sm-1-3.pure-u-1-1 > amp-img")
    const cover = await this.getAttributeText(coverselector[0].content, "amp-img", "src")
    const fullList = select.concat(select_extended);
    const desc = await this.querySelector(res, "p.overflow-hidden.comics-detail__desc").text
    const urls = []
    for (const element of fullList) {
      // console.log(element)
      const html = element.content
      const title = await this.querySelector(html, "span").text;
      const url = await this.getAttributeText(html, "a", "href");
      urls.push({
        name: title,
        url: url
      })

    }
    return {
      title: title.replaceAll("\n", "").replaceAll("\r\n", "").replaceAll(" ", ""),
      cover: cover,
      desc,
      episodes: [
        {
          title: "Directory",
          urls
        },
      ],
    };
  }

  async watch(url) {
    console.log(url);
    var res = await this.request(url);
    const urls = res.match(/"url": "https.+?"/g).map((item) => item.match(/"(https.+?)"/)[1]);
    console.log(urls[0]);

    while (res.includes("iconfont icon-xiangxia")) {
      const next = await this.getAttributeText(res, "a#next-chapter", "href");
      res = await this.request("", {
        headers: {
          "Miru-Url": next
        }

      });
      urls.push(...res.match(/"url": "https.+?"/g).map((item) => item.match(/"(https.+?)"/)[1]));
    }

    return {
      urls,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56"
      }
    };
  }
}

