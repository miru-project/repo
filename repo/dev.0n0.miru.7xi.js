// ==MiruExtension==
// @name         7喜影院Miru2.0-Alpha
// @version      v0.0.4
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         https://www.7xi.tv/upload/site/20220630-1/f0aa6861d2399c58f87faab0f1928b10.png
// @package      dev.0n0.miru.7xi
// @type         bangumi
// @webSite       https://www.7xi.tv/
// ==/MiruExtension==

export default class extends Extension {
    constructor() {
        super("https://www.7xi.tv/")
    }
    getCover(url) {
        if (url.indexOf("http") == -1) {
            return `https://www.7xi.tv${url}`
        }
        return url
    }

    async search(kw, page) {
        const res = await this.request(`/vodsearch/page/${page}/wd/${kw}.html`)
        const ul = res.match(/<ul class="hl-one-list([\s\S]+?)<\/ul/)[1]
        const li = ul.match(/<li([\s\S]+?)<\/li>/g)
        const bangumi = []
        li.forEach(e => {
            const title = e.match(/title="(.+?)"/)[1]
            const url = e.match(/href="(.+?)"/)[1]
            const cover = this.getCover(e.match(/data-original="(.+?)"/)[1])
            const update = e.match(/<span class="hl-lc-1 remarks">(.+?)<\/span>/)[1]
            bangumi.push({
                title,
                url,
                cover,
                update,
            })
        })
        return bangumi
    }
    async latest() {
        const res = await this.request("/label/rankweek.html")
        const ul = /class="hl-rank-list clearfix"([\s\S]+?)\/ul/g.exec(res)[0]
        const li = ul.match(/<li class="hl-list-item hl-col-xs-12">([\s\S]+?)<\/li>/g)
        const bangumi = []
        li.forEach(e => {
            const title = e.match(/title="(.+?)"/)[1]
            const url = e.match(/href="(.+?)"/)[1]
            const cover = this.getCover(e.match(/data-original="(.+?)"/)[1])
            let update = ""
            try {
                update = e.match(/<span class="hl-text-conch score">(.+?)<\/span>(.+?)<\/div>/)[2]
            } catch (error) {
                update = ""
                console.log(error);
            }
            bangumi.push({
                title,
                url,
                cover,
                update
            })
        })
        return bangumi
    }

    async detail(url) {
        const res = await this.request(url)
        const desc = res.match(/name="description" content="(.+?)"/)[1]
        const cover = this.getCover(res.match(/data-original="(.+?)"/)[1])
        const title = res.match(/hl-dc-title hl-data-menu">(.+?)</)[1]
        const watchUrlTitleStr = res.match(/hl-plays-from hl-tabs swiper-wrapper clearfix">([\s\S]+?)<\/div>/g)[0]
        const watchUrlTitle = watchUrlTitleStr.match(/alt="(.+?)"/g)
        const watchUrlGroupsStr = res.match(/id="hl-plays-list">([\s\S]+?)<\/ul/g)
        const episodes = []
        let i = 0
        watchUrlGroupsStr.forEach(e => {
            const episode = []
            let lis = e.match(/<li([\s\S]+?)<\/li>/g)
            lis.forEach(e => {
                const match = e.match(/<a href="(.+?)">(.+?)<\/a>/)
                episode.push({
                    url: match[1],
                    name: match[2],
                })
            })
            const title = watchUrlTitle[i++].split(`"`)[1]
            episodes.push({
                title: title,
                urls: episode
            })
        })
        return {
            episodes,
            desc,
            cover,
            title
        }
    }

    async watch(url) {
        const res = await this.request(url)
        url = res.match(/"url":"http(.+?).m3u8"/)
        return {
            type: "hls",
            url: `http${url[1].replace(/\\\/|\/\\/g, "/")}.m3u8`
        }
    }

    async checkUpdate(url) {
        const res = await this.request(url)
        return res.match(/<span class="hl-text-conch">(.+?)<\/span>/)[1]
    }

}
