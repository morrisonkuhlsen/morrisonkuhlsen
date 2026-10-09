/* Página de um teste (/testes-estatisticos/<id>/): o HTML já vem pronto do
 * Jekyll; aqui as fórmulas viram KaTeX e os blocos de código ganham o botão
 * de copiar. Sem JavaScript, fica o LaTeX em texto e o código para selecionar.
 * Serve às duas línguas, pelo lang da página. */
(() => {
  const en = document.documentElement.lang.startsWith("en");
  const COPIADO = en ? "Copied" : "Copiado";
  const COPIE = en ? "Select and copy" : "Selecione e copie";
  document.querySelectorAll(".fd-tex[data-tex]").forEach(node => {
    if (window.katex) katex.render(`\\displaystyle ${node.dataset.tex}`, node, { throwOnError: false });
  });

  document.querySelectorAll(".fd-code").forEach(bloco => {
    const copiar = bloco.querySelector("button");
    const texto = bloco.querySelector("code").textContent;
    copiar.hidden = false;
    copiar.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(texto);
        copiar.textContent = COPIADO;
      } catch {
        copiar.textContent = COPIE;
      }
    });
  });
})();
