"""Thème « Kumo » clair (nuages pâles, temple rouge) appliqué par-dessus la page construite par build.py.
Usage : python3 theme_kumo.py index.html sortie.html"""
import re, sys

src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()

# Palette néon (Vega) -> palette du temple dans les nuages
HEX = {"#05060D": "#E4F1F0", "#0C0E20": "#FFFFFF", "#11142C": "#F1F8F7", "#161A38": "#E6F1F0", "#1E2348": "#D8EAE9",
       "#23284D": "#C9E0DF", "#363E72": "#A9CACA", "#F3F5FF": "#10303A", "#C9CEEE": "#24505A", "#959DC8": "#4E7680",
       "#6E76A6": "#6F9198", "#4DE1FF": "#1C7C89", "#3DFFA8": "#0E8F6A", "#FF4D8D": "#D7141C", "#FFB547": "#B7700F",
       "#FFE45C": "#8A6D00", "#A66BFF": "#E8202A", "#2EF2D0": "#138A80"}
for a, b in HEX.items():
    s = re.sub(re.escape(a), b, s, flags=re.I)
RGB = {"255,255,255": "16,48,58",  # d'abord : le blanc des canvas devient du texte foncé
       "61,255,168": "14,143,106", "255,77,141": "215,20,28", "77,225,255": "28,124,137", "255,181,71": "183,112,15",
       "255,228,92": "138,109,0", "166,107,255": "232,32,42", "46,242,208": "19,138,128", "54,62,114": "169,202,202",
       "149,157,200": "78,118,128", "12,14,32": "255,255,255", "22,26,56": "255,255,255", "14,16,36": "241,248,247",
       "8,10,22": "255,255,255", "5,6,13": "228,241,240", "6,7,16": "228,241,240"}
for a, b in RGB.items():
    s = re.sub(r"rgba?\(\s*" + r",\s*".join(a.split(",")), lambda m, b=b: m.group(0).split("(")[0] + "(" + b, s)

s = s.replace("family=Space+Grotesk:wght@500;700&", "family=Space+Grotesk:wght@500;700&family=Shippori+Mincho+B1:wght@700;800&")

# Nuages et soleil en SVG (décor de fond, ne capte pas les clics)
CLOUD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 220'><g fill='%23A8DCDC'>"
         "<circle cx='90' cy='160' r='70'/><circle cx='190' cy='120' r='90'/><circle cx='310' cy='140' r='80'/>"
         "<circle cx='420' cy='120' r='95'/><circle cx='520' cy='165' r='65'/><rect x='60' y='160' width='490' height='60' rx='30'/></g></svg>")
CLOUD_URL = "url(\"data:image/svg+xml;utf8," + CLOUD.replace("<", "%3C").replace(">", "%3E") + "\")"
TORII = ("<svg viewBox='0 0 40 32' width='34' height='28' aria-hidden='true'><path fill='#E8202A' d='M1 4c8 2 30 2 38 0l-1 4c-7 1-29 1-36 0z'/>"
         "<rect x='5' y='11' width='30' height='3' fill='#E8202A'/><rect x='9' y='8' width='4' height='24' fill='#E8202A'/>"
         "<rect x='27' y='8' width='4' height='24' fill='#E8202A'/><rect x='18' y='10' width='4' height='5' fill='#E8202A'/></svg>")
s = s.replace('<div class="brand"><div class="mark">VEGA</div>', '<div class="brand"><div class="mark">' + TORII + '<span>VEGA</span></div>', 1)
s = s.replace('<div class="maxim">Price it. Hedge it. Own it.<span>Quote tight, hedge fast, keep a journal.</span></div>',
              '<div class="maxim">Above the clouds, the price is calm.<span>Quote tight, hedge fast, keep a journal.</span></div>', 1)

SCENE = ("<div class='scene' aria-hidden='true'><svg viewBox='0 0 200 150' width='100%'>"
  "<defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#BFE3E2'/><stop offset='1' stop-color='#E3F2F1'/></linearGradient></defs>"
  "<rect width='200' height='150' rx='14' fill='url(#sky)'/>"
  "<circle cx='150' cy='42' r='26' fill='#E8202A'/>"
  "<g fill='#FFFFFF'><circle cx='112' cy='52' r='16'/><circle cx='130' cy='46' r='13'/><circle cx='150' cy='60' r='14'/><circle cx='170' cy='54' r='12'/><circle cx='186' cy='62' r='10'/><rect x='104' y='56' width='96' height='14' rx='7'/></g>"
  "<g fill='#F4FBFA'><circle cx='20' cy='60' r='12'/><circle cx='36' cy='54' r='14'/><circle cx='54' cy='62' r='10'/><rect x='10' y='60' width='52' height='10' rx='5'/></g>"
  "<path fill='#56636A' d='M0 150 L0 98 L22 70 L38 96 L52 80 L70 108 L70 150Z'/>"
  "<path fill='#56636A' d='M200 150 L200 92 L178 74 L160 100 L142 86 L128 112 L128 150Z'/>"
  "<path fill='#6B777D' d='M70 150 L80 104 L120 104 L130 150Z'/>"
  "<g fill='#8A969B'><rect x='92' y='106' width='16' height='44'/></g>"
  "<g stroke='#56636A' stroke-width='1'><line x1='92' y1='114' x2='108' y2='114'/><line x1='92' y1='122' x2='108' y2='122'/><line x1='92' y1='130' x2='108' y2='130'/><line x1='92' y1='138' x2='108' y2='138'/></g>"
  "<g fill='#E8202A'><rect x='86' y='78' width='3' height='26'/><rect x='111' y='78' width='3' height='26'/><rect x='84' y='84' width='32' height='2.5'/></g>"
  "<path fill='#2A2F33' d='M78 79 Q100 70 122 79 L118 74 Q100 64 82 74Z'/><path fill='#2A2F33' d='M84 68 Q100 59 116 68 L112 63 Q100 55 88 63Z'/>"
  "<g fill='#E8202A'><rect x='90' y='66' width='20' height='4'/></g>"
  "<g fill='#E8202A'><circle cx='26' cy='104' r='9'/><circle cx='36' cy='98' r='8'/><circle cx='42' cy='108' r='7'/><circle cx='18' cy='112' r='7'/>"
  "<circle cx='166' cy='106' r='9'/><circle cx='176' cy='98' r='7'/><circle cx='184' cy='110' r='8'/><circle cx='158' cy='114' r='6'/></g>"
  "<g fill='#FFFFFF'><circle cx='30' cy='146' r='12'/><circle cx='52' cy='142' r='14'/><circle cx='150' cy='144' r='13'/><circle cx='172' cy='146' r='12'/><rect x='14' y='142' width='176' height='8' rx='4'/></g>"
  "<g stroke='#E8202A' stroke-width='1.4' fill='none' stroke-linecap='round'><path d='M30 22 l4 3 l4 -3'/><path d='M48 14 l3 2 l3 -2'/><path d='M62 26 l3 2 l3 -2'/></g>"
  "</svg></div>")
