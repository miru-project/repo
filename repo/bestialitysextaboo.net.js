// ==MiruExtension==
// @name         BestialitySexTaboo
// @version      v0.0.4
// @author       javxsub.com
// @lang         en
// @license      MIT
// @icon         https://bestialitysextaboo.net/favicon.ico
// @package      bestialitysextaboo.net
// @type         bangumi
// @webSite      https://bestialitysextaboo.net
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
    async latest(page) {
        if (page == 1) {
            var rpage = "";
        } else {
            var rpage = page + "/";
        }
        const url = `/videos/${rpage}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "li.video");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.getAttributeText(html, "span.title > a", "title");
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img", "src");
            const updt = await this.querySelector(html, "span.duration").text;
            const check = await this.getAttributeText(html, "div.video-thumb", "class");
            if (title && url && cover && !check.includes("private")) {
                videos.push({
                    title: title,
                    url: url,
                    cover: cover,
                    update: updt.trim().replace("HD", "[HD]"),
                });
            }
        }
        return videos;
    }

    async search(kw, page) {
        const url = `/search/video/?s=${kw}&page=${page}`;
        const res = await this.request(url);
        const videoList = await this.querySelectorAll(res, "li.video");
        const videos = [];
        for (const element of videoList) {
            const html = await element.content;
            const title = await this.getAttributeText(html, "span.title > a", "title");
            const url = await this.getAttributeText(html, "a", "href");
            const cover = await this.getAttributeText(html, "img", "src");
            const updt = await this.querySelector(html, "span.duration").text;
            const check = await this.getAttributeText(html, "div.video-thumb", "class");
            if (title && url && cover && !check.includes("private")) {
                videos.push({
                    title: title,
                    url: url,
                    cover: cover,
                    update: updt.trim().replace("HD", "[HD]"),
                });
            }
        }
        return videos;
    }

    async detail(url) {
        const strippedpath = url.replace(/^(https?:\/\/)?([^\/]+)(\/.*)?/, '$3');
        const res = await this.request(strippedpath);
        const title = await this.querySelector(res, 'h1').text;
        const covst = await this.querySelector(res, 'img[alt="Thumb 1"]').getAttributeText("src");
        const cover = await covst.match(/.*\//) + "player.jpg";
        const desc = await this.querySelector(res, 'div.content-info > span').text;
        const user = await this.querySelector(res, 'div.content-info > a > strong').text;
        //const video  = await this.querySelector(res, 'source[type="video\/mp4"]').getAttributeText("src");
        const videos = await this.querySelector(res, 'video[id="player-fluid"]').innerHTML;
        const jsonRegex = /https[^"]*/gm
        const result = videos.match(jsonRegex);
        const nomer = result.length;

        function resolusi(url) {
            return url.substring(url.length - 9, url.length - 4).replace("_", "").trim();
        }

        if (nomer == 2) {
            return {
                title: title.trim(),
                cover: cover,
                desc,
                episodes: [{
                    title: "Video",
                    urls: [{
                            name: resolusi(result[0]),
                            url: result[0],
                        },
                        {
                            name: resolusi(result[1]),
                            url: result[1],
                        }
                    ]
                }]
            }
        } else if (nomer == 3) {
            return {
                title: title.trim(),
                cover: cover,
                desc,
                episodes: [{
                    title: "Video",
                    urls: [{
                            name: resolusi(result[0]),
                            url: result[0],
                        },
                        {
                            name: resolusi(result[1]),
                            url: result[1],
                        },
                        {
                            name: resolusi(result[2]),
                            url: result[2],
                        }
                    ]
                }]
            }
        } else if (nomer == 4) {
            return {
                title: title.trim(),
                cover: cover,
                desc,
                episodes: [{
                    title: "Video",
                    urls: [{
                            name: resolusi(result[0]),
                            url: result[0],
                        },
                        {
                            name: resolusi(result[1]),
                            url: result[1],
                        },
                        {
                            name: resolusi(result[2]),
                            url: result[2],
                        },
                        {
                            name: resolusi(result[3]),
                            url: result[3],
                        }
                    ]
                }]
            }

        } else if (nomer == 5) {
            return {
                title: title.trim(),
                cover: cover,
                desc,
                episodes: [{
                    title: "Video",
                    urls: [{
                            name: resolusi(result[0]),
                            url: result[0],
                        },
                        {
                            name: resolusi(result[1]),
                            url: result[1],
                        },
                        {
                            name: resolusi(result[2]),
                            url: result[2],
                        },
                        {
                            name: resolusi(result[3]),
                            url: result[3],
                        },
                        {
                            name: resolusi(result[4]),
                            url: result[4],
                        }
                    ]
                }]
            }

        } else if (nomer == 6) {
            return {
                title: title.trim(),
                cover: cover,
                desc,
                episodes: [{
                    title: "Video",
                    urls: [{
                            name: resolusi(result[0]),
                            url: result[0],
                        },
                        {
                            name: resolusi(result[1]),
                            url: result[1],
                        },
                        {
                            name: resolusi(result[2]),
                            url: result[2],
                        },
                        {
                            name: resolusi(result[3]),
                            url: result[3],
                        },
                        {
                            name: resolusi(result[4]),
                            url: result[4],
                        },
                        {
                            name: resolusi(result[5]),
                            url: result[5],
                        }
                    ]
                }]
            }
        } else if (nomer == 7) {
            return {
                title: title.trim(),
                cover: cover,
                desc,
                episodes: [{
                    title: "Video",
                    urls: [{
                            name: resolusi(result[0]),
                            url: result[0],
                        },
                        {
                            name: resolusi(result[1]),
                            url: result[1],
                        },
                        {
                            name: resolusi(result[2]),
                            url: result[2],
                        },
                        {
                            name: resolusi(result[3]),
                            url: result[3],
                        },
                        {
                            name: resolusi(result[4]),
                            url: result[4],
                        },
                        {
                            name: resolusi(result[5]),
                            url: result[5],
                        },
                        {
                            name: resolusi(result[6]),
                            url: result[6],
                        }
                    ]
                }]
            }
        } else {
            return {
                title: title.trim(),
                cover: cover,
                desc,
                episodes: [{
                    title: "Video",
                    urls: [{
                        name: resolusi(result[0]),
                        url: result[0],
                    }]
                }]
            }
        }
    }

    async watch(url) {
        return {
            type: "mp4",
            url: url || "",
        };
    }
}
