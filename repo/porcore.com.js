// ==MiruExtension==
// @name         PorCore
// @version      v0.0.1
// @author       javxsub.com
// @lang         en
// @license      MIT
// @icon         https://porcore.com/favicon-96x96.png
// @package      porcore.com
// @type         bangumi
// @webSite      https://porcore.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {

  async req(url) {
    const res = await this.request("", {
      "Miru-Url": url,
    });
    return url;
  }

  async latest(page) {
    // Latest updates
    const url = `/?ajax&p=${page}`;
    const res = await this.request(url);
    const videoList = await this.querySelectorAll(res, "div.onevideothumb");
    const videos = [];

    for (const element of videoList) {
        const html  = await element.content;
        const title = await this.getAttributeText(html, "h5", "title");
        const url   = await this.getAttributeText(html, "a", "href");
        const cover = await this.getAttributeText(html, "img.flipbookimages", "src");
        const updt  = await this.querySelector(html, "div.floatlefttop").text;
    
        if (title && url && cover && cover.includes("res.php")) {
            videos.push({
                title: title,
                url: url,
                cover: cover,
                update: updt.trim(),
            });
        }
    }

    return videos;
  }

  async search(kw, page) {
    // Search
    const url = `/show/${kw}?ajax&sort=newest&p=${page}`;
    const res = await this.request(url);
    const videoList = await this.querySelectorAll(res, "div.onevideothumb");
    const videos = [];

    for (const element of videoList) {
        const html  = await element.content;
        const title = await this.getAttributeText(html, "h5", "title");
        const url   = await this.getAttributeText(html, "a", "href");
        const cover = await this.getAttributeText(html, "img.flipbookimages", "src");
        const updt  = await this.querySelector(html, "div.floatlefttop").text;
    
        if (title && url && cover && cover.includes("res.php")) {
            videos.push({
                title: title,
                url: url,
                cover: cover,
                update: updt.trim(),
            });
        }
    }

    return videos;
  }

  async detail(url) {
    // Details
    const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
    const res   = await this.request(strippedpath);
    const title = await this.querySelector(res, 'h1').text;
    const cover = await this.querySelector(res, 'video.video-js').getAttributeText("poster");
    const desc  = await this.querySelector(res, 'p.small').text;
    const user  = await this.querySelector(res, 'a.label-default').text;
    const video = await this.querySelector(res, 'source[type="application\/x-mpegURL"]').getAttributeText("src");

    return {
      title: title.trim(),
      cover: cover,
      desc,
      episodes: [
        {
          title: user.trim(),
          urls: [{
            name: title.trim(),
            url: video,
          }]
        },
      ],
    };
  }

  async watch(url) {
    return {
      type: "hls",
      url: url || "",
    };
  }
}
