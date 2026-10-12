/* Função do 1º grau: o gráfico de y = ax + b com a e b nos sliders (o
 * degrau que mostra a inclinação, o corte no eixo y e a raiz) e a
 * calculadora da reta que passa por dois pontos. Os utilitários vêm de
 * licao.js.
 */
(() => {
  const { fmt, texNum, tone, math, el, svg, saveParams } = Licao;

  const t = (v, d = 4) => texNum(v, d);
  // ax + b sem "1x", "+ −" nem termos nulos.
  function retaTex(a, b, x = "x") {
    const ax = a === 0 ? "" : `${a === -1 ? "-" : a === 1 ? "" : t(a)}${x}`;
    if (!ax) return t(b);
    return b === 0 ? ax : `${ax} ${b < 0 ? "-" : "+"} ${t(Math.abs(b))}`;
  }

  /* ---------------------------------------------------------------- gráfico */

  let janelas = 0; // cada gráfico precisa do próprio id de recorte

  // Janela fixa de −6 a 6 nos dois eixos; marcas: (0, b), raiz e (p, ap + b).
  function plot(box, a, b, extra = {}) {
    const W = 420, H = 420, M = 26, lo = -6, hi = 6;
    const X = v => M + (v - lo) / (hi - lo) * (W - 2 * M);
    const Y = v => H - M - (v - lo) / (hi - lo) * (H - 2 * M);
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot reta-plot", role: "img",
      "aria-label": `Gráfico da reta y = ${fmt(a)}x + ${fmt(b)}` });
    for (let v = lo; v <= hi; v++) {
      svg("line", { x1: X(v), x2: X(v), y1: Y(lo), y2: Y(hi), class: v === 0 ? "plot-axis" : "plot-grid" }, g);
      svg("line", { x1: X(lo), x2: X(hi), y1: Y(v), y2: Y(v), class: v === 0 ? "plot-axis is-x" : "plot-grid" }, g);
      if (v && v % 2 === 0) {
        const tx = svg("text", { x: X(v), y: Y(0) + 16, class: "plot-tick", "text-anchor": "middle" }, g);
        tx.textContent = fmt(v);
        const ty = svg("text", { x: X(0) - 6, y: Y(v) + 4, class: "plot-tick", "text-anchor": "end" }, g);
        ty.textContent = fmt(v);
      }
    }
    // A reta, cortada na janela.
    svg("line", { x1: X(lo), y1: Y(a * lo + b), x2: X(hi), y2: Y(a * hi + b), class: "plot-curve" }, g);
    const id = `jan${++janelas}`;
    const clip = svg("clipPath", { id }, g);
    svg("rect", { x: M, y: M, width: W - 2 * M, height: H - 2 * M }, clip);
    g.querySelector(".plot-curve").setAttribute("clip-path", `url(#${id})`);

    // O degrau: anda 1 para a direita a partir de (0, b) e sobe (ou desce) a.
    if (extra.degrau && a !== 0 && Math.abs(b) <= 6 && Math.abs(a + b) <= 6) {
      svg("line", { x1: X(0), y1: Y(b), x2: X(1), y2: Y(b), class: "deg-run" }, g);
      svg("line", { x1: X(1), y1: Y(b), x2: X(1), y2: Y(a + b), class: "deg-rise" }, g);
      const l1 = svg("text", { x: X(0.5), y: Y(b) + (a > 0 ? 16 : -8), class: "plot-label", "text-anchor": "middle" }, g);
      l1.textContent = "1";
      const l2 = svg("text", { x: X(1) + 8, y: Y(b + a / 2) + 4, class: "plot-label deg-label" }, g);
      l2.textContent = fmt(a);
    }
    const dot = (x, y, cls) => { if (Math.abs(x) <= 6 && Math.abs(y) <= 6) svg("circle", { cx: X(x), cy: Y(y), r: 6, class: `plot-dot ${cls}` }, g); };
    if (extra.marcas) {
      dot(0, b, "is-b");
      if (a !== 0) dot(-b / a, 0, "is-root");
    }
    (extra.pontos || []).forEach(([x, y]) => dot(x, y, "is-pt"));
    box.replaceChildren(g);
  }

  function initReta(section) {
    const inA = section.querySelector("input[name=ra]");
    const inB = section.querySelector("input[name=rb]");
    const outA = section.querySelector(".out-ra");
    const outB = section.querySelector(".out-rb");
    const fig = section.querySelector(".reta-fig");
    const eq = section.querySelector(".reta-f");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("ra")) inA.value = q.get("ra");
    if (q.has("rb")) inB.value = q.get("rb");

    function draw() {
      const a = Number(inA.value), b = Number(inB.value);
      outA.textContent = fmt(a);
      outB.textContent = fmt(b);
      plot(fig, a, b, { degrau: true, marcas: true });
      math(eq, `\\displaystyle y = ${a === 0 ? "" : `${tone(a === 1 ? "" : a === -1 ? "-" : t(a), 2)}x`}${a === 0 ? tone(t(b), 5) : b === 0 ? "" : ` ${b < 0 ? "-" : "+"} ${tone(t(Math.abs(b)), 5)}`}`);
      const raiz = a !== 0 ? -b / a : null;
      const parts = [];
      parts.push(a > 0
        ? `<p><strong>a = ${fmt(a)}</strong> é a inclinação: a cada 1 passo para a direita, a reta <strong>sobe ${fmt(a)}</strong> (o degrau no gráfico). Com a positivo, a função é <strong>crescente</strong>.</p>`
        : a < 0
          ? `<p><strong>a = ${fmt(a)}</strong> é a inclinação: a cada 1 passo para a direita, a reta <strong>desce ${fmt(-a)}</strong>. Com a negativo, a função é <strong>decrescente</strong>.</p>`
          : `<p>Com <strong>a = 0</strong>, a reta não sobe nem desce: é <strong>constante</strong>, y = ${fmt(b)} para todo x — e, a rigor, deixa de ser do 1º grau.</p>`);
      parts.push(`<p><strong>b = ${fmt(b)}</strong> é onde a reta corta o eixo y (a bolinha roxa): quando x = 0, y = a · 0 + b = ${fmt(b)}.${raiz !== null ? ` Ela corta o eixo x (a bolinha verde) na <strong>raiz</strong>, onde y = 0: resolvendo a <a href="equacao-1grau.html">equação</a> ax + b = 0, x = −b/a = ${fmt(raiz, 3)}.` : ""}</p>`);
      text.innerHTML = parts.join("");
      saveParams({ ra: a, rb: b });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- dois pontos */

  function initPontos(section) {
    const names = ["x1", "y1", "x2", "y2"];
    const ins = names.map(n => section.querySelector(`input[name=${n}]`));
    const result = section.querySelector(".calc-result");
    const fig = section.querySelector(".pontos-fig");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    ins.forEach(i => { if (q.has(i.name)) i.value = q.get(i.name); });
    const num = s => (/^-?\d{1,6}(,\d{1,4})?$/.test(s.trim()) ? Number(s.trim().replace(",", ".")) : NaN);

    function update() {
      saveParams(Object.fromEntries(ins.map(i => [i.name, i.value.trim()])));
      const v = ins.map(i => num(i.value));
      ins.forEach((i, k) => i.setAttribute("aria-invalid", String(Number.isNaN(v[k]))));
      steps.replaceChildren();
      const [x1, y1, x2, y2] = v;
      let err = v.some(Number.isNaN) ? "Digite números, com vírgula nos decimais." : "";
      if (!err && x1 === x2) err = y1 === y2 ? "Os dois pontos são o mesmo: por um ponto só passam infinitas retas." : `Os dois pontos têm o mesmo x = ${fmt(x1)}: a reta é vertical, x = ${fmt(x1)}, e não é gráfico de função (um x com vários y).`;
      section.classList.toggle("has-error", !!err);
      if (err) { result.textContent = ""; fig.replaceChildren(); note.textContent = err; return; }

      const dx = x2 - x1, dy = y2 - y1, a = dy / dx, b = y1 - a * x1;
      const add = (html, src) => {
        const li = el("li");
        const p = el("span");
        p.innerHTML = html;
        li.appendChild(p);
        if (src) { const mm = el("span", "calc-math"); math(mm, src); li.appendChild(mm); }
        steps.appendChild(li);
      };
      const P = v => (v < 0 ? `(${t(v)})` : t(v));
      add(`<strong>Inclinação.</strong> Quanto y muda dividido por quanto x muda, de um ponto ao outro.`,
        `a = \\frac{\\Delta y}{\\Delta x} = \\frac{${t(y2)} - ${P(y1)}}{${t(x2)} - ${P(x1)}} = \\frac{${t(dy)}}{${t(dx)}} ${Licao.sgn(a * 1e4)} ${tone(t(a), 2)}`);
      add(`<strong>Corte no eixo y.</strong> Ponha um dos pontos em y = ax + b e isole o b.`,
        `${t(y1)} = ${t(a)} \\cdot ${P(x1)} + b \\;\\Rightarrow\\; b = ${t(y1)} - ${P(a * x1)} ${Licao.sgn(b * 1e4)} ${tone(t(b), 5)}`);
      add(`<strong>Confira</strong> com o outro ponto: x = ${fmt(x2)} tem de dar y = ${fmt(y2)}.`, `${t(a)} \\cdot ${P(x2)} + ${P(b)} ${Licao.sgn((a * x2 + b) * 1e4)} ${t(a * x2 + b)} \\;\\checkmark`);
      math(result, `y = ${retaTex(a, b)}`);
      plot(fig, a, b, { pontos: [[x1, y1], [x2, y2]], marcas: true });
      note.textContent = Math.max(Math.abs(x1), Math.abs(x2), Math.abs(y1), Math.abs(y2)) > 6 ? "O gráfico mostra de −6 a 6; algum ponto ficou fora da janela." : "";
    }

    section.addEventListener("input", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      btn.dataset.exemplo.split(";").forEach((s, k) => { ins[k].value = s; });
      update();
    }));
    update();
  }

  Licao.renderTex();
  const reta = document.querySelector("#reta");
  if (reta) initReta(reta);
  const pontos = document.querySelector("#pontos");
  if (pontos) initPontos(pontos);
})();
