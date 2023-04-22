// ==MiruExtension==
// @name         包子漫画
// @version      v0.0.5
// @author       ChinaDolphin
// @lang         zh-cn
// @license      MIT
// @package      comic.baozi
// @type         manga
// @icon         https://cn.kukuc.co/apple-icon-180x180.png
// @webSite      http://43.248.185.98:9004
// ==/MiruExtension==

export default class BaoZiComic extends Extension {
    async latest(page) {
        const res = await this.request(`/api/comic/category/baozimanhua?page=${page}`)
        const manga = []
        res.data.items.forEach(element => {
            manga.push({
                title: element.name,
                cover: element.topic_img,
                update: element.author,
                url: element.comic_id
            })
        })
        return manga
    }

    async search(kw, page) {
        const res = await this.request(`/api/comic/comicso/baozimanhua?key=${kw}`)
        const manga = []
        res.data.list.forEach(element => {
            manga.push({
                title: element.title,
                cover: element.cover,
                update: element.tags,
                url: element.url
            })
        })
        return manga
    }

    async detail(url) {
        const res = await this.request(`/api/comic/comicinfo/baozimanhua?url=${url}`)
        const title =  res.data.title
        const cover =  res.data.cover
        const desc =   res.data.desc
        const episodes = []
        res.data.chapters.list.forEach(e => {
            const urls = `?comic_id=${e.comic_id}&section_slot=${e.section_slot}&chapter_slot=${e.chapter_slot}`
            episodes.push({
                name: e.chapter_no,
                url: urls
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
        const res = await this.request(`/api/comic/comicimg/baozimanhua${url}`)
        const images = []
        res.data.forEach(e => {
            images.push(e)
        })
        return {
            urls: images
        }

    }
}