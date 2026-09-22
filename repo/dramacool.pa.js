// ==MiruExtension==
// @name         DramaCool
// @version      v0.0.6
// @author       OshekharO
// @lang         en
// @license      MIT
// @icon         https://asianc.id/template/images/icon_120x120.png
// @package      dramacool.pa
// @type         bangumi
// @webSite      https://asianc.id
// ==/MiruExtension==

export default class extends Extension {
  async req(url) {
    const baseUrl = await this.getSetting("dramacool");
    const formattedUrl = url.startsWith("/") ? url : `/${url}`;
    return this.request("", {
      headers: {
        "Miru-Url": `${baseUrl}${formattedUrl}`,
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "Dramacool API",
      key: "dramacool",
      type: "input",
      description: "Dramacool Website Url",
      defaultValue: "https://asianc.id",
    });
  }

  async latest(page) {
    const res = await this.req(`/recently-added?page=${page}`);
    const ulMatch = res.match(/<ul class="[^"]*list-episode-item[^"]*">([\s\S]*?)<\/ul>/);
    const bangumi = [];
    if (!ulMatch) return bangumi;

    const lis = ulMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/g) || [];
    for (const li of lis) {
      const hrefMatch = li.match(/href="([^"]+)"/);
      const imgMatch = li.match(/data-original="([^"]+)"/) || li.match(/src="([^"]+)"/);
      const titleMatch = li.match(/<h3[^>]*>([^<]+)<\/h3>/);

      if (hrefMatch && imgMatch && titleMatch) {
        const href = hrefMatch[1].trim();
        if (!href || href === "#" || href === "/drama-list") continue;
        const title = titleMatch[1].trim();
        const cover = imgMatch[1].trim();

        const slug = href.replace(/^\//, "");

        bangumi.push({
          title,
          url: slug,
          cover,
        });
      }
    }
    return bangumi;
  }

