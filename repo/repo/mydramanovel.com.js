// ==MiruExtension==
// @name         MyDramaNovel
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      mydramanovel.com
// @type         fikushon
// @webSite      https://mydramanovel.com
// @icon         https://mydramanovel.com/wp-content/uploads/2025/01/Icon-300x300.webp
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    async request(url, options) {
        let res = await super.request(url, options);

        if (
            typeof res === "string" &&
            (res.includes("Just a moment...") ||
                res.includes("cf-mitigation") ||
                res.includes("Attention Required! | Cloudflare") ||
                res.includes("Enable JavaScript and cookies to continue"))
        ) {
            const targetUrl = options?.headers?.["Miru-Url"] || url;
            await this.openWebView(targetUrl);
            res = await super.request(url, options);
        }

        return res;
    }

    async fetchNovels() {
        const res = await this.request('/novels/')
        const list = await this.querySelectorAll(res, 'a.td-ct-item')
        return await Promise.all(
            list.map(async el => {
                const html = await el.content
                const title = await this.querySelector(html, '.td-ct-item-name').text.then(t => t.trim())
                const url = await this.getAttributeText(html, 'a', 'href')
                return { title, url, cover: '' }
            })
        )
    }

    async latest(page) {
        if (page > 1) return []
        return await this.fetchNovels()
    }

    async search(kw, page) {
        if (page > 1) return []
        const novels = await this.fetchNovels()
        const lowerKw = kw.toLowerCase()
        return novels.filter(item => item.title.toLowerCase().includes(lowerKw) || item.url.toLowerCase().includes(lowerKw))
    }

    async detail(url) {
        const res = await this.request(url)
        const title = await this.querySelector(res, 'h1').text.then(t => t.trim())

        let desc = ''
        try {
            const descElements = await this.querySelectorAll(res, '.tdb_single_content .tdb-block-inner p')
            const descTexts = await Promise.all(descElements.map(el => el.text))
            desc = descTexts.map(t => t.trim()).filter(Boolean).join('\n')
        } catch (e) {
            desc = ''
        }

        const novelSlug = url.replace('https://mydramanovel.com', '').replace(/^\/+|\/+$/g, '')
        const allLinks = await this.querySelectorAll(res, 'a')

        const chapterMap = new Map()
        await Promise.all(
            allLinks.map(async el => {
                const href = await this.getAttributeText(el.content, 'a', 'href')
                const name = await el.text.then(t => t.trim())
                if (
                    href &&
                    name &&
                    href.includes(novelSlug) &&
                    (href.toLowerCase().includes('/chapter') || href.toLowerCase().includes('/extra'))
                ) {
                    if (!chapterMap.has(href)) {
                        chapterMap.set(href, name)
                    }
                }
            })
        )

        const chapters = Array.from(chapterMap.entries()).map(([chUrl, chName]) => ({
            name: chName,
            url: chUrl,
        }))

        return {
            title,
            cover: '',
            desc,
            episodes: [{ title: 'Chapters', urls: chapters }],
        }
    }

    async watch(url) {
        const res = await this.request(url)
        const title = await this.querySelector(res, 'h1').text.then(t => t.trim())

        let content = []

        // Extract using regex fallback to ensure complete text paragraph extraction
        if (typeof res === 'string') {
            const contentBlockMatch = res.match(/<div class="[^"]*tdb-block-inner[^"]*">([\s\S]*?)<\/div>/i)
            const targetHtml = contentBlockMatch ? contentBlockMatch[1] : res

            const pMatches = targetHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)
            if (pMatches && pMatches.length > 0) {
                content = pMatches
                    .map(p => p.replace(/<[^>]+>/g, '').replace(/&(#\d+|[a-z]+);/gi, match => {
                        if (match === '&#8220;' || match === '&#8221;') return '"'
                        if (match === '&#8217;' || match === '&#8216;') return "'"
                        if (match === '&#8230;') return '...'
                        if (match === '&amp;') return '&'
                        if (match === '&lt;') return '<'
                        if (match === '&gt;') return '>'
                        return match
                    }).trim())
                    .filter(Boolean)
            }
        }

        if (!content || content.length === 0) {
            const pElements = await this.querySelectorAll(res, 'p')
            content = await Promise.all(pElements.map(el => el.text.then(t => t.trim())))
            content = content.filter(Boolean)
        }

        return {
            title,
            content,
        }
    }
}
