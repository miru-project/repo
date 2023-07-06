// ==MiruExtension==
// @name         欧乐影院
// @version      v0.0.1
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         https://static.olelive.com/upload/site/20201117-1/902e3851b6695ac661422b45483d694a.png
// @package      com.olevod.www
// @type         bangumi
// @webSite      https://www.olevod.com
// @description  欧乐影院－面向海外华人的在线视频媒体平台,海量高清视频在线观看,电影电视剧一网打尽
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/index.php/map/index.html`);
    const lis = res.match(/<li class="ranklist_item">[\s\S]*?<\/li>/g);
    const data = [];
    for (let i = 0; i < lis.length; i++) {
      try {
        const li = lis[i];
        const title = li.match(/<h4 class="title">(.+?)<\/h4>/)[1];
        const cover = li.match(/data-original="(.+?)"/)[1];
        const url = li.match(/href="(.+?)"/)[1];
        // 更新状态
        const update = li
          .match(/<p><span class="vodlist_sub">(.+?)<\/span><\/p>/)[1]
          .replace("状态：", "");
        data.push({
          title,
          cover,
          url,
          update,
        });
      } catch (error) {
        console.log(error);
      }
    }

    return data;
  }

  async detail(url) {
    const res = await this.request(`/${url}`);
    const title = res.match(/<span class="hd_tit fl">(.+?)<\/span>/)[1];
    const cover = res.match(/data-original="(.+?)"/)[1];
    const desc = res.match(/<meta name="description" content="(.+?)"/)[1];
    const episodes = res.match(
      /<ul class="content_playlist list_scroll clearfix">[\s\S]*?<\/ul>/,
    );
    const lis = episodes.toString().match(/<li>(.+?)<\/li>/g);
    const urls = [];
    for (let i = 0; i < lis.length; i++) {
      try {
        const li = lis[i];
        const match = li.match(/<a href="(.+?)" (.+?)>(.+?)<\/a>/);
        urls.push({
          url: match[1],
          name: match[3],
        });
      } catch (error) {
        console.log(error);
      }
    }

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Ep",
          urls,
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.request(
      `/index.php/vod/search/page/${page}/wd/${kw}.html`,
    );
    const lis = res.match(/<li class="searchlist_item">[\s\S]*?<\/li>/g);
    const data = [];
    for (let i = 0; i < lis.length; i++) {
      try {
        const li = lis[i];
        const title = li.match(/title="(.+?)"/)[1];
        const cover = li.match(/data-original="(.+?)"/)[1];
        const url = li.match(/<a href="(.+?)" title/)[1];
        // 更新状态
        const update = li.match(
          /<span class="pic_text text_right">(.+?)<\/span>/,
        )[1];
        data.push({
          title,
          cover,
          url,
          update,
        });
      } catch (error) {
        console.log(error);
      }
    }

    return data;
  }

  async watch(url) {
    const res = await this.request(`/${url}`);
    const m3u8Url = res
      .match(/player_aaaa={(.+?)"url":"(.+?)"(.+?)}/)[2]
      .replace(/\\\//g, "/");
    console.log(m3u8Url);
    return {
      type: "hls",
      url: m3u8Url,
    };
  }

  async checkUpdate(url) {
    const res = await this.request(`/${url}`);
    return res.match(/<span class="data_style">(.+?)<\/span>/)[1];
  }
}
