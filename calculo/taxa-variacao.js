/* Taxa de variação: a velocidade média entre dois instantes e a secante que,
 * encolhendo o intervalo, vira tangente. O carro anda 100 m em 10 s, saindo
 * e chegando parado: s(t) = 100 (3u² − 2u³), com u = t/10.
 */
(() => {
  const { fmt, texNum, tone, math, saveParams } = Licao;
  const { plot, slider, fromUrl, onResize } = Grafico;

  const s = t => { const u = t / 10; return 100 * (3 * u * u - 2 * u ** 3); };
  const v = t => { const u = t / 10; return 60 * (u - u * u); };
  const kmh = ms => fmt(ms * 3.6, 1);
  const win = { x0: 0, x1: 10, y0: -6, y1: 108, xLabel: "t (s)", yLabel: "s (m)" };

  /* ---------------------------------------------------------------- média */

  function initMedia(section) {
    const vars = section.querySelector(".media-vars");
    const box = section.querySelector(".media-plot");
    const out = section.querySelector(".media-out");
    const text = section.querySelector(".media-text");
    const sec = t => `${fmt(t, 1)} s`;
    const A = slider(vars, { name: "a", label: "<i>a</i>", min: 0, max: 10, step: 0.1, value: fromUrl("a", 0, 10, 2), show: sec, aria: "Instante a" });
    const B = slider(vars, { name: "b", label: "<i>b</i>", min: 0, max: 10, step: 0.1, value: fromUrl("b", 0, 10, 6), show: sec, aria: "Instante b" });

    function draw() {
      const a = A.read(), b = B.read();
      const sa = s(a), sb = s(b);
      const p = plot(box, { ...win, label: `Posição do carro ao longo do tempo, com a secante entre t = ${fmt(a, 1)} s e t = ${fmt(b, 1)} s` });
      p.curve(s);
      if (a !== b) {
        const m = (sb - sa) / (b - a);
        p.line(a, sa, m, "plot-secant");
        p.seg(a, sa, b, sa, "plot-run");
        p.seg(b, sa, b, sb, "plot-rise");
        p.label((a + b) / 2, sa, `Δt = ${fmt(b - a, 1)} s`, "middle", sb >= sa ? 18 : -10);
        p.label(b, (sa + sb) / 2, `Δs = ${fmt(sb - sa, 1)} m`, b > a ? "start" : "end", 4).setAttribute("dx", b > a ? 8 : -8);
      }
      p.dot(a, sa, "plot-dot is-a");
      p.dot(b, sb, "plot-dot is-b");

      if (a === b) {
        math(out, `\\dfrac{\\Delta s}{\\Delta t} = \\dfrac{0}{0}\\ ?`);
        text.innerHTML = "<p>Com <i>a</i> = <i>b</i> não há intervalo nenhum: o carro não andou e o tempo não passou, e a conta vira <strong>0 ÷ 0</strong>. É exatamente o problema da velocidade num instante — veja a seção seguinte.</p>";
      } else {
        const m = (sb - sa) / (b - a);
        math(out, `\\dfrac{\\Delta s}{\\Delta t} = \\dfrac{${texNum(sb, 1)} - ${texNum(sa, 1)}}{${texNum(b, 1)} - ${texNum(a, 1)}} \\approx ${tone(`${texNum(m, 2)}\\ \\text{m/s}`, 1)}`);
        const lo = Math.min(a, b), hi = Math.max(a, b);
        const fase = hi <= 3 ? "Saindo do sinal, o carro ainda está ganhando velocidade: a curva começa quase deitada."
          : lo >= 7 ? "Chegando no sinal, o carro está freando: a curva volta a deitar."
            : "No meio do caminho o carro está mais rápido, e a curva fica mais inclinada.";
        text.innerHTML = `<p>Entre ${fmt(lo, 1)} s e ${fmt(hi, 1)} s, o carro andou ${fmt(Math.abs(sb - sa), 1)} m em ${fmt(hi - lo, 1)} s: em média, ${fmt(Math.abs(m), 2)} m/s, ou ${kmh(Math.abs(m))} km/h. No gráfico, é a <strong>inclinação da reta</strong> que liga os dois pontos — quanto ela sobe para cada segundo que anda. ${fase}</p>`
          + `<p>A média esconde o que aconteceu no meio: um carro que ficou parado e depois correu pode ter a mesma média de um que andou devagar o tempo todo.</p>`;
      }
      saveParams({ a: fmt(a, 1).replace(",", "."), b: fmt(b, 1).replace(",", ".") });
    }
    [A, B].forEach(c => c.input.addEventListener("input", () => { c.sync(); draw(); }));
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- instante */

  function initInstante(section) {
    const vars = section.querySelector(".inst-vars");
    const box = section.querySelector(".inst-plot");
    const out = section.querySelector(".inst-out");
    const table = section.querySelector(".inst-table");
    const text = section.querySelector(".inst-text");
    // Passos redondos para o slider de h, de 2 s a 0,0001 s.
    const HS = [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.001, 0.0001];
    const hOf = k => HS[k];
    const T0 = slider(vars, { name: "t", label: "<i>t</i>", min: 0, max: 10, step: 0.1, value: fromUrl("t", 0, 10, 3), show: t => `${fmt(t, 1)} s`, aria: "Instante t" });
    const K = slider(vars, { name: "k", label: "<i>h</i>", min: 0, max: HS.length - 1, step: 1, value: fromUrl("k", 0, HS.length - 1, 0), show: k => `${fmt(hOf(k), 4)} s`, aria: "Tamanho do intervalo h" });

    function draw() {
      const t = T0.read(), h0 = hOf(K.read());
      // Perto do fim, o intervalo vai para trás, para não sair dos 10 s.
      const h = t + h0 <= 10 ? h0 : -h0;
      const st = s(t), sh = s(t + h), m = (sh - st) / h, vt = v(t);
      const p = plot(box, { ...win, label: `Secante de t = ${fmt(t, 1)} s a t + h, e a tangente em t` });
      p.curve(s);
      p.line(t, st, vt, "plot-tangent");
      p.line(t, st, m, "plot-secant");
      p.dot(t + h, sh, "plot-dot is-b", 5);
      p.dot(t, st, "plot-dot is-a");

      math(out, `\\dfrac{s(t + h) - s(t)}{h} \\approx ${tone(`${texNum(m, 4)}\\ \\text{m/s}`, 2)} \\qquad v(${texNum(t, 1)}) = ${tone(`${texNum(vt, 4)}\\ \\text{m/s}`, 1)}`);
      const hs = [2, 1, 0.5, 0.1, 0.01, 0.001, 0.0001];
      const rows = hs.map(hh => { const g = t + hh <= 10 ? hh : -hh; return `${texNum(g, 4)} & ${texNum((s(t + g) - st) / g, 6)}`; }).join(" \\\\ ");
      math(table, `\\begin{array}{r|l} h\\ (\\text{s}) & \\text{${"média no intervalo (m/s)"}} \\\\ \\hline ${rows} \\end{array}`);
      const parado = Math.abs(vt) < 1e-9;
      text.innerHTML = `<p>Quanto menor o intervalo, mais a média se aproxima de <strong>${fmt(vt, 4)} m/s</strong> (${kmh(vt)} km/h): é a velocidade no instante ${fmt(t, 1)} s, o que o velocímetro mostraria. ${parado ? "Neste instante o carro está parado: a tangente é horizontal." : ""}</p>`
        + `<p>Repare que nunca se faz h = 0 — a conta viraria 0 ÷ 0. O que se faz é ver <strong>de que número a razão se aproxima</strong> quando h encolhe. Esse “se aproxima” é um <a href="limite.html">limite</a>, e o número a que se chega é a <a href="derivada.html">derivada</a>.</p>`;
      saveParams({ t: fmt(t, 1).replace(",", "."), k: K.read() });
    }
    [T0, K].forEach(c => c.input.addEventListener("input", () => { c.sync(); draw(); }));
    onResize(draw);
    draw();
  }

  Licao.renderTex();
  const by = q => document.querySelector(q);
  if (by("#media")) initMedia(by("#media"));
  if (by("#instante")) initInstante(by("#instante"));
})();
