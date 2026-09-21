// ==MiruExtension==
// @name         FlameComics
// @version      v0.0.2
// @author       bethro
// @lang         en
// @license      MIT
// @icon         https://flamecomics.xyz/favicon.ico
// @package      flamecomics.com
// @type         manga
// @webSite      https://flamecomics.xyz/
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        const baseUrl = await this.getSetting("flamecomics");
        return this.request(url, {
            headers: {
                "Miru-Url": baseUrl,
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "Flame Comics Base URL",
            key: "flamecomics",
            type: "input",
            desc: "This is the URL where the comics are fetched from",
            defaultValue: "https://flamecomics.xyz",
        });
    }

    async getNextData(res) {
        const str = typeof res === "string" ? res : JSON.stringify(res || {});
        const match = str.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (!match) return null;
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            return null;
        }
    }

    async getFullUrl(url) {
        const baseUrl = (await this.getSetting("flamecomics")) || "https://flamecomics.xyz";
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        return `${baseUrl.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    async latest(page) {
        if (page > 1) return [];
        const res = await this.req("/browse");
        const nextData = await this.getNextData(res);
        if (!nextData) return [];

        const seriesList = nextData.props?.pageProps?.series || [];
        return seriesList.map((item) => {
            const cover = item.cover?.startsWith("http")
                ? item.cover
                : `https://cdn.flamecomics.xyz/uploads/images/series/${item.series_id}/${item.cover}`;
            return {
                url: `/series/${item.series_id}`,
                cover: cover,
                title: item.title,
            };
        });
    }

    async search(kw, page) {
        if (page > 1) return [];
        const res = await this.req("/browse");
        const nextData = await this.getNextData(res);
        if (!nextData) return [];

        const seriesList = nextData.props?.pageProps?.series || [];
        const filtered = seriesList.filter((item) =>
            item.title && item.title.toLowerCase().includes(kw.toLowerCase())
        );

        return filtered.map((item) => {
            const cover = item.cover?.startsWith("http")
                ? item.cover
                : `https://cdn.flamecomics.xyz/uploads/images/series/${item.series_id}/${item.cover}`;
            return {
                url: `/series/${item.series_id}`,
                cover: cover,
                title: item.title,
            };
        });
    }

    async detail(url) {
        const fullUrl = await this.getFullUrl(url);
        const res = await this.request("", {
            headers: {
                "Miru-Url": fullUrl,
            },
        });
        const nextData = await this.getNextData(res);
        if (!nextData) return {};

        const pageProps = nextData.props?.pageProps || {};
        const series = pageProps.series || {};
        const chapters = pageProps.chapters || [];

        const title = series.title || "";
        const cover = series.cover?.startsWith("http")
            ? series.cover
            : `https://cdn.flamecomics.xyz/uploads/images/series/${series.series_id}/${series.cover}`;
        const rawDesc = series.description || "";
        const desc = rawDesc.replace(/<[^>]+>/g, "").trim();

        const episodeList = chapters.map((ch) => ({
            name: ch.chapter ? `Chapter ${ch.chapter}` : `Chapter ${ch.chapter_id}`,
            url: `/series/${series.series_id}/${ch.token}`,
        }));

        return {
            title,
            cover,
            desc,
            episodes: [
                {
                    title: "Chapters",
                    urls: episodeList,
                },
            ],
        };
    }

    async watch(url) {
        const fullUrl = await this.getFullUrl(url);
        const res = await this.request("", {
            headers: {
                "Miru-Url": fullUrl,
            },
        });
        const nextData = await this.getNextData(res);
        if (!nextData) return { urls: [] };

        const chProps = nextData.props?.pageProps?.chapter || {};
        const imagesObj = chProps.images || {};
        const seriesId = chProps.series_id;
        const token = chProps.token;

        const images = Object.values(imagesObj).map((img) => {
            return `https://cdn.flamecomics.xyz/uploads/images/series/${seriesId}/${token}/${img.name}`;
        });

        return {
            urls: images,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        };
    }
}
