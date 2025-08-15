// ==MiruExtension==
// @name         AniLiberty
// @version      v0.0.4
// @author       Virus (viridius-hub)
// @lang         ru
// @license      MIT
// @icon         https://anilibria.top/static/favicon-96x96.png
// @package      aniliberty
// @type         bangumi
// @webSite      https://aniliberty.top/api/v1
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    async load() {
        this.registerSetting({
            title: "AniLiberty",
            key: "domain_aniliberty",
            type: "input",
            description: "AniLiberty Domain",
            defaultValue: "https://aniliberty.top",
        });
    }

    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("domain_aniliberty"),
            },
        });
    }

    async latest(page) {
        console.log(url);
        return []
    }

    async detail(url) {
        console.log(url);
        return {}
    }

    async search(kw, page) {
        console.log(url);
        return []
    }

    async watch(url) {
        console.log(url);
        return {}
    }
}
