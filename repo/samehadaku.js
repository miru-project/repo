// ==MiruExtension==
// @name         Samehadaku
// @version      v0.0.1
// @author       Nazz
// @lang         id
// @license      MIT
// @type         bangumi
// @icon         https://samehadaku.email/wp-content/uploads/2020/04/cropped-download-1-192x192.jpg
// @package      samehadaku
// @webSite      https://samehadaku.email
// @nsfw         false
// @tags         anime,indonesia
// ==/MiruExtension==

export default class extends Extension {
    async load() {
		this.registerSetting({
			title: "Samehadaku",
			key: "domain_samehadaku",
			type: "input",
			description: "Samehadaku Domain",
			defaultValue: "https://samehadaku.email",
		});
        this.registerSetting({
			title: "Samehadaku Source Priority",
			key: "sources_samehadaku",
			type: "input",
			description: "Available : Vidhide,Premium",
			defaultValue: "Nakama,Vidhide,Premium"
		});
	}
    async requestWSetting(url) {
		return this.request(url, {
			headers: {
				"Miru-Url": await this.getSetting("domain_samehadaku"),
			},
		});
	}

    async search(query, page){
		const page_domain = await this.getSetting("domain_samehadaku");
        const query_parse = query.replaceAll(" ","+")
        let url = page > 1 ? `/page/2/${page}/?s=${query_parse}` : `/?s=${query_parse}`
        const fetch_search = await this.requestWSetting(url);

        let list_search = []
        const element_item_search = await this.querySelectorAll(fetch_search, "#main > article") || []
        for (const element of element_item_search) {
            const title = await this.querySelector(element.content, "div.title > h2").text;
            const cover = await this.getAttributeText(
                element.content,
                "div.content-thumb > img",
                "src"
            );
            const urls = await this.getAttributeText(
                element.content,
                "div.animposx > a",
                "href"
            );
            const url = urls.replace(page_domain, "")
            list_search.push({
                title,
                url,
                cover
            })
        }
        return list_search

    }

    async latest(page) {
        let url = page > 1 ? `/anime-terbaru/page/${page}` : "/anime-terbaru/"
		const page_domain = await this.getSetting("domain_samehadaku");
		let list_item = [];

        const fetch_anime_latest = await this.requestWSetting(url);
        const element_latest = await this.querySelectorAll(fetch_anime_latest, "#main > div.post-show > ul > li") || []

        if(element_latest.length < 1) return list_item
        for (const element of element_latest) {
            const title = await this.querySelector(element.content, "div.dtla > h2 > a").text;
			const cover = await this.getAttributeText(
				element.content,
				"div.thumb > a > img",
				"src"
			);
			const elementUrl = await this.getAttributeText(
				element.content,
				"div.dtla > h2 > a",
				"href"
			);
			const url = await elementUrl.toString().replace(page_domain, "");
			list_item.push({
				title,
				cover,
				url,
			});
		}
        return list_item
    }

    async detail(url) {
        const quality = ["1080p","720p", "480p", "360p"];
		const page_domain = await this.getSetting("domain_samehadaku");
        const fetch_detail_anime = await this.requestWSetting(url);
        let episodes_anime = []
        if(url.search("anime/") > -1){
            const title = await this.getAttributeText(
                fetch_detail_anime,
                "div.infoanime > div.thumb > img",
                "title"
            );
            const cover = await this.getAttributeText(
                fetch_detail_anime,
                "div.infoanime > div.thumb > img",
                "src"
            );
            const desc = await this.querySelector(fetch_detail_anime, "div.infoanime > div.infox > div.desc > div > p").text
            
            const element_episode_list = await this.querySelectorAll(fetch_detail_anime, "div.lstepsiode.listeps > ul > li");
            for(const element of element_episode_list){
                const episode_title = await this.querySelector(element.content, "div.epsleft > span.lchx > a").text
                let episode_url = await this.getAttributeText(
                    element.content,
                    "div.epsleft > span.lchx > a",
                    "href"
                );
                episode_url = episode_url.replace(page_domain, "")
                episodes_anime.push({
                    name: episode_title,
                    url: episode_url,
                });
            }
            let episodes = quality.map((item_quality, i) => {
                let temp_episode = episodes_anime.reverse().map((item_eps) => {
                    return {
                        ...item_eps,
                        url: `${item_eps.url}#${item_quality}`,
                    };
                });
                return {
                    title: item_quality,
                    urls: temp_episode,
                };
            })
            return {
                title,
                cover,
                desc,
                episodes,
            }
        }else{
            const title = await this.getAttributeText(
                fetch_detail_anime,
                "div.thumb > img",
                "title"
            );
            const cover = await this.getAttributeText(
                fetch_detail_anime,
                "div.thumb > img",
                "src"
            );
            const desc = await this.querySelector(fetch_detail_anime, "div.infox > div.desc > div").text

            const element_episode_list = await this.querySelectorAll(fetch_detail_anime, "div.episode-lainnya > div.lstepsiode.listeps > ul > li");
            for(const element of element_episode_list){
                const episode_title = await this.querySelector(element.content, "div.epsleft > span.lchx > a").text
                let episode_url = await this.getAttributeText(
                    element.content,
                    "div.epsleft > span.lchx > a",
                    "href"
                );
                episode_url = episode_url.replace(page_domain, "")
                episodes_anime.push({
                    name: episode_title,
                    url: episode_url,
                });
            }
            let episodes = quality.map((item_quality, i) => {
                let temp_episode = episodes_anime.reverse().map((item_eps) => {
                    return {
                        ...item_eps,
                        url: `${item_eps.url}#${item_quality}`,
                    };
                });
                return {
                    title: item_quality,
                    urls: temp_episode,
                };
            })
            return {
                title,
                cover,
                desc,
                episodes,
            }
        }
    }

