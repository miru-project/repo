// ==MiruExtension==
// @name         Ravenscans
// @version      v0.0.2
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://ravenscans.net/wp-content/uploads/2025/05/logo.png
// @package      ravenscans.com
// @type         manga
// @webSite      https://ravenscans.org
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("ravenscans"),
            },
        });
    }

    async load() {
        await this.registerSetting({
            title: "Ravenscans URL",
            key: "ravenscans",
            type: "input",
            description: "Homepage URL for Ravenscans",
            defaultValue: "https://ravenscans.org",
        });
    }

    async latest(page) {
        const res = await this.req(`/manga/?page=${page}&order=update`);
        const bsxList = res.match(/<div class="bsx">([\s\S]+?)<\/div>\s*<\/div>/g) || [];

        const comic = [];
        for (const item of bsxList) {
            const urlMatch = item.match(/href="([^"]+)"/);
            const titleMatch = item.match(/<div class="tt">[\s\S]*?([^\s<][^<]*[^\s<])/) || item.match(/title="([^"]+)"/);
            const coverMatch = item.match(/src="([^"]+)"/);

            const url = urlMatch ? urlMatch[1] : "";
            const title = titleMatch ? titleMatch[1].replace(/&#8217;/g, "'").trim() : "";
            const cover = coverMatch ? coverMatch[1] : "";

            if (url && title) {
                comic.push({
                    title,
                    url,
                    cover,
                });
            }
        }
        return comic;
    }

    async search(kw, page) {
        const res = await this.req(`/page/${page}/?s=${kw}`);
        const bsxList = res.match(/<div class="bsx">([\s\S]+?)<\/div>\s*<\/div>/g) || [];

        const result = [];
        for (const item of bsxList) {
            const urlMatch = item.match(/href="([^"]+)"/);
            const titleMatch = item.match(/<div class="tt">[\s\S]*?([^\s<][^<]*[^\s<])/) || item.match(/title="([^"]+)"/);
            const coverMatch = item.match(/src="([^"]+)"/);

            const url = urlMatch ? urlMatch[1] : "";
            const title = titleMatch ? titleMatch[1].replace(/&#8217;/g, "'").trim() : "";
            const cover = coverMatch ? coverMatch[1] : "";

            if (url && title) {
                result.push({
                    title,
                    url,
                    cover,
                });
            }
        }
        return result;
    }

    async detail(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });

        const titleMatch = res.match(/<h1[^>]*class="entry-title"[^>]*>([\s\S]+?)<\/h1>/i) || res.match(/class="infox"[\s\S]*?<h1[^>]*>([\s\S]+?)<\/h1>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").replace(/&#8217;/g, "'").trim() : "Unknown Title";

        const coverMatch = res.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i) || res.match(/<div class="thumb">[\s\S]*?<img[^>]*src="([^"]+)"/i);
        const cover = coverMatch ? coverMatch[1] : "";

        const descMatch = res.match(/<div[^>]*class="entry-content[^"]*"[^>]*>([\s\S]+?)<\/div>/i);
        const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";

        const chMatches = [...res.matchAll(/<li[^>]*data-num="([^"]*)"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<span[^>]*class="chapternum"[^>]*>([\s\S]+?)<\/span>/gi)];

        const episodes = chMatches.map((m) => {
            const chUrl = m[2];
            const chName = m[3].replace(/<[^>]+>/g, "").trim();
            return {
                name: chName || `Chapter ${m[1]}`,
                url: chUrl,
            };
        });

        return {
            title,
            cover,
            desc,
            episodes: [
                {
                    title: "Chapters",
                    urls: episodes,
                },
            ],
        };
    }

    async watch(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });

        const match = res.match(/"images":\s*\[([^\]]+)\]/);

        if (!match) {
            return { urls: [] };
        }

        const imagesContent = match[1];

        const imageUrls = (imagesContent.match(/"([^"]+)"/g) || [])
            .map(m => m.slice(1, -1).replace(/\\/g, ''));

        return { urls: imageUrls };
    }
}
