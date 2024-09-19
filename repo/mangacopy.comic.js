// ==MiruExtension==
// @name         拷贝漫画
// @version      v0.0.2
// @author       Monster
// @lang         zh-cn
// @license      MIT
// @package      mangacopy.comic
// @type         manga
// @icon         https://hi77-overseas.mangafuna.xyz/static/free.ico
// @webSite      https://www.mangacopy.com
// ==/MiruExtension==

export default class extends Extension {
  decrypt(data, key, iv) {
    iv = CryptoJS.enc.Utf8.parse(iv);
    key = CryptoJS.enc.Utf8.parse(key);
    let result = CryptoJS.AES.decrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
    });
    let text = CryptoJS.enc.Utf8.stringify(result).toString();
    return text;
  }

  decodeUnicode(str) {
    return decodeURIComponent(str.replace(/\\u/gi, "%u"));
  }
  async latest(page) {
    let keyword = `/api/v3/comics?free_type=1&limit=24&offset=${page - 1}*20&_update=true&ordering=popular`;

    const res = await this.request(keyword);

    const manga = [];
    res.results.list.forEach((element) => {
      manga.push({
        title: element.name,
        cover: element.cover,
        url: element.path_word,
      });
    });
    return manga;
  }

  async search(kw, page) {
    let offset = (page - 1) * 20;
    let keyword = `/api/kb/web/searchba/comics?offset=${offset}&platform=2&limit=12&q=${kw}&q_type=`;

    const res = await this.request(keyword);

    const manga = [];
    res.results.list.forEach((element) => {
      manga.push({
        title: element.name,
        cover: element.cover,
        url: element.path_word,
      });
    });
    return manga;
  }

  async detail(url) {
    const res = await this.request(`/comicdetail/${url}/chapters`);

    let results = res.results;
    // console.log("密文"+results);
    let iv = results.substring(0, 16);
    results = results.replace(iv, "");
    let key = "xxxmanga.woo.key";

    let value = CryptoJS.enc.Hex.parse(results);
    let minyMin = CryptoJS.enc.Base64.stringify(value);

    let result = this.decodeUnicode(this.decrypt(minyMin, key, iv));
    // console.log(result);
    result = JSON.parse(result);

    let chapters = [];
    let urls_ = [];

    // 检查 result.groups.default 是否存在以及是否包含 chapters 属性
    if (result.groups && result.groups.default && result.groups.default.chapters) {
      chapters = result.groups.default.chapters;

      for (let i = 0; i < chapters.length; i++) {
        urls_.push({
          name: chapters[i].name,
          url: url + "#" + chapters[i].id,
        });
      }
    }
    // console.log(urls_);
    const detail_info = await this.request(`/api/v3/comic2/${url}?platform=1`);

    // console.log(detail_info);
    return {
      title: detail_info.results.comic.name,
      cover: detail_info.results.comic.cover,
      desc: detail_info.results.comic.brief,
      episodes: [
        {
          title: "国内直连",
          urls: urls_,
        },
      ],
    };
  }

  async watch(url) {
    const flag = url.split("#");

    const res = await this.request(`/comic/${flag[0]}/chapter/${flag[1]}`);

    let result = res.match(/contentKey="(.*)"/)[1];

    let iv = result.substring(0, 16);
    result = result.replace(iv, "");

    let key = "xxxmanga.woo.key";
    let value = CryptoJS.enc.Hex.parse(result);
    let minyMin = CryptoJS.enc.Base64.stringify(value);

    let results = this.decodeUnicode(this.decrypt(minyMin, key, iv));
    // console.log(results);
    results = JSON.parse(results);

    let urls = [];
    for (var i = 0; i < results.length; i++) {
      urls.push(results[i]["url"]);
    }
    console.log(urls);
    let hh = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
      Referer: url,
    };

    return {
      urls,
      headers: hh,
    };
  }
}
