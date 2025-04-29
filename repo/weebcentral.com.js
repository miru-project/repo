// ==MiruExtension==
// @name         weebcentral
// @version      v0.0.2
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://weebcentral.com/static/images/brand.png
// @package      weebcentral.com
// @type         manga
// @webSite      https://weebcentral.com
// ==/MiruExtension==
 
    
export default class extends Extension {
  async req(url) { 
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("weebcentral"),
      },
    });
  }    

  async load() {
    this.registerSetting({
      title: "weebcentral URL",
      key: "weebcentral",
      type: "input",
      description: "Homepage URL for AsuraScan",
      defaultValue: "https://weebcentral.com",
    });
  } 

 async latest(page) {
    const res = await this.req(`/latest-updates/${page}`);
    const latest = await this.querySelectorAll(res, "article");

    return await Promise.all( 
        latest.map(async (element) => {
            const html = await element.content; 

            const [url, title, cover, updateText] = await Promise.all([
                this.getAttributeText(html, "a", "href"),
                this.querySelector(html, "img").getAttributeText("alt"),
                this.querySelector(html, "img").getAttributeText("src"),
                this.querySelector(html, "span").text,
            ]);

            return {
                title: title.trim(),
                url,
                cover,
                update: updateText,
            };
        })
    );
}

 async search(kw, page) {
    const res = await this.request(`/search/simple`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: {
            text: kw
        }
    });

    const searchList = await this.querySelectorAll(res, "section div > a");

    return await Promise.all(
        searchList.map(async (element) => {
            const html = await element.content;

            const [url, title, cover] = await Promise.all([
                this.getAttributeText(html, "a", "href"),
                this.querySelector(html, "img").getAttributeText("alt"),
                this.querySelector(html, "img").getAttributeText("src"),
            ]);

            return {
                title: title.trim(),
                url,
                cover,
            };
        })
    );
}

async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const [title, cover, desc] = await Promise.all([
      this.querySelector(res, "div#top section h1").text,
      this.getAttributeText(res, "div#top section img","src"),
      this.querySelector(res, "div#top section p").text,
    ]);

    const fullChapsUrl = await this.getAttributeText(res, "#chapter-list > button","hx-get") || "";
    
    const htmlChaplist = fullChapsUrl
      ? await this.request("", { headers: { "Miru-Url": fullChapsUrl } })
      : (await this.querySelector(res, "#chapter-list").outerHTML);

     
    const chapList = await this.querySelectorAll(htmlChaplist, "div a");

    const episodes = await Promise.all(
      chapList.map(async (element) => {
        const name = await this.querySelector(element.content, "span.grow > span:first-child").text;
        const episodeUrl =await this.getAttributeText(element.content,"a","href"); 

        return { name: name.trim(), url: episodeUrl };
      })
    );


    return {
      title,
      cover,
      desc,
      episodes: [{ title: "Chapters", urls: episodes }],
    };
  }

async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": `${url}/images?is_prev=False&current_page=1&reading_style=long_strip`,
      },
    });

    let html = await this.querySelectorAll(res,
      "section > img"
    )

    let urls = await Promise.all(html.map(async (item)=>{ 
      return await this.querySelector(item.content, "img").getAttributeText("src");
    }));

    return {urls};
  }
}

