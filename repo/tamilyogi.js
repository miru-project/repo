// ==MiruExtension==
// @name         TamilYogi
// @version      v0.0.5
// @author       appdevelpo
// @lang         hi-ta
// @license      MIT
// @icon         https://tamilyogi.express/wp-content/uploads/2021/06/ty.png
// @package      tamilyogi
// @type         bangumi
// @webSite      https://tamilyogi.express
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    async search(kw, page) {
        const path = page > 1 ? `/page/${page}/?s=${kw}` : `/?s=${kw}`;
        const res = await this.request(path);
        const cards = res.match(/<article class="movie-card">[\s\S]+?<\/article>/g) || [];
        const bangumi = [];
        cards.forEach((card) => {
            const urlMatch = card.match(/href="([^"]+)"/);
            const titleMatch = card.match(/<h3>([^<]+)<\/h3>/);
            const coverMatch = card.match(/src="([^"]+)"/);
            if (urlMatch && titleMatch) {
                bangumi.push({
                    title: titleMatch[1].trim(),
                    url: urlMatch[1],
                    cover: coverMatch ? coverMatch[1] : "",
                });
            }
        });
        return bangumi;
    }

    async latest(page) {
        const path = page > 1 ? `/movies/page/${page}/` : `/movies/`;
        const res = await this.request(path);
        const cards = res.match(/<article class="movie-card">[\s\S]+?<\/article>/g) || [];
        const bangumi = [];
        cards.forEach((card) => {
            const urlMatch = card.match(/href="([^"]+)"/);
            const titleMatch = card.match(/<h3>([^<]+)<\/h3>/);
            const coverMatch = card.match(/src="([^"]+)"/);
            if (urlMatch && titleMatch) {
                bangumi.push({
                    title: titleMatch[1].trim(),
                    url: urlMatch[1],
                    cover: coverMatch ? coverMatch[1] : "",
                });
            }
        });
        return bangumi;
    }

    async detail(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });

        const titleMatch = res.match(/<h1[^>]*>([\s\S]+?)<\/h1>/);
        let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "Unknown Title";

        const coverMatch = res.match(/<img[^>]+src="([^"]+)"[^>]*alt="[^"]*"/);
        const cover = coverMatch ? coverMatch[1] : "";

        const descMatch = res.match(/<div class="content-area"[^>]*>([\s\S]+?)<\/div>/);
        let desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "No description available.";

        const urls = [];
        const btnMatches = res.match(/<button[^>]+class="v3-btn[^"]*"[^>]*data-url="([^"]+)"[^>]*>[\s\S]+?<b>([^<]+)<\/b>/g) || [];
        btnMatches.forEach((btn) => {
            const embedMatch = btn.match(/data-url="([^"]+)"/);
            const nameMatch = btn.match(/<b>([^<]+)<\/b>/);
            if (embedMatch && nameMatch) {
                urls.push({
                    name: nameMatch[1].trim(),
                    url: embedMatch[1].trim(),
                });
            }
        });

        const episodes = [
            {
                title: "Directory",
                urls,
            },
        ];

        return {
            title,
            cover,
            desc,
            episodes,
        };
    }

    unpack(p, a, c, k) {
        const toBase = (n, b) => {
            const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return n < b ? chars[n] : toBase(Math.floor(n / b), b) + chars[n % b];
        };
        while (c--) {
            if (k[c]) {
                p = p.replace(new RegExp("\\b" + toBase(c, a) + "\\b", "g"), k[c]);
            }
        }
        return p;
    }

    async watch(url) {
        if (!url) {
            return {
                type: "hls",
                url: "",
            };
        }

        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
                "Referer": "https://tamilyogi.express/",
            },
        });

        let streamUrl = "";

        // Check packed JS (VidHide / Morencius / etc.)
        const packedMatch = res.match(/}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packedMatch) {
            try {
                const p = packedMatch[1];
                const a = parseInt(packedMatch[2]);
                const c = parseInt(packedMatch[3]);
                const k = packedMatch[4].split("|");
                const unpacked = this.unpack(p, a, c, k);
                const m3u8Match = unpacked.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/);
                if (m3u8Match) {
                    streamUrl = m3u8Match[0];
                }
            } catch (e) {
                console.error("Failed to unpack JS:", e);
            }
        }

        if (!streamUrl) {
            const m3u8Match = res.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/) || res.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
            if (m3u8Match) {
                streamUrl = m3u8Match[1];
            }
        }

        if (streamUrl) {
            try {
                const playlistRes = await this.request("", {
                    headers: {
                        "Miru-Url": streamUrl,
                        "Referer": url,
                    },
                });

                if (playlistRes && playlistRes.includes("#EXT-X-STREAM-INF")) {
                    const lines = playlistRes.split("\n");
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line.startsWith("#EXT-X-STREAM-INF")) {
                            const subLine = lines[i + 1] ? lines[i + 1].trim() : "";
                            if (subLine && !subLine.startsWith("#")) {
                                if (subLine.startsWith("http")) {
                                    streamUrl = subLine;
                                } else {
                                    const base = streamUrl.substring(0, streamUrl.lastIndexOf("/"));
                                    streamUrl = `${base}/${subLine}`;
                                }
                                break;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error resolving playlist:", e);
            }
        }

        return {
            type: "hls",
            url: streamUrl || url,
            headers: {
                "Referer": url,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        };
    }
}
