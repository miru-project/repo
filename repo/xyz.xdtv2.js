// ==MiruExtension==
// @name         好看的2号
// @version      v0.0.2
// @author       zj
// @lang         zh-cn
// @license      MIT
// @icon         https://caocao15.xyz/upload/site/20230913-1/bf5300cb13794e430bff80aa9d4701bb.png
// @package      xyz.xdtv2
// @type         bangumi
// @webSite      https://caocao15.xyz
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async search(kw) {
    const res = await this.request(`/index.php/vod/search.html?wd=${kw}`);
    const bsxList = await this.querySelectorAll(res, "ul.thumbnail-group.clearfix > li");
    const bangumi = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.thumbnail", "href");
      const title = await this.querySelector(html, "h5 > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      bangumi.push({
        title: title.trim(),
        url: `${url};${cover};${title}`,
        cover,
      });
    }
    return bangumi;
  }

  async latest() {
    const res = await this.request("/index.php/vod/type.html");
    const bsxList = await this.querySelectorAll(res, "ul.thumbnail-group.clearfix > li");
    const bangumi = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.thumbnail", "href");
      const title = await this.querySelector(html, "h5 > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      bangumi.push({
        title: title.trim(),
        url: `${url};${cover};${title}`,
        cover,
      });
    }
    return bangumi;
  }

  async detail(url) {
    const res = await this.request(url.split(';')[0]);
    const title = url.split(';')[2];
    const cover = url.split(';')[1];
    const desc = title;
   
    const episodes = [
      {
        title: "国内地址",
        urls: [
          {
            name: title,
            url: 'https://caocao15.xyz' + url.split(';')[0],
          },
        ],
      },
    ];

    return {
      episodes,
      desc: desc.trim(),
      cover,
      title: title.trim(),
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });
    const json = res.match(/<script type="text\/javascript">var player_aaaa=(.+?)<\/script>/);
    
        return {
            type: "hls",
            url: JSON.parse(json[1]).url,
        };
     }
}
