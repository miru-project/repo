// ==MiruExtension==
// @name         Nyaa
// @version      v0.0.1
// @author       appdevelpo
// @lang         en
// @license      MIT
// @icon         https://nyaa.si/static/favicon.png
// @package      nyaa.si
// @type         bangumi
// @webSite      https://nyaa.si
// @description  A BitTorrent community focused on Eastern Asian media including anime, manga, music, and more.
// ==/MiruExtension==

export default class extends Extension {

    async createFilter(filter) {
        if(filter){
            console.log(filter)
        }
        const filters = {
            sort_by:{
                title: "sort-by",
                max: 1,
                min: 1,
                default: "",
                options:{
                  "&s=size":"Size",
                  "&s=id":"Id",
                  "&s=seeders":"Seeders",
                  "&s=leechers":"Leechers",
                  "&s=downloads":"Complete Downloads",
                  "&s=comments":"Comments",
                  "":"None"
                }
            },
            date:{
                title: "date",
                max:1,
                min:0,
                default: "",
                options:{
                    "&o=desc":"descending",
                    "&o=asc":"ascending",
                    "":"None"
                }
            }
        }
    return filters
    }

    async latest(page) {
        const res = await this.request(`/?f=0&c=1_0&p=${page}`)
        const bsxList = res.match(/<tr class="default"[\s\S]+?<\/tr>/g)
        // console.log(bsxList[0])
        const bangumi = bsxList.map((element) => {
            // console.log(element.match(/data-timestamp.+?>(.+?)<\/td>[^;]+?(\d+)<\/td>[\s\S]+?>(\d+)/))
            const update_info = element.match(/data-timestamp.+?>(.+?)<\/td>[^;]+?(\d+)<\/td>[\s\S]+?>(\d+)/)
            return {
                title: element.match(/view.+?title="(.+?)">/)[1],
                url: element.match(/a href="(\/view\/\d+?)"/)[1],
                update: `${update_info[1]} seeeder:${update_info[2]} leecher:${update_info[3]}`

            }
        })
        return bangumi
    }

    async detail(url) {
        const res = await this.request(`${url}`);
        const torrent_link = res.match(/<a href="(.+?torrent)"/)[1]
        const title = res.match(/h3 class="panel-title">\s+(.+)\s+?<\/h3>/)[1]
        // console.log(res);
        return {
            title,
            episodes: [{
                    title: "torrent",
                    urls: [{
                        name: `Watch ${title}`,
                        url: "https://nyaa.si"+torrent_link
                    }],
            }],
        };
    }

    async search(kw, page, filter) {
        let search_string = `/?f=0&c=1_0&p=${page}`
        search_string += filter['sort_by']+filter['date']
        if (kw){
            search_string += `&q=${kw}`
        }
        const res = await this.request(search_string)
        const bsxList = res.match(/<tr class="default"[\s\S]+?<\/tr>|<tr class="success"[\s\S]+?<\/tr>/g)
        // console.log(bsxList[0])
        const bangumi = bsxList.map((element) => {
            // console.log(element.match(/data-timestamp.+?>(.+?)<\/td>[^;]+?(\d+)<\/td>[\s\S]+?>(\d+)/))
            const update_info = element.match(/data-timestamp.+?>(.+?)<\/td>[^;]+?(\d+)<\/td>[\s\S]+?>(\d+)/)
            return {
                title: element.match(/title=".+?">(.+?)<\/a>/)[1],
                url: element.match(/a href="(\/view\/\d+?)"/)[1],
                update: `${update_info[1]} seeeder:${update_info[2]} leecher:${update_info[3]}`

            }
        })
        return bangumi
    }

    async watch(url) {
        console.log(url)
        return {
            type: "torrent",
            url:url,
        };
    }
}
