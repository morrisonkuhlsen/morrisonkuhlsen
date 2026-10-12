/* Letreiro de palhetas atrás do título do índice (motor em
   /assets/js/flap-board.js, o mesmo da home e da Matemática Elementar).
   A cada ciclo sorteia uma amostra de uma normal e mostra o que se calcula
   dela: média, desvio padrão, erro padrão e o intervalo de confiança de 95%
   com o t de Student. Serve às páginas em português e em inglês. */
(() => {
  const canvas = document.querySelector(".home-board");
  if (!canvas || !window.FlapBoard) return;
  const en = document.documentElement.lang === "en";

  // Grade larga para cobrir a faixa de ponta a ponta; o conteúdo ocupa 30
  // colunas no meio (a partir de OFF): rótulo de 13 e valor de 16.
  const COLS = 52, ROWS = 9, OFF = 11;

  const num = v => (en ? v.toFixed(2) : v.toFixed(2).replace(".", ","));

  // Normal padrão por Box-Muller.
  const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

  // Quantil 97,5% do t com nu graus de liberdade, pela expansão de
  // Cornish-Fisher em torno do z = 1,96; com nu ≥ 29 o erro fica abaixo de 1e-5.
  function t975(nu) {
    const z = 1.959963985;
    return z + (z ** 3 + z) / (4 * nu)
      + (5 * z ** 5 + 16 * z ** 3 + 3 * z) / (96 * nu ** 2)
      + (3 * z ** 7 + 19 * z ** 5 + 17 * z ** 3 - 15 * z) / (384 * nu ** 3);
  }

  function frame() {
    const n = 30 + Math.floor(Math.random() * 91);
    const mu = 30 + Math.random() * 50, sigma = 4 + Math.random() * 10;
    const xs = Array.from({ length: n }, () => mu + sigma * gauss());
    const mean = xs.reduce((a, x) => a + x, 0) / n;
    const s = Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / (n - 1));
    const se = s / Math.sqrt(n);
    const me = t975(n - 1) * se;
    const rows = [
      [en ? "SAMPLE" : "AMOSTRA", `n = ${n}`],
      [en ? "MEAN" : "MÉDIA", num(mean)],
      [en ? "STD DEVIATION" : "DESVIO PADRÃO", num(s)],
      [en ? "STD ERROR" : "ERRO PADRÃO", num(se)],
      [en ? "MARGIN 95%" : "MARGEM 95%", `± ${num(me)}`],
      [en ? "CI 95%" : "IC 95%", `${num(mean - me)} ${en ? "TO" : "A"} ${num(mean + me)}`],
    ];
    const title = en ? "FORMULAS" : "FÓRMULAS";
    const out = [[1, Math.floor((COLS - title.length) / 2), title, title.length, "title"]];
    rows.forEach(([label, value], i) => {
      out.push([i + 2, OFF, label, 13, ""]);
      out.push([i + 2, OFF + 14, value.padStart(16), 16, "value"]);
    });
    return out;
  }

  FlapBoard(canvas, {
    cols: COLS,
    rows: ROWS,
    host: canvas.parentElement,
    colors: { bg: "--surface", bg2: "--bg", line: "--border", faint: "--text-muted",
              soft: "--text", ink: "--text-strong", font: "--board-font" },
    // As palhetas ocupam a largura da faixa, até 40 px cada, sem passar da
    // altura: ROWS linhas de 1,36·fw com ROWS − 1 vãos de 0,28·fw.
    size(w, h) {
      const fw = Math.max(11, Math.min(40, (w * 0.98) / (COLS * 1.07), (h - 12) / (ROWS * 1.36 + (ROWS - 1) * 0.28)));
      return { fw, fh: fw * 1.36, gx: fw * 0.07, gy: fw * 0.28, font: fw * 0.76 };
    },
    frame,
  });
})();
