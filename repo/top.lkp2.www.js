// ==MiruExtension==
// @name         好看的1号
// @version      v0.0.2
// @author       zj
// @lang         zh-cn
// @license      MIT
// @icon         https://www.lkp2.top/template/muban8/favicon.ico
// @package      top.lkp2.www
// @type         bangumi
// @webSite      https://www.lkp2.top/
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    constructor() {
        super("https://www.lkp2.top/")
    }

    async search(kw, page) {
        try {
            const res = await this.request(`/index.php/vod/search/page/${page}/wd/${kw}.html`)

            const ulMatch = /div><div class="group-contents layui-row"([\s\S]+?)\/ul/g.exec(res)
            if (!ulMatch) return []
            const ul = ulMatch[0]
            const li = ul.match(/<a href="([\s\S]+?)<\/a>/g) || []
            const bangumi = []
            li.forEach(e => {
                try{
                    const title = e.match(/<p>(.+?)<\/p>/)[1]

                    const originalUrl = e.match(/href="(.+?)"/)[1]
                    const dynamicValue = originalUrl.match(/\/play\/id\/(\d+)\/sid\/1\/nid\/1\.html/)[1];
                    const url = originalUrl.replace(/\/play\/id\/(\d+)\/sid\/1\/nid\/1\.html/, '/detail/id/' + dynamicValue + '.html');
                    const cover = e.match(/data-src="(.+?)"/)[1]
                    let update = ""
                    try{
                        update = e.match(/i>(.+?)<\/span>/)[1]
                    }catch (error) {
                        update = ""
                    }
                    bangumi.push({
                        title,
                        url,
                        cover,
                        update
                    })
                }catch (error) {
                    console.log("错误")
                }
            })

            return bangumi
        } catch (error) {
            console.error(error)
            return []
        }
    }

    async latest() {
        try {
            const res = await this.request("/index.php/label/new/page/2.html")

            const ulMatch = /ul class="group-contents layui-row"([\s\S]+?)\/ul/g.exec(res)
            if (!ulMatch) return []
            const ul = ulMatch[0]
            const li = ul.match(/<a href="([\s\S]+?)<\/a>/g) || []
            const bangumi = []
            li.forEach(e => {
                try {
                    const title = e.match(/<p>(.+?)<\/p>/)[1]
                    const url = e.match(/href="(.+?)"/)[1]
                    const cover = e.match(/data-src="(.+?)"/)[1]
                    let update = ""
                    try{
                        update = e.match(/i>(.+?)<\/span>/)[1]
                    }catch (error) {
                        update = ""
                    }
                    bangumi.push({
                        title,
                        url,
                        cover,
                        update
                    })
                } catch (error) {
                    console.log("错误")
                }
            })

            return bangumi
        } catch (error) {
            console.error(error)
            return []
        }
    }

    async detail(url) {
        try {
            const res = await this.request(url)
            const cover = res.match(/html"><img src="(.+?)"/)?.[1] || ""
            const title = res.match(/<span class="text">(.+?)<\/span>/)?.[1] || ""
            const desc = title;
            const originalUrl = url;
            const dynamicMatch = originalUrl.match(/\/detail\/id\/(\d+)\.html/)
            const dynamicValue = dynamicMatch ? dynamicMatch[1] : ""
            const modifiedUrl = dynamicValue ? originalUrl.replace(/\/detail\/id\/(\d+)\.html/, `/play/id/${dynamicValue}/sid/1/nid/1.html`) : url;
            const episodes = [
                {
                    'title': '国内地址',
                    'urls': [
                        {
                            'name': '小哥,进来看看妹妹吧',
                            'url': modifiedUrl
                        }
                    ]
                }];
            return {
                episodes,
                desc,
                cover,
                title
            }
        } catch (error) {
            console.error(error)
            return {
                episodes: [],
                desc: "",
                cover: "",
                title: ""
            }
        }
    }

    async watch(url) {
        try {
            const res = await this.request(url)
            const m3u8Match = res.match(/"link_pre":"","url":"(.+?)","url_next"/)
            const m3u8 = m3u8Match ? m3u8Match[1].replace(/\\\//g, '/') : ""
            return {
                type: "hls",
                url: m3u8
            }
        } catch (error) {
            console.error(error)
            return {
                type: "hls",
                url: ""
            }
        }
    }

    async checkUpdate(url) {
        try {
            const res = await this.request(url)
            return res.match(/<span class="hl-text-conch">(.+?)<\/span>/)?.[1] || ""
        } catch (error) {
            console.error(error)
            return ""
        }
    }

}
