/* Reefer Twin — prototype FESCO
 * Plomb à QR code + jumeau numérique du transfert des reefers port → rail.
 * Stockage : localStorage (prototype). En production, remplacer Store par des appels API.
 */
'use strict';

/* ---------- Référentiels ---------- */

const DEPTS = {
  LOGISTICS: 'Département logistique',
  PORT: 'Port (terminal)',
  CUSTOMS: 'Douane',
  RAIL: 'Département ferroviaire',
  SALES: 'Ventes maritimes (lecture)',
  CLIENT: 'Client',
  SENSOR: 'Capteur (télémétrie)'
};
const SELECTABLE_DEPTS = ['LOGISTICS', 'PORT', 'CUSTOMS', 'RAIL', 'SALES', 'CLIENT'];

// Étapes du transfert, dans l'ordre. `dept` = service responsable de l'opération.
const STAGES = [
  { code: 'ANNONCE',   label: 'Pré-avis navire',            dept: 'LOGISTICS', loc: 'QUAI' },
  { code: 'DECHARGE',  label: 'Déchargé du navire',         dept: 'PORT',      loc: 'QUAI' },
  { code: 'BRANCHE',   label: 'Branché en zone reefer',     dept: 'PORT',      loc: 'REEFER' },
  { code: 'DOUANE',    label: 'Dédouané',                   dept: 'CUSTOMS',   loc: 'DOUANE' },
  { code: 'TRANSFERT', label: 'Transféré au terminal rail', dept: 'LOGISTICS', loc: 'RAILTERM' },
  { code: 'WAGON',     label: 'Chargé sur wagon',           dept: 'RAIL',      loc: 'RAILTERM' },
  { code: 'DEPART',    label: 'Train parti',                dept: 'RAIL',      loc: 'ROUTE' },
  { code: 'LIVRE',     label: 'Livré au client',            dept: 'CLIENT',    loc: 'CLIENT' }
];
const STAGE_INDEX = Object.fromEntries(STAGES.map((s, i) => [s.code, i]));

const EXTRA_TYPES = {
  CONTROLE: { label: 'Contrôle de température', depts: ['PORT', 'RAIL', 'LOGISTICS', 'CUSTOMS', 'SENSOR'] },
  INCIDENT: { label: 'Incident signalé',        depts: ['PORT', 'RAIL', 'LOGISTICS', 'CUSTOMS', 'CLIENT'] }
};

const LOCATIONS = {
  QUAI: 'Quai — navire',
  REEFER: 'Zone reefer (prises)',
  DOUANE: 'Zone douane / inspection',
  NAVETTE: 'Navette port → rail',
  RAILTERM: 'Terminal ferroviaire',
  ROUTE: 'En route (wagon)',
  CLIENT: 'Chez le client'
};
const YARD = ['QUAI', 'REEFER', 'DOUANE', 'NAVETTE', 'RAILTERM', 'ROUTE', 'CLIENT'];

// Seuils d'alerte (minutes / heures)
const RULES = {
  unpluggedWarnMin: 60,    // reefer débranché (après déchargement ou pendant la navette)
  unpluggedBadMin: 120,
  stagnantWarnH: 24,       // aucune progression
  stagnantBadH: 48
};

/* ---------- Utilitaires ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtT = t => (t == null || t === '' ? '—' : (Math.round(t * 10) / 10).toLocaleString('fr-FR', { minimumFractionDigits: 1 }) + ' °C');
const fmtDate = iso => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const minutesSince = iso => (Date.now() - new Date(iso).getTime()) / 60000;
const fmtDur = min => min < 60 ? Math.round(min) + ' min' : min < 48 * 60 ? (min / 60).toFixed(1).replace('.', ',') + ' h' : Math.round(min / 1440) + ' j';

function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
function setMsg(el, text, kind) { el.textContent = text; el.className = 'msg ' + (kind || ''); }

/* ISO 6346 : chiffre de contrôle des numéros de conteneur */
const ISO_LETTERS = (() => {
  const map = {}; let v = 10;
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') { if (v % 11 === 0) v++; map[ch] = v++; }
  return map;
})();
function isoCheckDigit(first10) {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const ch = first10[i];
    const val = /[A-Z]/.test(ch) ? ISO_LETTERS[ch] : Number(ch);
    sum += val * 2 ** i;
  }
  return (sum % 11) % 10;
}
function isValidContainerId(id) {
  return /^[A-Z]{3}[UJZ]\d{7}$/.test(id) && isoCheckDigit(id.slice(0, 10)) === Number(id[10]);
}

/* ---------- Stockage ---------- */

const KEY = 'reeferTwin.v1';
const Store = {
  data: { containers: [], events: [], seq: 1 },
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { this.data = JSON.parse(raw); return true; }
    } catch (e) { /* stockage indisponible : on reste en mémoire */ }
    return false;
  },
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ } },
  container(id) { return this.data.containers.find(c => c.id === id); },
  eventsOf(id) { return this.data.events.filter(e => e.containerId === id).sort((a, b) => a.ts.localeCompare(b.ts)); },
  addEvent(ev) { ev.id = this.data.seq++; this.data.events.push(ev); this.save(); return ev; },
  addContainer(c) { this.data.containers.push(c); this.save(); }
};

/* ---------- Jeu de démonstration ---------- */

function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

