// ==MiruExtension==
// @name         Invidious
// @version      v0.0.2
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://invidious.io/apple-touch-icon.png
// @package      invidious.io
// @type         bangumi
// @webSite      https://vid.puffyan.us/api/v1
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request(`/trending?region=US`);
 
    if (!Array.isArray(res)) {
      // Handle the case when the response is not an array
      return [];
    }
 
    return res.map((item) => ({
      title: item.title || "",
      url: item.videoId || "",
      cover: item.videoThumbnails?.[0]?.url || "", // Use the first thumbnail's URL if available
    }));
  }
 
  async search(kw) {
    const res = await this.request(`/search?q=${kw}`);
 
    return res.map((item) => ({
      title: item.title || "",
      url: item.videoId || "",
      cover: item.videoThumbnails?.[0]?.url || "",
    }));
  }
 
  async detail(url) {
    const res = await this.request(`/videos/${url}`, {
    headers: {
      "Miru-Url": "https://vid.puffyan.us/api/v1",
    },
    });    
  
    return {
      title: res.title,
      cover: res.videoThumbnails?.[0]?.url,
      desc: res.description,
      episodes: [
        {
          title: "Watch",
          urls: [
            {
              name: res.title,
              url: res.videoId,
            },
          ],
        },
      ],
    };
  }
 
  async watch(url) {
  const res = await this.request(`/videos/${url}`);
  
  return {
    type: "hls",
    url: res.formatStreams?.[1]?.url,
  };
}
}
