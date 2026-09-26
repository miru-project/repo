// ==MiruExtension==
// @name         好看的2号
// @version      v0.0.3
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
    try {
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
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async latest() {
    try {
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
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async detail(url) {
    try {
      const parts = url ? url.split(';') : [];
      const res = await this.request(parts[0] || "");
      const title = parts[2] || "";
      const cover = parts[1] || "";
      const desc = title;

      const episodes = [
        {
          title: "国内地址",
          urls: [
            {
              name: title,
              url: 'https://caocao15.xyz' + (parts[0] || ""),
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
    } catch (error) {
      console.error(error);
      return {
        episodes: [],
        desc: "",
        cover: "",
        title: "",
      };
    }
  }

  async watch(url) {
    try {
      const res = await this.request("", {
        headers: {
          "Miru-Url": url,
        },
      });
      const json = res ? res.match(/<script type="text\/javascript">var player_aaaa=(.+?)<\/script>/) : null;

      return {
          type: "hls",
          url: json ? JSON.parse(json[1]).url : "",
      };
    } catch (error) {
      console.error(error);
      return {
          type: "hls",
          url: "",
      };
    }
  }
}
