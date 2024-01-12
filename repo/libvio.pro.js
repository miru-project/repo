// ==MiruExtension==
// @name         libvio
// @version      v0.0.2
// @author       appdevelpo
// @lang         zh
// @license      MIT
// @icon         https://xiaoxiaojia.oss-cn-shanghai.aliyuncs.com/statics/img/favicon.ico
// @package      libvio.pro
// @type         bangumi
// @webSite      https://www.libvio.pro
// ==/MiruExtension==

export default class extends Extension {
  async createFilter(filter) {

    const mainbar = {
      title: "",
      max: 1,
      min: 0,
      default: "/show/4--------~---.html",
      options: {
        "/show/2--------~---.html": "連續劇",
        "/show/1--------~---.html": "電影",
        "/show/3--------~---.html": "綜藝",
        "/show/4--------~---.html": "動漫",
      },
    }
    return {
      mainbar
    }
  }
  async latest(page) {
    const res = await this.request(``);
    const selector = await this.querySelectorAll(res, "div.stui-vodlist__box")
    // console.log(selector.length)
    const bangumi = [];
    for (const element of selector) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.getAttributeText(html, "a", "title");
      const cover = await this.getAttributeText(html, "a", "data-original");
      //console.log(title+cover+url)
      bangumi.push({
        title,
        url,
        cover,
      });
    }
    return bangumi;
  }

  async detail(url) {
    const episodes = [];
    const res = await this.request(url);
    let queryepArea = await this.querySelectorAll(res, "div.stui-vodlist__head");
    const title = await this.querySelector(res, "h1.title").text
    const cover = await this.getAttributeText(res, ".pic > .lazyload", "data-original")
    for (var i = 0; i < queryepArea.length - 1; i++) {
      const ep = []
      const html = queryepArea[i].content;
      console.log(html)
      const text = await this.querySelectorAll(html, "li")
      const mirrorTitle = await this.querySelector(html, "h3.iconfont.icon-iconfontplay2").text
      for (var j = 0; j < text.length; j++) {
        const subHtml = text[j].content;
        const name = await this.querySelector(subHtml, "a").text
        const url = await this.getAttributeText(subHtml, "a", "href");
        ep.push({
          name,
          url
        })
      }
      episodes.push({
        title: mirrorTitle,
        urls: ep
      })
      // console.log(ep)
    }
    return {
      title,
      cover,
      episodes
    }
  }

  async search(kw, page, filter) {
    let url = `/search/${kw}----------${page}---.html`
    if (!kw) {
      url = filter["mainbar"][0].replace("~", page)
      console.log(url)
      const res = await this.request(url);
      const selector = await this.querySelectorAll(res, "div.stui-vodlist__box")
      // console.log(selector.length)
      const bangumi = [];
      for (const element of selector) {
        const html = await element.content;
        const url = await this.getAttributeText(html, "a", "href");
        const title = await this.getAttributeText(html, "a", "title");
        const cover = await this.getAttributeText(html, "a", "data-original");
        //console.log(title+cover+url)
        bangumi.push({
          title,
          url,
          cover,
        });
      }
      return bangumi;
    }
    const res = await this.request(url);
    const bsxList = await this.querySelectorAll(res, "li.col-xs-3.col-sm-4.col-md-6");
    const bangumi = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.getAttributeText(html, "a", "title");
      const cover = await this.getAttributeText(html, "a", "data-original");
      bangumi.push({
        title,
        url,
        cover,
      });
    }
    return bangumi;
  }

  async watch(url) {
    const res = await this.request(url);
    const player_json = res.match(/player_aaaa=(\{.+?\})/)[1];
    const player_script =  res.match(/src="([\w\/]+?player\.js.+?)"/)[1];
    console.log(player_script)
    const playerRes = await this.request(player_script);
    // console.log(playerRes)
    const script_version = playerRes.match(/(\.js\?.+?)"/)[1];
    // console.log(script_version)

    const player_data = JSON.parse(player_json);
    const embed_script = `/static/player/${player_data.from}${script_version}`;
    const embedScriptRes = await this.request(embed_script);
    console.log(embedScriptRes)
    const embed_url_based = embedScriptRes.match(/src="(.+?)'/)[1]
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1); function base64encode(str) { var out, i, len; var c1, c2, c3; len = str.length; i = 0; out = ""; while (i < len) { c1 = str.charCodeAt(i++) & 0xff; if (i == len) { out += base64EncodeChars.charAt(c1 >> 2); out += base64EncodeChars.charAt((c1 & 0x3) << 4); out += "=="; break } c2 = str.charCodeAt(i++); if (i == len) { out += base64EncodeChars.charAt(c1 >> 2); out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)); out += base64EncodeChars.charAt((c2 & 0xF) << 2); out += "="; break } c3 = str.charCodeAt(i++); out += base64EncodeChars.charAt(c1 >> 2); out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)); out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)); out += base64EncodeChars.charAt(c3 & 0x3F) } return out } function base64decode(str) { var c1, c2, c3, c4; var i, len, out; len = str.length; i = 0; out = ""; while (i < len) { do { c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff] } while (i < len && c1 == -1); if (c1 == -1) break; do { c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff] } while (i < len && c2 == -1); if (c2 == -1) break; out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4)); do { c3 = str.charCodeAt(i++) & 0xff; if (c3 == 61) return out; c3 = base64DecodeChars[c3] } while (i < len && c3 == -1); if (c3 == -1) break; out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2)); do { c4 = str.charCodeAt(i++) & 0xff; if (c4 == 61) return out; c4 = base64DecodeChars[c4] } while (i < len && c4 == -1); if (c4 == -1) break; out += String.fromCharCode(((c3 & 0x03) << 6) | c4) } return out } function utf16to8(str) { var out, i, len, c; out = ""; len = str.length; for (i = 0; i < len; i++) { c = str.charCodeAt(i); if ((c >= 0x0001) && (c <= 0x007F)) { out += str.charAt(i) } else if (c > 0x07FF) { out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F)); out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F)); out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F)) } else { out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F)); out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F)) } } return out } function utf8to16(str) { var out, i, len, c; var char2, char3; out = ""; len = str.length; i = 0; while (i < len) { c = str.charCodeAt(i++); switch (c >> 4) { case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7: out += str.charAt(i - 1); break; case 12: case 13: char2 = str.charCodeAt(i++); out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F)); break; case 14: char2 = str.charCodeAt(i++); char3 = str.charCodeAt(i++); out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0)); break } } return out }
    if (player_data.encrypt == '1') {
      player_data.url = unescape(player_data.url);
      player_data.url_next = unescape(player_data.url_next);
    } else if (player_data.encrypt == '2') {
      player_data.url = unescape(base64decode(player_data.url));
      player_data.url_next = unescape(base64decode(player_data.url_next));
    }
    const embed_url = `${embed_url_based}${player_data.url}&url_next=${player_data.url_next}&id=${player_data.id}&nid=${player_data.nid}`;
    const embedRes = await this.request("",{
      headers:{
        "Miru-Url":embed_url,
        "Referer":"https://www.libvio.pro/",
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36"
      }
    });
    const videoLink = embedRes.match(/urls = '(.+?)'/)[1];
    console.log(videoLink)
    return {
      type: "hls",
      url: videoLink,//auto
      headers:{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
      }

    }
  }



}
