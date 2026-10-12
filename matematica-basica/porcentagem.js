/* Porcentagem: o quadro de 100 do início, a calculadora com os seis
 * problemas de sempre (parte, aumento, desconto, quanto por cento, variação
 * e valor antes do aumento) e os cards de aumentos sucessivos. Os
 * utilitários vêm de licao.js.
 */
(() => {
  const { fmt, texNum, tone, math, el, svg, saveParams } = Licao;

  const pct = v => `${fmt(v, 2)}%`;
  const dec = (v, d = 4) => texNum(v, d);
  // = quando o número cabe nas casas mostradas; ≈ quando foi arredondado.
  const eq = (v, d = 4) => (Licao.isInt(v * 10 ** d) ? "=" : "\\approx");

  /* ---------------------------------------------------------------- quadro do início */

  function initQuadro(section) {
    const inP = section.querySelector("input[name=pp]");
    const inV = section.querySelector("input[name=vv]");
    const outP = section.querySelector(".out-pp");
    const outV = section.querySelector(".out-vv");
    const fig = section.querySelector(".pct-figure");
    const eq = section.querySelector(".pct-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("pp")) inP.value = q.get("pp");
    if (q.has("vv")) inV.value = q.get("vv");

    function draw() {
      const p = Number(inP.value), V = Number(inV.value);
      outP.textContent = `${p}%`;
      outV.textContent = fmt(V);
      const g = svg("svg", { viewBox: "0 0 200 200", class: "pct-svg", role: "img", "aria-label": `${p} de 100 quadradinhos pintados` });
      for (let i = 0; i < 100; i++) {
        const row = Math.floor(i / 10), col = i % 10;
        svg("rect", { x: col * 20 + 1, y: row * 20 + 1, width: 18, height: 18, rx: 3, class: `pct-cell${i < p ? " is-on" : ""}` }, g);
      }
      fig.replaceChildren(g);
      const r = V * p / 100;
      math(eq, `\\displaystyle ${tone(`${p}\\%`, 2)} \\text{ de } ${tone(texNum(V), 5)} = \\frac{${p}}{100} \\times ${texNum(V)} = ${dec(p / 100)} \\times ${texNum(V)} = ${tone(dec(r, 2), 1)}`);
      text.innerHTML = `<p><strong>Por cento</strong> quer dizer “a cada cem”: ${p}% são ${p} de cada 100 — ${p} quadradinhos pintados num quadro de 100. Como fração, ${p}/100; como decimal, ${fmt(p / 100, 2)}.</p>`
        + `<p>Para ${p}% de ${fmt(V)}, imagine o ${fmt(V)} repartido em 100 partes iguais de ${fmt(V / 100, 4)} e pegue ${p} delas: <strong>${fmt(r, 2)}</strong>.</p>`;
      saveParams({ pp: p, vv: V });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- calculadora */

  // Rótulos dos dois campos e a conta de cada modo.
  const MODOS = {
    parte: {
      labels: ["Porcentagem (%)", "do valor"],
      solve(p, V) {
        const r = V * p / 100;
        return {
          result: `${texNum(p)}\\% \\text{ de } ${texNum(V)} ${eq(r)} ${tone(dec(r), 1)}`,
          steps: [
            [`Porcentagem é fração de 100: ${pct(p)} = ${p}/100 = ${fmt(p / 100, 4)}.`, `${texNum(p)}\\% = \\frac{${texNum(p)}}{100} = ${dec(p / 100)}`],
            [`“De” é multiplicação: multiplique o valor por esse decimal.`, `${dec(p / 100)} \\times ${texNum(V)} ${eq(r)} ${tone(dec(r), 1)}`],
          ],
          note: p === 10 ? "Atalho: 10% é dividir por 10 — a vírgula anda uma casa para a esquerda." : p === 50 ? "Atalho: 50% é a metade." : p === 25 ? "Atalho: 25% é a quarta parte — a metade da metade." : "",
        };
      },
    },
    aumento: {
      labels: ["Valor", "Aumento (%)"],
      solve(V, p) {
        const f = 1 + p / 100, r = V * f;
        return {
          result: `${texNum(V)} + ${texNum(p)}\\% ${eq(r)} ${tone(dec(r), 1)}`,
          steps: [
            [`O valor novo é o valor todo (100%) mais o aumento (${pct(p)}): ${pct(100 + p)} do original.`, `100\\% + ${texNum(p)}\\% = ${texNum(100 + p)}\\% = ${dec(f)}`],
            [`Multiplique pelo <strong>fator de aumento</strong>, ${fmt(f, 4)}. Uma conta só, em vez de calcular o aumento e depois somar.`, `${texNum(V)} \\times ${dec(f)} ${eq(r)} ${tone(dec(r), 1)}`],
            [`Conferindo pelo caminho longo: o aumento é ${pct(p)} de ${fmt(V)} = ${fmt(V * p / 100, 4)}, e ${fmt(V)} + ${fmt(V * p / 100, 4)} = ${fmt(r, 4)}.`, null],
          ],
        };
      },
    },
    desconto: {
      labels: ["Valor", "Desconto (%)"],
      solve(V, p) {
        const f = 1 - p / 100, r = V * f;
        return {
          result: `${texNum(V)} - ${texNum(p)}\\% ${eq(r)} ${tone(dec(r), 1)}`,
          steps: [
            [`Com ${pct(p)} de desconto, paga-se o que sobra: ${pct(100 - p)} do valor.`, `100\\% - ${texNum(p)}\\% = ${texNum(100 - p)}\\% = ${dec(f)}`],
            [`Multiplique pelo <strong>fator de desconto</strong>, ${fmt(f, 4)}.`, `${texNum(V)} \\times ${dec(f)} ${eq(r)} ${tone(dec(r), 1)}`],
            [`O desconto em si foi de ${fmt(V * p / 100, 4)}.`, null],
          ],
        };
      },
    },
    quanto: {
      labels: ["Parte", "do total"],
      solve(A, B) {
        if (B === 0) return { err: "O total não pode ser zero." };
        const r = A / B * 100;
        return {
          result: `\\frac{${texNum(A)}}{${texNum(B)}} \\times 100 ${eq(r, 2)} ${tone(`${dec(r, 2)}\\%`, 1)}`,
          steps: [
            [`Que fração do total é a parte? Divida a parte pelo total.`, `\\frac{${texNum(A)}}{${texNum(B)}} ${eq(A / B)} ${dec(A / B)}`],
            [`Em porcentagem, multiplique por 100 (a vírgula anda duas casas).`, `${dec(A / B)} \\times 100 ${eq(r, 2)} ${tone(`${dec(r, 2)}\\%`, 1)}`],
          ],
          note: r > 100 ? "Passou de 100%: a “parte” é maior que o total. Faz sentido em comparações (as vendas deste ano são 120% das do ano passado), não em partes de um todo." : "",
        };
      },
    },
    variacao: {
      labels: ["Valor antigo", "Valor novo"],
      solve(A, B) {
        if (A === 0) return { err: "Variação percentual a partir de zero não existe: qualquer aumento seria infinito por cento." };
        const d = B - A, r = d / A * 100;
        return {
          result: `\\frac{${texNum(B)} - ${texNum(A)}}{${texNum(A)}} \\times 100 ${eq(r, 2)} ${tone(`${r > 0 ? "+" : ""}${dec(r, 2)}\\%`, 1)}`,
          steps: [
            [`Quanto mudou, em valor: novo menos antigo.`, `${texNum(B)} - ${texNum(A)} = ${texNum(d)}`],
            [`Compare a mudança com o valor <strong>antigo</strong> — a porcentagem é sempre de onde se partiu.`, `\\frac{${texNum(d)}}{${texNum(A)}} \\times 100 ${eq(r, 2)} ${tone(`${dec(r, 2)}\\%`, 1)}`],
            [r === 0 ? "Não houve mudança." : r > 0 ? `Positivo: um <strong>aumento</strong> de ${pct(r)}.` : `Negativo: uma <strong>queda</strong> de ${pct(-r)}.`, null],
          ],
          note: d ? `De volta, de ${fmt(B)} para ${fmt(A)}, a variação seria de ${pct(-d / B * 100)}: o mesmo valor, comparado com outra base, dá outra porcentagem.` : "",
        };
      },
    },
    antes: {
      labels: ["Valor depois do aumento", "Aumento (%)"],
      solve(V, p) {
        const f = 1 + p / 100, r = V / f;
        return {
          result: `\\frac{${texNum(V)}}{${dec(f)}} ${eq(r)} ${tone(dec(r), 1)}`,
          steps: [
            [`O valor de agora é o antigo multiplicado pelo fator ${fmt(f, 4)}.`, `\\text{antigo} \\times ${dec(f)} = ${texNum(V)}`],
            [`Para desfazer a multiplicação, divida pelo mesmo fator.`, `\\text{antigo} = \\frac{${texNum(V)}}{${dec(f)}} ${eq(r)} ${tone(dec(r), 1)}`],
            [`Tirar ${pct(p)} de ${fmt(V)} daria ${fmt(V * (1 - p / 100), 4)} — errado, porque os ${pct(p)} foram calculados sobre o valor antigo, não sobre o novo.`, null],
          ],
        };
      },
    },
  };

  function initCalc(section) {
    const modo = section.querySelector("select[name=modo]");
    const inX = section.querySelector("input[name=x]");
    const inY = section.querySelector("input[name=y]");
    const labX = section.querySelector(".lab-x");
    const labY = section.querySelector(".lab-y");
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("modo") && MODOS[q.get("modo")]) modo.value = q.get("modo");
    if (q.has("x")) inX.value = q.get("x");
    if (q.has("y")) inY.value = q.get("y");

    const num = s => (/^-?\d{1,9}(,\d{1,4})?$/.test(s.trim()) ? Number(s.trim().replace(",", ".")) : NaN);

    function update() {
      const m = MODOS[modo.value];
      [labX.textContent, labY.textContent] = m.labels;
      saveParams({ modo: modo.value, x: inX.value.trim(), y: inY.value.trim() });
      const x = num(inX.value), y = num(inY.value);
      inX.setAttribute("aria-invalid", String(Number.isNaN(x)));
      inY.setAttribute("aria-invalid", String(Number.isNaN(y)));
      steps.replaceChildren();
      let out = Number.isNaN(x) || Number.isNaN(y) ? { err: "Digite números com vírgula para os decimais (como 12,5), sem pontos de milhar." } : m.solve(x, y);
      if (!out.err && /antes|aumento/.test(modo.value) && y <= -100) out = { err: "Um aumento de −100% ou menos zeraria o valor." };
      section.classList.toggle("has-error", !!out.err);
      if (out.err) { result.textContent = ""; note.textContent = out.err; return; }
      math(result, out.result);
      out.steps.forEach(([t, src]) => {
        const li = el("li");
        const p = el("span");
        p.innerHTML = t;
        li.appendChild(p);
        if (src) { const mm = el("span", "calc-math"); math(mm, src); li.appendChild(mm); }
        steps.appendChild(li);
      });
      note.textContent = out.note || "";
    }

    section.addEventListener("input", update);
    modo.addEventListener("change", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      [modo.value, inX.value, inY.value] = btn.dataset.exemplo.split(";");
      update();
    }));
    update();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    a: { min: -50, max: 100, value: 10 },
    b: { min: -50, max: 100, value: 20 },
    p: { min: 1, max: 90, value: 20 },
  };

  const f = v => dec(1 + v / 100);
  const RULES = {
    sucessivos({ a, b }) {
      const l = 100 * (1 + a / 100) * (1 + b / 100), r = 100 * (1 + (a + b) / 100);
      return {
        lhs: [`100 \\times ${f(a)} \\times ${f(b)} = ${dec(l)}`, l],
        rhs: [`100 \\times ${f(a + b)} = ${dec(r)}`, r],
        note: a && b
          ? `A segunda variação de ${b}% incide sobre um valor que já ${a > 0 ? "subiu" : "caiu"}. O total é ${fmt(l - 100, 2)}%, não ${a + b}%: a diferença, ${fmt(a * b / 100, 2)} ponto${Math.abs(a * b / 100) === 1 ? "" : "s"}, é ${a}% de ${b}%.`
          : "Com uma das variações zero, coincide. Mova as duas.",
      };
    },
    vaiVolta({ p }) {
      const l = 100 * (1 + p / 100) * (1 - p / 100);
      return {
        lhs: [`100 \\times ${f(p)} \\times ${f(-p)} = ${dec(l)}`, l],
        rhs: [`100`, 100],
        note: `Subir ${p}% e depois cair ${p}% deixa ${fmt(l, 2)}: perdem-se ${fmt(100 - l, 2)}%, que é ${p}% de ${p}%. A queda é calculada sobre um valor maior, então tira mais do que o aumento pôs.`,
      };
    },
  };

  Licao.renderTex();
  const intro = document.querySelector("#quadro");
  if (intro) initQuadro(intro);
  const calc = document.querySelector("#calc");
  if (calc) initCalc(calc);
  Licao.regras(VARS, RULES);
})();
