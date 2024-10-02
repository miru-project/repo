// ==MiruExtension==
// @name         Komiic漫畫
// @version      v0.0.1
// @author       hualiong
// @lang         zh-tw
// @license      MIT
// @icon         https://komiic.com/favicon.ico
// @package      komiic.com
// @type         manga
// @webSite      https://komiic.com
// @nsfw         false
// ==/MiruExtension==
export default class extends Extension {
  flag = false;

  operation = {
    recentUpdate:
      "query recentUpdate($pagination: Pagination!) {\n  recentUpdate(pagination: $pagination) {\n    id\n    title\n    status\n    year\n    imageUrl\n    authors {\n      id\n      name\n      __typename\n    }\n    categories {\n      id\n      name\n      __typename\n    }\n    dateUpdated\n    monthViews\n    views\n    favoriteCount\n    lastBookUpdate\n    lastChapterUpdate\n    __typename\n  }\n}",
    searchComicAndAuthorQuery:
      "query searchComicAndAuthorQuery($keyword: String!) {\n  searchComicsAndAuthors(keyword: $keyword) {\n    comics {\n      id\n      title\n      status\n      year\n      imageUrl\n      authors {\n        id\n        name\n        __typename\n      }\n      categories {\n        id\n        name\n        __typename\n      }\n      dateUpdated\n      monthViews\n      views\n      favoriteCount\n      lastBookUpdate\n      lastChapterUpdate\n      __typename\n    }\n    authors {\n      id\n      name\n      chName\n      enName\n      wikiLink\n      comicCount\n      views\n      __typename\n    }\n    __typename\n  }\n}",
    chapterByComicId:
      "query chapterByComicId($comicId: ID!) {\n  chaptersByComicId(comicId: $comicId) {\n    id\n    serial\n    type\n    dateCreated\n    dateUpdated\n    size\n    __typename\n  }\n}",
    imagesByChapterId:
      "query imagesByChapterId($chapterId: ID!) {\n  imagesByChapterId(chapterId: $chapterId) {\n    id\n    kid\n    height\n    width\n    __typename\n  }\n}",
  };

  encode(str) {
    let words = CryptoJS.enc.Utf8.parse(str);
    return CryptoJS.enc.Base64.stringify(words);
  }

  decode(str) {
    let words = CryptoJS.enc.Base64.parse(str);
    return CryptoJS.enc.Utf8.stringify(words);
  }

