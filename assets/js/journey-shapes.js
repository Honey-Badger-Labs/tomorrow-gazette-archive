/* Journey Through Tomorrow: the dot pictures, one per motif. Each motif
   returns N points (x, y, z) in a box about 2.4 wide by 1.4 tall, plus a
   colour per point, drawn from simple shapes in code: no images, no logos,
   no people. Colours are the site.css palette as 0-1 RGB.
   A stop names its motif in front matter (`journey: motif:`);
   tools/check_journey.rb reads the motif names from this file, so add a
   motif here together with the episode that uses it, on its air date. */
(function () {
  "use strict";
  const P = {
    teal: [0.25, 0.66, 0.70], tealDeep: [0.12, 0.44, 0.47], coral: [0.89, 0.34, 0.18],
    cream: [0.95, 0.91, 0.82], brass: [0.79, 0.64, 0.15], gold: [0.98, 0.80, 0.38],
    navy: [0.16, 0.24, 0.42], ghost: [0.55, 0.82, 0.86]
  };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { return (r() + r() + r() - 1.5) / 1.5; }
  const THICK = 1.6; // line softness: higher = fuller, glowier strokes

  // A "shape" is a list of primitives with weights. Each primitive samples one point.
  function Builder(r) { this.r = r; this.items = []; this.total = 0; }
  Builder.prototype.add = function (w, fn, col) { this.items.push({ w, fn, col }); this.total += w; return this; };
  Builder.prototype.line = function (x1, y1, x2, y2, th, col, wt) {
    const r = this.r, len = Math.hypot(x2 - x1, y2 - y1); th *= THICK;
    return this.add((wt || 1) * len, () => { const t = r(); return [x1 + (x2 - x1) * t + gauss(r) * th, y1 + (y2 - y1) * t + gauss(r) * th, gauss(r) * th * 2]; }, col);
  };
  Builder.prototype.arc = function (cx, cy, rx, ry, a0, a1, th, col, wt) {
    const r = this.r, len = Math.abs(a1 - a0) * (rx + ry) / 2; th *= THICK;
    return this.add((wt || 1) * len, () => { const a = a0 + (a1 - a0) * r(); return [cx + Math.cos(a) * rx + gauss(r) * th, cy + Math.sin(a) * ry + gauss(r) * th, gauss(r) * th * 2]; }, col);
  };
  Builder.prototype.ring = function (cx, cy, rad, th, col, wt) { return this.arc(cx, cy, rad, rad, 0, Math.PI * 2, th, col, wt); };
  Builder.prototype.disc = function (cx, cy, rad, col, wt, ry) {
    const r = this.r; ry = ry || rad;
    return this.add((wt || 1) * Math.PI * rad * ry * 6, () => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return [cx + Math.cos(a) * rad * d, cy + Math.sin(a) * ry * d, gauss(r) * 0.02]; }, col);
  };
  Builder.prototype.rect = function (x, y, w, h, col, wt) {
    const r = this.r;
    return this.add((wt || 1) * w * h * 6, () => [x + r() * w, y + r() * h, gauss(r) * 0.015], col);
  };
  Builder.prototype.box = function (x, y, w, h, th, col, wt) {
    this.line(x, y, x + w, y, th, col, wt); this.line(x + w, y, x + w, y + h, th, col, wt);
    this.line(x + w, y + h, x, y + h, th, col, wt); return this.line(x, y + h, x, y, th, col, wt);
  };
  Builder.prototype.rbox = function (x, y, w, h, rad, th, col, wt) {
    const H = Math.PI / 2;
    this.line(x + rad, y, x + w - rad, y, th, col, wt); this.line(x + w, y + rad, x + w, y + h - rad, th, col, wt);
    this.line(x + w - rad, y + h, x + rad, y + h, th, col, wt); this.line(x, y + h - rad, x, y + rad, th, col, wt);
    this.arc(x + w - rad, y + rad, rad, rad, -H, 0, th, col, wt); this.arc(x + w - rad, y + h - rad, rad, rad, 0, H, th, col, wt);
    this.arc(x + rad, y + h - rad, rad, rad, H, 2 * H, th, col, wt); return this.arc(x + rad, y + rad, rad, rad, 2 * H, 3 * H, th, col, wt);
  };
  Builder.prototype.dust = function (frac, col) {
    const r = this.r; this.dustFrac = frac;
    this.dustFn = () => [(r() * 2 - 1) * 1.9, (r() * 2 - 1) * 1.15, (r() * 2 - 1) * 0.6]; this.dustCol = col || P.navy; return this;
  };
  Builder.prototype.build = function (n) {
    const r = this.r, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const nd = Math.floor(n * (this.dustFrac || 0));
    const cum = []; let acc = 0; for (const it of this.items) { acc += it.w; cum.push(acc); }
    for (let i = 0; i < n; i++) {
      let p, c;
      if (i < nd) { p = this.dustFn(); const k = 0.3 + r() * 0.4; c = [this.dustCol[0] * k, this.dustCol[1] * k, this.dustCol[2] * k]; }
      else {
        const u = r() * acc; let lo = 0, hi = cum.length - 1;
        while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < u) lo = m + 1; else hi = m; }
        const it = this.items[lo]; p = it.fn(); c = typeof it.col === "function" ? it.col(p, r) : it.col;
      }
      const b = 0.82 + r() * 0.36;
      pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2];
      col[i * 3] = c[0] * b; col[i * 3 + 1] = c[1] * b; col[i * 3 + 2] = c[2] * b;
    }
    return { pos, col };
  };
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

  const MOTIFS = {
    camera(B) { // a box camera sending a photo down a wire
      B.dust(0.10);
      B.rbox(-0.95, -0.35, 0.8, 0.6, 0.05, 0.007, P.brass, 2.5);
      B.rect(-0.95, -0.35, 0.8, 0.6, P.tealDeep, 0.25);
      B.ring(-0.55, -0.05, 0.2, 0.006, P.cream, 2); B.ring(-0.55, -0.05, 0.12, 0.005, P.teal, 2); B.disc(-0.55, -0.05, 0.06, P.gold, 2);
      B.box(-0.88, 0.25, 0.2, 0.1, 0.005, P.cream);
      const r = B.r;
      B.add(2.2, () => { const x = -0.12 + r() * 1.2; return [x, 0.05 * Math.sin(x * 18) + gauss(r) * 0.006, gauss(r) * 0.01]; }, P.coral);
      B.rbox(0.62, -0.3, 0.42, 0.52, 0.02, 0.006, P.cream, 2);
      B.rect(0.66, -0.26, 0.34, 0.44, (p, r2) => p[1] > -0.02 ? mix(P.teal, P.gold, r2()) : mix(P.coral, P.brass, r2()), 0.8);
    },
    phone(B) { // a candlestick telephone with ghostly wisps
      B.dust(0.06, P.tealDeep);
      B.arc(0, -0.5, 0.3, 0.07, 0, Math.PI * 2, 0.008, P.brass, 2); B.disc(0, -0.5, 0.3, P.brass, 0.4, 0.07);
      B.line(0, -0.48, 0, 0.3, 0.018, P.brass, 2.5);
      B.disc(0, 0.36, 0.11, P.gold, 1.2, 0.06); B.line(-0.09, 0.32, 0.09, 0.32, 0.01, P.brass);
      B.line(0.04, 0.1, 0.22, 0.1, 0.008, P.brass); B.line(0.22, -0.05, 0.22, 0.22, 0.02, P.cream, 2);
      B.arc(0.4, -0.5, 0.4, 0.3, Math.PI, Math.PI * 1.5, 0.004, P.cream, 0.6);
      const r = B.r;
      B.add(9, () => { const k = Math.floor(r() * 5), t = r(), a = t * Math.PI * 3 + k * 1.3, rad = 0.25 + t * 0.85;
        return [Math.cos(a) * rad, 0.05 + Math.sin(a) * rad * 0.55 + t * 0.15, Math.sin(a + k) * 0.3 + gauss(r) * 0.04]; }, (p, r2) => mix(P.ghost, P.cream, r2() * 0.5));
    },
    flyingcar(B) { // a car with wings
      B.dust(0.10);
      B.rbox(-0.7, -0.2, 1.4, 0.3, 0.1, 0.007, P.coral, 3); B.rect(-0.7, -0.2, 1.4, 0.3, P.coral, 0.3);
      B.arc(-0.05, 0.1, 0.38, 0.22, 0, Math.PI, 0.007, P.cream, 2.5);
      B.ring(-0.42, -0.22, 0.12, 0.007, P.cream, 2); B.ring(0.42, -0.22, 0.12, 0.007, P.cream, 2); B.disc(-0.42, -0.22, 0.04, P.brass); B.disc(0.42, -0.22, 0.04, P.brass);
      B.line(-0.25, 0.0, -0.95, 0.42, 0.006, P.brass, 2); B.line(-0.95, 0.42, 0.25, 0.08, 0.006, P.brass, 2);
      B.line(0.65, 0.05, 0.85, 0.32, 0.006, P.brass, 1.5); B.line(0.85, 0.32, 0.72, 0.05, 0.006, P.brass, 1.5);
      for (let k = 0; k < 4; k++) B.line(-1.3, -0.15 + k * 0.1, -0.9, -0.15 + k * 0.1, 0.003, P.teal, 0.7);
    },
    missile(B) { // a missile carrying a letter, on an arc
      B.dust(0.10);
      const r = B.r;
      B.add(1.4, () => { const t = r(), x = -1.2 + t * 2.0, y = -0.55 + Math.sin(t * Math.PI) * 0.85; return (Math.floor(t * 30) % 2) ? [x, y, 0] : [x + gauss(r) * 0.004, y + gauss(r) * 0.004, 0]; }, P.teal);
      const cx = 0.25, cy = 0.22; // rocket body, pointing right and slightly down
      B.rbox(cx - 0.35, cy - 0.07, 0.6, 0.14, 0.03, 0.006, P.cream, 2.5); B.rect(cx - 0.35, cy - 0.07, 0.6, 0.14, P.cream, 0.4);
      B.line(cx + 0.25, cy + 0.07, cx + 0.42, cy, 0.006, P.coral, 2); B.line(cx + 0.42, cy, cx + 0.25, cy - 0.07, 0.006, P.coral, 2);
      B.line(cx - 0.3, cy + 0.07, cx - 0.42, cy + 0.17, 0.006, P.coral, 1.5); B.line(cx - 0.3, cy - 0.07, cx - 0.42, cy - 0.17, 0.006, P.coral, 1.5);
      B.add(2.5, () => { const t = r(); return [cx - 0.38 - t * 0.45, cy + gauss(r) * 0.03 * (1 + t * 3), gauss(r) * 0.03]; }, (p, r2) => mix(P.gold, P.coral, r2()));
      B.box(0.7, -0.45, 0.42, 0.28, 0.005, P.brass, 1.6); B.line(0.7, -0.17, 0.91, -0.33, 0.004, P.brass); B.line(1.12, -0.17, 0.91, -0.33, 0.004, P.brass);
    },
    robot(B) { // a friendly home robot and a round floor robot
      B.dust(0.10);
      B.rbox(-0.22, 0.12, 0.44, 0.32, 0.05, 0.007, P.cream, 2.5); B.disc(-0.09, 0.3, 0.045, P.teal, 2); B.disc(0.09, 0.3, 0.045, P.teal, 2);
      B.line(-0.08, 0.19, 0.08, 0.19, 0.005, P.coral); B.line(0, 0.44, 0, 0.56, 0.005, P.brass); B.disc(0, 0.58, 0.03, P.coral, 2);
      B.rbox(-0.28, -0.4, 0.56, 0.48, 0.04, 0.007, P.brass, 2.5); B.rect(-0.28, -0.4, 0.56, 0.48, P.tealDeep, 0.3);
      B.disc(0, -0.15, 0.06, P.gold, 1.5);
      B.line(-0.28, 0.0, -0.55, -0.3, 0.008, P.brass, 1.5); B.line(0.28, 0.0, 0.55, -0.3, 0.008, P.brass, 1.5);
      B.line(-0.15, -0.4, -0.15, -0.6, 0.01, P.brass); B.line(0.15, -0.4, 0.15, -0.6, 0.01, P.brass);
      B.arc(0.85, -0.55, 0.22, 0.06, 0, Math.PI * 2, 0.006, P.coral, 2); B.disc(0.85, -0.55, 0.22, P.coral, 0.5, 0.06);
    },
    moon(B) { // a crescent Moon and a flight path
      B.dust(0.12, P.cream);
      const r = B.r;
      B.add(10, () => { for (;;) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.55, x = 0.35 + Math.cos(a) * d, y = 0.12 + Math.sin(a) * d;
        if (Math.hypot(x - 0.55, y - 0.25) > 0.5) return [x, y, gauss(r) * 0.02]; } }, (p, r2) => mix(P.cream, P.gold, r2() * 0.6));
      B.add(1.5, () => { const t = r(), x = -1.1 + t * 1.2, y = -0.55 + Math.sin(t * Math.PI * 0.6) * 0.6; return [x + gauss(r) * 0.004, y + gauss(r) * 0.004, 0]; }, P.teal);
      B.disc(0.1, 0.0, 0.025, P.coral, 2);
    },
    sunburst(B) { // fallback for a stop with no motif yet: the masthead's sunburst
      B.dust(0.10);
      B.ring(0, 0, 0.16, 0.008, P.gold, 3); B.disc(0, 0, 0.12, P.gold, 2);
      for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, r1 = 0.24, r2 = k % 2 ? 0.55 : 0.75;
        B.line(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * r2, Math.sin(a) * r2, 0.006, k % 2 ? P.brass : P.coral, 1); }
    }
  };

  const cache = new Map();
  window.JourneyShapes = window.JourneyShapes || {};
  window.JourneyShapes.build = function (motif, n, seed) {
    const key = motif + ":" + n; if (cache.has(key)) return cache.get(key);
    const B = new Builder(rng(seed || 7)); (MOTIFS[motif] || MOTIFS.sunburst)(B);
    const out = B.build(n); cache.set(key, out); return out;
  };
  window.JourneyShapes.clear = () => cache.clear();
  window.JourneyShapes.names = Object.keys(MOTIFS);
})();
