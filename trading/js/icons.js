/* Icônes vectorielles au trait (style applis natives). Usage : M.icon("home") → <svg>. */
window.M = window.M || {};

(function () {
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    live: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    missions: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    swipe: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    lab: '<path d="M9 3h6"/><path d="M10 3v6.5L4.6 18.8A1.5 1.5 0 0 0 5.9 21h12.2a1.5 1.5 0 0 0 1.3-2.2L14 9.5V3"/><path d="M7.5 15h9"/>',
    quiz: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    academy: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2.5 9 2.5 12 0v-5"/><path d="M22 10v5"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    ai: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4"/><circle cx="12" cy="3" r="1"/><path d="M9 13v1.5M15 13v1.5"/><path d="M2 14h2M20 14h2"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6.5-4-9.5-1.2 2-2.2 3-3.5 3.3C11.7 6.5 11 4.3 9 2c0 4-5 6.5-5 13 0 4 3.5 7 8 7z"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A4.6 4.6 0 0 0 21 9.8C21 6 17 3 12 3z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    compass: '<circle cx="12" cy="12" r="9.5"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
    flag: '<path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/>',
    brain: '<path d="M9.5 3A3 3 0 0 0 6.5 6a3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3 2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 9.5 3z"/><path d="M14.5 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3 2.5 2.5 0 0 1-2.5-2.5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    ticket: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="M14 7v10"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 16-10 17z"/><path d="M2 22c3-4 6-7 11-10"/>',
    virus: '<circle cx="12" cy="12" r="5"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5M4.9 4.9l3.5 3.5M15.6 15.6l3.5 3.5M4.9 19.1l3.5-3.5M15.6 8.4l3.5-3.5"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    merge: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
    bank: '<path d="M3 21h18M3 10h18M5 6l7-3 7 3"/><path d="M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>',
    vote: '<path d="m9 12 2 2 4-4"/><path d="M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12H5z"/><path d="M22 19H2"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13 7 22l5-3 5 3-1.2-9"/>',
    yen: '<path d="m12 10 5-7M12 10 7 3M12 10v11M7 13h10M7 17h10"/>',
    trending: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    magnet: '<path d="M6 3v8a6 6 0 0 0 12 0V3"/><path d="M6 3h4v8a2 2 0 0 0 4 0V3h4M6 7h4M14 7h4"/>',
    scale: '<path d="M12 3v18M5 21h14M3 7h18"/><path d="m6 7-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
    shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v4M8 19h4"/>',
    sprout: '<path d="M7 21h10M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 10c0-3 2-5 6-5 0 3-2 5-6 5z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    waves: '<path d="M2 7c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 13c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 19c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/>',
    crown: '<path d="m2 18 2-11 5 5 3-7 3 7 5-5 2 11z"/><path d="M4 21h16"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3a3 3 0 0 1-3 4M7 5H4a3 3 0 0 0 3 4"/>',
    skull: '<path d="M12 3a8 8 0 0 0-5 14.2V21h10v-3.8A8 8 0 0 0 12 3z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10 21v-3M14 21v-3"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>',
    lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m4.9 4.9 4.3 4.3M14.8 14.8l4.3 4.3M14.8 9.2l4.3-4.3M4.9 19.1l4.3-4.3"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 9.5a6 6 0 1 1-6 6"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>',
    pause: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
    star: '<path d="m12 2 3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z"/>'
  };
  const sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' +
    Object.entries(P).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join("") + "</svg>";
  M.IC = {
    level: ["sprout", "eye", "book", "chart", "waves", "shield", "bot", "crown"],
    course: { bases: "compass", instruments: "layers", styles: "clock", technique: "chart", indicateurs: "sliders", strategies: "flag", algos: "bot", risque: "shield", psycho: "brain", macro: "globe", reel: "lock", afrique: "map", fondamentale: "search", options: "ticket", crypto2: "key", forex: "repeat", plan: "edit", argent: "leaf" },
    unit: { u1: "compass", u2: "sliders", u3: "layers", u4: "chart", u5: "live", u6: "shield", u7: "brain", u8: "bot", u9: "globe", u10: "map", u11: "lock" },
    mission: { covid: "virus", doge: "rocket", luna: "moon", merge: "merge", ftx: "flame", etf: "bank", yen: "yen", election: "vote", tariffs: "receipt", gold: "award" },
    algo: { trend: "rocket", breakout: "trending", meanrev: "magnet", pairs: "scale" },
    badge: { first_trade: "play", first_stop: "shield", first_win: "coins", liquidated: "skull", mission_1: "missions", survivor: "lifebuoy", mission_all: "book", swipe_game: "swipe", swipe_7: "eye", lab_run: "lab", lab_compare: "flag", course_1: "academy", course_all: "brain", quiz_perfect: "check", coach_90: "target", streak_3: "flame", quiz_first: "quiz", quiz_combo: "zap", quiz_all: "award", ai_saved: "lifebuoy" }
  };
  M.iconPath = n => P[n];
  // Icône d'app : le logo, ou une icône au trait sur fond sombre avec dégradé
  M.appIconSVG = (name, size = 64) => {
    if (!name || name === "logo" || !P[name]) return M.logoSVG(size);
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2C46B"/><stop offset=".55" stop-color="#A855F7"/><stop offset="1" stop-color="#FF3D9A"/></linearGradient></defs><rect x="5" y="5" width="54" height="54" rx="15" fill="#0B0910" stroke="url(#lga)" stroke-width="2.5"/><g transform="translate(14 14) scale(1.5)" fill="none" stroke="url(#lga)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[name]}</g></svg>`;
  };
  M.ico = (kind, id, cls = "") => M.icon((M.IC[kind] && M.IC[kind][id]) || "star", cls);
  // Logo : flamme (la « mèche ») dans un losange, liseré façon bogolan
  M.logoSVG = (size = 32) => `<svg class="logo-svg" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lgm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2C46B"/><stop offset=".55" stop-color="#A855F7"/><stop offset="1" stop-color="#FF3D9A"/></linearGradient></defs><rect x="5" y="5" width="54" height="54" rx="15" fill="#0B0910" stroke="url(#lgm)" stroke-width="2.5"/><path d="M32 11c4 7 12 12 12 23a12 12 0 0 1-24 0c0-6 4-9 6-13 1 4 3 6 5 6-1-5 0-10 1-16z" fill="url(#lgm)"/><path d="M32 30c2 3 5 5 5 9a5 5 0 0 1-10 0c0-3 3-5 5-9z" fill="#0B0910"/><path d="M13 52l4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4" stroke="#F2C46B" stroke-width="1.6" fill="none" opacity=".85"/></svg>`;
  M.icon = (name, cls = "") => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  /* Remplace automatiquement les emojis de l'interface par des icônes vectorielles. */
  const EMO = {
    "🔥": "flame", "⚠": "alert", "🎯": "target", "📚": "layers", "📖": "book", "⏱": "clock", "🧪": "lab", "🏁": "flag", "🏆": "trophy", "🐢": "trending",
    "📷": "camera", "🖼": "image", "⬇": "download", "⬆": "upload", "💸": "coins", "💰": "coins", "🗑": "trash", "✅": "check", "❌": "x", "💡": "quiz",
    "📰": "globe", "🔁": "refresh", "⚡": "zap", "⏳": "missions", "🎓": "academy", "🧠": "brain", "🦉": "quiz", "🚀": "rocket", "🔒": "lock", "🔐": "lock",
    "🛡": "shield", "📡": "live", "📝": "edit", "🧭": "compass", "🎉": "star", "💯": "check", "🌊": "waves", "🐋": "waves", "💀": "skull", "🪂": "shield",
    "🎬": "play", "🧘": "leaf", "🔮": "eye", "🌀": "refresh", "😤": "alert", "📐": "chart", "⭐": "star", "📱": "phone", "✉": "mail", "☁": "cloud",
    "🔀": "shuffle", "🧮": "calculator", "▶": "play", "⏸": "pause", "⏭": "play", "👉": "trending", "📈": "chart", "📉": "trending", "🤖": "bot", "🌍": "globe",
    "🏦": "bank", "💎": "star", "👑": "crown", "🥇": "award", "🏅": "award", "🛟": "lifebuoy", "📊": "chart", "🔔": "bell", "💾": "database", "🎨": "palette",
    "👤": "profile", "⚙": "settings", "🧭": "compass", "⏹": "pause", "🔍": "search", "🔎": "search", "🗓": "clock", "📅": "clock", "🧰": "layers", "🎛": "sliders"
  };
  const SEV = { "🔴": "#FF4D6D", "🟠": "#FF9F43", "🟡": "#FFD23D", "🟢": "#2BEA8B", "●": null };
  const RX = /(\p{Extended_Pictographic})\uFE0F?/gu;
  const SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|CANVAS|svg|SVG)$/;
  function swap(node) {
    const t = node.nodeValue;
    if (!t || !RX.test(t)) return;
    RX.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0, m;
    while ((m = RX.exec(t))) {
      if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      const e = m[1];
      if (SEV[e]) { const i = document.createElement("i"); i.className = "sev"; i.style.background = SEV[e]; frag.appendChild(i); }
      else if (EMO[e]) { const sp = document.createElement("span"); sp.className = "ei"; sp.innerHTML = M.icon(EMO[e]); frag.appendChild(sp); }
      last = m.index + m[0].length;
    }
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last).replace(/^ (?=\S)/, last ? " " : "")));
    node.parentNode.replaceChild(frag, node);
  }
  M.deEmoji = function (root) {
    if (!root) return;
    if (root.nodeType === 3) { if (root.parentElement && !SKIP.test(root.parentElement.tagName)) swap(root); return; }
    if (root.nodeType !== 1 || SKIP.test(root.tagName)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !SKIP.test(n.parentElement.tagName) && !n.parentElement.closest(".chart-legend, select") ? 1 : 2 });
    const list = []; let n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(swap);
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("afterbegin", sprite);
    M.deEmoji(document.body);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(M.deEmoji))).observe(document.body, { childList: true, subtree: true });
    // Remplace les emojis des zones marquées data-icon par l'icône vectorielle
    document.querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = M.icon(el.dataset.icon); });
    document.querySelectorAll("[data-logo]").forEach(el => { el.innerHTML = M.logoSVG(+el.dataset.logo || 32); });
  });
})();
