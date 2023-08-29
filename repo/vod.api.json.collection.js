// ==MiruExtension==
// @name         影视集合
// @version      v0.0.2
// @author       Horis
// @lang         zh-cn
// @license      MIT
// @package      vod.api.json.collection
// @type         bangumi
// @webSite      https://
// ==/MiruExtension==

export default class extends Extension {
  apis = {
    baidu: 'https://api.apibdzy.com/api.php/provide/vod/from/dbm3u8/',
    baofen: 'https://bfzyapi.com/api.php/provide/vod/',
    '394tv': 'https://www.394tv.com/api.php/provide/vod/',
    languang: 'http://www.zzrhgg.com/api.php/provide/vod/',
    lehuo: 'https://cj.vodimg.top/api.php/provide/vod/',
    oletv: 'https://olevod1.com/api.php/provide/vod/',
    piaoling: 'https://p2100.net/api.php/provide/vod/',
    shenmajuhe: 'https://img.smdyw.top/api.php/provide/vod/',
    yingmi: 'https://www.inmi.app/api.php/provide/vod/',
    yingtu: 'https://cj.vodimg.top/api.php/provide/vod/',
    damo: 'https://damozy.com/api.php/provide/vod/from/M3U8/',
    feifan: 'https://cj.ffzyapi.com/api.php/provide/vod/from/ffm3u8/',
    feisu: 'https://www.feisuzyapi.com/api.php/provide/vod/from/fsm3u8/',
    guangsu: 'https://api.guangsuapi.com/api.php/provide/vod/from/gsm3u8/',
    haiwaikan: 'https://api.haiwaikan.com/v1/vod',
    hongniu: 'https://www.hongniuzy2.com/api.php/provide/vod/from/hnm3u8/',
    ikun: 'https://ikunzyapi.com/api.php/provide/vod',
    jinying: 'https://jinyingzy.com/provide/vod/from/jinyingm3u8/',
    jisu: 'https://jszyapi.com/api.php/provide/vod/from/jsm3u8/',
    kuaiche: 'https://caiji.kczyapi.com/api.php/provide/vod/from/kcm3u8/',
    liangzi: 'https://cj.lziapi.com/api.php/provide/vod/from/lzm3u8/',
    qihu: 'https://caiji.qhzyapi.com/api.php/provide/vod/from/qhm3u8/',
    shandian: 'https://sdzyapi.com/api.php/provide/vod/from/sdm3u8/',
    shoujihanju: 'https://77hanju.com/api.php/provide/vod/from/mkm3u8/',
    subo: 'https://subocaiji.com/api.php/provide/vod/from/subm3u8/',
    taopian: 'https://taopianapi.com/cjapi/mc/vod/json/m3u8.html',
    tiankong: 'https://api.tiankongapi.com/api.php/provide/vod/from/tkm3u8/',
    uku: 'https://api.ukuapi.com/api.php/provide/vod/from/ukm3u8/',
    wolong: 'https://collect.wolongzyw.com/api.php/provide/vod/',
    wujin: 'https://api.wujinapi.me/api.php/provide/vod/from/wjm3u8/',
    xinlang:
      'https://api.xinlangapi.com/xinlangapi.php/provide/vod/from/xlm3u8/',
    yinghua: 'https://m3u8.apiyhzy.com/api.php/provide/vod/',
    youzhi: 'https://api.1080zyku.com/inc/apijson.php/provide/vod/'
  }

