// ==MiruExtension==
// @name         风车动漫
// @version      v0.0.1
// @author       Monster
// @lang         zh-cn
// @license      MIT
// @package      windmill
// @type         bangumi
// @icon         https://www.dm530w.org/tpsf/fc_pic/favicon.ico
// @webSite      https://www.dm530w.org
// ==/MiruExtension==



export default class extends Extension {


    async load() {
        this.registerSetting({
          title: "风车动漫 API",
          key: "windmill",
          type: "input",
          description: "风车动漫的url",
          defaultValue: "https://www.dm530w.org",
        });
    }
    async latest(page) {


        let keyword = `/list/?region=%E6%97%A5%E6%9C%AC&pagesize=24&pageindex=${page-1}`;
        let hh = {
            headers:{
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
            "Referer":await this.getSetting("windmill")
            }
        }

        const res = await this.request(keyword,hh);
       
        const ul = await this.queryXPath(res,'//div[@class="lpic"]/ul/li').allHTML;
        const bangumi=[];
        for(let i = 0;i <ul.length;i++){
       
            let title=await this.queryXPath(ul[i],'//h2/a').text;
            let cover=await this.queryXPath(ul[i],'//a/img/@src').attr;
            cover = cover.includes("https:") ? cover : "https:" + cover;
            let url=await this.queryXPath(ul[i],'//h2/a/@href').attr;
            // console.log(cover)

            bangumi.push({
                title,
                cover,
                url
            })
        }
        return bangumi;



    }
  
    async search(kw, page) {
        let keyword = `/s_all?kw=${encodeURI(kw)}&pagesize=24&pageindex=${page-1}`;
       
        let hh = {
            headers:{
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
            "Referer":await this.getSetting("windmill")
            },
            method:"GET",

        }

        const res = await this.request(keyword,hh);
       

        
        const ul = await this.queryXPath(res,'//div[@class="lpic"]/ul/li').allHTML;
        const bangumi=[];
        for(let i = 0;i <ul.length;i++){
       
            let title=await this.queryXPath(ul[i],'//h2/a').text;
            let cover=await this.queryXPath(ul[i],'//a/img/@src').attr;
            cover = cover.includes("https:") ? cover : "https:" + cover;
            let url=await this.queryXPath(ul[i],'//h2/a/@href').attr;


            bangumi.push({
                title,
                cover,
                url
            })
        }
        return bangumi;
    }

    async detail(url) {

        const res = await this.request(`${url}`);
        const title = await this.queryXPath(res,'//div[@class="rate r"]/h1').text;
        const cover = await this.queryXPath(res,'//img[@referrerpolicy="no-referrer"]/@src').attr;
        const desc = await this.queryXPath(res,'//div[@class="info"]').text;
        const div = await this.queryXPath(res,'//div[@id="main0"]/div[@class="movurl"]').allHTML;
        const episodes = [];
        for(let i= 0;i<div.length;i++){
            let ul = await this.queryXPath(div[i],'//ul/li').allHTML;

            if(ul==""){
                continue;
            }else{
                    let chapter = [];
                    for(let i = 0;i <ul.length;i++){

                        chapter.push({
                            name: await this.queryXPath(ul[i],'//a').text,
                            url:await this.queryXPath(ul[i],'//a/@href').attr
                        })
                    }
                    episodes.push({
                        title:`线路${i}`,
                        urls:chapter
                    });

                }

        }
        // console.log(episodes)

        return {
            title,
            cover,
            desc,
            episodes
            };
    }
  
    async watch(url) {
        // console.log(url);
        const url_text = url.replace(/^.+?\/(\d+)-(\d+)-(\d+).*$/, '/playurl?aid=$1&playindex=$2&epindex=$3&r=' + Math.random());
        // console.log(url_text)
        let hh = {
            headers:{
                "authority":await this.getSetting("windmill"),
                "accept":"*/*",
                "accept-language":"zh-CN,zh;q=0.9",
                "cache-control":"no-cache",
                "referer":await this.getSetting("windmill")+url,
                "sec-ch-ua":"\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
                "sec-ch-ua-mobile":"?0",
                "sec-ch-ua-platform":"\"Windows\"",
                "sec-fetch-dest":"empty",
                "sec-fetch-mode":"cors",
                "sec-fetch-site":"same-origin",
                "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
                "x-requested-with":"XMLHttpRequest"
            }
        }
        let m3u8_res = await this.request(`${url_text}`,hh);
        
        for (let i = 0; i < 6; i++) {
            m3u8_res = await this.request(`${url_text}`,hh);
            if (m3u8_res.includes("ipchk")) {
                
                continue;
            }else{
                break;
            }
        }
        // console.log(m3u8_res);
        const m3u8_play_url=JSON.parse(this.decode(m3u8_res));
        // console.log(unescape(m3u8_play_url.vurl))
        
        return {
            type: "hls",
            url: unescape(m3u8_play_url.vurl)
          }
    }

    decode(_0x1d70f8) {
            if (_0x1d70f8.indexOf('{') < 0) {
                var _0x1020e5 = '';
                const _0x5af0f3 = 1561;
                const _0x3218fa = _0x1d70f8.length;
                for (var _0x14508c = 0; _0x14508c < _0x3218fa; _0x14508c += 2) {
                    var _0x2b5229 = parseInt(_0x1d70f8[_0x14508c] + _0x1d70f8[_0x14508c + 1], 16);
                    _0x2b5229 = (_0x2b5229 + 1048576 - _0x5af0f3 - (_0x3218fa / 2 - 1 - _0x14508c / 2)) % 256;
                    _0x1020e5 = String.fromCharCode(_0x2b5229) + _0x1020e5;
                }
                _0x1d70f8 = _0x1020e5;
            }
            return _0x1d70f8;
        }

}
  
  