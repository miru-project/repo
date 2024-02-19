// ==MiruExtension==
// @name         UAA视频
// @version      v0.0.1
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
        const res = await this.request(
            `/search?category=&orderType=1&origin=&page=${page}&searchType=1&size=32`,
        );
        const bangumi = [];
        let array = res.model.data
        array.shift()
        console.log(array)
        array.forEach((element) => {

            bangumi.push({
                id: element.url,
                title: element.title,
                url: element.id,
                cover: element.coverUrl,
                urls: [element.url],
                desc: element.tags
            })

        });
        return bangumi;
    }

    async search(kw, page) {
        const res = await this.request(
            `/search?category=&keyword=${kw}&orderType=0&origin=&page=${page}&searchType=1&size=12`,
        );
        const bangumi = [];
        let array = res.model.data
        array.forEach((element) => {
            bangumi.push({
                id: element.url,
                title: element.title,
                url: element.id,
                cover: element.coverUrl,
                urls: [element.url],
                desc: element.tags
            })

        });
        return bangumi;
    }

    async detail(url) {
        const res = await this.request(`/intro?force=false&id=${url}&viewId=17080485428117155`);
        const comicInfo = res.model;
 
        return  {
                title: comicInfo.title,
                desc: comicInfo.brief,
                cover: comicInfo.coverUrl,
                "episodes": [
                    {
                        "title": "default",
                        "urls": [
                            {
                                "name": "在线播放",
                                "url": comicInfo.url
                            }
                        ]
                    }]
            }
    }

    async watch(url) {
        return {
            type: "hls",
            url: url
        }
    }
}
