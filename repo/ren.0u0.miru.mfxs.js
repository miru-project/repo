// ==MiruExtension==
// @name         免费小说网
// @version      v0.0.1
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @package      ren.0u0.miru.mfxs
// @type         fikushon
// @webSite      https://www.493d.com/
// @nsfw         true
// ==/MiruExtension==

export default class Biquge extends Extension {
    async latest() {
        const res = await this.request("/top_allvipvote/1.html")
        const liList = res.match(/<li class="g_col_6">([\s\S]+?)<\/li>/g)
        const manga = []
        liList.forEach(element => {
            const url = element.match(/href="https:\/\/www.493d.com(.+?)"/)[1]
            const title = element.match(/title="(.+?)"/)[1]
            const cover = element.match(/src="(.+?)"/)[1]
            manga.push({
                title,
                url,
                cover
            })
        });
        return manga
    }

    async search(kw, page) {
        const res = await this.request(`/modules/article/search.php?searchkey=${kw}&searchtype=articlename&page=${page}`)
        console.log(res);
        let trList
        const manga = []
        try {
            trList = res.match(/<li class="pr pb20 mb20" id="hism">([\s\S]+?)<\/li>/g)
            trList.forEach(element => {
                const url = element.match(/href="https:\/\/www.493d.com(.+?)"/)[1]
                const title = element.match(/class="c_strong" title="(.+?)"/)[1]
                const cover = element.match(/src="(.+?)"/)[1]
                const update = element.match(/<span class="vam">最新章节: <a href="(.+?)" target="_blank">(.+?)<\/a><\/span>/)[2]
                manga.push({
                    title,
                    url,
                    cover,
                    update
                })
            });
        } catch (error) {
            return []
        }
        return manga
    }

    async detail(url) {
        const res = await this.request(`/${url}`, {
            headers: {
                "miru-referer": "https://www.493d.com/"
            }
        })
        console.log(res);
        const title = res.match(/property="og:title" content="(.+?)"/)[1]
        const cover = res.match(/property="og:image" content="(.+?)"/)[1]
        const desc = res.match(/<meta property="og:description" content="([\s\S]+?)"\/>/)[1]
        const li = res.match(/<li class="w33p">([\s\S]+?)<\/li>/g)
        const episodes = []
        li.forEach(e => {
            const episode = e.match(/href="https:\/\/www.493d.com(.+?)" class="c_strong vam ell db"><span class="vam">([\s\S]+?)<\/span><\/a>/)
            episodes.push({
                name: episode[2],
                url: episode[1]
            })
        })
        return {
            title,
            cover,
            desc,
            episodes: [{
                title: "目录",
                urls: episodes
            }]
        }

    }

    async watch(url) {
        const res = await this.request(`/${url}`)
        const title = res.match(/<h1>(.+?)<\/h1>/)[1]
        const contents = res.match(/&emsp;&emsp;(.+?)<br \/>/g)
        let content = []
        contents.forEach((e) => {
            content.push(e.match(/&emsp;&emsp;(.+?)<br \/>/)[1])
        })
        return {
            content,
            title,
        }
    }

}
