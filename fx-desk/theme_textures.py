"""Thèmes texturés pour le simulateur (inspirés de l'image du temple dans les nuages).
S'applique par-dessus la page construite par build.py :
    python3 theme_textures.py index.html sortie.html laque|couchant|pierre"""
import re, sys
from urllib.parse import quote

src, out, name = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding="utf-8").read()


def svg_url(svg):
    return 'url("data:image/svg+xml;utf8,' + quote(svg, safe="=:/ ,'#()-.") + '")'


def grain(alpha):
    """Grain de papier : bruit fractal noir très léger."""
    return svg_url("<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'>"
                   "<feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/>"
                   f"<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 {alpha} 0'/></filter>"
                   "<rect width='100%' height='100%' filter='url(#n)'/></svg>")


def fibers(color, alpha):
    """Fibres de papier washi : traits fins et irréguliers."""
    paths = "".join(f"<path d='M{x} {y} q{dx} {dy} {dx * 2} {dy // 2}' />" for x, y, dx, dy in
                    [(10, 20, 18, 6), (60, 80, 22, -8), (120, 40, 14, 10), (30, 140, 26, -4), (150, 120, 12, 8),
                     (90, 160, 20, -10), (170, 10, 10, 12), (5, 95, 16, 4), (110, 100, 24, 6)])
    return svg_url(f"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><g fill='none' stroke='{color}' "
                   f"stroke-opacity='{alpha}' stroke-width='0.8' stroke-linecap='round'>{paths}</g></svg>")


def seigaiha(base, line, size=64):
    """Motif japonais de vagues (seigaiha), en dégradés CSS."""
    a, b = base, line
    return (f"radial-gradient(circle at 100% 150%, {a} 24%, {b} 24%, {b} 28%, {a} 28%, {a} 36%, {b} 36%, {b} 40%, transparent 40%, transparent),"
            f"radial-gradient(circle at 0 150%, {a} 24%, {b} 24%, {b} 28%, {a} 28%, {a} 36%, {b} 36%, {b} 40%, transparent 40%, transparent),"
            f"radial-gradient(circle at 50% 100%, {b} 10%, {a} 10%, {a} 23%, {b} 23%, {b} 30%, {a} 30%, {a} 43%, {b} 43%, {b} 50%, {a} 50%, {a} 63%, {b} 63%, {b} 71%, transparent 71%, transparent),"
            f"radial-gradient(circle at 100% 50%, {b} 5%, {a} 5%, {a} 15%, {b} 15%, {b} 20%, {a} 20%, {a} 29%, {b} 29%, {b} 34%, {a} 34%, {a} 44%, {b} 44%, {b} 49%, transparent 49%, transparent),"
            f"radial-gradient(circle at 0 50%, {b} 5%, {a} 5%, {a} 15%, {b} 15%, {b} 20%, {a} 20%, {a} 29%, {b} 29%, {b} 34%, {a} 34%, {a} 44%, {b} 44%, {b} 49%, transparent 49%, transparent)"), f"{size}px {size // 2}px"


def clouds(color, alpha):
    return svg_url(f"<svg xmlns='http://www.w3.org/2000/svg' width='520' height='260'><g fill='{color}' fill-opacity='{alpha}'>"
                   "<circle cx='80' cy='70' r='34'/><circle cx='120' cy='56' r='40'/><circle cx='168' cy='72' r='30'/><rect x='50' y='70' width='150' height='26' rx='13'/>"
                   "<circle cx='340' cy='190' r='30'/><circle cx='384' cy='176' r='38'/><circle cx='430' cy='192' r='28'/><rect x='312' y='190' width='146' height='24' rx='12'/>"
                   "</g></svg>")


