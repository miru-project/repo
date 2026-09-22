// ==MiruExtension==
// @name         MoviesArc
// @version      v0.0.3
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg
// @package      themoviearchive
// @type         bangumi
// @webSite      https://api.themoviedb.org/3
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("moviesarc"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "MoviesArc API",
      key: "moviesarc",
      type: "input",
      description: "MoviesArc Api Url",
      defaultValue: "https://api.themoviedb.org/3",
    });
  }

  async latest() {
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://api.themoviedb.org/3/trending/movie/day?language=en-US&api_key=9990db75d12d4ecd4ed84628ebc96403",
      },
    });
    return res.results.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: "https://image.tmdb.org/t/p/w300/" + item.poster_path,
    }));
  }

  async detail(url) {
    const res = await this.req(`/movie/${url}?language=en-US&api_key=9990db75d12d4ecd4ed84628ebc96403`);
    let episodeUrls = [];

    try {
      const streamRes = await this.request("", {
        headers: {
          "Miru-Url": `https://streamrip.fun/api/download/movie/${url}`,
        },
      });

      if (streamRes && Array.isArray(streamRes.downloads)) {
        const playableDownloads = streamRes.downloads.filter(
          (dl) => dl && dl.url && !dl.url.includes("fastdlserver") && !dl.url.includes("gdflix")
        );

        const downloadsToUse = playableDownloads.length > 0 ? playableDownloads : streamRes.downloads;

        episodeUrls = downloadsToUse
          .filter((dl) => dl && dl.url)
          .map((dl) => {
            const server = dl.server || dl.source || "Server";
            const parts = [server];
            if (dl.quality) parts.push(`${dl.quality}p`);
            if (dl.size) parts.push(`(${dl.size})`);

            return {
              name: parts.join(" - "),
              url: dl.url,
            };
          });
      }
    } catch (e) {
      console.log(e);
    }

    if (episodeUrls.length === 0) {
      episodeUrls = [
        {
          name: `Watch ${res.title}`,
          url: res.id.toString(),
        },
      ];
    }

    return {
      title: res.title,
      cover: "https://image.tmdb.org/t/p/w300" + res.poster_path,
      desc: res.overview,
      episodes: [
        {
          title: "Ep",
          urls: episodeUrls,
        },
      ],
    };
  }

  async search(kw) {
    const res = await this.request(`query=${kw}&include_adult=false&language=en-US&page=1&region=US&api_key=9990db75d12d4ecd4ed84628ebc96403`, {
      headers: {
        "Miru-Url": "https://api.themoviedb.org/3/search/movie?",
      },
    });

    return res.results.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: "https://image.tmdb.org/t/p/w300" + item.poster_path,
    }));
  }

  async watch(url) {
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      let finalUrl = url;

      const isDirectMedia =
        url.includes("googleusercontent.com") ||
        url.includes("workers.dev") ||
        url.includes("hubcloud") ||
        url.includes("busycdn") ||
        url.includes("nebula.to") ||
        url.includes("jabroni.mov") ||
        url.includes("wootly") ||
        url.includes(".m3u8") ||
        url.includes(".mp4") ||
        url.includes(".mkv");

      if (!isDirectMedia) {
        let currentUrl = url;
        let referer = url;

        for (let i = 0; i < 4; i++) {
          try {
            const res = await this.request("", {
              headers: {
                "Miru-Url": currentUrl,
                "User-Agent": userAgent,
                "Referer": referer,
              },
            });

            if (typeof res === "string") {
              const directMatch =
                res.match(/https?:\/\/[^\s"'<>]*(?:busycdn|workers\.dev|hubcloud|googleusercontent\.com|nebula\.to|jabroni\.mov|wootly)[^\s"'<>]*/i) ||
                res.match(/https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4|mkv)(?:\?[^\s"'<>]*)?/i);

              if (directMatch) {
                finalUrl = directMatch[0];
                break;
              }

              const redirectMatch =
                res.match(/https?:\/\/[^\s"'<>]*(?:gdflix|fastdl)[^\s"'<>]*/i) ||
                res.match(/href=["'](https?:\/\/[^"']+)["']/i);

              const nextUrl = redirectMatch ? (redirectMatch[1] || redirectMatch[0]) : null;
              if (nextUrl && nextUrl !== currentUrl) {
                referer = currentUrl;
                currentUrl = nextUrl;
                finalUrl = currentUrl;
              } else {
                break;
              }
            } else {
              break;
            }
          } catch (e) {
            console.log(e);
            break;
          }
        }
      }

      const originMatch = finalUrl.match(/^(https?:\/\/[^\/]+)/i);
      let origin = originMatch ? originMatch[1] : "";
      let referer = origin ? origin + "/" : "";

      if (finalUrl.includes("nebula.to") || finalUrl.includes("jabroni.mov") || finalUrl.includes("wootly") || finalUrl.includes("goojara")) {
        referer = "https://ww1.goojara.to/";
        origin = "https://ww1.goojara.to";
      } else if (finalUrl.includes("fastdl") || finalUrl.includes("gdflix")) {
        referer = "https://dl.fastdlserver.site/";
        origin = "https://dl.fastdlserver.site";
      }

      return {
        type: finalUrl.includes(".m3u8") ? "hls" : "mp4",
        url: finalUrl,
        headers: {
          "User-Agent": userAgent,
          "Referer": referer,
          "Origin": origin,
        },
      };
    }

    const res = await this.request("", {
      headers: {
        "Miru-Url": `https://streamrip.fun/api/download/movie/${url}`,
        "User-Agent": userAgent,
      },
    });

    const downloads = res?.downloads || [];
    const downloadUrl = downloads[0]?.url || "";

    return {
      type: downloadUrl.includes(".m3u8") ? "hls" : "mp4",
      url: downloadUrl,
      headers: {
        "User-Agent": userAgent,
      },
    };
  }
}