  async detail(url) {
    let cleanUrl = url.replace(/^\//, "");
    if (!cleanUrl.startsWith("drama-detail/")) {
      cleanUrl = "drama-detail/" + cleanUrl.replace(/-episode-\d+\.html$/, "");
    }

    const res = await this.req(`/${cleanUrl}`);

    const titleMatch = res.match(/<h1>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const coverMatch = res.match(/<div class="img">\s*<img[^>]+src="([^"]+)"/) || res.match(/<img[^>]+data-original="([^"]+)"/);
    const cover = coverMatch ? coverMatch[1].trim() : "";

    let desc = "";
    const ps = res.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
    for (const pTag of ps) {
      const cleanP = pTag.replace(/<[^>]+>/g, "").trim();
      if (cleanP && !cleanP.includes(":") && cleanP.length > 20) {
        desc = cleanP;
        break;
      }
    }

    const epUlMatch = res.match(/<ul class="[^"]*list-episode-item[^"]*">([\s\S]*?)<\/ul>/);
    const episodes = [];
    if (epUlMatch) {
      const epLis = epUlMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/g) || [];
      for (const ep of epLis) {
        const hrefMatch = ep.match(/href="([^"]+)"/);
        const epTitleMatch = ep.match(/<h3[^>]*>([^<]+)<\/h3>/) || ep.match(/<span class="title">([^<]+)<\/span>/);
        if (hrefMatch) {
          const epUrl = hrefMatch[1].replace(/^\//, "");
          const epName = epTitleMatch ? epTitleMatch[1].trim() : epUrl;
          episodes.push({
            name: epName,
            url: epUrl,
          });
        }
      }
      episodes.reverse();
    }

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Directory",
          urls: episodes,
        },
      ],
    };
  }

  async search(kw, page) {
    const res = await this.req(`/search?keyword=${encodeURIComponent(kw)}&page=${page}`);
    const ulMatch = res.match(/<ul class="[^"]*list-episode-item[^"]*">([\s\S]*?)<\/ul>/) || res.match(/<ul class="[^"]*switch-block[^"]*">([\s\S]*?)<\/ul>/);
    const bangumi = [];
    if (!ulMatch) return bangumi;

    const lis = ulMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/g) || [];
    for (const li of lis) {
      const hrefMatch = li.match(/href="([^"]+)"/);
      const imgMatch = li.match(/data-original="([^"]+)"/) || li.match(/src="([^"]+)"/);
      const titleMatch = li.match(/<h3[^>]*>([^<]+)<\/h3>/);

      if (hrefMatch && imgMatch && titleMatch) {
        const href = hrefMatch[1].trim();
        if (!href || href === "#" || href === "/drama-list") continue;
        const title = titleMatch[1].trim();
        const cover = imgMatch[1].trim();

        const slug = href.replace(/^\//, "");

        bangumi.push({
          title,
          url: slug,
          cover,
        });
      }
    }
    return bangumi;
  }

  async watch(url) {
    const cleanUrl = url.replace(/^\//, "");
    let res = "";
    try {
      res = await this.req(`/${cleanUrl}`);
    } catch (e) {
      // ignore
    }

    let embedUrl = "";
    if (res) {
      const dataVideoMatches = res.match(/data-video="([^"]+)"/g) || [];
      for (const item of dataVideoMatches) {
        const vUrl = item.match(/data-video="([^"]+)"/)[1];
        if (vUrl && vUrl.includes("vidbasic")) {
          embedUrl = vUrl.startsWith("//") ? "https:" + vUrl : vUrl;
          break;
        }
      }
      if (!embedUrl) {
        const iframeMatch = res.match(/<iframe[\s\S]*?src="([^"]+)"/i);
        if (iframeMatch) {
          const iframeSrc = iframeMatch[1];
          embedUrl = iframeSrc.startsWith("//") ? "https:" + iframeSrc : iframeSrc;
        }
      }
    }

    if (!embedUrl) {
      throw new Error("Embed video URL not found");
    }

    const embedRes = await this.request("", {
      headers: {
        "Miru-Url": embedUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://asianc.id/",
      },
    });

    const playerIframeMatch = embedRes.match(/<iframe[^>]*id="embedvideo"[^>]*src="([^"]+)"/i) || embedRes.match(/<iframe[^>]*src="([^"]+)"/i);
    let playerUrl = playerIframeMatch ? playerIframeMatch[1].trim() : "";
    if (playerUrl && playerUrl.startsWith("/")) {
      const parts = embedUrl.split("/");
      const origin = parts[0] + "//" + parts[2];
      playerUrl = origin + playerUrl;
    }

    if (!playerUrl) {
      throw new Error("3rdplayer URL not found");
    }

    const playerRes = await this.request("", {
      headers: {
        "Miru-Url": playerUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": embedUrl,
      },
    });

    const cryptoMatch = playerRes.match(/data-value=["']([^"']+)["']/);
    if (!cryptoMatch) {
      throw new Error("Crypto data not found in player page");
    }

    const encryptedData = cryptoMatch[1];
    let keyStr = "94588293375053432799222445521289";
    let ivStr = "5259228356829423";

    const keyMatch = playerRes.match(/key=CryptoJS\[[^\]]+\]\[[^\]]+\]\[[^\]]+\]\(([^)]+)\)/);
    const ivMatch = playerRes.match(/iv=CryptoJS\[[^\]]+\]\[[^\]]+\]\[[^\]]+\]\(([^)]+)\)/);

    if (keyMatch && keyMatch[1]) {
      const parsed = keyMatch[1].replace(/['"\s+]/g, "");
      if (parsed) keyStr = parsed;
    }
    if (ivMatch && ivMatch[1]) {
      const parsed = ivMatch[1].replace(/['"\s+]/g, "");
      if (parsed) ivStr = parsed;
    }

    let streamUrl = await this.decryptAesCbc(encryptedData, keyStr, ivStr);
    if (!streamUrl || !streamUrl.startsWith("http")) {
      throw new Error("Decrypted stream URL is invalid: " + streamUrl);
    }

    return {
      type: "hls",
      url: streamUrl,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Origin": "https://vidbasic.top",
        "Referer": "https://vidbasic.top/",
      },
    };
  }

  async decryptAesCbc(base64Data, keyStr, ivStr) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    const b64decode = (str) => {
      let strClean = str.replace(/=+$/, "");
      let bytes = [];
      for (let i = 0; i < strClean.length; i += 4) {
        let b1 = chars.indexOf(strClean.charAt(i));
        let b2 = chars.indexOf(strClean.charAt(i + 1));
        let b3 = chars.indexOf(strClean.charAt(i + 2));
        let b4 = chars.indexOf(strClean.charAt(i + 3));
        let c1 = (b1 << 2) | (b2 >> 4);
        let c2 = ((b2 & 15) << 4) | (b3 >> 2);
        let c3 = ((b3 & 3) << 6) | b4;
        bytes.push(c1);
        if (b3 !== -1 && b3 !== 64) bytes.push(c2);
        if (b4 !== -1 && b4 !== 64) bytes.push(c3);
      }
      return bytes;
    };

    const strToBytes = (str) => {
      let bytes = [];
      for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
      }
      return bytes;
    };

    const cipherBytes = b64decode(base64Data);
    const keyBytes = strToBytes(keyStr);
    const ivBytes = strToBytes(ivStr);

    const S = [
      0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
      0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
      0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
      0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
      0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
      0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
      0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
      0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
      0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
      0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
      0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
      0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
      0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
      0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
      0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
      0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
    ];

    const Si = [];
    for (let i = 0; i < 256; i++) Si[S[i]] = i;

    const Rcon = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

    const Nk = keyBytes.length / 4;
    const Nr = Nk + 6;

    const w = [];
    for (let i = 0; i < Nk; i++) {
      w[i] = [keyBytes[4 * i], keyBytes[4 * i + 1], keyBytes[4 * i + 2], keyBytes[4 * i + 3]];
    }
    for (let i = Nk; i < 4 * (Nr + 1); i++) {
      let temp = [w[i - 1][0], w[i - 1][1], w[i - 1][2], w[i - 1][3]];
      if (i % Nk === 0) {
        temp = [S[temp[1]], S[temp[2]], S[temp[3]], S[temp[0]]];
        temp[0] ^= Rcon[Math.floor(i / Nk)];
      } else if (Nk > 6 && i % Nk === 4) {
        temp = [S[temp[0]], S[temp[1]], S[temp[2]], S[temp[3]]];
      }
      w[i] = [
        w[i - Nk][0] ^ temp[0],
        w[i - Nk][1] ^ temp[1],
        w[i - Nk][2] ^ temp[2],
        w[i - Nk][3] ^ temp[3],
      ];
    }

    const mul = (a, b) => {
      let p = 0;
      for (let i = 0; i < 8; i++) {
        if (b & 1) p ^= a;
        let hi = a & 0x80;
        a = (a << 1) & 0xff;
        if (hi) a ^= 0x1b;
        b >>= 1;
      }
      return p;
    };

    const invMixColumns = (s) => {
      for (let c = 0; c < 4; c++) {
        let s0 = s[0][c], s1 = s[1][c], s2 = s[2][c], s3 = s[3][c];
        s[0][c] = mul(s0, 0x0e) ^ mul(s1, 0x0b) ^ mul(s2, 0x0d) ^ mul(s3, 0x09);
        s[1][c] = mul(s0, 0x09) ^ mul(s1, 0x0e) ^ mul(s2, 0x0b) ^ mul(s3, 0x0d);
        s[2][c] = mul(s0, 0x0d) ^ mul(s1, 0x09) ^ mul(s2, 0x0e) ^ mul(s3, 0x0b);
        s[3][c] = mul(s0, 0x0b) ^ mul(s1, 0x0d) ^ mul(s2, 0x09) ^ mul(s3, 0x0e);
      }
    };

    const addRoundKey = (s, round) => {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          s[r][c] ^= w[round * 4 + c][r];
        }
      }
    };

    const decryptBlock = (block) => {
      let s = [
        [block[0], block[4], block[8], block[12]],
        [block[1], block[5], block[9], block[13]],
        [block[2], block[6], block[10], block[14]],
        [block[3], block[7], block[11], block[15]],
      ];

      addRoundKey(s, Nr);

      for (let round = Nr - 1; round >= 0; round--) {
        let t0 = s[1][3], t1 = s[1][0], t2 = s[1][1], t3 = s[1][2];
        s[1] = [t0, t1, t2, t3];

        t0 = s[2][2]; t1 = s[2][3]; t2 = s[2][0]; t3 = s[2][1];
        s[2] = [t0, t1, t2, t3];

        t0 = s[3][1]; t1 = s[3][2]; t2 = s[3][3]; t3 = s[3][0];
        s[3] = [t0, t1, t2, t3];

        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            s[r][c] = Si[s[r][c]];
          }
        }

        addRoundKey(s, round);

        if (round > 0) {
          invMixColumns(s);
        }
      }

      let out = [];
      for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 4; r++) {
          out.push(s[r][c]);
        }
      }
      return out;
    };

    let decrypted = [];
    let prevBlock = ivBytes;

    for (let i = 0; i < cipherBytes.length; i += 16) {
      let block = [];
      for (let k = 0; k < 16; k++) block[k] = cipherBytes[i + k];
      let blockOut = decryptBlock(block);
      for (let j = 0; j < 16; j++) {
        decrypted.push(blockOut[j] ^ prevBlock[j]);
      }
      prevBlock = block;
    }

    let padLen = decrypted[decrypted.length - 1];
    let plainBytes = decrypted.slice(0, decrypted.length - padLen);
    let str = "";
    for (let i = 0; i < plainBytes.length; i++) {
      str += String.fromCharCode(plainBytes[i]);
    }
    return str;
  }
}
