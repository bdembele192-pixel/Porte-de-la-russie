"""Construit fx-desk/index.html (version « Stoa ») à partir du fichier original du frère.
Usage : python3 build.py orig.txt sortie.html"""
import re, sys

src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()
n_fixes = []

def sub_once(old, new, label):
    global s
    if s.count(old) < 1:
        raise SystemExit("introuvable : " + label)
    s = s.replace(old, new, 1)
    n_fixes.append(label)

# ---------- 1. Palette et polices ----------
root_new = """:root {
  --bg-0: #0A0A0B;
  --bg-1: #111112;
  --bg-2: #161615;
  --bg-3: #1C1B19;
  --bg-4: #252320;
  --border: #2A2824;
  --border-bright: #3B3832;
  --text-0: #EDEAE3;
  --text-1: #CBC6BA;
  --text-2: #9C968A;
  --text-3: #78736A;
  --accent-blue: #C9B38A;
  --accent-green: #79C59A;
  --accent-red: #E2725B;
  --accent-orange: #D9A55B;
  --accent-yellow: #E8D7A8;
  --accent-purple: #A99BC9;
  --accent-teal: #8FB8A8;
  --pos: #79C59A;
  --neg: #E2725B;
  --warn: #D9A55B;
  --mono: 'IBM Plex Mono', monospace;
  --sans: 'Inter', system-ui, sans-serif;
  --serif: 'Cormorant Garamond', Georgia, serif;
  --display: 'Cinzel', 'Cormorant Garamond', serif;
  --side: 216px;
}"""
s = re.sub(r":root \{.*?\n\}", root_new, s, count=1, flags=re.S)
sub_once("@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');",
         "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');",
         "polices")

# Couleurs codées en dur (canvas, styles en ligne) -> mêmes teintes que la palette
COLORS = {
    "#00ff9d": "#79C59A", "#ff3b5c": "#E2725B", "#00d4ff": "#C9B38A", "#ff9a3c": "#D9A55B",
    "#ffd700": "#E8D7A8", "#b66dff": "#A99BC9", "#00c8a0": "#8FB8A8", "#e8f4f8": "#EDEAE3",
}
for a, b in COLORS.items():
    s = re.sub(re.escape(a), b, s, flags=re.I)
RGB = {
    "0,255,157": "121,197,154", "255,59,92": "226,114,91", "0,212,255": "201,179,138",
    "255,154,60": "217,165,91", "255,215,0": "232,215,168", "182,109,255": "169,155,201",
    "0,200,160": "143,184,168", "30,45,61": "58,55,50", "106,143,168": "156,150,138", "13,17,23": "17,17,18",
}
for a, b in RGB.items():
    s = re.sub(r"rgba?\(\s*" + r",\s*".join(a.split(",")), lambda m, b=b: m.group(0).split("(")[0] + "(" + b, s)
# La heatmap de la surface de vol : dégradé vert -> rouge néon remplacé par sauge -> terre cuite
sub_once("const bg = `rgba(${r},${g},80,0.3)`;",
         "const bg = `rgba(${Math.round(121+(226-121)*norm)},${Math.round(197+(114-197)*norm)},${Math.round(154+(91-154)*norm)},0.22)`;",
         "heatmap vol")

# ---------- 2. Tailles de texte (+2 px, lisibilité) ----------
def bump(m):
    v = float(m.group(1))
    return m.group(0).replace(m.group(1), (str(int(v + 2)) if v.is_integer() else str(v + 2)), 1) if v <= 13 else m.group(0)
s = re.sub(r"font-size:\s*(\d+(?:\.\d+)?)px", bump, s)
s = re.sub(r"(\d+)px IBM Plex Mono", lambda m: str(int(m.group(1)) + 1) + "px IBM Plex Mono", s)

# ---------- 3. Émojis retirés ----------
KEEP = set("✓✗✕")
EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-➿①-⓿⏩-⏺⭐⭕⬆⬇⬅➡️‍] ?")
s = EMOJI.sub(lambda m: m.group(0) if m.group(0)[0] in KEEP else "", s)

