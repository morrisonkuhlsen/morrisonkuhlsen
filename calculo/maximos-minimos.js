/* Máximos e mínimos: a caixa de papelão de maior volume, a classificação
 * dos pontos críticos pela segunda derivada e a média e a mediana como os
 * números que minimizam duas somas de desvios.
 */
(() => {
  const { fmt, texNum, tone, math, svg, saveParams } = Licao;
  const { plot, slider, fromUrl, choice, onResize } = Grafico;

  /* ---------------------------------------------------------------- caixa */

  // A folha vista de cima: os cantos cortados e as linhas de dobra.
  function drawSheet(box, L, x) {
    const S = 180, P = 10, k = S / L, c = x * k;
    const g = svg("svg", { viewBox: `0 0 ${S + 2 * P} ${S + 2 * P}`, class: "box-svg" });
    svg("rect", { x: P, y: P, width: S, height: S, class: "box-face" }, g);
    [[P, P], [P + S - c, P], [P, P + S - c], [P + S - c, P + S - c]].forEach(([u, v]) => svg("rect", { x: u, y: v, width: c, height: c, class: "box-cut" }, g));
    if (c > 0) svg("rect", { x: P + c, y: P + c, width: S - 2 * c, height: S - 2 * c, class: "box-fold" }, g);
    const t = svg("text", { x: P + c / 2, y: P + c / 2 + 4, class: "plot-label", "text-anchor": "middle" }, g);
    t.textContent = c > 14 ? "x" : "";
    box.replaceChildren(g);
  }

  // A caixa montada, em perspectiva cavaleira: base (L − 2x) e altura x.
  function drawBox(box, L, x) {
    const W = 200, H = 200, k = 150 / L, b = (L - 2 * x) * k, h = x * k, d = b * 0.45;
    const ox = (W - b - d) / 2, oy = H - (H - h - d) / 2;
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "box-svg" });
    const poly = (pts, cls) => svg("polygon", { points: pts.map(p => p.join(",")).join(" "), class: cls }, g);
    // Fundo e paredes de trás primeiro, mais claros; depois as da frente.
    poly([[ox, oy], [ox + b, oy], [ox + b + d, oy - d], [ox + d, oy - d]], "box-face is-back");
    poly([[ox + d, oy - d], [ox + b + d, oy - d], [ox + b + d, oy - d - h], [ox + d, oy - d - h]], "box-face is-back");
    poly([[ox, oy], [ox + d, oy - d], [ox + d, oy - d - h], [ox, oy - h]], "box-face is-back");
    poly([[ox + b, oy], [ox + b + d, oy - d], [ox + b + d, oy - d - h], [ox + b, oy - h]], "box-face");
    poly([[ox, oy], [ox + b, oy], [ox + b, oy - h], [ox, oy - h]], "box-face");
    box.replaceChildren(g);
  }

  function initCaixa(section) {
    const vars = section.querySelector(".box-vars");
    const sheet = section.querySelector(".box-sheet");
    const solid = section.querySelector(".box-3d");
    const pbox = section.querySelector(".box-plot");
    const out = section.querySelector(".box-out");
    const text = section.querySelector(".box-text");
    const cm = v => `${fmt(v, 1)} cm`;
    const LL = slider(vars, { name: "L", label: "<i>L</i>", min: 10, max: 60, step: 1, value: fromUrl("L", 10, 60, 30), show: cm, aria: "Lado da folha" });
    const X = slider(vars, { name: "x", label: "<i>x</i>", min: 0, max: LL.read() / 2, step: 0.1, value: fromUrl("x", 0, LL.read() / 2, 2), show: cm, aria: "Lado do corte" });

    function draw() {
      const L = LL.read();
      X.input.max = L / 2;
      if (X.read() > L / 2) X.set(L / 2);
      X.sync();
      const x = X.read();
      const V = v => v * (L - 2 * v) ** 2, dV = v => (L - 2 * v) * (L - 6 * v);
      const best = L / 6, vmax = V(best);
      drawSheet(sheet, L, x);
      drawBox(solid, L, x);
      const p = plot(pbox, { x0: 0, x1: L / 2, y0: -vmax * 0.06, y1: vmax * 1.15, xLabel: "x (cm)", yLabel: "V (cm³)", label: `Volume da caixa em função do corte x, com o ponto em x = ${fmt(x, 1)} cm` });
      p.curve(V);
      p.line(x, V(x), dV(x), "plot-tangent");
      p.dot(best, vmax, "plot-dot is-vertex");
      p.label(best, vmax, `máximo: x = ${fmt(best, 2)}`, "middle", -12);
      p.dot(x, V(x), "plot-dot is-a");
      math(out, `V(${texNum(x, 1)}) = ${texNum(x, 1)} \\cdot (${L} - 2 \\cdot ${texNum(x, 1)})^2 \\approx ${tone(`${texNum(V(x), 0)}\\ \\text{cm}^3`, 1)} \\qquad V'(${texNum(x, 1)}) \\approx ${tone(texNum(dV(x), 1), 2)}`);
      const perto = Math.abs(x - best) < 0.06;
      text.innerHTML = perto
        ? `<p>Aqui a tangente está <strong>horizontal</strong> e V′ ≈ 0: nem aumentar nem diminuir o corte melhora o volume. É o máximo, em x = L/6 = ${fmt(best, 2)} cm, com ${fmt(vmax, 0)} cm³.</p>`
        : dV(x) > 0
          ? `<p>V′ é <strong>positiva</strong>: aumentar o corte ainda aumenta o volume. A caixa fica mais funda, e isso compensa o fundo que encolhe.</p>`
          : `<p>V′ é <strong>negativa</strong>: o corte passou do ponto. Agora a caixa perde mais com o fundo encolhendo do que ganha em altura.</p>`;
      text.innerHTML += `<p>Derivando V(x) = x(L − 2x)², sai V′(x) = (L − 2x)(L − 6x), que zera em x = L/6 — qualquer que seja o tamanho da folha. Mude <i>L</i> para conferir.</p>`;
      saveParams({ L, x });
    }
    [LL, X].forEach(c => c.input.addEventListener("input", () => { c.sync(); draw(); }));
    section.querySelector(".box-best").addEventListener("click", () => { X.set(Math.round(LL.read() / 6 * 10) / 10); draw(); });
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- topo ou fundo */

  const Q = {
    cubo: { tex: "x^3 - 3x", f: x => x ** 3 - 3 * x, d: x => 3 * x * x - 3, dd: x => 6 * x, r: [-2.3, 2.3], y: [-3.2, 3.2], crit: [-1, 1] },
    w: { tex: "x^4 - 2x^2", f: x => x ** 4 - 2 * x * x, d: x => 4 * x ** 3 - 4 * x, dd: x => 12 * x * x - 4, r: [-1.7, 1.7], y: [-1.4, 2.4], crit: [-1, 0, 1] },
    sela: { tex: "x^3", f: x => x ** 3, d: x => 3 * x * x, dd: x => 6 * x, r: [-1.6, 1.6], y: [-3, 3], crit: [0] },
    gauss: { tex: "e^{-x^2}", f: x => Math.exp(-x * x), d: x => -2 * x * Math.exp(-x * x), dd: x => (4 * x * x - 2) * Math.exp(-x * x), r: [-3, 3], y: [-0.2, 1.25], crit: [0] },
  };
  const kind = (q, c) => {
    const s = q.dd(c);
    if (s < -1e-9) return "máximo local";
    if (s > 1e-9) return "mínimo local";
    const l = q.d(c - 1e-3), r = q.d(c + 1e-3);
    return l > 0 && r < 0 ? "máximo local" : l < 0 && r > 0 ? "mínimo local" : "nem máximo nem mínimo";
  };

  function initTopo(section) {
    const vars = section.querySelector(".topo-vars");
    const box = section.querySelector(".topo-plot");
    const out = section.querySelector(".topo-out");
    const text = section.querySelector(".topo-text");
    const q0 = Q[new URLSearchParams(location.search).get("q")] || Q.cubo;
    const P = slider(vars, { name: "p", label: "<i>x</i>", min: q0.r[0], max: q0.r[1], step: 0.01, value: fromUrl("p", q0.r[0], q0.r[1], -1.6), show: v => fmt(v, 2), aria: "Ponto x na curva" });
    const cur = choice(section, "q", "q", key => { const q = Q[key]; P.input.min = q.r[0]; P.input.max = q.r[1]; P.set(q.r[0] * 0.7); draw(); });

    function draw() {
      const q = Q[cur()], x = P.read(), m = q.d(x), s = q.dd(x);
      const p = plot(box, { x0: q.r[0], x1: q.r[1], y0: q.y[0], y1: q.y[1], label: `Gráfico de ${q.tex} com a tangente em x = ${fmt(x, 2)} e os pontos críticos marcados` });
      p.curve(q.f);
      p.line(x, q.f(x), m, "plot-tangent");
      q.crit.forEach(c => {
        const k = kind(q, c);
        p.dot(c, q.f(c), "plot-dot is-vertex", 5);
        p.label(c, q.f(c), k === "máximo local" ? "máx." : k === "mínimo local" ? "mín." : "patamar", "middle", k === "mínimo local" ? 20 : -12);
      });
      p.dot(x, q.f(x), "plot-dot is-a");
      math(out, `f'(${texNum(x, 2)}) \\approx ${tone(texNum(m, 3), 2)} \\qquad f''(${texNum(x, 2)}) \\approx ${tone(texNum(s, 3), 3)}`);
      const near = q.crit.find(c => Math.abs(c - x) < 0.04);
      const sobe = Math.abs(m) < 0.02 ? "está plana" : m > 0 ? "está subindo" : "está descendo";
      const vira = Math.abs(s) < 0.02 ? "quase sem curvatura" : s > 0 ? "virada para cima, como um sorriso" : "virada para baixo, como um morro";
      text.innerHTML = near != null
        ? `<p>Você está num ponto crítico, x = ${fmt(near, 2)}: f′ = 0. ${q.dd(near) !== 0 ? `Como f″ = ${fmt(q.dd(near), 2)} é ${q.dd(near) < 0 ? "negativa, a curva está virada para baixo" : "positiva, a curva está virada para cima"}: é um <strong>${kind(q, near)}</strong>.` : `Aqui f″ também é zero, e o teste não decide. Olhando f′ dos dois lados: ${kind(q, near) === "nem máximo nem mínimo" ? "ela tem o mesmo sinal, então a curva só dá uma pausa — <strong>nem máximo nem mínimo</strong>" : `é um <strong>${kind(q, near)}</strong>`}.`}</p>`
        : `<p>Em x = ${fmt(x, 2)}, a curva ${sobe} (f′ = ${fmt(m, 2)}) e está ${vira} (f″ = ${fmt(s, 2)}). Arraste até um ponto marcado para ver a classificação.</p>`;
      saveParams({ q: cur(), p: x });
    }
    P.input.addEventListener("input", () => { P.sync(); draw(); });
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- média e mediana */

  function initEst(section) {
    const data = [1, 2, 3, 4, 20];
    const mean = data.reduce((s, v) => s + v, 0) / data.length, med = 3;
    const S = c => data.reduce((s, v) => s + (v - c) ** 2, 0);
    const A = c => data.reduce((s, v) => s + Math.abs(v - c), 0);
    const vars = section.querySelector(".est-vars");
    const bsq = section.querySelector(".est-sq");
    const babs = section.querySelector(".est-abs");
    const out = section.querySelector(".est-out");
    const text = section.querySelector(".est-text");
    const C = slider(vars, { name: "c", label: "<i>c</i>", min: 0, max: 21, step: 0.1, value: fromUrl("c", 0, 21, 10), show: v => fmt(v, 1), aria: "Valor de c" });

    function draw() {
      const c = C.read();
      const height = W => Math.max(170, W * 0.36);
      const ps = plot(bsq, { x0: 0, x1: 21, y0: 0, y1: S(21) * 1.02, height, label: "Soma dos quadrados dos desvios em função de c" });
      ps.curve(S);
      ps.dot(mean, S(mean), "plot-dot is-vertex");
      ps.label(mean, S(mean), `média = ${fmt(mean)}`, "middle", -12);
      ps.dot(c, S(c), "plot-dot is-a");
      const pa = plot(babs, { x0: 0, x1: 21, y0: 0, y1: A(21) * 1.05, height, label: "Soma dos desvios absolutos em função de c" });
      pa.curve(A);
      pa.dot(med, A(med), "plot-dot is-vertex");
      pa.label(med, A(med), `mediana = ${med}`, "middle", 22);
      pa.dot(c, A(c), "plot-dot is-b");
      math(out, `\\textstyle\\sum (x_i - c)^2 \\approx ${tone(texNum(S(c), 1), 2)} \\qquad \\sum |x_i - c| \\approx ${tone(texNum(A(c), 1), 3)}`);
      text.innerHTML = `<p>A primeira soma é uma parábola: a derivada, −2Σ(xᵢ − c), zera quando c é a <strong>média</strong>, ${fmt(mean)}. A segunda é feita de retas: a inclinação é quantos dados ficam abaixo de c menos quantos ficam acima, e zera quando metade fica de cada lado — na <strong>mediana</strong>, ${med}.</p>`
        + `<p>O 20 puxa a média para longe dos outros dados, porque um desvio grande, ao quadrado, pesa muito. Na soma dos absolutos ele conta só como mais um ponto acima, e a mediana nem se mexe. É por isso que a mediana é <strong>robusta</strong> a valores extremos.</p>`;
      saveParams({ c });
    }
    C.input.addEventListener("input", () => { C.sync(); draw(); });
    onResize(draw);
    draw();
  }

  Licao.renderTex();
  const by = q => document.querySelector(q);
  if (by("#caixa")) initCaixa(by("#caixa"));
  if (by("#topo")) initTopo(by("#topo"));
  if (by("#estatistica")) initEst(by("#estatistica"));
})();
