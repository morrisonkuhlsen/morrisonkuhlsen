/* Logaritmos: a escada das potências lida ao contrário, a régua em escala
 * logarítmica, as regras (licao.js) e a calculadora de tempo para dobrar.
 */
(() => {
  const { fmt, texNum, tone, isInt, math, el, svg, saveParams } = Licao;

  const log = (x, b) => Math.log(x) / Math.log(b);
  // "2", "10" ou "e" no índice do log.
  const baseTex = b => (b === Math.E ? "e" : texNum(b));
  const logTex = (b, x) => (b === Math.E ? `\\ln ${x}` : `\\log_{${baseTex(b)}} ${x}`);
  // = para valores exatos (com folga para o ponto flutuante), ≈ para os outros.
  const eq = v => (Math.abs(v - Math.round(v * 1e4) / 1e4) < 1e-9 ? "=" : "\\approx");
  const val = v => `${eq(v)} ${texNum(v)}`;

  /* ---------------------------------------------------------------- a pergunta */

  const X_VALUES = [0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 8, 10, 16, 20, 27, 32, 50, 64, 81, 100, 128, 500, 1000];

  function initQuestion(section) {
    const inX = section.querySelector("input[name=x]");
    const outX = section.querySelector(".out-x");
    const head = section.querySelector(".q-head");
    const ladder = section.querySelector(".ladder-steps");
    const text = section.querySelector(".intro-text");
    const tabs = Array.from(section.querySelectorAll("[data-base]"));
    let b = 2;

    function draw() {
      const x = X_VALUES[Number(inX.value)];
      outX.textContent = fmt(x);
      const y = log(x, b);
      math(head, `${b === Math.E ? "e" : b}^{\\,${tone("?", 1)}} = ${texNum(x)} \\quad\\Longrightarrow\\quad ${logTex(b, texNum(x))} ${eq(y)} ${tone(texNum(y), 1)}`);

      // Os degraus bᵏ em volta de x; o de x (ou os dois vizinhos) em destaque.
      const lo = Math.floor(y + 1e-9), exact = Math.abs(y - Math.round(y)) < 1e-9;
      ladder.replaceChildren();
      for (let k = lo - 3; k <= lo + 3; k++) {
        if (k > lo - 3) ladder.appendChild(el("li", "ladder-op", `× ${b === Math.E ? "e" : b}`));
        const on = exact ? k === Math.round(y) : k === lo || k === lo + 1;
        const li = el("li", on ? "ladder-step is-on" : "ladder-step");
        const top = el("span", "ladder-pow");
        math(top, `${baseTex(b)}^{${k}}`);
        const bottom = el("span", "ladder-val");
        const v = b ** k;
        math(bottom, isInt(v) ? texNum(v) : k < 0 && Number.isInteger(b) ? `\\tfrac{1}{${texNum(b ** -k)}}` : texNum(v, 3));
        li.append(top, bottom);
        ladder.appendChild(li);
      }
      const on = ladder.querySelector(".is-on");
      if (on) ladder.scrollLeft = on.offsetLeft - (ladder.clientWidth - on.offsetWidth) / 2;

      const bs = b === Math.E ? "e" : fmt(b);
      text.innerHTML = exact
        ? `<p>${fmt(x)} é exatamente ${bs}<sup>${fmt(Math.round(y))}</sup>: ${Math.round(y) === 0 ? `todo número elevado a 0 dá 1, então o logaritmo de 1 é 0 em qualquer base` : Math.round(y) > 0 ? `é preciso multiplicar ${Math.round(y)} ${Math.round(y) === 1 ? "vez" : "vezes"} por ${bs}, partindo do 1` : `partindo do 1, é preciso <strong>dividir</strong> ${-Math.round(y)} ${Math.round(y) === -1 ? "vez" : "vezes"} por ${bs} — por isso o logaritmo é negativo`}.</p>`
        : `<p>${fmt(x)} não é uma potência inteira de ${bs}: fica entre ${fmt(b ** lo, 4)} = ${bs}<sup>${fmt(lo)}</sup> e ${fmt(b ** (lo + 1), 4)} = ${bs}<sup>${fmt(lo + 1)}</sup>. Então o logaritmo fica entre <strong>${fmt(lo)} e ${fmt(lo + 1)}</strong> — é ${fmt(y)}.</p>`;
      text.innerHTML += `<p>O logaritmo responde: <strong>a que expoente é preciso elevar ${bs} para chegar em ${fmt(x)}?</strong> É a pergunta inversa da potência.</p>`;
      saveParams({ base: b === Math.E ? "e" : b, valor: x }); // "x" é dos cards de regra
    }

    const q = new URLSearchParams(location.search);
    if (q.has("valor")) { const i = X_VALUES.indexOf(Number(q.get("valor"))); if (i >= 0) inX.value = i; }
    if (q.has("base")) {
      const t = tabs.find(u => u.dataset.base === q.get("base"));
      if (t) { b = t.dataset.base === "e" ? Math.E : Number(t.dataset.base); tabs.forEach(u => u.setAttribute("aria-pressed", String(u === t))); }
    }
    tabs.forEach(t => t.addEventListener("click", () => {
      b = t.dataset.base === "e" ? Math.E : Number(t.dataset.base);
      tabs.forEach(u => u.setAttribute("aria-pressed", String(u === t)));
      draw();
    }));
    inX.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- régua */

  // O mesmo x nas duas réguas, de 1 a 1000: na linear, 1, 10 e 100 se
  // espremem na ponta; na logarítmica, cada ×10 é o mesmo passo.
  function initRuler(section) {
    const input = section.querySelector("input[name=regua]");
    const out = section.querySelector(".out-regua");
    const fig = section.querySelector(".ruler-figure");
    const text = section.querySelector(".ruler-text");
    const W = 600, L = 24, R = 24;
    const lin = x => L + (x - 1) / 999 * (W - L - R);
    const lg = x => L + Math.log10(x) / 3 * (W - L - R);

    function axis(g, y, title, pos, ticks, minor) {
      const t = svg("text", { x: L, y: y - 26, class: "ruler-title" }, g);
      t.textContent = title;
      svg("line", { x1: L, x2: W - R, y1: y, y2: y, class: "ruler-axis" }, g);
      minor.forEach(v => svg("line", { x1: pos(v), x2: pos(v), y1: y - 4, y2: y + 4, class: "ruler-minor" }, g));
      ticks.forEach(v => {
        svg("line", { x1: pos(v), x2: pos(v), y1: y - 8, y2: y + 8, class: "ruler-tick" }, g);
        const n = svg("text", { x: pos(v), y: y + 24, class: "ruler-num", "text-anchor": "middle" }, g);
        n.textContent = fmt(v);
      });
    }

    function draw() {
      const x = Math.round(10 ** Number(input.value) * 100) / 100;
      out.textContent = fmt(x, 2);
      const g = svg("svg", { viewBox: `0 0 ${W} 210`, class: "ruler", role: "img",
        "aria-label": `O valor ${fmt(x, 2)} numa régua linear e numa régua logarítmica, de 1 a 1000` });
      const minorLog = [];
      for (const d of [1, 10, 100]) for (let k = 2; k <= 9; k++) minorLog.push(k * d);
      axis(g, 60, "Escala linear", lin, [1, 200, 400, 600, 800, 1000], [100, 300, 500, 700, 900]);
      axis(g, 160, "Escala logarítmica", lg, [1, 10, 100, 1000], minorLog);
      [[lin, 60], [lg, 160]].forEach(([pos, y]) => {
        svg("circle", { cx: pos(x), cy: y, r: 7, class: "ruler-dot" }, g);
      });
      fig.replaceChildren(g);
      const where = x < 10 ? "na primeira década (de 1 a 10)" : x < 100 ? "na segunda década (de 10 a 100)" : "na terceira década (de 100 a 1000)";
      text.innerHTML = `Na régua linear, tudo de 1 a 100 cabe em menos de um décimo do comprimento. Na logarítmica, a posição é o log₁₀: ${fmt(x, 2)} fica em ${fmt(Math.log10(x), 3)}, ${where}. <strong>Multiplicar por 10 é sempre o mesmo passo.</strong>`;
    }
    input.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- tempo para dobrar */

  function initDouble(section) {
    const inR = section.querySelector("input[name=taxa]");
    const inM = section.querySelector("input[name=meta]");
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const parse = s => Number(s.trim().replace(/%$/, "").replace(",", "."));
    const q = new URLSearchParams(location.search);
    if (q.has("taxa")) inR.value = q.get("taxa");
    if (q.has("meta")) inM.value = q.get("meta");

    function update() {
      const r = parse(inR.value), M = parse(inM.value);
      steps.replaceChildren();
      const bad = !(r > 0 && r <= 1000) || !(M > 1 && M <= 1e6);
      section.classList.toggle("has-error", bad);
      if (bad) {
        result.textContent = "";
        note.textContent = "Use uma taxa positiva (em %, até 1000) e um fator maior que 1.";
        return;
      }
      saveParams({ taxa: inR.value.trim(), meta: inM.value.trim() });
      const g = 1 + r / 100, t = Math.log(M) / Math.log(g);
      const G = texNum(g, 6), MT = texNum(M);
      const add = (txt, src) => {
        const li = el("li");
        li.appendChild(el("span", null, txt));
        if (src) { const m = el("span", "calc-math"); math(m, src); li.appendChild(m); }
        steps.appendChild(li);
      };
      add(`Cada período multiplica o valor por 1 + ${fmt(r)}% = ${fmt(g, 6)}. Depois de t períodos, o fator é ${fmt(g, 6)}ᵗ. Queremos que ele chegue a ${fmt(M)}:`,
        `${G}^{\\,t} = ${MT}`);
      add("O t está no expoente. Tire o logaritmo dos dois lados — a regra da potência traz o expoente para baixo:",
        `\\ln\\!\\left(${G}^{\\,t}\\right) = \\ln ${MT} \\quad\\Longrightarrow\\quad t \\cdot \\ln ${G} = \\ln ${MT}`);
      add("Isole o t:",
        `t = \\dfrac{\\ln ${MT}}{\\ln ${G}} \\approx \\dfrac{${texNum(Math.log(M))}}{${texNum(Math.log(g), 6)}} ${val(t)}`);
      add("Confira, elevando:", `${G}^{${texNum(t)}} ${val(g ** t)}`);
      math(result, `t ${eq(t)} ${tone(`${texNum(t, 2)}\\ \\text{períodos}`, 1)}`);

      const full = Math.ceil(t - 1e-9);
      let msg = `Como os juros entram ao fim de cada período, o valor só chega a ${fmt(M)} vezes o inicial no fim do período ${full}.`;
      if (M === 2) msg += ` A “regra do 72” dá um atalho de cabeça: 72 ÷ ${fmt(r)} ≈ ${fmt(72 / r, 2)} — perto, porque ln 2 ≈ 0,693 e, para taxas pequenas, ln(1 + r) ≈ r.`;
      note.textContent = msg;
    }
    section.addEventListener("input", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      [inR.value, inM.value] = btn.dataset.exemplo.split(";");
      update();
    }));
    update();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    b: { min: 2, max: 10, value: 2 },
    x: { min: 1, max: 100, value: 8 },
    y: { min: 2, max: 100, value: 4 }, // log 1 = 0 zeraria o denominador em log x / log y
    k: { min: -3, max: 5, value: 3 },
  };

  const L = (b, x) => `\\log_{${b}} ${x}`;
  const RULES = {
    produto({ b, x, y }) {
      const l = log(x * y, b), a = log(x, b), c = log(y, b);
      return {
        lhs: [`${L(b, `(${x} \\cdot ${y})`)} = ${L(b, x * y)} ${val(l)}`, l],
        rhs: [`${L(b, x)} + ${L(b, y)} ${val(a)} + ${texNum(c)} ${val(a + c)}`, a + c],
        note: "Multiplicar os números soma os expoentes (bᵐ · bⁿ = bᵐ⁺ⁿ) — e o logaritmo é o expoente.",
      };
    },
    quociente({ b, x, y }) {
      const l = log(x / y, b), a = log(x, b), c = log(y, b);
      return {
        lhs: [`${L(b, `\\dfrac{${x}}{${y}}`)} ${val(l)}`, l],
        rhs: [`${L(b, x)} - ${L(b, y)} ${val(a)} - ${texNum(c)} ${val(a - c)}`, a - c],
        note: x < y ? "Com x < y a fração é menor que 1, e o logaritmo dela é negativo." : "",
      };
    },
    potencia({ b, x, k }) {
      const l = log(x ** k, b), a = log(x, b);
      return {
        lhs: [`${L(b, `${x}^{${k}}`)} ${val(l)}`, l],
        rhs: [`${k} \\cdot ${L(b, x)} = ${k} \\cdot ${texNum(a)} ${val(k * a)}`, k * a],
        note: "É a regra que resolve equações com a incógnita no expoente: o logaritmo traz o expoente para baixo.",
      };
    },
    mudanca({ b, x }) {
      const l = log(x, b);
      return {
        lhs: [`${L(b, x)} ${val(l)}`, l],
        rhs: [`\\dfrac{\\ln ${x}}{\\ln ${b}} ${val(Math.log(x))} \\div ${texNum(Math.log(b))} ${val(Math.log(x) / Math.log(b))}`, Math.log(x) / Math.log(b)],
        note: "Calculadoras têm só ln e log₁₀. Com a mudança de base, qualquer logaritmo sai de um deles — dá o mesmo resultado com log₁₀ no lugar de ln.",
      };
    },
    inverso({ b, x }) {
      const l = log(x, b);
      return {
        lhs: [`${b}^{\\log_{${b}} ${x}} = ${b}^{${texNum(l)}} ${val(b ** l)}`, b ** l],
        rhs: [`${x}`, x],
        note: "Potência e logaritmo na mesma base se desfazem, como raiz e quadrado.",
      };
    },
    somaErrada({ b, x, y }) {
      const l = log(x + y, b), a = log(x, b), c = log(y, b);
      return {
        lhs: [`${L(b, `(${x} + ${y})`)} = ${L(b, x + y)} ${val(l)}`, l],
        rhs: [`${L(b, x)} + ${L(b, y)} ${val(a + c)}`, a + c],
        note: "A soma dos logaritmos é o logaritmo do produto, não da soma. log(x + y) não se simplifica."
          + (Math.abs(l - (a + c)) < 1e-9 ? " Aqui deu igual porque x + y = x · y (só acontece com x = y = 2)." : ""),
      };
    },
    divisaoErrada({ b, x, y }) {
      const l = log(x, b) / log(y, b), r = log(x / y, b);
      return {
        lhs: [`\\dfrac{${L(b, x)}}{${L(b, y)}} ${val(l)}`, l],
        rhs: [`${L(b, `\\dfrac{${x}}{${y}}`)} ${val(r)}`, r],
        note: "Dividir logaritmos não é o logaritmo da divisão. log x / log y é, na verdade, a mudança de base: logᵧ x."
          + (Math.abs(l - r) < 1e-9 ? " Aqui coincidiu por acaso: mude os valores." : ""),
      };
    },
  };

  Licao.renderTex();
  const by = s => document.querySelector(s);
  if (by(".log-question")) initQuestion(by(".log-question"));
  if (by(".log-ruler")) initRuler(by(".log-ruler"));
  if (by(".calc[data-calc=dobrar]")) initDouble(by(".calc[data-calc=dobrar]"));
  Licao.regras(VARS, RULES);
})();
