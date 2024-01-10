// ==MiruExtension==
// @name         MyIPTV
// @description  A simple IPTV client
// @version      v0.0.5
// @author       vvsolo
// @lang         all
// @license      MIT
// @package      client.iptv
// @type         bangumi
// @icon         https://avatars.githubusercontent.com/u/55937028?s=200&v=4
// @webSite      https://
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
	//https://raw.githubusercontent.com
	//https://fastly.jsdelivr.net/gh
	//https://gcore.jsdelivr.net/gh
	//https://jsdelivr.b-cdn.net/gh
	//https://github.moeyy.xyz/https://raw.githubusercontent.com
	#rawurl = 'https://github.moeyy.xyz/https://raw.githubusercontent.com';
	#opts = {
		url: 'https://live.fanmingming.com/tv/m3u/ipv6.m3u',
		exturl: this.#rawurl + `/vvsolo/miru-extension-MyIPTV-sources@main/sources.json`,
		lists: {
			'none': '',
			'🇨🇳 fanmingming-IPV6': 'https://live.fanmingming.com/tv/m3u/ipv6.m3u',
			'🇨🇳 fanmingming-IPV4': 'https://live.fanmingming.com/tv/m3u/v6.m3u',
			'🇨🇳 MyIPTV-IPV6': this.#rawurl + `/vvsolo/miru-extension-MyIPTV-sources@main/ipv6.m3u`,
			'🇨🇳 MyIPTV-IPV4': this.#rawurl + `/vvsolo/miru-extension-MyIPTV-sources@main/ipv4.m3u`,
			'🇨🇳 YueChan-IPV6': this.#rawurl + `/YueChan/Live@main/IPTV.m3u`,
			'🇨🇳 YueChan-Radio': this.#rawurl + `/YueChan/Live@main/Radio.m3u`,
			'🇨🇳 YanG-1989-Gather': this.#rawurl + `/YanG-1989/m3u@main/Gather.m3u`,
			'🇨🇳 BESTV': this.#rawurl + `/Ftindy/IPTV-URL@main/bestv.m3u`,
			"🇨🇳 蓝鲸": this.#rawurl + `/Cyril0563/lanjing_live@main/TVbox_Free/LIVE/Free/HD_LIVE.txt`,
			"🇨🇳 乐青多源": this.#rawurl + `/lqtv/lqtv.github.io/main/m3u/tv.m3u`,
		}
	}
	#group = {
		val: "All",
		lists: {
			"All": "All"
		}
	}
	#cache = {
		res: {},
		items: [],
		groups: this.#group.lists,
		uptime: 0,
		exturl: null
	}

	fixUrl(path) {
		return ~path.search(/raw\.githubusercontent\.com/) ? path.replace(/@(main|master)\//, '\/$1\/') : path;
	}

	async cacheJSON() {
		if (this.#cache.exturl && await this.checkExpire()) {
			return this.#cache.exturl;
		}
		const res = await this.request('', {
			headers: {
				'Content-Type': 'application/json',
				'Miru-Url': this.fixUrl(this.#opts.exturl)
			}
		});
		return (this.#cache.exturl = res);
	}

	async load() {
		const opts = this.#opts.lists;
		for(let item in opts) {
			opts[item] = this.fixUrl(opts[item]);
		}
		const res = await this.cacheJSON();
		Object.assign(opts, res || {});

		await this.registerSetting({
			title: 'Built-in Source',
			key: 'builtin',
			type: 'radio',
			description: 'Choose the `Custom Source` below when you choose "None"',
			defaultValue: '',
			options: opts
		});
		await this.registerSetting({
			title: 'Custom Source',
			key: 'source',
			type: 'input',
			description: 'IPTV source address (.m3u;.m3u8;.txt)',
			defaultValue: this.#opts.url
		});
		await this.registerSetting({
			title: 'Cache Expire Time',
			key: 'expire',
			type: 'radio',
			description: 'Set `none` is no cache\nTips: After changing the source address, the delay will be refreshed',
			defaultValue: '60',
			options: {
				'none': '0',
				'15 minute': '15',
				'30 minute': '30',
				'1 hour': '60',
				'6 hour': '360',
				'12 hour': '720',
				'1 day': '1440',
			}
		});
	}

	async createFilter(filter) {
		const filt = filter?.data && filter.data[0] || '';
		// multiple groups
		this.#cache.groups = this.#cache.items
			.map(v => v.group && v.group.split(';'))
			.flat()
			.reduce((g, v) => {
				return v ? {...g, [v]: v} : g;
			}, this.#group.lists);

		return {
			"data": {
				title: "",
				max: 1,
				min: 1,
				default: filt || this.#group.val,
				options: this.#cache.groups,
			}
		}
	}

	async req(path) {
		return await this.request('', {
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
				'Miru-Url': path
			}
		});
	}
	async checkExpire() {
		const expire = +(await this.getSetting('expire'));
		return expire > 0 && (Date.now() - this.#cache.uptime) < expire*60*1000;
	}

	async latest(page) {
		if (page > 1) {
			return [];
		}
		const baseUrl = (await this.getSetting('builtin')) || (await this.getSetting('source')) || '';
		if (!baseUrl) {
			throw 'No valid address set!';
		}
		// cache source content
		const md5path = md5(baseUrl);
		if (
			md5path in this.#cache.res &&
			await this.checkExpire()
		) {
			return (this.#cache.items = this.#cache.res[md5path]);
		}
		const res = (await this.req(baseUrl))
			.replace(/\r?\n/g, '\n')
			.replace(/\n+/g, '\n')
			.trim();

		const ext = baseUrl.slice(baseUrl.lastIndexOf('.')).toLowerCase();
		const content = res.split('\n');
		let bangumi = [];
		if (~res.search(/#genre#/i) || ext === '.txt') {
			let group, tmp;
			const repeats = {};
			content.forEach((item) => {
				tmp = item.split(',');
				if (tmp.length !== 2) {
					return;
				}
				const [title, url] = tmp;
				if (url === '#genre#') {
					group = title;
					return;
				}
				// 组合相同名称的台
				if (title in repeats) {
					repeats[title].url += '#' + url;
					return;
				}
				repeats[title] = {
					title,
					url,
					cover: null,
					group
				}
			});
			// 组合相同名称的台
			bangumi = Object.values(repeats);
		} else if (~res.search(/#EXT(?:M3U|INF)/i) || ext === '.m3u') {
			let title, cover, group;
			let headers = {};
			const vlcopt = {
				'User-Agent': '#EXTVLCOPT:http-user-agent=',
				'Referer': '#EXTVLCOPT:http-referrer=',
			}
			content.forEach((item) => {
				if (item.startsWith('#EXTINF:')) {
					title = item.slice(item.lastIndexOf(',') + 1).trim();
					group = item.match(/group\-title\="([^"]+)"/)?.[1] || '';
					cover = item.match(/tvg\-logo\="([^"]+)"/)?.[1] || null;
				} else if (item.startsWith('#EXTVLCOPT:')) {
					for (let v in vlcopt) if (item.startsWith(vlcopt[v])) {
						headers[v] = item.slice(vlcopt[v].length);
					}
				} else if (title && ~item.search(/^(?:https?|rs[tcm]p|rsp|mms)/) && !~item.search(/\.mpd/)) {
					bangumi.push({
						title,
						url: item.trim(),
						cover,
						group,
						headers,
					});
					title = '';
					headers = {};
				}
			});
		}
		this.#cache.uptime = Date.now();
		return (this.#cache.items = this.#cache.res[md5path] = bangumi);
	}

	async search(kw, page, filter) {
		if (page > 1) {
			return [];
		}
		!~this.#cache.items.length && await this.latest();
		const filt = filter?.data && filter.data[0] || this.#group.val;
		const bangumi = this.#cache.items;
		if (filt === this.#group.val) {
			return !kw ? bangumi : bangumi.filter(v => ~v.title.indexOf(kw));
		}
		return bangumi.filter(v => (v.group && ~`;${v.group};`.indexOf(`;${filt};`)) && (kw ? ~v.title.indexOf(kw) : true));
	}

	async detail(url) {
		const bangumi = this.#cache.items.find((v) => v.url === url);
		const parseUrls = (item) => [...new Set(item.url.split('#'))].map((v, i, t) => {
			return {
				name: t.length > 1 ? `${item.title} [${i + 1}]` : `${item.title}`,
				url: v
			};
		})
		bangumi.episodes = [
			{
				title: bangumi.title,
				urls: parseUrls(bangumi)
			}
		];
		// multiple groups
		let groups;
		bangumi.group && bangumi.group.split(';').forEach(g => {
			groups = this.#cache.items
				.filter((v) => (v.group && ~`;${v.group};`.indexOf(`;${g};`)))
				.map((v) => parseUrls(v)) || [];

			~groups.length && bangumi.episodes.push({
				title: `[${g}]`,
				urls: groups.flat()
			})
		})
		return bangumi;
	}

	async watch(url) {
		const bangumi = this.#cache.items.find((v) => v.url === url || ~v.url.indexOf(url));
		const item = {
			type: 'hls',
			url
		}
		if (('headers' in bangumi) && ~Object.keys(bangumi.headers).length) {
			item['headers'] = bangumi.headers
		}
		return item;
	}
}
