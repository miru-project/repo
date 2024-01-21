// ==MiruExtension==
// @name         Arabsama
// @version      v0.0.1
// @author       JerukPurut404
// @lang         ar
// @license      MIT
// @package      arabsama.net
// @type         bangumi
// @icon         https://arabsama.net/wp-content/uploads/2023/09/svgexport-34.png
// @webSite      https://arabsama.net
// ==/MiruExtension==

export default class extends Extension{
  
  async latest(){
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(res, 'div.excstf > article');
    const novel = [];
    for (const element of bsxList){
      const html = await element.content;
      const url = await this.getAttributeText(html, "div.bsx > a", "href");
      const regex = /\/\d+\/?$/;
      let new_url = url.replace(regex, ''); 
      const title = await this.querySelector(html, "div.bsx > a > div.tt").text;
      const cover = await this.querySelector(html, 'img[itemprop="image"]').getAttributeText('src');
      novel.push({
        title: title.trim(),
        url: new_url,
        cover,
      });
    }
    return novel;
  };

  async search(kw){
    const res = await this.request(`/?s=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.listupd > article");
    const novel = [];
    for (const element of bsxList){
      const html = await element.content;
      const url = await this.getAttributeText(html, "div.bsx > a", "href");
      const title = await this.querySelector(html, "div.bsx > a > div.tt").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover
      });
    }
    return novel;
  }

  async detail(url){
    const chec = url.replace(/\\\//g, "/");
    const res = await this.request('', {
      headers: {
        "Miru-Url": chec,
      },
    });
    const title = await this.querySelector(res, 'h1.entry-title').text;
    const cover = await this.querySelector(res, 'img[width="247"]').getAttributeText('src');
    const desc = await this.querySelector(res, 'div.entry-content').text;
    const epiList = await this.querySelectorAll(res, "div.eplister > ul > li");
    const episodes = [];
    for (const element of epiList){
      const html = await element.content;
      const name = await this.querySelector(html, "a > div.epl-num").text;
      const url = await this.getAttributeText(html, "a", "href");
      episodes.push({
        name: name.trim(),
        url,
      });
    }
    return{
      title: title.trim(),
      cover: cover,
      desc,
      episodes: [{
        title: "Directory",
        urls: episodes.reverse(),
      }]
    }
  };

  async watch(url){
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });
    const mp4upload = await this.querySelector(res, 'option[data-index="2"]').getAttributeText("value");
    const words = CryptoJS.enc.Base64.parse(mp4upload);
    const textString = CryptoJS.enc.Utf8.stringify(words);
    const regex_url = /<IFRAME SRC="([^"]+)"/i;
    const mp4upload_url = textString.match(regex_url)[1];
    const res2 = await this.request('', {
      headers: {
        "Miru-Url": mp4upload_url,
      },
    });
    const script_js = await this.querySelector(res2, 'script');
    const video_match = script_js["content"].match(/src:\s*"(.+?)"/)[1];
    return {
      type: "hls",
      url: video_match || "",
      headers:{
        "Referer": "https://www.mp4upload.com"
      }
    };
  }
}
