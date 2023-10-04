// ==MiruExtension==
// @name         JavHD
// @version      v0.0.1
// @author       OshekharO
// @lang         jp
// @license      MIT
// @package      javhd.today
// @type         bangumi
// @icon         https://javhd.today/android-icon-192x192.png
// @webSite      https://javhd.today
// @nsfw         true
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/releaseday/");
    const bsxList = await this.querySelectorAll(res, "div.video");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.thumbnail", "href");
      const title = await this.querySelector(html, "span.video-title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      //console.log(title+cover+url)
      novel.push({
        title,
        url: 'https://javhd.today' + url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/search/video/?s=${kw}`);
    const bsxList = await this.querySelectorAll(res, "div.video");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.thumbnail", "href");
      const title = await this.querySelector(html, "span.video-title").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title,
        url: 'https://javhd.today' + url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request("", {
        headers: {
            "Miru-Url": url,
        },
    });

    const title = await this.querySelector(res, "meta[property='og:title']").getAttributeText("content");
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "p.description").text;

    const urlPatterns = [
        /https:\/\/minoplres\.[^\s'"]+/,
        /https:\/\/vidcloud\.[^\s'"]+/,
        /https:\/\/emturbovid\.[^\s'"]+/,
    ];

    let episodeUrl = "";

    for (const pattern of urlPatterns) {
        const match = res.match(pattern);
        if (match) {
            episodeUrl = match[0];
            break;
        }
    }
    
    function limitWords(text, maxWords) {
        const words = text.split(/\s+/);
        if (words.length > maxWords) {
            return words.slice(0, maxWords).join(" ") + " ...";
        }
        return text;
    }

    return {
        title: limitWords(title.trim(), 10),
        cover,
        desc,
        episodes: [
            {
                title: "Directory",
                urls: [
                    {
                        name: limitWords(title.trim(), 10),
                        url: episodeUrl,
                    },
                ],
            },
        ],
    };
}

  async watch(url) {
    const res = await this.request("", {
        headers: {
            "Miru-Url": url,
        },
    });

    let directUrl = "";

    if (url.startsWith("https://minoplres")) {
        const dwishLink = res.match(/https:\/\/tukipasti\.[^\s'"]+/);

        const dwishLinkRes = await this.request("", {
            headers: {
                "Miru-Url": dwishLink,
            },
        });

        const directUrlMatch = dwishLinkRes.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
        directUrl = directUrlMatch ? directUrlMatch[0] : "";
  
    } else if (url.startsWith("https://vidcloud")) {
      
        const directUrlMatch = res.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
        directUrl = directUrlMatch ? directUrlMatch[0] : "";
    } else if (url.startsWith("https://emturbovid.com")) {
        
        const emturbovidRes = await this.request("", {
            headers: {
                "Miru-Url": url,
                "referer": "https://emturbovid.com/",
                "origin": "https://emturbovid.com",
            },
      method: "Get",
    });
        
        const directUrlMatch = emturbovidRes.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
        directUrl = directUrlMatch ? directUrlMatch[0] : "";
    }

    return {
        type: "hls",
        url: directUrl || "",
    };
}
}
