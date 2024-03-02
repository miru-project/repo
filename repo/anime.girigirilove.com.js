// ==MiruExtension==
// @name         girigiri爱动漫
// @version      v0.0.3
// @author       appdevelpo
// @lang         zh
// @license      MIT
// @icon         https://anime.girigirilove.com/upload/site/20230603-1/9e57505c4e140f30c70aac0cc93fa9ad.png
// @package      anime.girigirilove.com
// @type         bangumi
// @webSite      https://anime.girigirilove.com
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  filter_data = {};
  filter_main_bar = {};
  user_val = {};

  async load() {
    function base64decode(str) {
      var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
      var c1, c2, c3, c4;
      var i, len, out;
      len = str.length;
      i = 0;
      out = "";
      while (i < len) {
        do {
          c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (i < len && c1 == -1);
        if (c1 == -1)
          break;
        do {
          c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (i < len && c2 == -1);
        if (c2 == -1)
          break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        do {
          c3 = str.charCodeAt(i++) & 0xff;
          if (c3 == 61)
            return out;
          c3 = base64DecodeChars[c3]
        } while (i < len && c3 == -1);
        if (c3 == -1)
          break;
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
        do {
          c4 = str.charCodeAt(i++) & 0xff;
          if (c4 == 61)
            return out;
          c4 = base64DecodeChars[c4]
        } while (i < len && c4 == -1);
        if (c4 == -1)
          break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4)
      }
      return out
    }
    this.base64decode = base64decode
    this.baseurl = "https://anime.girigirilove.com"
  }

  async search(kw, page, filter) {
    const search_str = `/search/${kw}----------${page}---/`
    const res = await this.request(search_str);
    const bsxList = res.match(/public-list-box search-box flex rel[\s\S]+?<\/div><\/div><\/div>/g);

    if (bsxList === null) {
      // Handle the case when no content is found
      return [];
    }
    const videos = [];
    // console.log(bsxList[0]);
    bsxList.forEach((element) => {
      const url = element.match(/href="(.+?)"/)[1];
      const title = element.match(/"thumb-txt cor4 hide">(.+?)</)[1];
      const cover = this.baseurl + element.match(/data-src="(.+?)"/)[1];
      videos.push({
        title,
        url,
        cover,
        headers: {}
      });
    });
    return videos;
  }

  async req(url) {
    const res = await this.request("", {
      "Miru-Url": url
    })
    return url
  }

  async latest(page) {
    const res = await this.request(`/show/2--------${page}---/`);
    // await this.get_filter(res);
    const bsxListArea = res.match(/class="flex wrap border-box public-r"[\s\S]+<\/div><\/div><\/div><\/div>/)[0];
    const bsxList = bsxListArea.match(/"public-list-box public-pic-b \[swiper\]".+?<\/div>/g);
    const videos = [];
    //   console.log(bsxList[0]);
    bsxList.forEach((element) => {
      const url = element.match(/href="(.+?)"/)[1];
      const title = element.match(/title="(.+?)"/)[1];
      const cover = this.baseurl + element.match(/data-src="(.+?)"/)[1];
      const update = element.match(/"public-list-prb hide ft2">(.+?)<\/span>/)[1];
      videos.push({
        title,
        url,
        cover,
        update
      });
    });
    return videos
  }

  async detail(url) {
    const episodes = [];
    const web_res = await this.request(url);
    const title = web_res.match(/<h3[^;]+?>(.+?)<\/h3>/)[1]
    const cover = this.baseurl + web_res.match(/<img referrerpolicy="no-referrer"[^+]+?data-src="(.+?)"/)[1]
    const desc = web_res.match(/"text cor3">(.+?)</)[1]
    const playListArea = web_res.match(/anthology-list-play size[\s\S]+?<\/ul>/g)
    const playListTitle = web_res.match(/fa ds-dianying"><\/i>.+?<span/g)
    playListTitle.forEach((element, index) => {
      const stream_title = element.match(/>&nbsp;(.+?)</)[1]
      const ep_list = playListArea[index].match(/<li[\s\S]+?<\/li>/g).map((ep_element) => {
        return {
          name: ep_element.match(/>(\w+)</)?.[1],
          url: ep_element.match(/href="(.+?)"/)?.[1]
        }
      }).filter(episodes => episodes.name && episodes.url);
      episodes.push({
        title: stream_title,
        urls: ep_list
      })
    })
    return {
      title,
      cover,
      desc,
      episodes
    }
  }

  async watch(url) {
    const m3u8 = await this.getM3u8(url)
    console.log(m3u8)
    return {
      type: "hls",
      url: m3u8,
    }
  }

  async getM3u8(url) {
    const res = await this.request(url)
    // console.log(res.data)
    const vid_player_detail = JSON.parse(res.match(/player_aaaa=(.+?)<\/script>/)[1])
    console.log(vid_player_detail.url)
    // const detail_json = JSON.parse(vid_player_detail)
    const m3u8_link = decodeURIComponent(this.base64decode(vid_player_detail.url))
    console.log(m3u8_link)
    return m3u8_link
  }
}
