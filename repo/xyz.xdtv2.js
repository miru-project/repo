// ==MiruExtension==
// @name         好看的2号
// @version      v0.0.1
// @author       zj
// @lang         zh-cn
// @license      MIT
// @icon         https://xdtv2.xyz/template/xdtv/static/favicon.ico
// @package      xyz.xdtv2
// @type         bangumi
// @webSite      https://xdtv2.xyz/
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    constructor() {
        super("https://xdtv2.xyz/")
    }

    async search(kw, page) {
        const res = await this.request(`/index.php/vod/search/page/${page}/wd/${kw}.html`)

        const ul = /class="content-list "([\s\S]+?)\/ul/g.exec(res)[0]
        const li = ul.match(/<li class="content-item content-item-2">([\s\S]+?)<\/li>/g)
        const bangumi = []
        li.forEach(e => {
            const title = e.match(/title="(.+?)"/)[1]
            const url = e.match(/href="(.+?)"/)[1]
            const cover = e.match(/src="(.+?)"/)[1]
            let update = ""
            try{
                update = e.match(/text-bg-r">(.+?)<\/span>/)[1]
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
    async latest() {
        const res = await this.request("/index.php/vod/type/id/5.html")

        const ul = /class="content-list "([\s\S]+?)\/ul/g.exec(res)[0]
        const li = ul.match(/<li class="content-item content-item-2">([\s\S]+?)<\/li>/g)
        const bangumi = []
        li.forEach(e => {
            const title = e.match(/title="(.+?)"/)[1]
            const url = e.match(/href="(.+?)"/)[1]
            const cover = e.match(/src="(.+?)"/)[1]
            let update = ""
            try{
                update = e.match(/text-bg-r">(.+?)<\/span>/)[1]
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

        const cover = res.match(/class="img-responsive" src="(.+?)"/)[1]
        const title = res.match(/name="description" content="(.+?)"/)[1]
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
        const m3u8 = res.match(/,"url":"(.+?)","url_next"/)[1].replace(/\\\//g, '/');
        return {
            type: "hls",
            url: m3u8
        }
    }

}
