// ==MiruExtension==
// @name         Iwara
// @version      v0.0.1
// @author       hualiong
// @lang         en
// @license      MIT
// @icon         https://www.iwara.tv/logo.png
// @package      iwara.tv
// @type         bangumi
// @webSite      https://www.iwara.tv
// @nsfw         true
// ==/MiruExtension==
export default class extends Extension {
  formatSeconds(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;
    var formattedHours = hours < 10 ? "0" + hours : hours;
    var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    var formattedSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
    if (hours < 1) {
      return formattedMinutes + ":" + formattedSeconds;
    } else {
      return formattedHours + ":" + formattedMinutes + ":" + formattedSeconds;
    }
  }

  async $api(url, options = { headers: {} }, count = 3, timeout = 5000) {
    if (options.headers["Miru-Url"] == undefined) options.headers["Miru-Url"] = "https://api.iwara.tv";
    try {
      return await Promise.race([
        this.request(url, options),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out!"));
          }, timeout);
        }),
      ]);
    } catch (error) {
      if (count > 0) {
        console.log(`[Retry (${count})]: ${url}`);
        return this.$api(url, options, count - 1, timeout + 1000);
      } else {
        throw error;
      }
    }
  }

  // =============================== 分割线 ============================== //

  async createFilter() {
    const rating = {
      title: "Rating",
      max: 1,
      min: 1,
      default: "all",
      options: {
        all: "All",
        general: "General",
        ecchi: "Ecchi",
      },
    };
    const sort = {
      title: "Sort",
      max: 1,
      min: 1,
      default: "date",
      options: {
        date: "date",
        trending: "trending",
        popularity: "popularity",
        views: "views",
        likes: "likes",
      },
    };
    const year = {
      title: "Year",
      max: 1,
      min: 0,
      default: "",
      options: Object.fromEntries(
        new Map(
          Array.from({ length: new Date().getFullYear() - 2013 }, (_, i) => [
            (2007 + i).toString(),
            (2007 + i).toString(),
          ])
        )
      ),
    };
    return { rating, sort, year };
  }

  /**
   * rating - 全部：all | 普通：general | 成人：ecchi
   * sort - 最新：date | 热门：trending | 人气：popularity | 最多观看：views | 最多赞：likes
   * tags - https://api.iwara.tv/tags?filter=A&page=0
   * date - 年份
   */
  async latest(page, filter = { rating: ["all"], sort: ["date"] }) {
    let url = `/videos?rating=${filter.rating[0]}&sort=${filter.sort[0]}&page=${page - 1}`;
    if (filter.year?.[0]) url += `&date=${filter.year?.[0]}`;
    const res = await this.$api(url);
    return res.results
      .filter((e) => e.file)
      .map((e) => ({
        title: e.title,
        url: e.id,
        cover: `https://i.iwara.tv/image/thumbnail/${e.file.id}/thumbnail-${e.thumbnail
          .toString()
          .padStart(2, "0")}.jpg`,
        update: this.formatSeconds(e.file.duration),
      }));
  }

  async search(kw, page, filter) {
    if (!kw) return filter ? this.latest(page, filter) : this.latest(page);
    const res = await this.request(`/search?type=video&page=${page - 1}&query=${kw}`, {
      headers: { "Miru-Url": "https://api.iwara.tv" },
    });
    return res.results
      .filter((e) => e.file)
      .map((e) => ({
        title: e.title,
        url: e.id,
        cover: `https://i.iwara.tv/image/thumbnail/${e.file.id}/thumbnail-${e.thumbnail
          .toString()
          .padStart(2, "0")}.jpg`,
        update: this.formatSeconds(e.file.duration),
      }));
  }

  async detail(id) {
    const anime = await this.$api(`/video/${id}`);
    const url = anime.fileUrl.split("/");
    const files = await this.$api(url.pop(), { headers: { "Miru-Url": `${url.join("/")}/` } });
    return {
      title: anime.title,
      cover: `https://i.iwara.tv/image/thumbnail/${anime.file.id}/thumbnail-${anime.thumbnail.toString().padStart(2, "0")}.jpg`,
      desc: anime.body?.trim() ?? "",
      episodes: files.map((e) => ({
        title: e.name,
        urls: [{ name: "view", url: `https:${e.src.view}` }, { name: "download", url: `https:${e.src.download}` }],
      })),
    };
  }

  async watch(url) {
    console.log(url);
    return { type: url.indexOf(".mp4") > 0 ? "mp4" : "hls", url };
  }
}
