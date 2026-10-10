/* Potências: a escada do início, as regras com os números do leitor, o
 * desenho de (a + b)² e a calculadora de notação científica. Os cards de
 * regra e os utilitários vêm de licao.js.
 */
(() => {
  const { fmt, sup, texNum, tone, isInt, paren, math, el, svg, saveParams } = Licao;

  const VARS = {
    a: { min: 1, max: 10, value: 2 },
    b: { min: 1, max: 10, value: 3 },
    m: { min: -3, max: 6, value: 3 },
    n: { min: -3, max: 6, value: 2 },
    k: { min: 1, max: 6, value: 3 },
    p: { min: 0, max: 6, value: 2 },
    x: { min: -5, max: 5, value: -3 },
  };

  /* ---------------------------------------------------------------- frações exatas */

  // Potência de inteiro com expoente inteiro é sempre uma fração de inteiros:
  // guardamos { n, d } para mostrar 1/8 em vez de só 0,125.
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const Q = (n, d = 1) => {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  };
  const qpow = (q, e) => (e >= 0 ? Q(q.n ** e, q.d ** e) : Q(q.d ** -e, q.n ** -e));
  const qmul = (p, q) => Q(p.n * q.n, p.d * q.d);
  const qdiv = (p, q) => Q(p.n * q.d, p.d * q.n);
  const val = q => q.n / q.d;

  // Inteiros grandes e decimais muito pequenos vão em notação científica.
  function numTex(v) {
    const a = Math.abs(v);
    if (a !== 0 && (a >= 1e9 || a < 1e-4)) {
      const k = Math.floor(Math.log10(a));
      const m = v / 10 ** k;
      return Math.abs(Math.abs(m) - 1) < 1e-9 ? `${m < 0 ? "-" : ""}10^{${k}}` : `${texNum(m, 3)} \\cdot 10^{${k}}`;
    }
    return texNum(v, 6);
  }

  // Só a forma exata: 8, 1/8, −1/8.
  const qFrac = q => (q.d === 1 ? numTex(q.n) : `${q.n < 0 ? "-" : ""}\\dfrac{${numTex(Math.abs(q.n))}}{${numTex(q.d)}}`);
  // Exata e decimal: 1/8 = 0,125 · 9/4 = 2,25 · 1/3 ≈ 0,3333
  function qTex(q) {
    if (q.d === 1) return numTex(q.n);
    const v = val(q);
    return `${qFrac(q)} ${isInt(v * 1e6) ? "=" : "\\approx"} ${numTex(v)}`;
  }

  // a^{-2}, com o expoente negativo entre chaves e a base negativa entre parênteses.
  const pw = (base, e) => `${typeof base === "number" ? paren(base) : base}^{${e}}`;

  /* ---------------------------------------------------------------- regras */

  const RULES = {
    produto({ a, m, n }) {
      const A = Q(a), l = qmul(qpow(A, m), qpow(A, n)), r = qpow(A, m + n);
      return {
        lhs: [`${pw(a, m)} \\cdot ${pw(a, n)} = ${qTex(l)}`, val(l)],
        rhs: [`${pw(a, `${m} + ${paren(n)}`)} = ${pw(a, m + n)} = ${qTex(r)}`, val(r)],
        note: m > 0 && n > 0 && m + n <= 8
          ? `Contando os fatores: são ${m} cópias do ${a} vezes ${n} cópias — ${m + n} cópias ao todo.`
          : "",
      };
    },
    quociente({ a, m, n }) {
      const A = Q(a), l = qdiv(qpow(A, m), qpow(A, n)), r = qpow(A, m - n);
      return {
        lhs: [`\\dfrac{${pw(a, m)}}{${pw(a, n)}} = ${qTex(l)}`, val(l)],
        rhs: [`${pw(a, `${m} - ${paren(n)}`)} = ${pw(a, m - n)} = ${qTex(r)}`, val(r)],
        note: m === n ? `Com m = n, sobra ${a}⁰ = 1: tudo o que estava em cima foi cortado com o que estava embaixo.`
          : m > 0 && n > 0 ? `Cada ${a} de baixo cancela um ${a} de cima; ${m > n ? `${m - n === 1 ? "sobra 1" : `sobram ${m - n}`} em cima` : `${n - m === 1 ? "sobra 1" : `sobram ${n - m}`} embaixo, por isso o expoente fica negativo`}.` : "",
      };
    },
    zero({ a, m }) {
      const A = Q(a), t = qpow(A, m);
      return {
        lhs: [`\\dfrac{${pw(a, m)}}{${pw(a, m)}} = \\dfrac{${numTex(val(t))}}{${numTex(val(t))}} = 1`, 1],
        rhs: [`${pw(a, `${m} - ${paren(m)}`)} = ${pw(a, 0)}`, 1],
        note: "Qualquer número diferente de zero dividido por ele mesmo dá 1. Pela regra do quociente, a mesma divisão dá a⁰ — por isso a⁰ só pode valer 1.",
      };
    },
    negativo({ a, k }) {
      const l = qpow(Q(a), -k);
      return {
        lhs: [`${pw(a, -k)} = ${qTex(l)}`, val(l)],
        rhs: [`\\dfrac{1}{${pw(a, k)}} = \\dfrac{1}{${numTex(a ** k)}}`, 1 / a ** k],
        note: "Expoente negativo não deixa o número negativo: ele manda a potência para o denominador.",
      };
    },
    potPot({ a, m, n }) {
      const l = qpow(qpow(Q(a), m), n), r = qpow(Q(a), m * n);
      return {
        lhs: [`\\left(${pw(a, m)}\\right)^{${n}} = \\left(${qFrac(qpow(Q(a), m))}\\right)^{${n}} = ${qTex(l)}`, val(l)],
        rhs: [`${pw(a, `${m} \\cdot ${paren(n)}`)} = ${pw(a, m * n)} = ${qTex(r)}`, val(r)],
      };
    },
    produtoBase({ a, b, n }) {
      const l = qpow(Q(a * b), n), r = qmul(qpow(Q(a), n), qpow(Q(b), n));
      return {
        lhs: [`(${a} \\cdot ${b})^{${n}} = ${pw(a * b, n)} = ${qTex(l)}`, val(l)],
        rhs: [`${pw(a, n)} \\cdot ${pw(b, n)} = ${qFrac(qpow(Q(a), n))} \\cdot ${qFrac(qpow(Q(b), n))} = ${qTex(r)}`, val(r)],
      };
    },
    fracao({ a, b, n }) {
      const l = qpow(Q(a, b), n);
      return {
        lhs: [`\\left(\\dfrac{${a}}{${b}}\\right)^{${n}} = ${qTex(l)}`, val(l)],
        rhs: [`\\dfrac{${pw(a, n)}}{${pw(b, n)}} = ${qTex(qdiv(qpow(Q(a), n), qpow(Q(b), n)))}`, val(qdiv(qpow(Q(a), n), qpow(Q(b), n)))],
      };
    },
    fracaoNeg({ a, b, k }) {
      const l = qpow(Q(a, b), -k), r = qpow(Q(b, a), k);
      return {
        lhs: [`\\left(\\dfrac{${a}}{${b}}\\right)^{${-k}} = ${qTex(l)}`, val(l)],
        rhs: [`\\left(\\dfrac{${b}}{${a}}\\right)^{${k}} = ${qTex(r)}`, val(r)],
        note: "Com expoente negativo, a fração vira de cabeça para baixo e o expoente fica positivo.",
      };
    },
    sinal({ x, p }) {
      const v = x ** p;
      const fatores = Array(p).fill(paren(x)).join(" \\cdot ");
      const prev = x < 0 && p % 2 === 1 ? `-\\,${pw(-x, p)}` : pw(Math.abs(x), p);
      return {
        lhs: [p === 0 ? `${pw(x, 0)} = 1` : `${pw(x, p)} = ${fatores} = ${numTex(v)}`, v],
        rhs: [`${prev} = ${numTex(x < 0 && p % 2 ? -(Math.abs(x) ** p) : Math.abs(x) ** p)}`, x < 0 && p % 2 ? -(Math.abs(x) ** p) : Math.abs(x) ** p],
        note: x >= 0
          ? "Com base positiva o sinal nunca muda. Arraste x para um valor negativo."
          : p === 0
            ? "Expoente 0: o resultado é 1, qualquer que seja o sinal da base."
            : p % 2 === 0
              ? `Expoente par: os ${p} sinais de menos se cancelam aos pares, e o resultado é positivo.`
              : `Expoente ímpar: os sinais se cancelam aos pares, mas sobra um. O resultado é negativo.`,
      };
    },
    semParenteses({ a, p }) {
      const l = -(a ** p), r = (-a) ** p;
      return {
        lhs: [`-${a}^{${p}} = -(${a}^{${p}}) = ${numTex(l)}`, l],
        rhs: [`(-${a})^{${p}} = ${numTex(r)}`, r],
        note: p % 2 === 1
          ? `Com expoente ímpar os dois coincidem — mas por sorte. Mude p para um número par e veja a diferença.`
          : `Em −${a}${sup(p)}, o expoente pega só o ${a}; o sinal fica de fora. Em (−${a})${sup(p)}, os parênteses colocam o sinal dentro da base.`,
      };
    },
    somaPot({ a, b, p }) {
      const l = (a + b) ** p, r = a ** p + b ** p;
      return {
        lhs: [`(${a} + ${b})^{${p}} = ${pw(a + b, p)} = ${numTex(l)}`, l],
        rhs: [`${pw(a, p)} + ${pw(b, p)} = ${numTex(a ** p)} + ${numTex(b ** p)} = ${numTex(r)}`, r],
        note: p === 1 ? "Com expoente 1 coincidem. Com qualquer outro, não."
          : p === 2 ? `Falta o termo do meio: (a + b)² = a² + 2ab + b², e 2 · ${a} · ${b} = ${2 * a * b} é exatamente a diferença. O desenho mostra de onde ele vem.`
          : "",
        draw: p === 2 ? box => drawSquare(box, a, b) : null,
      };
    },
    somaExp({ a, m, n }) {
      const l = qpow(Q(a), m + n), r = Q(qpow(Q(a), m).n * qpow(Q(a), n).d + qpow(Q(a), n).n * qpow(Q(a), m).d, qpow(Q(a), m).d * qpow(Q(a), n).d);
      return {
        lhs: [`${pw(a, m)} + ${pw(a, n)} = ${qTex(r)}`, val(r)],
        rhs: [`${pw(a, m + n)} = ${qTex(l)}`, val(l)],
        note: "Somar os expoentes é a regra da multiplicação, não da soma. Uma soma de potências em geral não se simplifica."
          + (Math.abs(val(l) - val(r)) < 1e-9 ? " Aqui deu igual por coincidência (2¹ + 2¹ = 2²): mude os valores." : ""),
      };
    },
    prodExp({ a, m, n }) {
      const l = qpow(Q(a), m + n), r = qpow(Q(a), m * n);
      return {
        lhs: [`${pw(a, m)} \\cdot ${pw(a, n)} = ${pw(a, m + n)} = ${qTex(l)}`, val(l)],
        rhs: [`${pw(a, `${m} \\cdot ${paren(n)}`)} = ${pw(a, m * n)} = ${qTex(r)}`, val(r)],
        note: "Na multiplicação de mesma base, os expoentes se somam; multiplicar expoentes é a regra da potência de potência."
          + (m + n === m * n || a === 1 ? " Com esses valores deu igual por coincidência: mude-os." : ""),
      };
    },
  };

  /* ---------------------------------------------------------------- (a + b)² */

  // O quadrado de lado a + b dividido em a², b² e dois retângulos ab.
  function drawSquare(box, a, b) {
    const S = 220, u = S / (a + b), A = a * u, x0 = 30, y0 = 10;
    const g = svg("svg", { viewBox: `0 0 ${S + 60} ${S + 40}`, class: "tri", role: "img",
      "aria-label": `Quadrado de lado ${a} + ${b} dividido em ${a}², ${b}² e dois retângulos de ${a} por ${b}` });
    const rect = (x, y, w, h, cls, label) => {
      svg("rect", { x: x0 + x, y: y0 + y, width: w, height: h, class: cls }, g);
      const t = svg("text", { x: x0 + x + w / 2, y: y0 + y + h / 2 + 4, class: "tri-label", "text-anchor": "middle" }, g);
      t.textContent = w > 22 && h > 14 ? label : "";
    };
    rect(0, 0, A, A, "sq-a", `${a}² = ${a * a}`);
    rect(A, 0, S - A, A, "sq-ab", `${a}·${b} = ${a * b}`);
    rect(0, A, A, S - A, "sq-ab", `${a}·${b} = ${a * b}`);
    rect(A, A, S - A, S - A, "sq-b", `${b}² = ${b * b}`);
    const lab = (x, y, txt, anchor = "middle") => {
      const t = svg("text", { x, y, class: "tri-label is-hi", "text-anchor": anchor }, g);
      t.textContent = txt;
    };
    lab(x0 + A / 2, y0 + S + 18, `${a}`);
    lab(x0 + A + (S - A) / 2, y0 + S + 18, `${b}`);
    lab(x0 - 8, y0 + A / 2 + 4, `${a}`, "end");
    lab(x0 - 8, y0 + A + (S - A) / 2 + 4, `${b}`, "end");
    box.replaceChildren(g);
  }

  /* ---------------------------------------------------------------- escada do início */

  function initIntro(section) {
    const inA = section.querySelector("input[name=base]");
    const inN = section.querySelector("input[name=expoente]");
    const outA = section.querySelector(".out-base");
    const outN = section.querySelector(".out-expoente");
    const expand = section.querySelector(".intro-expand");
    const ladder = section.querySelector(".ladder-steps");
    const text = section.querySelector(".intro-text");

    function draw() {
      const a = Number(inA.value), n = Number(inN.value);
      outA.textContent = a;
      outN.textContent = fmt(n);
      const q = qpow(Q(a), n);
      const copies = c => Array(c).fill(a).join(" \\cdot ");
      math(expand, n > 0
        ? `${pw(a, n)} = \\underbrace{${copies(n)}}_{${n}\\ \\text{${n === 1 ? "fator" : "fatores"}}} = ${tone(numTex(a ** n), 1)}`
        : n === 0
          ? `${pw(a, 0)} = ${tone("1", 1)}`
          : `${pw(a, n)} = \\dfrac{1}{${copies(-n)}} = ${tone(qTex(q), 1)}`);

      // Os degraus de 5 a −3: de um para o outro, sempre ÷ a.
      ladder.replaceChildren();
      for (let e = 5; e >= -3; e--) {
        if (e < 5) ladder.appendChild(el("li", "ladder-op", `÷ ${a}`));
        const li = el("li", e === n ? "ladder-step is-on" : "ladder-step");
        const top = el("span", "ladder-pow");
        math(top, pw(a, e));
        const bottom = el("span", "ladder-val");
        math(bottom, qFrac(qpow(Q(a), e)));
        li.append(top, bottom);
        ladder.appendChild(li);
      }
      // Centraliza o degrau atual rolando só a faixa, nunca a página.
      const on = ladder.querySelector(".is-on");
      if (on) ladder.scrollLeft = on.offsetLeft - (ladder.clientWidth - on.offsetWidth) / 2;

      text.innerHTML = n > 1
        ? `<strong>${a}<sup>${n}</sup></strong> é o ${a} multiplicado por ele mesmo, ${n} vezes. O expoente conta quantos fatores há.`
        : n === 1
          ? `Com um fator só, não há o que multiplicar: <strong>${a}<sup>1</sup> = ${a}</strong>.`
          : n === 0
            ? `Zero fatores? Olhe a escada: cada degrau para baixo divide por ${a}. Descendo de ${a}<sup>1</sup> = ${a}, chega-se a ${a} ÷ ${a} = <strong>1</strong>. Por isso a<sup>0</sup> = 1.`
            : `Continuando a descer a escada, divide-se por ${a} mais ${-n === 1 ? "uma vez" : `${-n} vezes`} depois do 1: o resultado é <strong>1 sobre ${a}<sup>${-n}</sup></strong>. Expoente negativo é inverso, não número negativo.`;
      saveParams({ base: a, expoente: n });
    }

    const q = new URLSearchParams(location.search);
    if (q.has("base")) inA.value = q.get("base");
    if (q.has("expoente")) inN.value = q.get("expoente");
    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- notação científica */

  function initScientific(section) {
    const input = section.querySelector("input[name=num]");
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("num")) input.value = q.get("num");

    // Feito com os algarismos como texto: 0,1 + nada de ponto flutuante.
    function update() {
      const raw = input.value.trim().replace(/\s/g, "");
      steps.replaceChildren();
      const ok = /^-?\d+(,\d+)?$/.test(raw) && /[1-9]/.test(raw);
      input.setAttribute("aria-invalid", String(!ok));
      section.classList.toggle("has-error", !ok);
      if (!ok) {
        result.textContent = "";
        note.textContent = "Digite um número diferente de zero, com vírgula para os decimais e sem pontos de milhar (ex.: 0,00052 ou 6020000).";
        return;
      }
      saveParams({ num: raw });
      const neg = raw.startsWith("-");
      const [ip, fp = ""] = raw.replace("-", "").split(",");
      const digits = ip + fp;
      const i = digits.search(/[1-9]/);
      const k = ip.length - 1 - i;
      const sig = digits.slice(i).replace(/0+$/, "");
      const mant = sig.length > 1 ? `${sig[0]},${sig.slice(1)}` : sig;
      const mantTex = mant.replace(",", "{,}");
      const sign = neg ? "-" : "";
      const orig = (neg ? "-" : "") + ip.replace(/^0+(?=\d)/, "") + (fp ? `{,}${fp}` : "");

      const add = (t, src) => {
        const li = el("li");
        li.appendChild(el("span", null, t));
        if (src) { const m = el("span", "calc-math"); math(m, src); li.appendChild(m); }
        steps.appendChild(li);
      };
      add(`Mova a vírgula até sobrar um único algarismo diferente de zero antes dela: ${mant}.`, null);
      add(k === 0
        ? "A vírgula não precisou andar, então o expoente é 0."
        : `A vírgula andou ${Math.abs(k)} ${Math.abs(k) === 1 ? "casa" : "casas"} para a ${k > 0 ? "esquerda" : "direita"}. ${k > 0 ? "Para compensar, multiplique por 10 elevado a esse número." : "Para compensar, multiplique por 10 elevado a menos esse número."}`,
        `${orig} = ${sign}${mantTex} \\times 10^{${k}}`);
      add(k >= 0 ? `Confira: 10${sup(k)} é 1 seguido de ${k} ${k === 1 ? "zero" : "zeros"}.` : `Confira: 10${sup(k)} = 1 / 10${sup(-k)}, ou seja, dividir por 1 seguido de ${-k} ${-k === 1 ? "zero" : "zeros"}.`,
        `10^{${k}} = ${k >= 0 ? `1${"0".repeat(k)}` : `\\dfrac{1}{1${"0".repeat(-k)}}`}`);
      math(result, `${orig} = ${tone(`${sign}${mantTex} \\times 10^{${k}}`, 1)}`);
      note.textContent = k > 0
        ? "Expoente positivo: número grande (maior que 10). O expoente diz quantas casas há depois do primeiro algarismo."
        : k < 0
          ? "Expoente negativo: número pequeno (menor que 1). É o mesmo expoente negativo da escada lá em cima — um inverso."
          : "Entre 1 e 10, o número já está em notação científica: basta multiplicar por 10⁰ = 1.";
    }

    section.addEventListener("input", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      input.value = btn.dataset.exemplo;
      update();
    }));
    update();
  }

  Licao.renderTex();
  const intro = document.querySelector(".intro");
  if (intro) initIntro(intro);
  const sci = document.querySelector(".calc[data-calc=cientifica]");
  if (sci) initScientific(sci);
  Licao.regras(VARS, RULES);
})();
