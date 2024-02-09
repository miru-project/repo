// ==MiruExtension==
// @name         Animxer
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://cdn.jsdelivr.net/gh/TechShreyash/AnimeDex@main/static/img/favicon.ico
// @package      animxer.xyz
// @type         bangumi
// @webSite      https://api.anime-dex.workers.dev
// ==/MiruExtension==

export default class extends Extension {
  async search(kw, page) {
    const res = await this.request(`/search/${kw}?page=${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id.toString(),
      cover: item.img,
    }));
  }

  async latest(page) {
    const res = await this.request(`/recent/${page}`);
    return res.results.map((item) => ({
      title: item.title,
      url: item.id.split("-episode-")[0],
      cover: item.image,
    }));
  }

  async detail(url) {
    const res = await this.request(`/anime/${url}`);
    return {
      title: res.results.name,
      cover: res.results.image,
      desc: res.results.plot_summary,
      episodes: [
        {
          title: "Directory",
          urls: res.results.episodes.map(([number, id]) => ({
            name: `Episode ${number}`,
            url: id,
          })),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request(`/episode/${url}`);

    // Function to extract the file URL from the sources array
    const getFileFromSources = (sources) => {
      if (Array.isArray(sources) && sources.length > 0) {
        const sourceWithFile = sources.find((source) => source.file);
        return sourceWithFile ? sourceWithFile.file : null;
      }
      return null;
    };

    // Try to get the file URL from the primary sources array
    let sourceUrl = getFileFromSources(res.results.stream.sources);

    // If the primary sources array did not yield a valid file URL, try the backup sources array
    if (!sourceUrl) {
      sourceUrl = getFileFromSources(res.results.stream.sources_bk);
    }

    // Throw an error if no valid file URL was found in either array
    if (!sourceUrl) {
      throw new Error("No streaming sources available");
    }

    return {
      type: "hls",
      url: sourceUrl,
    };
  }
}
