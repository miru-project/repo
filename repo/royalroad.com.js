// ==MiruExtension==
// @name         RoyalRoad
// @version      v0.0.2
// @author       appdevelpo
// @lang         en
// @license      MIT
// @package      royalroad.com
// @type         fikushon
// @webSite      https://www.royalroad.com
// @icon         https://www.royalroad.com/icons/favicon.ico?v=20200125
// @nsfw         false
// ==/MiruExtension==

export default class Biquge extends Extension {
    async latest(page) {
        const res = await this.request(`/fictions/latest-updates?page=${page}`)
        const liList = res.match(/<div class="fiction-list-item row">[\S\s]+?<\/div>/g)
        const manga = []
        liList.forEach(element => {
            const url = element.match(/href="(.+?)"/)[1]
            const title = element.match(/alt="(.+?)"/)[1]
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
        const res = await this.request(`/fictions/search?page=${page}&title=${kw}`)
        const liList = res.match(/<div class="row fiction-list-item">[\S\s]+?<\/div>/g)
        const manga = []
       // console.log(res);
        liList.forEach(element => {
            const url = element.match(/href="(.+?)"/)[1]
            const title = element.match(/alt="(.+?)"/)[1]
            const cover = element.match(/src="(.+?)"/)[1]
            manga.push({
                title,
                url,
                cover
            })
        });
        return manga
    }

    async detail(url) {
        const res = await this.request(url)
        const content = res.match(/<script type="application\/ld\+json">[\s\S]+?<\/script>/)[0];
        const title = res.match(/<title>(.+?)<\/title>/)[1];
        const cover = content.match(/"image":"(.+?)"/)[1];
        const desc = res.match(/"description":"(.+?)"/)[1];
        const chapter = JSON.parse(res.match(/window.chapters = (\[[\s\S]+?\])/)[1]);
        return {
            title,
            cover,
            desc,
            episodes: [{
                title: "Directory",
                urls: chapter.map((item) => ({
                    name: item.title,
                    url: item.url
                }))
            }]
        }

    }

    async watch(url) {
    const res = await this.request(url);
    const content = res.match(/<p>[^&]+?<\/p>/g);
    const new_content = [];

    if (content) {
        content.forEach((e) => {
            e = e.replace(/<.+?>/g, "");
            console.log(e);
            new_content.push(e);
        });
    }

    const title = res.match(/>(.+?)<\/h1>/)[0];
    return {
        content: new_content,
        title,
    };
}

}
