/* Termos do glossário dentro dos artigos.
 *
 * A primeira ocorrência de cada termo do glossário no texto vira um link para
 * o verbete, e passar o mouse (ou focar com o teclado) mostra a definição num
 * balão. Links escritos à mão para o glossário ("/pt/glossario#percentil")
 * ganham o mesmo balão e o mesmo visual. No toque, o link leva direto ao
 * glossário. Os termos vêm do JSON que _includes/glossary-terms.html escreve
 * na página.
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
  const bySlug = new Map(terms.map(t => [t.s, t]));
  const base = data.dataset.base;
  const label = data.dataset.label || "Glossário";
  const more = data.dataset.more || "";

  // Caminho sem ".html" e sem barra final, para comparar URLs do glossário.
  const norm = path => path.replace(/\.html$/, "").replace(/\/+$/, "");
  const basePath = norm(new URL(base, location.href).pathname);

  // Uma regex só com todas as grafias, as mais longas primeiro: assim
  // "teste t de Student" ganha de "teste t". As bordas são letra ou dígito
  // em qualquer alfabeto, para "média" não casar dentro de "médias".
  // Verbetes com "a": 0 só aparecem em links escritos à mão.
  const bySpelling = new Map();
  terms.filter(t => t.a !== 0)
    .forEach(t => t.t.forEach(s => bySpelling.set(s.toLocaleLowerCase("pt-BR"), t)));
  // O kramdown troca o apóstrofo reto pelo curvo ("Bayes’ theorem"): a regex
  // aceita os dois, e a busca no mapa usa sempre o reto.
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+").replace(/'/g, "['’]");
  const alts = [...bySpelling.keys()].sort((a, b) => b.length - a.length).map(esc);
  const re = alts.length
    ? new RegExp(`(?<![\\p{L}\\p{N}-])(?:${alts.join("|")})(?![\\p{L}\\p{N}-])`, "giu")
    : null;

  // Links escritos à mão para um verbete: mesmo visual e mesmo balão. O termo
  // conta como já ligado, para a marcação automática não repeti-lo adiante.
  function adopt(used) {
    let n = 0;
    root.querySelectorAll("a[href*='#']").forEach(a => {
      const url = new URL(a.href, location.href);
      const slug = decodeURIComponent(url.hash.slice(1));
      if (url.origin !== location.origin || norm(url.pathname) !== basePath || !bySlug.has(slug)) return;
      a.classList.add("gloss");
      a.dataset.gloss = slug;
      used.add(slug);
      n++;
    });
    return n;
  }

  function mark() {
    const used = new Set();
    const adopted = adopt(used);
    let auto = 0;

    if (re) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: n => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      for (let node of nodes) {
        if (auto >= MAX) break;
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(node.data)) && auto < MAX) {
          const term = bySpelling.get(m[0].replace(/\s+/g, " ").replace(/’/g, "'").toLocaleLowerCase("pt-BR"));
          if (!term || used.has(term.s)) continue;
          used.add(term.s);
          auto++;
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
    }
    if (adopted || auto) tips();
  }

  // Um balão só, reaproveitado por todos os termos.
  function tips() {
    const tip = document.createElement("div");
    tip.className = "gloss-tip";
    tip.id = "gloss-tip";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;

    const kicker = document.createElement("span");
    kicker.className = "gloss-tip__label";
    kicker.textContent = label;
    const name = document.createElement("strong");
    name.className = "gloss-tip__term";
    const def = document.createElement("span");
    def.className = "gloss-tip__def";
    tip.append(kicker, name, def);
    if (more) {
      const foot = document.createElement("span");
      foot.className = "gloss-tip__more";
      foot.textContent = more;
      tip.append(foot);
    }
    document.body.appendChild(tip);

    let current = null;
    function show(a) {
      const t = bySlug.get(a.dataset.gloss);
      if (!t) return;
      if (current && current !== a) current.removeAttribute("aria-describedby");
      current = a;
      name.textContent = t.n;
      def.textContent = t.d;
      a.setAttribute("aria-describedby", tip.id);
      tip.hidden = false;

      // Um termo quebrado entre duas linhas tem mais de um retângulo: o balão
      // aponta para o primeiro, onde o mouse costuma estar.
      const r = a.getClientRects()[0] || a.getBoundingClientRect();
      const w = tip.offsetWidth, h = tip.offsetHeight;
      const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 12));
      const above = r.top - h - 14 >= 8;
      const arrow = Math.max(16, Math.min(r.left + r.width / 2 - left, w - 16));
      tip.classList.toggle("is-below", !above);
      tip.style.setProperty("--arrow-x", `${arrow}px`);
      tip.style.left = `${left + scrollX}px`;
      tip.style.top = `${(above ? r.top - h - 14 : r.bottom + 14) + scrollY}px`;
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
    addEventListener("resize", hide, { passive: true });
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
