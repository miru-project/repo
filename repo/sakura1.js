// ==MiruExpand==
// @name         Sakura(樱花动漫)1
// @version      v0.0.5
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         https://www.xmfans.me/yxsf/yh_css/yh_logo.png
// @package      dev.0n0.miru.sakura1
// ==/MiruExpand==

export default class Sakura1 extends Expand {
    constructor() {
        super("https://www.yhdmp.cc")
    }
    async search(kw, page) {
        const bangumi = []
        const res = await this.request(`/s_all?kw=${kw}&pagesize=24&pageindex=${page - 1}`);
        let pattern = /<div class="lpic">([\s\S]+?)<div class="pages">/g;
        const bangumisStr = pattern.exec(res)[0]
        pattern = /<li>([\s\S]+?)<\/li>/g
        bangumisStr.match(pattern).forEach(e => {
            const cover = /src="(.+?)"/
            const title = /<a([\s\S]+?)>(.+?)<\/a>/
            const url = /href="(.+?)"/
            bangumi.push({
                cover: e.match(cover)[1],
                title: e.match(title)[2],
                url: e.match(url)[1],
            })
        })
        return bangumi
    };

    async info(url) {
        const res = await this.request(url);
        const desc = res.match(/ <div class="info">([\s\S]+?)<\/div>/)[1]
        const cover = res.match(/referrerpolicy="no-referrer" src="(.+?)"/)[1]
        const title = res.match(/<h1>(.+?)<\/h1>/)[1]
        const watchUrlGroupsStr = res.match(/class="movurl"([\s\S]+?)>([\s\S]+?)<\/div>/g)
        const watchurl = new Map()
        let i = 0
        watchUrlGroupsStr.forEach(e => {
            let group = []
            let lis = e.match(/<li>([\s\S]+?)<\/li>/g)
            if (!lis) {
                return
            }
            lis.forEach(e => {
                const name = e.match(/">(.+?)<\/a>/)[1]
                const url = e.match(/href="(.+?)"/)[1]
                group.push({
                    name: name + '(跳转)',
                    url
                })
            })
            watchurl.set(`线路${++i}`, group)
        })
        return {
            watchurl,
            desc,
            cover,
            title
        }
    }

    async latest() {
        const bangumi = []
        const res = await this.request('/list/?order=%E6%9B%B4%E6%96%B0%E6%97%B6%E9%97%B4')
        let pattern = /<div class="lpic">([\s\S]+?)<div class="pages">/g;
        const bangumisStr = pattern.exec(res)[0]
        pattern = /<li>([\s\S]+?)<\/li>/g
        bangumisStr.match(pattern).forEach(e => {
            const cover = /src="(.+?)"/
            const title = /<a([\s\S]+?)>(.+?)<\/a>/
            const url = /href="(.+?)"/
            bangumi.push({
                cover: e.match(cover)[1],
                title: e.match(title)[2],
                url: e.match(url)[1],
            })
        })
        return bangumi
    }
    watch(url) {
        return {
            type: "jump",
            src: `https://www.yhdmp.cc${url}`
        }
    }
}