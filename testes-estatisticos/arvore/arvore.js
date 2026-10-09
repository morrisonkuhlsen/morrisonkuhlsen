/* Comportamento da árvore de decisão.
 *
 * O HTML traz a árvore em <details> aninhados, gerada pelo Jekyll: é o modo
 * "passo a passo", que funciona sem JavaScript. Daqui sai o modo fluxograma,
 * lido desse mesmo HTML (não há outra cópia dos dados): caixas de cima para
 * baixo, ligadas por setas. Cada caixa leva no alto a resposta que
 * conduz a ela; uma pergunta abre e recolhe os caminhos que saem dela, e as
 * folhas são os testes, na cor da família.
 *
 * Serve às duas línguas; os textos fixos saem de TXT, pelo lang da página. */
(() => {
  const TXT = {
    pt: {
      caminhos: n => `+ ${n} caminhos`, recolher: "− recolher", trocar: "↺ trocar esta resposta",
      zoom: "Zoom do fluxograma", menos: "Diminuir", mais: "Aumentar", real: "Tamanho real",
      ajustar: "Ajustar à largura", dica: "Role sobre o fluxograma para dar zoom; arraste para mover.",
    },
    en: {
      caminhos: n => `+ ${n} paths`, recolher: "− collapse", trocar: "↺ change this answer",
      zoom: "Flowchart zoom", menos: "Zoom out", mais: "Zoom in", real: "Actual size",
      ajustar: "Fit to width", dica: "Scroll over the flowchart to zoom; drag to move it.",
    },
  }[document.documentElement.lang.startsWith("en") ? "en" : "pt"];
  const tree = document.querySelector(".tr-tree");
  const tools = document.querySelector(".tr-tools");
  const views = document.querySelector(".tr-views");
  const scroll = document.querySelector(".fc-scroll");
  const fc = scroll.querySelector(".fc");
  const svg = fc.querySelector(".fc-lines");
  const SVG = "http://www.w3.org/2000/svg";

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  /* ---------------------------------------------------------------- passo a passo */

  // O clique no <summary> (o teclado também gera clique) vem antes de o
  // <details> mudar de estado; por isso ele, e não o evento toggle, que chega
  // depois e também dispara com o "Expandir tudo".
  tree.addEventListener("click", e => {
    const summary = e.target.closest("summary");
    if (!summary) return;
    const d = summary.parentElement;
    if (d.open) return;
    for (const outro of d.closest("ul").querySelectorAll(":scope > li > details[open]")) outro.open = false;
    requestAnimationFrame(() => summary.scrollIntoView({ block: "nearest" }));
  });

  /* ---------------------------------------------------------------- fluxograma: dados */

  // Lê um nó do HTML: a pergunta (.tr-q) e, para cada resposta, ou o nó de
  // baixo (.tr-sub) ou a folha (.tr-leaf).
  function ler(box, rotulo) {
    const no = { rotulo, pergunta: box.querySelector(":scope > .tr-q").textContent, kids: [], open: false };
    for (const d of box.querySelectorAll(":scope > .tr-ops > li > details")) {
      const r = d.querySelector(":scope > summary").textContent;
      const sub = d.querySelector(":scope > .tr-sub");
      no.kids.push(sub ? ler(sub, r) : { rotulo: r, folha: d.querySelector(":scope > .tr-leaf") });
    }
    return no;
  }
  const raiz = ler(tree, null);
  raiz.open = true;

  /* ---------------------------------------------------------------- fluxograma: caixas */

  const todos = [];
  function montar(no, pai) {
    no.pai = pai;
    todos.push(no);
    if (no.folha) {
      const f = no.folha;
      const box = el("div", "fc-node fc-t");
      box.dataset.cor = f.dataset.cor;
      box.appendChild(el("span", "fc-ans", no.rotulo));
      const a = f.querySelector(".tr-test a").cloneNode(true);
      a.title = f.querySelector(".tr-test + p").textContent;
      box.append(a, el("span", "fc-fam", f.querySelector(".tr-test span").textContent));
      f.querySelectorAll(".tr-nota, .tr-extra").forEach(p => box.appendChild(p.cloneNode(true)));
      no.el = box;
    } else {
      const b = el("button", "fc-node fc-q");
      b.type = "button";
      if (no.rotulo) b.appendChild(el("span", "fc-ans", no.rotulo));
      b.appendChild(el("span", "fc-text", no.pergunta));
      no.more = el("span", "fc-more");
      b.appendChild(no.more);
      b.addEventListener("click", () => alternar(no));
      no.el = b;
      no.kids.forEach(k => montar(k, no));
    }
    if (!pai) no.el.classList.add("fc-root");
    fc.appendChild(no.el);
  }
  montar(raiz, null);

  /* ---------------------------------------------------------------- fluxograma: layout */

  // De cima para baixo: cada nível é uma linha, com a altura da maior caixa
  // visível nele. Na horizontal, as folhas visíveis (e as perguntas
  // recolhidas) enfileiram da esquerda para a direita, e cada pergunta aberta
  // fica centrada sobre os seus filhos.
  const W = 190, GX = 16, GY = 44;
  // Seguindo um caminho, as respostas não escolhidas saem de cena: aparece o
  // caminho percorrido e, embaixo, as opções da pergunta atual. Com "Expandir
  // tudo", aparece a árvore inteira.
  let tudo = false;
  const escolhida = (pai, k) => tudo || !pai.kids.some(o => o !== k && o.open);
  const visivel = no => !no.pai || (no.pai.open && escolhida(no.pai, no) && visivel(no.pai));
  const abertos = no => (no.kids && no.open ? no.kids.filter(k => !k.el.hidden) : []);

  function desenhar() {
    for (const no of todos) no.el.hidden = !visivel(no);
    for (const no of todos) {
      if (!no.kids) continue;
      no.el.setAttribute("aria-expanded", String(no.open));
      no.more.textContent = !no.open ? TXT.caminhos(no.kids.length)
        : !no.pai || tudo ? TXT.recolher : TXT.trocar;
    }

    const alturas = [];
    const medir = (no, nivel) => {
      no.nivel = nivel;
      no.h = no.el.offsetHeight;
      alturas[nivel] = Math.max(alturas[nivel] || 0, no.h);
      abertos(no).forEach(k => medir(k, nivel + 1));
    };
    medir(raiz, 0);
    const topo = [0];
    alturas.forEach((h, n) => { topo[n + 1] = topo[n] + h + GY; });

    let cursor = 0;
    const posicionar = no => {
      no.y = topo[no.nivel];
      const kids = abertos(no);
      if (kids.length) {
        kids.forEach(posicionar);
        no.x = (kids[0].x + kids[kids.length - 1].x) / 2;
      } else {
        no.x = cursor;
        cursor += W + GX;
      }
    };
    posicionar(raiz);

    fc.style.width = `${cursor - GX}px`;
    fc.style.height = `${topo[alturas.length] - GY}px`;
    for (const no of todos) {
      if (no.el.hidden) continue;
      no.el.style.left = `${no.x}px`;
      no.el.style.top = `${no.y}px`;
    }

    // Setas em ângulo reto: descem do meio da base do pai até o meio do vão
    // entre as linhas, correm na horizontal e descem ao meio do topo do filho.
    svg.querySelectorAll("path.fc-edge").forEach(p => p.remove());
    for (const no of todos) {
      if (no.el.hidden) continue;
      const x1 = no.x + W / 2, y1 = no.y + no.h, ym = topo[no.nivel + 1] - GY / 2;
      for (const k of abertos(no)) {
        const p = document.createElementNS(SVG, "path");
        p.setAttribute("class", "fc-edge");
        p.setAttribute("d", `M${x1} ${y1} V${ym} H${k.x + W / 2} V${k.y - 2}`);
        p.setAttribute("marker-end", "url(#fc-seta)");
        svg.appendChild(p);
      }
    }
    aplicarZoom();
  }

  /* ---------------------------------------------------------------- fluxograma: zoom */

  // O .fc é desenhado em tamanho real e encolhido ou ampliado com transform;
  // em volta dele, o .fc-sizer tem o tamanho já escalado, para a rolagem do
  // .fc-scroll saber até onde ir. A roda do mouse sobre o fluxograma dá zoom
  // em torno do cursor, e arrastar move o desenho. No toque, fica a rolagem
  // nativa.
  const ZMIN = 0.1, ZMAX = 2;
  let zoom = 1;
  const sizer = el("div", "fc-sizer");
  fc.before(sizer);
  sizer.appendChild(fc);

  const barra = el("div", "fc-zoom");
  barra.setAttribute("role", "group");
  barra.setAttribute("aria-label", TXT.zoom);
  const botao = (texto, rotulo, acao) => {
    const b = el("button", "fd-ref", texto);
    b.type = "button";
    if (rotulo) b.setAttribute("aria-label", rotulo);
    b.addEventListener("click", acao);
    barra.appendChild(b);
    return b;
  };
  const centro = () => {
    const r = scroll.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  };
  botao("−", TXT.menos, () => zoomEm(zoom / 1.25, ...centro()));
  const pct = botao("100%", TXT.real, () => zoomEm(1, ...centro()));
  botao("+", TXT.mais, () => zoomEm(zoom * 1.25, ...centro()));
  botao(TXT.ajustar, null, ajustar);
  barra.appendChild(el("span", "fc-zoom-dica", TXT.dica));
  scroll.before(barra);

  function aplicarZoom() {
    fc.style.transform = zoom === 1 ? "" : `scale(${zoom})`;
    sizer.style.width = `${fc.offsetWidth * zoom}px`;
    sizer.style.height = `${fc.offsetHeight * zoom}px`;
    pct.textContent = `${Math.round(zoom * 100)}%`;
  }

  // Muda o zoom mantendo parado o ponto (x, y) da tela.
  function zoomEm(novo, x, y) {
    novo = Math.min(ZMAX, Math.max(ZMIN, novo));
    if (novo === zoom) return;
    const a = sizer.getBoundingClientRect();
    const px = (x - a.left) / zoom, py = (y - a.top) / zoom;
    zoom = novo;
    aplicarZoom();
    const b = sizer.getBoundingClientRect();
    scroll.scrollLeft += b.left + px * zoom - x;
    scroll.scrollTop += b.top + py * zoom - y;
  }

  function ajustar() {
    zoomEm(Math.min(1, (scroll.clientWidth - 8) / fc.offsetWidth), ...centro());
  }

  scroll.addEventListener("wheel", e => {
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomEm(zoom * Math.exp(-d * 0.0015), e.clientX, e.clientY);
  }, { passive: false });

  // Arrastar move o desenho. Só com mouse ou caneta, fora dos botões e links
  // e fora das barras de rolagem (cujo alvo é o próprio .fc-scroll). Se o
  // ponteiro andou, o clique que vem no fim do arrasto é descartado.
  let arrasto = null;
  scroll.addEventListener("pointerdown", e => {
    if (e.pointerType === "touch" || e.button !== 0 || e.target === scroll) return;
    if (e.target.closest("a")) return;
    arrasto = { x: e.clientX, y: e.clientY, l: scroll.scrollLeft, t: scroll.scrollTop, moveu: false, id: e.pointerId };
  });
  scroll.addEventListener("pointermove", e => {
    if (!arrasto || e.pointerId !== arrasto.id) return;
    const dx = e.clientX - arrasto.x, dy = e.clientY - arrasto.y;
    if (!arrasto.moveu && Math.hypot(dx, dy) < 4) return;
    if (!arrasto.moveu) {
      arrasto.moveu = true;
      scroll.setPointerCapture(e.pointerId);
      scroll.classList.add("is-arrastando");
    }
    scroll.scrollLeft = arrasto.l - dx;
    scroll.scrollTop = arrasto.t - dy;
  });
  let engolir = false;
  scroll.addEventListener("click", e => {
    if (!engolir) return;
    e.stopPropagation();
    e.preventDefault();
  }, true);
  const soltar = () => {
    if (arrasto && arrasto.moveu) {
      scroll.classList.remove("is-arrastando");
      // O clique, se vier, chega logo depois do pointerup.
      engolir = true;
      setTimeout(() => { engolir = false; });
    }
    arrasto = null;
  };
  scroll.addEventListener("pointerup", soltar);
  scroll.addEventListener("pointercancel", soltar);

  // Abrir uma pergunta fecha as outras do mesmo nível; fechar uma do caminho
  // traz de volta as alternativas dela. Depois, as caixas novas vêm à vista.
  function alternar(no) {
    tudo = false;
    no.open = !no.open;
    if (no.open && no.pai) no.pai.kids.forEach(k => { if (k !== no && k.kids) k.open = false; });
    desenhar();
    if (no.open) no.kids[0].el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /* ---------------------------------------------------------------- formato e ferramentas */

  // Fluxograma por padrão; em tela estreita, o passo a passo. A escolha fica
  // guardada neste navegador.
  let vista;
  try { vista = localStorage.getItem("mk-arvore-vista"); } catch (e) {}
  if (vista !== "fluxo" && vista !== "passos") vista = matchMedia("(max-width: 700px)").matches ? "passos" : "fluxo";

  function mostrar(v) {
    vista = v;
    scroll.hidden = v !== "fluxo";
    barra.hidden = v !== "fluxo";
    tree.hidden = v !== "passos";
    views.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.vista === v)));
    if (v === "fluxo") desenhar();
  }

  views.addEventListener("click", e => {
    const v = e.target.closest("button")?.dataset.vista;
    if (!v) return;
    mostrar(v);
    try { localStorage.setItem("mk-arvore-vista", v); } catch (err) {}
  });

  tools.addEventListener("click", e => {
    const acao = e.target.dataset.acao;
    if (!acao) return;
    const abrir = acao === "abrir";
    tree.querySelectorAll("details").forEach(d => { d.open = abrir; });
    todos.forEach(no => { if (no.kids) no.open = abrir || !no.pai; });
    tudo = abrir;
    if (vista !== "fluxo") return;
    desenhar();
    if (abrir) ajustar();
    else zoomEm(1, ...centro());
  });

  views.hidden = false;
  tools.hidden = false;
  mostrar(vista);
  // As alturas das caixas dependem da fonte: quando ela termina de carregar,
  // o layout é refeito.
  if (document.fonts) document.fonts.ready.then(() => { if (vista === "fluxo") desenhar(); });
})();
