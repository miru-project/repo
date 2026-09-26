// ==MiruExtension==
// @name         UAA视频
// @version      v0.0.2
// @author       wenmoux
// @lang         zh-cn
// @license      MIT
// @package      uaa.com
// @type         bangumi
// @icon         https://www.uaa.com/assets/uaalogo.7acb1f90.svg
// @webSite      https://www.uaa.com/api/video/app/video
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async latest(page) {
        try {
            const res = await this.request(
                `/search?category=&orderType=1&origin=&page=${page}&searchType=1&size=32`,
            );
            const bangumi = [];
            let array = res?.model?.data;
            if (!Array.isArray(array)) {
                return [];
            }
            array = [...array];
            array.shift();
            array.forEach((element) => {
                if (element) {
                    bangumi.push({
                        id: element.url,
                        title: element.title,
                        url: element.id,
                        cover: element.coverUrl,
                        urls: [element.url],
                        desc: element.tags
                    });
                }
            });
            return bangumi;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async search(kw, page) {
        try {
            const res = await this.request(
                `/search?category=&keyword=${kw}&orderType=0&origin=&page=${page}&searchType=1&size=12`,
            );
            const bangumi = [];
            let array = res?.model?.data;
            if (!Array.isArray(array)) {
                return [];
            }
            array.forEach((element) => {
                if (element) {
                    bangumi.push({
                        id: element.url,
                        title: element.title,
                        url: element.id,
                        cover: element.coverUrl,
                        urls: [element.url],
                        desc: element.tags
                    });
                }
            });
            return bangumi;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async detail(url) {
        try {
            const res = await this.request(`/intro?force=false&id=${url}&viewId=17080485428117155`);
            const comicInfo = res?.model || {};

            return {
                title: comicInfo.title || "",
                desc: comicInfo.brief || "",
                cover: comicInfo.coverUrl || "",
                "episodes": [
                    {
                        "title": "default",
                        "urls": [
                            {
                                "name": "在线播放",
                                "url": comicInfo.url || ""
                            }
                        ]
                    }]
            };
        } catch (error) {
            console.error(error);
            return {
                title: "",
                desc: "",
                cover: "",
                episodes: []
            };
        }
    }

    async watch(url) {
        return {
            type: "hls",
            url: url || ""
        };
    }
}
