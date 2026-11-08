"""Thème « Kumo » demi-teinte (ombre des nuages, temple rouge) appliqué par-dessus la page construite par build.py.
Usage : python3 theme_kumo.py index.html sortie.html"""
import re, sys

src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()

# Palette néon (Vega) -> palette du temple dans les nuages
HEX = {"#05060D": "#6F989B", "#0C0E20": "#A9CCCD", "#11142C": "#9EC4C5", "#161A38": "#93BBBC", "#1E2348": "#86B0B2",
       "#23284D": "#86AFB1", "#363E72": "#5F8A8D", "#F3F5FF": "#0E2A30", "#C9CEEE": "#1D4249", "#959DC8": "#2F5A61",
       "#6E76A6": "#3E6970", "#4DE1FF": "#0F5E68", "#3DFFA8": "#0A6B4F", "#FF4D8D": "#B3121A", "#FFB547": "#8A4F00",
       "#FFE45C": "#6B5200", "#A66BFF": "#C8141C", "#2EF2D0": "#0E6B63"}
for a, b in HEX.items():
    s = re.sub(re.escape(a), b, s, flags=re.I)
RGB = {"255,255,255": "14,42,48",  # d'abord : le blanc des canvas devient du texte foncé
       "61,255,168": "10,107,79", "255,77,141": "179,18,26", "77,225,255": "15,94,104", "255,181,71": "138,79,0",
       "255,228,92": "107,82,0", "166,107,255": "200,20,28", "46,242,208": "14,107,99", "54,62,114": "127,168,170",
       "149,157,200": "47,90,97", "12,14,32": "169,204,205", "22,26,56": "169,204,205", "14,16,36": "158,196,197",
       "8,10,22": "169,204,205", "5,6,13": "111,152,155", "6,7,16": "111,152,155"}
for a, b in RGB.items():
    s = re.sub(r"rgba?\(\s*" + r",\s*".join(a.split(",")), lambda m, b=b: m.group(0).split("(")[0] + "(" + b, s)

s = s.replace("family=Space+Grotesk:wght@500;700&", "family=Space+Grotesk:wght@500;700&family=Shippori+Mincho+B1:wght@700;800&")

# Nuages et soleil en SVG (décor de fond, ne capte pas les clics)
CLOUD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 220'><g fill='%23A8DCDC'>"
         "<circle cx='90' cy='160' r='70'/><circle cx='190' cy='120' r='90'/><circle cx='310' cy='140' r='80'/>"
         "<circle cx='420' cy='120' r='95'/><circle cx='520' cy='165' r='65'/><rect x='60' y='160' width='490' height='60' rx='30'/></g></svg>")
CLOUD_URL = "url(\"data:image/svg+xml;utf8," + CLOUD.replace("<", "%3C").replace(">", "%3E") + "\")"
TORII = ("<svg viewBox='0 0 40 32' width='34' height='28' aria-hidden='true'><path fill='#C8141C' d='M1 4c8 2 30 2 38 0l-1 4c-7 1-29 1-36 0z'/>"
         "<rect x='5' y='11' width='30' height='3' fill='#C8141C'/><rect x='9' y='8' width='4' height='24' fill='#C8141C'/>"
         "<rect x='27' y='8' width='4' height='24' fill='#C8141C'/><rect x='18' y='10' width='4' height='5' fill='#C8141C'/></svg>")
s = s.replace('<div class="brand"><div class="mark">VEGA</div>', '<div class="brand"><div class="mark">' + TORII + '<span>VEGA</span></div>', 1)
s = s.replace('<div class="maxim">Price it. Hedge it. Own it.<span>Quote tight, hedge fast, keep a journal.</span></div>',
              '<div class="maxim">Above the clouds, the price is calm.<span>Quote tight, hedge fast, keep a journal.</span></div>', 1)

