/* Letreiro de palhetas atrás do título do índice (motor em
   /assets/js/flap-board.js, o mesmo do "Navegar por categoria" da home).
   A cada ciclo sorteia uma conta de cada tipo, sempre com resultado exato:
   a divisão parte do quociente, e a raiz, de um quadrado perfeito. */
(() => {
  const canvas = document.querySelector(".home-board");
  if (!canvas || !window.FlapBoard) return;

  // Grade larga para cobrir a faixa de ponta a ponta; as contas ocupam 30
  // colunas no meio (a partir de OFF), entre uma linha vazia em cima e embaixo.
  const COLS = 52, ROWS = 9, OFF = 11;
  const int = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

  function frame() {
    const a = int(12, 98), b = int(11, 89);
    const d = int(13, 99), e = int(11, 99);
    const m = int(12, 99), n = int(11, 99);
    const dv = int(2, 12), q = int(11, 99);
    const x = Math.random() < 0.35 ? 3 : 2;       // cubo de 2 a 9 ou quadrado de 11 a 31
    const base = x === 3 ? int(2, 9) : int(11, 31);
    const r = int(11, 31);
    const [hi, lo] = d >= e ? [d, e] : [e, d];
    const rows = [
      ["SOMA", `${a} + ${b} = ${a + b}`],
      ["DIFERENÇA", `${hi} − ${lo} = ${hi - lo}`],
      ["PRODUTO", `${m} × ${n} = ${m * n}`],
      ["QUOCIENTE", `${dv * q} ÷ ${dv} = ${q}`],
      ["POTÊNCIA", `${base}${x === 3 ? "³" : "²"} = ${base ** x}`],
      ["RAIZ", `√${r * r} = ${r}`],
    ];
    const title = "MATEMÁTICA ELEMENTAR";
    const out = [[1, Math.floor((COLS - title.length) / 2), title, title.length, "title"]];
    rows.forEach(([label, conta], i) => {
      out.push([i + 2, OFF + 1, label, 9, ""]);
      out.push([i + 2, OFF + 11, conta.padStart(18), 18, "value"]);
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
