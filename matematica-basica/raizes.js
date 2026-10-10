/* Raízes: a figura do início, as regras com os números do leitor e a
 * calculadora que simplifica radicais. Os cards de regra e os utilitários
 * vêm de licao.js.
 */
(() => {
  const { fmt, texNum, tone, isInt, sgn, paren, same, math, el, svg, factor, saveParams } = Licao;

  const VARS = {
    a: { min: 1, max: 20, value: 3 },
    b: { min: 1, max: 20, value: 4 },
    k: { min: 1, max: 10, value: 2 },
    n: { min: 2, max: 8, value: 3 },
    m: { min: 1, max: 10, value: 2 },
    x: { min: -10, max: 10, value: -3 },
  };

  const R = (n, t) => (n === 2 ? `\\sqrt{${t}}` : `\\sqrt[${n}]{${t}}`);
  // Raiz real: índice ímpar aceita negativo.
  const root = (v, n) => (v < 0 && n % 2 ? -Math.pow(-v, 1 / n) : Math.pow(v, 1 / n));
  /* ---------------------------------------------------------------- radical simplificado */

  // ⁿ√N = k · ⁿ√r, com r sem nenhum fator elevado a n.
  function simplify(N, n) {
    let k = 1, r = 1;
    for (const [p, e] of factor(N)) {
      k *= p ** Math.floor(e / n);
      r *= p ** (e % n);
    }
    return { k, r };
  }

  const radTex = (N, n) => {
    const { k, r } = simplify(N, n);
    if (r === 1) return texNum(k);
    return k === 1 ? R(n, texNum(N)) : `${texNum(k)}${R(n, texNum(r))}`;
  };

  // √12 = 2√3 ≈ 3,4641 — com a forma simplificada quando ela existe.
  function rootChain(N, n) {
    const v = root(N, n);
    let t = R(n, texNum(N));
    if (Number.isInteger(N) && N > 0 && N <= 1e12) {
      const s = radTex(N, n);
      if (s !== t) t += ` = ${s}`;
    }
    return isInt(v) ? t : `${t} \\approx ${texNum(v)}`;
  }

  /* ---------------------------------------------------------------- regras */

  const RULES = {
    pitagoras({ a, b }) {
      const h = Math.hypot(a, b);
      return {
        lhs: [`\\sqrt{${a}^2 + ${b}^2} = ${rootChain(a * a + b * b, 2)}`, h],
        rhs: [`${a} + ${b} = ${a + b}`, a + b],
        note: same(h, a + b) ? "" : `A soma ${a + b} é sempre maior que a raiz: num triângulo, ir pelos dois catetos é mais longo que cortar pela hipotenusa.`,
        draw: box => drawTriangle(box, a, b),
      };
    },
    soma({ a, b }) {
      return {
        lhs: [`\\sqrt{${a} + ${b}} = ${rootChain(a + b, 2)}`, Math.sqrt(a + b)],
        rhs: [`\\sqrt{${a}} + \\sqrt{${b}} ${sgn(Math.sqrt(a), Math.sqrt(b))} ${texNum(Math.sqrt(a))} + ${texNum(Math.sqrt(b))} ${sgn(Math.sqrt(a) + Math.sqrt(b))} ${texNum(Math.sqrt(a) + Math.sqrt(b))}`, Math.sqrt(a) + Math.sqrt(b)],
        note: "Com a e b positivos, a soma das raízes é sempre maior que a raiz da soma.",
      };
    },
    diferenca({ a, b }) {
      // Com a < b a raiz não existe nos reais; em vez de travar o card,
      // a conta usa o maior menos o menor e avisa.
      const [p, q] = a >= b ? [a, b] : [b, a];
      const l = Math.sqrt(p - q), r = Math.sqrt(p) - Math.sqrt(q);
      let note = a < b ? `Como a < b, a conta usa ${p} − ${q}: √(${a} − ${b}) seria raiz de negativo, que não existe nos reais.` : "";
      if (a === b) note = "Com a = b os dois lados dão 0 — é a única coincidência (com b ≥ 1). Mude um dos valores.";
      return {
        lhs: [`\\sqrt{${p} - ${q}} = ${rootChain(p - q, 2)}`, l],
        rhs: [`\\sqrt{${p}} - \\sqrt{${q}} ${sgn(Math.sqrt(p), Math.sqrt(q))} ${texNum(Math.sqrt(p))} - ${texNum(Math.sqrt(q))} ${sgn(r)} ${texNum(r)}`, r],
        note,
      };
    },
    produto({ a, b }) {
      const r = Math.sqrt(a) * Math.sqrt(b);
      return {
        lhs: [`\\sqrt{${a} \\cdot ${b}} = ${rootChain(a * b, 2)}`, Math.sqrt(a * b)],
        rhs: [`\\sqrt{${a}} \\cdot \\sqrt{${b}} ${sgn(Math.sqrt(a), Math.sqrt(b))} ${texNum(Math.sqrt(a))} \\cdot ${texNum(Math.sqrt(b))} ${sgn(r)} ${texNum(r)}`, r],
      };
    },
    quociente({ a, b }) {
      const l = Math.sqrt(a / b), r = Math.sqrt(a) / Math.sqrt(b);
      return {
        lhs: [`\\sqrt{\\dfrac{${a}}{${b}}} ${sgn(a / b)} \\sqrt{${texNum(a / b)}} ${sgn(l)} ${texNum(l)}`, l],
        rhs: [`\\dfrac{\\sqrt{${a}}}{\\sqrt{${b}}} ${sgn(Math.sqrt(a), Math.sqrt(b))} \\dfrac{${texNum(Math.sqrt(a))}}{${texNum(Math.sqrt(b))}} ${sgn(r)} ${texNum(r)}`, r],
      };
    },
    fator({ k, a }) {
      const r = k * Math.sqrt(a);
      return {
        lhs: [`\\sqrt{${k}^2 \\cdot ${a}} = ${rootChain(k * k * a, 2)}`, Math.sqrt(k * k * a)],
        rhs: [`${k}\\sqrt{${a}} ${sgn(r)} ${k} \\cdot ${texNum(Math.sqrt(a))} ${sgn(r)} ${texNum(r)}`, r],
      };
    },
    modulo({ x }) {
      return {
        lhs: [`\\sqrt{${paren(x)}^2} = \\sqrt{${x * x}} = ${Math.abs(x)}`, Math.abs(x)],
        rhs: [`|${texNum(x)}| = ${Math.abs(x)}`, Math.abs(x)],
        note: x < 0
          ? `Repare: x = ${fmt(x)}, mas o resultado é ${Math.abs(x)}. Se a regra fosse √(x²) = x, daria ${fmt(x)} — e raiz quadrada nunca é negativa.`
          : "Com x positivo ou zero, |x| = x e tanto faz. Arraste x para um valor negativo e veja a diferença.",
      };
    },
    quadrado({ a }) {
      return {
        lhs: [`\\left(\\sqrt{${a}}\\right)^2 ${sgn(Math.sqrt(a))} ${texNum(Math.sqrt(a))}^2 = ${a}`, a],
        rhs: [`${a}`, a],
        note: isInt(Math.sqrt(a)) ? "" : `O decimal ${fmt(Math.sqrt(a))} é arredondado; ao quadrado dá ${fmt(Number(Math.sqrt(a).toFixed(4)) ** 2, 6)}, quase ${a}. Com √${a} exata, dá ${a} certinho.`,
      };
    },
    potencia({ a, n }) {
      const v = root(a, n);
      return {
        lhs: [rootChain(a, n), v],
        rhs: [`${a}^{1/${n}} ${sgn(v)} ${texNum(v)}`, v],
        note: `Conferindo: ${fmt(v)} multiplicado ${n} vezes por si mesmo ${isInt(v) ? "dá" : "dá quase"} ${a}.`,
      };
    },
    potenciaM({ a, m, n }) {
      const v = Math.pow(a, m / n);
      return {
        lhs: [`${R(n, `${a}^{${m}}`)} = ${rootChain(a ** m, n)}`, root(a ** m, n)],
        rhs: [`${a}^{${m}/${n}} ${sgn(v)} ${texNum(v)}`, v],
        note: m % n === 0 ? `Como ${m} é múltiplo de ${n}, a raiz sai exata: ${a}^${m / n}.` : "",
      };
    },
    produtoN({ a, b, n }) {
      const r = root(a, n) * root(b, n);
      return {
        lhs: [`${R(n, `${a} \\cdot ${b}`)} = ${rootChain(a * b, n)}`, root(a * b, n)],
        rhs: [`${R(n, a)} \\cdot ${R(n, b)} ${sgn(root(a, n), root(b, n))} ${texNum(root(a, n))} \\cdot ${texNum(root(b, n))} ${sgn(r)} ${texNum(r)}`, r],
      };
    },
    quocienteN({ a, b, n }) {
      const l = root(a / b, n), r = root(a, n) / root(b, n);
      return {
        lhs: [`${R(n, `\\dfrac{${a}}{${b}}`)} ${sgn(l)} ${texNum(l)}`, l],
        rhs: [`\\dfrac{${R(n, a)}}{${R(n, b)}} ${sgn(root(a, n), root(b, n))} \\dfrac{${texNum(root(a, n))}}{${texNum(root(b, n))}} ${sgn(r)} ${texNum(r)}`, r],
      };
    },
    raizDeRaiz({ a }) {
      const s = Math.sqrt(a), v = Math.sqrt(s);
      return {
        lhs: [`\\sqrt{\\sqrt{${a}}} ${sgn(s)} \\sqrt{${texNum(s)}} ${sgn(v)} ${texNum(v)}`, v],
        rhs: [`${R(4, a)} = ${a}^{1/4} ${sgn(v)} ${texNum(v)}`, Math.pow(a, 1 / 4)],
      };
    },
    indice({ x, n }) {
      const p = x ** n, v = root(p, n);
      const par = n % 2 === 0;
      return {
        lhs: [`${R(n, `${paren(x)}^{${n}}`)} = ${R(n, texNum(p))} = ${texNum(v)}`, v],
        rhs: [par ? `|${texNum(x)}| = ${texNum(Math.abs(x))}` : `${texNum(x)}`, par ? Math.abs(x) : x],
        note: par
          ? (x < 0 ? `Índice ${n} é par: o sinal de ${fmt(x)} se perde na potência, e a raiz devolve ${fmt(Math.abs(x))}. Por isso o lado direito é |x|.` : `Índice ${n} é par, então o lado direito é |x|. Com x negativo a diferença aparece.`)
          : `Índice ${n} é ímpar: potência ímpar guarda o sinal, e a raiz o devolve. O resultado é o próprio x${x < 0 ? ", negativo mesmo" : ""}.`,
      };
    },
  };

  /* ---------------------------------------------------------------- triângulo */

  function drawTriangle(box, a, b) {
    const W = 300, H = 190, pad = 34;
    const s = Math.min((W - 2 * pad) / b, (H - 2 * pad) / a);
    const x0 = pad, y0 = H - pad, x1 = x0 + b * s, y1 = y0 - a * s;
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "tri", role: "img",
      "aria-label": `Triângulo retângulo com catetos ${a} e ${b} e hipotenusa ${fmt(Math.hypot(a, b))}` });
    svg("polygon", { points: `${x0},${y0} ${x1},${y0} ${x0},${y1}`, class: "tri-fill" }, g);
    svg("path", { d: `M${x0},${y0} L${x1},${y0} M${x0},${y0} L${x0},${y1}`, class: "tri-leg" }, g);
    svg("line", { x1: x1, y1: y0, x2: x0, y2: y1, class: "tri-hyp" }, g);
    svg("path", { d: `M${x0 + 10},${y0} V${y0 - 10} H${x0}`, class: "tri-right" }, g);
    const t = (x, y, txt, cls, anchor = "middle") => {
      const e = svg("text", { x, y, class: cls, "text-anchor": anchor }, g);
      e.textContent = txt;
    };
    t((x0 + x1) / 2, y0 + 20, `b = ${b}`, "tri-label");
    t(x0 - 8, (y0 + y1) / 2 + 4, `a = ${a}`, "tri-label", "end");
    t((x0 + x1) / 2 + 10, (y0 + y1) / 2 - 8, `√(a² + b²) ≈ ${fmt(Math.hypot(a, b), 2)}`, "tri-label is-hi", "start");
    box.replaceChildren(g);
  }

  /* ---------------------------------------------------------------- figura do início */

  function initIntro(section) {
    const range = section.querySelector("input[name=area]");
    const out = section.querySelector(".intro-value");
    const figure = section.querySelector(".intro-figure");
    const text = section.querySelector(".intro-text");
    const tabs = Array.from(section.querySelectorAll("[data-indice]"));
    let n = 2;

    function draw() {
      const a = Number(range.value);
      out.textContent = fmt(a);
      const s = root(a, n);
      const W = 330, H = 260;
      const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "intro-svg", role: "img" });
      if (n === 2) {
        // Ancorado no canto inferior esquerdo, com os quadrados perfeitos
        // vizinhos tracejados: dá para ver √a entre dois inteiros.
        // A escala acompanha a: o maior quadrado tracejado ocupa a figura, e a
        // grade mostra as unidades.
        const lo = Math.floor(s + 1e-9);
        const u = Math.min(60, 230 / (isInt(s) ? lo : lo + 1));
        const x0 = 8, y0 = H - 4; // sobra espaço à direita para os rótulos
        const L = s * u;
        g.setAttribute("aria-label", `Quadrado de área ${a} e lado ${fmt(s)}`);
        svg("rect", { x: x0, y: y0 - L, width: L, height: L, class: "sq-fill" }, g);
        for (let i = 1; i < s; i++) {
          svg("line", { x1: x0 + i * u, y1: y0, x2: x0 + i * u, y2: y0 - L, class: "sq-grid" }, g);
          svg("line", { x1: x0, y1: y0 - i * u, x2: x0 + L, y2: y0 - i * u, class: "sq-grid" }, g);
        }
        if (!isInt(s)) {
          [lo, lo + 1].forEach(v => {
            if (v < 1) return;
            svg("rect", { x: x0, y: y0 - v * u, width: v * u, height: v * u, class: "sq-ref" }, g);
            const t = svg("text", { x: x0 + Math.max(v * u, L) + 6, y: y0 - v * u + 4, class: "tri-label" }, g);
            t.textContent = `${v}×${v} = ${v * v}`;
          });
        }
        svg("rect", { x: x0, y: y0 - L, width: L, height: L, class: "sq-edge" }, g);
        const lab = svg("text", { x: x0 + L / 2, y: y0 - L - 8, class: "tri-label is-hi", "text-anchor": "middle" }, g);
        lab.textContent = `lado ≈ ${fmt(s, 2)}`;
      } else {
        const u = 36;
        const L = s * u, d = L * 0.45;
        const x0 = (W - L - d) / 2, y0 = (H + L - d) / 2 + 8;
        g.setAttribute("aria-label", `Cubo de volume ${a} e aresta ${fmt(s)}`);
        const P = (x, y) => `${x},${y}`;
        svg("polygon", { class: "cube-top", points: [P(x0, y0 - L), P(x0 + d, y0 - L - d), P(x0 + L + d, y0 - L - d), P(x0 + L, y0 - L)].join(" ") }, g);
        svg("polygon", { class: "cube-side", points: [P(x0 + L, y0), P(x0 + L, y0 - L), P(x0 + L + d, y0 - L - d), P(x0 + L + d, y0 - d)].join(" ") }, g);
        svg("rect", { class: "sq-fill sq-edge", x: x0, y: y0 - L, width: L, height: L }, g);
        const lab = svg("text", { x: x0 + L / 2, y: y0 + 18, class: "tri-label is-hi", "text-anchor": "middle" }, g);
        lab.textContent = `aresta = ∛${a} ≈ ${fmt(s, 2)}`;
      }
      figure.replaceChildren(g);

      const lo = Math.floor(s + 1e-9), hi = lo + 1;
      const pow = v => v ** n;
      const word = n === 2 ? "quadrado" : "cubo";
      const sym = n === 2 ? "√" : "∛";
      const vezes = Array(n).fill(fmt(s, 2)).join(" × ");
      text.replaceChildren();
      const eq = isInt(s) ? "=" : "≈";
      const p1 = el("p");
      p1.innerHTML = n === 2
        ? `Um quadrado de <strong>área ${fmt(a)}</strong> tem lado <strong>√${a} ${eq} ${fmt(s)}</strong>, porque ${vezes} ${eq} ${fmt(a)}.`
        : `Um cubo de <strong>volume ${fmt(a)}</strong> tem aresta <strong>∛${a} ${eq} ${fmt(s)}</strong>, porque ${vezes} ${eq} ${fmt(a)}.`;
      const p2 = el("p");
      p2.innerHTML = isInt(s)
        ? `${fmt(a)} é um <strong>${word} perfeito</strong>: ${Array(n).fill(lo).join(" × ")} = ${fmt(a)}, então a raiz é exata.`
        : `${fmt(a)} não é ${word} perfeito. Ele fica entre ${pow(lo)} e ${pow(hi)}, então ${sym}${a} fica entre <strong>${lo} e ${hi}</strong> — mais perto de ${a - pow(lo) < pow(hi) - a ? lo : hi}. É o jeito de estimar uma raiz de cabeça.`;
      text.append(p1, p2);
    }

    tabs.forEach(t => t.addEventListener("click", () => {
      n = Number(t.dataset.indice);
      tabs.forEach(u => u.setAttribute("aria-pressed", String(u === t)));
      range.max = n === 2 ? 144 : 125;
      if (Number(range.value) > range.max) range.value = range.max;
      draw();
    }));
    range.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- simplificar */

  function initSimplify(section) {
    const inN = section.querySelector("input[name=N]");
    const inIdx = section.querySelector("select[name=indice]");
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("N")) inN.value = q.get("N");
    if (q.has("indice")) inIdx.value = q.get("indice");

    function update() {
      const raw = inN.value.trim();
      const n = Number(inIdx.value);
      const N = Number(raw);
      steps.replaceChildren();
      const bad = !/^\d+$/.test(raw) || N < 1 || N > 1e9;
      inN.setAttribute("aria-invalid", String(bad));
      section.classList.toggle("has-error", bad);
      if (bad) {
        result.textContent = "";
        note.textContent = "Digite um número inteiro de 1 a 1.000.000.000.";
        return;
      }
      const fs = factor(N);
      const { k, r } = simplify(N, n);
      const fTex = fs.size ? Array.from(fs).map(([p, e]) => (e > 1 ? `${p}^{${e}}` : `${p}`)).join(" \\cdot ") : "1";
      // Cada primo: o que sai (expoente ÷ índice) e o que fica (o resto).
      const parts = Array.from(fs).map(([p, e]) => {
        const out = Math.floor(e / n), stay = e % n;
        const pieces = [];
        if (out) pieces.push(tone(out > 1 ? `(${p}^{${out}})^{${n}}` : `${p}^{${n}}`, 1));
        if (stay) pieces.push(stay > 1 ? `${p}^{${stay}}` : `${p}`);
        return pieces.join(" \\cdot ");
      });
      const add = (text, src) => {
        const li = el("li");
        li.appendChild(el("span", null, text));
        if (src) { const m = el("span", "calc-math"); math(m, src); li.appendChild(m); }
        steps.appendChild(li);
      };
      add("Fatore o número em primos:", `${texNum(N)} = ${fTex}`);
      add(`Em cada primo, separe grupos de ${n} (o índice). Cada grupo completo pode sair da raiz; o que não completa um grupo fica dentro:`,
        `${R(n, texNum(N))} = ${R(n, parts.join(" \\cdot "))}`);
      add("Tire os grupos completos — cada um sai como uma única cópia do primo:",
        `${R(n, texNum(N))} = ${radTex(N, n)}`);

      // Sem nada para tirar, "√30 = √30" não diz nada: vai só o valor.
      const head = k === 1 ? tone(R(n, texNum(N)), 1) : `${R(n, texNum(N))} = ${tone(radTex(N, n), 1)}`;
      math(result, `${head}${isInt(root(N, n)) ? "" : ` \\approx ${texNum(root(N, n))}`}`);
      note.textContent = r === 1
        ? `${fmt(N)} é ${n === 2 ? "um quadrado perfeito" : n === 3 ? "um cubo perfeito" : `uma potência ${n} perfeita`}: a raiz é exata, ${fmt(k)}.`
        : k === 1
          ? `Nenhum primo aparece ${n} vezes ou mais: a raiz já está na forma mais simples.`
          : `Confira: ${fmt(k)}${n === 2 ? "²" : n === 3 ? "³" : `^${n}`} × ${fmt(r)} = ${fmt(k ** n)} × ${fmt(r)} = ${fmt(N)}.`;

      saveParams({ N: raw, indice: n });
    }

    section.addEventListener("input", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      const [N, n] = btn.dataset.exemplo.split(":");
      inN.value = N;
      inIdx.value = n;
      update();
    }));
    update();
  }

  Licao.renderTex();
  const intro = document.querySelector(".intro");
  if (intro) initIntro(intro);
  const simp = document.querySelector(".calc[data-calc=simplificar]");
  if (simp) initSimplify(simp);
  Licao.regras(VARS, RULES);
})();
