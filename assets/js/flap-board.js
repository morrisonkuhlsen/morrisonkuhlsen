/* Motor do letreiro de palhetas (split-flap), desenhado num canvas só.
   Usado na home (tags-board.js) e no índice da Matemática Elementar.

   FlapBoard(canvas, opts) com:
     cols, rows     tamanho da grade
     host           elemento que dá o tamanho e de onde se leem as cores
     colors         nomes das variáveis CSS: { bg, bg2, line, faint, soft, ink, font }
     size(w, h, vw) devolve { fw, fh, gx, gy, font } em px
     frame()        devolve o próximo conteúdo: [[linha, coluna, texto, largura, tom], ...]
                    com tom '' (rótulo), 'value' ou 'title'
     cycle          ms entre um conteúdo e o próximo

   Devolve { refresh() }, que pede um frame() novo na hora.

   Redesenha só as palhetas que estão virando e fica parado entre um ciclo e
   outro. Com prefers-reduced-motion, mostra um conteúdo parado. Fora da tela
   ou com a aba escondida, não troca. A versão anterior, com 287 palhetas no
   DOM recriadas a cada virada, deixava a página lenta (revertida em 56d1937). */
window.FlapBoard = function (canvas, o) {
  var ctx = canvas.getContext('2d');
  var host = o.host || canvas.parentElement;
  var COLS = o.cols, ROWS = o.rows;
  var CYCLE_MS = o.cycle || 3600;
  var HALF_MS = 230;       // cada metade da virada
  var CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.:-=+()%|/^';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- estado */

  // Cada célula: o caractere mostrado (cur), o próximo (next) e quando a
  // virada começa (start, em ms do performance.now; null se parada).
  var cells = [];
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      cells.push({ r: r, c: c, cur: ' ', next: ' ', target: ' ', tone: '', start: null });
    }
  }

  function writeTargets() {
    cells.forEach(function (k) { k.target = ' '; k.tone = ''; });
    o.frame().forEach(function (it) {
      Array.from(it[2].padEnd(it[3], ' ')).forEach(function (ch, i) {
        var k = cells[it[0] * COLS + it[1] + i];
        if (!k || it[1] + i >= COLS) return;
        k.target = ch;
        k.tone = it[4] || '';
      });
    });
  }

  /* ---------------------------------------------------------------- geometria e cores */

  var G = {}, C = {};

  function readColors() {
    var cs = getComputedStyle(host);
    Object.keys(o.colors).forEach(function (k) { C[k] = cs.getPropertyValue(o.colors[k]).trim(); });
    C.font = C.font || 'monospace';
  }

  function layout() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = host.clientWidth, h = host.clientHeight;
    G.w = w;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var s = o.size(w, h, window.innerWidth / 100);
    G.fw = s.fw; G.fh = s.fh; G.gx = s.gx; G.gy = s.gy; G.font = s.font;
    G.x0 = (w - (COLS * G.fw + (COLS - 1) * G.gx)) / 2;
    G.y0 = (h - (ROWS * G.fh + (ROWS - 1) * G.gy)) / 2;
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
    if (ctx.roundRect) ctx.roundRect(x + 0.5, y + 0.5, G.fw - 1, G.fh - 1, Math.min(4, G.fw / 6));
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
  writeTargets();

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
    }).observe(host);
  }

  // Troca o conteúdo agora, virando só as palhetas que mudam.
  function refresh(fast) {
    writeTargets();
    if (still) {
      cells.forEach(function (k) { k.cur = k.target; k.start = null; });
      drawAll();
      return;
    }
    cells.forEach(function (k, i) {
      if (k.target !== (k.start !== null ? k.next : k.cur)) {
        flip(k, k.target, fast ? i * 1.5 + Math.random() * 60 : i * 4 + Math.random() * 110);
      }
    });
  }

  var timer = 0;
  function restart() {
    clearInterval(timer);
    if (!still) timer = setInterval(function () {
      if (visible && !document.hidden) refresh(false);
    }, CYCLE_MS);
  }
  restart();

  // Redimensionar ou trocar o tema redesenha tudo de uma vez.
  var pending = 0;
  function redraw() {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(function () { readColors(); layout(); drawAll(); });
  }
  if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(host);
  else window.addEventListener('resize', redraw);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw);

  // refresh() troca o conteúdo na hora e recomeça a contagem do ciclo, para a
  // próxima troca automática não vir logo em seguida.
  return { refresh: function () { refresh(true); restart(); } };
};
