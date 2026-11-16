"""Habille le simulateur avec la logique de design de Mèche : barre latérale à icônes, cartes arrondies,
motif bogolan, typographies Montserrat / Inter, et les mêmes thèmes au choix (Or noir, Clair, Bamako,
Minuit, Sunset, Océan). S'applique par-dessus la page construite par build.py :
    python3 theme_meche.py index.html sortie.html"""
import re, sys

src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()

# ---------- 1. Couleurs de la version néon -> variables de thème ----------
TOK = {"#05060D": "bg0", "#0C0E20": "bg1", "#11142C": "bg2", "#161A38": "bg3", "#1E2348": "bg4", "#23284D": "border",
       "#363E72": "borderB", "#F3F5FF": "text0", "#C9CEEE": "text1", "#959DC8": "text2", "#6E76A6": "text3",
       "#4DE1FF": "accent", "#3DFFA8": "pos", "#FF4D8D": "neg", "#FFB547": "warn", "#FFE45C": "yellow",
       "#A66BFF": "purple", "#2EF2D0": "teal"}
for h, t in TOK.items():
    s = re.sub(re.escape(h), f"var(--t-{t})", s, flags=re.I)
RGBT = {"255,255,255": "text0", "61,255,168": "pos", "255,77,141": "neg", "77,225,255": "accent", "255,181,71": "warn",
        "255,228,92": "yellow", "166,107,255": "purple", "46,242,208": "teal", "54,62,114": "borderB", "149,157,200": "text2",
        "12,14,32": "bg1", "22,26,56": "bg1", "14,16,36": "bg2", "8,10,22": "bg1", "5,6,13": "bg0", "6,7,16": "bg0"}
for trip, t in RGBT.items():
    s = re.sub(r"rgba?\(\s*" + r",\s*".join(trip.split(",")) + r"(?=\s*[,)])", f"rgba(var(--t-{t}-rgb)", s)

# ---------- 2. Thèmes (mêmes noms et mêmes teintes que dans Mèche) ----------
THEMES = {
    "ornoir": ("Or noir", dict(bg0="#060606", bg1="#100E0C", bg2="#15120F", bg3="#1B1813", bg4="#231F18", border="#2A2316", borderB="#4A3B1F",
                                text0="#F5F1E8", text1="#CFC7B6", text2="#A39B8D", text3="#8F877A", accent="#E8B64C", pos="#2BEA8B", neg="#FF4D6D",
                                warn="#F5A524", yellow="#F5D98B", purple="#8B5CF6", teal="#2DD4BF", onacc="#160F03")),
    "clair": ("Clair", dict(bg0="#F4F5FA", bg1="#FFFFFF", bg2="#F7F8FC", bg3="#EEF0F7", bg4="#E4E7F1", border="#DADDE8", borderB="#C3C7D6",
                            text0="#12131C", text1="#3D4157", text2="#5A5F78", text3="#6B7088", accent="#6D28D9", pos="#059669", neg="#DC2626",
                            warn="#B45309", yellow="#A16207", purple="#7C3AED", teal="#0E7490", onacc="#FFFFFF")),
    "bamako": ("Bamako", dict(bg0="#120C05", bg1="#22170B", bg2="#281B0D", bg3="#30210F", bg4="#3A2813", border="#3F2C14", borderB="#5E4320",
                              text0="#F7F0E3", text1="#D9CCB5", text2="#AE9F86", text3="#94856C", accent="#FCD116", pos="#14B866", neg="#EF3B4E",
                              warn="#F59E0B", yellow="#FCD116", purple="#E07A1F", teal="#14B866", onacc="#1A1203")),
    "minuit": ("Minuit", dict(bg0="#0B0716", bg1="#171030", bg2="#1C1438", bg3="#221944", bg4="#2A2052", border="#2E2450", borderB="#4A3B7A",
                              text0="#F2F0FA", text1="#CFC9E6", text2="#A49CC4", text3="#8C85AA", accent="#B794FF", pos="#2BEA8B", neg="#FF4D6D",
                              warn="#FFB547", yellow="#FFE45C", purple="#FF4DA6", teal="#7DD3FC", onacc="#14082E")),
    "sunset": ("Sunset", dict(bg0="#140A0A", bg1="#251412", bg2="#2C1816", bg3="#341D1A", bg4="#3E2320", border="#432622", borderB="#643A33",
                              text0="#FBEFEA", text1="#E2CBC3", text2="#B99E95", text3="#9C847C", accent="#FF9F43", pos="#2BEA8B", neg="#FF4D6D",
                              warn="#FFB547", yellow="#FFD23D", purple="#FF4D6D", teal="#2DD4BF", onacc="#1E0E04")),
    "ocean": ("Océan", dict(bg0="#04111A", bg1="#0B2030", bg2="#0E2638", bg3="#122D42", bg4="#17374F", border="#183A50", borderB="#275A78",
                            text0="#EAF6FC", text1="#C1DCEA", text2="#93B5C7", text3="#7898AA", accent="#3DF5FF", pos="#2BEA8B", neg="#FF4D6D",
                            warn="#FFB547", yellow="#FFE45C", purple="#2D7FF9", teal="#3DF5FF", onacc="#021018")),
}


