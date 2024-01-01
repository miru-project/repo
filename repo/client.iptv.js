// ==MiruExtension==
// @name         MyIPTV
// @description  A simple IPTV client
// @version      v0.0.2
// @author       vvsolo
// @lang         zh-cn
// @license      MIT
// @package      client.iptv
// @type         bangumi
// @icon         https://avatars.githubusercontent.com/u/55937028?s=48&v=4
// @webSite      https://
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
	#cacheItems = [];
	#iptvurl = 'https://live.fanmingming.com/tv/m3u/ipv6.m3u';
	#iptvlist = {
		'none': '',
		'Kids-English': 'https://cdn.jsdelivr.net/gh/abskmj/iptv-youtube-live@gh-pages/kids-english.m3u8',
		'Fanmingming-IPV6': 'https://live.fanmingming.com/tv/m3u/ipv6.m3u',
		'Fanmingming-IPV4': 'https://live.fanmingming.com/tv/m3u/v6.m3u',
		'MyIPTV-IPV6': 'https://qu.ax/nazV.m3u',
		'MyIPTV-IPV4': 'https://qu.ax/atTi.m3u',
		'YanG-1989-Gather': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/YanG-1989/m3u/main/Gather.m3u',
		//'Adult-IPTV': 'http://adultiptv.net/chs.m3u',
		//'Adult-IPTV-Vod': 'http://adultiptv.net/videos.m3u8',
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
		'iptv-org-ctry-cn': 'https://iptv-org.github.io/iptv/countries/cn.m3u',
		'iptv-org-ctry-hk': 'https://iptv-org.github.io/iptv/countries/hk.m3u',
		'iptv-org-ctry-tw': 'https://iptv-org.github.io/iptv/countries/tw.m3u',
		'iptv-org-ctry-jp': 'https://iptv-org.github.io/iptv/countries/jp.m3u',
		'iptv-org-ctry-kr': 'https://iptv-org.github.io/iptv/countries/kr.m3u',
		'iptv-org-ctry-ru': 'https://iptv-org.github.io/iptv/countries/ru.m3u',
		'iptv-org-lang-zho': 'https://iptv-org.github.io/iptv/languages/zho.m3u',
		'iptv-org-lang-jpn': 'https://iptv-org.github.io/iptv/languages/jpn.m3u',
		'iptv-org-lang-kor': 'https://iptv-org.github.io/iptv/languages/kor.m3u',
		'iptv-org-movies': 'https://iptv-org.github.io/iptv/categories/movies.m3u',
		'Japanese-TV': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/luongz/iptv-jp/main/jp.m3u',
		'Thai-TV1': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/akkradet/IPTV-THAI/master/FREETV.m3u',
		'Thai-TV2': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/akkradet/IPTV-THAI/master/FREETV2.m3u',
		'Turkish-TV': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/keyiflerolsun/IPTV_YenirMi/master/Kanallar/KekikAkademi.m3u',
		'German-TV': 'https://github.moeyy.xyz/https://raw.githubusercontent.com/josxha/german-tv-m3u/main/german-tv.m3u',
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
			let title, cover, tid, group, tmp;
			content
				.concat('\n')
				.split('\n')
				.forEach((item) => {
					if (item.startsWith('#EXTINF:')) {
						title = item.slice(item.lastIndexOf(',') + 1).trim();
						cover = item.match(/tvg\-logo\="([^"]+)"/)?.[1] || '';
						if (!cover && (tid = item.match(/tvg\-name\="([^"]+)"/))) {
							cover = `https://epg.112114.xyz/logo/${tid[1]}.png`;
						}
						group = item.match(/group\-title\="([^"]+)"/)?.[1] || '';
					} else if (
						item.startsWith('http') &&
						~item.search(/\.(?:m3u8?|mp4|mp3|mkv|mov|avi|flv)/i) &&
						title
					) {
						bangumi.push({
							title,
							url: item.trim(),
							cover,
							group
						});
					}
				});
		} else if (ext === '.txt' || ~content.search(/#genre#/i)) {
			let group, tmp;
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
