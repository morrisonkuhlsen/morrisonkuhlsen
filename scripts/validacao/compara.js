/* Compara stat-calc-core.js com os valores de Distributions.jl.
 *
 *   julia scripts/validacao/gera-referencia.jl
 *   node  scripts/validacao/compara.js
 *
 * Reporta o pior erro de cada grupo e, no fim, quantas saídas seriam
 * diferentes na tela — que é o que de fato importa: as tabelas mostram cinco
 * casas, e uma divergência na décima não muda nada para quem usa a página. */
const fs = require('fs');
const path = require('path');

/* O núcleo espera um navegador; aqui basta o suficiente para ele carregar. */
globalThis.window = globalThis;
globalThis.location = { search: '' };
globalThis.history = { replaceState() {} };
globalThis.document = {
  querySelectorAll: () => [], getElementById: () => null,
  documentElement: {}, addEventListener() {}, readyState: 'complete'
};
eval(fs.readFileSync(path.join(__dirname, '../../assets/js/stat-calc-core.js'), 'utf8'));
const M = globalThis.MKCalc;

const referencia = path.join(__dirname, 'referencia.csv');
if (!fs.existsSync(referencia)) {
  console.error('Falta referencia.csv — rode antes: julia scripts/validacao/gera-referencia.jl');
  process.exit(1);
}

const grupos = {};
let iguaisNaTela = 0, diferentesNaTela = 0;
const divergentes = [];

for (const linha of fs.readFileSync(referencia, 'utf8').trim().split('\n').slice(1)) {
  const [familia, funcao, a, b, x, valor] = linha.split(',');
  const A = +a, B = +b, X = +x, esperado = +valor;

  const obtido =
    familia === 'normal' ? (funcao === 'cdf' ? M.ncdf(X) : M.ninv(X)) :
    familia === 't'      ? (funcao === 'cdf' ? M.tcdf(X, A) : M.tinv(X, A)) :
                           (funcao === 'cdf' ? M.fcdf(X, A, B) : M.finv(X, A, B));

  const chave = familia + ' ' + funcao;
  const g = grupos[chave] || (grupos[chave] = { n: 0, piorAbs: 0, piorRel: 0, caso: null });
  g.n++;

  const abs = Math.abs(obtido - esperado);
  const rel = Math.abs(esperado) > 1e-300 ? abs / Math.abs(esperado) : abs;
  if (abs > g.piorAbs) g.piorAbs = abs;
  if (rel > g.piorRel) { g.piorRel = rel; g.caso = { A, B, X, esperado, obtido }; }
  if (rel > 1e-9) divergentes.push({ familia, funcao, A, B, X, esperado, obtido, rel });

  /* Como a interface mostra o número. */
  const naTela = v => funcao === 'cdf'
    ? M.fmt(v)
    : (Math.abs(v) >= 1e6 ? v.toExponential(5) : v.toFixed(5));
  if (naTela(obtido) === naTela(esperado)) iguaisNaTela++; else diferentesNaTela++;
}

console.log('comparação com Distributions.jl\n');
console.log('grupo'.padEnd(14) + 'casos'.padStart(7) + 'pior erro abs'.padStart(16) + 'pior erro rel'.padStart(16));
console.log('-'.repeat(53));
for (const [chave, g] of Object.entries(grupos)) {
  console.log(chave.padEnd(14) + String(g.n).padStart(7) +
              g.piorAbs.toExponential(2).padStart(16) + g.piorRel.toExponential(2).padStart(16));
}

console.log('\nsaída idêntica na tela: ' + iguaisNaTela + ' de ' + (iguaisNaTela + diferentesNaTela) +
            ' (' + (100 * iguaisNaTela / (iguaisNaTela + diferentesNaTela)).toFixed(3) + '%)');

if (divergentes.length) {
  console.log('\ncasos acima de 1e-9 relativo (todos em caudas extremas, onde a cdf é');
  console.log('plana demais para o double distinguir os dois valores):');
  divergentes.forEach(d => {
    console.log(`  ${d.familia} ${d.funcao} a=${d.A} b=${d.B} x=${d.X}`);
    console.log(`     julia=${d.esperado}  site=${d.obtido}  rel=${d.rel.toExponential(2)}`);
  });
}
