// ==MiruExtension==
// @name         MangaDex
// @version      v0.0.2
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
    this.registerSetting({
      title: "MangaDex API",
      key: "mangadex",
      type: "input",
      description: "MangaDex API URL",
      defaultValue: "https://api.mangadex.org",
    });

    this.registerSetting({
      title: "Language",
      key: "lang",
      type: "input",
      description: "Language",
      defaultValue: "en",
    })

    this.registerSetting({
      title: "Reverse Order of Chapters",
      key: "reverseChaptersOrder",
      type: "toggle",
      description: "Reverse the order of chapters",
      defaultValue: "false",
    });
  }

  async latest(page) {
    const offset = page > 1 ? (page - 1) * 30 : 0;
    const res = await this.req(
      `/manga?order[rating]=desc&limit=30&offset=${offset}&includes[]=cover_art`
    );

    let data = await res.data.map((item) => {
      const mangaId = item.id;
      const coverArtObject = item.relationships.find(
        (relationship) => relationship.type === "cover_art"
      );
      if (!coverArtObject) return;

      const coverFilename = coverArtObject.attributes.fileName;
      const coverImageURL = `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}.256.jpg`;

      const title = (() => {
        const altTitle = item.attributes?.title;
        const key = Object.keys(altTitle)[0];
        return altTitle[key] || "unknown title";
      })();

      return {
        url: item.id,
        title: title,
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
    const mangaList = response.data.map((item) => {
      const title = (() => {
        const altTitle = item.attributes?.title;
        const key = Object.keys(altTitle)[0];
        return altTitle[key] || "unknown title";
      })();

      const mangaId = item.id;
      const coverArtObject = item.relationships.find(
        (relationship) => relationship.type === "cover_art"
      );
      const coverFilename = coverArtObject.attributes.fileName;
      const coverImageURL = `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}.256.jpg`;

      if (!coverArtObject) return;

      return {
        url: mangaId,
        title,
        cover: coverImageURL,
      };
    });

    return mangaList;
  }

async detail(mangaId) {
  const mangaRes = await this.req(`/manga/${mangaId}?includes[]=cover_art`);
  const manga = mangaRes.data;

  const coverArtObject = manga.relationships.find(
    (relationship) => relationship.type === "cover_art"
  );
  const coverFilename = coverArtObject.attributes.fileName;
  const coverImageURL = `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}`;

  const metadata = manga.attributes.tags
    .filter((tag) => tag.group === "genre")
    .reduce((metadata, tag) => {
      metadata[tag.name] = tag.description;
      return metadata;
    }, {});

  const chapRes = await this.req(`/manga/${mangaId}/feed?&order[volume]=asc&order[chapter]=asc&limit=500`);
  const chapters = chapRes.data;

  if (await this.getSetting("reverseChaptersOrder") === "true") {
    chapters.reverse();
  }

  const chapMap = new Map();
  const defaultLang = await this.getSetting("lang"); 

  for (const item of chapters) {
    const lang = item.attributes.translatedLanguage;
    const chapter = {
      name: `Chapter ${item.attributes.chapter}`,
      url: item.id,
    };

    if (!chapMap.has(lang)) {
      chapMap.set(lang, [chapter]);
    } else {
      chapMap.get(lang).push(chapter);
    }
  }

  const sortedChapMap = new Map([...chapMap.entries()].sort((a, b) => {
    if (a[0] === defaultLang) return -1;
    if (b[0] === defaultLang) return 1;
    return a[0].localeCompare(b[0]); // order alphabetically
  }));

  const episodes = Array.from(sortedChapMap.entries()).map(([lang, list]) => ({
    title: lang,
    urls: list,
  }));

  return {
    title: manga.attributes.title.en,
    cover: coverImageURL,
    desc: manga.attributes.description.en,
    metadata,
    episodes,
  };
}

  async watch(chapterId) {
    const response = await this.req(`/at-home/server/${chapterId}`);
    let { baseUrl: host, chapter: { hash: chapterHash, data } } = response;

    const urls = data.map(filename => `${host}/data/${chapterHash}/${filename}`);

    return { urls };
  }
}
