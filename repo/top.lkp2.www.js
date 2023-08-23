// ==MiruExtension==
// @name         好看的1号
// @version      v0.0.1
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
        const res = await this.request(`/index.php/vod/search/page/${page}/wd/${kw}.html`)

        const ul = /div><div class="group-contents layui-row"([\s\S]+?)\/ul/g.exec(res)[0]
        const li = ul.match(/<a href="([\s\S]+?)<\/a>/g)
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
    }
    async latest() {
        const res = await this.request("/index.php/label/new/page/2.html")

        const ul = /ul class="group-contents layui-row"([\s\S]+?)\/ul/g.exec(res)[0]
        const li = ul.match(/<a href="([\s\S]+?)<\/a>/g)
        const bangumi = []
        li.forEach(e => {
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
        })

        return bangumi
    }

    async detail(url) {
        const res = await this.request(url)
        const cover = res.match(/html"><img src="(.+?)"/)[1]
        const title = res.match(/<span class="text">(.+?)<\/span>/)[1]
        const desc = title;
        const originalUrl = url;
        const dynamicValue = originalUrl.match(/\/detail\/id\/(\d+)\.html/)[1];
        const modifiedUrl = originalUrl.replace(/\/detail\/id\/(\d+)\.html/, `/play/id/${dynamicValue}/sid/1/nid/1.html`);
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
    }

    async watch(url) {
        const res = await this.request(url)
        const m3u8 = res.match(/"link_pre":"","url":"(.+?)","url_next"/)[1].replace(/\\\//g, '/');
        return {
            type: "hls",
            url: m3u8
        }
    }

    async checkUpdate(url) {
        const res = await this.request(url)
        return res.match(/<span class="hl-text-conch">(.+?)<\/span>/)[1]
    }

}
