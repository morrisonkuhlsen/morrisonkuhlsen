/* Crescimento exponencial: somar a mesma quantia (juros simples, reta)
 * contra multiplicar pelo mesmo fator (juros compostos, exponencial), com o
 * gráfico e a tabela; e a função y = a·bˣ com o eixo y em escala comum ou
 * logarítmica, onde a curva vira reta. Os utilitários vêm de licao.js.
 */
(() => {
  const { fmt, texNum, tone, math, el, svg, saveParams } = Licao;
  const f2 = v => fmt(v, 2);

  // Um passo "redondo" para as marcas de um eixo que vai de lo a hi.
  function passoBom(lo, hi, alvo = 5) {
    const bruto = (hi - lo) / alvo, p = 10 ** Math.floor(Math.log10(bruto));
    const m = bruto / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }

  // Eixos de um gráfico 420 × 300; devolve as escalas.
  function eixos(g, x0, x1, y0, y1, { W = 420, H = 300, ML = 44, MR = 14, MT = 12, MB = 28, ticksY, rotX } = {}) {
    const X = v => ML + (v - x0) / (x1 - x0) * (W - ML - MR);
    const Y = v => H - MB - (v - y0) / (y1 - y0) * (H - MT - MB);
    const sx = Math.max(1, passoBom(x0, x1, 8)); // x é sempre período ou passo inteiro
    for (let v = Math.ceil(x0 / sx) * sx; v <= x1 + 1e-9; v += sx) {
      svg("line", { x1: X(v), x2: X(v), y1: Y(y0), y2: Y(y1), class: v === 0 ? "plot-axis" : "plot-grid" }, g);
      const t = svg("text", { x: X(v), y: H - MB + 16, class: "plot-tick", "text-anchor": "middle" }, g);
      t.textContent = fmt(v);
    }
    (ticksY || (() => {
      const s = passoBom(y0, y1, 5), out = [];
      for (let v = Math.ceil(y0 / s) * s; v <= y1 + 1e-9; v += s) out.push([v, f2(v)]);
      return out;
    })()).forEach(([v, txt]) => {
      svg("line", { x1: X(x0), x2: X(x1), y1: Y(v), y2: Y(v), class: Math.abs(v) < 1e-12 && !ticksY ? "plot-axis is-x" : "plot-grid" }, g);
      const t = svg("text", { x: ML - 6, y: Y(v) + 4, class: "plot-tick", "text-anchor": "end" }, g);
      t.textContent = txt;
    });
    if (rotX) {
      const t = svg("text", { x: W - MR, y: H - 2, class: "plot-tick", "text-anchor": "end" }, g);
      t.textContent = rotX;
    }
    return { X, Y };
  }

  /* ---------------------------------------------------------------- 1. somar × multiplicar */

  function initComparar(section) {
    const inR = section.querySelector("input[name=r]"), inN = section.querySelector("input[name=n]");
    const outR = section.querySelector(".out-r"), outN = section.querySelector(".out-n");
    const q = new URLSearchParams(location.search);
    const r0 = Number(q.get("r")), n0 = Number(q.get("n"));
    if (q.has("r") && Number.isInteger(r0) && r0 >= -30 && r0 <= 50 && r0 % 5 === 0) inR.value = r0;
    if (q.has("n") && Number.isInteger(n0) && n0 >= 1 && n0 <= 20) inN.value = n0;
    const fig = section.querySelector(".exp-fig"), eq = section.querySelector(".calc-result");
    const tab = section.querySelector(".exp-tabela tbody"), text = section.querySelector(".intro-text");

    function draw() {
      const rp = Number(inR.value), n = Number(inN.value), r = rp / 100, V0 = 100;
      outR.textContent = `${fmt(rp)}%`; outN.textContent = n;
      const simples = k => V0 * (1 + k * r), composto = k => V0 * (1 + r) ** k;
      const ys = [];
      for (let k = 0; k <= n; k++) ys.push(simples(k), composto(k));
      let y0 = Math.min(0, ...ys), y1 = Math.max(...ys);
      if (y1 - y0 < 1e-9) y1 = y0 + 1;
      const pad = (y1 - y0) * 0.06;
      const g = svg("svg", { viewBox: "0 0 420 300", class: "plot exp-plot", role: "img", "aria-label": `Juros simples e compostos de ${rp}% em ${n} períodos` });
      const { X, Y } = eixos(g, 0, n, y0, y1 + pad, { rotX: "período" });
      // Simples: reta. Composto: pontos ligados (cresce aos saltos, um por período).
      svg("line", { x1: X(0), y1: Y(simples(0)), x2: X(n), y2: Y(simples(n)), class: "exp-lin" }, g);
      let d = "";
      for (let k = 0; k <= n; k++) d += `${k ? "L" : "M"}${X(k).toFixed(1)},${Y(composto(k)).toFixed(1)}`;
      svg("path", { d, class: "plot-curve" }, g);
      for (let k = 0; k <= n; k++) {
        svg("circle", { cx: X(k), cy: Y(simples(k)), r: 3, class: "plot-dot exp-dot-lin" }, g);
        svg("circle", { cx: X(k), cy: Y(composto(k)), r: 3.5, class: "plot-dot is-hover" }, g);
      }
      fig.replaceChildren(g);

      const fator = texNum(1 + r, 2);
      const a = el("span", "res-part"), b = el("span", "res-part");
      math(a, `\\displaystyle \\text{soma: } 100 ${r < 0 ? "-" : "+"} ${n} \\cdot ${texNum(Math.abs(V0 * r), 2)} = ${tone(texNum(simples(n), 2), 2)}`);
      math(b, `\\displaystyle \\text{multiplica: } 100 \\cdot ${fator}^{${n}} = ${tone(texNum(composto(n), 2), 1)}`);
      eq.replaceChildren(a, b);

      // Tabela: até 8 linhas; com mais períodos, as primeiras e a última.
      tab.replaceChildren();
      const ks = n <= 8 ? [...Array(n + 1).keys()] : [0, 1, 2, 3, 4, 5, null, n];
      ks.forEach(k => {
        const tr = el("tr");
        if (k === null) { const td = el("td", "exp-gap", "⋮"); td.colSpan = 3; tr.appendChild(td); tab.appendChild(tr); return; }
        tr.append(el("td", null, String(k)), el("td", "is-lin", f2(simples(k))), el("td", "is-exp", f2(composto(k))));
        tab.appendChild(tr);
      });

      const passo = f2(V0 * Math.abs(r));
      const partes = [];
      if (r === 0) partes.push("<p>Com taxa zero, nada muda: somar 0 e multiplicar por 1 dão o mesmo.</p>");
      else if (r > 0) {
        partes.push(`<p><strong>Somar</strong> (juros simples) acrescenta sempre ${passo}, ${fmt(rp)}% dos 100 iniciais: o gráfico é uma <strong>reta</strong>. <strong>Multiplicar</strong> por ${f2(1 + r)} (juros compostos) acrescenta ${rp}% do valor <em>atual</em>, que já cresceu: o acréscimo aumenta a cada período, e a curva se descola da reta.</p>`);
        partes.push(`<p>No 1º período os dois dão ${f2(composto(1))}. No ${n}º, a diferença já é de ${f2(composto(n) - simples(n))}${composto(n) / simples(n) >= 1.5 ? ` — o composto vale ${f2(composto(n) / simples(n))} vezes o simples` : ""}.</p>`);
      } else {
        const zera = simples(n) <= 0;
        partes.push(`<p>Com taxa negativa, <strong>somar</strong> tira sempre ${passo}: a reta desce no mesmo ritmo${zera ? " e cruza o zero — tirar a mesma quantia fixa uma hora esgota tudo" : ""}. <strong>Multiplicar</strong> por ${f2(1 + r)} tira ${Math.abs(rp)}% do que <em>sobrou</em>, cada vez menos: a curva desce e se aproxima do zero, mas nunca chega nele.</p>`);
      }
      text.innerHTML = partes.join("");
      saveParams({ r: rp, n });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- 2. y = a·bˣ */

  function initFuncao(section) {
    const inA = section.querySelector("input[name=fa]"), inB = section.querySelector("input[name=fb]");
    const outA = section.querySelector(".out-fa"), outB = section.querySelector(".out-fb");
    const btns = section.querySelectorAll("[data-escala]");
    const q = new URLSearchParams(location.search);
    const a0 = Number(q.get("fa")), b0 = Number(q.get("fb"));
    if (q.has("fa") && a0 >= 1 && a0 <= 5) inA.value = a0;
    if (q.has("fb") && b0 >= 0.25 && b0 <= 3) inB.value = b0;
    let escala = q.get("esc") === "log" ? "log" : "comum";
    const fig = section.querySelector(".exp-fig"), eq = section.querySelector(".calc-result");
    const escada = section.querySelector(".ladder-steps"), text = section.querySelector(".intro-text");

    function draw() {
      const a = Number(inA.value), b = Number(inB.value);
      outA.textContent = fmt(a); outB.textContent = f2(b);
      btns.forEach(x => x.setAttribute("aria-pressed", x.dataset.escala === escala));
      const f = x => a * b ** x, lo = -4, hi = 4;
      const vals = []; for (let x = lo; x <= hi; x += 0.05) vals.push(f(x));
      const g = svg("svg", { viewBox: "0 0 420 300", class: "plot exp-plot", role: "img", "aria-label": `Gráfico de y = ${a}·${b}^x em escala ${escala}` });
      let P;
      if (escala === "comum") {
        const y1 = Math.max(...vals);
        P = eixos(g, lo, hi, 0, y1 * 1.05);
      } else {
        // Eixo y em log: marcas nas potências de 10 (e no 1, 2, 5 entre elas, se couber).
        const L0 = Math.floor(Math.log10(Math.min(...vals))), L1 = Math.ceil(Math.log10(Math.max(...vals)));
        const ticks = [];
        for (let k = L0; k <= L1; k++) [1, 2, 5].forEach(m => {
          const v = m * 10 ** k;
          if ((L1 - L0 <= 3 || m === 1) && Math.log10(v) >= L0 - 1e-9 && Math.log10(v) <= L1 + 1e-9) ticks.push([Math.log10(v), fmt(v, 4)]);
        });
        const G = eixos(g, lo, hi, L0, L1 === L0 ? L0 + 1 : L1, { ticksY: ticks });
        P = { X: G.X, Y: v => G.Y(Math.log10(v)) };
      }
      let d = "";
      for (let i = 0; i <= 160; i++) { const x = lo + (hi - lo) * i / 160; d += `${i ? "L" : "M"}${P.X(x).toFixed(1)},${P.Y(f(x)).toFixed(1)}`; }
      svg("path", { d, class: "plot-curve" }, g);
      for (let x = lo; x <= hi; x++) svg("circle", { cx: P.X(x), cy: P.Y(f(x)), r: x === 0 ? 6 : 4, class: `plot-dot ${x === 0 ? "is-b" : "is-hover"}` }, g);
      fig.replaceChildren(g);

      math(eq, `\\displaystyle y = ${tone(fmt(a), 5)} \\cdot ${tone(texNum(b, 2), 2)}^{\\,x}`);
      // A escada: de x em x, o y é multiplicado por b.
      escada.replaceChildren();
      for (let x = 0; x <= 4; x++) {
        if (x) escada.appendChild(el("li", "ladder-op", `× ${f2(b)}`));
        const li = el("li", "ladder-step");
        const top = el("span", "ladder-pow"); math(top, `x = ${x}`);
        const bot = el("span", "ladder-val"); math(bot, texNum(f(x), 3));
        li.append(top, bot); escada.appendChild(li);
      }
      const tipo = b > 1 ? `<strong>cresce</strong>: cada passo para a direita multiplica o y por ${f2(b)}, e os saltos ficam cada vez maiores`
        : b < 1 ? `<strong>decai</strong>: cada passo multiplica por ${f2(b)}, que é menor que 1, e o y vai encolhendo — perde ${fmt((1 - b) * 100, 1)}% a cada passo`
        : "fica <strong>constante</strong>: multiplicar por 1 não muda nada";
      const partes = [`<p>Em x = 0, y = ${fmt(a)}: o <strong>a</strong> é o valor inicial (o ponto roxo), porque b⁰ = 1. A função ${tipo}.${b !== 1 ? " Ela nunca toca o zero: multiplicar um número positivo por outro positivo nunca dá zero, e a curva só se aproxima do eixo x." : ""}</p>`];
      partes.push(escala === "log"
        ? `<p>Na <strong>escala logarítmica</strong>, cada linha de grade é <strong>uma multiplicação</strong>, não uma soma. Como a exponencial multiplica sempre pelo mesmo fator, nessa escala ela vira uma <strong>reta</strong>: log y = log a + x · log b, uma <a href="funcao-1grau.html">função do 1º grau</a> em x.</p>`
        : "<p>Troque para a escala logarítmica e veja a curva virar reta.</p>");
      text.innerHTML = partes.join("");
      saveParams({ fa: a, fb: b, esc: escala });
    }

    btns.forEach(x => x.addEventListener("click", () => { escala = x.dataset.escala; draw(); }));
    section.addEventListener("input", draw);
    draw();
  }

  Licao.renderTex();
  const s1 = document.querySelector("#comparar");
  if (s1) initComparar(s1);
  const s2 = document.querySelector("#funcao");
  if (s2) initFuncao(s2);
})();
