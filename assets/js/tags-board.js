/* Letreiro de palhetas atrás de "Navegar por categoria" (motor em
   flap-board.js). A cada ciclo sorteia P(A), P(B) e uma interseção possível,
   e mostra as probabilidades derivadas — união, condicional, complementar.
   Recuperado da versão de maio/2026 (commit 0dcd3f6). */
(function () {
  var canvas = document.querySelector('.tags-board');
  if (!canvas || !window.FlapBoard) return;
  var en = canvas.dataset.lang === 'en';

  function between(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  function fmt(p) {
    var s = p.toFixed(3) + ' ' + (p * 100).toFixed(1) + '%';
    return en ? s : s.replace(/\./g, ',');
  }

  function frame() {
    var pA = between(0.26, 0.88);
    var pB = between(0.22, 0.82);
    // A interseção tem de caber: max(0, pA + pB − 1) ≤ P(A∩B) ≤ min(pA, pB).
    var lo = Math.max(0.02, pA + pB - 1);
    var hi = Math.max(lo + 0.01, Math.min(pA, pB) - 0.025);
    var pAB = Math.min(between(lo, hi), Math.min(pA, pB));
    var rows = [
      ['P(A)', pA], ['P(B)', pB], ['P(A∩B)', pAB],
      ['P(A∪B)', pA + pB - pAB], ['P(A|B)', pAB / pB], ['P(A^C)', 1 - pA]
    ];
    var out = [
      [0, 3, en ? 'PROBABILITY' : 'PROBABILIDADE', 13, 'title'],
      [0, 25, en ? 'CATEGORIES' : 'CATEGORIAS', 15, 'title']
    ];
    rows.forEach(function (r, i) {
      out.push([i + 1, 5, r[0], r[0].length, '']);
      out.push([i + 1, 23, fmt(r[1]), 15, 'value']);
    });
    return out;
  }

  FlapBoard(canvas, {
    cols: 41,
    rows: 7,
    host: canvas.parentElement,
    colors: { bg: '--paper', bg2: '--paper-alt', line: '--line', faint: '--ink-faint',
              soft: '--ink-soft', ink: '--ink', font: '--font-mono' },
    // Os mesmos tamanhos da versão original, ampliados 8%.
    size: function (w, h, vw) {
      var s = 1.08;
      return {
        fw: clamp(2.1 * vw, 18, 44) * s,
        fh: clamp(2.85 * vw, 30, 58) * s,
        gx: clamp(0.18 * vw, 2, 3) * s,
        gy: clamp(0.85 * vw, 7, 12) * s,
        font: clamp(1.68 * vw, 15, 34) * s
      };
    },
    frame: frame
  });
})();