# ---------- 4. Corrections de bugs ----------
# 4a. showTab dépendait de l'objet global « event »
sub_once("function showTab(name) {", "function showTab(name, el) {", "showTab signature")
sub_once("  event.target.classList.add('active');",
         "  const navEl = el || document.querySelector('.tab[data-tab=\"' + name + '\"]');\n  if (navEl) navEl.classList.add('active');\n  const main = document.getElementById('main'); if (main) main.scrollTop = 0;",
         "showTab event")

# 4b. Pricer : le select vaut buy/sell, le code testait 'long' -> tout devenait short
sub_once("  const side = document.getElementById('p-side').value;\n  const tenorEl",
         "  const rawSide = document.getElementById('p-side').value;\n  const side = (rawSide === 'buy' || rawSide === 'long') ? 'long' : 'short';\n  const tenorEl",
         "pricer side")

# 4c. getLargestTenor recalculait tout le book à chaque ténor
sub_once("""  TENORS.forEach(t => {
    const { tenorBuckets } = computeBookGreeks();
    const v""", """  const { tenorBuckets } = computeBookGreeks();
  TENORS.forEach(t => {
    const v""", "getLargestTenor")

# 4d. Smile : une variable CSS n'est pas une couleur valide pour un canvas
sub_once("ctx.fillStyle='var(--text-3)';", "ctx.fillStyle='#78736A';", "smile labels")

# 4e. Panneau Market : barre de timeframe non fermée, boutons TF/TA et canvas RSI absents
sub_once("""        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
          <span style="font-size:11px;color:var(--text-3);letter-spacing:1px;">TIMEFRAME</span>
          <canvas id="spot-canvas" style="height:140px;"></canvas>""",
"""        <div class="tf-bar">
          <span class="tf-lbl">Timeframe</span>
          <button id="tfb-5" class="tf-btn active" onclick="setTF(5)">5s</button>
          <button id="tfb-15" class="tf-btn" onclick="setTF(15)">15s</button>
          <button id="tfb-30" class="tf-btn" onclick="setTF(30)">30s</button>
          <button id="tfb-60" class="tf-btn" onclick="setTF(60)">1m</button>
          <button id="tfb-300" class="tf-btn" onclick="setTF(300)">5m</button>
          <span class="tf-lbl" style="margin-left:8px;">Studies</span>
          <button id="ta-sma" class="tf-btn" onclick="toggleTA('sma')">SMA</button>
          <button id="ta-ema" class="tf-btn" onclick="toggleTA('ema')">EMA</button>
          <button id="ta-bb" class="tf-btn" onclick="toggleTA('bb')">BB</button>
          <button id="ta-rsi" class="tf-btn" onclick="toggleTA('rsi')">RSI</button>
          <span id="tf-info-label" class="muted" style="margin-left:auto;font-size:11px;"></span>
        </div>
        <canvas id="spot-canvas" style="height:140px;"></canvas>
        <canvas id="rsi-canvas" style="width:100%;height:40px;display:none;margin-top:4px;"></canvas>""",
"market timeframe")
sub_once("""  </div>
</div>
</div>

<!-- VOL SURFACE -->""", """  </div>
</div>

<!-- VOL SURFACE -->""", "market extra div")
sub_once("""  if (btn) btn.classList.toggle('ta-on', chartState.taEnabled[name]);
""", """  if (btn) btn.classList.toggle('ta-on', chartState.taEnabled[name]);
  const rsiC = document.getElementById('rsi-canvas');
  if (name === 'rsi' && rsiC) rsiC.style.display = chartState.taEnabled.rsi ? 'block' : 'none';
""", "rsi toggle")

sub_once("</div><!-- end main -->", "</div><!-- end training -->\n</div><!-- end main -->", "training non fermé")

