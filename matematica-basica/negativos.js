/* Números negativos: a reta numérica do início (somar anda para a direita,
 * subtrair é somar o oposto), a escada que mostra por que menos com menos dá
 * mais e os cards de regra. Os utilitários vêm de licao.js.
 */
(() => {
  const { fmt, tone, paren, math, el, svg, saveParams } = Licao;

  const n = v => fmt(v); // −3 com o sinal tipográfico
  const p = v => (v < 0 ? `(${n(v)})` : n(v));
  const passos = k => `${Math.abs(k)} ${Math.abs(k) === 1 ? "casa" : "casas"}`;

  /* ---------------------------------------------------------------- reta */

  // A reta de lo a hi, com a partida em a, o salto até r e as duas marcas.
  function drawLine(box, a, r, lo, hi) {
    const W = 640, H = 120, L = 20, R = 20, Y = 78;
    const X = v => L + (v - lo) / (hi - lo) * (W - L - R);
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot reta", role: "img",
      "aria-label": `Reta numérica: parte de ${n(a)} e chega em ${n(r)}` });
    svg("line", { x1: L - 8, x2: W - R + 8, y1: Y, y2: Y, class: "plot-axis is-x" }, g);
    const every = hi - lo > 24 ? 2 : 1;
    for (let v = lo; v <= hi; v++) {
      svg("line", { x1: X(v), x2: X(v), y1: Y - (v === 0 ? 9 : 5), y2: Y + (v === 0 ? 9 : 5), class: v === 0 ? "plot-axis" : "plot-grid" }, g);
      if (v % every === 0 || v === 0) {
        const t = svg("text", { x: X(v), y: Y + 24, class: `plot-tick${v === 0 ? " is-zero" : ""}`, "text-anchor": "middle" }, g);
        t.textContent = n(v);
      }
    }
    // O salto: um arco por cima, com a ponta da seta na chegada.
    if (r !== a) {
      const x1 = X(a), x2 = X(r), h = Math.min(46, 14 + Math.abs(x2 - x1) * 0.25);
      svg("path", { d: `M${x1},${Y - 6} Q${(x1 + x2) / 2},${Y - 6 - 2 * h} ${x2},${Y - 6}`, class: "reta-jump" }, g);
      const dir = Math.sign(x2 - x1);
      svg("path", { d: `M${x2},${Y - 6} l${-dir * 9},-8 l${dir * 1},10 z`, class: "reta-head" }, g);
    }
    svg("circle", { cx: X(a), cy: Y, r: 6, class: "plot-dot reta-a" }, g);
    svg("circle", { cx: X(r), cy: Y, r: 6, class: "plot-dot reta-r" }, g);
    box.replaceChildren(g);
  }

  function initReta(section) {
    const inA = section.querySelector("input[name=p]");
    const inB = section.querySelector("input[name=q]");
    const outA = section.querySelector(".out-p");
    const outB = section.querySelector(".out-q");
    const ops = section.querySelectorAll("[data-op]");
    const fig = section.querySelector(".reta-box");
    const eq = section.querySelector(".reta-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("p")) inA.value = q.get("p");
    if (q.has("q")) inB.value = q.get("q");
    let op = q.get("op") === "menos" ? "menos" : "mais";

    function draw() {
      const a = Number(inA.value), b = Number(inB.value);
      outA.textContent = n(a);
      outB.textContent = n(b);
      ops.forEach(btn => btn.setAttribute("aria-pressed", btn.dataset.op === op));
      const step = op === "mais" ? b : -b; // o quanto se anda de fato
      const r = a + step;
      const lo = Math.min(-10, a - 2, r - 2), hi = Math.max(10, a + 2, r + 2);
      drawLine(fig, a, r, lo, hi);

      math(eq, op === "mais"
        ? `\\displaystyle ${tone(Licao.texNum(a), 2)} + ${tone(paren(b), 5)} = ${tone(Licao.texNum(r), 1)}`
        : `\\displaystyle ${tone(Licao.texNum(a), 2)} - ${tone(paren(b), 5)} = ${tone(Licao.texNum(a), 2)} + ${tone(paren(-b), 5)} = ${tone(Licao.texNum(r), 1)}`);
      const dir = step > 0 ? "para a direita" : "para a esquerda";
      const parts = [];
      if (op === "mais") {
        parts.push(b === 0
          ? `<p>Somar 0 é não andar: fica-se em ${n(a)}.</p>`
          : `<p>Comece em ${n(a)}. Somar ${p(b)} é andar ${passos(b)} <strong>${dir}</strong>${b < 0 ? " — somar um número negativo é o mesmo que subtrair" : ""}. Chega-se em <strong>${n(r)}</strong>.</p>`);
      } else {
        parts.push(b === 0
          ? `<p>Subtrair 0 é não andar: fica-se em ${n(a)}.</p>`
          : `<p>Subtrair é <strong>somar o oposto</strong>: tirar ${p(b)} é o mesmo que somar ${p(-b)}. Comece em ${n(a)} e ande ${passos(b)} <strong>${dir}</strong>. Chega-se em <strong>${n(r)}</strong>.</p>`);
        if (b < 0) parts.push(`<p>Por isso <strong>menos com menos dá mais</strong>: ${n(a)} − (${n(b)}) = ${n(a)} + ${n(-b)}. Tirar uma dívida de ${n(-b)} reais deixa você ${n(-b)} reais mais rico.</p>`);
      }
      text.innerHTML = parts.join("");
      saveParams({ p: a, q: b, op });
    }

    ops.forEach(btn => btn.addEventListener("click", () => { op = btn.dataset.op; draw(); }));
    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- escada da multiplicação */

  // k × b para k de 3 até −3: a cada degrau o produto muda o mesmo tanto,
  // e o padrão continua depois do zero.
  function initEscada(section) {
    const input = section.querySelector("input[name=fator]");
    const out = section.querySelector(".out-fator");
    const ladder = section.querySelector(".ladder-steps");
    const text = section.querySelector(".escada-text");
    const q = new URLSearchParams(location.search);
    if (q.has("fator")) input.value = q.get("fator");

    function draw() {
      const b = Number(input.value);
      out.textContent = n(b);
      ladder.replaceChildren();
      for (let k = 3; k >= -3; k--) {
        if (k < 3) ladder.appendChild(el("li", "ladder-op", b === 0 ? "+ 0" : `${-b > 0 ? "+" : "−"} ${Math.abs(b)}`));
        const li = el("li", k < 0 ? "ladder-step is-on" : "ladder-step");
        const top = el("span", "ladder-pow");
        math(top, `${paren(k)} \\times ${paren(b)}`);
        const bottom = el("span", "ladder-val");
        math(bottom, Licao.texNum(k * b));
        li.append(top, bottom);
        ladder.appendChild(li);
      }
      text.innerHTML = b === 0
        ? "<p>Qualquer número vezes 0 dá 0. Mova o slider para ver o padrão.</p>"
        : `<p>Da esquerda para a direita, o primeiro fator diminui 1 por vez, e o produto ${b > 0 ? "diminui" : "aumenta"} ${Math.abs(b)} por vez — que é tirar um ${p(b)} a cada degrau. Até o zero, tudo é conta conhecida.</p>`
          + `<p>Os degraus destacados só continuam o mesmo padrão: ${b > 0
            ? `depois de 0 vem −${b}, −${2 * b}, −${3 * b}. <strong>Negativo vezes positivo dá negativo.</strong>`
            : `depois de 0 vem ${-b}, ${-2 * b}, ${-3 * b}. <strong>Negativo vezes negativo dá positivo</strong> — não por decreto, mas porque é o único jeito de a escada não quebrar.`}</p>`;
      saveParams({ fator: b });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    a: { min: -9, max: 9, value: 5 },
    b: { min: -9, max: 9, value: -3, skip: 0 },
  };

  const t = v => Licao.texNum(v);
  const regraSinal = (a, b) => (a === 0 || b === 0 ? "Com um fator 0, o resultado é 0, sem sinal."
    : (a < 0) === (b < 0) ? `Sinais iguais (${a < 0 ? "dois negativos" : "dois positivos"}): resultado positivo.`
    : "Sinais diferentes: resultado negativo.");

  const RULES = {
    subOposto({ a, b }) {
      return {
        lhs: [`${t(a)} - ${paren(b)} = ${t(a - b)}`, a - b],
        rhs: [`${t(a)} + ${paren(-b)} = ${t(a - b)}`, a - b],
        note: b < 0 ? `Com b negativo, os dois sinais de menos viram um de mais: ${n(a)} − (${n(b)}) = ${n(a)} + ${n(-b)}.` : "Deixe b negativo para ver o menos com menos.",
      };
    },
    mult({ a, b }) {
      return {
        lhs: [`${paren(a)} \\times ${paren(b)} = ${t(a * b)}`, a * b],
        rhs: [`${(a < 0) !== (b < 0) && a !== 0 ? "-" : "+"}\\,(${Math.abs(a)} \\times ${Math.abs(b)}) = ${t(a * b)}`, a * b],
        note: regraSinal(a, b),
      };
    },
    div({ a, b }) {
      return {
        lhs: [`${paren(a)} \\div ${paren(b)} ${Licao.sgn(a / b)} ${t(a / b)}`, a / b],
        rhs: [`${(a < 0) !== (b < 0) && a !== 0 ? "-" : "+"}\\,(${Math.abs(a)} \\div ${Math.abs(b)}) ${Licao.sgn(a / b)} ${t(a / b)}`, a / b],
        note: `${regraSinal(a, b)} A divisão é a multiplicação ao contrário, então segue a mesma regra.`,
      };
    },
    menosParen({ a, b }) {
      return {
        lhs: [`-(${t(a)} + ${paren(b)}) = -(${t(a + b)}) = ${t(-(a + b))}`, -(a + b)],
        rhs: [`${paren(-a)} + ${paren(-b)} = ${t(-a - b)}`, -a - b],
        note: "O menos na frente dos parênteses troca o sinal de cada termo de dentro — é multiplicar tudo por −1.",
      };
    },
    errado({ a, b }) {
      return {
        lhs: [`-(${t(a)} - ${paren(b)}) = -(${t(a - b)}) = ${t(-(a - b))}`, -(a - b)],
        rhs: [`${paren(-a)} - ${paren(b)} = ${t(-a - b)}`, -a - b],
        note: "O erro é trocar só o primeiro sinal. O certo: −(a − b) = −a + b, os dois trocam.",
      };
    },
  };

  Licao.renderTex();
  const reta = document.querySelector("#reta");
  if (reta) initReta(reta);
  const escada = document.querySelector("#escada");
  if (escada) initEscada(escada);
  Licao.regras(VARS, RULES);
})();
