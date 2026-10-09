/* Hero do catálogo: o nascer do sol visto da órbita, à noite.
 *
 * A cena é calculada num shader WebGL, pixel a pixel, como num renderizador
 * de atmosfera: a câmera fica a 420 km de altitude olhando para o horizonte,
 * e a luz do sol que atravessa a atmosfera é espalhada pelas moléculas do
 * ar (Rayleigh, que dá o azul) e por partículas (Mie, que dá o clarão em
 * volta do sol). O laranja rente ao horizonte e o sol avermelhado ao nascer
 * saem dessa conta. Por cima vem o que a câmera acrescenta: brilho em
 * camadas, a estrela de difração da abertura (calculada por FFT) e
 * reflexos da lente. A curva de tom ACES comprime o brilho como numa foto
 * exposta.
 *
 * O sol nasce em ~6 s; depois a cena para no último quadro (só volta a ser
 * desenhada se a janela mudar de tamanho). Com prefers-reduced-motion,
 * desenha direto o quadro final. Sem WebGL, fica só o fundo preto do CSS. */
(() => {
  const hero = document.querySelector(".pt-hero");
  const canvas = hero && hero.querySelector(".pt-hero-ceu");
  if (!canvas) return;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return;
  const parado = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const VERT = `
    attribute vec2 p;
    void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

  const FRAG = `
    precision highp float;
    uniform vec2 uRes;       // tamanho em pixels do canvas
    uniform vec3 uCam;       // posição da câmera (km, centro do planeta na origem)
    uniform vec3 uF, uR, uU; // frente, direita e cima da câmera
    uniform float uTanX, uTanY;
    uniform vec3 uSun;       // direção do sol
    uniform vec2 uSunPx;     // posição do sol na tela, em pixels (origem embaixo)
    uniform float uVis;      // fração do disco do sol acima do horizonte
    uniform float uEsc;      // escala dos efeitos de lente
    uniform sampler2D uBurst; // padrão de difração da abertura (intensidade^(1/5))
    uniform float uBurstPx;  // largura do padrão na tela, em pixels
    uniform float uBurstK;   // ganho do padrão

    const float RP = 6371.0, RA = 6471.0;   // raio do planeta e do topo da atmosfera
    const float HR = 8.0, HM = 1.2;         // alturas de escala (km)
    const vec3 BR = vec3(5.8e-3, 13.5e-3, 33.1e-3); // Rayleigh, por km
    const float BM = 21e-3;                 // Mie, por km
    const float G = 0.8;                    // anisotropia de Mie
    const float SOL = 22.0;                 // intensidade do sol
    const float RS = 0.0058;                // raio angular do disco (um pouco ampliado)
    const float PI = 3.14159265;

    // Hash sem padrão visível (Dave Hoskins, "hash without sine").
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    // Profundidade óptica da atmosfera de um ponto até o espaço, na direção
    // do ângulo zenital chi: aproximação da função de Chapman (Schüler).
    float chapman(float X, float h, float cosChi) {
      float c = sqrt(X + h);
      if (cosChi >= 0.0) return c / (c * cosChi + 1.0) * exp(-h);
      float x0 = sqrt(1.0 - cosChi * cosChi) * (X + h);
      float c0 = sqrt(x0);
      return 2.0 * c0 * exp(X - x0) - c / (1.0 - c * cosChi) * exp(-h);
    }

    // Luz do sol que chega a um ponto da atmosfera: zero na sombra do
    // planeta; senão, a profundidade óptica (Rayleigh, Mie) até o espaço.
    vec2 luz(vec3 p, out float sombra) {
      float r = length(p);
      float cosChi = dot(p / r, uSun);
      float perp = r * sqrt(max(0.0, 1.0 - cosChi * cosChi));
      sombra = (cosChi < 0.0 && perp < RP) ? 0.0 : 1.0;
      float h = max(0.0, r - RP);
      return vec2(HR * chapman(RP / HR, h / HR, cosChi), HM * chapman(RP / HM, h / HM, cosChi));
    }

    // Intensidade do padrão de difração num ponto (centro em 0, borda em
    // ±0.5). A textura guarda a intensidade elevada a 1/5, para caber a
    // faixa enorme de brilho em 8 bits.
    float difracao(vec2 uv) {
      if (abs(uv.x) > 0.5 || abs(uv.y) > 0.5) return 0.0;
      float l = texture2D(uBurst, uv + 0.5).r;
      float l2 = l * l;
      return l2 * l2 * l;
    }

    vec3 aces(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }

    void main() {
      vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
      vec3 d = normalize(uF + uR * ndc.x * uTanX + uU * ndc.y * uTanY);
      vec3 o = uCam;
      float mu = dot(d, uSun);

      // Interseções pelo ponto de maior aproximação, que é preciso mesmo
      // nos raios rasantes (as diferenças de quadrados de 6371 km não são).
      float tc = -dot(o, d);
      float dmin = length(o + d * tc);
      bool chao = dmin < RP && tc > 0.0;

      vec3 cor = vec3(0.0);
      vec2 odVista = vec2(0.0);
      float brilhoAr = 0.0;

      // Os raios que batem fundo no planeta atravessam só ar na sombra:
      // ficam pretos sem custo.
      if (dmin < RA && tc + sqrt((RA - dmin) * (RA + dmin)) > 0.0 && dmin > RP - 700.0) {
        float ha = sqrt((RA - dmin) * (RA + dmin));
        float t0 = max(0.0, tc - ha), t1 = tc + ha;
        if (chao) t1 = tc - sqrt((RP - dmin) * (RP + dmin));
        vec3 somaR = vec3(0.0);
        float somaM = 0.0;
        const int N = 40;
        for (int i = 0; i < N; i++) {
          // Amostras mais densas onde o ar é mais denso: em volta do ponto
          // rasante (raio que não toca o chão) ou perto da superfície.
          float u0 = float(i) / float(N), u1 = float(i + 1) / float(N);
          float ta, tb;
          if (chao) {
            ta = t0 + (t1 - t0) * (1.0 - (1.0 - u0) * (1.0 - u0));
            tb = t0 + (t1 - t0) * (1.0 - (1.0 - u1) * (1.0 - u1));
          } else {
            float s0 = u0 * 2.0 - 1.0, s1 = u1 * 2.0 - 1.0;
            ta = max(tc + ha * s0 * abs(s0), t0);
            tb = max(tc + ha * s1 * abs(s1), t0);
          }
          float dt = tb - ta;
          if (dt <= 0.0) continue;
          vec3 p = o + d * (0.5 * (ta + tb));
          float h = length(p) - RP;
          float rR = exp(-h / HR), rM = exp(-h / HM);
          vec2 meio = odVista + 0.5 * dt * vec2(rR, rM);
          odVista += dt * vec2(rR, rM);
          // Luminescência do ar (airglow): faixa verde tênue a ~95 km.
          brilhoAr += exp(-pow((h - 95.0) / 3.5, 2.0)) * dt;
          float sombra;
          vec2 odLuz = luz(p, sombra);
          if (sombra == 0.0) continue;
          vec3 tau = BR * (meio.x + odLuz.x) + BM * 1.1 * (meio.y + odLuz.y);
          vec3 T = exp(-tau);
          somaR += rR * T * dt;
          somaM += rM * T.g * dt;
        }
        float fR = 3.0 / (16.0 * PI) * (1.0 + mu * mu);
        float fM = 3.0 / (8.0 * PI) * ((1.0 - G * G) * (1.0 + mu * mu)) /
                   ((2.0 + G * G) * pow(1.0 + G * G - 2.0 * G * mu, 1.5));
        cor += SOL * (somaR * BR * fR + somaM * BM * fM);
        cor += vec3(0.35, 1.0, 0.45) * brilhoAr * 2.0e-5;
      }

      // Transmitância do raio até o espaço: avermelha o que está atrás.
      vec3 Tv = exp(-(BR * odVista.x + BM * 1.1 * odVista.y));

      // Disco do sol e estrelas, só onde o planeta não tapa.
      float ang = acos(clamp(mu, -1.0, 1.0));
      if (!chao) {
        cor += Tv * vec3(1.0, 0.96, 0.9) * 900.0 * smoothstep(RS + 0.0006, RS - 0.0006, ang);
        vec2 cel = floor(gl_FragCoord.xy / 2.0);
        float hs = hash(cel);
        if (hs > 0.9993) cor += Tv * vec3(0.9, 0.93, 1.0) * (hs - 0.9993) * 900.0 * (1.0 - 0.85 * uVis);
      }

      // Cor do sol visto pela câmera: a luz atravessa a atmosfera rente ao
      // horizonte e chega avermelhada (Chapman rasante na menor altitude).
      float tcs = -dot(o, uSun);
      float hsol = max(0.0, length(o + uSun * tcs) - RP);
      vec2 odSol = vec2(HR, HM) * sqrt(2.0 * PI * (RP + hsol) / vec2(HR, HM)) * exp(-hsol / vec2(HR, HM));
      vec3 corSol = exp(-(BR * odSol.x + BM * 1.1 * odSol.y)) * uVis;

      // Brilho em camadas em volta do sol (o espalhamento dentro da lente).
      cor += corSol * (6.0 * exp(-ang / 0.0035) + 1.2 * exp(-ang / 0.012) +
                       0.12 * exp(-ang / 0.05) + 0.02 * exp(-ang / 0.25));
      // A câmera satura o sol: os efeitos de lente saem quase brancos,
      // levemente dourados, mesmo com o sol avermelhado.
      vec3 corLente = mix(corSol, vec3(1.0, 0.9, 0.75) * uVis, 0.6);
      // Brilho branco largo em volta do núcleo, que é o que faz o sol
      // parecer forte numa foto.
      cor += corLente * (8.0 * exp(-ang / 0.011) + 1.0 * exp(-ang / 0.035) + 0.04 * exp(-ang / 0.12));

      // Efeitos de lente, na tela, em pixels.
      vec2 dp = gl_FragCoord.xy - uSunPx;
      float dist = length(dp);
      float e = uEsc;

      // Estrela de difração: o padrão que a abertura da lente faz com uma
      // luz pontual (ver estrela() no JavaScript). O padrão escala com o
      // comprimento de onda; a luz do sol tem todos, e somá-los (dez, de 420
      // a 680 nm, cada um pesado na sua cor) alisa o granulado de uma luz
      // pura e deixa as franjas de cor só nas pontas dos raios. Some suave
      // antes da borda da textura.
      vec2 uv = dp / uBurstPx;
      vec3 estrela = vec3(0.0), soma = vec3(0.0);
      for (int i = 0; i < 10; i++) {
        float lam = 420.0 + 28.0 * float(i);
        vec3 w = vec3(exp(-pow((lam - 610.0) / 45.0, 2.0)),
                      exp(-pow((lam - 545.0) / 40.0, 2.0)),
                      exp(-pow((lam - 460.0) / 35.0, 2.0)));
        estrela += w * difracao(uv * (550.0 / lam));
        soma += w;
      }
      estrela /= soma;
      estrela *= smoothstep(0.5, 0.3, length(uv));
      cor += corLente * estrela * uBurstK;

      // Rastro anamórfico: linha horizontal fina e azulada pelo sol.
      cor += corLente * vec3(0.55, 0.7, 1.0) * 0.5 *
             exp(-abs(dp.y) / (1.1 * e)) * exp(-abs(dp.x) / (420.0 * e));

      // Reflexos da lente: uma fileira de discos, anéis e pontos azulados
      // na linha que vai do sol ao centro da tela e continua do outro lado
      // (com o sol no centro, uma fileira vertical). Cada reflexo: um disco
      // suave, a borda mais clara e, em alguns, um ponto brilhante no meio.
      vec2 centro = uRes * 0.5;
      vec2 eixo = centro - uSunPx;
      vec3 refl = vec3(0.0);
      for (int k = 0; k < 10; k++) {
        float f = k == 0 ? 0.2 : k == 1 ? 0.36 : k == 2 ? 0.52 : k == 3 ? 0.7 : k == 4 ? 0.9
                : k == 5 ? 1.12 : k == 6 ? 1.33 : k == 7 ? 1.55 : k == 8 ? 1.8 : 2.1;
        float r = (k == 0 ? 10.0 : k == 1 ? 26.0 : k == 2 ? 46.0 : k == 3 ? 20.0 : k == 4 ? 36.0
                : k == 5 ? 24.0 : k == 6 ? 6.0 : k == 7 ? 56.0 : k == 8 ? 28.0 : 14.0) * e;
        vec3 tinta = k == 0 ? vec3(0.6, 0.75, 1.0) : k == 1 ? vec3(0.35, 0.6, 1.0) : k == 2 ? vec3(0.3, 0.5, 1.0)
                   : k == 3 ? vec3(0.55, 0.45, 1.0) : k == 4 ? vec3(0.3, 0.65, 0.95) : k == 5 ? vec3(0.35, 0.8, 1.0)
                   : k == 6 ? vec3(0.9, 0.55, 1.0) : k == 7 ? vec3(0.3, 0.5, 1.0) : k == 8 ? vec3(0.4, 0.7, 1.0) : vec3(0.45, 0.6, 1.0);
        float forca = k == 0 ? 0.10 : k == 1 ? 0.07 : k == 2 ? 0.035 : k == 3 ? 0.08 : k == 4 ? 0.045
                    : k == 5 ? 0.09 : k == 6 ? 0.25 : k == 7 ? 0.03 : k == 8 ? 0.08 : 0.12;
        float ponto = (k == 3 || k == 5 || k == 8) ? 1.0 : 0.0;
        vec2 q = gl_FragCoord.xy - (uSunPx + eixo * f);
        float dq = length(q);
        float disco = 1.0 - smoothstep(r - 1.5, r + 1.5, dq);
        float borda = exp(-pow((dq - r * 0.94) / (r * 0.07 + 1.0), 2.0));
        float miolo = exp(-dq * dq / (2.0 * pow(1.2 * e + 0.5, 2.0)));
        refl += 1.6 * tinta * forca * (0.45 * disco + 0.8 * borda + 6.0 * ponto * miolo);
      }
      // O feixe no fim da fileira: um traço azulado alongado no eixo.
      vec2 ue = normalize(eixo);
      vec2 qf = gl_FragCoord.xy - (uSunPx + eixo * 1.95);
      float along = dot(qf, ue), across = dot(qf, vec2(-ue.y, ue.x));
      refl += vec3(0.3, 0.55, 1.0) * 0.12 * exp(-across * across / (2.0 * pow(4.0 * e, 2.0))) *
              exp(-along * along / (2.0 * pow(60.0 * e, 2.0)));
      cor += refl * uVis * uVis;

      // Exposição, curva de tom, gama e um ruído leve contra faixas de cor.
      cor = aces(cor * 0.9);
      cor = pow(cor, vec3(1.0 / 2.2));
      cor += (hash(gl_FragCoord.xy + 17.0) - 0.5) / 255.0;
      gl_FragColor = vec4(cor, 1.0);
    }`;

  const compilar = (tipo, fonte) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compilar(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compilar(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn("planeta.js:", err);
    return;
  }
  gl.useProgram(prog);
  // Um triângulo que cobre a tela toda.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  for (const n of ["uRes", "uCam", "uF", "uR", "uU", "uTanX", "uTanY", "uSun", "uSunPx", "uVis", "uEsc", "uBurst", "uBurstPx", "uBurstK"]) {
    U[n] = gl.getUniformLocation(prog, n);
  }

  /* ---------------------------------------------------------------- difração */

  // A estrela em volta do sol, como numa foto: o padrão de difração de
  // Fraunhofer da abertura da lente, que é a intensidade da transformada de
  // Fourier do formato da abertura. Cada borda reta do diafragma dá um par
  // de raios perpendicular a ela (aqui, 7 lâminas: 14 raios); a borda redonda
  // dá os anéis; poeira e fibras na lente dão as estrias finas em volta.
  // Calculado uma vez, com uma FFT 2D de 1024 × 1024 (raios de 2 a 3 px
  // na tela), e enviado como textura. A conta leva uns décimos de segundo:
  // roda logo depois do primeiro quadro, com o sol ainda atrás do planeta,
  // e até lá o ganho fica em zero.
  const GANHO = 16000;
  let ganho = 0;
  function estrela() {
    const N = 1024, LOG = 10, c = N / 2, r = N / 3;
    const re = new Float32Array(N * N), im = new Float32Array(N * N);
    let semente = 101;
    const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;

    // A abertura: um disco cortado pelas lâminas do diafragma (as bordas
    // retas), com a borda levemente irregular, poeira e fibras. Bordas
    // suavizadas em 1 px para não criar falsos raios de serrilhado.
    // Diafragma de 7 lâminas, levemente desiguais: 14 raios finos de
    // intensidades variadas.
    const LAMINAS = 7;
    const faixas = Array.from({ length: LAMINAS }, (_, k) => {
      const a = 0.3 + k * 2 * Math.PI / LAMINAS + (aleatorio() - 0.5) * 0.06;
      return [Math.cos(a), Math.sin(a), r * Math.cos(Math.PI / LAMINAS) * (0.97 + aleatorio() * 0.05)];
    });
    const poeira = Array.from({ length: 28 }, () => {
      const a = aleatorio() * 6.283, d = Math.sqrt(aleatorio()) * r * 0.9;
      return [c + d * Math.cos(a), c + d * Math.sin(a), 0.6 + aleatorio() * 1.8];
    });
    const fibras = Array.from({ length: 36 }, () => {
      const a = aleatorio() * 6.283, d = Math.sqrt(aleatorio()) * r * 0.9;
      const ang = aleatorio() * Math.PI, comp = r * (0.2 + aleatorio() * 0.9);
      return [c + d * Math.cos(a), c + d * Math.sin(a), Math.cos(ang), Math.sin(ang), comp / 2];
    });
    const lim = Math.ceil(r + 2);
    for (let y = c - lim; y <= c + lim; y++) {
      for (let x = c - lim; x <= c + lim; x++) {
        const px = x + 0.5 - c, py = y + 0.5 - c;
        const d = Math.hypot(px, py), th = Math.atan2(py, px);
        const rr = r * (1 + 0.008 * Math.sin(7 * th + 1) + 0.005 * Math.sin(13 * th + 2));
        let v = Math.min(1, Math.max(0, rr - d + 0.5));
        if (!v) continue;
        for (const [cx, cy, a] of faixas) v *= Math.min(1, Math.max(0, a - (px * cx + py * cy) + 0.5));
        for (const [qx, qy, rad] of poeira) {
          const dd = Math.hypot(x + 0.5 - qx, y + 0.5 - qy);
          if (dd < rad + 1) v *= Math.min(1, Math.max(0, dd - rad + 0.5));
        }
        for (const [qx, qy, ux, uy, meia] of fibras) {
          const dx = x + 0.5 - qx, dy = y + 0.5 - qy;
          const ao = dx * ux + dy * uy;
          if (Math.abs(ao) > meia) continue;
          const perp = Math.abs(dx * uy - dy * ux);
          if (perp < 1.2) v *= 0.25 + 0.75 * Math.min(1, perp / 1.2);
        }
        re[y * N + x] = v;
      }
    }

    // FFT 2D: radix 2, nas linhas e depois nas colunas.
    const inv = new Uint16Array(N);
    for (let i = 0; i < N; i++) {
      let j = 0;
      for (let b = 0; b < LOG; b++) j |= ((i >> b) & 1) << (LOG - 1 - b);
      inv[i] = j;
    }
    const cosT = new Float32Array(N / 2), sinT = new Float32Array(N / 2);
    for (let k = 0; k < N / 2; k++) {
      cosT[k] = Math.cos(2 * Math.PI * k / N);
      sinT[k] = -Math.sin(2 * Math.PI * k / N);
    }
    const fft = (ini, passo) => {
      for (let i = 0; i < N; i++) {
        const j = inv[i];
        if (j > i) {
          const a = ini + i * passo, b = ini + j * passo;
          let t = re[a]; re[a] = re[b]; re[b] = t;
          t = im[a]; im[a] = im[b]; im[b] = t;
        }
      }
      for (let tam = 2; tam <= N; tam *= 2) {
        const meio = tam / 2, salto = N / tam;
        for (let ini2 = 0; ini2 < N; ini2 += tam) {
          for (let k = 0; k < meio; k++) {
            const wr = cosT[k * salto], wi = sinT[k * salto];
            const a = ini + (ini2 + k) * passo, b = ini + (ini2 + k + meio) * passo;
            const xr = re[b] * wr - im[b] * wi, xi = re[b] * wi + im[b] * wr;
            re[b] = re[a] - xr; im[b] = im[a] - xi;
            re[a] += xr; im[a] += xi;
          }
        }
      }
    };
    for (let y = 0; y < N; y++) fft(y * N, 1);
    for (let x = 0; x < N; x++) fft(x, N);

    // Intensidade, com a frequência zero no centro, normalizada pelo pico e
    // guardada como intensidade^(1/5) em 8 bits.
    let max = 0;
    const pot = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) {
      pot[i] = re[i] * re[i] + im[i] * im[i];
      if (pot[i] > max) max = pot[i];
    }
    const dados = new Uint8Array(N * N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const v = pot[((y + c) % N) * N + ((x + c) % N)] / max;
        dados[y * N + x] = Math.round(255 * Math.pow(v, 0.2));
      }
    }
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, N, N, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, dados);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    ganho = GANHO;
  }

  /* ---------------------------------------------------------------- geometria */

  const RP = 6371, ALT = 420;
  const RAIO_SOL = 0.0058;
  const FOV_Y = 38 * Math.PI / 180;
  // O horizonte fica 0.28 acima do centro da tela (em coordenadas de -1 a 1),
  // isto é, a 36% da altura; o sol, no centro.
  const HORIZONTE_Y = 0.28, SOL_X = 0;
  const mergulho = Math.acos(RP / (RP + ALT)); // quanto o horizonte fica abaixo da horizontal

  let W = 0, H = 0, escala = 1;
  function medir() {
    // Até 1.5 pixel por pixel CSS: a cena é pesada e quase toda suave.
    escala = Math.min(1.5, devicePixelRatio || 1);
    W = Math.round(hero.clientWidth * escala);
    H = Math.round(hero.clientHeight * escala);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${hero.clientWidth}px`;
    canvas.style.height = `${hero.clientHeight}px`;
    gl.viewport(0, 0, W, H);
  }

  // `e` é a elevação do centro do sol acima do horizonte, em radianos.
  function desenhar(e) {
    const tanY = Math.tan(FOV_Y / 2), tanX = tanY * (W / H);
    const pitch = -mergulho - Math.atan(HORIZONTE_Y * tanY);
    const F = [0, Math.sin(pitch), -Math.cos(pitch)];
    const R = [1, 0, 0];
    const Up = [0, Math.cos(pitch), Math.sin(pitch)];
    const az = Math.atan(SOL_X * tanX);
    const el = -mergulho + e;
    const sol = [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const zf = dot(sol, F);
    const sx = (dot(sol, R) / zf / tanX * 0.5 + 0.5) * W;
    const sy = (dot(sol, Up) / zf / tanY * 0.5 + 0.5) * H;
    const vis = Math.max(0, Math.min(1, (e + RAIO_SOL) / (2 * RAIO_SOL)));

    gl.uniform2f(U.uRes, W, H);
    gl.uniform3f(U.uCam, 0, RP + ALT, 0);
    gl.uniform3fv(U.uF, F);
    gl.uniform3fv(U.uR, R);
    gl.uniform3fv(U.uU, Up);
    gl.uniform1f(U.uTanX, tanX);
    gl.uniform1f(U.uTanY, tanY);
    gl.uniform3fv(U.uSun, sol);
    gl.uniform2f(U.uSunPx, sx, sy);
    gl.uniform1f(U.uVis, vis);
    gl.uniform1f(U.uEsc, Math.min(W, 1600 * escala) / 1400);
    gl.uniform1i(U.uBurst, 0);
    gl.uniform1f(U.uBurstPx, H * 0.95);
    gl.uniform1f(U.uBurstK, ganho);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ---------------------------------------------------------------- nascer */

  // O sol sai de 1,2 raio abaixo do horizonte e para 0,8 raio acima.
  const DURACAO = 6000;
  const E0 = -RAIO_SOL * 1.2, E1 = RAIO_SOL * 0.8;
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  let inicio = null, fim = false;
  const elevacao = ms => E0 + (E1 - E0) * easeOut(Math.min(1, ms / DURACAO));

  function quadro(ms) {
    if (inicio === null) inicio = ms;
    const passou = ms - inicio;
    desenhar(elevacao(passou));
    if (passou < DURACAO) requestAnimationFrame(quadro);
    else fim = true;
  }

  medir();
  if (parado) {
    estrela();
    fim = true;
    desenhar(E1);
  } else {
    requestAnimationFrame(quadro);
    setTimeout(estrela, 50);
  }
  addEventListener("resize", () => {
    medir();
    if (fim) desenhar(E1);
  });
})();
