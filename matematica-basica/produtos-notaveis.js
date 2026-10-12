/* Produtos notáveis: os quadrados desenhados por área — (a + b)², (a − b)²
 * e (a + b)(a − b) —, os cards de regra com os números do leitor e as
 * contas de cabeça. Os utilitários vêm de licao.js.
 */
(() => {
  const { tone, math, svg, saveParams } = Licao;

  /* ---------------------------------------------------------------- desenhos */

  const S = 220; // lado do desenho, em unidades do SVG

  function rect(g, x, y, w, h, cls, label) {
    svg("rect", { x, y, width: Math.max(0, w), height: Math.max(0, h), class: cls }, g);
    if (label && w > 26 && h > 16) {
      const t = svg("text", { x: x + w / 2, y: y + h / 2 + 4, class: "tri-label", "text-anchor": "middle" }, g);
      t.textContent = label;
    }
  }
  function lab(g, x, y, txt, anchor = "middle") {
    const t = svg("text", { x, y, class: "tri-label is-hi", "text-anchor": anchor }, g);
    t.textContent = txt;
  }

  // (a + b)²: o quadrado grande em a², b² e dois retângulos ab.
  function drawSoma(g, a, b) {
    const u = S / (a + b), A = a * u, x0 = 30, y0 = 10;
    rect(g, x0, y0, A, A, "sq-a", `a² = ${a * a}`);
    rect(g, x0 + A, y0, S - A, A, "sq-ab", `ab = ${a * b}`);
    rect(g, x0, y0 + A, A, S - A, "sq-ab", `ab = ${a * b}`);
    rect(g, x0 + A, y0 + A, S - A, S - A, "sq-b", `b² = ${b * b}`);
    lab(g, x0 + A / 2, y0 + S + 18, `a = ${a}`);
    lab(g, x0 + A + (S - A) / 2, y0 + S + 18, `b = ${b}`);
    return `0 0 ${S + 60} ${S + 40}`;
  }

  // (a − b)²: do quadrado a² tiram-se duas faixas ab, que se cruzam no canto b².
  function drawDif(g, a, b) {
    const u = S / a, B = b * u, x0 = 30, y0 = 10, R = S - B;
    rect(g, x0, y0, R, R, "sq-a", `(a − b)² = ${(a - b) ** 2}`);
    rect(g, x0 + R, y0, B, R, "sq-ab is-out", "");
    rect(g, x0, y0 + R, R, B, "sq-ab is-out", "");
    rect(g, x0 + R, y0 + R, B, B, "sq-b", `b²`);
    svg("rect", { x: x0, y: y0, width: S, height: S, class: "sq-edge" }, g);
    lab(g, x0 + R / 2, y0 + S + 18, `a − b = ${a - b}`);
    lab(g, x0 + R + B / 2, y0 + S + 18, `b = ${b}`);
    lab(g, x0 - 8, y0 + S / 2 + 4, `a = ${a}`, "end");
    return `-20 0 ${S + 80} ${S + 40}`;
  }

  // (a + b)(a − b): o L que sobra de a² − b², rearrumado num retângulo.
  function drawProd(g, a, b) {
    const u = 150 / a, A = a * u, B = b * u, x0 = 10, y0 = 10;
    // À esquerda: a² sem o canto b².
    rect(g, x0, y0, A - B, A, "sq-a", "");
    rect(g, x0 + A - B, y0 + B, B, A - B, "sq-ab", "");
    rect(g, x0 + A - B, y0, B, B, "sq-b is-out", "b²");
    lab(g, x0 + A / 2, y0 + A + 18, `a² − b²`);
    // À direita: a faixa da direita gira e vai para baixo.
    const x1 = x0 + A + 40;
    rect(g, x1, y0, A, A - B, "sq-a", "");
    rect(g, x1 + A, y0, B, A - B, "sq-ab", "");
    lab(g, x1 + (A + B) / 2, y0 + A - B + 18, `a + b = ${a + b}`);
    lab(g, x1 + A + B + 8, y0 + (A - B) / 2 + 4, `a − b = ${a - b}`, "start");
    const ar = svg("text", { x: x0 + A + 20, y: y0 + A / 2, class: "tri-label is-hi", "text-anchor": "middle" }, g);
    ar.textContent = "→";
    return `0 0 ${x1 + A + B + 90} ${A + 40}`;
  }

  const MODOS = {
    soma: {
      draw: drawSoma,
      tex: (a, b) => `(${tone(a, 2)} + ${tone(b, 5)})^2 = ${tone(a, 2)}^2 + 2 \\cdot ${tone(a, 2)} \\cdot ${tone(b, 5)} + ${tone(b, 5)}^2 = ${a * a} + ${2 * a * b} + ${b * b} = ${tone((a + b) ** 2, 1)}`,
      txt: (a, b) => `<p>O quadrado de lado a + b = ${a + b} tem área ${(a + b) ** 2}. Dividido nas linhas de a e b, ele mostra quatro pedaços: o quadrado a², o quadrado b² e <strong>dois retângulos a × b</strong>. São eles o “2ab” — o termo que some quando se escreve, errado, (a + b)² = a² + b².</p>`,
    },
    dif: {
      draw: drawDif,
      tex: (a, b) => `(${tone(a, 2)} - ${tone(b, 5)})^2 = ${tone(a, 2)}^2 - 2 \\cdot ${tone(a, 2)} \\cdot ${tone(b, 5)} + ${tone(b, 5)}^2 = ${a * a} - ${2 * a * b} + ${b * b} = ${tone((a - b) ** 2, 1)}`,
      txt: (a, b) => `<p>Do quadrado a² = ${a * a} tiram-se duas faixas a × b (as apagadas), ${2 * a * b} ao todo, para sobrar o quadrado (a − b)². Mas as duas faixas se cruzam no canto: o quadradinho b² foi tirado <strong>duas vezes</strong>. Por isso ele volta somando: ${a * a} − ${2 * a * b} + ${b * b} = ${(a - b) ** 2}.</p>`,
    },
    prod: {
      draw: drawProd,
      tex: (a, b) => `(${tone(a, 2)} + ${tone(b, 5)})(${tone(a, 2)} - ${tone(b, 5)}) = ${tone(a, 2)}^2 - ${tone(b, 5)}^2 = ${a * a} - ${b * b} = ${tone(a * a - b * b, 1)}`,
      txt: (a, b) => `<p>Tire o canto b² do quadrado a²: sobra um L de área ${a * a} − ${b * b}. Corte a faixa da direita e cole-a embaixo, deitada: o L vira um retângulo de lados a + b = ${a + b} e a − b = ${a - b}. A área não mudou — então (a + b)(a − b) = a² − b². Os termos do meio, +ab e −ab, se cancelam.</p>`,
    },
  };

  function initArea(section) {
    const inA = section.querySelector("input[name=pa]");
    const inB = section.querySelector("input[name=pb]");
    const outA = section.querySelector(".out-pa");
    const outB = section.querySelector(".out-pb");
    const btns = section.querySelectorAll("[data-modo]");
    const fig = section.querySelector(".pn-fig");
    const eq = section.querySelector(".pn-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("pa")) inA.value = q.get("pa");
    if (q.has("pb")) inB.value = q.get("pb");
    let modo = MODOS[q.get("modo")] ? q.get("modo") : "soma";

    function draw(moved) {
      // Na diferença, b fica menor que a: quem não se mexeu acompanha.
      if (modo !== "soma" && Number(inB.value) >= Number(inA.value)) {
        if (moved === inB) inA.value = Math.min(Number(inA.max), Number(inB.value) + 1);
        if (Number(inB.value) >= Number(inA.value)) inB.value = Number(inA.value) - 1;
      }
      const a = Number(inA.value), b = Number(inB.value), M = MODOS[modo];
      outA.textContent = a;
      outB.textContent = b;
      btns.forEach(btn => btn.setAttribute("aria-pressed", btn.dataset.modo === modo));
      const g = svg("svg", { class: "tri pn-svg", role: "img", "aria-label": `Desenho por área de ${modo === "soma" ? "(a + b)²" : modo === "dif" ? "(a − b)²" : "(a + b)(a − b)"} com a = ${a} e b = ${b}` });
      g.setAttribute("viewBox", M.draw(g, a, b));
      g.classList.toggle("is-largo", modo === "prod");
      fig.replaceChildren(g);
      math(eq, `\\displaystyle ${M.tex(a, b)}`);
      text.innerHTML = M.txt(a, b);
      saveParams({ pa: a, pb: b, modo });
    }

    btns.forEach(btn => btn.addEventListener("click", () => { modo = btn.dataset.modo; draw(); }));
    section.addEventListener("input", e => draw(e.target));
    draw();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    a: { min: 1, max: 9, value: 5 },
    b: { min: 1, max: 9, value: 3 },
    t: { min: 1, max: 9, value: 5 },
    u: { min: 1, max: 9, value: 1 },
  };

  const RULES = {
    quadSoma({ a, b }) {
      return {
        lhs: [`(${a} + ${b})^2 = ${a + b}^2 = ${(a + b) ** 2}`, (a + b) ** 2],
        rhs: [`${a}^2 + 2 \\cdot ${a} \\cdot ${b} + ${b}^2 = ${a * a} + ${2 * a * b} + ${b * b} = ${a * a + 2 * a * b + b * b}`, a * a + 2 * a * b + b * b],
        note: "“O quadrado do primeiro, mais duas vezes o primeiro pelo segundo, mais o quadrado do segundo.”",
      };
    },
    quadDif({ a, b }) {
      return {
        lhs: [`(${a} - ${b})^2 = ${Licao.paren(a - b)}^2 = ${(a - b) ** 2}`, (a - b) ** 2],
        rhs: [`${a}^2 - 2 \\cdot ${a} \\cdot ${b} + ${b}^2 = ${a * a} - ${2 * a * b} + ${b * b} = ${a * a - 2 * a * b + b * b}`, a * a - 2 * a * b + b * b],
        note: a < b ? "Com b maior que a, (a − b) é negativo, mas o quadrado é positivo — e a fórmula continua valendo." : "Só o sinal do termo do meio muda em relação ao quadrado da soma.",
      };
    },
    prodSD({ a, b }) {
      return {
        lhs: [`(${a} + ${b})(${a} - ${b}) = ${a + b} \\cdot ${Licao.paren(a - b)} = ${(a + b) * (a - b)}`, (a + b) * (a - b)],
        rhs: [`${a}^2 - ${b}^2 = ${a * a} - ${b * b} = ${a * a - b * b}`, a * a - b * b],
        note: "Distribuindo: a² − ab + ab − b². Os termos do meio se anulam.",
      };
    },
    cubo({ a, b }) {
      return {
        lhs: [`(${a} + ${b})^3 = ${a + b}^3 = ${(a + b) ** 3}`, (a + b) ** 3],
        rhs: [`${a}^3 + 3 \\cdot ${a}^2 \\cdot ${b} + 3 \\cdot ${a} \\cdot ${b}^2 + ${b}^3 = ${a ** 3} + ${3 * a * a * b} + ${3 * a * b * b} + ${b ** 3}`, a ** 3 + 3 * a * a * b + 3 * a * b * b + b ** 3],
        note: "Os coeficientes 1, 3, 3, 1 são uma linha do triângulo de Pascal — veja o binômio de Newton.",
      };
    },
    errado({ a, b }) {
      return {
        lhs: [`(${a} + ${b})^2 = ${(a + b) ** 2}`, (a + b) ** 2],
        rhs: [`${a}^2 + ${b}^2 = ${a * a + b * b}`, a * a + b * b],
        note: `Faltam os dois retângulos: 2 · ${a} · ${b} = ${2 * a * b}, exatamente a diferença.`,
      };
    },
    cabeca({ t, u }) {
      const n = 10 * t + u;
      return {
        lhs: [`${n}^2 = ${n * n}`, n * n],
        rhs: [`(${10 * t} + ${u})^2 = ${100 * t * t} + ${20 * t * u} + ${u * u} = ${n * n}`, (10 * t) ** 2 + 2 * 10 * t * u + u * u],
        note: `De cabeça: ${10 * t}² é fácil (${100 * t * t}), 2 · ${10 * t} · ${u} = ${20 * t * u} também, e ${u}² = ${u * u}.`,
      };
    },
    vizinhos({ t, u }) {
      const m = 10 * t;
      return {
        lhs: [`${m - u} \\times ${m + u} = ${(m - u) * (m + u)}`, (m - u) * (m + u)],
        rhs: [`${m}^2 - ${u}^2 = ${m * m} - ${u * u} = ${m * m - u * u}`, m * m - u * u],
        note: `Dois números à mesma distância de ${m}: o produto é ${m}² menos o quadrado da distância.`,
      };
    },
  };

  Licao.renderTex();
  const area = document.querySelector("#area");
  if (area) initArea(area);
  Licao.regras(VARS, RULES);
})();
