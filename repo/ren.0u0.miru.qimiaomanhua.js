// ==MiruExtension==
// @name         36漫画
// @version      v0.0.2
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @package      ren.0u0.miru.qimiaomanhua
// @type         manga
// @icon         https://www.36manhua.com/template/pc/default/images/pic_nav_logo.png
// @webSite      https://www.36manhua.com/
// ==/MiruExtension==

export default class Qiximh extends Extension {
    async latest() {
        const res = await this.request("/category/order/addtime")
        const divlist = res.match(/<div class="common-comic-item">([\s\S]+?)<p class="comic-count">/g)
        const manga = []
        divlist.forEach(element => {
            console.log(element);
            const title_url = element.match(/<p class="comic__title"><a href="(.+?)" target="_blank">(.+?)<\/a><\/p>/)
            const cover = element.match(/data-original="(.+?)"/)[1]
            let update
            try {
                update = element.match(/<a class="hl" href="(.+?)" target="_blank">(.+?)<\/a>/)[2]
            } catch (error) {
                update = ""
            }
            manga.push({
                title: title_url[2],
                cover,
                update,
                url: title_url[1]
            })
        });
        return manga
    }

    async search(kw, page) {
        const res = await this.request(`/search/${kw}/${page}`)
        let divlist
        const manga = []
        try {
            divlist = res.match(/<div class="common-comic-item">([\s\S]+?)<p class="comic-count">/g)
            divlist.forEach(element => {
                console.log(element);
                const title_url = element.match(/<p class="comic__title"><a href="(.+?)" target="_blank">(.+?)<\/a><\/p>/)
                const cover = element.match(/data-original="(.+?)"/)[1]
                let update
                try {
                    update = element.match(/<a class="hl" href="(.+?)" target="_blank">(.+?)<\/a>/)[2]
                } catch (error) {
                    update = ""
                }
                console.log(update);
                manga.push({
                    title: title_url[2],
                    cover,
                    update,
                    url: title_url[1]
                })
            });
        } catch (error) {
            return []
        }
        return manga
    }

    async detail(url) {
        const res = await this.request(`/${url}/`)
        const title = res.match(/<p class="comic-title j-comic-title">(.+?)<\/p>/)[1]
        const cover = res.match(/<div class="de-info__cover"><img class="lazy" src="(.+?)"/)[1]
        const desc = res.match(/<p class="intro-total">(.+?)<\/p>/)[1]
        const ul = res.match(/<ul class="chapter__list-box clearfix">([\s\S]+?)<\/ul>/)[1]
        const li = ul.match(/<li(.+?)>([\s\S]+?)<\/li>/g)
        const episodes = []
        li.forEach(e => {
            const episode = e.match(/href="(.+?)">([\s\S]+?)<\/a>/)
            episodes.push({
                name: episode[2],
                url: episode[1]
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
        const res = await this.request(`/${url}`)
        const img = res.match(/data-original="(.+?)"/g)
        const images = []
        img.forEach(e => {
            images.push(e.match(/data-original="(.+?)"/)[1])
        })
        return {
            urls: images
        }

    }

}
