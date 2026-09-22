/* Calculadoras da tabela F de Snedecor. A matemática, o desenho e o estado na
   URL vêm de stat-calc-core.js.

   A F não é simétrica e vive em x > 0, então o eixo aqui não é fixo: ele se
   estica até um pouco além do quantil 0,999 do par de graus de liberdade em
   uso — com ν1 = ν2 = 1 a cauda vai longe, com ν altos a curva se aperta em
   torno de 1. */
(function () {
  'use strict';

  var C = window.MKCalc;
  if (!C) return;

  function densidade(v1, v2) {
    return function (x) { return C.fpdf(x, v1, v2); };
  }

  /* Até onde desenhar. O limite superior precisa caber a marca do valor
     observado, senão a linha tracejada fica fora do quadro. */
  function limite(v1, v2, marcas) {
    var alto = C.finv(0.999, v1, v2);
    if (!isFinite(alto) || alto <= 0) alto = 5;
    (marcas || []).forEach(function (m) {
      if (isFinite(m)) alto = Math.max(alto, m * 1.15);
    });
    return Math.min(Math.max(alto, 2), 200);
  }

  function valido(v) {
    return v > 0 && isFinite(v);
  }

  /* ── 1. p-valor a partir de um F ─────────────────────────────────────────
     Numa ANOVA ou num teste de variâncias, a pergunta é sempre a cauda
     direita: qual a chance de um F tão grande quanto este por acaso. */
  function pvalor() {
    var raiz = document.getElementById('calc-fp');
    if (!raiz) return;

    var cf = raiz.querySelector('[data-campo="f"]');
    var sf = raiz.querySelector('[data-slider="f"]');
    var c1 = raiz.querySelector('[data-campo="v1"]');
    var c2 = raiz.querySelector('[data-campo="v2"]');
    var valor = raiz.querySelector('[data-valor]');
    var legenda = raiz.querySelector('[data-legenda]');
    var grafico = raiz.querySelector('[data-plot]');
    var lista = raiz.querySelector('[data-linhas]');
    var aviso = raiz.querySelector('[data-aviso]');
    var botao = raiz.querySelector('[data-copiar]');
    var escolhida = 0;

    function atualizar() {
      var f = C.num(cf, 1);
      var v1 = C.num(c1, 5), v2 = C.num(c2, 10);

      if (!valido(v1) || !valido(v2) || !(f > 0)) {
        aviso.hidden = false;
        valor.textContent = '—';
        lista.innerHTML = '';
        return;
      }
      aviso.hidden = true;

      var dens = densidade(v1, v2);
      var X1 = limite(v1, v2, [f]);
      var nf = C.enxuto(f), n1 = C.enxuto(v1), n2 = C.enxuto(v2);

      var its = [
        { texto: 'P(F > f)  (right tail)', tex: 'P(F>f)',
          texNum: 'P(F>' + nf + '\\mid ' + n1 + ',' + n2 + ')=1-F(' + nf + ')',
          p: C.limitar(1 - C.fcdf(f, v1, v2)), faixas: [[f, X1]], marcas: [f] },
        { texto: 'P(F < f)', tex: 'P(F<f)',
          texNum: 'P(F<' + nf + '\\mid ' + n1 + ',' + n2 + ')=F(' + nf + ')',
          p: C.limitar(C.fcdf(f, v1, v2)), faixas: [[0, f]], marcas: [f] }
      ];

      C.linhas(lista, its, dens, 0, X1);
      lista.querySelectorAll('.calc-row').forEach(function (li) {
        li.classList.toggle('is-on', +li.dataset.i === escolhida);
      });

      var it = its[escolhida];
      valor.textContent = C.fmt(it.p);
      C.tex(legenda, it.texNum, it.texto);
      C.pintar(grafico, it.faixas, it.marcas, dens, 0, X1);
      raiz.dataset.copia = 'F = ' + f + ', v1 = ' + v1 + ', v2 = ' + v2 + '\n' +
        its.map(function (i) { return i.texto + ' = ' + C.fmt(i.p); }).join('\n');
      C.guardarURL({ f: cf.value, v1: c1.value, v2: c2.value });
    }

    lista.addEventListener('click', function (e) {
      var li = e.target.closest('.calc-row');
      if (!li) return;
      escolhida = +li.dataset.i;
      atualizar();
    });

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var fURL = C.paramNum('f'), u1 = C.paramNum('v1'), u2 = C.paramNum('v2');
    if (fURL !== null) { cf.value = fURL; if (sf) sf.value = fURL; }
    if (u1 !== null) c1.value = u1;
    if (u2 !== null) c2.value = u2;

    C.parear(cf, sf, atualizar);
    c1.addEventListener('input', atualizar);
    c2.addEventListener('input', atualizar);
    atualizar();

    document.addEventListener('mk:f-escolhido', function (e) {
      cf.value = e.detail.f;
      if (sf) sf.value = e.detail.f;
      if (e.detail.v1) c1.value = e.detail.v1;
      if (e.detail.v2) c2.value = e.detail.v2;
      atualizar();
    });
  }

  /* ── 2. F crítico ────────────────────────────────────────────────────────
     A tabela impressa traz quatro α e dezoito colunas; aqui vale qualquer
     combinação. */
  function critico() {
    var raiz = document.getElementById('calc-fcrit');
    if (!raiz) return;

    var ca = raiz.querySelector('[data-campo="alpha"]');
    var sa = raiz.querySelector('[data-slider="alpha"]');
    var c1 = raiz.querySelector('[data-campo="v1"]');
    var c2 = raiz.querySelector('[data-campo="v2"]');
    var valor = raiz.querySelector('[data-valor]');
    var legenda = raiz.querySelector('[data-legenda]');
    var grafico = raiz.querySelector('[data-plot]');
    var aviso = raiz.querySelector('[data-aviso]');
    var botao = raiz.querySelector('[data-copiar]');

    function atualizar() {
      var alfa = C.num(ca, 0.05);
      var v1 = C.num(c1, 5), v2 = C.num(c2, 10);

      if (!valido(v1) || !valido(v2) || !(alfa > 0 && alfa < 1)) {
        aviso.hidden = false;
        valor.textContent = '—';
        return;
      }
      aviso.hidden = true;

      var f = C.finv(1 - alfa, v1, v2);
      var dens = densidade(v1, v2);
      var X1 = limite(v1, v2, [f]);

      valor.textContent = isFinite(f) ? f.toFixed(4) : '—';
      C.tex(legenda,
            'F_{' + C.enxuto(alfa) + ';\\,' + C.enxuto(v1) + ',\\,' + C.enxuto(v2) +
            '}=F^{-1}(1-' + C.enxuto(alfa) + ')',
            'critical F');
      C.pintar(grafico, [[f, X1]], [f], dens, 0, X1);
      raiz.dataset.copia = 'alpha = ' + alfa + ', v1 = ' + v1 + ', v2 = ' + v2 +
                           '\ncritical F = ' + f.toFixed(5);
      C.guardarURL({ a: ca.value, av1: c1.value, av2: c2.value });
    }

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    var aURL = C.paramNum('a'), u1 = C.paramNum('av1'), u2 = C.paramNum('av2');
    if (aURL !== null) { ca.value = aURL; if (sa) sa.value = aURL; }
    if (u1 !== null) c1.value = u1;
    if (u2 !== null) c2.value = u2;

    C.parear(ca, sa, atualizar);
    c1.addEventListener('input', atualizar);
    c2.addEventListener('input', atualizar);
    atualizar();

    document.addEventListener('mk:f-celula', function (e) {
      ca.value = e.detail.alfa;
      if (sa) sa.value = e.detail.alfa;
      c1.value = e.detail.v1;
      c2.value = e.detail.v2;
      atualizar();
    });
  }

  /* ── 3. teste F de duas variâncias ───────────────────────────────────────
     O uso mais direto desta tabela: comparar a dispersão de duas amostras.
     Por convenção a maior variância vai no numerador, o que deixa o teste na
     cauda direita — é a forma em que a tabela é publicada. */
  function testeVariancias() {
    var raiz = document.getElementById('calc-ftest');
    if (!raiz) return;

    var cs1 = raiz.querySelector('[data-campo="s1"]');
    var cn1 = raiz.querySelector('[data-campo="n1"]');
    var cs2 = raiz.querySelector('[data-campo="s2"]');
    var cn2 = raiz.querySelector('[data-campo="n2"]');
    var fOut = raiz.querySelector('[data-f]');
    var dfOut = raiz.querySelector('[data-df]');
    var pUm = raiz.querySelector('[data-p-uma]');
    var pDois = raiz.querySelector('[data-p-duas]');
    var grafico = raiz.querySelector('[data-plot]');
    var aviso = raiz.querySelector('[data-aviso]');
    var formula = raiz.querySelector('[data-formula-f]');
    var botao = raiz.querySelector('[data-copiar]');

    function atualizar() {
      var s1 = C.num(cs1, 1), n1 = C.num(cn1, 10);
      var s2 = C.num(cs2, 1), n2 = C.num(cn2, 10);

      if (!(s1 > 0) || !(s2 > 0) || !(n1 >= 2) || !(n2 >= 2)) {
        aviso.hidden = false;
        fOut.textContent = '—';
        dfOut.textContent = '—';
        pUm.textContent = '—';
        pDois.textContent = '—';
        C.tex(formula, 'F=\\frac{s_{1}^{2}}{s_{2}^{2}}', 'F = s1^2 / s2^2');
        return;
      }
      aviso.hidden = true;

      /* A maior variância no numerador: assim F ≥ 1 e a cauda de interesse é
         sempre a direita, como na tabela. */
      var maior = Math.max(s1 * s1, s2 * s2);
      var menor = Math.min(s1 * s1, s2 * s2);
      var v1 = (s1 * s1 >= s2 * s2 ? n1 : n2) - 1;
      var v2 = (s1 * s1 >= s2 * s2 ? n2 : n1) - 1;

      var f = maior / menor;
      var dens = densidade(v1, v2);
      var X1 = limite(v1, v2, [f]);
      var cauda = C.limitar(1 - C.fcdf(f, v1, v2));

      fOut.textContent = f.toFixed(5);
      dfOut.textContent = v1 + ', ' + v2;
      pUm.textContent = C.fmt(cauda);
      pDois.textContent = C.fmt(Math.min(1, 2 * cauda));
      C.tex(formula,
            'F=\\frac{s_{\\max}^{2}}{s_{\\min}^{2}}=\\frac{' + C.enxuto(Math.round(maior * 1e4) / 1e4) +
            '}{' + C.enxuto(Math.round(menor * 1e4) / 1e4) + '}=' +
            C.enxuto(Math.round(f * 1e5) / 1e5),
            'F = larger variance / smaller variance');
      C.pintar(grafico, [[f, X1]], [f], dens, 0, X1);
      raiz.dataset.copia = 's1 = ' + s1 + ' (n=' + n1 + '), s2 = ' + s2 + ' (n=' + n2 + ')' +
                           '\nF = ' + f.toFixed(5) + ', df = ' + v1 + ', ' + v2 +
                           '\none-tailed p = ' + C.fmt(cauda) +
                           '\ntwo-tailed p = ' + C.fmt(Math.min(1, 2 * cauda));
      C.guardarURL({ s1: cs1.value, n1: cn1.value, s2: cs2.value, n2: cn2.value });
    }

    if (botao) botao.addEventListener('click', function () { C.copiar(botao, raiz.dataset.copia); });

    [['s1', cs1], ['n1', cn1], ['s2', cs2], ['n2', cn2]].forEach(function (par) {
      var v = C.paramNum(par[0]);
      if (v !== null) par[1].value = v;
    });

    [cs1, cn1, cs2, cn2].forEach(function (c) { c.addEventListener('input', atualizar); });
    atualizar();
  }

  /* ── Ponte com a tabela ──────────────────────────────────────────────────
     Cada célula carrega quatro informações: o F crítico, o α da linha, o v2
     do grupo e o v1 da coluna. O índice da coluna depende de a linha abrir ou
     não um grupo — só a primeira de cada quarteto traz a célula de v2. */
  function ponte() {
    var tabela = document.getElementById('myTable');
    if (!tabela) return;

    var linhasCab = tabela.querySelectorAll('thead tr');
    var colunas = [];
    if (linhasCab.length) {
      linhasCab[linhasCab.length - 1].querySelectorAll('th').forEach(function (th) {
        colunas.push(parseFloat(th.textContent));
      });
    }

    tabela.addEventListener('click', function (e) {
      var td = e.target.closest('td');
      if (!td) return;

      var linha = td.parentElement;
      var abreGrupo = linha.cells[0] && linha.cells[0].hasAttribute('rowspan');
      var colAlfa = abreGrupo ? 1 : 0;
      if (td.cellIndex <= colAlfa) return;

      var v2 = null;
      if (abreGrupo) {
        v2 = parseFloat(linha.cells[0].textContent);
      } else {
        var anterior = linha.previousElementSibling;
        while (anterior) {
          if (anterior.cells[0] && anterior.cells[0].hasAttribute('rowspan')) {
            v2 = parseFloat(anterior.cells[0].textContent);
            break;
          }
          anterior = anterior.previousElementSibling;
        }
      }

      var alfa = parseFloat(linha.cells[colAlfa].textContent);
      var v1 = colunas[td.cellIndex - colAlfa - 1];
      var f = parseFloat(td.textContent);
      if (isNaN(f) || isNaN(v1) || v2 === null || isNaN(v2)) return;

      document.dispatchEvent(new CustomEvent('mk:f-escolhido', {
        detail: { f: f, v1: v1, v2: v2 }
      }));
      if (!isNaN(alfa)) {
        document.dispatchEvent(new CustomEvent('mk:f-celula', {
          detail: { alfa: alfa, v1: v1, v2: v2 }
        }));
      }
    }, true);
  }

  function iniciar() {
    C.formulasFixas();
    pvalor();
    critico();
    testeVariancias();
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
