/* Fórmulas interativas e o índice delas.
 *
 * Cada termo é um <span class="part" data-part="…" data-tex="…">. O texto dos
 * balões vem do <dl> da própria página (o <dt data-part> de mesmo nome), que é
 * a única fonte: editar a definição ali muda o balão também.
 */
(() => {
  const EDGE = 12;     // folga mínima entre o balão e a borda da tela
  const GAP = 14;      // distância entre o termo e o balão
  const TIP_GAP = 10;  // espaço entre balões vizinhos em "mostrar todos"
  const MIN_FIT = 0.6; // menor escala da fonte antes de a faixa passar a rolar

  function tex(el, display) {
    const src = el.dataset.tex;
    if (!window.katex) { el.textContent = src; return; }
    katex.render((display ? "\\displaystyle " : "") + src, el, { throwOnError: false });
  }

  /* ---------------------------------------------------------------- índice */

  function initIndex() {
    document.querySelectorAll(".card-tex[data-tex]").forEach(el => tex(el, true));

    const input = document.getElementById("filtro");
    const cards = Array.from(document.querySelectorAll(".formula-card"));
    const groups = Array.from(document.querySelectorAll(".formula-group"));
    const empty = document.querySelector(".filter-empty");
    const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const haystack = new Map(cards.map(c => [
      c, fold(c.querySelector(".card-name").textContent + " " + c.querySelector(".card-blurb").textContent
        + " " + c.closest(".formula-group").querySelector("h2").textContent)
    ]));

    input.addEventListener("input", () => {
      const terms = fold(input.value).split(/\s+/).filter(Boolean);
      cards.forEach(c => {
        c.parentElement.hidden = !terms.every(t => haystack.get(c).includes(t));
      });
      let any = false;
      groups.forEach(g => {
        const visible = g.querySelector("li:not([hidden])");
        g.hidden = !visible;
        any = any || !!visible;
      });
      empty.hidden = any;
    });
  }

  /* ---------------------------------------------------------------- fórmula */

  function initFormula() {
    const wrap = document.querySelector(".formula-wrap");
    const scroller = document.querySelector(".formula-scroll");
    const toggle = document.querySelector(".toggle-all");
    const parts = Array.from(wrap.querySelectorAll(".part"));
    const tips = new Map();
    let selected = null; // um .part, "all" ou null

    parts.forEach(el => tex(el, true));

    // Balões montados a partir do <dl>.
    parts.forEach((el, i) => {
      const key = el.dataset.part;
      const dt = document.querySelector(`dt[data-part="${key}"]`);
      const dd = dt && dt.nextElementSibling;
      const tip = document.createElement("div");
      tip.className = "explain-modal";
      tip.id = `tip-${key}`;
      tip.setAttribute("role", "tooltip");
      tip.dataset.tone = el.dataset.tone;
      tip.innerHTML = `<div class="modal-title"></div><div class="modal-text"></div>`;
      tip.firstChild.innerHTML = dt ? dt.innerHTML : key;
      tip.lastChild.innerHTML = dd ? dd.innerHTML : "";
      document.body.appendChild(tip);
      tips.set(el, tip);

      el.classList.toggle("is-below", !!el.closest(".den"));
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", dt ? dt.textContent : key);
      el.setAttribute("aria-expanded", "false");
      el.setAttribute("aria-controls", tip.id);

      el.addEventListener("click", e => { e.stopPropagation(); select(el); });
      el.addEventListener("keydown", e => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(el); }
        else if (step) { e.preventDefault(); parts[(i + step + parts.length) % parts.length].focus(); }
      });
    });

    function measure(tip, maxWidth) {
      tip.style.maxWidth = maxWidth ? `${maxWidth}px` : "";
      return { w: tip.offsetWidth, h: tip.offsetHeight };
    }

    // Termos do numerador e da linha principal abrem o balão acima; os do
    // denominador, abaixo. Se não couber, troca de lado.
    function topFor(el, h) {
      const r = el.getBoundingClientRect();
      const above = r.top - h - GAP;
      const below = r.bottom + GAP;
      let top = el.classList.contains("is-below")
        ? (below + h > innerHeight - EDGE ? above : below)
        : (above < EDGE ? below : above);
      return Math.max(EDGE, Math.min(top, innerHeight - h - EDGE));
    }

    function place(tip, left, top) {
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      tip.classList.add("show");
    }

    function clear() {
      parts.forEach(p => { p.classList.remove("selected"); p.setAttribute("aria-expanded", "false"); });
      tips.forEach(t => t.classList.remove("show"));
      toggle.setAttribute("aria-pressed", "false");
      selected = null;
    }

    function mark(el) {
      el.classList.add("selected");
      el.setAttribute("aria-expanded", "true");
    }

    function select(el) {
      const again = selected === el;
      clear();
      if (again) return;
      selected = el;
      mark(el);
      const tip = tips.get(el);
      const { w, h } = measure(tip);
      const r = el.getBoundingClientRect();
      const left = Math.max(EDGE, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - EDGE));
      place(tip, left, topFor(el, h));
    }

    // Agrupa os termos por linha visual e espalha os balões de cada linha lado
    // a lado, estreitando-os quando não cabem na largura da tela.
    function showAll() {
      const again = selected === "all";
      clear();
      if (again) return;
      selected = "all";
      toggle.setAttribute("aria-pressed", "true");

      const rows = [];
      parts.forEach(p => {
        const top = p.getBoundingClientRect().top;
        const row = rows.find(r => Math.abs(r.top - top) < 20);
        row ? row.items.push(p) : rows.push({ top, items: [p] });
      });

      rows.forEach(({ items }) => {
        const room = innerWidth - 2 * EDGE - (items.length - 1) * TIP_GAP;
        const cap = Math.max(120, Math.min(280, room / items.length));
        const sizes = items.map(p => measure(tips.get(p), cap));
        const total = sizes.reduce((s, x) => s + x.w, 0) + (items.length - 1) * TIP_GAP;
        const first = items[0].getBoundingClientRect();
        const last = items[items.length - 1].getBoundingClientRect();
        let left = (first.left + last.right) / 2 - total / 2;
        left = Math.max(EDGE, Math.min(left, innerWidth - total - EDGE));
        items.forEach((p, i) => {
          mark(p);
          place(tips.get(p), left, topFor(p, sizes[i].h));
          left += sizes[i].w + TIP_GAP;
        });
      });
    }

    // Diminui a fonte até a fórmula caber na largura disponível.
    function fit() {
      wrap.style.setProperty("--fit", 1);
      const ratio = scroller.clientWidth / wrap.scrollWidth;
      if (ratio < 1) wrap.style.setProperty("--fit", Math.max(MIN_FIT, ratio * 0.98).toFixed(3));
    }

    toggle.addEventListener("click", e => { e.stopPropagation(); showAll(); });
    document.addEventListener("click", e => { if (!e.target.closest(".explain-modal")) clear(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") clear(); });
    // Os balões são fixos na tela; se a página rolar, eles perderiam o termo.
    addEventListener("scroll", clear, { passive: true });
    scroller.addEventListener("scroll", clear, { passive: true });

    let t;
    addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => { clear(); fit(); }, 120);
    });

    fit();
    // As fontes do KaTeX chegam depois; refaz a medida quando estiverem prontas.
    if (document.fonts) document.fonts.ready.then(fit);
  }

  /* ---------------------------------------------------------------- calculadora
   *
   * <section class="calc" data-calc="nome"> com um <input name> por variável.
   * Cada entrada de CALCS recebe os valores já convertidos e devolve o
   * resultado, os passos (texto + LaTeX) e uma nota final, ou um erro.
   * No LaTeX, tone(tex, n) pinta o trecho com a cor do termo n da fórmula.
   */

  const nf = d => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: d });
  const fmt = (n, d = 4) => nf(d).format(n === 0 ? 0 : n); // evita "-0"
  const texNum = (n, d = 4) => fmt(n, d).replace(/\./g, "{.}").replace(",", "{,}");
  const tone = (t, n) => `\\htmlData{tone=${n}}{${t}}`;
  // Negativo dentro de uma subtração ou fração vai entre parênteses.
  const paren = (n, t) => (n < 0 ? `\\left(${t}\\right)` : t);
  const approx = (n, d = 4) => (Math.abs(n - Number(n.toFixed(d))) > 1e-12 ? "\\approx" : "=");

  // Função de distribuição da normal padrão, por Abramowitz–Stegun 7.1.26
  // (erro < 1,5·10⁻⁷, mais do que basta para um percentil com uma casa).
  function phi(z) {
    const x = Math.abs(z) / Math.SQRT2;
    const t = 1 / (1 + 0.3275911 * x);
    const erf = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741
      + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
    return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
  }

  // ln Γ(x) pela aproximação de Lanczos (g = 7, 9 termos).
  function lgamma(x) {
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61503916999185, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
      1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    let a = c[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }

  // Beta incompleta regularizada I_x(a, b), por fração contínua (Numerical Recipes).
  function betainc(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    if (x > (a + 1) / (a + b + 2)) return 1 - betainc(1 - x, b, a);
    const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lgamma(a) - lgamma(b) + lgamma(a + b)) / a;
    let f = 1, c = 1, d = 0;
    for (let i = 0; i <= 200; i++) {
      const m = i >> 1;
      const num = i === 0 ? 1 : i % 2
        ? -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1))
        : (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
      d = 1 + num * d;
      d = Math.abs(d) < 1e-30 ? 1e-30 : d;
      d = 1 / d;
      c = 1 + num / c;
      c = Math.abs(c) < 1e-30 ? 1e-30 : c;
      const cd = c * d;
      f *= cd;
      if (Math.abs(1 - cd) < 1e-12) break;
    }
    return front * (f - 1);
  }

  // Valor-p bilateral da t de Student com df graus de liberdade.
  const tTwoTail = (t, df) => betainc(df / (df + t * t), df / 2, 0.5);

  // Inversa da normal padrão, pelo algoritmo de Acklam (erro relativo < 1,2·10⁻⁹).
  function probit(p) {
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269,
      -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972,
      -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734,
      4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const lo = 0.02425;
    const tail = q => (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5])
      / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    if (p < lo) return tail(Math.sqrt(-2 * Math.log(p)));
    if (p > 1 - lo) return -tail(Math.sqrt(-2 * Math.log(1 - p)));
    const q = p - 0.5, r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q
      / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  // Gama incompleta superior regularizada Q(a, x): série para x < a + 1,
  // fração contínua acima disso (Numerical Recipes, gammq).
  function gammaQ(a, x) {
    if (x <= 0) return 1;
    const lnPre = a * Math.log(x) - x - lgamma(a);
    if (x < a + 1) {
      let sum = 1 / a, term = sum;
      for (let n = 1; n < 500; n++) {
        term *= x / (a + n);
        sum += term;
        if (Math.abs(term) < Math.abs(sum) * 1e-14) break;
      }
      return 1 - sum * Math.exp(lnPre);
    }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 500; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      d = Math.abs(d) < 1e-300 ? 1e-300 : d;
      c = b + an / c;
      c = Math.abs(c) < 1e-300 ? 1e-300 : c;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-14) break;
    }
    return Math.exp(lnPre) * h;
  }

  // Valor-p da qui-quadrado: P(χ² ≥ x) com df graus de liberdade.
  const chiSurvival = (x, df) => gammaQ(df / 2, x / 2);

  // Valor crítico z para a confiança em %, arredondado para duas casas como na
  // tabela Z e usado assim nas contas seguintes: quem refizer à mão chega nos
  // mesmos números.
  const zCrit = conf => Number(probit(1 - (1 - conf / 100) / 2).toFixed(2));

  // Tamanho de amostra sempre arredonda para cima; a folga absorve o ruído do
  // ponto flutuante (400,0000000001 não pode virar 401).
  const ceilInt = x => Math.ceil(x - 1e-9);

  // Reparte um total inteiro proporcionalmente aos pesos pelo método dos
  // maiores restos: arredonda tudo para baixo e dá as unidades que sobram a
  // quem tem a maior parte fracionária. Assim as partes somam o total.
  function apportion(total, weights) {
    const sum = weights.reduce((s, w) => s + w, 0);
    const exact = weights.map(w => total * w / sum);
    const out = exact.map(x => Math.floor(x + 1e-9));
    let left = total - out.reduce((s, x) => s + x, 0);
    exact.map((x, i) => [x - out[i], i]).sort((a, b) => b[0] - a[0])
      .forEach(([, i]) => { if (left > 0) { out[i]++; left--; } });
    return { exact, out };
  }

  // Base comum a covariância, Pearson e regressão: valida os pares, calcula
  // médias, desvios e somas, e monta os passos que as três compartilham.
  // `mean` é o símbolo da média: μ nas fórmulas populacionais, x̄ na regressão.
  const MAX_TABLE = 15;
  function paired(x, y, mean) {
    if (x.length !== y.length) return { error: `Há ${x.length} valores de x e ${y.length} de y; as listas precisam ter o mesmo tamanho.` };
    const n = x.length;
    if (n < 2) return { error: "Informe pelo menos dois pares de valores." };
    if (n > 200) return { error: "Use no máximo 200 pares." };
    const sum = a => a.reduce((s, v) => s + v, 0);
    const mx = sum(x) / n, my = sum(y) / n;
    const dx = x.map(v => v - mx), dy = y.map(v => v - my);
    const prod = dx.map((v, i) => v * dy[i]);
    const r = {
      n, mx, my, dx, dy, prod,
      sxy: sum(prod), sxx: sum(dx.map(v => v * v)), syy: sum(dy.map(v => v * v)),
      mxTex: mean("x"), myTex: mean("y"),
    };
    const meanOf = (a, m) => n <= 6
      ? `\\dfrac{${a.map(v => texNum(v)).join(" + ")}}{${n}} ${approx(m)} ${texNum(m)}`
      : `\\dfrac{${texNum(sum(a))}}{${n}} ${approx(m)} ${texNum(m)}`;
    r.meansStep = ["Calcule as médias de x e de y:",
      `${r.mxTex} = ${meanOf(x, mx)}, \\qquad ${r.myTex} = ${meanOf(y, my)}`];
    // Tabela com as colunas pedidas, cada uma [cabeçalho, valores].
    r.table = cols => {
      if (n > MAX_TABLE) return `\\text{(${n} pares: a tabela fica longa demais; seguem só as somas)}`;
      const head = cols.map(c => c[0]).join(" & ");
      const rows = Array.from({ length: n }, (_, i) => cols.map(c => c[1](i)).join(" & ")).join(" \\\\ ");
      const foot = cols.map(c => c[2] || "").join(" & ");
      return `\\begin{array}{${"c|".repeat(cols.length - 1)}c} ${head} \\\\ \\hline ${rows} \\\\ \\hline ${foot} \\end{array}`;
    };
    r.link = (page, extra = "") => {
      const q = new URLSearchParams({ x: x.join(" "), y: y.join(" ") });
      return `${page}?${q}${extra}`;
    };
    return r;
  }

  const confError = { error: "A confiança precisa estar entre 0 e 100%, como 90, 95 ou 99." };

  const pValueText = p => (p < 0.0001 ? "menor que 0,0001" : `${approx(p) === "=" ? "" : "≈ "}${fmt(p, 4)}`);

  const CALCS = {
    zscore({ x, mu, sd }) {
      if (sd <= 0) return { error: "O desvio padrão precisa ser maior que zero." };
      const diff = x - mu;
      const z = diff / sd;
      const X = tone(texNum(x), 2), M = tone(paren(mu, texNum(mu)), 3), S = tone(texNum(sd), 4);
      const zAbs = Math.abs(Number(z.toFixed(2)));

      let note;
      if (zAbs === 0) {
        note = "A observação coincide com a média.";
      } else {
        const lado = z > 0 ? "acima" : "abaixo";
        note = `A observação está ${fmt(Math.abs(z), 2)} ${zAbs >= 2 ? "desvios padrão" : "desvio padrão"} ${lado} da média.`;
      }
      const p = phi(z) * 100;
      const pct = p > 99.9 ? "mais de 99,9%" : p < 0.1 ? "menos de 0,1%" : `cerca de ${fmt(p, 1)}%`;
      note += ` Se os dados seguem uma distribuição normal, ${pct} dos valores ficam abaixo dela.`
        + ` <a href="/ztable.html?z=${z.toFixed(2)}">Conferir na tabela Z</a>.`;

      return {
        result: `Z ${approx(z)} ${tone(texNum(z), 1)}`,
        steps: [
          ["Substitua os valores na fórmula:", `Z = \\dfrac{${X} - ${M}}{${S}}`],
          ["Subtraia a média da observação:", `Z = \\dfrac{${texNum(diff)}}{${S}}`],
          ["Divida pelo desvio padrão:", `Z ${approx(z)} ${tone(texNum(z), 1)}`],
        ],
        note,
      };
    },

    tstudent({ xbar, mu, s, n }) {
      if (s <= 0) return { error: "O desvio padrão precisa ser maior que zero." };
      if (!Number.isInteger(n) || n < 2) return { error: "O tamanho da amostra precisa ser um inteiro maior ou igual a 2." };
      const root = Math.sqrt(n);
      const se = s / root;
      const diff = xbar - mu;
      const t = diff / se;
      const df = n - 1;
      const p = tTwoTail(t, df);
      const X = tone(texNum(xbar), 2), M = tone(paren(mu, texNum(mu)), 3), S = tone(texNum(s), 4);
      const N = tone(`\\sqrt{${texNum(n)}}`, 5);
      const R = tone(texNum(root), 5);
      const SE = texNum(se);

      const muTxt = fmt(mu);
      const veredito = p < 0.05
        ? `Ao nível de 5%, rejeita-se H₀: há evidência de que a média populacional é diferente de ${muTxt}.`
        : `Ao nível de 5%, não se rejeita H₀: os dados não bastam para dizer que a média populacional é diferente de ${muTxt}.`;

      return {
        result: `t ${approx(t)} ${tone(texNum(t), 1)}`,
        steps: [
          ["Substitua os valores na fórmula:", `t = \\dfrac{${X} - ${M}}{${S} / ${N}}`],
          // Raiz exata (√25 = 5) ganha um passo intermediário; as outras não.
          ["Calcule o erro padrão, o desvio padrão dividido pela raiz de n:",
            `\\mathrm{EP} = \\dfrac{${S}}{${N}} ${Number.isInteger(root) ? `= \\dfrac{${S}}{${R}}` : ""} ${approx(se)} ${SE}`],
          ["Subtraia a média hipotética da média amostral:", `t = \\dfrac{${texNum(diff)}}{${SE}}`],
          ["Divida pelo erro padrão:", `t ${approx(t)} ${tone(texNum(t), 1)}`],
        ],
        note: `Com n − 1 = ${df} ${df === 1 ? "grau" : "graus"} de liberdade, o valor-p bilateral é ${pValueText(p)}. ${veredito}`
          + ` <a href="/ttable.html?t=${Math.abs(t).toFixed(3)}&amp;df=${df}">Conferir na tabela t</a>.`,
      };
    },

    ic({ xbar, sd, n, conf }) {
      if (sd <= 0) return { error: "O desvio padrão precisa ser maior que zero." };
      if (!Number.isInteger(n) || n < 1) return { error: "O tamanho da amostra precisa ser um inteiro positivo." };
      if (conf <= 0 || conf >= 100) return confError;
      const alpha = 1 - conf / 100;
      const z = zCrit(conf);
      const root = Math.sqrt(n);
      const se = sd / root;
      const e = z * se;
      const lo = xbar - e, hi = xbar + e;
      const X = tone(texNum(xbar), 2), S = tone(texNum(sd), 4), Z = tone(texNum(z), 3);
      const N = tone(`\\sqrt{${texNum(n)}}`, 5), R = tone(texNum(root), 5), PM = tone("\\pm", 5);
      const interval = `\\left[\\,${texNum(lo)}\\,;\\ ${texNum(hi)}\\,\\right]`;
      const confTxt = `${fmt(conf, 2)}%`;

      return {
        result: `IC ${approx(lo) === "=" && approx(hi) === "=" ? "=" : "\\approx"} ${tone(interval, 1)}`,
        steps: [
          [`Encontre o valor crítico: com ${confTxt} de confiança, α = ${fmt(alpha, 6)} e α/2 = ${fmt(alpha / 2, 6)}.`,
            `z_{${texNum(alpha / 2, 6)}} \\approx ${Z}`],
          ["Calcule o erro padrão, o desvio padrão dividido pela raiz de n:",
            `\\mathrm{EP} = \\dfrac{${S}}{${N}} ${Number.isInteger(root) ? `= \\dfrac{${S}}{${R}}` : ""} ${approx(se)} ${texNum(se)}`],
          ["Multiplique pelo valor crítico para obter a margem de erro:",
            `E = ${Z} \\cdot ${texNum(se)} ${approx(e)} ${texNum(e)}`],
          ["Some e subtraia a margem da média amostral:",
            `IC = ${X} ${PM} ${texNum(e)} ${approx(lo) === "=" && approx(hi) === "=" ? "=" : "\\approx"} ${tone(interval, 1)}`],
        ],
        note: `Com ${confTxt} de confiança, a média populacional está entre ${fmt(lo)} e ${fmt(hi)}:`
          + ` intervalos construídos assim, em amostras diferentes, contêm a média verdadeira em ${confTxt} das vezes.`
          + ` O valor crítico foi arredondado para duas casas, como na tabela Z.`,
      };
    },

    cochran({ conf, p, e }) {
      if (conf <= 0 || conf >= 100) return confError;
      if (p <= 0 || p >= 100) return { error: "A proporção estimada precisa estar entre 0 e 100%, sem os extremos. Na dúvida, use 50." };
      if (e <= 0 || e >= 100) return { error: "A margem de erro precisa estar entre 0 e 100%, como 3 ou 5." };
      const z = zCrit(conf);
      const ph = p / 100, qh = 1 - ph, ed = e / 100;
      const num = z * z * ph * qh, den = ed * ed;
      const n0 = num / den, n = ceilInt(n0);
      const Z = tone(texNum(z), 2), P = tone(texNum(ph, 6), 3), Q = tone(texNum(qh, 6), 5), E = tone(texNum(ed, 6), 4);

      return {
        result: `n_0 = ${tone(texNum(n), 1)}`,
        steps: [
          [`Encontre o valor crítico para ${fmt(conf, 2)}% de confiança, como na tabela Z:`, `Z \\approx ${Z}`],
          ["Escreva as porcentagens como proporções; q̂ é o complemento de p̂:",
            `\\hat{p} = ${P}, \\quad \\hat{q} = 1 - ${texNum(ph, 6)} = ${Q}, \\quad e = ${E}`],
          ["Substitua na fórmula:",
            `n_0 = \\dfrac{${Z}^2 \\cdot ${P} \\cdot ${Q}}{${E}^2} ${approx(num, 6)} \\dfrac{${texNum(num, 6)}}{${texNum(den, 8)}} ${approx(n0, 2)} ${texNum(n0, 2)}`],
          ["Arredonde sempre para cima: para baixo, a margem de erro ficaria maior que a pedida.",
            `n_0 = ${tone(texNum(n), 1)}`],
        ],
        note: `Com ${fmt(n)} indivíduos, a proporção é estimada com margem de ±${fmt(e, 2)} pontos percentuais e ${fmt(conf, 2)}% de confiança, numa população grande.`
          + ` Se a população for pequena, a amostra pode ser menor: <a href="correcao-populacao-finita.html?n0=${n}">aplique a correção para população finita</a>.`,
      };
    },

    fpc({ n0, N }) {
      if (n0 < 1) return { error: "A amostra inicial precisa ser de pelo menos 1." };
      if (!Number.isInteger(N) || N < 1) return { error: "O tamanho da população precisa ser um inteiro positivo." };
      const frac = (n0 - 1) / N, den = 1 + frac;
      const n = n0 / den, nr = ceilInt(n);
      const N0 = tone(texNum(n0), 2), NN = tone(texNum(N), 4);
      const red = (1 - nr / ceilInt(n0)) * 100;
      const share = n0 / N * 100;

      let note = `Numa população de ${fmt(N)}, bastam ${fmt(nr)} em vez de ${fmt(ceilInt(n0))}`;
      note += red >= 1 ? `: ${fmt(red, 0)}% a menos.` : ", praticamente o mesmo.";
      note += share > 5
        ? ` A amostra inicial é ${fmt(share, 1)}% da população, e acima de 5% a correção costuma fazer diferença.`
        : ` A amostra inicial é só ${fmt(share, 1)}% da população; abaixo de 5%, a correção pouco muda.`;

      return {
        result: `n = ${tone(texNum(nr), 1)}`,
        steps: [
          ["Substitua na fórmula:", `n = \\dfrac{${N0}}{1 + \\dfrac{${tone(`(${texNum(n0)} - 1)`, 3)}}{${NN}}}`],
          ["Calcule a fração do denominador:",
            `\\dfrac{${tone(texNum(n0 - 1), 3)}}{${NN}} ${approx(frac, 6)} ${texNum(frac, 6)}`],
          ["Some 1:", `1 + ${texNum(frac, 6)} ${approx(den, 6)} ${texNum(den, 6)}`],
          ["Divida e arredonde para cima:",
            `n = \\dfrac{${N0}}{${texNum(den, 6)}} ${approx(n, 2)} ${texNum(n, 2)} \\;\\Rightarrow\\; n = ${tone(texNum(nr), 1)}`],
        ],
        note,
      };
    },

    neyman({ n, Nh, sh }) {
      const k = Nh.length;
      if (!Number.isInteger(n) || n < 1) return { error: "A amostra total precisa ser um inteiro positivo." };
      if (k < 2) return { error: "Informe o tamanho de pelo menos dois estratos." };
      if (sh.length !== k) return { error: `Há ${k} tamanhos de estrato e ${sh.length} desvios padrão; as listas precisam ter o mesmo tamanho.` };
      if (k > 30) return { error: "Use no máximo 30 estratos." };
      if (Nh.some(x => x <= 0)) return { error: "O tamanho de cada estrato precisa ser maior que zero." };
      if (sh.some(x => x < 0)) return { error: "Os desvios padrão não podem ser negativos." };
      const prods = Nh.map((x, i) => x * sh[i]);
      const sum = prods.reduce((s, x) => s + x, 0);
      if (sum <= 0) return { error: "Pelo menos um estrato precisa ter desvio padrão maior que zero." };
      const totalN = Nh.reduce((s, x) => s + x, 0);
      if (n > totalN) return { error: `A amostra total (${fmt(n)}) é maior que a população (${fmt(totalN)}).` };

      const ney = apportion(n, prods);
      const prop = apportion(n, Nh);
      const sumTex = texNum(sum);

      const t1 = `\\begin{array}{c|c|c|r} h & N_h & \\sigma_h & N_h \\cdot \\sigma_h \\\\ \\hline `
        + Nh.map((x, i) => `${i + 1} & ${tone(texNum(x), 3)} & ${tone(texNum(sh[i]), 5)} & ${texNum(prods[i])}`).join(" \\\\ ")
        + ` \\end{array}`;
      const sumLine = k <= 6
        ? `\\textstyle\\sum (N_h \\cdot \\sigma_h) = ${prods.map(x => texNum(x)).join(" + ")} = ${tone(sumTex, 4)}`
        : `\\textstyle\\sum (N_h \\cdot \\sigma_h) = ${tone(sumTex, 4)}`;
      const t2 = `\\def\\arraystretch{2.4}\\begin{array}{c|l|c} h & n_h = n \\cdot N_h\\sigma_h / \\Sigma & \\text{arredondado} \\\\ \\hline `
        + prods.map((x, i) =>
          `${i + 1} & ${tone(texNum(n), 2)} \\cdot \\dfrac{${texNum(x)}}{${tone(sumTex, 4)}} ${approx(ney.exact[i], 2)} ${texNum(ney.exact[i], 2)} & ${tone(texNum(ney.out[i]), 1)}`
        ).join(" \\\\ ")
        + ` \\end{array}`;

      const list = xs => xs.length > 1 ? `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}` : xs[0];
      const over = ney.out.map((x, i) => x > Nh[i] ? i + 1 : 0).filter(Boolean);
      let note = `Na alocação proporcional, que olha só o tamanho dos estratos, seriam ${list(prop.out.map(x => fmt(x)))}.`
        + " A de Neyman desloca a amostra para os estratos onde a variável varia mais, o que dá a menor variância para a média estimada com o mesmo n.";
      note += " Os arredondamentos usam o método dos maiores restos, para que a soma dê exatamente n.";
      if (over.length) {
        note += ` <strong>Atenção:</strong> no estrato ${list(over.map(String))}, a alocação passa do tamanho do próprio estrato.`
          + " Nesse caso, entreviste o estrato inteiro e redistribua o restante entre os outros.";
      }

      return {
        result: `n_h = ${tone(ney.out.map(x => texNum(x)).join(",\\ "), 1)}`,
        steps: [
          ["Multiplique o tamanho de cada estrato pelo seu desvio padrão:", t1],
          ["Some os produtos:", sumLine],
          ["Divida a amostra total na proporção de cada produto e arredonde:", t2],
        ],
        note,
      };
    },

    cov({ x, y }) {
      const d = paired(x, y, v => `\\mu_${v}`);
      if (d.error) return d;
      const cov = d.sxy / d.n;
      const table = d.table([
        ["i", i => i + 1, "\\Sigma"],
        ["x_i", i => texNum(x[i])],
        ["y_i", i => texNum(y[i])],
        ["x_i - \\mu_x", i => tone(texNum(d.dx[i]), 3)],
        ["y_i - \\mu_y", i => tone(texNum(d.dy[i]), 5)],
        ["\\text{produto}", i => texNum(d.prod[i]), tone(texNum(d.sxy), 2)],
      ]);
      const sinal = Math.abs(cov) < 1e-12
        ? "A covariância é zero: não há tendência linear entre x e y."
        : cov > 0
          ? "A covariância é positiva: quando x está acima da média, y também tende a estar."
          : "A covariância é negativa: quando x está acima da média, y tende a ficar abaixo.";
      return {
        result: `Cov(X,Y) ${approx(cov)} ${tone(texNum(cov), 1)}`,
        steps: [
          d.meansStep,
          ["Calcule os desvios de cada valor em relação à média e multiplique os pares:", table],
          ["Divida a soma dos produtos pelo número de pares:",
            `Cov(X,Y) = \\dfrac{${tone(texNum(d.sxy), 2)}}{${tone(d.n, 4)}} ${approx(cov)} ${tone(texNum(cov), 1)}`],
        ],
        note: `${sinal} O tamanho do número, porém, depende das unidades de x e de y e não diz se a relação é forte;`
          + ` para isso existe o <a href="${d.link("coeficiente-pearson.html")}">coeficiente de Pearson, com estes mesmos dados</a>.`
          + ` Esta fórmula divide por n (covariância populacional); a amostral divide por n − 1 e daria ${fmt(d.sxy / (d.n - 1))}.`,
      };
    },

    pearson({ x, y }) {
      const d = paired(x, y, v => `\\mu_${v}`);
      if (d.error) return d;
      if (d.sxx === 0) return { error: "Todos os valores de x são iguais: o desvio padrão de x é zero e r não é definido." };
      if (d.syy === 0) return { error: "Todos os valores de y são iguais: o desvio padrão de y é zero e r não é definido." };
      const cov = d.sxy / d.n, sx = Math.sqrt(d.sxx / d.n), sy = Math.sqrt(d.syy / d.n);
      const r = Math.max(-1, Math.min(1, cov / (sx * sy)));
      const table = d.table([
        ["i", i => i + 1, "\\Sigma"],
        ["x_i - \\mu_x", i => texNum(d.dx[i])],
        ["y_i - \\mu_y", i => texNum(d.dy[i])],
        ["\\text{produto}", i => texNum(d.prod[i]), texNum(d.sxy)],
        ["(x_i - \\mu_x)^2", i => texNum(d.dx[i] ** 2), texNum(d.sxx)],
        ["(y_i - \\mu_y)^2", i => texNum(d.dy[i] ** 2), texNum(d.syy)],
      ]);
      const a = Math.abs(r);
      const forca = a >= 0.9 ? "muito forte" : a >= 0.7 ? "forte" : a >= 0.5 ? "moderada" : a >= 0.3 ? "fraca" : "muito fraca ou inexistente";
      const direcao = a < 0.3 ? "" : r > 0 ? " e positiva" : " e negativa";
      return {
        result: `r_{xy} ${approx(r)} ${tone(texNum(r), 1)}`,
        steps: [
          d.meansStep,
          ["Calcule os desvios, seus produtos e seus quadrados:", table],
          ["Divida as somas por n para obter a covariância e os desvios padrão:",
            `Cov(X,Y) = \\dfrac{${texNum(d.sxy)}}{${d.n}} ${approx(cov)} ${tone(texNum(cov), 2)}, \\quad `
            + `\\sigma_x = \\sqrt{\\dfrac{${texNum(d.sxx)}}{${d.n}}} ${approx(sx)} ${tone(texNum(sx), 3)}, \\quad `
            + `\\sigma_y = \\sqrt{\\dfrac{${texNum(d.syy)}}{${d.n}}} ${approx(sy)} ${tone(texNum(sy), 4)}`],
          ["Divida a covariância pelo produto dos desvios padrão:",
            `r_{xy} = \\dfrac{${tone(texNum(cov), 2)}}{${tone(texNum(sx), 3)} \\cdot ${tone(texNum(sy), 4)}} ${approx(r)} ${tone(texNum(r), 1)}`],
        ],
        note: `Correlação ${forca}${direcao}. O quadrado, r² ${approx(r * r * 100, 1) === "=" ? "=" : "≈"} ${fmt(r * r * 100, 1)}%, é a fração da variação de y que acompanha x numa reta.`
          + " Lembre que r só mede relação <em>linear</em> e que correlação não prova causa."
          + ` Para a reta em si, veja a <a href="${d.link("regressao-linear.html")}">regressão linear com estes mesmos dados</a>.`,
      };
    },

    reg({ x, y, x0 }) {
      const d = paired(x, y, v => `\\bar{${v}}`);
      if (d.error) return d;
      if (d.sxx === 0) return { error: "Todos os valores de x são iguais: não há como traçar uma reta que dependa de x." };
      if (x0.length > 1) return { error: "Informe um único valor de x para a previsão, ou deixe o campo vazio." };
      const b1 = d.sxy / d.sxx, b0 = d.my - b1 * d.mx;
      const B0 = tone(texNum(b0), 2), B1 = tone(texNum(b1), 3);
      const line = `\\hat{y} = ${B0} ${b1 < 0 ? "-" : "+"} ${tone(texNum(Math.abs(b1)), 3)}\\,${tone("x", 4)}`;
      const table = d.table([
        ["i", i => i + 1, "\\Sigma"],
        ["x_i - \\bar{x}", i => texNum(d.dx[i])],
        ["y_i - \\bar{y}", i => texNum(d.dy[i])],
        ["\\text{produto}", i => texNum(d.prod[i]), texNum(d.sxy)],
        ["(x_i - \\bar{x})^2", i => texNum(d.dx[i] ** 2), texNum(d.sxx)],
      ]);
      const steps = [
        d.meansStep,
        ["Calcule os desvios, seus produtos e os quadrados dos desvios de x:", table],
        ["A inclinação é a soma dos produtos dividida pela soma dos quadrados:",
          `\\beta_1 = \\dfrac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2} = \\dfrac{${texNum(d.sxy)}}{${texNum(d.sxx)}} ${approx(b1)} ${B1}`],
        ["O intercepto faz a reta passar pelo ponto das médias:",
          `\\beta_0 = \\bar{y} - \\beta_1 \\bar{x} = ${texNum(d.my)} - ${paren(b1, texNum(b1))} \\cdot ${paren(d.mx, texNum(d.mx))} ${approx(b0)} ${B0}`],
      ];
      let note = `Cada unidade a mais de x ${b1 >= 0 ? "soma" : "tira"} ${fmt(Math.abs(b1))} ao valor previsto de y.`;
      if (x0.length) {
        const v = x0[0], yh = b0 + b1 * v;
        steps.push(["Substitua o x desejado na reta:",
          `\\hat{y} = ${B0} ${b1 < 0 ? "-" : "+"} ${tone(texNum(Math.abs(b1)), 3)} \\cdot ${tone(paren(v, texNum(v)), 4)} ${approx(yh)} ${tone(texNum(yh), 1)}`]);
        note += ` Para x = ${fmt(v)}, a previsão é ${fmt(yh)}.`;
        const lo = Math.min(...x), hi = Math.max(...x);
        if (v < lo || v > hi) {
          note += ` <strong>Atenção:</strong> ${fmt(v)} está fora da faixa observada (${fmt(lo)} a ${fmt(hi)}). Extrapolar supõe que a reta continua valendo além dos dados, o que pode não ser verdade.`;
        }
      }
      return { result: line, steps, note };
    },

    harm({ x }) {
      const n = x.length;
      if (n < 2) return { error: "Informe pelo menos dois valores." };
      if (n > 200) return { error: "Use no máximo 200 valores." };
      if (x.some(v => v <= 0)) return { error: "A média harmônica só faz sentido para valores positivos." };
      const rec = x.map(v => 1 / v);
      const sum = rec.reduce((a, b) => a + b, 0);
      const h = n / sum;
      const arith = x.reduce((a, b) => a + b, 0) / n;
      const S = tone(texNum(sum, 6), 3);
      const recLine = n <= 6
        ? `${x.map(v => `\\dfrac{1}{${texNum(v)}}`).join(" + ")} ${approx(sum, 6)} ${rec.map(v => texNum(v, 6)).join(" + ")} ${approx(sum, 6)} ${S}`
        : `\\textstyle\\sum \\dfrac{1}{x_i} ${approx(sum, 6)} ${S}`;
      return {
        result: `H ${approx(h)} ${tone(texNum(h), 1)}`,
        steps: [
          ["Some os recíprocos (1 dividido por cada valor):", recLine],
          ["Divida o número de valores por essa soma:",
            `H = \\dfrac{${tone(n, 2)}}{${S}} ${approx(h)} ${tone(texNum(h), 1)}`],
        ],
        note: `A média aritmética dos mesmos valores seria ${fmt(arith)}; a harmônica é sempre menor ou igual a ela.`
          + " É a média certa quando os valores são taxas sobre uma mesma quantidade, como velocidades num mesmo trecho:"
          + " o trecho feito mais devagar leva mais tempo e pesa mais no resultado.",
      };
    },

    quad({ a, b, c }) {
      if (a === 0) {
        return { error: b === 0
          ? "Com a = 0 e b = 0, não há equação em x."
          : `Com a = 0 a equação é de primeiro grau, e a solução é x = −c/b = ${fmt(-c / b)}.` };
      }
      const term = (k, v, first) => {
        if (k === 0) return "";
        const sign = k < 0 ? "-" : first ? "" : "+";
        const abs = Math.abs(k);
        const coef = v && abs === 1 ? "" : texNum(abs);
        return `${sign} ${coef}${v}`;
      };
      const poly = [term(a, "x^2", true), term(b, "x", a === 0), term(c, "", false)].filter(Boolean).join(" ") + " = 0";
      const A = tone(paren(a, texNum(a)), 4), B = tone(paren(b, texNum(b)), 2), C = tone(paren(c, texNum(c)), 3);
      const delta = b * b - 4 * a * c;
      const D = tone(texNum(delta), 3);
      const twoA = 2 * a;
      const TA = tone(texNum(twoA), 4), MB = tone(texNum(-b), 2), PM = tone("\\pm", 5);
      const steps = [
        ["Identifique os coeficientes da equação:", `${poly} \\quad\\Rightarrow\\quad a = ${A},\\; b = ${B},\\; c = ${C}`],
        ["Calcule o discriminante:",
          `\\Delta = b^2 - 4ac = ${B}^2 - 4 \\cdot ${A} \\cdot ${C} ${approx(delta)} ${D}`],
      ];
      let result, note;
      if (Math.abs(delta) < 1e-12) {
        const x = -b / twoA;
        steps.push(["Com Δ = 0, a raiz quadrada some e sobra uma única raiz (dupla):",
          `x = \\dfrac{-b}{2a} = \\dfrac{${MB}}{${TA}} ${approx(x)} ${tone(texNum(x), 1)}`]);
        result = `x ${approx(x)} ${tone(texNum(x), 1)}`;
        note = "Raiz dupla: a parábola toca o eixo x num único ponto, o vértice.";
      } else if (delta > 0) {
        const r = Math.sqrt(delta);
        const x1 = (-b + r) / twoA, x2 = (-b - r) / twoA;
        const R = tone(texNum(r), 3);
        steps.push(["Tire a raiz do discriminante:", `\\sqrt{\\Delta} = \\sqrt{${D}} ${approx(r)} ${R}`]);
        steps.push(["Aplique a fórmula, uma vez com + e outra com −:",
          `x = \\dfrac{${MB} ${PM} ${R}}{${TA}} \\quad\\Rightarrow\\quad `
          + `x_1 = \\dfrac{${texNum(-b)} + ${texNum(r)}}{${texNum(twoA)}} ${approx(x1)} ${tone(texNum(x1), 1)}, \\quad `
          + `x_2 = \\dfrac{${texNum(-b)} - ${texNum(r)}}{${texNum(twoA)}} ${approx(x2)} ${tone(texNum(x2), 1)}`]);
        result = `x_1 ${approx(x1)} ${tone(texNum(x1), 1)}, \\quad x_2 ${approx(x2)} ${tone(texNum(x2), 1)}`;
        note = `Duas raízes reais: a parábola cruza o eixo x em ${fmt(x2 < x1 ? x2 : x1)} e ${fmt(x2 < x1 ? x1 : x2)}.`
          + ` Para conferir, a soma das raízes é −b/a = ${fmt(-b / a)} e o produto é c/a = ${fmt(c / a)}.`;
      } else {
        const re = -b / twoA, im = Math.abs(Math.sqrt(-delta) / twoA);
        const R = tone(`${texNum(Math.sqrt(-delta))}\\,i`, 3);
        steps.push(["Com Δ < 0, a raiz é imaginária: √Δ = i·√|Δ|.",
          `\\sqrt{\\Delta} = \\sqrt{${D}} ${approx(Math.sqrt(-delta))} ${R}`]);
        steps.push(["Aplique a fórmula e separe a parte real da imaginária:",
          `x = \\dfrac{${MB} ${PM} ${R}}{${TA}} ${approx(re) === "=" && approx(im) === "=" ? "=" : "\\approx"} ${tone(`${texNum(re)} \\pm ${texNum(im)}\\,i`, 1)}`]);
        result = `x ${approx(re) === "=" && approx(im) === "=" ? "=" : "\\approx"} ${tone(`${texNum(re)} \\pm ${texNum(im)}\\,i`, 1)}`;
        note = "Sem raízes reais: a parábola não cruza o eixo x. As duas raízes são complexas conjugadas.";
      }
      return { result, steps, note };
    },

    // Teste de aderência. As esperadas podem vir como contagens, como
    // proporções (somando 1) ou ficar em branco, para a distribuição uniforme.
    chi({ o, e }) {
      const k = o.length;
      if (k < 2) return { error: "Informe as frequências observadas de pelo menos duas categorias." };
      if (k > 50) return { error: "Use no máximo 50 categorias." };
      if (o.some(x => x < 0)) return { error: "As frequências observadas não podem ser negativas." };
      const total = o.reduce((s, x) => s + x, 0);
      if (total <= 0) return { error: "As frequências observadas precisam somar mais que zero." };

      let exp, step1;
      if (!e.length) {
        exp = o.map(() => total / k);
        step1 = ["Sem esperadas informadas, a hipótese é de categorias igualmente prováveis: divida o total pelo número de categorias.",
          `E_i = \\dfrac{${texNum(total)}}{${k}} ${approx(total / k)} ${tone(texNum(total / k), 4)}`];
      } else {
        if (e.length !== k) return { error: `Há ${k} observadas e ${e.length} esperadas; as listas precisam ter o mesmo tamanho.` };
        if (e.some(x => x <= 0)) return { error: "As frequências esperadas precisam ser maiores que zero." };
        const se = e.reduce((s, x) => s + x, 0);
        if (Math.abs(se - 1) < 1e-6) {
          exp = e.map(p => p * total);
          step1 = ["As esperadas foram dadas como proporções: multiplique cada uma pelo total observado.",
            `E_i = p_i \\cdot ${texNum(total)}`];
        } else if (Math.abs(se - total) <= 0.01 * total) {
          exp = e;
          step1 = ["Use as frequências esperadas informadas; elas somam o mesmo que as observadas.",
            `\\textstyle\\sum E_i ${approx(se)} ${texNum(se)} = \\sum O_i`];
        } else {
          return { error: `As esperadas somam ${fmt(se)} e as observadas, ${fmt(total)}. Elas precisam somar o mesmo — ou dê as esperadas como proporções que somam 1.` };
        }
      }

      const parts = o.map((x, i) => (x - exp[i]) ** 2 / exp[i]);
      const chi2 = parts.reduce((s, x) => s + x, 0);
      const df = k - 1;
      const p = chiSurvival(chi2, df);

      const rows = o.map((x, i) =>
        `${i + 1} & ${tone(texNum(x), 3)} & ${tone(texNum(exp[i]), 4)} & `
        + `\\dfrac{(${texNum(x)} - ${paren(exp[i], texNum(exp[i]))})^2}{${texNum(exp[i])}} ${approx(parts[i])} ${texNum(parts[i])}`
      ).join(" \\\\ ");
      const table = `\\def\\arraystretch{2.4}\\begin{array}{c|c|c|l} i & O_i & E_i & (O_i - E_i)^2 / E_i \\\\ \\hline ${rows} \\end{array}`;
      const sum = k <= 8
        ? `\\chi^2 = ${parts.map(x => texNum(x)).join(" + ")} ${approx(chi2)} ${tone(texNum(chi2), 1)}`
        : `\\chi^2 = \\textstyle\\sum \\dfrac{(O_i - E_i)^2}{E_i} ${approx(chi2)} ${tone(texNum(chi2), 1)}`;

      const veredito = p < 0.05
        ? "Ao nível de 5%, rejeita-se H₀: as frequências observadas diferem das esperadas mais do que o acaso explicaria."
        : "Ao nível de 5%, não se rejeita H₀: as diferenças entre observadas e esperadas são compatíveis com o acaso.";
      const pequenas = exp.some(x => x < 5)
        ? " <strong>Atenção:</strong> há frequência esperada menor que 5, e com ela a aproximação pela qui-quadrado fica pouco confiável. Junte categorias ou aumente a amostra."
        : "";

      return {
        result: `\\chi^2 ${approx(chi2)} ${tone(texNum(chi2), 1)}`,
        steps: [
          step1,
          ["Calcule a parcela de cada categoria:", table],
          ["Some as parcelas:", sum],
        ],
        note: `Com k − 1 = ${df} ${df === 1 ? "grau" : "graus"} de liberdade, o valor-p é ${pValueText(p)}. ${veredito}${pequenas}`,
      };
    },
  };

  // \htmlData só para pintar trechos com data-tone; nada além disso é confiável.
  const MATH_OPTS = { throwOnError: false, strict: false, trust: c => c.command === "\\htmlData" };
  const math = (el, src) => (window.katex ? katex.render(src, el, MATH_OPTS) : (el.textContent = src));

  function initCalc(section) {
    const calc = CALCS[section.dataset.calc];
    const inputs = Array.from(section.querySelectorAll("input[name]"));
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    // Aceita vírgula decimal, sinal tipográfico −, espaços de milhar e um % no fim.
    const parse = s => (s.trim() === "" ? NaN : Number(s.replace(/[\s%]/g, "").replace("−", "-").replace(",", ".")));
    // Campo com data-list vira um array, separado por espaço ou ponto e vírgula
    // (a vírgula é a decimal). Com data-optional, pode ficar vazio.
    const read = i => {
      if (!("list" in i.dataset)) return parse(i.value);
      const xs = i.value.split(/[\s;]+/).filter(Boolean).map(parse);
      return xs.some(Number.isNaN) || (!xs.length && !("optional" in i.dataset)) ? NaN : xs;
    };

    const params = new URLSearchParams(location.search);
    inputs.forEach(i => { if (params.has(i.name)) i.value = params.get(i.name); });

    function update() {
      const v = Object.fromEntries(inputs.map(i => [i.name, read(i)]));
      inputs.forEach(i => i.setAttribute("aria-invalid", String(Number.isNaN(v[i.name]))));
      const out = Object.values(v).some(Number.isNaN)
        ? { error: "Preencha todos os campos com números." }
        : calc(v);

      section.classList.toggle("has-error", !!out.error);
      steps.replaceChildren();
      if (out.error) {
        result.textContent = "";
        note.textContent = out.error;
        return;
      }
      math(result, out.result);
      out.steps.forEach(([text, src]) => {
        const li = document.createElement("li");
        const p = document.createElement("span");
        const m = document.createElement("span");
        p.textContent = text;
        m.className = "calc-math";
        math(m, src);
        li.append(p, m);
        steps.appendChild(li);
      });
      note.innerHTML = out.note;
    }

    // replaceState, não pushState: cada tecla viraria uma entrada no histórico.
    section.addEventListener("input", () => {
      update();
      const q = new URLSearchParams(location.search);
      inputs.forEach(i => q.set(i.name, i.value.trim().replace(/%$/, "")));
      history.replaceState(null, "", `${location.pathname}?${q}${location.hash}`);
    });
    update();
  }

  document.querySelectorAll(".calc[data-calc]").forEach(initCalc);
  // Exemplos resolvidos fixos, escritos direto no HTML (L'Hôpital).
  document.querySelectorAll(".worked [data-tex]").forEach(el => math(el, "\\displaystyle " + el.dataset.tex));

  if (document.querySelector(".formula-wrap")) initFormula();
  else if (document.getElementById("filtro")) initIndex();
})();
