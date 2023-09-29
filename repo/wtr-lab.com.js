// ==MiruExtension==
// @name         WTR-LAB
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      wtr-lab.com
// @type         fikushon
// @icon         https://wtr-lab.com/images/favicon.png
// @webSite      https://wtr-lab.com
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/en/novel-list/");
    const jsonData = res.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)[1];
    const parsedData = JSON.parse(jsonData);
    const novels = parsedData.props.pageProps.series;

    const novelList = novels.map((item) => ({
      url: `https://wtr-lab.com/en/serie-${item.raw_id}/${item.slug}`,
      title: item.data.title,
      cover: item.data.image,
    }));

    return novelList;
  }

  async search(kw) {
    const requestBody = {
      text: kw,
    };

    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://wtr-lab.com/api/search",
      },
      data: requestBody,
      method: "post",
    });

    const mangaList = [];

    if (res.success && res.data) {
      for (const comic of res.data) {
        const id = comic.raw_id;
        const title = comic.data.title;
        if (!title || !comic.data.image) continue;

        mangaList.push({
          title: title,
          url: `https://wtr-lab.com/en/serie-${id}/${comic.slug}`,
          cover: comic.data.image,
        });
      }
    }

    return mangaList;
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const title = await this.querySelector(res, "h1.text-uppercase").text;
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "p.lead").text;

    const episodes = [];

    const jsonData = res.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)[1];
    const parsedData = JSON.parse(jsonData);
    const chapters = parsedData.props.pageProps.serie.chapters;
    const { serie_data } = parsedData.props.pageProps.serie;

    for (const chapter of chapters) {
      const url = `https://wtr-lab.com/en/serie-${serie_data.raw_id}/${serie_data.slug}/chapter-${chapter.slug}`;

      episodes.push({
        name: chapter.title,
        url: url,
      });
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
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const jsonData = res.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)[1];
    const parsedData = JSON.parse(jsonData);
    const chapterData = parsedData.props.pageProps.serie.chapter_data;

    const title = chapterData.data.title;

    return {
      title: title,
      content: chapterData.data.body.map((item) => item),
    };
  }
}
