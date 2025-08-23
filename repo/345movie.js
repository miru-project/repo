// ==MiruExtension==
// @name         345movie
// @version      v0.0.2
// @author       qizaru
// @lang         all
// @license      MIT
// @icon         https://345movie.net/favicon.ico
// @package      345movie.net
// @type         bangumi
// @webSite      https://345movie.net/movies
// @description  Extension for accessing 345movie.net content
// ==/MiruExtension==

export default class Movie345Extension extends Extension {
    constructor() {
        super();
        this.baseUrl = 'https://345movie.net';
    }

    async latest(page) {
        const res = await this.request(`/movies?page=${page}`);
        const moviePattern = /<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)".*?<a[^>]*href="\/watch\/([^"]+)"/gs;
        const movies = [];
        let match;
        
        while ((match = moviePattern.exec(res.data)) !== null) {
            const [_, cover, title, url] = match;
            movies.push({
                title: title.trim(),
                url: `watch/${url}`,
                cover: cover.startsWith('http') ? cover : `${this.baseUrl}${cover}`,
            });
        }
        
        return movies;
    }

    async search(kw, page) {
        const res = await this.request(`/search?q=${encodeURIComponent(kw)}&page=${page}`);
        const moviePattern = /<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)".*?<a[^>]*href="\/watch\/([^"]+)"/gs;
        const movies = [];
        let match;
        
        while ((match = moviePattern.exec(res.data)) !== null) {
            const [_, cover, title, url] = match;
            movies.push({
                title: title.trim(),
                url: `watch/${url}`,
                cover: cover.startsWith('http') ? cover : `${this.baseUrl}${cover}`,
            });
        }
        
        return movies;
    }

    async detail(url) {
        const res = await this.request(`/${url}`);
        
        const titleMatch = /<h1[^>]*class="[^"]*text-\[3vw\][^"]*"[^>]*>([^<]+)<\/h1>/i.exec(res.data);
        const title = titleMatch ? titleMatch[1].trim() : "";
        
        const coverMatch = /<img[^>]*src="([^"]+)"[^>]*class="[^"]*object-cover[^"]*"/i.exec(res.data);
        const cover = coverMatch ? coverMatch[1] : "";
        
        const descMatch = /<p[^>]*class="[^"]*line-clamp-3[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(res.data);
        const desc = descMatch ? descMatch[1].trim() : "";
        
        return {
            title,
            cover,
            desc,
            episodes: [
                {
                    title: "Watch",
                    urls: [{ name: "Watch Now", url: url }]
                }
            ]
        };
    }
    
    async watch(url) {
        const res = await this.request(`/${url}`);
        const sourceMatch = /<source[^>]*src="([^"]+)"[^>]*type="([^"]+)"/i.exec(res.data);
        
        if (sourceMatch) {
            const [_, sourceUrl, sourceType] = sourceMatch;
            return {
                type: sourceType.includes('m3u8') ? 'hls' : 'mp4',
                url: sourceUrl.startsWith('http') ? sourceUrl : `${this.baseUrl}${sourceUrl}`,
            };
        }
        
        return null;
    }
}

