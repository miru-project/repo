// ==MiruExtension==
// @name         西米漫画
// @version      v0.3.8
// @author       ChinaDolphin
// @lang         zh-cn
// @license      MIT
// @package      comic.ximi
// @type         manga
// @icon         https://dns.ximimanhua.com/assets/logo/ximimanhua_icon.png
// @webSite      http://43.248.185.98:9002
// ==/MiruExtension==

export default class XiMiComic extends Extension {
    async latest(page) {
        const res = await this.request(`/api/comic/category/ximimanhua?page=${page-1}`)
        const manga = []
        res.data.length.forEach(element => {
            manga.push({
                title: element.title,
                cover: element.pic,
                update: element.upstate,
                url: element.titleurl
            })
        })
        return manga
    }

    async search(kw, page) {
        const res = await this.request(`/api/comic/comicso/ximimanhua?key=${kw}&page=${page-1}`)
        const manga = []
        if(res.data.totalPage == 0){
            return manga
        }
        res.data.length.forEach(element => {
            manga.push({
                title: element.title,
                cover: element.pic,
                update: element.upstate,
                url: element.titleurl
            })
        })
        return manga
    }

    async detail(url) {
        const res = await this.request(`/api/comic/comicinfo/ximimanhua?url=${url}`)
        const title =  res.data.title
        const cover =  res.data.cover
        const desc =   res.data.desc
        const episodes = []
        res.data.chapter.length.forEach(e => {
            episodes.push({
                name: e.name,
                url: e.url
            })
        })
        return {
            title,
            cover,
            desc,
            episodes: [{
                title: "目录",
                urls: episodes
            }]
        }
    }

    async watch(url) {
        const res = await this.request(`/api/comic/comicimg/ximimanhua?url=${url}`)
        const images = []
        res.data.forEach(e => {
            images.push(e)
        })
        return {
            urls: images
        }

    }
}