/* Letreiro de palhetas (split-flap) atrás de "Navegar por categoria".
   A cada ciclo sorteia P(A), P(B) e uma interseção possível, e mostra as
   probabilidades derivadas — união, condicional, complementar — virando só as
   palhetas que mudaram. Recuperado da versão de maio/2026 (commit 0dcd3f6),
   que foi revertida por deixar a página lenta: lá eram 287 palhetas no DOM,
   recriadas a cada virada. Aqui é um canvas só, redesenhado apenas nas
   palhetas que estão virando, e parado entre um ciclo e outro.
   Com prefers-reduced-motion, mostra um cenário parado. Fora da tela ou com a
   aba escondida, não sorteia. */
(function () {
  var canvas = document.querySelector('.tags-board');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var section = canvas.parentElement;

  var COLS = 41;
  var ROWS = 7;
  var CYCLE_MS = 3600;
  var HALF_MS = 230;       // cada metade da virada
  var CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.:-=+()%|/^∩∪';
  var en = canvas.dataset.lang === 'en';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LAYOUT = [
    { row: 0, label: en ? 'PROBABILITY' : 'PROBABILIDADE', labelCol: 3,
      value: en ? 'CATEGORIES' : 'CATEGORIAS', valueCol: 25, tone: 'title' },
    { row: 1, key: 'pA',     label: 'P(A)',   labelCol: 5, valueCol: 23 },
    { row: 2, key: 'pB',     label: 'P(B)',   labelCol: 5, valueCol: 23 },
    { row: 3, key: 'pAB',    label: 'P(A∩B)', labelCol: 5, valueCol: 23 },
    { row: 4, key: 'pUnion', label: 'P(A∪B)', labelCol: 5, valueCol: 23 },
    { row: 5, key: 'pAgB',   label: 'P(A|B)', labelCol: 5, valueCol: 23 },
    { row: 6, key: 'pAc',    label: 'P(A^C)', labelCol: 5, valueCol: 23 }
  ];
  var VALUE_W = 15;

  function between(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  function fmt(p) {
    var s = p.toFixed(3) + ' ' + (p * 100).toFixed(1) + '%';
    return en ? s : s.replace(/\./g, ',');
  }

  function scenario() {
    var pA = between(0.26, 0.88);
    var pB = between(0.22, 0.82);
    // A interseção tem de caber: max(0, pA + pB − 1) ≤ P(A∩B) ≤ min(pA, pB).
    var lo = Math.max(0.02, pA + pB - 1);
    var hi = Math.max(lo + 0.01, Math.min(pA, pB) - 0.025);
    var pAB = Math.min(between(lo, hi), Math.min(pA, pB));
    return {
      pA: fmt(pA), pB: fmt(pB), pAB: fmt(pAB),
      pUnion: fmt(pA + pB - pAB), pAgB: fmt(pAB / pB), pAc: fmt(1 - pA)
    };
  }

  /* ---------------------------------------------------------------- estado */

  // Cada célula: o caractere mostrado (cur), o próximo (next) e quando a
  // virada começa (start, em ms do performance.now; null se parada).
  var cells = [];
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      cells.push({ r: r, c: c, cur: ' ', next: ' ', target: ' ', tone: '', start: null });
    }
  }
  function cell(r, c) { return cells[r * COLS + c]; }

  function write(row, col, text, width, tone) {
    Array.from(text.padEnd(width, ' ')).forEach(function (ch, i) {
      var k = cell(row, col + i);
      if (!k) return;
      k.target = ch;
      k.tone = tone;
    });
  }

  function writeTargets(s) {
    LAYOUT.forEach(function (it) {
      write(it.row, it.labelCol, it.label, it.label.length, it.tone || '');
      write(it.row, it.valueCol, it.key ? s[it.key] : it.value, VALUE_W, it.tone || 'value');
    });
  }

  /* ---------------------------------------------------------------- geometria e cores */

  var G = {}, C = {};

  function readColors() {
    var cs = getComputedStyle(section);
    var v = function (n) { return cs.getPropertyValue(n).trim(); };
    C.bg = v('--paper'); C.bg2 = v('--paper-alt');
    C.line = v('--line'); C.faint = v('--ink-faint');
    C.soft = v('--ink-soft'); C.ink = v('--ink');
    C.font = v('--font-mono') || 'monospace';
  }

  // Os mesmos tamanhos da versão original, em px.
  function layout() {
    var vw = window.innerWidth / 100;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = section.clientWidth, h = section.clientHeight;
    G.w = w;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var scale = 1.08;
    G.fw = clamp(2.1 * vw, 18, 44) * scale;
    G.fh = clamp(2.85 * vw, 30, 58) * scale;
    G.gx = clamp(0.18 * vw, 2, 3) * scale;
    G.gy = clamp(0.85 * vw, 7, 12) * scale;
    G.font = clamp(1.68 * vw, 15, 34) * scale;
    var bw = COLS * G.fw + (COLS - 1) * G.gx;
    var bh = ROWS * G.fh + (ROWS - 1) * G.gy;
    G.x0 = (w - bw) / 2;
    G.y0 = (h - bh) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 ' + G.font + 'px ' + C.font;
  }

  /* ---------------------------------------------------------------- desenho */

  function inkFor(k) {
    return k.tone === 'title' ? C.ink : k.tone === 'value' ? C.soft : C.faint;
  }

  // Desenha a metade de cima ou de baixo de uma palheta com o caractere ch,
  // achatada verticalmente pelo fator sy (1 = aberta, 0 = de perfil) em torno
  // da dobra. shade escurece a metade enquanto ela gira.
  function drawHalf(x, y, k, ch, top, sy, shade) {
    var mid = y + G.fh / 2;
    var hh = G.fh / 2;
    ctx.save();
    ctx.beginPath();
    if (top) ctx.rect(x, mid - hh * sy, G.fw, hh * sy);
    else ctx.rect(x, mid, G.fw, hh * sy);
    ctx.clip();
    ctx.translate(0, mid);
    ctx.scale(1, sy || 0.0001);
    ctx.translate(0, -mid);
    ctx.fillStyle = top ? C.bg : C.bg2;
    ctx.fillRect(x, top ? y : mid, G.fw, hh);
    if (ch !== ' ') {
      ctx.fillStyle = inkFor(k);
      ctx.fillText(ch, x + G.fw / 2, mid + G.font * 0.04);
    }
    if (shade > 0) {
      ctx.globalAlpha = shade;
      ctx.fillStyle = C.faint;
      ctx.fillRect(x, top ? y : mid, G.fw, hh);
    }
    ctx.restore();
  }

  function drawCell(k, now) {
    var x = G.x0 + k.c * (G.fw + G.gx);
    var y = G.y0 + k.r * (G.fh + G.gy);
    if (x + G.fw < 0 || x > G.w) return;
    ctx.clearRect(x - 1, y - 1, G.fw + 2, G.fh + 2);

    if (k.start === null || now < k.start) {
      drawHalf(x, y, k, k.cur, true, 1, 0);
      drawHalf(x, y, k, k.cur, false, 1, 0);
    } else {
      var t = (now - k.start) / HALF_MS;
      // Atrás: em cima já o próximo, embaixo ainda o atual.
      drawHalf(x, y, k, k.next, true, 1, 0);
      drawHalf(x, y, k, t < 1 ? k.cur : k.next, false, 1, 0);
      if (t < 1) {
        var e = t * t;                       // ease-in: a metade de cima cai
        drawHalf(x, y, k, k.cur, true, 1 - e, 0.25 * e);
      } else if (t < 2) {
        var u = 1 - (1 - (t - 1)) * (1 - (t - 1));  // ease-out: a de baixo assenta
        drawHalf(x, y, k, k.next, false, u, 0.25 * (1 - u));
      }
    }

    // Borda e dobra.
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x + 0.5, y + 0.5, G.fw - 1, G.fh - 1, 4);
    else ctx.rect(x + 0.5, y + 0.5, G.fw - 1, G.fh - 1);
    ctx.moveTo(x, y + G.fh / 2);
    ctx.lineTo(x + G.fw, y + G.fh / 2);
    ctx.stroke();
  }

  function drawAll() {
    var now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cells.forEach(function (k) { drawCell(k, now); });
  }

  /* ---------------------------------------------------------------- animação */

  var active = [];   // células com virada pendente ou em curso
  var raf = 0;

  function flip(k, next, delay) {
    if (k.start !== null) { k.cur = k.next; }   // termina a virada anterior
    if (k.cur === next) { k.start = null; return; }
    k.next = next;
    k.start = performance.now() + delay;
    if (active.indexOf(k) < 0) active.push(k);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick(now) {
    raf = 0;
    active = active.filter(function (k) {
      if (now < k.start) return true;
      var done = now - k.start >= 2 * HALF_MS;
      if (done) { k.cur = k.next; k.start = null; }
      drawCell(k, now);
      return !done;
    });
    if (active.length) raf = requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------- início */

  readColors();
  layout();
  writeTargets(scenario());

  if (still) {
    cells.forEach(function (k) { k.cur = k.target; });
    drawAll();
  } else {
    // Entrada: as letras partem de caracteres aleatórios e viram até o alvo.
    cells.forEach(function (k, i) {
      if (k.target === ' ') return;
      k.cur = CHARS[Math.floor(Math.random() * CHARS.length)];
      flip(k, k.target, 120 + i * 6 + Math.random() * 210);
    });
    drawAll();
  }

  var visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(section);
  }

  if (!still) {
    setInterval(function () {
      if (!visible || document.hidden) return;
      writeTargets(scenario());
      cells.forEach(function (k, i) {
        if (k.target !== (k.start !== null ? k.next : k.cur)) flip(k, k.target, i * 4 + Math.random() * 110);
      });
    }, CYCLE_MS);
  }

  // Redimensionar ou trocar o tema redesenha tudo de uma vez.
  var pending = 0;
  function redraw() {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(function () { readColors(); layout(); drawAll(); });
  }
  if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(section);
  else window.addEventListener('resize', redraw);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw);
})();
