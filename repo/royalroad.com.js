// ==MiruExtension==
// @name         RoyalRoad
// @version      v0.0.3
// @author       appdevelpo
// @lang         en
// @license      MIT
// @package      royalroad.com
// @type         fikushon
// @webSite      https://www.royalroad.com
// @icon         https://www.royalroad.com/icons/favicon.ico?v=20200125
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    async fetchList(url) {
        const res = await this.request(url)
        const list = await this.querySelectorAll(res, '.fiction-list-item')
        return await Promise.all(
            list.map(async el => {
                const html = await el.content
                const title = await this.querySelector(html, '.fiction-title a').text
                const url = await this.getAttributeText(html, '.fiction-title a', 'href')
                const cover = await this.getAttributeText(html, 'img', 'src')
                return { title, url, cover }
            }),
        )
    }

    async latest(page) {
        return await this.fetchList(`/fictions/latest-updates?page=${page}`)
    }

    async search(kw, page) {
        return await this.fetchList(`/fictions/search?page=${page}&title=${kw}`)
    }

    async detail(url) {
        const res = await this.request(url)
        const title = await this.querySelector(res, 'h1').text
        const cover = await this.getAttributeText(res, '.cover-image-container img', 'src')
        const desc = await this.querySelector(res, '.description .hidden-content').text.then(t => t.trim())
        const chapters = await this.querySelectorAll(res, '#chapters .chapter-row').then(chaps =>
            Promise.all(
                chaps.map(async el => {
                    const html = await el.content
                    const name = await this.querySelector(html, 'a').text.then(t => t.trim())
                    const url = await this.getAttributeText(html, 'a', 'href')
                    return { name, url }
                }),
            ),
        )
        return {
            title,
            cover,
            desc,
            episodes: [{ title: 'Chapters', urls: chapters }],
        }
    }

    async watch(url) {
        const res = await this.request(url)
        const title = await this.querySelector(res, 'h1').text
        const text = await this.querySelector(res, '.chapter-content').text
        const content = text.split('<br>').map(t => t.trim())
        return { title, content }
    }
}
