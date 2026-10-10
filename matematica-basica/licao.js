/* O que as lições de matemática básica dividem: números em pt-BR, KaTeX,
 * SVG e os cards de regra.
 *
 * Um card de regra é um <div class="rule-try" data-rule="nome" data-vars="a b">.
 * Licao.regras(VARS, RULES) monta os controles de cada um e liga todos a um
 * só estado: mexer em `a` num card muda `a` em todos. RULES[nome](estado)
 * devolve os dois lados da igualdade, { lhs: [tex, valor], rhs: [tex, valor] },
 * e opcionalmente `note` (texto) e `draw` (função que desenha no card). O
 * veredito sai da comparação dos valores, não de uma frase fixa: é a conta
 * que convence. O estado fica na URL (?a=3&b=4…).
 */
window.Licao = (() => {
  // Negativo com o sinal tipográfico − (U+2212), no texto e no KaTeX.
  const fmt = (v, d = 4) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: d }).format(Math.abs(v) < 5e-13 ? 0 : v).replace("-", "−");
  // Para frases: números muito grandes ou muito pequenos em notação
  // científica, para 10⁻¹⁸ não virar "0" no veredito.
  const sup = v => String(v).replace(/[-\d]/g, c => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]);
  function fmtNum(v) {
    const a = Math.abs(v);
    if (a === 0 || (a >= 1e-4 && a < 1e12)) return fmt(v);
    const k = Math.floor(Math.log10(a)), m = v / 10 ** k;
    return Math.abs(Math.abs(m) - 1) < 1e-9 ? `${m < 0 ? "−" : ""}10${sup(k)}` : `${fmt(m, 3)} × 10${sup(k)}`;
  }
  // No KaTeX, vírgula e ponto entre chaves não ganham espaço de pontuação.
  const texNum = (v, d) => fmt(v, d).replace(/[.,]/g, c => `{${c}}`);
  const tone = (t, n) => `\\htmlData{tone=${n}}{${t}}`;
  const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
  const sgn = (...vs) => (vs.every(isInt) ? "=" : "\\approx");
  const paren = v => (v < 0 ? `(${texNum(v)})` : texNum(v));
  const same = (p, q) => Math.abs(p - q) <= 1e-9 * Math.max(1, Math.abs(p), Math.abs(q));

  // \htmlData só para pintar trechos com data-tone; nada além disso é confiável.
  const MATH_OPTS = { throwOnError: false, strict: false, trust: c => c.command === "\\htmlData" };
  const math = (el, src) => (window.katex ? katex.render(src, el, MATH_OPTS) : (el.textContent = src));
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  const svg = (tag, attrs, parent) => {
    const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  };

  function factor(n) {
    const fs = new Map();
    for (let p = 2; p * p <= n; p += p === 2 ? 1 : 2) {
      while (n % p === 0) { fs.set(p, (fs.get(p) || 0) + 1); n /= p; }
    }
    if (n > 1) fs.set(n, (fs.get(n) || 0) + 1);
    return fs;
  }

  // Grava campos na URL sem criar entrada no histórico a cada tecla.
  function saveParams(obj) {
    const q = new URLSearchParams(location.search);
    for (const [k, v] of Object.entries(obj)) q.set(k, v);
    history.replaceState(null, "", `${location.pathname}?${q}${location.hash}`);
  }

  function regras(VARS, RULES) {
    const state = {};
    const params = new URLSearchParams(location.search);
    for (const [v, cfg] of Object.entries(VARS)) {
      const p = Number(params.get(v));
      state[v] = params.has(v) && Number.isInteger(p) && p >= cfg.min && p <= cfg.max ? p : cfg.value;
    }

    const sliders = []; // [variável, input, output]
    function makeControl(v) {
      const cfg = VARS[v];
      const label = el("label", "var");
      const input = el("input");
      Object.assign(input, { type: "range", min: cfg.min, max: cfg.max, step: 1, value: state[v] });
      input.setAttribute("aria-label", `Valor de ${v}`);
      const out = el("output", null, fmt(state[v]));
      label.append(el("i", null, v), input, out);
      sliders.push([v, input, out]);
      input.addEventListener("input", () => set(v, Number(input.value)));
      return label;
    }

    function set(v, value) {
      state[v] = value;
      sliders.forEach(([w, input, out]) => {
        if (w !== v) return;
        input.value = value;
        out.textContent = fmt(value);
      });
      render();
      saveParams({ [v]: value });
    }

    const cards = Array.from(document.querySelectorAll(".rule-try[data-rule]")).map(box => {
      const controls = el("div", "vars");
      box.dataset.vars.split(" ").forEach(v => controls.appendChild(makeControl(v)));
      const lines = el("div", "rule-lines");
      const verdict = el("p", "rule-verdict");
      const note = el("p", "rule-note");
      const figure = el("div", "rule-figure");
      box.append(controls, figure, lines, verdict, note);
      return { rule: RULES[box.dataset.rule], lines, verdict, note, figure };
    });

    function render() {
      cards.forEach(c => {
        const out = c.rule(state);
        c.lines.replaceChildren();
        c.figure.hidden = !out.draw;
        if (out.draw) out.draw(c.figure);
        [["Lado esquerdo", out.lhs], ["Lado direito", out.rhs]].forEach(([label, [src]]) => {
          const row = el("div", "rule-line");
          row.appendChild(el("span", "rule-side", label));
          const m = el("span", "rule-math");
          math(m, src);
          row.appendChild(m);
          c.lines.appendChild(row);
        });
        const L = out.lhs[1], R = out.rhs[1];
        const ok = same(L, R);
        c.verdict.className = `rule-verdict ${ok ? "is-ok" : "is-diff"}`;
        c.verdict.textContent = ok
          ? `✓ Os dois lados dão ${fmtNum(L)}.`
          : `✗ Os lados dão resultados diferentes: ${fmtNum(L)} e ${fmtNum(R)}.`;
        c.note.textContent = out.note || "";
      });
    }

    render();
  }

  // Fórmulas fixas escritas direto no HTML.
  function renderTex() {
    document.querySelectorAll("[data-tex]").forEach(e => math(e, "\\displaystyle " + e.dataset.tex));
  }

  return { fmt, fmtNum, sup, texNum, tone, isInt, sgn, paren, same, math, el, svg, factor, saveParams, regras, renderTex };
})();
