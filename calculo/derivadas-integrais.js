/* Derivar e integrar lado a lado: a escada (primitiva ← função → derivada)
 * com três gráficos ligados pela inclinação, a família F + C e a tabela
 * unificada, cujas linhas carregam a família correspondente na escada.
 */
(() => {
  const { fmt, texNum, tone, math, el, saveParams } = Licao;
  const { plot, slider, fromUrl, onResize } = Grafico;
  const SEN = "\\operatorname{sen}";

  /* ---------------------------------------------------------------- famílias */

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  // c·xᵏ com c = p/q, em LaTeX: 3x², x⁴/4, 6, 0.
  function mono(p, q, k) {
    if (p === 0) return "0";
    const g = gcd(p, q); p /= g; q /= g;
    const xs = k === 0 ? "" : k === 1 ? "x" : `x^{${k}}`;
    const neg = p < 0 ? "-" : "", ap = Math.abs(p);
    if (q === 1) return `${neg}${ap === 1 && xs ? "" : ap}${xs}`;
    return `${neg}\\dfrac{${ap === 1 && xs ? "" : ap}${xs}}{${q}}`;
  }

  // Cada família devolve o degrau i (0 = a função de partida; positivo =
  // derivadas; negativo = primitivas), ou null onde a escada para.
  const FAM = {
    pot: {
      name: "x³", dom: [-2, 2],
      level(i) {
        if (i < -5 || i > 6) return null;
        let p = 1, q = 1, k = 3;
        for (let j = 0; j < i; j++) { p *= k; k = Math.max(0, k - 1); if (p === 0) break; }
        for (let j = 0; j > i; j--) { q *= k + 1; k += 1; }
        if (i > 3) p = 0;
        const g = gcd(p, q); const c = p / q;
        return { tex: mono(p / g, q / g, k), f: x => c * x ** k };
      },
    },
    sen: {
      name: "sen x", dom: [-6.3, 6.3],
      level(i) {
        const L = [[`${SEN} x`, Math.sin], ["\\cos x", Math.cos], [`-${SEN} x`, x => -Math.sin(x)], ["-\\cos x", x => -Math.cos(x)]];
        const [tex, f] = L[((i % 4) + 4) % 4];
        return Math.abs(i) > 8 ? null : { tex, f };
      },
    },
    exp: { name: "eˣ", dom: [-2.5, 2], level: i => (Math.abs(i) > 8 ? null : { tex: "e^{x}", f: Math.exp }) },
    e2: {
      name: "e^(2x)", dom: [-2, 1],
      level(i) {
        if (Math.abs(i) > 6) return null;
        const c = 2 ** i;
        return { tex: i === 0 ? "e^{2x}" : i > 0 ? `${c}\\,e^{2x}` : `\\dfrac{e^{2x}}{${2 ** -i}}`, f: x => c * Math.exp(2 * x) };
      },
    },
    ln: {
      name: "ln x", dom: [0.15, 4],
      level(i) {
        if (i === -1) return { tex: "x \\ln x - x", f: x => x * Math.log(x) - x };
        if (i === 0) return { tex: "\\ln x", f: Math.log };
        if (i < -1 || i > 5) return null;
        // A derivada de ordem i de ln x: (−1)^(i−1) (i − 1)! / xⁱ.
        let fact = 1; for (let j = 2; j < i; j++) fact *= j;
        const s = i % 2 ? 1 : -1, c = s * fact;
        const num = Math.abs(c) === 1 ? "1" : String(Math.abs(c));
        return { tex: `${c < 0 ? "-" : ""}\\dfrac{${num}}{${i === 1 ? "x" : `x^{${i}}`}}`, f: x => c / x ** i };
      },
    },
  };

  /* ---------------------------------------------------------------- escada */

  function initEscada(section) {
    const ladder = section.querySelector(".rel-ladder");
    const vars = section.querySelector(".rel-vars");
    const boxes = ["F", "f", "d"].map(k => section.querySelector(`.rel-${k}-plot`));
    const caps = ["F", "f", "d"].map(k => section.querySelector(`.rel-cap-${k}`));
    const out = section.querySelector(".rel-out");
    const text = section.querySelector(".rel-text");
    const q = new URLSearchParams(location.search);
    let fam = FAM[q.get("fam")] ? q.get("fam") : "pot";
    let i = Number.isInteger(Number(q.get("i"))) && FAM[fam].level(Number(q.get("i"))) ? Number(q.get("i")) : 0;
    const famBtns = Array.from(section.querySelectorAll("[data-fam]"));
    const press = () => famBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.fam === fam)));
    const d0 = FAM[fam].dom;
    const X = slider(vars, { name: "x", label: "<i>x</i>", min: d0[0], max: d0[1], step: 0.01, value: fromUrl("x", d0[0], d0[1], (d0[0] + d0[1]) / 2 + 0.3), show: v => fmt(v, 2), aria: "Ponto x" });

    function setFam(name) {
      fam = name; i = 0; press();
      const d = FAM[fam].dom;
      X.input.min = d[0]; X.input.max = d[1]; X.set(Math.round(((d[0] + d[1]) / 2 + 0.3) * 100) / 100);
      draw();
    }

    function range(f, d) {
      const ys = Array.from({ length: 161 }, (_, j) => f(d[0] + (d[1] - d[0]) * j / 160)).filter(Number.isFinite).sort((a, b) => a - b);
      const lo = ys[Math.floor(ys.length * 0.02)], hi = ys[Math.ceil(ys.length * 0.98) - 1];
      const pad = (hi - lo) * 0.12 || 1;
      return [Math.min(lo, 0) - pad, Math.max(hi, 0) + pad];
    }

    function draw() {
      const F = FAM[fam], x = X.read();
      const L = [F.level(i - 1), F.level(i), F.level(i + 1)];
      // Degraus em volta do atual.
      ladder.replaceChildren();
      for (let j = i - 2; j <= i + 2; j++) {
        const lv = F.level(j);
        if (j > i - 2) ladder.appendChild(el("li", "rel-step-op", "→"));
        const li = el("li", j === i ? "rel-step is-on" : j === i - 1 || j === i + 1 ? "rel-step is-near" : "rel-step");
        if (lv) math(li, lv.tex); else li.textContent = "…";
        ladder.appendChild(li);
      }
      section.querySelector('[data-move="-1"]').disabled = !F.level(i - 2);
      section.querySelector('[data-move="1"]').disabled = !F.level(i + 2);

      const names = ["F(x), a primitiva", "f(x), a função", "f′(x), a derivada"];
      const height = W => Math.max(150, W * 0.3);
      L.forEach((lv, k) => {
        if (!lv) { boxes[k].replaceChildren(); caps[k].textContent = ""; return; }
        const [y0, y1] = range(lv.f, F.dom);
        const p = plot(boxes[k], { x0: F.dom[0], x1: F.dom[1], y0, y1, height, label: `Gráfico de ${names[k]}` });
        p.curve(lv.f, k === 1 ? "plot-curve" : "plot-curve is-second");
        const below = L[k + 1];
        if (below) p.line(x, lv.f(x), below.f(x), "plot-tangent");
        p.dot(x, lv.f(x), k === 0 ? "plot-dot is-b" : k === 1 ? "plot-dot is-a" : "plot-dot is-vertex");
        caps[k].textContent = names[k] + (below ? " — tracejada, a tangente; a inclinação dela é a altura do gráfico de baixo" : "");
      });
      const [Fx, fx, dx] = L.map(lv => (lv ? lv.f(x) : NaN));
      math(out, `F(x) = ${tone(L[0].tex, 2)} \\;\\xrightarrow{\\;d/dx\\;}\\; f(x) = ${tone(L[1].tex, 1)} \\;\\xrightarrow{\\;d/dx\\;}\\; f'(x) = ${tone(L[2].tex, 3)}`);
      text.innerHTML = `<p>Em x = ${fmt(x, 2)}: a tangente de F tem inclinação <strong>${fmt(fx, 3)}</strong>, que é a altura de f; a tangente de f tem inclinação <strong>${fmt(dx, 3)}</strong>, que é a altura de f′. Cada gráfico é a inclinação do de cima.</p>`
        + (fam === "exp" ? "<p>Na exponencial, os três gráficos são iguais: eˣ é a própria derivada e a própria primitiva, e a escada não sai do lugar.</p>"
          : fam === "sen" ? "<p>No seno, cada degrau desloca a onda um quarto de volta: quatro degraus para a direita e ela volta ao começo.</p>"
            : fam === "pot" && i >= 3 ? "<p>Derivando um polinômio, o grau cai um por vez até sobrar uma constante, e depois zero: a escada termina em 0, 0, 0…</p>"
              : fam === "ln" ? "<p>A primitiva de ln x não é óbvia — sai da integração por partes —, mas a escada para a direita é regular: cada derivada traz um fator a mais no denominador.</p>" : "");
      saveParams({ fam, i, x });
    }

    famBtns.forEach(b => b.addEventListener("click", () => setFam(b.dataset.fam)));
    section.querySelectorAll("[data-move]").forEach(b => b.addEventListener("click", () => {
      const ni = i + Number(b.dataset.move);
      if (FAM[fam].level(ni - 1) && FAM[fam].level(ni + 1)) { i = ni; draw(); }
    }));
    X.input.addEventListener("input", () => { X.sync(); draw(); });
    // Botões “na escada” da tabela: carregam a família e sobem até o painel.
    document.querySelectorAll("[data-load]").forEach(b => b.addEventListener("click", () => {
      setFam(b.dataset.load);
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    press();
    onResize(draw);
    draw();
  }

  /* ---------------------------------------------------------------- + C */

  function initConst(section) {
    const vars = section.querySelector(".const-vars");
    const box = section.querySelector(".const-plot");
    const out = section.querySelector(".const-out");
    const text = section.querySelector(".const-text");
    const C = slider(vars, { name: "C", label: "<i>C</i>", min: -3, max: 3, step: 0.1, value: fromUrl("C", -3, 3, 1), show: v => fmt(v, 1), aria: "Constante C" });
    const P = slider(vars, { name: "p", label: "<i>x</i>", min: -2.5, max: 2.5, step: 0.05, value: fromUrl("p", -2.5, 2.5, 1), show: v => fmt(v, 2), aria: "Ponto x" });

    function draw() {
      const c = C.read(), x = P.read();
      const p = plot(box, { x0: -2.5, x1: 2.5, y0: -3.6, y1: 6.4, label: `Família x²/2 + C, com C = ${fmt(c, 1)} em destaque e as tangentes em x = ${fmt(x, 2)}` });
      for (let k = -3; k <= 3; k++) {
        p.curve(t => t * t / 2 + k, "plot-curve is-faint");
        p.line(x, x * x / 2 + k, x, "plot-guide");
      }
      p.curve(t => t * t / 2 + c);
      p.line(x, x * x / 2 + c, x, "plot-tangent");
      p.dot(x, x * x / 2 + c, "plot-dot is-a");
      math(out, `F(x) = \\dfrac{x^2}{2} ${c < 0 ? "-" : "+"} ${tone(texNum(Math.abs(c), 1), 2)} \\qquad F'(${texNum(x, 2)}) = ${tone(texNum(x, 2), 1)}`);
      text.innerHTML = `<p>Qualquer que seja C, a inclinação em x = ${fmt(x, 2)} é <strong>${fmt(x, 2)}</strong>: todas as tangentes são paralelas. A derivada não “vê” o deslocamento vertical, então a integral só pode devolver a família inteira.</p>`
        + `<p>Numa integral entre dois pontos, F(b) − F(a), o C some na subtração — por isso a área não depende de qual primitiva se escolhe.</p>`;
      saveParams({ C: c, p: x });
    }
    [C, P].forEach(s => s.input.addEventListener("input", () => { s.sync(); draw(); }));
    onResize(draw);
    draw();
  }

  Licao.renderTex();
  const by = q => document.querySelector(q);
  if (by("#escada")) initEscada(by("#escada"));
  if (by("#constante")) initConst(by("#constante"));
})();