  api = 'https://api.apibdzy.com/api.php/provide/vod/from/dbm3u8/'
  headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
  }
  videoInfoCache = {}
  apiCategoryCache = {}
  defaultApiKey = null

  async latest(page) {
    let res
    if (!this.defaultApiKey) {
      for (const key of Object.keys(this.apis)) {
        this.api = this.apis[key]
        this.defaultApiKey = key
        try {
          res = await this.callApi({ page, action: 'videolist' })
          break
        } catch (error) {
          console.log(`源 ${key} 加载失败，自动切换到下一个源`)
        }
      }
    } else {
      res = await this.callApi({ page, action: 'videolist' })
    }

    res.list.forEach(item => {
      this.videoInfoCache[item.vod_id] = item
    })
    return res.list.map(item => ({
      title: item.vod_name,
      url: `${this.api}|${item.vod_id}`,
      cover: item.vod_pic,
      //desc: item.vod_content,
      update: item.vod_remarks
    }))
  }

  async createFilter(filter) {
    const api = {
      title: '源',
      min: 1,
      max: 1,
      default: this.defaultApiKey || 'baidu',
      options: {
        baidu: '百度影视',
        baofen: '暴风影视',
        '394tv': '39影视',
        languang: '蓝光影视',
        lehuo: '乐活影视',
        oletv: '欧乐影视',
        piaoling: '飘零影视',
        shenmajuhe: '神马聚合影视',
        yingmi: '映迷影视',
        yingtu: '影图影视',
        damo: '大漠影视',
        feifan: '非凡影视',
        feisu: '飞速影视',
        guangsu: '光速影视',
        haiwaikan: '海外看影视',
        hongniu: '红牛影视',
        ikun: 'iKun影视',
        jinying: '金鹰影视',
        jisu: '极速影视',
        kuaiche: '快车影视',
        liangzi: '量子影视',
        qihu: '奇虎影视',
        shandian: '闪电影视',
        shoujihanju: '手机韩剧影视',
        subo: '速播影视',
        taopian: '淘片影视',
        tiankong: '天空影视',
        uku: 'U酷影视',
        wolong: '卧龙影视',
        wujin: '无尽影视',
        xinlang: '新浪影视',
        yinghua: '樱花影视',
        youzhi: '优质影视'
      }
    }

    let apiKey = this.defaultApiKey || 'baidu'

    // 选择后切换 api
    if (filter && filter.api) {
      this.api = this.apis[filter.api[0]]
      apiKey = filter.api[0]
    }

    return {
      api,
      category: {
        title: '分类',
        max: 1,
        min: 1,
        default: 'all',
        options: {
          all: '全部',
          ...(await this.category(apiKey))
        }
      }
    }
  }

  async search(kw, page, filter) {
    const apiKey = filter?.api?.[0]
    const category = filter?.category?.[0]
    if (kw === '' && (!category || category === 'all')) {
      return this.latest(page)
    }
    let res
    if (kw && apiKey === 'haiwaikan') {
      res = await this.callApi({ query: kw, page })
      kw = res.list.map(item => item.vod_id).join()
    }
    if (kw.split(',').every(s => isNumeric(s))) {
      res = await this.callApi({ ids: kw, action: 'videolist' })
    } else if (category && category !== 'all') {
      res = await this.callApi({
        type: category,
        page,
        action: 'videolist'
      })
    } else {
      res = await this.callApi({ query: kw, page, action: 'videolist' })
    }
    res.list.forEach(item => {
      this.videoInfoCache[item.vod_id] = item
    })
    return res.list.map(item => ({
      title: item.vod_name,
      url: `${this.api}|${item.vod_id}`,
      cover: item.vod_pic,
      //desc: item.vod_content,
      update: item.vod_remarks
    }))
  }

  async detail(url) {
    var [api, url] = url.split('|')
    const item =
      this.videoInfoCache[url] ||
      (await this.callApi({ ids: url, action: 'videolist', api })).list[0]
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

  async category(apiKey) {
    if (this.apiCategoryCache[apiKey]) {
      return this.apiCategoryCache[apiKey]
    }
    try {
      const res = await this.callApi()
      const options = Object.fromEntries(
        res.class.map(item => [item.type_id, item.type_name])
      )
      this.apiCategoryCache[apiKey] = options
      return options
    } catch (error) {
      return {}
    }
  }

  async callApi({
    query,
    page = 0,
    ids,
    type,
    pageSize,
    action = 'list',
    api = this.api
  } = {}) {
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
        Referer: api + params,
        'Miru-Url': api
      },
      method: 'get'
    }
    return await this.request(params, options)
  }
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
