// ==MiruExtension==
// @name         rawkuma
// @version      v0.0.2
// @author       appdevelpo
// @lang         jp
// @license      MIT
// @type         manga
// @icon         https://rawkuma.com/wp-content/uploads/2020/01/cropped-Yuna.Kuma_.Kuma_.Kuma_.Bear_.full_.2385251-32x32.png
// @package      rawkuma.com
// @webSite      https://rawkuma.com
// @nsfw         false
// ==/MiruExtension==

export default class Mangafx extends Extension {
  filter_jsons = {};
  async get_filter(res) {
    const filter_list = res.match(/filter dropdown[\s\S]+?<\/div>/g);
    const filter_type = res.match(/<button.+<span/g).map((element) => {
      const element_match = element.match(/>(.+?)</)[1].replaceAll(" ", "");
      return element_match;
    })

    filter_list.forEach((element, index) => {
      const filt = filter_type[index] === "Genre"?{}:{ all: "all" };
      element.match(/value="(.+?)"/g).forEach((val) => {
        const name = val.match(/"(.+?)"/)[1];
        filt[name] = name;

      })
      const max_num = filter_type[index] === "Genre" ? 5 : 1;
      const default_option = filter_type[index] === "Genre" ? "action" : "all";
      const filter_full = {
        title: filter_type[index],
        max: max_num,
        min: 1,
        default: default_option,
        options: filt,
      };
      this.filter_jsons[filter_type[index]] = filter_full;
    })
    
  }
  async latest(page) {
    const res = await this.request(`/manga/?page=${page}&status=&type=&order=update`);
    const bsxList = res.match(/<div class="bs">([\s\S]+?)a>[\s\S]+?<\/div>/gm);
    if (page == "1") {
      await this.get_filter(res);
    }
    const mangas = [];
    bsxList.forEach((element) => {
      const url = element.match(/href="https:\/\/rawkuma.com\/manga(.+?)"/)[1];
      const title = element.match(/<div class="tt">\s*([^<>\s]+[^<]*)\s*<\/div>/)[1];
      const cover = element.match(/img src="(.+?)" class="ts-post-image/)[1];
      mangas.push({
        title,
        url,
        cover,
      });
    });
    return mangas;
  }
  async createFilter(filter) {
    return this.filter_jsons
  }
  async get_search_url(page,filter) {
    
    var base_url = `/manga/?page=${page}&`;
    for (const [key, value] of Object.entries(filter)) {
      if (key === "Genre") {
        value.forEach((item) => {
          base_url += `genre[]=${item}&`;
        })
      } else {
        base_url += `${key.toLowerCase()}=${value[0]}&`;
      }
    }
    const url = base_url.replaceAll("all", "").substring(0, base_url.length - 1);
    
    return url
  }
  async search(kw, page, filter) {
    var url = `/page/${page}/?s=${kw}`;
    if (!kw) {
      
      var url = await this.get_search_url(page,filter)
      console.log(url)
    }
    const res = await this.request(url);
    const bsxList = res.match(/<div class="bs">([\s\S]+?)a>[\s\S]+?<\/div>/gm);
    const mangas = [];
    bsxList.forEach((element) => {
      const url = element.match(/href="https:\/\/rawkuma.com\/manga(.+?)"/)[1];
      const title = element.match(/<div class="tt">\s*([^<>\s]+[^<]*)\s*<\/div>/)[1];
      const cover = element.match(/img src="(.+?)"/)[1];
      mangas.push({
        title,
        url,
        cover,
      });
    });
    return mangas;
  }

  async detail(url) {
    const res = await this.request(url);
    const titleRegex = /<h1 class="entry-title" itemprop="name">(.+?)<\/h1>/;
    const titleMatch = res.match(titleRegex);
    const title = titleMatch ? titleMatch[1] : null;
    const coverRegex = /img src="(.+?)" class/;
    const coverMatch = "https:" + res.match(coverRegex)[1];
    const cover = coverMatch ? coverMatch : null;
    const descriptionRegex = /<p>([\s\S^]+?)<\/p>/;
    const descriptionMatch = res.match(descriptionRegex);
    const desc = descriptionMatch ? descriptionMatch[1] : null;


    const liListRegex = /<li data-num=([\s\S]+?)<\/li>/g;
    const liListMatch = res.match(liListRegex);
    const episodes = [];
    if (liListMatch) {
      liListMatch.forEach((element) => {
        const chapterNumRegex = /"(.+?)"/;
        const chapterNumMatch = element.match(chapterNumRegex);
        const name = chapterNumMatch ? chapterNumMatch[1] : null;
        const chapterUrlRegex = /href="(.+?)"/;
        const chapterUrlMatch = element.match(chapterUrlRegex);
        url = chapterUrlMatch ? chapterUrlMatch[1] : null;
        url = url.slice(20, -1);
        if (name && url) {
          episodes.push({
            name,
            url,
          });
        }
      });
    }
    return {
      title: title || "Unknown Title",
      cover: cover || "",
      desc: desc || "No description available.",
      episodes: [
        {
          title: "Directory",
          urls: episodes.reverse(),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(`/${url}`);
    const contentRegex = /"images":([\s\S]*?)(])/;
    const contentMatch = res.match(contentRegex);

    const content = contentMatch ? contentMatch[1] : null;
    const imgMatches = JSON.parse(content + "]");
    
    let urls = imgMatches
    
    return {
      urls,
    };
  }
}

