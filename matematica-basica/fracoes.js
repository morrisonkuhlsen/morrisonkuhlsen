/* Frações: as barras do início, simplificar, somar com o MMC, as regras com
 * os números do leitor e a conversão entre fração, decimal e porcentagem.
 * Os cards de regra e os utilitários vêm de licao.js. Toda conta é feita
 * com inteiros: 1/3 fica 1/3, não 0,3333.
 */
(() => {
  const { fmt, texNum, tone, math, el, svg, saveParams } = Licao;

  const VARS = {
    a: { min: 1, max: 12, value: 1 },
    b: { min: 1, max: 12, value: 2 },
    c: { min: 1, max: 12, value: 1 },
    d: { min: 1, max: 12, value: 3 },
    k: { min: 1, max: 10, value: 2 },
  };

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  // n/d com o sinal no numerador.
  const F = (n, d) => (d < 0 ? [-n, -d] : [n, d]);
  const reduce = ([n, d]) => { const g = gcd(n, d); return [n / g, d / g]; };

  // \dfrac{3}{4}, −\dfrac{3}{4} ou 2 (denominador 1).
  const fracTex = ([n, d], t) => {
    const s = d === 1 ? texNum(n) : `${n < 0 ? "-" : ""}\\dfrac{${texNum(Math.abs(n))}}{${texNum(d)}}`;
    return t ? tone(s, t) : s;
  };
  // 6/8 = 3/4: a forma dada e, se der, a simplificada.
  const fracChain = f => {
    const r = reduce(f);
    return r[1] === f[1] ? fracTex(f) : `${fracTex(f)} = ${fracTex(r)}`;
  };
  // "= 0,5" ou "≈ 0,3333", conforme o decimal termine em 4 casas.
  const dv = v => `${Number.isInteger(Math.round(v * 1e9) / 1e5) ? "=" : "\\approx"} ${texNum(v)}`;
  const fracText = ([n, d]) => (d === 1 ? fmt(n) : `${fmt(n)}/${fmt(d)}`);

  /* ---------------------------------------------------------------- barras */

  // Barras de `d` pedaços; `segs` = [[quantidade, classe], …] pintados em
  // sequência. Passando de d, continua na barra seguinte (fração imprópria).
  function bars(d, segs, rowsMin = 1) {
    const total = segs.reduce((s, [c]) => s + c, 0);
    const rows = Math.max(rowsMin, Math.ceil(total / d));
    const W = 300, H = 26, GAP = 6;
    const g = svg("svg", { viewBox: `0 0 ${W} ${rows * (H + GAP) - GAP}`, class: "bar-svg", "aria-hidden": "true" });
    const w = W / d;
    const classOf = i => {
      let acc = 0;
      for (const [c, cls] of segs) { acc += c; if (i < acc) return cls; }
      return "";
    };
    for (let r = 0; r < rows; r++) {
      const y = r * (H + GAP);
      for (let i = 0; i < d; i++) {
        const cls = classOf(r * d + i);
        svg("rect", { x: i * w, y, width: w, height: H, class: `bar-cell ${cls}` }, g);
      }
      svg("rect", { x: 0, y, width: W, height: H, class: "bar-edge" }, g);
    }
    return g;
  }

  function barRow(label, svgEl) {
    const row = el("div", "bar-row");
    const lab = el("span", "bar-label");
    math(lab, label);
    row.append(lab, svgEl);
    return row;
  }

  /* ---------------------------------------------------------------- início */

  function initIntro(section) {
    const inN = section.querySelector("input[name=num]");
    const inD = section.querySelector("input[name=den]");
    const outN = section.querySelector(".out-num");
    const outD = section.querySelector(".out-den");
    const figure = section.querySelector(".intro-figure");
    const equiv = section.querySelector(".equiv-figure");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("num")) inN.value = q.get("num");
    if (q.has("den")) inD.value = q.get("den");

    function draw() {
      const n = Number(inN.value), d = Number(inD.value);
      outN.textContent = n;
      outD.textContent = d;
      figure.replaceChildren(barRow(fracTex([n, d], 1), bars(d, [[n, "fill-1"]])));

      // A mesma quantidade cortada mais fino: 1/2 = 2/4 = 3/6.
      equiv.replaceChildren();
      for (let k = 1; k <= 3; k++) {
        if (d * k > 36) break;
        equiv.appendChild(barRow(`${fracTex([n * k, d * k])}`, bars(d * k, [[n * k, "fill-1"]], Math.max(1, Math.ceil(n / d)))));
      }

      const v = n / d;
      const parts = [];
      parts.push(`<p>A barra inteira foi cortada em <strong>${d} ${d === 1 ? "pedaço" : "pedaços iguais"}</strong> (o denominador) e pegamos <strong>${n}</strong> (o numerador).</p>`);
      if (n === 0) parts.push("<p>Nenhum pedaço: a fração vale 0.</p>");
      else if (n === d) parts.push("<p>Todos os pedaços: a fração vale exatamente 1 inteiro.</p>");
      else if (n > d) {
        const i = Math.floor(n / d), r = n % d;
        parts.push(`<p>Mais pedaços do que cabem numa barra: é uma <strong>fração imprópria</strong>, maior que 1. São ${i} ${i === 1 ? "inteiro" : "inteiros"}${r ? ` e mais ${r}/${d}` : ""}.</p>`);
      }
      const [rn, rd] = reduce([n, d]);
      if (n && rd !== d) parts.push(`<p>Repare nas barras de baixo: ${n}/${d} pinta o mesmo tanto que ${rn}/${rd}. São <strong>frações equivalentes</strong> — o mesmo número escrito com pedaços de tamanhos diferentes.</p>`);
      parts.push(`<p>Em decimal, ${n}/${d} = ${n} ÷ ${d} ${Number.isInteger(v * 1e4) ? "=" : "≈"} <strong>${fmt(v)}</strong>, ou ${fmt(v * 100, 2)}%.</p>`);
      text.innerHTML = parts.join("");
      saveParams({ num: n, den: d });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- calculadoras */

  const readInt = s => (/^\s*-?\d{1,7}\s*$/.test(s) ? Number(s.trim()) : NaN);

  // Passos: [texto, LaTeX ou null] numa <ol>.
  function fill(section, out) {
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const figure = section.querySelector(".calc-figure");
    steps.replaceChildren();
    if (figure) figure.replaceChildren();
    section.classList.toggle("has-error", !!out.error);
    if (out.error) {
      result.textContent = "";
      note.textContent = out.error;
      return;
    }
    math(result, out.result);
    out.steps.forEach(([t, src]) => {
      const li = el("li");
      li.appendChild(el("span", null, t));
      if (src) { const m = el("span", "calc-math"); math(m, src); li.appendChild(m); }
      steps.appendChild(li);
    });
    if (figure && out.figure) out.figure.forEach(r => figure.appendChild(r));
    note.innerHTML = out.note || "";
  }

  function bindCalc(section, fields, compute) {
    const inputs = fields.map(f => section.querySelector(`[name=${f}]`));
    const q = new URLSearchParams(location.search);
    inputs.forEach(i => { if (q.has(i.name)) i.value = q.get(i.name); });
    const update = () => {
      fill(section, compute(Object.fromEntries(inputs.map(i => [i.name, i.value]))));
      saveParams(Object.fromEntries(inputs.map(i => [i.name, i.value.trim()])));
    };
    section.addEventListener("input", update);
    section.addEventListener("change", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      btn.dataset.exemplo.split(";").forEach((v, i) => { inputs[i].value = v; });
      update();
    }));
    update();
  }

  function simplificar({ sn, sd }) {
    const n = readInt(sn), d = readInt(sd);
    if (Number.isNaN(n) || Number.isNaN(d)) return { error: "Digite numerador e denominador inteiros (até 7 algarismos)." };
    if (d === 0) return { error: "O denominador não pode ser zero: não dá para dividir o inteiro em 0 pedaços." };
    const f = F(n, d), g = gcd(n, d), r = reduce(f);
    if (n === 0) return { result: `${fracTex(f)} = ${tone("0", 1)}`, steps: [["Zero pedaços de qualquer tamanho é zero.", null]] };
    const steps = [
      ["Ache o MDC do numerador e do denominador — o maior número que divide os dois:",
        `\\text{MDC}(${texNum(Math.abs(n))},\\ ${texNum(Math.abs(d))}) = ${tone(texNum(g), 3)}`],
    ];
    if (g === 1) {
      steps.push(["Como o MDC é 1, não há nada para cortar: a fração já é irredutível.", null]);
    } else {
      steps.push(["Divida os dois pelo MDC:",
        `\\dfrac{${texNum(f[0])} \\div ${tone(texNum(g), 3)}}{${texNum(f[1])} \\div ${tone(texNum(g), 3)}} = ${fracTex(r, 1)}`]);
    }
    const figure = Math.abs(n) <= 4 * Math.abs(d) && Math.abs(d) <= 40 && n > 0 && f[1] > 0 ? [
      barRow(fracTex(f), bars(f[1], [[f[0], "fill-2"]])),
      barRow(fracTex(r), bars(r[1], [[r[0], "fill-1"]], Math.ceil(f[0] / f[1]))),
    ] : null;
    return {
      result: g === 1 ? `${fracTex(f, 1)}\\ \\text{(já irredutível)}` : `${fracTex(f)} = ${fracTex(r, 1)}`,
      steps,
      figure,
      note: `${g === 1 ? "" : `As duas frações valem o mesmo: ${fmt(n / d)}. `}<a href="mdc.html?n=${Math.abs(n)},${Math.abs(d)}">Veja o MDC passo a passo →</a>`,
    };
  }

  // Campos fa…fd: a, b, c, d já são as variáveis das regras na URL.
  function somar({ fa, fb, op, fc, fd }) {
    let [a, b, c, d] = [fa, fb, fc, fd].map(readInt);
    if ([a, b, c, d].some(Number.isNaN)) return { error: "Preencha os quatro campos com inteiros." };
    if (b === 0 || d === 0) return { error: "Denominador não pode ser zero." };
    [a, b] = F(a, b); [c, d] = F(c, d);
    const sign = op === "-" ? -1 : 1, opTex = op === "-" ? "-" : "+";
    const L = lcm(b, d), ka = L / b, kc = L / d;
    const top = a * ka + sign * c * kc;
    const r = reduce([top, L]);
    const steps = [];
    if (b === d) {
      steps.push(["Os denominadores já são iguais: os pedaços têm o mesmo tamanho, basta somar os numeradores.", null]);
    } else {
      steps.push([`Os pedaços têm tamanhos diferentes (1/${b} e 1/${d}). Ache um tamanho que sirva para os dois — o MMC dos denominadores:`,
        `\\text{MMC}(${b},\\ ${d}) = ${tone(texNum(L), 3)}`]);
      steps.push(["Reescreva cada fração com esse denominador, multiplicando em cima e embaixo pelo mesmo número:",
        `${fracTex([a, b])} = \\dfrac{${texNum(a)} \\cdot ${ka}}{${b} \\cdot ${ka}} = ${fracTex([a * ka, L])} \\qquad ${fracTex([c, d])} = \\dfrac{${texNum(c)} \\cdot ${kc}}{${d} \\cdot ${kc}} = ${fracTex([c * kc, L])}`]);
    }
    steps.push([`Agora ${op === "-" ? "subtraia" : "some"} os numeradores e mantenha o denominador:`,
      `\\dfrac{${texNum(a * ka)} ${opTex} ${texNum(c * kc)}}{${texNum(L)}} = ${fracTex([top, L])}`]);
    if (r[1] !== L && top !== 0) steps.push(["Simplifique pelo MDC:", `${fracTex([top, L])} = ${fracTex(r, 1)}`]);

    const ok = a >= 0 && c >= 0 && top >= 0 && L <= 48 && (a * ka + c * kc) <= 3 * L;
    const figure = ok ? (op === "-"
      ? [barRow(fracTex([a * ka, L]), bars(L, [[a * ka, "fill-2"]])),
        barRow(`-${fracTex([c * kc, L])}`, bars(L, [[c * kc, "fill-3"]])),
        barRow(`= ${fracTex([top, L])}`, bars(L, [[top, "fill-1"], [c * kc, "fill-ghost"]]))]
      : [barRow(fracTex([a, b]), bars(L, [[a * ka, "fill-2"]])),
        barRow(`+${fracTex([c, d])}`, bars(L, [[c * kc, "fill-3"]])),
        barRow(`= ${fracTex([top, L])}`, bars(L, [[a * ka, "fill-2"], [c * kc, "fill-3"]]))]) : null;

    return {
      result: `${fracTex([a, b])} ${opTex} ${fracTex([c, d])} = ${fracTex(r, 1)}${r[1] === 1 ? "" : ` \\approx ${texNum(r[0] / r[1])}`}`,
      steps,
      figure,
      note: (ok ? `Nas barras, cada pedaço é 1/${L}: é o MMC que deixa os pedaços das duas frações do mesmo tamanho. ` : "")
        + (b !== d ? `<a href="mmc.html?n=${b},${d}">Veja o MMC passo a passo →</a>` : ""),
    };
  }

  /* ---------------------------------------------------------------- fração ↔ decimal ↔ % */

  // Divisão longa de n/d (n ≥ 0): devolve a parte inteira, os decimais e
  // onde começa o período, achado quando um resto se repete.
  function longDivision(n, d) {
    const int = Math.floor(n / d);
    let r = n % d;
    const seen = new Map(), digits = [];
    while (r && !seen.has(r) && digits.length < 40) {
      seen.set(r, digits.length);
      r *= 10;
      digits.push(Math.floor(r / d));
      r %= d;
    }
    return { int, digits: digits.join(""), rep: r ? seen.get(r) : -1, cut: r !== 0 && !seen.has(r) };
  }

  // 0,1(6) em texto e 0{,}1\overline{6} em LaTeX.
  function decForms(n, d) {
    const neg = n < 0;
    const { int, digits, rep, cut } = longDivision(Math.abs(n), d);
    const s = neg ? "-" : "";
    if (!digits) return { tex: `${s}${texNum(int)}`, txt: `${s}${fmt(int)}`, rep: false };
    const pre = rep >= 0 ? digits.slice(0, rep) : digits, per = rep >= 0 ? digits.slice(rep) : "";
    return {
      tex: `${s}${texNum(int)}{,}${pre}${per ? `\\overline{${per}}` : ""}${cut ? "\\ldots" : ""}`,
      txt: `${s}${fmt(int)},${pre}${per ? per.repeat(Math.max(1, Math.ceil(4 / per.length))) + "…" : ""}`,
      rep: !!per,
      per,
    };
  }

  function converter({ conv }) {
    const raw = conv.trim().replace(/\s+/g, "");
    let m, f;
    const steps = [];
    if ((m = raw.match(/^(-?\d{1,7})\/(-?\d{1,7})$/))) {
      const n = Number(m[1]), d = Number(m[2]);
      if (d === 0) return { error: "O denominador não pode ser zero." };
      f = F(n, d);
      const r = reduce(f);
      if (r[1] !== f[1]) steps.push(["Simplifique primeiro (fica mais fácil dividir):", fracChain(f)]);
      f = r;
      const dec = decForms(f[0], f[1]);
      steps.push([dec.rep
        ? `Divida o numerador pelo denominador. A divisão nunca termina: um resto volta a aparecer, e a partir daí os algarismos ${dec.per} se repetem para sempre (dízima periódica, marcada com a barra):`
        : "Divida o numerador pelo denominador:",
        `${fracTex(f)} = ${texNum(f[0])} \\div ${texNum(f[1])} = ${tone(dec.tex, 2)}`]);
    } else if ((m = raw.match(/^(-?)(\d{1,7})(?:,(\d{1,7}))?%$/))) {
      const dec = m[3] || "", k = dec.length;
      const top = Number(m[2] + dec) * (m[1] ? -1 : 1);
      f = [top, 100 * 10 ** k];
      steps.push(["Por cento é “por cem”: escreva o número sobre 100.",
        k ? `${m[1]}${m[2]}{,}${dec}\\% = \\dfrac{${m[1]}${m[2]}{,}${dec}}{100} = ${fracTex(f)}` : `${m[1]}${m[2]}\\% = ${fracTex(f)}`]);
      if (reduce(f)[1] !== f[1]) steps.push(["Simplifique pelo MDC:", fracChain(f)]);
      f = reduce(f);
    } else if ((m = raw.match(/^(-?)(\d{1,7})(?:,(\d{1,7}))?$/))) {
      const dec = m[3] || "", k = dec.length;
      const top = Number(m[2] + dec) * (m[1] ? -1 : 1);
      f = [top, 10 ** k];
      steps.push([k ? `Há ${k} ${k === 1 ? "casa decimal" : "casas decimais"}: escreva os algarismos sem a vírgula sobre 1 seguido de ${k} ${k === 1 ? "zero" : "zeros"}.` : "Um inteiro é uma fração de denominador 1.",
        `${m[1]}${m[2]}${k ? `{,}${dec}` : ""} = ${fracTex(f)}`]);
      if (reduce(f)[1] !== f[1]) steps.push(["Simplifique pelo MDC:", fracChain(f)]);
      f = reduce(f);
    } else {
      return { error: "Digite uma fração (3/8), um decimal (0,375) ou uma porcentagem (37,5%)." };
    }

    const dec = decForms(f[0], f[1]);
    const pct = decForms(f[0] * 100, f[1]);
    steps.push(["Para a porcentagem, multiplique por 100 (ande com a vírgula duas casas para a direita):",
      `${dec.tex} \\times 100 = ${tone(`${pct.tex}\\%`, 3)}`]);

    const only25 = (() => { let x = f[1]; for (const p of [2, 5]) while (x % p === 0) x /= p; return x === 1; })();
    return {
      result: `${fracTex(f, 1)} = ${tone(dec.tex, 2)} = ${tone(`${pct.tex}\\%`, 3)}`,
      steps,
      note: f[1] === 1 ? ""
        : only25
          ? `O decimal termina porque o denominador ${fmt(f[1])} não tem nenhum fator primo além de 2 e 5, os fatores de 10.`
          : `O decimal não termina porque o denominador ${fmt(f[1])} tem um fator diferente de 2 e de 5. Por isso ${fracText(f)} é exato e ${dec.txt} é só uma aproximação.`,
    };
  }

  /* ---------------------------------------------------------------- regras */

  const RULES = {
    equivalente({ a, b, k }) {
      return {
        lhs: [`${fracTex([a, b])} ${dv(a / b)}`, a / b],
        rhs: [`\\dfrac{${a} \\cdot ${k}}{${b} \\cdot ${k}} = ${fracTex([a * k, b * k])} ${dv(a / b)}`, a * k / (b * k)],
        note: `Multiplicar em cima e embaixo por ${k} corta cada pedaço em ${k}: há ${k} vezes mais pedaços, cada um ${k} vezes menor. A quantidade não muda.`,
      };
    },
    multiplicacao({ a, b, c, d }) {
      const p = [a * c, b * d];
      return {
        lhs: [`${fracTex([a, b])} \\cdot ${fracTex([c, d])} ${dv(a / b * (c / d))}`, a / b * (c / d)],
        rhs: [`\\dfrac{${a} \\cdot ${c}}{${b} \\cdot ${d}} = ${fracChain(p)} ${dv(p[0] / p[1])}`, p[0] / p[1]],
        note: `Leia “·” como “de”: ${a}/${b} · ${c}/${d} é ${a}/${b} de ${c}/${d}. Multiplicação não precisa de denominador comum.`,
      };
    },
    divisao({ a, b, c, d }) {
      const p = [a * d, b * c];
      return {
        lhs: [`${fracTex([a, b])} \\div ${fracTex([c, d])} ${dv(a / b / (c / d))}`, a / b / (c / d)],
        rhs: [`${fracTex([a, b])} \\cdot ${fracTex([d, c])} = ${fracChain(p)} ${dv(p[0] / p[1])}`, p[0] / p[1]],
        note: `Dividir por ${c}/${d} é perguntar quantas vezes ${c}/${d} cabe em ${a}/${b}. Multiplicar pelo inverso dá a mesma resposta.`,
      };
    },
    somaErrada({ a, b, c, d }) {
      const L = lcm(b, d), certo = reduce([a * (L / b) + c * (L / d), L]);
      return {
        lhs: [`${fracTex([a, b])} + ${fracTex([c, d])} = ${fracTex(certo)} ${dv(certo[0] / certo[1])}`, certo[0] / certo[1]],
        rhs: [`\\dfrac{${a} + ${c}}{${b} + ${d}} = ${fracChain([a + c, b + d])} ${dv((a + c) / (b + d))}`, (a + c) / (b + d)],
        note: `Somar os denominadores é somar o tamanho dos pedaços, o que não faz sentido. Prova rápida: 1/2 + 1/2 dá 1, mas a regra errada daria 2/4 = 1/2.`,
      };
    },
    cortarSoma({ a, b, k }) {
      return {
        lhs: [`\\dfrac{${a} + ${k}}{${b} + ${k}} = ${fracChain([a + k, b + k])} ${dv((a + k) / (b + k))}`, (a + k) / (b + k)],
        rhs: [`${fracChain([a, b])} ${dv(a / b)}`, a / b],
        note: a === b
          ? "Com a = b os dois lados dão 1 — coincidência. Mude um dos valores."
          : `Só se cancela o que está multiplicando o numerador inteiro e o denominador inteiro. Um ${k} somado não é fator: cortá-lo muda o valor.`,
      };
    },
  };

  Licao.renderTex();
  const intro = document.querySelector(".intro");
  if (intro) initIntro(intro);
  const sec = id => document.querySelector(`.calc[data-calc=${id}]`);
  if (sec("simplificar")) bindCalc(sec("simplificar"), ["sn", "sd"], simplificar);
  if (sec("somar")) bindCalc(sec("somar"), ["fa", "fb", "op", "fc", "fd"], somar);
  if (sec("converter")) bindCalc(sec("converter"), ["conv"], converter);
  Licao.regras(VARS, RULES);
})();
