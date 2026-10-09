/* Comportamento da árvore de decisão.
 *
 * O HTML traz a árvore em <details> aninhados, gerada pelo Jekyll: é o modo
 * "passo a passo", que funciona sem JavaScript. Daqui sai o modo fluxograma,
 * lido desse mesmo HTML (não há outra cópia dos dados): caixas da esquerda
 * para a direita, ligadas por setas. Cada caixa leva no alto a resposta que
 * conduz a ela; uma pergunta abre e recolhe os caminhos que saem dela, e as
 * folhas são os testes, na cor da família. */
(() => {
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
      b.addEventListener("click", () => { no.open = !no.open; desenhar(); });
      no.el = b;
      no.kids.forEach(k => montar(k, no));
    }
    if (!pai) no.el.classList.add("fc-root");
    fc.appendChild(no.el);
  }
  montar(raiz, null);

  /* ---------------------------------------------------------------- fluxograma: layout */

  // Layout de árvore da esquerda para a direita: cada coluna é um nível; as
  // folhas visíveis (e as perguntas recolhidas) empilham de cima para baixo,
  // e cada pergunta aberta fica centrada na altura dos seus filhos.
  const W = 230, GX = 64, GY = 14;
  const visivel = no => !no.pai || (no.pai.open && visivel(no.pai));

  function desenhar() {
    for (const no of todos) {
      no.el.hidden = !visivel(no);
      if (no.kids) {
        no.el.setAttribute("aria-expanded", String(no.open));
        no.more.textContent = no.open ? "− recolher" : `+ ${no.kids.length} caminhos`;
      }
    }

    let cursor = 0, fundo = 0;
    const descer = (no, dy) => {
      no.y += dy;
      if (no.kids && no.open) no.kids.forEach(k => descer(k, dy));
    };
    const posicionar = (no, nivel) => {
      no.x = nivel * (W + GX);
      no.h = no.el.offsetHeight;
      fundo = Math.max(fundo, no.x + W);
      const inicio = cursor;
      if (no.kids && no.open) {
        no.kids.forEach(k => posicionar(k, nivel + 1));
        const a = no.kids[0], z = no.kids[no.kids.length - 1];
        no.y = (a.y + a.h / 2 + z.y + z.h / 2) / 2 - no.h / 2;
        if (no.y < inicio) {
          no.kids.forEach(k => descer(k, inicio - no.y));
          cursor += inicio - no.y;
          no.y = inicio;
        }
        cursor = Math.max(cursor, no.y + no.h + GY);
      } else {
        no.y = cursor;
        cursor += no.h + GY;
      }
    };
    posicionar(raiz, 0);

    fc.style.width = `${fundo}px`;
    fc.style.height = `${cursor - GY}px`;
    for (const no of todos) {
      if (no.el.hidden) continue;
      no.el.style.left = `${no.x}px`;
      no.el.style.top = `${no.y}px`;
    }

    // Setas em ângulo reto: saem do meio da direita do pai, dobram no meio do
    // vão entre as colunas e chegam ao meio da esquerda do filho.
    svg.querySelectorAll("path.fc-edge").forEach(p => p.remove());
    for (const no of todos) {
      if (!no.kids || !no.open || no.el.hidden) continue;
      const x1 = no.x + W, y1 = no.y + no.h / 2, xm = x1 + GX / 2;
      for (const k of no.kids) {
        const p = document.createElementNS(SVG, "path");
        p.setAttribute("class", "fc-edge");
        p.setAttribute("d", `M${x1} ${y1} H${xm} V${k.y + k.h / 2} H${k.x - 2}`);
        p.setAttribute("marker-end", "url(#fc-seta)");
        svg.appendChild(p);
      }
    }
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
    if (vista === "fluxo") desenhar();
  });

  views.hidden = false;
  tools.hidden = false;
  mostrar(vista);
  // As alturas das caixas dependem da fonte: quando ela termina de carregar,
  // o layout é refeito.
  if (document.fonts) document.fonts.ready.then(() => { if (vista === "fluxo") desenhar(); });
})();
