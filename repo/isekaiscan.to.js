// ==MiruExtension==
// @name         IsekaiScan
// @version      v0.0.3
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_192,h_192/https://m.isekaiscan.to/wp-content/uploads/2023/03/0_20230304_101820_0000-300x300.png
// @package      isekaiscan.to
// @type         manga
// @webSite      https://m.isekaiscan.to
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("isekaiscan"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Isekaiscan URL",
      key: "isekaiscan",
      type: "input",
      description: "Homepage URL for Isekaiscan",
      defaultValue: "https://m.isekaiscan.to",
    });

    this.registerSetting({
      title: "Reverse Order of Chapters",
      key: "reverseChaptersOrder",
      type: "toggle",
      description: "Reverse the order of chapters in ascending order",
      defaultValue: "true",
    });

    // for latest & search page
    this.registerSetting({
      title: "resize cover images",
      key: "imageResize",
      type: "input",
      description: "Image dimensions in pixels. Example: '372,496' (width,height)",
      defaultValue: "386,556",
    });
  }

  async latest(page) {
    const res = await this.req(`/page/${page}/`);
    const resizeValue = await this.getSetting("imageResize");
    const latest = res.match(/<div class="page-item-detail manga">(.*?)<\/div>/gs);

    const mangas = latest.map((element) => {
      const urlMatch = element.match(/href="https:\/\/m.isekaiscan.to(.+?)"/);
      const titleMatch = element.match(/<a href=".+?" title="(.+?)">/);
      let coverMatch = element.match(/data-src="(.+?)"/);

      if (urlMatch && titleMatch && coverMatch) {
        const url = urlMatch[1];
        const title = titleMatch[1];
        coverMatch = coverMatch[1].replace(/\?resize=\d+,\d+/, `?resize=${resizeValue}`);

        return {
          title,
          url,
          cover: coverMatch,
        };
      }
    }).filter(Boolean);

    return mangas;
  }



  async search(kw, page) {
    const res = await this.request(`/page/${page}/?s=${kw}&post_type=wp-manga`);
    const resizeValue = await this.getSetting("imageResize");
    const regex = /<div class="row c-tabs-item__content">(.*?)<\/div>/gs;
    const Slist = Array.from(res.matchAll(regex));

    const mangas = Slist.map((match) => {
      const urlMatch = match[0].match(/href="https:\/\/m.isekaiscan.to(.+?)"/);
      const titleMatch = match[0].match(/title="(.+?)"/);
      const coverMatch = match[0].match(/data-src="(.+?)"/);

      if (urlMatch && titleMatch && coverMatch) {
        const url = urlMatch[1];
        const title = titleMatch[1];
        const cover = coverMatch[1].replace(/\?resize=\d+,\d+/, `?resize=${resizeValue}`);

        return {
          title,
          url,
          cover,
        };
      }
    }).filter(Boolean);

    return mangas;
  }


  async detail(url) {
    const res = await this.req(url);
    const html = res;

    const extractContent = (regex, content) => {
      const match = content.match(regex);
      return match ? match[1] : null;
    };

    const title = extractContent(/div class="post-title"><h1>(.+?)<\/h1>/, html);
    const cover = extractContent(/property="og:image" content="(.+?)"/, html);
    const desc = extractContent(/<div class="summary__content"><p>(.+?)<\/p>/, html);

    const chapters_res = await this.request(url + "ajax/chapters/", {
      headers: {
        "Miru-Url": await this.getSetting("isekaiscan"),
      },
      method: "POST"
    });

    const chaptersRegex = /<li\s+class\s*=\s*["']\s*wp-manga-chapter\s*["']\s*>(.*?)<\/li>/gs;
    const chaptersMatch = chapters_res.match(chaptersRegex);

    const chapters = [];

    if (chaptersMatch) {
      for (const element of chaptersMatch) {
        const chapterUrl = extractContent(/href="https:\/\/m.isekaiscan.to(.+?)"/, element);
        const chapterNum = extractContent(/Chapter (\d+)/, element);

        if (chapterUrl && chapterNum) {
          chapters.push({
            name: `Chapter ${chapterNum}`,
            url: chapterUrl,
          });
        }
      }
    }

    if (await this.getSetting("reverseChaptersOrder") === "true") {
      chapters.reverse();
    }

    return {
      title: title || "Unknown Title",
      cover,
      desc: desc || "N/A",
      episodes: [
        {
          title: "Directory",
          urls: chapters,
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(url);
    const images = res.match(/<div\s+class\s*=\s*["']\s*page-break\s+no-gaps\s*["']\s*>(.*?)<\/div>/gs)
      .map(element => element.match(/data-src="(.+?)"/))
      .filter(imgMatch => imgMatch)
      .map(imgMatch => imgMatch[1].trim());

    return {
      urls: images || [],
    };
  }
}
