// ==MiruExtension==
// @name         media.ccc.de
// @version      v0.0.1
// @author       Christian Weiske
// @lang         en
// @license      AGPL
// @icon         https://media.ccc.de/favicon-96x96.png
// @package      de.ccc.media
// @type         bangumi
// @webSite      https://api.media.ccc.de
// @description  Video material provided by the Chaos Computer Club
// @nsfw         false
// ==/MiruExtension==

/**
 * Implementation details:
 *
 * - Resolutions: We can return only one resolution for now:
 *   https://github.com/miru-project/miru-app/issues/311
 *   We provide virtual seasons; one season for each format: full hd, sd, mp3, opus
 *
 * - Conferences show each lecture as an "episode", with no details apart from the title.
 *   Finding a lecture via search gives much more details, and allows to
 *   see all of the available formats.
 *
 * @link https://github.com/voc/voctoweb
 * @link https://media.ccc.de/
 */
export default class extends Extension {
    // Latest updates
    async latest(page) {
        if (page > 1) {
            return [];
        }

        const res = await this.request('/public/conferences');
        let conferences = res.conferences;

        //no event date -> no videos
        conferences = conferences.filter(function(conference) {
            return conference.event_last_released_at !== null;
        });

        //order by last released video/event
        conferences.sort(
            function (confA, confB) {
                return new Date(confB.event_last_released_at) - new Date(confA.event_last_released_at);
            }
        );

        return conferences.map(conference => ({
            title: conference.title,
            url: conference.url,
            cover: conference.logo_url
        }));
    }

    async latestEvents(page) {
        const res = await this.request('/public/events/recent?page=' + (page ?? 1));
        return res.events.map(event => ({
            title: event.title,
            url: event.url,
            cover: event.thumb_url
        }));
    }

    async search(kw, page, filter) {
        if (filter.type[0] === 'conference') {
            return this.searchConference(kw, page, filter);
        }
        return this.searchEvent(kw, page, filter);
    }

    async searchConference(kw, page, filter) {
        if (kw == '') {
            return this.latest(page);
        }

        const res = await this.request('/public/conferences');
        let conferences = res.conferences;

        //no event date -> no videos
        conferences = conferences.filter(function(conference) {
            return conference.event_last_released_at !== null;
        });

        //order by last released video/event
        conferences.sort(
            function (confA, confB) {
                return new Date(confB.event_last_released_at) - new Date(confA.event_last_released_at);
            }
        );

        //filter by keyword
        kw = kw.toLocaleLowerCase();
        let keywords = kw.split(' ');
        conferences = conferences.filter(function (conference) {
            let lowerTitle = conference.title.toLocaleLowerCase();
            for (var i = 0; i < keywords.length; i++) {
                if (!lowerTitle.includes(keywords[i])) {
                    return false;
                }
            }
            return true;
        });

        return conferences.map(conference => ({
            title: conference.title,
            url: conference.url,
            cover: conference.logo_url
        }));
    }

    async searchEvent(kw, page, filter) {
        if (kw == '') {
            return this.latestEvents(page);
        }

        const res = await this.request(
            '/public/events/search?page=' + (page ?? 1) + '&q=' + encodeURIComponent(kw)
        );
        return res.events.map(event => ({
            title: event.title,
            url: event.url,
            cover: event.thumb_url
        }));
    }

    // Details for a conference or a single event/video
    async detail(url) {
        url = this.removeHost(url);
        if (url.startsWith('/public/conferences/')) {
            return this.detailConference(url);
        }

        return this.detailEvent(url);
    }

    // Conference details
    async detailConference(url) {
        const conference = await this.request(url);

        let urls = conference.events.map(event => ({
            name: event.title,
            url: 'event:' + event.url
        }));
        urls.sort(
            function (urlA, urlB) {
                var nameA = urlA.name.toUpperCase();
                var nameB = urlB.name.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                } else if (nameA > nameB) {
                    return 1;
                }
                return 0;
            }
        );

        let urlsSd = urls.map(function (url) {
            return {
                name: url.name,
                url: url.url + '#sd',
            }
        });
        let urlsMp3 = urls.map(function (url) {
            return {
                name: url.name,
                url: url.url + '#mp3',
            }
        });
        let urlsOpus = urls.map(function (url) {
            return {
                name: url.name,
                url: url.url + '#opus',
            }
        });

