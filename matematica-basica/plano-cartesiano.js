/* Plano cartesiano: um ponto que se arrasta (coordenadas, quadrante e o
 * caminho a partir da origem), a distância e o ponto médio entre dois pontos
 * com o triângulo de Pitágoras desenhado, e o gráfico de dispersão dividido
 * pelo centro (x̄, ȳ), que é a ideia da covariância. Os utilitários vêm de
 * licao.js.
 *
 * Os três gráficos são arrastáveis: o SVG é criado uma vez (para o ponteiro
 * não se perder no meio do arrasto) e só a camada de cima é redesenhada.
 */
(() => {
  const { fmt, texNum, tone, math, el, svg, saveParams } = Licao;
  const t = v => texNum(v, 2);
  // Com decimal no par, a vírgula separadora vira ponto e vírgula: (−0,5; 0).
  const sep = (x, y) => (Number.isInteger(x) && Number.isInteger(y) ? "," : ";");
  const par = (x, y) => `(${fmt(x, 2)}${sep(x, y)} ${fmt(y, 2)})`;
  const parTex = (x, y) => `(${t(x)}${sep(x, y)}\\ ${t(y)})`;

  /* ---------------------------------------------------------------- o plano */

  // Janela quadrada de lo a hi nos dois eixos. Devolve as escalas, a camada
  // que se redesenha e a conversão do ponteiro para coordenadas.
  function plano(box, { lo, hi, cada = 2, rotulo }) {
    const W = 420, H = 420, M = 28;
    const X = v => M + (v - lo) / (hi - lo) * (W - 2 * M);
    const Y = v => H - M - (v - lo) / (hi - lo) * (H - 2 * M);
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot plano-plot", role: "img", "aria-label": rotulo });
    const fundo = svg("g", {}, g);
    for (let v = lo; v <= hi; v++) {
      const eixo = v === 0;
      svg("line", { x1: X(v), x2: X(v), y1: Y(lo), y2: Y(hi), class: eixo ? "plot-axis is-x" : "plot-grid" }, fundo);
      svg("line", { x1: X(lo), x2: X(hi), y1: Y(v), y2: Y(v), class: eixo ? "plot-axis is-x" : "plot-grid" }, fundo);
      if (v % cada === 0 && (v !== 0 || lo === 0)) {
        const y0 = lo === 0 ? Y(lo) : Y(0), x0 = lo === 0 ? X(lo) : X(0);
        const tx = svg("text", { x: X(v), y: y0 + 16, class: "plot-tick", "text-anchor": "middle" }, fundo);
        tx.textContent = fmt(v);
        if (v !== 0) {
          const ty = svg("text", { x: x0 - 6, y: Y(v) + 4, class: "plot-tick", "text-anchor": "end" }, fundo);
          ty.textContent = fmt(v);
        }
      }
    }
    const nome = (x, y, txt, anchor) => {
      const e = svg("text", { x, y, class: "plot-tick plano-eixo", "text-anchor": anchor }, fundo);
      e.textContent = txt;
    };
    nome(X(hi) + 4, (lo === 0 ? Y(lo) : Y(0)) - 6, "x", "end");
    nome((lo === 0 ? X(lo) : X(0)) + 8, Y(hi) + 4, "y", "start");
    const camada = svg("g", {}, g);
    box.replaceChildren(g);

    function unidades(ev) {
      const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(g.getScreenCTM().inverse());
      return {
        x: lo + (p.x - M) / (W - 2 * M) * (hi - lo),
        y: lo + (H - M - p.y) / (H - 2 * M) * (hi - lo),
      };
    }
    return { g, X, Y, lo, hi, camada, unidades };
  }

  // Arrastar: o clique pega o ponto mais perto e ele segue o ponteiro, preso
  // à grade (`passo`) e à janela. pontos() devolve [{ x, y, set(x, y) }].
  function arrastavel(P, pontos, passo, depois) {
    let alvo = null;
    const prende = v => Math.min(P.hi, Math.max(P.lo, Math.round(v / passo) * passo));
    function mover(ev) {
      const u = P.unidades(ev);
      alvo.set(prende(u.x), prende(u.y));
      depois();
    }
    P.g.addEventListener("pointerdown", ev => {
      const u = P.unidades(ev);
      let melhor = Infinity;
      pontos().forEach(p => {
        const d = Math.hypot(p.x - u.x, p.y - u.y);
        if (d < melhor) { melhor = d; alvo = p; }
      });
      if (!alvo) return;
      P.g.setPointerCapture(ev.pointerId);
      P.g.classList.add("is-dragging");
      mover(ev);
    });
    P.g.addEventListener("pointermove", ev => { if (alvo) mover(ev); });
    const solta = () => { alvo = null; P.g.classList.remove("is-dragging"); };
    // O ponto fica onde o ponteiro foi solto, mesmo sem pointermove no meio.
    P.g.addEventListener("pointerup", ev => { if (alvo) mover(ev); solta(); });
    P.g.addEventListener("pointercancel", solta);
  }

  const ponto = (P, x, y, cls) => svg("circle", { cx: P.X(x), cy: P.Y(y), r: 7, class: `plot-dot ${cls}` }, P.camada);
  const rotulo = (P, x, y, txt, cls = "", anchor = "start") => {
    const e = svg("text", { x, y, class: `plot-label ${cls}`, "text-anchor": anchor }, P.camada);
    e.textContent = txt;
  };

  // Liga sliders a um estado: { nome: input }. Lê a URL e devolve o estado.
  function sliders(section, nomes) {
    const q = new URLSearchParams(location.search);
    const ins = {}, outs = {}, st = {};
    nomes.forEach(n => {
      ins[n] = section.querySelector(`input[name=${n}]`);
      outs[n] = section.querySelector(`.out-${n}`);
      const v = Number(q.get(n));
      if (q.has(n) && Number.isInteger(v) && v >= Number(ins[n].min) && v <= Number(ins[n].max)) ins[n].value = v;
      st[n] = Number(ins[n].value);
    });
    const sync = () => nomes.forEach(n => { ins[n].value = st[n]; outs[n].textContent = fmt(st[n]); });
    section.querySelector(".vars").addEventListener("input", () => { nomes.forEach(n => (st[n] = Number(ins[n].value))); });
    return { st, sync };
  }

  /* ---------------------------------------------------------------- 1. um ponto */

  function quadrante(x, y) {
    if (x === 0 && y === 0) return { q: 0, txt: "Está na <strong>origem</strong>, o ponto (0, 0), onde os eixos se cruzam." };
    if (x === 0) return { q: 0, txt: "Está <strong>sobre o eixo y</strong>: x = 0 quer dizer não andar nada para os lados. Pontos sobre um eixo não pertencem a nenhum quadrante." };
    if (y === 0) return { q: 0, txt: "Está <strong>sobre o eixo x</strong>: y = 0 quer dizer não subir nem descer. Pontos sobre um eixo não pertencem a nenhum quadrante." };
    const q = x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3);
    const sx = x > 0 ? "positivo" : "negativo", sy = y > 0 ? "positivo" : "negativo";
    return { q, txt: `Está no <strong>${q}º quadrante</strong>: x ${sx} e y ${sy}.` };
  }

  function initPonto(section) {
    const P = plano(section.querySelector(".plano-fig"), { lo: -6, hi: 6, rotulo: "Plano cartesiano com um ponto que se arrasta" });
    const { st, sync } = sliders(section, ["px", "py"]);
    const eq = section.querySelector(".calc-result");
    const text = section.querySelector(".intro-text");

    function draw() {
      const x = st.px, y = st.py;
      sync();
      P.camada.replaceChildren();
      const { q, txt } = quadrante(x, y);
      if (q) {
        const sx = x > 0 ? 1 : -1, sy = y > 0 ? 1 : -1;
        const x0 = P.X(0), y0 = P.Y(0), x1 = P.X(6 * sx), y1 = P.Y(6 * sy);
        svg("rect", { x: Math.min(x0, x1), y: Math.min(y0, y1), width: Math.abs(x1 - x0), height: Math.abs(y1 - y0), class: "quad-fill" }, P.camada);
      }
      // O caminho: da origem anda x na horizontal, depois y na vertical.
      if (x !== 0) svg("line", { x1: P.X(0), y1: P.Y(0), x2: P.X(x), y2: P.Y(0), class: "cat-x" }, P.camada);
      if (y !== 0) svg("line", { x1: P.X(x), y1: P.Y(0), x2: P.X(x), y2: P.Y(y), class: "cat-y" }, P.camada);
      if (y !== 0 && x !== 0) svg("line", { x1: P.X(0), y1: P.Y(y), x2: P.X(x), y2: P.Y(y), class: "plot-cross" }, P.camada);
      ponto(P, 0, 0, "is-origem");
      ponto(P, x, y, "is-hover");
      const dir = x < 0 ? "end" : "start";
      rotulo(P, P.X(x) + (x < 0 ? -10 : 10), P.Y(y) + (y < 0 ? 18 : -10), par(x, y), "", dir);

      math(eq, `\\displaystyle P = (${tone(t(x), 2)},\\ ${tone(t(y), 5)})`);
      const passos = [];
      if (x !== 0) passos.push(`ande <strong>${fmt(Math.abs(x))} para a ${x > 0 ? "direita" : "esquerda"}</strong>`);
      if (y !== 0) passos.push(`${x !== 0 ? "depois " : ""}<strong>${fmt(Math.abs(y))} para ${y > 0 ? "cima" : "baixo"}</strong>`);
      text.innerHTML = (passos.length ? `<p>Saindo da origem, ${passos.join(" e ")}. O primeiro número do par diz quanto andar na horizontal; o segundo, na vertical.</p>` : "")
        + `<p>${txt}</p>`;
      saveParams({ px: x, py: y });
    }

    arrastavel(P, () => [{ x: st.px, y: st.py, set(x, y) { st.px = x; st.py = y; } }], 1, draw);
    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- 2. distância e ponto médio */

  // √n simplificado: o maior quadrado k² que divide n sai da raiz.
  function raiz(n) {
    if (n === 0) return { tex: "0", exata: true, k: 0 };
    let k = Math.floor(Math.sqrt(n));
    while (k > 1 && n % (k * k)) k--;
    const r = n / (k * k);
    if (r === 1) return { tex: `${k}`, exata: true, k };
    return { tex: k > 1 ? `${k}\\sqrt{${r}}` : `\\sqrt{${n}}`, exata: false, k };
  }

  function initDistancia(section) {
    const P = plano(section.querySelector(".plano-fig"), { lo: -6, hi: 6, rotulo: "Dois pontos, o segmento entre eles e o triângulo retângulo" });
    const { st, sync } = sliders(section, ["xa", "ya", "xb", "yb"]);
    const result = section.querySelector(".calc-result");
    const list = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");

    function draw() {
      sync();
      const { xa, ya, xb, yb } = st;
      const dx = xb - xa, dy = yb - ya, d2 = dx * dx + dy * dy;
      const mx = (xa + xb) / 2, my = (ya + yb) / 2;
      const r = raiz(d2);

      P.camada.replaceChildren();
      if (dx !== 0) svg("line", { x1: P.X(xa), y1: P.Y(ya), x2: P.X(xb), y2: P.Y(ya), class: "cat-x" }, P.camada);
      if (dy !== 0) svg("line", { x1: P.X(xb), y1: P.Y(ya), x2: P.X(xb), y2: P.Y(yb), class: "cat-y" }, P.camada);
      if (dx !== 0 && dy !== 0) {
        // O cantinho do ângulo reto.
        const sx = dx > 0 ? -1 : 1, sy = dy > 0 ? 1 : -1, c = 10;
        svg("path", { d: `M${P.X(xb) + sx * c},${P.Y(ya)} v${-sy * c} h${-sx * c}`, class: "plot-cross" }, P.camada);
      }
      svg("line", { x1: P.X(xa), y1: P.Y(ya), x2: P.X(xb), y2: P.Y(yb), class: "plot-curve" }, P.camada);
      if (dx !== 0) rotulo(P, P.X(xa + dx / 2), P.Y(ya) + (dy > 0 ? 18 : -8), `Δx = ${fmt(Math.abs(dx))}`, "is-cx", "middle");
      if (dy !== 0) rotulo(P, P.X(xb) + (dx >= 0 ? 8 : -8), P.Y(ya + dy / 2) + 4, `Δy = ${fmt(Math.abs(dy))}`, "is-cy", dx >= 0 ? "start" : "end");
      if (d2) ponto(P, mx, my, "is-m");
      ponto(P, xa, ya, "is-a");
      ponto(P, xb, yb, "is-bpt");
      rotulo(P, P.X(xa) - 10, P.Y(ya) - 10, "A", "is-a", "end");
      rotulo(P, P.X(xb) + 10, P.Y(yb) - 10, "B", "is-bpt");

      const aprox = r.exata ? "" : ` \\approx ${t(Math.sqrt(d2))}`;
      math(result, `\\displaystyle d(A, B) = ${tone(r.tex, 1)}${aprox}`);

      const passos = [
        { tag: "Ande na horizontal", html: `De A até B, x vai de ${fmt(xa)} a ${fmt(xb)}. Esse é o cateto horizontal (o laranja).`,
          tex: `\\Delta x = x_B - x_A = ${t(xb)} - ${Licao.paren(xa)} = ${tone(t(dx), 2)}` },
        { tag: "Ande na vertical", html: `E y vai de ${fmt(ya)} a ${fmt(yb)}: o cateto vertical (o roxo).`,
          tex: `\\Delta y = y_B - y_A = ${t(yb)} - ${Licao.paren(ya)} = ${tone(t(dy), 5)}` },
        { tag: "Pitágoras", html: "O segmento AB é a hipotenusa de um triângulo retângulo com esses dois catetos. O quadrado apaga o sinal, então não importa se Δx ou Δy deram negativos.",
          tex: `d^2 = ${Licao.paren(dx)}^2 + ${Licao.paren(dy)}^2 = ${dx * dx} + ${dy * dy} = ${d2}` },
        { tag: "Tire a raiz", html: r.exata ? `${d2} é um quadrado perfeito: a distância dá exata.`
            : r.k > 1 ? `${d2} não é quadrado perfeito, mas ${d2} = ${r.k * r.k} × ${d2 / (r.k * r.k)}, e o ${r.k * r.k} sai da raiz como ${r.k} (veja <a href="raizes.html">raízes</a>). O valor aproximado vem da calculadora.`
            : `${d2} não é quadrado perfeito nem tem fator quadrado para sair da raiz: ela fica indicada, e o valor aproximado vem da calculadora.`,
          tex: `d = \\sqrt{${d2}} = ${tone(r.tex, 1)}${aprox}` },
        { tag: "Ponto médio", html: "O ponto do meio do segmento (o verde) é a média das coordenadas: a média dos x e a média dos y.",
          tex: `M = \\left(\\frac{${t(xa)} + ${Licao.paren(xb)}}{2},\\ \\frac{${t(ya)} + ${Licao.paren(yb)}}{2}\\right) = ${parTex(mx, my)}` },
      ];
      list.replaceChildren();
      passos.forEach(p => {
        const li = el("li");
        const s = el("span");
        s.innerHTML = `<strong>${p.tag}.</strong> ${p.html}`;
        const m = el("span", "calc-math");
        math(m, `\\displaystyle ${p.tex}`);
        li.append(s, m);
        list.appendChild(li);
      });
      note.innerHTML = d2 === 0 ? "A e B são o mesmo ponto: a distância é zero."
        : dx === 0 || dy === 0 ? `Os pontos estão na mesma ${dx === 0 ? "vertical" : "horizontal"}: o triângulo achata e a distância é só |${dx === 0 ? "Δy" : "Δx"}| = ${fmt(Math.sqrt(d2))}.`
        : `Andando pelos catetos seriam ${fmt(Math.abs(dx) + Math.abs(dy))} passos; em linha reta, ${fmt(Math.sqrt(d2), 2)}. A hipotenusa é sempre o caminho mais curto.`;
      saveParams({ xa, ya, xb, yb });
    }

    arrastavel(P, () => [
      { x: st.xa, y: st.ya, set(x, y) { st.xa = x; st.ya = y; } },
      { x: st.xb, y: st.yb, set(x, y) { st.xb = x; st.yb = y; } },
    ], 1, draw);
    section.addEventListener("input", draw);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      [st.xa, st.ya, st.xb, st.yb] = btn.dataset.exemplo.split(";").map(Number);
      draw();
    }));
    draw();
  }

  /* ---------------------------------------------------------------- 3. dispersão */

  const CONJUNTOS = {
    positiva: [[1, 3], [2, 4.5], [3, 4], [4, 6], [5, 5.5], [6, 7.5], [7, 7], [8, 9]],
    negativa: [[1, 8.5], [2, 8], [3, 7], [4, 7.5], [5, 5], [6, 4.5], [7, 3.5], [8, 2]],
    nenhuma: [[1, 5], [2, 8], [3, 2], [4, 6], [5, 3], [6, 7], [7, 4.5], [8, 5.5]],
  };

  function initDispersao(section) {
    const P = plano(section.querySelector(".plano-fig"), { lo: 0, hi: 10, rotulo: "Gráfico de dispersão dividido pelas médias" });
    const result = section.querySelector(".calc-result");
    const text = section.querySelector(".intro-text");
    const btns = section.querySelectorAll("[data-conjunto]");
    let nome = "positiva";
    let pts = CONJUNTOS[nome].map(p => [...p]);

    function draw() {
      btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.conjunto === nome));
      const n = pts.length;
      const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
      const prods = pts.map(([x, y]) => (x - mx) * (y - my));
      const sxy = prods.reduce((s, v) => s + v, 0) / (n - 1);
      const sx = Math.sqrt(pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0) / (n - 1));
      const sy = Math.sqrt(pts.reduce((s, p) => s + (p[1] - my) ** 2, 0) / (n - 1));
      const r = sx && sy ? sxy / (sx * sy) : 0;
      const conc = prods.filter(v => v > 1e-9).length, disc = prods.filter(v => v < -1e-9).length;

      P.camada.replaceChildren();
      // As quatro regiões em volta de (x̄, ȳ): as "de acordo" e as "do contra".
      const quad = (x0, y0, x1, y1, cls) => svg("rect", {
        x: P.X(Math.min(x0, x1)), y: P.Y(Math.max(y0, y1)),
        width: Math.abs(P.X(x1) - P.X(x0)), height: Math.abs(P.Y(y1) - P.Y(y0)), class: cls }, P.camada);
      quad(mx, my, 10, 10, "quad-conc");
      quad(0, 0, mx, my, "quad-conc");
      quad(0, my, mx, 10, "quad-disc");
      quad(mx, 0, 10, my, "quad-disc");
      svg("line", { x1: P.X(mx), x2: P.X(mx), y1: P.Y(0), y2: P.Y(10), class: "mean-line" }, P.camada);
      svg("line", { x1: P.X(0), x2: P.X(10), y1: P.Y(my), y2: P.Y(my), class: "mean-line" }, P.camada);
      rotulo(P, P.X(mx) + 4, P.Y(10) + 12, `x̄ = ${fmt(mx, 2)}`, "is-centro");
      rotulo(P, P.X(10) - 2, P.Y(my) - 6, `ȳ = ${fmt(my, 2)}`, "is-centro", "end");
      pts.forEach(([x, y], i) => ponto(P, x, y, prods[i] > 1e-9 ? "is-conc" : prods[i] < -1e-9 ? "is-disc" : "is-neutro"));
      svg("circle", { cx: P.X(mx), cy: P.Y(my), r: 5, class: "plot-dot is-centro" }, P.camada);

      math(result, `\\displaystyle (\\bar x,\\ \\bar y) = ${parTex(mx, my)} \\qquad r \\approx ${tone(t(r), 1)}`);
      const sinal = sxy > 1e-9 ? "positiva" : sxy < -1e-9 ? "negativa" : "zero";
      text.innerHTML = `<p>O centro da nuvem é o ponto (x̄, ȳ), e as duas linhas tracejadas que passam por ele dividem o gráfico em quatro regiões. <strong>${conc} ${conc === 1 ? "ponto está" : "pontos estão"}</strong> nas regiões verdes (acima e à direita do centro, ou abaixo e à esquerda), onde x e y estão juntos acima ou juntos abaixo da média. <strong>${disc}</strong> ${disc === 1 ? "está" : "estão"} nas vermelhas, onde um está acima e o outro abaixo.</p>`
        + `<p>Para cada ponto, (x − x̄)(y − ȳ) é positivo nas regiões verdes e negativo nas vermelhas. A média desses produtos é a <a href="/formulas/covariancia.html">covariância</a>, que aqui dá ${fmt(sxy, 2)} (${sinal}). Dividida pelos desvios padrão, ela vira a <a href="/formulas/coeficiente-pearson.html">correlação de Pearson</a>, r ≈ ${fmt(r, 2)}. Arraste os pontos para ver os dois números mudarem.</p>`;
    }

    arrastavel(P, () => pts.map(p => ({ x: p[0], y: p[1], set(x, y) { p[0] = x; p[1] = y; } })), 0.5, draw);
    btns.forEach(b => b.addEventListener("click", () => {
      nome = b.dataset.conjunto;
      pts = CONJUNTOS[nome].map(p => [...p]);
      draw();
    }));
    draw();
  }

  Licao.renderTex();
  const s1 = document.querySelector("#ponto");
  if (s1) initPonto(s1);
  const s2 = document.querySelector("#distancia");
  if (s2) initDistancia(s2);
  const s3 = document.querySelector("#dispersao");
  if (s3) initDispersao(s3);
})();
