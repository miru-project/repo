// ==MiruExtension==
// @name         笔趣阁
// @version      v0.0.1
// @author       yxxyun
// @lang         zh-cn
// @icon         https://m.bi17.cc/favicon.ico
// @license      MIT
// @package      bqg.cc
// @type         fikushon
// @webSite      https://m.bi17.cc
// ==/MiruExtension==

export default class extends Extension {
  headers = {
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36'
  }
  #options = {
    "1": "玄幻",
    "2": "武侠",
    "3": "都市",
    "4": "历史",
    "6": "科幻",
    "5": "网游",
    "7": "女生",
    "0": "全本"
  }
  
  async latest(page) {
    const defaultCategory = await this.getSetting('defaultCategory');
    const res = await this.request(`/json?sortid=${defaultCategory}&page=${page}`)
    return res.map((e)=>{return {title:e.articlename,url:e.url_list,cover:e.url_img}})
  }
  async createFilter(filter) {
    const defaultCategory = await this.getSetting('defaultCategory');
    const categories = {
      title: "类型",
      max: 1,
      min: 1,
      default: defaultCategory,
      options: this.#options
    }
    if (filter) {
      this.defaultCategory = filter.categories[0]
    }
    return {
      categories: categories
    };
  }
  async search(kw,page,filter) {
    if(kw.trim().length==0){
      const res = await this.request(`/json?sortid=${filter["categories"]}&page=${page}`)
      return res.map((e)=>{return {title:e.articlename,url:e.url_list,cover:e.url_img}})
    }
    const res = await this.request(`/user/search.html?q=${encodeURIComponent(kw)}&so=undefined`)
    return res.map(item => ({
      title: item.articlename,
      url: item.url_list,
      cover: item.url_img,
    }))
  }
  async load() {
    await this.registerSetting({
      title: '預設類別',
      key: 'defaultCategory',
      type: 'radio',
      defaultValue: '1',
      description: '修改預設搜尋類別',
      options:  Object.entries(this.#options).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
      }, {}),
    });
  }
  async detail(url) {
    const res = await this.request(`${url}`)
    const title = await this.querySelector(res, 'meta[property="og:novel:book_name"]').getAttributeText("content")
    const cover = await this.querySelector(res, 'meta[property="og:image"]').getAttributeText("content")
    const desc = await this.querySelector(res, 'meta[property="og:description"]').getAttributeText("content")
    const listres = await this.request(`${url}list.html`)
    const episodes = []
    const bsxList = await this.querySelectorAll(listres, "div.book_last > dl > dd")
    for (const element of bsxList) {
      const html = await element.content
      const url = await this.getAttributeText(html, "a", "href")
      const name = await this.querySelector(html, "a").text
      episodes.push({
        name,
        url,
      })
    }
    return {
      title,
      cover: cover,
      desc,
      episodes: [
        {
          title: "Chapters",
          urls: episodes,
        },
      ],
    }
  }

  async watch(url) {
    const res = await this.request(`${url}`)
    const contentList = await this.querySelectorAll(res, "div.Readarea.ReadAjax_content");
    const title = await this.querySelector(res, "span.title").text
    let contenthtml = await this.querySelector(contentList[0].content, "div").content.replace(/<div.*?>|<\/div>|\t|\n/g, '')
    let id = await this.getAttributeText(res, "a.Readpage_down", "href")
    while (true) {
      const res = await this.request(`${id}`)
      const contentList = await this.querySelectorAll(res, "div.Readarea.ReadAjax_content");
      contenthtml += await this.querySelector(contentList[0].content, "div").content.replace(/<div.*?>|<\/div>|\t|\n/g, '')
      id = await this.getAttributeText(res, "a.Readpage_down", "href")
      if (id.indexOf('_') < 0) break
    }
    contenthtml = contenthtml.replace(/<br>|请收藏.*?<\/p>/g, '\n')
    contenthtml = contenthtml.trim()
    const content = contenthtml.split("\n").filter(item => item.trim() !== "")
    return {
      title: title,
      content: content
    }
  }

}

