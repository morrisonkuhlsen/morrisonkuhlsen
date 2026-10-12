/* Limite: aproximar de a pelos dois lados, em cinco funções que mostram
 * os casos típicos (buraco, sen x / x, salto, explosão, oscilação), e o
 * desafio do ε e do δ, em que a página procura o δ que cabe na margem ε.
 */
(() => {
  const { fmt, fmtNum, texNum, tone, math, saveParams } = Licao;
  const { plot, slider, fromUrl, choice, onResize } = Grafico;

  // a: o ponto; L: o limite (null se não existe, Infinity se explode);
  // w e y: a janela padrão do gráfico; h0: a maior distância do slider.
  const F = {
    buraco: { tex: "\\dfrac{x^2 - 1}{x - 1}", a: 1, L: 2, f: x => (x * x - 1) / (x - 1), w: 2, y: [-0.6, 4.6], h0: 1, hole: true },
    sinc: { tex: "\\dfrac{\\operatorname{sen} x}{x}", a: 0, L: 1, f: x => Math.sin(x) / x, w: 9, y: [-0.4, 1.25], h0: 4, hole: true },
    salto: { tex: "\\dfrac{x}{|x|}", a: 0, L: null, left: -1, right: 1, f: x => x / Math.abs(x), w: 3, y: [-1.6, 1.6], h0: 1 },
    infinito: { tex: "\\dfrac{1}{x^2}", a: 0, L: Infinity, f: x => 1 / (x * x), w: 3, y: [-0.5, 10], h0: 1 },
    oscila: { tex: "\\operatorname{sen} \\dfrac{1}{x}", a: 0, L: null, f: x => Math.sin(1 / x), w: 0.6, y: [-1.4, 1.4], h0: 0.3, n: 6000 },
  };
  const TEXT = {
    buraco: "Em x = 1 a fórmula dá 0/0: a função nem existe ali — é o buraco no gráfico. Mas dos dois lados os valores chegam cada vez mais perto de <strong>2</strong>, e esse é o limite. Faz sentido: para x ≠ 1, (x² − 1)/(x − 1) é só x + 1.",
    sinc: "Em x = 0, de novo 0/0. Dos dois lados os valores se aproximam de <strong>1</strong>: perto de zero, sen x e x são quase iguais. É um dos limites mais importantes — é por causa dele que a derivada do seno é o cosseno.",
    salto: "Pela esquerda, a função vale −1; pela direita, 1. Cada lado tem o seu limite, mas eles não concordam: <strong>o limite não existe</strong>. Chegar perto de 0 não decide em que valor se chega.",
    infinito: "Os valores crescem sem parar dos dois lados: com h = 0,01, já passam de 10 mil. Não há número de que se aproximem. Dizemos que o limite é <strong>infinito</strong> — um jeito de descrever como ele deixa de existir.",
    oscila: "Perto de 0, sen(1/x) vai e volta entre −1 e 1 cada vez mais depressa: os valores pulam de um lado a outro e nunca se acomodam. <strong>O limite não existe</strong>, mesmo sem salto nem explosão.",
  };
  // Número pequeno em notação científica no KaTeX: 3,2 × 10⁻⁵.
  const texSmall = v => {
    if (v >= 1e-3) return texNum(v, 4);
    const e = Math.floor(Math.log10(v));
    return `${texNum(v / 10 ** e, 2)} \\times 10^{${e}}`;
  };
  // Passos redondos para os sliders: 1; 0,5; 0,2; 0,1; … ; 0,0001.
  const STEPS = [1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.0005, 0.0001];
  const val = y => (Number.isFinite(y) ? texNum(y, 6) : y > 0 ? "\\infty" : "-\\infty");

  /* ---------------------------------------------------------------- aproximar */

  function initAprox(section) {
    const fnOut = section.querySelector(".apr-fn");
    const vars = section.querySelector(".apr-vars");
    const box = section.querySelector(".apr-plot");
    const out = section.querySelector(".apr-out");
    const table = section.querySelector(".apr-table");
    const text = section.querySelector(".apr-text");
    const cur = choice(section, "fn", "fn", () => draw());
    const K = slider(vars, { name: "k", label: "<i>h</i>", min: 0, max: STEPS.length - 1, step: 1, value: fromUrl("k", 0, STEPS.length - 1, 2),
      show: k => fmt(F[cur()].h0 * STEPS[k], 6), aria: "Distância h até o ponto a" });

    function draw() {
      const key = cur(), d = F[key], h = d.h0 * STEPS[K.read()];
      K.sync();
      const { a } = d, fl = d.f(a - h), fr = d.f(a + h);
      math(fnOut, `f(x) = ${d.tex}, \\qquad x \\to ${a}`);
      const p = plot(box, { x0: a - d.w, x1: a + d.w, y0: d.y[0], y1: d.y[1], label: `Gráfico de f perto de x = ${a}, com pontos a ${fmt(h, 5)} de distância de cada lado` });
      p.seg(a - h, d.y[0], a - h, d.y[1], "plot-guide");
      p.seg(a + h, d.y[0], a + h, d.y[1], "plot-guide");
      if (Number.isFinite(d.L)) p.seg(a - d.w, d.L, a + d.w, d.L, "plot-guide");
      p.curve(d.f, "plot-curve", a - d.w, a + d.w, d.n || 800);
      if (d.hole) p.dot(a, d.L, "plot-dot is-hole", 5);
      if (key === "salto") { p.dot(a, -1, "plot-dot is-hole", 5); p.dot(a, 1, "plot-dot is-hole", 5); }
      const inWin = y => Number.isFinite(y) && y >= d.y[0] && y <= d.y[1];
      if (inWin(fl)) p.dot(a - h, fl, "plot-dot is-a");
      if (inWin(fr)) p.dot(a + h, fr, "plot-dot is-b");

      math(out, `f(${texNum(a - h, 5)}) ${Number.isFinite(fl) ? "\\approx" : "="} ${tone(val(fl), 2)}, \\qquad f(${texNum(a + h, 5)}) ${Number.isFinite(fr) ? "\\approx" : "="} ${tone(val(fr), 3)}`);
      const hs = [0, 1, 2, 3, 4].map(j => d.h0 * 10 ** -j);
      const rows = hs.map(hh => `${texNum(hh, 5)} & ${val(d.f(a - hh))} & ${val(d.f(a + hh))}`).join(" \\\\ ");
      math(table, `\\begin{array}{r|r|r} h & f(${a} - h) & f(${a} + h) \\\\ \\hline ${rows} \\end{array}`);
      const conclusao = Number.isFinite(d.L) ? `\\lim_{x \\to ${a}} ${d.tex} = ${tone(d.L, 1)}`
        : d.L === Infinity ? `\\lim_{x \\to ${a}} ${d.tex} = ${tone("\\infty", 1)}`
          : `\\lim_{x \\to ${a}} ${d.tex}\\ ${tone("\\text{não existe}", 1)}`;
      text.innerHTML = `<p>${TEXT[key]}</p><p class="readout"></p>`;
      math(text.querySelector(".readout"), conclusao);
      saveParams({ fn: key, k: K.read() });
    }
    K.input.addEventListener("input", draw);
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- ε e δ */

  // O maior δ (de uma grade geométrica) em que |f(x) − L| < ε para todo x
  // amostrado com 0 < |x − a| < δ. Null se nem um δ minúsculo serve.
  function findDelta(d, L, eps) {
    for (let delta = d.w; delta > 1e-7; delta *= 0.92) {
      let ok = true;
      for (let i = 1; i <= 400 && ok; i++) {
        const t = delta * i / 400;
        for (const x of [d.a - t, d.a + t]) {
          const y = d.f(x);
          if (!(Math.abs(y - L) < eps)) { ok = false; break; }
        }
      }
      if (ok) return delta;
    }
    return null;
  }

  function initEps(section) {
    const vars = section.querySelector(".eps-vars");
    const box = section.querySelector(".eps-plot");
    const out = section.querySelector(".eps-out");
    const text = section.querySelector(".eps-text");
    const cur = choice(section, "ep", "ep", () => draw());
    const E = slider(vars, { name: "e", label: "<i>ε</i>", min: 0, max: 9, step: 1, value: fromUrl("e", 0, 9, 2),
      show: k => fmt(STEPS[k], 4), aria: "Margem ε" });

    function draw() {
      const key = cur(), d = F[key], eps = STEPS[E.read()];
      E.sync();
      const L = key === "salto" ? 0 : d.L;
      const delta = findDelta(d, L, eps);
      // A janela acompanha o tamanho de ε e δ, para as faixas não sumirem.
      const hw = delta ? Math.min(d.w, Math.max(delta * 3, 1e-6)) : key === "salto" ? 1 : d.w;
      const vh = Math.max(eps * 3, key === "salto" ? 1.6 : 0);
      const y0 = Math.max(d.y[0], L - vh), y1 = Math.min(d.y[1], L + vh);
      const p = plot(box, { x0: d.a - hw, x1: d.a + hw, y0, y1, label: `Faixa de margem ${fmt(eps, 4)} em volta de ${L} e a distância δ em volta de ${d.a}` });
      p.band(d.a - hw, d.a + hw, L - eps, L + eps, "plot-band");
      if (delta) p.band(d.a - delta, d.a + delta, y0, y1, "plot-band is-delta");
      else p.band(d.a - hw * 0.04, d.a + hw * 0.04, y0, y1, "plot-band is-fail");
      p.curve(d.f, "plot-curve", d.a - hw, d.a + hw, 1200);
      if (d.hole) p.dot(d.a, d.L, "plot-dot is-hole", 5);

      if (delta) {
        math(out, `\\varepsilon = ${tone(texNum(eps, 4), 1)} \\quad\\Longrightarrow\\quad \\delta \\approx ${tone(texSmall(delta), 3)}`);
        text.innerHTML = `<p>Com margem ${fmt(eps, 4)}, basta ficar a menos de <strong>${fmtNum(delta)}</strong> de ${d.a} (sem contar o próprio ${d.a}) para a curva não sair da faixa. Diminua ε: a faixa estreita, e sempre aparece um δ menor que funciona. É isso que garante que o limite é ${L}.</p>`
          + (key === "sinc" ? `<p>Repare que δ encolhe mais ou menos como a raiz de ε: perto de zero, 1 − sen x / x se comporta como x²/6.</p>` : key === "buraco" ? `<p>Aqui δ = ε: como a função é x + 1 perto de 1, ficar a δ de 1 é ficar a δ de 2.</p>` : "");
      } else {
        math(out, `\\varepsilon = ${tone(texNum(eps, 4), 1)} \\quad\\Longrightarrow\\quad ${tone("\\text{nenhum } \\delta \\text{ serve}", 4)}`);
        text.innerHTML = `<p>Por menor que seja a distância a 0, sempre há pontos dos dois lados — um valendo −1, outro valendo 1. Com margem ${fmt(eps, 4)} em volta de 0, ${eps > 1 ? "eles ainda cabem" : "eles ficam de fora"}: ${eps > 1 ? "por enquanto δ existe, mas diminua ε para menos de 1" : "<strong>não existe δ</strong>, e o mesmo acontece com qualquer outro candidato a limite"}. Por isso o salto não tem limite em 0.</p>`;
      }
      saveParams({ ep: key, e: E.read() });
    }
    E.input.addEventListener("input", draw);
    onResize(draw);
    draw();
  }

  Licao.renderTex();
  const by = q => document.querySelector(q);
  if (by("#aproximar")) initAprox(by("#aproximar"));
  if (by("#epsilon")) initEps(by("#epsilon"));
})();
