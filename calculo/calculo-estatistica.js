/* Cálculo na estatística: densidade e acumulada (derivada e integral uma da
 * outra), a média como integral e ponto de equilíbrio de uma Gama, e a
 * máxima verossimilhança de uma proporção, onde a derivada do log zera.
 */
(() => {
  const { fmt, texNum, tone, math, svg, saveParams } = Licao;
  const { plot, slider, fromUrl, choice, onResize } = Grafico;

  // Normal padrão: densidade e acumulada (erf de Abramowitz–Stegun 7.1.26).
  const phi = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  function Phi(z) {
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const erf = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z / 2);
    return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
  }
  // ln Γ(x) por Lanczos, para a densidade Gama com forma não inteira.
  function lgamma(x) {
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61503916999185, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    let a = c[0]; const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  function simpson(f, a, b, n = 4000) {
    const h = (b - a) / n; let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return s * h / 3;
  }

  /* ---------------------------------------------------------------- densidade */

  const D = {
    normal: { name: "normal padrão", F: Phi, f: phi, dom: [-4, 4], y: 0.45, x: 1 },
    expo: { name: "exponencial de taxa 1", F: x => (x <= 0 ? 0 : 1 - Math.exp(-x)), f: x => (x < 0 ? 0 : Math.exp(-x)), dom: [-0.5, 5], y: 1.1, x: 1 },
    unif: { name: "uniforme entre 0 e 2", F: x => Math.min(1, Math.max(0, x / 2)), f: x => (x >= 0 && x <= 2 ? 0.5 : 0), dom: [-0.5, 2.5], y: 0.7, x: 1.2 },
  };
  const TXT = {
    normal: "A acumulada da normal é a curva em S: sobe mais depressa no meio, onde a densidade é mais alta, e achata nas pontas, onde a densidade quase some. A área total sob o sino é 1 — a acumulada termina em 1.",
    expo: "Na exponencial, a densidade é maior perto de zero: as esperas curtas são as mais prováveis, e a acumulada sobe depressa no começo. Para x negativo, nada pode acontecer: densidade zero e acumulada plana em zero.",
    unif: "Na uniforme, a densidade é constante entre 0 e 2, então a acumulada sobe em linha reta. Em 0 e em 2 a acumulada faz um bico: ali a derivada não existe, e a densidade dá um salto.",
  };

  function initDensidade(section) {
    const vars = section.querySelector(".dens-vars");
    const bF = section.querySelector(".dens-F");
    const bf = section.querySelector(".dens-f");
    const out = section.querySelector(".dens-out");
    const text = section.querySelector(".dens-text");
    const d0 = D[new URLSearchParams(location.search).get("d")] || D.normal;
    const X = slider(vars, { name: "x", label: "<i>x</i>", min: d0.dom[0], max: d0.dom[1], step: 0.01, value: fromUrl("x", d0.dom[0], d0.dom[1], d0.x), show: v => fmt(v, 2), aria: "Valor x" });
    const cur = choice(section, "d", "d", key => { const d = D[key]; X.input.min = d.dom[0]; X.input.max = d.dom[1]; X.set(d.x); draw(); });

    function draw() {
      const d = D[cur()], x = X.read(), Fx = d.F(x), fx = d.f(x);
      const height = W => Math.max(170, W * 0.34);
      const pF = plot(bF, { x0: d.dom[0], x1: d.dom[1], y0: -0.05, y1: 1.08, height, label: `Acumulada da ${d.name}, com a tangente em x = ${fmt(x, 2)}` });
      pF.curve(d.F, "plot-curve is-second", d.dom[0], d.dom[1], 600);
      pF.line(x, Fx, fx, "plot-tangent");
      pF.dot(x, Fx, "plot-dot is-b");
      const pf = plot(bf, { x0: d.dom[0], x1: d.dom[1], y0: -0.03, y1: d.y, height, label: `Densidade da ${d.name}, com a área até x = ${fmt(x, 2)} sombreada` });
      pf.area(d.f, d.dom[0], x, "plot-area", 400);
      pf.curve(d.f, "plot-curve", d.dom[0], d.dom[1], 600);
      pf.dot(x, fx, "plot-dot is-a");
      math(out, `F(${texNum(x, 2)}) = P(X \\le ${texNum(x, 2)}) \\approx ${tone(`${texNum(Fx * 100, 2)}\\%`, 3)} \\qquad f(${texNum(x, 2)}) = F'(${texNum(x, 2)}) \\approx ${tone(texNum(fx, 4), 1)}`);
      text.innerHTML = `<p>A área sombreada embaixo vale ${fmt(Fx, 4)} — exatamente a altura da curva de cima. A tangente de cima tem inclinação ${fmt(fx, 4)} — exatamente a altura da curva de baixo. Integrar a densidade dá a acumulada; derivar a acumulada dá a densidade: é o <a href="teorema-fundamental.html">teorema fundamental</a>.</p><p>${TXT[cur()]}</p>`;
      saveParams({ d: cur(), x });
    }
    X.input.addEventListener("input", () => { X.sync(); draw(); });
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- média */

  function initMedia(section) {
    const vars = section.querySelector(".media-vars");
    const bf = section.querySelector(".media-f");
    const bx = section.querySelector(".media-xf");
    const out = section.querySelector(".media-out");
    const text = section.querySelector(".media-text");
    const K = slider(vars, { name: "k", label: "<i>k</i>", min: 1, max: 6, step: 0.1, value: fromUrl("k", 1, 6, 2), show: v => fmt(v, 1), aria: "Forma k" });

    function draw() {
      const k = K.read(), lg = lgamma(k);
      const f = x => (x <= 0 ? (k === 1 ? 1 : 0) : Math.exp((k - 1) * Math.log(x) - x - lg));
      const xf = x => x * f(x);
      const top = 15, mean = simpson(xf, 0, 40), area = simpson(f, 0, 40);
      const varr = simpson(x => (x - mean) ** 2 * f(x), 0, 40);
      const height = W => Math.max(170, W * 0.34);
      const fmax = Math.max(...Array.from({ length: 300 }, (_, i) => f(i * top / 300)));
      const p1 = plot(bf, { x0: 0, x1: top, y0: -fmax * 0.16, y1: fmax * 1.12, height, label: `Densidade Gama com forma ${fmt(k, 1)}, apoiada na média ${fmt(mean, 2)}` });
      p1.area(f, 0, top, "plot-area", 400);
      p1.curve(f, "plot-curve", 0, top, 600);
      // O apoio: um triângulo sob o eixo, no ponto de equilíbrio.
      const cx = p1.X(mean), cy = p1.Y(0), s = 11;
      svg("polygon", { points: `${cx},${cy} ${cx - s},${cy + s * 1.4} ${cx + s},${cy + s * 1.4}`, class: "plot-fulcrum" }, p1.g);
      p1.label(mean, 0, `média = ${fmt(mean, 2)}`, "start", 26).setAttribute("dx", 14);
      const xmax = Math.max(...Array.from({ length: 300 }, (_, i) => xf(i * top / 300)));
      const p2 = plot(bx, { x0: 0, x1: top, y0: -xmax * 0.05, y1: xmax * 1.12, height, label: "Curva de x vezes a densidade, com a área sombreada" });
      p2.area(xf, 0, top, "plot-area", 400);
      p2.curve(xf, "plot-curve is-second", 0, top, 600);
      math(out, `E[X] = \\int_0^{\\infty} x\\,f(x)\\,dx \\approx ${tone(texNum(mean, 4), 1)} \\qquad \\int_0^{\\infty} f(x)\\,dx \\approx ${texNum(area, 4)}`);
      text.innerHTML = `<p>A área sob x · f(x) é <strong>${fmt(mean, 3)}</strong>, a média: numa Gama de taxa 1, ela é igual à forma k = ${fmt(k, 1)}. A cauda longa à direita puxa o ponto de equilíbrio para depois do pico, que fica em ${k > 1 ? fmt(k - 1, 1) : "0"}.</p>`
        + `<p>Trocando x por (x − μ)², a mesma integral dá a variância: ${fmt(varr, 3)}, também igual a k aqui. Para dados, a média é uma soma; para uma densidade, uma integral — a mesma ideia do <a href="/formulas/valor-esperado.html">valor esperado</a>.</p>`;
      saveParams({ k });
    }
    K.input.addEventListener("input", () => { K.sync(); draw(); });
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- verossimilhança */

  function initMV(section) {
    const vars = section.querySelector(".mv-vars");
    const bL = section.querySelector(".mv-L");
    const bl = section.querySelector(".mv-ll");
    const out = section.querySelector(".mv-out");
    const text = section.querySelector(".mv-text");
    const N = slider(vars, { name: "n", label: "<i>n</i>", min: 1, max: 100, step: 1, value: fromUrl("n", 1, 100, 20), aria: "Lançamentos n" });
    const S = slider(vars, { name: "s", label: "<i>k</i>", min: 0, max: N.read(), step: 1, value: fromUrl("s", 0, N.read(), 14), aria: "Caras k" });
    const P = slider(vars, { name: "p", label: "<i>p</i>", min: 0.01, max: 0.99, step: 0.01, value: fromUrl("p", 0.01, 0.99, 0.5), show: v => fmt(v, 2), aria: "Valor de p" });

    function draw() {
      const n = N.read();
      S.input.max = n; if (S.read() > n) S.set(n); S.sync();
      const k = S.read(), p = P.read(), hat = k / n;
      const ll = q => (k ? k * Math.log(q) : 0) + (n - k ? (n - k) * Math.log(1 - q) : 0);
      const dll = q => k / q - (n - k) / (1 - q);
      const llMax = ll(Math.min(0.999999, Math.max(1e-6, hat)));
      const L = q => Math.exp(ll(q) - llMax);
      const height = W => Math.max(170, W * 0.34);
      const p1 = plot(bL, { x0: 0, x1: 1, y0: -0.05, y1: 1.12, height, label: `Verossimilhança de p com ${k} caras em ${n} lançamentos` });
      p1.area(L, 0.001, 0.999, "plot-area", 400);
      p1.curve(L, "plot-curve", 0.001, 0.999, 600);
      p1.line(p, L(p), L(p) * dll(p), "plot-tangent");
      p1.dot(hat, 1, "plot-dot is-vertex");
      p1.label(hat, 1, `p̂ = ${fmt(hat, 3)}`, "middle", -10);
      p1.dot(p, L(p), "plot-dot is-a");
      const lo = llMax - 14;
      const p2 = plot(bl, { x0: 0, x1: 1, y0: lo, y1: llMax + 2, height, label: "Log-verossimilhança de p" });
      p2.curve(ll, "plot-curve is-second", 0.001, 0.999, 600);
      p2.line(p, ll(p), dll(p), "plot-tangent");
      p2.dot(hat, llMax, "plot-dot is-vertex");
      p2.dot(p, ll(p), "plot-dot is-b");
      math(out, `\\dfrac{d}{dp}\\ln L = \\dfrac{${k}}{p} - \\dfrac{${n - k}}{1 - p} \\;\\Big|_{p = ${texNum(p, 2)}} \\approx ${tone(texNum(dll(p), 3), 2)} \\qquad \\hat{p} = \\dfrac{${k}}{${n}} ${Number.isInteger(hat * 1000) ? "=" : "\\approx"} ${tone(texNum(hat, 3), 1)}`);
      const dir = Math.abs(p - hat) < 0.006 ? "Aqui a derivada é zero: é o topo, a estimativa de máxima verossimilhança."
        : p < hat ? "A derivada é positiva: aumentar p torna os dados mais prováveis. Ande para a direita."
          : "A derivada é negativa: diminuir p torna os dados mais prováveis. Ande para a esquerda.";
      text.innerHTML = `<p>${dir} Igualando a derivada a zero, ${k}/p = ${n - k}/(1 − p), e sai <strong>p̂ = k/n = ${fmt(hat, 3)}</strong>: a proporção observada, como a intuição diria.</p>`
        + `<p>Aumente n mantendo a proporção: a curva fica mais estreita, porque com mais dados menos valores de p explicam bem o que se viu. Essa largura é a incerteza da estimativa — a base do <a href="/formulas/ic-proporcao.html">intervalo de confiança para proporção</a> e, pelo lado bayesiano, da <a href="/formulas/distribuicao-beta.html">distribuição Beta</a>.</p>`;
      saveParams({ n, s: k, p });
    }
    [N, S, P].forEach(c => c.input.addEventListener("input", () => { c.sync(); draw(); }));
    onResize(draw);
    draw();
  }

  Licao.renderTex();
  const by = q => document.querySelector(q);
  if (by("#densidade")) initDensidade(by("#densidade"));
  if (by("#media")) initMedia(by("#media"));
  if (by("#verossimilhanca")) initMV(by("#verossimilhanca"));
})();
