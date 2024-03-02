// ==MiruExtension==
// @name         yugenanime
// @version      v0.0.1
// @author       appdevelpo
// @lang         en
// @license      MIT
// @type         bangumi
// @icon         https://yugenanime.tv/static/img/favicon-32x32.png
// @package      yugenanime.tv
// @webSite      https://yugenanime.tv
// @nsfw         true
// ==/MiruExtension==

export default class Yugenanime extends Extension {
    async latest(page) {
        const res = await this.request(`/latest/?page=${page}`);
        //  console.log(res)
        const bsxList = await this.querySelectorAll(res, "li.ep-card");
        const mangas = [];
        for (const element of bsxList) {
            const content = element.content;
            const url = await this.getAttributeText(content, "a.ep-details", "href");
            const title = await this.querySelector(content, ".ep-origin-name").text;
            const title_text = title.replace(/\r|\n|\t/g, "")
            const cover = await this.getAttributeText(content, "img", "data-src");
            mangas.push({
                title: title_text,
                url,
                cover,
            });
        }
        return mangas;
    }

    async search(kw, page) {
        const res = await this.request(`/discover/?page=${page}&q=${kw}`);
        const bsxList = await this.querySelectorAll(res, "a.anime-meta");
        console.log(bsxList.length)
        const mangas = [];
        for(const element of bsxList){
            const content = element.content;
            const url = await this.getAttributeText(content, "a.anime-meta", "href")
            const title = await this.getAttributeText(content, "a.anime-meta", "title")
            const cover = await this.getAttributeText(content, "img", "data-src");
            mangas.push({
                title,
                url,
                cover,
            });
        }
        console.log(mangas)
        return mangas;
    }

    async detail(url) {
        const res = await this.request(`${url}watch`);
        const title = await this.querySelector(res, ".content > .p-10-t").text;
        //  console.log(title)
        const cover = await this.getAttributeText(res, "img.cover", "src");
        //  console.log(cover)
        const desc = await this.querySelector(res, ".p-10-t.description").text;
        //  console.log(desc)
        const bsxList = await this.querySelectorAll(res, ".ep-card");
        const urls = []
        for (const element of bsxList) {
            const content = element.content;
            const name = await this.querySelector(content, "a.ep-title").text;
            const url = await this.getAttributeText(content, "a.ep-title", "href");
            urls.push({
                name,
                url
            })
        }
        const bangumi = {
            title: title.replace(/\r|\n|\t/g, ""),
            cover,
            desc,
            episodes: [{ title: "", urls }]
        }
        return bangumi
    }

    async watch(url) {
        const api = "https://yugenanime.tv/api/embed/"
        const res = await this.request(url);
        const embedSelector = await this.getAttributeText(res, "#main-embed", "src");
        const id = embedSelector.match(/\/e\/(.+)/)[1]
        const body = {
            id:id, ac: 0
        }
        const apiRes = await this.request("", {

            method: "POST",
            data: body,
            headers: {
                "Miru-Url": api,
                 "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
                 "X-Requested-With":"XMLHttpRequest",
                "Referer":`https://yugenanime.tv/e/${id}/`,
            }
        });
        console.log(apiRes)
        const videoLink = apiRes.hls
        return{
            type:"hls",
            url:videoLink[0],
          }

    }
}