s = re.sub(r'<div class="maxim">.*?</div>', lambda m: SCENE.replace("</svg></div>", "</svg><p>Above the clouds, the price is calm.</p></div>"), s, count=1, flags=re.S)

s = s.replace("<title>Vega FX Desk</title>", "<title>Vega FX Desk</title>", 1)

THEME = """
/* ═══ KUMO clair — temple rouge, nuages pâles ═══ */
:root { --display: 'Shippori Mincho B1', 'Space Grotesk', serif; --torii: #E8202A; }
body { background: linear-gradient(180deg, #EAF5F4 0%, #DDEEED 100%); color: var(--text-0); }
body::before, body::after { content: none; }
.panel { position: relative; z-index: 1; }
#topbar { background: rgba(255,255,255,0.88); border-bottom: 1px solid #C9E0DF; }
.topbar-market .spot-val { font-family: 'Space Grotesk', sans-serif; color: #10303A; text-shadow: none; }
.pnl-total { font-family: 'Space Grotesk', sans-serif; text-shadow: none !important; }
#sim-controls { background: rgba(244,250,249,0.9) !important; border-bottom: 1px solid #C9E0DF !important; }
#tabs { background: #F4FAF9; border-right: 1px solid #C9E0DF; backdrop-filter: none; }
#tabs .mark { display: flex; align-items: center; gap: 10px; background: none; -webkit-background-clip: border-box; background-clip: border-box; color: #10303A; filter: none;
  font-family: 'Shippori Mincho B1', serif; font-weight: 800; font-size: 28px; letter-spacing: 7px; }
#tabs .mark svg { flex: none; }
#tabs { padding-top: 18px; }
#tabs .brand { padding-bottom: 14px; }
.nav-sec { padding: 10px 12px 4px; }
.tab { padding: 6px 12px; color: #3E6670; }
.tab .n { background: #E1EFEE; color: #4E7680; }
.tab:hover { color: #10303A; background: #E6F2F1; }
.tab.active { color: #fff; background: linear-gradient(90deg, #E8202A, #C9151D); border-color: #C9151D; box-shadow: 0 6px 18px rgba(232,32,42,0.25); }
.tab.active .n { color: #E8202A; background: #fff; }
.scene { margin: auto 10px 10px; border-radius: 14px; overflow: hidden; border: 1px solid #C9E0DF; line-height: 0; background: #fff; }
.scene p { margin: 0; padding: 10px 12px 12px; line-height: 1.3; font-family: 'Shippori Mincho B1', serif; font-weight: 700; font-size: 14px; color: #10303A; border-top: 2px solid var(--torii); }
.focus-btn { background: #fff; }
.card { background: #FFFFFF; border: 1px solid #D3E7E6; box-shadow: 0 8px 24px rgba(16,48,58,0.07); backdrop-filter: none; }
.card-header { border-bottom: 1px solid #E3F0EF; position: relative; }
.card-header::before { content: ""; position: absolute; left: 16px; top: 0; width: 28px; height: 2px; background: var(--torii); border-radius: 0 0 2px 2px; }
.card-title { color: #10303A; font-family: 'Shippori Mincho B1', serif; letter-spacing: 1.2px; font-size: 13px !important; }
td { border-bottom-color: #EDF5F4; }
tr:hover td { background: #F3F9F8; }
input, select, textarea { background: #FFFFFF !important; color: #10303A !important; border-color: #BCD8D7 !important; }
.btn { background: #fff; }
.btn-blue { background: #EAF5F4; }
.btn-lg, .rfq-box .btn-green { box-shadow: none; }
.rfq-box { border-color: rgba(232,32,42,0.5); background: #FFF8F7; box-shadow: 0 8px 24px rgba(232,32,42,0.08); }
.rfq-box::before { background: var(--torii); color: #fff; }
.mm-box { background: #F4FAF9 !important; }
.regime-badge.regime-calm { background: #E1F1EF; color: #1C7C89; border-color: #A9CACA; }
.sc-btn.sc-active, .tf-btn.active { background: #FDE8E8 !important; color: #C9151D !important; border-color: #E8202A !important; }
.notif { background: #FFFFFF !important; color: #10303A !important; box-shadow: 0 8px 24px rgba(16,48,58,0.12); }
#journal-card { background: #FFFFFF; border-color: #E8202A; box-shadow: 0 20px 50px rgba(16,48,58,0.18); }
#journal-card .j-title { color: #10303A; }
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
