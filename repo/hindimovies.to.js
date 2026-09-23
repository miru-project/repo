// ==MiruExtension==
// @name         HindiMovies
// @version      v0.0.1
// @author       OshekharO
// @lang         hi
// @license      MIT
// @package      hindimovies.to
// @type         bangumi
// @icon         https://img.hindimovies.to/hindimovies-logo.png
// @webSite      https://ww1.hindimovies.to
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    try {
      const url = page === 1 ? "/" : `/page/${page}/`;
      const res = await this.request(url);
      const cards = await this.querySelectorAll(res, "div.col-md-3.w3l-movie-gride-agile");
      const list = [];

      for (const card of cards) {
        const html = card.content;
        const link = await this.querySelector(html, "a");
        const href = await link.getAttributeText("href");
        let title = await link.getAttributeText("title");

        const img = await this.querySelector(html, "img");
        let cover = await img.getAttributeText("data-src");
        if (!cover) {
          cover = await img.getAttributeText("src");
        }

        if (!title) {
          const titleElem = await this.querySelector(html, "a.font-bold");
          title = await titleElem.text;
        }

        if (href && title) {
          const fullUrl = href.startsWith("http") ? href : `https://ww1.hindimovies.to${href.startsWith("/") ? "" : "/"}${href}`;
          list.push({
            title: title.trim(),
            url: fullUrl,
            cover: cover || null,
          });
        }
      }

      return list;
    } catch (e) {
      return [];
    }
  }

  async search(kw, page) {
    try {
      const query = encodeURIComponent(kw.trim());
      const url = page === 1 ? `/full-search/${query}/` : `/full-search/${query}/${page}/`;
      const res = await this.request(url);
      const cards = await this.querySelectorAll(res, "div.col-md-3.w3l-movie-gride-agile");
      const list = [];

      for (const card of cards) {
        const html = card.content;
        const link = await this.querySelector(html, "a");
        const href = await link.getAttributeText("href");
        let title = await link.getAttributeText("title");

        const img = await this.querySelector(html, "img");
        let cover = await img.getAttributeText("data-src");
        if (!cover) {
          cover = await img.getAttributeText("src");
        }

        if (!title) {
          const titleElem = await this.querySelector(html, "a.font-bold");
          title = await titleElem.text;
        }

        if (href && title) {
          const fullUrl = href.startsWith("http") ? href : `https://ww1.hindimovies.to${href.startsWith("/") ? "" : "/"}${href}`;
          list.push({
            title: title.trim(),
            url: fullUrl,
            cover: cover || null,
          });
        }
      }

      return list;
    } catch (e) {
      return [];
    }
  }

  async detail(url) {
    try {
      const reqUrl = url.startsWith("http") ? url : `https://ww1.hindimovies.to${url.startsWith("/") ? "" : "/"}${url}`;
      const res = await this.request("", {
        headers: {
          "Miru-Url": reqUrl,
        },
      });

      let title = "";
      const titleElem = await this.querySelector(res, "meta[property='og:title']");
      if (titleElem) {
        title = await titleElem.getAttributeText("content");
      }
      if (!title) {
        const h1 = await this.querySelector(res, "h1");
        title = h1 ? await h1.text : "Movie Detail";
      }

      let cover = "";
      const coverElem = await this.querySelector(res, "meta[property='og:image']");
      if (coverElem) {
        cover = await coverElem.getAttributeText("content");
      }

      let desc = "";
      const descElem = await this.querySelector(res, "meta[name='description']");
      if (descElem) {
        desc = await descElem.getAttributeText("content");
      }

      const serverLinks = [];
      const tabs = await this.querySelectorAll(res, "#video-tabs a");
      for (const tab of tabs) {
        const tabHtml = tab.content;
        const sUrl = await this.getAttributeText(tabHtml, "a", "data-href");
        const name = await this.querySelector(tabHtml, "a").text;
        if (sUrl && (sUrl.includes("ok.ru") || sUrl.includes("odnoklassniki.ru"))) {
          let fullSUrl = sUrl;
          if (fullSUrl.startsWith("//")) {
            fullSUrl = "https:" + fullSUrl;
          }
          serverLinks.push({
            name: name.trim() || "OK.ru Server",
            url: fullSUrl,
          });
        }
      }

      const allLinks = await this.querySelectorAll(res, "a");
      for (const link of allLinks) {
        const lHtml = link.content;
        const href = await this.getAttributeText(lHtml, "a", "href");
        const text = await this.querySelector(lHtml, "a").text;

        if (href && (href.includes("ok.ru") || href.includes("odnoklassniki.ru"))) {
          let fullHref = href;
          if (fullHref.startsWith("//")) {
            fullHref = "https:" + fullHref;
          }
          const cleanText = text ? text.trim() : "OK.ru Stream";
          if (!serverLinks.some((item) => item.url === fullHref)) {
            serverLinks.push({
              name: cleanText,
              url: fullHref,
            });
          }
        }
      }

      return {
        title: title.trim(),
        cover: cover || null,
        desc: desc.trim(),
        episodes: [
          {
            title: "OK.ru Servers",
            urls: serverLinks,
          },
        ],
      };
    } catch (e) {
      return {
        title: "Error loading detail",
        cover: null,
        desc: e.toString(),
        episodes: [],
      };
    }
  }

  async watch(url) {
    let directUrl = "";
    const referer = "https://ok.ru/";

    if (url) {
      if (url.startsWith("//")) {
        url = "https:" + url;
      }

      try {
        let embedUrl = url;
        if (!embedUrl.includes("/videoembed/")) {
          const vidMatch = embedUrl.match(/video\/(\d+)/);
          if (vidMatch) {
            embedUrl = `https://ok.ru/videoembed/${vidMatch[1]}`;
          }
        }

        const res = await this.request("", {
          headers: {
            "Miru-Url": embedUrl,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        const dataOptionsMatch = res.match(/data-options=["']([^"']+)["']/);
        if (dataOptionsMatch) {
          try {
            const decoded = dataOptionsMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            const opts = JSON.parse(decoded);
            if (opts.flashvars && opts.flashvars.metadata) {
              const meta = typeof opts.flashvars.metadata === 'string' ? JSON.parse(opts.flashvars.metadata) : opts.flashvars.metadata;
              if (meta.hlsManifestUrl) {
                directUrl = meta.hlsManifestUrl;
              } else if (meta.videos && Array.isArray(meta.videos) && meta.videos.length > 0) {
                const qualityOrder = ["full", "hd", "sd", "low", "lowest", "mobile"];
                meta.videos.sort((a, b) => qualityOrder.indexOf(a.name) - qualityOrder.indexOf(b.name));
                directUrl = meta.videos[0].url;
              }
            }
          } catch (e) {
            // json parse fail
          }
        }

        if (!directUrl) {
          const videoUrlMatch = res.match(/https?:\/\/[^\s'"]+\.(?:mp4|m3u8)[^\s'"]*/);
          if (videoUrlMatch) {
            directUrl = videoUrlMatch[0];
          }
        }
      } catch (e) {
        // error handling
      }
    }

    const finalUrl = directUrl || url;
    let type = "mp4";
    if (finalUrl.includes(".m3u8") || (finalUrl.includes("m3u8") && !finalUrl.includes(".mp4"))) {
      type = "hls";
    }

    return {
      type: type,
      url: finalUrl,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": referer,
      },
    };
  }
}
