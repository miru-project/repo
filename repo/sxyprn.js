// ==MiruExtension==
// @name         SxyPrn Porn
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      sxyprn
// @type         bangumi
// @icon         https://sxyprn.com/favicon.ico
// @webSite      https://sxyprn.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(
      res,
      ".post_el_small"
    );
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.js-pop", "href");
      const title = await this.querySelector(html, ".post_text").text;
      const cover = await this.querySelector(html, "img.mini_post_vid_thumb.lazyloaded").getAttributeText("data-src");
      novel.push({
        title,
        url,
        cover: "https:" + cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/${kw}.html`);
    const bsxList = await this.querySelectorAll(res, ".post_el_small");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.js-pop", "href");
      const title = await this.querySelector(html, ".post_text").text;
      const cover = await this.querySelector(html, "img.mini_post_vid_thumb.lazyloaded").getAttributeText("data-src");
      novel.push({
        title,
        url,
        cover: "https:" + cover,
      });
    }
    return novel;
  }

  async detail(url) {
	const res = await this.request(`${url}`);

    const title = await this.querySelector(res, "div.post_text").text;
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "meta[property='og:description']").getAttributeText("content");
    const episodes = [];
    const epiList = await this.querySelectorAll(res, "div#vid_container_id.vid_container");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "meta[itemprop='uploadDate']").getAttributeText("content");
      const url = await this.querySelector(html, "video.player_el.player_el_nc").getAttributeText("content");
      episodes.push({
        name,
        url: "https://sxyprn.com" + url,
      });
    }

    return {
      title,
      cover: "https:" + cover,
      desc,
      episodes: [
        {
          title: "Chapters",
          urls: episodes.reverse(),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request('', {
      headers: {
        "miru-url": url,
      },
    });
	
        return {
            type: "mp4",
            url: url,
        };
  }
}
