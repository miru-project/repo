// ==MiruExtension==
// @name         YouTube
// @version      v0.0.1
// @author       Miru
// @lang         all
// @license      MIT
// @package      youtube.com
// @type         bangumi
// @icon         https://www.youtube.com/s/desktop/f5fe135d/img/favicon.ico
// @webSite      https://www.youtube.com
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async search(kw, page, filter) {
    const query = kw || "trending";
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://www.youtube.com/youtubei/v1/search?prettyPrint=false",
        "Content-Type": "application/json"
      },
      method: "POST",
      data: {
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
            hl: "en",
            gl: "US"
          }
        },
        query: query
      }
    });

    const contents = res?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const videos = [];

    for (const sec of contents) {
      const itemSection = sec?.itemSectionRenderer?.contents || [];
      for (const item of itemSection) {
        if (item.videoRenderer) {
          const vr = item.videoRenderer;
          const videoId = vr.videoId;
          if (!videoId) continue;

          const title = vr.title?.runs?.[0]?.text || "YouTube Video";
          const cover = vr.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          videos.push({
            title,
            url: videoId,
            cover
          });
        }
      }
    }

    return videos;
  }

  async latest(page) {
    return await this.search("music", page);
  }

  async detail(url) {
    const videoId = url.replace(/.*(?:v=|\/)([\w-]{11}).*/, "$1");

    try {
      const omniRes = await this.request("", {
        headers: {
          "Miru-Url": `https://omni-api-mocha.vercel.app/api/youtube/download?url=https://m.youtube.com/watch?v=${videoId}`
        }
      });

      if (omniRes?.code === "0000" && omniRes?.data?.medias?.length > 0) {
        const data = omniRes.data;
        const title = data.title || videoId;
        const cover = data.imageUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const desc = `Duration: ${data.duration || 'N/A'}`;

        const streamUrls = data.medias
          .filter(m => m.url)
          .map(m => ({
            name: m.format || "Stream",
            url: m.url
          }));

        if (streamUrls.length > 0) {
          return {
            title,
            cover,
            desc,
            episodes: [
              {
                title: "Video Streams",
                urls: streamUrls
              }
            ]
          };
        }
      }
    } catch (e) {
      console.log("Omni API error, falling back to InnerTube:", e);
    }

    // Fallback to InnerTube API
    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
        "Content-Type": "application/json"
      },
      method: "POST",
      data: {
        context: {
          client: {
            clientName: "ANDROID_VR",
            clientVersion: "1.50.23",
            hl: "en",
            gl: "US"
          }
        },
        videoId: videoId
      }
    });

    const vd = res?.videoDetails || {};
    const sp = res?.streamingData || {};

    const title = vd.title || videoId;
    const author = vd.author || "";
    const desc = (vd.shortDescription || "") + (author ? `\n\nAuthor: ${author}` : "");
    const thumbnails = vd.thumbnail?.thumbnails || [];
    const cover = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const formats = sp.formats || [];
    const adaptive = sp.adaptiveFormats || [];

    const streamUrls = [];

    for (const f of formats) {
      if (f.url) {
        streamUrls.push({
          name: `${f.qualityLabel || '360p'} (Combined MP4)`,
          url: f.url
        });
      }
    }

    for (const f of adaptive) {
      if (f.url && f.mimeType && f.mimeType.includes("video")) {
        const quality = f.qualityLabel || "video";
        const mime = f.mimeType.split(";")[0];
        streamUrls.push({
          name: `${quality} (${mime})`,
          url: f.url
        });
      }
    }

    if (streamUrls.length === 0) {
      streamUrls.push({
        name: "YouTube Embed Player",
        url: `https://www.youtube.com/embed/${videoId}`
      });
    }

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Video Streams",
          urls: streamUrls
        }
      ]
    };
  }

  async watch(url) {
    return {
      type: "mp4",
      url: url
    };
  }
}
