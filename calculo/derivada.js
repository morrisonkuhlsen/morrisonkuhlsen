/* Derivada: o microscópio, que dá zoom num ponto até a curva virar reta, e
 * o gráfico de f com a tangente em cima e o de f′ embaixo.
 */
(() => {
  const { fmt, texNum, tone, math, saveParams } = Licao;
  const { plot, slider, fromUrl, choice, onResize } = Grafico;

  // r: faixa do ponto x; w: meia-largura da janela sem zoom; y: faixa
  // vertical dos gráficos de f e de f′ no segundo painel.
  const G = {
    x2: { tex: "x^2", dtex: "2x", f: x => x * x, d: x => 2 * x, r: [-3, 3], x: 1, w: 2.5, yf: [-1, 9], yd: [-6.5, 6.5], crit: [0] },
    cubo: { tex: "x^3 - 3x", dtex: "3x^2 - 3", f: x => x ** 3 - 3 * x, d: x => 3 * x * x - 3, r: [-2.5, 2.5], x: 0.5, w: 2, yf: [-4.5, 4.5], yd: [-4, 12], crit: [-1, 1] },
    sen: { tex: "\\operatorname{sen} x", dtex: "\\cos x", f: Math.sin, d: Math.cos, r: [-6.3, 6.3], x: 1, w: 3, yf: [-1.4, 1.4], yd: [-1.4, 1.4], crit: [-3 * Math.PI / 2, -Math.PI / 2, Math.PI / 2, 3 * Math.PI / 2] },
    exp: { tex: "e^{x}", dtex: "e^{x}", f: Math.exp, d: Math.exp, r: [-3, 2], x: 0, w: 2, yf: [-0.5, 7.5], yd: [-0.5, 7.5], crit: [] },
  };
  const slopeWord = m => (Math.abs(m) < 0.02 ? "praticamente horizontal" : m > 0 ? "subindo" : "descendo");

  /* ---------------------------------------------------------------- zoom */

  function initZoom(section) {
    const vars = section.querySelector(".zoom-vars");
    const box = section.querySelector(".zoom-plot");
    const cap = section.querySelector(".zoom-cap");
    const out = section.querySelector(".zoom-out");
    const text = section.querySelector(".zoom-text");
    const key0 = new URLSearchParams(location.search).get("f");
    const g0 = G[key0] || G.x2;
    const P = slider(vars, { name: "x", label: "<i>x</i>", min: g0.r[0], max: g0.r[1], step: 0.05, value: fromUrl("x", g0.r[0], g0.r[1], g0.x), show: v => fmt(v, 2), aria: "Ponto x" });
    const Z = slider(vars, { name: "z", label: "zoom", min: 0, max: 4, step: 0.05, value: fromUrl("z", 0, 4, 0), show: z => `${fmt(10 ** z, 0)}×`, aria: "Zoom" });
    const cur = choice(section, "g", "f", key => {
      const g = G[key];
      P.input.min = g.r[0]; P.input.max = g.r[1]; P.set(g.x); Z.set(0);
      draw();
    });

    function draw() {
      const g = G[cur()], x = P.read(), zoom = 10 ** Z.read();
      const w = g.w / zoom, fx = g.f(x), m = g.d(x);
      const p = plot(box, { x0: x - w, x1: x + w, y0: fx - w, y1: fx + w, equal: true,
        height: W => Math.max(240, W * 0.6), label: `Curva de ${g.tex.replace(/\\/g, "")} perto de x = ${fmt(x, 2)}, com zoom de ${fmt(zoom, 0)} vezes` });
      p.line(x, fx, m, "plot-tangent");
      p.curve(g.f, "plot-curve", p.x0, p.x1, 600);
      p.dot(x, fx, "plot-dot is-a");
      const visto = (g.f(x + w) - g.f(x - w)) / (2 * w);
      cap.textContent = `janela de ${fmt(2 * w, 6)} de largura · tracejada: a tangente`;
      math(out, `\\text{inclinação vista} \\approx ${tone(texNum(visto, 6), 2)} \\qquad f'(${texNum(x, 2)}) = ${g.dtex.replace(/x/g, `(${texNum(x, 2)})`)} ${Math.abs(m - Math.round(m * 1e6) / 1e6) < 1e-12 ? "=" : "\\approx"} ${tone(texNum(m, 6), 1)}`);
      const curva = Math.abs(g.f(x + w) - (fx + m * w)) / w;
      text.innerHTML = zoom < 5
        ? `<p>Sem zoom, dá para ver a curva <strong>se afastando</strong> da tangente dos dois lados. Aumente o zoom.</p>`
        : curva < 0.005
          ? `<p>Com zoom de ${fmt(zoom, 0)} vezes, a curva e a tangente <strong>não se distinguem mais</strong>: perto o bastante, a curva é uma reta de inclinação ${fmt(m, 4)}. Esse número é a derivada em x = ${fmt(x, 2)}.</p>`
          : `<p>A curva já se parece bem mais com uma reta. Continue aumentando o zoom.</p>`;
      text.innerHTML += `<p>Toda função “lisa” — sem bico nem salto — tem essa propriedade. É por isso que a derivada existe e é por isso que retas aproximam tão bem curvas em trechos pequenos.</p>`;
      saveParams({ f: cur(), x: P.read(), z: Z.read() });
    }
    [P, Z].forEach(c => c.input.addEventListener("input", () => { c.sync(); draw(); }));
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- f e f′ */

  function initGraf(section) {
    const vars = section.querySelector(".graf-vars");
    const boxF = section.querySelector(".graf-f");
    const boxD = section.querySelector(".graf-d");
    const capF = section.querySelector(".graf-cap-f");
    const capD = section.querySelector(".graf-cap-d");
    const out = section.querySelector(".graf-out");
    const text = section.querySelector(".graf-text");
    const key0 = new URLSearchParams(location.search).get("h");
    const g0 = G[key0] || G.cubo;
    const P = slider(vars, { name: "p", label: "<i>x</i>", min: g0.r[0], max: g0.r[1], step: 0.02, value: fromUrl("p", g0.r[0], g0.r[1], -1.8), show: v => fmt(v, 2), aria: "Ponto x na curva" });
    const cur = choice(section, "h", "h", key => {
      const g = G[key];
      P.input.min = g.r[0]; P.input.max = g.r[1]; P.set(g.r[0] * 0.7);
      draw();
    });

    function draw() {
      const g = G[cur()], x = P.read(), fx = g.f(x), m = g.d(x);
      const height = W => Math.max(190, W * 0.42);
      const pf = plot(boxF, { x0: g.r[0], x1: g.r[1], y0: g.yf[0], y1: g.yf[1], height, label: `Gráfico de f com a tangente em x = ${fmt(x, 2)}` });
      pf.curve(g.f);
      pf.line(x, fx, m, "plot-secant");
      pf.dot(x, fx, "plot-dot is-a");
      const pd = plot(boxD, { x0: g.r[0], x1: g.r[1], y0: g.yd[0], y1: g.yd[1], height, label: `Gráfico de f′, com o ponto em x = ${fmt(x, 2)}` });
      pd.curve(g.d, "plot-curve is-faint");
      pd.curve(g.d, "plot-curve is-second", g.r[0], x, 300);
      pd.seg(x, 0, x, m, "plot-guide");
      pd.dot(x, m, "plot-dot is-b");
      g.crit.filter(c => c >= g.r[0] && c <= g.r[1]).forEach(c => { pf.dot(c, g.f(c), "plot-dot is-hole", 4); pd.dot(c, 0, "plot-dot is-hole", 4); });
      capF.innerHTML = `em cima: f(x) e a tangente no ponto`;
      capD.innerHTML = `embaixo: f′(x), a inclinação da tangente — o traço cheio é o caminho já percorrido`;
      math(out, `f(x) = ${g.tex} \\qquad f'(x) = ${g.dtex} \\qquad f'(${texNum(x, 2)}) \\approx ${tone(texNum(m, 3), 1)}`);
      const crit = g.crit.length
        ? ` Os pontos vazados marcam onde f′ = 0: ${g.crit.length === 1 ? "o fundo" : "os topos e fundos"} de f, em que a tangente fica horizontal.`
        : " Aqui f′ nunca é zero: eˣ só sobe, e cada vez mais depressa — a derivada é a própria função.";
      text.innerHTML = `<p>Em x = ${fmt(x, 2)}, a curva de cima está <strong>${slopeWord(m)}</strong>, com inclinação ${fmt(m, 3)}; por isso o ponto de baixo está ${Math.abs(m) < 0.02 ? "sobre o zero" : m > 0 ? "acima do zero" : "abaixo do zero"}.${crit}</p>`
        + `<p>Onde f sobe, f′ é positiva; onde desce, negativa. Quanto mais íngreme f, mais longe do zero fica f′.</p>`;
      saveParams({ h: cur(), p: P.read() });
    }
    P.input.addEventListener("input", () => { P.sync(); draw(); });
    onResize(draw);
    draw();
  }

  Licao.renderTex();
  const by = q => document.querySelector(q);
  if (by("#zoom")) initZoom(by("#zoom"));
  if (by("#grafico")) initGraf(by("#grafico"));
})();
