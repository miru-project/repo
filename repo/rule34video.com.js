// ==MiruExtension==
// @name         Rule34Video
// @version      v0.0.3
// @author       jeylists
// @lang         en
// @license      MIT
// @icon         https://rule34video.com/favicon-32x32.png
// @package      rule34video.com
// @type         bangumi
// @webSite      https://rule34video.com
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {

  async req(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      }
    });
    return res;
  }

  async latest(page = 1) {
    const pageNum = page || 1;
    const paddedPage = pageNum.toString().padStart(2, "0");
    const url = `/latest-updates/?mode=async&function=get_block&block_id=custom_list_videos_latest_videos_list&sort_by=post_date&from=${paddedPage}`;
    const res = await this.request(url);
    const videoList = await this.querySelectorAll(res, "#custom_list_videos_latest_videos_list_items .item.thumb, .item.thumb, div.item");
    const videos = [];

    for (const element of videoList) {
        const rawHtml = await element.content;
        const title = await this.getAttributeText(rawHtml, ".th.js-open-popup, a.th, a", "title") || await this.getAttributeText(rawHtml, "img", "alt");
        const url = await this.getAttributeText(rawHtml, ".th.js-open-popup, a.th, a", "href");
        const cover = await this.getAttributeText(rawHtml, ".img.wrap_image .thumb, img.thumb, img", "data-original") || await this.getAttributeText(rawHtml, "img", "src");

        const updateRegex = /<div class="added">[\s\S]*?<\/svg>\s*(\d+\s\w+\s\w+)/;
        const updateMatch = rawHtml.match(updateRegex);
        const update = updateMatch ? updateMatch[1].trim() : null;

        if (title && url && cover) {
            videos.push({
                title: title.trim(),
                url: url,
                cover: cover,
                update: update,
            });
        }
    }

    return videos;
  }

  async search(kw, page = 1) {
    const pageNum = page || 1;
    const paddedPage = pageNum.toString().padStart(2, "0");
    const encodedKw = encodeURIComponent(kw);
    const url = `/search/${encodedKw}/?mode=async&function=get_block&block_id=custom_list_videos_videos_list_search&q=${encodedKw}&sort_by=&from_videos=${paddedPage}&from_albums=${paddedPage}`;
    let res = await this.request(url);

    let videoList = await this.querySelectorAll(res, "#custom_list_videos_videos_list_search_items .item.thumb, .item.thumb, div.item");
    if (!videoList || videoList.length === 0) {
      const fallbackUrl = `/search/${encodedKw}/`;
      res = await this.request(fallbackUrl);
      videoList = await this.querySelectorAll(res, "#custom_list_videos_videos_list_search_items .item.thumb, .item.thumb, div.item");
    }

    const videos = [];

    for (const element of videoList) {
      const rawHtml = await element.content;
      const title = await this.getAttributeText(rawHtml, ".th.js-open-popup, a.th, a", "title") || await this.getAttributeText(rawHtml, "img", "alt");
      const url = await this.getAttributeText(rawHtml, ".th.js-open-popup, a.th, a", "href");
      const cover = await this.getAttributeText(rawHtml, ".img.wrap_image .thumb, img.thumb, img", "data-original") || await this.getAttributeText(rawHtml, "img", "src");

      const updateRegex = /<div class="added">[\s\S]*?<\/svg>\s*(\d+\s\w+\s\w+)/;
      const updateMatch = rawHtml.match(updateRegex);
      const update = updateMatch ? updateMatch[1].trim() : null;

      if (title && url && cover) {
          videos.push({
              title: title.trim(),
              url: url,
              cover: cover,
              update: update,
          });
      }
    }
    return videos;
  }

  async detail(url) {
    const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3') || url;
    const res = await this.request(strippedpath);

    let title = "Rule34Video";
    let cover = "";
    let desc = "";
    let contentUrl = "";

    const jsonLdScript = await this.querySelectorAll(res, 'script[type="application/ld+json"]');
    if (jsonLdScript && jsonLdScript.length > 0) {
      try {
        const jsonRegex = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/;
        const match = jsonLdScript[0].content.match(jsonRegex);
        if (match) {
          const jsonLdContent = JSON.parse(match[1]);
          title = jsonLdContent.name || title;
          cover = jsonLdContent.thumbnailUrl || cover;
          desc = jsonLdContent.description || desc;
          contentUrl = jsonLdContent.contentUrl || "";
        }
      } catch (e) {}
    }

    if (!contentUrl) {
      const videoMatch = res.match(/(https?:\/\/[^\s'"]+\.(?:mp4|m3u8)[^\s'"]*)/i);
      contentUrl = videoMatch ? videoMatch[1] : url;
    }

    return {
      title: title.trim(),
      cover: cover,
      desc: desc,
      episodes: [
        {
          title: "Directory",
          urls: [{
            name: title.trim(),
            url: contentUrl,
          }]
        },
      ],
    };
  }

  async watch(url) {
    if (url.includes(".mp4") || url.includes(".m3u8")) {
      return {
        type: url.includes(".mp4") ? "mp4" : "hls",
        url: url,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://rule34video.com/"
        }
      };
    }

    const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3') || url;
    const res = await this.request(strippedpath);

    let contentUrl = "";
    const jsonLdScript = await this.querySelectorAll(res, 'script[type="application/ld+json"]');
    if (jsonLdScript && jsonLdScript.length > 0) {
      try {
        const jsonRegex = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/;
        const match = jsonLdScript[0].content.match(jsonRegex);
        if (match) {
          const jsonLdContent = JSON.parse(match[1]);
          contentUrl = jsonLdContent.contentUrl || "";
        }
      } catch (e) {}
    }

    if (!contentUrl) {
      const videoMatch = res.match(/(https?:\/\/[^\s'"]+\.(?:mp4|m3u8)[^\s'"]*)/i);
      contentUrl = videoMatch ? videoMatch[1] : url;
    }

    const type = contentUrl.endsWith(".mp4") ? "mp4" : "hls";

    return {
      type,
      url: contentUrl || "",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://rule34video.com/"
      }
    };
  }
}
