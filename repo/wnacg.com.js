// ==MiruExtension==
// @name         紳士漫畫
// @version      v0.0.2
// @author       appdevelpo
// @lang         zh-tw
// @license      MIT
// @type         manga
// @icon         https://www.wnacg.com/favicon.ico
// @package      wnacg.com
// @webSite      https://www.wnacg.com
// @nsfw         true
// ==/MiruExtension==

export default class Mangafx extends Extension {
  headers = {};
  maxnum = 0;
  favnum = 0;
  baseurl = "";
  fav_lists = {};
  url_strs = {
    home: {all : ""},
    new: {all : "/albums-index-page-$.html"},
    dojinshi: {all : "/albums-index-page-$-cate-5.html",
            chi: "/albums-index-page-$-cate-1.html",
            jpa: "/albums-index-page-$-cate-12.html",
            eng: "/albums-index-page-$-cate-16.html"},
    tankobon: {all : "/albums-index-page-$-cate-6.html",
            chi: "/albums-index-page-$-cate-9.html",
            jpa: "/albums-index-page-$-cate-13.html",
            eng: "/albums-index-page-$-cate-17.html"},
    magazine: {all : "/albums-index-page-$-cate-7.html",
            chi: "/albums-index-page-$-cate-10.html",
            jpa: "/albums-index-page-$-cate-14.html",
            eng: "/albums-index-page-$-cate-18.html"},
    korea: {all : "/albums-index-page-$-cate-19.html",
            chi: "/albums-index-page-$-cate-20.html",
            oth: "/albums-index-page-$-cate-21.html"},
    cg: {all : "/albums-index-page-$-cate-2.html"},
    cosplay: {all : "/albums-index-page-$-cate-3.html"},
    thridd: {all : "/albums-index-page-$-cate-22.html"},
  };

  async load()
  {
    await this.registerSetting({
      title: "网址",
      key: "baseurl",
      type: "input",
      description: "自定义网址",
      defaultValue: "https://www.wnacg.com"
    });
    await this.registerSetting({
      title: "用户Cookies",
      key: "cookies",
      type: "input",
      description: "用于读取用户收藏的Cookies（MPIC_bnS5）",
      defaultValue: ""
    });
  }

