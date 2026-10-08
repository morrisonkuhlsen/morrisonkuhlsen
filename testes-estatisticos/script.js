/* Monta o catálogo a partir de dados.js e cuida da ficha, da busca e
 * do link direto (#id-do-teste). Os textos vêm do arquivo de dados, que é
 * conteúdo nosso, mas entram com textContent mesmo assim. */
(() => {
  const C = window.CATALOGO;
  const grid = document.getElementById("tabela");
  const ficha = document.getElementById("ficha");
  const busca = document.getElementById("busca");
  const count = document.querySelector(".pt-count");
  const byId = new Map(C.testes.map(t => [t.id, t]));
  const tiles = new Map();
  let current = null;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const place = (e, row, col, span = 1) => {
    e.style.gridRow = String(row);
    e.style.gridColumn = `${col} / span ${span}`;
    return e;
  };
  const math = (node, tex) => {
    if (window.katex) katex.render(tex, node, { throwOnError: false, displayMode: false });
    else node.textContent = tex;
  };

  // Numeração na ordem de leitura: bloco principal linha a linha, depois as faixas.
  const ordered = [
    ...C.testes.filter(t => t.row).sort((a, b) => a.row - b.row || a.col - b.col),
    ...C.testes.filter(t => t.strip).sort((a, b) => a.strip - b.strip || a.pos - b.pos),
  ];
  ordered.forEach((t, i) => { t.n = i + 1; });

  /* ---------------------------------------------------------------- tabela */

  const colHeads = [], rowHeads = [];
  C.colunas.forEach((f, i) => {
    const fam = C.familias[f];
    const h = place(el("div", "pt-colhead"), 1, i + 2);
    h.dataset.cor = fam.cor;
    h.append(el("strong", null, fam.nome), el("span", null, fam.sub));
    grid.appendChild(h);
    colHeads.push(h);
  });
  C.linhas.forEach((nome, i) => {
    const h = place(el("div", "pt-rowhead", nome), i + 2, 1);
    grid.appendChild(h);
    rowHeads.push(h);
  });
  // Vão entre o bloco principal e as faixas.
  grid.appendChild(place(el("div", "pt-gap"), C.linhas.length + 2, 1, 7));
  const firstStripRow = C.linhas.length + 3;
  C.faixas.forEach((f, i) => {
    const fam = C.familias[f];
    const h = place(el("div", "pt-striphead"), firstStripRow + i, 1);
    h.dataset.cor = fam.cor;
    h.append(el("strong", null, fam.nome));
    grid.appendChild(h);
  });

  ordered.forEach(t => {
    const fam = C.familias[t.fam];
    const b = el("button", "el");
    b.type = "button";
    b.dataset.cor = fam.cor;
    b.dataset.id = t.id;
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", `${t.n}, ${t.nome}, ${fam.nome}`);
    b.append(el("span", "el-n", t.n), el("span", "el-sym", t.sym), el("span", "el-name", t.nome), el("span", "el-dist", t.dist));
    if (t.row) place(b, t.row + 1, t.col + 1);
    else place(b, firstStripRow + t.strip - 1, t.pos + 1);
    b.addEventListener("click", () => select(t.id, true));
    b.addEventListener("mouseenter", () => hot(t, true));
    b.addEventListener("mouseleave", () => hot(t, false));
    b.addEventListener("focus", () => hot(t, true));
    b.addEventListener("blur", () => hot(t, false));
    grid.appendChild(b);
    tiles.set(t.id, b);
  });

  // Acende o rótulo da linha e da coluna do teste sob o cursor.
  function hot(t, on) {
    if (!t.row) return;
    rowHeads[t.row - 1].classList.toggle("is-hot", on);
    colHeads[t.col - 1].classList.toggle("is-hot", on);
  }

  /* ---------------------------------------------------------------- ficha */

  function legend() {
    ficha.replaceChildren();
    delete ficha.dataset.cor;
    ficha.append(el("h2", null, "Como usar"));
    ficha.append(el("p", null, "Toque num teste para ver quando usar, a hipótese nula, os pressupostos e a estatística. Cada cor é uma família:"));
    const ul = el("ul", "legend");
    Object.values(C.familias).forEach(f => {
      const li = el("li", null, f.sub ? `${f.nome} (${f.sub})` : f.nome);
      li.dataset.cor = f.cor;
      ul.appendChild(li);
    });
    ficha.appendChild(ul);
    ficha.classList.remove("is-open");
  }

  function sec(parent, title) {
    parent.appendChild(el("h3", "fd-sec", title));
  }

  function render(t) {
    const fam = C.familias[t.fam];
    const box = el("div", "fd");
    box.dataset.cor = fam.cor;

    const top = el("div", "fd-top");
    const badge = el("div", "fd-badge");
    badge.append(el("span", null, t.n), el("strong", null, t.sym));
    const titles = el("div");
    titles.append(el("h2", "fd-name", t.nome));
    const where = t.row ? `${fam.nome} · ${C.linhas[t.row - 1]}` : fam.nome;
    titles.append(el("p", "fd-fam", `${where} · ${t.dist}`));
    top.append(badge, titles);
    box.appendChild(top);

    sec(box, "Quando usar");
    box.appendChild(el("p", null, t.quando));
    sec(box, "Hipótese nula");
    box.appendChild(el("p", null, t.h0));
    sec(box, "Pressupostos");
    const ul = el("ul");
    t.pres.forEach(p => ul.appendChild(el("li", null, p)));
    box.appendChild(ul);
    sec(box, "Estatística");
    const tex = el("div", "fd-tex");
    math(tex, `\\displaystyle ${t.tex}`);
    box.appendChild(tex);

    if (t.vars.length) {
      sec(box, "Variantes e alternativas");
      const vl = el("ul");
      t.vars.forEach(([texto, ref]) => {
        const li = el("li");
        if (ref && byId.has(ref)) {
          // Se o texto começa pelo nome do teste citado, o próprio nome vira o
          // link; senão, o link vem depois do texto.
          const nome = byId.get(ref).nome;
          const a = el("button", "fd-ref", nome);
          a.type = "button";
          a.addEventListener("click", () => select(ref, true));
          if (texto.startsWith(nome)) li.append(a, texto.slice(nome.length));
          else li.append(`${texto}: `, a);
        } else {
          li.textContent = texto;
        }
        vl.appendChild(li);
      });
      box.appendChild(vl);
    }

    const actions = el("div", "fd-actions");
    if (t.page) {
      const a = el("a", null, "Abrir a fórmula interativa");
      a.href = `/formulas/${t.page}.html`;
      actions.appendChild(a);
    }
    const link = el("a", null, "Link para este teste");
    link.href = `#${t.id}`;
    actions.appendChild(link);
    const close = el("button", "fd-ref fd-close", "Fechar");
    close.type = "button";
    close.addEventListener("click", () => select(null, true));
    actions.appendChild(close);
    box.appendChild(actions);

    ficha.replaceChildren(box);
    ficha.classList.add("is-open");
  }

  function select(id, push) {
    if (current) tiles.get(current).setAttribute("aria-pressed", "false");
    current = id && byId.has(id) ? id : null;
    if (current) {
      tiles.get(current).setAttribute("aria-pressed", "true");
      render(byId.get(current));
    } else {
      legend();
    }
    if (push) history.replaceState(null, "", current ? `#${current}` : location.pathname + location.search);
  }

  /* ---------------------------------------------------------------- busca */

  const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const hay = new Map(C.testes.map(t => {
    const fam = C.familias[t.fam];
    const parts = [t.nome, t.sym, t.quando, t.h0, fam.nome, fam.sub || "", t.row ? C.linhas[t.row - 1] : "",
      ...t.vars.map(v => v[0])];
    return [t.id, fold(parts.join(" "))];
  }));

  busca.addEventListener("input", () => {
    const terms = fold(busca.value).split(/\s+/).filter(Boolean);
    let n = 0;
    tiles.forEach((b, id) => {
      const ok = terms.every(w => hay.get(id).includes(w));
      b.classList.toggle("is-dim", !ok);
      if (ok) n++;
    });
    count.textContent = terms.length ? (n ? `${n} de ${C.testes.length} testes` : "Nenhum teste com esses termos.") : "";
  });

  document.addEventListener("keydown", e => { if (e.key === "Escape" && current) select(null, true); });
  addEventListener("hashchange", () => select(location.hash.slice(1), false));

  select(location.hash.slice(1), false);
  if (current) tiles.get(current).scrollIntoView({ block: "nearest", inline: "center" });
})();
