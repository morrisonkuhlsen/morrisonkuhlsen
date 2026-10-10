/* Constantes: π pelos polígonos de Arquimedes e por três séries, e pelos
 * juros compostos e pela série dos fatoriais, φ pelo retângulo de
 * Fibonacci, e α a partir das constantes físicas. Em cada aproximação, os
 * algarismos que já batem com o valor verdadeiro ficam destacados.
 */
(() => {
  const { fmt, math, el, svg } = Licao;

  const PI = Math.PI, E = Math.E, PHI = (1 + Math.sqrt(5)) / 2;
  const DIGITS = 12; // casas mostradas: o double guarda ~15, e as últimas oscilam

  // Corta (não arredonda) em DIGITS casas: 3,14159 não vira 3,1416.
  const cut = v => {
    const s = v.toFixed(DIGITS + 3);
    return s.slice(0, s.indexOf(".") + DIGITS + 1);
  };

  // Escreve v com as casas que coincidem com ref em destaque e devolve
  // quantas casas decimais estão certas.
  function digits(box, v, ref) {
    const a = cut(v), b = cut(ref);
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    const dot = a.indexOf(".");
    const ok = Math.max(0, i - dot - 1);
    box.replaceChildren();
    const good = el("span", "dig-ok", a.slice(0, i).replace(".", ","));
    const bad = el("span", "dig-bad", a.slice(i).replace(".", ","));
    box.append(good, bad);
    return i <= dot ? 0 : Math.min(ok, DIGITS);
  }

  function meter(box, ok) {
    box.replaceChildren();
    const bar = el("span", "meter-bar");
    bar.style.width = `${ok / DIGITS * 100}%`;
    const txt = el("span", "meter-txt", ok >= DIGITS ? `${DIGITS}+ casas certas` : `${ok} ${ok === 1 ? "casa certa" : "casas certas"}`);
    const track = el("span", "meter-track");
    track.appendChild(bar);
    box.append(track, txt);
  }

  // Liga um slider (com valores opcionais numa lista) a uma função de desenho.
  function slider(section, name, draw, values) {
    const input = section.querySelector(`input[name=${name}]`);
    const out = section.querySelector(`.out-${name}`);
    const val = () => (values ? values[Number(input.value)] : Number(input.value));
    const go = () => { out.textContent = fmt(val()); draw(val()); };
    input.addEventListener("input", go);
    go();
  }

  /* ---------------------------------------------------------------- π: Arquimedes */

  function initArchimedes(section) {
    const fig = section.querySelector(".poly-figure");
    const text = section.querySelector(".poly-text");
    slider(section, "lados", n => {
      const R = 110, cx = 130, cy = 130;
      const g = svg("svg", { viewBox: "0 0 260 260", class: "poly", role: "img",
        "aria-label": `Círculo com polígonos de ${n} lados inscrito e circunscrito` });
      const pts = r => Array.from({ length: n }, (_, k) => {
        const t = -Math.PI / 2 + 2 * Math.PI * k / n;
        return `${(cx + r * Math.cos(t)).toFixed(2)},${(cy + r * Math.sin(t)).toFixed(2)}`;
      }).join(" ");
      svg("polygon", { points: pts(R / Math.cos(Math.PI / n)), class: "poly-out" }, g);
      svg("circle", { cx, cy, r: R, class: "poly-circle" }, g);
      svg("polygon", { points: pts(R), class: "poly-in" }, g);
      fig.replaceChildren(g);

      // Perímetro ÷ diâmetro de cada polígono.
      const lo = n * Math.sin(Math.PI / n), hi = n * Math.tan(Math.PI / n);
      text.innerHTML = `<p class="bounds"><span class="is-in">${fmt(lo, 6)}</span> &lt; <strong>π</strong> &lt; <span class="is-out">${fmt(hi, 6)}</span></p>`
        + `<p>O polígono de dentro tem perímetro menor que a circunferência, e o de fora, maior. Dividindo cada perímetro pelo diâmetro, π fica preso entre os dois. Com ${n} lados a folga é de ${fmt(hi - lo, 6)}.`
        + (n === 96 ? " Foi aqui que Arquimedes parou, com 96 lados: 3 + 10/71 &lt; π &lt; 3 + 1/7." : " Arquimedes chegou a 96 lados, dobrando a partir do hexágono.")
        + "</p>";
    }, [6, 8, 12, 16, 24, 32, 48, 64, 96]);
  }

  /* ---------------------------------------------------------------- π: séries */

  const fact = k => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; };
  const SERIES = {
    leibniz: n => { let s = 0; for (let k = 0; k < n; k++) s += (k % 2 ? -1 : 1) / (2 * k + 1); return 4 * s; },
    nilakantha: n => { let s = 3; for (let k = 1; k < n; k++) s += (k % 2 ? 4 : -4) / ((2 * k) * (2 * k + 1) * (2 * k + 2)); return s; },
    ramanujan: n => {
      let s = 0;
      for (let k = 0; k < n; k++) s += fact(4 * k) * (1103 + 26390 * k) / (fact(k) ** 4 * 396 ** (4 * k));
      return 1 / (2 * Math.SQRT2 / 9801 * s);
    },
  };

  function initSeries(section) {
    const rows = Array.from(section.querySelectorAll("[data-serie]"));
    slider(section, "termos", n => {
      const ok = {};
      rows.forEach(row => {
        const v = SERIES[row.dataset.serie](n);
        ok[row.dataset.serie] = digits(row.querySelector(".digits"), v, PI);
        meter(row.querySelector(".meter"), ok[row.dataset.serie]);
      });
      // O texto sai da contagem de verdade, não de uma frase fixa.
      const acerta = k => (k === 0 ? "não acerta nenhuma casa" : `acerta ${k === 1 ? "1 casa" : `${k} casas`}`);
      section.querySelector(".series-note").textContent =
        `Com ${n} ${n === 1 ? "termo" : "termos"}, Leibniz ${acerta(ok.leibniz)} e Nilakantha ${acerta(ok.nilakantha)}. `
        + "Leibniz converge devagar demais para uso prático: só a partir de uns 630 termos ela fica de vez em 3,14. "
        + "Ramanujan acerta 6 casas já no primeiro termo e esgota a precisão do computador no segundo — cada termo acrescenta cerca de 8 casas.";
    });
  }

  /* ---------------------------------------------------------------- e: juros */

  const PERIODS = [
    [1, "uma vez por ano"], [2, "a cada semestre"], [4, "a cada trimestre"], [12, "todo mês"],
    [52, "toda semana"], [365, "todo dia"], [8760, "toda hora"], [525600, "todo minuto"], [31536000, "todo segundo"],
  ];

  function initCompound(section) {
    const box = section.querySelector(".compound-digits");
    const m = section.querySelector(".compound-meter");
    const bar = section.querySelector(".grow-fill");
    const text = section.querySelector(".compound-text");
    const formula = section.querySelector(".compound-tex");
    slider(section, "vezes", n => {
      const [, label] = PERIODS.find(p => p[0] === n);
      const v = (1 + 1 / n) ** n;
      meter(m, digits(box, v, E));
      math(formula, `\\left(1 + \\dfrac{1}{${n.toLocaleString("pt-BR").replace(/\./g, "{.}")}}\\right)^{${n.toLocaleString("pt-BR").replace(/\./g, "{.}")}}`);
      // Barra de R$ 1 a R$ 3: a marca do e é o limite que ela nunca passa.
      bar.style.width = `${(v - 1) / 2 * 100}%`;
      text.innerHTML = `Capitalizando <strong>${label}</strong>, cada período rende 100%/${fmt(n)} e o R$ 1 vira <strong>R$ ${fmt(v, 6)}</strong>. Quanto mais vezes, mais rende — mas cada vez menos, e nunca passa de e ≈ 2,71828.`;
    }, PERIODS.map(p => p[0]));
  }

  function initFactorial(section) {
    const box = section.querySelector(".fact-digits");
    const m = section.querySelector(".fact-meter");
    const formula = section.querySelector(".fact-tex");
    slider(section, "parcelas", n => {
      let s = 0;
      for (let k = 0; k < n; k++) s += 1 / fact(k);
      meter(m, digits(box, s, E));
      const shown = Math.min(n, 6);
      const terms = Array.from({ length: shown }, (_, k) => (k < 2 ? "1" : `\\tfrac{1}{${k}!}`));
      math(formula, `${terms.join(" + ")}${n > shown ? ` + \\cdots + \\tfrac{1}{${n - 1}!}` : ""}`);
    });
  }

  /* ---------------------------------------------------------------- φ: Fibonacci */

  function fibs(n) {
    const f = [1, 1];
    while (f.length < n + 1) f.push(f[f.length - 1] + f[f.length - 2]);
    return f;
  }

  // Quadrados de Fibonacci em espiral (direita, baixo, esquerda, cima) e o
  // quarto de círculo de cada um. Cada arco começa onde o anterior termina,
  // com o centro no canto que encosta no retângulo de antes.
  function fibTiling(n) {
    const F = fibs(n);
    const sq = [{ x: 0, y: 0, s: 1 }];
    const arcs = [{ c: [1, 1], p: [0, 1], e: [1, 0] }];
    let rect = { x: 0, y: 0, w: 1, h: 1 };
    let P = [1, 0];
    for (let k = 1; k < n; k++) {
      const s = F[k], dir = (k - 1) % 4;
      const q = dir === 0 ? { x: rect.x + rect.w, y: rect.y } : dir === 1 ? { x: rect.x, y: rect.y + rect.h }
        : dir === 2 ? { x: rect.x - s, y: rect.y } : { x: rect.x, y: rect.y - s };
      q.s = s;
      sq.push(q);
      const corners = [[q.x, q.y], [q.x + s, q.y], [q.x, q.y + s], [q.x + s, q.y + s]];
      const onShared = ([x, y]) => (dir === 0 ? x === q.x : dir === 1 ? y === q.y : dir === 2 ? x === q.x + s : y === q.y + s);
      const near = corners.filter(c => Math.abs(c[0] - P[0]) + Math.abs(c[1] - P[1]) === s);
      const C = near.find(onShared) || near[0];
      const End = corners.find(c => Math.abs(c[0] - C[0]) + Math.abs(c[1] - C[1]) === s && !(c[0] === P[0] && c[1] === P[1]));
      arcs.push({ c: C, p: P, e: End });
      P = End;
      const x0 = Math.min(rect.x, q.x), y0 = Math.min(rect.y, q.y);
      rect = { x: x0, y: y0, w: Math.max(rect.x + rect.w, q.x + s) - x0, h: Math.max(rect.y + rect.h, q.y + s) - y0 };
    }
    return { sq, arcs, rect };
  }

  function initGolden(section) {
    const fig = section.querySelector(".fib-figure");
    const box = section.querySelector(".fib-digits");
    const m = section.querySelector(".fib-meter");
    const formula = section.querySelector(".fib-tex");
    const text = section.querySelector(".fib-text");
    slider(section, "fib", n => {
      const F = fibs(n);
      const ratio = F[n] / F[n - 1];
      meter(m, digits(box, ratio, PHI));
      math(formula, `\\dfrac{F_{${n + 1}}}{F_{${n}}} = \\dfrac{${F[n]}}{${F[n - 1]}}`);

      const shownN = Math.min(n, 10);
      const { sq, arcs, rect } = fibTiling(shownN);
      const pad = rect.w * 0.02;
      const g = svg("svg", { viewBox: `${rect.x - pad} ${rect.y - pad} ${rect.w + 2 * pad} ${rect.h + 2 * pad}`, class: "fib", role: "img",
        "aria-label": `Retângulo de ${rect.w} por ${rect.h} formado por quadrados de Fibonacci, com a espiral` });
      sq.forEach(q => {
        svg("rect", { x: q.x, y: q.y, width: q.s, height: q.s, class: "fib-sq" }, g);
        if (q.s >= rect.w * 0.08) {
          const t = svg("text", { x: q.x + q.s / 2, y: q.y + q.s / 2, class: "fib-num", "text-anchor": "middle", "dominant-baseline": "central", "font-size": Math.min(q.s * 0.35, rect.w * 0.07) }, g);
          t.textContent = q.s;
        }
      });
      const d = arcs.map(({ c, p, e }, i) => {
        const r = Math.abs(p[0] - c[0]) + Math.abs(p[1] - c[1]);
        const cross = (p[0] - c[0]) * (e[1] - c[1]) - (p[1] - c[1]) * (e[0] - c[0]);
        return `${i ? "" : `M${p[0]},${p[1]}`} A${r},${r} 0 0 ${cross > 0 ? 1 : 0} ${e[0]},${e[1]}`;
      }).join(" ");
      svg("path", { d, class: "fib-spiral" }, g);
      fig.replaceChildren(g);

      text.innerHTML = `O retângulo tem <strong>${Math.max(rect.w, rect.h)} por ${Math.min(rect.w, rect.h)}</strong> — dois Fibonacci seguidos — e a razão entre os lados, ${fmt(Math.max(rect.w, rect.h) / Math.min(rect.w, rect.h), 6)}, já está perto de φ.`
        + (n > 10 ? ` O desenho para em 10 quadrados; a razão ao lado continua até ${n}.` : "")
        + " A razão passa um pouco acima e um pouco abaixo de φ, alternando, e cada vez mais perto.";
    });
  }

  /* ---------------------------------------------------------------- α */

  function initAlpha(section) {
    const q = 1.602176634e-19, eps0 = 8.8541878128e-12, hbar = 1.054571817e-34, c = 299792458;
    const a = q * q / (4 * Math.PI * eps0 * hbar * c);
    math(section.querySelector(".alpha-tex"),
      `\\alpha = \\dfrac{(1{,}602 \\cdot 10^{-19})^2}{4\\pi \\cdot 8{,}854 \\cdot 10^{-12} \\cdot 1{,}055 \\cdot 10^{-34} \\cdot 2{,}998 \\cdot 10^{8}} \\approx ${fmt(a, 9).replace(",", "{,}")} \\approx \\dfrac{1}{${fmt(1 / a, 3).replace(",", "{,}")}}`);
  }

  Licao.renderTex();
  const by = s => document.querySelector(s);
  if (by(".archimedes")) initArchimedes(by(".archimedes"));
  if (by(".series")) initSeries(by(".series"));
  if (by(".compound")) initCompound(by(".compound"));
  if (by(".factorial")) initFactorial(by(".factorial"));
  if (by(".golden")) initGolden(by(".golden"));
  if (by(".alpha")) initAlpha(by(".alpha"));
})();
