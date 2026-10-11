/* Tábua de Galton do hero da home.
   Cada bolinha entra pelo funil, passa por ROWS fileiras de pinos e, em cada
   uma, desvia para a esquerda ou para a direita com probabilidade 1/2. A
   canaleta em que cai é o número de desvios à direita: uma Binomial(ROWS, 1/2).
   As bolinhas se empilham de verdade, então o histograma é a própria pilha; a
   curva por cima é a normal de mesma média e variância, na altura que as
   pilhas devem atingir no fim do ciclo.
   Com prefers-reduced-motion, desenha só o resultado esperado, parado. */
(function () {
  var fig = document.querySelector('.galton');
  if (!fig) return;
  var canvas = fig.querySelector('.galton__canvas');
  var countEl = fig.querySelector('.galton__count');
  var ctx = canvas.getContext('2d');

  var ROWS = 12;
  var BINS = ROWS + 1;
  var PER_ROW = 4;        // bolinhas lado a lado dentro de uma canaleta
  var SPAWN_MS = 40;      // intervalo entre bolinhas
  var STEP_MS = 85;       // tempo de um pino ao seguinte
  var HOLD_MS = 2800;     // pausa com as pilhas completas
  var FADE_MS = 700;      // as pilhas somem aos poucos antes de recomeçar
  var FLASH_MS = 160;     // brilho do pino depois de tocado

  var mean = ROWS / 2, sd = Math.sqrt(ROWS) / 2;
  var SQRT2PI = Math.sqrt(2 * Math.PI);
  // P(canaleta central) = C(ROWS, ROWS/2) / 2^ROWS.
  var P_MID = 1;
  for (var u = 1; u <= ROWS / 2; u++) P_MID = P_MID * (ROWS / 2 + u) / u;
  P_MID /= Math.pow(2, ROWS);

  var styles = getComputedStyle(document.documentElement);
  function token(name) { return styles.getPropertyValue(name).trim(); }
  var C = {
    ball: token('--galton-ball'),
    peg: token('--galton-peg'),
    pegHit: token('--galton-peg-hit'),
    wall: token('--galton-wall'),
    stack: token('--galton-bar'),
    curve: token('--galton-curve')
  };

  // Geometria, recalculada em layout().
  var W, H, dpr, cx, dx, dy, r, pegR, rowH, pegTop, binTop, binBottom, capRows, g;
  // Sprites das bolinhas e dos pinos, refeitos em layout().
  var S = {};
  // Camada com as bolinhas já assentadas: desenhada uma vez, copiada a cada quadro.
  var layer = document.createElement('canvas');
  var lctx = layer.getContext('2d');

  var N, balls, settled, reserved, pegHit, spawned, lastSpawn, doneAt, fadeAt;
  var running = false, raf = 0;

  function layout() {
    dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    if (!rect.width) return false;
    W = rect.width; H = rect.height;
    canvas.width = layer.width = Math.round(W * dpr);
    canvas.height = layer.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cx = W / 2;
    dx = (W - 12) / BINS;
    r = (dx / PER_ROW) * 0.47;
    rowH = r * 2;
    pegR = Math.max(2, r * 0.7);
    binBottom = H - 1;
    binTop = H * 0.6;
    pegTop = H * 0.1;
    dy = (binTop - pegTop) / ROWS;
    capRows = Math.floor((binBottom - binTop) / rowH);
    // Gravidade que leva uma bolinha parada um pino abaixo em STEP_MS.
    g = 2 * dy / (STEP_MS * STEP_MS);

    S.ball = sprite(C.ball, r, r * 1.6);
    S.stack = sprite(C.stack, r, 0);
    S.peg = sprite(C.peg, pegR, 0);
    S.pegHit = sprite(C.pegHit, pegR * 1.2, pegR * 2);
    return true;
  }

  // Bolinha com volume (luz de cima à esquerda, sombra na borda) e, se glow,
  // um halo da própria cor. Desenhada uma vez por tamanho; cada quadro só
  // copia o bitmap, que é bem mais barato que shadowBlur por bolinha.
  function sprite(color, rad, glow) {
    var half = rad + glow + 1;
    var size = Math.ceil(half * 2 * dpr);
    var body = document.createElement('canvas');
    body.width = body.height = size;
    var b = body.getContext('2d');
    b.scale(dpr, dpr);
    b.fillStyle = color;
    dot(b, half, half, rad);
    b.globalCompositeOperation = 'source-atop';
    var hl = b.createRadialGradient(half - rad * 0.35, half - rad * 0.4, 0, half - rad * 0.35, half - rad * 0.4, rad);
    hl.addColorStop(0, 'rgba(255,255,255,0.65)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    b.fillStyle = hl;
    b.fillRect(0, 0, half * 2, half * 2);
    var sh = b.createRadialGradient(half, half, rad * 0.55, half, half, rad);
    sh.addColorStop(0, 'rgba(0,0,0,0)');
    sh.addColorStop(1, 'rgba(0,0,0,0.3)');
    b.fillStyle = sh;
    b.fillRect(0, 0, half * 2, half * 2);
    if (!glow) return { img: body, half: half };

    var out = document.createElement('canvas');
    out.width = out.height = size;
    var o = out.getContext('2d');
    o.shadowColor = color;
    o.shadowBlur = glow * dpr;
    o.drawImage(body, 0, 0);
    return { img: out, half: half };
  }

  function blit(c, s, x, y, scale) {
    var h = s.half * (scale || 1);
    c.drawImage(s.img, x - h, y - h, h * 2, h * 2);
  }

  // Quantas bolinhas cabem: a canaleta central, a mais cheia, recebe em média
  // mu = N·P_MID com desvio ~√mu. Escolhe N para que mu + 3√mu caiba nela —
  // a pilha quase nunca passa da borda.
  function fitN() {
    var cap = capRows * PER_ROW;
    var s = (-3 + Math.sqrt(9 + 4 * cap)) / 2;
    return Math.floor(s * s / P_MID);
  }

  function pegX(row, i) { return cx + (i - row / 2) * dx; }
  function pegY(row) { return pegTop + row * dy; }
  // Onde a bolinha encosta no pino i da fileira row.
  function contactY(row) { return pegY(row) - pegR - r; }
  function binX(k) { return cx + (k - mean) * dx; }

  function slotPos(k, i) {
    var row = Math.min(Math.floor(i / PER_ROW), capRows - 1);
    var col = i % PER_ROW;
    // Fileiras alternadas começam de lados opostos: a pilha cresce por igual.
    if (row % 2) col = PER_ROW - 1 - col;
    return {
      x: binX(k) + (col - (PER_ROW - 1) / 2) * rowH,
      y: binBottom - r - row * rowH
    };
  }

  function reset() {
    N = fitN();
    balls = [];
    settled = [];
    reserved = new Array(BINS).fill(0);
    pegHit = [];
    for (var j = 0; j < ROWS; j++) pegHit.push(new Array(j + 1).fill(-1e9));
    for (var k = 0; k < BINS; k++) settled.push([]);
    spawned = 0;
    lastSpawn = 0;
    doneAt = 0;
    fadeAt = 0;
    paintLayer();
  }

  function dot(c, x, y, rad) {
    c.beginPath();
    c.arc(x, y, rad, 0, Math.PI * 2);
    c.fill();
  }

  function paintLayer() {
    lctx.clearRect(0, 0, W, H);
    for (var k = 0; k < BINS; k++) {
      for (var i = 0; i < settled[k].length; i++) {
        var p = slotPos(k, settled[k][i]);
        blit(lctx, S.stack, p.x, p.y);
      }
    }
  }

  function settle(k, slot) {
    settled[k].push(slot);
    var p = slotPos(k, slot);
    blit(lctx, S.stack, p.x, p.y);
  }

  function drawFrame(now) {
    ctx.clearRect(0, 0, W, H);

    // Funil e paredes das canaletas.
    ctx.strokeStyle = C.wall;
    ctx.lineWidth = 1;
    ctx.beginPath();
    var mouth = r * 2.2, funnelY = pegTop - dy * 0.9;
    ctx.moveTo(cx - dx * 2.2, 0); ctx.lineTo(cx - mouth, funnelY);
    ctx.moveTo(cx + dx * 2.2, 0); ctx.lineTo(cx + mouth, funnelY);
    for (var b = 1; b < BINS; b++) {
      var wx = binX(b) - dx / 2;
      ctx.moveTo(wx, binTop); ctx.lineTo(wx, binBottom);
    }
    ctx.moveTo(binX(0) - dx / 2, binBottom); ctx.lineTo(binX(ROWS) + dx / 2, binBottom);
    ctx.stroke();

    // Pinos: acendem por um instante quando uma bolinha bate.
    for (var j = 0; j < ROWS; j++) {
      for (var i = 0; i <= j; i++) {
        var age = now - pegHit[j][i];
        if (age < FLASH_MS) {
          blit(ctx, S.pegHit, pegX(j, i), pegY(j), 1 + 0.15 * (1 - age / FLASH_MS));
        } else {
          blit(ctx, S.peg, pegX(j, i), pegY(j));
        }
      }
    }

    // Pilhas assentadas.
    if (fadeAt) ctx.globalAlpha = Math.max(0, 1 - (now - fadeAt) / FADE_MS);
    ctx.drawImage(layer, 0, 0, W, H);
    ctx.globalAlpha = 1;

    // Curva: a altura que cada pilha deve atingir com N bolinhas, com um
    // véu claro por baixo.
    ctx.save();
    ctx.beginPath();
    for (var s = 0; s <= 160; s++) {
      var kk = -0.5 + (BINS * s) / 160;
      var z = (kk - mean) / sd;
      var count = N * Math.exp(-z * z / 2) / (sd * SQRT2PI);
      var y = binBottom - (count / PER_ROW) * rowH;
      var x = cx + (kk - mean) * dx;
      if (s) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = ctx.fillStyle = C.curve;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.shadowColor = C.curve;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineTo(binX(ROWS) + dx / 2, binBottom);
    ctx.lineTo(binX(0) - dx / 2, binBottom);
    ctx.globalAlpha = 0.07;
    ctx.fill();
    ctx.restore();

    // Bolinhas em voo, com um leve brilho.
    for (var q = 0; q < balls.length; q++) blit(ctx, S.ball, balls[q].x, balls[q].y);

    var n = 0;
    for (var m = 0; m < BINS; m++) n += settled[m].length;
    countEl.textContent = 'n = ' + n;
  }

  // Avança uma bolinha até `now`, trocando de fase quantas vezes precisar.
  function advance(b, now) {
    for (;;) {
      var t = (now - b.t0) / b.dur;
      if (t < 1) { place(b, t); return true; }
      b.t0 += b.dur;
      if (b.phase === 'drop') {
        b.phase = 'peg'; b.row = 0; b.rights = 0;
        hit(b, b.t0);
      } else if (b.phase === 'peg') {
        b.rights += b.next;
        b.row++;
        if (b.row < ROWS) {
          hit(b, b.t0);
        } else {
          b.phase = 'fall';
          b.k = b.rights;
          b.slot = reserved[b.k]++;
          var p = slotPos(b.k, b.slot);
          b.x0 = binX(b.k); b.y0 = contactY(ROWS);
          b.x1 = p.x; b.y1 = p.y;
          b.dur = Math.sqrt(2 * Math.max(b.y1 - b.y0, 1) / g);
        }
      } else {
        settle(b.k, b.slot);
        return false;
      }
    }
  }

  function hit(b, when) {
    pegHit[b.row][b.rights] = when;
    b.next = Math.random() < 0.5 ? 0 : 1;
    b.dur = STEP_MS;
  }

  function place(b, t) {
    if (b.phase === 'drop') {
      b.x = cx;
      b.y = -r + (contactY(0) + r) * t * t;
    } else if (b.phase === 'peg') {
      var x0 = pegX(b.row, b.rights);
      var x1 = pegX(b.row + 1, b.rights + b.next);
      var y0 = contactY(b.row), y1 = contactY(b.row + 1);
      // Quica para cima e cai sob gravidade: parábola com o pico no começo.
      b.x = x0 + (x1 - x0) * t;
      b.y = y0 + (y1 - y0) * t * t - dy * 0.45 * t * (1 - t);
    } else {
      // Queda livre até a vaga na pilha; o desvio lateral acaba antes.
      var tx = Math.min(1, t * 1.6);
      b.x = b.x0 + (b.x1 - b.x0) * (1 - (1 - tx) * (1 - tx));
      b.y = b.y0 + (b.y1 - b.y0) * t * t;
    }
  }

  function tick(now) {
    if (!running) return;
    if (!lastSpawn) lastSpawn = now - SPAWN_MS;

    while (!fadeAt && spawned < N && now - lastSpawn >= SPAWN_MS) {
      lastSpawn += SPAWN_MS;
      balls.push({ phase: 'drop', t0: lastSpawn, dur: STEP_MS * 1.6, x: cx, y: -r });
      spawned++;
    }

    for (var i = balls.length - 1; i >= 0; i--) {
      if (!advance(balls[i], now)) balls.splice(i, 1);
    }

    if (spawned >= N && !balls.length) {
      if (!doneAt) doneAt = now;
      else if (!fadeAt && now - doneAt > HOLD_MS) fadeAt = now;
      else if (fadeAt && now - fadeAt > FADE_MS) reset();
    }

    drawFrame(now);
    raf = requestAnimationFrame(tick);
  }

  var pausedAt = 0;
  function start() {
    if (running) return;
    running = true;
    // Desloca todos os relógios pelo tempo em pausa: a cena continua de onde
    // parou, sem bolinhas saltando nem pinos acesos.
    if (pausedAt) {
      var gap = performance.now() - pausedAt;
      balls.forEach(function (b) { b.t0 += gap; });
      if (lastSpawn) lastSpawn += gap;
      if (doneAt) doneAt += gap;
      if (fadeAt) fadeAt += gap;
    }
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) return;
    running = false;
    pausedAt = performance.now();
    cancelAnimationFrame(raf);
  }

  function drawStatic() {
    // Contagens esperadas, arredondadas, já empilhadas.
    var c = 1;
    for (var k = 0; k < BINS; k++) {
      var e = Math.round(N * c / Math.pow(2, ROWS));
      for (var i = 0; i < e; i++) settled[k].push(i);
      c = c * (ROWS - k) / (k + 1);
    }
    paintLayer();
    drawFrame(performance.now());
  }

  if (!layout()) return;   // painel escondido (celular): nada a fazer
  reset();

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawStatic();
    return;
  }

  var visible = true;
  function sync() { if (visible && !document.hidden) start(); else stop(); }

  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(canvas);
  document.addEventListener('visibilitychange', sync);

  window.addEventListener('resize', function () {
    if (!layout()) return;
    // Se a canaleta mudou de altura, o N antigo pode não caber: recomeça.
    if (fitN() !== N) reset(); else paintLayer();
    if (!running) drawFrame(performance.now());
  });
})();
