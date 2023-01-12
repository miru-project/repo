// ==MiruUserScript==
// @name         动漫之家(kk151)
// @version      0.0.1
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         http://www.yinghuacd.com/js/20180601/0601.png
// ==/MiruUserScript==


const miru = new Miru("https://www.kk151.com");

function getCover(url) {
    if (url.indexOf("http") == -1) {
        return `https://www.kk151.com${url}`
    }
    return url
}

// 搜索
miru.search = async (kw, page) => {
    const bangumi = []
    const res = await miru.request(`/search.php?page=${page}&searchword=${kw}`);
    let pattern = /<div class="video-list1 clearfix">([\s\S]+?)<div class="page clearfix">/g;
    const bangumisStr = pattern.exec(res)[0]
    pattern = /<div class="col-md-12 col-sm-6 col-xs-12 p0">([\s\S]+?)<div class="subtitle">/g
    const m = bangumisStr.match(pattern)
    m.forEach(e => {
        const cover = /background: url\((.+?)\);/
        const title = /title="(.+?)"/
        const url = /href="(.+?)"/
        bangumi.push({
            title: e.match(title)[1],
            cover: getCover(e.match(cover)[1]),
            url: e.match(url)[1],
        })
    })
    return bangumi
};

// 详情
miru.info = async (url) => {
    const res = await miru.request(url);
    const desc = res.match(/id="plot">([\s\S]+?)<\/div>/)[1].replace(/<[^>]+>/ig, "")
    const title = res.match(/<h4 class="media-heading">(.+?)<\/h4>/)[1]
    const cover = getCover(res.match(/background: url\((.+?)\);/)[1])
    const watchUrlGroupsStr = res.match(/<dd([\s\S]+?)<\/dd>/g)
    const watchurl = new Map()
    let i = 0
    if (watchUrlGroupsStr) {
        watchUrlGroupsStr.forEach(e => {
            let group = []
            let lis = e.match(/<li>([\s\S]+?)<\/li>/g)
            if (!lis) {
                return
            }
            lis.forEach(e => {
                const name = e.match(/">(.+?)<\/a>/)[1]
                const url = e.match(/href='(.+?)'/)[1]
                group.push({
                    name,
                    url
                })
            })
            watchurl.set(`线路${++i}`, group)
        })
    }
    return {
        watchurl,
        desc,
        cover,
        title
    }
};

// 最近更新
miru.new = async () => {
    const bangumi = []
    const res = await miru.request(`/search.php?searchtype=5&tid=0`);
    let pattern = /<div class="video-list1">([\s\S]+?)<div class="page clearfix">/g;
    const bangumisStr = pattern.exec(res)[0]
    pattern = /<div class="col-md-4 col-sm-6 col-xs-12 p0">([\s\S]+?)<div class="subtitle">/g
    const m = bangumisStr.match(pattern)
    m.forEach(e => {
        const cover = /background: url\((.+?)\);/
        const title = /title="(.+?)"/
        const url = /href="(.+?)"/
        bangumi.push({
            title: e.match(title)[1],
            cover: getCover(e.match(cover)[1]),
            url: e.match(url)[1],
        })
    })
    return bangumi
}

// 观看
miru.watch = async (url) => {
    const res = await miru.request(url)
    return {
        type: "player",
        src: res.match(/now="(.+?)"/)[1]
    }
}

return miru


