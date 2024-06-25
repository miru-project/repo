// ==MiruExtension==
// @name         Animeworld
// @version      v0.0.1
// @author       Nazz
// @lang         it
// @license      MIT
// @type         bangumi
// @icon         https://static.animeworld.so/assets/images/favicon/android-icon-192x192.png?4
// @package      animeworld
// @webSite      https://www.animeworld.so
// @nsfw         false
// @tags         anime, italian
// ==/MiruExtension==

export default class extends Extension {
    async load() {
		this.registerSetting({
			title: "Animeworld",
			key: "domain_animeworld",
			type: "input",
			description: "Animeworld Domain",
			defaultValue: "https://www.animeworld.so",
		});
	}

    async requestWSetting(url, raw=false) {
        if(raw == false){
            return this.request(url, {
                headers: {
                    "Miru-Url": await this.getSetting("domain_animeworld"),
                },
            });
        }else{
            return this.request("", {
                headers: {
                    "Miru-Url": url,
                },
            });
        }
	}

    async latest(page) {
        let url = page > 1 ? `/updated?page=${page}` : "/updated"
		const page_domain = await this.getSetting("domain_animeworld");
		let list_item = [];
        
        const fetch_anime_latest = await this.requestWSetting(url);
        const element_latest = await this.querySelectorAll(fetch_anime_latest, "div.film-list > div.item") || []
        if(element_latest.length < 1) return list_item
        for (const element of element_latest) {
			const title = await this.querySelector(element.content, "a.name").text;
            const title_episode = (await this.querySelector(element.content, "div.ep").text).trim().replace("Ep", "Episode")
            

			const cover = await this.getAttributeText(
				element.content,
				"a.poster > img",
				"src"
			);
			const url = await this.getAttributeText(
				element.content,
				"a.name",
				"href"
			);
			list_item.push({
				title,
				cover,
				url,
                update: title_episode
			});
		}
        return list_item
    }
    async detail(url) {
		const page_domain = await this.getSetting("domain_animeworld");
        const fetch_detail_anime = await this.requestWSetting(url);
        const mirror_available = ["AnimeWorld Server","Streamtape","FileMoon"]; // comingsoon ,VidGuard

        const title = await this.querySelector(fetch_detail_anime, "div.info > div.head > div.c1 > h2").text
        const cover = await this.getAttributeText(
            fetch_detail_anime,
            "div.thumb > img",
            "src"
        );
        const desc = await this.querySelector(fetch_detail_anime, "div.desc > div.long").text;


        let streamable = {}
        const element_server = await this.querySelectorAll(fetch_detail_anime, "#animeId > div.widget-title > span.tabs.servers-tabs > span.server-tab")
        for(const element of element_server){
            const mirror_title = await this.querySelector(element.content, "span").text
            const mirror_id = await this.getAttributeText(
                element.content,
                "span",
                "data-name"
            );
            streamable[mirror_title] = {mirror_id}
        }

        streamable = Object.fromEntries(
            Object.entries(streamable).filter(([key, value]) => mirror_available.includes(key))
        );
        
        let episodes = []
        for(const mirror of Object.keys(streamable)){
            const element_episode = await this.querySelectorAll(fetch_detail_anime, `#animeId > div.widget-body > div[data-id='${streamable[mirror].mirror_id}'] > ul > li`)
            let mirror_episode = []
            for(const element of element_episode){
                const name = "Episode " + (await this.querySelector(element.content, "a").text)
                const url = await this.getAttributeText(
                    element.content,
                    "a",
                    "data-id"
                );
                mirror_episode.push({name,url})
            }
            episodes.push({
                title: mirror,
                urls: mirror_episode
            })            
        }
        
        return {
            title,
            cover,
            desc,
            episodes
        };

    }
    async watch(url) {
		const page_domain = await this.getSetting("domain_animeworld");
        const fetch_link_video = await this.request('', {
            headers: {
                "Miru-Url": `${page_domain}/api/episode/info?id=${url}&alt=0`
            },
        });
        if(fetch_link_video.grabber.search("filemoon") > -1){
            const fetch_filemoon = await this.mirror_filemoon(fetch_link_video.grabber)
            return fetch_filemoon
        }else{
            return {
                type: "mp4",
                url: fetch_link_video.grabber,
            }
        }
    }
    async mirror_filemoon(url){
        const fetch_url = await this.requestWSetting(url, true)
        const match = fetch_url.match(/eval(.+?)<\/script>/gs)
        if(!match) return ""
        const raw_html = eval(match[0].replace("eval","").replace("</script>",""))
        
        let arr_url_video = this.cariMatch(raw_html, /sources:\s*(\[[\s\S]*?\])/)
        if(arr_url_video.includes("file:")) arr_url_video = arr_url_video.replace("file:",'"file":')
        const obj_url_video = JSON.parse(arr_url_video.replaceAll("'",'"'))
        if(obj_url_video.length < 1) return
        return {
            type: "hls",
            url: obj_url_video[0].file,
        }
    }
    cariMatch(input, regex) {
		const match = input.match(regex);
		return match ? (match.length > 2 ? match : match[1]) : null;
	}
}

