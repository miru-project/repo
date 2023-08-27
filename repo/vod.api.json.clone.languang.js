// ==MiruExtension==
// @name         蓝光影视
// @version      v0.0.1
// @author       Horis
// @lang         zh-cn
// @license      MIT
// @package      vod.api.json.clone.languang
// @type         bangumi
// @webSite      https://
// ==/MiruExtension==

class VodExtension extends Extension {
  api = ''
  headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
  }
  videoInfoCache = {}

  async latest(page) {
    const res = await this.callApi({ action: 'videolist', page })
    res.list.forEach(item => {
      this.videoInfoCache[item.vod_id] = item
    })
    return res.list.map(item => ({
      title: item.vod_name,
      url: item.vod_id.toString(),
      cover: item.vod_pic,
      //desc: item.vod_content,
      update: item.vod_remarks
    }))
  }

  async search(kw, page) {
    var res
    if (kw.split(',').every(s => isNumeric(s))) {
      res = await this.callApi({ ids: kw, action: 'videolist' })
    } else {
      res = await this.callApi({ query: kw, page, action: 'videolist' })
    }
    res.list.forEach(item => {
      this.videoInfoCache[item.vod_id] = item
    })
    return res.list.map(item => ({
      title: item.vod_name,
      url: item.vod_id.toString(),
      cover: item.vod_pic,
      //desc: item.vod_content,
      update: item.vod_remarks
    }))
  }

  async detail(url) {
    const item =
      this.videoInfoCache[url] ||
      (await this.callApi({ ids: url, action: 'videolist' })).list[0]
    const servers = item.vod_play_from.split('$$$')
    const episodes = []

    loop: for (const [index, playlist] of Object.entries(
      item.vod_play_url.split('$$$')
    )) {
      const urls = []
      for (const info of rtrim(playlist, '#').split('#')) {
        const [episodeName, playUrl] = info.split('$')
        if (!playUrl.endsWith('.m3u8')) {
          continue loop
        }
        urls.push({
          name: episodeName,
          url: playUrl
        })
      }
      episodes.push({
        title: servers[index],
        urls
      })
    }
    var desc = item.vod_blurb
    if (!desc) {
      desc = item.vod_content
    }

    return {
      title: item.vod_name,
      cover: item.vod_pic,
      desc,
      episodes
    }
  }

  async watch(url) {
    return {
      type: 'hls',
      url
    }
  }

  async callApi({ query, page = 0, ids, type, pageSize, action = 'list' }) {
    var params = `?ac=${action}`
    if (query) {
      params += `&wd=${encodeURIComponent(query)}`
    } else if (ids) {
      params += `&ids=${ids}`
    }
    if (page > 0) {
      params += `&pg=${page}`
    }
    if (type) {
      params += `&t=${type}`
    }
    if (pageSize) {
      params += `&pagesize=${pageSize}`
    }
    const options = {
      headers: {
        ...this.headers,
        Referer: this.api + params,
        'Miru-Url': this.api
      },
      method: 'get'
    }
    return await this.request(params, options)
  }
}

class Ext extends VodExtension {
  api = 'http://www.zzrhgg.com/api.php/provide/vod/'
}

function rtrim(str, ch) {
  let i = str.length
  while (i-- && str.charAt(i) === ch);
  return str.substring(0, i + 1)
}

function isNumeric(str) {
  if (typeof str != 'string') return false // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  )
}
