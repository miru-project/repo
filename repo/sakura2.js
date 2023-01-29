// ==MiruExtension==
// @name         Sakura(樱花动漫)2
// @version      v0.0.5
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         http://www.yinghuacd.com/js/20180601/0601.png
// @package      dev.0n0.miru.sakura2
// ==/MiruExtension==

export default class Sakura2 extends Extension {
    constructor() {
        super("http://www.yinghuacd.com")
    }
    options = {
        headers: {
            "miru-ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.70",
        }
    }
    getCover(url) {
        return `https://wsrv.nl/?url=${url}&w=200&h=300`
    }
    async search(kw, page) {
        const bangumi = []
        const res = await this.request(`/search/${kw}/?page=${page}`, this.options);
        let pattern = /class="lpic">([\s\S]+?)<div class="pages">/g;
        const bangumisStr = pattern.exec(res)[0]
        pattern = /<li>([\s\S]+?)<\/li>/g
        bangumisStr.match(pattern).forEach(e => {
            console.log(e);
            const cover = /src="(.+?)"/
            const title = /alt="(.+?)"/
            const url = /href="(.+?)"/
            let update = ""
            try {
                update = e.match(/<span><font color="red">(.+?)<\/font>/)[1]
            } catch (error) {
                console.log(error);
            }
            bangumi.push({
                update: `更新至${update}`,
                cover: this.getCover(e.match(cover)[1]),
                title: e.match(title)[1],
                url: e.match(url)[1],
            })
        })
        return bangumi
    };

    async info(url) {
        const res = await this.request(`${url}`, this.options);
        const desc = res.match(/<div class="info">([\s\S]+?)<\/div>/)[1]
        const title = res.match(/<h1>(.+?)<\/h1>/)[1]
        const cover = res.match(/src="(.+?)" alt=/)[1]
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
                    name,
                    url
                })
            })
            watchurl.set(`线路${++i}`, group)
        })
        return {
            watchurl,
            desc,
            cover: this.getCover(cover),
            title
        }
    }

    async latest() {
        const bangumi = []
        const res = await this.request("/", this.options)
        let pattern = /class="firs l">([\s\S]+?)class="side r"/g;
        const bangumisStr = pattern.exec(res)[0]
        pattern = /<li>([\s\S]+?)<\/li>/g
        bangumisStr.match(pattern).forEach(e => {
            const cover = /src="(.+?)"/
            const title = /alt="(.+?)"/
            const url = /href="(.+?)"/
            let update = ""
            try {
                update = e.match(/最新:<a(.+?)>(.+?)<\/a>/)[2]
            } catch (error) {
                console.log(error);
            }
            console.log(e.match(title));
            bangumi.push({
                update: `更新至${update}`,
                cover: this.getCover(e.match(cover)[1]),
                title: e.match(title)[1],
                url: e.match(url)[1],
            })
        })
        return bangumi
    }


    async watch(url) {
        const res = await this.request(url, this.options)
        return {
            type: "iframe",
            src: `https://tup.yinghuacd.com/?vid=${res.match(/data-vid="(.+?)"/)[1]}`
        }
    }

    async checkUpdate(url) {
        const res = await this.request(url, this.options)
        return `更新至${res.match(/<p>更新至(.+?)<\/p>/)[1]}`
    }
}


