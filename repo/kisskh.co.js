// ==MiruExtension==
// @name         Kisskh
// @version      v0.0.5
// @author       OshekharO
// @lang         all
// @license      MIT
// @icon         https://kisskh.co/assets/icons/icon-192x192.png
// @package      kisskh.co
// @type         bangumi
// @webSite      https://kisskh.co
// ==/MiruExtension==

export default class extends Extension {
    async search(kw) {
      const res = await this.request(`/api/DramaList/Search?q=${kw}&type=0`);
      return res.map((item) => ({
        title: item.title,
        url: item.id.toString(),
        cover: item.thumbnail,
      }));
    }
  
    async latest(page) {
      const res = await this.request(
        `/api/DramaList/List?page=${page}&type=0&sub=0&country=0&status=0&order=2&pageSize=40`
      );
      return res.data.map((item) => ({
        title: item.title,
        url: item.id.toString(),
        cover: item.thumbnail,
      }));
    }
  
    async detail(url) {
      const res = await this.request(`/api/DramaList/Drama/${url}?isq=true`);
      const episodes = Array.isArray(res?.episodes) ? [...res.episodes].reverse() : [];
      return {
        title: res?.title || "",
        cover: res?.thumbnail || "",
        desc: res?.description || "",
        episodes: [
          {
            title: "Directory",
            urls: episodes.map((item) => ({
              name: `Episode ${item.number}`,
              url: item.id.toString(),
            })),
          },
        ],
      };
    }
  
    async watch(url) {
      let vidKey = "";
      let subKey = "";
      try {
        const vidEncRes = await this.request("", {
          headers: { "Miru-Url": `https://enc-dec.app/api/enc-kisskh?text=${url}&type=vid` },
        });
        if (vidEncRes?.status === 200) {
          vidKey = vidEncRes.result || "";
        }
      } catch (e) {}

      try {
        const subEncRes = await this.request("", {
          headers: { "Miru-Url": `https://enc-dec.app/api/enc-kisskh?text=${url}&type=sub` },
        });
        if (subEncRes?.status === 200) {
          subKey = subEncRes.result || "";
        }
      } catch (e) {}

      const res = await this.request(
        `/api/DramaList/Episode/${url}.png?err=false&ts=&time=&kkey=${vidKey}`
      );
      const subRes = await this.request(`/api/Sub/${url}?kkey=${subKey}`);
      const subtitles = Array.isArray(subRes) ? subRes : [];

      return {
        type: "hls",
        url: res?.Video || res?.Video_tmp,
        subtitles: subtitles.map((item) => ({
          title: item.label,
          url: item.src,
          language: item.land,
        })),
      };
    }
  }
