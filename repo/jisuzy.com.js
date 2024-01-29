// ==MiruExtension==
// @name         极速资源
// @version      v0.0.1
// @author       SendHX
// @lang         zh-cn
// @license      MIT
// @icon         https://www.jisuzy.com/template/default/images/site_logo.png
// @package      jisuzy.com
// @type         bangumi
// @webSite      https://jszyapi.com/api.php/provide/vod/?ac=videolist
// @nsfw         false
// ==/MiruExtension==
//age.tv、agefans.com
export default class extends Extension {
    async search(kw, page) {
        const encode_kw = encodeURI(kw)
        const res = await this.request(`&wd=${encode_kw}&page=${page}`,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36',
            }});
        const json_res = JSON.parse(JSON.stringify(res))

        const bangumi = json_res.list.map((element) => {
            return {
                title: element.vod_name,
                url: element.vod_id.toString(),
                cover: element.vod_pic,
                update: element.vod_remarks
            }
        })
        return bangumi
    }
    async req(url){
        const res  = await this.request("",{
            headers:{
                "Miru-Url":url,
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36"
            }
        });
        return res
    }
    async latest(page) {
        const res = await this.request(`&page=${page}`,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36',
            }})
        const json_res = JSON.parse(JSON.stringify(res))
        // 
        const bangumi = json_res.list.map((element) => {
            return {
                title: element.vod_name,
                url: element.vod_id.toString(),
                cover: element.vod_pic,
                update: element.vod_remarks
            }
        })
        // 
        return bangumi
    }

    async detail(url) {
        const res = await this.request(`&ids=${url}`,{
            headers:{
                //"Referer":"https://www.jisuzy.com/",
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36"
            }
        });
        const json_res = JSON.parse(JSON.stringify(res))

        const episodes = [];
        const oneArr = json_res.list[0].vod_play_from.split('$$$')
        for(var i = 0;i<oneArr.length;i++){
            var key = oneArr[i]
            if (!key.includes("m3u8")){
                continue
            }
            var twoArr = json_res.list[0].vod_play_url.split('$$$')[i].split('#')
            const urlArr = []
            for(var j = 0;j<twoArr.length;j++){
                const vod_serial = twoArr[j].split('$')[0]
                const vod_url = twoArr[j].split('$')[1]
                urlArr.push({
                    name:vod_serial,
                    url:vod_url
                })
            }
            episodes.push({
                title: key,
                urls: urlArr
            })
        }
        const detail_res = {
            title: `${json_res.list[0].vod_name}/${json_res.list[0].vod_sub}`,
            cover: json_res.list[0].vod_pic,
            desc:json_res.list[0].vod_content,
            episodes
        }
        return detail_res
    }

    async watch(url) {
        
        const res = await this.request("",{
            headers:{
                'Miru-Url':`https://43.240.74.134:8443/m3u8/?url=${url}`,
                //"Referer":"https://1080p.jszyplay.com/",
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36"
            }
        });
        const video_url = res.match(/Vurl = '(.+?)'/)[1];
        console.log
        return {
            type: "hls",
            url: video_url || null,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
              }
        };
    }
}

