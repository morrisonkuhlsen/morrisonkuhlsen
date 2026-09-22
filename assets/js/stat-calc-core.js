/* Núcleo das calculadoras das tabelas (z, t e o que vier). Sem dependências.
   Publica window.MKCalc: distribuições, desenho da curva, notação, estado na
   URL e as miudezas de interface que as três páginas repetiriam.

   Cada página traz só as suas calculadoras; o que é comum mora aqui, para não
   haver duas implementações da mesma conta divergindo com o tempo. */
(function () {
  'use strict';

  /* ── Normal padrão ───────────────────────────────────────────────────────
     erfc pela aproximação de Chebyshev do Numerical Recipes: erro relativo da
     ordem de 1e-15, e que não desmorona na cauda — é lá que uma aproximação
     grosseira erraria feio. */
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

  /* P(Z < z). O zero é devolvido exato: a aproximação erra por ~1e-15 ali, e
     diferenças como P(0 < Z < z) subtraem 0,5 — o resíduo apareceria na tela
     como 7.772e-16, ou como uma probabilidade negativa. */
  function ncdf(z) {
    if (z === 0) return 0.5;
    return 0.5 * erfc(-z / Math.SQRT2);
  }

  function npdf(z) {
    return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  }

  /* Φ⁻¹: aproximação racional de Acklam (erro ~1e-9) fechada com um passo de
     Halley sobre a própria cdf, o que leva o resultado à precisão da máquina. */
  var IA = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
            1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  var IB = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
            6.680131188771972e+01, -1.328068155288572e+01];
  var IC = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
            -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  var ID = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
            3.754408661907416e+00];

  function ninv(p) {
    if (!(p > 0 && p < 1)) return NaN;
    var corte = 0.02425, q, r, x;

    if (p < corte) {
      q = Math.sqrt(-2 * Math.log(p));
      x = (((((IC[0] * q + IC[1]) * q + IC[2]) * q + IC[3]) * q + IC[4]) * q + IC[5]) /
          ((((ID[0] * q + ID[1]) * q + ID[2]) * q + ID[3]) * q + 1);
    } else if (p <= 1 - corte) {
      q = p - 0.5;
      r = q * q;
      x = (((((IA[0] * r + IA[1]) * r + IA[2]) * r + IA[3]) * r + IA[4]) * r + IA[5]) * q /
          (((((IB[0] * r + IB[1]) * r + IB[2]) * r + IB[3]) * r + IB[4]) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((IC[0] * q + IC[1]) * q + IC[2]) * q + IC[3]) * q + IC[4]) * q + IC[5]) /
           ((((ID[0] * q + ID[1]) * q + ID[2]) * q + ID[3]) * q + 1);
    }

    var erro = ncdf(x) - p;
    var u = erro * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }

  /* ── t de Student ────────────────────────────────────────────────────────
     A cdf da t é a beta incompleta regularizada. lgamma por Lanczos e I_x(a,b)
     pela fração continuada de Lentz — as duas receitas clássicas, porque uma
     série ingênua perde precisão justo com poucos graus de liberdade, que é
     onde a t importa. */
  var LG = [76.18009172947146, -86.50532032941677, 24.01409824083091,
            -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];

  function lgamma(x) {
    var y = x, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    var ser = 1.000000000190015;
    for (var j = 0; j < 6; j++) ser += LG[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }

  function betacf(a, b, x) {
    var MAXIT = 200, EPS = 3e-16, FPMIN = 1e-300;
    var qab = a + b, qap = a + 1, qam = a - 1;
    var c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    var h = d, m, m2, aa, del;

    for (m = 1; m <= MAXIT; m++) {
      m2 = 2 * m;
      aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      h *= d * c;

      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      del = d * c;
      h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }

  /* I_x(a, b) */
  function betai(a, b, x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) +
                      a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }

  /* P(T < t) com v graus de liberdade. */
  function tcdf(t, v) {
    if (!(v > 0)) return NaN;
    if (t === 0) return 0.5;
    var cauda = 0.5 * betai(v / 2, 0.5, v / (v + t * t));
    return t > 0 ? 1 - cauda : cauda;
  }

  function tpdf(t, v) {
    var lg = lgamma((v + 1) / 2) - lgamma(v / 2) - 0.5 * Math.log(v * Math.PI);
    return Math.exp(lg - (v + 1) / 2 * Math.log(1 + t * t / v));
  }

  /* Quantil da t. Bisseção, e não Newton: com poucos graus de liberdade as
     caudas são longas e um Newton mal iniciado escapa para o infinito. O
     chute de partida vem da normal, que já põe o intervalo perto. */
  function tinv(p, v) {
    if (!(p > 0 && p < 1) || !(v > 0)) return NaN;
    if (p === 0.5) return 0;

    var chute = ninv(p);
    var lo = chute - 5, hi = chute + 5;
    var passo = 0;
    while (tcdf(lo, v) > p && passo++ < 80) lo -= Math.max(5, Math.abs(lo));
    passo = 0;
    while (tcdf(hi, v) < p && passo++ < 80) hi += Math.max(5, Math.abs(hi));

    for (var i = 0; i < 200; i++) {
      var meio = (lo + hi) / 2;
      if (tcdf(meio, v) < p) lo = meio; else hi = meio;
      if (hi - lo < 1e-13 * Math.max(1, Math.abs(meio))) break;
    }
    return (lo + hi) / 2;
  }

  /* ── Formatação ──────────────────────────────────────────────────────────
     Cinco casas, como as tabelas. Abaixo disso o arredondamento viraria
     0.00000 e esconderia justamente o que interessa numa cauda. */
  function limitar(p) {
    return Math.min(1, Math.max(0, p));
  }

  function fmt(p) {
    if (!isFinite(p)) return '—';
    p = limitar(p);
    if (p === 0) return '0.00000';
    if (p < 1e-5) return p.toExponential(3);
    return p.toFixed(5);
  }

  /* Números dentro da fórmula: sem casas sobrando, para a expressão não virar
     uma parede de zeros. */
  function enxuto(v) {
    return String(Math.round(v * 1e6) / 1e6);
  }

  function num(el, padrao) {
    var v = parseFloat(el.value);
    return isNaN(v) ? padrao : v;
  }

  /* ── Desenho ─────────────────────────────────────────────────────────────
     Uma curva com as faixas pedidas preenchidas. O mesmo desenho serve ao
     painel grande e às miniaturas da lista: muda só o tamanho. A densidade
     vem de fora, então a mesma função desenha a normal e a t. */
  var PASSOS = 160;

  function plot(largura, altura, faixas, marcas, mini, dens, x0, x1) {
    var padLado = mini ? 2 : 14;
    var padBaixo = mini ? 4 : 18;
    var padTopo = mini ? 3 : 10;
    var w = largura - padLado * 2;
    var h = altura - padBaixo - padTopo;
    var yMax = dens(0);

    var px = function (x) { return padLado + (x - x0) / (x1 - x0) * w; };
    var py = function (y) { return padTopo + h - (y / yMax) * h; };

    var svg = '';

    /* Faixas primeiro, para a curva ficar por cima da área. */
    (faixas || []).forEach(function (faixa) {
      var de = Math.max(faixa[0], x0), ate = Math.min(faixa[1], x1);
      if (!(ate > de)) return;
      var d = 'M ' + px(de).toFixed(2) + ' ' + py(0).toFixed(2);
      var n = Math.max(2, Math.round((ate - de) / (x1 - x0) * PASSOS));
      for (var i = 0; i <= n; i++) {
        var x = de + (ate - de) * i / n;
        d += ' L ' + px(x).toFixed(2) + ' ' + py(dens(x)).toFixed(2);
      }
      d += ' L ' + px(ate).toFixed(2) + ' ' + py(0).toFixed(2) + ' Z';
      svg += '<path class="calc-plot__area" d="' + d + '"/>';
    });

    var curva = '';
    for (var k = 0; k <= PASSOS; k++) {
      var xv = x0 + (x1 - x0) * k / PASSOS;
      curva += (k ? ' L ' : 'M ') + px(xv).toFixed(2) + ' ' + py(dens(xv)).toFixed(2);
    }
    svg += '<path class="calc-plot__curve" d="' + curva + '"/>';
    svg += '<line class="calc-plot__axis" x1="' + px(x0) + '" y1="' + py(0) +
           '" x2="' + px(x1) + '" y2="' + py(0) + '"/>';

    if (!mini) {
      var marcaEixo = Math.max(1, Math.round((x1 - x0) / 8));
      for (var t = Math.ceil(x0 + 1); t <= x1 - 1; t += marcaEixo) {
        svg += '<line class="calc-plot__tick" x1="' + px(t) + '" y1="' + py(0) +
               '" x2="' + px(t) + '" y2="' + (py(0) + 4) + '"/>';
        svg += '<text class="calc-plot__label" x="' + px(t) + '" y="' + (py(0) + 14) +
               '" text-anchor="middle">' + t + '</text>';
      }

      (marcas || []).forEach(function (m) {
        if (m < x0 || m > x1) return;
        svg += '<line class="calc-plot__mark" x1="' + px(m).toFixed(2) + '" y1="' + py(0) +
               '" x2="' + px(m).toFixed(2) + '" y2="' + py(dens(m)).toFixed(2) + '"/>';
      });
    }

    return svg;
  }

  function pintar(el, faixas, marcas, dens, x0, x1) {
    if (!el) return;
    var mini = el.classList.contains('calc-plot--mini');
    var vb = el.getAttribute('viewBox').split(/\s+/);
    el.innerHTML = plot(+vb[2], +vb[3], faixas, marcas, mini, dens, x0, x1);
  }

  /* ── Notação ─────────────────────────────────────────────────────────────
     KaTeX quando ele carrega; se não carregar, o texto simples continua
     legível. Nada aqui depende dele. */
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

  function formulasFixas() {
    document.querySelectorAll('[data-tex]').forEach(function (el) {
      tex(el, el.dataset.tex, el.textContent);
    });
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

  /* Cada linha da lista: fórmula, valor e a miniatura da área. */
  function linhas(lista, itens, dens, x0, x1) {
    lista.innerHTML = itens.map(function (item, i) {
      return '<li class="calc-row" data-i="' + i + '" tabindex="0" role="button">' +
               '<span class="calc-row__label"></span>' +
               '<span class="calc-row__value">' + fmt(item.p) + '</span>' +
               '<svg class="calc-plot calc-plot--mini" viewBox="0 0 54 26" aria-hidden="true"></svg>' +
             '</li>';
    }).join('');

    lista.querySelectorAll('.calc-row').forEach(function (li, i) {
      tex(li.querySelector('.calc-row__label'), itens[i].tex, itens[i].texto);
      pintar(li.querySelector('svg'), itens[i].faixas, [], dens, x0, x1);
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

  /* ── Estado na URL ───────────────────────────────────────────────────────
     O que está na tela vai para a barra de endereço, e o que vem na barra de
     endereço volta para a tela: é o que permite guardar nos favoritos ou
     mandar o resultado pronto para alguém.

     replaceState, não pushState: cada tecla digitada criaria uma entrada no
     histórico, e o botão "voltar" do navegador viraria um desfazer. */
  var params = new URLSearchParams(location.search);
  var gravando = false;
  /* Só depois que a página assenta: sem isto, abrir já encheria a barra de
     endereço com os valores padrão de todos os cards. */
  var podeGravar = false;

  function paramNum(nome) {
    if (!params.has(nome)) return null;
    var v = parseFloat(params.get(nome));
    return isNaN(v) ? null : v;
  }

  function paramTexto(nome) {
    return params.get(nome);
  }

  function guardarURL(pares) {
    if (!podeGravar || gravando) return;
    gravando = true;
    /* Junta as mudanças do mesmo gesto numa escrita só. setTimeout, e não
       requestAnimationFrame: em aba de segundo plano o quadro não chega, e a
       trava ficaria presa para sempre. */
    setTimeout(function () {
      gravando = false;
      Object.keys(pares).forEach(function (k) {
        var v = pares[k];
        if (v === null || v === undefined || v === '') params.delete(k);
        else params.set(k, v);
      });
      var busca = params.toString();
      history.replaceState(null, '', busca ? location.pathname + '?' + busca : location.pathname);
    }, 0);
  }

  function liberarURL() {
    setTimeout(function () { podeGravar = true; }, 0);
  }

  /* ── Tema ────────────────────────────────────────────────────────────────
     Por padrão a página segue o sistema; o botão fixa a escolha. Guardamos só
     quando ela difere do sistema, para quem mudar a preferência do sistema
     depois não ficar preso ao que clicou uma vez. */
  function tema() {
    var botao = document.getElementById('themeBtn');
    if (!botao) return;

    var raiz = document.documentElement;
    var sistemaClaro = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');

    function atual() {
      var fixado = raiz.getAttribute('data-theme');
      if (fixado) return fixado;
      return sistemaClaro && sistemaClaro.matches ? 'light' : 'dark';
    }

    function aplicar(novo) {
      var doSistema = sistemaClaro && sistemaClaro.matches ? 'light' : 'dark';
      if (novo === doSistema) {
        raiz.removeAttribute('data-theme');
        try { localStorage.removeItem('ztable-theme'); } catch (e) {}
      } else {
        raiz.setAttribute('data-theme', novo);
        try { localStorage.setItem('ztable-theme', novo); } catch (e) {}
      }
      botao.setAttribute('aria-pressed', novo === 'light' ? 'true' : 'false');
    }

    aplicar(atual());
    botao.addEventListener('click', function () {
      aplicar(atual() === 'dark' ? 'light' : 'dark');
    });
  }

  window.MKCalc = {
    erfc: erfc, ncdf: ncdf, npdf: npdf, ninv: ninv,
    lgamma: lgamma, betai: betai, tcdf: tcdf, tpdf: tpdf, tinv: tinv,
    fmt: fmt, limitar: limitar, enxuto: enxuto, num: num,
    plot: plot, pintar: pintar, tex: tex, formulasFixas: formulasFixas,
    parear: parear, linhas: linhas, copiar: copiar,
    paramNum: paramNum, paramTexto: paramTexto, guardarURL: guardarURL,
    liberarURL: liberarURL, tema: tema
  };
})();
