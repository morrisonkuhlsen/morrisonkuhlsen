/* Equação do 2º grau: a parábola que acompanha a, b e c, a resolução por
 * fórmula quadrática com as raízes na forma exata, e os cards de soma e produto. O
 * gráfico e os cards dividem as mesmas variáveis (licao.js).
 */
(() => {
  const { fmt, texNum, tone, paren, math, el, svg } = Licao;

  const VARS = {
    a: { min: -5, max: 5, value: 2, skip: 0 },
    b: { min: -10, max: 10, value: -5 },
    c: { min: -10, max: 25, value: 2 },
  };

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

  // √N = k√r
  function simplifyRoot(N) {
    let k = 1, r = 1;
    for (const [p, e] of Licao.factor(N)) {
      k *= p ** Math.floor(e / 2);
      r *= p ** (e % 2);
    }
    return { k, r };
  }

  // n/d reduzida, em LaTeX.
  function fracTex(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    n /= g; d /= g;
    return d === 1 ? texNum(n) : `${n < 0 ? "-" : ""}\\dfrac{${texNum(Math.abs(n))}}{${texNum(d)}}`;
  }

  // 2x² − 5x + 2, sem "+ −", sem "1x" e sem termos nulos.
  function polyTex(a, b, c) {
    const term = (k, v, first) => {
      if (k === 0) return "";
      const abs = Math.abs(k), coef = abs === 1 && v ? "" : texNum(abs);
      const sign = k < 0 ? (first ? "-" : " - ") : first ? "" : " + ";
      return `${sign}${coef}${v}`;
    };
    const t1 = term(a, "x^2", true);
    return `${t1}${term(b, "x", !t1)}${term(c, "", !t1 && !b)}` || "0";
  }

  /* ---------------------------------------------------------------- fórmula quadrática */

  function solve({ a, b, c }) {
    const D = b * b - 4 * a * c;
    const xv = -b / (2 * a), yv = -D / (4 * a);
    const out = { a, b, c, D, xv, yv, roots: [] };
    if (D > 0) {
      const s = Math.sqrt(D);
      out.roots = [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q);
    } else if (D === 0) out.roots = [xv];
    return out;
  }

  // As raízes na forma exata: 1/2, (5 ± √17)/4 ou 1 ± √3.
  function exactRoots({ a, b, D }) {
    if (D === 0) return [fracTex(-b, 2 * a)]; // √0 = 0 (simplifyRoot daria 1·√1)
    const { k, r } = simplifyRoot(D);
    if (r === 1) {
      // Em ordem crescente: com a < 0, o "−" dá a raiz maior.
      const ends = [-b - k, -b + k].sort((p, q) => p / (2 * a) - q / (2 * a));
      const [x1, x2] = ends.map(n => fracTex(n, 2 * a));
      return x1 === x2 ? [x1] : [x1, x2];
    }
    // (−b ± k√r) / 2a, cortando o fator comum dos três.
    let p = -b, kk = k, q = 2 * a;
    const g = gcd(gcd(p, kk), q) || 1;
    p /= g; kk /= g; q /= g;
    if (q < 0) { p = -p; q = -q; }
    const rad = `${kk === 1 ? "" : texNum(kk)}\\sqrt{${texNum(r)}}`;
    const top = p === 0 ? `\\pm ${rad}` : `${texNum(p)} \\pm ${rad}`;
    return [q === 1 ? top : `\\dfrac{${top}}{${texNum(q)}}`];
  }

  /* ---------------------------------------------------------------- gráfico */

  function niceStep(span, count) {
    const raw = span / count, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }

  function drawPlot(box, tip, sol) {
    const { a, b, c, D, xv, yv, roots } = sol;
    const f = x => a * x * x + b * x + c;
    // O viewBox acompanha a largura real: no celular o desenho fica mais
    // estreito em vez de encolher, e o texto mantém o tamanho.
    const W = Math.round(Math.min(600, Math.max(300, box.clientWidth || 600)));
    const H = Math.round(Math.max(260, W * 0.57)), L = 40, R = 14, T = 16, B = 30;
    // Janela centrada no vértice, larga o bastante para as raízes.
    const dist = D > 0 ? Math.sqrt(D) / (2 * Math.abs(a)) : 0;
    const xr = Math.max(3, dist * 1.6);
    const x0 = xv - xr, x1 = xv + xr;
    const ys = [0, yv, f(x0), f(x1)];
    let y0 = Math.min(...ys), y1 = Math.max(...ys);
    const pad = (y1 - y0 || 1) * 0.12;
    y0 -= pad; y1 += pad;
    const X = x => L + (x - x0) / (x1 - x0) * (W - L - R);
    const Y = y => T + (y1 - y) / (y1 - y0) * (H - T - B);

    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot", role: "img",
      "aria-label": `Parábola de ${polyTex(a, b, c).replace(/\\/g, "")}: vértice em (${fmt(xv, 2)}; ${fmt(yv, 2)})`
        + (roots.length ? `, toca o eixo x em ${roots.map(r => fmt(r, 2)).join(" e ")}` : ", não toca o eixo x") });

    // Grade e eixos, discretos.
    const sx = niceStep(x1 - x0, W < 450 ? 4 : 6), sy = niceStep(y1 - y0, 5);
    for (let x = Math.ceil(x0 / sx) * sx; x <= x1; x += sx) {
      svg("line", { x1: X(x), x2: X(x), y1: T, y2: H - B, class: "plot-grid" }, g);
      const t = svg("text", { x: X(x), y: H - B + 18, class: "plot-tick", "text-anchor": "middle" }, g);
      t.textContent = fmt(x, 2);
    }
    for (let y = Math.ceil(y0 / sy) * sy; y <= y1; y += sy) {
      svg("line", { x1: L, x2: W - R, y1: Y(y), y2: Y(y), class: "plot-grid" }, g);
      const t = svg("text", { x: L - 6, y: Y(y) + 4, class: "plot-tick", "text-anchor": "end" }, g);
      t.textContent = fmt(y, 2);
    }
    if (x0 < 0 && x1 > 0) svg("line", { x1: X(0), x2: X(0), y1: T, y2: H - B, class: "plot-axis" }, g);
    // O eixo x é onde estão as raízes: um pouco mais forte.
    svg("line", { x1: L, x2: W - R, y1: Y(0), y2: Y(0), class: "plot-axis is-x" }, g);

    // Eixo de simetria e curva.
    svg("line", { x1: X(xv), x2: X(xv), y1: T, y2: H - B, class: "plot-sym" }, g);
    const N = 160;
    const pts = Array.from({ length: N + 1 }, (_, i) => {
      const x = x0 + (x1 - x0) * i / N;
      return `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`;
    });
    svg("path", { d: pts.join(""), class: "plot-curve" }, g);

    // Marcas com rótulo direto.
    const label = (x, y, txt, anchor, dy) => {
      const t = svg("text", { x, y: y + dy, class: "plot-label", "text-anchor": anchor }, g);
      t.textContent = txt;
    };
    roots.forEach((r, i) => {
      svg("circle", { cx: X(r), cy: Y(0), r: 5.5, class: "plot-dot is-root" }, g);
      const name = roots.length === 1 ? "x₁ = x₂" : i ? "x₂" : "x₁";
      label(X(r), Y(0), `${name} = ${fmt(r, 2)}`, roots.length === 2 ? (i ? "start" : "end") : "middle", a > 0 ? 18 : -10);
    });
    if (roots.length !== 1) {
      svg("circle", { cx: X(xv), cy: Y(yv), r: 5.5, class: "plot-dot is-vertex" }, g);
      label(X(xv), Y(yv), `vértice (${fmt(xv, 2)}; ${fmt(yv, 2)})`, "middle", a > 0 ? 20 : -12);
    }

    // Mira: linha vertical e ponto na curva, com o valor no balão.
    const cross = svg("line", { y1: T, y2: H - B, class: "plot-cross", visibility: "hidden" }, g);
    const dot = svg("circle", { r: 5, class: "plot-dot is-hover", visibility: "hidden" }, g);
    const hit = svg("rect", { x: L, y: T, width: W - L - R, height: H - T - B, class: "plot-hit" }, g);
    const hide = () => { cross.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden"); tip.hidden = true; };
    hit.addEventListener("pointermove", e => {
      const box2 = g.getBoundingClientRect();
      const px = (e.clientX - box2.left) / box2.width * W;
      const x = x0 + (px - L) / (W - L - R) * (x1 - x0), y = f(x);
      cross.setAttribute("x1", X(x)); cross.setAttribute("x2", X(x)); cross.setAttribute("visibility", "visible");
      dot.setAttribute("cx", X(x)); dot.setAttribute("cy", Y(y));
      dot.setAttribute("visibility", Y(y) >= T && Y(y) <= H - B ? "visible" : "hidden");
      tip.hidden = false;
      tip.innerHTML = `<span>x = <strong>${fmt(x, 2)}</strong></span><span>f(x) = <strong>${fmt(y, 2)}</strong></span>`;
      const left = X(x) / W * box2.width, top = Math.min(Math.max(Y(y), T), H - B) / H * box2.height;
      tip.style.left = `${Math.min(left + 12, box2.width - tip.offsetWidth - 4)}px`;
      tip.style.top = `${Math.max(top - tip.offsetHeight - 10, 0)}px`;
    });
    hit.addEventListener("pointerleave", hide);
    box.replaceChildren(g, tip);
    hide();
  }

  /* ---------------------------------------------------------------- painel */

  function initPanel(section) {
    const eq = section.querySelector(".eq-poly");
    const plot = section.querySelector(".plot-box");
    const tip = el("div", "chart-tip");
    const steps = section.querySelector(".calc-steps");
    const text = section.querySelector(".intro-text");
    const delta = section.querySelector(".delta-badge");

    let last = null;
    window.addEventListener("resize", () => { if (last) drawPlot(plot, tip, last); });

    function render(state) {
      const sol = last = solve(state);
      const { a, b, c, D, xv, yv, roots } = sol;
      math(eq, `${polyTex(a, b, c)} = 0`);
      drawPlot(plot, tip, sol);

      const kind = D > 0 ? ["is-ok", "Δ > 0: duas raízes reais"] : D === 0 ? ["is-warn", "Δ = 0: uma raiz (dupla)"] : ["is-bad", "Δ < 0: nenhuma raiz real"];
      delta.className = `badge delta-badge ${kind[0]}`;
      delta.textContent = kind[1];

      steps.replaceChildren();
      const add = (t, src) => {
        const li = el("li");
        li.appendChild(el("span", null, t));
        if (src) { const m = el("span", "calc-math"); math(m, src); li.appendChild(m); }
        steps.appendChild(li);
      };
      add(`Identifique os coeficientes: a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}.`, null);
      add("Calcule o discriminante Δ, que diz quantas raízes há:",
        `\\Delta = b^2 - 4ac = ${paren(b)}^2 - 4 \\cdot ${paren(a)} \\cdot ${paren(c)} = ${texNum(b * b)} ${4 * a * c < 0 ? "+" : "-"} ${texNum(Math.abs(4 * a * c))} = ${tone(texNum(D), D > 0 ? 3 : D === 0 ? 2 : 4)}`);
      if (D < 0) {
        add("Δ negativo: a fórmula pediria a raiz quadrada de um número negativo, que não existe nos reais. A parábola não toca o eixo x.",
          `x = \\dfrac{${texNum(-b)} \\pm \\sqrt{${texNum(D)}}}{${texNum(2 * a)}}`);
      } else {
        const ex = exactRoots(sol);
        add("Aplique a fórmula quadrática:",
          `x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a} = \\dfrac{${texNum(-b)} \\pm \\sqrt{${texNum(D)}}}{${texNum(2 * a)}}`);
        if (D === 0) {
          add("Com Δ = 0, somar ou subtrair zero dá no mesmo: as duas raízes coincidem, no vértice.",
            `x_1 = x_2 = ${tone(ex[0], 1)}`);
        } else if (ex.length === 2) {
          add("Faça uma conta com + e outra com −:",
            `x_1 = ${tone(ex[0], 1)} \\qquad x_2 = ${tone(ex[1], 1)}`);
        } else {
          add(`√${fmt(D)} não é exata, então as raízes ficam com radical${simplifyRoot(D).k > 1 ? " (simplificado)" : ""}:`,
            `x = ${tone(ex[0], 1)} \\quad\\Rightarrow\\quad x_1 \\approx ${texNum(roots[0])},\\ \\ x_2 \\approx ${texNum(roots[1])}`);
        }
      }

      const conc = a > 0
        ? `Como <strong>a = ${fmt(a)} é positivo</strong>, a parábola abre para cima e o vértice é o ponto mais baixo (mínimo).`
        : `Como <strong>a = ${fmt(a)} é negativo</strong>, a parábola abre para baixo e o vértice é o ponto mais alto (máximo).`;
      const where = D > 0
        ? `Ela cruza o eixo x em dois pontos — as <strong>raízes</strong>, os valores de x que zeram a expressão.`
        : D === 0 ? "O vértice encosta exatamente no eixo x: a raiz é uma só."
          : `O vértice fica ${a > 0 ? "acima" : "abaixo"} do eixo x e a parábola abre para ${a > 0 ? "cima" : "baixo"}, então ela nunca o cruza. As raízes existem só nos números complexos: <a href="/formulas/formula-quadratica.html?a=${a}&b=${b}&c=${c}">veja na calculadora completa</a>.`;
      text.innerHTML = `<p>${conc} ${where}</p><p>O vértice fica em x = −b / 2a = ${fmt(xv, 4)}, no meio das raízes — a parábola é simétrica em torno dessa reta.</p>`;
    }
    return render;
  }

  /* ---------------------------------------------------------------- soma e produto */

  // Com Δ < 0 as raízes são p ± qi: a soma é 2p e o produto p² + q², e as
  // relações continuam valendo.
  function rootsParts({ a, b, c }) {
    const D = b * b - 4 * a * c, p = -b / (2 * a);
    if (D >= 0) { const s = Math.sqrt(D) / (2 * a); return { real: true, r: [p - s, p + s].sort((u, v) => u - v) }; }
    return { real: false, p, q: Math.sqrt(-D) / (2 * Math.abs(a)) };
  }

  const RULES = {
    soma({ a, b, c }) {
      const R = rootsParts({ a, b, c });
      const lhs = R.real
        ? [`x_1 + x_2 \\approx ${texNum(R.r[0])} + ${paren(R.r[1])} \\approx ${texNum(R.r[0] + R.r[1])}`, R.r[0] + R.r[1]]
        : [`x_1 + x_2 = (${texNum(R.p)} + ${texNum(R.q)}i) + (${texNum(R.p)} - ${texNum(R.q)}i) = ${texNum(2 * R.p)}`, 2 * R.p];
      return {
        lhs,
        rhs: [`-\\dfrac{b}{a} = -\\dfrac{${texNum(b)}}{${texNum(a)}} = ${fracTex(-b, a)}${Number.isInteger(-b / a) ? "" : ` \\approx ${texNum(-b / a)}`}`, -b / a],
        note: R.real ? "" : "Com Δ < 0 as raízes são complexas (p ± qi), mas as partes imaginárias se cancelam na soma: a relação continua valendo.",
      };
    },
    produto({ a, b, c }) {
      const R = rootsParts({ a, b, c });
      const lhs = R.real
        ? [`x_1 \\cdot x_2 \\approx ${texNum(R.r[0])} \\cdot ${paren(R.r[1])} \\approx ${texNum(R.r[0] * R.r[1])}`, R.r[0] * R.r[1]]
        : [`x_1 \\cdot x_2 = ${texNum(R.p)}^2 + ${texNum(R.q)}^2 \\approx ${texNum(R.p ** 2 + R.q ** 2)}`, R.p ** 2 + R.q ** 2];
      return {
        lhs,
        rhs: [`\\dfrac{c}{a} = \\dfrac{${texNum(c)}}{${texNum(a)}} = ${fracTex(c, a)}${Number.isInteger(c / a) ? "" : ` \\approx ${texNum(c / a)}`}`, c / a],
        note: R.real ? "" : "Com raízes complexas p ± qi, o produto é p² + q²: (p + qi)(p − qi) = p² − (qi)² = p² + q².",
      };
    },
  };

  Licao.renderTex();
  const panel = document.querySelector(".quad-panel");
  Licao.regras(VARS, RULES, panel ? [{ box: panel.querySelector(".panel-controls"), vars: ["a", "b", "c"], render: initPanel(panel) }] : []);
})();