# 4f. Identifiant macro-history-overlay en double
sub_once("""<!-- MACRO HISTORY OVERLAY -->
<div id="macro-history-overlay" onclick="closeMacroHistory()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:998;"></div>
""", "", "overlay double")

# 4g. Journal : window.prompt bloquait la simulation -> carte non bloquante
s = re.sub(r"function promptJournalEntry\(rfq\) \{.*?\n\}\n", """function promptJournalEntry(rfq) {
  // Carte non bloquante : la simulation continue pendant que tu écris
  const box = document.getElementById('journal-card');
  if (!box) return;
  box._rfq = rfq;
  document.getElementById('journal-product').textContent = rfq.description.substring(0, 60);
  const inp = document.getElementById('journal-input');
  inp.value = '';
  box.classList.add('open');
  setTimeout(() => inp.focus(), 50);
}

function saveJournalEntry(skip) {
  const box = document.getElementById('journal-card');
  const rfq = box._rfq;
  const reason = document.getElementById('journal-input').value.trim();
  box.classList.remove('open');
  box._rfq = null;
  if (skip || !rfq || !reason) return;
  tradingJournal.push({
    product: rfq.template.product + ' ' + rfq.tenor,
    reason,
    edge: rfq.myPrice && rfq.fairValue ? ((Math.abs(rfq.myPrice - rfq.fairValue)*10000).toFixed(2) + ' pips') : '',
    time: new Date().toLocaleTimeString(),
  });
  showNotif('Journal entry saved', 'info');
}
""", s, count=1, flags=re.S)
n_fixes.append("journal")


# 4h. fmt : double signe moins sur les nombres négatifs >= 1000
sub_once("format(Math.round(n));\n  return sign", "format(Math.round(abs));\n  return sign", "fmt signe")

# 4i. Term structure et smile : beginPath() dans la boucle effaçait la ligne, seuls les points restaient
sub_once("""  ctx.beginPath();
  vols.forEach((v,i) => {
    const x = i/(vols.length-1)*(w-40)+20;
    const y = h-(v-min)/(max-min)*h*0.8-h*0.1;""", """  ctx.beginPath();
  vols.forEach((v,i) => { const x = i/(vols.length-1)*(w-40)+20, y = h-(v-min)/(max-min)*h*0.8-h*0.1; i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y); });
  ctx.stroke();
  ctx.beginPath();
  vols.forEach((v,i) => {
    const x = i/(vols.length-1)*(w-40)+20;
    const y = h-(v-min)/(max-min)*h*0.8-h*0.1;""", "term structure ligne")
sub_once("""  ctx.beginPath();
  vols.forEach((v,i)=>{
    const x=i/(vols.length-1)*(w-40)+20;
    const y=h-(v-min)/(max-min)*h*0.85-h*0.05;""", """  ctx.beginPath();
  vols.forEach((v,i)=>{ const x=i/(vols.length-1)*(w-40)+20, y=h-(v-min)/(max-min)*h*0.85-h*0.05; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
  ctx.stroke();
  ctx.beginPath();
  vols.forEach((v,i)=>{
    const x=i/(vols.length-1)*(w-40)+20;
    const y=h-(v-min)/(max-min)*h*0.85-h*0.05;""", "smile ligne")

# Barre du haut allégée : Save / Load / News rejoignent la barre de simulation
SAVE_BLOCK = """  <div style="display:flex;gap:6px;align-items:center;margin-left:8px;">
    <button class="btn btn-blue" style="padding:3px 10px;font-size:11px;" onclick="saveSession()">SAVE</button>
    <button class="btn" style="padding:3px 10px;font-size:11px;" onclick="loadSession()">LOAD</button>
    <span id="save-indicator" style="font-size:10px;color:var(--text-3);"></span>
  </div>
  <button class="btn btn-orange" style="padding:3px 10px;font-size:11px;" onclick="showMacroHistory()">NEWS</button>
"""
sub_once(SAVE_BLOCK, "", "topbar boutons")
sub_once('  <div style="margin-left:auto;display:flex;gap:6px;">\n', """  <div style="margin-left:auto;display:flex;gap:6px;align-items:center;">
    <span id="save-indicator" style="font-size:10px;color:var(--text-3);"></span>
    <button class="btn" style="padding:3px 10px;font-size:11px;" onclick="saveSession()">SAVE</button>
    <button class="btn" style="padding:3px 10px;font-size:11px;" onclick="loadSession()">LOAD</button>
    <button class="btn btn-orange" style="padding:3px 10px;font-size:11px;" onclick="showMacroHistory()">NEWS</button>
""", "sim bar boutons")