# ---------- Les trois ambiances ----------
V = {
    "laque": dict(
        label="Laque rouge & or",
        bg0="#A8392F", card="#D8C29E", card2="#CFB78F", card3="#C6AC83", card4="#BBA077", border="#B0915F", borderB="#8C6A3A",
        text0="#2A1712", text1="#3B2219", text2="#5C3A28", text3="#6E4A34", accent="#1E4E57", pos="#1F6B3A", neg="#A3161B",
        warn="#7A4A00", yellow="#6A5000", red="#A3161B", teal="#1E5A55",
        page=lambda: (seigaiha("#A8392F", "#B5463B", 72), grain(0.22)),
        side="linear-gradient(180deg, rgba(151,49,40,0.96), rgba(132,41,34,0.96))", side_fg="#FBE8D0", side_muted="#EBC9A6",
        top="#CDB48D", bar="#C3A87E", btn="#E2CFAE",
        active="linear-gradient(135deg, #E2B457, #B8822A)", active_fg="#2A1712", active_n_bg="#2A1712", active_n_fg="#E2B457",
        logo="#E2B457", gold="#B8822A", sky=("#E7B07C", "#F2D3AE"), sun="#A3161B", cloud="#FBEFE0", cloud2="#F3E2CC", mount="#4A3A33", mount2="#5E4C43", stair="#7C6A60", tree="#A3161B",
        quote="Price with patience, hedge with discipline."),
    "couchant": dict(
        label="Coucher de soleil",
        bg0="#D9483B", card="#F6DCCB", card2="#F0D0BC", card3="#EAC4AD", card4="#E2B79E", border="#D6A386", borderB="#B9785A",
        text0="#2B1520", text1="#3D1E2C", text2="#5E3242", text3="#714050", accent="#5B2A55", pos="#1E6B4A", neg="#B0141C",
        warn="#7A3E00", yellow="#6E4C00", red="#C0151D", teal="#1E5A55",
        page=lambda: ("linear-gradient(160deg, #F29150 0%, #DE5A3E 42%, #B53B48 70%, #7E3657 100%)",),
        page_layers=lambda: (clouds("#FFE9DA", 0.22), grain(0.18)),
        side="linear-gradient(180deg, rgba(255,226,206,0.62), rgba(255,214,196,0.55))", side_fg="#2B1520", side_muted="#6E3E4C",
        top="rgba(255,232,216,0.72)", bar="rgba(255,222,204,0.55)", btn="rgba(255,244,236,0.85)",
        active="linear-gradient(135deg, #C0151D, #E8622C)", active_fg="#FFFFFF", active_n_bg="#FFF1E6", active_n_fg="#C0151D",
        gold="#C46A12", sky=("#F28A50", "#F7C7A2"), sun="#C0151D", cloud="#FFF1E6", cloud2="#FBE0D0", mount="#5A2E44", mount2="#6E3A55", stair="#8C5A6E", tree="#C0151D",
        quote="Above the clouds, the price is calm.", glass=True),
    "pierre": dict(
        label="Pierre, encre & sceau rouge",
        bg0="#857D73", card="#BDB4A6", card2="#B3A99B", card3="#A89E90", card4="#9C9284", border="#948A7C", borderB="#6E655A",
        text0="#1E1A17", text1="#2C2622", text2="#463E37", text3="#574E45", accent="#2F4B57", pos="#1F5E3A", neg="#9E1218",
        warn="#6E4500", yellow="#5E4A00", red="#A3161B", teal="#2A5550",
        page=lambda: ("radial-gradient(120% 80% at 80% 0%, #958C81 0%, #857D73 45%, #776F66 100%)",),
        page_layers=lambda: (clouds("#EDE6DB", 0.10), fibers("#3A332D", 0.18), grain(0.30)),
        side="linear-gradient(180deg, #776F66, #6C645B)", side_fg="#F3ECE2", side_muted="#D8CDBE",
        top="#A79E91", bar="#9D9487", btn="#CBC2B4",
        active="linear-gradient(135deg, #A3161B, #7E0E12)", active_fg="#FFFFFF", active_n_bg="#F3ECE2", active_n_fg="#A3161B",
        gold="#9C7A2E", sky=("#B9B0A3", "#DDD5C9"), sun="#A3161B", cloud="#F4EFE7", cloud2="#E7E0D5", mount="#3A3632", mount2="#4E4944", stair="#6E6862", tree="#A3161B",
        quote="Still water, clear price.")
}
P = V[name]


