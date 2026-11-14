/* Tomorrow Gazette: Birth-Year Front Page, share-card renderer.
   Draws a front page onto a <canvas> at 1080x1350 (post) or 1080x1920
   (story). Uses only local fonts and artwork (embedded.js offline, or same-origin
   files named on the page), so the canvas can always be exported. */
(function () {
  'use strict';
  var C = {
    cream: '#F3E9D2', creamLight: '#FAF4E6', navy: '#14213D', teal: '#1F6F78',
    tealDeep: '#1A5A62', coral: '#E4572E', coralInk: '#B23A1A', brass: '#C9A227',
    brassInk: '#7A5C00', charcoal: '#22201E'
  };
  var STAMP = { 'NAILED IT': C.teal, 'PARTLY RIGHT': C.brassInk, 'NOT YET': C.navy, 'COMPLETELY BONKERS': C.coralInk };
  var F = {
    display: function (s) { return s + 'px "Limelight", Georgia, serif'; },
    stamp: function (s) { return s + 'px "Anton", Impact, sans-serif'; },
    type: function (s) { return 'bold ' + s + 'px "Courier Prime", "Courier New", monospace'; },
    body: function (s, it) { return (it ? 'italic ' : '') + s + 'px Georgia, "Times New Roman", serif'; }
  };
  var imgs = {}, readyP = null;

  function loadImg(src) {
    return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = src; });
  }
  function pageAssets() {
    var d = (document.getElementById('by') || document.body).dataset;
    return { masthead: d.masthead, sunburst: d.sunburst,
      fonts: { 'Limelight': d.fontDisplay, 'Anton': d.fontStamp, 'Courier Prime': d.fontType } };
  }
  function ready() {
    if (readyP) return readyP;
    // Assets embedded in the page (TG_ASSETS) if present; on the website:
    // same-origin files named on the page, which keeps the canvas exportable.
    var A = window.TG_ASSETS || pageAssets();
    var fonts = Object.keys(A.fonts || {}).map(function (fam) {
      var ff = new FontFace(fam, 'url(' + A.fonts[fam] + ')', fam === 'Courier Prime' ? { weight: '700' } : {});
      document.fonts.add(ff); return ff.load();
    });
    readyP = Promise.all(fonts.concat([
      loadImg(A.masthead).then(function (i) { imgs.masthead = i; }),
      loadImg(A.sunburst).then(function (i) { imgs.sunburst = i; })
    ]));
    return readyP;
  }

  // Small seeded random, so a given card always looks the same.
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function spaced(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }
  function wrap(ctx, text, maxW) {
    var words = String(text).split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width <= maxW || !line) line = t; else { lines.push(line); line = w; }
    });
    if (line) lines.push(line);
    return lines;
  }
  // Largest size from max..min whose wrapped text fits maxW x maxH.
  function fit(ctx, text, font, maxW, maxH, lh, max, min, maxLines) {
    for (var s = max; s >= min; s -= 1) {
      ctx.font = font(s);
      var lines = wrap(ctx, text, maxW);
      if ((!maxLines || lines.length <= maxLines) && lines.length * s * lh <= maxH) return { size: s, lines: lines, h: lines.length * s * lh, ok: true };
    }
    ctx.font = font(min); var l = wrap(ctx, text, maxW);
    return { size: min, lines: l, h: l.length * min * lh };
  }
  function drawLines(ctx, f, x, y, lh, align) {
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    f.lines.forEach(function (l, i) { ctx.fillText(l, x, y + f.size * 0.86 + i * f.size * lh); });
  }
  function doubleRule(ctx, x, y, w, color) {
    ctx.fillStyle = color || C.navy; ctx.fillRect(x, y, w, 4); ctx.fillRect(x, y + 9, w, 1.5);
  }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // The verdict as the show's rubber stamp, drawn off-screen and worn a little.
  function stampCanvas(verdict, size, maxW, seed) {
    var color = STAMP[verdict] || C.navy, c = document.createElement('canvas'), x = c.getContext('2d');
    x.font = F.stamp(size); spaced(x, size * 0.08);
    var words = verdict.split(' '), lines = [verdict];
    if (x.measureText(verdict).width > maxW && words.length > 1) lines = [words.slice(0, -1).join(' '), words[words.length - 1]];
    var tw = Math.max.apply(null, lines.map(function (l) { return x.measureText(l).width; }));
    var padX = size * 0.45, padY = size * 0.3, lh = size * 1.08;
    var w = Math.ceil(tw + padX * 2), h = Math.ceil(lines.length * lh + padY * 2);
    c.width = w + 20; c.height = h + 20;
    x = c.getContext('2d'); x.translate(10, 10);
    x.fillStyle = C.creamLight; rrect(x, 0, 0, w, h, size * 0.14); x.fill();
    x.strokeStyle = color; x.lineWidth = size * 0.085; rrect(x, x.lineWidth / 2, x.lineWidth / 2, w - x.lineWidth, h - x.lineWidth, size * 0.12); x.stroke();
    x.lineWidth = size * 0.03; var ins = size * 0.16; rrect(x, ins, ins, w - ins * 2, h - ins * 2, size * 0.08); x.stroke();
    x.fillStyle = color; x.font = F.stamp(size); spaced(x, size * 0.08); x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    lines.forEach(function (l, i) { x.fillText(l, w / 2 + size * 0.04, padY + size * 0.93 + i * lh); });
    // Ink wear: knock out a few specks and a faint uneven edge.
    var r = rng(seed); x.globalCompositeOperation = 'destination-out';
    for (var i = 0; i < 260; i++) { x.globalAlpha = 0.25 + r() * 0.6; x.beginPath(); x.arc(r() * w, r() * h, r() * size * 0.045 + 0.6, 0, 6.3); x.fill(); }
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    return c;
  }

  function paper(ctx, W, H, seed) {
    ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
    var g = ctx.createRadialGradient(W / 2, -H * 0.1, 0, W / 2, -H * 0.1, H * 0.9);
    g.addColorStop(0, 'rgba(251,243,223,0.95)'); g.addColorStop(1, 'rgba(251,243,223,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
    v.addColorStop(0, 'rgba(107,58,30,0)'); v.addColorStop(1, 'rgba(107,58,30,0.13)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    var r = rng(seed);
    for (var i = 0; i < 9000; i++) { ctx.fillStyle = r() > 0.5 ? 'rgba(20,33,61,0.035)' : 'rgba(255,255,255,0.08)'; ctx.fillRect(r() * W, r() * H, 1 + r() * 1.6, 1 + r() * 1.6); }
  }

  function domain(u) { try { return new URL(u).hostname.replace(/^www\./, '').replace(/^web\.archive\.org$/, 'archive.org'); } catch (e) { return ''; } }

  /* p: one prediction. o: { format: 'post'|'story', year: the reader's year,
     now: the year it is checked in }. */
  function render(p, o) {
    o = o || {};
    return ready().then(function () {
      var story = o.format === 'story', W = 1080, H = story ? 1920 : 1350, M = 60, CW = W - M * 2;
      var userYear = o.year || p.year, now = o.now || new Date().getFullYear();
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var ctx = cv.getContext('2d'), seed = hash(p.id + userYear);
      paper(ctx, W, H, seed);
      var y = story ? 70 : 44;

      // Dateline
      ctx.fillStyle = C.navy; ctx.font = F.type(story ? 24 : 21); spaced(ctx, 4); ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left'; ctx.fillText('THE ' + userYear + ' EDITION', M, y + 20);
      ctx.textAlign = 'right'; ctx.fillText('CHECKED IN ' + now, W - M, y + 20);
      ctx.textAlign = 'center'; ctx.fillStyle = C.coralInk; ctx.fillText('\u2726', W / 2, y + 20);
      y += 36; doubleRule(ctx, M, y, CW);
      // Masthead, with the faint brass sunburst behind it
      y += 26;
      var mw = story ? 700 : 560, mh = mw * imgs.masthead.height / imgs.masthead.width;
      ctx.save(); ctx.globalAlpha = 0.22; var sb = mw * 1.25; ctx.drawImage(imgs.sunburst, W / 2 - sb / 2, y + mh / 2 - sb / 2, sb, sb); ctx.restore();
      ctx.drawImage(imgs.masthead, W / 2 - mw / 2, y, mw, mh);
      y += mh + 18; doubleRule(ctx, M, y, CW);
      // Edition band
      y += 24; var bh = story ? 62 : 52;
      ctx.fillStyle = C.navy; ctx.fillRect(M, y, CW, bh);
      ctx.fillStyle = C.brass; ctx.fillRect(M, y + bh + 4, CW, 3);
      ctx.fillStyle = C.creamLight; ctx.font = F.type(story ? 27 : 23); spaced(ctx, 5); ctx.textAlign = 'center';
      ctx.fillText('\u2605  YOUR BIRTH-YEAR FRONT PAGE  \u2605', W / 2, y + bh * 0.66);
      y += bh + (story ? 46 : 32);

      // Kicker
      ctx.fillStyle = C.coralInk; ctx.font = F.type(story ? 27 : 22); spaced(ctx, 4);
      var kick = 'THE FUTURE, AS PROMISED IN ' + p.year;
      ctx.fillText(kick, W / 2, y + 18);
      if (p.year !== userYear) { ctx.fillStyle = C.teal; ctx.font = F.type(story ? 20 : 17); spaced(ctx, 3); ctx.fillText('(THE NEAREST PROMISE ON FILE TO ' + userYear + ')', W / 2, y + (story ? 50 : 42)); y += story ? 34 : 28; }
      y += story ? 40 : 30;

      // Fit the story into the page: try generous sizes first, then squeeze
      // headline, deck, quote and "what happened" together until it all fits.
      var footH = story ? 330 : 108, top = y, L;
      var qx = M + 4, qw = CW - 12, pad = story ? 44 : 34, head = pad - 4 + (story ? 40 : 32);
      var colW = story ? CW - 390 : 560, hx = M;
      // The stamp: as big as fits the right-hand column once tilted 7 degrees.
      var stampCol = W - M - (hx + colW) - 24, sSize = story ? 84 : 68, sc, sbw, sbh;
      for (; sSize >= 40; sSize -= 2) {
        sc = stampCanvas(p.verdict, sSize, stampCol * 0.9, seed);
        sbw = sc.width * 0.9925 + sc.height * 0.1219; sbh = sc.width * 0.1219 + sc.height * 0.9925;
        if (sbw <= stampCol) break;
      }
      var who = '\u2014 ' + p.who + ', ' + p.where + ', ' + p.when;
      var qtext = p.quote_kind === 'paraphrase' ? p.quote : '\u201C' + p.quote.replace(/\.\.\./g, '\u2026') + '\u201D';
      var qfont = function (s) { return F.body(s, p.quote_kind === 'paraphrase'); };
      for (var k = 0; k < 10; k++) {
        var sq = 1 - k * 0.07; L = { k: k };
        spaced(ctx, 1);
        L.hl = fit(ctx, p.headline, F.display, CW, (story ? 300 : 236) * sq, 1.08, Math.round((story ? 92 : 76) * sq), 40, 3);
        spaced(ctx, 0);
        L.dk = fit(ctx, p.deck, function (s) { return F.body(s, true); }, CW - 60, (story ? 100 : 76) * Math.max(sq, .8), 1.25, Math.round((story ? 34 : 28) * Math.max(sq, .8)), 20, 2);
        L.gap = story ? 40 : 24;
        L.hf = fit(ctx, p.happened, F.body, colW, 999, 1.3, Math.round((story ? 32 : 26) * Math.max(sq, .82)), 15);
        L.rowH = Math.max(36 + sbh + 6, 42 + L.hf.h + (story ? 64 : 50));
        spaced(ctx, 1);
        L.wl = fit(ctx, who, F.type, qw - pad * 2, story ? 90 : 64, 1.3, story ? 21 : 18, 13, 3);
        spaced(ctx, 0);
        L.qTop = top + L.hl.h + (story ? 22 : 12) + L.dk.h + (story ? 34 : 22);
        var avail = H - footH - L.gap - L.qTop, qmax = avail - L.rowH - L.gap;
        var qMin = Math.max(story ? 26 : 20, Math.round(L.hf.size * 0.9));
        L.qf = fit(ctx, qtext, qfont, qw - pad * 2, qmax - head - L.wl.h - pad - 14 - (story ? 24 : 12), 1.32, Math.max(qMin, Math.min(story ? 44 : 36, Math.round(L.hl.size * 0.72))), qMin);
        L.qh = Math.max(story ? 260 : 200, head + L.qf.h + L.wl.h + pad + 14 + (story ? 24 : 12));
        L.spare = avail - L.qh - L.gap - L.rowH;
        if (L.qf.ok && L.spare >= 0) break;
      }
      // Headline
      ctx.fillStyle = C.navy; spaced(ctx, 1);
      ctx.font = F.display(L.hl.size); drawLines(ctx, L.hl, W / 2, y, 1.08, 'center'); y += L.hl.h + (story ? 22 : 12);
      // Deck
      spaced(ctx, 0);
      ctx.font = F.body(L.dk.size, true); drawLines(ctx, L.dk, W / 2, y, 1.25, 'center'); y += L.dk.h + (story ? 34 : 22);
      var spare = Math.max(0, L.spare), gap = L.gap, hf = L.hf, wl = L.wl, qf = L.qf, qh = L.qh, rowH = L.rowH;
      var extra = Math.round(spare / 3); y += extra; gap += extra;
      // Quote box
      ctx.fillStyle = C.navy; ctx.fillRect(qx + 9, y + 9, qw, qh);
      ctx.fillStyle = C.creamLight; ctx.fillRect(qx, y, qw, qh);
      ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.strokeRect(qx, y, qw, qh);
      ctx.strokeStyle = C.brass; ctx.lineWidth = 1.5; ctx.strokeRect(qx + 9, y + 9, qw - 18, qh - 18);
      var iy = y + pad - 4;
      ctx.fillStyle = C.teal; ctx.font = F.type(story ? 22 : 19); spaced(ctx, 4); ctx.textAlign = 'left';
      ctx.fillText(p.quote_kind === 'paraphrase' ? 'THE PROMISE (IN OUR WORDS)' : 'THE PROMISE', qx + pad, iy + 16);
      iy += story ? 40 : 32;
      ctx.fillStyle = C.navy; spaced(ctx, 0);
      ctx.font = F.body(qf.size, p.quote_kind === 'paraphrase'); drawLines(ctx, qf, qx + pad, iy, 1.32, 'left');
      ctx.font = F.type(wl.size); spaced(ctx, 1);
      drawLines(ctx, wl, qx + pad, y + qh - pad - wl.h + 6, 1.3, 'left');
      y += qh + gap;

      // What happened + the stamp
      ctx.fillStyle = C.coralInk; ctx.font = F.type(story ? 22 : 19); spaced(ctx, 4); ctx.textAlign = 'left';
      ctx.fillText('WHAT ACTUALLY HAPPENED', hx, y + 16);
      ctx.fillStyle = C.brass; ctx.fillRect(hx, y + 26, story ? 360 : 330, 3);
      ctx.fillStyle = C.navy; spaced(ctx, 0);
      ctx.font = F.body(hf.size); drawLines(ctx, hf, hx, y + 42, 1.3, 'left');
      ctx.fillStyle = C.teal; ctx.font = F.type(story ? 20 : 17); spaced(ctx, 3);
      var later = now - p.year;
      ctx.fillText('CHECKED ' + now + ': ' + later + ' YEARS LATER', hx, y + 42 + hf.h + (story ? 40 : 30));
      window.TGCard.last = { quoteSize: qf.size, happenedSize: hf.size, headlineSize: L.hl.size, squeeze: L.k, fits: !!(qf.ok && L.spare >= 0), overflow: Math.round((y + rowH) - (H - footH)) };
      // Stamp, with its label lined up with "What actually happened"
      var scx = W - M - stampCol / 2, scy = y + 36 + sbh / 2;
      ctx.fillStyle = C.navy; ctx.font = F.type(story ? 21 : 18); spaced(ctx, 4); ctx.textAlign = 'center';
      ctx.fillText("DOT'S VERDICT", scx, y + 16);
      ctx.save(); ctx.translate(scx, scy);
      ctx.rotate(-7 * Math.PI / 180); ctx.shadowColor = 'rgba(20,33,61,.25)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
      ctx.drawImage(sc, -sc.width / 2, -sc.height / 2); ctx.restore();

      // Footer
      var fy = H - footH + (story ? 0 : 6);
      doubleRule(ctx, M, fy, CW);
      ctx.textAlign = 'center'; ctx.fillStyle = C.navy;
      var doms = []; (p.quote_sources || []).concat(p.happened_sources || []).forEach(function (s) { var d = domain(s.url); if (d && doms.indexOf(d) < 0) doms.push(d); });
      ctx.font = F.type(story ? 19 : 15); spaced(ctx, 2);
      var srcLine = fit(ctx, 'SOURCES: ' + doms.slice(0, 4).join(' \u00B7 ').toUpperCase(), F.type, CW, 44, 1.3, story ? 19 : 15, 11, 2);
      ctx.font = F.type(srcLine.size); drawLines(ctx, srcLine, W / 2, fy + 22, 1.3, 'center');
      var ly = fy + 26 + srcLine.h + (story ? 18 : 8);
      ctx.fillStyle = C.brassInk; var bs = story ? 19 : 15; ctx.font = F.type(bs); spaced(ctx, 3);
      while (bs > 11 && ctx.measureText('THE FUTURE, ACCORDING TO THE PAST \u00B7 MADE WITH AI \u00B7 FACTS REAL AND SOURCED').width > CW) { bs -= 1; ctx.font = F.type(bs); }
      ctx.fillText('THE FUTURE, ACCORDING TO THE PAST \u00B7 MADE WITH AI \u00B7 FACTS REAL AND SOURCED', W / 2, ly + 14);
      if (story) {
        var cy = H - 178;
        ctx.fillStyle = C.navy; ctx.fillRect(M, cy, CW, 130);
        ctx.fillStyle = C.brass; ctx.fillRect(M + 10, cy + 10, CW - 20, 2); ctx.fillRect(M + 10, cy + 118, CW - 20, 2);
        ctx.fillStyle = C.creamLight; ctx.font = F.display(40); spaced(ctx, 1);
        ctx.fillText('What did the future promise', W / 2, cy + 56);
        ctx.fillText('the year YOU were born?', W / 2, cy + 104);
      }
      return cv;
    });
  }

  function toBlob(cv) { return new Promise(function (res) { cv.toBlob(res, 'image/png'); }); }
  window.TGCard = { ready: ready, render: render, toBlob: toBlob, colors: C };
})();
