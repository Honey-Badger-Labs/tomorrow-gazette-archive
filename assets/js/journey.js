/* Journey Through Tomorrow (/journey/): a WebGL dot cloud that reshapes for
   each stop. The stops are the page's own list (built from published
   episodes and specials at build time); this script only reads it.
   No libraries, no network calls, no tracking. Without WebGL the list stays
   on screen as a plain page. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const list = $("journey-list");
  if (!list || !window.JourneyShapes) return;

  const stops = Array.from(list.querySelectorAll(".journey-stop")).map((li) => ({
    li, id: li.id, year: Number(li.dataset.year), aired: Number(li.dataset.aired),
    motif: li.dataset.motif, label: li.dataset.label
  })).sort((a, b) => a.year - b.year || a.aired - b.aired);
  if (!stops.length) return;

  const canvas = $("journey-scene");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl) {
    const note = document.createElement("p"); note.className = "journey-notice";
    note.textContent = "Your browser can't show the moving picture, so here is the journey as a list.";
    list.before(note); return;
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(location.search);
  const phone = Math.min(screen.width, screen.height) < 700 || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const DOT_COUNTS = [20000, 60000, 120000];
  let N = DOT_COUNTS.includes(Number(params.get("dots"))) ? Number(params.get("dots")) : (phone ? 20000 : 60000);
  const DWELL_MS = Math.max(1500, Number(params.get("dwell")) || 6200);
  const MORPH_MS = reduce ? 250 : 1700;
  const SCATTER = reduce ? 0 : 0.22;

  // ---------- WebGL ----------
  const VS = `
    attribute vec3 aFrom; attribute vec3 aTo; attribute vec3 aCF; attribute vec3 aCT; attribute vec3 aSeed;
    uniform float uT; uniform float uTime; uniform float uRot; uniform vec2 uScale; uniform float uOffY; uniform float uSize; uniform float uScatter; uniform float uShimmer;
    varying vec3 vCol; varying float vA;
    void main() {
      vec3 p = mix(aFrom, aTo, uT);
      float s = sin(3.14159265 * uT);
      p += aSeed * s * uScatter;
      p += uShimmer * 0.006 * vec3(sin(uTime * 1.3 + aSeed.x * 40.0), cos(uTime * 1.1 + aSeed.y * 40.0), sin(uTime * 0.9 + aSeed.z * 40.0));
      float c = cos(uRot), sn = sin(uRot);
      p = vec3(p.x * c + p.z * sn, p.y, -p.x * sn + p.z * c);
      float persp = 3.0 / (3.0 - p.z);
      gl_Position = vec4(p.xy * uScale * persp + vec2(0.0, uOffY), 0.0, 1.0);
      gl_PointSize = uSize * persp;
      vCol = mix(aCF, aCT, uT);
      vA = 0.85 - 0.25 * s;
    }`;
  const FS = `
    precision mediump float; varying vec3 vCol; varying float vA;
    void main() { vec2 d = gl_PointCoord - 0.5; float r = dot(d, d); if (r > 0.25) discard; gl_FragColor = vec4(vCol * smoothstep(0.25, 0.0, r) * vA * 0.62, 1.0); }`;
  function compile(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return; // stay in list mode
  gl.useProgram(prog);
  const loc = {}, buf = {};
  for (const a of ["aFrom", "aTo", "aCF", "aCT", "aSeed"]) { loc[a] = gl.getAttribLocation(prog, a); buf[a] = gl.createBuffer(); }
  for (const u of ["uT", "uTime", "uRot", "uScale", "uOffY", "uSize", "uScatter", "uShimmer"]) loc[u] = gl.getUniformLocation(prog, u);
  gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  function upload(name, data) { gl.bindBuffer(gl.ARRAY_BUFFER, buf[name]); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(loc[name]); gl.vertexAttribPointer(loc[name], 3, gl.FLOAT, false, 0, 0); }

  // ---------- switch to immersive mode ----------
  document.body.classList.add("immersive");
  const caption = $("journey-caption"), controls = document.querySelector(".journey-controls");
  caption.hidden = false; controls.hidden = false;

  // ---------- morphing ----------
  let seeds, cpuFrom = null, cpuTo = null, t = 1, morphStart = 0, current = -1;
  function makeSeeds() {
    seeds = new Float32Array(N * 3); let s = 12345;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < N; i++) { const a = rnd() * 6.283, z = rnd() * 2 - 1, r = Math.sqrt(1 - z * z) * (0.4 + rnd());
      seeds[i * 3] = Math.cos(a) * r; seeds[i * 3 + 1] = Math.sin(a) * r * 0.7; seeds[i * 3 + 2] = z; }
    upload("aSeed", seeds);
  }
  const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  function shapeFor(stop) { return window.JourneyShapes.build(stop.motif, N, stop.year * 7 + stop.id.length); }
  function snapshot() { // where the dots are right now, so a new morph starts from there
    const out = { pos: new Float32Array(N * 3), col: new Float32Array(N * 3) }, e = ease(t), s = Math.sin(Math.PI * e) * SCATTER;
    for (let i = 0; i < N * 3; i++) { out.pos[i] = cpuFrom.pos[i] + (cpuTo.pos[i] - cpuFrom.pos[i]) * e + seeds[i] * s; out.col[i] = cpuFrom.col[i] + (cpuTo.col[i] - cpuFrom.col[i]) * e; }
    return out;
  }
  function goTo(index, instant) {
    index = Math.max(0, Math.min(stops.length - 1, index));
    const target = shapeFor(stops[index]);
    const start = instant || !cpuTo ? target : snapshot();
    cpuFrom = start; cpuTo = target;
    upload("aFrom", start.pos); upload("aCF", start.col); upload("aTo", target.pos); upload("aCT", target.col);
    t = instant ? 1 : 0; morphStart = performance.now();
    if (index !== current) { current = index; showCaption(stops[index]); }
    $("journey-track").value = index;
    history.replaceState(null, "", "#" + stops[index].id);
  }

  // ---------- caption: a copy of the stop's own list item ----------
  function showCaption(stop) {
    caption.classList.add("fading");
    setTimeout(() => {
      const card = document.createElement("div"); card.className = "journey-stop";
      card.append(...Array.from(stop.li.childNodes, (n) => n.cloneNode(true)));
      caption.replaceChildren(card);
      const stamp = card.querySelector(".verdict-stamp"); if (stamp) stamp.classList.add("thump");
      document.querySelectorAll(".journey-ticks button").forEach((b, i) => b.setAttribute("aria-current", String(i === current)));
      caption.classList.remove("fading");
    }, reduce ? 0 : 260);
  }
  function buildTicks() {
    const ol = $("journey-ticks"); ol.replaceChildren();
    $("journey-track").max = String(stops.length - 1);
    stops.forEach((s, i) => {
      const li = document.createElement("li"); li.style.left = (stops.length === 1 ? 50 : (i / (stops.length - 1)) * 100) + "%";
      const b = document.createElement("button"); b.type = "button"; b.title = s.year + ": " + s.li.querySelector(".stop-title").textContent;
      const y = document.createElement("span"); y.textContent = s.year; b.append(y, document.createTextNode(s.label));
      b.addEventListener("click", () => { stopPlay(); goTo(i); });
      li.append(b); ol.append(li);
    });
  }

  // ---------- controls ----------
  let playing = false, nextAt = 0;
  const playBtn = $("journey-play");
  function startPlay() { playing = true; playBtn.textContent = "Pause"; playBtn.setAttribute("aria-pressed", "true"); nextAt = performance.now() + 900; }
  function stopPlay() { playing = false; playBtn.textContent = "Play"; playBtn.setAttribute("aria-pressed", "false"); }
  playBtn.addEventListener("click", () => (playing ? stopPlay() : startPlay()));
  $("journey-track").addEventListener("input", (e) => { stopPlay(); goTo(Number(e.target.value)); });
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" && e.target.type !== "range") return;
    if (e.key === "ArrowRight") { stopPlay(); goTo(current + 1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { stopPlay(); goTo(current - 1); e.preventDefault(); }
  });
  function nearest(year) { let best = 0, gap = Infinity; stops.forEach((s, i) => { const d = Math.abs(s.year - year); if (d < gap) { gap = d; best = i; } }); return best; }
  $("journey-jump").addEventListener("submit", (e) => {
    e.preventDefault();
    const year = Math.round(Number($("journey-year").value)), note = $("journey-jump-note");
    if (!year || year < 1000 || year > 2200) { note.textContent = "Type a year, like 1987."; return; }
    stopPlay(); const i = nearest(year), s = stops[i], title = s.li.querySelector(".stop-title").textContent;
    note.textContent = s.year === year ? "A prediction from " + year + ": " + title + "." : "Nearest prediction to " + year + ": " + s.year + ", " + title + ".";
    goTo(i);
  });
  const countBtn = $("journey-count");
  function setCount(n) { N = n; countBtn.textContent = (n / 1000) + "k dots"; window.JourneyShapes.clear(); makeSeeds(); cpuTo = null; goTo(current, true); }
  countBtn.addEventListener("click", () => setCount(DOT_COUNTS[(DOT_COUNTS.indexOf(N) + 1) % DOT_COUNTS.length]));

  // ---------- layout and drawing ----------
  let layoutY = innerHeight * 0.3, layoutH = innerHeight * 0.45;
  function placeCaption() { // just above the controls, whatever their height
    const h = controls.offsetHeight;
    caption.style.bottom = (h + 6) + "px";
    caption.style.maxHeight = Math.max(160, innerHeight - h - (innerWidth < 760 ? 0.36 : 0.42) * innerHeight) + "px";
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height); placeCaption();
  }
  function frame(now) {
    if (t < 1) t = Math.min(1, (now - morphStart) / MORPH_MS);
    // Fit the picture between the top bar and the caption.
    const W = innerWidth, H = innerHeight, top = 44, bottom = Math.max(top + H * 0.3, caption.getBoundingClientRect().top - 8);
    layoutY += ((top + bottom) / 2 - layoutY) * 0.08; layoutH += ((bottom - top) - layoutH) * 0.08;
    const unit = Math.min(layoutH / 1.6, W * 0.92 / 2.4), dpr = Math.min(window.devicePixelRatio || 1, 2);
    gl.clearColor(0.027, 0.043, 0.086, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(loc.uT, ease(t)); gl.uniform1f(loc.uTime, now / 1000);
    gl.uniform1f(loc.uRot, reduce ? 0 : Math.sin(now / 5200) * 0.32);
    gl.uniform2f(loc.uScale, unit * 2 / W, unit * 2 / H); gl.uniform1f(loc.uOffY, 1 - 2 * layoutY / H);
    gl.uniform1f(loc.uSize, Math.max(1.2, 2.4 * Math.sqrt(60000 / N)) * dpr * Math.min(1.4, Math.max(0.6, unit / 220)));
    gl.uniform1f(loc.uScatter, SCATTER); gl.uniform1f(loc.uShimmer, reduce ? 0 : 1);
    gl.drawArrays(gl.POINTS, 0, N);
    if (playing && t >= 1 && now > nextAt) { goTo((current + 1) % stops.length); nextAt = now + DWELL_MS; }
    requestAnimationFrame(frame);
  }

  // ---------- start ----------
  addEventListener("resize", resize);
  buildTicks(); resize(); makeSeeds();
  countBtn.textContent = (N / 1000) + "k dots";
  const hash = decodeURIComponent(location.hash.slice(1));
  let first = stops.findIndex((s) => s.id === hash);
  if (first < 0 && /^\d{4}$/.test(hash)) first = nearest(Number(hash));
  goTo(Math.max(0, first), true);
  if (params.get("play") === "1" || (!reduce && first < 0 && params.get("play") !== "0")) startPlay();
  requestAnimationFrame(frame);
  window.JourneyTimeline = { goTo, count: () => stops.length, ids: () => stops.map((s) => s.id), current: () => current };
})();
