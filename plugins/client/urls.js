const platforms = [
  {
    name: "YouTube",
    domains: [
      "youtube.com", "youtu.be", "yt.be", "youtube-nocookie.com",
      "youtubekids.com", "youtubeeducation.com", "youtube.googleapis.com",
      "music.youtube.com", "gaming.youtube.com", "studio.youtube.com",
    ],
    regex: /(^|\.)youtube\.[a-z]{2,3}(\.[a-z]{2})?$/,
  },
  {
    name: "Instagram",
    domains: ["instagram.com", "instagr.am", "ig.me", "l.instagram.com"],
  },
  {
    name: "Facebook",
    domains: [
      "facebook.com", "fb.com", "fb.watch", "fb.me", "fb.gg",
      "m.facebook.com", "web.facebook.com", "mbasic.facebook.com",
      "l.facebook.com", "m.me", "messenger.com",
    ],
  },
  {
    name: "Twitter",
    domains: [
      "twitter.com", "x.com", "t.co", "mobile.twitter.com",
      "vxtwitter.com", "fxtwitter.com", "fixupx.com", "fixvx.com", "nitter.net",
    ],
  },
  {
    name: "Pinterest",
    domains: ["pinterest.com", "pin.it", "pinimg.com"],
    regex: /(^|\.)pinterest\.[a-z]{2,3}(\.[a-z]{2})?$/,
  },
  {
    name: "GitHub",
    domains: ["github.com", "gist.github.com", "raw.githubusercontent.com", "githubusercontent.com"],
  },
  {
    name: "Spotify",
    domains: [
      "spotify.com", "open.spotify.com", "play.spotify.com",
      "spotify.link", "spotify.app.link", "spoti.fi", "spotify.cloud",
    ],
  },
  {
    name: "TikTok",
    domains: [
      "tiktok.com", "vm.tiktok.com", "vt.tiktok.com", "m.tiktok.com",
      "www.tiktok.com", "tiktokv.com", "tiktokcdn.com",
    ],
  },
];


module.exports = {
  platforms,
};