// ==MiruExtension==
// @name         7喜影院
// @version      v0.0.7
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         https://www.7xi.tv/upload/site/20220630-1/f0aa6861d2399c58f87faab0f1928b10.png
// @package      dev.0n0.miru.7xi
// @type         bangumi
// @webSite       https://www.7xi.tv
// ==/MiruExtension==

export default class extends Extension {
    getCover(url) {
        if (url.indexOf("http") == -1) {
            return `https://www.7xi.tv${url}`
        }
        return url
    }

    async search(kw, page) {
        const res = await this.request(`/vodsearch/page/${page}/wd/${kw}.html`)

        const li = res.match(/public-list-box search-box flex rel[^']+?<\/div><\/div><\/div>/g)
        const bangumi = []
        li.forEach(e => {
            // console.log(e)
            const title = e.match(/html">([^"]+?)<\/a>/)[1]
            const url = e.match(/href="(.+?)"/)[1]
            const cover = e.match(/data-src="(.+?)"/)[1]
            const cover_url = cover.includes("https")?cover:`https://www.7xi.tv${cover}`;
            const update = e.match(/"public-list-prb hide ft2">(.+?)<\/span>/)[1];
            bangumi.push({
                title,
                url,
                cover:cover_url,
                update
            })
        })
        return bangumi
    }
    async latest() {
        const res = await this.request("/map.html")
        const li = res.match(/public-list-box public-pic-b [^']+?<\/div><\/div><\/div>/g)
        const bangumi = []
        li.forEach(e => {
            const titleMatch = e.match(/title="(.+?)"/)
            const title = titleMatch ? titleMatch[1] : null
            const urlMatch = e.match(/href="(.+?)"/)
            const url = urlMatch ? urlMatch[1] : null
            const coverMatch = e.match(/data-src="(.+?)"/)
            const cover = coverMatch ? coverMatch[1] : null
            const cover_url = cover.includes("https")?cover:`https://www.7xi.tv${cover}`;
            const updateMatch = e.match(/"public-list-prb hide ft2">(.+?)<\/span>/);
            const update = updateMatch ? updateMatch[1] : null
            bangumi.push({
                title,
                url,
                cover:cover_url,
                update
            })
        })
        return bangumi
    }

    async detail(url) {
        const res = await this.request(url)
        // console.log(res)
        const desc = res.match(/id="height_limit".+?>(.+?)<\/div>/)[1]
        const cover = this.getCover(res.match(/img alt=".+?" class="lazy lazy1 mask-1"[^']+?data-src="(.+?)"/)[1])
        const title = res.match(/<h3.+?>(.+?)<\/h3>/)[1]
        const ep_server = res.match(/<ul class="anthology-list-play size"[^']+?<\/ul>/g)
        const server_name = res.match(/<i class="fa ds-dianying"><\/i>.+?<\/a>/g).map((e)=>{
            return e.match(/&nbsp;(.+?)</)[1]
        })
        console.log(server_name)
        const episodes = [];
        ep_server.forEach((element,index)=>{
            const llist = element.match(/<li[^']+?<\/li>/g)
            const ep_element  = llist.map((e)=>{
                return {
                    name:e.match(/html">(.+?)</)[1],
                    url:e.match(/href="(.+?)"/)[1]
                }
            })
            episodes.push({
                title:server_name[index],
                urls:ep_element
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


}
