/* Monta o catálogo a partir de dados.js (gerado de
 * _data/testes_estatisticos.yml) e cuida da ficha, da busca e do link direto
 * (#id-do-teste). Os textos vêm do arquivo de dados, que é conteúdo nosso, mas
 * entram com textContent mesmo assim.
 *
 * Serve às duas línguas: /testes-estatisticos/ e /en/statistical-tests/, cada
 * uma com o seu dados.js. Os textos fixos daqui saem de TXT, pelo lang da
 * página. */
(() => {
  const C = window.CATALOGO;
  const TXT = {
    pt: {
      comoUsar: "Como usar",
      legenda: "Toque num teste para ver quando usar, a hipótese nula, os pressupostos e a estatística. Cada cor é uma família:",
      quando: "Quando usar", h0: "Hipótese nula", pres: "Pressupostos", estatistica: "Estatística",
      efeito: "Tamanho de efeito", reporte: "Como reportar", codigo: "No R e no Python",
      variantes: "Variantes e alternativas", veja: "Veja também",
      copiar: "Copiar", copiarCodigo: "Copiar o código em", copiado: "Copiado", copieVoce: "Selecione e copie",
      notaPy: "No Python, stats é scipy.stats e np é numpy.",
      pagina: "Página do teste", formula: "Abrir a fórmula interativa", tabela: nome => `Tabela ${nome}`,
      copiarLink: "Copiar link", linkCopiado: "Link copiado", copieBarra: "Copie da barra de endereço", fechar: "Fechar",
      contagem: (n, total) => `${n} de ${total} testes`, nenhum: "Nenhum teste com esses termos.",
    },
    en: {
      comoUsar: "How to use",
      legenda: "Tap a test to see when to use it, the null hypothesis, the assumptions and the test statistic. Each color is a family:",
      quando: "When to use it", h0: "Null hypothesis", pres: "Assumptions", estatistica: "Test statistic",
      efeito: "Effect size", reporte: "How to report it", codigo: "In R and Python",
      variantes: "Variants and alternatives", veja: "See also",
      copiar: "Copy", copiarCodigo: "Copy the code in", copiado: "Copied", copieVoce: "Select and copy",
      notaPy: "In Python, stats is scipy.stats and np is numpy.",
      pagina: "Test page", formula: "Open the interactive formula", tabela: nome => `${nome} table`,
      copiarLink: "Copy link", linkCopiado: "Link copied", copieBarra: "Copy it from the address bar", fechar: "Close",
      contagem: (n, total) => `${n} of ${total} tests`, nenhum: "No test matches these terms.",
    },
  }[document.documentElement.lang.startsWith("en") ? "en" : "pt"];
  const grid = document.getElementById("tabela");
  const ficha = document.getElementById("ficha");
  const busca = document.getElementById("busca");
  const count = document.querySelector(".pt-count");
  const byId = new Map(C.testes.map(t => [t.id, t]));
  const formulas = new Map(C.formulas.map(f => [f.url.replace(/^.*\/|\.html$/g, ""), f.title]));
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

  /* ---------------------------------------------------------------- dicas */

  // Os rótulos de coluna, linha e faixa explicam o próprio termo. O balão é um
  // só, preso ao body com position: fixed, porque a tabela rola na horizontal
  // e cortaria um balão posto dentro dela. Para leitor de tela, o texto vai
  // num span oculto ligado por aria-describedby; o balão em si é só visual.
  const balao = el("div", "pt-tip");
  balao.setAttribute("aria-hidden", "true");
  balao.hidden = true;
  document.body.appendChild(balao);

  function dica(alvo, texto, key) {
    if (!texto) return;
    const desc = el("span", "visually-hidden", texto);
    desc.id = `dica-${key}`;
    alvo.append(desc);
    alvo.tabIndex = 0;
    alvo.dataset.tip = texto;
    alvo.setAttribute("aria-describedby", desc.id);
    const show = () => mostra(alvo);
    alvo.addEventListener("mouseenter", show);
    alvo.addEventListener("focus", show);
    alvo.addEventListener("mouseleave", esconde);
    alvo.addEventListener("blur", esconde);
  }

  function mostra(alvo) {
    balao.textContent = alvo.dataset.tip;
    balao.hidden = false;
    // Abaixo do rótulo; acima, se não couber. Na horizontal, dentro da tela.
    const r = alvo.getBoundingClientRect(), b = balao.getBoundingClientRect();
    const top = r.bottom + 8 + b.height > innerHeight ? r.top - 8 - b.height : r.bottom + 8;
    const left = Math.min(Math.max(8, r.left), innerWidth - b.width - 8);
    balao.style.top = `${top}px`;
    balao.style.left = `${left}px`;
  }

  function esconde() { balao.hidden = true; }
  addEventListener("scroll", esconde, { passive: true, capture: true });

  /* ---------------------------------------------------------------- tabela */

  const colHeads = [], rowHeads = [];
  C.colunas.forEach((f, i) => {
    const fam = C.familias[f];
    const h = place(el("div", "pt-colhead"), 1, i + 2);
    h.dataset.cor = fam.cor;
    h.append(el("strong", null, fam.nome), el("span", null, fam.sub));
    dica(h, fam.dica, f);
    grid.appendChild(h);
    colHeads.push(h);
  });
  C.linhas.forEach((linha, i) => {
    const h = place(el("div", "pt-rowhead", linha.nome), i + 2, 1);
    dica(h, linha.dica, `linha-${i + 1}`);
    grid.appendChild(h);
    rowHeads.push(h);
  });
  // Vão entre o bloco principal e as faixas.
  grid.appendChild(place(el("div", "pt-gap"), C.linhas.length + 2, 1, 7));
  // Cada faixa tem 6 posições por linha da grade; a partir da 7ª, quebra para
  // a linha de baixo e o rótulo se estende pelas duas.
  const POR_LINHA = 6;
  const stripRow = [];
  let nextRow = C.linhas.length + 3;
  C.faixas.forEach((f, i) => {
    const fam = C.familias[f];
    const maxPos = Math.max(1, ...C.testes.filter(t => t.strip === i + 1).map(t => t.pos));
    const rows = Math.ceil(maxPos / POR_LINHA);
    stripRow[i + 1] = nextRow;
    const h = place(el("div", "pt-striphead"), nextRow, 1);
    h.style.gridRow = `${nextRow} / span ${rows}`;
    nextRow += rows;
    h.dataset.cor = fam.cor;
    h.append(el("strong", null, fam.nome));
    dica(h, fam.dica, f);
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
    else place(b, stripRow[t.strip] + Math.floor((t.pos - 1) / POR_LINHA), (t.pos - 1) % POR_LINHA + 2);
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
    ficha.append(el("h2", null, TXT.comoUsar));
    ficha.append(el("p", null, TXT.legenda));
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
    const where = t.row ? `${fam.nome} · ${C.linhas[t.row - 1].nome}` : fam.nome;
    titles.append(el("p", "fd-fam", `${where} · ${t.dist}`));
    top.append(badge, titles);
    box.appendChild(top);

    sec(box, TXT.quando);
    box.appendChild(el("p", null, t.quando));
    sec(box, TXT.h0);
    box.appendChild(el("p", null, t.h0));
    sec(box, TXT.pres);
    const ul = el("ul");
    t.pres.forEach(p => ul.appendChild(el("li", null, p)));
    box.appendChild(ul);
    sec(box, TXT.estatistica);
    const tex = el("div", "fd-tex");
    math(tex, `\\displaystyle ${t.tex}`);
    box.appendChild(tex);

    if (t.efeito) {
      sec(box, TXT.efeito);
      box.appendChild(el("p", null, t.efeito.texto));
      if (t.efeito.tex) {
        const ef = el("div", "fd-tex");
        math(ef, `\\displaystyle ${t.efeito.tex}`);
        box.appendChild(ef);
      }
    }

    if (t.reporte) {
      sec(box, TXT.reporte);
      box.appendChild(el("p", "fd-report", t.reporte));
    }

    if (t.codigo) {
      sec(box, TXT.codigo);
      [["r", "R"], ["py", "Python"]].forEach(([chave, rotulo]) => {
        const texto = (t.codigo[chave] || "").trimEnd();
        if (!texto) return;
        const bloco = el("div", "fd-code");
        const topo = el("div", "fd-code-head");
        const copiar = el("button", "fd-ref", TXT.copiar);
        copiar.type = "button";
        copiar.setAttribute("aria-label", `${TXT.copiarCodigo} ${rotulo}`);
        copiar.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(texto);
            copiar.textContent = TXT.copiado;
          } catch {
            copiar.textContent = TXT.copieVoce;
          }
        });
        topo.append(el("span", null, rotulo), copiar);
        const pre = el("pre");
        pre.appendChild(el("code", null, texto));
        bloco.append(topo, pre);
        box.appendChild(bloco);
      });
      box.appendChild(el("p", "fd-code-nota", TXT.notaPy));
    }

    if (t.vars.length) {
      sec(box, TXT.variantes);
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

    const veja = (t.veja || []).filter(slug => formulas.has(slug));
    if (veja.length) {
      sec(box, TXT.veja);
      const ul = el("ul");
      veja.forEach(slug => {
        const a = el("a", null, formulas.get(slug));
        a.href = `${C.formulaBase}${slug}.html`;
        const li = el("li");
        li.appendChild(a);
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }

    const actions = el("div", "fd-actions");
    const pagina = el("a", null, TXT.pagina);
    pagina.href = `${t.id}/`;
    actions.appendChild(pagina);
    if (t.page) {
      const a = el("a", null, TXT.formula);
      a.href = `${C.formulaBase}${t.page}.html`;
      actions.appendChild(a);
    }
    const tab = tabela(t.dist);
    if (tab) {
      const a = el("a", null, TXT.tabela(tab.nome));
      a.href = tab.url;
      actions.appendChild(a);
    }
    // Copia em vez de navegar: um <a href="#id"> empilharia uma entrada no
    // histórico, e o resto da página troca o hash sem empilhar.
    const link = el("button", "fd-ref", TXT.copiarLink);
    link.type = "button";
    link.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#${t.id}`;
      try {
        await navigator.clipboard.writeText(url);
        link.textContent = TXT.linkCopiado;
      } catch {
        history.replaceState(null, "", `#${t.id}`);
        link.textContent = TXT.copieBarra;
      }
    });
    actions.appendChild(link);
    const close = el("button", "fd-ref fd-close", TXT.fechar);
    close.type = "button";
    close.addEventListener("click", () => select(null, true));
    actions.appendChild(close);
    box.appendChild(actions);

    ficha.replaceChildren(box);
    ficha.classList.add("is-open");
  }

  // `push` marca uma ação de quem usa a página (e não a leitura do hash): só
  // então o foco acompanha, indo para a ficha que abriu ou voltando ao teste
  // cuja ficha fechou. Sem isso, a ficha que sobe de baixo no celular fica
  // fora do alcance de quem navega por teclado ou leitor de tela.
  // A tabela do site que dá os valores críticos, quando a distribuição de
  // referência tem uma: t, F, qui-quadrado ou normal padrão.
  function tabela(dist) {
    if (/^t\(/.test(dist)) return { nome: "t", url: "/ttable.html" };
    if (/^F\b/.test(dist)) return { nome: "F", url: "/ftable.html" };
    if (dist.startsWith("χ²")) return { nome: "χ²", url: "/chitable.html" };
    if (dist.includes("N(0, 1)")) return { nome: "Z", url: "/ztable.html" };
    return null;
  }

  function select(id, push) {
    const prev = current;
    if (current) tiles.get(current).setAttribute("aria-pressed", "false");
    current = id && byId.has(id) ? id : null;
    if (current) {
      tiles.get(current).setAttribute("aria-pressed", "true");
      render(byId.get(current));
    } else {
      legend();
    }
    if (!push) return;
    history.replaceState(null, "", current ? `#${current}` : location.pathname + location.search);
    if (current) ficha.focus({ preventScroll: true });
    else if (prev) tiles.get(prev).focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------------- busca */

  const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const hay = new Map(C.testes.map(t => {
    const fam = C.familias[t.fam];
    const parts = [t.nome, t.sym, t.quando, t.h0, t.dist, ...t.pres, fam.nome, fam.sub || "",
      t.row ? C.linhas[t.row - 1].nome : "", t.efeito ? t.efeito.texto : "",
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
    count.textContent = terms.length ? (n ? TXT.contagem(n, C.testes.length) : TXT.nenhum) : "";
  });

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!balao.hidden) esconde();
    else if (current) select(null, true);
  });
  // O hash abre a ficha: vem de links antigos e do "Ver na tabela do
  // catálogo" das páginas dos testes. O teste escolhido precisa voltar à
  // vista junto com a ficha. Ao carregar a página, o foco fica onde está; se
  // o hash muda depois, vai para a ficha.
  const fromHash = foco => {
    select(location.hash.slice(1), false);
    if (!current) return;
    tiles.get(current).scrollIntoView({ block: "nearest", inline: "center" });
    if (foco) ficha.focus({ preventScroll: true });
  };
  addEventListener("hashchange", () => fromHash(true));
  fromHash(false);
})();
