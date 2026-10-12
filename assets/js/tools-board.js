/* Letreiro do menu "Ferramentas" (motor em flap-board.js). Ao passar o
   cursor (ou o foco) num item, o letreiro vira para um exemplo daquela
   ferramenta: a tabela Z mostra um z e suas probabilidades, a do χ² um valor
   crítico, as fórmulas uma amostra com o seu intervalo de confiança...
   Enquanto o cursor fica no item, sorteia um exemplo novo a cada ciclo.
   As probabilidades e os quantis são calculados aqui, não tirados de tabela. */
(function () {
  var menu = document.getElementById('mm-tools');
  var canvas = menu && menu.querySelector('.tools-board');
  if (!canvas || !window.FlapBoard) return;
  var en = document.documentElement.lang === 'en';

  var COLS = 30, ROWS = 8;

  /* ---------------------------------------------------------------- distribuições */

  // ln Γ(x) pela aproximação de Lanczos (g = 7).
  var LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    var a = LG[0], t = x + 7.5;
    for (var i = 1; i < 9; i++) a += LG[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }

  // Beta incompleta regularizada I_x(a, b), por fração contínua.
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    d = 1 / d;
    var h = d;
    for (var m = 1; m <= 300; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d;
      var del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-12) break;
    }
    return h;
  }
  function ibeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }

  // Gama incompleta regularizada superior Q(a, x).
  function gammaQ(a, x) {
    if (x <= 0) return 1;
    var gln = lgamma(a);
    if (x < a + 1) {                     // série para P, e Q = 1 − P
      var ap = a, sum = 1 / a, del = sum;
      for (var n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; }
      return 1 - sum * Math.exp(-x + a * Math.log(x) - gln);
    }
    var b = x + 1 - a, c = 1e300, d = 1 / b, h = d;   // fração contínua para Q
    for (var i = 1; i < 500; i++) {
      var an = -i * (i - a);
      b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d;
      var del2 = d * c;
      h *= del2;
      if (Math.abs(del2 - 1) < 1e-14) break;
    }
    return Math.exp(-x + a * Math.log(x) - gln) * h;
  }

  // Φ(z) = 1 − Q(1/2, z²/2)/2 para z ≥ 0.
  function phi(z) { var q = gammaQ(0.5, z * z / 2) / 2; return z >= 0 ? 1 - q : q; }
  function dnorm(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
  function tUpper(t, df) { var p = ibeta(df / (df + t * t), df / 2, 0.5) / 2; return t >= 0 ? p : 1 - p; }
  function fUpper(f, d1, d2) { return ibeta(d2 / (d2 + d1 * f), d2 / 2, d1 / 2); }
  function chiUpper(c, df) { return gammaQ(df / 2, c / 2); }

  // Quantil por bisseção: o x em que a cauda superior vale p.
  function upperQuantile(upper, p, hi) {
    var lo = 0;
    while (upper(hi) > p) hi *= 2;
    for (var i = 0; i < 80; i++) {
      var mid = (lo + hi) / 2;
      if (upper(mid) > p) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /* ---------------------------------------------------------------- exemplos */

  function pick(xs) { return xs[Math.floor(Math.random() * xs.length)]; }
  function int(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function num(v, d) { var s = v.toFixed(d); return en ? s : s.replace('.', ','); }
  function gauss() { return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()); }
  function T(pt, e) { return en ? e : pt; }

  var BOARDS = {
    z: function () {
      var z = int(10, 300) / 100;
      return [T('TABELA NORMAL Z', 'STANDARD NORMAL'), [
        ['z', num(z, 2)],
        ['P(Z ≤ z)', num(phi(z), 4)],
        ['P(Z > z)', num(1 - phi(z), 4)],
        ['P(|Z| ≤ z)', num(2 * phi(z) - 1, 4)],
        [T('DENSIDADE', 'DENSITY'), num(dnorm(z), 4)]
      ]];
    },
    t: function () {
      var df = pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 60, 120]);
      var a = pick([0.10, 0.05, 0.02, 0.01]);
      var t = upperQuantile(function (x) { return tUpper(x, df); }, a / 2, 4);
      return [T('TABELA T DE STUDENT', "STUDENT'S T TABLE"), [
        [T('GL', 'DF'), String(df)],
        [T('α BILATERAL', 'TWO-TAILED α'), num(a, 2)],
        [T('t CRÍTICO', 'CRITICAL t'), num(t, 3)],
        ['P(T > t)', num(a / 2, 3)],
        ['P(|T| > t)', num(a, 2)]
      ]];
    },
    f: function () {
      var d1 = int(1, 10), d2 = pick([5, 6, 8, 10, 12, 15, 20, 30, 60]);
      var a = pick([0.10, 0.05, 0.01]);
      var f = upperQuantile(function (x) { return fUpper(x, d1, d2); }, a, 4);
      return [T('TABELA F DE SNEDECOR', 'SNEDECOR F TABLE'), [
        [T('GL NUMERADOR', 'NUMERATOR DF'), String(d1)],
        [T('GL DENOMIN.', 'DENOM. DF'), String(d2)],
        ['α', num(a, 2)],
        [T('F CRÍTICO', 'CRITICAL F'), num(f, 3)],
        ['P(F > f)', num(a, 2)]
      ]];
    },
    chi: function () {
      var df = int(1, 30), a = pick([0.10, 0.05, 0.025, 0.01]);
      var c = upperQuantile(function (x) { return chiUpper(x, df); }, a, df + 10);
      return [T('TABELA QUI-QUADRADO', 'CHI-SQUARE TABLE'), [
        [T('GL', 'DF'), String(df)],
        ['α', num(a, 3)],
        [T('χ² CRÍTICO', 'CRITICAL χ²'), num(c, 3)],
        ['P(χ² > c)', num(a, 3)],
        [T('MÉDIA = GL', 'MEAN = DF'), String(df)]
      ]];
    },
    formulas: function () {
      var n = int(30, 120), mu = 30 + Math.random() * 50, sigma = 4 + Math.random() * 10;
      var xs = []; for (var i = 0; i < n; i++) xs.push(mu + sigma * gauss());
      var mean = xs.reduce(function (a, x) { return a + x; }, 0) / n;
      var s = Math.sqrt(xs.reduce(function (a, x) { return a + (x - mean) * (x - mean); }, 0) / (n - 1));
      var se = s / Math.sqrt(n);
      var me = upperQuantile(function (x) { return tUpper(x, n - 1); }, 0.025, 4) * se;
      return [T('FÓRMULAS', 'FORMULAS'), [
        [T('AMOSTRA', 'SAMPLE'), 'n = ' + n],
        [T('MÉDIA', 'MEAN'), num(mean, 2)],
        [T('DESVIO PADRÃO', 'STD DEVIATION'), num(s, 2)],
        [T('ERRO PADRÃO', 'STD ERROR'), num(se, 2)],
        [T('IC 95%', 'CI 95%'), num(mean - me, 1) + T(' A ', ' TO ') + num(mean + me, 1)]
      ]];
    },
    testes: function () {
      // Teste t de uma amostra de H0: μ = μ0 contra μ ≠ μ0.
      var n = int(12, 40), mu0 = int(40, 70), shift = (Math.random() - 0.4) * 6;
      var xs = []; for (var i = 0; i < n; i++) xs.push(mu0 + shift + 8 * gauss());
      var mean = xs.reduce(function (a, x) { return a + x; }, 0) / n;
      var s = Math.sqrt(xs.reduce(function (a, x) { return a + (x - mean) * (x - mean); }, 0) / (n - 1));
      var t = (mean - mu0) / (s / Math.sqrt(n));
      var p = 2 * tUpper(Math.abs(t), n - 1);
      return [T('TESTE T, UMA AMOSTRA', 'ONE-SAMPLE T TEST'), [
        ['H0', 'μ = ' + mu0],
        [T('AMOSTRA', 'SAMPLE'), 'n = ' + n],
        [T('MÉDIA', 'MEAN'), num(mean, 2)],
        ['t', num(t, 3)],
        [T('VALOR-P', 'P-VALUE'), p < 0.0001 ? '< ' + num(0.0001, 4) : num(p, 4)],
        [T('α = 5%', 'α = 5%'), p < 0.05 ? T('REJEITA H0', 'REJECT H0') : T('NÃO REJEITA', 'DO NOT REJECT')]
      ]];
    },
    glossario: function () {
      var terms = ['AMOSTRA', 'CURTOSE', 'DESVIO PADRÃO', 'ERRO TIPO I', 'ESTIMADOR', 'HIPÓTESE NULA',
        'MEDIANA', 'MODA', 'PERCENTIL', 'POPULAÇÃO', 'QUARTIL', 'VALOR-P', 'VARIÂNCIA', 'VIÉS', 'ASSIMETRIA',
        'CORRELAÇÃO', 'COVARIÂNCIA', 'INTERVALO', 'OUTLIER', 'REGRESSÃO', 'RESÍDUO', 'AMPLITUDE'];
      var chosen = terms.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 5).sort();
      return ['GLOSSÁRIO A-Z', chosen.map(function (w) { return [w.charAt(0), w]; })];
    },
    elementar: function () {
      var a = int(12, 98), b = int(11, 89), m = int(12, 99), n = int(11, 99);
      var dv = int(2, 12), q = int(11, 99), r = int(11, 31), base = int(11, 31);
      return [T('MATEMÁTICA ELEMENTAR', 'ELEMENTARY MATH'), [
        ['SOMA', a + ' + ' + b + ' = ' + (a + b)],
        ['PRODUTO', m + ' × ' + n + ' = ' + (m * n)],
        ['QUOCIENTE', (dv * q) + ' ÷ ' + dv + ' = ' + q],
        ['POTÊNCIA', base + '² = ' + base * base],
        ['RAIZ', '√' + r * r + ' = ' + r]
      ]];
    },
    calculo: function () {
      // f(x) = a·x², com a múltiplo de 3 para a integral de 0 a b sair inteira.
      var a = pick([3, 6, 9]), x0 = int(1, 9), b = int(1, 6);
      return ['CÁLCULO INTUITIVO', [
        ['FUNÇÃO', 'f(x) = ' + a + 'x²'],
        ['DERIVADA', "f'(x) = " + 2 * a + 'x'],
        ['EM x = ' + x0, "f'(" + x0 + ') = ' + 2 * a * x0],
        ['INTEGRAL', '∫ 0→' + b + ' f = ' + a * b * b * b / 3],
        [T('MÉDIA [0,' + b + ']', 'MEAN [0,' + b + ']'), num(a * b * b / 3, 0)]
      ]];
    },
    problema: function () {
      return [T('PROBLEMA SEMANAL', 'WEEKLY PROBLEM'), [
        [T('TODA SEMANA', 'EVERY WEEK'), T('UM NOVO', 'A NEW ONE')],
        [T('ENUNCIADO', 'PROBLEM'), T('CURTO', 'SHORT')],
        [T('SOLUÇÃO', 'SOLUTION'), T('COMENTADA', 'EXPLAINED')],
        ['P(ACERTO)', '?']
      ]];
    },
    idle: function () {
      return [T('FERRAMENTAS', 'TOOLS'), []];
    }
  };

  var current = 'idle';

  function frame() {
    var b = BOARDS[current]();
    var out = [[0, Math.floor((COLS - b[0].length) / 2), b[0], b[0].length, 'title']];
    b[1].forEach(function (row, i) {
      out.push([i + 2, 1, row[0], 13, '']);
      out.push([i + 2, 15, String(row[1]).padStart(14), 14, 'value']);
    });
    return out;
  }

  // O menu existe em todas as páginas: o letreiro só nasce quando ele abre
  // pela primeira vez.
  var board = null;
  function init() {
    if (board) return;
    board = FlapBoard(canvas, {
      cols: COLS,
      rows: ROWS,
      host: canvas.parentElement,
      colors: { bg: '--paper', bg2: '--paper-alt', line: '--line', faint: '--ink-faint',
                soft: '--ink-soft', ink: '--ink', font: '--font-mono' },
      size: function (w, h) {
        var fw = Math.max(11, Math.min(36, (w * 0.96) / (COLS * 1.07), (h - 12) / (ROWS * 1.36 + (ROWS - 1) * 0.28)));
        return { fw: fw, fh: fw * 1.36, gx: fw * 0.07, gy: fw * 0.28, font: fw * 0.72 };
      },
      frame: frame,
      cycle: 4200
    });
  }
  if (!menu.hidden) init();
  else new MutationObserver(function (_, obs) {
    if (!menu.hidden) { init(); obs.disconnect(); }
  }).observe(menu, { attributes: true, attributeFilter: ['hidden'] });

  function show(key) {
    if (!BOARDS[key] || key === current) return;
    current = key;
    if (board) board.refresh();
  }

  menu.querySelectorAll('[data-board]').forEach(function (a) {
    a.addEventListener('mouseenter', function () { show(a.dataset.board); });
    a.addEventListener('focus', function () { show(a.dataset.board); });
  });
})();
