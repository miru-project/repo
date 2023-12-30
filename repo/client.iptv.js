// ==MiruExtension==
// @name         IPTV Client
// @version      v0.0.1
// @author       vvsolo
// @lang         zh-cn
// @license      MIT
// @package      client.iptv
// @type         bangumi
// @icon         https://live.fanmingming.com/logo.png
// @webSite      https://live.fanmingming.com/
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
	#bangumi = [];
	// ipv6.m3u v6.m3u
	#iptvurl = 'https://live.fanmingming.com/tv/m3u/ipv6.m3u';

	async req(path) {
		const baseUrl = path.split('/').slice(0, 3).join('/') + '/';
		return await this.request(path.replace(baseUrl, '/'), {
			headers: {
				Referer: path,
				'Miru-Url': baseUrl
			}
		});
	}
	async load() {
		await this.registerSetting({
			title: '地址',
			key: 'source',
			type: 'text',
			description: 'M3U 地址',
			defaultValue: this.#iptvurl
		});
	}
	// 最近更新
	async latest(page) {
		if (page > 1) {
			return [];
		}
		const baseUrl = await this.getSetting('source');
		const res = await this.req(baseUrl);
		const bangumi = [];
		// 读取数据内容
		res
			.replace(/\r?\n/g, '\n')
			.replace(/\n+/g, '\n')
			.replace(/^\n+/, '')
			.replace(/\n+$/, '')
			.concat('\n')
			.replace(/\,([^,]+)\n(https?:\/\/.+)\n/g, ',$1,$2\n')
			.replace(/\n+$/, '')
			.split('\n')
			.forEach((item) => {
				if (~item.search(/^#EXTINF:/)) {
					const [tmp, title, url] = [...item.split(',')];
					bangumi.push({
						title,
						url,
						cover: tmp.match(/tvg\-logo\="([^"]+)"/)[1] || '',
						group: tmp.match(/group\-title\="([^"]+)"/)[1] || ''
					});
				}
			});

		return (this.#bangumi = bangumi);
	}
	// 搜索
	async search(kw, page) {
		return this.#bangumi.filter(
			(v) => ~v.title.indexOf(kw) || (v.group && ~v.group.indexOf(kw))
		);
	}
	// 详情
	async detail(url) {
		let tmp = this.#bangumi.filter((v) => v.url === url)[0];
		// 获取相同组别的频道
		let groups = this.#bangumi
			.filter((v) => v.group === tmp.group)
			.map((v) => {
				return {
					name: v.title,
					url
				};
			});
		tmp.episodes = [
			{
				title: tmp.title,
				urls: [
					{
						name: tmp.title,
						url: tmp.url
					}
				]
			},
			{
				title: tmp.group,
				urls: groups
			}
		];
		return tmp;
	}
	// 观看
	async watch(url) {
		let tmp = this.#bangumi.filter((v) => {
			return v.url === url;
		})[0];
		return {
			type: 'hls',
			url: tmp.url
		};
	}
}