function makeId(prefix, n) {
  const first10 = prefix + String(n).padStart(6, '0');
  return first10 + isoCheckDigit(first10);
}

function demoData() {
  const r = rng(42);
  const clients = ['Russian Fish Co.', 'Primorye Agro', 'Magnit Logistics', 'X5 Retail Group', 'Dalmoreprodukt'];
  const cargos = [['Poisson congelé', -18, 2], ['Crabe congelé', -20, 2], ['Bananes', 13.5, 1], ['Viande congelée', -18, 2], ['Produits pharmaceutiques', 5, 3], ['Fruits frais', 2, 1.5]];
  const dests = ['Moscou (Vorsino)', 'Novossibirsk', 'Ekaterinbourg', 'Saint-Pétersbourg', 'Khabarovsk'];
  // étape finale atteinte par chaque conteneur de démo (-1 = déchargé mais pas encore branché, etc.)
  const plan = [7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 2, 0];
  const now = Date.now();
  const data = { containers: [], events: [], seq: 1 };

  plan.forEach((lastStage, i) => {
    const [cargo, sp, tol] = cargos[i % cargos.length];
    const c = {
      id: makeId('FESU', 412300 + i * 37),
      sealId: 'PL' + String(100200 + i * 13),
      client: clients[i % clients.length],
      cargo, setpoint: sp, tolerance: tol,
      vessel: i % 2 ? 'FESCO Diomid / 245E' : 'FESCO Pyotr Velikiy / 118W',
      destination: dests[i % dests.length],
      createdAt: new Date(now - (90 - i * 3) * 3600e3).toISOString()
    };
    data.containers.push(c);

    // cadence des étapes (heures entre deux étapes)
    const gaps = [0, 6, 0.6, 14, 8, 3, 2, 120];
    let t = now - (lastStage === 7 ? 170 : 40 - i * 2.5) * 3600e3;
    if (i === 4) t = now - 70 * 3600e3;       // bloqué en douane → alerte de stagnation
    const push = (type, dept, loc, temp, extra = {}) => data.events.push({
      id: data.seq++, containerId: c.id, ts: new Date(t).toISOString(), dept, type,
      location: loc, temperature: temp, sealRead: c.sealId, operator: extra.op || 'Démo', note: extra.note || ''
    });
    const reading = (drift = 0) => Math.round((sp + (r() - 0.5) * tol * 1.2 + drift) * 10) / 10;

    for (let s = 0; s <= lastStage; s++) {
      if (s > 0) t += gaps[s] * 3600e3 * (0.7 + r() * 0.6);
      if (s === 1 && (i === 8 || i === 9)) t = now - (i === 8 ? 1.6 : 0.5) * 3600e3; // reefers juste déchargés
      if (t > now) t = now - 5 * 60e3;
      const st = STAGES[s];
      push(st.code, st.dept, st.code === 'TRANSFERT' ? 'RAILTERM' : st.loc, s === 0 ? null : reading());
      // relevés capteur entre deux étapes
      if (s >= 2 && s < lastStage) {
        const tt = t;
        for (let k = 1; k <= 3; k++) {
          t = tt + k * gaps[Math.min(s + 1, 7)] * 3600e3 / 4;
          if (t > now) break;
          const drift = (i === 6 && k === 3) ? tol * 2.2 : 0; // excursion de température
          push('CONTROLE', 'SENSOR', st.loc, reading(drift), { op: 'Capteur reefer' });
        }
        t = tt;
      }
    }
    // télémétrie continue depuis la dernière étape (reefer branché ou en route)
    if (lastStage >= 2 && lastStage < 7) {
      const loc = STAGES[lastStage].loc;
      for (let tt = t + 2 * 3600e3; tt < now - 30 * 60e3; tt += 2 * 3600e3) {
        data.events.push({ id: data.seq++, containerId: c.id, ts: new Date(tt).toISOString(), dept: 'SENSOR', type: 'CONTROLE',
          location: loc, temperature: reading(), sealRead: c.sealId, operator: 'Capteur reefer', note: '' });
      }
    }
    if (i === 6) { // dernier relevé hors tolérance
      t = now - 20 * 60e3;
      push('CONTROLE', 'SENSOR', 'REEFER', Math.round((sp + tol * 2.4) * 10) / 10, { op: 'Capteur reefer', note: 'Groupe froid à vérifier' });
    }
    if (i === 10) { // plomb non conforme lu au terminal
      t = now - 3 * 3600e3;
      data.events.push({ id: data.seq++, containerId: c.id, ts: new Date(t).toISOString(), dept: 'PORT', type: 'CONTROLE',
        location: 'REEFER', temperature: reading(), sealRead: 'PL999999', operator: 'Démo', note: 'Plomb différent de celui enregistré' });
    }
  });
  data.events.sort((a, b) => a.ts.localeCompare(b.ts));
  return data;
}

/* ---------- État dérivé (jumeau) ---------- */

