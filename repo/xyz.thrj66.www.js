// ==MiruExtension==
// @name         好看的7号
// @version      v0.0.1
// @author       zj
// @lang         zh-cn
// @license      MIT
// @icon         https://xdtv2.xyz/template/xdtv/static/favicon.ico
// @package      xyz.thrj66.www
// @type         bangumi
// @webSite      https://www.thrj66.xyz/
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    constructor() {
        super("https://www.thrj66.xyz/")
    }
    //
    async search(kw, page) {
        const res = await this.request(`/index.php/vod/search/page/${page}/wd/${kw}.html`)

        const res1 = res.replace(/\t/g, '')
        const body = res1.match(/col-md-3 portfolio-item new-video">([\s\S]+?)row text-center/)[1]
        const divs = body.match(/<div class="new-video-icon([\s\S]+?)<br>/g)
        console.log(body)
        console.log(divs)
        const bangumi = []
        divs.forEach(e => {
            try{
                const title = e.match(/class="uptime">\r\n(.+?)<\/div>/)[1]
                const url = e.match(/href=" (.+?)"/)[1]
                const cover = e.match(/data-original="(.+?)"/)[1]
                const regex = /(\d{4}-\d{2}-\d{2})/;
                const update = e.match(regex)[1];
                bangumi.push({
                    title,
                    url,
                    cover,
                    update
                })
            }catch (error) {

            }
        })

        return bangumi
    }
    async latest() {

        const ranges = [
            4, 5, 6, 7, 8, 9, 10, 11, 12,
            20, 21, 22, 23, 24,
            13, 14, 15, 16,
            30, 31, 32, 33, 34, 35, 36, 37, 38,
            26, 27, 28, 29,
            39, 40,
            25
        ];

        function getRandomNumberInRange(start, end) {
            return Math.floor(Math.random() * (end - start + 1)) + start;
        }

        function getRandomNumberFromRanges() {
            const randomNumber = getRandomNumberInRange(0, ranges.length - 1);
            return ranges[randomNumber];
        }

        const res = await this.request(`/index.php/vod/type/id/${getRandomNumberFromRanges()}.html`)

        const res1 = res.replace(/\t/g, '')
        const body = res1.match(/col-md-3 portfolio-item new-video">([\s\S]+?)row text-center/)[1]
        const divs = body.match(/<div class="new-video-icon([\s\S]+?)<br>/g)
        console.log(body)
        console.log(divs)
        const bangumi = []
        divs.forEach(e => {
            try{
                const title = e.match(/class="uptime">\r\n(.+?)<\/div>/)[1]
                const url = e.match(/href=" (.+?)"/)[1]
                const cover = e.match(/data-original="(.+?)"/)[1]
                const regex = /(\d{4}-\d{2}-\d{2})/;
                const update = e.match(regex)[1];
                bangumi.push({
                    title,
                    url,
                    cover,
                    update
                })
            }catch (error) {

            }
        })

        return bangumi
    }

    async detail(url) {
        const res = await this.request(url)

        const res1 = res.replace(/\n/g, '')
        const cover = ''
        const title = res1.match(/page-header">(.+?)<\/h1>/)[1]
        const desc = title;
        const modifiedUrl = url
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

        const res1= res.replace(/\n/g, '')
        const m3u8 = res1.match(/,"url":"(.+?)","url_next/)[1].replace(/\\\//g, '/')

        return {
            type: "hls",
            url: m3u8
        }
    }

}
