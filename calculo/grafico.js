/* Cálculo intuitivo: o gráfico que todas as lições dividem.
 *
 * Grafico.plot(box, opções) desenha, num SVG da largura do box, a grade, os
 * eixos e devolve funções para a lição acrescentar o que é dela: curvas
 * (função ou lista de pontos), segmentos, retângulos, pontos e rótulos.
 * Curvas, segmentos e faixas ficam recortados pela área do gráfico; pontos e
 * rótulos, não. Com `equal`, as escalas dos dois eixos são iguais, para uma
 * inclinação parecer o que é.
 */
window.Grafico = (() => {
  const { fmt, svg } = Licao;
  let clip = 0;

  function niceStep(span, count) {
    const raw = span / count, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  }

  function plot(box, o) {
    const W = Math.round(Math.min(600, Math.max(300, box.clientWidth || 600)));
    const H = Math.round(o.height ? o.height(W) : Math.max(230, W * 0.55));
    const L = 44, R = 14, T = 14, B = 28;
    let { x0, x1, y0, y1 } = o;
    if (o.equal) {
      // Mesma escala nos dois eixos, centrada no meio da janela pedida.
      const ux = (x1 - x0) / (W - L - R), uy = (y1 - y0) / (H - T - B);
      if (ux > uy) { const m = (y0 + y1) / 2, h = ux * (H - T - B) / 2; y0 = m - h; y1 = m + h; }
      else { const m = (x0 + x1) / 2, h = uy * (W - L - R) / 2; x0 = m - h; x1 = m + h; }
    }
    const X = x => L + (x - x0) / (x1 - x0) * (W - L - R);
    const Y = y => T + (y1 - y) / (y1 - y0) * (H - T - B);
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot", role: "img", "aria-label": o.label || "" });

    // Grade e eixos discretos; o número de casas acompanha o passo, para o
    // zoom não repetir o mesmo rótulo em todas as marcas.
    const tick = s => Math.max(0, Math.min(8, Math.ceil(-Math.log10(s)) + 1));
    const sx = niceStep(x1 - x0, W < 450 ? 4 : 6), sy = niceStep(y1 - y0, 5);
    for (let x = Math.ceil(x0 / sx) * sx; x <= x1 + sx * 1e-9; x += sx) {
      svg("line", { x1: X(x), x2: X(x), y1: T, y2: H - B, class: "plot-grid" }, g);
      svg("text", { x: X(x), y: H - B + 18, class: "plot-tick", "text-anchor": "middle" }, g).textContent = fmt(x, tick(sx));
    }
    for (let y = Math.ceil(y0 / sy) * sy; y <= y1 + sy * 1e-9; y += sy) {
      svg("line", { x1: L, x2: W - R, y1: Y(y), y2: Y(y), class: "plot-grid" }, g);
      svg("text", { x: L - 6, y: Y(y) + 4, class: "plot-tick", "text-anchor": "end" }, g).textContent = fmt(y, tick(sy));
    }
    if (x0 < 0 && x1 > 0) svg("line", { x1: X(0), x2: X(0), y1: T, y2: H - B, class: "plot-axis" }, g);
    if (y0 < 0 && y1 > 0) svg("line", { x1: L, x2: W - R, y1: Y(0), y2: Y(0), class: "plot-axis is-x" }, g);
    if (o.xLabel) svg("text", { x: W - R, y: H - B - 6, class: "plot-tick", "text-anchor": "end" }, g).textContent = o.xLabel;
    if (o.yLabel) svg("text", { x: L + 6, y: T + 12, class: "plot-tick" }, g).textContent = o.yLabel;

    const id = `calc-clip-${++clip}`;
    svg("rect", { x: L, y: T, width: W - L - R, height: H - T - B }, svg("clipPath", { id }, g));
    const layer = svg("g", { "clip-path": `url(#${id})` }, g);

    // Curva de uma função ou de pontos; um valor não finito, ou muito fora
    // da janela, interrompe o traço em vez de riscar o gráfico.
    function curve(f, cls = "plot-curve", from = x0, to = x1, n = 400) {
      const pts = typeof f === "function" ? Array.from({ length: n + 1 }, (_, i) => { const x = from + (to - from) * i / n; return [x, f(x)]; }) : f;
      const far = (y1 - y0) * 20;
      let d = "", pen = false;
      pts.forEach(([x, y]) => {
        if (!Number.isFinite(y) || y > y1 + far || y < y0 - far) { pen = false; return; }
        d += `${pen ? "L" : "M"}${X(x).toFixed(2)},${Y(y).toFixed(2)}`;
        pen = true;
      });
      return svg("path", { d, class: cls }, layer);
    }
    const seg = (xa, ya, xb, yb, cls) => svg("line", { x1: X(xa), y1: Y(ya), x2: X(xb), y2: Y(yb), class: cls }, layer);
    // Reta de inclinação m pelo ponto (x, y), de ponta a ponta da janela.
    const line = (x, y, m, cls) => seg(x0, y + m * (x0 - x), x1, y + m * (x1 - x), cls);
    const band = (xa, xb, ya, yb, cls) => svg("rect", { x: X(Math.min(xa, xb)), y: Y(Math.max(ya, yb)), width: Math.abs(X(xb) - X(xa)), height: Math.abs(Y(yb) - Y(ya)), class: cls }, layer);
    const dot = (x, y, cls = "plot-dot is-hover", r = 5.5) => svg("circle", { cx: X(x), cy: Y(y), r, class: cls }, g);
    const label = (x, y, txt, anchor = "middle", dy = -10) => {
      const t = svg("text", { x: X(x), y: Y(y) + dy, class: "plot-label", "text-anchor": anchor }, g);
      t.textContent = txt;
      return t;
    };

    box.replaceChildren(g);
    return { g, layer, X, Y, W, H, x0, x1, y0, y1, curve, seg, line, band, dot, label };
  }

  // Redesenha os gráficos quando a largura muda (celular girando, janela).
  const redraws = [];
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => redraws.forEach(f => f()), 120);
  });
  const onResize = f => redraws.push(f);

  // Slider com rótulo e valor: <label class="var"><i>nome</i><input><output>.
  function slider(parent, { name, label, min, max, step, value, show, aria }) {
    const wrap = Licao.el("label", "var var-wide");
    const i = Licao.el("i");
    i.innerHTML = label;
    const input = Licao.el("input");
    Object.assign(input, { type: "range", name, min, max, step, value });
    input.setAttribute("aria-label", aria || name);
    const out = Licao.el("output");
    wrap.append(i, input, out);
    parent.appendChild(wrap);
    const read = () => Number(input.value);
    const sync = () => { out.textContent = show ? show(read()) : fmt(read()); };
    sync();
    return { input, read, sync, set: v => { input.value = v; sync(); } };
  }

  // Valor inicial de um slider vindo da URL, se estiver na faixa.
  function fromUrl(name, min, max, fallback) {
    const q = new URLSearchParams(location.search);
    const v = Number(q.get(name));
    return q.has(name) && Number.isFinite(v) && v >= min && v <= max ? v : fallback;
  }

  // Botões de escolha (.seg) ligados a uma chave da URL.
  function choice(section, attr, key, onChange) {
    const btns = Array.from(section.querySelectorAll(`[data-${attr}]`));
    const q = new URLSearchParams(location.search);
    let cur = btns.find(b => b.dataset[attr] === q.get(key)) || btns.find(b => b.getAttribute("aria-pressed") === "true") || btns[0];
    const press = b => { cur = b; btns.forEach(u => u.setAttribute("aria-pressed", String(u === b))); };
    press(cur);
    btns.forEach(b => b.addEventListener("click", () => { press(b); onChange(b.dataset[attr]); }));
    return () => cur.dataset[attr];
  }

  return { plot, niceStep, onResize, slider, fromUrl, choice };
})();