function twinState(c) {
  const evs = Store.eventsOf(c.id);
  let stage = -1, stageTs = c.createdAt, location = null, lastTemp = null, lastTempTs = null;
  for (const e of evs) {
    if (e.type in STAGE_INDEX && STAGE_INDEX[e.type] >= stage) { stage = STAGE_INDEX[e.type]; stageTs = e.ts; }
    if (e.location) location = e.location;
    if (e.temperature != null && e.temperature !== '') { lastTemp = Number(e.temperature); lastTempTs = e.ts; }
  }
  const last = evs[evs.length - 1];
  const alerts = [];
  const lo = c.setpoint - c.tolerance, hi = c.setpoint + c.tolerance;

  if (lastTemp != null && (lastTemp < lo || lastTemp > hi)) {
    alerts.push({ level: 'bad', text: `Température ${fmtT(lastTemp)} hors plage (${fmtT(lo)} … ${fmtT(hi)})` });
  }
  const code = STAGES[stage]?.code;
  if (code === 'DECHARGE' || location === 'NAVETTE') {
    const m = minutesSince(stageTs);
    if (m > RULES.unpluggedWarnMin) alerts.push({ level: m > RULES.unpluggedBadMin ? 'bad' : 'warn', text: `Débranché depuis ${fmtDur(m)} — à brancher en zone reefer` });
  }
  if (stage >= 0 && stage < STAGE_INDEX.DEPART) {
    const h = minutesSince(stageTs) / 60;
    if (h > RULES.stagnantWarnH) alerts.push({ level: h > RULES.stagnantBadH ? 'bad' : 'warn', text: `Aucune progression depuis ${fmtDur(h * 60)} (étape « ${STAGES[stage].label} »)` });
  }
  const badSeal = evs.find(e => e.sealRead && e.sealRead !== c.sealId);
  if (badSeal) alerts.push({ level: 'bad', text: `Plomb lu ${badSeal.sealRead} ≠ plomb enregistré ${c.sealId} (${fmtDate(badSeal.ts)})` });
  const incident = [...evs].reverse().find(e => e.type === 'INCIDENT');
  if (incident && stage < STAGE_INDEX.LIVRE) alerts.push({ level: 'warn', text: `Incident : ${incident.note || 'sans détail'}` });

  const level = alerts.some(a => a.level === 'bad') ? 'bad' : alerts.length ? 'warn' : 'ok';
  return { evs, stage, stageTs, location, lastTemp, lastTempTs, last, alerts, level, lo, hi };
}

/* ---------- Session (service courant) ---------- */

let currentDept = 'PORT';
try { currentDept = localStorage.getItem(KEY + '.dept') || 'PORT'; } catch (e) { /* ignore */ }

function allowedTypes(dept) {
  const list = STAGES.filter(s => s.dept === dept).map(s => [s.code, s.label]);
  for (const [code, t] of Object.entries(EXTRA_TYPES)) if (t.depts.includes(dept)) list.push([code, t.label]);
  return list;
}
const typeLabel = code => STAGES[STAGE_INDEX[code]]?.label || EXTRA_TYPES[code]?.label || code;

/* ---------- Rendu : tableau de bord ---------- */

function renderDashboard() {
  const cs = Store.data.containers;
  const states = cs.map(c => [c, twinState(c)]);
  const active = states.filter(([, s]) => s.stage < STAGE_INDEX.DEPART);
  const bad = states.filter(([, s]) => s.level === 'bad').length;
  const warn = states.filter(([, s]) => s.level === 'warn').length;

  // durée moyenne déchargement → départ train, sur les conteneurs partis
  const durations = states.map(([, s]) => {
    const d = s.evs.find(e => e.type === 'DECHARGE'), p = s.evs.find(e => e.type === 'DEPART');
    return d && p ? (new Date(p.ts) - new Date(d.ts)) / 3600e3 : null;
  }).filter(x => x != null);
  const avg = durations.length ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1).replace('.', ',') + ' h' : '—';
  const today = Store.data.events.filter(e => minutesSince(e.ts) < 1440 && e.dept !== 'SENSOR').length;

  $('#kpis').innerHTML = [
    ['', active.length, 'reefers en transit au terminal'],
    [bad ? 'bad' : '', bad, 'en alerte critique'],
    [warn ? 'warn' : '', warn, 'à surveiller'],
    ['', avg, 'délai moyen déchargement → train'],
    ['', today, 'scans des dernières 24 h']
  ].map(([cls, v, l]) => `<div class="kpi ${cls}"><b>${v}</b><span>${l}</span></div>`).join('');

  const alerts = states.flatMap(([c, s]) => s.alerts.map(a => ({ ...a, c })))
    .sort((a, b) => (a.level === 'bad' ? 0 : 1) - (b.level === 'bad' ? 0 : 1));
  $('#alertList').innerHTML = alerts.length
    ? alerts.map(a => `<li class="${a.level}" data-open="${esc(a.c.id)}"><b>${esc(a.c.id)}</b> — ${esc(a.text)}</li>`).join('')
    : '<li class="none">Aucune alerte : tous les reefers sont dans les tolérances.</li>';

  const counts = STAGES.map((st, i) => states.filter(([, s]) => s.stage === i).length);
  const max = Math.max(1, ...counts);
  $('#stageBars').innerHTML = STAGES.map((st, i) =>
    `<div class="bar"><span>${esc(st.label)}</span><div class="track"><div class="fill" style="width:${counts[i] / max * 100}%"></div></div><span class="num">${counts[i]}</span></div>`
  ).join('');

  const q = $('#search').value.trim().toLowerCase();
  $('#containerRows').innerHTML = states
    .filter(([c]) => !q || [c.id, c.client, c.cargo, c.destination].join(' ').toLowerCase().includes(q))
    .sort(([, a], [, b]) => ({ bad: 0, warn: 1, ok: 2 }[a.level] - { bad: 0, warn: 1, ok: 2 }[b.level]) || a.stage - b.stage)
    .map(([c, s]) => `<tr data-open="${esc(c.id)}">
      <td><b>${esc(c.id)}</b><br><small class="hint">${esc(c.cargo)}</small></td>
      <td>${esc(c.client)}</td>
      <td>${esc(STAGES[s.stage]?.label || 'Enregistré')}</td>
      <td>${esc(LOCATIONS[s.location] || '—')}</td>
      <td class="num">${fmtT(s.lastTemp)} / ${fmtT(c.setpoint)}</td>
      <td>${s.last ? fmtDate(s.last.ts) + '<br><small class="hint">' + esc(DEPTS[s.last.dept]) + '</small>' : '—'}</td>
      <td><span class="pill ${s.level}">${{ ok: 'Conforme', warn: 'À surveiller', bad: 'Critique' }[s.level]}</span></td>
    </tr>`).join('') || '<tr><td colspan="7" class="hint">Aucun conteneur.</td></tr>';
}

