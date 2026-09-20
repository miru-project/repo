// ==MiruExtension==
// @name         WTR-LAB
// @version      v0.0.2
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      wtr-lab.com
// @type         fikushon
// @icon         https://wtr-lab.com/assets/favicon/favicon.svg
// @webSite      https://wtr-lab.com
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request("/en/novel-list");
    const novelList = [];

    const strRes = typeof res === "string" ? res : JSON.stringify(res || {});
    const match = strRes.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

    if (match) {
      try {
        const parsedData = JSON.parse(match[1]);
        const series = parsedData?.props?.pageProps?.series || [];
        for (const item of series) {
          const rawId = item.raw_id || item.id;
          const title = item.data?.title || item.title;
          const cover = item.data?.image || item.image;
          const slug = item.slug || "novel";

          if (!title || !rawId) continue;

          novelList.push({
            title,
            url: `https://wtr-lab.com/en/novel/${rawId}/${slug}`,
            cover,
          });
        }
      } catch (_) {}
    }

    if (novelList.length === 0) {
      return this.search("the");
    }

    return novelList;
  }

  async search(kw) {
    const res = await this.request("/api/search", {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        text: kw || "the",
      },
      method: "post",
    });

    const novelList = [];

    if (res && res.data) {
      for (const item of res.data) {
        const rawId = item.raw_id || item.id;
        const title = item.data?.title || item.title;
        const cover = item.data?.image || item.image;
        const slug = item.slug || "novel";

        if (!title || !rawId) continue;

        novelList.push({
          title,
          url: `https://wtr-lab.com/en/novel/${rawId}/${slug}`,
          cover,
        });
      }
    }

    return novelList;
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const strRes = typeof res === "string" ? res : JSON.stringify(res || {});
    const jsonData = strRes.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)[1];
    const parsedData = JSON.parse(jsonData);
    const serie = parsedData.props.pageProps.serie;
    const serieData = serie.serie_data;
    const rawId = serieData.raw_id || serieData.id;
    const slug = serieData.slug;

    const title = serieData.data?.title || "";
    const cover = serieData.data?.image || "";
    const desc = serieData.data?.description || "";

    const chaptersRes = await this.request(`/api/chapters/${rawId}`);

    const episodes = [];
    if (chaptersRes && Array.isArray(chaptersRes.chapters)) {
      for (const chapter of chaptersRes.chapters) {
        const chapterNo = chapter.order || 1;
        const chapterId = chapter.id;
        const chapterTitle = chapter.title || chapter.name || `Chapter ${chapterNo}`;
        const chapterUrl = `https://wtr-lab.com/en/novel/${rawId}/${slug}/chapter-${chapterNo}?chapter_id=${chapterId}`;

        episodes.push({
          name: chapterTitle,
          url: chapterUrl,
        });
      }
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
    const rawIdMatch = url.match(/\/novel\/(\d+)\//i) || url.match(/\/serie-(\d+)\//i);
    const rawId = rawIdMatch ? parseInt(rawIdMatch[1]) : 0;

    const chapterNoMatch = url.match(/chapter-(\d+)/i);
    const chapterNo = chapterNoMatch ? parseInt(chapterNoMatch[1]) : 1;

    const chapterIdMatch = url.match(/chapter_id=(\d+)/i);
    const chapterId = chapterIdMatch ? parseInt(chapterIdMatch[1]) : 0;

    const res = await this.request("/api/reader/get", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        Origin: "https://wtr-lab.com",
        Referer: url,
      },
      data: {
        translate: "web",
        language: "en",
        raw_id: rawId,
        chapter_no: chapterNo,
        retry: false,
        force_retry: false,
        chapter_id: chapterId,
      },
      method: "post",
    });

    const chapterObj = res?.chapter || {};
    const title = chapterObj.title || `Chapter ${chapterNo}`;

    let body = res?.data?.data?.body || res?.data?.body || "";
    let contentList = [];

    if (Array.isArray(body)) {
      contentList = body.map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
    } else if (typeof body === "string" && body.trim().length > 0) {
      contentList = body
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return {
      title,
      content: contentList,
    };
  }
}
