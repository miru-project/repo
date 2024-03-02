// ==MiruExtension==
// @name         MangaLife
// @version      v0.0.1
// @author       appdevelpo
// @lang         en
// @license      MIT
// @type         manga
// @icon         https://www.manga4life.com/media/favicon.png
// @package      manga4life.com
// @webSite      https://www.manga4life.com
// @nsfw         false
// ==/MiruExtension==

export default class Mangafx extends Extension {
  filter_jsons = {};
  async getlatest(){
    const res = await this.request("")
    // console.log(res.data)
    const latestJSON = JSON.parse(res.match(/LatestJSON = (\[.+?\}\])/)[1])
    // console.log(latestJSON)
    return latestJSON

}
  async latest(page) {
    await this.get_filter();
    const res = await this.getlatest();
    return res.map((element) => {
        return {
            title: element.SeriesName,
            url: element.IndexName,
            cover:`https://temp.compsci88.com/cover/${element.IndexName}.jpg`,
            update: element.Date
        }
    })
  }
  async get_filter(){
    // const filter_kw = {"ScanStatus":"&status=","PublishStatus":"&pstatus=","Type":"&type=","Genre":"&genre="}
    const filters = {
        // "ScanStatus" : ['Cancelled','Complete','Discontinued','Hiatus','Ongoing'],
        // "PublishStatus" : ['Cancelled','Complete','Discontinued','Hiatus','Ongoing'],
        "Type" : ['Doujinshi','Manga','Manhua','Manhwa','OEL','One-shot'],
        "Genre" : ['Action','Adult','Adventure','Comedy','Doujinshi','Drama','Ecchi','Fantasy','Gender Bender','Harem','Hentai','Historical','Horror','Isekai','Josei','Lolicon','Martial Arts','Mature','Mecha','Mystery','Psychological','Psychological  Supernatural  Tragedy','Romance','Romance  Seinen  Slice of Life','School Life','School Life  Shounen','Sci-fi','Seinen','Shotacon','Shoujo','Shoujo Ai','Shounen','Shounen Ai','Shounen Ai  Yaoi','Slice of Life','Smut','Sports','Supernatural','Tragedy','Yaoi','Yuri']
    };
    for (const [key, value] of Object.entries(filters)){
        const options = {}
        value.forEach((item) => {
            options[item] = item
        })
        const filter_full = {
            title: key,
            max: 1,
            min: 1,
            default: "",
            options: options,
          };
        this.filter_jsons[key] = filter_full;
    }
    // console.log(this.filter_jsons)
  }
  async createFilter(filter) {
    if(filter){
        console.log(filter)
    }
    // console.log(this.filter_jsons);
    return this.filter_jsons
  }
  async search(kw, page, filter) {
    kw = kw.toLowerCase().replace(/\b\w/g, function(char) { return char.toUpperCase(); });
    const search_list = [kw];
    if (filter === null) {
      filter = {};
    }
    for (const [key, value] of Object.entries(filter)){
        // url+=`${filter[key][0]}`
        if(filter[key][0]){
            search_list.push(`\(\?\=\.\*${filter[key][0]}\)`)}
    }
    const search_str = search_list.join("")
    console.log(search_str)
    const res = await this.request("/search/?sort=v&desc=true");
    const Directory = (res.match(/vm\.Directory = (\[.+?\}\])/)[1]).split("},{")
    const filter_result = []
    Directory.forEach((element) => {
        const Dirmatch = element.match(RegExp(search_str))
        if(Dirmatch){
            filter_result.push(element)
        }
    })
    if (filter_result.length === 0) {
      return [];
    }
    let filter_output = filter_result.join("},{")
    filter_output = filter_output[0]==="["?filter_output:"[{"+filter_output
    filter_output = filter_output[filter_output.length-1]==="]"?filter_output:filter_output+"}]"
    return JSON.parse(filter_output).map((element) => {
        return {
            title: element.i,
            url: element.i,
            cover:`https://temp.compsci88.com/cover/${element.i}.jpg`,
            update: element.ls.toString()
        }
    })

  }

  async detail(url) {
    const res = await this.request(`/manga/${url}`);
    // console.log(res)
    const chapters = JSON.parse(res.match(/Chapters = (\[.+?\}\])/)[1])
    return{
        title:res.match(/<h1>(.+?)<\/h1>/)[1],
        cover:`https://temp.compsci88.com/cover/${url}.jpg`,
        desc:res.match(/top-5 Content">(.+)<\/div>/)[1],
        episodes:[{
            title:"",
            urls:chapters.map((element) => {
                const chapId=(parseInt(element.Chapter)-100000)/10
              return {
                name: chapId.toString(),
                url: `/read-online/${url}-chapter-${chapId}.html`,
              }
            })
        }]

    }

  }
  async  get_manga(url){
    const res = await this.request(url)
    const CurChapter = JSON.parse(res.match(/vm\.CurChapter = (\{.+?\})/)[1])
    // vm.CurPathName = "scans-hot.leanbox.us";
    const ChapterImage = function(ChapterString){
        var Chapter = ChapterString.slice(1,-1);
        var Odd = ChapterString[ChapterString.length -1];
        if(Odd == 0){
            return Chapter;
        }else{
            return Chapter + "." + Odd;
        }
    };
    const PageImage = function(PageString){
        var s = "000" + PageString;
        return s.substr(s.length - 3);
    }
    // const Page = "1"
    const urls = []
    const CurPathName = res.match(/vm\.CurPathName = "(.+?)"/)[1]
    const manga_name = res.match(/ng-src=".+\/manga\/(.+?)\//)[1]
    for(let i =1;i<=parseInt(CurChapter.Page);i++){
        urls.push(`https://${CurPathName}/manga/${manga_name}/${CurChapter.Directory == '' ? '' : CurChapter.Directory+'/'}${ChapterImage(CurChapter.Chapter)}-${PageImage(i)}.png`)
    }
    
    return urls
}

  async watch(url) {
    const urls = await this.get_manga(url)
    return {
      urls,
    }
  }
}