def rgb(h):
    h = h.lstrip("#")
    return ", ".join(str(int(h[i:i + 2], 16)) for i in (0, 2, 4))


def block(sel, p, light):
    v = "".join(f"--t-{k}: {c}; --t-{k}-rgb: {rgb(c)}; " for k, c in p.items())
    return f"{sel} {{ {v}color-scheme: {'light' if light else 'dark'}; }}\n"


THEME_VARS = block(":root, [data-theme=\"ornoir\"]", THEMES["ornoir"][1], False) + "".join(
    block(f'[data-theme="{k}"]', p, k == "clair") for k, (_, p) in THEMES.items() if k != "ornoir")

# ---------- 3. Icônes de la barre latérale (traits, comme dans Mèche) ----------
ICON = {
    "myrfq": "M22 2 11 13M22 2l-7 20-4-9-9-4z",
    "market": "M3 3v18h18M7 14l4-4 3 3 5-6",
    "volsurface": "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    "rfq": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    "pricer": "M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01",
    "book": "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM20 17v5H6.5A2.5 2.5 0 0 1 4 19.5",
    "greeks": "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
    "hedging": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    "pnl": "M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z",
    "training": "M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 3 9 3 12 0v-5",
}


def svg(d, size=20):
    return (f"<svg class='ic' viewBox='0 0 24 24' width='{size}' height='{size}' fill='none' stroke='currentColor' stroke-width='1.8' "
            f"stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='{d}'/></svg>")


s = re.sub(r'(data-tab="(\w+)"[^>]*>)<span class="n">\d+</span>', lambda m: m.group(1) + "<i class='ni'>" + svg(ICON.get(m.group(2), ICON["market"])) + "</i>", s)

LOGO = ("<svg viewBox='0 0 40 40' width='36' height='36' aria-hidden='true'><rect x='2' y='2' width='36' height='36' rx='11' style='fill:var(--t-bg1);stroke:var(--t-accent)' stroke-width='2.2'/>"
        "<path d='M11 12l9 17 9-17' fill='none' style='stroke:var(--t-accent)' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<path d='M20 8v6M17 11h6' style='stroke:var(--t-accent)' stroke-width='2' stroke-linecap='round'/></svg>")
s = s.replace('<div class="brand"><div class="mark">VEGA</div><div class="sub">FX Options Desk · EUR/USD</div></div>',
              '<div class="brand"><div class="mark"><span class="logo-i">' + LOGO + '</span><span class="logo-t">Vega</span></div><div class="sub">FX Options Desk · EUR/USD</div></div>', 1)
SWATCH = "".join(f"<button type='button' class='sw' data-t='{k}' title='{n}' aria-label='Thème {n}' onclick=\"setTheme('{k}')\"><i style='background:{p['bg1']};border-color:{p['accent']}'><b style='background:{p['accent']}'></b></i></button>"
                 for k, (n, p) in THEMES.items())
SIDE = ("<div class='side-quote'><p>The market rewards discipline, not impatience.</p><span>→ Vega</span></div>"
        f"<div class='themes'><small>Theme</small><div class='sws'>{SWATCH}</div></div>")
