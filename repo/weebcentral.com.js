// ==MiruExtension==
// @name         weebcentral
// @version      v0.0.3
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://weebcentral.com/static/images/apple-touch-icon.png
// @package      weebcentral.com
// @type         manga
// @webSite      https://weebcentral.com
// ==/MiruExtension==
 
    
export default class extends Extension {
  async getDomain() {
    return (await this.getSetting("weebcentral")) || "https://weebcentral.com";
  }

  async fixUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const domain = await this.getDomain();
    return `${domain}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  async req(url) { 
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getDomain(),
      },
    });
  }    

  async load() {
    await this.registerSetting({
      title: "weebcentral URL",
      key: "weebcentral",
      type: "input",
      description: "Homepage URL for WeebCentral",
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
                title: title.replace(/ cover$/i, "").trim(),
                url: await this.fixUrl(url),
                cover,
                update: updateText,
            };
        })
    );
}

 async search(kw, page) {
    const res = await this.req(`/search/data?author=&text=${encodeURIComponent(kw)}&sort=Best+Match&order=Ascending&official=Any&anime=Any&adult=Any&display_mode=Full+Display`);

    const searchList = await this.querySelectorAll(res, "article");

    return await Promise.all(
        searchList.map(async (element) => {
            const html = await element.content;

            const [url, title, cover] = await Promise.all([
                this.getAttributeText(html, "a", "href"),
                this.querySelector(html, "img").getAttributeText("alt"),
                this.querySelector(html, "img").getAttributeText("src"),
            ]);

            return {
                title: title.replace(/ cover$/i, "").trim(),
                url: await this.fixUrl(url),
                cover,
            };
        })
    );
}

async detail(url) {
    url = await this.fixUrl(url);
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

    let fullChapsUrl = await this.getAttributeText(res, "#chapter-list > button","hx-get") || "";
    if (fullChapsUrl) {
      fullChapsUrl = await this.fixUrl(fullChapsUrl);
    }
    
    const htmlChaplist = fullChapsUrl
      ? await this.request("", { headers: { "Miru-Url": fullChapsUrl } })
      : (await this.querySelector(res, "#chapter-list").outerHTML);

     
    const chapList = await this.querySelectorAll(htmlChaplist, "div a");

    const episodes = await Promise.all(
      chapList.map(async (element) => {
        const name = await this.querySelector(element.content, "span.grow > span:first-child").text;
        const episodeUrl = await this.getAttributeText(element.content,"a","href"); 

        return { name: name.trim(), url: await this.fixUrl(episodeUrl) };
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
    url = await this.fixUrl(url);
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

    return {
      urls,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": await this.getDomain(),
      },
    };
  }
}
