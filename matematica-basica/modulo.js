/* Módulo: |x − a| como distância na reta (dois pontos e a régua entre eles),
 * as equações e inequações |x − a| = r, < r, ≤ r, > r, ≥ r resolvidas e
 * desenhadas na reta, e os cards de regra. Os utilitários vêm de licao.js.
 */
(() => {
  const { fmt, texNum, tone, paren, el, svg, saveParams } = Licao;
  const t = v => texNum(v);
  // Barras de módulo em par viram \lvert … \rvert: com | solto, o KaTeX
  // trata o − logo depois como subtração e abre um espaço (| − 3|).
  const barras = s => { let k = 0; return s.replace(/\|/g, () => (k++ % 2 ? "\\rvert " : "\\lvert ")); };
  const math = (e, src) => Licao.math(e, barras(src));

  // Lê sliders da seção e da URL; devolve o estado ligado aos sliders.
  function sliders(section, nomes) {
    const q = new URLSearchParams(location.search);
    const ins = {}, outs = {}, st = {};
    nomes.forEach(n => {
      ins[n] = section.querySelector(`input[name=${n}]`);
      outs[n] = section.querySelector(`.out-${n}`);
      const v = Number(q.get(n));
      if (q.has(n) && Number.isInteger(v) && v >= Number(ins[n].min) && v <= Number(ins[n].max)) ins[n].value = v;
    });
    const ler = () => nomes.forEach(n => { st[n] = Number(ins[n].value); outs[n].textContent = fmt(st[n]); });
    return { st, ler };
  }

  // A reta numérica de lo a hi; devolve o svg e a escala.
  function reta(lo, hi, H, Y, rotulo) {
    const W = 640, L = 22, R = 22;
    const P = v => L + (v - lo) / (hi - lo) * (W - L - R);
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot reta", role: "img", "aria-label": rotulo });
    svg("line", { x1: L - 8, x2: W - R + 8, y1: Y, y2: Y, class: "plot-axis is-x" }, g);
    const cada = hi - lo > 20 ? 2 : 1;
    for (let v = lo; v <= hi; v++) {
      svg("line", { x1: P(v), x2: P(v), y1: Y - (v === 0 ? 8 : 4), y2: Y + (v === 0 ? 8 : 4), class: v === 0 ? "plot-axis" : "plot-grid" }, g);
      if (v % cada === 0) {
        const tt = svg("text", { x: P(v), y: Y + 22, class: `plot-tick${v === 0 ? " is-zero" : ""}`, "text-anchor": "middle" }, g);
        tt.textContent = fmt(v);
      }
    }
    return { g, P, W, L, R };
  }

  /* ---------------------------------------------------------------- 1. distância */

  function initDistancia(section) {
    const { st, ler } = sliders(section, ["dx", "da"]);
    const fig = section.querySelector(".reta-box");
    const eq = section.querySelector(".calc-result");
    const text = section.querySelector(".intro-text");

    function draw() {
      ler();
      const x = st.dx, a = st.da, d = Math.abs(x - a);
      const { g, P } = reta(-10, 10, 96, 62, `Distância entre ${fmt(x)} e ${fmt(a)}: ${fmt(d)}`);
      if (d) {
        // A régua entre os dois pontos, com a medida em cima.
        const x1 = P(Math.min(x, a)), x2 = P(Math.max(x, a)), yb = 30;
        svg("path", { d: `M${x1},${yb + 8} V${yb} H${x2} V${yb + 8}`, class: "mod-regua" }, g);
        const lt = svg("text", { x: (x1 + x2) / 2, y: yb - 8, class: "plot-label mod-medida", "text-anchor": "middle" }, g);
        lt.textContent = fmt(d);
      }
      svg("circle", { cx: P(a), cy: 62, r: 7, class: "plot-dot reta-q" }, g);
      svg("circle", { cx: P(x), cy: 62, r: 7, class: "plot-dot reta-a" }, g);
      fig.replaceChildren(g);

      math(eq, a === 0
        ? `\\displaystyle |${tone(t(x), 2)}| = ${tone(t(d), 1)}`
        : `\\displaystyle |${tone(t(x), 2)} - ${tone(paren(a), 5)}| = |${t(x - a)}| = ${tone(t(d), 1)}`);
      const partes = [];
      if (a === 0) {
        partes.push(`<p>Com a = 0, a conta é só |x|: a <strong>distância de ${fmt(x)} até o zero</strong>. ${x < 0 ? `O ${fmt(x)} está ${fmt(-x)} casas à esquerda, e o módulo fica com o ${fmt(-x)}: tira o sinal, guarda a distância.` : x > 0 ? "Um número positivo já é a própria distância: o módulo não muda nada." : "O zero está a distância zero de si mesmo."}</p>`);
      } else {
        partes.push(`<p>De ${fmt(x)} até ${fmt(a)} são <strong>${fmt(d)} ${d === 1 ? "casa" : "casas"}</strong>. A conta x − a dá ${fmt(x - a)}${x - a < 0 ? ", negativo porque x está à esquerda de a; o módulo tira o sinal e fica só a distância" : ""}.</p>`);
        partes.push(`<p>Trocar a ordem não muda nada: |${fmt(a)} − ${x < 0 ? `(${fmt(x)})` : fmt(x)}| = |${fmt(a - x)}| = ${fmt(d)}. Distância não tem sentido de ida e volta.</p>`);
      }
      text.innerHTML = partes.join("");
      saveParams({ dx: x, da: a });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- 2. equações e inequações */

  const REL = { "=": "=", "<": "<", "<=": "\\le", ">": ">", ">=": "\\ge" };
  const REL_TXT = { "=": "igual a", "<": "menor que", "<=": "menor ou igual a", ">": "maior que", ">=": "maior ou igual a" };

  // A solução de |x − a| rel r: pontos, intervalo, raios, tudo ou nada.
  function resolver(a, r, rel) {
    const lo = a - r, hi = a + r;
    if (rel === "=") {
      if (r < 0) return { tipo: "vazio" };
      if (r === 0) return { tipo: "pontos", pts: [a] };
      return { tipo: "pontos", pts: [lo, hi] };
    }
    if (rel === "<" || rel === "<=") {
      if (r < 0 || (r === 0 && rel === "<")) return { tipo: "vazio" };
      if (r === 0) return { tipo: "pontos", pts: [a] };
      return { tipo: "dentro", lo, hi, fechado: rel === "<=" };
    }
    if (r < 0 || (r === 0 && rel === ">=")) return { tipo: "tudo" };
    if (r === 0) return { tipo: "menos", pt: a };
    return { tipo: "fora", lo, hi, fechado: rel === ">=" };
  }

  // Notação brasileira: ]a, b[ aberto, [a, b] fechado.
  function conjuntoTex(s) {
    const ab = s.fechado ? "[" : "]", fe = s.fechado ? "]" : "[";
    switch (s.tipo) {
      case "vazio": return "S = \\varnothing";
      case "tudo": return "S = \\mathbb{R}";
      case "pontos": return `S = \\{${s.pts.map(t).join(",\\ ")}\\}`;
      case "menos": return `S = \\mathbb{R} - \\{${t(s.pt)}\\}`;
      case "dentro": return `S = \\left${ab}${t(s.lo)},\\ ${t(s.hi)}\\right${fe}`;
      default: return `S = \\left]-\\infty,\\ ${t(s.lo)}\\right${fe} \\cup \\left${ab}${t(s.hi)},\\ +\\infty\\right[`;
    }
  }

  function desenharSol(box, a, r, s) {
    const lo = -13, hi = 13, Y = 40;
    const { g, P, W, L, R } = reta(lo, hi, 80, Y, "A solução na reta");
    const ray = (x0, dir) => {
      const end = dir > 0 ? W - R + 6 : L - 6;
      svg("line", { x1: P(x0), x2: end, y1: Y, y2: Y, class: "ineq-ray" }, g);
      svg("path", { d: `M${end + dir * 8},${Y} l${-dir * 12},-7 l0,14 z`, class: "ineq-head" }, g);
    };
    const dot = (v, fechado) => svg("circle", { cx: P(v), cy: Y, r: 7, class: `ineq-dot${fechado ? "" : " is-open"}` }, g);
    if (s.tipo === "tudo" || s.tipo === "menos") { ray(0, 1); ray(0, -1); svg("line", { x1: L - 6, x2: W - R + 6, y1: Y, y2: Y, class: "ineq-ray" }, g); }
    if (s.tipo === "menos") dot(s.pt, false);
    if (s.tipo === "dentro") { svg("line", { x1: P(s.lo), x2: P(s.hi), y1: Y, y2: Y, class: "ineq-ray" }, g); dot(s.lo, s.fechado); dot(s.hi, s.fechado); }
    if (s.tipo === "fora") { ray(s.lo, -1); ray(s.hi, 1); dot(s.lo, s.fechado); dot(s.hi, s.fechado); }
    if (s.tipo === "pontos") s.pts.forEach(v => dot(v, true));
    // O centro a, sempre visível, por baixo das marcas.
    const c = svg("path", { d: `M${P(a)},${Y + 30} l-6,9 h12 z`, class: "mod-centro" }, g);
    g.insertBefore(c, g.firstChild);
    const lc = svg("text", { x: P(a), y: Y + 52, class: "plot-label mod-centro-txt", "text-anchor": "middle" }, g);
    lc.textContent = `a = ${fmt(a)}`;
    g.setAttribute("viewBox", `0 0 ${W} 100`);
    box.replaceChildren(g);
  }

  function passos(a, r, rel, s) {
    const exp = a === 0 ? "|x|" : `|x - ${paren(a)}|`;
    const expTxt = a === 0 ? "|x|" : `|x − ${a < 0 ? `(${fmt(a)})` : fmt(a)}|`;
    const out = [];
    out.push({ tag: "Leia como distância", html: `${expTxt} é a distância de x até ${fmt(a)}. A pergunta é: quais x estão a uma distância ${REL_TXT[rel]} ${fmt(r)} de ${fmt(a)}?`,
      tex: `${exp} ${REL[rel]} ${t(r)}` });
    if (r < 0) {
      out.push({ tag: "Distância negativa", html: rel === "=" || rel[0] === "<"
          ? "Distância nunca é negativa: nenhum x serve."
          : "Toda distância é maior que um número negativo: todo x serve.",
        tex: conjuntoTex(s) });
      return out;
    }
    if (r === 0) {
      const txt = { "=": `Distância zero só tem o próprio ${fmt(a)}.`, "<": "Nenhuma distância é menor que zero.", "<=": `Distância até zero, só a do próprio ${fmt(a)}.`,
        ">": `Qualquer x, menos o próprio ${fmt(a)}, está a uma distância positiva.`, ">=": "Toda distância é maior ou igual a zero." }[rel];
      out.push({ tag: "Distância zero", html: txt, tex: conjuntoTex(s) });
      return out;
    }
    if (rel === "=") {
      out.push({ tag: "Dois lados", html: `Andando ${fmt(r)} a partir de ${fmt(a)}, há um ponto à direita e um à esquerda. Em conta: x − a pode valer ${fmt(r)} ou −${fmt(r)}.`,
        tex: `x - ${paren(a)} = ${t(r)} \\quad \\text{ou} \\quad x - ${paren(a)} = ${t(-r)}` });
      out.push({ tag: "Resolva cada uma", html: "Duas equações do 1º grau, uma solução cada.",
        tex: `x = ${t(a)} + ${t(r)} = ${tone(t(a + r), 1)} \\quad \\text{ou} \\quad x = ${t(a)} - ${t(r)} = ${tone(t(a - r), 1)}` });
      out.push({ tag: "Prova", html: "As duas estão à distância certa.",
        tex: `|${t(a + r)} - ${paren(a)}| = |${t(r)}| = ${t(r)} \\qquad |${t(a - r)} - ${paren(a)}| = |${t(-r)}| = ${t(r)}` });
    } else if (rel[0] === "<") {
      const R2 = rel === "<" ? "<" : "\\le";
      out.push({ tag: "Perto do centro", html: `Distância ${REL_TXT[rel]} ${fmt(r)} quer dizer: x − a fica entre −${fmt(r)} e ${fmt(r)}. Uma inequação dupla.`,
        tex: `${t(-r)} ${R2} x - ${paren(a)} ${R2} ${t(r)}` });
      out.push({ tag: "Some a nos três lados", html: `Somar ${fmt(a)} em todos os membros isola o x sem virar sinal nenhum.`,
        tex: `${tone(t(a - r), 1)} ${R2} x ${R2} ${tone(t(a + r), 1)}` });
      out.push({ tag: "Em intervalo", html: `Um pedaço só da reta, centrado em ${fmt(a)}, com ${fmt(r)} para cada lado. ${rel === "<" ? "As pontas ficam de fora (distância exatamente " + fmt(r) + " não é menor que " + fmt(r) + ")." : "As pontas entram."}`,
        tex: conjuntoTex(s) });
    } else {
      const R2 = rel === ">" ? ">" : "\\ge", R3 = rel === ">" ? "<" : "\\le";
      out.push({ tag: "Longe do centro", html: `Distância ${REL_TXT[rel]} ${fmt(r)}: x − a passa de ${fmt(r)} para cima <em>ou</em> de −${fmt(r)} para baixo. Duas inequações, ligadas por “ou”.`,
        tex: `x - ${paren(a)} ${R3} ${t(-r)} \\quad \\text{ou} \\quad x - ${paren(a)} ${R2} ${t(r)}` });
      out.push({ tag: "Resolva cada uma", html: `Some ${fmt(a)} dos dois lados de cada uma.`,
        tex: `x ${R3} ${tone(t(a - r), 1)} \\quad \\text{ou} \\quad x ${R2} ${tone(t(a + r), 1)}` });
      out.push({ tag: "Em intervalo", html: "Dois pedaços da reta, um para cada lado, e o miolo de fora.", tex: conjuntoTex(s) });
    }
    return out;
  }

  function initEquacoes(section) {
    const { st, ler } = sliders(section, ["ea", "er"]);
    const btns = section.querySelectorAll("[data-rel]");
    const fig = section.querySelector(".reta-box");
    const result = section.querySelector(".calc-result");
    const list = section.querySelector(".calc-steps");
    const q = new URLSearchParams(location.search);
    let rel = REL[q.get("rel")] ? q.get("rel") : "<";

    function draw() {
      ler();
      const a = st.ea, r = st.er, s = resolver(a, r, rel);
      btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.rel === rel));
      const exp = a === 0 ? "|x|" : `|x - ${paren(a)}|`;
      const r1 = el("span", "res-part"), r2 = el("span", "res-part");
      math(r1, `\\displaystyle ${exp} ${REL[rel]} ${t(r)}`);
      math(r2, `\\displaystyle \\;\\Rightarrow\\; ${tone(conjuntoTex(s), 1)}`);
      result.replaceChildren(r1, " ", r2);
      desenharSol(fig, a, r, s);
      list.replaceChildren();
      passos(a, r, rel, s).forEach(p => {
        const li = el("li");
        const sp = el("span");
        sp.innerHTML = `<strong>${p.tag}.</strong> ${p.html}`;
        const m = el("span", "calc-math");
        math(m, `\\displaystyle ${p.tex}`);
        li.append(sp, m);
        list.appendChild(li);
      });
      saveParams({ ea: a, er: r, rel });
    }

    btns.forEach(b => b.addEventListener("click", () => { rel = b.dataset.rel; draw(); }));
    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    a: { min: -9, max: 9, value: -4 },
    b: { min: -9, max: 9, value: 3, skip: 0 },
  };
  const ab = v => `|${t(v)}|`;

  const RULES = {
    oposto({ a }) {
      return { lhs: [`|-${paren(a)}| = ${ab(-a)} = ${t(Math.abs(a))}`, Math.abs(-a)], rhs: [`${ab(a)} = ${t(Math.abs(a))}`, Math.abs(a)],
        note: "Um número e o seu oposto estão à mesma distância do zero, um de cada lado." };
    },
    produto({ a, b }) {
      return { lhs: [`|${paren(a)} \\cdot ${paren(b)}| = ${ab(a * b)} = ${t(Math.abs(a * b))}`, Math.abs(a * b)],
        rhs: [`${ab(a)} \\cdot ${ab(b)} = ${t(Math.abs(a))} \\cdot ${t(Math.abs(b))} = ${t(Math.abs(a) * Math.abs(b))}`, Math.abs(a) * Math.abs(b)],
        note: "O sinal de um produto só decide o lado; o tamanho é o produto dos tamanhos. Vale igual para a divisão." };
    },
    ordem({ a, b }) {
      return { lhs: [`|${t(a)} - ${paren(b)}| = ${ab(a - b)} = ${t(Math.abs(a - b))}`, Math.abs(a - b)],
        rhs: [`|${t(b)} - ${paren(a)}| = ${ab(b - a)} = ${t(Math.abs(b - a))}`, Math.abs(b - a)],
        note: "a − b e b − a são opostos: mesma distância, sinais trocados." };
    },
    raiz({ a }) {
      return { lhs: [`\\sqrt{${paren(a)}^2} = \\sqrt{${a * a}} = ${t(Math.abs(a))}`, Math.abs(a)], rhs: [`${ab(a)} = ${t(Math.abs(a))}`, Math.abs(a)],
        note: a < 0 ? `O quadrado apaga o sinal, e a raiz devolve o número positivo: √(${fmt(a)})² não volta para ${fmt(a)}.` : "Com a negativo, a diferença entre √(a²) e a fica visível." };
    },
    erroSoma({ a, b }) {
      return { lhs: [`|${t(a)} + ${paren(b)}| = ${ab(a + b)} = ${t(Math.abs(a + b))}`, Math.abs(a + b)],
        rhs: [`${ab(a)} + ${ab(b)} = ${t(Math.abs(a) + Math.abs(b))}`, Math.abs(a) + Math.abs(b)],
        note: (a < 0) === (b < 0) || a === 0
          ? "Com sinais iguais dá certo. Ponha a e b com sinais diferentes."
          : `Com sinais diferentes, um desconta o outro, e |a + b| fica menor. Por isso vale sempre |a + b| ≤ |a| + |b|: a desigualdade triangular.` };
    },
    erroRaiz({ a }) {
      return { lhs: [`\\sqrt{${paren(a)}^2} = ${t(Math.abs(a))}`, Math.abs(a)], rhs: [`${t(a)}`, a],
        note: a < 0 ? "Para a negativo, √(a²) dá o oposto de a." : "Com a ≥ 0 coincide. Mova a para um negativo." };
    },
  };

  // Os cards passam pelo Licao.regras, que não sabe das barras.
  for (const [k, f] of Object.entries(RULES)) RULES[k] = st => {
    const o = f(st);
    return { ...o, lhs: [barras(o.lhs[0]), o.lhs[1]], rhs: [barras(o.rhs[0]), o.rhs[1]] };
  };

  Licao.renderTex();
  const s1 = document.querySelector("#distancia");
  if (s1) initDistancia(s1);
  const s2 = document.querySelector("#equacoes");
  if (s2) initEquacoes(s2);
  Licao.regras(VARS, RULES);
})();