# 4j. Table de déformation : gamma affiché ×1e6 (valeurs absurdes) -> EUR de delta par pip, comme le graphique
sub_once("(r.gamma*1e6).toFixed(2)", "(r.gamma*0.0001).toFixed(0)", "gamma table")

# ---------- 5. Navigation latérale ----------
NAV = [("Taker", [("myrfq", "My RFQ")]),
       ("Market", [("market", "Market"), ("volsurface", "Vol Surface")]),
       ("Dealing", [("rfq", "Client RFQ"), ("pricer", "Pricer")]),
       ("Risk", [("book", "Book"), ("greeks", "Greeks"), ("hedging", "Hedging"), ("pnl", "PnL Attribution")]),
       ("Practice", [("training", "Training")])]
items, k = [], 0
for sec, tabs in NAV:
    items.append(f'    <div class="nav-sec">{sec}</div>')
    for tid, label in tabs:
        roman = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][k]; k += 1
        act = " active" if tid == "market" else ""
        items.append(f'    <div class="tab{act}" data-tab="{tid}" onclick="showTab(\'{tid}\', this)"><span class="n">{roman}</span>{label}</div>')
side = """<aside id="tabs">
  <div class="brand"><div class="mark">STOA</div><div class="sub">FX Options Desk · EUR/USD</div></div>
  <nav>
""" + "\n".join(items) + """
  </nav>
  <div class="maxim">“Some things are within our control: your price, your size, your hedge. The rest belongs to the market.”<span>after Epictetus</span></div>
  <button class="btn focus-btn" id="focus-btn" onclick="toggleFocus()">Focus mode</button>
</aside>"""
s = re.sub(r'<div id="tabs">.*?\n</div>', lambda m: side, s, count=1, flags=re.S)
n_fixes.append("sidebar")
sub_once('<div class="logo">▸ FX-OPTIONS</div>', '<div class="logo">STOA</div>', "logo")

# Carte de journal + écran focus
sub_once("<!-- LIMIT SETTINGS MODAL -->", """<!-- JOURNAL (non bloquant) -->
<div id="journal-card">
  <div class="j-title">Journal — why this trade?</div>
  <div id="journal-product" class="j-prod"></div>
  <textarea id="journal-input" rows="2" placeholder="Your edge, your rationale, your risk." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();saveJournalEntry(false);} if(event.key==='Escape'){saveJournalEntry(true);}"></textarea>
  <div class="j-act"><button class="btn" onclick="saveJournalEntry(true)">Skip</button><button class="btn btn-blue" onclick="saveJournalEntry(false)">Save</button></div>
</div>

<!-- LIMIT SETTINGS MODAL -->""", "journal html")

EXTRA_JS = """
// ═══ FOCUS MODE ═══
function toggleFocus(force) {
  const on = typeof force === 'boolean' ? force : !document.body.classList.contains('focus');
  document.body.classList.toggle('focus', on);
  const b = document.getElementById('focus-btn');
  if (b) b.textContent = on ? 'Leave focus' : 'Focus mode';
  try { localStorage.setItem('stoa:focus', on ? '1' : '0'); } catch (e) {}
  setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
}
window.addEventListener('load', () => { try { if (localStorage.getItem('stoa:focus') === '1') toggleFocus(true); } catch (e) {} });
document.addEventListener('keydown', e => {
  if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) toggleFocus();
});
"""
sub_once("window.addEventListener('load', init);\n</script>", "window.addEventListener('load', init);\n" + EXTRA_JS + "</script>", "focus js")

