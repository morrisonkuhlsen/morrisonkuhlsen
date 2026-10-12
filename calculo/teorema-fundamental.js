/* Teorema fundamental: a função área A(x), cuja inclinação é a altura de f,
 * e o atalho F(b) − F(a), conferido com uma soma de mil retângulos.
 */
(() => {
  const { fmt, texNum, tone, math, el, saveParams } = Licao;
  const { plot, slider, fromUrl, choice, onResize } = Grafico;

  /* ---------------------------------------------------------------- função área */

  const Q = {
    reta: { tex: "t", plain: ["x²/2", "t"], Atex: "\\dfrac{x^2}{2}", f: t => t, A: x => x * x / 2, r: [0, 4], yf: [-0.4, 4.4], yA: [-0.6, 8.6] },
    cos: { tex: "\\cos t", plain: ["sen x", "cos t"], Atex: "\\operatorname{sen} x", f: Math.cos, A: Math.sin, r: [0, 2 * Math.PI], yf: [-1.25, 1.25], yA: [-1.25, 1.25] },
    par: { tex: "t^2 - 2t", plain: ["x³/3 − x²", "t² − 2t"], Atex: "\\dfrac{x^3}{3} - x^2", f: t => t * t - 2 * t, A: x => x ** 3 / 3 - x * x, r: [0, 3.3], yf: [-1.3, 4.5], yA: [-1.6, 1.4] },
  };

  function initArea(section) {
    const vars = section.querySelector(".area-vars");
    const bf = section.querySelector(".area-f");
    const ba = section.querySelector(".area-a");
    const out = section.querySelector(".area-out");
    const text = section.querySelector(".area-text");
    const q0 = Q[new URLSearchParams(location.search).get("q")] || Q.reta;
    const X = slider(vars, { name: "x", label: "<i>x</i>", min: q0.r[0], max: q0.r[1], step: 0.02, value: fromUrl("x", q0.r[0], q0.r[1], q0.r[1] * 0.5), show: v => fmt(v, 2), aria: "Fim do intervalo, x" });
    const cur = choice(section, "q", "q", key => { const q = Q[key]; X.input.min = q.r[0]; X.input.max = q.r[1]; X.set(q.r[1] * 0.5); draw(); });

    function draw() {
      const q = Q[cur()], x = X.read(), fx = q.f(x), h = (q.r[1] - q.r[0]) / 25;
      const height = W => Math.max(180, W * 0.38);
      const pf = plot(bf, { x0: q.r[0], x1: q.r[1], y0: q.yf[0], y1: q.yf[1], height, label: `f(t) = ${q.tex}, com a área de 0 até ${fmt(x, 2)} sombreada` });
      pf.area(q.f, 0, x);
      pf.band(x, Math.min(x + h, q.r[1]), 0, fx, fx < 0 ? "plot-rect is-neg" : "plot-rect");
      pf.curve(q.f);
      pf.dot(x, fx, "plot-dot is-a");
      const pa = plot(ba, { x0: q.r[0], x1: q.r[1], y0: q.yA[0], y1: q.yA[1], height, label: `A(x), a área acumulada, com a tangente em x = ${fmt(x, 2)}` });
      pa.curve(q.A, "plot-curve is-faint");
      pa.curve(q.A, "plot-curve", 0, x, 200);
      pa.line(x, q.A(x), fx, "plot-tangent");
      pa.dot(x, q.A(x), "plot-dot is-b");
      math(out, `A(${texNum(x, 2)}) = \\int_0^{${texNum(x, 2)}} ${q.tex}\\,dt \\approx ${tone(texNum(q.A(x), 4), 2)} \\qquad A'(${texNum(x, 2)}) = f(${texNum(x, 2)}) \\approx ${tone(texNum(fx, 4), 1)}`);
      const sinal = Math.abs(fx) < 0.02 ? "Aqui f vale quase zero: a faixa nova não tem altura, e a curva de baixo está no topo ou no fundo — a tangente fica horizontal."
        : fx > 0 ? "Aqui f é positiva: cada faixa nova soma área, e a curva de baixo sobe."
          : "Aqui f é negativa: a faixa nova fica abaixo do eixo e <strong>subtrai</strong> área, então a curva de baixo desce.";
      text.innerHTML = `<p>A inclinação da tangente de baixo é ${fmt(fx, 4)} — a mesma altura de f no ponto de cima. ${sinal}</p>`
        + `<p>Aqui, A(x) = ${q.plain[0]}: derive e confira que dá ${q.plain[1]}, trocando t por x.</p>`;
      saveParams({ q: cur(), x });
    }
    X.input.addEventListener("input", () => { X.sync(); draw(); });
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- atalho */

  const H = {
    x2: { tex: "x^2", Ftex: "\\dfrac{x^3}{3}", dtex: "\\dfrac{3x^2}{3} = x^2", f: x => x * x, F: x => x ** 3 / 3, r: [0, 3], ab: [0, 2] },
    x3: { tex: "x^3", Ftex: "\\dfrac{x^4}{4}", dtex: "\\dfrac{4x^3}{4} = x^3", f: x => x ** 3, F: x => x ** 4 / 4, r: [0, 2.5], ab: [0, 2] },
    exp: { tex: "e^{x}", Ftex: "e^{x}", dtex: "e^{x}", f: Math.exp, F: Math.exp, r: [-1, 2.5], ab: [0, 1] },
    inv: { tex: "\\dfrac{1}{x}", Ftex: "\\ln x", dtex: "\\dfrac{1}{x}", f: x => 1 / x, F: Math.log, r: [0.2, 4], ab: [1, Math.E] },
    cos: { tex: "\\cos x", Ftex: "\\operatorname{sen} x", dtex: "\\cos x", f: Math.cos, F: Math.sin, r: [0, 2 * Math.PI], ab: [0, Math.PI / 2] },
    sen: { tex: "\\operatorname{sen} x", Ftex: "-\\cos x", dtex: "\\operatorname{sen} x", f: Math.sin, F: x => -Math.cos(x), r: [0, 2 * Math.PI], ab: [0, Math.PI] },
  };

  function initAtalho(section) {
    const vars = section.querySelector(".atalho-vars");
    const box = section.querySelector(".atalho-plot");
    const steps = section.querySelector(".atalho-steps");
    const out = section.querySelector(".atalho-out");
    const h0 = H[new URLSearchParams(location.search).get("h")] || H.x2;
    const A = slider(vars, { name: "a", label: "<i>a</i>", min: h0.r[0], max: h0.r[1], step: 0.01, value: fromUrl("a", h0.r[0], h0.r[1], h0.ab[0]), show: v => fmt(v, 2), aria: "Início a" });
    const B = slider(vars, { name: "b", label: "<i>b</i>", min: h0.r[0], max: h0.r[1], step: 0.01, value: fromUrl("b", h0.r[0], h0.r[1], h0.ab[1]), show: v => fmt(v, 2), aria: "Fim b" });
    const cur = choice(section, "h", "h", key => {
      const g = H[key];
      [A, B].forEach(s => { s.input.min = g.r[0]; s.input.max = g.r[1]; });
      A.set(g.ab[0]); B.set(g.ab[1]);
      draw();
    });

    function draw() {
      const g = H[cur()], a = A.read(), b = B.read();
      const lo = Math.min(a, b), hi = Math.max(a, b);
      const ys = Array.from({ length: 101 }, (_, i) => g.f(g.r[0] + (g.r[1] - g.r[0]) * i / 100));
      const y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys), pad = (y1 - y0) * 0.1;
      const p = plot(box, { x0: g.r[0], x1: g.r[1], y0: y0 - pad, y1: y1 + pad, label: `Área sob ${g.tex} de ${fmt(a, 2)} a ${fmt(b, 2)}` });
      p.area(g.f, lo, hi);
      p.curve(g.f);
      p.dot(a, g.f(a), "plot-dot is-a", 5);
      p.dot(b, g.f(b), "plot-dot is-b", 5);
      const exact = g.F(b) - g.F(a);
      const n = 1000, dx = (b - a) / n;
      let s = 0; for (let i = 0; i < n; i++) s += g.f(a + (i + 0.5) * dx) * dx;
      const A_ = texNum(a, 2), B_ = texNum(b, 2);
      const at = (tex, v) => tex.replace(/x/g, `(${texNum(v, 2)})`);
      steps.replaceChildren();
      const add = (t, src) => { const li = el("li"); li.appendChild(el("span", null, t)); const m = el("span", "calc-math"); math(m, src); li.appendChild(m); steps.appendChild(li); };
      add("Ache uma primitiva: uma função cuja derivada é f. Confira derivando:", `F(x) = ${tone(g.Ftex, 2)} \\qquad F'(x) = ${g.dtex}`);
      add("Calcule F nas duas pontas e subtraia:", `F(${B_}) - F(${A_}) = ${at(g.Ftex, b)} - \\left(${at(g.Ftex, a)}\\right) \\approx ${texNum(g.F(b), 4)} - ${texNum(g.F(a), 4)} \\approx ${tone(texNum(exact, 6), 1)}`);
      add("Confira com mil retângulos pelo ponto médio:", `\\textstyle\\sum f(x_i)\\,\\Delta x \\approx ${texNum(s, 6)}`);
      math(out, `\\int_{${A_}}^{${B_}} ${g.tex}\\,dx = F(${B_}) - F(${A_}) \\approx ${tone(texNum(exact, 6), 1)}`);
      saveParams({ h: cur(), a, b });
    }
    [A, B].forEach(s => s.input.addEventListener("input", () => { s.sync(); draw(); }));
    onResize(draw);
    draw();
  }

  Licao.renderTex();
  const by = q => document.querySelector(q);
  if (by("#area")) initArea(by("#area"));
  if (by("#atalho")) initAtalho(by("#atalho"));
})();
