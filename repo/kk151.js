// ==MiruExpand==
// @name         动漫之家(kk151)
// @version      v0.0.3
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @package      dev.0n0.miru.kk151
// @icon         https://www.kk151.com/templets/dm/images/favicon.ico
// ==/MiruExpand==

export default class KK151 extends Expand {
    constructor(name) {
        super(name, "https://www.kk151.com")
    }
    getCover(url) {
        if (url.indexOf("http") == -1) {
            return `https://www.kk151.com${url}`
        }
        return url
    }
    async search(kw, page) {
        const bangumi = []
        const res = await this.request(`/search.php?page=${page}&searchword=${kw}`);
        let pattern = /<div class="video-list1 clearfix">([\s\S]+?)<div class="page clearfix">/g;
        const bangumisStr = pattern.exec(res)[0]
        pattern = /<div class="col-md-12 col-sm-6 col-xs-12 p0">([\s\S]+?)<div class="subtitle">/g
        const m = bangumisStr.match(pattern)
        m.forEach(e => {
            const cover = /background: url\((.+?)\);/
            const title = /title="(.+?)"/
            const url = /href="(.+?)"/
            bangumi.push({
                title: e.match(title)[1],
                cover: this.getCover(e.match(cover)[1]),
                url: e.match(url)[1],
            })
        })
        return bangumi
    }
    async latest() {
        const bangumi = []
        const res = await this.request(`/search.php?searchtype=5&tid=0`);
        let pattern = /<div class="video-list1">([\s\S]+?)<div class="page clearfix">/g;
        const bangumisStr = pattern.exec(res)[0]
        pattern = /<div class="col-md-4 col-sm-6 col-xs-12 p0">([\s\S]+?)<div class="subtitle">/g
        const m = bangumisStr.match(pattern)
        m.forEach(e => {
            const cover = /background: url\((.+?)\);/
            const title = /title="(.+?)"/
            const url = /href="(.+?)"/
            bangumi.push({
                title: e.match(title)[1],
                cover: this.getCover(e.match(cover)[1]),
                url: e.match(url)[1],
            })
        })
        return bangumi
    }
    async info(url) {
        const res = await this.request(url);
        const desc = res.match(/id="plot">([\s\S]+?)<\/div>/)[1].replace(/<[^>]+>/ig, "")
        const title = res.match(/<h4 class="media-heading">(.+?)<\/h4>/)[1]
        const cover = this.getCover(res.match(/background: url\((.+?)\);/)[1])
        const watchUrlGroupsStr = res.match(/<dd([\s\S]+?)<\/dd>/g)
        const watchurl = new Map()
        let i = 0
        if (watchUrlGroupsStr) {
            watchUrlGroupsStr.forEach(e => {
                let group = []
                let lis = e.match(/<li>([\s\S]+?)<\/li>/g)
                if (!lis) {
                    return
                }
                lis.forEach(e => {
                    const name = e.match(/">(.+?)<\/a>/)[1]
                    const url = e.match(/href='(.+?)'/)[1]
                    group.push({
                        name,
                        url
                    })
                })
                watchurl.set(`线路${++i}`, group)
            })
        }
        return {
            watchurl,
            desc,
            cover,
            title
        }
    }
    async watch(url) {
        const res = await this.request(url)
        return {
            type: "player",
            src: res.match(/now="(.+?)"/)[1]
        }
    }
}