SCENE = ("<div class='scene' aria-hidden='true'><svg viewBox='0 0 200 150' width='100%'>"
  "<defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#86B6B7'/><stop offset='1' stop-color='#B3D4D4'/></linearGradient></defs>"
  "<rect width='200' height='150' rx='14' fill='url(#sky)'/>"
  "<circle cx='150' cy='42' r='26' fill='#C8141C'/>"
  "<g fill='#E8F4F3'><circle cx='112' cy='52' r='16'/><circle cx='130' cy='46' r='13'/><circle cx='150' cy='60' r='14'/><circle cx='170' cy='54' r='12'/><circle cx='186' cy='62' r='10'/><rect x='104' y='56' width='96' height='14' rx='7'/></g>"
  "<g fill='#DCEEED'><circle cx='20' cy='60' r='12'/><circle cx='36' cy='54' r='14'/><circle cx='54' cy='62' r='10'/><rect x='10' y='60' width='52' height='10' rx='5'/></g>"
  "<path fill='#3C474D' d='M0 150 L0 98 L22 70 L38 96 L52 80 L70 108 L70 150Z'/>"
  "<path fill='#3C474D' d='M200 150 L200 92 L178 74 L160 100 L142 86 L128 112 L128 150Z'/>"
  "<path fill='#525E64' d='M70 150 L80 104 L120 104 L130 150Z'/>"
  "<g fill='#6E7B80'><rect x='92' y='106' width='16' height='44'/></g>"
  "<g stroke='#3C474D' stroke-width='1'><line x1='92' y1='114' x2='108' y2='114'/><line x1='92' y1='122' x2='108' y2='122'/><line x1='92' y1='130' x2='108' y2='130'/><line x1='92' y1='138' x2='108' y2='138'/></g>"
  "<g fill='#C8141C'><rect x='86' y='78' width='3' height='26'/><rect x='111' y='78' width='3' height='26'/><rect x='84' y='84' width='32' height='2.5'/></g>"
  "<path fill='#2A2F33' d='M78 79 Q100 70 122 79 L118 74 Q100 64 82 74Z'/><path fill='#2A2F33' d='M84 68 Q100 59 116 68 L112 63 Q100 55 88 63Z'/>"
  "<g fill='#C8141C'><rect x='90' y='66' width='20' height='4'/></g>"
  "<g fill='#C8141C'><circle cx='26' cy='104' r='9'/><circle cx='36' cy='98' r='8'/><circle cx='42' cy='108' r='7'/><circle cx='18' cy='112' r='7'/>"
  "<circle cx='166' cy='106' r='9'/><circle cx='176' cy='98' r='7'/><circle cx='184' cy='110' r='8'/><circle cx='158' cy='114' r='6'/></g>"
  "<g fill='#E8F4F3'><circle cx='30' cy='146' r='12'/><circle cx='52' cy='142' r='14'/><circle cx='150' cy='144' r='13'/><circle cx='172' cy='146' r='12'/><rect x='14' y='142' width='176' height='8' rx='4'/></g>"
  "<g stroke='#C8141C' stroke-width='1.4' fill='none' stroke-linecap='round'><path d='M30 22 l4 3 l4 -3'/><path d='M48 14 l3 2 l3 -2'/><path d='M62 26 l3 2 l3 -2'/></g>"
  "</svg></div>")
s = re.sub(r'<div class="maxim">.*?</div>', lambda m: SCENE.replace("</svg></div>", "</svg><p>Above the clouds, the price is calm.</p></div>"), s, count=1, flags=re.S)

s = s.replace("<title>Vega FX Desk</title>", "<title>Vega FX Desk</title>", 1)

