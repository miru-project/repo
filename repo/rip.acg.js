// ==MiruExtension==
// @name         ACG.RIP
// @version      v0.0.1
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         http://r.photo.store.qq.com/psb?/V12tx9ch2GA3dz/FqLQBHE23P.c*XKPM4RI*6*aL0mdnoww*2zSjghMKn8!/r/dPIAAAAAAAAA
// @package      rip.acg
// @type         bangumi
// @webSite      https://acg.rip
// ==/MiruExtension==

export default class extends Extension {
    async createFilter(filter) {}
  
    async getFullUrl(url) {
      return `https://acg.rip${url}`;
    }
  
    async getItemList(html) {
      const trs = await this.querySelectorAll(html, "tbody tr");
      const items = [];
      for (const item of trs) {
        const html = item.content;
        const a = this.querySelector(html, ".title a");
        const title = await a.text;
        console.log(a.content);
        const url = await this.getAttributeText(
          a.content,
          "a:nth-child(1)",
          "href"
        );
        items.push({
          title,
          url,
        });
      }
      return items;
    }
  
    async latest(page) {
      const res = await this.request(`/1/page/${page}`);
      return await this.getItemList(res);
    }
  
    async detail(url) {
      const res = await this.request(url);
      const title = (
        await this.querySelector(res, ".panel-default .panel-heading").text
      ).trim();
      const desc = await this.querySelector(res, ".post-content").text;
      return {
        title,
        desc,
        episodes: [
          {
            title: "种子",
            urls: [
              {
                name: "在线观看",
                url: await this.getAttributeText(res, ".panel-body .btn", "href"),
              },
            ],
          },
        ],
      };
    }
  
    async search(kw, page, filter) {
      const res = await this.request(`/page/${page}?term=${kw}`);
      return this.getItemList(res);
    }
  
    async watch(url) {
      return {
        type: "torrent",
        url: await this.getFullUrl(url),
      };
    }
  }
  