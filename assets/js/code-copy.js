// Função para copiar o código
function copyCode(button) {
  // Encontra o bloco de código mais próximo
  const codeBlock = button.closest('.code-container').querySelector('code');
  const codeText = codeBlock.textContent;
  
  // Cria um elemento temporário para copiar o texto
  const tempElement = document.createElement('textarea');
  tempElement.value = codeText;
  document.body.appendChild(tempElement);
  
  // Seleciona e copia o texto
  tempElement.select();
  document.execCommand('copy');
  
  // Remove o elemento temporário
  document.body.removeChild(tempElement);
  
  // Feedback visual
  const icon = button.querySelector('i');
  const originalHTML = button.innerHTML;
  const originalColor = button.style.color;
  
  // Muda o ícone e a cor
  button.innerHTML = '<i class="bi bi-check" style="margin-right: 4px;"></i>Copiado!';
  button.style.color = '#4ec9b0';
  
  // Volta ao estado original após 2 segundos
  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.color = originalColor;
  }, 2000);
}

// Adiciona o evento de clique a todos os botões de cópia quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  // Adiciona o CSS para o efeito de hover
  const style = document.createElement('style');
  style.textContent = `
    .copy-button:hover {
      color: #4ec9b0 !important;
      background: none !important;
    }
    .copy-button i {
      transition: color 0.2s ease;
    }
  `;
  document.head.appendChild(style);
  
  // Adiciona os eventos de clique
  const copyButtons = document.querySelectorAll('.copy-button');
  copyButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      copyCode(this);
    });
  });
});
