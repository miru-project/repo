// ==MiruExtension==
// @name         咕咕影视
// @version      v0.0.3
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @package      cc.cooing
// @type         bangumi
// @webSite      https://cooing.cc
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  
  getImageUrl(url) {
    return `https://cooing.cc${url}`;
  }

  async latest() {
    const res = await this.request("/");
    const list = res.match(
      /<div class="text-center text-sm relative drak:bg-black">([\s\S]+?)<\/span>/g,
    );
    const bangumi = [];
    list.forEach((element) => {
      console.log(element);
      const url = element.match(/onclick="window.open\('(.+?)'/)[1];
      const title = element.match(
        /<span class="leading-loose line-clamp-1 mt-2 2k:text-xl">(.+?)<\/span>/,
      )[1];
      const cover = this.getImageUrl(
        element.match(/style="background-image: url\('(.+?)'\)"/)[1],
      );
      bangumi.push({
        title,
        url,
        cover,
      });
    });
    return bangumi;
  }

  async search(kw, page) {
    const res = await this.request(`/vodsearch/${kw}----------${page}---/`);
    const list = res.match(
      /<div class="flex flex-row min-h-64 my-4 relative">([\s\S]+?)<\/b>/g,
    );
    const data = [];
    list.forEach((e) => {
      const title = e.match(
        /<p class="text-2xl hidden xl:inline-block">([\s\S]+?)<\/p>/,
      )[1];
      const cover = this.getImageUrl(
        e.match(/style="background-image: url\('(.+?)'\)"/)[1],
      );
      const desc = e.match(/<p class="line-clamp-1">([\s\S]+?)<\/p>/)[1];
      const url = e.match(/onclick="window.location.href='(.+?)'"/)[1];
      data.push({
        title,
        cover,
        desc,
        url,
      });
    });
    return data;
  }

  async detail(url) {
    const res = await this.request(`/${url}`);
    const title = res.match(
      /<title>《(.+?)》/,
    )[1];
    const cover = this.getImageUrl(
      res.match(/style="background-image: url\('(.+?)'\)"/)[1],
    );
    const desc = res.match(
      /<div id="vod_content" class="hidden xl:inline-block">([\s\S]+?)<\/div>/,
    )[1];
    const episodeGroupNames = [];
    const episodes = [];

    const groups = res.match(
      /class="line transition ease-in-out hover:border-white border-slate-800 border-2 line_button text-sm px-2 py-2 rounded-xl">(.+?)<\/button>/g,
    );
    groups.forEach((e) => {
      episodeGroupNames.push(e.match(/>(.+?)<\/button>/)[1]);
    });

    for (let i = 0; i < episodeGroupNames.length; i++) {
      const group = episodeGroupNames[i];
      const groupEpisodes = [];
      const groupEpisodesList = res.match(
        new RegExp(
          `<div data-sid="${
            i + 1
          }" class="video_list play_list_asc hidden fn-clear grid grid-cols-4 gap-3 md:grid-cols-6 md:gap-4 xl:grid-cols-8 xl:gap-4">([\\s\\S]+?)<\\/div>`,
        ),
      )[1];
      console.log(groupEpisodesList);
      const groupEpisodesListItems = groupEpisodesList.match(
        /<button onclick="window.location.href='(.+?)'" class="shrink-0 flex-nowrap transition ease-in-out hover:border-white border-slate-800 border-2  dark:text-white dark:bg-slate-800  text-sm  py-2 rounded-xl">(.+?)<\/button>/g,
      );
      groupEpisodesListItems.forEach((e) => {
        console.log(e);
        groupEpisodes.push({
          name: e.match(/>(.+?)<\/button>/)[1],
          url: e.match(/onclick="window.location.href='(.+?)'/)[1],
        });
      });
      episodes.push({
        title: group,
        urls: groupEpisodes,
      });
    }

    return {
      title,
      cover,
      desc,
      episodes,
    };
  }

  async watch(url) {
    const res = await this.request(url);
    const config =  res.match(/<script type="text\/javascript">var player_aaaa=(.+?)<\/script>/)
    return {
      type: "hls",
      url: JSON.parse(config[1]).url,
    };
  }
}
