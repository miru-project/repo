// ==MiruExtension==
// @name         Mikanani
// @version      v0.0.1
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         https://mikanani.me/images/mikan-pic.png
// @package      me.mikanani
// @type         bangumi
// @webSite      https://mikanani.me
// @description  蜜柑计划：新一代的动漫下载站
// ==/MiruExtension==

export default class extends Extension {
  date = {};

  async load() {
    await this.registerSetting({
      title: "Source site",
      key: "source",
      type: "radio",
      description: "Source site",
      defaultValue: "https://mikanani.me",
      options: {
        "https://mikanani.me": "https://mikanani.me",
        "https://mikanani.tv": "https://mikanani.tv",
      },
    });
  }

  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("source"),
      },
    });
  }

  async getFullUrl(url) {
    return `${await this.getSetting("source")}${url}`;
  }

  async getDate() {
    if (Object.keys(this.date).length != 0) {
      return;
    }
    const res = await this.req("/");
    const dates = await this.querySelectorAll(res, ".dropdown-submenu");
    for (const item of dates) {
      const html = item.content;
      const year = await this.querySelector(html, ".default-cursor").text;
      const seasons = await this.querySelectorAll(html, ".dropdown-menu li");
      const season = [];
      for (const item of seasons) {
        season.push(
          await this.getAttributeText(item.content, "a", "data-season")
        );
      }
      this.date[year] = season;
    }
  }

  async createFilter(filter) {
    await this.getDate();
    const currentYear = new Date().getFullYear();
    const season = {
      title: "季度",
      max: 1,
      min: 1,
      default: "春",
      options: this.date[currentYear].reduce((obj, item) => {
        obj[item] = item;
        return obj;
      }, {}),
    };

    if (filter && filter.year) {
      season.options = this.date[filter.year[0]].reduce((obj, item) => {
        obj[item] = item;
        return obj;
      }, {});
    }

    return {
      year: {
        title: "年份",
        max: 1,
        min: 1,
        default: currentYear.toString(),
        options: Object.keys(this.date).reduce((obj, item) => {
          obj[item] = item;
          return obj;
        }, {}),
      },
      season,
    };
  }

  async getData(year, season) {
    await this.getDate();
    const res = await this.req(
      `/Home/BangumiCoverFlowByDayOfWeek?year=${year}&seasonStr=${season}`
    );
    const bangumi = [];
    const lis = await this.querySelectorAll(res, ".sk-bangumi li");
    for (const item of lis) {
      const html = item.content;
      const cover = await this.getAttributeText(html, "span", "data-src");
      const title = await this.getAttributeText(html, "a", "title");
      const url = await this.getAttributeText(html, "a", "href");
      if (!url) {
        continue;
      }
      bangumi.push({
        cover: await this.getFullUrl(cover),
        title,
        url,
      });
    }
    return bangumi;
  }

  async latest(page) {
    await this.getDate();
    const currentYear = new Date().getFullYear();
    const season = this.date[new Date().getFullYear()][0];
    return this.getData(currentYear, season);
  }

  async detail(url) {
    const res = await this.req(`${url}`);
    const cover = await this.getFullUrl(
      res.match(/background-image: url\('(.*)'\);/)[1]
    );
    const title = await this.querySelector(res, ".bangumi-title").text;
    const desc = await this.querySelector(res, ".header2-desc").text;
    const bangumiId = (() => {
      const arr = url.split("/");
      return arr[arr.length - 1];
    })();
    const subtitleGrups = [];
    const listUnstyledLis = await this.querySelectorAll(res, ".leftbar-item");
    for (const item of listUnstyledLis) {
      const html = item.content;
      const name = await this.querySelector(html, "a").text;
      const subtitleId = (
        await this.getAttributeText(html, "a", "data-anchor")
      ).replace("#", "");
      subtitleGrups.push({
        name,
        subtitleId,
      });
    }

    const episodeGrups = [];

    for (const item of subtitleGrups) {
      const res = await this.req(
        `/Home/ExpandEpisodeTable?bangumiId=${bangumiId}&subtitleGroupId=${item.subtitleId}&take=999999`
      );
      const trs = await this.querySelectorAll(res, "tbody tr");
      const episodes = [];
      for (const item of trs) {
        const html = item.content;
        const name = await this.querySelector(html, "a").text;
        const url = html.match(/\/Download\/.*\.torrent/)[0];
        episodes.push({
          name,
          url,
        });
      }
      episodeGrups.push({
        title: item.name,
        urls: episodes,
      });
    }

    return {
      title,
      cover,
      desc,
      episodes: episodeGrups,
    };
  }

  async search(kw, page, filter) {
    if (!filter) {
      return await this.latest()
    }
    return await this.getData(filter.year, filter.season)
  }

  async watch(url) {
    console.log(await this.getFullUrl(url));
    return {
      type: "torrent",
      url: await this.getFullUrl(url),
    };
  }
}
