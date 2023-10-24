// ==MiruExtension==
// @name         yanaifei
// @version      v0.0.1
// @author       appdevelpo
// @lang         zh-cn
// @license      MIT
// @icon         https://yanaifei.tv/upload/mxprocms/20230331-1/1362b3640334c876948d91690f850f80.png
// @package      yanaifei.tv
// @type         bangumi
// @webSite      https://yanaifei.tv
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        const cookie_string = await (this.getSetting("cookie"));
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0",
            // "Host": "yanaifei.tv",
            // "Connection": "keep-alive",
            // "Upgrade-Insecure-Requests": "1",
            // "Sec-Fetch-Dest": "document",
            // "Sec-Fetch-Mode": "navigate",
            // "Sec-Fetch-Site": "same-origin",
            // "Accept-Encoding":"gzip, deflate, br",
            // "Pragma": "no-cache",
            // "TE": "trailers",
            // "DNT": "1",
        }
        if (cookie_string != "") {
            headers.Cookie = cookie_string
        }
        return this.request(url, {
            // method: "POST",
            headers: headers
        })
    }
    async load() {
        await this.registerSetting({
            title: "搜尋喜好",
            key: "type",
            type: "radio",
            description: "不影響輸入關鍵字後的搜索結果",
            defaultValue: "mixed",
            options: {
                "電影": "1",
                "劇集": "2",
                "綜藝": "3",
                "動漫": "4",
                "更多": "5",
                "混和": "mixed",
            },
        });
        await this.registerSetting({
            title: "Cookie",
            key: "cookie",
            type: "input",
            description: "如果嘗試webwiew無法正常使用,請在此輸入cookie",
            defaultValue: "",
        })
        // await this.registerSetting({
        //     title: "更換域名",
        //     key: "kw",
        //     type: "radio",
        //     description: "預設為https://yanaifei.tv",
        //     defaultValue: "https://yanaifei.tv",
        //     options: {
        //         "YaNaiFei.tv":"https://yanaifei.tv",
        //         "YaNaiFei.net":"https://yanaifei.net",
        //         "YaNetflix.one":"https://yanaifei.one",
        //         "YaNetflix.me":"https://yanaifei.me",
        //         "YaNaiFei.com":"https://yanaifei.com",
        //     }

        // })
    }
    async search(kw, page) {
        try {
            const url = `/vod/search/${kw}----------${page}---.html`
            const res = await this.req(url);
            // console.log(res);
            const bangumi = [];
            const item_list = res.match(/<div class="module-card-item module-item">[\s\S]+?<div class="module-card-item-footer">[\s\S]+?<\/div>/g);
            // console.log(res);
            item_list.forEach((element) => {
                const title = element.match(/<strong>(.+?)<\/strong>/)[1];
                const cover = element.match(/data-original="(.+?)"/)[1];
                const url = element.match(/href="(.+?)"/)[1];
                bangumi.push({
                    title,
                    url: url,
                    cover,
                });

            })
            return bangumi;


        } catch (e) {
            // console.log(e);
            const bangumi = [{
                title: "cloudfare",
                url: "/label/new.html",
                cover: null
            }];
            return bangumi;
        }
    }
    async latest(page) {
        try {
            const type = await (this.getSetting("type"));
            if (type == "mixed") {
                var p = parseInt(page / 5) + 1;
                var f = parseInt(page % 5) + 1;
            } else {
                var p = page;
                var f = type;
            }
            const url = `/vod/show/${f}--------${p}---.html`
            const res = await this.req(url);
            // console.log(res);
            const bangumi = [];
            const item_list = res.match(/a href.+?class="module-poster-item module-item[\s\S]+?<i class/g);
            // console.log(res);
            item_list.forEach((element) => {
                const title = element.match(/title="(.+?)"/)[1];
                const cover = element.match(/data-original="(.+?)"/)[1];
                const url = element.match(/href="(.+?)"/)[1];
                bangumi.push({
                    title,
                    url: url,
                    cover,
                });

            })
            return bangumi;


        } catch (e) {
            // console.log(e);
            const bangumi = [{
                title: "cloudfare",
                url: "/label/new.html",
                cover: null
            }];
            return bangumi;
        }

    }

    async detail(url) {
        try {
            const res = await this.req(url);
            // console.log(res);
            const eps_area = res.match(/选择播放源[\s\S]+?<i class="icon-play"><\/i>/);
            const eplist_title = res.match(/<span>\w+<\/span><small>\d+<\/small><\/div>/g);
            const eplists = res.match(/module-play-list-content  module-play-list-base[\s\S]+?<\/div>/g);
            // console.log(eplist_title);
            // console.log(eplists);
            const episode = [];
            const desc = res.match(/<p>(.+?)<\/p>/)[1];
            const cover = res.match(/data-original="(.+?)"/)[1];
            const title = res.match(/<h1>(.+?)<\/h1>/)[1]
            eplists.forEach((element,index) => {
                const title = eplist_title[index].match(/>(\w+)</)[1];


                const eplist = element.match(/<a.+?<\/a>/g);
                const urls = eplist.map(index => {
                    return {
                        name: index.match(/<span>(.+?)<\/span>/)[1],
                        url: index.match(/href="(.+?)"/)[1]
                    }
                }) 
                // console.log(urls);
                episode.push({
                    title,
                    urls
                })
            })
            return {
                title: title || "Unknown Title",
                cover: cover || "",
                desc: desc || "No description available.",
                episodes: episode
            };

        } catch (e) {
            return {
                title: "Cloudflare",
                cover: "",
                // desc: "Please use webview to enter the website then close the window.\r\n請用webview進入網站後再關閉視窗(目前webview可能沒用，必須手動輸入cookie)",
                desc:"cloudfare",
                episodes: []
            };
            
        }
    }

    async watch(url) {
        const res = await this.request(url);
        const video_url = res.match(/https:.+?\.m3u8/)[0].replace(/\//g, "");
        return {
            type: "hls",
            url: video_url || null,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
            }
        };
    }
}

