/* Calculadoras da tabela qui-quadrado. A matemática, o desenho e o estado na
   URL vêm de stat-calc-core.js.

   Como na F, a χ² vive em x > 0 e não é simétrica: o eixo se estica até um
   pouco além do quantil 0,999 dos graus de liberdade em uso. */
(function () {
  'use strict';

  var C = window.MKCalc;
  if (!C) return;

  function densidade(k) {
    return function (x) { return C.chi2pdf(x, k); };
  }

  /* Até onde desenhar: o quantil 0,999, ou além se uma marca passar dele. */
  function limite(k, marcas) {
    var alto = C.chi2inv(0.999, k);
    if (!isFinite(alto) || alto <= 0) alto = 10;
    (marcas || []).forEach(function (m) {
      if (isFinite(m)) alto = Math.max(alto, m * 1.15);
    });
    return Math.max(alto, 5);
  }

  function valido(k) {
    return k > 0 && isFinite(k);
  }

  /* ── 1. p-valor a partir de um χ² ────────────────────────────────────────
     Num teste de aderência ou de independência, a pergunta é a cauda
     direita. A esquerda serve aos testes de variância. */
  function pvalor() {
    var raiz = document.getElementById('calc-chip');
    if (!raiz) return;

    var cx = raiz.querySelector('[data-campo="x"]');
    var sx = raiz.querySelector('[data-slider="x"]');
    var ck = raiz.querySelector('[data-campo="df"]');
    var valor = raiz.querySelector('[data-valor]');
    var legenda = raiz.querySelector('[data-legenda]');
    var grafico = raiz.querySelector('[data-plot]');
    var lista = raiz.querySelector('[data-linhas]');
    var aviso = raiz.querySelector('[data-aviso]');
    var botao = raiz.querySelector('[data-copiar]');
    var escolhida = 0;

    function atualizar() {
      var x = C.num(cx, 3.841), k = C.num(ck, 1);

      if (!valido(k) || !(x > 0)) {
        aviso.hidden = false;
        valor.textContent = '—';
        lista.innerHTML = '';
        return;
      }
      aviso.hidden = true;

      var dens = densidade(k);
      var X1 = limite(k, [x]);
      var nx = C.enxuto(x), nk = C.enxuto(k);

      var its = [
        { texto: 'P(X > x)  (right tail)', tex: 'P(X>x)',
          texNum: 'P(X>' + nx + '\\mid\\nu=' + nk + ')',
          p: C.limitar(C.chi2sf(x, k)), faixas: [[x, X1]], marcas: [x] },
        { texto: 'P(X < x)  (left tail)', tex: 'P(X<x)',
          texNum: 'P(X<' + nx + '\\mid\\nu=' + nk + ')',
          p: C.limitar(C.chi2cdf(x, k)), faixas: [[0, x]], marcas: [x] }
      ];

      C.linhas(lista, its, dens, 0, X1);
      lista.querySelectorAll('.calc-row').forEach(function (li) {
        li.classList.toggle('is-on', +li.dataset.i === escolhida);
      });

      var it = its[escolhida];
      valor.textContent = C.fmt(it.p);
      C.tex(legenda, it.texNum, it.texto);
      C.pintar(grafico, it.faixas, it.marcas, dens, 0, X1);
      raiz.dataset.copia = 'chi2 = ' + x + ', df = ' + k + '\n' +
        its.map(function (i) { return i.texto + ' = ' + C.fmt(i.p); }).join('\n');
      C.guardarURL({ x: cx.value, df: ck.value });
    }

    lista.addEventListener('click', function (e) {
      var li = e.target.closest('.calc-row');
      if (!li) return;
      escolhida = +li.dataset.i;
      atualizar();
    });

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var xURL = C.paramNum('x'), kURL = C.paramNum('df');
    if (xURL !== null) { cx.value = xURL; if (sx) sx.value = xURL; }
    if (kURL !== null) ck.value = kURL;

    C.parear(cx, sx, atualizar);
    ck.addEventListener('input', atualizar);
    atualizar();

    document.addEventListener('mk:chi-escolhido', function (e) {
      cx.value = e.detail.x;
      if (sx) sx.value = e.detail.x;
      ck.value = e.detail.df;
      atualizar();
    });
  }

  /* ── 2. χ² crítico ───────────────────────────────────────────────────────
     α é a área à direita, como nos cabeçalhos da tabela. */
  function critico() {
    var raiz = document.getElementById('calc-chicrit');
    if (!raiz) return;

    var ca = raiz.querySelector('[data-campo="alpha"]');
    var sa = raiz.querySelector('[data-slider="alpha"]');
    var ck = raiz.querySelector('[data-campo="df"]');
    var valor = raiz.querySelector('[data-valor]');
    var legenda = raiz.querySelector('[data-legenda]');
    var grafico = raiz.querySelector('[data-plot]');
    var aviso = raiz.querySelector('[data-aviso]');
    var botao = raiz.querySelector('[data-copiar]');

    function atualizar() {
      var alfa = C.num(ca, 0.05), k = C.num(ck, 10);

      if (!valido(k) || !(alfa > 0 && alfa < 1)) {
        aviso.hidden = false;
        valor.textContent = '—';
        return;
      }
      aviso.hidden = true;

      var x = C.chi2inv(1 - alfa, k);
      var dens = densidade(k);
      var X1 = limite(k, [x]);

      valor.textContent = isFinite(x) ? x.toFixed(4) : '—';
      C.tex(legenda,
            '\\chi^{2}_{' + C.enxuto(alfa) + ';\\,' + C.enxuto(k) + '}=F^{-1}(1-' + C.enxuto(alfa) + ')',
            'critical chi-square');
      C.pintar(grafico, [[x, X1]], [x], dens, 0, X1);
      raiz.dataset.copia = 'alpha = ' + alfa + ', df = ' + k + '\ncritical chi2 = ' + x.toFixed(5);
      C.guardarURL({ a: ca.value, adf: ck.value });
    }

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var aURL = C.paramNum('a'), kURL = C.paramNum('adf');
    if (aURL !== null) { ca.value = aURL; if (sa) sa.value = aURL; }
    if (kURL !== null) ck.value = kURL;

    C.parear(ca, sa, atualizar);
    ck.addEventListener('input', atualizar);
    atualizar();

    document.addEventListener('mk:chi-celula', function (e) {
      ca.value = e.detail.alfa;
      if (sa) sa.value = e.detail.alfa;
      ck.value = e.detail.df;
      atualizar();
    });
  }

  /* ── 3. intervalo de confiança para uma variância ────────────────────────
     O uso clássico das duas pontas da tabela: (n − 1)s²/σ² segue χ²(n − 1),
     e isolar σ² entre os dois quantis dá o intervalo. O quantil alto vai no
     limite de baixo, e vice-versa. */
  function intervaloVariancia() {
    var raiz = document.getElementById('calc-chivar');
    if (!raiz) return;

    var cs = raiz.querySelector('[data-campo="s"]');
    var cn = raiz.querySelector('[data-campo="n"]');
    var cc = raiz.querySelector('[data-campo="conf"]');
    var vOut = raiz.querySelector('[data-var]');
    var sOut = raiz.querySelector('[data-sd]');
    var formula = raiz.querySelector('[data-formula-var]');
    var grafico = raiz.querySelector('[data-plot]');
    var aviso = raiz.querySelector('[data-aviso]');
    var botao = raiz.querySelector('[data-copiar]');

    var intervalo = function (a, b) { return '[' + a.toFixed(4) + ', ' + b.toFixed(4) + ']'; };

    function atualizar() {
      var s = C.num(cs, 2.5), n = C.num(cn, 20), conf = C.num(cc, 0.95);

      if (!(s > 0) || !(n >= 2) || !(conf >= 0.5 && conf < 1)) {
        aviso.hidden = false;
        vOut.textContent = '—';
        sOut.textContent = '—';
        formula.textContent = '';
        return;
      }
      aviso.hidden = true;

      var k = n - 1, alfa = 1 - conf;
      var qAlto = C.chi2inv(1 - alfa / 2, k), qBaixo = C.chi2inv(alfa / 2, k);
      var sq = k * s * s;
      var lo = sq / qAlto, hi = sq / qBaixo;
      var dens = densidade(k);
      var X1 = limite(k, [qAlto]);

      vOut.textContent = intervalo(lo, hi);
      sOut.textContent = intervalo(Math.sqrt(lo), Math.sqrt(hi));
      C.tex(formula,
            '\\chi^{2}_{' + C.enxuto(alfa / 2) + '}=' + C.enxuto(Math.round(qAlto * 1e4) / 1e4) +
            ',\\quad \\chi^{2}_{' + C.enxuto(1 - alfa / 2) + '}=' + C.enxuto(Math.round(qBaixo * 1e4) / 1e4) +
            ',\\quad \\nu=' + k,
            'chi2 quantiles: ' + qAlto.toFixed(4) + ' and ' + qBaixo.toFixed(4) + ', df = ' + k);
      C.pintar(grafico, [[0, qBaixo], [qAlto, X1]], [qBaixo, qAlto], dens, 0, X1);
      raiz.dataset.copia = 's = ' + s + ', n = ' + n + ', confidence = ' + conf +
                           '\nvariance: ' + intervalo(lo, hi) +
                           '\nSD: ' + intervalo(Math.sqrt(lo), Math.sqrt(hi));
      C.guardarURL({ s: cs.value, n: cn.value, conf: cc.value });
    }

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    [['s', cs], ['n', cn], ['conf', cc]].forEach(function (par) {
      var v = C.paramNum(par[0]);
      if (v !== null) par[1].value = v;
    });

    [cs, cn, cc].forEach(function (c) { c.addEventListener('input', atualizar); });
    atualizar();
  }

  /* ── Tabela ──────────────────────────────────────────────────────────────
     A célula carrega o χ² crítico; a linha dá os graus de liberdade e a
     coluna, o α. Clicar seleciona a célula, destaca linha e coluna e leva os
     três valores às calculadoras. Passar o mouse destaca a coluna (a linha o
     CSS já destaca). */
  function tabela() {
    var t = document.getElementById('myTable');
    if (!t) return;

    var alfas = Array.prototype.map.call(t.querySelectorAll('thead th'), function (th) {
      return parseFloat(th.textContent);
    });
    var coluna = function (i) {
      return Array.prototype.map.call(t.rows, function (r) { return r.cells[i]; }).filter(Boolean);
    };

    t.addEventListener('mouseover', function (e) {
      var td = e.target.closest('td');
      t.querySelectorAll('.highlight-col').forEach(function (c) { c.classList.remove('highlight-col'); });
      if (td && td.cellIndex > 0) coluna(td.cellIndex).forEach(function (c) { c.classList.add('highlight-col'); });
    });
    t.addEventListener('mouseleave', function () {
      t.querySelectorAll('.highlight-col').forEach(function (c) { c.classList.remove('highlight-col'); });
    });

    t.addEventListener('click', function (e) {
      var td = e.target.closest('td');
      if (!td || td.cellIndex < 1) return;

      var df = parseFloat(td.parentElement.cells[0].textContent);
      var x = parseFloat(td.textContent);
      var alfa = alfas[td.cellIndex];
      if (isNaN(x) || isNaN(df)) return;

      t.querySelectorAll('.selected, .has-selected, .has-selected-col').forEach(function (c) {
        c.classList.remove('selected', 'has-selected', 'has-selected-col');
      });
      td.classList.add('selected');
      td.parentElement.classList.add('has-selected');
      coluna(td.cellIndex).forEach(function (c) { c.classList.add('has-selected-col'); });

      document.dispatchEvent(new CustomEvent('mk:chi-escolhido', { detail: { x: x, df: df } }));
      if (!isNaN(alfa)) {
        document.dispatchEvent(new CustomEvent('mk:chi-celula', { detail: { alfa: alfa, df: df } }));
      }
    });
  }

  function iniciar() {
    C.formulasFixas();
    pvalor();
    critico();
    intervaloVariancia();
    tabela();
    C.tema();
    C.liberarURL();
    document.querySelectorAll('[data-ano]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
