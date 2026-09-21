// ==MiruExtension==
// @name         Turkish123
// @version      v0.0.3
// @author       OshekharO
// @lang         tr
// @license      MIT
// @package      turkish123
// @type         bangumi
// @icon         https://turkish123.ac/wp-content/uploads/favicon-150x150.png
// @webSite      https://turkish123.ac
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/series-list/");
    const bsxList = await this.querySelectorAll(res, "div.ml-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/?s=${encodeURIComponent(kw)}`);
    const bsxList = await this.querySelectorAll(res, "div.ml-item");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h2").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const title = await this.querySelector(res, "h1[itemprop=name]").text;
    const cover = await this.querySelector(res, "img[itemprop='image']").getAttributeText("src");
    const desc = await this.querySelector(res, "p.f-desc").text;
    const episodes = [];
    const epiList = await this.querySelectorAll(res, "div.les-content > a.episodi");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "a").text;
      const epUrl = await this.getAttributeText(html, "a", "href");

      episodes.push({
        name: name.trim(),
        url: epUrl,
      });
    }

    return {
      title: title.trim(),
      cover,
      desc: desc.trim(),
      episodes: [
        {
          title: "Directory",
          urls: episodes.reverse(),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    // Strategy 1: Engifuosi / Tokvoy (Server 1) -> MP4
    const engMatch = res.match(/https?:\/\/engifuosi\.com\/d\/([a-zA-Z0-9]+)\.html/);
    if (engMatch) {
      const engId = engMatch[1];
      const tokUrl = `https://tokvoy.com/d/${engId}_x`;

      const tokRes = await this.request("", {
        headers: {
          "Miru-Url": tokUrl,
          "Referer": "https://engifuosi.com/",
        },
      });

      const opMatch = tokRes.match(/name="op" value="([^"]+)"/);
      const idMatch = tokRes.match(/name="id" value="([^"]+)"/);
      const modeMatch = tokRes.match(/name="mode" value="([^"]+)"/);
      const hashMatch = tokRes.match(/name="hash" value="([^"]+)"/);

      if (opMatch && idMatch && modeMatch && hashMatch) {
        const postData = `op=${encodeURIComponent(opMatch[1])}&id=${encodeURIComponent(idMatch[1])}&mode=${encodeURIComponent(modeMatch[1])}&hash=${encodeURIComponent(hashMatch[1])}`;

        const postRes = await this.request("", {
          method: "POST",
          data: postData,
          headers: {
            "Miru-Url": tokUrl,
            "Referer": "https://engifuosi.com/",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const directMp4Match = postRes.match(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/);
        if (directMp4Match && directMp4Match[1]) {
          return {
            type: "mp4",
            url: directMp4Match[1],
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
              "Referer": "https://tokvoy.com/",
            },
          };
        }
      }
    }

    // Strategy 2: Vidmoly (Server 2) -> HLS (m3u8)
    const vmMatch = res.match(/https?:\/\/vidmoly\.[a-z]+\/(?:dl|w)\/([a-zA-Z0-9]+)/);
    if (vmMatch) {
      const vmId = vmMatch[1];
      const vmEmbedUrl = `https://vidmoly.biz/embed-${vmId}.html`;

      const vmRes = await this.request("", {
        headers: {
          "Miru-Url": vmEmbedUrl,
          "Referer": "https://vidmoly.me/",
        },
      });

      const m3u8Match = vmRes.match(/(https?:\/\/[^\s'"]+\.m3u8[^\s'"]*)/);
      if (m3u8Match && m3u8Match[1]) {
        return {
          type: "hls",
          url: m3u8Match[1],
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Referer": "https://vidmoly.biz/",
          },
        };
      }
    }

    return {
      type: "mp4",
      url: "",
    };
  }
}
