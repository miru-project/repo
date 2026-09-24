// ==MiruExtension==
// @name         Senpai Tambayan
// @version      v0.0.1
// @author       OshekharO
// @lang         fil
// @license      MIT
// @icon         https://senpaitambayan.com/assets/images/favicon.ico
// @package      senpaitambayan.com
// @type         bangumi
// @webSite      https://senpaitambayan.com
// @description  Watch anime online with Tagalog/Filipino dubs on Senpai Tambayan.
// ==/MiruExtension==

export default class extends Extension {
  constructor() {
    super();
    this.supabaseUrl = "https://vmkldvrxrbleqexadwdl.supabase.co";
    this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta2xkdnJ4cmJsZXFleGFkd2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODEyMzIsImV4cCI6MjA4NTM1NzIzMn0.JW-qwVjmdyWWLexjZbHT4yfdelahzV34kK_lwW-g18g";
    this.siteUrl = "https://senpaitambayan.com";
  }

  async createFilter(filter) {
    const genresOptions = {
      "": "All",
      "Action": "Action",
      "Adventure": "Adventure",
      "Comedy": "Comedy",
      "Drama": "Drama",
      "Fantasy": "Fantasy",
      "Isekai": "Isekai",
      "Magic": "Magic",
      "Martial Arts": "Martial Arts",
      "Movie": "Movie",
      "Mystery": "Mystery",
      "Romance": "Romance",
      "School": "School",
      "Sci-Fi": "Sci-Fi",
      "Shounen": "Shounen",
      "Slice of Life": "Slice of Life",
      "Sports": "Sports",
      "Supernatural": "Supernatural",
    };

    return {
      genres: {
        title: "Genres",
        max: 1,
        min: 0,
        default: "",
        options: genresOptions,
      },
    };
  }

  async supabaseReq(path, options = {}) {
    const headers = {
      apikey: this.supabaseKey,
      Authorization: `Bearer ${this.supabaseKey}`,
      ...(options.headers || {}),
      "Miru-Url": `${this.supabaseUrl}${path}`,
    };
    return this.request("", {
      ...options,
      headers,
    });
  }

  getCoverUrl(imagelink) {
    if (!imagelink) return "";
    if (imagelink.startsWith("http")) return imagelink;
    return `${this.siteUrl}/assets/images/${imagelink}`;
  }

  async latest(page = 1, filter) {
    const limit = 20;
    const offset = (page - 1) * limit;

    let genreFilter = "";
    if (filter && filter.genres && filter.genres[0]) {
      const selectedGenre = filter.genres[0];
      const encodedGenre = encodeURIComponent(`["${selectedGenre}"]`);
      genreFilter = `&genre=cs.${encodedGenre}`;
    }

    const res = await this.supabaseReq(
      `/rest/v1/SenapaiViews?select=names,views,weblink,imagelink,ratings,datecreated,genre${genreFilter}&order=datecreated.desc&limit=${limit}&offset=${offset}`
    );
    if (!Array.isArray(res)) return [];
    return res.map((item) => ({
      title: item.names,
      url: item.weblink,
      cover: this.getCoverUrl(item.imagelink),
    }));
  }

  async search(kw, page = 1, filter) {
    const limit = 20;
    const offset = (page - 1) * limit;

    let genreFilter = "";
    if (filter && filter.genres && filter.genres[0]) {
      const selectedGenre = filter.genres[0];
      const encodedGenre = encodeURIComponent(`["${selectedGenre}"]`);
      genreFilter = `&genre=cs.${encodedGenre}`;
    }

    const encodedKw = encodeURIComponent(`*${kw}*`);
    const res = await this.supabaseReq(
      `/rest/v1/SenapaiViews?select=names,views,weblink,imagelink,ratings,datecreated,genre&names=ilike.${encodedKw}${genreFilter}&order=views.desc&limit=${limit}&offset=${offset}`
    );
    if (!Array.isArray(res)) return [];
    return res.map((item) => ({
      title: item.names,
      url: item.weblink,
      cover: this.getCoverUrl(item.imagelink),
    }));
  }

