// ==MiruExtension==
// @name         动漫之家
// @version      v0.0.2
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @package      com.dmzj.www
// @type         manga
// @icon         https://www.dmzj.com/_nuxt/logo_dmzj.1c94014a.png
// @webSite      https://www.dmzj.com
// ==/MiruExtension==

export default class extends Extension {
  async load() {
    await this.registerSetting({
      title: "启用高清画质",
      key: "quality",
      type: "toggle",
      description: "启用后会使用高清画质,会消耗更多流量",
      defaultValue: "false",
    });
  }

  async latest(page) {
    const res = await this.request(
      `/api/v1/comic1/update_list?channel=pc&app_name=dmzj&version=1.0.0&page=${page}&size=20`,
    );
    const manga = [];
    res.data.list.forEach((element) => {
      manga.push({
        title: element.title,
        cover: element.cover,
        update: element.lastUpdateChapterName,
        url: element.comic_py,
      });
    });
    return manga;
  }

  async search(kw, page) {
    const res = await this.request(
      `/api/v1/comic1/search?keyword=${kw}&page=${page}`,
    );
    const manga = [];
    res.data.comic_list.forEach((element) => {
      manga.push({
        title: element.name,
        cover: element.cover,
        update: element.last_update_chapter_name,
        url: element.comic_py,
      });
    });
    return manga;
  }

  async detail(url) {
    const res = await this.request(
      `/api/v1/comic1/comic/detail?channel=pc&app_name=dmzj&version=1.0.0&comic_py=${url}`,
    );
    const comicInfo = res.data.comicInfo;
    const episodes = [];
    comicInfo.chapterList.forEach((element) => {
      const urls = [];
      element.data.forEach((e) => {
        urls.push({
          name: e.chapter_title,
          url: `${comicInfo.id}|${e.chapter_id.toString()}`,
        });
      });
      episodes.push({
        title: element.title,
        urls: urls.reverse(),
      });
    });

    return {
      title: comicInfo.title,
      cover: comicInfo.cover,
      desc: comicInfo.description,
      episodes,
    };
  }

  async watch(url) {
    const [comicId, chapterId] = url.split("|");
    console.log(comicId);
    const res = await this.request(
      `/api/v1/comic1/chapter/detail?channel=pc&app_name=dmzj&version=1.0.0&comic_id=${comicId}&chapter_id=${chapterId}`,
    );

    const page_url = res.data.chapterInfo.page_url;
    const page_url_hd = res.data.chapterInfo.page_url_hd ?? page_url;

    let urls =
      (await this.getSetting("quality")) === "true" ? page_url_hd : page_url;

    return {
      urls,
    };
  }
}
