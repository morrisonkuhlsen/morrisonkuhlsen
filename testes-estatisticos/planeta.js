/* Hero do catálogo: o nascer do sol visto da órbita, à noite. O planeta é
 * uma curva suave e escura que atravessa a tela; acima dela, a atmosfera é
 * uma faixa fina e brilhante, azul em toda a largura e laranja rente ao
 * horizonte perto do sol. O sol surge no horizonte como um ponto intenso,
 * com raios de difração em X, e ofusca as estrelas.
 *
 * Tudo num <canvas> atrás do texto. Com prefers-reduced-motion, desenha o
 * sol já nascido, parado; fora da tela, a animação para. */
(() => {
  const hero = document.querySelector(".pt-hero");
  const canvas = hero && hero.querySelector(".pt-hero-ceu");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const parado = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let semente = 11;
  const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;

  let W = 0, H = 0, dpr = 1, estrelas = [];
  // Estrias finas em volta do sol (como as das lentes de verdade), sorteadas
  // uma vez: ângulo, comprimento relativo e força.
  semente = 29;
  const estrias = Array.from({ length: 64 }, () => ({
    a: aleatorio() * Math.PI * 2,
    c: 0.15 + Math.pow(aleatorio(), 2) * 0.85,
    f: 0.25 + aleatorio() * 0.75,
  }));
  // Camada fora da tela: as faixas da atmosfera são pintadas nela (forma e
  // cor) e recortadas pela força ao longo do contorno antes de ir à tela.
  const camada = document.createElement("canvas");
  const cctx = camada.getContext("2d");

  function medir() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = hero.clientWidth;
    H = hero.clientHeight;
    for (const c of [canvas, camada]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    semente = 11;
    estrelas = Array.from({ length: Math.round((W * H) / 14000) }, () => ({
      x: aleatorio() * W,
      y: aleatorio() * H * 0.36,
      r: 0.4 + aleatorio() * 0.7,
      base: 0.15 + aleatorio() * 0.45,
      fase: aleatorio() * Math.PI * 2,
      vel: 0.5 + aleatorio() * 1.5,
    }));
  }

  // O sol nasce nos primeiros segundos. `nascer` vai de 0 a 1.
  const DURACAO = 4.5;
  const easeOut = x => 1 - Math.pow(1 - x, 3);

  function desenhar(ms) {
    const t = ms / 1000;
    const nascer = parado ? 1 : easeOut(Math.min(1, t / DURACAO));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);

    // Geometria: um planeta tão grande que a borda é uma curva suave, com o
    // topo a 36% da altura. O sol fica no topo da curva, no centro.
    const R = Math.max(W * 3, 2400);
    const cx = W / 2, topo = H * 0.36, cy = topo + R;
    // Um pouco à esquerda do centro: os reflexos da lente seguem a linha do
    // sol ao centro da tela e caem à direita, fora do título.
    const sx = cx - W * 0.12;
    const by = cy - Math.sqrt(R * R - (sx - cx) ** 2); // a borda sob o sol
    const sy = by + 10 - 13 * nascer; // sobe até 3 px acima da borda

    // Estrelas fracas, que o sol apaga ao nascer.
    for (const s of estrelas) {
      let a = parado ? s.base : s.base * (0.6 + 0.4 * Math.sin(t * s.vel + s.fase));
      a *= 1 - 0.8 * nascer;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Uma faixa da atmosfera: anel entre R + de e R + ate, com as cores de
    // `pare` (de dentro para fora) e a força ao longo do contorno dada pela
    // distância angular ao sol (`queda`: em radianos, até onde a faixa vai).
    const faixa = (de, ate, pare, queda, alfa) => {
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cctx.globalCompositeOperation = "source-over";
      cctx.clearRect(0, 0, W, H);
      const r = cctx.createRadialGradient(cx, cy, R + de, cx, cy, R + ate);
      for (const [p, cor] of pare) r.addColorStop(p, cor);
      cctx.fillStyle = r;
      cctx.beginPath();
      cctx.arc(cx, cy, R + ate, 0, Math.PI * 2);
      cctx.arc(cx, cy, R + de, 0, Math.PI * 2, true);
      cctx.fill();
      // Força ao longo da borda: gradiente cônico a partir do sol (no alto).
      cctx.globalCompositeOperation = "destination-in";
      const c = cctx.createConicGradient(Math.atan2(sy - cy, sx - cx), cx, cy);
      const q = queda / (Math.PI * 2);
      c.addColorStop(0, `rgba(0,0,0,${alfa})`);
      c.addColorStop(q * 0.25, `rgba(0,0,0,${alfa * 0.8})`);
      c.addColorStop(q, `rgba(0,0,0,${alfa * 0.35})`);
      c.addColorStop(Math.min(0.5, q * 3), "rgba(0,0,0,0)");
      c.addColorStop(Math.max(0.5, 1 - q * 3), "rgba(0,0,0,0)");
      c.addColorStop(1 - q, `rgba(0,0,0,${alfa * 0.35})`);
      c.addColorStop(1 - q * 0.25, `rgba(0,0,0,${alfa * 0.8})`);
      c.addColorStop(1, `rgba(0,0,0,${alfa})`);
      cctx.fillStyle = c;
      cctx.fillRect(0, 0, W, H);
      ctx.drawImage(camada, 0, 0, W, H);
    };
    // Meia largura da tela, vista do centro do planeta, em radianos.
    const meia = Math.asin(Math.min(1, W / 2 / R));
    const k = 0.25 + 0.75 * nascer;

    // Azul em toda a largura: fino e forte rente à borda, um véu largo acima.
    ctx.globalCompositeOperation = "lighter";
    faixa(-1, 60, [
      [0, "rgba(150,200,255,1)"],
      [0.06, "rgba(90,160,255,0.9)"],
      [0.22, "rgba(40,90,220,0.35)"],
      [1, "rgba(20,40,140,0)"],
    ], meia * 1.6, k);
    // Linha clara do horizonte.
    faixa(-1.2, 3, [
      [0, "rgba(230,240,255,0)"],
      [0.35, "rgba(230,240,255,1)"],
      [1, "rgba(200,225,255,0)"],
    ], meia * 1.3, k);
    // Laranja rente ao horizonte, só perto do sol.
    faixa(-2, 5, [
      [0, "rgba(255,120,40,0)"],
      [0.3, "rgba(255,150,60,1)"],
      [1, "rgba(255,190,110,0)"],
    ], meia * 0.55, 0.9 * nascer);
    ctx.globalCompositeOperation = "source-over";

    // O planeta, quase preto, com um reflexo laranja-escuro logo abaixo da
    // borda perto do sol.
    ctx.fillStyle = "#030406";
    ctx.beginPath();
    ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    faixa(-14, -1, [
      [0, "rgba(120,50,10,0)"],
      [1, "rgba(160,80,30,0.8)"],
    ], meia * 0.5, 0.7 * nascer);

    sol(sx, sy, by, nascer, t);
  }

  /* ---------------------------------------------------------------- sol */

  // O sol como a câmera o registra: brilho em camadas, raios de difração,
  // estrias, rastro horizontal e os reflexos da lente.
  function sol(sx, sy, by, k, t) {
    if (k <= 0) return;
    const cintila = parado ? 1 : 0.94 + 0.06 * Math.sin(t * 2.3) * Math.sin(t * 3.7);
    ctx.globalCompositeOperation = "lighter";

    // Brilho: halos de raio crescente e força decrescente somados, que é o
    // perfil de uma fonte muito forte vista por uma lente.
    const halo = (r, cor, a) => {
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      g.addColorStop(0, `rgba(${cor},${a})`);
      g.addColorStop(0.25, `rgba(${cor},${a * 0.55})`);
      g.addColorStop(0.5, `rgba(${cor},${a * 0.18})`);
      g.addColorStop(0.75, `rgba(${cor},${a * 0.05})`);
      g.addColorStop(1, `rgba(${cor},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
    };
    halo(W * 0.7, "255,170,110", 0.16 * k);
    halo(260, "255,190,140", 0.3 * k);
    halo(110, "255,215,170", 0.55 * k * cintila);
    halo(42, "255,236,205", 0.85 * k);
    halo(16, "255,250,240", k);
    halo(7, "255,255,255", k);

    // Raios de difração: oito longos, de comprimentos desiguais, cada um com
    // um halo borrado em volta; e as estrias finas sorteadas.
    const L = Math.min(W, 1500) * 0.33 * (0.35 + 0.65 * k) * cintila;
    const raio = (ang, comp, larg, a) => {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(ang);
      const g = ctx.createLinearGradient(0, 0, comp, 0);
      g.addColorStop(0, `rgba(255,248,232,${a})`);
      g.addColorStop(0.08, `rgba(255,236,205,${a * 0.6})`);
      g.addColorStop(0.4, `rgba(255,214,170,${a * 0.18})`);
      g.addColorStop(1, "rgba(255,200,150,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -larg);
      ctx.lineTo(comp, 0);
      ctx.lineTo(0, larg);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    const longos = [[-0.45, 1], [0.35, 0.7], [1.12, 0.95], [1.9, 0.6], [2.7, 1.05], [3.48, 0.75], [4.25, 0.9], [5.05, 0.65]];
    if ("filter" in ctx) {
      ctx.filter = "blur(3px)";
      for (const [a, c] of longos) raio(a, L * c, 5, 0.22 * k);
      ctx.filter = "none";
    }
    for (const [a, c] of longos) raio(a, L * c, 1.1, 0.85 * k);
    for (const e of estrias) raio(e.a, L * 0.55 * e.c, 0.45, 0.22 * e.f * k);

    // Rastro anamórfico: uma linha fina e azulada atravessando a tela.
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1, 0.012);
    let g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.9);
    g.addColorStop(0, `rgba(200,225,255,${0.55 * k})`);
    g.addColorStop(0.3, `rgba(120,170,255,${0.18 * k})`);
    g.addColorStop(1, "rgba(80,120,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, W * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Anel de halo em volta do sol, com uma leve separação de cores.
    const anelHalo = (r, cor, a) => {
      const g2 = ctx.createRadialGradient(sx, sy, r * 0.92, sx, sy, r * 1.08);
      g2.addColorStop(0, `rgba(${cor},0)`);
      g2.addColorStop(0.5, `rgba(${cor},${a})`);
      g2.addColorStop(1, `rgba(${cor},0)`);
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 1.08, 0, Math.PI * 2);
      ctx.arc(sx, sy, r * 0.92, 0, Math.PI * 2, true);
      ctx.fill();
    };
    const rh = Math.min(W, H) * 0.42;
    anelHalo(rh * 0.985, "255,120,90", 0.018 * k);
    anelHalo(rh, "140,255,170", 0.015 * k);
    anelHalo(rh * 1.015, "120,140,255", 0.018 * k);

    // Reflexos da lente: na linha que vai do sol ao centro da tela e
    // continua do outro lado. Hexágonos (a abertura do diafragma) e discos,
    // de cores e tamanhos diferentes, bem transparentes.
    const ox = W / 2, oy = H / 2;
    const fantasmas = [
      [0.32, 26, "hex", "120,200,255", 0.10],
      [0.55, 12, "disco", "255,190,120", 0.16],
      [0.78, 48, "hex", "170,120,255", 0.07],
      [1.12, 18, "disco", "120,255,200", 0.10],
      [1.38, 70, "anel", "255,170,120", 0.08],
      [1.62, 34, "hex", "120,170,255", 0.08],
      [1.95, 110, "hex", "255,140,200", 0.045],
      [2.25, 9, "disco", "255,240,200", 0.18],
    ];
    for (const [d, r, forma, cor, a] of fantasmas) {
      const fx = sx + (ox - sx) * d, fy = sy + (oy - sy) * d;
      const alfa = 0.7 * a * k * k;
      ctx.save();
      ctx.translate(fx, fy);
      if (forma === "anel") {
        ctx.strokeStyle = `rgba(${cor},${alfa})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const g3 = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g3.addColorStop(0, `rgba(${cor},${alfa * 0.5})`);
        g3.addColorStop(0.8, `rgba(${cor},${alfa})`);
        g3.addColorStop(1, `rgba(${cor},${alfa * 0.3})`);
        ctx.fillStyle = g3;
        ctx.beginPath();
        if (forma === "hex") {
          for (let i = 0; i < 6; i++) {
            const an = i * Math.PI / 3 + 0.26;
            ctx[i ? "lineTo" : "moveTo"](r * Math.cos(an), r * Math.sin(an));
          }
          ctx.closePath();
        } else {
          ctx.arc(0, 0, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalCompositeOperation = "source-over";

    // O núcleo só aparece depois de passar da borda.
    if (sy < by + 3) {
      ctx.fillStyle = "#fffefa";
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---------------------------------------------------------------- ciclo */

  // Até 30 quadros por segundo: o movimento é lento e a cena é grande.
  let pedido = 0, visivel = true, ultimo = -Infinity, inicio = null;
  const quadro = ms => {
    if (inicio === null) inicio = ms;
    if (ms - ultimo > 32) {
      ultimo = ms;
      desenhar(ms - inicio);
    }
    pedido = visivel && !parado ? requestAnimationFrame(quadro) : 0;
  };
  const iniciar = () => {
    if (!pedido) pedido = requestAnimationFrame(quadro);
  };

  medir();
  if (parado) desenhar(0);
  else iniciar();
  addEventListener("resize", () => {
    medir();
    if (parado || !visivel) desenhar(inicio === null ? 0 : performance.now() - inicio);
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && !parado) iniciar();
    }).observe(hero);
  }
})();
