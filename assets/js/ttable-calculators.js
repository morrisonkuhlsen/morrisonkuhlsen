/* Calculadoras da tabela t de Student. A matemática, o desenho e o estado na
   URL vêm de stat-calc-core.js.

   Diferença que manda no desenho: a t muda de forma com os graus de liberdade
   — com poucos, as caudas são pesadas —, então a curva é redesenhada a cada
   mudança de df, e o eixo vai a ±5, não ±4 como na normal. */
(function () {
  'use strict';

  var C = window.MKCalc;
  if (!C) return;

  var X0 = -5, X1 = 5;

  function densidade(df) {
    return function (t) { return C.tpdf(t, df); };
  }

  function grausValidos(df) {
    return df > 0 && isFinite(df);
  }

  /* ── 1. p-valor a partir de um t ─────────────────────────────────────────
     Mesma ideia do card da tabela Z: as quatro leituras de uma vez, porque a
     dúvida não é qual é a área, é qual delas o teste pede. */
  function pvalor() {
    var raiz = document.getElementById('calc-tp');
    if (!raiz) return;

    var campoT = raiz.querySelector('[data-campo="t"]');
    var sliderT = raiz.querySelector('[data-slider="t"]');
    var campoDf = raiz.querySelector('[data-campo="df"]');
    var valor = raiz.querySelector('[data-valor]');
    var legenda = raiz.querySelector('[data-legenda]');
    var grafico = raiz.querySelector('[data-plot]');
    var lista = raiz.querySelector('[data-linhas]');
    var aviso = raiz.querySelector('[data-aviso]');
    var botao = raiz.querySelector('[data-copiar]');
    var escolhida = 1;   /* a cauda direita é a leitura mais pedida num teste */

    function itens(t, df) {
      var a = Math.abs(t);
      var nt = C.enxuto(t), na = C.enxuto(a), nd = C.enxuto(df);
      return [
        { texto: 'P(T < t)', tex: 'P(T<t)',
          texNum: 'P(T<' + nt + '\\mid \\nu=' + nd + ')',
          p: C.limitar(C.tcdf(t, df)), faixas: [[X0, t]], marcas: [t] },
        { texto: 'P(T > t)', tex: 'P(T>t)',
          texNum: 'P(T>' + nt + '\\mid \\nu=' + nd + ')=1-F(' + nt + ')',
          p: C.limitar(1 - C.tcdf(t, df)), faixas: [[t, X1]], marcas: [t] },
        { texto: 'P(|T| > |t|)  (two-tailed)', tex: 'P(|T|>|t|)',
          texNum: 'P(|T|>' + na + ')=2\\left[1-F(' + na + ')\\right]',
          p: C.limitar(2 * (1 - C.tcdf(a, df))), faixas: [[X0, -a], [a, X1]], marcas: [-a, a] },
        { texto: 'P(-|t| < T < |t|)', tex: 'P(-|t|<T<|t|)',
          texNum: 'P(-' + na + '<T<' + na + ')=2F(' + na + ')-1',
          p: C.limitar(2 * C.tcdf(a, df) - 1), faixas: [[-a, a]], marcas: [-a, a] }
      ];
    }

    function atualizar() {
      var t = C.num(campoT, 0);
      var df = C.num(campoDf, 10);

      if (!grausValidos(df)) {
        aviso.hidden = false;
        valor.textContent = '—';
        lista.innerHTML = '';
        return;
      }
      aviso.hidden = true;

      var dens = densidade(df);
      var its = itens(t, df);
      C.linhas(lista, its, dens, X0, X1);
      lista.querySelectorAll('.calc-row').forEach(function (li) {
        li.classList.toggle('is-on', +li.dataset.i === escolhida);
      });

      var it = its[escolhida];
      valor.textContent = C.fmt(it.p);
      C.tex(legenda, it.texNum, it.texto);
      C.pintar(grafico, it.faixas, it.marcas, dens, X0, X1);
      raiz.dataset.copia = 't = ' + t + ', df = ' + df + '\n' + its.map(function (i) {
        return i.texto + ' = ' + C.fmt(i.p);
      }).join('\n');
      C.guardarURL({ t: campoT.value, df: campoDf.value });
    }

    lista.addEventListener('click', function (e) {
      var li = e.target.closest('.calc-row');
      if (!li) return;
      escolhida = +li.dataset.i;
      atualizar();
    });

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var tURL = C.paramNum('t'), dfURL = C.paramNum('df');
    if (tURL !== null) { campoT.value = tURL; if (sliderT) sliderT.value = tURL; }
    if (dfURL !== null) campoDf.value = dfURL;

    C.parear(campoT, sliderT, atualizar);
    campoDf.addEventListener('input', atualizar);
    atualizar();

    /* Clicar numa célula da tabela traz o valor crítico e os graus de
       liberdade daquela linha. */
    document.addEventListener('mk:t-escolhido', function (e) {
      campoT.value = e.detail.t;
      if (sliderT) sliderT.value = e.detail.t;
      if (e.detail.df) campoDf.value = e.detail.df;
      escolhida = 1;
      atualizar();
    });
  }

  /* ── 2. t crítico ────────────────────────────────────────────────────────
     O que a tabela impressa dá, mas para qualquer α e qualquer df — inclusive
     os que não cabem nas dez colunas dela. */
  function critico() {
    var raiz = document.getElementById('calc-tcrit');
    if (!raiz) return;

    var campoA = raiz.querySelector('[data-campo="alpha"]');
    var sliderA = raiz.querySelector('[data-slider="alpha"]');
    var campoDf = raiz.querySelector('[data-campo="df"]');
    var valor = raiz.querySelector('[data-valor]');
    var legenda = raiz.querySelector('[data-legenda]');
    var grafico = raiz.querySelector('[data-plot]');
    var aviso = raiz.querySelector('[data-aviso]');
    var botao = raiz.querySelector('[data-copiar]');
    var opcoes = raiz.querySelectorAll('input[name="crit-tail"]');

    function cauda() {
      for (var i = 0; i < opcoes.length; i++) {
        if (opcoes[i].checked) return opcoes[i].value;
      }
      return 'one';
    }

    function atualizar() {
      var alfa = C.num(campoA, 0.05);
      var df = C.num(campoDf, 10);
      var tipo = cauda();

      if (!grausValidos(df) || !(alfa > 0 && alfa < 1)) {
        aviso.hidden = false;
        valor.textContent = '—';
        C.pintar(grafico, [], [], densidade(10), X0, X1);
        return;
      }
      aviso.hidden = true;

      var dens = densidade(df);
      var t, faixas, marcas, expr;

      if (tipo === 'one') {
        t = C.tinv(1 - alfa, df);
        faixas = [[t, X1]];
        marcas = [t];
        expr = 't_{' + C.enxuto(alfa) + ',\\,' + C.enxuto(df) + '}=F^{-1}(1-' + C.enxuto(alfa) + ')';
      } else {
        t = C.tinv(1 - alfa / 2, df);
        faixas = [[X0, -t], [t, X1]];
        marcas = [-t, t];
        expr = 't_{' + C.enxuto(alfa) + '/2,\\,' + C.enxuto(df) + '}=F^{-1}\\!\\left(1-\\tfrac{' +
               C.enxuto(alfa) + '}{2}\\right)';
      }

      valor.textContent = (tipo === 'two' ? '±' : '') + t.toFixed(5);
      C.tex(legenda, expr, 'critical t');
      C.pintar(grafico, faixas, marcas, dens, X0, X1);
      raiz.dataset.copia = 'alpha = ' + alfa + ' (' + tipo + '-tailed), df = ' + df +
                           '\ncritical t = ' + t.toFixed(5);
      C.guardarURL({ a: campoA.value, adf: campoDf.value, ctail: tipo });
    }

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var aURL = C.paramNum('a'), dfURL = C.paramNum('adf'), tailURL = C.paramTexto('ctail');
    if (aURL !== null) { campoA.value = aURL; if (sliderA) sliderA.value = aURL; }
    if (dfURL !== null) campoDf.value = dfURL;
    if (tailURL) opcoes.forEach(function (o) { o.checked = (o.value === tailURL); });

    opcoes.forEach(function (o) { o.addEventListener('change', atualizar); });
    C.parear(campoA, sliderA, atualizar);
    campoDf.addEventListener('input', atualizar);
    atualizar();

    document.addEventListener('mk:t-celula', function (e) {
      campoA.value = e.detail.alfa;
      if (sliderA) sliderA.value = e.detail.alfa;
      campoDf.value = e.detail.df;
      atualizar();
    });
  }

  /* ── 3. teste t de uma amostra ───────────────────────────────────────────
     O caminho completo: dos dados ao p-valor, sem passar pela tabela. É o que
     leva alguém a procurar uma tabela t, afinal. */
  function testeUmaAmostra() {
    var raiz = document.getElementById('calc-tttest');
    if (!raiz) return;

    var cx = raiz.querySelector('[data-campo="xbar"]');
    var cmu = raiz.querySelector('[data-campo="mu"]');
    var cs = raiz.querySelector('[data-campo="s"]');
    var cn = raiz.querySelector('[data-campo="n"]');
    var tOut = raiz.querySelector('[data-t]');
    var dfOut = raiz.querySelector('[data-df]');
    var pUm = raiz.querySelector('[data-p-uma]');
    var pDois = raiz.querySelector('[data-p-duas]');
    var grafico = raiz.querySelector('[data-plot]');
    var aviso = raiz.querySelector('[data-aviso]');
    var formula = raiz.querySelector('[data-formula-t]');
    var botao = raiz.querySelector('[data-copiar]');

    function atualizar() {
      var xbar = C.num(cx, 0), mu = C.num(cmu, 0);
      var s = C.num(cs, 1), n = C.num(cn, 10);

      /* Desvio amostral positivo e ao menos duas observações: sem isso não há
         graus de liberdade, e o t iria para o infinito sem explicação. */
      if (!(s > 0) || !(n >= 2)) {
        aviso.hidden = false;
        tOut.textContent = '—';
        dfOut.textContent = '—';
        pUm.textContent = '—';
        pDois.textContent = '—';
        C.tex(formula, 't=\\frac{\\bar{x}-\\mu_{0}}{s/\\sqrt{n}}', 't = (xbar - mu) / (s / sqrt(n))');
        C.pintar(grafico, [], [], densidade(10), X0, X1);
        return;
      }
      aviso.hidden = true;

      var df = n - 1;
      var t = (xbar - mu) / (s / Math.sqrt(n));
      var dens = densidade(df);
      var a = Math.abs(t);

      tOut.textContent = t.toFixed(5);
      dfOut.textContent = String(df);
      pUm.textContent = C.fmt(1 - C.tcdf(a, df));
      pDois.textContent = C.fmt(2 * (1 - C.tcdf(a, df)));
      C.tex(formula,
            't=\\frac{\\bar{x}-\\mu_{0}}{s/\\sqrt{n}}=\\frac{' + C.enxuto(xbar) + '-' + C.enxuto(mu) +
            '}{' + C.enxuto(s) + '/\\sqrt{' + C.enxuto(n) + '}}=' + C.enxuto(Math.round(t * 1e5) / 1e5),
            't = (xbar - mu) / (s / sqrt(n))');
      C.pintar(grafico, [[X0, -a], [a, X1]], [-a, a], dens, X0, X1);
      raiz.dataset.copia = 'xbar = ' + xbar + ', mu0 = ' + mu + ', s = ' + s + ', n = ' + n +
                           '\nt = ' + t.toFixed(5) + ', df = ' + df +
                           '\none-tailed p = ' + C.fmt(1 - C.tcdf(a, df)) +
                           '\ntwo-tailed p = ' + C.fmt(2 * (1 - C.tcdf(a, df)));
      C.guardarURL({ xbar: cx.value, mu: cmu.value, s: cs.value, n: cn.value });
    }

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    [['xbar', cx], ['mu', cmu], ['s', cs], ['n', cn]].forEach(function (par) {
      var v = C.paramNum(par[0]);
      if (v !== null) par[1].value = v;
    });

    [cx, cmu, cs, cn].forEach(function (c) { c.addEventListener('input', atualizar); });
    atualizar();
  }

  /* ── Ponte com a tabela ──────────────────────────────────────────────────
     Aqui a célula carrega mais informação que na tabela Z: o valor é o t
     crítico, a linha dá os graus de liberdade e a coluna dá o α. */
  function ponte() {
    var tabela = document.getElementById('myTable');
    if (!tabela) return;

    var alfas = Array.prototype.map.call(
      tabela.querySelectorAll('thead th'), function (th) { return parseFloat(th.textContent); }
    );

    tabela.addEventListener('click', function (e) {
      var td = e.target.closest('td');
      if (!td || td.cellIndex < 1) return;

      var linha = td.parentElement;
      var df = parseFloat(linha.cells[0].textContent.replace(/−/g, '-'));
      var t = parseFloat(td.textContent);
      var alfa = alfas[td.cellIndex];
      if (isNaN(t)) return;

      document.dispatchEvent(new CustomEvent('mk:t-escolhido', {
        detail: { t: t, df: isNaN(df) ? null : df }
      }));
      if (!isNaN(alfa) && !isNaN(df)) {
        document.dispatchEvent(new CustomEvent('mk:t-celula', { detail: { alfa: alfa, df: df } }));
      }
    }, true);
  }

  function iniciar() {
    C.formulasFixas();
    pvalor();
    critico();
    testeUmaAmostra();
    ponte();
    C.tema();
    C.liberarURL();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
