// ==MiruExtension==
// @name         音悦台MTV
// @version      v0.0.2
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
	#opts = {
		uptime: 0,
		expire: 24*60,
		channel: '6998499728862334976',
		channels: {
			'6998499728862334976': '华语',
			'6951459197061984256': '欧美',
			'6998475633361805312': '韩语',
			'6997855138153095168': '日语',
			'7005423896983887872': '音悦人',
		},
	}
	#cache = new Map();

	async createFilter(filter) {
		return {
			"data": {
				title: "Channel",
				max: 1,
				min: 1,
				default: this.#opts.channel,
				options: this.#opts.channels,
			}
		}
	}

	async latest(page) {
		return await this.getBangumis(this.#opts.channel, page);
	}

	async search(kw, page, filter) {
		const channelid = filter?.data && filter.data[0] || '';
		if(channelid && !kw) {
			this.#opts.channel = channelid;
			return await this.getBangumis(channelid, page);
		}
		const res = await this.getCacheAll();
		if(kw) {
			kw = kw.toLowerCase();
			return res.filter((v) => ~v.title.toLowerCase().indexOf(kw));
		}
		return res;
	}

	async detail(url) {
		const res = await this.getCacheAll();
		const bangumi = res.find((v) => v.url === url);
		bangumi.episodes = [{
			title: 'Clip',
			urls: bangumi.urls.map(v => {
				return {
					name: v.display,
					url: v.url
				}
			})
		}];
		return bangumi
	}

	async watch(url) {
		return {
			type: 'hls',
			url
		}
	}

	async getCacheAll() {
		if (this.#cache.size < 1) {
			return [];
		}
		const bangumi = [];
		const values = this.#cache.values();
		let v;
		while(v = values.next().value) {
			bangumi.push(v);
		}
		return bangumi.flat();
	}

	async getBangumis(channelid, page) {
		const size = 20;
		const offsets = page*size;
		const baseUrl = `/video/explore/channelVideos?channelId=${channelid}&detailType=2&size=${size}&offset=${offsets}`;
		const md5path = md5(baseUrl);
		if (this.checkCache(md5path)) {
			return this.#cache.get(md5path);
		}
		const res = await this.reqJSON(baseUrl);
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
		this.#cache.set(md5path, bangumi);
		this.#opts.uptime = Date.now();
		return bangumi;
	}
	
	async reqJSON(path) {
		const res = await this.request(path, {
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

	checkCache(item) {
		const expire = +(this.#opts.expire);
		return this.#cache.has(item) &&
			expire > 0 &&
			(Date.now() - this.#opts.uptime) < expire * 60 * 1000;
	}
}