/* ---------- Rendu : jumeau numérique ---------- */

function tempChart(c, s) {
  const pts = s.evs.filter(e => e.temperature != null && e.temperature !== '').map(e => ({ t: new Date(e.ts).getTime(), v: Number(e.temperature) }));
  if (pts.length < 2) return '<p class="hint">Pas encore assez de relevés de température.</p>';
  const W = 640, H = 220, P = { l: 44, r: 12, t: 12, b: 26 };
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t || t0 + 1;
  const vmin = Math.min(s.lo - 1, ...pts.map(p => p.v)), vmax = Math.max(s.hi + 1, ...pts.map(p => p.v));
  const x = t => P.l + (t - t0) / Math.max(1, t1 - t0) * (W - P.l - P.r);
  const y = v => P.t + (vmax - v) / (vmax - vmin) * (H - P.t - P.b);
  const ticks = 4, yt = [...Array(ticks + 1)].map((_, i) => vmin + (vmax - vmin) * i / ticks);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe de température">
    <rect class="band" x="${P.l}" y="${y(s.hi)}" width="${W - P.l - P.r}" height="${y(s.lo) - y(s.hi)}"/>
    <line class="sp" x1="${P.l}" x2="${W - P.r}" y1="${y(c.setpoint)}" y2="${y(c.setpoint)}"/>
    ${yt.map(v => `<text x="${P.l - 6}" y="${y(v) + 4}" text-anchor="end">${v.toFixed(0)}°</text>`).join('')}
    <line class="axis" x1="${P.l}" x2="${W - P.r}" y1="${H - P.b}" y2="${H - P.b}"/>
    <text x="${P.l}" y="${H - 6}">${fmtDate(new Date(t0).toISOString())}</text>
    <text x="${W - P.r}" y="${H - 6}" text-anchor="end">${fmtDate(new Date(t1).toISOString())}</text>
    <polyline class="line" points="${pts.map(p => x(p.t).toFixed(1) + ',' + y(p.v).toFixed(1)).join(' ')}"/>
    ${pts.map(p => `<circle class="pt ${p.v < s.lo || p.v > s.hi ? 'out' : ''}" cx="${x(p.t).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="3.5"><title>${fmtDate(new Date(p.t).toISOString())} : ${fmtT(p.v)}</title></circle>`).join('')}
  </svg>`;
}

function renderTwin() {
  const sel = $('#twinSelect');
  const cur = sel.value;
  sel.innerHTML = Store.data.containers.map(c => `<option value="${esc(c.id)}">${esc(c.id)} — ${esc(c.client)}</option>`).join('');
  if (cur && Store.container(cur)) sel.value = cur;
  const c = Store.container(sel.value);
  if (!c) { $('#twinBody').innerHTML = '<div class="card hint">Aucun conteneur enregistré.</div>'; return; }
  const s = twinState(c);

  $('#twinBody').innerHTML = `
    <div class="card">
      <div class="row-between">
        <h2>${esc(c.id)} <span class="pill ${s.level}">${{ ok: 'Conforme', warn: 'À surveiller', bad: 'Critique' }[s.level]}</span></h2>
        <button class="primary" data-scan="${esc(c.id)}">Enregistrer une opération</button>
      </div>
      <div class="facts">
        <div><span>Client</span>${esc(c.client)}</div>
        <div><span>Cargaison</span>${esc(c.cargo)}</div>
        <div><span>Consigne</span>${fmtT(c.setpoint)} ± ${String(c.tolerance).replace('.', ',')}</div>
        <div><span>Dernière T°</span>${fmtT(s.lastTemp)}</div>
        <div><span>Plomb</span>${esc(c.sealId)}</div>
        <div><span>Navire</span>${esc(c.vessel || '—')}</div>
        <div><span>Destination</span>${esc(c.destination)}</div>
        <div><span>À l'étape depuis</span>${fmtDur(minutesSince(s.stageTs))}</div>
      </div>
      ${s.alerts.length ? `<ul class="alerts" style="margin-top:12px">${s.alerts.map(a => `<li class="${a.level}">${esc(a.text)}</li>`).join('')}</ul>` : ''}
    </div>
    <div class="card">
      <h2>Progression du transfert</h2>
      <div class="stepper">${STAGES.map((st, i) => {
        const ev = s.evs.find(e => e.type === st.code);
        return `<div class="step ${i < s.stage ? 'done' : i === s.stage ? 'current done' : ''}"><span class="dot"></span>${esc(st.label)}<small>${ev ? fmtDate(ev.ts) : esc(DEPTS[st.dept])}</small></div>`;
      }).join('')}</div>
    </div>
    <div class="grid2">
      <div class="card chart"><h2>Température (bande verte = tolérance)</h2>${tempChart(c, s)}</div>
      <div class="card"><h2>Position sur le terminal</h2>
        <div class="yard">${YARD.map(z => `<div class="zone ${z === s.location ? 'here' : ''}"><b>${esc(LOCATIONS[z])}</b>${z === s.location ? '❄ ' + esc(c.id) : ''}</div>`).join('')}</div>
      </div>
    </div>
    <div class="card"><h2>Historique partagé entre services</h2>
      <ul class="timeline">${[...s.evs].reverse().map(e => `<li><time>${fmtDate(e.ts)}</time><div><b>${esc(typeLabel(e.type))}</b> · ${esc(DEPTS[e.dept] || e.dept)} · ${esc(LOCATIONS[e.location] || e.location || '')}
        ${e.temperature != null && e.temperature !== '' ? ' · ' + fmtT(Number(e.temperature)) : ''}${e.operator ? ' · ' + esc(e.operator) : ''}${e.note ? '<br><small class="hint">' + esc(e.note) + '</small>' : ''}</div></li>`).join('')}</ul>
    </div>`;
}

/* ---------- Scanner ---------- */

let scanner = null;

function parsePayload(text) {
  text = String(text).trim();
  const hash = text.includes('#') ? text.slice(text.indexOf('#') + 1) : '';
  if (hash) {
    const p = new URLSearchParams(hash);
    if (p.get('c')) return { id: p.get('c').toUpperCase(), seal: p.get('s') || '' };
  }
  let m = text.match(/^RF1:([A-Z]{4}\d{7}):?([\w-]*)$/i);
  if (m) return { id: m[1].toUpperCase(), seal: m[2] || '' };
  m = text.toUpperCase().replace(/[\s-]/g, '').match(/^[A-Z]{4}\d{7}$/);
  if (m) return { id: m[0], seal: '' };
  return null;
}

function openScan(id, seal) {
  showView('scan');
  const c = Store.container(id);
  const msg = $('#scanMsg');
  const f = $('#eventForm');
  if (!c) {
    setMsg(msg, `Conteneur ${id} inconnu : enregistrez-le d'abord dans « Plombs QR ».`, 'bad');
    f.containerId.value = '';
    return;
  }
  f.containerId.value = c.id;
  f.sealId.value = seal || c.sealId;
  const s = twinState(c);
  const next = STAGES[s.stage + 1];
  const allowed = allowedTypes(currentDept).map(([code]) => code);
  if (next && allowed.includes(next.code)) f.type.value = next.code;
  else if (allowed.includes('CONTROLE')) f.type.value = 'CONTROLE';
  syncLocation();
  if (seal && seal !== c.sealId) setMsg(msg, `⚠ Plomb lu ${seal} différent du plomb enregistré ${c.sealId} !`, 'bad');
  else setMsg(msg, `${c.id} · ${c.cargo} · étape actuelle : ${STAGES[s.stage]?.label || 'enregistré'}`, 'ok');
  f.temperature.focus();
}

