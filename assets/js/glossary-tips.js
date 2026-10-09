/* Termos do glossário dentro dos artigos.
 *
 * A primeira ocorrência de cada termo do glossário no texto vira um link para
 * o verbete, e passar o mouse (ou focar com o teclado) mostra a definição num
 * balão. No toque, o link leva direto ao glossário. Os termos vêm do JSON que
 * _includes/glossary-terms.html escreve na página.
 *
 * Roda depois do MathJax: antes dele, as fórmulas ainda são texto com $…$, e
 * um link no meio de uma delas quebraria a fórmula.
 */
(() => {
  const data = document.getElementById("glossary-terms");
  const root = document.getElementById("post-content");
  if (!data || !root) return;

  const MAX = 12; // mais que isso e o texto vira um mar de sublinhados
  const SKIP = "a, code, pre, h1, h2, h3, h4, h5, h6, th, figcaption, button, summary, script, style, mjx-container, .MathJax, .tex2jax_ignore";

  const terms = JSON.parse(data.textContent);
  const base = data.dataset.base;

  // Uma regex só com todas as grafias, as mais longas primeiro: assim
  // "teste t de Student" ganha de "teste t". As bordas são letra ou dígito
  // em qualquer alfabeto, para "média" não casar dentro de "médias".
  const bySpelling = new Map();
  terms.forEach(t => t.t.forEach(s => bySpelling.set(s.toLocaleLowerCase("pt-BR"), t)));
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const alts = [...bySpelling.keys()].sort((a, b) => b.length - a.length).map(esc);
  if (!alts.length) return;
  const re = new RegExp(`(?<![\\p{L}\\p{N}-])(?:${alts.join("|")})(?![\\p{L}\\p{N}-])`, "giu");

  function mark() {
    const used = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (let node of nodes) {
      if (used.size >= MAX) break;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(node.data)) && used.size < MAX) {
        const term = bySpelling.get(m[0].replace(/\s+/g, " ").toLocaleLowerCase("pt-BR"));
        if (!term || used.has(term.s)) continue;
        used.add(term.s);
        const word = node.splitText(m.index);
        const rest = word.splitText(m[0].length);
        const a = document.createElement("a");
        a.className = "gloss";
        a.href = `${base}#${term.s}`;
        a.dataset.gloss = term.s;
        word.replaceWith(a);
        a.appendChild(word);
        node = rest;
        re.lastIndex = 0;
      }
    }
    if (used.size) tips();
  }

  // Um balão só, reaproveitado por todos os termos.
  function tips() {
    const bySlug = new Map(terms.map(t => [t.s, t]));
    const tip = document.createElement("div");
    tip.className = "gloss-tip";
    tip.id = "gloss-tip";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    const name = document.createElement("strong");
    const def = document.createElement("span");
    tip.append(name, def);
    document.body.appendChild(tip);

    let current = null;
    function show(a) {
      const t = bySlug.get(a.dataset.gloss);
      if (!t) return;
      current = a;
      name.textContent = t.n;
      def.textContent = t.d;
      a.setAttribute("aria-describedby", tip.id);
      tip.hidden = false;
      const r = a.getBoundingClientRect();
      const w = tip.offsetWidth, h = tip.offsetHeight;
      const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 12));
      const above = r.top - h - 10 >= 8;
      tip.classList.toggle("is-below", !above);
      tip.style.left = `${left + scrollX}px`;
      tip.style.top = `${(above ? r.top - h - 10 : r.bottom + 10) + scrollY}px`;
    }
    function hide() {
      if (current) current.removeAttribute("aria-describedby");
      current = null;
      tip.hidden = true;
    }

    root.addEventListener("pointerover", e => {
      const a = e.target.closest(".gloss");
      if (a && e.pointerType !== "touch") show(a);
    });
    root.addEventListener("pointerout", e => {
      const a = e.target.closest(".gloss");
      if (a && !a.contains(e.relatedTarget)) hide();
    });
    root.addEventListener("focusin", e => { if (e.target.matches(".gloss")) show(e.target); });
    root.addEventListener("focusout", e => { if (e.target.matches(".gloss")) hide(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    addEventListener("scroll", hide, { passive: true });
  }

  // Sem MathJax na página, marca já. Com ele, espera a tipografia terminar.
  const mjScript = document.getElementById("MathJax-script");
  const whenMath = () => window.MathJax.startup.promise.then(mark, mark);
  if (!mjScript) mark();
  else if (window.MathJax && window.MathJax.startup) whenMath();
  else {
    mjScript.addEventListener("load", whenMath);
    // CDN fora do ar: marca assim mesmo; as fórmulas não vão virar nada.
    mjScript.addEventListener("error", mark);
  }
})();
