// ==MiruExtension==
// @name         MyIPTV
// @description  A simple IPTV client
// @version      v0.0.7
// @author       vvsolo
// @lang         all
// @license      MIT
// @package      client.iptv
// @type         bangumi
// @icon         https://s11.ax1x.com/2024/01/11/pFCMKit.png
// @webSite      https://live.fanmingming.com
// @nsfw         false
// ==/MiruExtension==


export default class extends Extension {
	#opts = {
		url: 'https://cdn.jsdelivr.net/gh/vbskycn/iptv@master/tv/iptv4.m3u',
		exturl: "",
		lists: {
			"none": "",
			"🇨🇳 vbskycn-IPV4": "https://cdn.jsdelivr.net/gh/vbskycn/iptv@master/tv/iptv4.m3u",
			"🇨🇳 fanmingming-IPV6": "https://live.fanmingming.com/tv/m3u/ipv6.m3u",
			"🇨🇳 YueChan-IPV6": "https://cdn.jsdelivr.net/gh/YueChan/Live@main/IPTV.m3u",
			"🇨🇳 YueChan-Radio": "https://cdn.jsdelivr.net/gh/YueChan/Live@main/Radio.m3u",
			"🇨🇳 YanG-1989": "https://cdn.jsdelivr.net/gh/YanG-1989/m3u@main/Gather.m3u",
			"🌐 iptv-org (Global)": "https://iptv-org.github.io/iptv/index.m3u",
			"🌐 iptv-org (China)": "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn.m3u",
			"🌐 iptv-org (USA)": "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us.m3u",
			"🇮🇳 iptv-org (India)": "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/in.m3u",
			"🌏 Free-TV": "https://cdn.jsdelivr.net/gh/Free-TV/IPTV/playlist.m3u8",
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

	async cacheJSON() {
		if (!this.#opts.exturl) {
			return null;
		}
		if (this.#cache.exturl && await this.checkExpire()) {
			return this.#cache.exturl;
		}
		try {
			const res = await this.request('', {
				headers: {
					'Content-Type': 'application/json',
					'Miru-Url': this.#opts.exturl
				}
			});
			const json = typeof res === 'string' ? JSON.parse(res) : res;
			return (this.#cache.exturl = json);
		} catch (e) {
			return null;
		}
	}

	async load() {
		const lists = this.#opts.lists;
		Object.assign(lists, (await this.cacheJSON()) || {});

		await this.registerSetting({
			title: 'Built-in Source',
			key: 'builtin',
			type: 'radio',
			description: 'Choose the `Custom Source` below when you choose "None"',
			defaultValue: '',
			options: lists
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
		if (!this.#cache.items.length) {
			await this.latest(1);
		}
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
		const builtinRaw = await this.getSetting('builtin');
		const builtinUrl = this.#opts.lists[builtinRaw] || builtinRaw;
		const source = await this.getSetting('source');
		const baseUrl = (builtinUrl && builtinUrl !== 'none') ? builtinUrl : (source || '');
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
			// fix
			.replace(/\.m3u8\?\n([\w\=\-&]+)\n/g, '.m3u8?$1\n')
			.replace(/\.m3u8\n\?([\w\=\-&]+)\n/g, '.m3u8?$1\n')
			.replace(/^(#EXTINF:\-?[\d\.]+) *\,/gmi, '$1 ')
			.replace(/^(#EXTINF:\-?[\d\.]+) ([^,]+)$/gmi, '$1,$2')
			.trim();

		const ext = baseUrl.slice(baseUrl.lastIndexOf('.')).toLowerCase();
		const content = res.split('\n');

		const repeats = {};
		if (~res.search(/#genre#/i) || ext === '.txt') {
			let group, tmp;
			content.forEach((item) => {
				// 有 genre 标记取 group 名称
				if (~item.search(/,#genre#$/i)) {
					group = item.split(',#')[0];
					return;
				}
				// 无分隔 标记取 group 名称
				if (!~item.search(/,/) && !~item.search(/(?:https?|rs[tcm]p|rsp|mms|udp)/)) {
					group = item;
					return;
				}
				let [title, url] = item.split(',');
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
		} else if (~res.search(/#EXT(?:M3U|INF)/i) || ['.m3u', '.m3u8'].includes(ext)) {
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
				} else if (title && ~item.search(/^(?:https?|rs[tcm]p|rsp|mms|udp)/) && !~item.search(/\.mpd/)) {
					// 组合相同名称的台
					if (title in repeats && repeats[title].group === group) {
						repeats[title].url += '#' + item.trim();
						return;
					}
					repeats[title] = {
						title,
						url: item.trim(),
						cover,
						group,
						headers,
					}
					title = '';
					headers = {};
				}
			});
		}
		// 组合相同名称的台
		const bangumi = Object.values(repeats) || [];
		this.#cache.uptime = Date.now();
		return (this.#cache.items = this.#cache.res[md5path] = bangumi);
	}

	async search(kw, page, filter) {
		if (page > 1) {
			return [];
		}
		if (!this.#cache.items.length) {
			await this.latest(1);
		}
		const filt = filter?.data && filter.data[0] || this.#group.val;
		const bangumi = this.#cache.items;
		if (filt === this.#group.val) {
			return !kw ? bangumi : bangumi.filter(v => ~v.title.indexOf(kw));
		}
		return bangumi.filter(v => (v.group && ~`;${v.group};`.indexOf(`;${filt};`)) && (kw ? ~v.title.indexOf(kw) : true));
	}

	async detail(url) {
		if (!this.#cache.items.length) {
			await this.latest(1);
		}
		const bangumi = this.#cache.items.find((v) => v.url === url || ~v.url.indexOf(url));
		if (!bangumi) {
			return null;
		}
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

			groups.length && bangumi.episodes.push({
				title: `[${g}]`,
				urls: groups.flat()
			})
		})
		return bangumi;
	}

	async watch(url) {
		if (!this.#cache.items.length) {
			await this.latest(1);
		}
		const bangumi = this.#cache.items.find((v) => v.url === url || ~v.url.indexOf(url));
		const item = {
			type: 'hls',
			url
		}
		if (bangumi?.headers && Object.keys(bangumi.headers).length) {
			item['headers'] = bangumi.headers
		}
		return item;
	}
}