    async watch(url) {
        ////////////////////////////
        /// KRAKENFILES (FAST)
        ////////////////////////////
        const list_streams = await this.getSetting("sources_samehadaku")
        const list_stream = list_streams.split(",")

        const quality = url.split("#")[1] || "720p";

        const fetch_watch = await this.requestWSetting(`/${url}`);
        const element_download_option = await this.querySelectorAll(fetch_watch, `#downloadb`)
        let streamable_data = []
        for (const element_download of element_download_option) {
            const element_download_header =  await this.querySelector(element_download.content, "p > b").text
            if(!element_download_header.includes("MP4")) continue
            const element_download_list =  await this.querySelectorAll(element_download.content, "ul > li")
            for (const element of element_download_list) {
                let element_quality = await this.querySelector(element.content, "strong").text
                element_quality = element_quality.replace(" ","").replace("MP4HD", "720p").replace("FULLHD", "1080p")
                const element_sources = await this.querySelectorAll(element.content, "span")
                for(const source of element_sources){
                    let source_title = await this.querySelector(source.content, "a").text
                    let source_url = await this.getAttributeText(
                        source.content,
                        "a",
                        "href"
                    )
                    if(source_title.includes("Krakenfiles")){
                        streamable_data.push({source_title: element_quality, source_url})
                    }
                    
                }
            }
        }
        let streamable = ""
        streamable = streamable_data.find(item => item.source_title.search(quality) > -1)
        const fetch_link_video = await this.request('', {
            headers: {
                "Miru-Url": streamable.source_url,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        });
        const krakenId = await this.getAttributeText(
            fetch_link_video,
            "div.general-information",
            "data-file-hash"
        )
        let krakenToken = await this.getAttributeText(
            fetch_link_video,
            "input#dl-token",
            "value"
        )
        let payload = {
            token: krakenToken
        }
        const obj_link_video = await this.request("", {
            method: "POST",
			data: await this.qsStringify(payload),
			headers: {
				"Miru-Url": `https://krakenfiles.com/download/${krakenId}`,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		});
        return {
            type: "mp4",
            url: obj_link_video.url,
        }
    }
    async getAjaxSamehadaku(post, nume){
        const page_domain = await this.getSetting("domain_samehadaku");
        let payload = {
            post,
            nume,
            action: "player_ajax",
            type: "schtml"
        }
        const fetch_getAjax = await this.request("/wp-admin/admin-ajax.php", {
            method: "POST",
			data: await this.qsStringify(payload),
			headers: {
				"Miru-Url": await this.getSetting("domain_samehadaku"),
				'Origin': page_domain,
                'Cookie':'_ga=GA1.2.826878888.1673844093; _gid=GA1.2.1599003702.1674031831; _gat=1',
                'Referer': page_domain,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		});
        const element_embed = await this.getAttributeText(
            fetch_getAjax,
            "iframe",
            "src"
        )
        return element_embed
    }
    async qsStringify(obj) {
        let params = Object.keys(obj).map(key => {
            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(obj[key]);
            return `${encodedKey}=${encodedValue}`;
        });
        return params.join('&');
    }

    cariMatch(input, regex) {
		const match = input.match(regex);
		return match ? (match.length > 2 ? match : match[1]) : null;
	}
}
