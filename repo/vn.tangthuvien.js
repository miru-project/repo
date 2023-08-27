// ==MiruExtension==
// @name         Tàng thư viện
// @version      v0.0.1
// @author       Moleys
// @lang         vi
// @license      MIT
// @icon         https://truyen.tangthuvien.vn/images/icon-favico.png
// @package      vn.tangthuvien
// @type         fikushon
// @webSite      https://truyen.tangthuvien.vn
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    decodeHTML(text) {
        const entityMap = {
            '&Agrave;': 'À',
            '&Aacute;': 'Á',
            '&Acirc;': 'Â',
            '&Atilde;': 'Ã',
            '&Egrave;': 'È',
            '&Eacute;': 'É',
            '&Ecirc;': 'Ê',
            '&Igrave;': 'Ì',
            '&Iacute;': 'Í',
            '&Ograve;': 'Ò',
            '&Oacute;': 'Ó',
            '&Ocirc;': 'Ô',
            '&Otilde;': 'Õ',
            '&Ugrave;': 'Ù',
            '&Uacute;': 'Ú',
            '&Yacute;': 'Ý',
            '&agrave;': 'à',
            '&aacute;': 'á',
            '&acirc;': 'â',
            '&atilde;': 'ã',
            '&egrave;': 'è',
            '&eacute;': 'é',
            '&ecirc;': 'ê',
            '&igrave;': 'ì',
            '&iacute;': 'í',
            '&ograve;': 'ò',
            '&oacute;': 'ó',
            '&ocirc;': 'ô',
            '&otilde;': 'õ',
            '&ugrave;': 'ù',
            '&uacute;': 'ú',
            '&yacute;': 'ý',
            '&#039;' : "'",
            '&#034;' : '"',
            '&nbsp;' : ' ',

        };
        const numericEntityPattern = /&#[0-9]+;/g;
        return text.replace(/&[A-Za-z]+;|&#[0-9]+;/g, match => {
            if (entityMap[match]) {
                return entityMap[match];
            } else if (numericEntityPattern.test(match)) {
                const numericValue = match.slice(2, -1);
                return String.fromCharCode(parseInt(numericValue, 10));
            }
            return match;
        });
    }

    
    async latest(page) {
        const res = await this.request(`/tong-hop?rank=vw&page=${page}`)
        const ul = /class="book-img-text"([\s\S]+?)\/ul/g.exec(res)[0]
        const liList = ul.match(/<li>([\s\S]+?)<\/li>/g)
        const manga = []
        liList.forEach(element => {
            const url = "/doc-truyen/" + element.match(/href="https:\/\/truyen.tangthuvien.vn\/doc-truyen\/(.+?)"/)[1]
            let title = element.match(/<a.*?>(.*?)<\/a>/)[1]
            title = this.decodeHTML(title) 
            const cover = element.match(/src="(.+?)"/)[1]
            manga.push({
                title,
                url,
                cover
            })
        });
        return manga
    }

    async search(kw, page) {
        const res = await this.request(`/ket-qua-tim-kiem?term=${kw}&page=${page}`)
        const ul = /class="book-img-text"([\s\S]+?)\/ul/g.exec(res)[0]
        const liList = ul.match(/<li>([\s\S]+?)<\/li>/g)
        const manga = []
        liList.forEach(element => {
            const url = "/doc-truyen/" + element.match(/href="https:\/\/truyen.tangthuvien.vn\/doc-truyen\/(.+?)"/)[1]
            let title = element.match(/<a.*?>(.*?)<\/a>/)[1]
            title = this.decodeHTML(title) 
            const cover = element.match(/src="(.+?)"/)[1]
            manga.push({
                title,
                url,
                cover
            })
        });
        return manga
    }

    async detail(url) {
        const res = await this.request(`${url}`)
        const title = this.decodeHTML(res.match(/<h1>(.*?)<\/h1>/)[1]);
        const cover = res.match(/id="bookImg"\s+href="javascript:void\(0\);">\s*<img\s+src="([^"]+)"/)[1]
        let desc = this.decodeHTML(res.match(/<div class="book-intro">([\s\S]+?)<\/div>/)[1])
        desc = desc.replace(/<br\s*\/?>/g, '\n').replace(/\n\n/g,"\n").replace(/\n\n/g,"\n").replace(/<p>/g,"").replace(/<\/p>/g,"").trim()
        const story_id = res.match(/<input[^>]*\bvalue="(\d+)"[^>]*\/>/)[1];
        console.log(desc)
        const res_toc = await this.request(`/story/chapters?story_id=${story_id}`)
        let matches_volume = [...res_toc.matchAll(/<div class="divider-chap col-xs-12 form-group">(.+?)<\/div>\s*<ul>([\s\S]*?)<\/ul>/g)];
        let episodes = [];
        matches_volume.map((match) => {
            let volume_name = match[1];
            let ulContent = match[2];
            let matches = [...ulContent.matchAll(/<li\s+class="col-xs-6[^"]*"\s+title="([^"]+)"[^>]+>\s*<span[^>]+><\/span>\s*<a\s+class="[^"]*"\s+href="([^"]+)"[^>]+>\s*<span[^>]+>([^<]+)<\/span>/g)];
            let chapter = [];
            for (let i = 0; i < matches.length; i++) {
                let link = matches[i][2].trim();
                let name = this.decodeHTML(matches[i][3].trim());
                chapter.push({
                    url: link.replace("https://truyen.tangthuvien.vn", ""),
                    name: name
                });
            }
            let volume = {title: volume_name, urls: chapter}
            episodes.push(volume);
        });
        return {
            title,
            cover,
            desc,
            episodes
        }
    }

    async watch(url) {
        const res = await this.request(`/${url}`)
        const title = this.decodeHTML(res.match(/<h2>(.+?)<\/h2>/)[1].trim())
        let matches = res.match(/<div class="box-chap[^>]*>([\s\S]*?)<\/div>/)[1];
        let content = this.decodeHTML(matches).split(/\r?\n/).map(line => line.trim()).filter(line => line !== "")
        return {
            content,
            title,
        }
    }

}