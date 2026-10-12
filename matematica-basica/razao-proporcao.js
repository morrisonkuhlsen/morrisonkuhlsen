/* Razão e proporção: os copos de suco do início (a mesma razão em
 * quantidades diferentes), a calculadora de proporção direta ou inversa
 * e os cards de regra. Os utilitários vêm de licao.js.
 */
(() => {
  const { fmt, texNum, tone, math, el, svg, saveParams } = Licao;
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

  /* ---------------------------------------------------------------- copos */

  function initCopos(section) {
    const ins = {}, outs = {};
    ["sa", "sb", "sk"].forEach(k => {
      ins[k] = section.querySelector(`input[name=${k}]`);
      outs[k] = section.querySelector(`.out-${k}`);
    });
    const fig = section.querySelector(".copos-fig");
    const eq = section.querySelector(".copos-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    Object.entries(ins).forEach(([k, i]) => { if (q.has(k)) i.value = q.get(k); });

    function draw() {
      const a = Number(ins.sa.value), b = Number(ins.sb.value), k = Number(ins.sk.value);
      Object.entries(outs).forEach(([key, o]) => { o.textContent = ins[key].value; });
      const n = a + b, U = 16, GW = 54, G = 18;
      const W = k * GW + (k - 1) * G, H = 10 * U + 8;
      const g = svg("svg", { viewBox: `-2 -2 ${W + 4} ${H + 4}`, class: "copos-svg", role: "img",
        "aria-label": `${k} ${k === 1 ? "copo" : "copos"}, cada um com ${a} partes de suco e ${b} de água` });
      for (let c = 0; c < k; c++) {
        const x0 = c * (GW + G);
        // De baixo para cima: a partes de suco, b de água.
        for (let i = 0; i < n; i++) {
          const h = (10 * U) / n;
          svg("rect", { x: x0 + 3, y: H - 4 - (i + 1) * h, width: GW - 6, height: h - 1, class: i < a ? "copo-suco" : "copo-agua" }, g);
        }
        svg("path", { d: `M${x0},0 L${x0 + 2},${H} L${x0 + GW - 2},${H} L${x0 + GW},0`, class: "copo" }, g);
      }
      fig.replaceChildren(g);
      const m = gcd(a, b);
      math(eq, `\\displaystyle \\frac{${tone(a, 2)}}{${tone(b, 5)}}${m > 1 ? ` = \\frac{${a / m}}{${b / m}}` : ""} = \\frac{${tone(k * a, 2)}}{${tone(k * b, 5)}}${Licao.isInt(a / b * 1e4) ? ` = ${texNum(a / b)}` : ` \\approx ${texNum(a / b, 3)}`}`);
      text.innerHTML = `<p>A <strong>razão</strong> entre suco e água é ${a} para ${b} — escreve-se ${a} : ${b} ou ${a}/${b}. ${m > 1 ? `Como fração, simplifica: ${a}/${b} = ${a / m}/${b / m}, e o gosto é o mesmo de ${a / m} parte de suco para ${b / m} de água. ` : ""}Ela diz quanto há de um <strong>para cada</strong> unidade do outro: ${fmt(a / b, 3)} de suco por parte de água.</p>`
        + `<p>${k === 1 ? "Aumente o número de copos:" : `Com ${k} copos, são ${k * a} partes de suco e ${k * b} de água —`} as quantidades mudam, a razão não. ${a}/${b} = ${k * a}/${k * b} é uma <strong>proporção</strong>: uma igualdade entre duas razões.${k > 1 ? ` E, de todo o líquido, o suco é sempre ${a}/${n} = ${fmt(a / n * 100, 1)}%.` : ""}</p>`;
      saveParams({ sa: a, sb: b, sk: k });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- regra de três */

  function initCalc(section) {
    const ins = ["pa", "pb", "pc"].map(n => section.querySelector(`input[name=${n}]`));
    const tipo = section.querySelector("select[name=tipo]");
    const result = section.querySelector(".calc-result");
    const tabela = section.querySelector(".prop-table");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    ins.forEach(i => { if (q.has(i.name)) i.value = q.get(i.name); });
    if (q.has("tipo") && ["direta", "inversa"].includes(q.get("tipo"))) tipo.value = q.get("tipo");
    const num = s => (/^\d{1,9}(,\d{1,4})?$/.test(s.trim()) ? Number(s.trim().replace(",", ".")) : NaN);
    const t = v => texNum(v, 4);
    const eqs = v => (Licao.isInt(v * 1e4) ? "=" : "\\approx");

    function update() {
      saveParams({ ...Object.fromEntries(ins.map(i => [i.name, i.value.trim()])), tipo: tipo.value });
      const [a, b, c] = ins.map(i => num(i.value));
      ins.forEach((i, k) => i.setAttribute("aria-invalid", String(Number.isNaN([a, b, c][k]) || [a, b, c][k] === 0)));
      steps.replaceChildren();
      const bad = [a, b, c].some(v => Number.isNaN(v) || v === 0);
      section.classList.toggle("has-error", bad);
      if (bad) { result.textContent = ""; tabela.replaceChildren(); note.textContent = "Digite três números positivos, com vírgula nos decimais."; return; }
      const direta = tipo.value === "direta";
      const x = direta ? b * c / a : a * b / c;

      // A tabela: as duas grandezas em colunas, com as setas no mesmo sentido ou não.
      const thead = el("thead"), hr = el("tr");
      ["", "Grandeza 1", "Grandeza 2"].forEach(h => hr.appendChild(el("th", null, h)));
      thead.appendChild(hr);
      const tb = el("tbody");
      [["Situação conhecida", fmt(a), fmt(b)], ["Situação nova", fmt(c), "x"]].forEach(r => {
        const tr = el("tr");
        r.forEach((v, i) => tr.appendChild(el("td", i === 2 && v === "x" ? "is-x" : null, v)));
        tb.appendChild(tr);
      });
      const tf = el("tfoot"), fr = el("tr");
      fr.append(el("td", null, "Sentido"), el("td", null, c > a ? "↑ aumenta" : c < a ? "↓ diminui" : "= igual"),
        el("td", null, (direta ? c > a : c < a) ? "↑ aumenta" : (direta ? c < a : c > a) ? "↓ diminui" : "= igual"));
      tf.appendChild(fr);
      tabela.replaceChildren(thead, tb, tf);

      const add = (html, src) => {
        const li = el("li");
        const p = el("span");
        p.innerHTML = html;
        li.appendChild(p);
        if (src) { const mm = el("span", "calc-math"); math(mm, src); li.appendChild(mm); }
        steps.appendChild(li);
      };
      if (direta) {
        add(`<strong>Diretamente proporcionais:</strong> quando uma dobra, a outra dobra. A razão entre elas é a mesma nas duas situações.`, `\\frac{${t(a)}}{${t(b)}} = \\frac{${t(c)}}{x}`);
        add(`Multiplique cruzado: o produto dos extremos é igual ao produto dos meios.`, `${t(a)} \\cdot x = ${t(b)} \\cdot ${t(c)} = ${t(b * c)}`);
        add(`Divida pelo número que acompanha o x.`, `x = \\frac{${t(b * c)}}{${t(a)}} ${eqs(x)} ${tone(t(x), 1)}`);
      } else {
        add(`<strong>Inversamente proporcionais:</strong> quando uma dobra, a outra cai pela metade. O que fica igual é o <strong>produto</strong>.`, `${t(a)} \\cdot ${t(b)} = ${t(c)} \\cdot x`);
        add(`Calcule o produto conhecido.`, `${t(c)} \\cdot x = ${t(a * b)}`);
        add(`Divida pelo número que acompanha o x.`, `x = \\frac{${t(a * b)}}{${t(c)}} ${eqs(x)} ${tone(t(x), 1)}`);
      }
      add(`<strong>Confira o sentido.</strong> A grandeza 1 ${c > a ? "aumentou" : c < a ? "diminuiu" : "ficou igual"} (${fmt(a)} → ${fmt(c)}); numa proporção ${direta ? "direta, a 2 vai junto" : "inversa, a 2 vai ao contrário"}: ${fmt(b)} → ${fmt(x, 4)}. ${direta ? `A razão ${fmt(b / a, 4)} se manteve.` : `O produto ${fmt(a * b, 4)} se manteve.`}`, null);
      math(result, `x ${eqs(x)} ${tone(t(x), 1)}`);
      note.innerHTML = `Errou o tipo? Com proporção ${direta ? "inversa" : "direta"}, daria ${fmt(direta ? a * b / c : b * c / a, 4)}. A pergunta a fazer é sempre: se uma grandeza dobrar, a outra dobra ou cai pela metade? Mais sobre a <a href="/formulas/regra-de-tres.html">regra de três</a>.`;
    }

    section.addEventListener("input", update);
    tipo.addEventListener("change", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      const v = btn.dataset.exemplo.split(";");
      ins.forEach((i, k) => { i.value = v[k]; });
      tipo.value = v[3];
      update();
    }));
    update();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    a: { min: 1, max: 9, value: 2 },
    b: { min: 1, max: 9, value: 3 },
    k: { min: 2, max: 6, value: 4 },
  };
  const RULES = {
    equivalente({ a, b, k }) {
      return {
        lhs: [`\\frac{${a}}{${b}} ${Licao.sgn(a / b * 1e4)} ${texNum(a / b)}`, a / b],
        rhs: [`\\frac{${k} \\cdot ${a}}{${k} \\cdot ${b}} = \\frac{${k * a}}{${k * b}} ${Licao.sgn(a / b * 1e4)} ${texNum(a / b)}`, (k * a) / (k * b)],
        note: "Multiplicar os dois termos pelo mesmo número dá uma razão equivalente — é o mesmo que ampliar a receita.",
      };
    },
    cruzado({ a, b, k }) {
      return {
        lhs: [`${a} \\cdot ${k * b} = ${a * k * b}`, a * k * b],
        rhs: [`${b} \\cdot ${k * a} = ${b * k * a}`, b * k * a],
        note: `Em ${a}/${b} = ${k * a}/${k * b}, o produto dos extremos (${a} e ${k * b}) é igual ao dos meios (${b} e ${k * a}). É isso que a “multiplicação cruzada” usa.`,
      };
    },
    somar({ a, b, k }) {
      return {
        lhs: [`\\frac{${a}}{${b}} ${Licao.sgn(a / b * 1e4)} ${texNum(a / b)}`, a / b],
        rhs: [`\\frac{${a} + ${k}}{${b} + ${k}} = \\frac{${a + k}}{${b + k}} ${Licao.sgn((a + k) / (b + k) * 1e4)} ${texNum((a + k) / (b + k))}`, (a + k) / (b + k)],
        note: a === b ? "Com a = b, coincide (as duas razões dão 1). Mude os valores." : `Somar ${k} aos dois termos muda a razão: na receita, pôr ${k} de suco e ${k} de água a mais muda o gosto.`,
      };
    },
  };

  Licao.renderTex();
  const copos = document.querySelector("#copos");
  if (copos) initCopos(copos);
  const calc = document.querySelector("#calc");
  if (calc) initCalc(calc);
  Licao.regras(VARS, RULES);
})();