THEME = """
/* ═══ KUMO demi-teinte — ombre des nuages, temple rouge ═══ */
:root { --display: 'Shippori Mincho B1', 'Space Grotesk', serif; --torii: #C8141C; }
body { background: linear-gradient(180deg, #7BA3A6 0%, #67908F 100%); color: var(--text-0); }
body::before, body::after { content: none; }
.panel { position: relative; z-index: 1; }
#topbar { background: #9EC4C5; border-bottom: 1px solid #7FA8AA; }
.topbar-market .spot-val { font-family: 'Space Grotesk', sans-serif; color: #0E2A30; text-shadow: none; }
.pnl-total { font-family: 'Space Grotesk', sans-serif; text-shadow: none !important; }
#sim-controls { background: #8DB5B7 !important; border-bottom: 1px solid #7FA8AA !important; }
#tabs { background: #8BB3B5; border-right: 1px solid #6F989B; backdrop-filter: none; }
#tabs .mark { display: flex; align-items: center; gap: 10px; background: none; -webkit-background-clip: border-box; background-clip: border-box; color: #0E2A30; filter: none;
  font-family: 'Shippori Mincho B1', serif; font-weight: 800; font-size: 28px; letter-spacing: 7px; }
#tabs .mark svg { flex: none; }
#tabs .mark svg rect, #tabs .mark svg path { fill: #C8141C; }
#tabs .sub, .nav-sec { color: #2F5A61; }
#tabs { padding-top: 18px; }
#tabs .brand { padding-bottom: 14px; }
.nav-sec { padding: 10px 12px 4px; }
.tab { padding: 6px 12px; color: #16393F; }
.tab .n { background: #A6CACB; color: #2F5A61; }
.tab:hover { color: #0E2A30; background: #9DC3C4; }
.tab.active { color: #fff; background: linear-gradient(90deg, #C8141C, #A80F16); border-color: #A80F16; box-shadow: 0 6px 18px rgba(120,10,16,0.30); }
.tab.active .n { color: #C8141C; background: #F2E9E6; }
.scene { margin: auto 10px 10px; border-radius: 14px; overflow: hidden; border: 1px solid #6F989B; line-height: 0; background: #A9CCCD; }
.scene p { margin: 0; padding: 10px 12px 12px; line-height: 1.3; font-family: 'Shippori Mincho B1', serif; font-weight: 700; font-size: 14px; color: #0E2A30; border-top: 2px solid var(--torii); }
.focus-btn { background: #A9CCCD; }
.card { background: #A9CCCD; border: 1px solid #86AFB1; box-shadow: 0 8px 22px rgba(14,42,48,0.16); backdrop-filter: none; }
.card-header { border-bottom: 1px solid #95BEBF; position: relative; }
.card-header::before { content: ""; position: absolute; left: 16px; top: 0; width: 28px; height: 2px; background: var(--torii); border-radius: 0 0 2px 2px; }
.card-title { color: #0E2A30; font-family: 'Shippori Mincho B1', serif; letter-spacing: 1.2px; font-size: 13px !important; }
th { color: #2F5A61; border-bottom-color: #86AFB1; }
td { border-bottom-color: rgba(14,42,48,0.10); }
tr:hover td { background: rgba(14,42,48,0.05); }
input, select, textarea { background: #C3DFDF !important; color: #0E2A30 !important; border-color: #6F989B !important; }
.btn { background: #B6D5D6; }
.btn-blue { background: #B0D2D3; }
.btn-lg, .rfq-box .btn-green { box-shadow: none; }
.rfq-box { border-color: #C8141C; background: #B3D3D3; box-shadow: 0 8px 22px rgba(120,10,16,0.12); }
.rfq-box::before { background: var(--torii); color: #fff; }
.mm-box { background: #9EC4C5 !important; }
.regime-badge.regime-calm { background: #8FB9BA; color: #0F5E68; border-color: #5F8A8D; }
.sc-btn.sc-active, .tf-btn.active { background: rgba(200,20,28,0.15) !important; color: #9E0F16 !important; border-color: #C8141C !important; }
.notif { background: #B6D5D6 !important; color: #0E2A30 !important; box-shadow: 0 8px 22px rgba(14,42,48,0.2); }
#journal-card { background: #B6D5D6; border-color: #C8141C; box-shadow: 0 20px 50px rgba(14,42,48,0.3); }
#journal-card .j-title { color: #0E2A30; }
@media (max-width: 900px) {
  .scene { display: none; }
  #tabs .mark { font-size: 18px; letter-spacing: 3px; }
  #tabs .mark svg { width: 24px; height: 20px; }
}
""".replace("CLOUD_URL", CLOUD_URL)
i = s.index("</style>")
s = s[:i] + THEME + s[i:]
open(out, "w", encoding="utf-8").write(s)
print("ok", len(s))
