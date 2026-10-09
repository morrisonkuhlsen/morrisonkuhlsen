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

  // Idioma da página: as versões em /en/formulas/ usam o mesmo script. T()
  // escolhe o texto; números, decimais e listas seguem o idioma também.
  const EN = (document.documentElement.lang || "").toLowerCase().startsWith("en");
  const T = (pt, en) => (EN ? en : pt);
  const LOCALE = EN ? "en-US" : "pt-BR";
  // Slugs das páginas para os links que uma calculadora faz para outra.
  const EN_SLUG = {
    "teorema-bayes": "bayes-theorem", "distribuicao-binomial": "binomial-distribution",
    "correcao-populacao-finita": "finite-population-correction", "coeficiente-pearson": "pearson-correlation",
    "regressao-linear": "linear-regression", "z-score": "z-score", "t-student": "students-t-test",
    "cochran-formula": "cochran-formula",
  };
  const PAGE = slug => `${EN ? EN_SLUG[slug] : slug}.html`;

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

  const nf = d => new Intl.NumberFormat(LOCALE, { maximumFractionDigits: d });
  const fmt = (n, d = 4) => nf(d).format(n === 0 ? 0 : n); // evita "-0"
  // No KaTeX, vírgula e ponto entre chaves não ganham o espaço de pontuação.
  const braces = s => s.replace(/[.,]/g, c => `{${c}}`);
  const texNum = (n, d = 4) => braces(fmt(n, d));
  const DEC = EN ? "." : ",";
  // Separador dos limites de um intervalo: [a; b] em português, [a, b] em inglês.
  const interval = (lo, hi) => `\\left[\\,${texNum(lo)}${T("\\,;", ",")}\\ ${texNum(hi)}\\,\\right]`;
  // "a, b e c" / "a, b and c".
  const list = xs => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} ${T("e", "and")} ${xs[xs.length - 1]}` : xs[0]);
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
    if (x.length !== y.length) return { error: T(`Há ${x.length} valores de x e ${y.length} de y; as listas precisam ter o mesmo tamanho.`, `There are ${x.length} values of x and ${y.length} of y; the lists must have the same length.`) };
    const n = x.length;
    if (n < 2) return { error: T("Informe pelo menos dois pares de valores.", "Enter at least two pairs of values.") };
    if (n > 200) return { error: T("Use no máximo 200 pares.", "Use at most 200 pairs.") };
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
    r.meansStep = [T("Calcule as médias de x e de y:", "Compute the means of x and y:"),
      `${r.mxTex} = ${meanOf(x, mx)}, \\qquad ${r.myTex} = ${meanOf(y, my)}`];
    // Tabela com as colunas pedidas, cada uma [cabeçalho, valores].
    r.table = cols => {
      if (n > MAX_TABLE) return T(`\\text{(${n} pares: a tabela fica longa demais; seguem só as somas)}`, `\\text{(${n} pairs: the table would be too long; only the sums follow)}`);
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

  // Número muito grande ou muito pequeno vai em notação científica.
  function texSci(x, d = 4) {
    if (x === 0 || (Math.abs(x) < 1e9 && Math.abs(x) >= 1e-4)) return texNum(x, d);
    const e = Math.floor(Math.log10(Math.abs(x)));
    return `${texNum(x / 10 ** e, 3)} \\times 10^{${e}}`;
  }
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const fmtSci = (x, d = 4) => {
    if (x === 0 || (Math.abs(x) < 1e9 && Math.abs(x) >= 1e-4)) return fmt(x, d);
    const e = Math.floor(Math.log10(Math.abs(x)));
    return `${fmt(x / 10 ** e, 3)} × 10${String(e).replace(/./g, c => SUP[c])}`;
  };
  const pctTex = (x, d = 2) => `${texSci(x * 100, d)}\\%`;

  // Em escala log, para n grande não estourar nem zerar no meio da conta.
  function binPmf(n, p, k) {
    if (p === 0) return k === 0 ? 1 : 0;
    if (p === 1) return k === n ? 1 : 0;
    return Math.exp(lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log(1 - p));
  }
  const poisPmf = (lam, k) => Math.exp(k * Math.log(lam) - lam - lgamma(k + 1));
  const normPdf = (x, mu, sd) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));

  // Sorteio com semente (mulberry32): os mesmos valores dão o mesmo gráfico.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Barras de uma distribuição discreta, com a tabela de todos os valores.
  function discreteChart(label, xLabel, xs, ys, k, symbol) {
    return {
      type: "bars", label, xLabel, xs, ys,
      xMin: xs[0] - 0.5, xMax: xs[xs.length - 1] + 0.5, yMax: Math.max(...ys),
      hi: x => x === k,
      tip: (x, y) => [fmtSci(y, 4), `P(${symbol} = ${x})`],
      table: {
        title: T("Ver todas as probabilidades", "See all probabilities"),
        head: [symbol, `P(${symbol} = ${symbol.toLowerCase()})`],
        rows: xs.map((x, i) => ({ hi: x === k, cells: [fmt(x), fmtSci(ys[i], 6)] })),
      },
    };
  }

  const confError = { error: T("A confiança precisa estar entre 0 e 100%, como 90, 95 ou 99.", "Confidence must be between 0 and 100%, such as 90, 95 or 99.") };

  const pValueText = p => (p < 0.0001 ? T("menor que 0,0001", "below 0.0001") : `${approx(p) === "=" ? "" : "≈ "}${fmt(p, 4)}`);
  const sdError = { error: T("O desvio padrão precisa ser maior que zero.", "The standard deviation must be greater than zero.") };
  const dof = df => T(`${df} ${df === 1 ? "grau" : "graus"} de liberdade`, `${df} degree${df === 1 ? "" : "s"} of freedom`);
  const warn = T("<strong>Atenção:</strong>", "<strong>Note:</strong>");
  const probRange = { error: T("As probabilidades precisam estar entre 0 e 100%.", "Probabilities must be between 0 and 100%.") };

  const CALCS = {
    zscore({ x, mu, sd }) {
      if (sd <= 0) return sdError;
      const diff = x - mu;
      const z = diff / sd;
      const X = tone(texNum(x), 2), M = tone(paren(mu, texNum(mu)), 3), S = tone(texNum(sd), 4);
      const zAbs = Math.abs(Number(z.toFixed(2)));

      let note;
      if (zAbs === 0) {
        note = T("A observação coincide com a média.", "The observation equals the mean.");
      } else {
        note = T(`A observação está ${fmt(Math.abs(z), 2)} ${zAbs >= 2 ? "desvios padrão" : "desvio padrão"} ${z > 0 ? "acima" : "abaixo"} da média.`,
          `The observation is ${fmt(Math.abs(z), 2)} standard deviation${zAbs === 1 ? "" : "s"} ${z > 0 ? "above" : "below"} the mean.`);
      }
      const p = phi(z) * 100;
      const pct = p > 99.9 ? T("mais de 99,9%", "over 99.9%") : p < 0.1 ? T("menos de 0,1%", "under 0.1%") : T(`cerca de ${fmt(p, 1)}%`, `about ${fmt(p, 1)}%`);
      note += T(` Se os dados seguem uma distribuição normal, ${pct} dos valores ficam abaixo dela.`, ` If the data follow a normal distribution, ${pct} of the values fall below it.`)
        + ` <a href="/ztable.html?z=${z.toFixed(2)}">${T("Conferir na tabela Z", "Check it in the Z table")}</a>.`;

      return {
        result: `Z ${approx(z)} ${tone(texNum(z), 1)}`,
        steps: [
          [T("Substitua os valores na fórmula:", "Plug the values into the formula:"), `Z = \\dfrac{${X} - ${M}}{${S}}`],
          [T("Subtraia a média da observação:", "Subtract the mean from the observation:"), `Z = \\dfrac{${texNum(diff)}}{${S}}`],
          [T("Divida pelo desvio padrão:", "Divide by the standard deviation:"), `Z ${approx(z)} ${tone(texNum(z), 1)}`],
        ],
        note,
      };
    },

    tstudent({ xbar, mu, s, n }) {
      if (s <= 0) return sdError;
      if (!Number.isInteger(n) || n < 2) return { error: T("O tamanho da amostra precisa ser um inteiro maior ou igual a 2.", "The sample size must be an integer of at least 2.") };
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
        ? T(`Ao nível de 5%, rejeita-se H₀: há evidência de que a média populacional é diferente de ${muTxt}.`, `At the 5% level, H₀ is rejected: there is evidence that the population mean differs from ${muTxt}.`)
        : T(`Ao nível de 5%, não se rejeita H₀: os dados não bastam para dizer que a média populacional é diferente de ${muTxt}.`, `At the 5% level, H₀ is not rejected: the data are not enough to say the population mean differs from ${muTxt}.`);
      const SEL = T("\\mathrm{EP}", "\\mathrm{SE}");

      return {
        result: `t ${approx(t)} ${tone(texNum(t), 1)}`,
        steps: [
          [T("Substitua os valores na fórmula:", "Plug the values into the formula:"), `t = \\dfrac{${X} - ${M}}{${S} / ${N}}`],
          // Raiz exata (√25 = 5) ganha um passo intermediário; as outras não.
          [T("Calcule o erro padrão, o desvio padrão dividido pela raiz de n:", "Compute the standard error, the standard deviation divided by the square root of n:"),
            `${SEL} = \\dfrac{${S}}{${N}} ${Number.isInteger(root) ? `= \\dfrac{${S}}{${R}}` : ""} ${approx(se)} ${SE}`],
          [T("Subtraia a média hipotética da média amostral:", "Subtract the hypothesized mean from the sample mean:"), `t = \\dfrac{${texNum(diff)}}{${SE}}`],
          [T("Divida pelo erro padrão:", "Divide by the standard error:"), `t ${approx(t)} ${tone(texNum(t), 1)}`],
        ],
        note: T(`Com n − 1 = ${dof(df)}, o valor-p bilateral é ${pValueText(p)}. ${veredito}`, `With n − 1 = ${dof(df)}, the two-sided p-value is ${pValueText(p)}. ${veredito}`)
          + ` <a href="/ttable.html?t=${Math.abs(t).toFixed(3)}&amp;df=${df}">${T("Conferir na tabela t", "Check it in the t table")}</a>.`,
      };
    },

    ic({ xbar, sd, n, conf }) {
      if (sd <= 0) return sdError;
      if (!Number.isInteger(n) || n < 1) return { error: T("O tamanho da amostra precisa ser um inteiro positivo.", "The sample size must be a positive integer.") };
      if (conf <= 0 || conf >= 100) return confError;
      const alpha = 1 - conf / 100;
      const z = zCrit(conf);
      const root = Math.sqrt(n);
      const se = sd / root;
      const e = z * se;
      const lo = xbar - e, hi = xbar + e;
      const X = tone(texNum(xbar), 2), S = tone(texNum(sd), 4), Z = tone(texNum(z), 3);
      const N = tone(`\\sqrt{${texNum(n)}}`, 5), R = tone(texNum(root), 5), PM = tone("\\pm", 5);
      const iv = interval(lo, hi);
      const confTxt = `${fmt(conf, 2)}%`;
      const CI = T("IC", "CI");
      const eq = approx(lo) === "=" && approx(hi) === "=" ? "=" : "\\approx";

      return {
        result: `${CI} ${eq} ${tone(iv, 1)}`,
        steps: [
          [T(`Encontre o valor crítico: com ${confTxt} de confiança, α = ${fmt(alpha, 6)} e α/2 = ${fmt(alpha / 2, 6)}.`, `Find the critical value: at ${confTxt} confidence, α = ${fmt(alpha, 6)} and α/2 = ${fmt(alpha / 2, 6)}.`),
            `z_{${texNum(alpha / 2, 6)}} \\approx ${Z}`],
          [T("Calcule o erro padrão, o desvio padrão dividido pela raiz de n:", "Compute the standard error, the standard deviation divided by the square root of n:"),
            `${T("\\mathrm{EP}", "\\mathrm{SE}")} = \\dfrac{${S}}{${N}} ${Number.isInteger(root) ? `= \\dfrac{${S}}{${R}}` : ""} ${approx(se)} ${texNum(se)}`],
          [T("Multiplique pelo valor crítico para obter a margem de erro:", "Multiply by the critical value to get the margin of error:"),
            `E = ${Z} \\cdot ${texNum(se)} ${approx(e)} ${texNum(e)}`],
          [T("Some e subtraia a margem da média amostral:", "Add and subtract the margin from the sample mean:"),
            `${CI} = ${X} ${PM} ${texNum(e)} ${eq} ${tone(iv, 1)}`],
        ],
        note: T(`Com ${confTxt} de confiança, a média populacional está entre ${fmt(lo)} e ${fmt(hi)}:`
          + ` intervalos construídos assim, em amostras diferentes, contêm a média verdadeira em ${confTxt} das vezes.`
          + ` O valor crítico foi arredondado para duas casas, como na tabela Z.`,
          `With ${confTxt} confidence, the population mean lies between ${fmt(lo)} and ${fmt(hi)}:`
          + ` intervals built this way, across different samples, contain the true mean ${confTxt} of the time.`
          + ` The critical value was rounded to two decimals, as in the Z table.`),
      };
    },

    cochran({ conf, p, e }) {
      if (conf <= 0 || conf >= 100) return confError;
      if (p <= 0 || p >= 100) return { error: T("A proporção estimada precisa estar entre 0 e 100%, sem os extremos. Na dúvida, use 50.", "The estimated proportion must be strictly between 0 and 100%. If unsure, use 50.") };
      if (e <= 0 || e >= 100) return { error: T("A margem de erro precisa estar entre 0 e 100%, como 3 ou 5.", "The margin of error must be between 0 and 100%, such as 3 or 5.") };
      const z = zCrit(conf);
      const ph = p / 100, qh = 1 - ph, ed = e / 100;
      const num = z * z * ph * qh, den = ed * ed;
      const n0 = num / den, n = ceilInt(n0);
      const Z = tone(texNum(z), 2), P = tone(texNum(ph, 6), 3), Q = tone(texNum(qh, 6), 5), E = tone(texNum(ed, 6), 4);

      return {
        result: `n_0 = ${tone(texNum(n), 1)}`,
        steps: [
          [T(`Encontre o valor crítico para ${fmt(conf, 2)}% de confiança, como na tabela Z:`, `Find the critical value for ${fmt(conf, 2)}% confidence, as in the Z table:`), `Z \\approx ${Z}`],
          [T("Escreva as porcentagens como proporções; q̂ é o complemento de p̂:", "Write the percentages as proportions; q̂ is the complement of p̂:"),
            `\\hat{p} = ${P}, \\quad \\hat{q} = 1 - ${texNum(ph, 6)} = ${Q}, \\quad e = ${E}`],
          [T("Substitua na fórmula:", "Plug into the formula:"),
            `n_0 = \\dfrac{${Z}^2 \\cdot ${P} \\cdot ${Q}}{${E}^2} ${approx(num, 6)} \\dfrac{${texNum(num, 6)}}{${texNum(den, 8)}} ${approx(n0, 2)} ${texNum(n0, 2)}`],
          [T("Arredonde sempre para cima: para baixo, a margem de erro ficaria maior que a pedida.", "Always round up: rounding down would leave the margin of error larger than requested."),
            `n_0 = ${tone(texNum(n), 1)}`],
        ],
        note: T(`Com ${fmt(n)} indivíduos, a proporção é estimada com margem de ±${fmt(e, 2)} pontos percentuais e ${fmt(conf, 2)}% de confiança, numa população grande.`
          + ` Se a população for pequena, a amostra pode ser menor: <a href="${PAGE("correcao-populacao-finita")}?n0=${n}">aplique a correção para população finita</a>.`,
          `With ${fmt(n)} people, the proportion is estimated within ±${fmt(e, 2)} percentage points at ${fmt(conf, 2)}% confidence, in a large population.`
          + ` If the population is small, the sample can be smaller: <a href="${PAGE("correcao-populacao-finita")}?n0=${n}">apply the finite population correction</a>.`),
      };
    },

    // Margem de erro de uma proporção (intervalo de Wald), com a correção para
    // população finita quando N é informado. A cobertura sai exata: soma a
    // probabilidade de cada contagem possível k cujo intervalo contém o p real
    // (binomial sem N, hipergeométrica com N, que é amostragem sem reposição).
    margem({ n, p, conf, N }) {
      if (!Number.isInteger(n) || n < 2) return { error: T("O tamanho da amostra precisa ser um inteiro maior ou igual a 2.", "The sample size must be an integer of at least 2.") };
      if (n > 1e6) return { error: T("Use n de no máximo 1.000.000.", "Use n of at most 1,000,000.") };
      if (p <= 0 || p >= 100) return { error: T("A proporção precisa estar entre 0 e 100%, sem os extremos.", "The proportion must be strictly between 0 and 100%.") };
      if (conf <= 0 || conf >= 100) return confError;
      if (N !== null && (!Number.isInteger(N) || N <= n)) return { error: T("A população precisa ser um inteiro maior que a amostra, ou ficar em branco.", "The population must be an integer larger than the sample, or left blank.") };
      const z = zCrit(conf);
      const ph = p / 100;
      const se = Math.sqrt(ph * (1 - ph) / n);
      const f = N === null ? 1 : Math.sqrt((N - n) / (N - 1));
      const e = z * se * f;
      const Z = tone(texNum(z), 2), P = tone(texNum(ph, 6), 3), NN = tone(texNum(n), 3);
      const pp = x => `${fmt(x * 100, 2)}`;
      const confTxt = `${fmt(conf, 2)}%`;

      // Distribuição de k, a contagem de "sim" na amostra, quando o p real é p̂.
      // Só a faixa de ±12 desvios importa; fora dela a probabilidade é nula.
      const K = N === null ? null : Math.round(ph * N);
      const truth = N === null ? ph : K / N;
      const lc = (a, b) => lgamma(a + 1) - lgamma(b + 1) - lgamma(a - b + 1);
      const sd = Math.sqrt(n * truth * (1 - truth)) * f;
      let k0 = Math.max(0, Math.floor(n * truth - 12 * sd - 1)), k1 = Math.min(n, Math.ceil(n * truth + 12 * sd + 1));
      if (K !== null) { k0 = Math.max(k0, n - (N - K)); k1 = Math.min(k1, K); }
      const pmf = [];
      for (let k = k0; k <= k1; k++) {
        pmf.push(K === null ? binPmf(n, truth, k) : Math.exp(lc(K, k) + lc(N - K, n - k) - lc(N, n)));
      }
      const tot = pmf.reduce((a, b) => a + b, 0);
      const ivl = k => { const q = k / n, h = z * Math.sqrt(q * (1 - q) / n) * f; return [q - h, q + h]; };
      let cover = 0;
      pmf.forEach((w, i) => { const [lo, hi] = ivl(k0 + i); if (lo <= truth && truth <= hi) cover += w; });
      cover /= tot;

      // 100 pesquisas sorteadas pela inversa da acumulada.
      const cdf = [];
      pmf.reduce((acc, w, i) => (cdf[i] = acc + w / tot), 0);
      const rand = rng(n * 7919 + Math.round(p * 100) * 104729 + Math.round(conf * 100) + (N || 0));
      const draw = () => {
        const u = rand();
        let a = 0, b = cdf.length - 1;
        while (a < b) { const m = (a + b) >> 1; if (cdf[m] < u) a = m + 1; else b = m; }
        return k0 + a;
      };
      const rows = Array.from({ length: 100 }, () => {
        const k = draw(), [lo, hi] = ivl(k);
        return { lo, hi, mid: k / n, hit: lo <= truth && truth <= hi };
      });
      const misses = rows.filter(r => !r.hit).length;
      const span = Math.max(...rows.map(r => Math.max(truth - r.lo, r.hi - truth)));

      const steps = [
        [T(`Encontre o valor crítico para ${confTxt} de confiança, como na tabela Z:`, `Find the critical value for ${confTxt} confidence, as in the Z table:`), `z_{\\alpha/2} \\approx ${Z}`],
        [T("Calcule o erro padrão da proporção:", "Compute the standard error of the proportion:"),
          `\\sqrt{\\dfrac{${P} \\cdot (1 - ${texNum(ph, 6)})}{${NN}}} ${approx(se, 6)} ${tone(texNum(se, 6), 3)}`],
      ];
      if (N !== null) {
        steps.push([T(`A amostra é ${fmt(n / N * 100, 2)}% da população; calcule o fator de correção:`, `The sample is ${fmt(n / N * 100, 2)}% of the population; compute the correction factor:`),
          `\\sqrt{\\dfrac{${texNum(N)} - ${texNum(n)}}{${texNum(N)} - 1}} ${approx(f, 6)} ${tone(texNum(f, 6), 4)}`]);
      }
      steps.push([T("Multiplique tudo:", "Multiply everything:"),
        `E = ${Z} \\cdot ${tone(texNum(se, 6), 3)}${N !== null ? ` \\cdot ${tone(texNum(f, 6), 4)}` : ""} ${approx(e, 6)} ${tone(texNum(e, 6), 1)}`]);
      steps.push([T("Em pontos percentuais, o intervalo é p̂ ± E:", "In percentage points, the interval is p̂ ± E:"),
        `${texNum(ph * 100, 2)}\\% \\pm ${tone(`${texNum(e * 100, 2)}`, 1)} ${approx(e * 100, 2)} \\left[\\,${texNum(ph * 100 - e * 100, 2)}${T("\\,;", ",")}\\ ${texNum(ph * 100 + e * 100, 2)}\\,\\right]`]);

      const gap = Math.abs(cover * 100 - conf);
      let note = T(`Com ${fmt(n)} entrevistas, a margem é de ±${pp(e)} pontos percentuais com ${confTxt} de confiança.`,
        `With ${fmt(n)} interviews, the margin is ±${pp(e)} percentage points at ${confTxt} confidence.`);
      note += T(` No gráfico, 100 pesquisas sorteadas de uma população em que o p real é ${pp(truth)}%: ${misses} ${misses === 1 ? "intervalo não o contém" : "intervalos não o contêm"}.`,
        ` The chart shows 100 polls drawn from a population whose true p is ${pp(truth)}%: ${misses} interval${misses === 1 ? " misses" : "s miss"} it.`);
      note += T(` Somando todos os resultados possíveis, a cobertura exata é ${fmt(cover * 100, 2)}%`,
        ` Adding up every possible outcome, the exact coverage is ${fmt(cover * 100, 2)}%`)
        + (gap >= 0.1
          ? T(`, não ${confTxt}: a fórmula usa a aproximação normal e um z arredondado, e a contagem k só anda de 1 em 1.`, `, not ${confTxt}: the formula relies on the normal approximation and a rounded z, and the count k moves in steps of 1.`)
          : ".");
      if (n * Math.min(ph, 1 - ph) < 10) note += ` ${warn} ${T("com menos de 10 casos esperados de um dos lados, a aproximação normal falha e a cobertura pode ficar bem abaixo do nominal.", "with fewer than 10 expected cases on one side, the normal approximation breaks down and coverage can fall well below nominal.")}`;
      note += T(` Para o caminho inverso, da margem para o tamanho da amostra, use a <a href="${PAGE("cochran-formula")}?conf=${conf}&amp;p=${p}&amp;e=${(e * 100).toFixed(2)}">fórmula de Cochran</a>.`,
        ` For the reverse, from the margin to the sample size, use <a href="${PAGE("cochran-formula")}?conf=${conf}&amp;p=${p}&amp;e=${(e * 100).toFixed(2)}">Cochran's formula</a>.`);

      return {
        result: `E ${approx(e * 100, 2)} \\pm ${tone(texNum(e * 100, 2), 1)} \\text{ p.p.}`,
        chart: {
          type: "intervals", height: 330,
          label: T(`100 intervalos de confiança de ${confTxt} de pesquisas sorteadas; ${misses} não contêm o p real de ${pp(truth)}%`,
            `100 ${confTxt} confidence intervals from simulated polls; ${misses} miss the true p of ${pp(truth)}%`),
          xLabel: T("proporção (%)", "proportion (%)"),
          xMin: (truth - span * 1.1) * 100, xMax: (truth + span * 1.1) * 100, truth: truth * 100,
          rows: rows.map(r => ({ lo: r.lo * 100, hi: r.hi * 100, mid: r.mid * 100, hit: r.hit })),
          tip: (r, i) => [`${fmt(r.lo, 2)}% – ${fmt(r.hi, 2)}%`,
            T(`pesquisa ${i + 1}: p̂ = ${fmt(r.mid, 2)}%${r.hit ? "" : ", erra o p real"}`, `poll ${i + 1}: p̂ = ${fmt(r.mid, 2)}%${r.hit ? "" : ", misses the true p"}`)],
        },
        steps,
        note,
      };
    },

    fpc({ n0, N }) {
      if (n0 < 1) return { error: T("A amostra inicial precisa ser de pelo menos 1.", "The initial sample must be at least 1.") };
      if (!Number.isInteger(N) || N < 1) return { error: T("O tamanho da população precisa ser um inteiro positivo.", "The population size must be a positive integer.") };
      const frac = (n0 - 1) / N, den = 1 + frac;
      const n = n0 / den, nr = ceilInt(n);
      const N0 = tone(texNum(n0), 2), NN = tone(texNum(N), 4);
      const red = (1 - nr / ceilInt(n0)) * 100;
      const share = n0 / N * 100;

      let note = T(`Numa população de ${fmt(N)}, bastam ${fmt(nr)} em vez de ${fmt(ceilInt(n0))}`, `In a population of ${fmt(N)}, ${fmt(nr)} are enough instead of ${fmt(ceilInt(n0))}`);
      note += red >= 1 ? T(`: ${fmt(red, 0)}% a menos.`, `: ${fmt(red, 0)}% fewer.`) : T(", praticamente o mesmo.", ", practically the same.");
      note += share > 5
        ? T(` A amostra inicial é ${fmt(share, 1)}% da população, e acima de 5% a correção costuma fazer diferença.`, ` The initial sample is ${fmt(share, 1)}% of the population, and above 5% the correction usually matters.`)
        : T(` A amostra inicial é só ${fmt(share, 1)}% da população; abaixo de 5%, a correção pouco muda.`, ` The initial sample is only ${fmt(share, 1)}% of the population; below 5%, the correction changes little.`);

      return {
        result: `n = ${tone(texNum(nr), 1)}`,
        steps: [
          [T("Substitua na fórmula:", "Plug into the formula:"), `n = \\dfrac{${N0}}{1 + \\dfrac{${tone(`(${texNum(n0)} - 1)`, 3)}}{${NN}}}`],
          [T("Calcule a fração do denominador:", "Compute the fraction in the denominator:"),
            `\\dfrac{${tone(texNum(n0 - 1), 3)}}{${NN}} ${approx(frac, 6)} ${texNum(frac, 6)}`],
          [T("Some 1:", "Add 1:"), `1 + ${texNum(frac, 6)} ${approx(den, 6)} ${texNum(den, 6)}`],
          [T("Divida e arredonde para cima:", "Divide and round up:"),
            `n = \\dfrac{${N0}}{${texNum(den, 6)}} ${approx(n, 2)} ${texNum(n, 2)} \\;\\Rightarrow\\; n = ${tone(texNum(nr), 1)}`],
        ],
        note,
      };
    },

    neyman({ n, Nh, sh }) {
      const k = Nh.length;
      if (!Number.isInteger(n) || n < 1) return { error: T("A amostra total precisa ser um inteiro positivo.", "The total sample must be a positive integer.") };
      if (k < 2) return { error: T("Informe o tamanho de pelo menos dois estratos.", "Enter the size of at least two strata.") };
      if (sh.length !== k) return { error: T(`Há ${k} tamanhos de estrato e ${sh.length} desvios padrão; as listas precisam ter o mesmo tamanho.`, `There are ${k} stratum sizes and ${sh.length} standard deviations; the lists must have the same length.`) };
      if (k > 30) return { error: T("Use no máximo 30 estratos.", "Use at most 30 strata.") };
      if (Nh.some(x => x <= 0)) return { error: T("O tamanho de cada estrato precisa ser maior que zero.", "Each stratum size must be greater than zero.") };
      if (sh.some(x => x < 0)) return { error: T("Os desvios padrão não podem ser negativos.", "Standard deviations cannot be negative.") };
      const prods = Nh.map((x, i) => x * sh[i]);
      const sum = prods.reduce((s, x) => s + x, 0);
      if (sum <= 0) return { error: T("Pelo menos um estrato precisa ter desvio padrão maior que zero.", "At least one stratum must have a standard deviation greater than zero.") };
      const totalN = Nh.reduce((s, x) => s + x, 0);
      if (n > totalN) return { error: T(`A amostra total (${fmt(n)}) é maior que a população (${fmt(totalN)}).`, `The total sample (${fmt(n)}) is larger than the population (${fmt(totalN)}).`) };

      const ney = apportion(n, prods);
      const prop = apportion(n, Nh);
      const sumTex = texNum(sum);

      const t1 = `\\begin{array}{c|c|c|r} h & N_h & \\sigma_h & N_h \\cdot \\sigma_h \\\\ \\hline `
        + Nh.map((x, i) => `${i + 1} & ${tone(texNum(x), 3)} & ${tone(texNum(sh[i]), 5)} & ${texNum(prods[i])}`).join(" \\\\ ")
        + ` \\end{array}`;
      const sumLine = k <= 6
        ? `\\textstyle\\sum (N_h \\cdot \\sigma_h) = ${prods.map(x => texNum(x)).join(" + ")} = ${tone(sumTex, 4)}`
        : `\\textstyle\\sum (N_h \\cdot \\sigma_h) = ${tone(sumTex, 4)}`;
      const t2 = `\\def\\arraystretch{2.4}\\begin{array}{c|l|c} h & n_h = n \\cdot N_h\\sigma_h / \\Sigma & \\text{${T("arredondado", "rounded")}} \\\\ \\hline `
        + prods.map((x, i) =>
          `${i + 1} & ${tone(texNum(n), 2)} \\cdot \\dfrac{${texNum(x)}}{${tone(sumTex, 4)}} ${approx(ney.exact[i], 2)} ${texNum(ney.exact[i], 2)} & ${tone(texNum(ney.out[i]), 1)}`
        ).join(" \\\\ ")
        + ` \\end{array}`;

      const over = ney.out.map((x, i) => x > Nh[i] ? i + 1 : 0).filter(Boolean);
      let note = T(`Na alocação proporcional, que olha só o tamanho dos estratos, seriam ${list(prop.out.map(x => fmt(x)))}.`
        + " A de Neyman desloca a amostra para os estratos onde a variável varia mais, o que dá a menor variância para a média estimada com o mesmo n."
        + " Os arredondamentos usam o método dos maiores restos, para que a soma dê exatamente n.",
        `Proportional allocation, which looks only at stratum size, would give ${list(prop.out.map(x => fmt(x)))}.`
        + " Neyman's shifts the sample toward the strata where the variable varies most, which gives the smallest variance for the estimated mean with the same n."
        + " Rounding uses the largest remainder method, so the parts add up to exactly n.");
      if (over.length) {
        note += T(` ${warn} no estrato ${list(over.map(String))}, a alocação passa do tamanho do próprio estrato.`
          + " Nesse caso, entreviste o estrato inteiro e redistribua o restante entre os outros.",
          ` ${warn} in stratum ${list(over.map(String))}, the allocation exceeds the stratum's own size.`
          + " In that case, survey the whole stratum and spread the rest among the others.");
      }

      return {
        result: `n_h = ${tone(ney.out.map(x => texNum(x)).join(",\\ "), 1)}`,
        steps: [
          [T("Multiplique o tamanho de cada estrato pelo seu desvio padrão:", "Multiply each stratum's size by its standard deviation:"), t1],
          [T("Some os produtos:", "Add up the products:"), sumLine],
          [T("Divida a amostra total na proporção de cada produto e arredonde:", "Split the total sample in proportion to each product and round:"), t2],
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
        [`\\text{${T("produto", "product")}}`, i => texNum(d.prod[i]), tone(texNum(d.sxy), 2)],
      ]);
      const sinal = Math.abs(cov) < 1e-12
        ? T("A covariância é zero: não há tendência linear entre x e y.", "The covariance is zero: there is no linear trend between x and y.")
        : cov > 0
          ? T("A covariância é positiva: quando x está acima da média, y também tende a estar.", "The covariance is positive: when x is above its mean, y tends to be too.")
          : T("A covariância é negativa: quando x está acima da média, y tende a ficar abaixo.", "The covariance is negative: when x is above its mean, y tends to be below.");
      return {
        result: `Cov(X,Y) ${approx(cov)} ${tone(texNum(cov), 1)}`,
        steps: [
          d.meansStep,
          [T("Calcule os desvios de cada valor em relação à média e multiplique os pares:", "Compute each value's deviation from the mean and multiply the pairs:"), table],
          [T("Divida a soma dos produtos pelo número de pares:", "Divide the sum of the products by the number of pairs:"),
            `Cov(X,Y) = \\dfrac{${tone(texNum(d.sxy), 2)}}{${tone(d.n, 4)}} ${approx(cov)} ${tone(texNum(cov), 1)}`],
        ],
        note: sinal + T(` O tamanho do número, porém, depende das unidades de x e de y e não diz se a relação é forte;`
          + ` para isso existe o <a href="${d.link(PAGE("coeficiente-pearson"))}">coeficiente de Pearson, com estes mesmos dados</a>.`
          + ` Esta fórmula divide por n (covariância populacional); a amostral divide por n − 1 e daria ${fmt(d.sxy / (d.n - 1))}.`,
          ` Its size, though, depends on the units of x and y and doesn't say whether the relationship is strong;`
          + ` that is what the <a href="${d.link(PAGE("coeficiente-pearson"))}">Pearson coefficient, with these same data</a>, is for.`
          + ` This formula divides by n (population covariance); the sample version divides by n − 1 and would give ${fmt(d.sxy / (d.n - 1))}.`),
      };
    },

    pearson({ x, y }) {
      const d = paired(x, y, v => `\\mu_${v}`);
      if (d.error) return d;
      if (d.sxx === 0) return { error: T("Todos os valores de x são iguais: o desvio padrão de x é zero e r não é definido.", "All values of x are equal: the standard deviation of x is zero and r is undefined.") };
      if (d.syy === 0) return { error: T("Todos os valores de y são iguais: o desvio padrão de y é zero e r não é definido.", "All values of y are equal: the standard deviation of y is zero and r is undefined.") };
      const cov = d.sxy / d.n, sx = Math.sqrt(d.sxx / d.n), sy = Math.sqrt(d.syy / d.n);
      const r = Math.max(-1, Math.min(1, cov / (sx * sy)));
      const table = d.table([
        ["i", i => i + 1, "\\Sigma"],
        ["x_i - \\mu_x", i => texNum(d.dx[i])],
        ["y_i - \\mu_y", i => texNum(d.dy[i])],
        [`\\text{${T("produto", "product")}}`, i => texNum(d.prod[i]), texNum(d.sxy)],
        ["(x_i - \\mu_x)^2", i => texNum(d.dx[i] ** 2), texNum(d.sxx)],
        ["(y_i - \\mu_y)^2", i => texNum(d.dy[i] ** 2), texNum(d.syy)],
      ]);
      const a = Math.abs(r);
      const forca = a >= 0.9 ? T("muito forte", "very strong") : a >= 0.7 ? T("forte", "strong") : a >= 0.5 ? T("moderada", "moderate") : a >= 0.3 ? T("fraca", "weak") : T("muito fraca ou inexistente", "very weak or absent");
      const direcao = a < 0.3 ? "" : r > 0 ? T(" e positiva", ", positive") : T(" e negativa", ", negative");
      return {
        result: `r_{xy} ${approx(r)} ${tone(texNum(r), 1)}`,
        steps: [
          d.meansStep,
          [T("Calcule os desvios, seus produtos e seus quadrados:", "Compute the deviations, their products and their squares:"), table],
          [T("Divida as somas por n para obter a covariância e os desvios padrão:", "Divide the sums by n to get the covariance and the standard deviations:"),
            `Cov(X,Y) = \\dfrac{${texNum(d.sxy)}}{${d.n}} ${approx(cov)} ${tone(texNum(cov), 2)}, \\quad `
            + `\\sigma_x = \\sqrt{\\dfrac{${texNum(d.sxx)}}{${d.n}}} ${approx(sx)} ${tone(texNum(sx), 3)}, \\quad `
            + `\\sigma_y = \\sqrt{\\dfrac{${texNum(d.syy)}}{${d.n}}} ${approx(sy)} ${tone(texNum(sy), 4)}`],
          [T("Divida a covariância pelo produto dos desvios padrão:", "Divide the covariance by the product of the standard deviations:"),
            `r_{xy} = \\dfrac{${tone(texNum(cov), 2)}}{${tone(texNum(sx), 3)} \\cdot ${tone(texNum(sy), 4)}} ${approx(r)} ${tone(texNum(r), 1)}`],
        ],
        note: T(`Correlação ${forca}${direcao}. O quadrado, r² ${approx(r * r * 100, 1) === "=" ? "=" : "≈"} ${fmt(r * r * 100, 1)}%, é a fração da variação de y que acompanha x numa reta.`
          + " Lembre que r só mede relação <em>linear</em> e que correlação não prova causa."
          + ` Para a reta em si, veja a <a href="${d.link(PAGE("regressao-linear"))}">regressão linear com estes mesmos dados</a>.`,
          `${forca[0].toUpperCase() + forca.slice(1)}${direcao} correlation. Its square, r² ${approx(r * r * 100, 1) === "=" ? "=" : "≈"} ${fmt(r * r * 100, 1)}%, is the share of the variation in y that follows x along a line.`
          + " Remember that r only measures <em>linear</em> relationships, and correlation does not prove causation."
          + ` For the line itself, see the <a href="${d.link(PAGE("regressao-linear"))}">linear regression with these same data</a>.`),
      };
    },

    reg({ x, y, x0 }) {
      const d = paired(x, y, v => `\\bar{${v}}`);
      if (d.error) return d;
      if (d.sxx === 0) return { error: T("Todos os valores de x são iguais: não há como traçar uma reta que dependa de x.", "All values of x are equal: no line can depend on x.") };
      if (x0.length > 1) return { error: T("Informe um único valor de x para a previsão, ou deixe o campo vazio.", "Enter a single x for the prediction, or leave the field empty.") };
      const b1 = d.sxy / d.sxx, b0 = d.my - b1 * d.mx;
      const B0 = tone(texNum(b0), 2), B1 = tone(texNum(b1), 3);
      const line = `\\hat{y} = ${B0} ${b1 < 0 ? "-" : "+"} ${tone(texNum(Math.abs(b1)), 3)}\\,${tone("x", 4)}`;
      const table = d.table([
        ["i", i => i + 1, "\\Sigma"],
        ["x_i - \\bar{x}", i => texNum(d.dx[i])],
        ["y_i - \\bar{y}", i => texNum(d.dy[i])],
        [`\\text{${T("produto", "product")}}`, i => texNum(d.prod[i]), texNum(d.sxy)],
        ["(x_i - \\bar{x})^2", i => texNum(d.dx[i] ** 2), texNum(d.sxx)],
      ]);
      const steps = [
        d.meansStep,
        [T("Calcule os desvios, seus produtos e os quadrados dos desvios de x:", "Compute the deviations, their products and the squared deviations of x:"), table],
        [T("A inclinação é a soma dos produtos dividida pela soma dos quadrados:", "The slope is the sum of the products divided by the sum of the squares:"),
          `\\beta_1 = \\dfrac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2} = \\dfrac{${texNum(d.sxy)}}{${texNum(d.sxx)}} ${approx(b1)} ${B1}`],
        [T("O intercepto faz a reta passar pelo ponto das médias:", "The intercept makes the line pass through the point of the means:"),
          `\\beta_0 = \\bar{y} - \\beta_1 \\bar{x} = ${texNum(d.my)} - ${paren(b1, texNum(b1))} \\cdot ${paren(d.mx, texNum(d.mx))} ${approx(b0)} ${B0}`],
      ];
      let note = T(`Cada unidade a mais de x ${b1 >= 0 ? "soma" : "tira"} ${fmt(Math.abs(b1))} ao valor previsto de y.`, `Each extra unit of x ${b1 >= 0 ? "adds" : "subtracts"} ${fmt(Math.abs(b1))} ${b1 >= 0 ? "to" : "from"} the predicted y.`);
      if (x0.length) {
        const v = x0[0], yh = b0 + b1 * v;
        steps.push([T("Substitua o x desejado na reta:", "Plug the chosen x into the line:"),
          `\\hat{y} = ${B0} ${b1 < 0 ? "-" : "+"} ${tone(texNum(Math.abs(b1)), 3)} \\cdot ${tone(paren(v, texNum(v)), 4)} ${approx(yh)} ${tone(texNum(yh), 1)}`]);
        note += T(` Para x = ${fmt(v)}, a previsão é ${fmt(yh)}.`, ` For x = ${fmt(v)}, the prediction is ${fmt(yh)}.`);
        const lo = Math.min(...x), hi = Math.max(...x);
        if (v < lo || v > hi) {
          note += T(` ${warn} ${fmt(v)} está fora da faixa observada (${fmt(lo)} a ${fmt(hi)}). Extrapolar supõe que a reta continua valendo além dos dados, o que pode não ser verdade.`,
            ` ${warn} ${fmt(v)} is outside the observed range (${fmt(lo)} to ${fmt(hi)}). Extrapolating assumes the line keeps holding beyond the data, which may not be true.`);
        }
      }
      return { result: line, steps, note };
    },

    harm({ x }) {
      const n = x.length;
      if (n < 2) return { error: T("Informe pelo menos dois valores.", "Enter at least two values.") };
      if (n > 200) return { error: T("Use no máximo 200 valores.", "Use at most 200 values.") };
      if (x.some(v => v <= 0)) return { error: T("A média harmônica só faz sentido para valores positivos.", "The harmonic mean only makes sense for positive values.") };
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
          [T("Some os recíprocos (1 dividido por cada valor):", "Add up the reciprocals (1 divided by each value):"), recLine],
          [T("Divida o número de valores por essa soma:", "Divide the number of values by that sum:"),
            `H = \\dfrac{${tone(n, 2)}}{${S}} ${approx(h)} ${tone(texNum(h), 1)}`],
        ],
        note: T(`A média aritmética dos mesmos valores seria ${fmt(arith)}; a harmônica é sempre menor ou igual a ela.`
          + " É a média certa quando os valores são taxas sobre uma mesma quantidade, como velocidades num mesmo trecho:"
          + " o trecho feito mais devagar leva mais tempo e pesa mais no resultado.",
          `The arithmetic mean of the same values would be ${fmt(arith)}; the harmonic mean is always less than or equal to it.`
          + " It is the right average when the values are rates over the same quantity, such as speeds over the same distance:"
          + " the slower leg takes longer and weighs more in the result."),
      };
    },

    quad({ a, b, c }) {
      if (a === 0) {
        return { error: b === 0
          ? T("Com a = 0 e b = 0, não há equação em x.", "With a = 0 and b = 0, there is no equation in x.")
          : T(`Com a = 0 a equação é de primeiro grau, e a solução é x = −c/b = ${fmt(-c / b)}.`, `With a = 0 the equation is linear, and the solution is x = −c/b = ${fmt(-c / b)}.`) };
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
        [T("Identifique os coeficientes da equação:", "Identify the coefficients of the equation:"), `${poly} \\quad\\Rightarrow\\quad a = ${A},\\; b = ${B},\\; c = ${C}`],
        [T("Calcule o discriminante:", "Compute the discriminant:"),
          `\\Delta = b^2 - 4ac = ${B}^2 - 4 \\cdot ${A} \\cdot ${C} ${approx(delta)} ${D}`],
      ];
      let result, note;
      if (Math.abs(delta) < 1e-12) {
        const x = -b / twoA;
        steps.push([T("Com Δ = 0, a raiz quadrada some e sobra uma única raiz (dupla):", "With Δ = 0, the square root vanishes and a single (double) root remains:"),
          `x = \\dfrac{-b}{2a} = \\dfrac{${MB}}{${TA}} ${approx(x)} ${tone(texNum(x), 1)}`]);
        result = `x ${approx(x)} ${tone(texNum(x), 1)}`;
        note = T("Raiz dupla: a parábola toca o eixo x num único ponto, o vértice.", "Double root: the parabola touches the x-axis at a single point, its vertex.");
      } else if (delta > 0) {
        const r = Math.sqrt(delta);
        const x1 = (-b + r) / twoA, x2 = (-b - r) / twoA;
        const R = tone(texNum(r), 3);
        steps.push([T("Tire a raiz do discriminante:", "Take the square root of the discriminant:"), `\\sqrt{\\Delta} = \\sqrt{${D}} ${approx(r)} ${R}`]);
        steps.push([T("Aplique a fórmula, uma vez com + e outra com −:", "Apply the formula, once with + and once with −:"),
          `x = \\dfrac{${MB} ${PM} ${R}}{${TA}} \\quad\\Rightarrow\\quad `
          + `x_1 = \\dfrac{${texNum(-b)} + ${texNum(r)}}{${texNum(twoA)}} ${approx(x1)} ${tone(texNum(x1), 1)}, \\quad `
          + `x_2 = \\dfrac{${texNum(-b)} - ${texNum(r)}}{${texNum(twoA)}} ${approx(x2)} ${tone(texNum(x2), 1)}`]);
        result = `x_1 ${approx(x1)} ${tone(texNum(x1), 1)}, \\quad x_2 ${approx(x2)} ${tone(texNum(x2), 1)}`;
        note = T(`Duas raízes reais: a parábola cruza o eixo x em ${fmt(x2 < x1 ? x2 : x1)} e ${fmt(x2 < x1 ? x1 : x2)}.`
          + ` Para conferir, a soma das raízes é −b/a = ${fmt(-b / a)} e o produto é c/a = ${fmt(c / a)}.`,
          `Two real roots: the parabola crosses the x-axis at ${fmt(x2 < x1 ? x2 : x1)} and ${fmt(x2 < x1 ? x1 : x2)}.`
          + ` To check, the sum of the roots is −b/a = ${fmt(-b / a)} and the product is c/a = ${fmt(c / a)}.`);
      } else {
        const re = -b / twoA, im = Math.abs(Math.sqrt(-delta) / twoA);
        const R = tone(`${texNum(Math.sqrt(-delta))}\\,i`, 3);
        steps.push([T("Com Δ < 0, a raiz é imaginária: √Δ = i·√|Δ|.", "With Δ < 0, the root is imaginary: √Δ = i·√|Δ|."),
          `\\sqrt{\\Delta} = \\sqrt{${D}} ${approx(Math.sqrt(-delta))} ${R}`]);
        steps.push([T("Aplique a fórmula e separe a parte real da imaginária:", "Apply the formula and split the real and imaginary parts:"),
          `x = \\dfrac{${MB} ${PM} ${R}}{${TA}} ${approx(re) === "=" && approx(im) === "=" ? "=" : "\\approx"} ${tone(`${texNum(re)} \\pm ${texNum(im)}\\,i`, 1)}`]);
        result = `x ${approx(re) === "=" && approx(im) === "=" ? "=" : "\\approx"} ${tone(`${texNum(re)} \\pm ${texNum(im)}\\,i`, 1)}`;
        note = T("Sem raízes reais: a parábola não cruza o eixo x. As duas raízes são complexas conjugadas.", "No real roots: the parabola does not cross the x-axis. The two roots are complex conjugates.");
      }
      return { result, steps, note };
    },

    bayes({ pa, pba, pbna }) {
      if ([pa, pba, pbna].some(v => v < 0 || v > 100)) return probRange;
      const a = pa / 100, ba = pba / 100, bna = pbna / 100, na = 1 - a;
      const joint = ba * a, other = bna * na, pb = joint + other;
      if (pb === 0) return { error: T("Com esses valores B nunca acontece (P(B) = 0), e P(A|B) não é definida.", "With these values B never happens (P(B) = 0), so P(A|B) is undefined.") };
      const post = joint / pb;
      const n6 = v => texNum(v, 6);
      const A = tone(n6(a), 3), BA = tone(n6(ba), 2), BNA = tone(n6(bna), 4), PB = tone(n6(pb), 4);
      const pct = v => `${texNum(v * 100, 2)}\\%`;

      // Frequências naturais: uma população grande o bastante para que os
      // verdadeiros positivos não arredondem para zero.
      const N = 10 ** Math.min(9, Math.max(4, Math.ceil(-Math.log10(a || 1)) + 2));
      const sick = Math.round(N * a), tp = Math.round(sick * ba);
      const healthy = N - sick, fp = Math.round(healthy * bna), pos = tp + fp;
      let note = T(`Em frequências: de ${fmt(N)} pessoas, ${fmt(sick)} têm A e ${fmt(tp)} delas dão B;`
        + ` das ${fmt(healthy)} sem A, ${fmt(fp)} dão B mesmo assim.`
        + (pos ? ` Dos ${fmt(pos)} casos de B, só ${fmt(tp)} têm A, ou ${fmt(tp / pos * 100, 1)}%.` : ""),
        `In frequencies: out of ${fmt(N)} people, ${fmt(sick)} have A and ${fmt(tp)} of them show B;`
        + ` of the ${fmt(healthy)} without A, ${fmt(fp)} show B anyway.`
        + (pos ? ` Of the ${fmt(pos)} cases of B, only ${fmt(tp)} have A, or ${fmt(tp / pos * 100, 1)}%.` : ""));
      if (post < 0.5 && ba > 0.5) {
        note += T(" O resultado baixo vem de A ser rara: mesmo uma taxa pequena de falsos positivos, aplicada a muita gente sem A, supera os verdadeiros positivos.",
          " The low result comes from A being rare: even a small false positive rate, applied to many people without A, outnumbers the true positives.");
      }

      return {
        result: `P(A\\mid B) ${approx(post, 6)} ${tone(pct(post), 1)}`,
        steps: [
          [T("Escreva as porcentagens como probabilidades e calcule o complemento do prior:", "Write the percentages as probabilities and compute the complement of the prior:"),
            `P(A) = ${A}, \\quad P(B\\mid A) = ${BA}, \\quad P(B\\mid \\neg A) = ${BNA}, \\quad P(\\neg A) = 1 - ${n6(a)} = ${n6(na)}`],
          [T("Calcule a evidência P(B) pela lei da probabilidade total:", "Compute the evidence P(B) with the law of total probability:"),
            `P(B) = P(B\\mid A)\\,P(A) + P(B\\mid \\neg A)\\,P(\\neg A) = ${BA} \\cdot ${A} + ${BNA} \\cdot ${n6(na)} ${approx(pb, 6)} ${n6(joint)} + ${n6(other)} ${approx(pb, 6)} ${PB}`],
          [T("Aplique o teorema de Bayes:", "Apply Bayes' theorem:"),
            `P(A\\mid B) = \\dfrac{${BA} \\cdot ${A}}{${PB}} ${approx(joint, 6)} \\dfrac{${n6(joint)}}{${n6(pb)}} ${approx(post, 6)} ${tone(n6(post), 1)} ${approx(post * 100, 2)} ${tone(pct(post), 1)}`],
        ],
        note,
      };
    },

    cond({ N, nb, nab }) {
      if ([N, nb, nab].some(v => !Number.isInteger(v) || v < 0)) return { error: T("Use contagens inteiras e não negativas.", "Use non-negative whole counts.") };
      if (nb === 0) return { error: T("Sem nenhum caso de B, não há como condicionar em B.", "With no cases of B, there is nothing to condition on.") };
      if (nb > N) return { error: T("Os casos de B não podem passar do total.", "Cases of B cannot exceed the total.") };
      if (nab > nb) return { error: T("Os casos de A e B juntos não podem passar dos casos de B.", "Cases of A and B together cannot exceed the cases of B.") };
      const pab = nab / N, pb = nb / N, c = nab / nb;
      const n6 = v => texNum(v, 6);
      return {
        result: `P(A\\mid B) ${approx(c, 6)} ${tone(`${texNum(c * 100, 2)}\\%`, 1)}`,
        steps: [
          [T("Transforme as contagens em probabilidades, dividindo pelo total:", "Turn the counts into probabilities by dividing by the total:"),
            `P(A \\cap B) = \\dfrac{${nab}}{${N}} ${approx(pab, 6)} ${tone(n6(pab), 2)}, \\qquad P(B) = \\dfrac{${nb}}{${N}} ${approx(pb, 6)} ${tone(n6(pb), 4)}`],
          [T("Divida a interseção pela probabilidade de B:", "Divide the intersection by the probability of B:"),
            `P(A\\mid B) = \\dfrac{${tone(n6(pab), 2)}}{${tone(n6(pb), 4)}} ${approx(c, 6)} ${tone(n6(c), 1)}`],
          [T("Repare que o total se cancela: dá o mesmo dividir as contagens direto.", "Notice the total cancels out: dividing the counts directly gives the same result."),
            `P(A\\mid B) = \\dfrac{${tone(nab, 2)}}{${tone(nb, 4)}} ${approx(c, 6)} ${tone(n6(c), 1)}`],
        ],
        note: T(`Condicionar em B é trocar o universo: em vez dos ${fmt(N)} casos, só contam os ${fmt(nb)} em que B aconteceu, e entre eles A aparece ${fmt(nab)} vezes.`
          + ` Sem a condição, a chance de A e B juntos seria só ${fmt(pab * 100, 2)}%.`,
          `Conditioning on B changes the universe: instead of all ${fmt(N)} cases, only the ${fmt(nb)} where B happened count, and among them A appears ${fmt(nab)} times.`
          + ` Without the condition, the chance of A and B together would be only ${fmt(pab * 100, 2)}%.`),
      };
    },

    total({ pa, pb }) {
      const k = pa.length;
      if (k < 2) return { error: T("Informe pelo menos dois cenários.", "Enter at least two scenarios.") };
      if (pb.length !== k) return { error: T(`Há ${k} cenários e ${pb.length} probabilidades de B; as listas precisam ter o mesmo tamanho.`, `There are ${k} scenarios and ${pb.length} probabilities of B; the lists must have the same length.`) };
      if (k > 30) return { error: T("Use no máximo 30 cenários.", "Use at most 30 scenarios.") };
      if ([...pa, ...pb].some(v => v < 0 || v > 100)) return probRange;
      const sumA = pa.reduce((s, v) => s + v, 0);
      if (Math.abs(sumA - 100) > 0.01) return { error: T(`Os cenários somam ${fmt(sumA, 2)}%, e precisam somar 100%: juntos, eles cobrem todos os casos.`, `The scenarios add up to ${fmt(sumA, 2)}%, and must add up to 100%: together they cover every case.`) };
      const a = pa.map(v => v / 100), b = pb.map(v => v / 100);
      const prods = a.map((v, i) => v * b[i]);
      const total = prods.reduce((s, v) => s + v, 0);
      const n6 = v => texNum(v, 6);
      const table = `\\begin{array}{c|c|c|c} i & P(A_i) & P(B\\mid A_i) & P(B\\mid A_i)\\,P(A_i) \\\\ \\hline `
        + a.map((v, i) => `${i + 1} & ${tone(n6(v), 4)} & ${tone(n6(b[i]), 3)} & ${n6(prods[i])}`).join(" \\\\ ")
        + ` \\end{array}`;
      const sumLine = k <= 6
        ? `P(B) = ${prods.map(n6).join(" + ")} ${approx(total, 6)} ${tone(n6(total), 1)}`
        : `P(B) = \\textstyle\\sum_i P(B\\mid A_i)\\,P(A_i) ${approx(total, 6)} ${tone(n6(total), 1)}`;
      let note = T(`${fmt(total * 100, 2)}% dos casos têm B, juntando todos os cenários.`, `${fmt(total * 100, 2)}% of cases have B, across all scenarios.`);
      if (total > 0) {
        const post = list(prods.map(v => `${fmt(v / total * 100, 1)}%`));
        note += T(` E dado que B aconteceu, de que cenário ele veio? É o <a href="${PAGE("teorema-bayes")}">Teorema de Bayes</a>, com P(B) no denominador:`
          + ` cada produto dividido por ${fmt(total, 6)} dá ${post}, na ordem dos cenários.`,
          ` And given that B happened, which scenario did it come from? That is <a href="${PAGE("teorema-bayes")}">Bayes' theorem</a>, with P(B) in the denominator:`
          + ` each product divided by ${fmt(total, 6)} gives ${post}, in scenario order.`);
      }
      return {
        result: `P(B) ${approx(total, 6)} ${tone(`${texNum(total * 100, 2)}\\%`, 1)}`,
        steps: [
          [T("Escreva as porcentagens como probabilidades e multiplique cada par:", "Write the percentages as probabilities and multiply each pair:"), table],
          [T("Some os produtos:", "Add up the products:"), sumLine],
        ],
        note,
      };
    },

    binom({ n, k }) {
      if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0) return { error: T("n e k precisam ser inteiros não negativos.", "n and k must be non-negative integers.") };
      if (k > n) return { error: T("Não dá para escolher mais itens (k) do que existem (n).", "You cannot choose more items (k) than there are (n).") };
      if (n > 1000) return { error: T("Use n de no máximo 1.000.", "Use n of at most 1,000.") };
      // Fórmula multiplicativa com BigInt: exata mesmo quando o resultado
      // passa de 2⁵³. Usa o menor de k e n − k, que dá o mesmo valor.
      const m = Math.min(k, n - k);
      let c = 1n;
      for (let i = 1; i <= m; i++) c = c * BigInt(n - m + i) / BigInt(i);
      const digits = c.toString().length;
      const big = v => braces(v.toLocaleString(LOCALE));
      const shown = digits > 24
        ? `\\approx ${tone(`${c.toString()[0]}{${DEC}}${c.toString().slice(1, 4)} \\times 10^{${digits - 1}}`, 1)}`
        : `= ${tone(big(c), 1)}`;
      const N = tone(`${n}!`, 2), K = tone(`${k}!`, 3), NK = tone(`${n - k}!`, 4);
      const steps = [[T("Substitua na fórmula:", "Plug into the formula:"), `\\dbinom{${n}}{${k}} = \\dfrac{${N}}{${K} \\cdot ${NK}}`]];
      if (m <= 10 && m > 0) {
        const top = Array.from({ length: m }, (_, i) => n - i);
        const bottom = Array.from({ length: m }, (_, i) => m - i);
        let num = 1n, den = 1n;
        top.forEach(v => { num *= BigInt(v); });
        bottom.forEach(v => { den *= BigInt(v); });
        const rest = m === k ? n - k : k;
        steps.push([T(`Cancele ${rest}! em cima e embaixo: sobram os ${m} maiores fatores de ${n}! sobre ${m}!.`, `Cancel ${rest}! top and bottom: the ${m} largest factors of ${n}! remain over ${m}!.`),
          `\\dfrac{${top.join(" \\cdot ")}}{${bottom.join(" \\cdot ")}} = \\dfrac{${big(num)}}{${big(den)}} ${shown}`]);
      } else if (m === 0) {
        steps.push([T("Escolher nenhum ou todos os itens só pode ser feito de um jeito:", "Choosing none or all of the items can only be done one way:"), `\\dbinom{${n}}{${k}} = ${tone(1, 1)}`]);
      } else {
        steps.push([T(`Com tantos fatores, a conta vai direto pela fórmula multiplicativa, sem escrever ${n}! inteiro:`, `With so many factors, the computation goes straight through the multiplicative formula, without writing out ${n}!:`),
          `\\dbinom{${n}}{${k}} = \\prod_{i=1}^{${m}} \\dfrac{${n - m} + i}{i} ${shown}`]);
      }
      const cs = c.toString();
      const sup = String(digits - 1).replace(/./g, ch => SUP[ch]);
      let note = digits > 24
        ? T(`Há cerca de ${cs[0]},${cs.slice(1, 4)} × 10${sup} maneiras, um número de ${digits} dígitos.`, `There are about ${cs[0]}.${cs.slice(1, 4)} × 10${sup} ways, a ${digits}-digit number.`)
        : c === 1n ? T("Há uma única maneira.", "There is exactly one way.") : T(`Há ${c.toLocaleString(LOCALE)} maneiras.`, `There are ${c.toLocaleString(LOCALE)} ways.`);
      if (k >= 2 && k <= 12) {
        let perm = 1n;
        for (let i = 0; i < k; i++) perm *= BigInt(n - i);
        const fk = Array.from({ length: k }, (_, i) => BigInt(i + 1)).reduce((a, b) => a * b, 1n);
        if (perm.toString().length <= 24) {
          note += T(` Se a ordem importasse (um arranjo), seriam ${perm.toLocaleString(LOCALE)}: cada grupo aparece ${k}! = ${fk.toLocaleString(LOCALE)} vezes, uma para cada ordem.`,
            ` If order mattered (a permutation), there would be ${perm.toLocaleString(LOCALE)}: each group appears ${k}! = ${fk.toLocaleString(LOCALE)} times, once per ordering.`);
        }
      }
      if (k !== n - k) note += T(` Escolher ${k} é o mesmo que deixar ${n - k} de fora, por isso C(${n}, ${k}) = C(${n}, ${n - k}).`, ` Choosing ${k} is the same as leaving ${n - k} out, so C(${n}, ${k}) = C(${n}, ${n - k}).`);
      return { result: `\\dbinom{${n}}{${k}} ${shown}`, steps, note };
    },

    cheb({ mu, sd, k }) {
      if (sd <= 0) return sdError;
      if (k <= 0) return { error: T("k precisa ser maior que zero.", "k must be greater than zero.") };
      const lo = mu - k * sd, hi = mu + k * sd;
      const bound = 1 / (k * k);
      const K = tone(texNum(k), 3), S = tone(texNum(sd), 4), M = tone(texNum(mu), 2);
      const iv = interval(lo, hi);
      const steps = [
        [T("Monte o intervalo de k desvios padrão em torno da média:", "Build the interval of k standard deviations around the mean:"),
          `\\mu \\pm k\\sigma = ${M} \\pm ${K} \\cdot ${S} ${approx(lo) === "=" && approx(hi) === "=" ? "=" : "\\approx"} ${iv}`],
        [T("Calcule o limite de Chebyshev para ficar fora dele:", "Compute Chebyshev's bound for falling outside it:"),
          `P\\big(|X - \\mu| \\ge k\\sigma\\big) \\le \\dfrac{${tone(1, 5)}}{${K}^2} ${approx(bound, 6)} ${tone(texNum(bound, 6), 1)}`],
      ];
      if (k <= 1) {
        return {
          result: `P\\big(|X - \\mu| \\ge k\\sigma\\big) \\le ${tone(texNum(bound, 6), 1)}`,
          steps,
          note: T("Com k ≤ 1, o limite é 1 ou mais, e toda probabilidade já é no máximo 1: o teorema não diz nada. Ele só informa para k > 1.", "With k ≤ 1, the bound is 1 or more, and every probability is already at most 1: the theorem says nothing. It is only informative for k > 1."),
        };
      }
      const inside = 1 - bound;
      const normal = 2 * phi(k) - 1;
      steps.push([T("O complemento é a fração garantida dentro do intervalo:", "The complement is the guaranteed share inside the interval:"),
        `P\\big(|X - \\mu| < k\\sigma\\big) \\ge 1 - ${texNum(bound, 6)} ${approx(inside, 6)} ${tone(`${texNum(inside * 100, 2)}\\%`, 1)}`]);
      return {
        result: `\\text{${T("pelo menos", "at least")} } ${tone(`${texNum(inside * 100, 2)}\\%`, 1)} \\text{ ${T("em", "in")} } ${iv}`,
        steps,
        note: T(`Pelo menos ${fmt(inside * 100, 2)}% dos valores ficam entre ${fmt(lo)} e ${fmt(hi)}, qualquer que seja a distribuição.`
          + ` É uma garantia conservadora: se os dados fossem normais, a fração seria de ${fmt(normal * 100, 1)}%.`
          + " O preço de valer para tudo é ser folgado em cada caso.",
          `At least ${fmt(inside * 100, 2)}% of the values lie between ${fmt(lo)} and ${fmt(hi)}, whatever the distribution.`
          + ` It is a conservative guarantee: if the data were normal, the share would be ${fmt(normal * 100, 1)}%.`
          + " The price of holding for everything is being loose in each case."),
      };
    },

    bern({ p, k }) {
      if (p < 0 || p > 100) return { error: T("A probabilidade de sucesso precisa estar entre 0 e 100%.", "The probability of success must be between 0 and 100%.") };
      if (k !== 0 && k !== 1) return { error: T("Numa tentativa de Bernoulli, k só pode ser 0 (falha) ou 1 (sucesso).", "In a Bernoulli trial, k can only be 0 (failure) or 1 (success).") };
      const pp = p / 100, q = 1 - pp;
      const res = k === 1 ? pp : q;
      const P = tone(texNum(pp, 6), 2), Q = tone(texNum(q, 6), 4);
      return {
        result: `P(X = ${k}) ${approx(res, 6)} ${tone(pctTex(res), 1)}`,
        chart: discreteChart(T("Distribuição de Bernoulli", "Bernoulli distribution"), "k", [0, 1], [q, pp], k, "X"),
        steps: [
          [T("Escreva p como proporção; a falha tem probabilidade 1 − p:", "Write p as a proportion; failure has probability 1 − p:"), `p = ${P}, \\qquad 1 - p = ${Q}`],
          [k === 1
            ? T("Substitua k = 1: o termo da falha vira 1, porque qualquer número elevado a 0 dá 1.", "Plug in k = 1: the failure term becomes 1, because any number to the power 0 is 1.")
            : T("Substitua k = 0: o termo do sucesso vira 1, porque p elevado a 0 dá 1.", "Plug in k = 0: the success term becomes 1, because p to the power 0 is 1."),
            `P(X = ${k}) = ${P}^{${k}} \\cdot ${Q}^{${1 - k}} = ${texNum(k === 1 ? pp : 1, 6)} \\cdot ${texNum(k === 1 ? 1 : q, 6)} ${approx(res, 6)} ${tone(texNum(res, 6), 1)}`],
        ],
        note: T("A fórmula é só um jeito compacto de escrever P(X = 1) = p e P(X = 0) = 1 − p numa linha."
          + ` A média é p = ${fmt(pp, 4)} e a variância é p(1 − p) = ${fmt(pp * q, 4)}.`
          + ` Repetindo a tentativa várias vezes e contando os sucessos, chega-se à <a href="${PAGE("distribuicao-binomial")}">distribuição binomial</a>.`,
          "The formula is just a compact way of writing P(X = 1) = p and P(X = 0) = 1 − p on one line."
          + ` The mean is p = ${fmt(pp, 4)} and the variance is p(1 − p) = ${fmt(pp * q, 4)}.`
          + ` Repeating the trial and counting successes leads to the <a href="${PAGE("distribuicao-binomial")}">binomial distribution</a>.`),
      };
    },

    binomial({ n, p, k }) {
      if (!Number.isInteger(n) || n < 1) return { error: T("O número de tentativas precisa ser um inteiro positivo.", "The number of trials must be a positive integer.") };
      if (n > 200) return { error: T("Use no máximo 200 tentativas.", "Use at most 200 trials.") };
      if (p < 0 || p > 100) return { error: T("A probabilidade de sucesso precisa estar entre 0 e 100%.", "The probability of success must be between 0 and 100%.") };
      if (!Number.isInteger(k) || k < 0 || k > n) return { error: T(`k precisa ser um inteiro entre 0 e ${n}.`, `k must be an integer between 0 and ${n}.`) };
      const pp = p / 100, q = 1 - pp;
      const xs = Array.from({ length: n + 1 }, (_, i) => i);
      const ys = xs.map(i => binPmf(n, pp, i));
      const res = ys[k];
      const c = Math.exp(lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1));
      const cR = Math.round(c);
      const pk = pp ** k, qk = q ** (n - k);
      const le = ys.slice(0, k + 1).reduce((a, b) => a + b, 0);
      const ge = ys.slice(k).reduce((a, b) => a + b, 0);
      return {
        result: `P(X = ${k}) ${approx(res, 6)} ${tone(pctTex(res), 1)}`,
        chart: discreteChart(T(`Distribuição binomial com n = ${n} e p = ${fmt(pp, 4)}`, `Binomial distribution with n = ${n} and p = ${fmt(pp, 4)}`), T("número de sucessos k", "number of successes k"), xs, ys, k, "X"),
        steps: [
          [T(`Conte de quantas maneiras os ${k} sucessos podem se distribuir entre as ${n} tentativas:`, `Count how many ways the ${k} successes can be spread over the ${n} trials:`),
            `\\dbinom{${n}}{${k}} = ${tone(c < 1e15 ? texNum(cR) : texSci(c), 2)}`],
          [T("Calcule a chance de uma sequência específica com k sucessos e n − k falhas:", "Compute the chance of one specific sequence with k successes and n − k failures:"),
            `p^{k} = ${texNum(pp, 6)}^{${k}} ${approx(pk, 6)} ${tone(texSci(pk, 6), 3)}, \\qquad (1-p)^{n-k} = ${texNum(q, 6)}^{${n - k}} ${approx(qk, 6)} ${tone(texSci(qk, 6), 4)}`],
          [T("Multiplique as três partes:", "Multiply the three parts:"),
            `P(X = ${k}) = ${tone(c < 1e15 ? texNum(cR) : texSci(c), 2)} \\cdot ${tone(texSci(pk, 6), 3)} \\cdot ${tone(texSci(qk, 6), 4)} ${approx(res, 6)} ${tone(texSci(res, 6), 1)}`],
        ],
        note: T(`Acumulando: P(X ≤ ${k}) ≈ ${fmt(le * 100, 2)}% e P(X ≥ ${k}) ≈ ${fmt(ge * 100, 2)}%.`
          + ` A média é np = ${fmt(n * pp, 2)} e o desvio padrão é √(np(1 − p)) ≈ ${fmt(Math.sqrt(n * pp * q), 3)}; as barras se concentram em torno da média.`,
          `Cumulative: P(X ≤ ${k}) ≈ ${fmt(le * 100, 2)}% and P(X ≥ ${k}) ≈ ${fmt(ge * 100, 2)}%.`
          + ` The mean is np = ${fmt(n * pp, 2)} and the standard deviation is √(np(1 − p)) ≈ ${fmt(Math.sqrt(n * pp * q), 3)}; the bars cluster around the mean.`),
      };
    },

    poisson({ lambda, k }) {
      if (lambda <= 0) return { error: T("A taxa média λ precisa ser maior que zero.", "The mean rate λ must be greater than zero.") };
      if (lambda > 500) return { error: T("Use λ de no máximo 500.", "Use λ of at most 500.") };
      if (!Number.isInteger(k) || k < 0) return { error: T("k precisa ser um inteiro não negativo.", "k must be a non-negative integer.") };
      const top = Math.max(k, Math.ceil(lambda + 4 * Math.sqrt(lambda)) + 1);
      const lo = Math.max(0, Math.min(k, Math.floor(lambda - 4 * Math.sqrt(lambda))));
      const xs = Array.from({ length: top - lo + 1 }, (_, i) => lo + i);
      const ys = xs.map(i => poisPmf(lambda, i));
      const res = poisPmf(lambda, k);
      let le = 0;
      for (let i = 0; i <= k; i++) le += poisPmf(lambda, i);
      const ge = 1 - le + res;
      const lk = lambda ** k, el = Math.exp(-lambda), kf = Math.exp(lgamma(k + 1));
      const L = texNum(lambda);
      return {
        result: `P(X = ${k}) ${approx(res, 6)} ${tone(pctTex(res), 1)}`,
        chart: discreteChart(T(`Distribuição de Poisson com λ = ${fmt(lambda)}`, `Poisson distribution with λ = ${fmt(lambda)}`), T("número de ocorrências k", "number of occurrences k"), xs, ys, k, "X"),
        steps: [
          [T("Calcule cada parte da fórmula:", "Compute each part of the formula:"),
            `\\lambda^k = ${L}^{${k}} ${approx(lk)} ${tone(texSci(lk), 2)}, \\quad e^{-\\lambda} = e^{-${L}} ${approx(el, 6)} ${tone(texSci(el, 6), 3)}, \\quad k! = ${k}! = ${tone(kf < 1e15 ? texNum(Math.round(kf)) : texSci(kf), 4)}`],
          [T("Junte tudo:", "Put it all together:"),
            `P(X = ${k}) = \\dfrac{${tone(texSci(lk), 2)} \\cdot ${tone(texSci(el, 6), 3)}}{${tone(kf < 1e15 ? texNum(Math.round(kf)) : texSci(kf), 4)}} ${approx(res, 6)} ${tone(texSci(res, 6), 1)}`],
        ],
        note: T(`Acumulando: P(X ≤ ${k}) ≈ ${fmt(le * 100, 2)}% e P(X ≥ ${k}) ≈ ${fmt(ge * 100, 2)}%.`
          + ` Na Poisson, média e variância são iguais a λ = ${fmt(lambda)}. Ela vale quando os eventos acontecem de forma independente e a uma taxa constante.`,
          `Cumulative: P(X ≤ ${k}) ≈ ${fmt(le * 100, 2)}% and P(X ≥ ${k}) ≈ ${fmt(ge * 100, 2)}%.`
          + ` In a Poisson distribution, the mean and the variance both equal λ = ${fmt(lambda)}. It applies when events happen independently and at a constant rate.`),
      };
    },

    normal({ mu, sd, x }) {
      if (sd <= 0) return sdError;
      const z = (x - mu) / sd;
      const coef = 1 / (sd * Math.sqrt(2 * Math.PI));
      const ex = Math.exp(-z * z / 2);
      const f = coef * ex;
      const cdf = phi(z);
      const lo = Math.min(mu - 4 * sd, x - sd), hi = Math.max(mu + 4 * sd, x + sd);
      const pts = Array.from({ length: 201 }, (_, i) => { const v = lo + (hi - lo) * i / 200; return [v, normPdf(v, mu, sd)]; });
      const peak = normPdf(mu, mu, sd);
      return {
        result: `f(${texNum(x)}) ${approx(f, 6)} ${tone(texSci(f, 6), 1)}`,
        chart: {
          type: "curve", label: T(`Densidade normal com média ${fmt(mu)} e desvio padrão ${fmt(sd)}; área sombreada até x = ${fmt(x)}`, `Normal density with mean ${fmt(mu)} and standard deviation ${fmt(sd)}; area shaded up to x = ${fmt(x)}`),
          xLabel: "x", xMin: lo, xMax: hi, yMax: peak, pts, shadeTo: x, marker: [x, f],
          tipAt: v => [`f = ${fmtSci(normPdf(v, mu, sd), 6)}`, `x = ${fmt(v, 2)}, P(X ≤ x) ≈ ${fmt(phi((v - mu) / sd) * 100, 1)}%`],
        },
        steps: [
          [T("Calcule quantos desvios padrão x está da média:", "Compute how many standard deviations x is from the mean:"),
            `\\dfrac{x - \\mu}{\\sigma} = \\dfrac{${texNum(x)} - ${paren(mu, texNum(mu))}}{${texNum(sd)}} ${approx(z)} ${texNum(z)}`],
          [T("Calcule o coeficiente de normalização:", "Compute the normalizing coefficient:"),
            `\\dfrac{1}{\\sigma\\sqrt{2\\pi}} = \\dfrac{1}{${texNum(sd)} \\cdot ${texNum(Math.sqrt(2 * Math.PI))}} ${approx(coef, 6)} ${tone(texSci(coef, 6), 2)}`],
          [T("Calcule a exponencial:", "Compute the exponential:"),
            `e^{-\\frac{1}{2} \\cdot ${paren(z, texNum(z))}^2} = e^{-${texNum(z * z / 2)}} ${approx(ex, 6)} ${tone(texSci(ex, 6), 3)}`],
          [T("Multiplique:", "Multiply:"), `f(${texNum(x)}) = ${tone(texSci(coef, 6), 2)} \\cdot ${tone(texSci(ex, 6), 3)} ${approx(f, 6)} ${tone(texSci(f, 6), 1)}`],
        ],
        note: T(`f(x) é densidade, não probabilidade: a chance de dar exatamente ${fmt(x)} é zero. Probabilidade é área sob a curva.`
          + ` A área sombreada é P(X ≤ ${fmt(x)}) = Φ(${fmt(z, 2)}) ≈ ${fmt(cdf * 100, 1)}%.`
          + ` <a href="/ztable.html?z=${z.toFixed(2)}">Conferir na tabela Z</a> ou ver o <a href="${PAGE("z-score")}?x=${x}&amp;mu=${mu}&amp;sd=${sd}">z-score com estes valores</a>.`,
          `f(x) is a density, not a probability: the chance of getting exactly ${fmt(x)} is zero. Probability is area under the curve.`
          + ` The shaded area is P(X ≤ ${fmt(x)}) = Φ(${fmt(z, 2)}) ≈ ${fmt(cdf * 100, 1)}%.`
          + ` <a href="/ztable.html?z=${z.toFixed(2)}">Check it in the Z table</a> or see the <a href="${PAGE("z-score")}?x=${x}&amp;mu=${mu}&amp;sd=${sd}">z-score with these values</a>.`),
      };
    },

    tcl({ mu, n }) {
      if (mu <= 0) return { error: T("A média da população exponencial precisa ser maior que zero.", "The mean of the exponential population must be greater than zero.") };
      if (!Number.isInteger(n) || n < 1) return { error: T("O tamanho da amostra precisa ser um inteiro positivo.", "The sample size must be a positive integer.") };
      if (n > 500) return { error: T("Use n de no máximo 500.", "Use n of at most 500.") };
      const SIMS = 2000;
      const rand = rng(Math.round(mu * 1000) * 7919 + n);
      const means = new Float64Array(SIMS);
      for (let s = 0; s < SIMS; s++) {
        let sum = 0;
        for (let i = 0; i < n; i++) sum += -mu * Math.log(1 - rand());
        means[s] = sum / n;
      }
      const se = mu / Math.sqrt(n);
      const mSim = means.reduce((a, b) => a + b, 0) / SIMS;
      const sdSim = Math.sqrt(means.reduce((a, b) => a + (b - mSim) ** 2, 0) / (SIMS - 1));
      const lo = Math.max(0, Math.min(...means, mu - 4 * se)), hi = Math.max(...means, mu + 4 * se);
      const B = 30, w = (hi - lo) / B;
      const counts = new Array(B).fill(0);
      means.forEach(v => { counts[Math.min(B - 1, Math.floor((v - lo) / w))]++; });
      const bins = counts.map((c, i) => ({ x0: lo + i * w, x1: lo + (i + 1) * w, count: c, y: c / (SIMS * w) }));
      const pts = Array.from({ length: 151 }, (_, i) => { const v = lo + (hi - lo) * i / 150; return [v, normPdf(v, mu, se)]; });
      const yMax = Math.max(...bins.map(b => b.y), normPdf(mu, mu, se));
      const M = tone(texNum(mu), 3), N = tone(n, 5);
      return {
        result: `\\bar{X}_{${n}} \\;\\dot\\sim\\; ${tone("\\mathcal{N}", 2)}\\left(${M},\\, \\dfrac{${tone(`${texNum(mu)}^2`, 4)}}{${N}}\\right)`,
        chart: {
          type: "hist", label: T(`Histograma de ${SIMS} médias de amostras de tamanho ${n}, com a curva normal prevista pelo teorema`, `Histogram of ${SIMS} means of samples of size ${n}, with the normal curve the theorem predicts`),
          xLabel: T("média da amostra", "sample mean"), xMin: lo, xMax: hi, yMax, bins, pts,
        },
        steps: [
          [T("Numa exponencial, o desvio padrão é igual à média:", "In an exponential distribution, the standard deviation equals the mean:"), `\\mu = ${M}, \\qquad \\sigma = ${tone(texNum(mu), 4)}`],
          [T("O teorema diz que a média de n valores tem desvio padrão σ/√n, o erro padrão:", "The theorem says the mean of n values has standard deviation σ/√n, the standard error:"),
            `\\dfrac{\\sigma}{\\sqrt{n}} = \\dfrac{${texNum(mu)}}{\\sqrt{${N}}} ${approx(se)} ${texNum(se)}`],
          [T(`A simulação sorteou ${fmt(SIMS)} amostras de ${n} valores e tirou a média de cada uma:`, `The simulation drew ${fmt(SIMS)} samples of ${n} values and took the mean of each:`),
            `\\text{${T("média das médias", "mean of the means")}} \\approx ${texNum(mSim, 3)}, \\qquad \\text{${T("desvio das médias", "SD of the means")}} \\approx ${texNum(sdSim, 3)}`],
        ],
        note: T(`As médias se concentram em ${fmt(mSim, 2)}, perto de μ = ${fmt(mu)}, com desvio ${fmt(sdSim, 3)}, perto dos ${fmt(se, 3)} previstos; a curva é a normal que o teorema prevê.`,
          `The means cluster at ${fmt(mSim, 2)}, close to μ = ${fmt(mu)}, with a spread of ${fmt(sdSim, 3)}, close to the predicted ${fmt(se, 3)}; the curve is the normal the theorem predicts.`)
          + (n < 10
            ? T(" Com n tão pequeno, o histograma ainda carrega a assimetria da exponencial: a aproximação normal ainda não chegou. Aumente n para ver o sino se formar.",
              " With n this small, the histogram still carries the skew of the exponential: the normal approximation hasn't kicked in. Increase n to watch the bell form.")
            : T(" A população é muito assimétrica, com a maioria esperando pouco e alguns esperando muito, e mesmo assim as médias já desenham um sino. Diminua n para 2 ou 3 e veja a assimetria voltar.",
              " The population is very skewed, with most people waiting a little and a few waiting a lot, and still the means already draw a bell. Lower n to 2 or 3 and watch the skew come back.")),
      };
    },

    // Teste de aderência. As esperadas podem vir como contagens, como
    // proporções (somando 1) ou ficar em branco, para a distribuição uniforme.
    chi({ o, e }) {
      const k = o.length;
      if (k < 2) return { error: T("Informe as frequências observadas de pelo menos duas categorias.", "Enter the observed frequencies of at least two categories.") };
      if (k > 50) return { error: T("Use no máximo 50 categorias.", "Use at most 50 categories.") };
      if (o.some(x => x < 0)) return { error: T("As frequências observadas não podem ser negativas.", "Observed frequencies cannot be negative.") };
      const total = o.reduce((s, x) => s + x, 0);
      if (total <= 0) return { error: T("As frequências observadas precisam somar mais que zero.", "Observed frequencies must add up to more than zero.") };

      let exp, step1;
      if (!e.length) {
        exp = o.map(() => total / k);
        step1 = [T("Sem esperadas informadas, a hipótese é de categorias igualmente prováveis: divida o total pelo número de categorias.", "With no expected values given, the hypothesis is that categories are equally likely: divide the total by the number of categories."),
          `E_i = \\dfrac{${texNum(total)}}{${k}} ${approx(total / k)} ${tone(texNum(total / k), 4)}`];
      } else {
        if (e.length !== k) return { error: T(`Há ${k} observadas e ${e.length} esperadas; as listas precisam ter o mesmo tamanho.`, `There are ${k} observed and ${e.length} expected values; the lists must have the same length.`) };
        if (e.some(x => x <= 0)) return { error: T("As frequências esperadas precisam ser maiores que zero.", "Expected frequencies must be greater than zero.") };
        const se = e.reduce((s, x) => s + x, 0);
        if (Math.abs(se - 1) < 1e-6) {
          exp = e.map(p => p * total);
          step1 = [T("As esperadas foram dadas como proporções: multiplique cada uma pelo total observado.", "The expected values were given as proportions: multiply each by the observed total."),
            `E_i = p_i \\cdot ${texNum(total)}`];
        } else if (Math.abs(se - total) <= 0.01 * total) {
          exp = e;
          step1 = [T("Use as frequências esperadas informadas; elas somam o mesmo que as observadas.", "Use the expected frequencies given; they add up to the same as the observed ones."),
            `\\textstyle\\sum E_i ${approx(se)} ${texNum(se)} = \\sum O_i`];
        } else {
          return { error: T(`As esperadas somam ${fmt(se)} e as observadas, ${fmt(total)}. Elas precisam somar o mesmo — ou dê as esperadas como proporções que somam 1.`, `The expected values add up to ${fmt(se)} and the observed ones to ${fmt(total)}. They must add up to the same, or give the expected values as proportions that add up to 1.`) };
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
        ? T("Ao nível de 5%, rejeita-se H₀: as frequências observadas diferem das esperadas mais do que o acaso explicaria.", "At the 5% level, H₀ is rejected: the observed frequencies differ from the expected ones more than chance would explain.")
        : T("Ao nível de 5%, não se rejeita H₀: as diferenças entre observadas e esperadas são compatíveis com o acaso.", "At the 5% level, H₀ is not rejected: the differences between observed and expected are consistent with chance.");
      const pequenas = exp.some(x => x < 5)
        ? T(` ${warn} há frequência esperada menor que 5, e com ela a aproximação pela qui-quadrado fica pouco confiável. Junte categorias ou aumente a amostra.`,
          ` ${warn} some expected frequency is below 5, which makes the chi-square approximation unreliable. Merge categories or increase the sample.`)
        : "";

      return {
        result: `\\chi^2 ${approx(chi2)} ${tone(texNum(chi2), 1)}`,
        steps: [
          step1,
          [T("Calcule a parcela de cada categoria:", "Compute each category's term:"), table],
          [T("Some as parcelas:", "Add up the terms:"), sum],
        ],
        note: T(`Com k − 1 = ${dof(df)}, o valor-p é ${pValueText(p)}. ${veredito}${pequenas}`, `With k − 1 = ${dof(df)}, the p-value is ${pValueText(p)}. ${veredito}${pequenas}`),
      };
    },
  };

  /* ---------------------------------------------------------------- gráficos
   *
   * SVG desenhado à mão, sem biblioteca: uma série só, então sem legenda; o
   * valor pedido fica em destaque (--chart-hi) e o resto atenuado
   * (--chart-base). Tipos: "bars" (distribuições discretas), "curve" (densidade
   * com área sombreada) e "hist" (histograma com curva sobreposta).
   */

  const SVGNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs, parent) {
    const el = document.createElementNS(SVGNS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  // Passo "redondo" (1, 2 ou 5 × 10ⁿ) para ~count marcas de 0 até max.
  function niceStep(span, count) {
    const raw = span / count;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const f = raw / mag;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * mag;
  }

  // Barra com topo arredondado (4px) e base reta, crescendo da linha de base.
  function barPath(x, y, w, h) {
    const r = Math.min(4, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  function renderChart(box, spec) {
    box.replaceChildren();
    if (!spec) return;
    const W = 640, H = spec.height || 230, m = { l: 48, r: 14, t: 14, b: 34 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const root = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart", role: "img", "aria-label": spec.label }, box);
    const tip = document.createElement("div");
    tip.className = "chart-tip";
    tip.hidden = true;
    box.appendChild(tip);

    const xMin = spec.xMin, xMax = spec.xMax;
    const yMax = spec.yMax * 1.08 || 1;
    const X = v => m.l + (v - xMin) / (xMax - xMin) * iw;
    const Y = v => m.t + ih - v / yMax * ih;

    // Grade e eixo y: linhas finas, recessivas.
    const ys = niceStep(yMax, 4);
    for (let v = 0; spec.type !== "intervals" && v <= yMax + 1e-12; v += ys) {
      svg("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), class: v === 0 ? "chart-axis" : "chart-grid" }, root);
      svg("text", { x: m.l - 6, y: Y(v) + 4, class: "chart-label", "text-anchor": "end" }, root).textContent = fmt(v, 4);
    }

    function showTip(evt, value, label) {
      tip.replaceChildren();
      const b = document.createElement("strong");
      b.textContent = value;
      const sp = document.createElement("span");
      sp.textContent = label;
      tip.append(b, sp);
      tip.hidden = false;
      const r = box.getBoundingClientRect();
      const px = (evt.clientX ?? r.left + r.width / 2) - r.left;
      tip.style.left = `${Math.max(0, Math.min(px + 12, r.width - tip.offsetWidth))}px`;
      tip.style.top = "8px";
    }
    const hideTip = () => { tip.hidden = true; };
    root.addEventListener("pointerleave", hideTip);

    if (spec.type === "bars") {
      const n = spec.xs.length;
      const band = iw / (xMax - xMin);
      const bw = Math.max(1, Math.min(24, band - 2));
      const every = Math.ceil(n / 12);
      spec.xs.forEach((x, i) => {
        const y = spec.ys[i];
        const cx = X(x), h = Math.max(0, Y(0) - Y(y));
        const hi = spec.hi(x);
        if (h > 0) svg("path", { d: barPath(cx - bw / 2, Y(y), bw, h), class: hi ? "chart-hi" : "chart-base" }, root);
        if (i % every === 0 || hi) {
          svg("text", { x: cx, y: H - m.b + 16, class: hi ? "chart-label is-hi" : "chart-label", "text-anchor": "middle" }, root).textContent = fmt(x);
        }
        // Área de toque da faixa inteira, maior que a barra.
        const hit = svg("rect", { x: cx - band / 2, y: m.t, width: band, height: ih, class: "chart-hit" }, root);
        const t = spec.tip(x, y);
        const show = e => showTip(e, t[0], t[1]);
        hit.addEventListener("pointermove", show);
        if (n <= 40) {
          hit.setAttribute("tabindex", "0");
          hit.setAttribute("aria-label", `${t[1]}: ${t[0]}`);
          hit.addEventListener("focus", show);
          hit.addEventListener("blur", hideTip);
        }
      });
      svg("text", { x: m.l + iw / 2, y: H - 2, class: "chart-label", "text-anchor": "middle" }, root).textContent = spec.xLabel;
    } else {
      // Eixo x numérico.
      const xs = niceStep(xMax - xMin, 6);
      for (let v = Math.ceil(xMin / xs) * xs; v <= xMax + 1e-9; v += xs) {
        svg("text", { x: X(v), y: H - m.b + 16, class: "chart-label", "text-anchor": "middle" }, root).textContent = fmt(v, 2);
      }
      svg("text", { x: m.l + iw / 2, y: H - 2, class: "chart-label", "text-anchor": "middle" }, root).textContent = spec.xLabel;

      // Um segmento por intervalo, empilhados; os que erram o valor real
      // ganham a cor de destaque, e a linha vertical marca esse valor.
      if (spec.type === "intervals") {
        const rh = ih / spec.rows.length;
        svg("line", { x1: X(spec.truth), x2: X(spec.truth), y1: m.t, y2: m.t + ih, class: "chart-truth" }, root);
        spec.rows.forEach((r, i) => {
          const y = m.t + (i + 0.5) * rh;
          svg("line", { x1: X(r.lo), x2: X(r.hi), y1: y, y2: y, class: r.hit ? "chart-seg" : "chart-seg is-miss" }, root);
          const hit = svg("rect", { x: m.l, y: y - rh / 2, width: iw, height: rh, class: "chart-hit" }, root);
          const t = spec.tip(r, i);
          hit.addEventListener("pointermove", e => showTip(e, t[0], t[1]));
        });
      }
      if (spec.type === "hist") {
        spec.bins.forEach(b => {
          const x0 = X(b.x0) + 1, w = Math.max(1, X(b.x1) - X(b.x0) - 2);
          const h = Math.max(0, Y(0) - Y(b.y));
          if (h > 0) svg("path", { d: barPath(x0, Y(b.y), w, h), class: "chart-base" }, root);
          const hit = svg("rect", { x: X(b.x0), y: m.t, width: X(b.x1) - X(b.x0), height: ih, class: "chart-hit" }, root);
          hit.addEventListener("pointermove", e => showTip(e, T(`${fmt(b.count)} médias`, `${fmt(b.count)} means`), T(`entre ${fmt(b.x0, 2)} e ${fmt(b.x1, 2)}`, `between ${fmt(b.x0, 2)} and ${fmt(b.x1, 2)}`)));
        });
      }
      const line = (spec.pts || []).map(([x, y], i) => `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join("");
      if (spec.shadeTo != null) {
        const under = spec.pts.filter(([x]) => x <= spec.shadeTo);
        if (under.length > 1) {
          const d = `M${X(under[0][0])},${Y(0)}` + under.map(([x, y]) => `L${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join("")
            + `L${X(under[under.length - 1][0])},${Y(0)}Z`;
          svg("path", { d, class: "chart-area" }, root);
        }
      }
      if (line) svg("path", { d: line, class: "chart-line" }, root);
      if (spec.marker) {
        const [mx, my] = spec.marker;
        svg("line", { x1: X(mx), x2: X(mx), y1: Y(0), y2: Y(my), class: "chart-rule" }, root);
        svg("circle", { cx: X(mx), cy: Y(my), r: 5, class: "chart-dot" }, root);
      }
      if (spec.tipAt) {
        const hit = svg("rect", { x: m.l, y: m.t, width: iw, height: ih, class: "chart-hit" }, root);
        hit.addEventListener("pointermove", e => {
          const r = root.getBoundingClientRect();
          const x = xMin + ((e.clientX - r.left) / r.width * W - m.l) / iw * (xMax - xMin);
          const t = spec.tipAt(x);
          showTip(e, t[0], t[1]);
        });
      }
    }

    // Tabela: o mesmo dado sem depender de cor nem de passar o mouse.
    if (spec.table) {
      const det = document.createElement("details");
      det.className = "chart-table";
      const sum = document.createElement("summary");
      sum.textContent = spec.table.title;
      const table = document.createElement("table");
      const head = table.createTHead().insertRow();
      spec.table.head.forEach(h => { const th = document.createElement("th"); th.textContent = h; head.appendChild(th); });
      const body = table.createTBody();
      spec.table.rows.forEach(row => {
        const tr = body.insertRow();
        if (row.hi) tr.className = "is-hi";
        row.cells.forEach(c => { tr.insertCell().textContent = c; });
      });
      det.append(sum, table);
      box.appendChild(det);
    }
  }

  // \htmlData só para pintar trechos com data-tone; nada além disso é confiável.
  const MATH_OPTS = { throwOnError: false, strict: false, trust: c => c.command === "\\htmlData" };
  const math = (el, src) => (window.katex ? katex.render(src, el, MATH_OPTS) : (el.textContent = src));

  function initCalc(section) {
    const calc = CALCS[section.dataset.calc];
    const inputs = Array.from(section.querySelectorAll("input[name]"));
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const chart = section.querySelector(".calc-chart");
    // Português: vírgula decimal. Inglês: ponto decimal e vírgula de milhar.
    // Nos dois, sinal tipográfico −, espaços e um % no fim.
    const parse = s => {
      if (s.trim() === "") return NaN;
      const t = s.replace(/[\s%]/g, "").replace("−", "-");
      return Number(EN ? t.replace(/,/g, "") : t.replace(",", "."));
    };
    // Campo com data-list vira um array, separado por espaço ou ponto e vírgula
    // (e, em inglês, também por vírgula). Com data-optional, pode ficar vazio:
    // a lista vira [], o número vira null.
    const read = i => {
      if (!("list" in i.dataset)) return "optional" in i.dataset && i.value.trim() === "" ? null : parse(i.value);
      const xs = i.value.split(EN ? /[\s;,]+/ : /[\s;]+/).filter(Boolean).map(parse);
      return xs.some(Number.isNaN) || (!xs.length && !("optional" in i.dataset)) ? NaN : xs;
    };

    const params = new URLSearchParams(location.search);
    inputs.forEach(i => { if (params.has(i.name)) i.value = params.get(i.name); });

    function update() {
      const v = Object.fromEntries(inputs.map(i => [i.name, read(i)]));
      inputs.forEach(i => i.setAttribute("aria-invalid", String(Number.isNaN(v[i.name]))));
      const out = Object.values(v).some(Number.isNaN)
        ? { error: T("Preencha todos os campos com números.", "Fill in every field with a number.") }
        : calc(v);

      section.classList.toggle("has-error", !!out.error);
      steps.replaceChildren();
      if (chart) renderChart(chart, out.error ? null : out.chart);
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
