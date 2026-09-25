// ==MiruExtension==
// @name         ReadComicsOnline
// @version      v0.0.2
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://readcomicsonline.lol/favicon.ico
// @package      readcomicsonline.ru
// @type         manga
// @webSite      https://readcomicsonline.lol
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("readcomicsonline"),
      },
    });
  }

  async load() {
    await this.registerSetting({
      title: "Base URL",
      key: "readcomicsonline",
      type: "input",
      description: "Homepage URL for ReadComicsOnline",
      defaultValue: "https://readcomicsonline.lol",
    });

    await this.registerSetting({
      title: "Reverse Order of Chapters",
      key: "reverseChaptersOrder",
      type: "toggle",
      description: "Reverse the order of chapters in ascending order",
      defaultValue: "true",
    });
  }

  async latest(page) {
    const res = await this.req(`/`);
    const articles = res.match(/<article[^>]*>[\s\S]*?<\/article>/gi) || [];

    const comic = [];
    for (const art of articles) {
      const titleMatch = art.match(/<a[^>]+href=["'](\/comic\/[^"'/]+)["'][^>]*>([\s\S]*?)<\/a>/i);
      const issueMatch = art.match(/<a[^>]+href=["'](\/comic\/[^"'/]+\/\d+)["'][^>]*>([\s\S]*?)<\/a>/i);
      const imgMatch = art.match(/<img[^>]+src=["']([^"']+)["']/i);

      if (titleMatch) {
        const url = titleMatch[1];
        const title = titleMatch[2].replace(/<[^>]+>/g, "").trim();
        const cover = imgMatch ? imgMatch[1] : "";
        const update = issueMatch ? issueMatch[2].replace(/<[^>]+>/g, "").trim() : "";

        comic.push({
          title,
          url,
          cover,
          update,
        });
      }
    }
    return comic;
  }

  async search(kw, page) {
    const res = await this.req(`/comics?q=${encodeURIComponent(kw)}`);
    const cardMatches = [...res.matchAll(/<a[^>]+href=["'](\/comic\/[^"'/]+)["'][^>]*>([\s\S]*?)<\/h3>/gi)];

    const results = [];
    const seen = new Set();
    const kwLower = kw.toLowerCase();

    for (const match of cardMatches) {
      const url = match[1];
      const cardHtml = match[2];

      const h3Match = cardHtml.match(/<h3[^>]*>([\s\S]*?)$/i);
      const imgMatch = cardHtml.match(/<img[^>]+src=["']([^"']+)["']/i);

      if (h3Match) {
        const title = h3Match[1].replace(/<[^>]+>/g, "").trim();
        if (title && !seen.has(url) && title.toLowerCase().includes(kwLower)) {
          seen.add(url);
          const slug = url.split("/").pop();
          const cover = imgMatch ? imgMatch[1] : `https://cdn.readcomicsonline.lol/covers/${slug}/1.webp`;

          results.push({
            title,
            url,
            cover,
          });
        }
      }
    }
    return results;
  }

  async detail(url) {
    const baseUrl = await this.getSetting("readcomicsonline");
    let cleanUrl = url.startsWith("/") ? url : "/" + url;
    const fullUrl = url.startsWith("http") ? url : baseUrl + cleanUrl;

    const res = await this.request("", {
      headers: {
        "Miru-Url": fullUrl,
      },
    });

    const titleMatch = res.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    const coverMatch = res.match(/<img[^>]+src=["']([^"']*\/covers\/[^"']+)["']/i) || res.match(/<img[^>]+src=["']([^"']+)["']/i);
    const cover = coverMatch ? coverMatch[1] : "";

    const descMatch = res.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const desc = descMatch ? descMatch[1].trim() : "";

    const issueMatches = [...res.matchAll(/<a[^>]+href=["'](\/comic\/[^"'/]+\/\d+)["'][^>]*>([\s\S]*?)<\/a>/gi)];

    const episodes = [];
    const seen = new Set();

    for (const match of issueMatches) {
      const epUrl = match[1];
      const epHtml = match[2];

      const nameSpanMatch = epHtml.match(/<span[^>]*class=["'][^"']*truncate[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
      let name = nameSpanMatch ? nameSpanMatch[1].replace(/<[^>]+>/g, "").trim() : epHtml.replace(/<[^>]+>/g, "").trim();

      if (name && !seen.has(epUrl) && !name.includes("Start Reading")) {
        seen.add(epUrl);
        episodes.push({
          name,
          url: epUrl,
        });
      }
    }

    if ((await this.getSetting("reverseChaptersOrder")) === "true") {
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
    const baseUrl = await this.getSetting("readcomicsonline");
    let cleanUrl = url.startsWith("/") ? url : "/" + url;
    const fullUrl = url.startsWith("http") ? url : baseUrl + cleanUrl;

    const res = await this.request("", {
      headers: {
        "Miru-Url": fullUrl,
      },
    });

    const pageMatches = [...res.matchAll(/https?:\/\/cdn\.readcomicsonline\.lol\/pages\/[^"']+\.webp/gi)];

    const seen = new Set();
    const urls = [];

    for (const match of pageMatches) {
      const pageUrl = match[0];
      if (!seen.has(pageUrl)) {
        seen.add(pageUrl);
        urls.push(pageUrl);
      }
    }

    return {
      urls,
    };
  }
}