function syncLocation() {
  const f = $('#eventForm');
  const st = STAGES[STAGE_INDEX[f.type.value]];
  if (st) f.location.value = st.code === 'TRANSFERT' ? 'RAILTERM' : st.loc;
  else if (f.containerId.value) {
    const c = Store.container(f.containerId.value);
    const loc = c && twinState(c).location;
    if (loc) f.location.value = loc;
  }
}

async function startCamera() {
  if (typeof Html5Qrcode === 'undefined') { setMsg($('#scanMsg'), 'Lecteur QR indisponible dans ce navigateur.', 'bad'); return; }
  try {
    scanner = scanner || new Html5Qrcode('reader');
    await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 220 }, text => {
      const p = parsePayload(text);
      if (!p) { setMsg($('#scanMsg'), 'QR non reconnu : ' + text.slice(0, 60), 'bad'); return; }
      stopCamera();
      openScan(p.id, p.seal);
    });
    $('#camStart').hidden = true; $('#camStop').hidden = false;
  } catch (e) {
    setMsg($('#scanMsg'), 'Caméra inaccessible (autorisation refusée ou page non HTTPS). Utilisez la saisie manuelle.', 'bad');
  }
}
async function stopCamera() {
  if (scanner) { try { await scanner.stop(); } catch (e) { /* déjà arrêté */ } }
  $('#camStart').hidden = false; $('#camStop').hidden = true;
}

/* ---------- Plombs QR ---------- */

function qrText(c, mode) {
  if (mode === 'compact') return `RF1:${c.id}:${c.sealId}`;
  const base = location.href.split('#')[0];
  return `${base}#c=${encodeURIComponent(c.id)}&s=${encodeURIComponent(c.sealId)}`;
}

function qrModules(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr;
}

