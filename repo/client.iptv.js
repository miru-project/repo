// ==MiruExtension==
// @name         MyIPTV
// @description  A simple IPTV client
// @version      v0.0.3
// @author       vvsolo
// @lang         zh-cn
// @license      MIT
// @package      client.iptv
// @type         bangumi
// @icon         https://avatars.githubusercontent.com/u/55937028?s=48&v=4
// @webSite      https://
// @nsfw         false
// @tmdb         false
// ==/MiruExtension==

export default class extends Extension {
	#cacheItems = [];
	#iptvurl = 'https://live.fanmingming.com/tv/m3u/ipv6.m3u';
	#iptvlist = {
		'none': '',
		'fanmingming-IPV6': 'https://live.fanmingming.com/tv/m3u/ipv6.m3u',
		'fanmingming-IPV4': 'https://live.fanmingming.com/tv/m3u/v6.m3u',
		'MyIPTV-IPV6': 'https://qu.ax/nazV.m3u',
		'MyIPTV-IPV4': 'https://qu.ax/atTi.m3u',
		'YanG-1989-Gather': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/YanG-1989/m3u/main/Gather.m3u',
		//'YanG-1989-Adult[NSFW]': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/YanG-1989/m3u/main/Adult.m3u',
		'YueChan-IPV6': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/YueChan/Live/main/IPTV.m3u',
		'YueChan-Radio': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/YueChan/Live/main/Radio.m3u',
		'BESTV': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/Ftindy/IPTV-URL/main/bestv.m3u',
		'半路捡来的': 'https://agit.ai/Yoursmile7/TVBox/raw/branch/master/live.txt',
		'四千加': 'https://qu.ax/kBip.m3u',
		'AK47': 'https://qu.ax/HtMB.txt',
		//'蜂蜜18+': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/FongMi/CatVodSpider/main/txt/adult.txt',
		//'MV系列': 'https://qu.ax/oiNH.txt',
		'武哥': 'https://qu.ax/LEPk.txt',
		'iptv-org-country-cn': 'https://iptv-org.github.io/iptv/countries/cn.m3u',
		'iptv-org-country-hk': 'https://iptv-org.github.io/iptv/countries/hk.m3u',
		'iptv-org-country-tw': 'https://iptv-org.github.io/iptv/countries/tw.m3u',
		'iptv-org-country-us': 'https://iptv-org.github.io/iptv/countries/us.m3u',
		'iptv-org-country-jp': 'https://iptv-org.github.io/iptv/countries/jp.m3u',
		'iptv-org-country-kr': 'https://iptv-org.github.io/iptv/countries/kr.m3u',
		'iptv-org-country-ru': 'https://iptv-org.github.io/iptv/countries/ru.m3u',
		'iptv-org-language-zho': 'https://iptv-org.github.io/iptv/languages/zho.m3u',
		'iptv-org-language-eng': 'https://iptv-org.github.io/iptv/languages/eng.m3u',
		'iptv-org-language-jpn': 'https://iptv-org.github.io/iptv/languages/jpn.m3u',
		'iptv-org-language-kor': 'https://iptv-org.github.io/iptv/languages/kor.m3u',
		'iptv-org-category-movies': 'https://iptv-org.github.io/iptv/categories/movies.m3u',
		'iptv-org-category-music': 'https://iptv-org.github.io/iptv/categories/music.m3u',
		'test-type-txt': 'https://myernestlu.github.io/zby.txt',
	};

	async load() {
		await this.registerSetting({
			title: '内置源',
			key: 'builtin',
			type: 'radio',
			description: '选择为 "none" 时启用下方自定义源',
			defaultValue: '',
			options: this.#iptvlist
		});
		await this.registerSetting({
			title: '自定义源',
			key: 'source',
			type: 'input',
			description: 'IPTV 源地址',
			defaultValue: this.#iptvurl
		});
	}
	async createFilter(filter) {
		const opts = {"全部": "全部"};
		this.#cacheItems.length > 0 && this.#cacheItems.forEach(v => {
			v.group && (opts[v.group] = v.group);
		})
		return {
			"data": {
				title: "",
				max: 1,
				min: 1,
				default: "全部",
				options: opts,
			}
		}
	}
	async req(path) {
		const res = await fetch(path, {
			method: 'GET',
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
				'Miru-Url': path
			}
		});
		if (res.ok) {
			return await res.text();
		}
	}
	// 最近更新
	async latest(page) {
		if (page > 1) {
			return [];
		}
		const builtin = await this.getSetting('builtin');
		let baseUrl = builtin ? builtin : await this.getSetting('source');
		if (!baseUrl) {
			throw 'No valid address set!';
		}
		const ext = baseUrl.slice(baseUrl.lastIndexOf('.')).toLowerCase();
		const res = await this.req(baseUrl);
		let content = res
			.replace(/\r?\n/g, '\n')
			.replace(/\n+/g, '\n')
			.replace(/^\n+/, '')
			.replace(/\n+$/, '');

		const bangumi = [];
		if (ext === '.m3u' || ~content.search(/#EXTM3U/i)) {
			content
				.concat('\n')
				.replace(/\,([^,]+)\n(https?:\/\/.+)\n/g, ',$1,$2\n')
				.replace(/\n+$/, '')
				// fix
				.replace(/^#EXTINF:-1,tvg/gm, '#EXTINF:-1 tvg')
				.split('\n')
				.forEach((item) => {
					if (~item.search(/^#EXTINF:/)) {
						const [tmp, title, url] = item.split(',', 3);
						let cover = tmp.match(/tvg\-logo\="([^"]+)"/)?.[1] || '';
						let tid;
						if (!cover && (tid = tmp.match(/tvg\-name\="([^"]+)"/))) {
							cover = `https://epg.112114.xyz/logo/${tid[1]}.png`;
						}
						bangumi.push({
							title,
							url,
							cover,
							group: tmp.match(/group\-title\="([^"]+)"/)?.[1] || ''
						});
					}
				});
		} else if (ext === '.txt' || ~content.search(/#genre#/i)) {
			let group = '', tmp;
			content.split('\n').forEach((item) => {
				tmp = item.split(',');
				if (tmp.length !== 2) {
					return;
				}
				const [title, url] = tmp;
				// 获取分组名称
				if (url === '#genre#') {
					group = title;
					return;
				}
				bangumi.push({
					title,
					url,
					cover: `https://epg.112114.xyz/logo/${title}.png`,
					group
				});
			});
		}

		return (this.#cacheItems = bangumi);
	}
	// 搜索
	async search(kw, page, filter) {
		if (page > 1) {
			return [];
		}
		const fit = filter.data[0];
		// 无过滤
		const bangumi = this.#cacheItems;
		if (fit === "全部") {
			return !kw ? bangumi : bangumi.filter(v => ~v.title.indexOf(kw));
		}
		return bangumi.filter(v => (v.group && v.group === fit) && (kw ? ~v.title.indexOf(kw) : true));
	}
	// 详情
	async detail(url) {
		const bangumi = this.#cacheItems.find((v) => v.url === url);
		// 多地址处理
		const parseUrls = function(item) {
			const urls = item.url.split('#');
			const l = urls.length;
			return urls.map((v, i) => {
				return {
					name: l > 1 ? `${item.title} [源${i + 1}]` : `${item.title}`,
					url: v
				};
			})
		};
		bangumi.episodes = [
			{
				title: bangumi.title,
				urls: parseUrls(bangumi)
			}
		];
		if (bangumi.group) {
			const groups = this.#cacheItems
				.filter((v) => v.group === bangumi.group)
				.map((v) => parseUrls(v)) || [];

			if (groups.length > 0) {
				bangumi.episodes.push({
					title: bangumi.group,
					urls: groups.flat()
				})
			}
		}
		return bangumi;
	}
	// 观看
	async watch(url) {
		return {
			type: 'hls',
			url: url
		};
	}
}