def rgb(h):
    h = h.lstrip("#")
    return ",".join(str(int(h[i:i + 2], 16)) for i in (0, 2, 4))


# Couleurs de la version néon (Vega) -> palette de l'ambiance
HEX = {"#05060D": P["bg0"], "#0C0E20": P["card"], "#11142C": P["card2"], "#161A38": P["card3"], "#1E2348": P["card4"],
       "#23284D": P["border"], "#363E72": P["borderB"], "#F3F5FF": P["text0"], "#C9CEEE": P["text1"], "#959DC8": P["text2"],
       "#6E76A6": P["text3"], "#4DE1FF": P["accent"], "#3DFFA8": P["pos"], "#FF4D8D": P["neg"], "#FFB547": P["warn"],
       "#FFE45C": P["yellow"], "#A66BFF": P["red"], "#2EF2D0": P["teal"]}
for a, b in HEX.items():
    s = re.sub(re.escape(a), b, s, flags=re.I)
RGB = {"255,255,255": rgb(P["text0"]),  # d'abord : le blanc des canvas devient du texte foncé
       "61,255,168": rgb(P["pos"]), "255,77,141": rgb(P["neg"]), "77,225,255": rgb(P["accent"]), "255,181,71": rgb(P["warn"]),
       "255,228,92": rgb(P["yellow"]), "166,107,255": rgb(P["red"]), "46,242,208": rgb(P["teal"]), "54,62,114": rgb(P["border"]),
       "149,157,200": rgb(P["text2"]), "12,14,32": rgb(P["card"]), "22,26,56": rgb(P["card"]), "14,16,36": rgb(P["card2"]),
       "8,10,22": rgb(P["card"]), "5,6,13": rgb(P["bg0"]), "6,7,16": rgb(P["bg0"])}
for a, b in RGB.items():
    s = re.sub(r"rgba?\(\s*" + r",\s*".join(a.split(",")), lambda m, b=b: m.group(0).split("(")[0] + "(" + b, s)

s = s.replace("family=Space+Grotesk:wght@500;700&", "family=Space+Grotesk:wght@500;700&family=Shippori+Mincho+B1:wght@700;800&")

# ---------- Logo, scène illustrée, ornements ----------
r = P["red"]
lg = P.get("logo", r)
TORII = (f"<svg viewBox='0 0 40 32' width='34' height='28' aria-hidden='true'><path fill='{lg}' d='M1 4c8 2 30 2 38 0l-1 4c-7 1-29 1-36 0z'/>"
         f"<rect x='5' y='11' width='30' height='3' fill='{lg}'/><rect x='9' y='8' width='4' height='24' fill='{lg}'/>"
         f"<rect x='27' y='8' width='4' height='24' fill='{lg}'/><rect x='18' y='10' width='4' height='5' fill='{lg}'/></svg>")
