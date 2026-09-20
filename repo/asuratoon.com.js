// ==MiruExtension==
// @name         AsuraScan
// @version      v0.0.6
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://asurascans.com/images/logo.webp
// @package      asuratoon.com
// @type         manga
// @webSite      https://asurascans.com
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("asurascans"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "AsuraScan URL",
      key: "asurascans",
      type: "input",
      description: "Homepage URL for AsuraScan",
      defaultValue: "https://asurascans.com",
    });

    this.registerSetting({
      title: "Reverse Order of Chapters",
      key: "reverseChaptersOrderAsura",
      type: "toggle",
      description: "Reverse the order of chapters in ascending order",
      defaultValue: "true",
    });
  }

  async latest(page) {
    const res = await this.req(`/comics?page=${page}`);
    const regex = /<a[^>]*href="(\/comics\/[^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/gi;
    const matches = [...res.matchAll(regex)];

    let comic = [];
    const seen = new Set();
    for (const m of matches) {
      const url = m[1];
      const cover = m[2];
      const title = m[3];
      if (url && title && title !== "poster" && title !== "logo" && !seen.has(url)) {
        seen.add(url);
        comic.push({
          title: title.trim(),
          url,
          cover,
        });
      }
    }
    return comic;
  }

  async search(kw, page) {
    const res = await this.req(`/comics?page=${page}&name=${kw}`);
    const regex = /<a[^>]*href="(\/comics\/[^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/gi;
    const matches = [...res.matchAll(regex)];

    let comic = [];
    const seen = new Set();
    for (const m of matches) {
      const url = m[1];
      const cover = m[2];
      const title = m[3];
      if (url && title && title !== "poster" && title !== "logo" && !seen.has(url)) {
        seen.add(url);
        comic.push({
          title: title.trim(),
          url,
          cover,
        });
      }
    }
    return comic;
  }

  async detail(url) {
    const baseUrl = await this.getSetting("asurascans");
    let cleanUrl = url.startsWith("/") ? url : "/" + url;
    cleanUrl = cleanUrl.replace(/^\/series\//, "/comics/");

    const res = await this.request("", {
      headers: {
        "Miru-Url": baseUrl + cleanUrl,
      },
    });

    const titleMatch = res.match(/<h1[^>]*>([\s\S]+?)<\/h1>/i) || res.match(/span class="[^"]*text-xl[^"]*"[^>]*>([\s\S]+?)</i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const coverMatch = res.match(/<img[^>]*src="([^"]+)"[^>]*alt="poster"/i) || res.match(/<img[^>]*alt="poster"[^>]*src="([^"]+)"/i) || res.match(/<img[^>]*src="([^"]*covers[^"]*)"/i);
    const cover = coverMatch ? coverMatch[1] : "";

    const descMatch = res.match(/span class="font-medium text-sm text-\[\#A2A2A2\]">([\s\S]+?)<\/span>/i) || res.match(/<p[^>]*class="[^"]*text-sm[^"]*"[^>]*>([\s\S]+?)<\/p>/i);
    const desc = descMatch ? descMatch[1].trim() : "";

    const chapMatches = [...res.matchAll(/<a[^>]*href="(\/comics\/[^"]*\/chapter\/[^"]*)"[^>]*>([\s\S]+?)<\/a>/gi)];

    const seen = new Set();
    const episodes = [];
    for (const m of chapMatches) {
      const href = m[1];
      if (!href || seen.has(href)) continue;
      seen.add(href);

      let name = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      episodes.push({
        name,
        url: href,
      });
    }

    if ((await this.getSetting("reverseChaptersOrderAsura")) === "true") {
      episodes.reverse();
    }

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
    const baseUrl = await this.getSetting("asurascans");
    let cleanUrl = url.startsWith("/") ? url : "/" + url;
    cleanUrl = cleanUrl.replace(/^\/series\//, "/comics/");
    const fullUrl = url.startsWith("http") ? url : baseUrl + cleanUrl;

    const res = await this.request("", {
      headers: {
        "Miru-Url": fullUrl,
        referer: baseUrl + "/",
        origin: baseUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*alt="Page \d+[^"]*"/gi;
    let httpMatches = [...res.matchAll(imgRegex)].map((m) => m[1]);

    if (!httpMatches || httpMatches.length === 0) {
      const fallbackRegex = /<img[^>]+src="([^"]*asura-images\/chapters\/[^"]+)"/gi;
      httpMatches = [...res.matchAll(fallbackRegex)].map((m) => m[1]);
    }

    if (!httpMatches || httpMatches.length === 0) {
      const regex = /<script>(.*?)\<\/script>/gs;
      const matches = res.match(regex) || [];
      const pageRegex = /\\"pages\\":\[(.*?)\]/gs;
      const pageMatches = matches.join("").match(pageRegex) || [];
      const httpRegex = /https:\/\/[^\\]+/g;
      httpMatches = (pageMatches.join("").match(httpRegex) || []);
    }

    return {
      urls: httpMatches || [],
    };
  }
}
