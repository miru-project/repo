// ==MiruExtension==
// @name         BestLightNovel
// @version      v0.0.1
// @author       anishi7
// @lang         en
// @license      MIT
// @icon         https://bestlightnovel.com/themes/home/images/favicon.png
// @package      best.light.novel
// @type         fikushon
// @webSite      https://bestlightnovel.com
// @nsfw         false
// ==/MiruExtension==

export default class MyNovel extends Extension {
  async latest() {
    const res = await this.request("/");
    const bsxList = res.match(/<div class="itemupdate first">[\s\S]+?<\/div>/g);
    const novels = [];
    bsxList.forEach((element) => {
      const url = element.match(/href="(.+?)"/)[1];
      const title = element.match(/title="(.+?)"/)[1].trim().replace(/’/g, "'");
      const cover = element.match(/src="(.+?)"/)[1];
      novels.push({
        title,
        url,
        cover,
      });
    });
    return novels;
  }

  async search(kw, page) {
  console.log(kw.replace(/\s+/g, '_'))
    const res = await this.request(`/search_novels/${kw.replace(/\s+/g, '_')}`);
    const bsxList = res.match(/<div class="update_item list_category".*>[\s\S]+?<\/div>/g);
    const novels = [];

    bsxList.forEach((element) => {
      const url = element.match(/href="(.+?)"/)[1];
      const title = element.match(/title="(.+?)"/)[1].trim().replace(/’/g, "'");
      const cover = element.match(/src="(.+?)"/)[1];
      novels.push({
        title,
        url,
        cover,
      });
    });
    return novels;
  }

  async detail(url) {
    const res = await this.request(`/${url}`, {
      headers: {
        "miru-referer": "https://bestlightnovel.com/",
      },
    });
    
    const data = res.match(/<span class="info_image"([\s\S]+?)<\/div>/)[1]
    
    const title = data.match(/title="(.+?)"/)[1].replace(/’/g, "'");
    const cover = data.match(/src="(.+?)"/)[1];
    const pattern = /<div id="noidungm".*?>(.*?)<\/div>/s;

    const match = res.match(pattern);
    const desc = match ? match[1].replace(/<[^>]+>/g, '')
      .trim()
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/’/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"') : '';
    
    const episodes = [];
    const epiList = res.match(/<div class="row">([\s\S]+?)<\/div>/g);
    
    epiList.forEach((element) => {
      const name = element.match(/<a.*>(.+?)<\/a>/)[1];

      const url = element.match(/href="([^"]+)"/)[1];
      episodes.push({
        name,
        url,
      });
    });

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Directory",
          urls: episodes.reverse(),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(`/${url}`);
    const title = res.match(/<h1 class="name_chapter">([\s\S]+?)<\/h1>/)[1];
    let chapterContentDiv = res.match(
      /<div id="vung_doc".*>([\s\S]+?)<\/div>/
    )[1];
    chapterContentDiv = chapterContentDiv
    .replace(/<[^>]+>/g, '\n\t')
    .replace(/\<p\>/g, "")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/’/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
    const content = chapterContentDiv.split("</p>");
    return {
      title,
      content,
    };
  }
}