  //加载设置项
  async load_settings() {
    this.baseurl = await this.getSetting("baseurl");
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
      Referer: this.baseurl,
      "Miru-Url": this.baseurl
    };
  }

  async createFilter(filter) {
    const categories = {
      title: "分类",
      max: 1,
      min: 1,
      default: "home",
      options: {
        home: "主页",
        new: "最新",
        dojinshi: "同人志",
        tankobon: "单行本",
        magazine: "杂志&短篇",
        korea: "韩漫",
        cg: "CG畫集",
        cosplay: "Cosplay",
        thridd: "3D漫畫",
        fav: "收藏"
      }
    };
    const lists = {
      home: {all : "全部"},
      new: {all : "全部"},
      dojinshi: {all : "全部", chi: "漢化", jpa: "日語", eng: "English"},
      tankobon: {all : "全部", chi: "漢化", jpa: "日語", eng: "English"},
      magazine: {all : "全部", chi: "漢化", jpa: "日語", eng: "English"},
      korea: {all : "全部", chi: "漢化", oth: "其他"},
      cg: {all : "全部"},
      cosplay: {all : "全部"},
      thridd: {all : "全部"},
      fav: {all : "全部"}
    };
    let category = "home";
    if (filter && filter["categories"])
    {
      category = filter["categories"][0];
    }
    let options = {};
    if (category == "fav")
    {
      if (!this.fav_lists["all"])
      {
        await this.get_fav_lists();
      }
      options = this.fav_lists;
    }
    else
    {
      options = lists[category];
    }
    return {
      categories: categories,
      lists: {
        title: "列表",
        max: 1,
        min: 1,
        default: "all",
        options: options
      }
    };
  }

  async get_maxnum(res)
  {
    ///////////////////////
    //API更新后将结果写入缓存
    ///////////////////////
    let pre_page_nums = await this.querySelectorAll(res, "div.paginator > a");
    let num_str = "";
    for (let page_num of pre_page_nums)
    {
      num_str = page_num.content.match(/(\d+)/g)[0];
    }
    const num = parseInt(num_str);
    if (res.search(`<span class="thispage">${num + 1}</span>`) != -1)
    {
      return num + 1;
    }
    return num;
  }

  //获取收藏列表
  async get_fav_lists()
  {
    var headers = this.headers;
    headers["Cookie"] = `MPIC_bnS5=${await this.getSetting("cookies")}`;
    var fav_lists = {};
    const res = await this.request(`/users-users_fav.html`, {headers: headers});
    this.favnum = await this.get_maxnum(res); //获取收藏总页数
    const items = await this.querySelectorAll(res, "label.nav_list > a");
    for (const item of items)
    {
      let id = "";
      try
      {
        id = "c-" + item.content.match(/(\d+)/g)[0];
      }
      catch (e)
      {
        id = "all";
      }
      const name = item.content.match(/">(.*?)<\/a>/)[1];
      fav_lists[id] = name;
    }
    this.fav_lists =  fav_lists;
  }

  //获取收藏
  async get_fav(id, page) {
    //包含用户信息的headers
    var headers = this.headers;
    headers["Cookie"] = `MPIC_bnS5=${await this.getSetting("cookies")}`;
    if (id == "all")
    {
      id = "c-0";
    }
    const res = await this.request(`/users-users_fav-page-${page}-${id}.html`, {headers: headers});
    const bsxList = await this.querySelectorAll(res, "div.asTB");
    const maxnum = await this.get_maxnum(res);
    console.log(`${page}/${maxnum}`);
    if (id == "c-0")
    {
      //获取收藏最大页数
      this.favnum = maxnum;
    }
    if (page > maxnum)
    {
      return [];
    }
    const mangas = [];
    for (const element of bsxList)
    {
      const html = element.content;
      const url = await this.getAttributeText(html, "div.box_cel > p.l_title > a", "href");
      const title = await this.querySelector(html, "div.box_cel > p.l_title > a").text;
      const cover = "https:" + await this.getAttributeText(html, "img", "src");
      mangas.push({
        title: title,
        url: url,
        cover: cover,
      });
    }
    return mangas;
  }
  
  //获取漫画
  async get_mangas(url_str, page) {
    if (page != 0)
    {
      //翻页
      url_str = url_str.replace("$", page.toString());
    }
    if ((url_str == "") && (page > 1))
    {
      //首页不支持翻页
      return [];
    }
    const res = await this.request(url_str, {headers: this.headers});
    if ((url_str != "") && (url_str.search("cate") == -1)) //获取目前最大可跳转页数
    {
      this.maxnum = await this.get_maxnum(res);
    }
    const bsxList = await this.querySelectorAll(res, "li.gallary_item");
    const mangas = [];
    for (const element of bsxList)
    {
      const html = element.content;
      const url = await this.getAttributeText(html, "div.pic_box > a", "href");
      let title = await this.getAttributeText(html, "div.pic_box > a", "title");
      title = title.replaceAll("<em>", "").replaceAll("</em>", "");
      const cover = "https:" + await this.getAttributeText(html, "div.pic_box > a > img", "src");
      mangas.push({
        title: title,
        url: url,
        cover: cover,
        headers: this.headers,
      });
    }
    return mangas;
  }

  async latest(page) {
    await this.load_settings();
    return await this.get_mangas("", page);
  }
  
  async search(kw, page, filter) {
    if (kw)
    {
      //随机页面
      if (kw == "random")
      {
        if (page > 1)
        {
          return [];
        }
        const random_page = Math.floor(Math.random() * this.maxnum) + 1;
        return await this.get_mangas(this.url_strs["new"]["all"], random_page);
      }
      //随机收藏页面
      if (kw == "random_fav")
      {
        if (page > 1)
        {
          return [];
        }
        const random_page = Math.floor(Math.random() * this.favnum) + 1;
        console.log(this.favnum);
        return await this.get_fav("all", random_page);
      }
      //搜索
      return await this.get_mangas(`/search/index.php?q=${kw}&m=&syn=yes&f=_all&s=create_time_DESC&p=$`, page);
    }
    else
    {
      if (filter["categories"][0] == "fav")
      {
        //收藏
        return await this.get_fav(filter["lists"][0], page);
      }
      else
      {
        //其他界面
        return await this.get_mangas(this.url_strs[filter["categories"][0]][filter["lists"][0]], page);
      }
    }
  }
  
  async detail(url) {
    const res = await this.request(url, {headers: this.headers});
    const title = await this.querySelector(res, "h2").text;
    let cover = await this.getAttributeText(res, "div.uwthumb > img", "src");
    if (cover[3] == "/") {
      cover = "https:" + cover.substring(2,  cover.length);
    }
    else {
      cover = "https:" + cover;
    }
    const desc = await this.querySelector(res, "div.uwconn > p").text;
    const id  = url.match(/-aid-(.+?).html/)[1];
    return {
      title: title || "Unknown title",
      cover: cover || "",
      desc: desc || "No description available.",
      episodes: [
      {
        title: "正常画质",
        urls: [{name:"开始阅读",url:`/photos-gallery-aid-${id}.html`}],
      },
      {
        title: "低画质",
        urls: [{name:"开始阅读",url:`/photos-webp-aid-${id}.html`}],
      }
      ],
    };
  }
  
  async watch(url) {
    const res = await this.request(url, {headers: this.headers});
    const urls = [];
    let urls_str = res.substring(res.search("imglist") + 12, res.search("喜歡紳士漫畫的同學請加入收藏哦！") + 17);
    const url_list = urls_str.split("},{");
    for (let url_str of url_list) {
      urls.push("https:" + url_str.substring(url_str.search("img_host") + 11, url_str.search("\", ") - 1));
    }
    return {
      urls: urls,
      header: this.headers
    };
  }
}
