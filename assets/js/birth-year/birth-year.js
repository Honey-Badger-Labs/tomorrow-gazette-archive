/* Tomorrow Gazette: Your Birth-Year Front Page.
   Type a year, get the front page of the future that was promised then.
   Runs offline: no network requests, no trackers, no cookies. */
(function () {
  'use strict';
  var root = document.getElementById('by');
  // Same year: the primary entry first, then the rest by id.
    var ALL = (window.TG_PREDICTIONS || []).slice().sort(function (a, b) { return a.year - b.year || (b.primary ? 1 : 0) - (a.primary ? 1 : 0) || (a.id < b.id ? -1 : 1); });
    // Belt and braces: the build already leaves embargoed stories out, but never show one before its air time.
    var clock = Date.now();
    ALL = ALL.filter(function (p) { return !p.embargo_until || Date.parse(p.embargo_until) <= clock; });
  var showProposed = root.getAttribute('data-show-proposed') !== 'false';
  var params = new URLSearchParams(location.search);
  if (params.get('public') === '1') showProposed = false;
  var DATA = ALL.filter(function (p) { return showProposed || p.status === 'aired'; });
  var NOW = Number(params.get('now')) || new Date().getFullYear();
  var MIN = DATA.length ? DATA[0].year : 1889, MAX = DATA.length ? DATA[DATA.length - 1].year : 2010;
  var $ = function (id) { return document.getElementById(id); };
  var els = { form: $('by-form'), year: $('by-year'), note: $('by-note'), page: $('by-page'), nearby: $('by-nearby-list'), nearbyTitle: $('by-nearby-title'),
    sources: $('by-sources-body'), status: $('by-status'), prev: $('by-prev'), next: $('by-next'), count: $('by-count') };
  var state = { year: null, p: null };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (els.count) els.count.textContent = DATA.length + ' real predictions, ' + MIN + ' to ' + MAX;
  els.year.min = 1800; els.year.max = NOW;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cls(v) { return 'verdict-' + v.toLowerCase().replace(/ /g, '-'); }
  function domain(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

  // The prediction for a year: that year's main entry, else the nearest (earlier wins a tie).
  function pick(year, id) {
    if (id) { var byId = DATA.filter(function (p) { return p.id === id; })[0]; if (byId) return byId; }
    var same = DATA.filter(function (p) { return p.year === year; });
    if (same.length) return same.filter(function (p) { return p.primary; })[0] || same[0];
    var best = null, bd = Infinity;
    DATA.forEach(function (p) { var d = Math.abs(p.year - year); if (d < bd || (d === bd && p.year < best.year)) { best = p; bd = d; } });
    return best;
  }
  function sameYear(p) { return DATA.filter(function (q) { return q.year === p.year; }); }

  function noteFor(year, p) {
    var d = p.year - year, same = sameYear(p);
    var extra = same.length > 1 ? ' There are ' + same.length + ' promises from ' + p.year + ' on file; try the buttons below to see the others.' : '';
    if (year < MIN) return 'Our files start in ' + MIN + ', so here is the oldest promise we have.' + extra;
    if (year > MAX) return 'Our files run to ' + MAX + ' for now, so here is the most recent promise we have.' + extra;
    if (d === 0) return 'A real promise from ' + year + '.' + extra;
    return 'Nothing on file from ' + year + ' yet. The nearest promise was made in ' + p.year + ', ' + Math.abs(d) + (Math.abs(d) === 1 ? ' year ' : ' years ') + (d < 0 ? 'before.' : 'after.') + extra;
  }

  function quoteHTML(p) {
    if (p.quote_kind === 'paraphrase') return '<p class="fp-q is-paraphrase">' + esc(p.quote) + '</p>';
    return '<p class="fp-q">\u201C' + esc(p.quote.replace(/\.\.\./g, '\u2026')) + '\u201D</p>';
  }

  function pageHTML(p, year) {
    var doms = [];
    p.quote_sources.concat(p.happened_sources).forEach(function (s) { var d = domain(s.url).replace(/^web\.archive\.org$/, 'archive.org'); if (doms.indexOf(d) < 0) doms.push(d); });
    var later = NOW - p.year;
    return '' +
      '<p class="fp-dateline"><span>The ' + year + ' edition</span><span class="star" aria-hidden="true">\u2726</span><span>Checked in ' + NOW + '</span></p>' +
      '<div class="fp-rule" aria-hidden="true"></div>' +
      '<div class="fp-mast"><img src="' + esc(root.getAttribute('data-masthead')) + '" width="840" height="248" alt="Tomorrow Gazette"></div>' +
      '<div class="fp-rule" aria-hidden="true"></div>' +
      '<p class="fp-band"><span aria-hidden="true">\u2605 </span>Your birth-year front page<span aria-hidden="true"> \u2605</span></p>' +
      '<p class="fp-kicker">The future, as promised in ' + p.year + '</p>' +
      (p.year !== year ? '<p class="fp-nearest">The nearest promise on file to ' + year + '</p>' : '') +
      '<h2 class="fp-headline">' + esc(p.headline) + '</h2>' +
      '<p class="fp-deck">' + esc(p.deck) + '</p>' +
      '<blockquote class="fp-quote"><p class="fp-label">' + (p.quote_kind === 'paraphrase' ? 'The promise (in our words)' : 'The promise') + '</p>' + quoteHTML(p) +
        '<p class="fp-who">\u2014 ' + esc(p.who) + ', ' + esc(p.where) + ', ' + esc(p.when) + '</p></blockquote>' +
      '<div class="fp-row"><div class="fp-happened"><p class="fp-label fp-label-coral">What actually happened</p><p class="fp-text">' + esc(p.happened) + '</p>' +
        '<p class="fp-checked">Checked ' + NOW + ': ' + later + ' years later</p></div>' +
        '<div class="fp-verdict"><p class="fp-label">Dot\u2019s verdict</p><p class="verdict-stamp ' + cls(p.verdict) + '"><span class="visually-hidden">Verdict: </span>' + esc(p.verdict) + '</p></div></div>' +
      '<div class="fp-foot"><p>Sources: ' + doms.slice(0, 4).map(esc).join(' \u00B7 ') + '</p>' +
        '<p class="brass">The future, according to the past \u00B7 Made with AI \u00B7 Facts real and sourced</p>' +
        (p.status !== 'aired' ? '<p class="draft">Draft verdict \u00B7 awaiting the editor\u2019s OK</p>' : '') + '</div>';
  }

  function sourcesHTML(p) {
    function li(s) { return '<li><a href="' + esc(s.url) + '">' + esc(s.title) + '</a>' + (s.kind ? ' <span class="small">(' + esc(s.kind) + ')</span>' : '') + '</li>'; }
    var kind = { verbatim: 'Exact words from the source.', reported: 'As reported at the time (reported speech).', paraphrase: 'Paraphrase: our summary, not a quotation.' }[p.quote_kind] || '';
    return '<p class="small"><b>The quote.</b> ' + kind + (p.quote_note ? ' ' + esc(p.quote_note) : '') + '</p><ul>' + p.quote_sources.map(li).join('') + '</ul>' +
      '<p class="small"><b>What happened.</b></p><ul>' + p.happened_sources.map(li).join('') + '</ul>' +
      '<p class="small"><b>Dot\u2019s verdict:</b> ' + esc(p.verdict) + '. ' + esc(p.reason) + ' ' +
      (p.status === 'aired' ? 'This is the verdict given on air. <a href="' + esc(p.episode_url) + '">' + esc(p.episode_label) + '</a>.' : '<b>Draft:</b> proposed by the newsroom and awaiting the editor\u2019s OK.') + '</p>' +
      '<p class="small">Sources opened ' + esc(p.opened) + '.</p>';
  }

  function nearbyHTML(p, year) {
    var list = DATA.filter(function (q) { return q !== p; }).sort(function (a, b) { return Math.abs(a.year - year) - Math.abs(b.year - year) || a.year - b.year; }).slice(0, 4);
    return list.map(function (q) { return '<li><button type="button" class="by-chip" data-id="' + esc(q.id) + '"><b>' + q.year + '</b>' + esc(q.headline.toLowerCase().replace(/(^|[\s"(])(\w)/g, function (m, a, b) { return a + b.toUpperCase(); })) + '</button></li>'; }).join('');
  }

  function show(year, id, opts) {
    opts = opts || {};
    var p = pick(year, id); if (!p) return;
    state.year = year; state.p = p;
    els.year.value = year;
    els.note.textContent = noteFor(year, p);
    els.page.innerHTML = pageHTML(p, year);
    if (pv) pv.hidden = true;
    els.sources.innerHTML = sourcesHTML(p);
    els.nearbyTitle.textContent = 'Also promised around ' + year;
    els.nearby.innerHTML = nearbyHTML(p, year);
    var i = DATA.indexOf(p); els.prev.disabled = i <= 0; els.next.disabled = i >= DATA.length - 1;
    document.title = 'Tomorrow Gazette, ' + year + ' edition: ' + p.headline.toLowerCase().replace(/^\w/, function (c) { return c.toUpperCase(); });
    try { var u = new URL(location.href); u.searchParams.set('year', year); if (p.year !== year || sameYear(p).length > 1) u.searchParams.set('id', p.id); else u.searchParams.delete('id'); history.replaceState(null, '', u); } catch (e) {}
    if (!opts.quiet) animate();
  }

  function animate() {
    var pg = els.page; pg.classList.remove('is-printing', 'is-stamping', 'is-thud');
    if (reduce) return;
    void pg.offsetWidth; pg.classList.add('is-printing');
    setTimeout(function () { pg.classList.remove('is-printing'); pg.classList.add('is-stamping'); }, 1150);
    setTimeout(function () { pg.classList.remove('is-stamping'); pg.classList.add('is-thud'); }, 1450);
    setTimeout(function () { pg.classList.remove('is-thud'); }, 1820);
  }

  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    var y = parseInt(els.year.value, 10);
    if (!(y >= 1800 && y <= NOW)) { els.note.textContent = 'Please type a year between 1800 and ' + NOW + '.'; els.year.focus(); return; }
    show(y);
  });
  $('by-random').addEventListener('click', function () { var p = DATA[Math.floor(Math.random() * DATA.length)]; show(p.year, p.id); });
  els.prev.addEventListener('click', function () { var i = DATA.indexOf(state.p); if (i > 0) show(DATA[i - 1].year, DATA[i - 1].id); });
  els.next.addEventListener('click', function () { var i = DATA.indexOf(state.p); if (i < DATA.length - 1) show(DATA[i + 1].year, DATA[i + 1].id); });
  els.nearby.addEventListener('click', function (e) { var b = e.target.closest('[data-id]'); if (!b) return; var p = pick(0, b.getAttribute('data-id')); show(p.year, p.id); window.scrollTo({ top: els.page.offsetTop - 16, behavior: reduce ? 'auto' : 'smooth' }); });

  function cardName(fmt) { return 'tomorrow-gazette-' + state.year + '-edition-' + (fmt === 'story' ? 'story' : 'post') + '.png'; }
  function makeCard(fmt) {
    return window.TGCard.render(state.p, { format: fmt, year: state.year, now: NOW, draft: true }).then(window.TGCard.toBlob);
  }
  function download(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function busy(msg) { els.status.textContent = msg; }
  var pv = $('by-preview'), pvImg = $('by-preview-img'), pvUrl = null;
  function preview(blob, fmt) {
    if (pvUrl) URL.revokeObjectURL(pvUrl);
    pvUrl = URL.createObjectURL(blob); pvImg.src = pvUrl;
    pvImg.alt = 'Share card: Tomorrow Gazette, ' + state.year + ' edition. ' + state.p.headline + '. Dot\u2019s verdict: ' + state.p.verdict + '.';
    pv.className = 'by-preview is-' + fmt; pv.hidden = false;
  }
  $('by-save-post').addEventListener('click', function () { busy('Printing your card\u2026'); makeCard('post').then(function (b) { preview(b, 'post'); download(b, cardName('post')); busy('Saved: 1080 \u00D7 1350 post card.'); }); });
  $('by-save-story').addEventListener('click', function () { busy('Printing your card\u2026'); makeCard('story').then(function (b) { preview(b, 'story'); download(b, cardName('story')); busy('Saved: 1080 \u00D7 1920 story card.'); }); });
  $('by-share').addEventListener('click', function () {
    busy('Printing your card\u2026');
    makeCard('post').then(function (b) {
      var file = new File([b], cardName('post'), { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], title: 'Tomorrow Gazette, ' + state.year + ' edition', text: 'The future, as promised in ' + state.p.year + '. Dot\u2019s verdict: ' + state.p.verdict + '.' })
          .then(function () { busy('Shared.'); }, function () { busy(''); });
      }
      preview(b, 'post'); download(b, cardName('post')); busy('This browser can\u2019t share pictures directly, so the card was saved instead.');
    });
  });

  // Start: ?year=1984[&id=...], #1984, or a gentle default.
  var y0 = parseInt(params.get('year') || location.hash.replace('#', ''), 10);
  window.TG_BY = { show: show, pick: pick, data: DATA, state: state };
  show(y0 >= 1800 && y0 <= NOW ? y0 : 1969, params.get('id'), { quiet: params.get('still') === '1' });
})();
