/* Somatório: a leitura do Σ com limites e termo escolhidos, a tabela que
 * soma uma lista de dados coluna por coluna (Σx, Σx², (Σx)², desvios) e os
 * cards das propriedades. Os utilitários vêm de licao.js.
 */
(() => {
  const { fmt, texNum, tone, math, el, saveParams } = Licao;

  /* ---------------------------------------------------------------- lendo o Σ */

  const TERMOS = {
    i: { tex: "i", f: i => i, at: i => `${i}` },
    quad: { tex: "i^2", f: i => i * i, at: i => `${i}^2` },
    impar: { tex: "(2i - 1)", f: i => 2 * i - 1, at: i => `(2 \\cdot ${i} - 1)` },
    tres: { tex: "3", f: () => 3, at: () => "3" },
  };

  function initLer(section) {
    const inIni = section.querySelector("input[name=ini]");
    const inFim = section.querySelector("input[name=fim]");
    const outIni = section.querySelector(".out-ini");
    const outFim = section.querySelector(".out-fim");
    const btns = section.querySelectorAll("[data-termo]");
    const eq = section.querySelector(".sum-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("ini")) inIni.value = q.get("ini");
    if (q.has("fim")) inFim.value = q.get("fim");
    let termo = TERMOS[q.get("termo")] ? q.get("termo") : "i";

    function draw(moved) {
      // O fim nunca fica antes do início: quem não se mexeu acompanha.
      if (Number(inFim.value) < Number(inIni.value)) {
        if (moved === inFim) inIni.value = inFim.value;
        else inFim.value = inIni.value;
      }
      const a = Number(inIni.value), b = Number(inFim.value), T = TERMOS[termo];
      outIni.textContent = a;
      outFim.textContent = b;
      btns.forEach(btn => btn.setAttribute("aria-pressed", btn.dataset.termo === termo));
      const is = Array.from({ length: b - a + 1 }, (_, k) => a + k);
      const vals = is.map(T.f), total = vals.reduce((s, v) => s + v, 0);
      const sigma = `\\sum_{${tone("i", 2)} = ${tone(a, 5)}}^{${tone(b, 5)}} ${T.tex.replace(/i/g, tone("i", 2))}`;
      const termos = is.map(i => (termo === "i" ? tone(i, 2) : T.at(i)));
      math(eq, `\\displaystyle ${sigma} = ${termos.join(" + ")}${termo === "i" ? "" : ` = ${vals.join(" + ")}`} = ${tone(total, 1)}`);
      const n = is.length;
      text.innerHTML = `<p>Leia: “soma de ${T.tex === "3" ? "3" : `${T.tex.replace("^2", "²").replace(/[()]/g, "")}`}, para i de ${a} até ${b}”. O i é um <strong>contador</strong>: começa em ${a} (embaixo do Σ), sobe de 1 em 1 e para em ${b} (em cima). Para cada valor de i, calcula-se o termo; depois, soma-se tudo.</p>`
        + `<p>São ${b} − ${a} + 1 = <strong>${n} ${n === 1 ? "termo" : "termos"}</strong>.${termo === "tres"
          ? ` O termo não tem i, então vale 3 todas as vezes: a soma é ${n} × 3 = ${total}, e não 3.`
          : termo === "impar" && a === 1 ? ` Repare: a soma dos ${n} primeiros ímpares é ${n}² = ${total}.`
          : termo === "i" && a === 1 ? ` Atalho de Gauss: 1 + 2 + … + ${b} = ${b} × ${b + 1} ÷ 2 = ${total}.` : ""}</p>`;
      saveParams({ ini: a, fim: b, termo });
    }

    btns.forEach(btn => btn.addEventListener("click", () => { termo = btn.dataset.termo; draw(); }));
    section.addEventListener("input", e => draw(e.target));
    draw();
  }

  /* ---------------------------------------------------------------- tabela de dados */

  const SOMAS = {
    x: { col: "x", sigma: "\\sum x_i", tit: "a soma dos valores" },
    x2: { col: "x2", sigma: "\\sum x_i^2", tit: "a soma dos quadrados" },
    sx2: { col: "x", sigma: "\\left(\\sum x_i\\right)^2", tit: "o quadrado da soma" },
    dev: { col: "dev", sigma: "\\sum (x_i - \\bar{x})", tit: "a soma dos desvios" },
    dev2: { col: "dev2", sigma: "\\sum (x_i - \\bar{x})^2", tit: "a soma dos quadrados dos desvios" },
    xy: { col: "xy", sigma: "\\sum x_i y_i", tit: "a soma dos produtos" },
  };

  const parseList = s => {
    const parts = s.split(/[;\s]+|,(?=\s)|,$/).map(p => p.trim()).filter(Boolean);
    if (!parts.length) return null;
    const nums = parts.map(p => (/^-?\d{1,7}(,\d{1,4})?$/.test(p) ? Number(p.replace(",", ".")) : NaN));
    return nums.some(Number.isNaN) ? null : nums;
  };

  // Número em LaTeX, com negativo entre parênteses dentro de uma soma.
  const t = (v, d = 4) => texNum(v, d);
  const tp = (v, d = 4) => (v < 0 ? `(${t(v, d)})` : t(v, d));

  function initTabela(section) {
    const inX = section.querySelector("input[name=xs]");
    const inY = section.querySelector("input[name=ys]");
    const sel = section.querySelector("select[name=soma]");
    const result = section.querySelector(".calc-result");
    const table = section.querySelector(".sum-table");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const optXY = sel.querySelector("option[value=xy]");
    const q = new URLSearchParams(location.search);
    if (q.has("xs")) inX.value = q.get("xs");
    if (q.has("ys")) inY.value = q.get("ys");
    if (q.has("soma") && SOMAS[q.get("soma")]) sel.value = q.get("soma");

    function update() {
      saveParams({ xs: inX.value.trim(), ys: inY.value.trim(), soma: sel.value });
      const xs = parseList(inX.value);
      const ys = inY.value.trim() ? parseList(inY.value) : [];
      let err = "";
      if (!xs) err = "Digite os valores de x separados por espaço ou ponto e vírgula, com vírgula nos decimais (como 2; 4; 9 ou 1,5 2,5 3).";
      else if (xs.length < 2 || xs.length > 20) err = "Use de 2 a 20 valores.";
      else if (!ys) err = "Os valores de y estão num formato que não reconheci.";
      else if (ys.length && ys.length !== xs.length) err = `Há ${xs.length} valores de x e ${ys.length} de y: as duas listas precisam ter o mesmo tamanho.`;
      const hasY = !err && ys.length > 0;
      optXY.disabled = !hasY;
      if (!hasY && sel.value === "xy") sel.value = "x";
      inX.setAttribute("aria-invalid", String(!xs || xs.length < 2 || xs.length > 20));
      inY.setAttribute("aria-invalid", String(!ys || (!!xs && ys.length > 0 && ys.length !== xs.length)));
      section.classList.toggle("has-error", !!err);
      steps.replaceChildren();
      if (err) { result.textContent = ""; table.replaceChildren(); note.textContent = err; return; }

      const n = xs.length;
      const Sx = xs.reduce((s, v) => s + v, 0), m = Sx / n;
      const rows = xs.map((x, i) => ({ i: i + 1, x, x2: x * x, dev: x - m, dev2: (x - m) ** 2, y: ys[i], xy: hasY ? x * ys[i] : null }));
      const sum = k => rows.reduce((s, r) => s + r[k], 0);
      const S = { x: Sx, x2: sum("x2"), dev: sum("dev"), dev2: sum("dev2"), y: hasY ? sum("y") : null, xy: hasY ? sum("xy") : null };
      const S0 = SOMAS[sel.value];

      // A tabela: uma linha por valor e a linha do Σ no fim.
      const cols = [["i", "i"], ["x", "x_i"], ["x2", "x_i^2"], ["dev", "x_i - \\bar{x}"], ["dev2", "(x_i - \\bar{x})^2"]];
      if (hasY) cols.push(["y", "y_i"], ["xy", "x_i y_i"]);
      const thead = el("thead"), hr = el("tr");
      cols.forEach(([k, tex]) => {
        const th = el("th", k === S0.col ? "is-on" : null);
        math(th, tex);
        hr.appendChild(th);
      });
      thead.appendChild(hr);
      const tbody = el("tbody");
      rows.forEach(r => {
        const tr = el("tr");
        cols.forEach(([k]) => tr.appendChild(el("td", k === S0.col ? "is-on" : null, k === "i" ? String(r.i) : fmt(r[k], 4))));
        tbody.appendChild(tr);
      });
      const tfoot = el("tfoot"), fr = el("tr");
      cols.forEach(([k]) => {
        const td = el("td", k === S0.col ? "is-on" : null);
        if (k === "i") math(td, "\\Sigma");
        else td.textContent = fmt(S[k], 4);
        fr.appendChild(td);
      });
      tfoot.appendChild(fr);
      table.replaceChildren(thead, tbody, tfoot);

      // O resultado, com a soma aberta.
      const col = S0.col, parcelas = rows.map(r => tp(r[col]));
      const aberta = n <= 10 ? parcelas.join(" + ") : `${parcelas.slice(0, 3).join(" + ")} + \\cdots + ${parcelas.slice(-2).join(" + ")}`;
      if (sel.value === "sx2") math(result, `${S0.sigma} = (${aberta})^2 = ${t(Sx)}^2 = ${tone(t(Sx * Sx), 1)}`);
      else math(result, `${S0.sigma} = ${aberta} = ${tone(t(S[col]), 1)}`);

      const add = (html, src) => {
        const li = el("li");
        const p = el("span");
        p.innerHTML = html;
        li.appendChild(p);
        if (src) { const mm = el("span", "calc-math"); math(mm, src); li.appendChild(mm); }
        steps.appendChild(li);
      };
      add(`<strong>Média.</strong> A soma dos valores dividida pela quantidade, n = ${n}.`, `\\bar{x} = \\frac{\\sum x_i}{n} = \\frac{${t(Sx)}}{${n}} ${Licao.sgn(m * 1e4)} ${t(m)}`);
      add(`<strong>Desvios.</strong> Cada valor menos a média. A soma deles é sempre zero: o que falta abaixo da média sobra acima.`, `\\sum (x_i - \\bar{x}) = ${t(Math.abs(S.dev) < 1e-9 ? 0 : S.dev)}`);
      add(`<strong>Variância.</strong> A soma dos quadrados dos desvios, dividida por n − 1. Elevar ao quadrado tira o sinal, e os desvios param de se anular.`, `s^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n - 1} = \\frac{${t(S.dev2)}}{${n - 1}} ${Licao.sgn(S.dev2 / (n - 1) * 1e4)} ${t(S.dev2 / (n - 1))}`);
      add(`<strong>O mesmo, pelo atalho.</strong> A soma dos quadrados dos desvios também sai de Σx² e Σx, sem calcular desvio nenhum — e é aqui que Σx² e (Σx)² aparecem juntos e não podem ser trocados.`,
        `\\sum (x_i - \\bar{x})^2 = \\sum x_i^2 - \\frac{\\left(\\sum x_i\\right)^2}{n} = ${t(S.x2)} - \\frac{${t(Sx * Sx)}}{${n}} ${Licao.sgn(S.dev2 * 1e4)} ${t(S.dev2)}`);
      if (hasY) {
        const cov = (S.xy - Sx * S.y / n) / (n - 1);
        add(`<strong>Com y.</strong> A soma dos produtos, Σxy, é a peça da <a href="/formulas/covariancia.html">covariância</a> e da <a href="/formulas/regressao-linear.html">regressão</a>. E ela não é Σx · Σy.`,
          `\\sum x_i y_i = ${t(S.xy)} \\qquad \\sum x_i \\cdot \\sum y_i = ${t(Sx)} \\cdot ${t(S.y)} = ${t(Sx * S.y)} \\qquad s_{xy} = \\frac{\\sum x_i y_i - \\frac{\\sum x_i \\sum y_i}{n}}{n - 1} ${Licao.sgn(cov * 1e4)} ${t(cov)}`);
      }
      note.textContent = sel.value === "sx2" || sel.value === "x2"
        ? `Compare: Σx² = ${fmt(S.x2, 4)}, mas (Σx)² = ${fmt(Sx * Sx, 4)}. Na primeira, eleva-se cada valor e depois soma-se; na segunda, soma-se tudo e eleva-se uma vez só.`
        : `Escolhida: ${S0.tit}, coluna destacada na tabela.`;
    }

    section.addEventListener("input", update);
    sel.addEventListener("change", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      [inX.value, inY.value = ""] = btn.dataset.exemplo.split("|");
      update();
    }));
    update();
  }

  /* ---------------------------------------------------------------- propriedades */

  // Nos cards, x_i = i e y_i = i², de i = 1 até n.
  const VARS = {
    n: { min: 1, max: 6, value: 4 },
    c: { min: -5, max: 5, value: 3 },
  };
  const ii = n => Array.from({ length: n }, (_, k) => k + 1);
  const soma = arr => arr.reduce((s, v) => s + v, 0);
  const pp = v => (v < 0 ? `(${t(v)})` : t(v));

  const RULES = {
    constante({ n, c }) {
      const is = ii(n);
      return {
        lhs: [`\\sum_{i=1}^{${n}} ${pp(c)} \\cdot i = ${is.map(i => `${pp(c)} \\cdot ${i}`).join(" + ")} = ${t(c * soma(is))}`, c * soma(is)],
        rhs: [`${pp(c)} \\cdot \\sum_{i=1}^{${n}} i = ${pp(c)} \\cdot (${is.join(" + ")}) = ${t(c * soma(is))}`, c * soma(is)],
        note: "A constante aparece em todas as parcelas, então pode ser posta em evidência.",
      };
    },
    somaDeSomas({ n }) {
      const is = ii(n), l = soma(is.map(i => i + i * i));
      return {
        lhs: [`\\sum_{i=1}^{${n}} (i + i^2) = ${is.map(i => `${i + i * i}`).join(" + ")} = ${l}`, l],
        rhs: [`\\sum_{i=1}^{${n}} i + \\sum_{i=1}^{${n}} i^2 = ${soma(is)} + ${soma(is.map(i => i * i))} = ${soma(is) + soma(is.map(i => i * i))}`, soma(is) + soma(is.map(i => i * i))],
        note: "Uma soma grande pode ser separada em somas menores, termo a termo — a ordem das parcelas não importa.",
      };
    },
    soConstante({ n, c }) {
      return {
        lhs: [`\\sum_{i=1}^{${n}} ${pp(c)} = ${Array(n).fill(pp(c)).join(" + ")} = ${t(n * c)}`, n * c],
        rhs: [`n \\cdot c = ${n} \\cdot ${pp(c)} = ${t(n * c)}`, n * c],
        note: `Somar o ${fmt(c)} ${n} vezes dá ${fmt(n * c)}, e não ${fmt(c)}. É por isso que Σ(x̄) = n·x̄ nas contas de variância.`,
      };
    },
    quadrado({ n }) {
      const is = ii(n), l = soma(is.map(i => i * i)), r = soma(is) ** 2;
      return {
        lhs: [`\\sum_{i=1}^{${n}} i^2 = ${is.map(i => `${i * i}`).join(" + ")} = ${l}`, l],
        rhs: [`\\left(\\sum_{i=1}^{${n}} i\\right)^2 = (${is.join(" + ")})^2 = ${soma(is)}^2 = ${r}`, r],
        note: n === 1 ? "Com um termo só, coincide. Aumente n." : "O quadrado da soma tem também os produtos cruzados (2·1·2, 2·1·3…), que a soma dos quadrados não tem.",
      };
    },
    produto({ n }) {
      const is = ii(n), l = soma(is.map(i => i * i * i)), r = soma(is) * soma(is.map(i => i * i));
      return {
        lhs: [`\\sum_{i=1}^{${n}} i \\cdot i^2 = ${is.map(i => `${i ** 3}`).join(" + ")} = ${l}`, l],
        rhs: [`\\sum_{i=1}^{${n}} i \\cdot \\sum_{i=1}^{${n}} i^2 = ${soma(is)} \\cdot ${soma(is.map(i => i * i))} = ${r}`, r],
        note: n === 1 ? "Com um termo só, coincide. Aumente n." : "A soma de produtos multiplica par a par; o produto das somas multiplica todo mundo com todo mundo.",
      };
    },
  };

  Licao.renderTex();
  const ler = document.querySelector("#ler");
  if (ler) initLer(ler);
  const tab = document.querySelector("#tabela");
  if (tab) initTabela(tab);
  Licao.regras(VARS, RULES);
})();
