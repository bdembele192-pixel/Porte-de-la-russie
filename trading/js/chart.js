/* Graphique en chandeliers sur <canvas> : zoom (molette / pincement), déplacement (glisser),
   réticule avec OHLC, superpositions (EMA, Bollinger, Donchian, VWAP), lignes de position et marqueurs de trades. */
window.M = window.M || {};

(function () {
  const C = {
    up: "#2BEA8B", dn: "#FF4D6D", grid: "rgba(255,255,255,0.045)", txt: "#8C90A8",
    cross: "rgba(255,255,255,0.35)", bgLabel: "#1C1C2B", vol: 0.22
  };
  const FONT = "11px 'JetBrains Mono', ui-monospace, monospace";

  class Chart {
    constructor(el, opts = {}) {
      this.el = el;
      this.opts = Object.assign({ rsi: false, volume: true, tf: "1h" }, opts);
      this.canvas = document.createElement("canvas");
      this.canvas.className = "chart-canvas";
      el.appendChild(this.canvas);
      this.legend = document.createElement("div");
      this.legend.className = "chart-legend";
      el.appendChild(this.legend);
      this.ctx = this.canvas.getContext("2d");
      this.bars = [];
      this.overlays = [];
      this.markers = [];
      this.lines = [];
      this.visible = opts.visible || 90;
      this.offset = 0; // nombre de bougies masquées à droite (déplacement)
      this.hover = null;
      this._bind();
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(el);
      this.resize();
    }

    destroy() { this.ro.disconnect(); this.el.innerHTML = ""; }

    setData(bars, { keepView } = {}) {
      this.bars = bars;
      if (!keepView) this.offset = 0;
      this._calc();
      this.draw();
    }
    setOverlays(o) { this.overlays = o || []; this._calc(); this.draw(); }
    setMarkers(m) { this.markers = m || []; this.draw(); }
    setLines(l) { this.lines = l || []; this.draw(); }
    setRsi(on) { this.opts.rsi = on; this.draw(); }

    /* Met à jour la dernière bougie ou en ajoute une nouvelle. */
    push(bar) {
      const last = this.bars[this.bars.length - 1];
      if (last && last.t === bar.t) this.bars[this.bars.length - 1] = bar;
      else if (!last || bar.t > last.t) {
        this.bars.push(bar);
        if (this.offset > 0) this.offset++;
      }
      this._calc();
      this.draw();
    }

    _calc() {
      const c = this.bars.map(b => b.c);
      const I = M.Ind;
      this.calc = this.overlays.map(o => {
        if (o.type === "ema") return { o, lines: [I.ema(c, o.n)] };
        if (o.type === "sma") return { o, lines: [I.sma(c, o.n)] };
        if (o.type === "vwap") return { o, lines: [I.vwap(this.bars)] };
        if (o.type === "bb") { const b = I.bollinger(c, o.n || 20, o.k || 2); return { o, lines: [b.up, b.mid, b.lo], band: true }; }
        if (o.type === "donchian") { const d = I.donchian(this.bars, o.n || 20); return { o, lines: [d.hi, d.lo], band: true }; }
        return { o, lines: [] };
      });
      this.rsi = I.rsi(c, 14);
    }

    resize() {
      const r = this.el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.W = Math.max(200, r.width);
      this.H = Math.max(160, r.height);
      this.canvas.width = this.W * dpr;
      this.canvas.height = this.H * dpr;
      this.canvas.style.width = this.W + "px";
      this.canvas.style.height = this.H + "px";
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    }

    _bind() {
      const cv = this.canvas;
      let drag = null, pinch = null;
      if (this.opts.noPan) {
        cv.addEventListener("mousemove", e => { const r = cv.getBoundingClientRect(); this.hover = { x: e.clientX - r.left, y: e.clientY - r.top }; this.draw(); });
        cv.addEventListener("mouseleave", () => { this.hover = null; this.draw(); });
        return;
      }
      cv.addEventListener("mousemove", e => {
        const r = cv.getBoundingClientRect();
        if (drag) { this._pan(e.clientX - drag); drag = e.clientX; }
        this.hover = { x: e.clientX - r.left, y: e.clientY - r.top };
        this.draw();
      });
      cv.addEventListener("mouseleave", () => { this.hover = null; drag = null; this.draw(); });
      cv.addEventListener("mousedown", e => { drag = e.clientX; });
      window.addEventListener("mouseup", () => { drag = null; });
      cv.addEventListener("wheel", e => {
        e.preventDefault();
        this._zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12);
      }, { passive: false });
      cv.addEventListener("touchstart", e => {
        if (e.touches.length === 1) {
          drag = e.touches[0].clientX;
          const r = cv.getBoundingClientRect();
          this.hover = { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
          this.draw();
        } else if (e.touches.length === 2) {
          pinch = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
        }
      }, { passive: true });
      cv.addEventListener("touchmove", e => {
        if (e.touches.length === 2 && pinch) {
          const d = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
          if (d > 0) { this._zoom(pinch / d); pinch = d; }
          e.preventDefault();
        } else if (e.touches.length === 1 && drag != null) {
          const x = e.touches[0].clientX;
          this._pan(x - drag); drag = x;
          const r = cv.getBoundingClientRect();
          this.hover = { x: x - r.left, y: e.touches[0].clientY - r.top };
          this.draw();
          e.preventDefault();
        }
      }, { passive: false });
      cv.addEventListener("touchend", () => { drag = null; pinch = null; setTimeout(() => { this.hover = null; this.draw(); }, 1500); });
      cv.addEventListener("dblclick", () => { this.offset = 0; this.visible = this.opts.visible || 90; this.draw(); });
    }

    _zoom(f) {
      this.visible = Math.round(Math.min(Math.max(this.visible * f, 20), Math.max(this.bars.length, 20)));
      this.draw();
    }
    _pan(dx) {
      const bw = this._plotW() / this.visible;
      const shift = Math.round(dx / bw);
      if (!shift) return;
      this.offset = Math.min(Math.max(this.offset + shift, 0), Math.max(this.bars.length - 20, 0));
    }

    _plotW() { return this.W - 68; }

    draw() {
      if (!this.ctx || !this.W) return;
      const ctx = this.ctx, W = this.W, H = this.H;
      ctx.clearRect(0, 0, W, H);
      const n = this.bars.length;
      if (!n) return;

      const PR = 68, PT = 8, PB = 22;
      const rsiH = this.opts.rsi ? Math.min(90, H * 0.22) : 0;
      const mainH = H - PT - PB - (rsiH ? rsiH + 10 : 0);
      const plotW = W - PR;
      const end = n - this.offset;
      const start = Math.max(0, end - this.visible);
      const slice = this.bars.slice(start, end);
      const bw = plotW / this.visible;
      const x = i => (i - start) * bw + bw / 2 + (this.visible - slice.length) * 0;

      // échelle de prix
      let hi = -Infinity, lo = Infinity;
      slice.forEach(b => { hi = Math.max(hi, b.h); lo = Math.min(lo, b.l); });
      this.calc.forEach(cl => cl.lines.forEach(arr => {
        for (let i = start; i < end; i++) if (arr[i] != null) { hi = Math.max(hi, arr[i]); lo = Math.min(lo, arr[i]); }
      }));
      this.lines.forEach(l => { if (l.fit && l.price) { hi = Math.max(hi, l.price); lo = Math.min(lo, l.price); } });
      if (hi === lo) { hi *= 1.001; lo *= 0.999; }
      const pad = (hi - lo) * 0.08; hi += pad; lo -= pad;
      const y = p => PT + (hi - p) / (hi - lo) * mainH;
      this._geo = { start, end, bw, y, hi, lo, PT, mainH, plotW };

      // grille + axe des prix
      ctx.font = FONT;
      ctx.textBaseline = "middle";
      const ticks = niceTicks(lo, hi, Math.max(3, Math.floor(mainH / 55)));
      ticks.forEach(p => {
        const yy = Math.round(y(p)) + 0.5;
        ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(plotW, yy); ctx.stroke();
        ctx.fillStyle = C.txt; ctx.textAlign = "left";
        ctx.fillText(M.Market.fmtPrice(p), plotW + 6, yy);
      });

      // axe du temps
      const tStep = Math.max(1, Math.ceil(80 / bw));
      ctx.textAlign = "center"; ctx.fillStyle = C.txt;
      for (let i = start; i < end; i++) {
        if ((i % tStep) !== 0) continue;
        const xx = x(i);
        ctx.strokeStyle = C.grid;
        ctx.beginPath(); ctx.moveTo(Math.round(xx) + 0.5, PT); ctx.lineTo(Math.round(xx) + 0.5, PT + mainH); ctx.stroke();
        ctx.fillText(fmtTime(this.bars[i].t, this.opts.tf, true), xx, H - PB / 2);
      }

      // volumes
      if (this.opts.volume) {
        let vmax = 0; slice.forEach(b => vmax = Math.max(vmax, b.v || 0));
        if (vmax > 0) {
          const vh = mainH * 0.18;
          slice.forEach((b, k) => {
            const i = start + k;
            ctx.fillStyle = (b.c >= b.o ? C.up : C.dn);
            ctx.globalAlpha = C.vol;
            const h = (b.v / vmax) * vh;
            ctx.fillRect(x(i) - bw * 0.35, PT + mainH - h, Math.max(1, bw * 0.7), h);
          });
          ctx.globalAlpha = 1;
        }
      }

      // bandes (remplissage)
      this.calc.forEach(cl => {
        if (!cl.band) return;
        const top = cl.lines[0], bot = cl.lines[cl.lines.length - 1];
        ctx.beginPath();
        let started = false;
        for (let i = start; i < end; i++) if (top[i] != null) { started ? ctx.lineTo(x(i), y(top[i])) : ctx.moveTo(x(i), y(top[i])); started = true; }
        for (let i = end - 1; i >= start; i--) if (bot[i] != null) ctx.lineTo(x(i), y(bot[i]));
        ctx.closePath();
        ctx.fillStyle = cl.o.color; ctx.globalAlpha = 0.06; ctx.fill(); ctx.globalAlpha = 1;
      });

      // bougies
      const cw = Math.max(1, bw * 0.68);
      slice.forEach((b, k) => {
        const i = start + k, xx = x(i);
        const up = b.c >= b.o;
        ctx.strokeStyle = ctx.fillStyle = up ? C.up : C.dn;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(Math.round(xx) + 0.5, y(b.h)); ctx.lineTo(Math.round(xx) + 0.5, y(b.l)); ctx.stroke();
        const yo = y(b.o), yc = y(b.c);
        ctx.fillRect(xx - cw / 2, Math.min(yo, yc), cw, Math.max(1, Math.abs(yc - yo)));
      });

      // lignes d'indicateurs
      this.calc.forEach(cl => {
        cl.lines.forEach((arr, li) => {
          ctx.beginPath();
          let started = false;
          for (let i = start; i < end; i++) {
            if (arr[i] == null) continue;
            started ? ctx.lineTo(x(i), y(arr[i])) : ctx.moveTo(x(i), y(arr[i]));
            started = true;
          }
          ctx.strokeStyle = cl.o.color;
          ctx.lineWidth = cl.band && li === 1 && cl.lines.length === 3 ? 1 : 1.6;
          ctx.globalAlpha = cl.band ? 0.7 : 0.95;
          if (cl.band && li === 1 && cl.lines.length === 3) ctx.setLineDash([4, 4]);
          ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        });
      });

      // marqueurs de trades
      this.markers.forEach(mk => {
        const i = mk.i != null ? mk.i : this.bars.findIndex(b => b.t === mk.t);
        if (i < start || i >= end || i < 0) return;
        const xx = x(i), b = this.bars[i];
        const buy = mk.type === "buy";
        const yy = buy ? y(b.l) + 12 : y(b.h) - 12;
        ctx.fillStyle = buy ? C.up : mk.type === "exit" ? "#FFD23D" : C.dn;
        ctx.beginPath();
        if (buy) { ctx.moveTo(xx, yy - 6); ctx.lineTo(xx - 5, yy + 3); ctx.lineTo(xx + 5, yy + 3); }
        else { ctx.moveTo(xx, yy + 6); ctx.lineTo(xx - 5, yy - 3); ctx.lineTo(xx + 5, yy - 3); }
        ctx.closePath(); ctx.fill();
      });

      // lignes horizontales (entrée, stop, objectif, liquidation)
      this.lines.forEach(l => {
        if (l.price == null || l.price < lo || l.price > hi) return;
        const yy = Math.round(y(l.price)) + 0.5;
        ctx.strokeStyle = l.color; ctx.lineWidth = 1; ctx.setLineDash(l.dash ? [5, 4] : []);
        ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(plotW, yy); ctx.stroke(); ctx.setLineDash([]);
        label(ctx, l.label + " " + M.Market.fmtPrice(l.price), 6, yy, l.color, "left");
      });

      // dernier prix
      const last = this.bars[n - 1];
      if (this.offset === 0) {
        const yy = Math.round(y(last.c)) + 0.5;
        const col = last.c >= last.o ? C.up : C.dn;
        ctx.strokeStyle = col; ctx.globalAlpha = 0.6; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(plotW, yy); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        axisLabel(ctx, M.Market.fmtPrice(last.c), plotW, yy, col, "#06060A");
      }

      // panneau RSI
      if (rsiH) {
        const top = PT + mainH + 10;
        const ry = v => top + (100 - v) / 100 * rsiH;
        ctx.fillStyle = "rgba(139,92,255,0.07)";
        ctx.fillRect(0, ry(70), plotW, ry(30) - ry(70));
        [30, 70].forEach(v => {
          ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(0, ry(v) + 0.5); ctx.lineTo(plotW, ry(v) + 0.5); ctx.stroke();
          ctx.fillStyle = C.txt; ctx.textAlign = "left"; ctx.fillText(String(v), plotW + 6, ry(v));
        });
        ctx.beginPath();
        let st = false;
        for (let i = start; i < end; i++) {
          const v = this.rsi[i]; if (v == null) continue;
          st ? ctx.lineTo(x(i), ry(v)) : ctx.moveTo(x(i), ry(v)); st = true;
        }
        ctx.strokeStyle = "#B794FF"; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.fillStyle = C.txt; ctx.fillText("RSI 14", 6, top + 8);
      }

      // réticule + légende OHLC
      let hb = last, hi_ = n - 1;
      if (this.hover && this.hover.x < plotW) {
        const i = Math.min(end - 1, Math.max(start, start + Math.floor(this.hover.x / bw)));
        hb = this.bars[i]; hi_ = i;
        const xx = Math.round(x(i)) + 0.5;
        ctx.strokeStyle = C.cross; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(xx, PT); ctx.lineTo(xx, H - PB); ctx.stroke();
        if (this.hover.y > PT && this.hover.y < PT + mainH) {
          const yy = Math.round(this.hover.y) + 0.5;
          ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(plotW, yy); ctx.stroke();
          ctx.setLineDash([]);
          const p = hi - (this.hover.y - PT) / mainH * (hi - lo);
          axisLabel(ctx, M.Market.fmtPrice(p), plotW, yy, C.bgLabel, "#fff");
        }
        ctx.setLineDash([]);
        const tl = fmtTime(hb.t, this.opts.tf, false);
        ctx.font = FONT;
        const tw = ctx.measureText(tl).width + 12;
        ctx.fillStyle = C.bgLabel; ctx.fillRect(xx - tw / 2, H - PB + 2, tw, 18);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(tl, xx, H - PB + 11);
      }
      this._legend(hb, hi_);
    }

    _legend(b, i) {
      if (!b) return;
      const ch = (b.c / b.o - 1) * 100;
      const cls = ch >= 0 ? "up" : "dn";
      const f = M.Market.fmtPrice;
      let extra = "";
      this.calc.forEach(cl => {
        const v = cl.lines[cl.band && cl.lines.length === 3 ? 1 : 0][i];
        if (v != null) extra += `<span style="color:${cl.o.color}">${ovName(cl.o)} ${f(v)}</span>`;
      });
      if (this.opts.rsi && this.rsi[i] != null) extra += `<span style="color:#B794FF">RSI ${this.rsi[i].toFixed(1)}</span>`;
      this.legend.innerHTML =
        `<span data-tip-text="Ouverture : premier prix échangé sur la période">O <b>${f(b.o)}</b></span>` +
        `<span data-tip-text="Plus haut atteint sur la période">H <b>${f(b.h)}</b></span>` +
        `<span data-tip-text="Plus bas atteint sur la période">L <b>${f(b.l)}</b></span>` +
        `<span data-tip-text="Clôture : dernier prix de la période">C <b class="${cls}">${f(b.c)}</b></span>` +
        `<span class="${cls}">${ch >= 0 ? "+" : ""}${ch.toFixed(2)} %</span>` + extra;
    }
  }

  function ovName(o) {
    return { ema: "EMA " + o.n, sma: "SMA " + o.n, vwap: "VWAP", bb: "BB " + (o.n || 20), donchian: "Donchian " + (o.n || 20) }[o.type] || "";
  }

  function label(ctx, text, x, y, color, align) {
    ctx.font = FONT;
    const w = ctx.measureText(text).width + 10;
    ctx.fillStyle = "rgba(10,10,16,0.85)";
    ctx.fillRect(x, y - 9, w, 18);
    ctx.strokeStyle = color; ctx.strokeRect(x + 0.5, y - 8.5, w - 1, 17);
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "middle";
    ctx.fillText(text, x + 5, y);
  }
  function axisLabel(ctx, text, x, y, bg, fg) {
    ctx.font = FONT;
    ctx.fillStyle = bg; ctx.fillRect(x + 1, y - 9, 67, 18);
    ctx.fillStyle = fg; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(text, x + 5, y);
  }

  function niceTicks(lo, hi, count) {
    const span = hi - lo;
    const raw = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v);
    return out;
  }

  function fmtTime(t, tf, short) {
    const d = new Date(t);
    const p = n => String(n).padStart(2, "0");
    const date = `${p(d.getDate())}/${p(d.getMonth() + 1)}`;
    const time = `${p(d.getHours())}:${p(d.getMinutes())}`;
    if (tf === "1d") return short ? date : `${date}/${d.getFullYear()}`;
    if (short) return (d.getHours() === 0 && d.getMinutes() === 0) ? date : time;
    return `${date} ${time}`;
  }

  /* Courbe simple (équité, z-score…) : series = [{data, color, label, fill}] */
  function lineChart(canvas, series, { zero, bands } = {}) {
    const r = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const W = r.width, H = canvas.parentElement.clientHeight || 180;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    let lo = Infinity, hi = -Infinity, n = 0;
    series.forEach(s => s.data.forEach(v => { if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } n = Math.max(n, s.data.length); }));
    (bands || []).forEach(b => { lo = Math.min(lo, b); hi = Math.max(hi, b); });
    if (zero != null) { lo = Math.min(lo, zero); hi = Math.max(hi, zero); }
    if (!isFinite(lo)) return;
    const pad = (hi - lo) * 0.08 || 1; lo -= pad; hi += pad;
    const PR = 60;
    const x = i => i / Math.max(n - 1, 1) * (W - PR);
    const y = v => 6 + (hi - v) / (hi - lo) * (H - 12);
    ctx.font = FONT; ctx.textBaseline = "middle";
    niceTicks(lo, hi, 4).forEach(v => {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(0, y(v) + 0.5); ctx.lineTo(W - PR, y(v) + 0.5); ctx.stroke();
      ctx.fillStyle = C.txt; ctx.textAlign = "left";
      ctx.fillText(Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("fr-FR") : (+v.toFixed(2)).toString(), W - PR + 6, y(v));
    });
    (bands || []).forEach(b => {
      ctx.strokeStyle = "rgba(255,210,61,0.5)"; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(0, y(b)); ctx.lineTo(W - PR, y(b)); ctx.stroke(); ctx.setLineDash([]);
    });
    series.forEach(s => {
      ctx.beginPath();
      let st = false;
      s.data.forEach((v, i) => { if (v == null) return; st ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)); st = true; });
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.stroke();
      if (s.fill) {
        ctx.lineTo(x(s.data.length - 1), H); ctx.lineTo(0, H); ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, s.color + "40"); g.addColorStop(1, s.color + "00");
        ctx.fillStyle = g; ctx.fill();
      }
    });
  }

  M.Chart = Chart;
  M.lineChart = lineChart;
  M.fmtTime = fmtTime;
})();
