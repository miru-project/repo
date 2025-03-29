// ==MiruExtension==
// @name         456movie
// @version      v0.0.1
// @author       qizaru
// @lang         all
// @license      MIT
// @icon         https://456movie.net/favicon.ico
// @package      456movie.net
// @type         bangumi
// @webSite      https://456movie.net
// @description  Extension for accessing 456movie.net content
// ==/MiruExtension==

export default class extends Extension {
    async latest(page) {
      const res = await this.request(`/page/${page}`);
      
      const moviePattern = /<article class="item movies">\s*<div class="poster">\s*<img src="([^"]+)"[^>]*>\s*<div class="rating">([^<]*)<\/div>\s*<div class="mepo">\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      
      const movies = [];
      let match;
      
      while ((match = moviePattern.exec(res.data)) !== null) {
        const [_, cover, rating, url, title] = match;

        const urlParts = url.split('/');
        const id = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1].replace(/\/$/, '');
        
        movies.push({
          title: title.trim(),
          url: id,
          cover: cover,
        });
      }
      
      return movies;
    }
    
    async detail(url) {
      const res = await this.request(`/movie/${url}`);
      
      const titleMatch = /<h1[^>]*>([^<]+)<\/h1>/i.exec(res.data);
      const title = titleMatch ? titleMatch[1].trim() : "";
      
      const coverMatch = /<div class="poster">\s*<img src="([^"]+)"/i.exec(res.data);
      const cover = coverMatch ? coverMatch[1] : "";
      
      const descMatch = /<div class="wp-content">\s*([\s\S]*?)<\/div>/i.exec(res.data);
      const desc = descMatch ? descMatch[1].trim() : "";
      
      const sourcesPattern = /<li id="server-\d+">\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      let sourcesMatch;
      let streamUrls = [];
      
      while ((sourcesMatch = sourcesPattern.exec(res.data)) !== null) {
        const [_, sourceUrl, sourceName] = sourcesMatch;
        streamUrls.push({
          name: sourceName.trim(),
          url: sourceUrl
        });
      }
      
      return {
        title,
        cover,
        desc,
        episodes: [
          {
            title: "Watch",
            urls: streamUrls.length > 0 ? streamUrls : [{ name: "Watch Now", url: url }]
          }
        ]
      };
    }
    
    async search(kw, page) {
      const res = await this.request(`/search?q=${encodeURIComponent(kw)}&page=${page}`);
      
      const moviePattern = /<article class="item movies">\s*<div class="poster">\s*<img src="([^"]+)"[^>]*>\s*<div class="rating">([^<]*)<\/div>\s*<div class="mepo">\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      
      const movies = [];
      let match;
      
      while ((match = moviePattern.exec(res.data)) !== null) {
        const [_, cover, rating, url, title] = match;

        const urlParts = url.split('/');
        const id = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1].replace(/\/$/, '');
        
        movies.push({
          title: title.trim(),
          url: id,
          cover: cover,
        });
      }
      
      return movies;
    }
    
    async watch(url) {
      const res = await this.request(url);
      
      const iframeMatch = /<iframe[^>]*src="([^"]+)"/i.exec(res.data);
      
      if (iframeMatch) {
        const iframeSrc = iframeMatch[1];
        
        const iframeRes = await this.request(iframeSrc);
        
        const m3u8Match = /source\s+src="([^"]+\.m3u8[^"]*)"/i.exec(iframeRes.data) || 
                         /file:\s*"([^"]+\.m3u8[^"]*)"/i.exec(iframeRes.data) ||
                         /src:\s*"([^"]+\.m3u8[^"]*)"/i.exec(iframeRes.data);
        
        if (m3u8Match) {
          return {
            type: "hls",
            url: m3u8Match[1],
          };
        }
        
        const mp4Match = /source\s+src="([^"]+\.mp4[^"]*)"/i.exec(iframeRes.data) || 
                        /file:\s*"([^"]+\.mp4[^"]*)"/i.exec(iframeRes.data) ||
                        /src:\s*"([^"]+\.mp4[^"]*)"/i.exec(iframeRes.data);
        
        if (mp4Match) {
          return {
            type: "mp4",
            url: mp4Match[1],
          };
        }
      }
      
      const directM3u8Match = /source\s+src="([^"]+\.m3u8[^"]*)"/i.exec(res.data) || 
                             /file:\s*"([^"]+\.m3u8[^"]*)"/i.exec(res.data) ||
                             /src:\s*"([^"]+\.m3u8[^"]*)"/i.exec(res.data);
      
      if (directM3u8Match) {
        return {
          type: "hls",
          url: directM3u8Match[1],
        };
      }
      
      const directMp4Match = /source\s+src="([^"]+\.mp4[^"]*)"/i.exec(res.data) || 
                            /file:\s*"([^"]+\.mp4[^"]*)"/i.exec(res.data) ||
                            /src:\s*"([^"]+\.mp4[^"]*)"/i.exec(res.data);
      
      if (directMp4Match) {
        return {
          type: "mp4",
          url: directMp4Match[1],
        };
      }
      
      return null;
    }
  }
