// ==MiruExtension==
// @name         樱花动漫 CC
// @version      v0.1
// @author       Mg
// @lang         zh-cn
// @license      MIT
// @package      yinhuadm
// @type         bangumi
// @icon         https://oss-cdn.meowa.cn/mxtheme/images/favicon.png
// @webSite      https://www.yinhuadm.cc/
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    if (page != 1) {
      return [];
    }

    let keyword = `/label/hot.html`;
    let hh = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        Referer: keyword,
      },
    };

    const res = await this.request(keyword, hh);

    const ul = await this.querySelectorAll(
      res,
      "div.module-card-item.module-item"
    );
    const bangumi = [];
    for (let i = 0; i < ul.length; i++) {
      let title = await this.querySelector(ul[i].content, "strong").text;
      // let cover=await this.queryXPath(ul[i].content,'//a[@class="myui-vodlist__thumb lazyload"]/@data-original').attr;
      // let url=await this.queryXPath(ul[i].content,'//a[@class="myui-vodlist__thumb lazyload"]/@href').attr;
      // url = url+"#"+cover;
      let cover = await this.querySelector(
        ul[i].content,
        "img.lazy.lazyload"
      ).getAttributeText("data-original");
      let url = await this.querySelector(ul[i].content, "a").getAttributeText(
        "href"
      );
      console.log({
        title,
        cover,
        url,
      });
      console.log(cover);
      bangumi.push({
        title,
        cover,
        url,
      });
    }
    return bangumi;
  }
  async search(kw, page) {
    console.log("search");
    // ����

    let keyword = `/vch${encodeURI(kw)}/page/${page}.html/search/`;

    let hh = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        Referer: keyword,
      },
      method: "GET",
    };

    const res = await this.request(keyword, hh);

    const ul = await this.querySelectorAll(
      res,
      "div.module-card-item.module-item"
    );
    const bangumi = [];
    for (let i = 0; i < ul.length; i++) {
      let title = await this.querySelector(ul[i].content, "strong").text;
      // let cover=await this.queryXPath(ul[i].content,'//a[@class="myui-vodlist__thumb lazyload"]/@data-original').attr;
      // let url=await this.queryXPath(ul[i].content,'//a[@class="myui-vodlist__thumb lazyload"]/@href').attr;
      // url = url+"#"+cover;
      let cover = await this.querySelector(
        ul[i].content,
        "img.lazy.lazyload"
      ).getAttributeText("data-original");
      let url = await this.querySelector(ul[i].content, "a").getAttributeText(
        "href"
      );
      console.log({
        title,
        cover,
        url,
      });
      console.log(cover);
      bangumi.push({
        title,
        cover,
        url,
      });
    }
    return bangumi;
  }
  async detail(url) {
    console.log(url);
    let res = await this.request(url);

    let title = await this.queryXPath(
      res,
      '//div[@class="module-info-heading"]/h1'
    ).text;
    let cover = await this.querySelector(
      res,
      "img.lazy.lazyload"
    ).getAttributeText("data-original");
    let desc = await this.queryXPath(
      res,
      '//div[@class="module-info-introduction-content"]'
    ).text;

    let panel_list = await this.querySelectorAll(res, "div.module-list ");
    /**
     * Element
     */
    let panel_name_list = await this.querySelectorAll(
      res,
      "div.module-tab-item span"
    );

    var episodes = [];
    for (let i = 0; i < panel_list.length; i++) {
      // const element = panel_list[i];
      // const element = panel_list[key];
      let ul = await this.queryXPath(
        panel_list[i].content,
        '//a[@class="module-play-list-link"]'
      ).allHTML;
      // console.log(title,cover,desc)
      // const episodes=[];
      let chapter = [];
      for (let i = 0; i < ul.length; i++) {
        chapter.push({
          name: await this.queryXPath(ul[i], "//span").text,
          url: await this.queryXPath(ul[i], "//a/@href").attr,
        });
      }

      panel_name_list[i].selector="*"
      episodes.push({
        title: await (panel_name_list[i].text),
        urls: chapter,
      });
    }

    return {
      title,
      cover,
      desc,
      episodes: episodes,
    };
  }
  async watch(url) {
    console.log("watch", url);
    console.log(url);
    // �ۿ�
    let res = await this.request(`${url}`);
    // const config =  res.match(/<script type="text\/javascript">var player_aaaa=(.+?)<\/script>/)
    let scriptTxt = await this.queryXPath(
      res,
      '//div[@class="player-box-main"]/script[1]'
    ).text;

    console.log(scriptTxt);
    let player_aaaa = scriptTxt.replace("var player_aaaa=", "");
    player_aaaa = JSON.parse(player_aaaa);
    // console.log(player_aaaa);

    var playUrl = "https://player.mcue.cc/yinhua/?url=" + player_aaaa.url;
    console.log(playUrl);
    let playHtml = await (await fetch(playUrl)).text();
    console.log(playHtml);
    let config1 = playHtml.match(/var config = ([\s\S]+)player/);
    console.log(config1[1]);
    eval("config1=" + config1[1]);
    console.log(config1);

    const sortByKey = (key, arr, callback) =>
      arr.sort(({ [key]: a }, { [key]: b }) => callback(a, b));
    let b64 = config1["url"];
    console.log(b64);

    let ids = playHtml.match(/id="now_(.+)"/g);
    console.log(JSON.stringify(ids));

    let viewport = ids[1].match(/id="now_(.+)"/)[1],
      charset = ids[0].match(/id="now_(.+)"/)[1],
      list = [],
      list_sort = [],
      str = "";

    console.log(charset + "|" + viewport);

    console.log("charset-" + charset);

    for (var i = 0; i < charset.length; i++) {
      list.push({
        id: charset[i],
        text: viewport[i],
      });
    }
    list_sort = sortByKey("id", list, (a, b) => a - b);
    for (var i = 0; i < list_sort.length; i++) {
      str += list_sort[i].text;
    }

    console.log(str);
    let md5 = CryptoJS.MD5(str + "lemon").toString();
    console.log("md5-" + md5);

    let md5_1 = CryptoJS.enc.Utf8.parse(md5.substring(16));
    let md5_2 = CryptoJS.enc.Utf8.parse(md5.substring(0, 16));
    let ret_decrypt = CryptoJS.AES.decrypt(b64, md5_1, {
      iv: md5_2,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    let m3u8_url = ret_decrypt.toString(CryptoJS.enc.Utf8);
    console.log("#########");
    console.log(ret_decrypt);
    console.log(m3u8_url);
    console.log(CryptoJS.enc.Utf8.stringify(ret_decrypt).toString());
    return {
      type: "hls",
      url: m3u8_url,
    };
  }
}