        return {
            title: conference.title,
            cover: conference.logo_url,
            desc: conference.description,
            episodes: [
                {
                    title: '1080p Full HD',
                    urls: urls
                },
                {
                    title: '720p SD',
                    urls: urlsSd
                },
                {
                    title: 'Audio .mp3',
                    urls: urlsMp3
                },
                {
                    title: 'Audio .opus',
                    urls: urlsOpus
                }
            ],
        };
    }

    async detailEvent(url) {
        const event = await this.request(url);

        let recordings = event.recordings.filter(function(recording) {
            if (recording.mime_type === 'video/webm') {
                return false;
            } else if (recording.mime_type === 'application/x-subrip') {
                return false;
            }
            return true;
        });

        recordings.sort(
            function (recordingA, recordingB) {
                //videos first
                if (recordingA.mime_type != recordingB.mime_type) {
                    if (recordingB.mime_type === 'video/mp4') {
                        return 1;
                    } else if (recordingA.mime_type === 'video/mp4') {
                        return -1;
                    }
                }
                let resA = recordingA.width * recordingA.height;
                let resB = recordingB.width * recordingB.height;
                return resB - resA;
            }
        );

        let urls = [];
        for (let i = 0; i < recordings.length; i++) {
            let recording = recordings[i];
            let resolution = recording.width + 'x' + recording.height;
            let name = '';
            if (recording.mime_type === 'video/mp4') {
                if (recording.height == 1080) {
                    name = 'Full HD (' + resolution + ')';
                } else if (recording.height == 720) {
                    name = 'SD (' + resolution + ')';
                } else {
                    name = resolution;
                }
            } else if (recording.mime_type === 'video/webm') {
                continue;
            } else if (recording.mime_type === 'audio/mpeg') {
                name = 'Audio .mp3';
            } else if (recording.mime_type === 'audio/ogg') {
                name = 'Audio .ogg';
            } else if (recording.mime_type === 'audio/opus') {
                name = 'Audio .opus';
            } else {
                name = recording.mime_type + ' ' + resolution;
            }
            name = name + ' ' + recording.language;
            urls.push({
                name: name,
                url: recording.recording_url,
            });
        }

        let obj = {
            title: event.title,
            cover: event.poster_url,
            desc: event.description
                + "\n"
                + "\nPersonen: " + event.persons.join(', ')
                + "\nVeröffentlichung: " + (new Date(event.release_date)).toLocaleString()
                + "\nKonferenz: " + event.conference_title
                + "\nSprache: " + event.original_language,
            episodes: [
                {
                    title: 'Formate',
                    urls: urls
                }
            ]
        };

        return obj;
    }

    /**
     * Watch: play video recording
     *
     * @param string url Either direct video/audio URL, or event/lecture URL
     *                   when prefixed with "event:"
     */
    async watch(url) {
        if (!url.startsWith('event:')) {
            //direct url
            return {
                'type': 'mp4',
                url: url
            };
        }
        //strip off "event:"
        url = url.substr(6);

        url = this.removeHost(url);
        // split off our mode selector: fullhd, sd, mp3, opus
        let parts = url.split('#');
        url = parts[0];
        let mode = parts[1] ?? 'fullhd';

        const event = await this.request(url);

        let recordings = event.recordings.filter(function(recording) {
            if (mode === 'mp3') {
                return recording.mime_type === 'audio/mpeg';
            } else if (mode === 'opus') {
                return recording.mime_type === 'audio/opus';
            }
            //miru wants mp4 for videos
            return recording.mime_type === 'video/mp4';
        });

        if (mode === 'sd') {
            recordings = event.recordings.filter(function(recording) {
                return recording.height <= 720;
            });
        }

        recordings.sort(
            function (recordingA, recordingB) {
                let resA = recordingA.width * recordingA.height;
                let resB = recordingB.width * recordingB.height;
                return resB - resA;
            }
        );

        return {
            type: 'mp4',
            url: recordings[0].recording_url,
        };
    }

    async createFilter() {
        return {
            type: {
                title: 'Listenanzeige',
                min: 1,
                max: 1,
                default: 'conference',
                options: {
                    'conference': 'Konferenzen',
                    'events': 'Vorträge',
                }
            }
        };
    }

    removeHost(url) {
        url = url.replace('https://api.media.ccc.de', '');//make relative
        url = url.replace('https://media.ccc.de', '');//make relative
        return url;
    }
}
