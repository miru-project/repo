// ==MiruExtension==
// @name         7喜影院Miru2.0-Alpha
// @version      v0.0.1
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         https://www.7xi.tv/upload/site/20220630-1/f0aa6861d2399c58f87faab0f1928b10.png
// @package      dev.0n0.miru.7xi
// @type         bangumi
// @webSite      https://www.7xi.tv/
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
                console.log(error
