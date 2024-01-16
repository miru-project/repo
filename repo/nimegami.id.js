// ==MiruExtension==
// @name         Nimegami
// @version      v0.0.1
// @author       JerukPurut404
// @lang         id
// @license      MIT
// @package      nimegami.id
// @type         bangumi
// @icon         https://nimegami.id/wp-content/uploads/2018/07/Nimegami-anime.png
// @webSite      https://nimegami.id
// ==/MiruExtension==

//Current issue: Doesn't work on older animes such as spy x family since it's using video.nimegami.id instead of berkasdrive.com

export default class extends Extension {

  async latest() {
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(
      res,
      "div.post-article > article"
    );
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      let url2 = await this.getAttributeText(html, "div.thumb > a", "href");
      url2 = url2.replace('https://nimegami.id', '');
      console.log(url2);
      const url = url2;
      const title = await this.querySelector(html, "h2 > a").text;
      const cover = await this.querySelector(
        html,
        ".attachment-post-thumbnail.size-post-thumbnail"
      ).getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }
  

  async search(kw){
    const res = await this.request(`/?s=${kw}&post_type=post`)
    const bsxList = await this.querySelectorAll(res, "article")
    const novel = [];

    for (const element of bsxList){
      const html = await element.content;
      let url2 = await this.getAttributeText(html, 'div.thumbnail > a', "href");
      url2 = url2.replace('https://nimegami.id', '');
      console.log(url2);
      const url = url2;
      const title = await this.querySelector(html, 'h2 > a').text;
      const cover = await this.querySelector(html, 'img').getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover
      });
    }
    return novel;
  }

  async detail(url){
    const res = await this.request(url);
    const title = await this.querySelector(res, 'h1.title').text
    const cover = await this.querySelector(res, 'img[itemprop="image"]').getAttributeText("src");
    const desc = "No Desc Avaliable";
    const episodes_360p = [];
    const episodes_480p = [];
    const episodes_720p = [];
    const epiList = await this.querySelectorAll(res, "div.list_eps_stream > li");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, ".select-eps").text;
      const ep_url = await this.getAttributeText(html, ".select-eps", "data");
      const words = CryptoJS.enc.Base64.parse(ep_url);
      const textString = CryptoJS.enc.Utf8.stringify(words);
      const regex_360 = /"format":"360p","url":\["([^"]+)","([^"]+)"]/;
      const regex_480 = /"format":"480p","url":\["([^"]+)","([^"]+)"]/;
      const regex_720 = /"format":"720p","url":\["([^"]+)","([^"]+)"]/;
      const match_360 = textString.match(regex_360);
      const match_480 = textString.match(regex_480);
      const match_720 = textString.match(regex_720);
      const url = match_360 ? match_360[2] : "";
      const url_480 = match_480 ? match_480[2] : "";
      const url_720 = match_720 ? match_720[2] : "";


      episodes_360p.push({
        name: name.trim(),
        url,
      });
      episodes_480p.push({
        name: name.trim(),
        url: url_480,
      });
      episodes_720p.push({
        name: name.trim(),
        url: url_720,
      });
    }
    return{
      title: title.trim(),
      cover: cover,
      desc: desc,
      episodes:[{
        title: '360p',
        urls: episodes_360p.reverse()
      }, 
      {
        title: '480p',
        urls: episodes_480p.reverse()
      }, 
      {
        title: '720p',
        urls: episodes_720p.reverse()
      }]
    }
  }

  async watch(url) {
    console.log(url)
    const chec = url.replace(/\\\//g, "/");
    const res = await this.request('', {
      headers: {
        "Miru-Url": chec,
      },
    });
    const video_url = res.match(/<source src="(.+?.mp4)"/)[1];
    
    return {
      type: "hls",
      url: video_url || "",
    };
  }
}