// Face QR du plomb : disque Ø 60 mm avec œillet, QR au centre (unités = mm)
function sealSvgQr(c, mode) {
  const qr = qrModules(qrText(c, mode));
  const n = qr.getModuleCount(), size = 34, cell = size / n, ox = 30 - size / 2, oy = 36.5 - size / 2;
  let d = '';
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
    if (qr.isDark(r, col)) d += `M${(ox + col * cell).toFixed(3)} ${(oy + r * cell).toFixed(3)}h${cell.toFixed(3)}v${cell.toFixed(3)}h-${cell.toFixed(3)}z`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 66" width="60mm" height="66mm">
  <path d="M30 2a4 4 0 0 1 4 4v1.2A29 29 0 1 1 26 7.2V6a4 4 0 0 1 4-4z" fill="#fff" stroke="#111" stroke-width="0.4"/>
  <circle cx="30" cy="6" r="1.6" fill="none" stroke="#111" stroke-width="0.4"/>
  <rect x="${ox - 1.5}" y="${oy - 1.5}" width="${size + 3}" height="${size + 3}" fill="#fff"/>
  <path d="${d}" fill="#111"/>
</svg>`;
}

// Face numéro : numéro du conteneur + numéro de plomb
function sealSvgNum(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 66" width="60mm" height="66mm">
  <path d="M30 2a4 4 0 0 1 4 4v1.2A29 29 0 1 1 26 7.2V6a4 4 0 0 1 4-4z" fill="#fff" stroke="#111" stroke-width="0.4"/>
  <circle cx="30" cy="6" r="1.6" fill="none" stroke="#111" stroke-width="0.4"/>
  <rect x="5" y="26" width="50" height="16" rx="1" fill="none" stroke="#111" stroke-width="0.8"/>
  <text x="30" y="37.3" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="7.4" fill="#c0392b">${esc(c.id)}</text>
  <text x="30" y="51" text-anchor="middle" font-family="Arial, sans-serif" font-size="4" fill="#111">PLOMB ${esc(c.sealId)}</text>
  <text x="30" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="3.6" fill="#111">FESCO · REEFER ${esc(fmtT(c.setpoint))}</text>
</svg>`;
}

