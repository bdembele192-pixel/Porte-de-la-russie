/* Contenu pédagogique dans la langue choisie : Académie (cours, points à retenir, quiz de fin de module),
   parcours Quiz, glossaire (infobulles) et missions « Krachs historiques ».
   Le français reste la référence (courses*.js, quizbank.js, glossary.js, missions.js). Les traductions sont dans
   js/content/<langue>.js, chargées seulement quand la langue est choisie. Une traduction manquante retombe
   sur le français, élément par élément : on peut donc compléter une langue petit à petit. */
window.M = window.M || {};
M.CONTENT_I18N = M.CONTENT_I18N || {};

(function () {
  const LANGS = ["en", "zh", "ru"];
  let FR = null, applied = "fr";
  const loading = {};

  // Copie du texte français d'origine, prise une seule fois (après le chargement de tous les contenus)
  function snapshot() {
    if (FR) return;
    FR = {
      c: (M.COURSES || []).map(c => ({ title: c.title, sub: c.sub, level: c.level, lessons: c.lessons.map(l => [l.h, l.body]), key: (c.key || []).slice(), quiz: (c.quiz || []).map(x => [x.q, x.o.slice(), x.why]) })),
      q: (M.QUIZ_UNITS || []).map(u => ({ t: u.t, sub: u.sub, q: u.q.map(x => [x.q, x.o ? x.o.slice() : null, x.e]) })),
      g: Object.fromEntries(Object.entries(M.GLOSSARY || {}).map(([k, v]) => [k, [v.t, v.d]])),
      m: (M.MISSIONS || []).map(m => ({ title: m.title, year: m.year, diff: m.diff, teaser: m.teaser, story: m.story, lesson: m.lesson }))
    };
  }
  const pick = (t, i, f) => (t && t[i] != null && t[i] !== "") ? t[i] : f;

  function apply(lang) {
    snapshot();
    const T = lang === "fr" ? null : M.CONTENT_I18N[lang] || null;
    const tc = (T && T.c) || {}, tq = (T && T.q) || {}, tg = (T && T.g) || {}, tm = (T && T.m) || {};
    (M.COURSES || []).forEach((c, ci) => {
      const o = FR.c[ci], t = tc[c.id];
      if (!o) return;
      c.title = pick(t, "title", o.title); c.sub = pick(t, "sub", o.sub); c.level = pick(t, "level", o.level);
      c.lessons.forEach((l, i) => { const x = t && t.lessons && t.lessons[i]; l.h = pick(x, 0, o.lessons[i][0]); l.body = pick(x, 1, o.lessons[i][1]); });
      if (c.key) c.key = o.key.map((k, i) => pick(t && t.key, i, k));
      (c.quiz || []).forEach((x, i) => {
        const y = t && t.quiz && t.quiz[i], f = o.quiz[i];
        x.q = pick(y, 0, f[0]); x.why = pick(y, 2, f[2]);
        x.o = f[1].map((v, j) => pick(y && y[1], j, v));
      });
    });
    (M.QUIZ_UNITS || []).forEach((u, ui) => {
      const o = FR.q[ui], t = tq[u.id];
      if (!o) return;
      u.t = pick(t, "t", o.t); u.sub = pick(t, "sub", o.sub);
      u.q.forEach((x, i) => {
        const y = t && t.q && t.q[i], f = o.q[i];
        x.q = pick(y, 0, f[0]); x.e = pick(y, 2, f[2]);
        if (f[1]) x.o = f[1].map((v, j) => pick(y && y[1], j, v));
      });
    });
    Object.entries(M.GLOSSARY || {}).forEach(([k, v]) => {
      const o = FR.g[k]; if (!o) return;
      v.t = pick(tg[k], 0, o[0]); v.d = pick(tg[k], 1, o[1]);
    });
    (M.MISSIONS || []).forEach((m, mi) => {
      const o = FR.m[mi], t = tm[m.id];
      if (!o) return;
      ["title", "year", "diff", "teaser", "story", "lesson"].forEach(f => { m[f] = pick(t, f, o[f]); });
    });
    applied = lang;
    document.documentElement.setAttribute("data-content-lang", lang);
  }

  function load(lang) {
    if (M.CONTENT_I18N[lang]) return Promise.resolve(true);
    if (!loading[lang]) loading[lang] = new Promise(res => {
      const s = document.createElement("script");
      s.src = "js/content/" + lang + ".js";
      s.onload = () => res(!!M.CONTENT_I18N[lang]);
      s.onerror = () => { delete loading[lang]; res(false); };
      document.head.appendChild(s);
    });
    return loading[lang];
  }

  // Aligne le contenu sur la langue des réglages ; redessine la page si la traduction arrive après coup
  M.contentLang = {
    get current() { return applied; },
    sync() {
      const s = (M.state && M.state.settings) || {};
      const lang = LANGS.includes(s.lang) ? s.lang : "fr";
      if (lang === applied && (lang === "fr" || M.CONTENT_I18N[lang])) return;
      if (lang === "fr" || M.CONTENT_I18N[lang]) { apply(lang); return; }
      load(lang).then(ok => {
        if (!ok) return;
        const now = LANGS.includes(((M.state && M.state.settings) || {}).lang) ? M.state.settings.lang : "fr";
        if (now !== lang) return;
        apply(lang);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      });
    },
    apply, load
  };
})();
