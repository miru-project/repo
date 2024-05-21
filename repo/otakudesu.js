// ==MiruExtension==
// @name         Otakudesu
// @version      v0.0.1
// @author       Nazz
// @lang         id
// @license      MIT
// @type         bangumi
// @icon         https://otakudesu.cloud/wp-content/uploads/2017/06/Logo-1.png
// @package      otakudesu
// @webSite      https://otakudesu.cloud
// @nsfw         false
// @tags         anime,indonesia
// ==/MiruExtension==

export default class extends Extension {
    async load() {
		this.registerSetting({
			title: "Otakudesu",
			key: "domain_otakudesu",
			type: "input",
			description: "Otakudesu Domain",
			defaultValue: "https://otakudesu.cloud",
		});
        this.registerSetting({
			title: "Otakudesu Source Priority",
			key: "sources_otakudesu",
			type: "input",
			description: "Available : ondesuhd,vidhide,ondesu3,odstream",
			defaultValue: "ondesuhd,vidhide,ondesu3,odstream"
		});
	}

    async requestWSetting(url) {
		return this.request(url, {
			headers: {
				"Miru-Url": await this.getSetting("domain_otakudesu"),
			},
		});
	}

    async search(query, page){
        if(page > 1) return []
		const page_domain = await this.getSetting("domain_otakudesu");
        const query_parse = query.replaceAll(" ","+")
        const url = `/?s=${query_parse}&post_type=anime`
        const fetch_search = await this.requestWSetting(url);
        const element_item_search = await this.querySelectorAll(
            fetch_search,
            "#venkonten > div > div.venser > div > div > ul > li"
        );
        let list_search = []
        for (const element of element_item_search) {
            const title = await this.querySelector(element.content, "h2 > a").text;
            const cover = await this.getAttributeText(
                element.content,
                "img",
                "src"
            );
            const urls = await this.getAttributeText(
                element.content,
                "h2 > a",
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
        let url = page > 1 ? `/ongoing-anime/page/${page}` : "/ongoing-anime/"
		const page_domain = await this.getSetting("domain_otakudesu");
		let list_item = [];
        
        const fetch_anime_latest = await this.requestWSetting(url);
        const element_latest = await this.querySelectorAll(fetch_anime_latest, "div.venz > ul > li") || []
        if(element_latest.length < 1) return list_item
        for (const element of element_latest) {
			const title_anime = await this.querySelector(element.content, "div.thumb > a > div > h2").text;
            const title_episode = await this.querySelector(element.content, "div > div.epz").text;
            const title = title_anime + title_episode

			const cover = await this.getAttributeText(
				element.content,
				"div > div.thumb > a > div > img",
				"src"
			);
			const elementUrl = await this.getAttributeText(
				element.content,
				"div > div.thumb > a",
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
        const page_domain = await this.getSetting("domain_otakudesu");
        const fetch_detail_anime = await this.requestWSetting(url);
        const quality = ["720p", "480p", "360p"];

        const title = await this.querySelector(fetch_detail_anime, "#venkonten > div.venser > div.jdlrx > h1").text
        const cover = await this.getAttributeText(
            fetch_detail_anime,
            "#venkonten > div.venser > div.fotoanime > img",
            "src"
        );

        let array_desc = []
        const element_desc = await this.querySelectorAll(fetch_detail_anime, "#venkonten > div.venser > div.fotoanime > div.infozin > div > p");
        for (const element of element_desc){
            const element_item_desc = await this.querySelector(element.content, "span").text
            let string_desc = element_item_desc.replaceAll("<b>","").replaceAll("</b>","") || ""
            if(string_desc) array_desc.push(string_desc)
        }
        const desc = array_desc.join("\n")

        let episodes_anime = []
        const element_episode_list_header = await this.querySelectorAll(fetch_detail_anime, "div.episodelist");
        
        for(const element_header of element_episode_list_header){
            const element_text = await this.querySelector(element_header.content, "div > span").text
            if(element_text.search("Streaming") < 0) continue
            const element_episode_list = await this.querySelectorAll(element_header.content, "ul > li")
            for(const element_episode of element_episode_list){
                const title_episode = await this.querySelector(element_episode.content, "span > a").text
                if(title_episode.search("Pembatas") > -1) continue
                const urls_episode = await this.getAttributeText(
                    element_episode.content,
                    "span > a",
                    "href"
                );
                const url_episode = await urls_episode.toString().replace(page_domain, "");
                episodes_anime.push({
                    name: title_episode,
                    url: url_episode,
                });
            }
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
        };

    }
    async watch(url) {
        const list_streams = await this.getSetting("sources_otakudesu")
        const list_stream = list_streams.split(",")
        const quality = url.split("#")[1] || "720p";
		const fetch_watch = await this.requestWSetting(`/${url}`);
        const element_options = await this.querySelectorAll(fetch_watch, `#embed_holder > div.mirrorstream > ul.m${quality} > li`)
        
        let streamable_data = []
        let streamable = false
        for(const element of element_options){
            let stream_title = await this.querySelector(element.content, "a").text;
            let stream_url = await this.getAttributeText(
                element.content,
                "a",
                "data-content"
            )
            stream_title = stream_title.replaceAll(" ","")
            if(list_stream.includes(stream_title.replaceAll(" ",""))) {
                streamable_data.push({stream_title,stream_url})
            }
        }
        if(streamable_data.length < 1) return
        list_stream.map(source => {
            if(streamable) return true
            streamable = streamable_data.find(item => item.stream_title == source)
        })
        if(!streamable) return
        
        const nonce = await this.getNonceOtakudesu()
        const fetch_embed_link = await this.getAjaxOtakudesu(streamable.stream_url, nonce)
        
        
        const element_embed = await this.getAttributeText(
            fetch_embed_link,
            "iframe",
            "src"
        )
        
        const fetch_embed = await this.request("", {
			headers: {
				"Miru-Url": element_embed,
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
                'accept-language': 'en-US,en;q=0.9', 
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Opera";v="108"', 
                'sec-ch-ua-mobile': '?0', 
                'sec-ch-ua-platform': '"Windows"', 
                'sec-fetch-dest': 'document', 
                'sec-fetch-mode': 'navigate', 
                'sec-fetch-site': 'none', 
                'sec-fetch-user': '?1', 
                'upgrade-insecure-requests': '1', 
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0'
			},
		});
        const element_scripts = await this.querySelectorAll(fetch_embed, "script");
		let scriptss = ""
		element_scripts.forEach(element => {
			if(element.content.includes('playerInstance.setup(')){
				scriptss = element.content
			}else if(element.content.includes('jwplayer("vplayer").setup(')){
				scriptss = element.content
            }
		})
        if(scriptss){
            let arr_url_video = this.cariMatch(scriptss, /sources:\s*(\[[\s\S]*?\])/)
            if(arr_url_video.includes("file:")) arr_url_video = arr_url_video.replace("file:",'"file":')
            const obj_url_video = JSON.parse(arr_url_video.replaceAll("'",'"'))
            if(obj_url_video.length < 1) return
            return {
                type: "mp4",
                url: obj_url_video[0].file,
            }
        }
    }

    async getNonceOtakudesu(){
        const page_domain = await this.getSetting("domain_otakudesu");
        let payload = {
            action: "aa1208d27f29ca340c92c66d1926f13f"
        }
        const fetch_getNonce = await this.request("/wp-admin/admin-ajax.php", {
            method: "POST",
			data: await this.qsStringify(payload),
			headers: {
				"Miru-Url": page_domain,
				'Origin': page_domain,
                'Cookie':'_ga=GA1.2.826878888.1673844093; _gid=GA1.2.1599003702.1674031831; _gat=1',
                'Referer': page_domain,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		});
        return fetch_getNonce.data
    }

    async getAjaxOtakudesu(content, nonce){
        const page_domain = await this.getSetting("domain_otakudesu");
        let _e = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(content + "==")))
        let payload = {
            ..._e,
            nonce: nonce,
            action: "2a3505c93b0035d3f455df82bf976b84"
        }
        const fetch_getAjax = await this.request("/wp-admin/admin-ajax.php", {
            method: "POST",
			data: await this.qsStringify(payload),
			headers: {
				"Miru-Url": await this.getSetting("domain_otakudesu"),
				'Origin': page_domain,
                'Cookie':'_ga=GA1.2.826878888.1673844093; _gid=GA1.2.1599003702.1674031831; _gat=1',
                'Referer': page_domain,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		});
        const fetch_embed_link_parse = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(fetch_getAjax.data)) 
        return fetch_embed_link_parse
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