s = re.sub(r'<div class="maxim">.*?</div>', lambda m: SIDE, s, count=1, flags=re.S)
# Bouton de thème dans la barre du haut (pratique sur téléphone)
s = s.replace('<div class="topbar-pnl">', "<button type='button' class='tb-mode' id='tb-mode' onclick='cycleTheme()' title='Changer de thème' aria-label='Changer de thème'>"
              + svg("M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", 18)
              + "</button><div class=\"topbar-pnl\">", 1)

# ---------- 4. Canvas : les couleurs des graphiques suivent le thème ----------
CANVAS = """<script>
// Choix du thème avant l'affichage (pas de flash) ; « Or noir » par défaut, comme Mèche
(function(){ try { var t = localStorage.getItem('vega:theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {} })();
// Les graphiques reçoivent des couleurs « var(--t-...) » : on les traduit au moment de dessiner
(function(){
  var css = getComputedStyle(document.documentElement);
  function res(v) { return (typeof v === 'string' && v.indexOf('var(') >= 0) ? v.replace(/var\\((--[\\w-]+)\\)/g, function(m, n){ return css.getPropertyValue(n).trim() || '#888'; }) : v; }
  var P = CanvasRenderingContext2D.prototype;
  ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function(k){
    var d = Object.getOwnPropertyDescriptor(P, k);
    Object.defineProperty(P, k, { configurable: true, get: function(){ return d.get.call(this); }, set: function(v){ d.set.call(this, res(v)); } });
  });
  var add = CanvasGradient.prototype.addColorStop;
  CanvasGradient.prototype.addColorStop = function(o, c){ return add.call(this, o, res(c)); };
})();
var THEMES = %s;
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('vega:theme', t); } catch (e) {}
  document.querySelectorAll('.sw').forEach(function(b){ b.classList.toggle('on', b.dataset.t === t); });
  // Redessine les graphiques visibles avec les nouvelles couleurs
  ['renderSpotChart','renderTermStructure','renderSmileChart','renderVolSurface','renderSpotDeformation','renderGreeksMatrix'].forEach(function(f){ try { if (typeof window[f] === 'function') window[f](); } catch (e) {} });
}
function cycleTheme() { var cur = document.documentElement.dataset.theme || 'ornoir'; setTheme(THEMES[(THEMES.indexOf(cur) + 1) %% THEMES.length]); }
window.addEventListener('load', function(){ setTheme(document.documentElement.dataset.theme || 'ornoir'); });
</script>
""" % ("[" + ",".join(f"'{k}'" for k in THEMES) + "]")
s = s.replace("</head>", CANVAS + "</head>", 1)
s = s.replace("family=Space+Grotesk:wght@500;700&", "family=Space+Grotesk:wght@500;700&family=Montserrat:wght@600;700;800&")
s = s.replace("<title>Vega FX Desk</title>", "<title>Vega FX Desk</title>", 1)

# ---------- 5. Habillage Mèche ----------
BOGO = ("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23000' stroke-width='1.2'%3E"
        "%3Cpath d='M0 10l7-6 7 6 7-6 7 6 7-6 7 6 7-6 7 6'/%3E%3Cpath d='M28 22l8 8-8 8-8-8z'/%3E%3Cpath d='M28 27l3 3-3 3-3-3z'/%3E%3Cpath d='M6 44h6M9 41v6M44 44h6M47 41v6'/%3E%3C/g%3E"
        "%3Cg fill='%23000'%3E%3Ccircle cx='4' cy='30' r='1.3'/%3E%3Ccircle cx='52' cy='30' r='1.3'/%3E%3Ccircle cx='28' cy='50' r='1.3'/%3E%3C/g%3E%3C/svg%3E\")")
