/* Fórmulas interativas e o índice delas.
 *
 * Cada termo é um <span class="part" data-part="…" data-tex="…">. O texto dos
 * balões vem do <dl> da própria página (o <dt data-part> de mesmo nome), que é
 * a única fonte: editar a definição ali muda o balão também.
 */
(() => {
  const EDGE = 12;     // folga mínima entre o balão e a borda da tela
  const GAP = 14;      // distância entre o termo e o balão
  const TIP_GAP = 10;  // espaço entre balões vizinhos em "mostrar todos"
  const MIN_FIT = 0.6; // menor escala da fonte antes de a faixa passar a rolar

  function tex(el, display) {
    const src = el.dataset.tex;
    if (!window.katex) { el.textContent = src; return; }
    katex.render((display ? "\\displaystyle " : "") + src, el, { throwOnError: false });
  }

  /* ---------------------------------------------------------------- índice */

  function initIndex() {
    document.querySelectorAll(".card-tex[data-tex]").forEach(el => tex(el, true));

    const input = document.getElementById("filtro");
    const cards = Array.from(document.querySelectorAll(".formula-card"));
    const groups = Array.from(document.querySelectorAll(".formula-group"));
    const empty = document.querySelector(".filter-empty");
    const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const haystack = new Map(cards.map(c => [
      c, fold(c.querySelector(".card-name").textContent + " " + c.querySelector(".card-blurb").textContent
        + " " + c.closest(".formula-group").querySelector("h2").textContent)
    ]));

    input.addEventListener("input", () => {
      const terms = fold(input.value).split(/\s+/).filter(Boolean);
      cards.forEach(c => {
        c.parentElement.hidden = !terms.every(t => haystack.get(c).includes(t));
      });
      let any = false;
      groups.forEach(g => {
        const visible = g.querySelector("li:not([hidden])");
        g.hidden = !visible;
        any = any || !!visible;
      });
      empty.hidden = any;
    });
  }

  /* ---------------------------------------------------------------- fórmula */

  function initFormula() {
    const wrap = document.querySelector(".formula-wrap");
    const scroller = document.querySelector(".formula-scroll");
    const toggle = document.querySelector(".toggle-all");
    const parts = Array.from(wrap.querySelectorAll(".part"));
    const tips = new Map();
    let selected = null; // um .part, "all" ou null

    parts.forEach(el => tex(el, true));

    // Balões montados a partir do <dl>.
    parts.forEach((el, i) => {
      const key = el.dataset.part;
      const dt = document.querySelector(`dt[data-part="${key}"]`);
      const dd = dt && dt.nextElementSibling;
      const tip = document.createElement("div");
      tip.className = "explain-modal";
      tip.id = `tip-${key}`;
      tip.setAttribute("role", "tooltip");
      tip.dataset.tone = el.dataset.tone;
      tip.innerHTML = `<div class="modal-title"></div><div class="modal-text"></div>`;
      tip.firstChild.innerHTML = dt ? dt.innerHTML : key;
      tip.lastChild.innerHTML = dd ? dd.innerHTML : "";
      document.body.appendChild(tip);
      tips.set(el, tip);

      el.classList.toggle("is-below", !!el.closest(".den"));
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", dt ? dt.textContent : key);
      el.setAttribute("aria-expanded", "false");
      el.setAttribute("aria-controls", tip.id);

      el.addEventListener("click", e => { e.stopPropagation(); select(el); });
      el.addEventListener("keydown", e => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(el); }
        else if (step) { e.preventDefault(); parts[(i + step + parts.length) % parts.length].focus(); }
      });
    });

    function measure(tip, maxWidth) {
      tip.style.maxWidth = maxWidth ? `${maxWidth}px` : "";
      return { w: tip.offsetWidth, h: tip.offsetHeight };
    }

    // Termos do numerador e da linha principal abrem o balão acima; os do
    // denominador, abaixo. Se não couber, troca de lado.
    function topFor(el, h) {
      const r = el.getBoundingClientRect();
      const above = r.top - h - GAP;
      const below = r.bottom + GAP;
      let top = el.classList.contains("is-below")
        ? (below + h > innerHeight - EDGE ? above : below)
        : (above < EDGE ? below : above);
      return Math.max(EDGE, Math.min(top, innerHeight - h - EDGE));
    }

    function place(tip, left, top) {
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      tip.classList.add("show");
    }

    function clear() {
      parts.forEach(p => { p.classList.remove("selected"); p.setAttribute("aria-expanded", "false"); });
      tips.forEach(t => t.classList.remove("show"));
      toggle.setAttribute("aria-pressed", "false");
      selected = null;
    }

    function mark(el) {
      el.classList.add("selected");
      el.setAttribute("aria-expanded", "true");
    }

    function select(el) {
      const again = selected === el;
      clear();
      if (again) return;
      selected = el;
      mark(el);
      const tip = tips.get(el);
      const { w, h } = measure(tip);
      const r = el.getBoundingClientRect();
      const left = Math.max(EDGE, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - EDGE));
      place(tip, left, topFor(el, h));
    }

    // Agrupa os termos por linha visual e espalha os balões de cada linha lado
    // a lado, estreitando-os quando não cabem na largura da tela.
    function showAll() {
      const again = selected === "all";
      clear();
      if (again) return;
      selected = "all";
      toggle.setAttribute("aria-pressed", "true");

      const rows = [];
      parts.forEach(p => {
        const top = p.getBoundingClientRect().top;
        const row = rows.find(r => Math.abs(r.top - top) < 20);
        row ? row.items.push(p) : rows.push({ top, items: [p] });
      });

      rows.forEach(({ items }) => {
        const room = innerWidth - 2 * EDGE - (items.length - 1) * TIP_GAP;
        const cap = Math.max(120, Math.min(280, room / items.length));
        const sizes = items.map(p => measure(tips.get(p), cap));
        const total = sizes.reduce((s, x) => s + x.w, 0) + (items.length - 1) * TIP_GAP;
        const first = items[0].getBoundingClientRect();
        const last = items[items.length - 1].getBoundingClientRect();
        let left = (first.left + last.right) / 2 - total / 2;
        left = Math.max(EDGE, Math.min(left, innerWidth - total - EDGE));
        items.forEach((p, i) => {
          mark(p);
          place(tips.get(p), left, topFor(p, sizes[i].h));
          left += sizes[i].w + TIP_GAP;
        });
      });
    }

    // Diminui a fonte até a fórmula caber na largura disponível.
    function fit() {
      wrap.style.setProperty("--fit", 1);
      const ratio = scroller.clientWidth / wrap.scrollWidth;
      if (ratio < 1) wrap.style.setProperty("--fit", Math.max(MIN_FIT, ratio * 0.98).toFixed(3));
    }

    toggle.addEventListener("click", e => { e.stopPropagation(); showAll(); });
    document.addEventListener("click", e => { if (!e.target.closest(".explain-modal")) clear(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") clear(); });
    // Os balões são fixos na tela; se a página rolar, eles perderiam o termo.
    addEventListener("scroll", clear, { passive: true });
    scroller.addEventListener("scroll", clear, { passive: true });

    let t;
    addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => { clear(); fit(); }, 120);
    });

    fit();
    // As fontes do KaTeX chegam depois; refaz a medida quando estiverem prontas.
    if (document.fonts) document.fonts.ready.then(fit);
  }

  /* ---------------------------------------------------------------- calculadora
   *
   * <section class="calc" data-calc="nome"> com um <input name> por variável.
   * Cada entrada de CALCS recebe os valores já convertidos e devolve o
   * resultado, os passos (texto + LaTeX) e uma nota final, ou um erro.
   * No LaTeX, tone(tex, n) pinta o trecho com a cor do termo n da fórmula.
   */

  const nf = d => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: d });
  const fmt = (n, d = 4) => nf(d).format(n === 0 ? 0 : n); // evita "-0"
  const texNum = (n, d = 4) => fmt(n, d).replace(/\./g, "").replace(",", "{,}");
  const tone = (t, n) => `\\htmlData{tone=${n}}{${t}}`;
  // Negativo dentro de uma subtração ou fração vai entre parênteses.
  const paren = (n, t) => (n < 0 ? `\\left(${t}\\right)` : t);
  const approx = (n, d = 4) => (Math.abs(n - Number(n.toFixed(d))) > 1e-12 ? "\\approx" : "=");

  // Função de distribuição da normal padrão, por Abramowitz–Stegun 7.1.26
  // (erro < 1,5·10⁻⁷, mais do que basta para um percentil com uma casa).
  function phi(z) {
    const x = Math.abs(z) / Math.SQRT2;
    const t = 1 / (1 + 0.3275911 * x);
    const erf = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741
      + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
    return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
  }

  const CALCS = {
    zscore({ x, mu, sd }) {
      if (sd <= 0) return { error: "O desvio padrão precisa ser maior que zero." };
      const diff = x - mu;
      const z = diff / sd;
      const X = tone(texNum(x), 2), M = tone(paren(mu, texNum(mu)), 3), S = tone(texNum(sd), 4);
      const zAbs = Math.abs(Number(z.toFixed(2)));

      let note;
      if (zAbs === 0) {
        note = "A observação coincide com a média.";
      } else {
        const lado = z > 0 ? "acima" : "abaixo";
        note = `A observação está ${fmt(Math.abs(z), 2)} ${zAbs >= 2 ? "desvios padrão" : "desvio padrão"} ${lado} da média.`;
      }
      const p = phi(z) * 100;
      const pct = p > 99.9 ? "mais de 99,9%" : p < 0.1 ? "menos de 0,1%" : `cerca de ${fmt(p, 1)}%`;
      note += ` Se os dados seguem uma distribuição normal, ${pct} dos valores ficam abaixo dela.`
        + ` <a href="/ztable.html?z=${z.toFixed(2)}">Conferir na tabela Z</a>.`;

      return {
        result: `Z ${approx(z)} ${tone(texNum(z), 1)}`,
        steps: [
          ["Substitua os valores na fórmula:", `Z = \\dfrac{${X} - ${M}}{${S}}`],
          ["Subtraia a média da observação:", `Z = \\dfrac{${texNum(diff)}}{${S}}`],
          ["Divida pelo desvio padrão:", `Z ${approx(z)} ${tone(texNum(z), 1)}`],
        ],
        note,
      };
    },
  };

  function initCalc(section) {
    const calc = CALCS[section.dataset.calc];
    const inputs = Array.from(section.querySelectorAll("input[name]"));
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const opts = { throwOnError: false, strict: false, trust: c => c.command === "\\htmlData" };
    const math = (el, src) => (window.katex ? katex.render(src, el, opts) : (el.textContent = src));
    // Aceita vírgula decimal, sinal tipográfico − e espaços de milhar.
    const parse = s => (s.trim() === "" ? NaN : Number(s.replace(/\s/g, "").replace("−", "-").replace(",", ".")));

    const params = new URLSearchParams(location.search);
    inputs.forEach(i => { if (params.has(i.name)) i.value = params.get(i.name); });

    function update() {
      const v = Object.fromEntries(inputs.map(i => [i.name, parse(i.value)]));
      inputs.forEach(i => i.setAttribute("aria-invalid", String(Number.isNaN(v[i.name]))));
      const out = Object.values(v).some(Number.isNaN)
        ? { error: "Preencha todos os campos com números." }
        : calc(v);

      section.classList.toggle("has-error", !!out.error);
      steps.replaceChildren();
      if (out.error) {
        result.textContent = "";
        note.textContent = out.error;
        return;
      }
      math(result, out.result);
      out.steps.forEach(([text, src]) => {
        const li = document.createElement("li");
        const p = document.createElement("span");
        const m = document.createElement("span");
        p.textContent = text;
        m.className = "calc-math";
        math(m, src);
        li.append(p, m);
        steps.appendChild(li);
      });
      note.innerHTML = out.note;
    }

    // replaceState, não pushState: cada tecla viraria uma entrada no histórico.
    section.addEventListener("input", () => {
      update();
      const q = new URLSearchParams(location.search);
      inputs.forEach(i => q.set(i.name, i.value.trim()));
      history.replaceState(null, "", `${location.pathname}?${q}${location.hash}`);
    });
    update();
  }

  document.querySelectorAll(".calc[data-calc]").forEach(initCalc);

  if (document.querySelector(".formula-wrap")) initFormula();
  else if (document.getElementById("filtro")) initIndex();
})();
