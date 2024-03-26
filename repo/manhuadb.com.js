// ==MiruExtension==
// @name         漫画DB
// @version      v0.0.1
// @author       ftbom
// @lang         zh
// @license      MIT
// @type         manga
// @icon         https://www.manhuadb.com/assets/www/img/favicon.png
// @package      manhuadb.com
// @webSite      https://www.manhuadb.com
// @nsfw         false
// ==/MiruExtension==

export default class Mangafx extends Extension {
  baseurl = "https://www.manhuadb.com";
  headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    Referer: this.baseurl
  };
  
  base64decode(str) {
      var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
      var c1, c2, c3, c4;
      var i, len, out;
      len = str.length;
      i = 0;
      out = "";
      while (i < len) {
        do {
          c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (i < len && c1 == -1);
        if (c1 == -1)
          break;
        do {
          c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (i < len && c2 == -1);
        if (c2 == -1)
          break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        do {
          c3 = str.charCodeAt(i++) & 0xff;
          if (c3 == 61)
            return out;
          c3 = base64DecodeChars[c3]
        } while (i < len && c3 == -1);
        if (c3 == -1)
          break;
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
        do {
          c4 = str.charCodeAt(i++) & 0xff;
          if (c4 == 61)
            return out;
          c4 = base64DecodeChars[c4]
        } while (i < len && c4 == -1);
        if (c4 == -1)
          break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4)
      }
      return out
    }

  cover_convert(cover_url) {
    if (cover_url.search("com") == -1)
    {    
      return this.baseurl + cover_url;
    }
    return cover_url;
  }

  async get_mangas(url, search) {
    const res = await this.request(url, {headers: this.headers});
    var str;
    if (search) {
      str = "div.comicbook-index";
    }
    else {
      str = "div.media";
    }
    const items = await this.querySelectorAll(res, str);
    const mangas = [];
    for (let item of items)
    {
      const html = item.content;
      const cover = this.cover_convert(await this.getAttributeText(html, "a.d-block > img", "src"));
      var title;
      if (search) {
        title = await this.getAttributeText(html, "a.d-block", "title");
      }
      else {
        title = await this.getAttributeText(html, "a.d-block > img", "alt");
        title = title.replace("的封面图", "");
      }
      const url = await this.getAttributeText(html, "a.d-block", "href");
      mangas.push({
        title: title,
        url: url,
        cover: cover,
        headers: this.headers,
      });
    }
    return mangas;
  }

  async createFilter(filter) {
    const locations = {
      title: "地区",
      max: 1,
      min: 1,
      default: "all",
      options: {
        "all": "全部",
        "-r-4": "日本",
        "-r-5": "香港",
        "-r-6": "韩国",
        "-r-7": "台湾",
        "-r-8": "内地",
        "-r-9": "欧美",
      }
    };
    const readers = {
      title: "读者",
      max: 1,
      min: 1,
      default: "all",
      options: {
        "all": "全部",
        "-a-3": "少年",
        "-a-4": "青年",
        "-a-5": "少女",
        "-a-6": "男性",
        "-a-7": "女性",
        "-a-9": "通用",
        "-a-10": "儿童",
        "-a-11": "女青",
        "-a-12": "18限"
      }
    };
    const status = {
      title: "状态",
      max: 1,
      min: 1,
      default: "all",
      options: {
        "all": "全部",
        "-s-1": "连载中",
        "-s-2": "已完结"
      }
    }
    const categories = {
      title: "类型",
      max: 1,
      min: 1,
      default: "all",
      options: {
        "all": "全部",
        "-c-26": "爱情",
        "-c-66": "东方",
        "-c-12": "冒险",
        "-c-64": "欢乐向",
        "-c-39": "百合",
        "-c-41": "搞笑",
        "-c-20": "科幻",
        "-c-40": "校园",
        "-c-33": "生活",
        "-c-48": "魔幻",
        "-c-13": "奇幻",
        "-c-46": "热血",
        "-c-44": "格斗",
        "-c-71": "其他",
        "-c-52": "神鬼",
        "-c-43": "魔法",
        "-c-27": "悬疑",
        "-c-18": "动作",
        "-c-55": "竞技",
        "-c-72": "纯爱",
        "-c-32": "喜剧",
        "-c-59": "萌系",
        "-c-16": "恐怖",
        "-c-53": "耽美",
        "-c-56": "四格",
        "-c-80": "ゆり",
        "-c-54": "治愈",
        "-c-60": "伪娘",
        "-c-73": "舰娘",
        "-c-47": "励志",
        "-c-58": "职场",
        "-c-30": "战争",
        "-c-51": "侦探",
        "-c-21": "惊悚",
        "-c-22": "职业",
        "-c-9": "历史",
        "-c-11": "体育",
        "-c-45": "美食",
        "-c-68": "秀吉",
        "-c-67": "性转换",
        "-c-19": "推理",
        "-c-70": "音乐舞蹈",
        "-c-57": "后宫",
        "-c-29": "料理",
        "-c-61": "机战",
        "-c-78": "AA",
        "-c-37": "社会",
        "-c-76": "节操",
        "-c-17": "音乐",
        "-c-23": "武侠",
        "-c-65": "西方魔幻",
        "-c-28": "资料集",
        "-c-10": "传记",
        "-c-49": "宅男",
        "-c-69": "轻小说",
        "-c-62": "黑道",
        "-c-50": "舞蹈",
        "-c-42": "杂志",
        "-c-34": "灾难",
        "-c-77": "宅系",
        "-c-74": "颜艺",
        "-c-63": "腐女",
        "-c-81": "露营",
        "-c-82": "旅行",
        "-c-83": "TS"
      }
    }
    return {
      locations: locations,
      readers: readers,
      status: status,
      categories: categories
    };
  }

  async latest(page) {
    if (page > 1)
    {
      return [];
    }
    const res = await this.request("", {headers: this.headers});
    const items = await this.querySelectorAll(res, "div.comicbook-index");
    var mangas = [];
    for (let item of items)
    {
      const html = item.content;
      const cover = this.cover_convert(await this.getAttributeText(html, "a > img", "src"));
      const title = await this.getAttributeText(html, "a > img", "alt");
      const url = await this.getAttributeText(html, "a", "href");
      mangas.push({
        title: title.replace("封面", ""),
        url: url,
        cover: cover,
        headers: this.headers,
      });
    }
    return mangas;
  }

  async search(kw, page, filter) {
    if (kw)
    {    
      return await this.get_mangas(`/search?q=${kw}&p=${page}`, 1);
    }
    else
    {
      const url = `/manhua/list${filter["locations"][0]}${filter["readers"][0]}${filter["status"][0]}${filter["categories"][0]}-page-${page}.html`;
      console.log(url.replaceAll("all", ""));
      return await this.get_mangas(url.replaceAll("all", ""), 0);
    }
  }

  async detail(url) {
    const res = await this.request(url, {headers: this.headers});
    const title = await this.querySelector(res, "h1.comic-title").text;
    const cover = this.cover_convert(await this.getAttributeText(res, "td.comic-cover > img", "src"));
    const desc = await this.querySelector(res, "p.comic_story").text;
    const items = await this.querySelectorAll(res, "ol.links-of-books");
    const episodes = [];
    const ep_names = await this.querySelectorAll(res, "span.h3");
    const ep_titles = [];
    for (const ep_name of ep_names)
    {    
      ep_titles.push(ep_name.content.replace('<span class="h3 comic_version">', "").replace('</span>', "").replace('<span class="h3">', ""));
    }
    var index = 0;
    for (const lists of items) {
      const html = lists.content;
      const chapters = await this.querySelectorAll(html, "li");
      const urls = [];
      for (const chapter of chapters) {
        const h = chapter.content;
        const name = await this.getAttributeText(h, "a", "title");
        const url = await this.getAttributeText(h, "a", "href");
        urls.push({name: name, url: url});
      }
      episodes.push({title: ep_titles[index], urls: urls});
      index = index + 1;
    }
    return {
      title: title,
      cover: cover,
      desc: desc,
      episodes: episodes
    }
  }

  async watch(url) {
    const res = await this.request(url, {headers: this.headers});
    const urls = [];
    var script_str = res.match(/<script>var img_data = '([^']*)';<\/script>/)[1];
    const img_urls = JSON.parse(this.base64decode(script_str));
    var img_base = await this.getAttributeText(res, "img.show-pic", "src");
    img_base = img_base.substring(0, img_base.search(img_urls[0]['img']));
    for (const url of img_urls) {
      urls.push(img_base + url['img']);
    }
    return {
      urls: urls,
      headers: this.headers
    }
  }
}
