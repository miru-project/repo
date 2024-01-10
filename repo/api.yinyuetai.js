// ==MiruExtension==
// @name         音悦台MTV
// @version      v0.0.1
// @author       vvsolo
// @lang         zh
// @license      MIT
// @package      api.yinyuetai
// @type         bangumi
// @icon         https://www.yinyuetai.com/images/favicon.ico
// @webSite      https://video-api.yinyuetai.com
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
	#channelDefault = '6998499728862334976';
	#channelList = {
		'6998499728862334976': '华语',
		'6951459197061984256': '欧美',
		'6998475633361805312': '韩语',
		'6997855138153095168': '日语',
		'7005423896983887872': '音悦人',
	}

	#cache = {
		res: {},
		items: [],
	}

	async createFilter(filter) {
		return {
			"data": {
				title: "",
				max: 1,
				min: 1,
				default: this.#channelDefault,
				options: this.#channelList,
			}
		}
	}

	async reqJSON(channelid, page) {
		const size = 20;
		const offsets = page*size;
		const baseUrl = `/video/explore/channelVideos?channelId=${channelid}&detailType=2&size=${size}&offset=${offsets}`;
		const res = await this.request(baseUrl, {
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if ('data' in res) {
			return res.data;
		}
		return [];
	}

	async getResource(channelid, page) {
		const res = await this.reqJSON(channelid, page);
		const bangumi = [];
		~res.length && res.forEach(v => {
			const title = `${v.allArtistNames} - ${v.title}`;
			//const urls = [].concat(v?.fullClip?.urls || []).concat(v?.killingPartClip?.urls || []);
			const urls = [].concat(v?.fullClip?.urls || []);
			//const artists = v.artists.map(art => art.name).join('|').toLowerCase();
			bangumi.push({
				id: v.id,
				title,
				url: v.id,
				cover: v.fullClip.headImg,
				urls: urls,
				desc: v.content + '\nTags: ' + v.tags.map(t => t.tagName).join(', '),
				//artists: v.allArtistNames,
			})
		})
		this.#cache.items = this.#cache.items.concat(bangumi);
		return bangumi;
	}
	
	async latest(page) {
		return await this.getResource(this.#channelDefault, page);
	}

	async search(kw, page, filter) {
		const channelid = filter?.data && filter.data[0] || "";
		if(channelid && !kw) {
			this.#channelDefault = channelid;
			const res = await this.getResource(channelid, page);
			return res;
		}
		if(kw) {
			kw = kw.toLowerCase();
			const res = this.#cache.items.filter((v) => ~v.title.toLowerCase().indexOf(kw));
			return res;
		}
		return this.#cache.items;
	}

	async detail(url) {
		const bangumi = this.#cache.items.find((v) => v.url === url);
		bangumi.episodes = [
			{
				title: 'Clip',
				urls: bangumi.urls.map(v => {
					return {
						name: v.display,
						url: v.url
					}
				})
			}
		];
		return bangumi
	}

	async watch(url) {
		return {
			type: 'hls',
			url
		}
	}
}
