// ==MiruExtension==
// @name         MangaDex
// @version      v0.0.4
// @author       bethro
// @lang         all
// @license      MIT
// @icon         https://mangadex.org/img/avatar.png
// @package      mangadex.org
// @type         manga
// @webSite      https://api.mangadex.org
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("mangadex"),
      },
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    });
  }

  async load() {
    await this.registerSetting({
      title: "MangaDex API",
      key: "mangadex",
      type: "input",
      description: "MangaDex API URL",
      defaultValue: "https://api.mangadex.org",
    });

    await this.registerSetting({
      title: "Preferred Language",
      key: "lang",
      type: "input",
      description: "Chapters will be downloaded in this language",
      defaultValue: "en",
    });

    await this.registerSetting({
      title: "Reverse Order of Chapters",
      key: "reverseChaptersOrder",
      type: "toggle",
      description: "Reverse the order of chapters",
      defaultValue: "false",
    });
  }

  getTitle(item) {
    const titleObj = item.attributes?.title || {};
    const keys = Object.keys(titleObj);
    if (keys.length > 0 && titleObj[keys[0]]) {
      return titleObj[keys[0]];
    }
    const altTitles = item.attributes?.altTitles;
    if (altTitles && Array.isArray(altTitles)) {
      for (const t of altTitles) {
        if (!t) continue;
        const k = Object.keys(t)[0];
        if (k && t[k]) return t[k];
      }
    }
    return "unknown title";
  }

  getDesc(item, preferredLang = "en") {
    const descObj = item.attributes?.description || {};
    return descObj[preferredLang] || descObj["en"] || descObj[Object.keys(descObj)[0]] || "";
  }

  async latest(page) {
    const offset = page > 1 ? (page - 1) * 30 : 0;
    const res = await this.req(
      `/manga?order[rating]=desc&limit=30&offset=${offset}&includes[]=cover_art`
    );

    let data = (res.data || []).map((item) => {
      const mangaId = item.id;
      const coverArtObject = item.relationships?.find(
        (relationship) => relationship.type === "cover_art"
      );

      const coverFilename = coverArtObject?.attributes?.fileName;
      const coverImageURL = coverFilename
        ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}.256.jpg`
        : "";

      return {
        url: item.id,
        title: this.getTitle(item),
        cover: coverImageURL,
      };
    });
    return data;
  }

  async search(keyword, page) {
    const limit = 30;
    const offset = (page - 1) * limit;

    const response = await this.req(
      `/manga?title=${keyword}&limit=${limit}&offset=${offset}&includes[]=cover_art`
    );
    const mangaList = (response.data || []).map((item) => {
      const mangaId = item.id;
      const coverArtObject = item.relationships?.find(
        (relationship) => relationship.type === "cover_art"
      );

      const coverFilename = coverArtObject?.attributes?.fileName;
      const coverImageURL = coverFilename
        ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}.256.jpg`
        : "";

      return {
        url: mangaId,
        title: this.getTitle(item),
        cover: coverImageURL,
      };
    });

    return mangaList;
  }

  async detail(mangaId) {
    const mangaRes = await this.req(`/manga/${mangaId}?includes[]=cover_art`);
    const manga = mangaRes.data;
    const preferredLang = await this.getSetting("lang");

    const coverArtObject = manga.relationships?.find(
      (relationship) => relationship.type === "cover_art"
    );
    const coverFilename = coverArtObject?.attributes?.fileName;
    const coverImageURL = coverFilename
      ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}`
      : "";

    const metadata = (manga.attributes?.tags || [])
      .filter((tag) => tag.attributes?.group === "genre")
      .reduce((acc, tag) => {
        const nameObj = tag.attributes?.name || {};
        const nameKeys = Object.keys(nameObj);
        const name = nameObj.en || (nameKeys.length > 0 ? nameObj[nameKeys[0]] : null);

        const descObj = tag.attributes?.description || {};
        const descKeys = Object.keys(descObj);
        const description = descObj.en || (descKeys.length > 0 ? descObj[descKeys[0]] : "");

        if (name) {
          acc[name] = description;
        }
        return acc;
      }, {});

    const chapRes = await this.req(
      `/manga/${mangaId}/feed?&order[volume]=asc&order[chapter]=asc&limit=500&translatedLanguage%5B%5D=${preferredLang}`
    );
    const chapters = chapRes.data || [];

    if ((await this.getSetting("reverseChaptersOrder")) === "true") {
      chapters.reverse();
    }

    const chapMap = new Map();

    for (const item of chapters) {
      const lang = item.attributes?.translatedLanguage || "unknown";
      const chapter = {
        name: `Chapter ${item.attributes?.chapter ?? ""}`,
        url: item.id,
      };

      if (!chapMap.has(lang)) {
        chapMap.set(lang, [chapter]);
      } else {
        chapMap.get(lang).push(chapter);
      }
    }

    const sortedChapMap = new Map(
      [...chapMap.entries()].sort((a, b) => {
        if (a[0] === preferredLang) return -1;
        if (b[0] === preferredLang) return 1;
        return a[0].localeCompare(b[0]); // order alphabetically
      })
    );

    const episodes = Array.from(sortedChapMap.entries()).map(([lang, list]) => ({
      title: lang,
      urls: list,
    }));

    return {
      title: this.getTitle(manga),
      cover: coverImageURL,
      desc: this.getDesc(manga, preferredLang),
      metadata,
      episodes,
    };
  }

  async watch(chapterId) {
    const response = await this.req(`/at-home/server/${chapterId}`);
    let { baseUrl: host, chapter: { hash: chapterHash, data } } = response;

    const urls = (data || []).map((filename) => `${host}/data/${chapterHash}/${filename}`);

    return { urls };
  }
}
