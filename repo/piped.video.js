// ==MiruExtension==
// @name         Piped
// @version      v0.0.1
// @author       bethro
// @lang         all
// @license      MIT
// @icon         https://piped.video/img/icons/android-chrome-192x192.png
// @package      piped.video
// @type         bangumi
// @webSite      https://piped.video
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        return this.request(url, {
            headers: {
                "Miru-Url": await this.getSetting("piped"),
            },
        });
    }

    async load() {
        this.registerSetting({
            title: "PIPED INSTANCE",
            key: "piped",
            type: "input",
            description: "url piped instance api",
            defaultValue: "https://pipedapi.kavin.rocks",
        });

        this.registerSetting({
            title: "DEFAULT QUALITY",
            key: "quality",
            type: "input",
            description: "default video quality",
            defaultValue: "480p",
        });
    }

    async latest(page) {
        const res = await this.req(`/trending?region=US`);
        return res.map((item) => ({
            url: item.url,
            title: item.title,
            cover: item.thumbnail,
        }));
    }

    async search(kw, page) {
        const res = await this.req(`/search?q=${kw}&filter=all`);
        let streams = res.items.filter((item) => item.type == "stream");

        return streams.map((item) => {
            return {
                url: item.url,
                title: item.title || item.name,
                cover: item.thumbnail,
            };
        });
    }
    async detail(url) {
        const videoID = url.split("v=").pop();
        const res = await this.req(`/streams/${videoID}`);

        let preferredQuality = await this.getSetting("quality");
        const sortEpisodes = (episodes) =>
            episodes.sort((a, b) => {
                const qualityA = a.title.toLowerCase();
                const qualityB = b.title.toLowerCase();

                if (qualityA === preferredQuality) return -1;
                if (qualityB === preferredQuality) return 1;
                return qualityA.localeCompare(qualityB);
            });

        let episodes = sortEpisodes(
            res.videoStreams.map((item, index) => {
                const audioStream = res.audioStreams[index] || res.audioStreams[0];
                const combinedURL = `${item.url}|${audioStream ? audioStream.url : ''}|${videoID}`;
                return {
                    title: item.quality,
                    urls: [{ name: res.title, url: combinedURL }],
                };
            })
        );


        return {
            title: res.title,
            cover: res.thumbnailUrl,
            desc: res.description,
            episodes,
        };
    }

    async watch(url) {
        const [videoUrl, audioUrl, videoID] = url.split("|");
        const sub = await this.req(`/streams/${videoID}`);

        const subtitles = sub.subtitles.map((item) => ({
            title: item.name,
            url: item.url,
            language: item.code,
        }));

        return {
            type: "hls",
            url: videoUrl,
            audioTrack: audioUrl,
            subtitles: subtitles,
        };
    }
}
