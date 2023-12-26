// ==MiruExtension==
// @name         gimy
// @version      v0.0.2
// @author       appdevelpo
// @lang         zh
// @license      MIT
// @icon         https://gimy.su/favicon.ico
// @package      gimy.su
// @type         bangumi
// @webSite      https://gimy.su
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    isSu = false;
    async load() {
        await this.registerSetting({
            title: "網址",
            key: "source",
            type: "radio",
            description: "切換不同網址",
            defaultValue: "https://gimy.ai",
            options: {
                "https://gimy.su": "https://gimy.su",
                "https://gimy.ai": "https://gimy.ai",
              },
          });
    }
    async search(kw, page) {
        const baseUrl = await this.getSetting("source");
        const isSu = baseUrl === "https://gimy.su";
        const searchbase = (isSu)?`${baseUrl}/vodsearch`:`${baseUrl}/search`;
        const res = await this.req(`/${kw}----------${page}---.html`,searchbase);//kw:1 電影 2 電視劇 3 綜藝 4 動漫
        const bsxList = res.match(/<div class="col-md-3 col-sm-4 col-xs-3 news-box-txt-l clearfix">[\s\S]+?<\/div>/g);
        const bangumi = [];
        bsxList.forEach((element) => {
            const url = element.match(/href="(.+?)"/)[1];
            const title = element.match(/title="(.+?)"/)[1];
            const cover_match = element.match(/https/);
            const cover = cover_match ? element.match(/data-original="(.+?)"/)[1] : "https://gimy.su" + element.match(/data-original="(.+?)"/)[1];
            bangumi.push({
                title,
                url: url,
                cover,
            });
        });
        return bangumi;
    }
    async req(path,baseUrl) {
        
        return this.request(path, {
          headers: {
            "Miru-Url": baseUrl,
          },
        });
      }
    async latest(page) {
        const baseUrl = await this.getSetting("source");
        const isSu = baseUrl === "https://gimy.su";
        const searchbase = (isSu)?`${baseUrl}/vod`:`${baseUrl}/cat`;
        const p = parseInt(page / 4) + 1;
        const f = parseInt(page % 4) + 1;
        const res = await this.req(`/${f}--------${p}---.html`,searchbase);
        const bsxList = await this.querySelectorAll(res,"li.col-xs-4.col-sm-3.col-md-2");
        const bangumi = [];
        for(const element of bsxList) {
            const html = await element.content;
            const url = await this.getAttributeText(html, "a", "href");
            const title = await this.getAttributeText(html, "a", "title");
            const cover = await this.getAttributeText(html, "a", "data-original");
            const cover_match = cover.match(/https/);
            const fullCoverLink = cover_match ? cover : "https://gimy.su" + cover;
            bangumi.push({
                title,
                url,
                cover: fullCoverLink,
            });
        }
        return bangumi;
    }
    async detail(url) {
        const baseUrl = await this.getSetting("source");
        const isSu = baseUrl === "https://gimy.su";
        const res = await this.req(url,baseUrl);
        const episodes = [];
        if(isSu){
            const mainRegion = await this.querySelectorAll(res,"div.col-xs-12.col-sm-12.col-md-9");
            const mainRegionelement = mainRegion[0].content;
            const title = await this.getAttributeText(mainRegionelement, "a.video-pic", "title");
            const bsxList = await this.querySelectorAll(res, "div.clearfix.layout-box.playlist.playlist-mobile");
            // console.log(bsxList[1]);
            const patrial_cover_url = mainRegionelement.match(/url\((.+?)\)/)[1]
            const cover = patrial_cover_url.match(/https/)?patrial_cover_url:"https://gimy.su"+patrial_cover_url;
            for(const element of bsxList) {
                // const eps = []
                const html =  element.content;
                const select = await this.querySelectorAll(html, "a");;
                const mirror = await select[0].text;
                const selectList = await this.querySelectorAll(html, "a:not([style])");
                const urls = [];
                for(const e of selectList){
                    const el = e.content;
                    const name = await e.text;
                    // console.log(title);
                    const url = await this.getAttributeText(el, "a", "href");
                    // console.log(url);
                    urls.push({
                        name,
                        url,
                    });
                }
                
                episodes.push({
                    title: mirror || "None",
                    urls
                });
            }
            return {
                title: title || "Unknown Title",
                cover: cover || "",
                // desc: desc || "No description available.",
                episodes
            };
            // console.log(episodes);
            
        }
        const mainRegion = await this.querySelectorAll(res,"div.col-xs-12.col-sm-12.col-md-9");
            const mainRegionelement = mainRegion[0].content;
            const title = await this.getAttributeText(mainRegionelement, "a.video-pic", "title");
            const bsxList = await this.querySelectorAll(res, "div.clearfix.layout-box.playlist.playlist-mobile");
            // console.log(bsxList[1]);
            const patrial_cover_url = mainRegionelement.match(/url\((.+?)\)/)[1]
            const cover = patrial_cover_url.match(/https/)?patrial_cover_url:"https://gimy.su"+patrial_cover_url;
            for(const element of bsxList) {
                // const eps = []
                const html =  element.content;
                const select = await this.querySelectorAll(html, "div[style]");;
                const mirror = await select[0].text;
                // console.log(mirror);
                const selectList = await this.querySelectorAll(html, "a:not([style])");
                const urls = [];
                for(const e of selectList){
                    const el = e.content;
                    const name = await e.text;
                    const url = await this.getAttributeText(el, "a", "href");
                    urls.push({
                        name,
                        url,
                    });
                }
                
                episodes.push({
                    title: mirror || "None",
                    urls
                });
            }
            return {
                title: title || "Unknown Title",
                cover: cover || "",
                // desc: desc || "No description available.",
                episodes
            };
            // console.log(episodes);
            
        
        
        
    }

    async watch(url) {
        const baseUrl = await this.getSetting("source");
        const isSu = baseUrl === "https://gimy.su";
        if(!isSu){
            var fullLink;
            var base64EncodeChars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var base64DecodeChars=new Array(-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,-1,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,-1,-1,-1,-1,-1);function base64encode(str){var out,i,len;var c1,c2,c3;len=str.length;i=0;out="";while(i<len){c1=str.charCodeAt(i++)&0xff;if(i==len){out+=base64EncodeChars.charAt(c1>>2);out+=base64EncodeChars.charAt((c1&0x3)<<4);out+="==";break}c2=str.charCodeAt(i++);if(i==len){out+=base64EncodeChars.charAt(c1>>2);out+=base64EncodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));out+=base64EncodeChars.charAt((c2&0xF)<<2);out+="=";break}c3=str.charCodeAt(i++);out+=base64EncodeChars.charAt(c1>>2);out+=base64EncodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));out+=base64EncodeChars.charAt(((c2&0xF)<<2)|((c3&0xC0)>>6));out+=base64EncodeChars.charAt(c3&0x3F)}return out}function base64decode(str){var c1,c2,c3,c4;var i,len,out;len=str.length;i=0;out="";while(i<len){do{c1=base64DecodeChars[str.charCodeAt(i++)&0xff]}while(i<len&&c1==-1);if(c1==-1)break;do{c2=base64DecodeChars[str.charCodeAt(i++)&0xff]}while(i<len&&c2==-1);if(c2==-1)break;out+=String.fromCharCode((c1<<2)|((c2&0x30)>>4));do{c3=str.charCodeAt(i++)&0xff;if(c3==61)return out;c3=base64DecodeChars[c3]}while(i<len&&c3==-1);if(c3==-1)break;out+=String.fromCharCode(((c2&0XF)<<4)|((c3&0x3C)>>2));do{c4=str.charCodeAt(i++)&0xff;if(c4==61)return out;c4=base64DecodeChars[c4]}while(i<len&&c4==-1);if(c4==-1)break;out+=String.fromCharCode(((c3&0x03)<<6)|c4)}return out}function utf16to8(str){var out,i,len,c;out="";len=str.length;for(i=0;i<len;i++){c=str.charCodeAt(i);if((c>=0x0001)&&(c<=0x007F)){out+=str.charAt(i)}else if(c>0x07FF){out+=String.fromCharCode(0xE0|((c>>12)&0x0F));out+=String.fromCharCode(0x80|((c>>6)&0x3F));out+=String.fromCharCode(0x80|((c>>0)&0x3F))}else{out+=String.fromCharCode(0xC0|((c>>6)&0x1F));out+=String.fromCharCode(0x80|((c>>0)&0x3F))}}return out}function utf8to16(str){var out,i,len,c;var char2,char3;out="";len=str.length;i=0;while(i<len){c=str.charCodeAt(i++);switch(c>>4){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:out+=str.charAt(i-1);break;case 12:case 13:char2=str.charCodeAt(i++);out+=String.fromCharCode(((c&0x1F)<<6)|(char2&0x3F));break;case 14:char2=str.charCodeAt(i++);char3=str.charCodeAt(i++);out+=String.fromCharCode(((c&0x0F)<<12)|((char2&0x3F)<<6)|((char3&0x3F)<<0));break}}return out}
            const res = await this.req(url,baseUrl);
            const vidInfo = res.match(/player_data=(.+?)</)[1].replace(/\//g, '/');
            console.log(vidInfo);
            const json = JSON.parse(vidInfo);
            console.log(json);
            switch(json.encrypt){
                case 0:
                    fullLink=json.url;
                    break;
                case 1:
                    fullLink=unescape(json.url);
                case 2:
                    fullLink=unescape(base64decode(json.url));
                default:
                    fullLink=json.url;
                    break;
            }
            console.log(fullLink);
            var jctype = 'normal';

            if( fullLink.indexOf('renrenmi') != -1 ) {
                jctype = 'renrenmi';
            }

            if( fullLink.indexOf('LT-') != -1 ) {
                jctype = 'miaoparty';
            }

            if( fullLink.indexOf('tucheng') != -1 ) {
                jctype = 'rongxing';
            }

            if( fullLink.indexOf('TUCHENG') != -1 ) {
                jctype = 'rongxing';
            }

            if( fullLink.indexOf('Feiyun') != -1 ) {
                jctype = 'Feiyun';
            }

            if( fullLink.indexOf('kemi-') != -1 ) {
                jctype = 'kemi';
            }

            if( fullLink.indexOf('znjson-') != -1 ) {
                jctype = 'znjson';
            }
            const helperUrl = `https://gimy.ai/jcplayer/?url=${fullLink}&jctype=${jctype}`;
            const helpRes = await this.request("",{
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
                    "Referer": baseUrl+url,
                    "Miru-Url": helperUrl
                  }
            });
            // console.log(helpRes);
            const videoUrl = helpRes.match(/playurl= '(.+?)'/)[1];
            console.log(videoUrl);
            return {
                type: "hls",
                url: videoUrl || null,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
                    "Referer": baseUrl+url
                  }
            };
        }
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