EXTRA_CSS = """
/* ═══ STOA — calme, sobre, concentré ═══ */
body { padding-left: var(--side); font-feature-settings: "tnum" 1; -webkit-font-smoothing: antialiased; }
#topbar { padding: 10px 18px; gap: 22px; flex-wrap: wrap; row-gap: 6px; }
#topbar .logo { display: none; }
.topbar-market .spot-val { font-size: 24px; font-weight: 500; letter-spacing: 0.5px; }
.topbar-stat .lbl, .card-title, th, .nav-sec, .tf-lbl { font-family: var(--sans); }
.topbar-stat .lbl { letter-spacing: 1.5px; }
.pnl-total { font-size: 19px; font-weight: 600; }
.regime-badge { border-radius: 999px; padding: 3px 11px; font-family: var(--sans); }
.regime-shock { animation: pulse 2.4s ease-in-out infinite; }
#sim-controls { padding: 6px 18px !important; flex-wrap: wrap; row-gap: 6px; }
#notification { top: auto; bottom: 16px; right: 16px; width: min(360px, calc(100vw - 32px)); }
.panel > *, .row > * { min-width: 0; }
.card-body { overflow-x: auto; }

#tabs {
  position: fixed; left: 0; top: 0; bottom: 0; width: var(--side);
  display: flex; flex-direction: column; gap: 0; overflow-y: auto; overflow-x: hidden;
  background: var(--bg-0); border-right: 1px solid var(--border); border-bottom: none; z-index: 200;
  padding: 22px 0 16px;
}
#tabs .brand { padding: 0 22px 22px; border-bottom: 1px solid var(--border); margin-bottom: 10px; }
#tabs .mark { font-family: var(--display); font-size: 26px; letter-spacing: 9px; color: var(--accent-blue); font-weight: 500; }
#tabs .sub { font-family: var(--sans); font-size: 11px; color: var(--text-3); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 6px; }
#tabs nav { display: flex; flex-direction: column; }
.nav-sec { font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--text-3); padding: 14px 22px 6px; }
.tab {
  display: flex; align-items: center; gap: 12px;
  padding: 9px 22px; font-family: var(--sans); font-size: 13px; font-weight: 500; letter-spacing: 0.3px; text-transform: none;
  color: var(--text-2); border: none; border-left: 2px solid transparent; background: none;
}
.tab .n { width: 26px; font-family: var(--display); font-size: 11px; color: var(--text-3); letter-spacing: 1px; }
.tab:hover { color: var(--text-0); background: var(--bg-2); }
.tab.active { color: var(--text-0); background: var(--bg-2); border-left-color: var(--accent-blue); border-bottom-color: transparent; }
.tab.active .n { color: var(--accent-blue); }
.maxim { margin: auto 22px 14px; padding-top: 18px; border-top: 1px solid var(--border); font-family: var(--serif); font-style: italic; font-size: 15px; line-height: 1.45; color: var(--text-2); }
.maxim span { display: block; margin-top: 8px; font-family: var(--sans); font-style: normal; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-3); }
.focus-btn { margin: 0 22px; text-transform: none; letter-spacing: 0.5px; font-family: var(--sans); }

.panel { padding: 16px 18px; gap: 14px; }
.card { border-radius: 6px; background: var(--bg-1); }
.card-header { background: transparent; padding: 10px 14px 8px; }
.card-title { letter-spacing: 2px; color: var(--text-2); font-weight: 600; }
.card-body { padding: 10px 14px 12px; }
td { border-bottom-color: rgba(237,234,227,0.05); }
tr:hover td { background: rgba(201,179,138,0.04); }
.btn { border-radius: 4px; font-family: var(--sans); letter-spacing: 1px; }
input, select, textarea { border-radius: 4px; }
.rfq-box { border-color: rgba(201,179,138,0.5); border-radius: 6px; }
.rfq-box::before { border-radius: 0 0 4px 4px; }
.mm-box { border-radius: 4px; }
.feedback-item { border-radius: 0 4px 4px 0; }
.notif { font-family: var(--sans); border-radius: 4px; }

.tf-bar { display: flex; align-items: center; gap: 5px; margin-bottom: 8px; flex-wrap: wrap; }
.tf-lbl { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-3); margin-right: 2px; }
.tf-btn { padding: 3px 9px !important; }

#journal-card {
  position: fixed; left: calc(var(--side) + 18px); bottom: 18px; width: min(420px, calc(100vw - 36px)); z-index: 950;
  background: var(--bg-1); border: 1px solid var(--accent-blue); border-radius: 8px; padding: 14px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6); display: none; font-family: var(--sans);
}
#journal-card.open { display: block; }
#journal-card .j-title { font-family: var(--display); letter-spacing: 3px; font-size: 13px; color: var(--accent-blue); }
#journal-card .j-prod { font-size: 12px; color: var(--text-2); margin: 4px 0 10px; }
#journal-card textarea { width: 100%; background: var(--bg-0); color: var(--text-0); border: 1px solid var(--border-bright); padding: 8px 10px; font-family: var(--sans); font-size: 13px; resize: vertical; outline: none; }
#journal-card textarea:focus { border-color: var(--accent-blue); }
#journal-card .j-act { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }

/* Mode focus : seul l'essentiel reste visible */
body.focus #sim-controls, body.focus .maxim, body.focus .nav-sec,
body.focus #topbar .topbar-stat:not(.keep), body.focus #topbar > div[style*="margin-left:8px"],
body.focus #topbar > .btn { display: none !important; }
body.focus #topbar .topbar-pnl .topbar-stat { display: flex !important; }
body.focus #notification { opacity: 0.35; }
body.focus #notification:hover { opacity: 1; }

@media (max-width: 900px) {
  :root { --side: 0px; }
  body { overflow: auto; height: auto; min-height: 100vh; }
  #main { overflow: visible; }
  .panel { height: auto; overflow: visible; padding: 12px 16px; }
  #tabs { position: sticky; top: 0; width: auto; flex-direction: row; padding: 0; border-right: none; border-bottom: 1px solid var(--border); overflow-x: auto; order: -1; }
  #tabs .brand { display: flex; align-items: center; padding: 0 14px; border: none; margin: 0; }
  #tabs .mark { font-size: 16px; letter-spacing: 5px; }
  #tabs .sub, .maxim, .nav-sec { display: none; }
  #tabs nav { flex-direction: row; }
  .tab { padding: 12px 12px; border-left: none; border-bottom: 2px solid transparent; white-space: nowrap; }
  .tab.active { border-bottom-color: var(--accent-blue); }
  .tab .n { display: none; }
  .focus-btn { margin: 6px 10px; white-space: nowrap; }
  #topbar { padding: 10px 16px; }
  #sim-controls { flex-wrap: wrap; }
  #sim-controls > div[style*="margin-left:auto"] { margin-left: 0 !important; flex-wrap: wrap; }
  .card { width: 100% !important; flex-basis: 100% !important; }
  .row { flex-direction: column; flex-wrap: nowrap; }
  #journal-card { left: 16px; }
}
"""
idx = s.index("</style>")
s = s[:idx] + EXTRA_CSS + s[idx:]

s = s.replace("<title>FX OPTIONS — EUR/USD MARKET MAKER SIMULATOR</title>", "<title>Stoa FX Desk</title>")
s = s.replace('<html lang="en">', '<html lang="en">', 1)

open(out, "w", encoding="utf-8").write(s)
print("ok", len(s), "corrections :", ", ".join(n_fixes))
