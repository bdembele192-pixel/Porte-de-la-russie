"""Thème « Kumo » (nuages, temple rouge) appliqué par-dessus la page construite par build.py.
Usage : python3 theme_kumo.py index.html sortie.html"""
import re, sys

src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()

# Palette néon (Vega) -> palette du temple dans les nuages
HEX = {"#05060D": "#0B1F24", "#0C0E20": "#11282D", "#11142C": "#163035", "#161A38": "#1C383D", "#1E2348": "#234249",
       "#23284D": "#29454B", "#363E72": "#3B5C62", "#F3F5FF": "#EAF6F5", "#C9CEEE": "#C3DEDD", "#959DC8": "#93B8B9",
       "#6E76A6": "#6D9599", "#4DE1FF": "#A8DCDC", "#3DFFA8": "#7FE3C4", "#FF4D8D": "#FF4146", "#FFB547": "#F2A65A",
       "#FFE45C": "#F4D58D", "#A66BFF": "#E8202A", "#2EF2D0": "#5FC9C0"}
for a, b in HEX.items():
    s = re.sub(re.escape(a), b, s, flags=re.I)
RGB = {"61,255,168": "127,227,196", "255,77,141": "255,65,70", "77,225,255": "168,220,220", "255,181,71": "242,166,90",
       "255,228,92": "244,213,141", "166,107,255": "232,32,42", "46,242,208": "95,201,192", "54,62,114": "41,69,75",
       "149,157,200": "147,184,185", "12,14,32": "17,40,45", "22,26,56": "24,46,51", "14,16,36": "15,34,39",
       "8,10,22": "10,28,33", "5,6,13": "8,24,28", "6,7,16": "9,26,30"}
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
  "<defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#123A41'/><stop offset='1' stop-color='#0D2A30'/></linearGradient></defs>"
  "<rect width='200' height='150' rx='14' fill='url(#sky)'/>"
  "<circle cx='150' cy='42' r='26' fill='#E8202A'/>"
  "<g fill='#BFE6E5'><circle cx='112' cy='52' r='16'/><circle cx='130' cy='46' r='13'/><circle cx='150' cy='60' r='14'/><circle cx='170' cy='54' r='12'/><circle cx='186' cy='62' r='10'/><rect x='104' y='56' width='96' height='14' rx='7'/></g>"
  "<g fill='#9FD2D2'><circle cx='20' cy='60' r='12'/><circle cx='36' cy='54' r='14'/><circle cx='54' cy='62' r='10'/><rect x='10' y='60' width='52' height='10' rx='5'/></g>"
  "<path fill='#2C3438' d='M0 150 L0 98 L22 70 L38 96 L52 80 L70 108 L70 150Z'/>"
  "<path fill='#2C3438' d='M200 150 L200 92 L178 74 L160 100 L142 86 L128 112 L128 150Z'/>"
  "<path fill='#3A4347' d='M70 150 L80 104 L120 104 L130 150Z'/>"
  "<g fill='#55606A'><rect x='92' y='106' width='16' height='44'/></g>"
  "<g stroke='#2C3438' stroke-width='1'><line x1='92' y1='114' x2='108' y2='114'/><line x1='92' y1='122' x2='108' y2='122'/><line x1='92' y1='130' x2='108' y2='130'/><line x1='92' y1='138' x2='108' y2='138'/></g>"
  "<g fill='#E8202A'><rect x='86' y='78' width='3' height='26'/><rect x='111' y='78' width='3' height='26'/><rect x='84' y='84' width='32' height='2.5'/></g>"
  "<path fill='#2A2F33' d='M78 79 Q100 70 122 79 L118 74 Q100 64 82 74Z'/><path fill='#2A2F33' d='M84 68 Q100 59 116 68 L112 63 Q100 55 88 63Z'/>"
  "<g fill='#E8202A'><rect x='90' y='66' width='20' height='4'/></g>"
  "<g fill='#E8202A'><circle cx='26' cy='104' r='9'/><circle cx='36' cy='98' r='8'/><circle cx='42' cy='108' r='7'/><circle cx='18' cy='112' r='7'/>"
  "<circle cx='166' cy='106' r='9'/><circle cx='176' cy='98' r='7'/><circle cx='184' cy='110' r='8'/><circle cx='158' cy='114' r='6'/></g>"
  "<g fill='#D8EFEE'><circle cx='30' cy='146' r='12'/><circle cx='52' cy='142' r='14'/><circle cx='150' cy='144' r='13'/><circle cx='172' cy='146' r='12'/><rect x='14' y='142' width='176' height='8' rx='4'/></g>"
  "<g stroke='#E8202A' stroke-width='1.4' fill='none' stroke-linecap='round'><path d='M30 22 l4 3 l4 -3'/><path d='M48 14 l3 2 l3 -2'/><path d='M62 26 l3 2 l3 -2'/></g>"
  "</svg></div>")