let qrMode = 'url';
function renderSeals() {
  const sel = $('#sealSelect');
  const cur = sel.value;
  sel.innerHTML = Store.data.containers.map(c => `<option value="${esc(c.id)}">${esc(c.id)} — ${esc(c.sealId)}</option>`).join('');
  if (cur && Store.container(cur)) sel.value = cur;
  const c = Store.container(sel.value);
  if (!c) { $('#sealPreview').innerHTML = '<p class="hint">Créez un conteneur pour générer son plomb.</p>'; return; }
  $('#sealPreview').innerHTML = `
    <div class="seal">${sealSvgQr(c, qrMode)}<small>Face QR</small></div>
    <div class="seal">${sealSvgNum(c)}<small>Face numéro</small></div>
    <div class="full" style="width:100%;text-align:center">
      <label class="hint"><input type="radio" name="qrmode" value="url" ${qrMode === 'url' ? 'checked' : ''}> QR = lien (lisible par tout téléphone)</label>
      &nbsp; <label class="hint"><input type="radio" name="qrmode" value="compact" ${qrMode === 'compact' ? 'checked' : ''}> QR compact (plus gros modules, idéal impression 3D)</label>
    </div>`;
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ---------- Exports ---------- */

function csv(rows) {
  const cell = v => {
    if (v == null) return '';
    if (typeof v === 'number') return String(v).replace('.', ',');
    const s = String(v);
    return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return '﻿' + rows.map(r => r.map(cell).join(';')).join('\r\n');
}

function exportEvents() {
  const rows = [['event_id', 'container_id', 'timestamp_utc', 'department', 'event_type', 'stage_order', 'location', 'temperature_c', 'seal_read', 'operator', 'note']];
  for (const e of Store.data.events) rows.push([e.id, e.containerId, e.ts, e.dept, e.type, STAGE_INDEX[e.type] ?? '', e.location,
    e.temperature === '' || e.temperature == null ? null : Number(e.temperature), e.sealRead, e.operator, e.note]);
  download('reefer_events.csv', csv(rows), 'text/csv;charset=utf-8');
}
function exportContainers() {
  const rows = [['container_id', 'seal_id', 'client', 'cargo', 'setpoint_c', 'tolerance_c', 'vessel', 'destination', 'created_utc', 'current_stage', 'status']];
  for (const c of Store.data.containers) {
    const s = twinState(c);
    rows.push([c.id, c.sealId, c.client, c.cargo, Number(c.setpoint), Number(c.tolerance), c.vessel, c.destination, c.createdAt, STAGES[s.stage]?.code || '', s.level]);
  }
  download('reefer_containers.csv', csv(rows), 'text/csv;charset=utf-8');
}
function exportSql() {
  const q = v => v == null || v === '' ? 'NULL' : typeof v === 'number' ? String(v) : "N'" + String(v).replace(/'/g, "''") + "'";
  const dt = iso => `'${iso.replace('T', ' ').replace('Z', '')}'`;
  let out = '-- Export Reefer Twin — à exécuter après sql/01_schema.sql\nSET NOCOUNT ON;\n';
  for (const c of Store.data.containers) {
    out += `IF NOT EXISTS (SELECT 1 FROM ops.Container WHERE ContainerId='${c.id}')\n  INSERT INTO ops.Container (ContainerId, SealId, Client, Cargo, SetpointC, ToleranceC, Vessel, Destination, CreatedAt) VALUES (${q(c.id)}, ${q(c.sealId)}, ${q(c.client)}, ${q(c.cargo)}, ${Number(c.setpoint)}, ${Number(c.tolerance)}, ${q(c.vessel)}, ${q(c.destination)}, ${dt(c.createdAt)});\n`;
  }
  out += 'SET IDENTITY_INSERT ops.ContainerEvent ON;\n';
  for (const e of Store.data.events) {
    out += `INSERT INTO ops.ContainerEvent (EventId, ContainerId, EventTs, DepartmentCode, EventTypeCode, LocationCode, TemperatureC, SealRead, Operator, Note) VALUES (${e.id}, ${q(e.containerId)}, ${dt(e.ts)}, ${q(e.dept)}, ${q(e.type)}, ${q(e.location)}, ${e.temperature == null || e.temperature === '' ? 'NULL' : Number(e.temperature)}, ${q(e.sealRead)}, ${q(e.operator)}, ${q(e.note)});\n`;
  }
  out += 'SET IDENTITY_INSERT ops.ContainerEvent OFF;\n';
  download('reefer_data.sql', out, 'text/plain;charset=utf-8');
}

/* ---------- Navigation ---------- */

function showView(name) {
  $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  if (name !== 'scan') stopCamera();
  render();
}
function render() {
  const active = $('.view.active').id.replace('view-', '');
  if (active === 'dashboard') renderDashboard();
  if (active === 'twin') renderTwin();
  if (active === 'seals') renderSeals();
}
function openTwin(id) { $('#twinSelect').innerHTML = `<option value="${esc(id)}">${esc(id)}</option>`; $('#twinSelect').value = id; showView('twin'); }

function fillDeptControls() {
  $('#deptSelect').innerHTML = SELECTABLE_DEPTS.map(d => `<option value="${d}">${esc(DEPTS[d])}</option>`).join('');
  $('#deptSelect').value = currentDept;
  const f = $('#eventForm');
  const types = allowedTypes(currentDept);
  f.type.innerHTML = types.map(([code, label]) => `<option value="${code}">${esc(label)}</option>`).join('');
  f.querySelector('button[type=submit]').disabled = types.length === 0;
  if (!types.length) setMsg($('#eventMsg'), 'Ce profil est en lecture seule : choisissez un service opérationnel en haut à droite.', 'bad');
  else setMsg($('#eventMsg'), '');
  f.location.innerHTML = Object.entries(LOCATIONS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  syncLocation();
}

/* ---------- Événements UI ---------- */

function bind() {
  $$('.tabs button').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
  $('#deptSelect').addEventListener('change', e => {
    currentDept = e.target.value;
    try { localStorage.setItem(KEY + '.dept', currentDept); } catch (err) { /* ignore */ }
    fillDeptControls();
    toast('Profil : ' + DEPTS[currentDept]);
  });
  $('#search').addEventListener('input', renderDashboard);
  document.addEventListener('click', e => {
    const open = e.target.closest('[data-open]');
    if (open) openTwin(open.dataset.open);
    const scan = e.target.closest('[data-scan]');
    if (scan) openScan(scan.dataset.scan);
  });
  $('#twinSelect').addEventListener('change', renderTwin);
  $('#sealSelect').addEventListener('change', renderSeals);
  $('#sealPreview').addEventListener('change', e => { if (e.target.name === 'qrmode') { qrMode = e.target.value; renderSeals(); } });

  $('#camStart').addEventListener('click', startCamera);
  $('#camStop').addEventListener('click', stopCamera);
  const manual = () => {
    const p = parsePayload($('#manualId').value);
    if (!p) { setMsg($('#scanMsg'), 'Format attendu : 4 lettres + 7 chiffres (ex. FESU1234560).', 'bad'); return; }
    openScan(p.id, p.seal);
  };
  $('#manualGo').addEventListener('click', manual);
  $('#manualId').addEventListener('keydown', e => { if (e.key === 'Enter') manual(); });
  $('#eventForm').type.addEventListener('change', syncLocation);

  $('#eventForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const c = Store.container(f.containerId.value);
    if (!c) { setMsg($('#eventMsg'), 'Scannez d\'abord un plomb.', 'bad'); return; }
    const s = twinState(c);
    const target = STAGE_INDEX[f.type.value];
    if (target != null && target > s.stage + 1) {
      const skipped = STAGES.slice(s.stage + 1, target).map(x => x.label).join(', ');
      if (!confirm(`Étapes non enregistrées : ${skipped}.\nEnregistrer quand même ?`)) return;
    }
    const temp = f.temperature.value === '' ? null : Number(f.temperature.value);
    Store.addEvent({
      containerId: c.id, ts: new Date().toISOString(), dept: currentDept, type: f.type.value,
      location: f.location.value, temperature: temp, sealRead: f.sealId.value || c.sealId,
      operator: f.operator.value.trim(), note: f.note.value.trim()
    });
    const after = twinState(c);
    setMsg($('#eventMsg'), `Enregistré : ${typeLabel(f.type.value)} — visible immédiatement par tous les services.`, 'ok');
    if (after.level === 'bad') toast('⚠ ' + after.alerts[0].text);
    else toast(`${c.id} : ${typeLabel(f.type.value)}`);
    f.temperature.value = ''; f.note.value = '';
  });

  const cf = $('#containerForm');
  cf.cid.addEventListener('input', () => { cf.cid.value = cf.cid.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  $('#checkDigit').addEventListener('click', () => {
    const v = cf.cid.value;
    if (!/^[A-Z]{3}[UJZ]\d{6}/.test(v)) { setMsg($('#containerMsg'), 'Saisissez au moins les 10 premiers caractères (ex. FESU123456).', 'bad'); return; }
    cf.cid.value = v.slice(0, 10) + isoCheckDigit(v.slice(0, 10));
    setMsg($('#containerMsg'), 'Chiffre de contrôle ISO 6346 : ' + cf.cid.value[10], 'ok');
  });
  cf.sealId.value = nextSealId();
  cf.addEventListener('submit', e => {
    e.preventDefault();
    const id = cf.cid.value;
    if (!isValidContainerId(id)) { setMsg($('#containerMsg'), 'Numéro invalide (format ISO 6346 ou chiffre de contrôle incorrect).', 'bad'); return; }
    if (Store.container(id)) { setMsg($('#containerMsg'), 'Ce conteneur existe déjà.', 'bad'); return; }
    const c = {
      id, sealId: cf.sealId.value.trim().toUpperCase(), client: cf.client.value.trim(), cargo: cf.cargo.value.trim(),
      setpoint: Number(cf.setpoint.value), tolerance: Number(cf.tolerance.value), vessel: cf.vessel.value.trim(),
      destination: cf.destination.value.trim(), createdAt: new Date().toISOString()
    };
    Store.addContainer(c);
    setMsg($('#containerMsg'), `${id} enregistré avec le plomb ${c.sealId}.`, 'ok');
    cf.reset(); cf.sealId.value = nextSealId();
    $('#sealSelect').innerHTML = `<option value="${esc(id)}">${esc(id)}</option>`;
    renderSeals();
  });
  $('#printSeal').addEventListener('click', () => window.print());
  $('#svgQr').addEventListener('click', () => { const c = Store.container($('#sealSelect').value); if (c) download(`plomb_${c.id}_QR.svg`, sealSvgQr(c, qrMode), 'image/svg+xml'); });
  $('#svgNum').addEventListener('click', () => { const c = Store.container($('#sealSelect').value); if (c) download(`plomb_${c.id}_numero.svg`, sealSvgNum(c), 'image/svg+xml'); });

  $('#expEvents').addEventListener('click', exportEvents);
  $('#expContainers').addEventListener('click', exportContainers);
  $('#expSql').addEventListener('click', exportSql);
  $('#expJson').addEventListener('click', () => download('reefer_twin_backup.json', JSON.stringify(Store.data, null, 2), 'application/json'));
  $('#impJson').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (!Array.isArray(d.containers) || !Array.isArray(d.events)) throw new Error();
      Store.data = { seq: 1 + Math.max(0, ...d.events.map(x => x.id || 0)), ...d };
      Store.save(); toast('Sauvegarde importée'); render();
    } catch (err) { toast('Fichier JSON invalide'); }
    e.target.value = '';
  });
  $('#simulate').addEventListener('click', simulateSensors);
  $('#resetDemo').addEventListener('click', () => { if (confirm('Remplacer les données par le jeu de démonstration ?')) { Store.data = demoData(); Store.save(); toast('Démo rechargée'); render(); } });
  $('#wipe').addEventListener('click', () => { if (confirm('Effacer toutes les données de ce navigateur ?')) { Store.data = { containers: [], events: [], seq: 1 }; Store.save(); toast('Données effacées'); render(); } });

  window.addEventListener('hashchange', handleHash);
}

function nextSealId() {
  const nums = Store.data.containers.map(c => parseInt(String(c.sealId).replace(/\D/g, ''), 10)).filter(Number.isFinite);
  return 'PL' + String((nums.length ? Math.max(...nums) : 100000) + 1).padStart(6, '0');
}

function simulateSensors() {
  const now = Date.now();
  let n = 0;
  for (const c of Store.data.containers) {
    const s = twinState(c);
    if (s.stage < STAGE_INDEX.BRANCHE || s.stage >= STAGE_INDEX.LIVRE) continue;
    for (let k = 3; k >= 0; k--) {
      const v = Math.round((c.setpoint + (Math.random() - 0.5) * c.tolerance * 1.4) * 10) / 10;
      Store.data.events.push({ id: Store.data.seq++, containerId: c.id, ts: new Date(now - k * 15 * 60e3).toISOString(), dept: 'SENSOR', type: 'CONTROLE',
        location: s.location, temperature: v, sealRead: c.sealId, operator: 'Capteur reefer', note: '' });
      n++;
    }
  }
  Store.data.events.sort((a, b) => a.ts.localeCompare(b.ts));
  Store.save();
  toast(`${n} relevés capteur ajoutés`);
  render();
}

function handleHash() {
  const p = parsePayload(location.href);
  if (p) {
    openScan(p.id, p.seal);
    history.replaceState(null, '', location.pathname + location.search);
  }
}

/* ---------- Démarrage ---------- */

if (!Store.load()) { Store.data = demoData(); Store.save(); }
bind();
fillDeptControls();
render();
handleHash();
setInterval(() => { if (!document.hidden) render(); }, 60000);