SHELL = THEME_VARS + """
/* ═══ Habillage Mèche : coquille, cartes, thèmes ═══ */
:root { --head: "Montserrat", "Inter", system-ui, sans-serif; --sans: "Inter", system-ui, sans-serif; --mono: "JetBrains Mono", ui-monospace, monospace; --bogo: BOGO; --side: 236px; }
body { font-family: var(--sans); color: var(--t-text0); background: radial-gradient(900px 520px at 80% -10%, rgba(var(--t-accent-rgb), 0.08), transparent 60%),
  radial-gradient(700px 420px at 10% 110%, rgba(var(--t-purple-rgb), 0.06), transparent 60%), var(--t-bg0); background-attachment: fixed; }
body::before, body::after { content: none; }
#topbar { gap: 16px; background: rgba(var(--t-bg0-rgb), 0.82); backdrop-filter: blur(14px); border-bottom: 1px solid var(--t-border); }
.topbar-market .pair { font-family: var(--head); font-weight: 700; letter-spacing: 0.04em; color: var(--t-text2); }
.topbar-market .spot-val { font-family: var(--head); font-weight: 800; color: var(--t-text0); text-shadow: none; letter-spacing: -0.01em; }
.pnl-total { font-family: var(--head); font-weight: 800; text-shadow: none !important; }
.topbar-stat .lbl { font-family: var(--sans); font-weight: 600; letter-spacing: 0.08em; color: var(--t-text3); }
.regime-badge { font-family: var(--sans); border-radius: 999px; }
.tb-mode { order: 20; width: 36px; height: 36px; flex: none; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--t-border); background: transparent; color: var(--t-text1); cursor: pointer; margin-left: 4px; }
.tb-mode:hover { color: var(--t-accent); border-color: var(--t-accent); }
.topbar-pnl { order: 19; margin-left: auto; }
#sim-controls { background: rgba(var(--t-bg0-rgb), 0.6) !important; border-bottom: 1px solid var(--t-border) !important; }
#sim-controls::after { content: none; }

#tabs { background: var(--t-bg0); border-right: 1px solid var(--t-border); padding: 22px 14px 16px; backdrop-filter: none; }
#tabs::after { content: none; }
#tabs .brand { padding: 0 6px 18px; margin-bottom: 6px; border-bottom: none; }
#tabs .mark { display: flex; align-items: center; gap: 12px; background: none; filter: none; letter-spacing: 0; -webkit-background-clip: border-box; background-clip: border-box; }
#tabs .logo-i { display: grid; filter: drop-shadow(0 0 10px rgba(var(--t-accent-rgb), 0.45)); }
#tabs .logo-t { font: 700 25px/1 var(--head); letter-spacing: 0.16em; text-transform: uppercase;
  background: linear-gradient(180deg, color-mix(in srgb, var(--t-accent) 45%, white), var(--t-accent) 55%, color-mix(in srgb, var(--t-accent) 70%, black));
  -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 12px rgba(var(--t-accent-rgb), 0.35)); }
[data-theme="clair"] #tabs .logo-t { filter: none; }
#tabs .sub { color: var(--t-text3); font-family: var(--sans); letter-spacing: 0.12em; margin: 8px 0 0 2px; }
.nav-sec { font: 600 10.5px/1 var(--sans); letter-spacing: 0.16em; text-transform: uppercase; color: var(--t-text3); padding: 12px 12px 5px; }
.tab { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 12px; border: 1px solid transparent; font: 600 14px/1.2 var(--sans); letter-spacing: 0; text-transform: none; color: var(--t-text2); background: none; }
.tab .ni { display: grid; place-items: center; width: 22px; color: inherit; font-style: normal; }
.tab:hover { color: var(--t-text0); background: rgba(var(--t-text0-rgb), 0.05); }
.tab.active { color: var(--t-onacc); background: var(--t-accent); border-color: transparent; box-shadow: 0 10px 26px -12px rgba(var(--t-accent-rgb), 0.9); }
[data-theme="ornoir"] .tab.active, :root:not([data-theme]) .tab.active { background: linear-gradient(180deg, #F8D88A, #E3AA42); }
.side-quote { margin: auto 6px 10px; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--t-border); border-left: 3px solid var(--t-accent);
  background: linear-gradient(160deg, rgba(var(--t-accent-rgb), 0.08), transparent 70%), var(--t-bg1); }
.side-quote p { margin: 0 0 8px; color: var(--t-text1); font-size: 13px; line-height: 1.5; }
.side-quote span { color: var(--t-accent); font-size: 12px; font-weight: 700; }
.themes { margin: 0 6px 12px; }
.themes small { display: block; font: 600 10.5px/1 var(--sans); letter-spacing: 0.16em; text-transform: uppercase; color: var(--t-text3); margin-bottom: 8px; }
.sws { display: flex; gap: 6px; flex-wrap: wrap; }
.sw { width: 24px; height: 24px; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 9px; }
.sw i { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 8px; border: 2px solid; box-sizing: border-box; }
.sw b { width: 10px; height: 10px; border-radius: 50%; }
.sw.on { outline: 2px solid var(--t-text0); outline-offset: 2px; }
.focus-btn { margin: 0 6px; border-radius: 12px; background: transparent; color: var(--t-text1); border: 1px solid var(--t-border); font-family: var(--sans); }

.panel { padding: 20px 22px; gap: 16px; }
.card { position: relative; border-radius: 18px; border: 1px solid var(--t-border); backdrop-filter: none;
  background: linear-gradient(180deg, rgba(var(--t-text0-rgb), 0.035), rgba(var(--t-text0-rgb), 0.012)), var(--t-bg1);
  box-shadow: 0 1px 0 rgba(var(--t-text0-rgb), 0.04) inset, 0 18px 40px -28px rgba(0, 0, 0, 0.6); }
[data-theme="clair"] .card { box-shadow: 0 14px 30px -22px rgba(20, 22, 40, 0.35); }
.card-header { position: relative; overflow: hidden; background: linear-gradient(160deg, rgba(var(--t-accent-rgb), 0.07), transparent 65%); border-bottom: 1px solid var(--t-border); padding: 12px 16px 10px; }
.card-header::before { content: ""; position: absolute; inset: 0; background: var(--t-accent); opacity: 0.10; -webkit-mask: var(--bogo) 0 0 / 56px 56px; mask: var(--bogo) 0 0 / 56px 56px; pointer-events: none; }
.card-header > * { position: relative; }
.card::after { content: none; }
.card-title { font: 700 13px/1.2 var(--head) !important; letter-spacing: 0.06em; text-transform: uppercase; color: var(--t-text0); }
.card-body { padding: 14px 16px 16px; }
th { font-family: var(--sans); color: var(--t-text3); border-bottom-color: var(--t-border); }
td { border-bottom-color: rgba(var(--t-text0-rgb), 0.06); }
tr:hover td { background: rgba(var(--t-accent-rgb), 0.06); }
input, select, textarea { background: rgba(var(--t-bg0-rgb), 0.6) !important; color: var(--t-text0) !important; border: 1px solid var(--t-borderB) !important; border-radius: 10px !important; }
.btn { border-radius: 10px; font-family: var(--sans); font-weight: 700; letter-spacing: 0.04em; background: transparent; }
.btn:hover { background: rgba(var(--t-text0-rgb), 0.06); }
.btn-lg { background: linear-gradient(180deg, color-mix(in srgb, var(--t-accent) 70%, white), var(--t-accent)); color: var(--t-onacc); border: 0; box-shadow: 0 10px 30px -12px rgba(var(--t-accent-rgb), 0.8); }
.sc-btn, .tf-btn { border-radius: 9px !important; font-family: var(--sans) !important; }
.sc-btn.sc-active, .tf-btn.active { background: rgba(var(--t-accent-rgb), 0.16) !important; color: var(--t-accent) !important; border-color: var(--t-accent) !important; }
.rfq-box { border-radius: 16px; border-color: rgba(var(--t-accent-rgb), 0.55); background: linear-gradient(160deg, rgba(var(--t-accent-rgb), 0.08), transparent 60%), var(--t-bg2); box-shadow: none; }
.rfq-box::before { background: var(--t-accent); color: var(--t-onacc); border-radius: 0 0 8px 8px; }
.mm-box { border-radius: 12px; }
.notif { font-family: var(--sans); border-radius: 12px; background: var(--t-bg1); color: var(--t-text0); border: 1px solid var(--t-border); }
#journal-card { background: var(--t-bg1); border: 1px solid var(--t-accent); border-radius: 16px; }
#journal-card .j-title { font-family: var(--head); color: var(--t-text0); }
@media (max-width: 900px) {
  :root { --side: 0px; }
  #tabs { padding: 6px 8px; }
  .tb-mode { order: 0; }
  .topbar-pnl { order: 0; margin-left: 0; }
  #tabs .logo-t { font-size: 18px; }
  #tabs .logo-i svg { width: 28px; height: 28px; }
  .side-quote, .themes { display: none; }
  .tab { padding: 9px 12px; }
  .tab .ni { width: 18px; }
  .tb-mode { margin-left: 0; }
}
""".replace("BOGO", BOGO)
i = s.index("</style>")
s = s[:i] + SHELL + s[i:]
open(out, "w", encoding="utf-8").write(s)
print("ok", len(s))