s = re.sub(r'<div class="maxim">.*?</div>', lambda m: SCENE.replace("</svg></div>", "</svg><p>Above the clouds, the price is calm.</p></div>"), s, count=1, flags=re.S)

s = s.replace("<title>Vega FX Desk</title>", "<title>Vega FX Desk</title>", 1)

THEME = """
/* ═══ KUMO — temple rouge au-dessus des nuages ═══ */
:root { --display: 'Shippori Mincho B1', 'Space Grotesk', serif; --torii: #E8202A; --cloud: #A8DCDC; --stone: #1A2B2F; }
body { background: linear-gradient(180deg, #0D262C 0%, #0A1D22 55%, #0B2228 100%); }
body::before { content: none; }
body::after { content: none; }
.panel { position: relative; z-index: 1; }
#topbar { background: rgba(10,28,33,0.78); border-bottom: 1px solid rgba(168,220,220,0.10); }
.topbar-market .spot-val { font-family: 'Space Grotesk', sans-serif; color: #F2FBFA; text-shadow: none; }
.pnl-total { font-family: 'Space Grotesk', sans-serif; text-shadow: none !important; }
#tabs { background: linear-gradient(180deg, #13292E, #0C1E22); border-right: 1px solid rgba(168,220,220,0.10); }
#tabs .mark { display: flex; align-items: center; gap: 10px; background: none; -webkit-background-clip: border-box; background-clip: border-box; color: #F2FBFA; filter: none;
  font-family: 'Shippori Mincho B1', serif; font-weight: 800; font-size: 28px; letter-spacing: 7px; }
#tabs .mark svg { flex: none; }
.tab.active { color: #fff; background: linear-gradient(90deg, rgba(232,32,42,0.92), rgba(196,20,28,0.78)); border-color: rgba(255,90,90,0.5); box-shadow: 0 6px 22px rgba(232,32,42,0.28); }
.tab.active .n { color: #E8202A; background: #F2FBFA; }
.tab:hover { background: rgba(168,220,220,0.07); }
#tabs { padding-top: 18px; }
#tabs .brand { padding-bottom: 14px; }
.nav-sec { padding: 10px 12px 4px; }
.tab { padding: 6px 12px; }
.scene p { margin: 0; padding: 10px 12px 12px; line-height: 1.3; font-family: 'Shippori Mincho B1', serif; font-weight: 700; font-size: 14px; color: #EAF6F5; background: #102529; border-top: 2px solid var(--torii); }
.scene { margin: auto 10px 10px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(168,220,220,0.14); line-height: 0; }
.scene + .maxim { margin-top: 0; }
.maxim { font-family: 'Shippori Mincho B1', serif; font-weight: 700; background: rgba(168,220,220,0.06); border-color: rgba(168,220,220,0.14); border-left: 3px solid var(--torii); }
.card { background: linear-gradient(180deg, #1B3338, #142A2F); backdrop-filter: none; border: 1px solid rgba(168,220,220,0.12); box-shadow: 0 14px 40px rgba(0,0,0,0.35); }
.card-header { border-bottom: 1px solid rgba(168,220,220,0.08); position: relative; }
.card-header::before { content: ""; position: absolute; left: 16px; top: 0; width: 28px; height: 2px; background: var(--torii); border-radius: 0 0 2px 2px; }
.card-title { color: #D7ECEB; font-family: 'Shippori Mincho B1', serif; letter-spacing: 1.2px; font-size: 13px !important; }
.btn-blue { background: rgba(168,220,220,0.10); }
.btn-lg, .rfq-box .btn-green { box-shadow: none; }
.rfq-box { border-color: rgba(232,32,42,0.55); background: rgba(16,36,41,0.9); box-shadow: 0 0 30px rgba(232,32,42,0.10); }
.rfq-box::before { background: var(--torii); color: #fff; }
.regime-badge.regime-calm { background: rgba(168,220,220,0.12); color: #A8DCDC; border-color: rgba(168,220,220,0.35); }
.sc-btn.sc-active { background: rgba(232,32,42,0.18) !important; color: #FF6A6E !important; border-color: rgba(232,32,42,0.6) !important; }
.tf-btn.active { background: rgba(232,32,42,0.18) !important; color: #FF6A6E !important; border-color: rgba(232,32,42,0.6) !important; }
#journal-card { border-color: rgba(232,32,42,0.6); box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
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