s = s.replace('<div class="brand"><div class="mark">VEGA</div>', '<div class="brand"><div class="mark">' + TORII + '<span>VEGA</span></div>', 1)
c, c2, m1, m2, st, t = P["cloud"], P["cloud2"], P["mount"], P["mount2"], P["stair"], P["tree"]
SCENE = ("<div class='scene' aria-hidden='true'><svg viewBox='0 0 200 150' width='100%'>"
         f"<defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='{P['sky'][0]}'/><stop offset='1' stop-color='{P['sky'][1]}'/></linearGradient></defs>"
         "<rect width='200' height='150' fill='url(#sky)'/>"
         f"<circle cx='150' cy='42' r='26' fill='{P['sun']}'/>"
         f"<g fill='{c}'><circle cx='112' cy='52' r='16'/><circle cx='130' cy='46' r='13'/><circle cx='150' cy='60' r='14'/><circle cx='170' cy='54' r='12'/><circle cx='186' cy='62' r='10'/><rect x='104' y='56' width='96' height='14' rx='7'/></g>"
         f"<g fill='{c2}'><circle cx='20' cy='60' r='12'/><circle cx='36' cy='54' r='14'/><circle cx='54' cy='62' r='10'/><rect x='10' y='60' width='52' height='10' rx='5'/></g>"
         f"<path fill='{m1}' d='M0 150 L0 98 L22 70 L38 96 L52 80 L70 108 L70 150Z'/>"
         f"<path fill='{m1}' d='M200 150 L200 92 L178 74 L160 100 L142 86 L128 112 L128 150Z'/>"
         f"<path fill='{m2}' d='M70 150 L80 104 L120 104 L130 150Z'/>"
         f"<rect x='92' y='106' width='16' height='44' fill='{st}'/>"
         f"<g stroke='{m1}' stroke-width='1'><line x1='92' y1='114' x2='108' y2='114'/><line x1='92' y1='122' x2='108' y2='122'/><line x1='92' y1='130' x2='108' y2='130'/><line x1='92' y1='138' x2='108' y2='138'/></g>"
         f"<g fill='{r}'><rect x='86' y='78' width='3' height='26'/><rect x='111' y='78' width='3' height='26'/><rect x='84' y='84' width='32' height='2.5'/><rect x='90' y='66' width='20' height='4'/></g>"
         f"<path fill='{m1}' d='M78 79 Q100 70 122 79 L118 74 Q100 64 82 74Z'/><path fill='{m1}' d='M84 68 Q100 59 116 68 L112 63 Q100 55 88 63Z'/>"
         f"<g fill='{t}'><circle cx='26' cy='104' r='9'/><circle cx='36' cy='98' r='8'/><circle cx='42' cy='108' r='7'/><circle cx='18' cy='112' r='7'/>"
         "<circle cx='166' cy='106' r='9'/><circle cx='176' cy='98' r='7'/><circle cx='184' cy='110' r='8'/><circle cx='158' cy='114' r='6'/></g>"
         f"<g fill='{c}'><circle cx='30' cy='146' r='12'/><circle cx='52' cy='142' r='14'/><circle cx='150' cy='144' r='13'/><circle cx='172' cy='146' r='12'/><rect x='14' y='142' width='176' height='8' rx='4'/></g>"
         f"<g stroke='{r}' stroke-width='1.4' fill='none' stroke-linecap='round'><path d='M30 22 l4 3 l4 -3'/><path d='M48 14 l3 2 l3 -2'/><path d='M62 26 l3 2 l3 -2'/></g>"
         f"</svg><p>{P['quote']}</p></div>")
s = re.sub(r'<div class="maxim">.*?</div>', lambda m: SCENE, s, count=1, flags=re.S)

# Ornement de coin des cartes : petites vagues dans un éventail
ORN = svg_url(f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 32'><g fill='none' stroke='{P['gold']}' stroke-width='1.3'>"
              "<path d='M2 30 A28 28 0 0 1 58 30'/><path d='M9 30 A21 21 0 0 1 51 30'/><path d='M16 30 A14 14 0 0 1 44 30'/><path d='M23 30 A7 7 0 0 1 37 30'/></g></svg>")
# Bande de vagues sous la barre de simulation
wave_img, wave_size = seigaiha(P["card4"], P["border"], 28)

if "page_layers" in P:
    page_bg = ", ".join(P["page_layers"]() + P["page"]())
    page_size = ", ".join(["520px 260px"] + ["180px 180px" if "feTurbulence" in x else "200px 200px" for x in P["page_layers"]()[1:]] + ["cover"])
    page_bg_css = f"background: {page_bg}; background-size: {page_size}; background-attachment: fixed;"
else:
    sg, sz = P["page"]()[0]
    page_bg_css = f"background: {P['page']()[1]}, {sg}; background-color: {P['bg0']}; background-size: 180px 180px, {', '.join([sz] * 5)};"

