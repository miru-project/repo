// ==MiruExtension==
// @name         AGE动漫
// @version      v0.0.1
// @author       appdevelpo
// @lang         zh-cn
// @license      MIT
// @icon         https://m.agedm.org/favicon.ico
// @package      agedm.org
// @type         bangumi
// @webSite      https://api.agedm.org
// @nsfw         false
// ==/MiruExtension==
//age.tv、agefans.com
export default class extends Extension {
    async search(kw, page) {
        const encode_kw = encodeURI(kw)
        const res = await this.request(`/v2/search?query=${encode_kw}&page=${page}`,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36',
            }});
        const json_res = JSON.parse(JSON.stringify(res))
        
        const bangumi = json_res.data.videos.map((element) => {
            return {
                title: element.name,
                url: element.id.toString(),
                cover: element.cover,
                update: element.uptodate
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
        const res = await this.request(`/v2/catalog?genre=all&label=all&letter=all&order=time&region=all&resource=all&season=all&status=all&year=all&page=${page}&size=10`,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36',
            }})
        const json_res = JSON.parse(JSON.stringify(res))
        // 
        const bangumi = json_res.videos.map((element) => {
            return {
                title: element.name,
                url: element.id.toString(),
                cover: element.cover,
                update: element.uptodate
            }
        })
        // 
        return bangumi
    }

    async detail(url) {
        const res = await this.request(`/v2/detail/${url}`,{
            headers:{
                "Referer":"https://m.agedm.org/",
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36"
            }
        });
        const json_res = JSON.parse(JSON.stringify(res))
        
        const episodes = [];
        for (const [key, value] of Object.entries(json_res.video.playlists)) {
            if (!key.includes("m3u8")){
                continue
            }
            
            episodes.push({
                title: json_res.player_label_arr[key],
                urls: value.map((item) => {
                    return{
                        name: item[0],
                        url: json_res.player_jx.zj + item[1]
                    }
                })
            })
          }
        
        const detail_res = {
            title: `${json_res.video.name}/${json_res.video.name_other}`,
            cover: `https://cdn.aqdstatic.com:966/age/${url}.jpg`,
            desc:json_res.video.intro,
            episodes
        }
        
        return detail_res
    }

    async watch(url) {
        console.log(url)
        const res = await this.request("",{
            headers:{
                'Miru-Url':url,
                "Referer":"https://m.agedm.org/",
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36"
            }
        });
        
        const video_url = res.match(/Vurl = '(.+?)'/)[1];
        return {
            type: "hls",
            url: video_url || null,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
              }
        };
    }
}

