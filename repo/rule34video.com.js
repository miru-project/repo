// ==MiruExtension==
// @name         Rule34Video
// @version      v0.0.1
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
      "Miru-Url": url,
    });
    return url;
  }

  async latest(page) {
    // Latest updates
    const paddedPage = page.toString().padStart(2, "0");
    const url = `/latest-updates/?mode=async&function=get_block&block_id=custom_list_videos_latest_videos_list&sort_by=post_date&from=${paddedPage}`;
    const res = await this.request(url);
    const videoList = await this.querySelectorAll(res, "#custom_list_videos_latest_videos_list_items .item.thumb");
    const videos = [];

    for (const element of videoList) {
        const rawHtml = await element.content;
        const title = await this.getAttributeText(rawHtml,".th.js-open-popup","title");
        const url = await this.getAttributeText(rawHtml,".th.js-open-popup","href");
        const cover = await this.getAttributeText(rawHtml,".img.wrap_image .thumb","data-original");
    
        // Regular expression to extract the "added" string (update time)
        const updateRegex = /<div class="added">[\s\S]*?<\/svg>\s*(\d+\s\w+\s\w+)/;
        const updateMatch = rawHtml.match(updateRegex);
        const update = updateMatch ? updateMatch[1].trim() : null;
    
        if (title && url && cover) {
            videos.push({
                title: title,
                url: url,
                cover: cover,
                update: update,
            });
        }
    }

    return videos;
  }

  async search(kw, page) {
    // Search
    const paddedPage = page.toString().padStart(2, "0");
    const url = `/search/${kw}/?mode=async&function=get_block&block_id=custom_list_videos_videos_list_search&q=bitch&sort_by=&from_videos=${paddedPage}&from_albums=${paddedPage}`;
    const res = await this.request(url);
    const videoList = await this.querySelectorAll(res, "#custom_list_videos_videos_list_search_items .item.thumb");
    const videos = [];

    for (const element of videoList) {
      const rawHtml = await element.content;
      const title = await this.getAttributeText(rawHtml,".th.js-open-popup","title");
      const url = await this.getAttributeText(rawHtml,".th.js-open-popup","href");
      const cover = await this.getAttributeText(rawHtml,".img.wrap_image .thumb","data-original");
  
      // Regular expression to extract the "added" string (update time)
      const updateRegex = /<div class="added">[\s\S]*?<\/svg>\s*(\d+\s\w+\s\w+)/;
      const updateMatch = rawHtml.match(updateRegex);
      const update = updateMatch ? updateMatch[1].trim() : null;
  
      if (title && url && cover) {
          videos.push({
              title: title,
              url: url,
              cover: cover,
              update: update,
          });
      }
    }
    return videos;
  }

  async detail(url) {
    // Details
    const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
    const res = await this.request(strippedpath);
    const jsonLdScript = await this.querySelectorAll(res,'script[type="application/ld+json"]');

    // Parse the JSON-LD content
    const jsonRegex = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/;
    const match = jsonLdScript[0].content.match(jsonRegex);
    const jsonLdContent = JSON.parse(match[1]);

    // Extract the title
    const title = jsonLdContent.name;
    const cover = jsonLdContent.thumbnailUrl;
    const desc = jsonLdContent.description;

    return {
      title: title.trim(),
      cover: cover,
      desc,
      episodes: [
        {
          title: title,
          urls: [{
            name: title,
            url: url,
          }]
        },
      ],
    };
  }

  async watch(url) {
    // Watch
    const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
    const res = await this.request(strippedpath);
    const jsonLdScript = await this.querySelectorAll(res,'script[type="application/ld+json"]');

    // Parse the JSON-LD content
    const jsonRegex = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/;
    const match = jsonLdScript[0].content.match(jsonRegex);
    const jsonLdContent = JSON.parse(match[1]);

    // Extract the contentUrl
    const contentUrl = jsonLdContent.contentUrl;

    // Determine type based on the file extension (mp4/hls)
    const type = contentUrl.endsWith(".mp4") ? "mp4" : "hls";

    // Return the BangumiWatch object
    return {
      type,
      url: contentUrl,
    };
  }
}
