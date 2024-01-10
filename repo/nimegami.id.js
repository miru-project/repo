// ==MiruExtension==
// @name         Nimegami
// @version      v0.0.1
// @author       JerukPurut404
// @lang         en
// @license      MIT
// @package      nimegami.id
// @type         bangumi
// @icon         https://nimegami.id/wp-content/uploads/2018/07/Nimegami-anime.png
// @webSite      https://nimegami.id
// ==/MiruExtension==

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
    const episodes = [];
    const epiList = await this.querySelectorAll(res, "div.list_eps_stream > li");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, ".select-eps").text;
      const url = await this.getAttributeText(html, ".select-eps", "data");

      episodes.push({
        name: name.trim(),
        url,
      });
    }
    
    return{
      title: title.trim(),
      cover: cover,
      desc: desc,
      episodes:[{
        title: 'Directory',
        urls: episodes.reverse()
      }]
    }
  }

  async watch(url) {
    const words = CryptoJS.enc.Base64.parse(url);
    const textString = CryptoJS.enc.Utf8.stringify(words);
    const regex = /"format":"720p","url":\["([^"]+)","([^"]+)"]/;
    const match = textString.match(regex);
    const episode_url = match ? match[2] : "";
    const chec = episode_url.replace(/\\\//g, "/");
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