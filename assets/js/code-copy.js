// =========================
// CODE COPY + LINE NUMBERS
// =========================

// Adiciona numeração automática nas linhas dos blocos de código
function addCodeLineNumbers() {
  document.querySelectorAll(".code-content code").forEach(function (code) {
    if (code.dataset.linesReady === "true") return;

    // Guarda o texto original para copiar depois sem números de linha
    const originalText = code.textContent.replace(/\n$/, "");
    code.dataset.rawCode = originalText;

    // Mantém o HTML com as cores da sintaxe
    const html = code.innerHTML.replace(/\n$/, "");
    const lines = html.split("\n");

    code.innerHTML = lines
      .map(function (line) {
        return `<span class="code-line">${line || "&nbsp;"}</span>`;
      })
      .join("");

    code.dataset.linesReady = "true";
  });
}

// Pega o texto real do código, sem os números das linhas
function getCodeText(codeBlock) {
  if (codeBlock.dataset.rawCode) {
    return codeBlock.dataset.rawCode;
  }

  const lines = codeBlock.querySelectorAll(".code-line");

  if (lines.length > 0) {
    return Array.from(lines)
      .map(function (line) {
        const text = line.textContent.replace(/\u00a0/g, "");
        return text;
      })
      .join("\n");
  }

  return codeBlock.textContent;
}

// Função para copiar o código
function copyCode(button) {
  const codeBlock = button.closest(".code-container").querySelector("code");
  const codeText = getCodeText(codeBlock);

  function showCopiedFeedback() {
    button.classList.add("is-copied");
    button.setAttribute("aria-label", "Copiado!");

    setTimeout(function () {
      button.classList.remove("is-copied");
      button.setAttribute("aria-label", "Copiar código");
    }, 2000);
  }

  // Método moderno
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(codeText).then(showCopiedFeedback);
    return;
  }

  // Método antigo/fallback
  const tempElement = document.createElement("textarea");
  tempElement.value = codeText;
  tempElement.setAttribute("readonly", "");
  tempElement.style.position = "fixed";
  tempElement.style.left = "-9999px";
  tempElement.style.top = "-9999px";

  document.body.appendChild(tempElement);
  tempElement.select();
  document.execCommand("copy");
  document.body.removeChild(tempElement);

  showCopiedFeedback();
}

// Carrega tudo quando a página abrir
document.addEventListener("DOMContentLoaded", function () {
  addCodeLineNumbers();

  document.querySelectorAll(".copy-button").forEach(function (button) {
    // Evita duplicar evento caso o botão já tenha onclick no HTML
    if (button.hasAttribute("onclick")) return;

    button.addEventListener("click", function (e) {
      e.preventDefault();
      copyCode(this);
    });
  });
});