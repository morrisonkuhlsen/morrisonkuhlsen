/* Comportamento da árvore de decisão. Sem JavaScript, os <details> já abrem
 * e fecham; aqui, abrir uma resposta fecha as outras do mesmo nível, para a
 * árvore andar como um passo a passo, e entram os botões de expandir tudo. */
(() => {
  const tree = document.querySelector(".tr-tree");
  const tools = document.querySelector(".tr-tools");

  // O clique no <summary> (o teclado também gera clique) vem antes de o
  // <details> mudar de estado; por isso ele, e não o evento toggle, que chega
  // depois e também dispara com o "Expandir tudo".
  tree.addEventListener("click", e => {
    const summary = e.target.closest("summary");
    if (!summary) return;
    const d = summary.parentElement;
    if (d.open) return;
    const lista = d.closest("ul");
    for (const outro of lista.querySelectorAll(":scope > li > details[open]")) outro.open = false;
    requestAnimationFrame(() => summary.scrollIntoView({ block: "nearest" }));
  });

  tools.hidden = false;
  tools.addEventListener("click", e => {
    const acao = e.target.dataset.acao;
    if (acao) tree.querySelectorAll("details").forEach(d => { d.open = acao === "abrir"; });
  });
})();
