/* Tema de Natal: neve no hero. Só é baixado quando o script inline de
   head.html liga o tema (dezembro, ou ?tema=natal). As cores e o gorro da
   logo são CSS (_natal.scss); aqui fica só o que precisa de animação.

   Cuidados: nada de neve para quem pediu menos movimento; a animação para
   quando o hero sai da tela ou a aba fica oculta; o número de flocos cresce
   com a área do hero, com teto, para não pesar em telas grandes. */
(function () {
  'use strict';

  function iniciar() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'hero__neve';
    canvas.setAttribute('aria-hidden', 'true');
    hero.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var largura = 0, altura = 0, flocos = [];
    var rodando = false, visivel = true, quadro = 0, ultimo = 0;

    function novoFloco(noTopo) {
      var r = 0.8 + Math.random() * 2.2;               /* raio em px */
      return {
        x: Math.random() * largura,
        y: noTopo ? -r * 2 : Math.random() * altura,
        r: r,
        vy: 18 + r * 14 + Math.random() * 10,           /* px/s: flocos maiores caem mais rápido */
        fase: Math.random() * Math.PI * 2,
        balanco: 8 + Math.random() * 16,                /* amplitude do vaivém, px */
        freq: 0.4 + Math.random() * 0.6,                /* vaivém, rad/s */
        alfa: 0.35 + Math.random() * 0.45
      };
    }

    function medir() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = hero.clientWidth;
      altura = hero.clientHeight;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* ~1 floco a cada 9.000 px², entre 25 e 140. */
      var alvo = Math.max(25, Math.min(140, Math.round(largura * altura / 9000)));
      while (flocos.length < alvo) flocos.push(novoFloco(false));
      flocos.length = alvo;
    }

    function passo(t) {
      var dt = ultimo ? Math.min((t - ultimo) / 1000, 0.05) : 0;
      ultimo = t;
      ctx.clearRect(0, 0, largura, altura);
      ctx.fillStyle = '#ffffff';
      for (var i = 0; i < flocos.length; i++) {
        var f = flocos[i];
        f.y += f.vy * dt;
        f.fase += f.freq * dt;
        if (f.y - f.r > altura) flocos[i] = f = novoFloco(true);
        var x = f.x + Math.sin(f.fase) * f.balanco;
        ctx.globalAlpha = f.alfa;
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      quadro = requestAnimationFrame(passo);
    }

    function atualizar() {
      var deveRodar = visivel && !document.hidden;
      if (deveRodar && !rodando) {
        rodando = true;
        ultimo = 0;
        quadro = requestAnimationFrame(passo);
      } else if (!deveRodar && rodando) {
        rodando = false;
        cancelAnimationFrame(quadro);
      }
    }

    medir();
    new ResizeObserver(medir).observe(hero);
    new IntersectionObserver(function (entradas) {
      visivel = entradas[0].isIntersecting;
      atualizar();
    }).observe(hero);
    document.addEventListener('visibilitychange', atualizar);
    atualizar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
