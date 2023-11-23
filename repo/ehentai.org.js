// ==MiruExtension==
// @name         Ehentai
// @version      v0.0.1
// @author       appdevelpo
// @lang         all
// @license      MIT
// @type         manga
// @icon         https://e-hentai.org/favicon.ico
// @package      ehentai.org
// @webSite      https://e-hentai.org
// @nsfw         yes
// ==/MiruExtension==

export default class Ehentai extends Extension {
  filter_jsons = {};
  
  async load(){
    this.next_page = ""
  }
  async latest(page) {
    const res = await this.request(this.next_page);
    this.next_page = res.match(/dnext" href="https:\/\/e-hentai.org(.+?)"/)[1]
    // console.log(res)
    const llist = res.match(/<tr><td class[\s\S]+?<\/tr>/g)
    const manga = []
    llist.forEach((element) => {
        const title = element.match(/title="(.+?)"/)[1]
        const url = element.match(/href="https:\/\/e-hentai.org(\/g\/.+?)"/)[1]
        const cover = element.match(/src="(https.+?)"/)[1]
        // console.log(cover)
        manga.push({
            title,
            url,
            cover
        })
    })
    console.log(llist.length)
    return manga
  }
  
  async search(kw, page, filter) {
    const res = await this.request(this.next_page);
    this.next_page = res.match(/dnext" href="https:\/\/e-hentai.org(.+?)"/)[1]
    const llist = res.match(/<tr><td class[\s\S]+?<\/tr>/g)
    const manga = []
    llist.forEach((element) => {
        const title = element.match(/title="(.+?)"/)[1]
        const url = element.match(/href="https:\/\/e-hentai.org(\/g\/.+?)"/)[1]
        const cover = element.match(/src="(https.+?)"/)[1]
        // console.log(cover)
        manga.push({
            title,
            url,
            cover
        })
    })
    console.log(llist.length)
    return manga
  }
  async getDetail(res,url){
    const cover = res.match(/transparent url\((https:\/\/ehgt.org.+?)\)/)[1]
    const title_match=res.match(/<h1[\s\S]+?<\/h1>/g)
    let title = ""
    title_match.forEach((element)=>{
        console.log(element)
        title+= element.match(/>(.*?)</)[1]
    })
    return {
        title,
        cover,
        episodes: [{
            title:"",
            urls: [{
                url,
                name:"ep"
            }]
        }]
    }
  }
  async detail(url) {
    const res = await this.request(url);
    if (res.includes("Content Warning")){
        const res1 = await this.request(`${url}?nw=session`,{
            headers:{
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
            }
        })
        console.log(res1)
        return this.getDetail(res1,url)
    }
    return this.getDetail(res,url)
  }

  async watch(url) {
    this.pageList = [];
    const res = await this.request(url);
    const pages = parseInt(res.match(/class="gdt2">(\d+?) pages<\/td>/)[1])
    const subPage = Math.ceil(pages / 40);
    const allSubPageList = Array.from({ length: subPage }, (_, index) => `${url}?p=${index}`);
    console.log(allSubPageList)
    for(const element of allSubPageList){
      const subRes = await this.request(element)
      const pageLink = subRes.match(/gdtm[^~]+?href=".+?"/g).map((element)=>{
        return element.match(/href="https:\/\/e-hentai.org(\/s.+?)"/)[1]
      })

      this.pageList.push(...pageLink)
      
    }
    console.log(pages)
    console.log(this.pageList.length)
    const ImgRes = await this.request(this.pageList[0])
    console.log(ImgRes)
    const img = ImgRes.match(/img id="img" src="(.+?)"/)[1]
    return {
      pages,
      urls: [img],
    }
  }
  async updatePages(pages) {
    const ImgRes = await this.request(this.pageList[pages])
    const img = ImgRes.match(/img id="img" src="(.+?)"/)[1]
    // console.log(img)
    return {
      url: img,
    }
  }
}

