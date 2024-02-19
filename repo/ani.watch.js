// ==MiruExtension==
// @name         AniWatch
// @version      v0.0.6
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://aniwatch.to/images/android-chrome-512x512.png
// @package      ani.watch
// @type         bangumi
// @webSite      https://proxy.techzbots1.workers.dev/?u=https://aniwatch.to
// ==/MiruExtension==

export default class extends Extension {
  Generes = {}
  subs =[]
  async createFilter(filter) {
    if(filter){
      console.log(filter)
    }
    const mainbar = {
      title: "",
      max: 1,
      min: 0,
      default: "/recently-updated",
      options: {
        "/recently-updated":"Recently Updated",
        "/recently-added":"Recently Added",
        "/top-airing":"Top Airing",
        "/most-popular":"Most Popular",
        "/most-favorite":"Most Favorite",
        "/completed":"Completed",
      },
    }
    const genres={
      title: "Generes",
      max: 1,
      min:0,
      default: "",
      options: this.Generes
    }
    return {
      mainbar,genres
    }
  }
  async load() {
    this.registerSetting({
      title: "Zoro API",
      key: "zoro",
      type: "input",
      description: "Zoro Api Url",
      defaultValue: "https://entertainment-bunny-yousee.koyeb.app/anime/zoro",
    });
  }
  async get_filter(res){
    const filter_area = res.match(/<ul class="ulclear color-list sb-genre-list sb-genre-less"[^;]+?<\/ul>/)[0]
    const filter_list = filter_area.match(/<li[^;]+?<\/li>/g)
    for(const element of filter_list){
      const filt_link = element.match(/href="(.+?)"/)[1]
      const name = element.match(/title="(.+?)"/)[1]
      this.Generes[filt_link]=name
    }
  }
  async latest(page) {
    const res = await this.request(`/recently-updated?page=${page}`,);
    const bsxList = await this.querySelectorAll(res, "div.flw-item");
    await this.get_filter(res);
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      //console.log(title+cover+url)
      novel.push({
        title,
        url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const episodes = [];
    const res = await this.request("",{
        headers: {
            "Miru-Url": `https://entertainment-bunny-yousee.koyeb.app/anime/zoro/info?id=${url}`,
        }
    });
    const server = await this.get_server(res.episodes[0].url);
    for(const sub_element of server[0]){
      for(const ser of server[1]){
          episodes.push({
              title: ser+ "-" + sub_element ,
              urls: res.episodes.map((item) => ({
                name: item.title,
                url: `${item.url};${sub_element};${ser}`,
              }))
          })
      }
  }
  return {
    title: res.title,
    cover: res.image,
    desc: res.description,
    episodes
  }
  }

  async search(kw, page,filter) {
    let url = `/search?keyword=${kw}&page=${page}`
    if (!kw){
      
      if (filter.genres[0].length===0){
        url = filter.mainbar[0]+`?page=${page}`
      }else{
        url = filter.genres[0]+`?page=${page}`
      }

    }
    const res = await this.request(url);
    const bsxList = await this.querySelectorAll(res, "div.flw-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "h3").text;
      const cover = await this.querySelector(html, "img").getAttributeText("data-src");
      //console.log(title+cover+url)
      novel.push({
        title,
        url,
        cover,
      });
    }
    return novel;
  }

  async watch(url) {
    const m3u8_link = await this.Aniwatch(url);
    console.log(m3u8_link);
    console.log(this.subs)
    return {
      type:"hls",
      url:m3u8_link,//auto
      subtitles: JSON.parse(JSON.stringify(this.subs))

  }
  }
async Aniwatch(url){
  const option = url.split(';')
  const language  = option[1]
  const server_name = option[2]
  const ep_id  = url.match(/ep=(\d+)/)[1]
  const res = await this.request(`/ajax/v2/episode/servers?episodeId=${ep_id}`);
  const res_html = JSON.parse(JSON.stringify(res)).html
  const playlist = res_html.match(/<div class="item server-item"[\s\S]+?<\/div>/g)
  for(const element of playlist){
    if(element.includes(language)&&element.includes(server_name)){
      const server_id = element.match(/data-id="(\d+)"/)[1]
      const embed_res = await this.request(`/ajax/v2/episode/sources?id=${server_id}`)
      const embed_res_data = JSON.parse(JSON.stringify(embed_res))
      const embed_id = embed_res_data.link.match(/\/(\w+)\?/)[1]
      return await this.rabbit_stream(embed_id)
  }
  }
  

}
async rabbit_stream(embed_id,referer){

    
  const encrypted_res = await this.request("", {
      headers: {
          "Miru-Url": `https://megacloud.tv/embed-2/ajax/e-1/getSources?id=${embed_id}`,
          "X-Requested-With": "XMLHttpRequest",
          "Referer":`https://megacloud.tv/embed-2/e-1/${embed_id}?k=1`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
      }
  });
  const encrypted_res_data = JSON.parse(JSON.stringify(encrypted_res));
  
  encrypted_res_data.tracks.forEach(element => {
    if(element.label){
      this.subs.push({
        title:element.label,
        url:element.file
      })
    }
  });
  if (encrypted_res_data.encrypted){
    const key =await this.start(encrypted_res_data.sources);
    console.log(key)
    var decryptedVal = CryptoJS.AES.decrypt(key[1], key[0]).toString(CryptoJS.enc.Utf8);}
  else{
    decryptedVal = JSON.stringify(encrypted_res_data.sources[0])
  }
  const m3u8_link = decryptedVal.match(/https:\/\/.+m3u8/)[0]
  return m3u8_link
}
async get_server(url){
  const ep_id  = url.match(/ep=(\d+)/)[1]
  const res = await this.request(`/ajax/v2/episode/servers?episodeId=${ep_id}`, {
    });
  const res_html = JSON.parse(JSON.stringify(res)).html
  const playlist = res_html.match(/<div class="item server-item"[\s\S]+?<\/div>/g)
  const episode_res_html = JSON.parse(JSON.stringify(res)).html;
  const sub_dub = (episode_res_html.includes("sub") ? ["sub"] : []).concat(episode_res_html.includes("dub") ? ['dub'] : []);
  const available_servers = (episode_res_html.includes("Vidstreaming") ? ['Vidstreaming'] : []).concat(episode_res_html.includes("MegaCloud") ? ['MegaCloud'] : []);
  return [sub_dub,available_servers]
}
async get_key(cipher){
    const res = await this.request("",{
        headers:{
            "Miru-Url": "https://megacloud.tv/js/player/a/prod/e1-player.min.js?v=1699711377",
        }
    })
    const filt = res.match(/case 0x\d{1,2}:\w{1,2}=\w{1,2},\w{1,2}=\w{1,2}/g).map(element => {
        return element.match(/=(\w{1,2})/g).map(element => {
            return element.substring(1)
        })
    })
    const filt_area = res.match(/\w{1,2}=0x\w{1,2},\w{1,2}=0x\w{1,2},\w{1,2}=0x\w{1,2},\w{1,2}=0x\w{1,2},.+?;/)[0]
    const objectFromVars = filt_area.split(",").reduce((acc, pair) => {
        const [key, value] = pair.split("=");
        acc[key] = parseInt(value);
        return acc;
      }, {});
      const P = filt.length
      let C = cipher
      let I = ''
  , C9 = C
  , CC = 0x0;
  
  for (let CW = 0x0; CW < P; CW++) {
    let CR, CJ;
    switch (CW) {
    case 0x0:
        CR = objectFromVars[filt[0][0]],
        CJ = objectFromVars[filt[0][1]];
        break;
    case 0x1:
        CR = objectFromVars[filt[1][0]],
        CJ = objectFromVars[filt[1][1]];
        break;
    case 0x2:
        CR = objectFromVars[filt[2][0]],
        CJ = objectFromVars[filt[2][1]];
        break;
    case 0x3:
        CR = objectFromVars[filt[3][0]],
        CJ = objectFromVars[filt[3][1]];
        break;
    case 0x4:
        CR = objectFromVars[filt[4][0]],
        CJ = objectFromVars[filt[4][1]];
        break;
    case 0x5:
        CR = objectFromVars[filt[5][0]],
        CJ = objectFromVars[filt[5][1]];
        break;
    case 0x6:
        CR = objectFromVars[filt[6][0]],
        CJ = objectFromVars[filt[6][1]];
        break;
    case 0x7:
        CR = objectFromVars[filt[7][0]],
        CJ = objectFromVars[filt[7][1]];
        break;
    case 0x8:
        CR = objectFromVars[filt[8][0]],
        CJ = objectFromVars[filt[8][1]];
    }
    var CI = CR + CC
      , CN = CI + CJ;
    I += C.slice(CI, CN),
    C9 = C9.replace(C.substring(CI, CN), ''),
    CC += CJ;
    }
    return [I, C9] 
    
  }
  async  start(cipher){
    const key = await this.get_key(cipher)
    return key
    }
  }
