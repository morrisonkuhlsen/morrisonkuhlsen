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

  if (document.querySelector(".formula-wrap")) initFormula();
  else if (document.getElementById("filtro")) initIndex();
})();
