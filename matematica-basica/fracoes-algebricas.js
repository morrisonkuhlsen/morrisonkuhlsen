/* Frações algébricas: simplificar fatorando, com o valor de cada passo para
 * o x do leitor e o gráfico que mostra o "buraco" onde a fração original
 * não existe; e os cards de regra das operações. Os utilitários vêm de
 * licao.js.
 *
 * Como na página de expressões algébricas, o valor de cada passo sai do
 * próprio TeX exibido (ver `avaliar`).
 */
(() => {
  const { fmt, texNum, tone, paren, math, el, svg, saveParams } = Licao;
  const T = (n, s) => tone(s, n);

  /* ---------------------------------------------------------------- avaliar o TeX */

  // \frac{A}{B} → ((A)/(B)), com chaves balanceadas.
  function tirarFrac(s) {
    const lerGrupo = i => { // s[i] === "{"; devolve [conteúdo, índice depois do "}"]
      let n = 0;
      for (let j = i; j < s.length; j++) {
        if (s[j] === "{") n++;
        else if (s[j] === "}" && --n === 0) return [s.slice(i + 1, j), j + 1];
      }
      throw new Error("chave sem par");
    };
    let k;
    while ((k = s.indexOf("\\frac")) >= 0) {
      const [a, i1] = lerGrupo(k + 5), [b, i2] = lerGrupo(i1);
      s = `${s.slice(0, k)}((${a})/(${b}))${s.slice(i2)}`;
    }
    return s;
  }

  // Só para os textos fixos desta página: x é a única letra.
  function avaliar(tex) {
    let js = tex
      .replace(/\\htmlData\{tone=\d\}\{/g, "\\cor{");
    // A cor só pinta: tira o \cor{…} mantendo o conteúdo.
    let k;
    while ((k = js.indexOf("\\cor{")) >= 0) {
      let n = 0, j = k + 4;
      for (; j < js.length; j++) { if (js[j] === "{") n++; else if (js[j] === "}" && --n === 0) break; }
      js = js.slice(0, k) + js.slice(k + 5, j) + js.slice(j + 1);
    }
    js = tirarFrac(js)
      .replace(/\\left|\\right/g, "")
      .replace(/\\cdot/g, "*")
      .replace(/\\[,;!]/g, "")
      .replace(/\^\{([^}]*)\}/g, "**($1)").replace(/\^(\d)/g, "**$1")
      .replace(/\s+/g, "");
    js = js.replace(/(\d|x|\))(?=x|\()/g, "$1*");
    return new Function("x", `return ${js};`);
  }

  /* ---------------------------------------------------------------- exemplos */

  // fim: a forma simplificada (também é o que o gráfico desenha);
  // proibidos: os x que zeram algum denominador da fração original.
  const EX = {
    diferenca: {
      botao: "(x² − 4)/(x − 2)",
      proibidos: [2],
      passos: [
        { tex: "\\frac{x^2 - 4}{x - 2}", html: "A fração, como foi escrita. Antes de qualquer coisa: o denominador não pode ser zero, então <strong>x ≠ 2</strong>." },
        { tag: "Fatore", html: "O numerador é uma diferença de quadrados: x² − 4 = (x + 2)(x − 2). Veja <a href=\"produtos-notaveis.html\">produtos notáveis</a>.",
          tex: `\\frac{(x + 2)${T(2, "(x - 2)")}}{${T(2, "(x - 2)")}}` },
        { tag: "Corte o fator comum", html: "(x − 2) multiplica em cima e embaixo: dividir os dois por ele não muda a fração — desde que ele não seja zero.",
          tex: T(1, "x + 2") },
      ],
    },
    evidencia: {
      botao: "(2x + 6)/(x² + 3x)",
      proibidos: [0, -3],
      passos: [
        { tex: "\\frac{2x + 6}{x^2 + 3x}", html: "O denominador x² + 3x = x(x + 3) zera em x = 0 e em x = −3: <strong>x ≠ 0 e x ≠ −3</strong>." },
        { tag: "Fatore", html: "Ponha em evidência o que se repete: 2 em cima, x embaixo.",
          tex: `\\frac{2${T(2, "(x + 3)")}}{x${T(2, "(x + 3)")}}` },
        { tag: "Corte o fator comum", html: "Sobra 2 em cima e x embaixo. O x de baixo não corta com nada: em cima não há fator x.",
          tex: T(1, "\\frac{2}{x}") },
      ],
    },
    quadrado: {
      botao: "(x² − 2x + 1)/(x² − 1)",
      proibidos: [1, -1],
      passos: [
        { tex: "\\frac{x^2 - 2x + 1}{x^2 - 1}", html: "x² − 1 zera em x = 1 e em x = −1: <strong>x ≠ ±1</strong>." },
        { tag: "Fatore", html: "Em cima, o quadrado da diferença: (x − 1)². Embaixo, diferença de quadrados: (x + 1)(x − 1).",
          tex: `\\frac{(x - 1)${T(2, "(x - 1)")}}{(x + 1)${T(2, "(x - 1)")}}` },
        { tag: "Corte o fator comum", html: "Um (x − 1) de cima corta com o de baixo; o outro fica.",
          tex: T(1, "\\frac{x - 1}{x + 1}") },
      ],
    },
    soma: {
      botao: "3/(x − 2) − 1/(x + 2)",
      proibidos: [2, -2],
      passos: [
        { tex: "\\frac{3}{x - 2} - \\frac{1}{x + 2}", html: "Uma subtração de frações: <strong>x ≠ 2 e x ≠ −2</strong>. Como nas <a href=\"fracoes.html\">frações numéricas</a>, é preciso um denominador comum." },
        { tag: "Denominador comum", html: "Os denominadores não têm fator em comum, então o comum é o produto (x − 2)(x + 2). Cada fração é multiplicada em cima e embaixo pelo que falta nela.",
          tex: `\\frac{3${T(2, "(x + 2)")}}{(x - 2)(x + 2)} - \\frac{${T(2, "(x - 2)")}}{(x - 2)(x + 2)}` },
        { tag: "Junte os numeradores", html: "Com o mesmo denominador, subtrai-se só em cima. O − na frente do segundo numerador troca os dois sinais dele.",
          tex: `\\frac{3x + 6 ${T(5, "- x + 2")}}{(x - 2)(x + 2)}` },
        { tag: "Simplifique", html: "Junte os semelhantes em cima e multiplique embaixo (é a diferença de quadrados).",
          tex: T(1, "\\frac{2x + 8}{x^2 - 4}") },
      ],
    },
    // Dos exercícios.
    ex1: {
      proibidos: [-5],
      passos: [
        { tex: "\\frac{x^2 - 25}{x + 5}", html: "A fração do exercício 1: x ≠ −5." },
        { tag: "Fatore", html: "x² − 25 = (x + 5)(x − 5).", tex: `\\frac{${T(2, "(x + 5)")}(x - 5)}{${T(2, "(x + 5)")}}` },
        { tag: "Corte o fator comum", html: "Sobra x − 5.", tex: T(1, "x - 5") },
      ],
    },
    ex2: {
      proibidos: [0, 4],
      passos: [
        { tex: "\\frac{3x^2 - 12x}{x^2 - 4x}", html: "A fração do exercício 2: x² − 4x = x(x − 4), então x ≠ 0 e x ≠ 4." },
        { tag: "Fatore", html: "Em cima, 3x em evidência: 3x(x − 4). Embaixo, x(x − 4).", tex: `\\frac{3${T(2, "x(x - 4)")}}{${T(2, "x(x - 4)")}}` },
        { tag: "Corte o fator comum", html: "Corta o x e corta o (x − 4): sobra 3, para todo x que não seja 0 nem 4.", tex: T(1, "3") },
      ],
    },
    ex3: {
      proibidos: [0, -1],
      passos: [
        { tex: "\\frac{1}{x} + \\frac{1}{x + 1}", html: "A soma do exercício 3: x ≠ 0 e x ≠ −1." },
        { tag: "Denominador comum", html: "O comum é x(x + 1).", tex: `\\frac{${T(2, "x + 1")}}{x(x + 1)} + \\frac{${T(2, "x")}}{x(x + 1)}` },
        { tag: "Junte os numeradores", html: "x + 1 + x = 2x + 1.", tex: T(1, "\\frac{2x + 1}{x(x + 1)}") },
      ],
    },
  };
  for (const e of Object.values(EX)) e.passos.forEach(p => (p.f = avaliar(p.tex)));

  /* ---------------------------------------------------------------- gráfico */

  // Desenha a forma simplificada; os x proibidos que ela "conserta" viram
  // bolinhas abertas (o buraco), e o x do leitor, uma bolinha cheia.
  function grafico(box, e, x0) {
    const W = 420, H = 420, M = 26, lo = -6, hi = 6;
    const X = v => M + (v - lo) / (hi - lo) * (W - 2 * M);
    const Y = v => H - M - (v - lo) / (hi - lo) * (H - 2 * M);
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot reta-plot", role: "img", "aria-label": "Gráfico da fração, com o buraco onde ela não existe" });
    for (let v = lo; v <= hi; v++) {
      svg("line", { x1: X(v), x2: X(v), y1: Y(lo), y2: Y(hi), class: v === 0 ? "plot-axis is-x" : "plot-grid" }, g);
      svg("line", { x1: X(lo), x2: X(hi), y1: Y(v), y2: Y(v), class: v === 0 ? "plot-axis is-x" : "plot-grid" }, g);
      if (v && v % 2 === 0) {
        const tx = svg("text", { x: X(v), y: Y(0) + 16, class: "plot-tick", "text-anchor": "middle" }, g);
        tx.textContent = fmt(v);
        const ty = svg("text", { x: X(0) - 6, y: Y(v) + 4, class: "plot-tick", "text-anchor": "end" }, g);
        ty.textContent = fmt(v);
      }
    }
    const clip = svg("clipPath", { id: "fa-clip" }, g);
    svg("rect", { x: M, y: M, width: W - 2 * M, height: H - 2 * M }, clip);
    const f = e.passos[e.passos.length - 1].f;
    // A curva em pedaços: quebra onde o valor some ou pula (assíntota).
    let d = "", antes = null;
    for (let i = 0; i <= 600; i++) {
      const x = lo + (hi - lo) * i / 600, y = f(x);
      if (!Number.isFinite(y) || Math.abs(y) > 60 || (antes !== null && Math.abs(y - antes) > 20)) { antes = null; continue; }
      d += `${antes === null ? "M" : "L"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`;
      antes = y;
    }
    svg("path", { d, class: "plot-curve", "clip-path": "url(#fa-clip)" }, g);
    e.proibidos.forEach(h => {
      const y = f(h);
      if (Number.isFinite(y) && Math.abs(y) <= 6) svg("circle", { cx: X(h), cy: Y(y), r: 6, class: "fa-buraco" }, g);
    });
    svg("line", { x1: X(x0), x2: X(x0), y1: Y(lo), y2: Y(hi), class: "plot-cross" }, g);
    const y0 = f(x0);
    if (!e.proibidos.includes(x0) && Number.isFinite(y0) && Math.abs(y0) <= 6) svg("circle", { cx: X(x0), cy: Y(y0), r: 6, class: "plot-dot is-hover" }, g);
    box.replaceChildren(g);
  }

  /* ---------------------------------------------------------------- seção 1 */

  function initSimplificar(section) {
    const input = section.querySelector("input[name=fx]");
    const out = section.querySelector(".out-fx");
    const btnBox = section.querySelector(".calc-examples");
    const result = section.querySelector(".calc-result");
    const fig = section.querySelector(".fa-fig");
    const list = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    const fx = Number(q.get("fx"));
    if (q.has("fx") && Number.isInteger(fx) && fx >= -6 && fx <= 6) input.value = fx;
    let ex = EX[q.get("ex")] ? q.get("ex") : "diferenca";

    for (const [key, e] of Object.entries(EX)) {
      if (!e.botao) continue;
      const b = el("button", null, e.botao);
      b.type = "button";
      b.dataset.ex = key;
      b.addEventListener("click", () => { ex = key; draw(); });
      btnBox.appendChild(b);
    }

    const valor = (f, x) => { const v = f(x); return Number.isFinite(v) ? v : null; };

    function draw() {
      const x = Number(input.value), e = EX[ex];
      out.textContent = fmt(x);
      btnBox.querySelectorAll("[data-ex]").forEach(b => b.setAttribute("aria-pressed", b.dataset.ex === ex));
      const ini = e.passos[0], fim = e.passos[e.passos.length - 1];
      const cond = `x \\ne ${e.proibidos.map(h => texNum(h)).join(",\\ ")}`;
      const a = el("span", "res-part"), b = el("span", "res-part");
      math(a, `\\displaystyle {${ini.tex}}`);
      math(b, `\\displaystyle {} = ${fim.tex} \\quad (${cond})`);
      result.replaceChildren(a, " ", b);
      grafico(fig, e, x);

      const proibido = e.proibidos.includes(x);
      list.replaceChildren();
      e.passos.forEach(p => {
        const li = el("li");
        const s = el("span");
        s.innerHTML = p.tag ? `<strong>${p.tag}.</strong> ${p.html}` : p.html;
        const m = el("span", "calc-math");
        math(m, `\\displaystyle {${p.tex}}`);
        const v = valor(p.f, x);
        const vs = el("span", "step-val", v === null
          ? `Com x = ${fmt(x)}, não existe: o denominador dá zero.`
          : `Com x = ${fmt(x)}, vale ${fmt(v, 4)}.`);
        li.append(s, m, vs);
        list.appendChild(li);
      });
      const vfim = valor(fim.f, x);
      note.innerHTML = proibido
        ? `<strong>x = ${fmt(x)} é proibido na fração original</strong>, mas a forma simplificada dá ${vfim === null ? "também uma divisão por zero" : fmt(vfim, 4)}. As duas são iguais em todo o resto, e diferentes só aí: no gráfico, a curva da original tem um <strong>buraco</strong> nesse ponto (a bolinha aberta). Por isso a resposta completa leva a condição (${e.proibidos.map(h => `x ≠ ${fmt(h)}`).join(", ")}).`
        : `Todas as linhas valem ${fmt(valor(ini.f, x), 4)} com x = ${fmt(x)}: simplificar não muda o valor. Leve o slider até ${e.proibidos.map(h => fmt(h)).join(" ou ")} para ver o que acontece num x proibido.`;
      saveParams({ ex, fx: x });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = { x: { min: 1, max: 9, value: 2 } };
  const t = v => texNum(v, 4);
  const sg = (...v) => Licao.sgn(...v);
  const fr = (n, d) => `\\frac{${n}}{${d}}`;

  const RULES = {
    corta({ x }) {
      const L = (2 * x + 6) / (x + 3);
      return {
        lhs: [`${fr(`2 \\cdot ${x} + 6`, `${x} + 3`)} = ${fr(2 * x + 6, x + 3)} = ${t(L)}`, L],
        rhs: [`2`, 2],
        note: `2x + 6 = 2(x + 3): o fator (x + 3) está em cima e embaixo, e corta. Com x = ${x}, ${2 * x + 6} ÷ ${x + 3} = 2.`,
      };
    },
    soma({ x }) {
      const L = 1 / x + 1 / (x + 1), R = (2 * x + 1) / (x * (x + 1));
      return {
        lhs: [`${fr(1, x)} + ${fr(1, x + 1)} ${sg(L)} ${t(L)}`, L],
        rhs: [`${fr(`2 \\cdot ${x} + 1`, `${x} \\cdot ${x + 1}`)} = ${fr(2 * x + 1, x * (x + 1))} ${sg(R)} ${t(R)}`, R],
        note: "O denominador comum é x(x + 1); cada numerador é multiplicado pelo que falta no seu denominador.",
      };
    },
    mult({ x }) {
      const L = (x / (x + 1)) * ((x + 1) / (x + 2)), R = x / (x + 2);
      return {
        lhs: [`${fr(x, x + 1)} \\cdot ${fr(x + 1, x + 2)} ${sg(L)} ${t(L)}`, L],
        rhs: [`${fr(x, x + 2)} ${sg(R)} ${t(R)}`, R],
        note: "Numerador com numerador, denominador com denominador. O (x + 1) aparece em cima e embaixo e corta antes de multiplicar.",
      };
    },
    divide({ x }) {
      const L = (x / (x + 1)) / (x / (x + 2)), R = (x + 2) / (x + 1);
      return {
        lhs: [`${fr(x, x + 1)} \\div ${fr(x, x + 2)} ${sg(L)} ${t(L)}`, L],
        rhs: [`${fr(x + 2, x + 1)} ${sg(R)} ${t(R)}`, R],
        note: "Dividir é multiplicar pelo inverso: x/(x + 1) · (x + 2)/x, e o x corta.",
      };
    },
    erroParcela({ x }) {
      const L = (x + 6) / (x + 2);
      return {
        lhs: [`${fr(`${x} + 6`, `${x} + 2`)} = ${fr(x + 6, x + 2)} ${sg(L)} ${t(L)}`, L],
        rhs: [`${fr(6, 2)} = 3`, 3],
        note: "O x não é fator: ele está somado. Só se corta o que multiplica o numerador inteiro e o denominador inteiro.",
      };
    },
    erroSoma({ x }) {
      const L = 1 / x + 1 / (x + 1), R = 2 / (2 * x + 1);
      return {
        lhs: [`${fr(1, x)} + ${fr(1, x + 1)} ${sg(L)} ${t(L)}`, L],
        rhs: [`${fr(2, `${x} + ${paren(x + 1)}`)} = ${fr(2, 2 * x + 1)} ${sg(R)} ${t(R)}`, R],
        note: "Somar numerador com numerador e denominador com denominador não é somar frações — nem com números: 1/2 + 1/2 não é 2/4.",
      };
    },
  };

  Licao.renderTex();
  const s1 = document.querySelector("#simplificar");
  if (s1) initSimplificar(s1);
  Licao.regras(VARS, RULES);
})();
