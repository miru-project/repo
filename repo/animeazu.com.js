// ==MiruExtension==
// @name         Animeazu
// @version      v0.0.1
// @author       JerukPurut404
// @lang         pr
// @license      MIT
// @package      animeazu.com
// @type         bangumi
// @icon         https://animeazu.com/wp-content/uploads/2023/08/dada.png
// @webSite      https://animeazu.com
// ==/MiruExtension==

//Works only with Mp4upload server 

export default class extends Extension {
  async latest(){
   const res = await this.request("/");
   const bsxList = await this.querySelectorAll(res, "div.excstf > article");
   const novel = [];
   for (const element of bsxList){
    const html = await element.content;
    const url = await this.getAttributeText(html, "div.bsx > a.tip", "href");
    const pattern = /-episodul-\d+(-final)?/;
    let new_url = url.replace(pattern, ''); 
    const title = await this.querySelector(html, "div.bsx > a.tip > div.tt").text;
    const cover = await this.querySelector(html, "img[itemprop='image']").getAttributeText('src');
    novel.push({
      title: title.trim(),
      url: new_url, 
      cover,
    });
   }
   return novel;
  }

  async search(kw){
    const res = await this.request(`/?s=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.listupd > article");
    const novel = [];
    for (const element of bsxList){
      const html = await element.content;
      const url = await this.getAttributeText(html, "div.bsx > a", "href");
      const title = await this.querySelector(html, "div.bsx > a > div.tt").text;
      const cover = await this.querySelector(html, "img[itemprop='image']").getAttributeText('src');
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
    const desc = await this.querySelectorAll(res, 'div.entry-content > p').text;
    const cover = await this.querySelector(res, 'img[width="247"]').getAttributeText('src');
    const epiList = await this.querySelectorAll(res, ' div.eplister > ul > li');
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
    console.log(episodes);
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
    const mp4upload = await this.querySelector(res, 'option[data-index="3"]').getAttributeText("value");
    const words = CryptoJS.enc.Base64.parse(mp4upload);
    const textString = CryptoJS.enc.Utf8.stringify(words);
    const regex_url = /<IFRAME SRC="([^"]+)"/i;
    const mp4upload_url = textString.match(regex_url)[1];
    console.log(mp4upload_url);
    const res2 = await this.request('', {
      headers: {
        "Miru-Url": mp4upload_url,
      },
    });
    const script_js = await this.querySelector(res2, 'script');
    const video_match = script_js["content"].match(/src:\s*"(.+?)"/)[1];
    console.log(video_match)
    return {
      type: "hls",
      url: video_match || "",
      headers:{
        "Referer": "https://www.mp4upload.com"
      }
    };
  }
}