  async detail(url) {
    const encodedWeblink = encodeURIComponent(url);
    const res = await this.supabaseReq(
      `/rest/v1/SenapaiViews?select=names,views,weblink,imagelink,ratings,datecreated,genre&weblink=eq.${encodedWeblink}`
    );

    let title = url;
    let cover = "";
    let genres = "";
    let ratings = "N/A";
    let views = 0;

    if (Array.isArray(res) && res.length > 0) {
      const item = res[0];
      title = item.names || title;
      cover = this.getCoverUrl(item.imagelink);
      genres = Array.isArray(item.genre) ? item.genre.join(", ") : item.genre || "";
      ratings = item.ratings || "N/A";
      views = item.views || 0;
    }

    const pagePath = url.startsWith("/") ? url : `/anime/${url}`;
    const pageRes = await this.request("", {
      headers: {
        "Miru-Url": `${this.siteUrl}${pagePath}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const html = typeof pageRes === "string" ? pageRes : pageRes?.data || "";

    let siteSummary = "";
    const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaMatch && metaMatch[1]) {
      siteSummary = metaMatch[1].trim();
    }

    const descLines = [];
    if (siteSummary) descLines.push(siteSummary);
    descLines.push(`Rating: ${ratings} | Views: ${views}`);
    if (genres) descLines.push(`Genres: ${genres}`);
    const desc = descLines.join("\n\n");

    const optionRegex = /<option\s+([^>]*)>(.*?)<\/option>/gis;
    let match;
    const episodesByServer = {};

    while ((match = optionRegex.exec(html)) !== null) {
      const attrs = match[1];
      const optText = match[2].replace(/<[^>]+>/g, "").trim();

      if (!optText || optText.toLowerCase().includes("select episode")) continue;

      const serverRegex = /data-(server\d*)=["']([^"']+)["']/gi;
      let sMatch;
      while ((sMatch = serverRegex.exec(attrs)) !== null) {
        const serverKey = sMatch[1].toLowerCase();
        let videoUrl = sMatch[2].trim();

        if (
          !videoUrl ||
          videoUrl === "#" ||
          videoUrl.includes("XXXXX") ||
          videoUrl.includes("your-video-link") ||
          (!videoUrl.startsWith("http://") && !videoUrl.startsWith("https://") && !videoUrl.startsWith("//"))
        ) {
          continue;
        }

        const serverNum = serverKey.replace("server", "");
        const serverName = `Server ${serverNum}`;
        if (!episodesByServer[serverName]) {
          episodesByServer[serverName] = [];
        }

        episodesByServer[serverName].push({
          name: optText,
          url: videoUrl,
        });
      }
    }

    const episodeGroups = [];
    for (const [sName, urls] of Object.entries(episodesByServer)) {
      if (urls.length > 0) {
        episodeGroups.push({
          title: sName,
          urls: urls,
        });
      }
    }

    if (episodeGroups.length === 0) {
      episodeGroups.push({
        title: "Episodes",
        urls: [{ name: "Watch", url: `${this.siteUrl}${pagePath}` }],
      });
    }

    return {
      title,
      cover,
      desc,
      episodes: episodeGroups,
    };
  }

  async watch(url) {
    let targetUrl = url;

    // Handle ok.ru embeds by resolving direct streamable video URL
    if (targetUrl.includes("ok.ru")) {
      try {
        const embedUrl = targetUrl.startsWith("http") ? targetUrl : `https:${targetUrl}`;
        const res = await this.request("", {
          headers: {
            "Miru-Url": embedUrl,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
        });
        const html = typeof res === "string" ? res : res?.data || "";
        const optMatch = html.match(/data-options=["']([^"']+)["']/i);
        if (optMatch && optMatch[1]) {
          const unescaped = optMatch[1]
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&#39;/g, "'");
          const opts = JSON.parse(unescaped);
          const flashvars = opts.flashvars || {};
          let metadata = flashvars.metadata;
          if (typeof metadata === "string") {
            metadata = JSON.parse(metadata);
          }
          if (metadata && Array.isArray(metadata.videos) && metadata.videos.length > 0) {
            const sorted = metadata.videos.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
            targetUrl = sorted[0].url || targetUrl;
          } else if (metadata && metadata.hlsManifestUrl) {
            targetUrl = metadata.hlsManifestUrl;
          }
        }
      } catch (e) {
        // Fallback to original URL
      }
    }

    if (targetUrl.includes(".m3u8")) {
      return {
        type: "hls",
        url: targetUrl,
      };
    }

    return {
      type: "mp4",
      url: targetUrl,
    };
  }
}
