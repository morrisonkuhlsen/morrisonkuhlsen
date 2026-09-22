/* Calculadoras da página da tabela Z. A matemática, o desenho da curva, a
   notação e o estado na URL vêm de stat-calc-core.js; aqui ficam só as cinco
   calculadoras desta página e a ponte com a tabela. */
(function () {
  'use strict';

  var C = window.MKCalc;
  if (!C) return;

  var X0 = -4, X1 = 4;
  var dens = C.npdf;

  function pintar(el, faixas, marcas) {
    C.pintar(el, faixas, marcas, dens, X0, X1);
  }

  function linhas(lista, itens) {
    C.linhas(lista, itens, dens, X0, X1);
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
      var n = C.enxuto(z), na = C.enxuto(a);
      return [
        { texto: 'P(Z < z)', tex: 'P(Z<z)',
          texNum: 'P(Z<' + n + ')=\\Phi(' + n + ')',
          p: C.limitar(C.ncdf(z)), faixas: [[X0, z]], marcas: [z] },
        { texto: 'P(Z > z)', tex: 'P(Z>z)',
          texNum: 'P(Z>' + n + ')=1-\\Phi(' + n + ')',
          p: C.limitar(1 - C.ncdf(z)), faixas: [[z, X1]], marcas: [z] },
        { texto: 'P(0 < Z < z)', tex: 'P(0<Z<z)',
          texNum: 'P(0<Z<' + n + ')=\\left|\\Phi(' + n + ')-\\tfrac{1}{2}\\right|',
          p: C.limitar(Math.abs(C.ncdf(z) - 0.5)),
          faixas: [[Math.min(0, z), Math.max(0, z)]], marcas: [0, z] },
        { texto: 'P(-|z| < Z < |z|)', tex: 'P(-|z|<Z<|z|)',
          texNum: 'P(-' + na + '<Z<' + na + ')=2\\Phi(' + na + ')-1',
          p: C.limitar(1 - 2 * C.ncdf(-a)), faixas: [[-a, a]], marcas: [-a, a] },
        { texto: 'P(Z < -|z| or Z > |z|)', tex: 'P(Z<-|z|\\ \\text{or}\\ Z>|z|)',
          texNum: 'P(|Z|>' + na + ')=2\\left[1-\\Phi(' + na + ')\\right]',
          p: C.limitar(2 * C.ncdf(-a)), faixas: [[X0, -a], [a, X1]], marcas: [-a, a] }
      ];
    }

    function atualizar() {
      var z = C.num(campo, 0);
      var its = itens(z);
      linhas(lista, its);
      lista.querySelectorAll('.calc-row').forEach(function (li) {
        li.classList.toggle('is-on', +li.dataset.i === escolhida);
      });

      var it = its[escolhida];
      valor.textContent = C.fmt(it.p);
      C.tex(legenda, it.texNum, it.texto);
      pintar(grafico, it.faixas, it.marcas);
      raiz.dataset.copia = 'z = ' + z + '\n' + its.map(function (i) {
        return i.texto + ' = ' + C.fmt(i.p);
      }).join('\n');
      C.guardarURL({ z: campo.value });
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

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var zURL = C.paramNum('z');
    if (zURL !== null) {
      campo.value = zURL;
      if (slider) slider.value = zURL;
    }

    C.parear(campo, slider, atualizar);
    atualizar();

    /* A tabela alimenta a calculadora: clicar numa célula traz o z para cá. */
    document.addEventListener('mk:z-escolhido', function (e) {
      campo.value = e.detail.z.toFixed(2);
      if (slider) slider.value = campo.value;
      atualizar();
    });
  }

  /* ── 2. z a partir de uma probabilidade ──────────────────────────────────
     O caminho inverso do primeiro card. Qual das três leituras vale muda o
     resultado, por isso a escolha é explícita em vez de suposta. */
  function inversaCalc() {
    var raiz = document.getElementById('calc-inverse');
    if (!raiz) return;

    var campo = raiz.querySelector('[data-campo]');
    var slider = raiz.querySelector('[data-slider]');
    var valor = raiz.querySelector('[data-valor]');
    var legenda = raiz.querySelector('[data-legenda]');
    var grafico = raiz.querySelector('[data-plot]');
    var botao = raiz.querySelector('[data-copiar]');
    var opcoes = raiz.querySelectorAll('input[name="inv-tail"]');

    function cauda() {
      for (var i = 0; i < opcoes.length; i++) {
        if (opcoes[i].checked) return opcoes[i].value;
      }
      return 'left';
    }

    function atualizar() {
      var p = C.num(campo, 0.95);
      var tipo = cauda();

      if (!(p > 0 && p < 1)) {
        valor.textContent = '—';
        C.tex(legenda, 'p\\in(0,1)', 'p must be between 0 and 1');
        pintar(grafico, [], []);
        return;
      }

      var z, faixas, expr;
      if (tipo === 'left') {
        z = C.ninv(p);
        faixas = [[X0, z]];
        expr = 'z=\\Phi^{-1}(' + C.enxuto(p) + ')';
      } else if (tipo === 'right') {
        z = C.ninv(1 - p);
        faixas = [[z, X1]];
        expr = 'z=\\Phi^{-1}(1-' + C.enxuto(p) + ')';
      } else {
        z = C.ninv((1 + p) / 2);
        faixas = [[-Math.abs(z), Math.abs(z)]];
        expr = 'z=\\Phi^{-1}\\!\\left(\\tfrac{1+' + C.enxuto(p) + '}{2}\\right)';
      }

      valor.textContent = isFinite(z) ? z.toFixed(5) : '—';
      C.tex(legenda, expr, 'z = inverse of ' + p);
      pintar(grafico, faixas, tipo === 'two' ? [-Math.abs(z), Math.abs(z)] : [z]);
      raiz.dataset.copia = 'p = ' + p + ' (' + tipo + ')\nz = ' + z.toFixed(5);
      C.guardarURL({ p: campo.value, tail: tipo });
    }

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var pURL = C.paramNum('p');
    if (pURL !== null) {
      campo.value = pURL;
      if (slider) slider.value = pURL;
    }
    var tURL = C.paramTexto('tail');
    if (tURL) opcoes.forEach(function (o) { o.checked = (o.value === tURL); });

    opcoes.forEach(function (o) { o.addEventListener('change', atualizar); });
    C.parear(campo, slider, atualizar);
    atualizar();
  }

  /* ── 3. probabilidade entre dois z ───────────────────────────────────── */
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
      var a = Math.min(C.num(c1, 0), C.num(c2, 1));
      var b = Math.max(C.num(c1, 0), C.num(c2, 1));
      var na = C.enxuto(a), nb = C.enxuto(b);

      var its = [
        { texto: 'P(z1 < Z < z2)', tex: 'P(z_{1}<Z<z_{2})',
          texNum: 'P(' + na + '<Z<' + nb + ')=\\Phi(' + nb + ')-\\Phi(' + na + ')',
          p: C.limitar(C.ncdf(b) - C.ncdf(a)), faixas: [[a, b]], marcas: [a, b] },
        { texto: 'P(Z < z1 or Z > z2)', tex: 'P(Z<z_{1}\\ \\text{or}\\ Z>z_{2})',
          texNum: 'P(Z<' + na + ')+P(Z>' + nb + ')=1-\\left[\\Phi(' + nb + ')-\\Phi(' + na + ')\\right]',
          p: C.limitar(1 - (C.ncdf(b) - C.ncdf(a))), faixas: [[X0, a], [b, X1]], marcas: [a, b] },
        { texto: 'P(Z < z1)', tex: 'P(Z<z_{1})',
          texNum: 'P(Z<' + na + ')=\\Phi(' + na + ')',
          p: C.limitar(C.ncdf(a)), faixas: [[X0, a]], marcas: [a] },
        { texto: 'P(Z > z2)', tex: 'P(Z>z_{2})',
          texNum: 'P(Z>' + nb + ')=1-\\Phi(' + nb + ')',
          p: C.limitar(1 - C.ncdf(b)), faixas: [[b, X1]], marcas: [b] }
      ];

      linhas(lista, its);
      lista.querySelectorAll('.calc-row').forEach(function (li) {
        li.classList.toggle('is-on', +li.dataset.i === escolhida);
      });

      var it = its[escolhida];
      valor.textContent = C.fmt(it.p);
      C.tex(legenda, it.texNum, it.texto);
      pintar(grafico, it.faixas, it.marcas);
      raiz.dataset.copia = 'z1 = ' + a + ', z2 = ' + b + '\n' + its.map(function (i) {
        return i.texto + ' = ' + C.fmt(i.p);
      }).join('\n');
      C.guardarURL({ z1: c1.value, z2: c2.value });
    }

    lista.addEventListener('click', function (e) {
      var li = e.target.closest('.calc-row');
      if (!li) return;
      escolhida = +li.dataset.i;
      atualizar();
    });

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var u1 = C.paramNum('z1'), u2 = C.paramNum('z2');
    if (u1 !== null) { c1.value = u1; if (s1) s1.value = u1; }
    if (u2 !== null) { c2.value = u2; if (s2) s2.value = u2; }

    C.parear(c1, s1, atualizar);
    C.parear(c2, s2, atualizar);
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

  /* ── 4. z a partir de um valor bruto ─────────────────────────────────── */
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
      var x = C.num(cx, 0), mu = C.num(cmu, 0), sd = C.num(csd, 1);

      /* Desvio padrão não pode ser zero nem negativo — sem isso o z viraria
         Infinity e o desenho sumiria sem explicação. */
      if (!(sd > 0)) {
        aviso.hidden = false;
        zOut.textContent = '—';
        pOut.textContent = '—';
        acima.textContent = '—';
        C.tex(formula, 'z=\\frac{X-\\mu}{\\sigma}', 'z = (X - mu) / sigma');
        pintar(grafico, [], []);
        return;
      }
      aviso.hidden = true;

      var z = (x - mu) / sd;
      zOut.textContent = z.toFixed(5);
      pOut.textContent = C.fmt(C.ncdf(z));
      acima.textContent = C.fmt(1 - C.ncdf(z));
      C.tex(formula,
            'z=\\frac{X-\\mu}{\\sigma}=\\frac{' + C.enxuto(x) + '-' + C.enxuto(mu) + '}{' +
            C.enxuto(sd) + '}=' + C.enxuto(Math.round(z * 1e5) / 1e5),
            'z = (X - mu) / sigma');
      pintar(grafico, [[X0, z]], [z]);
      raiz.dataset.copia = 'x = ' + x + ', mean = ' + mu + ', standard deviation = ' + sd +
                           '\nz = ' + z.toFixed(5) + '\nP(X < x) = ' + C.fmt(C.ncdf(z)) +
                           '\nP(X > x) = ' + C.fmt(1 - C.ncdf(z));
      C.guardarURL({ x: cx.value, mu: cmu.value, sd: csd.value });
    }

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var ux = C.paramNum('x'), umu = C.paramNum('mu'), usd = C.paramNum('sd');
    if (ux !== null) cx.value = ux;
    if (umu !== null) cmu.value = umu;
    if (usd !== null) csd.value = usd;

    [cx, cmu, csd].forEach(function (c) { c.addEventListener('input', atualizar); });
    atualizar();
  }

  /* ── 5. valores críticos ─────────────────────────────────────────────────
     A consulta que se repete o dia inteiro. Os números saem da inversa, e não
     de uma lista escrita à mão, para não haver duas fontes de verdade. */
  var NIVEIS = [0.80, 0.90, 0.95, 0.98, 0.99, 0.999];

  function criticos() {
    var raiz = document.getElementById('calc-critical');
    if (!raiz) return;

    var corpo = raiz.querySelector('[data-criticos]');
    var botao = raiz.querySelector('[data-copiar]');

    var linhasTab = NIVEIS.map(function (nivel) {
      return {
        nivel: nivel,
        alfa: Math.round((1 - nivel) * 1000) / 1000,
        uma: C.ninv(nivel),
        duas: C.ninv((1 + nivel) / 2)
      };
    });

    corpo.innerHTML = linhasTab.map(function (l) {
      var rotulo = (l.nivel * 100).toFixed(l.nivel === 0.999 ? 1 : 0) + '%';
      return '<tr>' +
               '<th scope="row">' + rotulo + '</th>' +
               '<td>' + l.alfa.toFixed(3) + '</td>' +
               '<td><button type="button" class="critical__z" data-z="' + l.uma.toFixed(5) + '">' +
                 l.uma.toFixed(3) + '</button></td>' +
               '<td><button type="button" class="critical__z" data-z="' + l.duas.toFixed(5) + '">' +
                 '±' + l.duas.toFixed(3) + '</button></td>' +
             '</tr>';
    }).join('');

    /* Clicar num valor manda o z para o primeiro card, pelo mesmo evento que
       a tabela usa — o caminho de volta do valor crítico para a área. */
    corpo.addEventListener('click', function (e) {
      var alvo = e.target.closest('.critical__z');
      if (!alvo) return;
      document.dispatchEvent(new CustomEvent('mk:z-escolhido', {
        detail: { z: parseFloat(alvo.dataset.z) }
      }));
      var card = document.getElementById('calc-pvalue');
      if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    if (botao) {
      botao.addEventListener('click', function () {
        C.copiar(botao, 'Confidence\tAlpha\tOne-tailed\tTwo-tailed\n' + linhasTab.map(function (l) {
          return (l.nivel * 100) + '%\t' + l.alfa.toFixed(3) + '\t' +
                 l.uma.toFixed(5) + '\t' + l.duas.toFixed(5);
        }).join('\n'));
      });
    }
  }

  /* ── Ponte com a tabela ──────────────────────────────────────────────────
     A tabela já destaca as células clicadas; aqui só lemos o z delas e o
     anunciamos por evento, para as calculadoras não precisarem conhecer o
     script antigo. */
  function ponte() {
    var tabela = document.getElementById('myTable');
    if (!tabela) return;

    function zDaCelula(td) {
      var linha = td.parentElement;
      var rotulo = linha.cells[0] ? linha.cells[0].textContent.trim() : '';

      /* A coluna Z escreve o negativo com o sinal tipográfico − (U+2212), não
         com hífen, e parseFloat devolve NaN nele. Normalizar é o que faz a
         metade negativa da tabela funcionar. */
      var limpo = rotulo.replace(/−/g, '-');
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

  function iniciar() {
    C.formulasFixas();
    pvalor();
    inversaCalc();
    entreDois();
    zEscore();
    criticos();
    ponte();
    C.tema();
    /* A partir daqui, o que mudar veio de alguém mexendo. */
    C.liberarURL();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