  async $api(operationName, variables, count = 3, timeout = 5000) {
    try {
      return await Promise.race([
        this.request("/api/query", {
          method: "post",
          data: {
            query: this.operation[operationName],
            operationName,
            variables,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => {
            reject(new Error("Request timed out!"));
          }, timeout)
        ),
      ]);
    } catch (error) {
      if (count > 0) {
        console.log(`[Retry (${count})]: ${operationName}`);
        return this.$api(operationName, variables, count - 1, timeout + 500);
      } else {
        throw error;
      }
    }
  }

  // =============================== 分割线 ============================== //

  async load() {
    try {
      await this.request("/api/image/076f7800-7ac6-41dd-9ffd-0362bdb93a13", {
        headers: { Referer: "https://komiic.com/comic/2487/chapter/74408/images/all" },
      });
    } catch (error) {
      this.flag = true;
    }
  }

  // async createFilter() {
  //   const response = await this.request("/api/image/076f7800-7ac6-41dd-9ffd-0362bdb93a13", {
  //     headers: { Referer: "https://komiic.com/comic/2487/chapter/74408/images/all" },
  //   });
  //   return "OK";
  // }

  async latest(page) {
    const response = await this.$api("recentUpdate", {
      pagination: {
        limit: 20,
        offset: (page - 1) * 20,
        orderBy: "DATE_UPDATED",
        asc: true,
      },
    });
    const result = response.data.recentUpdate.map((e) => ({
      title: e.title,
      url: this.encode(
        JSON.stringify({
          id: e.id,
          title: e.title,
          cover: e.imageUrl,
          status: e.status,
          year: e.year,
          author: e.authors.map((e) => e.name).join("，"),
          categories: e.categories.map((e) => e.name).join("，"),
          views: e.views,
          update: new Date(e.dateUpdated).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
        })
      ),
      cover: e.imageUrl,
      update: `${e.status == "ONGOING" ? "連載" : "完結"}${e.lastChapterUpdate && " | " + e.lastChapterUpdate + "話"}${
        e.lastBookUpdate && " | " + e.lastBookUpdate + "卷"
      }`,
    }));
    if (this.flag) result.unshift({
        title: "檢測到您可能已達當前24小時内的最大圖片閱讀量，請進入該詳細頁面嘗試解決后重启应用",
        url: "/login",
        cover: null,
      });
    return result;
  }

  async search(keyword, page) {
    if (page > 1) return [];
    const response = await this.$api("searchComicAndAuthorQuery", { keyword });
    const result = response.data.searchComicsAndAuthors.comics.map((e) => ({
      title: e.title,
      url: this.encode(
        JSON.stringify({
          id: e.id,
          title: e.title,
          cover: e.imageUrl,
          status: e.status,
          year: e.year,
          author: e.authors.map((e) => e.name).join("，"),
          categories: e.categories.map((e) => e.name).join("，"),
          views: e.views,
          update: new Date(e.dateUpdated).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
        })
      ),
      cover: e.imageUrl,
      update: `${e.status == "ONGOING" ? "連載" : "完結"}${e.lastChapterUpdate && " | " + e.lastChapterUpdate + "話"}${e.lastBookUpdate && " | " + e.lastBookUpdate + "卷"}`,
    }));
    if (this.flag) result.unshift({
      title: "檢測到您可能已達當前24小時内的最大圖片閱讀量，請進入該詳細頁面嘗試解決后重启应用",
      url: "/login",
      cover: null,
    });
    return result;
  }

  async detail(string) {
    if (string == "/login")
      return {
        title: "閲讀下面的概覽，嘗試解決后記得 重 启 应 用 ！",
        cover: null,
        desc: "若您是未登錄用戶或登陸狀態過期，点击右上角的 Webview 窗口进入网站登錄后即可增加閲讀上限。\n若您已登錄，那麽請稍後再看，閲讀量會慢慢恢復（或贊助該站獲得更高的上限）\n各賬戶限制閲讀量如下：\n【無帳號】- 24小時內讀取 300 張\n【一般帳號】- 24小時內讀取 800 張\n【贊助帳號】- 24小時內讀取 1000 張\n【當月贊助$1以上】- 24小時內讀取 3000 張\n【當月贊助$5以上】- 24小時內讀取 5000 張\n【當月贊助$10以上】- 24小時內讀取 10000 張",
      };
    const data = JSON.parse(this.decode(string));
    const comic = await this.$api("chapterByComicId", { comicId: data.id });
    const episodes = [];
    const chapters = comic.data.chaptersByComicId
      .filter((e) => e.type == "chapter")
      .map((e) => ({ name: `第${e.serial}話（${e.size}P）`, url: `${data.id}|${e.id}` }));
    if (chapters.length) episodes.push({ title: "話", urls: chapters });
    const volumes = comic.data.chaptersByComicId
      .filter((e) => e.type == "book")
      .map((e) => ({ name: `第${e.serial}卷（${e.size}P）`, url: `${data.id}|${e.id}` }));
    if (volumes.length) episodes.push({ title: "卷", urls: volumes });
    return {
      title: data.title,
      cover: data.cover,
      desc: `狀態：${data.status == "ONGOING" ? "連載" : "完結"}\n年份：${data.year}\n作者：${data.author}\n類型：${
        data.categories
      }\n點閱：${data.views}\n最近一次更新時間：${data.update}`,
      episodes,
    };
  }

  async watch(str) {
    const ids = str.split("|");
    const images = await this.$api("imagesByChapterId", { chapterId: ids[1] });
    const urls = images.data.imagesByChapterId.map((e) => `https://komiic.com/api/image/${e.kid}`);
    return { urls, headers: { Referer: `https://komiic.com/comic/${ids[0]}/chapter/${ids[1]}/images/all` } };
  }
}
