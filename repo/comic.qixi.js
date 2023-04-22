// ==MiruExtension==
// @name         七夕漫画
// @version      v0.0.9
// @author       ChinaDolphin
// @lang         zh-cn
// @license      MIT
// @package      comic.qixi
// @type         manga
// @icon         http://qiximh3.com/style/images/logo.png
// @webSite      http://43.248.185.98:9003
// ==/MiruExtension==

export default class QiXiComic extends Extension {
    async latest(page) {
        const res = await this.request(`/api/comic/category/qiximanhua?page=${page}`)
        const manga = []
        res.data.forEach(element => {
            manga.push({
                title: element.name,
                cover: element.imgurl,
                update: element.remarks,
                url: element.id
            })
        })
        return manga
    }

    async search(kw, page) {
        const res = await this.request(`/api/comic/comicso/qiximanhua?key=${kw}`)
        const manga = []
        res.data.search_data.forEach(element => {
            manga.push({
                title: element.name,
                cover: element.imgs,
                update: element.newchapter,
                url: element.id
            })
        })
        return manga
    }

    async detail(url) {
        const res = await this.request(`/api/comic/comicinfo/qiximanhua?url=${url}`)
        const title =  res.data.title
        const cover =  res.data.cover
        const desc =   res.data.desc
        const episodes = []
        res.data.chapters.forEach(e => {
            episodes.push({
                name: e.chaptername,
                url: e.chapterid
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
        const res = await this.request(`/api/comic/comicimg/qiximanhua?url=${url}`)
        const images = []
        res.data.forEach(e => {
            images.push(e)
        })
        return {
            urls: images
        }

    }
}