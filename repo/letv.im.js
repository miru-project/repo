// ==MiruExtension==
// @name         Letv影院
// @version      v0.0.1
// @author       appdevelpo
// @lang         zh
// @license      MIT
// @icon         https://letv.im/template/letv/asset/img/favicon.png
// @package      letv.im
// @type         bangumi
// @webSite      https://letv.im
// ==/MiruExtension==

export default class extends Extension {
  async createFilter(filter) {

    const mainbar = {
      title: "",
      max: 1,
      min: 0,
      default: "/vodshow/4--------~---.html",
      options: {
        "/vodshow/2--------~---.html":"連續劇",
        "/vodshow/1--------~---.html":"電影",
        "/vodshow/3--------~---.html":"綜藝",
        "/vodshow/4--------~---.html":"動漫",
      },
    }
    return {
      mainbar
    }
  }
  async get_filter(res){
    const filter_area = res.match(/<ul class="ulclear color-list sb-genre-list sb-genre-less"[^;]+?<\/ul>/)[0]
    const filter_list = filter_area.match(/<li[^;]+?<\/li>/g)
    for(const element of filter_list){
      const filt_link = element.match(/href="(.+?)"/)[1]
      const name = element.match(/title="(.+?)"/)[1]
      this.Generes[filt_link]=name
    }
  }
  async latest(page) {
    const res = await this.request(`/map/index.html`,);
    const selector = await this.querySelectorAll(res,"li.hl-col-xs-12.hl-list-item")
    const bangumi = [];
    for (const element of selector) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.getAttributeText(html, "a", "title");
      const cover = await this.querySelector(html, "i.hl-item-thumb.hl-lazy").getAttributeText("data-original");
      //console.log(title+cover+url)
      bangumi.push({
        title,
        url,
        cover,
      });
    }
    return bangumi;
  }

  async detail(url) {
    const episodes = [];
    const res = await this.request(url);
    let queryepArea = await this.querySelectorAll(res, "ul.hl-plays-list.hl-sort-list.hl-list-hide-xs.clearfix");
    if(queryepArea.length == 0){
        queryepArea = await this.querySelectorAll(res, "ul.clearfix.hl-sort-list.hl-plays-list")
    }
    const mirrorTitles = await this.querySelectorAll(res,"h2.play-src-title")
    const title = await this.getAttributeText(res, "div.hl-dc-pic > .hl-lazy.hl-item-thumb","title")
    const cover = await this.getAttributeText(res, "div.hl-dc-pic > .hl-lazy.hl-item-thumb","data-original")
    for(var i = 0;i < queryepArea.length;i++){
        const ep = []
        const html =  queryepArea[i].content;
        const text = await this.querySelectorAll(html, "li")
        const mirrorTitle = await this.querySelector(mirrorTitles[i].content, "h2.play-src-title").text
        for(var j = 0;j < text.length-1;j++){
            const subHtml = text[j].content;
            const name = await this.querySelector(subHtml, "a").text
            const url = await this.getAttributeText(subHtml, "a", "href");
            ep.push({
                name,
                url
            })
        }
        episodes.push({
            title: mirrorTitle,
            urls: ep
        })
        // console.log(ep)
    }
    return {
      title,
      cover,
      episodes
    }
  }

  async search(kw, page,filter) {
    console.log(filter)
    let url = `/vodsearch/${kw}----------${page}---.html`
    if (!kw){
        url = filter["mainbar"][0].replace("~",page)
        console.log(url)
        const res = await this.request(url);
        const bsxList = await this.querySelectorAll(res, "li.hl-col-lg-2.hl-col-md-20w.hl-col-sm-3.hl-col-xs-4.hl-list-item");
        const bangumi = [];
        for (const element of bsxList) {
          const html = await element.content;
          const url = await this.getAttributeText(html, "a", "href");
          const title = await this.getAttributeText(html, "a", "title");
          const cover = await this.getAttributeText(html, "a", "data-original");
          bangumi.push({
            title,
            url,
            cover,
          });
        }
        return bangumi;
    }
    const res = await this.request(url);
    const bsxList = await this.querySelectorAll(res, "div.hl-item-div");
    const bangumi = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.getAttributeText(html, "a", "title");
      const cover = await this.getAttributeText(html, "a", "data-original");
      bangumi.push({
        title,
        url,
        cover,
      });
    }
    return bangumi;
  }

  async watch(url) {
    const res  = await this.request(url);
    const m3u8_link = res.match(/url:"(.+?)"/)[1];
    return {
      type:"hls",
      url:m3u8_link,//auto

  }
  }



  }
