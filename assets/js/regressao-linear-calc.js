// Calculadora de regressão linear simples (mínimos quadrados).
// Usada em /pt/analise-de-dados/regressao-linear e /en/data-analysis/linear-regression.
// O idioma vem do atributo data-lang do contêiner (#regressao-linear-calc).
// A conta usa somas centradas (Sxx = Σ(x − x̄)², Sxy = Σ(x − x̄)(y − ȳ)), mais estáveis
// em ponto flutuante que a forma Σx² − n·x̄². O passo a passo mostrado sai dos mesmos números.

(function () {
  'use strict';

  var LIMITE = 1e12; // valores maiores que isso são recusados (perda de precisão)

  // Conta pura, sem DOM: testada em Node contra Julia/GLM.
  function calcular(pares) {
    var n = pares.length;
    if (n < 2) return { erro: 'poucos' };
    var somaX = 0, somaY = 0;
    for (var i = 0; i < n; i++) { somaX += pares[i][0]; somaY += pares[i][1]; }
    var mediaX = somaX / n, mediaY = somaY / n;
    var Sxx = 0, Sxy = 0, Syy = 0, minX = Infinity, maxX = -Infinity;
    for (var j = 0; j < n; j++) {
      var dx = pares[j][0] - mediaX, dy = pares[j][1] - mediaY;
      Sxx += dx * dx; Sxy += dx * dy; Syy += dy * dy;
      if (pares[j][0] < minX) minX = pares[j][0];
      if (pares[j][0] > maxX) maxX = pares[j][0];
    }
    // Todos os X iguais (a menos de arredondamento): a inclinação não existe.
    if (maxX - minX <= 1e-12 * Math.max(1, Math.abs(maxX), Math.abs(minX))) return { erro: 'xIguais' };
    var b = Sxy / Sxx;
    var a = mediaY - b * mediaX;
    var SQres = 0;
    for (var k = 0; k < n; k++) {
      var e = pares[k][1] - (a + b * pares[k][0]);
      SQres += e * e;
    }
    // R² não é definido quando todos os Y são iguais (Syy = 0).
    var R2 = Syy > 0 ? Math.min(1, Math.max(0, 1 - SQres / Syy)) : null;
    return { n: n, mediaX: mediaX, mediaY: mediaY, Sxx: Sxx, Sxy: Sxy, Syy: Syy,
             b: b, a: a, SQres: SQres, R2: R2, minX: minX, maxX: maxX };
  }

  var TEXTOS = {
    pt: {
      locale: 'pt-BR', remover: 'Remover', removerPar: 'Remover o par',
      poucos: 'Insira pelo menos dois pares (X, Y).',
      xIguais: 'Todos os valores de X são iguais: não existe reta de regressão (a inclinação seria uma divisão por zero, Sxx = 0). Inclua um par com X diferente.',
      invalido: 'Digite números válidos em X e Y.',
      grande: 'Valor grande demais (use números com valor absoluto até 10¹²).',
      equacao: 'Reta ajustada', passos: 'Passo a passo',
      r2: 'R²', r2nd: 'não definido (todos os Y são iguais)',
      previsao: 'Previsão para X =', extrapola: 'Atenção: X está fora do intervalo observado',
      extrapola2: 'a previsão é uma extrapolação e pode não valer.',
      dois: 'Com só dois pontos, a reta passa exatamente por eles; não há como avaliar o ajuste.',
      vazio: 'Nenhum par.'
    },
    en: {
      locale: 'en-US', remover: 'Remove', removerPar: 'Remove the pair',
      poucos: 'Enter at least two (X, Y) pairs.',
      xIguais: 'All X values are equal: there is no regression line (the slope would be a division by zero, Sxx = 0). Add a pair with a different X.',
      invalido: 'Enter valid numbers for X and Y.',
      grande: 'Value too large (use numbers with absolute value up to 10¹²).',
      equacao: 'Fitted line', passos: 'Step by step',
      r2: 'R²', r2nd: 'undefined (all Y values are equal)',
      previsao: 'Prediction for X =', extrapola: 'Warning: X is outside the observed range',
      extrapola2: 'the prediction is an extrapolation and may not hold.',
      dois: 'With only two points, the line passes exactly through them; the fit cannot be assessed.',
      vazio: 'No pairs.'
    }
  };

  var EXEMPLO = [[5, 6], [7, 7], [8, 7.5], [10, 8], [12, 8.5], [15, 9], [18, 9.5], [20, 10]];

  function iniciar() {
    var raiz = document.getElementById('regressao-linear-calc');
    if (!raiz) return;
    var T = TEXTOS[raiz.getAttribute('data-lang')] || TEXTOS.pt;
    var formato = new Intl.NumberFormat(T.locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    var formatoLivre = new Intl.NumberFormat(T.locale, { maximumFractionDigits: 6 });
    function f(v) { return formato.format(Math.abs(v) < 5e-5 ? 0 : v); }
    function fl(v) { return formatoLivre.format(v); }

    var pares = EXEMPLO.map(function (p) { return p.slice(); });
    var corpo = document.getElementById('rl-tabela-corpo');
    var resultado = document.getElementById('rl-resultado');
    var aviso = document.getElementById('rl-aviso');
    var campoPrev = document.getElementById('rl-prev-x');

    function escapar(t) { return String(t).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

    function desenharTabela() {
      corpo.innerHTML = '';
      if (!pares.length) {
        corpo.innerHTML = '<tr><td colspan="3">' + T.vazio + '</td></tr>';
        return;
      }
      pares.forEach(function (p, i) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + escapar(fl(p[0])) + '</td><td>' + escapar(fl(p[1])) + '</td>' +
          '<td><button type="button" class="rl-remover" data-i="' + i + '" aria-label="' +
          escapar(T.removerPar + ' (' + fl(p[0]) + '; ' + fl(p[1]) + ')') + '">' + T.remover + '</button></td>';
        corpo.appendChild(tr);
      });
    }

    function desenharResultado() {
      var r = calcular(pares);
      if (r.erro) { resultado.innerHTML = '<p>' + T[r.erro] + '</p>'; return; }
      var sinal = r.b < 0 ? ' − ' : ' + ';
      var html = '<p><strong>' + T.equacao + ':</strong> Ŷ = ' + f(r.a) + sinal + f(Math.abs(r.b)) + ' · X</p>';
      html += '<p><strong>' + T.r2 + ':</strong> ' + (r.R2 === null ? T.r2nd : f(r.R2)) + '</p>';
      if (r.n === 2) html += '<p>' + T.dois + '</p>';
      var xs = campoPrev.value.trim();
      if (xs !== '') {
        var x = Number(xs);
        if (isFinite(x) && Math.abs(x) <= LIMITE) {
          html += '<p><strong>' + T.previsao + ' ' + escapar(fl(x)) + ':</strong> Ŷ = ' + f(r.a + r.b * x) + '</p>';
          if (x < r.minX || x > r.maxX) {
            html += '<p>' + T.extrapola + ' [' + fl(r.minX) + (T.locale === 'pt-BR' ? '; ' : ', ') + fl(r.maxX) + ']: ' + T.extrapola2 + '</p>';
          }
        } else {
          html += '<p>' + T.invalido + '</p>';
        }
      }
      html += '<details><summary>' + T.passos + '</summary><ol>' +
        '<li>n = ' + r.n + '; x̄ = ' + f(r.mediaX) + '; ȳ = ' + f(r.mediaY) + '</li>' +
        '<li>Sxx = Σ(x − x̄)² = ' + f(r.Sxx) + '</li>' +
        '<li>Sxy = Σ(x − x̄)(y − ȳ) = ' + f(r.Sxy) + '</li>' +
        '<li>b = Sxy / Sxx = ' + f(r.Sxy) + ' / ' + f(r.Sxx) + ' = ' + f(r.b) + '</li>' +
        '<li>a = ȳ − b · x̄ = ' + f(r.mediaY) + ' − ' + f(r.b) + ' · ' + f(r.mediaX) + ' = ' + f(r.a) + '</li>' +
        '<li>Syy = Σ(y − ȳ)² = ' + f(r.Syy) + '; SQres = Σ(y − ŷ)² = ' + f(r.SQres) +
        (r.R2 === null ? '' : '; R² = 1 − SQres / Syy = ' + f(r.R2)) + '</li>' +
        '</ol></details>';
      resultado.innerHTML = html;
    }

    function atualizar() { desenharTabela(); desenharResultado(); }

    document.getElementById('rl-form-adicionar').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var x = Number(document.getElementById('rl-x').value);
      var y = Number(document.getElementById('rl-y').value);
      var vx = document.getElementById('rl-x').value.trim(), vy = document.getElementById('rl-y').value.trim();
      if (vx === '' || vy === '' || !isFinite(x) || !isFinite(y)) { aviso.textContent = T.invalido; return; }
      if (Math.abs(x) > LIMITE || Math.abs(y) > LIMITE) { aviso.textContent = T.grande; return; }
      aviso.textContent = '';
      pares.push([x, y]);
      this.reset();
      atualizar();
      document.getElementById('rl-x').focus();
    });

    corpo.addEventListener('click', function (ev) {
      var alvo = ev.target.closest('.rl-remover');
      if (!alvo) return;
      pares.splice(Number(alvo.getAttribute('data-i')), 1);
      atualizar();
    });

    document.getElementById('rl-restaurar').addEventListener('click', function () {
      pares = EXEMPLO.map(function (p) { return p.slice(); });
      aviso.textContent = '';
      atualizar();
    });

    campoPrev.addEventListener('input', desenharResultado);
    atualizar();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calcular: calcular };
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
