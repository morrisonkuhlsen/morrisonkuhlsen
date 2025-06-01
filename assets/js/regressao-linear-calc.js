// Calculadora de Regressão Linear Simples
// Permite inserir pares (X, Y), calcular a reta e prever valores

function calcularRegressaoLinear(pares) {
  const n = pares.length;
  if (n < 2) return null;
  let somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;
  for (const [x, y] of pares) {
    somaX += x;
    somaY += y;
    somaXY += x * y;
    somaX2 += x * x;
  }
  const mediaX = somaX / n;
  const mediaY = somaY / n;
  const b = (somaXY - n * mediaX * mediaY) / (somaX2 - n * mediaX * mediaX);
  const a = mediaY - b * mediaX;
  return { a, b };
}

function atualizarTabela() {
  const tbody = document.getElementById('rl-tabela-corpo');
  tbody.innerHTML = '';
  pares.forEach(([x, y], i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${x}</td><td>${y}</td><td><button type="button" class="rl-remover" data-i="${i}">Remover</button></td>`;
    tbody.appendChild(tr);
  });
}

function atualizarResultado() {
  const resultado = document.getElementById('rl-resultado');
  const prevInput = document.getElementById('rl-prev-x');
  if (pares.length < 2) {
    resultado.innerHTML = '<span style="color:#c00">Insira pelo menos dois pares (X, Y).</span>';
    prevInput.disabled = true;
    return;
  }
  const { a, b } = calcularRegressaoLinear(pares);
  let html = `<b>Equação da reta:</b> <span style="color:#4ec9b0">Y = ${a.toFixed(4)} + ${b.toFixed(4)} X</span><br>`;
  if (prevInput.value !== '') {
    const x = parseFloat(prevInput.value);
    if (!isNaN(x)) {
      const y = a + b * x;
      html += `<b>Previsão para X = ${x}:</b> <span style="color:#4ec9b0">Y = ${y.toFixed(4)}</span>`;
    }
  }
  resultado.innerHTML = html;
  prevInput.disabled = false;
}

// Estado global dos pares
let pares = [
  [5, 6], [7, 7], [8, 7.5], [10, 8], [12, 8.5], [15, 9], [18, 9.5], [20, 10]
];

document.addEventListener('DOMContentLoaded', function() {
  atualizarTabela();
  atualizarResultado();

  document.getElementById('rl-form-adicionar').addEventListener('submit', function(e) {
    e.preventDefault();
    const x = parseFloat(document.getElementById('rl-x').value);
    const y = parseFloat(document.getElementById('rl-y').value);
    if (!isNaN(x) && !isNaN(y)) {
      pares.push([x, y]);
      atualizarTabela();
      atualizarResultado();
      this.reset();
    }
  });

  document.getElementById('rl-tabela-corpo').addEventListener('click', function(e) {
    if (e.target.classList.contains('rl-remover')) {
      const i = parseInt(e.target.getAttribute('data-i'));
      pares.splice(i, 1);
      atualizarTabela();
      atualizarResultado();
    }
  });

  document.getElementById('rl-prev-x').addEventListener('input', atualizarResultado);
}); 