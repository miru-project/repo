// ==MiruExtension==
// @name         Invidious
// @version      v0.0.1
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://invidious.io/apple-touch-icon.png
// @package      invidious.io
// @type         bangumi
// @webSite      https://invidious.slipfox.xyz/api/v1
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request(`/trending`);
 
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
    const res = await this.request(`/videos/${url}`);
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
  const res = await this.request(`/streams/${url}`, {
    headers: {
      "Miru-Url": "https://pipedapi.kavin.rocks",
    },
  });

  const subtitles = res.subtitles.map((item) => ({
    title: item.name,
    url: item.url,
    language: item.code,
  }));

  return {
    type: "hls",
    url: res.videoStreams?.[0]?.url,
    subtitles: subtitles,
  };
}
}
