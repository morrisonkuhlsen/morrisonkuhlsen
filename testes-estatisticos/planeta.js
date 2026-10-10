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
 * O sol nasce devagar, em ~30 s; depois a atmosfera para no último quadro
 * (só é refeita se a janela mudar de tamanho) e só a etapa leve continua
 * animada: os feixes de luz que respiram e os relâmpagos de uma tempestade
 * lá embaixo. Com prefers-reduced-motion, desenha direto o quadro final,
 * parado e sem relâmpagos. Sem WebGL, fica só o fundo preto do CSS. */
(() => {
  const hero = document.querySelector(".pt-hero");
  const canvas = hero && hero.querySelector(".pt-hero-ceu");
  if (!canvas) return;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return;
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const parado = reduz;

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

    float ruidoValor(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float s = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { s += a * ruidoValor(p); p *= 2.03; a *= 0.5; }
      return s;
    }

    // O céu atrás do planeta: estrelas e a Via Láctea, presas à direção
    // (estáveis em qualquer tamanho de tela). Cada estrela é um ponto com
    // perfil gaussiano de menos de um pixel; o brilho segue uma lei de
    // potência (muitas fracas, poucas fortes) e a cor, a temperatura
    // (azuladas, brancas, amarelas, alaranjadas). No espaço não há
    // cintilação. O brilho do sol apaga as estrelas, como numa foto exposta
    // para ele.
    vec3 ceu(vec3 d, float ang) {
      vec2 esf = vec2(atan(d.x, -d.z), asin(clamp(d.y, -1.0, 1.0)));
      float pix = 2.0 * uTanY / uRes.y;          // radianos por pixel
      const float C = 0.0042;                     // célula da grade de estrelas
      // A Via Láctea: uma faixa difusa num grande círculo inclinado.
      // (O plano dela passa pela direção da câmera: a faixa cruza o céu
      // visível na diagonal.)
      float banda = exp(-pow(dot(d, normalize(vec3(0.8, 0.55, -0.2))) / 0.13, 2.0));
      vec2 gi = floor(esf / C);
      vec3 luz = vec3(0.0);
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec2 c = gi + vec2(float(i), float(j));
          if (hash(c) > 0.14 + 0.45 * banda) continue;
          vec2 pos = (c + vec2(hash(c + 11.3), hash(c + 27.1))) * C;
          vec2 dd = esf - pos;
          dd.x *= cos(esf.y);
          float r = length(dd) / pix;
          float h = hash(c + 3.7);
          float L = 0.004 + 0.12 * pow(h, 5.0) + 3.0 * pow(h, 40.0);
          float t = hash(c + 51.2);
          vec3 tinta = t < 0.15 ? vec3(0.66, 0.76, 1.0) : t < 0.55 ? vec3(0.95, 0.97, 1.0)
                     : t < 0.85 ? vec3(1.0, 0.93, 0.82) : vec3(1.0, 0.79, 0.6);
          luz += tinta * L * (exp(-r * r / 0.72) + (L > 1.2 ? 0.05 * exp(-r * r / 8.0) : 0.0));
        }
      }
      // O brilho difuso da Via Láctea, com faixas escuras de poeira.
      float nuvem = 0.55 + 0.45 * fbm(esf * 14.0);
      float poeira = 1.0 - 0.75 * smoothstep(0.48, 0.72, fbm(esf * 26.0 + 5.0));
      float via = banda * nuvem * poeira;
      luz += (vec3(0.72, 0.76, 0.9) * 0.035 + vec3(1.0, 0.86, 0.72) * 0.012) * via;
      float apaga = (1.0 - 0.5 * uVis) * (1.0 - 0.92 * uVis * exp(-ang / 0.3));
      return luz * apaga;
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
        cor += Tv * ceu(d, ang);
      }

      // Cor do sol visto pela câmera: a luz atravessa a atmosfera rente ao
      // horizonte e chega avermelhada (Chapman rasante na menor altitude).
      float tcs = -dot(o, uSun);
      float hsol = max(0.0, length(o + uSun * tcs) - RP);
      vec2 odSol = vec2(HR, HM) * sqrt(2.0 * PI * (RP + hsol) / vec2(HR, HM)) * exp(-hsol / vec2(HR, HM));
      vec3 corSol = exp(-(BR * odSol.x + BM * 1.1 * odSol.y)) * uVis;
      // Sobre o planeta, o clarão e os raios ficam bem mais fracos: sem
      // isso, com o sol ainda atrás da borda, o brilho aparecia em cima do
      // planeta. Contínuo na borda (1) e caindo para 25% logo para dentro.
      corSol *= chao ? 0.25 + 0.75 * exp(-(RP - dmin) / 8.0) : 1.0;

      // Brilho em camadas em volta do sol (o espalhamento dentro da lente).
      cor += corSol * (6.0 * exp(-ang / 0.0035) + 1.2 * exp(-ang / 0.012) +
                       0.12 * exp(-ang / 0.05) + 0.02 * exp(-ang / 0.25));
      // A câmera satura o sol: os efeitos de lente saem quase brancos,
      // levemente dourados, mesmo com o sol avermelhado.
      vec3 corLente = mix(corSol, vec3(1.0, 0.9, 0.75) * uVis * (chao ? 0.25 + 0.75 * exp(-(RP - dmin) / 8.0) : 1.0), 0.6);
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
      // Os raios crescem mais devagar que o brilho: só ganham força quando
      // boa parte do disco já saiu de trás do planeta.
      cor += corLente * estrela * uBurstK * uVis * 0.45;


      // Rastro anamórfico: um brilho horizontal fino e azulado junto ao sol,
      // que some bem antes das bordas da tela.
      cor += corLente * vec3(0.55, 0.7, 1.0) * 0.12 *
             exp(-abs(dp.y) / (1.1 * e)) * exp(-abs(dp.x) / (160.0 * e));
      // E um véu horizontal mais largo e lilás, rente ao horizonte.
      cor += corLente * vec3(0.85, 0.72, 1.0) * 0.07 *
             exp(-abs(dp.y) / (7.0 * e)) * exp(-abs(dp.x) / (380.0 * e));


      // Exposição, curva de tom, gama e um ruído leve contra faixas de cor.
      cor = aces(cor * 0.9);
      cor = pow(cor, vec3(1.0 / 2.2));
      cor += (hash(gl_FragCoord.xy + 17.0) - 0.5) / 255.0;
      gl_FragColor = vec4(cor, 1.0);
    }`;

  // Segunda etapa: os reflexos da lente, sobre a cena já pronta (guardada
  // numa textura pela primeira etapa). É leve, e é só ela que se refaz
  // quando o mouse move os reflexos. A mesma curva de tom da cena converte
  // o brilho deles, que entram como luz sobreposta ("screen").
  const FRAG_REFLEXOS = `
    precision highp float;
    uniform sampler2D uCena;
    uniform vec2 uRes, uSunPx, uEixo;
    uniform float uVis, uEsc, uRealce;
    uniform vec3 uCam, uF, uR, uU;
    uniform float uTanX, uTanY;
    uniform vec4 uRaio[4];   // relâmpagos: centro na esfera (xyz) e brilho (w)
    uniform vec4 uFeixe[7];  // feixes: ângulo (x), força (y), comprimento em px (z), fase (w)
    uniform float uFeixeK, uTempo;

    const float RC = 6383.0;  // topo das nuvens de tempestade, ~12 km

    vec3 aces(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    float ruidoValor(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float s = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { s += a * ruidoValor(p); p *= 2.03; a *= 0.5; }
      return s;
    }

    // Relâmpagos dentro das nuvens, vistos de cima, à noite: o clarão não
    // aparece como um risco, mas como a nuvem acesa por dentro, branco
    // azulado, com o miolo mais forte e o resto espalhado pela bigorna
    // (dezenas de km). A textura de nuvem só existe onde há clarão.
    vec3 relampagos() {
      if (uRaio[0].w + uRaio[1].w + uRaio[2].w + uRaio[3].w <= 0.0) return vec3(0.0);
      vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
      vec3 d = normalize(uF + uR * ndc.x * uTanX + uU * ndc.y * uTanY);
      float tc = -dot(uCam, d);
      float dmin = length(uCam + d * tc);
      if (dmin >= RC || tc <= 0.0) return vec3(0.0);
      vec3 P = uCam + d * (tc - sqrt((RC - dmin) * (RC + dmin)));
      vec3 n = P / RC;
      // Rente ao horizonte, a nuvem é vista de lado, atrás de muito ar.
      float rasante = smoothstep(0.0, 0.3, dot(-d, n));
      vec3 luz = vec3(0.0);
      float dens = -1.0;
      for (int k = 0; k < 4; k++) {
        float I = uRaio[k].w;
        if (I <= 0.0) continue;
        float dist = acos(clamp(dot(n, uRaio[k].xyz), -1.0, 1.0)) * RC;
        if (dist > 160.0) continue;
        // Torres e bigornas: ruído em km, com contraste alto.
        if (dens < 0.0) dens = smoothstep(0.3, 0.78, fbm(n.xz * RC / 12.0 + 7.0));
        float g = I * (exp(-dist * dist / (2.0 * 11.0 * 11.0)) * (0.2 + 1.8 * dens)
                     + 1.4 * exp(-dist * dist / (2.0 * 2.5 * 2.5))
                     + 0.07 * exp(-dist * dist / (2.0 * 35.0 * 35.0)) * (0.4 + dens));
        luz += g * vec3(0.76, 0.84, 1.0);
      }
      return luz * rasante;
    }

    // Feixes largos e quentes, como nas fotos do nascer do sol em órbita:
    // poucos, abertos em leque para cima, cada um uma cunha de luz que começa
    // branca junto ao sol e vai ficando âmbar e se apagando. É o brilho da
    // lente espalhado em faixas (reflexos internos, sujeira no vidro). Eles
    // respiram devagar: cada um oscila um pouco no ângulo, na força e no
    // comprimento, em ritmos diferentes, como a luz tremulando através do ar.
    vec3 feixes(vec2 dp, float e) {
      vec3 soma = vec3(0.0);
      for (int k = 0; k < 7; k++) {
        vec4 F = uFeixe[k];
        float t = uTempo, fase = F.w;
        float ang = F.x + 0.03 * sin(t * (0.35 + 0.06 * float(k)) + fase)
                        + 0.01 * sin(t * (1.1 + 0.13 * float(k)) + 2.0 * fase);
        vec2 n = vec2(cos(ang), sin(ang));
        float ao = dot(dp, n);
        if (ao <= 0.0) continue;
        float pulsa = 0.65 + 0.35 * sin(t * (0.6 + 0.09 * float(k)) + 3.0 * fase)
                           * (0.75 + 0.25 * sin(t * (1.7 + 0.2 * float(k)) + fase));
        float forca = F.y * pulsa;
        float perp = abs(dp.x * n.y - dp.y * n.x);
        float abre = 0.05 + 0.035 * F.y;
        float a = perp / max(ao, 1.0) / abre;
        float L = F.z * e * (0.85 + 0.15 * sin(t * (0.45 + 0.07 * float(k)) + 5.0 * fase));
        float f = forca * exp(-a * a) * exp(-pow(ao / L, 1.6)) / (1.0 + ao / (90.0 * e))
                * smoothstep(6.0 * e, 50.0 * e, ao);
        soma += f * mix(vec3(1.0, 0.86, 0.66), vec3(1.0, 0.5, 0.18), smoothstep(20.0 * e, 0.6 * L, ao));
      }
      return soma;
    }

    void main() {
      vec3 base = texture2D(uCena, gl_FragCoord.xy / uRes).rgb;
      float e = uEsc;
      // Os reflexos ficam na linha que vai do sol ao eixo da lente (uEixo:
      // o centro da tela ou, com o mouse sobre o hero, o cursor) e continua
      // do outro lado. Cada reflexo: um disco suave, a borda mais clara e,
      // em alguns, um ponto brilhante no meio.
      vec2 eixo = uEixo - uSunPx;
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
      vec3 g = refl * uVis * uVis * (1.0 + 0.35 * uRealce) + relampagos()
             + feixes(gl_FragCoord.xy - uSunPx, e) * 0.5 * uVis * uFeixeK;
      g = pow(aces(g * 0.9), vec3(1.0 / 2.2));
      gl_FragColor = vec4(1.0 - (1.0 - base) * (1.0 - g), 1.0);
    }`;

  const compilar = (tipo, fonte) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const programa = frag => {
    const p = gl.createProgram();
    gl.attachShader(p, compilar(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compilar(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(p, 0, "p");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  };
  let prog, progReflexos;
  try {
    prog = programa(FRAG);
    progReflexos = programa(FRAG_REFLEXOS);
  } catch (err) {
    console.warn("planeta.js:", err);
    return;
  }
  // Um triângulo que cobre a tela toda.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uniformes = (p, nomes) => Object.fromEntries(nomes.map(n => [n, gl.getUniformLocation(p, n)]));
  const U = uniformes(prog, ["uRes", "uCam", "uF", "uR", "uU", "uTanX", "uTanY", "uSun", "uSunPx", "uVis", "uEsc", "uBurst", "uBurstPx", "uBurstK"]);
  const UR = uniformes(progReflexos, ["uCena", "uRes", "uSunPx", "uEixo", "uVis", "uEsc", "uRealce",
    "uCam", "uF", "uR", "uU", "uTanX", "uTanY", "uRaio", "uFeixe", "uFeixeK", "uTempo"]);

  /* ---------------------------------------------------------------- difração */

  // A estrela em volta do sol, como numa foto: o padrão de difração de
  // Fraunhofer da abertura da lente, que é a intensidade da transformada de
  // Fourier do formato da abertura. Cada borda reta do diafragma dá um par
  // de raios perpendicular a ela (aqui, 7 lâminas: 14 raios); a borda redonda
  // dá os anéis; poeira e fibras na lente dão as estrias finas em volta.
  // Calculado uma vez, com uma FFT 2D de 1024 × 1024 (raios de 2 a 3 px
  // na tela), e enviado como textura. A conta leva uns décimos de segundo:
  // roda logo depois do primeiro quadro, com o sol ainda atrás do planeta,
  // e até lá os raios ficam apagados.
  const GANHO = 16000;
  // Quando a textura fica pronta, os raios entram aos poucos, em 8 s, com
  // começo lento (quadrático), nunca de uma vez.
  let pronta = null;
  // Os feixes largos (etapa dos reflexos): sete, abertos em leque para cima
  // (de 35° a 145°), com força, comprimento e fase de oscilação sorteados.
  const feixesDados = (() => {
    let sm = 7;
    const al = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
    return new Float32Array(Array.from({ length: 7 }, (_, k) =>
      [(35 + k * 18 + (al() - 0.5) * 12) * Math.PI / 180, 0.15 + 1.1 * al() ** 2, 90 + al() * 230, al() * 6.283]).flat());
  })();
  const ganho = () => pronta === null ? 0 : GANHO * Math.min(1, (performance.now() - pronta) / 8000) ** 2;
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
    pronta = parado ? -Infinity : performance.now();
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
  // A cena vai para esta textura (unidade 1; a 0 é a da difração).
  const cenaTex = gl.createTexture();
  const cenaFb = gl.createFramebuffer();
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
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cenaTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, cenaFb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cenaTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.activeTexture(gl.TEXTURE0);
    eixo = alvo ? eixo : [W / 2, H / 2];
  }

  // Último sol e última câmera desenhados, para a etapa dos reflexos.
  const sol = { x: 0, y: 0, vis: 0 };
  const cam = { F: [0, 0, -1], R: [1, 0, 0], Up: [0, 1, 0], tanX: 1, tanY: 1 };

  // `e` é a elevação do centro do sol acima do horizonte, em radianos.
  function desenhar(e) {
    const tanY = Math.tan(FOV_Y / 2), tanX = tanY * (W / H);
    const pitch = -mergulho - Math.atan(HORIZONTE_Y * tanY);
    const F = [0, Math.sin(pitch), -Math.cos(pitch)];
    const R = [1, 0, 0];
    const Up = [0, Math.cos(pitch), Math.sin(pitch)];
    const az = Math.atan(SOL_X * tanX);
    const el = -mergulho + e;
    const dirSol = [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const zf = dot(dirSol, F);
    const sx = (dot(dirSol, R) / zf / tanX * 0.5 + 0.5) * W;
    const sy = (dot(dirSol, Up) / zf / tanY * 0.5 + 0.5) * H;
    // Fração visível do disco, numa curva suave (sem quinas no começo e no fim).
    const fr = Math.max(0, Math.min(1, (e + RAIO_SOL) / (2 * RAIO_SOL)));
    const vis = fr * fr * (3 - 2 * fr);
    Object.assign(sol, { x: sx, y: sy, vis });
    Object.assign(cam, { F, R, Up, tanX, tanY });

    gl.bindFramebuffer(gl.FRAMEBUFFER, cenaFb);
    gl.useProgram(prog);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform3f(U.uCam, 0, RP + ALT, 0);
    gl.uniform3fv(U.uF, F);
    gl.uniform3fv(U.uR, R);
    gl.uniform3fv(U.uU, Up);
    gl.uniform1f(U.uTanX, tanX);
    gl.uniform1f(U.uTanY, tanY);
    gl.uniform3fv(U.uSun, dirSol);
    gl.uniform2f(U.uSunPx, sx, sy);
    gl.uniform1f(U.uVis, vis);
    gl.uniform1f(U.uEsc, Math.min(W, 1600 * escala) / 1400);
    gl.uniform1i(U.uBurst, 0);
    gl.uniform1f(U.uBurstPx, H * 0.95);
    gl.uniform1f(U.uBurstK, ganho());
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    compor();
  }

  /* ---------------------------------------------------------------- reflexos */

  // Os reflexos de uma lente ficam na linha que liga a luz ao centro da
  // lente. Com o mouse sobre o hero, esse centro vai em parte na direção
  // do cursor, com inércia, e os reflexos se acendem um pouco; ao sair,
  // voltam ao centro da tela. Só esta etapa leve é refeita. No toque, nada muda.
  const SEGUE = 0.15;
  let eixo = null, alvo = null, realce = 0, alvoRealce = 0, passoPendente = 0;

  function compor() {
    gl.useProgram(progReflexos);
    gl.uniform1i(UR.uCena, 1);
    gl.uniform2f(UR.uRes, W, H);
    gl.uniform2f(UR.uSunPx, sol.x, sol.y);
    gl.uniform2f(UR.uEixo, eixo[0], eixo[1]);
    gl.uniform1f(UR.uVis, sol.vis);
    gl.uniform1f(UR.uEsc, Math.min(W, 1600 * escala) / 1400);
    gl.uniform1f(UR.uRealce, realce);
    gl.uniform3f(UR.uCam, 0, RP + ALT, 0);
    gl.uniform3fv(UR.uF, cam.F);
    gl.uniform3fv(UR.uR, cam.R);
    gl.uniform3fv(UR.uU, cam.Up);
    gl.uniform1f(UR.uTanX, cam.tanX);
    gl.uniform1f(UR.uTanY, cam.tanY);
    gl.uniform4fv(UR.uRaio, brilhoRaios(performance.now()));
    gl.uniform4fv(UR.uFeixe, feixesDados);
    gl.uniform1f(UR.uFeixeK, ganho() / GANHO);
    gl.uniform1f(UR.uTempo, reduz ? 0 : performance.now() / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function passoReflexos() {
    passoPendente = 0;
    const destino = alvo || [W / 2, H / 2];
    const k = parado ? 1 : 0.06;
    eixo[0] += (destino[0] - eixo[0]) * k;
    eixo[1] += (destino[1] - eixo[1]) * k;
    realce += (alvoRealce - realce) * (parado ? 1 : 0.1);
    // Durante o nascer, o quadro dele já chama compor().
    if (fim) compor();
    const falta = Math.hypot(destino[0] - eixo[0], destino[1] - eixo[1]) > 0.5 || Math.abs(alvoRealce - realce) > 0.005;
    if (falta) passoPendente = requestAnimationFrame(passoReflexos);
  }
  const mexer = () => {
    if (!passoPendente) passoPendente = requestAnimationFrame(passoReflexos);
  };
  hero.addEventListener("pointermove", ev => {
    if (ev.pointerType === "touch") return;
    // Segue o cursor só em parte: o eixo vai a SEGUE do caminho entre o
    // centro da tela e o mouse, e a fileira se inclina de leve.
    const r = canvas.getBoundingClientRect();
    const mx = (ev.clientX - r.left) * escala, my = H - (ev.clientY - r.top) * escala;
    alvo = [W / 2 + (mx - W / 2) * SEGUE, H / 2 + (my - H / 2) * SEGUE];
    alvoRealce = 1;
    mexer();
  });
  hero.addEventListener("pointerleave", () => {
    alvo = null;
    alvoRealce = 0;
    mexer();
  });

  /* ---------------------------------------------------------------- tempestade */

  // Uma tempestade no lado noturno do planeta, abaixo do texto. Cada
  // descarga é uma série de 1 a 4 pulsos (os "retornos" de um raio real,
  // separados por dezenas de ms), e às vezes acende uma célula vizinha logo
  // depois, como nas fotos da ISS. Entre descargas, nada é desenhado.
  // Com prefers-reduced-motion, não há relâmpagos.
  const raios = []; // { c: [x, y, z], pulsos: [[t, força]], fim }
  let centro = null, proxima = 0;
  const sorteio = (a, b) => a + Math.random() * (b - a);

  // Ponto da nuvem sob um pixel da tela (y a partir de baixo), como no shader.
  function pontoNaNuvem(px, py) {
    const nx = px / W * 2 - 1, ny = py / H * 2 - 1;
    const d = cam.F.map((f, i) => f + cam.R[i] * nx * cam.tanX + cam.Up[i] * ny * cam.tanY);
    const l = Math.hypot(...d);
    const o = [0, RP + ALT, 0], RC = RP + 12;
    const dd = d.map(v => v / l);
    const tc = -(o[0] * dd[0] + o[1] * dd[1] + o[2] * dd[2]);
    const p = o.map((v, i) => v + dd[i] * tc);
    const dmin = Math.hypot(...p);
    if (dmin >= RC || tc <= 0) return null;
    const t = tc - Math.sqrt((RC - dmin) * (RC + dmin));
    const q = o.map((v, i) => v + dd[i] * t);
    return q.map(v => v / RC);
  }
  // Desloca um ponto da esfera dx, dy km no plano tangente.
  function deslocar(c, dx, dy) {
    let t1 = [0, c[2], -c[1]];
    const l = Math.hypot(...t1);
    t1 = t1.map(v => v / l);
    const t2 = [c[1] * t1[2] - c[2] * t1[1], c[2] * t1[0] - c[0] * t1[2], c[0] * t1[1] - c[1] * t1[0]];
    const RC = RP + 12;
    const q = c.map((v, i) => v + (t1[i] * dx + t2[i] * dy) / RC);
    const m = Math.hypot(...q);
    return q.map(v => v / m);
  }

  function descarga(agora) {
    if (!centro) {
      // Num dos lados, longe do texto do meio.
      const lado = Math.random() < 0.5 ? sorteio(0.06, 0.28) : sorteio(0.72, 0.94);
      centro = pontoNaNuvem(W * lado, H * sorteio(0.1, 0.4));
      if (!centro) return;
    }
    // A tempestade anda devagar.
    centro = deslocar(centro, sorteio(-6, 6), sorteio(-6, 6));
    const celula = (c, atraso, forca) => {
      const n = 1 + Math.floor(Math.random() * Math.random() * 4.5);
      const pulsos = [];
      let t = agora + atraso;
      for (let i = 0; i < n; i++) {
        pulsos.push([t, forca * sorteio(0.5, 1.2)]);
        t += sorteio(40, 220);
      }
      raios.push({ c, pulsos, fim: t + 700 });
    };
    celula(deslocar(centro, sorteio(-45, 45), sorteio(-45, 45)), 0, sorteio(0.7, 1.6));
    if (Math.random() < 0.35) celula(deslocar(centro, sorteio(-80, 80), sorteio(-80, 80)), sorteio(120, 500), sorteio(0.4, 1.0));
    // Às vezes, longe dali, outra tempestade pisca fraco.
    if (Math.random() < 0.15) {
      const longe = pontoNaNuvem(W * sorteio(0.05, 0.95), H * sorteio(0.45, 0.6));
      if (longe) celula(longe, sorteio(0, 900), sorteio(0.3, 0.6));
    }
  }

  // Brilho de cada relâmpago agora: subida rápida e queda de ~60 ms por
  // pulso, mais um resto que apaga em ~400 ms.
  function brilhoRaios(agora) {
    for (let i = raios.length - 1; i >= 0; i--) if (agora > raios[i].fim) raios.splice(i, 1);
    const out = new Float32Array(16);
    raios.slice(0, 4).forEach((r, k) => {
      let b = 0;
      for (const [t, f] of r.pulsos) {
        const dt = agora - t;
        if (dt < 0) continue;
        b += f * (Math.min(1, dt / 8) * Math.exp(-dt / 60) + 0.18 * Math.exp(-dt / 400));
      }
      out.set([...r.c, b], k * 4);
    });
    return out;
  }

  let heroVisivel = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { heroVisivel = es[0].isIntersecting; }).observe(hero);
  }
  function tempestade(agora) {
    if (agora >= proxima && heroVisivel && !document.hidden) {
      descarga(agora);
      proxima = agora + sorteio(900, 5200);
    }
    setTimeout(() => requestAnimationFrame(tempestade), Math.max(50, proxima - performance.now()));
  }

  // Depois do nascer, só a etapa leve (feixes, reflexos e relâmpagos) é
  // refeita a cada quadro, e só com o hero na tela e a aba visível.
  function animar() {
    if (fim && heroVisivel && !document.hidden) compor();
    requestAnimationFrame(animar);
  }

  /* ---------------------------------------------------------------- nascer */

  // Em duas fases, emendadas sem tranco (velocidade zero na emenda):
  // a alvorada, em que o sol sobe de ~7° abaixo do horizonte até logo
  // abaixo dele, freando; e o nascer, em que o disco sai devagar, com começo
  // e fim suaves. Com o sol fundo, a luz que chega à atmosfera passa rente
  // ao planeta e chega fraca e vermelha: a faixa começa quase apagada e
  // alaranjada e vai clareando até o azul (o shader calcula isso sozinho).
  const ALVORADA = 12000, DURACAO = 30000;
  const E0 = -0.12, EM = -RAIO_SOL * 1.2, E1 = RAIO_SOL * 0.8;
  const freia = x => 1 - Math.pow(1 - x, 2);
  const suaviza = x => (1 - Math.cos(Math.PI * x)) / 2;
  let inicio = null, fim = false;
  const elevacao = ms => ms < ALVORADA
    ? E0 + (EM - E0) * freia(ms / ALVORADA)
    : EM + (E1 - EM) * suaviza(Math.min(1, (ms - ALVORADA) / (DURACAO - ALVORADA)));

  function quadro(ms) {
    if (inicio === null) inicio = ms;
    const passou = ms - inicio;
    desenhar(elevacao(passou));
    // Continua até o fim da subida e da entrada dos raios.
    if (passou < DURACAO || ganho() < GANHO) requestAnimationFrame(quadro);
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
  // A tempestade começa depois que os olhos se acostumam ao escuro.
  if (!reduz) {
    proxima = performance.now() + 4000;
    setTimeout(() => requestAnimationFrame(tempestade), 4000);
    requestAnimationFrame(animar);
  }
  addEventListener("resize", () => {
    medir();
    if (fim) desenhar(E1);
  });
})();