glass = P.get("glass")
G = grain(0.16)
THEME = f"""
/* ═══ Ambiance « {P['label']} » — textures papier, vagues seigaiha, ornements ═══ */
:root {{ --display: 'Shippori Mincho B1', 'Space Grotesk', serif; --torii: {P['red']}; --gold: {P['gold']}; }}
body {{ {page_bg_css} color: var(--text-0); }}
body::before, body::after {{ content: none; }}
.panel {{ position: relative; z-index: 1; }}
#topbar {{ background: {G}, {P['top']}; background-size: 180px 180px, auto; border-bottom: 1px solid {P['borderB']}; {'backdrop-filter: blur(10px);' if glass else ''} }}
.topbar-market .spot-val {{ font-family: 'Space Grotesk', sans-serif; color: {P['text0']}; text-shadow: none; }}
.topbar-market .pair {{ font-family: 'Shippori Mincho B1', serif; }}
.pnl-total {{ font-family: 'Space Grotesk', sans-serif; text-shadow: none !important; }}
#sim-controls {{ background: {G}, {P['bar']} !important; background-size: 180px 180px, auto !important; border-bottom: none !important; position: relative; {'backdrop-filter: blur(10px);' if glass else ''} }}
#sim-controls::after {{ content: ""; position: absolute; left: 0; right: 0; bottom: -10px; height: 10px; background: {wave_img}; background-size: {', '.join([wave_size] * 5)}; border-top: 1px solid {P['borderB']}; border-bottom: 1px solid {P['borderB']}; z-index: 2; }}
#main {{ padding-top: 10px; }}
#tabs {{ background: {G}, {P['side']}; background-size: 180px 180px, auto; border-right: 1px solid {P['borderB']}; {'backdrop-filter: blur(12px);' if glass else 'backdrop-filter: none;'} }}
#tabs::after {{ content: ""; position: absolute; top: 0; right: 0; bottom: 0; width: 4px; background: repeating-linear-gradient(180deg, var(--gold) 0 14px, transparent 14px 22px); opacity: 0.55; }}
#tabs .mark {{ display: flex; align-items: center; gap: 10px; background: none; -webkit-background-clip: border-box; background-clip: border-box; color: {P['side_fg']}; filter: none;
  font-family: 'Shippori Mincho B1', serif; font-weight: 800; font-size: 28px; letter-spacing: 7px; }}
#tabs .mark svg {{ flex: none; }}
#tabs .sub, .nav-sec {{ color: {P['side_muted']}; }}
#tabs {{ padding-top: 18px; }}
#tabs .brand {{ padding-bottom: 14px; border-bottom: 1px solid color-mix(in srgb, {P['side_fg']} 22%, transparent); margin-bottom: 4px; }}
.nav-sec {{ padding: 10px 12px 4px; font-family: 'Shippori Mincho B1', serif; letter-spacing: 3px; }}
.tab {{ padding: 6px 12px; color: {P['side_fg']}; }}
.tab .n {{ background: color-mix(in srgb, {P['side_fg']} 14%, transparent); color: {P['side_fg']}; border: 1px solid color-mix(in srgb, {P['side_fg']} 25%, transparent); }}
.tab:hover {{ background: color-mix(in srgb, {P['side_fg']} 10%, transparent); color: {P['side_fg']}; }}
.tab.active {{ color: {P['active_fg']}; background: {G}, {P['active']}; background-size: 180px 180px, auto; border-color: color-mix(in srgb, {P['gold']} 60%, transparent); box-shadow: 0 6px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.25); }}
.tab.active .n {{ color: {P['active_n_fg']}; background: {P['active_n_bg']}; border-color: transparent; }}
.scene {{ margin: auto 10px 10px; border-radius: 12px; overflow: hidden; border: 1px solid {P['gold']}; line-height: 0; background: {P['card']}; box-shadow: 0 0 0 3px color-mix(in srgb, {P['gold']} 25%, transparent); }}
.scene p {{ margin: 0; padding: 10px 12px 12px; line-height: 1.3; font-family: 'Shippori Mincho B1', serif; font-weight: 700; font-size: 14px; color: {P['text0']}; border-top: 2px solid var(--torii); background: {G}, {P['card']}; background-size: 180px 180px, auto; }}
.focus-btn {{ background: {G}, {P['btn']}; color: {P['text0']}; }}
.card {{ background: {G}, {fibers(P['text0'], 0.10)}, {P['card'] if not glass else 'rgba(255,240,228,0.80)'}; background-size: 180px 180px, 200px 200px, auto;
  border: 1px solid {P['border']}; border-radius: 12px; {'backdrop-filter: blur(14px);' if glass else 'backdrop-filter: none;'}
  box-shadow: inset 0 0 0 4px {P['card'] if not glass else 'rgba(255,240,228,0.0)'}, inset 0 0 0 5px color-mix(in srgb, {P['gold']} 45%, transparent), 0 10px 26px rgba(0,0,0,0.22); position: relative; }}
.card::after {{ content: ""; position: absolute; top: 9px; right: 12px; width: 46px; height: 24px; background: {ORN} no-repeat center / contain; opacity: 0.55; pointer-events: none; }}
.card-header {{ background: linear-gradient(180deg, color-mix(in srgb, {P['gold']} 12%, transparent), transparent); border-bottom: 1px solid color-mix(in srgb, {P['gold']} 35%, transparent); position: relative; padding-right: 66px; }}
.card-header::before {{ content: ""; position: absolute; left: 16px; top: 0; width: 28px; height: 3px; background: var(--torii); border-radius: 0 0 2px 2px; }}
.card-title {{ color: {P['text0']}; font-family: 'Shippori Mincho B1', serif; letter-spacing: 1.2px; font-size: 13px !important; }}
th {{ color: {P['text2']}; border-bottom-color: {P['border']}; font-family: 'Shippori Mincho B1', serif; letter-spacing: 1.5px; }}
td {{ border-bottom-color: color-mix(in srgb, {P['text0']} 10%, transparent); }}
tr:hover td {{ background: color-mix(in srgb, {P['gold']} 10%, transparent); }}
input, select, textarea {{ background: color-mix(in srgb, {P['btn']} 85%, white) !important; color: {P['text0']} !important; border-color: {P['borderB']} !important; }}
.btn {{ background: {G}, {P['btn']}; background-size: 180px 180px, auto; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.08); }}
.btn-lg, .rfq-box .btn-green {{ box-shadow: none; }}
.rfq-box {{ border: 1px solid var(--torii); background: {G}, color-mix(in srgb, {P['card']} 92%, {P['red']}); background-size: 180px 180px, auto; box-shadow: inset 0 0 0 4px color-mix(in srgb, {P['card']} 92%, {P['red']}), inset 0 0 0 5px color-mix(in srgb, {P['red']} 40%, transparent); }}
.rfq-box::before {{ background: var(--torii); color: #fff; }}
.mm-box {{ background: color-mix(in srgb, {P['card2']} 80%, transparent) !important; border-color: {P['border']} !important; }}
.regime-badge.regime-calm {{ background: color-mix(in srgb, {P['accent']} 14%, transparent); color: {P['accent']}; border-color: color-mix(in srgb, {P['accent']} 45%, transparent); }}
.sc-btn.sc-active, .tf-btn.active {{ background: color-mix(in srgb, {P['red']} 16%, transparent) !important; color: {P['red']} !important; border-color: {P['red']} !important; }}
.notif {{ background: {G}, {P['btn']} !important; color: {P['text0']} !important; box-shadow: 0 8px 22px rgba(0,0,0,0.25); }}
#journal-card {{ background: {G}, {P['btn']}; border-color: var(--torii); }}
#journal-card .j-title {{ color: {P['text0']}; }}
@media (max-width: 900px) {{
  .scene {{ display: none; }}
  #tabs::after {{ display: none; }}
  #tabs .mark {{ font-size: 18px; letter-spacing: 3px; }}
  #tabs .mark svg {{ width: 24px; height: 20px; }}
  .card::after {{ width: 34px; height: 18px; }}
}}
"""
i = s.index("</style>")
s = s[:i] + THEME + s[i:]
open(out, "w", encoding="utf-8").write(s)
print("ok", name, len(s))
