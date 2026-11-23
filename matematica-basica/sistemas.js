/* Sistemas de equações do 1º grau: as duas retas no plano, com os
 * coeficientes nos sliders e o ponto de encontro marcado; a classificação
 * (uma, nenhuma ou infinitas soluções); e o passo a passo dos métodos da
 * substituição e da adição para o mesmo sistema, com a prova. As contas são
 * feitas em frações exatas. Os utilitários vêm de licao.js.
 */
(() => {
  const { fmt, tone, math, el, svg, saveParams } = Licao;

  /* ---------------------------------------------------------------- frações */

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  function F(n, d = 1) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  }
  const add = (p, q) => F(p.n * q.d + q.n * p.d, p.d * q.d);
  const sub = (p, q) => F(p.n * q.d - q.n * p.d, p.d * q.d);
  const mul = (p, q) => F(p.n * q.n, p.d * q.d);
  const div = (p, q) => F(p.n * q.d, p.d * q.n);
  const val = p => p.n / p.d;
  const isZero = p => p.n === 0;
  // TeX de uma fração, com o sinal fora: −\frac{3}{2}.
  const ftex = p => (p.d === 1 ? `${p.n < 0 ? "-" : ""}${Math.abs(p.n)}` : `${p.n < 0 ? "-" : ""}\\frac{${Math.abs(p.n)}}{${p.d}}`);
  const ftxt = p => (p.d === 1 ? fmt(p.n) : `${p.n < 0 ? "−" : ""}${Math.abs(p.n)}/${p.d}`);
  const fparen = p => (p.n < 0 ? `\\left(${ftex(p)}\\right)` : ftex(p));

  // c₁x + c₂y + … sem "1x", "+ −" nem termos nulos. termos: [[F, "x"], …]
  function lin(termos) {
    let s = "";
    termos.forEach(([c, v]) => {
      if (isZero(c)) return;
      const abs = F(Math.abs(c.n), c.d);
      const corpo = v && abs.n === 1 && abs.d === 1 ? v : `${ftex(abs)}${v ? (abs.d === 1 ? "" : "\\,") + v : ""}`;
      s += s ? ` ${c.n < 0 ? "-" : "+"} ${corpo}` : `${c.n < 0 ? "-" : ""}${corpo}`;
    });
    return s || "0";
  }
  const eqTex = (a, b, c) => `${lin([[F(a), "x"], [F(b), "y"]])} = ${c}`;

  /* ---------------------------------------------------------------- o sistema */

  const NOMES = ["a1", "b1", "c1", "a2", "b2", "c2"];
  const st = {};

  // Uma, nenhuma ou infinitas soluções, e a solução quando é uma.
  function classificar({ a1, b1, c1, a2, b2, c2 }) {
    const D = a1 * b2 - a2 * b1;
    const vazia1 = a1 === 0 && b1 === 0, vazia2 = a2 === 0 && b2 === 0;
    if (vazia1 || vazia2) {
      const bad = (vazia1 && c1 !== 0) || (vazia2 && c2 !== 0);
      if (bad) return { tipo: "nenhuma", vazia: true };
      return { tipo: "infinitas", vazia: true };
    }
    if (D !== 0) {
      const x = F(c1 * b2 - c2 * b1, D), y = F(a1 * c2 - a2 * c1, D);
      return { tipo: "uma", x, y, D };
    }
    // Paralelas ou a mesma reta: com D = 0, é a mesma reta se c acompanha.
    const mesma = a1 * c2 - a2 * c1 === 0 && b1 * c2 - b2 * c1 === 0;
    return { tipo: mesma ? "infinitas" : "nenhuma", D };
  }

  const sistemaTex = s => `\\begin{cases} ${tone(eqTex(s.a1, s.b1, s.c1), 2)} \\\\ ${tone(eqTex(s.a2, s.b2, s.c2), 5)} \\end{cases}`;

  /* ---------------------------------------------------------------- gráfico */

  function desenhar(box, s, sol) {
    const W = 420, H = 420, M = 28, lo = -6, hi = 6;
    const X = v => M + (v - lo) / (hi - lo) * (W - 2 * M);
    const Y = v => H - M - (v - lo) / (hi - lo) * (H - 2 * M);
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot reta-plot", role: "img",
      "aria-label": `As retas ${eqTex(s.a1, s.b1, s.c1)} e ${eqTex(s.a2, s.b2, s.c2)}` });
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
    const clip = svg("clipPath", { id: "sis-clip" }, g);
    svg("rect", { x: M, y: M, width: W - 2 * M, height: H - 2 * M }, clip);
    const reta = (a, b, c, cls) => {
      if (a === 0 && b === 0) return;
      const big = 100;
      const [x1, y1, x2, y2] = b !== 0
        ? [-big, (c + a * big) / b, big, (c - a * big) / b]
        : [c / a, -big, c / a, big];
      svg("line", { x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2), class: cls, "clip-path": "url(#sis-clip)" }, g);
    };
    reta(s.a1, s.b1, s.c1, "sis-r1");
    reta(s.a2, s.b2, s.c2, `sis-r2${sol.tipo === "infinitas" && !sol.vazia ? " is-same" : ""}`);
    if (sol.tipo === "uma") {
      const x = val(sol.x), y = val(sol.y);
      if (Math.abs(x) <= 6 && Math.abs(y) <= 6) {
        svg("circle", { cx: X(x), cy: Y(y), r: 7, class: "plot-dot is-hover" }, g);
        const t = svg("text", { x: X(x) + (x > 3 ? -10 : 10), y: Y(y) + (y > 4 ? 20 : -10), class: "plot-label", "text-anchor": x > 3 ? "end" : "start" }, g);
        t.textContent = `(${ftxt(sol.x)}, ${ftxt(sol.y)})`;
      }
    }
    box.replaceChildren(g);
  }

  /* ---------------------------------------------------------------- seção das retas */

  function textoClasse(s, sol) {
    if (sol.vazia) {
      const i = s.a1 === 0 && s.b1 === 0 ? 1 : 2, c = i === 1 ? s.c1 : s.c2;
      return c === 0
        ? `<p>A ${i}ª equação ficou 0 = 0: sem x nem y, ela vale sempre e não restringe nada. Sobra uma equação só, com <strong>infinitas soluções</strong>.</p>`
        : `<p>A ${i}ª equação ficou 0 = ${fmt(c)}, que é falso para qualquer x e y. O sistema <strong>não tem solução</strong>.</p>`;
    }
    if (sol.tipo === "uma") {
      const fora = Math.abs(val(sol.x)) > 6 || Math.abs(val(sol.y)) > 6 ? " (fora da janela do gráfico)" : "";
      return `<p>As retas se cruzam num ponto só${fora}: <strong>uma solução</strong>, x = ${ftxt(sol.x)} e y = ${ftxt(sol.y)}. É o único par (x, y) que está nas duas retas ao mesmo tempo, isto é, que satisfaz as duas equações.</p>`;
    }
    if (sol.tipo === "nenhuma") return "<p>As retas são <strong>paralelas</strong>: têm a mesma inclinação e nunca se encontram. O sistema <strong>não tem solução</strong> — as duas equações pedem coisas contraditórias.</p>";
    return "<p>As duas equações descrevem <strong>a mesma reta</strong> (uma é a outra multiplicada por um número). Todos os pontos dela servem: <strong>infinitas soluções</strong>.</p>";
  }

  /* ---------------------------------------------------------------- passo a passo */

  function prova(s, sol) {
    const v1 = add(mul(F(s.a1), sol.x), mul(F(s.b1), sol.y)), v2 = add(mul(F(s.a2), sol.x), mul(F(s.b2), sol.y));
    return {
      tag: "Prova", html: "Ponha os valores nas duas equações originais. Cada uma tem de dar o número do lado direito.",
      // Uma equação por linha, para caber no celular.
      tex: `\\begin{gathered} ${tone(`${s.a1} \\cdot ${fparen(sol.x)} + ${fparen(F(s.b1))} \\cdot ${fparen(sol.y)} = ${ftex(v1)}`, 2)} \\\\ ${tone(`${s.a2} \\cdot ${fparen(sol.x)} + ${fparen(F(s.b2))} \\cdot ${fparen(sol.y)} = ${ftex(v2)}`, 5)} \\end{gathered}`,
    };
  }

  // Fim comum quando a incógnita some: 0 = k.
  function degenerado(k) {
    return isZero(k)
      ? { tag: "Sempre vale", html: "As incógnitas sumiram e sobrou 0 = 0, que é verdade para qualquer valor. As duas equações dizem a mesma coisa: <strong>infinitas soluções</strong>.", tex: "0 = 0" }
      : { tag: "Nunca vale", html: `As incógnitas sumiram e sobrou 0 = ${ftxt(k)}, que é falso. Nenhum par (x, y) satisfaz as duas: <strong>sem solução</strong>.`, tex: `0 = ${ftex(k)}` };
  }

  function substituicao(s, sol) {
    const eqs = [[s.a1, s.b1, s.c1], [s.a2, s.b2, s.c2]];
    // Escolhe a equação e a incógnita mais fáceis de isolar: coeficiente ±1
    // primeiro, depois qualquer um diferente de zero.
    const cands = [];
    eqs.forEach((e, i) => [0, 1].forEach(k => { if (e[k] !== 0) cands.push({ i, k, peso: Math.abs(e[k]) === 1 ? 0 : 1 }); }));
    cands.sort((p, q) => p.peso - q.peso);
    const { i, k } = cands[0];
    const j = 1 - i, V = k === 0 ? "x" : "y", Wv = k === 0 ? "y" : "x";
    const [ci, cw, cc] = [eqs[i][k], eqs[i][1 - k], eqs[i][2]];
    const p = F(cc, ci), q = F(-cw, ci); // V = p + q·W
    const passos = [];
    passos.push({ tag: "Isole uma incógnita", html: `Na ${i + 1}ª equação, isole o ${V}${Math.abs(ci) === 1 ? " — o coeficiente dele é " + fmt(ci) + ", então não aparecem frações" : ""}.`,
      tex: `${V} = ${lin([[p, ""], [q, Wv]])}` });
    const [vj, wj, cj] = [eqs[j][k], eqs[j][1 - k], eqs[j][2]];
    passos.push({ tag: "Substitua na outra", html: `Troque o ${V} da ${j + 1}ª equação por essa expressão. Agora só há ${Wv}: virou uma <a href="equacao-1grau.html">equação do 1º grau</a>.`,
      tex: `${vj === 0 ? "" : `${vj === 1 ? "" : vj === -1 ? "-" : vj}\\left(${lin([[p, ""], [q, Wv]])}\\right)`}${wj === 0 ? "" : ` ${wj < 0 ? "-" : vj === 0 ? "" : "+"} ${Math.abs(wj) === 1 ? "" : Math.abs(wj)}${Wv}`} = ${cj}` });
    const K = add(mul(F(vj), q), F(wj)), R = sub(F(cj), mul(F(vj), p));
    passos.push({ tag: "Simplifique", html: "Distribua e junte os termos semelhantes de cada lado.",
      tex: `${lin([[K, Wv]])} = ${ftex(R)}` });
    if (isZero(K)) { passos.push(degenerado(R)); return passos; }
    const w = div(R, K);
    passos.push({ tag: `Ache o ${Wv}`, html: `Divida os dois lados por ${ftxt(K)}.`, tex: `${Wv} = ${tone(ftex(w), 1)}` });
    const v = add(p, mul(q, w));
    // V = p + q·w, com o w já trocado pelo número.
    const pT = isZero(p) ? "" : ftex(p);
    const qT = isZero(q) ? "" : `${q.n < 0 ? "-" : pT ? "+" : ""} ${ftex(F(Math.abs(q.n), q.d))} \\cdot ${fparen(w)}`;
    passos.push({ tag: `Volte para o ${V}`, html: `Ponha ${Wv} = ${ftxt(w)} na expressão do primeiro passo.`,
      tex: isZero(q) ? `${V} = ${tone(ftex(v), 1)}` : `${V} = ${pT} ${qT} = ${tone(ftex(v), 1)}` });
    passos.push(prova(s, sol));
    return passos;
  }

  function adicao(s, sol) {
    const passos = [];
    // Multiplicadores que deixam os y opostos; se um b é zero, elimina o x.
    let elim = "y", A1 = s.b1, A2 = s.b2;
    if (s.b1 === 0 || s.b2 === 0) { elim = "x"; A1 = s.a1; A2 = s.a2; }
    const fica = elim === "y" ? "x" : "y";
    const g = gcd(A1, A2);
    let k1 = A2 / g, k2 = -A1 / g;
    if (k1 < 0) { k1 = -k1; k2 = -k2; }
    const m = (e, k) => e.map(v => v * k);
    const e1 = m([s.a1, s.b1, s.c1], k1), e2 = m([s.a2, s.b2, s.c2], k2);
    const mults = [];
    if (k1 !== 1) mults.push(`a 1ª por ${fmt(k1)}`);
    if (k2 !== 1) mults.push(`a 2ª por ${fmt(k2)}`);
    passos.push({ tag: "Deixe um termo oposto", html: mults.length
        ? `Para o ${elim} sumir na soma, os coeficientes dele precisam ser opostos. Multiplique ${mults.join(" e ")} — os dois lados inteiros.`
        : `Os coeficientes do ${elim} já são opostos (${fmt(A1)} e ${fmt(A2)}): basta somar.`,
      tex: `\\begin{cases} ${tone(eqTex(e1[0], e1[1], e1[2]), 2)} \\\\ ${tone(eqTex(e2[0], e2[1], e2[2]), 5)} \\end{cases}` });
    const S = [e1[0] + e2[0], e1[1] + e2[1], e1[2] + e2[2]];
    passos.push({ tag: "Some as equações", html: `Lado esquerdo com lado esquerdo, direito com direito. O ${elim} se cancela.`,
      tex: eqTex(S[0], S[1], S[2]) });
    const coef = elim === "y" ? S[0] : S[1];
    if (coef === 0) { passos.push(degenerado(F(S[2]))); return passos; }
    const w = F(S[2], coef);
    passos.push({ tag: `Ache o ${fica}`, html: `Divida por ${fmt(coef)}.`, tex: `${fica} = ${tone(ftex(w), 1)}` });
    // Volta numa equação em que a outra incógnita aparece.
    const usa = elim === "y" ? (s.b1 !== 0 ? 1 : 2) : (s.a1 !== 0 ? 1 : 2);
    const [a, b, c] = usa === 1 ? [s.a1, s.b1, s.c1] : [s.a2, s.b2, s.c2];
    const [cf, co] = elim === "y" ? [b, a] : [a, b]; // coeficiente da que falta, e da achada
    const resto = sub(F(c), mul(F(co), w)), v = div(resto, F(cf));
    passos.push({ tag: `Volte para o ${elim}`, html: `Ponha ${fica} = ${ftxt(w)} na ${usa}ª equação e isole o ${elim}.`,
      tex: `\\begin{gathered} ${elim === "y" ? `${a} \\cdot ${fparen(w)} ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y` : `${a === 1 ? "" : a === -1 ? "-" : a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} \\cdot ${fparen(w)}`} = ${c} \\\\ ${lin([[F(cf), elim]])} = ${ftex(resto)} \\\\ ${elim} = ${tone(ftex(v), 1)} \\end{gathered}` });
    passos.push(prova(s, sol));
    return passos;
  }

  /* ---------------------------------------------------------------- montagem */

  function init() {
    const sec1 = document.querySelector("#retas"), sec2 = document.querySelector("#metodos");
    if (!sec1) return;
    const q = new URLSearchParams(location.search);
    const ins = {}, outs = {};
    NOMES.forEach(n => {
      ins[n] = sec1.querySelector(`input[name=${n}]`);
      outs[n] = sec1.querySelector(`.out-${n}`);
      const v = Number(q.get(n));
      if (q.has(n) && Number.isInteger(v) && v >= Number(ins[n].min) && v <= Number(ins[n].max)) ins[n].value = v;
    });
    let metodo = q.get("metodo") === "adicao" ? "adicao" : "substituicao";

    const eq = sec1.querySelector(".calc-result"), fig = sec1.querySelector(".sis-fig"), text = sec1.querySelector(".intro-text");
    const eq2 = sec2.querySelector(".sis-eq"), res2 = sec2.querySelector("output.calc-result"), list = sec2.querySelector(".calc-steps");
    const btns = sec2.querySelectorAll("[data-metodo]");

    function draw() {
      NOMES.forEach(n => { st[n] = Number(ins[n].value); outs[n].textContent = fmt(st[n]); });
      const sol = classificar(st);
      math(eq, `\\displaystyle ${sistemaTex(st)}`);
      desenhar(fig, st, sol);
      text.innerHTML = textoClasse(st, sol);

      btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.metodo === metodo));
      math(eq2, `\\displaystyle ${sistemaTex(st)}`);
      math(res2, sol.tipo === "uma" ? `(x,\\ y) = (${tone(ftex(sol.x), 1)},\\ ${tone(ftex(sol.y), 1)})`
        : sol.tipo === "nenhuma" ? "\\text{Sem solução}" : "\\text{Infinitas soluções}");
      const passos = sol.vazia
        ? [{ tag: "Uma equação sem incógnita", html: textoClasse(st, sol).replace(/<\/?p>/g, ""), tex: `0 = ${st.a1 === 0 && st.b1 === 0 ? st.c1 : st.c2}` }]
        : metodo === "adicao" ? adicao(st, sol) : substituicao(st, sol);
      list.replaceChildren();
      passos.forEach(p => {
        const li = el("li");
        const span = el("span");
        span.innerHTML = `<strong>${p.tag}.</strong> ${p.html}`;
        const m = el("span", "calc-math");
        math(m, `\\displaystyle ${p.tex}`);
        li.append(span, m);
        list.appendChild(li);
      });
      saveParams({ ...st, metodo });
    }

    sec1.addEventListener("input", draw);
    sec1.querySelectorAll("[data-exemplo]").forEach(b => b.addEventListener("click", () => {
      b.dataset.exemplo.split(";").forEach((v, i) => (ins[NOMES[i]].value = v));
      draw();
    }));
    btns.forEach(b => b.addEventListener("click", () => { metodo = b.dataset.metodo; draw(); }));
    draw();
  }

  // Para o teste em Node.
  if (typeof module !== "undefined") module.exports = { classificar, substituicao, adicao, F, val };

  Licao.renderTex();
  if (typeof document !== "undefined" && document.querySelector) init();
})();
