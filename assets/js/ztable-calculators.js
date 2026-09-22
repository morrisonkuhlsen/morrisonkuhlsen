/* Calculadoras da página da tabela Z: p-valor a partir de um z, probabilidade
   entre dois z e z a partir de um valor bruto. Sem dependências — a página
   inteira é HTML solto, e uma biblioteca de gráficos custaria mais do que os
   três desenhos que fazemos aqui.

   Os valores não saem da tabela: são calculados pela normal padrão, então
   valem para qualquer z, inclusive os que a tabela não lista. */
(function () {
  'use strict';

  /* ── Normal padrão ───────────────────────────────────────────────────────
     erfc pela aproximação de Chebyshev do Numerical Recipes: erro relativo da
     ordem de 1e-15, bem além das cinco casas que a tabela mostra, e que não
     desmorona na cauda — é lá que uma aproximação grosseira erraria feio. */
  var COF = [-1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
             -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
             4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
             1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8,
             6.529054439e-9, 5.059343495e-9, -9.91364156e-10, -2.27365122e-10,
             9.6467911e-11, 2.394038e-12, -6.886027e-12, 8.94487e-13,
             3.13092e-13, -1.12708e-13, 3.81e-16, 7.106e-15];

  function erfc(x) {
    var z = Math.abs(x);
    var t = 2 / (2 + z);
    var ty = 4 * t - 2;
    var d = 0, dd = 0, tmp;
    for (var j = COF.length - 1; j > 0; j--) {
      tmp = d;
      d = ty * d - dd + COF[j];
      dd = tmp;
    }
    var ans = t * Math.exp(-z * z + 0.5 * (COF[0] + ty * d) - dd);
    return x >= 0 ? ans : 2 - ans;
  }

  /* P(Z < z). O caso z = 0 é devolvido exato: a aproximação erra por ~1e-15
     ali, e diferenças como P(0 < Z < z) subtraem 0,5 — o resíduo apareceria
     na tela como 7.772e-16, ou como uma probabilidade negativa. */
  function cdf(z) {
    if (z === 0) return 0.5;
    return 0.5 * erfc(-z / Math.SQRT2);
  }

  /* Probabilidade não passa de [0, 1]: apara o que sobra do arredondamento. */
  function limitar(p) {
    return Math.min(1, Math.max(0, p));
  }

  /* Densidade, só para desenhar a curva. */
  function pdf(z) {
    return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  }

  /* ── Formatação ──────────────────────────────────────────────────────────
     Cinco casas, como a tabela. Abaixo disso o arredondamento viraria 0.00000
     e esconderia justamente o que interessa numa cauda, então vai em notação
     científica. */
  function fmt(p) {
    if (!isFinite(p)) return '—';
    p = limitar(p);
    if (p === 0) return '0.00000';
    if (p < 1e-5) return p.toExponential(3);
    return p.toFixed(5);
  }

  /* ── Notação ─────────────────────────────────────────────────────────────
     KaTeX quando ele carrega; se não carregar, o que já está no HTML (ou o
     texto simples que passamos) continua legível. Nada aqui depende dele. */
  function tex(el, expressao, alternativa) {
    if (!el) return;
    if (window.katex) {
      try {
        window.katex.render(expressao, el, { throwOnError: false, displayMode: false });
        return;
      } catch (e) { /* cai no texto simples */ }
    }
    el.textContent = alternativa || expressao;
  }

  /* Números dentro da fórmula: sem casas sobrando, para a expressão não virar
     uma parede de zeros. */
  function enxuto(v) {
    return String(Math.round(v * 1e6) / 1e6);
  }

  /* ── Desenho ─────────────────────────────────────────────────────────────
     Uma curva de −4 a 4 com as faixas pedidas preenchidas. O mesmo desenho
     serve ao painel grande e às miniaturas da lista: muda só o tamanho. */
  var X0 = -4, X1 = 4, PASSOS = 160;

  function plot(largura, altura, faixas, marcas, mini) {
    var padLado = mini ? 2 : 14;
    var padBaixo = mini ? 4 : 18;
    var padTopo = mini ? 3 : 10;
    var w = largura - padLado * 2;
    var h = altura - padBaixo - padTopo;
    var yMax = pdf(0);

    var px = function (x) { return padLado + (x - X0) / (X1 - X0) * w; };
    var py = function (y) { return padTopo + h - (y / yMax) * h; };

    var svg = '';

    /* Faixas primeiro, para a curva ficar por cima da área. */
    (faixas || []).forEach(function (faixa) {
      var de = Math.max(faixa[0], X0), ate = Math.min(faixa[1], X1);
      if (!(ate > de)) return;
      var d = 'M ' + px(de).toFixed(2) + ' ' + py(0).toFixed(2);
      var n = Math.max(2, Math.round((ate - de) / (X1 - X0) * PASSOS));
      for (var i = 0; i <= n; i++) {
        var x = de + (ate - de) * i / n;
        d += ' L ' + px(x).toFixed(2) + ' ' + py(pdf(x)).toFixed(2);
      }
      d += ' L ' + px(ate).toFixed(2) + ' ' + py(0).toFixed(2) + ' Z';
      svg += '<path class="calc-plot__area" d="' + d + '"/>';
    });

    var curva = '';
    for (var k = 0; k <= PASSOS; k++) {
      var xv = X0 + (X1 - X0) * k / PASSOS;
      curva += (k ? ' L ' : 'M ') + px(xv).toFixed(2) + ' ' + py(pdf(xv)).toFixed(2);
    }
    svg += '<path class="calc-plot__curve" d="' + curva + '"/>';
    svg += '<line class="calc-plot__axis" x1="' + px(X0) + '" y1="' + py(0) +
           '" x2="' + px(X1) + '" y2="' + py(0) + '"/>';

    if (!mini) {
      [-3, -2, -1, 0, 1, 2, 3].forEach(function (t) {
        svg += '<line class="calc-plot__tick" x1="' + px(t) + '" y1="' + py(0) +
               '" x2="' + px(t) + '" y2="' + (py(0) + 4) + '"/>';
        svg += '<text class="calc-plot__label" x="' + px(t) + '" y="' + (py(0) + 14) +
               '" text-anchor="middle">' + t + '</text>';
      });

      (marcas || []).forEach(function (m) {
        if (m < X0 || m > X1) return;
        svg += '<line class="calc-plot__mark" x1="' + px(m).toFixed(2) + '" y1="' + py(0) +
               '" x2="' + px(m).toFixed(2) + '" y2="' + py(pdf(m)).toFixed(2) + '"/>';
      });
    }

    return svg;
  }

  function pintar(el, faixas, marcas) {
    if (!el) return;
    var mini = el.classList.contains('calc-plot--mini');
    var vb = el.getAttribute('viewBox').split(/\s+/);
    el.innerHTML = plot(+vb[2], +vb[3], faixas, marcas, mini);
  }

  function num(el, padrao) {
    var v = parseFloat(el.value);
    return isNaN(v) ? padrao : v;
  }

  /* Prende um campo numérico ao seu slider, nos dois sentidos. */
  function parear(campo, slider, aoMudar) {
    campo.addEventListener('input', function () {
      if (slider && campo.value !== '') slider.value = campo.value;
      aoMudar();
    });
    if (slider) {
      slider.addEventListener('input', function () {
        campo.value = slider.value;
        aoMudar();
      });
    }
  }

  /* Cada linha da lista: rótulo, valor e a miniatura da área correspondente. */
  function linhas(lista, itens) {
    lista.innerHTML = itens.map(function (item, i) {
      return '<li class="calc-row" data-i="' + i + '" tabindex="0" role="button">' +
               '<span class="calc-row__label"></span>' +
               '<span class="calc-row__value">' + fmt(item.p) + '</span>' +
               '<svg class="calc-plot calc-plot--mini" viewBox="0 0 54 26" aria-hidden="true"></svg>' +
             '</li>';
    }).join('');

    lista.querySelectorAll('.calc-row').forEach(function (li, i) {
      tex(li.querySelector('.calc-row__label'), itens[i].tex, itens[i].texto);
      pintar(li.querySelector('svg'), itens[i].faixas, []);
    });
  }

  function copiar(botao, texto) {
    var confirmar = function () {
      botao.classList.add('is-done');
      setTimeout(function () { botao.classList.remove('is-done'); }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(confirmar, function () {});
    }
  }

  /* ── 1. p-valor a partir de um z ─────────────────────────────────────────
     A lista traz as cinco leituras de uma vez, porque na prática a dúvida não
     é "qual é a área", é "qual delas o meu teste pede". Clicar numa promove-a
     ao painel grande. */
  function pvalor() {
    var raiz = document.getElementById('calc-pvalue');
    if (!raiz) return;

    var campo = raiz.querySelector('[data-campo]');
    var slider = raiz.querySelector('[data-slider]');
    var valor = raiz.querySelector('[data-valor]');
    var legenda = raiz.querySelector('[data-legenda]');
    var grafico = raiz.querySelector('[data-plot]');
    var lista = raiz.querySelector('[data-linhas]');
    var botao = raiz.querySelector('[data-copiar]');
    var escolhida = 0;

    function itens(z) {
      var a = Math.abs(z);
      var n = enxuto(z), na = enxuto(a);
      return [
        { texto: 'P(Z < z)', tex: 'P(Z<z)',
          texNum: 'P(Z<' + n + ')=\\Phi(' + n + ')',
          p: limitar(cdf(z)), faixas: [[X0, z]], marcas: [z] },
        { texto: 'P(Z > z)', tex: 'P(Z>z)',
          texNum: 'P(Z>' + n + ')=1-\\Phi(' + n + ')',
          p: limitar(1 - cdf(z)), faixas: [[z, X1]], marcas: [z] },
        { texto: 'P(0 < Z < z)', tex: 'P(0<Z<z)',
          texNum: 'P(0<Z<' + n + ')=\\left|\\Phi(' + n + ')-\\tfrac{1}{2}\\right|',
          p: limitar(Math.abs(cdf(z) - 0.5)),
          faixas: [[Math.min(0, z), Math.max(0, z)]], marcas: [0, z] },
        { texto: 'P(-|z| < Z < |z|)', tex: 'P(-|z|<Z<|z|)',
          texNum: 'P(-' + na + '<Z<' + na + ')=2\\Phi(' + na + ')-1',
          p: limitar(1 - 2 * cdf(-a)), faixas: [[-a, a]], marcas: [-a, a] },
        { texto: 'P(Z < -|z| or Z > |z|)', tex: 'P(Z<-|z|\\ \\text{or}\\ Z>|z|)',
          texNum: 'P(|Z|>' + na + ')=2\\left[1-\\Phi(' + na + ')\\right]',
          p: limitar(2 * cdf(-a)), faixas: [[X0, -a], [a, X1]], marcas: [-a, a] }
      ];
    }

    function atualizar() {
      var z = num(campo, 0);
      var its = itens(z);
      linhas(lista, its);
      marcar();

      var it = its[escolhida];
      valor.textContent = fmt(it.p);
      tex(legenda, it.texNum, it.texto);
      pintar(grafico, it.faixas, it.marcas);
      raiz.dataset.copia = 'z = ' + z + '\n' + its.map(function (i) {
        return i.texto + ' = ' + fmt(i.p);
      }).join('\n');
    }

    function marcar() {
      lista.querySelectorAll('.calc-row').forEach(function (li) {
        li.classList.toggle('is-on', +li.dataset.i === escolhida);
      });
    }

    lista.addEventListener('click', function (e) {
      var li = e.target.closest('.calc-row');
      if (!li) return;
      escolhida = +li.dataset.i;
      atualizar();
    });

    lista.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var li = e.target.closest('.calc-row');
      if (!li) return;
      e.preventDefault();
      escolhida = +li.dataset.i;
      atualizar();
    });

    if (botao) botao.addEventListener('click', function () { copiar(botao, raiz.dataset.copia); });

    parear(campo, slider, atualizar);
    atualizar();

    /* A tabela alimenta a calculadora: clicar numa célula traz o z para cá. */
    document.addEventListener('mk:z-escolhido', function (e) {
      campo.value = e.detail.z.toFixed(2);
      if (slider) slider.value = campo.value;
      atualizar();
    });
  }

  /* ── 2. probabilidade entre dois z ───────────────────────────────────── */
  function entreDois() {
    var raiz = document.getElementById('calc-between');
    if (!raiz) return;

    var c1 = raiz.querySelector('[data-campo="1"]');
    var c2 = raiz.querySelector('[data-campo="2"]');
    var s1 = raiz.querySelector('[data-slider="1"]');
    var s2 = raiz.querySelector('[data-slider="2"]');
    var valor = raiz.querySelector('[data-valor]');
    var legenda = raiz.querySelector('[data-legenda]');
    var grafico = raiz.querySelector('[data-plot]');
    var lista = raiz.querySelector('[data-linhas]');
    var botao = raiz.querySelector('[data-copiar]');
    var escolhida = 0;

    function atualizar() {
      /* Ordena na leitura: quem digita z1 = 2 e z2 = −1 quer a mesma faixa. */
      var a = Math.min(num(c1, 0), num(c2, 1));
      var b = Math.max(num(c1, 0), num(c2, 1));

      var na = enxuto(a), nb = enxuto(b);
      var its = [
        { texto: 'P(z1 < Z < z2)', tex: 'P(z_{1}<Z<z_{2})',
          texNum: 'P(' + na + '<Z<' + nb + ')=\\Phi(' + nb + ')-\\Phi(' + na + ')',
          p: limitar(cdf(b) - cdf(a)), faixas: [[a, b]], marcas: [a, b] },
        { texto: 'P(Z < z1 or Z > z2)', tex: 'P(Z<z_{1}\\ \\text{or}\\ Z>z_{2})',
          texNum: 'P(Z<' + na + ')+P(Z>' + nb + ')=1-\\left[\\Phi(' + nb + ')-\\Phi(' + na + ')\\right]',
          p: limitar(1 - (cdf(b) - cdf(a))), faixas: [[X0, a], [b, X1]], marcas: [a, b] },
        { texto: 'P(Z < z1)', tex: 'P(Z<z_{1})',
          texNum: 'P(Z<' + na + ')=\\Phi(' + na + ')',
          p: limitar(cdf(a)), faixas: [[X0, a]], marcas: [a] },
        { texto: 'P(Z > z2)', tex: 'P(Z>z_{2})',
          texNum: 'P(Z>' + nb + ')=1-\\Phi(' + nb + ')',
          p: limitar(1 - cdf(b)), faixas: [[b, X1]], marcas: [b] }
      ];

      linhas(lista, its);
      lista.querySelectorAll('.calc-row').forEach(function (li) {
        li.classList.toggle('is-on', +li.dataset.i === escolhida);
      });

      var it = its[escolhida];
      valor.textContent = fmt(it.p);
      tex(legenda, it.texNum, it.texto);
      pintar(grafico, it.faixas, it.marcas);
      raiz.dataset.copia = 'z1 = ' + a + ', z2 = ' + b + '\n' + its.map(function (i) {
        return i.texto + ' = ' + fmt(i.p);
      }).join('\n');
    }

    lista.addEventListener('click', function (e) {
      var li = e.target.closest('.calc-row');
      if (!li) return;
      escolhida = +li.dataset.i;
      atualizar();
    });

    if (botao) botao.addEventListener('click', function () { copiar(botao, raiz.dataset.copia); });

    parear(c1, s1, atualizar);
    parear(c2, s2, atualizar);
    atualizar();

    /* Duas células selecionadas na tabela viram os dois limites. */
    document.addEventListener('mk:z-par', function (e) {
      c1.value = e.detail.z1.toFixed(2);
      c2.value = e.detail.z2.toFixed(2);
      if (s1) s1.value = c1.value;
      if (s2) s2.value = c2.value;
      atualizar();
    });
  }

  /* ── 3. z a partir de um valor bruto ─────────────────────────────────── */
  function zEscore() {
    var raiz = document.getElementById('calc-zscore');
    if (!raiz) return;

    var cx = raiz.querySelector('[data-campo="x"]');
    var cmu = raiz.querySelector('[data-campo="mu"]');
    var csd = raiz.querySelector('[data-campo="sd"]');
    var zOut = raiz.querySelector('[data-z]');
    var pOut = raiz.querySelector('[data-p]');
    var acima = raiz.querySelector('[data-acima]');
    var grafico = raiz.querySelector('[data-plot]');
    var aviso = raiz.querySelector('[data-aviso]');
    var formula = raiz.querySelector('[data-formula-z]');
    var botao = raiz.querySelector('[data-copiar]');

    function atualizar() {
      var x = num(cx, 0), mu = num(cmu, 0), sd = num(csd, 1);

      /* Desvio padrão não pode ser zero nem negativo — sem isso o z viraria
         Infinity e o desenho sumiria sem explicação. */
      if (!(sd > 0)) {
        aviso.hidden = false;
        zOut.textContent = '—';
        pOut.textContent = '—';
        acima.textContent = '—';
        tex(formula, 'z=\\frac{X-\\mu}{\\sigma}', 'z = (X − μ) / σ');
        pintar(grafico, [], []);
        return;
      }
      aviso.hidden = true;

      var z = (x - mu) / sd;
      zOut.textContent = z.toFixed(5);
      pOut.textContent = fmt(cdf(z));
      acima.textContent = fmt(1 - cdf(z));
      tex(formula,
          'z=\\frac{X-\\mu}{\\sigma}=\\frac{' + enxuto(x) + '-' + enxuto(mu) + '}{' +
          enxuto(sd) + '}=' + enxuto(Math.round(z * 1e5) / 1e5),
          'z = (X − μ) / σ');
      pintar(grafico, [[X0, z]], [z]);
      raiz.dataset.copia = 'x = ' + x + ', média = ' + mu + ', desvio padrão = ' + sd +
                           '\nz = ' + z.toFixed(5) + '\nP(X < x) = ' + fmt(cdf(z)) +
                           '\nP(X > x) = ' + fmt(1 - cdf(z));
    }

    if (botao) botao.addEventListener('click', function () { copiar(botao, raiz.dataset.copia); });

    [cx, cmu, csd].forEach(function (c) { c.addEventListener('input', atualizar); });
    atualizar();
  }

  /* ── Ponte com a tabela ──────────────────────────────────────────────────
     A tabela já destaca as células clicadas; aqui só lemos o z delas e o
     anunciamos por evento, para as calculadoras não precisarem conhecer o
     script antigo. O sinal vem do rótulo da linha, não do número: parseFloat
     devolve -0 para "-0.0", e -0 >= 0 é verdadeiro em JavaScript. */
  function ponte() {
    var tabela = document.getElementById('myTable');
    if (!tabela) return;

    function zDaCelula(td) {
      var linha = td.parentElement;
      var rotulo = linha.cells[0] ? linha.cells[0].textContent.trim() : '';

      /* A coluna Z escreve o negativo com o sinal tipográfico − (U+2212), não
         com hífen, e parseFloat devolve NaN nele. Normalizar é o que faz a
         metade negativa da tabela funcionar. */
      var limpo = rotulo.replace(/\u2212/g, '-');
      var base = parseFloat(limpo);
      if (isNaN(base) || td.cellIndex < 1) return null;

      /* O sinal vem do rótulo, não do número: parseFloat("-0.0") é -0, e
         -0 >= 0 é verdadeiro em JavaScript. */
      var passo = (td.cellIndex - 1) * 0.01;
      return limpo.charAt(0) === '-' ? base - passo : base + passo;
    }

    /* Na fase de captura: o script da tabela chama stopPropagation no clique
       da célula, então um listener de bolha aqui nunca seria chamado. */
    tabela.addEventListener('click', function (e) {
      var td = e.target.closest('td');
      if (!td) return;

      /* Depois do clique, para ler a seleção que o script da tabela acabou
         de atualizar. */
      setTimeout(function () {
        var sel = Array.prototype.map.call(
          tabela.querySelectorAll('td.selected'), zDaCelula
        ).filter(function (z) { return z !== null; });

        if (sel.length === 1) {
          document.dispatchEvent(new CustomEvent('mk:z-escolhido', { detail: { z: sel[0] } }));
        } else if (sel.length >= 2) {
          document.dispatchEvent(new CustomEvent('mk:z-par', {
            detail: { z1: Math.min(sel[0], sel[1]), z2: Math.max(sel[0], sel[1]) }
          }));
        }
      }, 0);
    }, true);
  }

  /* As fórmulas fixas que vêm marcadas no HTML. */
  function formulasFixas() {
    document.querySelectorAll('[data-tex]').forEach(function (el) {
      tex(el, el.dataset.tex, el.textContent);
    });
  }

  function iniciar() {
    formulasFixas();
    pvalor();
    entreDois();
    zEscore();
    ponte();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
