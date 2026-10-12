/* Integral: a água que se acumula num tanque (a área sob a vazão vira a
 * curva do volume) e a área medida com n retângulos, que se aproxima do
 * valor exato conforme n cresce.
 */
(() => {
  const { fmt, texNum, tone, math, saveParams } = Licao;
  const { plot, slider, fromUrl, choice, onResize } = Grafico;

  /* ---------------------------------------------------------------- tanque */

  // Vazão em L/min: abre, chega a 6 L/min no meio e fecha aos 10 min.
  const r = t => 0.24 * t * (10 - t);
  const V = t => 0.24 * (5 * t * t - t ** 3 / 3);

  function initTanque(section) {
    const vars = section.querySelector(".tanque-vars");
    const brate = section.querySelector(".tanque-rate");
    const bvol = section.querySelector(".tanque-vol");
    const out = section.querySelector(".tanque-out");
    const text = section.querySelector(".tanque-text");
    const T = slider(vars, { name: "t", label: "<i>t</i>", min: 0, max: 10, step: 0.1, value: fromUrl("t", 0, 10, 4), show: v => `${fmt(v, 1)} min`, aria: "Instante t" });

    function draw() {
      const t = T.read();
      const height = W => Math.max(180, W * 0.38);
      const pr = plot(brate, { x0: 0, x1: 10, y0: -0.4, y1: 7, height, xLabel: "t (min)", yLabel: "L/min", label: `Vazão da torneira, com a área até ${fmt(t, 1)} minutos sombreada` });
      pr.area(r, 0, t);
      pr.curve(r);
      pr.seg(t, 0, t, r(t), "plot-guide");
      pr.dot(t, r(t), "plot-dot is-a");
      const pv = plot(bvol, { x0: 0, x1: 10, y0: -2, y1: 44, height, xLabel: "t (min)", yLabel: "L", label: `Volume acumulado no tanque até ${fmt(t, 1)} minutos` });
      pv.curve(V, "plot-curve is-faint");
      pv.curve(V, "plot-curve", 0, t, 200);
      pv.line(t, V(t), r(t), "plot-tangent");
      pv.dot(t, V(t), "plot-dot is-b");
      math(out, `\\text{volume} = \\int_0^{${texNum(t, 1)}} r(s)\\,ds \\approx ${tone(`${texNum(V(t), 2)}\\ \\text{L}`, 1)} \\qquad r(${texNum(t, 1)}) \\approx ${tone(`${texNum(r(t), 2)}\\ \\text{L/min}`, 2)}`);
      const fase = t < 2 ? "A torneira mal abriu: a área cresce devagar, e o tanque quase não enche."
        : t <= 8 ? "Com a torneira bem aberta, cada minuto acrescenta uma faixa larga de área, e o volume sobe depressa."
          : "A torneira está fechando: as faixas novas são finas, e o volume quase para de subir.";
      text.innerHTML = `<p>Até ${fmt(t, 1)} min entraram <strong>${fmt(V(t), 2)} litros</strong> — a área sombreada no gráfico de cima. ${fase} No fim, são 40 litros.</p>`
        + `<p>Repare na tangente da curva de baixo: a inclinação dela, no instante ${fmt(t, 1)}, é exatamente a vazão naquele instante, ${fmt(r(t), 2)} L/min. Acumular e derivar são operações inversas — a ideia da próxima lição.</p>`;
      saveParams({ t });
    }
    T.input.addEventListener("input", () => { T.sync(); draw(); });
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- retângulos */

  const normPdf = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  const G = {
    x2: { tex: "\\int_0^2 x^2\\,dx", f: x => x * x, a: 0, b: 2, exact: 8 / 3, y: [-0.3, 4.4] },
    sen: { tex: "\\int_0^{\\pi} \\operatorname{sen} x\\,dx", f: Math.sin, a: 0, b: Math.PI, exact: 2, y: [-0.15, 1.15] },
    normal: { tex: "\\int_{-1{,}96}^{1{,}96} \\varphi(x)\\,dx", f: normPdf, a: -1.96, b: 1.96, exact: 0.9500042097, y: [-0.03, 0.45] },
    onda: { tex: "\\int_0^{2\\pi} \\operatorname{sen} x\\,dx", f: Math.sin, a: 0, b: 2 * Math.PI, exact: 0, y: [-1.2, 1.2] },
  };
  const NS = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50, 100, 200];
  const OFF = { esq: 0, meio: 0.5, dir: 1 };
  const soma = (g, n, m) => { const dx = (g.b - g.a) / n; let s = 0; for (let i = 0; i < n; i++) s += g.f(g.a + (i + OFF[m]) * dx) * dx; return s; };
  const small = v => (Math.abs(v) < 1e-12 ? "0" : Math.abs(v) >= 1e-3 ? texNum(v, 6) : `${texNum(v / 10 ** Math.floor(Math.log10(Math.abs(v))), 2)} \\times 10^{${Math.floor(Math.log10(Math.abs(v)))}}`);

  function initRet(section) {
    const vars = section.querySelector(".ret-vars");
    const box = section.querySelector(".ret-plot");
    const out = section.querySelector(".ret-out");
    const table = section.querySelector(".ret-table");
    const text = section.querySelector(".ret-text");
    const curG = choice(section, "g", "g", () => draw());
    const curM = choice(section, "m", "m", () => draw());
    const N = slider(vars, { name: "n", label: "<i>n</i>", min: 0, max: NS.length - 1, step: 1, value: fromUrl("n", 0, NS.length - 1, 3), show: i => fmt(NS[i]), aria: "Número de retângulos" });

    function draw() {
      const g = G[curG()], m = curM(), n = NS[N.read()];
      const dx = (g.b - g.a) / n, S = soma(g, n, m), err = S - g.exact;
      const pad = (g.b - g.a) * 0.05;
      const p = plot(box, { x0: g.a - pad, x1: g.b + pad, y0: g.y[0], y1: g.y[1], label: `${n} retângulos sob a curva, com altura tomada pela ${m === "meio" ? "ponto médio" : m === "esq" ? "borda esquerda" : "borda direita"}` });
      for (let i = 0; i < n; i++) {
        const x0 = g.a + i * dx, h = g.f(x0 + OFF[m] * dx);
        p.band(x0, x0 + dx, 0, h, h < 0 ? "plot-rect is-neg" : "plot-rect");
      }
      p.curve(g.f, "plot-curve", g.a - pad, g.b + pad, 400);
      math(out, `${g.tex} \\approx ${tone(texNum(S, 6), 3)} \\qquad \\text{exato: } ${tone(texNum(g.exact, 6), 1)} \\qquad \\text{erro: } ${small(err)}`);
      const rows = [1, 2, 4, 8, 16, 32, 64, 128, 256].map(k => { const s = soma(g, k, m); return `${k} & ${texNum(s, 6)} & ${small(s - g.exact)}`; }).join(" \\\\ ");
      math(table, `\\begin{array}{r|l|l} n & \\text{soma} & \\text{erro} \\\\ \\hline ${rows} \\end{array}`);
      const how = curG() === "onda" ? "Aqui a soma dá zero para qualquer n: a figura é simétrica, e cada retângulo de cima tem um par do mesmo tamanho embaixo."
        : m === "meio" ? "Pelo ponto médio, cada retângulo passa um pouco da curva de um lado e fica devendo do outro, e os erros quase se cancelam: dobrar n divide o erro por cerca de 4."
        : "Pela borda, numa curva que sobe ou desce, todos os retângulos erram para o mesmo lado: dobrar n só divide o erro por cerca de 2.";
      text.innerHTML = `<p>Com ${n} ${n === 1 ? "retângulo" : "retângulos"} de largura ${fmt(dx, 4)}, a soma dá ${fmt(S, 4)}. ${how} No limite, com infinitos retângulos infinitamente finos, a soma <strong>é</strong> a área: essa é a definição da integral.</p>`
        + (curG() === "onda" ? `<p>Aqui os retângulos abaixo do eixo, em vermelho, entram com sinal negativo e cancelam os de cima: a integral de sen x numa volta completa é 0.</p>`
          : curG() === "normal" ? `<p>A área sob a curva normal entre −1,96 e 1,96 é 0,95: a chance de uma variável normal padrão cair nessa faixa. Probabilidade é área.</p>` : "");
      saveParams({ g: curG(), m, n: N.read() });
    }
    N.input.addEventListener("input", () => { N.sync(); draw(); });
    onResize(draw);
    draw();
  }

  Licao.renderTex();
  const by = q => document.querySelector(q);
  if (by("#tanque")) initTanque(by("#tanque"));
  if (by("#retangulos")) initRet(by("#retangulos"));
})();
