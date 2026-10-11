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
    "cochran-formula": "cochran-formula", "poder-estatistico": "statistical-power",
    "simulador-pesquisa": "poll-simulator", "duas-proporcoes": "two-proportions-sample-size",
    "teorema-chebyshev": "chebyshev-theorem", "distribuicao-bernoulli": "bernoulli-distribution",
    "distribuicao-poisson": "poisson-distribution", "intervalo-confianca": "confidence-interval",
    "teorema-central-limite": "central-limit-theorem", "media-harmonica": "harmonic-mean",
    "distribuicao-geometrica": "geometric-distribution", "distribuicao-exponencial": "exponential-distribution",
    "distribuicao-normal": "normal-distribution", "coeficiente-binomial": "binomial-coefficient",
    "problema-aniversario": "birthday-problem", "qui-quadrado-independencia": "chi-square-independence",
    "desvio-padrao": "standard-deviation", "valor-esperado": "expected-value", "erro-padrao": "standard-error",
    "formula-quadratica": "quadratic-formula", "soma-pg": "geometric-series", "razao-chances": "odds-ratio",
    "regra-lhopital": "lhopital-rule", "soma-riemann": "riemann-sum", "t-duas-amostras": "two-sample-t-test",
    "margem-de-erro": "margin-of-error", "ic-proporcao": "proportion-confidence-interval",
    "quartis-iqr": "quartiles-iqr",
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

  // t crítico bilateral: o t com P(|T| > t) = alpha, por bisseção na cauda.
  function tCrit(alpha, df) {
    let lo = 0, hi = 1;
    while (tTwoTail(hi, df) > alpha) hi *= 2;
    for (let i = 0; i < 60; i++) {
      const m = (lo + hi) / 2;
      if (tTwoTail(m, df) > alpha) lo = m; else hi = m;
    }
    return (lo + hi) / 2;
  }

  // Acumulada da t não central, P(T ≤ t) com df graus de liberdade e
  // parâmetro de não centralidade delta: algoritmo AS 243 (Lenth, 1989).
  function nctCdf(t, df, delta) {
    const neg = t < 0;
    const tt = neg ? -t : t, del = neg ? -delta : delta;
    let tnc = 0;
    const x = tt * tt / (tt * tt + df);
    if (x > 0) {
      const lambda = del * del;
      let p = 0.5 * Math.exp(-0.5 * lambda);
      let q = Math.sqrt(2 / Math.PI) * p * del;
      let s = 0.5 - p;
      let a = 0.5;
      const b = 0.5 * df;
      const rxb = Math.pow(1 - x, b);
      const albeta = lgamma(a) + lgamma(b) - lgamma(a + b);
      let xodd = betainc(x, a, b);
      let godd = 2 * rxb * Math.exp(a * Math.log(x) - albeta);
      let xeven = 1 - rxb;
      let geven = b * x * rxb;
      tnc = p * xodd + q * xeven;
      for (let j = 1; j <= 1000; j++) {
        a += 1;
        xodd -= godd;
        xeven -= geven;
        godd *= x * (a + b - 1) / a;
        geven *= x * (a + b - 0.5) / (a + 0.5);
        p *= lambda / (2 * j);
        q *= lambda / (2 * j + 1);
        s -= p;
        tnc += p * xodd + q * xeven;
        if (2 * s * (xodd - godd) < 1e-12) break;
      }
    }
    tnc += phi(-del);
    return neg ? 1 - tnc : tnc;
  }

  // Poder do teste t bilateral com n por grupo (g = 1: uma amostra ou
  // pareado; g = 2: duas amostras independentes de mesmo tamanho).
  function tPower(d, n, alpha, g) {
    const df = g === 2 ? 2 * n - 2 : n - 1;
    const delta = d * Math.sqrt(n / g);
    const tc = tCrit(alpha, df);
    return 1 - nctCdf(tc, df, delta) + nctCdf(-tc, df, delta);
  }

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

  // Resumo de um boxplot: quartis pelo método 7 (o do R), bigodes até o
  // último valor dentro de 1,5 · IQR e os atípicos.
  function boxStats(xs) {
    const s = xs.slice().sort((p, q) => p - q), n = s.length;
    const q = p => { const h = (n - 1) * p, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); };
    const q1 = q(0.25), q2 = q(0.5), q3 = q(0.75), iqr = q3 - q1;
    const f1 = q1 - 1.5 * iqr, f2 = q3 + 1.5 * iqr;
    const inside = s.filter(v => v >= f1 && v <= f2);
    return { q1, q2, q3, iqr, f1, f2, wLo: Math.min(...inside), wHi: Math.max(...inside), out: s.filter(v => v < f1 || v > f2) };
  }

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

  // População em bairros para o simulador: a proporção de cada bairro vem
  // de uma Beta(média m, correlação intraclasse rho), sorteada com semente
  // fixa, e os K eleitores de A são repartidos entre os bairros nessas
  // proporções, sem passar do tamanho de cada um.
  function bairros(tamanhos, K, m, rho) {
    const C = tamanhos.length;
    if (rho <= 0) return apportion(K, tamanhos).out;
    const rand = rng(424242);
    const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
    // Gama de Marsaglia–Tsang (com o truque de a < 1).
    const gama = a => {
      if (a < 1) return gama(a + 1) * Math.pow(1 - rand(), 1 / a);
      const d = a - 1 / 3, c = 1 / Math.sqrt(9 * d);
      for (;;) {
        let x, v;
        do { x = normal(); v = 1 + c * x; } while (v <= 0);
        v = v * v * v;
        const u = 1 - rand();
        if (Math.log(u) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v;
      }
    };
    const s = (1 - rho) / rho;
    const ps = tamanhos.map(() => { const x = gama(m * s), y = gama((1 - m) * s); return x / (x + y); });
    let Kc = apportion(K, ps.map((p, i) => p * tamanhos[i])).out;
    // O que passar do tamanho do bairro vai para os que têm folga.
    for (let it = 0; it < 50; it++) {
      let sobra = 0;
      Kc = Kc.map((k, i) => { if (k > tamanhos[i]) { sobra += k - tamanhos[i]; return tamanhos[i]; } return k; });
      if (!sobra) break;
      const folga = Kc.map((k, i) => tamanhos[i] - k);
      const extra = apportion(sobra, folga).out;
      Kc = Kc.map((k, i) => k + extra[i]);
    }
    return Kc;
  }

  // Correlação intraclasse da população: a parte da variância de "vota em A"
  // que está entre os bairros.
  function rhoReal(tamanhos, Kc, m) {
    const N = tamanhos.reduce((s, x) => s + x, 0);
    const entre = tamanhos.reduce((s, x, i) => s + x * (Kc[i] / x - m) ** 2, 0) / N;
    return entre / (m * (1 - m));
  }

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

    // Tamanho de amostra pelo poder do teste t bilateral. A fórmula é a da
    // normal; a correção de Guenther (+ z²/4 ou z²/2) a aproxima da t, e a
    // busca final pela t não central dá o n exato que o G*Power daria.
    poder({ d, alpha, power, g }) {
      if (d <= 0) return { error: T("O tamanho de efeito precisa ser maior que zero.", "The effect size must be greater than zero.") };
      if (d > 5) return { error: T("Use d de no máximo 5; efeitos maiores que isso dispensam o cálculo.", "Use d of at most 5; effects that large don't need the calculation.") };
      if (alpha <= 0 || alpha >= 50) return { error: T("A significância precisa estar entre 0 e 50%, como 5 ou 1.", "The significance level must be between 0 and 50%, such as 5 or 1.") };
      if (power <= alpha / 2 || power >= 100) return { error: T("O poder precisa ser menor que 100% e maior que α/2, como 80 ou 90.", "Power must be below 100% and above α/2, such as 80 or 90.") };
      if (g !== 1 && g !== 2) return { error: T("Use g = 2 para dois grupos independentes ou g = 1 para uma amostra ou dados pareados.", "Use g = 2 for two independent groups or g = 1 for one sample or paired data.") };
      const a = alpha / 100, pw = power / 100;
      const zA = zCrit(100 - alpha), zB = Number(probit(pw).toFixed(2));
      const base = g * (zA + zB) ** 2 / (d * d);
      const corr = zA * zA / (g === 2 ? 4 : 2);
      const guess = ceilInt(base + corr);

      // Menor n (pelo menos 2) cujo poder exato alcança o pedido.
      let n = Math.max(2, guess - 3);
      if (n > 1e5) return { error: T("O n passa de 100.000 por grupo; aumente o efeito ou diminua o poder.", "n exceeds 100,000 per group; increase the effect or lower the power.") };
      while (tPower(d, n, a, g) < pw) n++;
      while (n > 2 && tPower(d, n - 1, a, g) >= pw) n--;
      const got = tPower(d, n, a, g);

      const ZA = tone(texNum(zA), 2), ZB = tone(texNum(zB), 3), D = tone(texNum(d), 4), G = tone(g, 5);
      const steps = [
        [T(`Encontre os valores críticos: z de α/2 = ${fmt(alpha / 2, 4)}% e z do poder, ${fmt(power, 2)}%, como na tabela Z:`, `Find the critical values: z for α/2 = ${fmt(alpha / 2, 4)}% and z for the power, ${fmt(power, 2)}%, as in the Z table:`),
          `z_{\\alpha/2} \\approx ${ZA}, \\qquad z_{\\beta} \\approx ${ZB}`],
        [T("Substitua na fórmula, que usa a distribuição normal:", "Plug into the formula, which uses the normal distribution:"),
          `n = \\dfrac{${G} \\cdot (${ZA} + ${ZB})^2}{${D}^2} ${approx(base, 2)} ${texNum(base, 2)}`],
        [T(`O teste de verdade é t, um pouco menos poderoso com amostras pequenas; a correção de Guenther soma z²/${g === 2 ? 4 : 2}:`, `The real test is a t-test, slightly less powerful with small samples; Guenther's correction adds z²/${g === 2 ? 4 : 2}:`),
          `n \\approx ${texNum(base, 2)} + \\dfrac{${ZA}^2}{${g === 2 ? 4 : 2}} ${approx(base + corr, 2)} ${texNum(base + corr, 2)} \\;\\to\\; ${texNum(guess)}`],
        [n === guess
          ? T("Confira pela distribuição t não central, a do teste quando o efeito existe:", "Check with the noncentral t distribution, the test's distribution when the effect is real:")
          : T(`Pela distribuição t não central, a do teste quando o efeito existe, o menor n que alcança o poder é ${fmt(n)}, não ${fmt(guess)}:`, `With the noncentral t distribution, the test's distribution when the effect is real, the smallest n that reaches the power is ${fmt(n)}, not ${fmt(guess)}:`),
          `${T("\\text{poder}", "\\text{power}")}(n = ${tone(texNum(n), 1)}) \\approx ${texNum(got * 100, 2)}\\%`],
      ];

      // Curva de poder × n, até bem depois do n pedido.
      const nMax = Math.max(10, Math.ceil(n * 2.5));
      const stepN = Math.max(1, Math.ceil((nMax - 2) / 150));
      const pts = [];
      for (let k = 2; k <= nMax; k += stepN) pts.push([k, tPower(d, k, a, g)]);

      const per = g === 2 ? T(" por grupo", " per group") : "";
      const total = g === 2 ? T(` (${fmt(2 * n)} no total)`, ` (${fmt(2 * n)} in total)`) : "";
      const size = d < 0.35 ? T("pequeno", "small") : d < 0.65 ? T("médio", "medium") : T("grande", "large");
      let note = T(`São precisos ${fmt(n)}${per}${total} para detectar um efeito ${size} (d = ${fmt(d)}) com ${fmt(power, 2)}% de chance, num teste bilateral a ${fmt(alpha, 2)}%.`,
        `You need ${fmt(n)}${per}${total} to detect a ${size} effect (d = ${fmt(d)}) with ${fmt(power, 2)}% probability, in a two-sided test at ${fmt(alpha, 2)}%.`);
      note += T(` Se o efeito real for metade disso, o mesmo estudo teria só ${fmt(tPower(d / 2, n, a, g) * 100, 0)}% de poder: o d escolhido é a aposta mais importante do cálculo, e convém tirá-lo de estudos anteriores, não do otimismo.`,
        ` If the real effect is half that, the same study would have only ${fmt(tPower(d / 2, n, a, g) * 100, 0)}% power: the chosen d is the most important bet in the calculation, and it should come from previous studies, not optimism.`);
      note += T(` Depois de coletar, analise com o <a href="${PAGE("t-student")}">teste t</a>.`, ` Once you have the data, analyze it with the <a href="${PAGE("t-student")}">t-test</a>.`);

      return {
        result: `n = ${tone(texNum(n), 1)}${g === 2 ? T("\\text{ por grupo}", "\\text{ per group}") : ""}`,
        chart: {
          type: "curve",
          label: T(`Poder do teste em função de n, para d = ${fmt(d)} e α = ${fmt(alpha, 2)}%; com n = ${fmt(n)}, o poder é ${fmt(got * 100, 1)}%`,
            `Power of the test as a function of n, for d = ${fmt(d)} and α = ${fmt(alpha, 2)}%; with n = ${fmt(n)}, power is ${fmt(got * 100, 1)}%`),
          xLabel: T(`n${per}`, `n${per}`), xMin: 2, xMax: nMax, yMax: 1 / 1.08, pts, marker: [n, got],
          tipAt: v => {
            const k = Math.max(2, Math.round(v));
            return [`${fmt(tPower(d, k, a, g) * 100, 1)}%`, T(`poder com n = ${k}`, `power with n = ${k}`)];
          },
        },
        steps,
        note,
      };
    },

    // Tamanho de amostra para comparar duas proporções (teste z bilateral,
    // grupos do mesmo tamanho), pela fórmula de Fleiss, que usa a variância
    // sob H₀ (p̄ nos dois grupos) no termo de α e a variância sob H₁ no de
    // β. O n vale para amostras aleatórias simples; com deff, multiplica.
    // O poder é conferido somando todos os pares de contagens possíveis.
    duasProp({ p1, p2, alpha, power, deff }) {
      if (p1 <= 0 || p1 >= 100 || p2 <= 0 || p2 >= 100) return { error: T("As proporções precisam estar entre 0 e 100%, sem os extremos.", "The proportions must be strictly between 0 and 100%.") };
      if (p1 === p2) return { error: T("As duas proporções são iguais: não há diferença para detectar.", "The two proportions are equal: there is no difference to detect.") };
      if (alpha <= 0 || alpha >= 50) return { error: T("A significância precisa estar entre 0 e 50%, como 5 ou 1.", "The significance level must be between 0 and 50%, such as 5 or 1.") };
      if (power <= alpha / 2 || power >= 100) return { error: T("O poder precisa ser menor que 100% e maior que α/2, como 80 ou 90.", "Power must be below 100% and above α/2, such as 80 or 90.") };
      if (deff !== null && (deff < 0.1 || deff > 20)) return { error: T("O efeito de desenho precisa estar entre 0,1 e 20, ou ficar em branco.", "The design effect must be between 0.1 and 20, or left blank.") };
      const D = deff === null ? 1 : deff;
      const a = p1 / 100, b = p2 / 100, dif = Math.abs(a - b);
      const pm = (a + b) / 2, v0 = 2 * pm * (1 - pm), v1 = a * (1 - a) + b * (1 - b);
      const zA = zCrit(100 - alpha), zB = Number(probit(power / 100).toFixed(2));
      const base = (zA * Math.sqrt(v0) + zB * Math.sqrt(v1)) ** 2 / (dif * dif);
      const nS = ceilInt(base), n = ceilInt(base * D);
      if (n > 1e7) return { error: T("O n passa de 10 milhões por grupo; a diferença é pequena demais para detectar.", "n exceeds 10 million per group; the difference is too small to detect.") };
      // Com a correção de continuidade (Fleiss, Tytun e Ury), mais perto do
      // exato de Fisher.
      const cc = base / 4 * (1 + Math.sqrt(1 + 4 / (base * dif))) ** 2;
      const nCC = ceilInt(cc * D);

      // Poder pela normal, com n por grupo (já descontado o deff).
      const pw = k => phi((dif * Math.sqrt(k / D) - zA * Math.sqrt(v0)) / Math.sqrt(v1));
      // Poder exato do teste z com n por grupo, numa amostra aleatória simples.
      function exato(m) {
        const faixa = p => {
          const s = Math.sqrt(m * p * (1 - p));
          const k0 = Math.max(0, Math.floor(m * p - 9 * s - 1)), k1 = Math.min(m, Math.ceil(m * p + 9 * s + 1));
          const ws = [];
          for (let k = k0; k <= k1; k++) ws.push(binPmf(m, p, k));
          return { k0, ws };
        };
        const A = faixa(a), B = faixa(b);
        let tot = 0;
        A.ws.forEach((wa, i) => {
          const x1 = A.k0 + i;
          B.ws.forEach((wb, j) => {
            const x2 = B.k0 + j, pb = (x1 + x2) / (2 * m);
            const se = Math.sqrt(pb * (1 - pb) * 2 / m);
            if (se > 0 && Math.abs(x1 - x2) / m > zA * se) tot += wa * wb;
          });
        });
        return tot;
      }
      const ex = nS <= 20000 ? exato(nS) : null;

      const ZA = tone(texNum(zA), 2), ZB = tone(texNum(zB), 3), DD = tone(texNum(dif, 4), 4);
      const pct = x => `${texNum(x * 100, 2)}\\%`;
      const steps = [
        [T(`Encontre os valores críticos: z de α/2 = ${fmt(alpha / 2, 4)}% e z do poder, ${fmt(power, 2)}%, como na tabela Z:`, `Find the critical values: z for α/2 = ${fmt(alpha / 2, 4)}% and z for the power, ${fmt(power, 2)}%, as in the Z table:`),
          `z_{\\alpha/2} \\approx ${ZA}, \\qquad z_{\\beta} \\approx ${ZB}`],
        [T("Sob H₀, os dois grupos teriam a proporção média; sob H₁, cada um tem a sua:", "Under H₀, both groups would have the average proportion; under H₁, each has its own:"),
          `\\bar{p} = \\dfrac{${pct(a)} + ${pct(b)}}{2} = ${pct(pm)}, \\quad 2\\bar{p}\\bar{q} ${approx(v0, 5)} ${tone(texNum(v0, 5), 2)}, \\quad p_1q_1 + p_2q_2 ${approx(v1, 5)} ${tone(texNum(v1, 5), 3)}`],
        [T("Substitua na fórmula, com a diferença ao quadrado embaixo:", "Plug into the formula, with the squared difference below:"),
          `n = \\dfrac{\\left(${ZA}\\sqrt{${texNum(v0, 5)}} + ${ZB}\\sqrt{${texNum(v1, 5)}}\\right)^2}{${DD}^2} ${approx(base, 2)} ${texNum(base, 2)} \;\\to\; ${texNum(nS)}`],
      ];
      if (D !== 1) {
        steps.push([T(`O desenho multiplica a variância por ${fmt(D)}, e o n também:`, `The design multiplies the variance by ${fmt(D)}, and n too:`),
          `n = ${texNum(base, 2)} \\cdot ${tone(texNum(D), 5)} ${approx(base * D, 2)} ${texNum(base * D, 2)} \;\\to\; ${tone(texNum(n), 1)}`]);
      }
      if (ex !== null) {
        steps.push([T(`Confira somando a probabilidade de todos os pares de contagens (x₁, x₂) que o teste z rejeitaria, com ${fmt(nS)} pessoas por grupo numa amostra aleatória simples:`,
          `Check by adding up the probability of every pair of counts (x₁, x₂) the z-test would reject, with ${fmt(nS)} people per group in a simple random sample:`),
          `${T("\\text{poder}", "\\text{power}")}(n = ${texNum(nS)}) = ${pct(ex)}`]);
      }

      const nMax = Math.max(10, Math.ceil(n * 2.5));
      const stepN = Math.max(1, Math.ceil(nMax / 150));
      const pts = [];
      for (let k = stepN; k <= nMax; k += stepN) pts.push([k, pw(k)]);

      let note = T(`São precisos ${fmt(n)} por grupo (${fmt(2 * n)} no total) para detectar ${fmt(p1, 2)}% contra ${fmt(p2, 2)}% com ${fmt(power, 2)}% de chance, num teste bilateral a ${fmt(alpha, 2)}%.`,
        `You need ${fmt(n)} per group (${fmt(2 * n)} in total) to detect ${fmt(p1, 2)}% versus ${fmt(p2, 2)}% with ${fmt(power, 2)}% probability, in a two-sided test at ${fmt(alpha, 2)}%.`);
      if (ex !== null) {
        note += T(` Pela conta exata, ${fmt(nS)} por grupo dão ${fmt(ex * 100, 1)}% de poder numa amostra aleatória simples`, ` By the exact calculation, ${fmt(nS)} per group give ${fmt(ex * 100, 1)}% power in a simple random sample`)
          + (Math.abs(ex * 100 - power) >= 0.5 ? T(`, não ${fmt(power, 2)}%: a fórmula usa a normal, e as contagens andam de 1 em 1.`, `, not ${fmt(power, 2)}%: the formula uses the normal, and the counts move in steps of 1.`) : ".");
      }
      note += T(` Com a correção de continuidade, para analisar com o qui-quadrado corrigido ou o exato de Fisher, seriam ${fmt(nCC)} por grupo.`,
        ` With the continuity correction, to analyze with the corrected chi-square or Fisher's exact test, it would be ${fmt(nCC)} per group.`);
      const meio = (a + b) / 2;
      note += T(` Se a diferença real for metade (${fmt(p1, 2)}% contra ${fmt(meio * 100, 2)}%), o mesmo estudo teria só ${fmt(phi((dif / 2 * Math.sqrt(n / D) - zA * Math.sqrt(2 * ((a + meio) / 2) * (1 - (a + meio) / 2))) / Math.sqrt(a * (1 - a) + meio * (1 - meio))) * 100, 0)}% de poder: diferenças pequenas custam caro, e o n cresce com o inverso do quadrado delas.`,
        ` If the real difference is half (${fmt(p1, 2)}% versus ${fmt(meio * 100, 2)}%), the same study would have only ${fmt(phi((dif / 2 * Math.sqrt(n / D) - zA * Math.sqrt(2 * ((a + meio) / 2) * (1 - (a + meio) / 2))) / Math.sqrt(a * (1 - a) + meio * (1 - meio))) * 100, 0)}% power: small differences are expensive, and n grows with the inverse of their square.`);
      if (D === 1) note += T(` Se a amostra for por conglomerados, preencha o efeito de desenho; o <a href="${PAGE("simulador-pesquisa")}?desenho=conglomerados&amp;M=5000">simulador de pesquisa</a> mostra de onde ele vem.`,
        ` If the sample is clustered, fill in the design effect; the <a href="${PAGE("simulador-pesquisa")}?desenho=conglomerados&amp;M=5000">poll simulator</a> shows where it comes from.`);
      note += T(` Depois de coletar, analise com o <a href="/testes-estatisticos/z-duas-proporcoes/">teste z para duas proporções</a>.`,
        ` Once you have the data, analyze it with the <a href="/en/statistical-tests/two-proportion-z-test/">two-proportion z-test</a>.`);

      return {
        result: `n = ${tone(texNum(n), 1)}${T("\\text{ por grupo}", "\\text{ per group}")}`,
        chart: {
          type: "curve",
          label: T(`Poder do teste em função de n por grupo, para ${fmt(p1, 2)}% contra ${fmt(p2, 2)}% e α = ${fmt(alpha, 2)}%; com n = ${fmt(n)}, o poder é ${fmt(pw(n) * 100, 1)}%`,
            `Power of the test as a function of n per group, for ${fmt(p1, 2)}% versus ${fmt(p2, 2)}% and α = ${fmt(alpha, 2)}%; with n = ${fmt(n)}, power is ${fmt(pw(n) * 100, 1)}%`),
          xLabel: T("n por grupo", "n per group"), xMin: stepN, xMax: nMax, yMax: 1 / 1.08, pts, marker: [n, pw(n)],
          tipAt: v => {
            const k = Math.max(1, Math.round(v));
            return [`${fmt(pw(k) * 100, 1)}%`, T(`poder com n = ${fmt(k)} por grupo`, `power with n = ${fmt(k)} per group`)];
          },
        },
        steps,
        note,
      };
    },

    // Margem de erro de uma proporção (intervalo de Wald), com a correção para
    // população finita quando N é informado. A cobertura sai exata: soma a
    // probabilidade de cada contagem possível k cujo intervalo contém o p real
    // (binomial sem N, hipergeométrica com N, que é amostragem sem reposição).
    // Com deff (efeito de desenho), a variância é deff vezes a da amostra
    // aleatória simples, e o desenho se comporta como uma AAS de n/deff
    // pessoas: é com esse n efetivo que a cobertura e a simulação são feitas.
    // O intervalo de Wilson inverte o teste em vez de usar p̂ no erro padrão;
    // com a correção de população finita f, é o Wilson usual com z·f.
    margem({ n, p, conf, N, deff }) {
      if (!Number.isInteger(n) || n < 2) return { error: T("O tamanho da amostra precisa ser um inteiro maior ou igual a 2.", "The sample size must be an integer of at least 2.") };
      if (n > 1e6) return { error: T("Use n de no máximo 1.000.000.", "Use n of at most 1,000,000.") };
      if (p <= 0 || p >= 100) return { error: T("A proporção precisa estar entre 0 e 100%, sem os extremos.", "The proportion must be strictly between 0 and 100%.") };
      if (conf <= 0 || conf >= 100) return confError;
      if (N !== null && (!Number.isInteger(N) || N <= n)) return { error: T("A população precisa ser um inteiro maior que a amostra, ou ficar em branco.", "The population must be an integer larger than the sample, or left blank.") };
      if (deff !== null && (deff < 0.1 || deff > 20)) return { error: T("O efeito de desenho precisa estar entre 0,1 e 20, ou ficar em branco.", "The design effect must be between 0.1 and 20, or left blank.") };
      const D = deff === null ? 1 : deff;
      // Abaixo de 1 (estratos), o n efetivo passa de n, mas não da população.
      const nEff = Math.min(N === null ? Infinity : N - 1, Math.max(2, Math.round(n / D)));
      const z = zCrit(conf);
      const ph = p / 100;
      const se = Math.sqrt(ph * (1 - ph) / n);
      const f = N === null ? 1 : Math.sqrt((N - n) / (N - 1));
      const e = z * se * Math.sqrt(D) * f;
      const Z = tone(texNum(z), 2), P = tone(texNum(ph, 6), 3), NN = tone(texNum(n), 3);
      const pp = x => `${fmt(x * 100, 2)}`;
      const confTxt = `${fmt(conf, 2)}%`;

      // Wilson para uma proporção q observada em m pessoas, com z·f.
      const wilson = (q, m) => {
        const zz = (z * f) ** 2 / m;
        const c = (q + zz / 2) / (1 + zz), h = z * f / (1 + zz) * Math.sqrt(q * (1 - q) / m + (z * f) ** 2 / (4 * m * m));
        return [c - h, c + h];
      };

      // Distribuição de k, a contagem de "sim" em nEff pessoas, quando o p
      // real é p̂. Só a faixa de ±12 desvios importa; fora dela é nula.
      const K = N === null ? null : Math.round(ph * N);
      const truth = N === null ? ph : K / N;
      const lc = (a, b) => lgamma(a + 1) - lgamma(b + 1) - lgamma(a - b + 1);
      const sd = Math.sqrt(nEff * truth * (1 - truth)) * f;
      let k0 = Math.max(0, Math.floor(nEff * truth - 12 * sd - 1)), k1 = Math.min(nEff, Math.ceil(nEff * truth + 12 * sd + 1));
      if (K !== null) { k0 = Math.max(k0, nEff - (N - K)); k1 = Math.min(k1, K); }
      const pmf = [];
      for (let k = k0; k <= k1; k++) {
        pmf.push(K === null ? binPmf(nEff, truth, k) : Math.exp(lc(K, k) + lc(N - K, nEff - k) - lc(N, nEff)));
      }
      const tot = pmf.reduce((a, b) => a + b, 0);
      const ivl = k => { const q = k / nEff, h = z * Math.sqrt(q * (1 - q) / nEff) * f; return [q - h, q + h]; };
      let cover = 0, coverW = 0;
      pmf.forEach((w, i) => {
        const [lo, hi] = ivl(k0 + i);
        if (lo <= truth && truth <= hi) cover += w;
        const [wl, wh] = wilson((k0 + i) / nEff, nEff);
        if (wl <= truth && truth <= wh) coverW += w;
      });
      cover /= tot;
      coverW /= tot;

      // 100 pesquisas sorteadas pela inversa da acumulada.
      const cdf = [];
      pmf.reduce((acc, w, i) => (cdf[i] = acc + w / tot), 0);
      const rand = rng(n * 7919 + Math.round(p * 100) * 104729 + Math.round(conf * 100) + (N || 0) + Math.round(D * 1000));
      const draw = () => {
        const u = rand();
        let a = 0, b = cdf.length - 1;
        while (a < b) { const m = (a + b) >> 1; if (cdf[m] < u) a = m + 1; else b = m; }
        return k0 + a;
      };
      const rows = Array.from({ length: 100 }, () => {
        const k = draw(), [lo, hi] = ivl(k);
        return { lo, hi, mid: k / nEff, hit: lo <= truth && truth <= hi };
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
      if (D !== 1) {
        steps.push([T(`O desenho multiplica a variância por ${fmt(D)}; a margem ${D > 1 ? "cresce" : "encolhe"} pela raiz disso, e a amostra vale tanto quanto uma aleatória simples de n/deff pessoas:`,
          `The design multiplies the variance by ${fmt(D)}; the margin ${D > 1 ? "grows" : "shrinks"} by its square root, and the sample is worth as much as a simple random sample of n/deff people:`),
          `\\sqrt{${tone(texNum(D), 5)}} ${approx(Math.sqrt(D), 6)} ${tone(texNum(Math.sqrt(D), 6), 5)}, \\qquad n_{\\text{${T("ef", "eff")}}} = \\dfrac{${texNum(n)}}{${texNum(D)}} ${approx(n / D, 1)} ${texNum(n / D, 1)}`]);
      }
      const factors = `${Z} \\cdot ${tone(texNum(se, 6), 3)}${N !== null ? ` \\cdot ${tone(texNum(f, 6), 4)}` : ""}${D !== 1 ? ` \\cdot ${tone(texNum(Math.sqrt(D), 6), 5)}` : ""}`;
      steps.push([T("Multiplique tudo:", "Multiply everything:"), `E = ${factors} ${approx(e, 6)} ${tone(texNum(e, 6), 1)}`]);
      steps.push([T("Em pontos percentuais, o intervalo de Wald é p̂ ± E:", "In percentage points, the Wald interval is p̂ ± E:"),
        `${texNum(ph * 100, 2)}\\% \\pm ${tone(`${texNum(e * 100, 2)}`, 1)} ${approx(e * 100, 2)} \\left[\\,${texNum(ph * 100 - e * 100, 2)}${T("\\,;", ",")}\\ ${texNum(ph * 100 + e * 100, 2)}\\,\\right]`]);
      const [wl, wh] = wilson(ph, n / D);
      const zz = (z * f) ** 2 / (n / D);
      steps.push([T("O intervalo de Wilson não é simétrico: o centro é puxado para 50% e a meia-largura sai da mesma equação:",
        "The Wilson interval is not symmetric: its centre is pulled toward 50% and its half-width comes from the same equation:"),
        `\\dfrac{\\hat{p} + \\frac{z^2}{2n}}{1 + \\frac{z^2}{n}} \\pm \\dfrac{z}{1 + \\frac{z^2}{n}}\\sqrt{\\dfrac{\\hat{p}(1-\\hat{p})}{n} + \\dfrac{z^2}{4n^2}}`
        + ` = ${texNum((ph + zz / 2) / (1 + zz) * 100, 2)}\\% \\pm ${texNum((wh - wl) / 2 * 100, 2)} = \\left[\\,${texNum(wl * 100, 2)}${T("\\,;", ",")}\\ ${texNum(wh * 100, 2)}\\,\\right]`]);

      const gap = Math.abs(cover * 100 - conf);
      let note = T(`Com ${fmt(n)} entrevistas, a margem é de ±${pp(e)} pontos percentuais com ${confTxt} de confiança.`,
        `With ${fmt(n)} interviews, the margin is ±${pp(e)} percentage points at ${confTxt} confidence.`);
      if (D !== 1) {
        note += T(` Com efeito de desenho ${fmt(D)}, a amostra rende como ${fmt(nEff)} entrevistas por amostragem aleatória simples; sem ele, a margem seria ±${pp(e / Math.sqrt(D))}. O gráfico e as coberturas abaixo tratam o desenho como uma amostra aleatória simples de ${fmt(nEff)}, o que é uma aproximação.`,
          ` With a design effect of ${fmt(D)}, the sample is worth ${fmt(nEff)} interviews by simple random sampling; without it, the margin would be ±${pp(e / Math.sqrt(D))}. The chart and the coverages below treat the design as a simple random sample of ${fmt(nEff)}, which is an approximation.`);
      }
      note += T(` No gráfico, 100 pesquisas sorteadas de uma população em que o p real é ${pp(truth)}%: ${misses} ${misses === 1 ? "intervalo não o contém" : "intervalos não o contêm"}.`,
        ` The chart shows 100 polls drawn from a population whose true p is ${pp(truth)}%: ${misses} interval${misses === 1 ? " misses" : "s miss"} it.`);
      note += T(` Somando todos os resultados possíveis, a cobertura exata do intervalo de Wald é ${fmt(cover * 100, 2)}%`,
        ` Adding up every possible outcome, the exact coverage of the Wald interval is ${fmt(cover * 100, 2)}%`)
        + (gap >= 0.1
          ? T(`, não ${confTxt}: a fórmula usa a aproximação normal e um z arredondado, e a contagem k só anda de 1 em 1.`, `, not ${confTxt}: the formula relies on the normal approximation and a rounded z, and the count k moves in steps of 1.`)
          : ".");
      note += T(` A do intervalo de Wilson, [${fmt(wl * 100, 2)}; ${fmt(wh * 100, 2)}], é ${fmt(coverW * 100, 2)}%.`,
        ` That of the Wilson interval, [${fmt(wl * 100, 2)}, ${fmt(wh * 100, 2)}], is ${fmt(coverW * 100, 2)}%.`);
      if (nEff * Math.min(ph, 1 - ph) < 10) note += ` ${warn} ${T("com menos de 10 casos esperados de um dos lados, a aproximação normal falha e a cobertura do Wald pode ficar bem abaixo do nominal; prefira o intervalo de Wilson.", "with fewer than 10 expected cases on one side, the normal approximation breaks down and the Wald coverage can fall well below nominal; prefer the Wilson interval.")}`;
      note += T(` Para o caminho inverso, da margem para o tamanho da amostra, use a <a href="${PAGE("cochran-formula")}?conf=${conf}&amp;p=${p}&amp;e=${(e * 100).toFixed(2)}">fórmula de Cochran</a>.`,
        ` For the reverse, from the margin to the sample size, use <a href="${PAGE("cochran-formula")}?conf=${conf}&amp;p=${p}&amp;e=${(e * 100).toFixed(2)}">Cochran's formula</a>.`);
      if (N !== null && N <= 1e9 && D === 1) {
        const sim = `${PAGE("simulador-pesquisa")}?N=${N}&amp;P=${p}&amp;n=${n}&amp;conf=${conf}&amp;M=1000&amp;seed=2026`;
        note += T(` Para sortear milhares de pesquisas e ver a cobertura se formar, abra o <a href="${sim}">simulador de pesquisa</a>.`,
          ` To draw thousands of polls and watch the coverage take shape, open the <a href="${sim}">poll simulator</a>.`);
      }

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

    // Simulador de pesquisas: M amostras de uma população conhecida, dividida
    // em bairros de ~500 pessoas. A proporção de cada bairro sai de uma Beta
    // com média P e correlação intraclasse rho (rho = 0: bairros iguais), e os
    // eleitores de A são repartidos para o total dar exatamente round(P·N).
    // A população é sempre a mesma (semente fixa); a semente do campo só muda
    // as pesquisas. Três desenhos, todos com n entrevistas:
    //   aas: amostra aleatória simples. A contagem é sorteada pela inversa da
    //        acumulada hipergeométrica, que é exatamente o sorteio sem reposição.
    //   conglomerados: sorteia n/b bairros e b pessoas em cada um.
    //   estratos: os bairros, ordenados pela proporção, formam 4 regiões; cada
    //        uma recebe uma parte de n proporcional ao tamanho.
    // Em todos, a pesquisa publica a margem da AAS, como se não soubesse o desenho.
    simulacao({ N, P, n, conf, M, seed, desenho, rho, b }) {
      if (!Number.isInteger(N) || N < 1000 || N > 1e8) return { error: T("A população precisa ser um inteiro entre 1.000 e 100.000.000.", "The population must be an integer between 1,000 and 100,000,000.") };
      if (P <= 0 || P >= 100) return { error: T("A proporção verdadeira precisa estar entre 0 e 100%, sem os extremos.", "The true proportion must be strictly between 0 and 100%.") };
      if (!Number.isInteger(n) || n < 2 || n >= N) return { error: T("A amostra precisa ser um inteiro de pelo menos 2 e menor que a população.", "The sample must be an integer of at least 2 and smaller than the population.") };
      if (n > 1e6) return { error: T("Use n de no máximo 1.000.000.", "Use n of at most 1,000,000.") };
      if (conf <= 0 || conf >= 100) return confError;
      if (!Number.isInteger(M) || M < 1 || M > 100000) return { error: T("O número de pesquisas precisa ser um inteiro entre 1 e 100.000.", "The number of polls must be an integer between 1 and 100,000.") };
      if (!Number.isInteger(seed) || seed < 0) return { error: T("A semente precisa ser um inteiro não negativo.", "The seed must be a non-negative integer.") };
      if (!["aas", "conglomerados", "estratos"].includes(desenho)) desenho = "aas";
      if (desenho !== "aas" && (rho < 0 || rho >= 1)) return { error: T("A correlação intraclasse precisa estar entre 0 e 1 (por exemplo, 0,05).", "The intraclass correlation must be between 0 and 1 (for example, 0.05).") };

      // A população em bairros.
      const C = Math.max(4, Math.round(N / 500));
      const tamanhos = apportion(N, new Array(C).fill(1)).out;
      const K = Math.round(P / 100 * N);
      if (K < 1 || K >= N) return { error: T("Com essa população, a proporção arredondada dá 0% ou 100% de eleitores; aumente N.", "With this population, the rounded proportion gives 0% or 100% of voters; increase N.") };
      const truth = K / N;
      const r = desenho === "aas" ? 0 : rho;
      const Kc = bairros(tamanhos, K, truth, r);

      const fpc = (N - n) / (N - 1);
      const t = tCrit(1 - conf / 100, n - 1);
      const se = Math.sqrt(fpc * truth * (1 - truth) / n);
      const confTxt = `${fmt(conf, 2)}%`;
      const pp = (x, d = 2) => fmt(x * 100, d);
      const lc = (a, c) => lgamma(a + 1) - lgamma(c + 1) - lgamma(a - c + 1);

      // Acumulada hipergeométrica de k em m sorteios de uma urna com Nt
      // bolas, Kt delas de A; com a faixa e o sorteio pela inversa.
      function urna(Nt, Kt, m) {
        const mu = m * Kt / Nt, s = Math.sqrt(Math.max(1e-12, m * (Kt / Nt) * (1 - Kt / Nt) * (Nt - m) / Math.max(1, Nt - 1)));
        const a0 = Math.max(0, m - (Nt - Kt), Math.floor(mu - 12 * s - 1)), a1 = Math.min(m, Kt, Math.ceil(mu + 12 * s + 1));
        const pmf = [];
        for (let k = a0; k <= a1; k++) pmf.push(Math.exp(lc(Kt, k) + lc(Nt - Kt, m - k) - lc(Nt, m)));
        const tot = pmf.reduce((x, y) => x + y, 0);
        const cdf = [];
        pmf.reduce((acc, w, i) => (cdf[i] = acc + w / tot), 0);
        const draw = u => { let lo = 0, hi = cdf.length - 1; while (lo < hi) { const md = (lo + hi) >> 1; if (cdf[md] < u) lo = md + 1; else hi = md; } return a0 + lo; };
        return { a0, pmf: pmf.map(w => w / tot), draw };
      }

      const hitOf = q => { const h = t * Math.sqrt(fpc * q * (1 - q) / n); return q - h <= truth && truth <= q + h; };
      const rand = rng(seed);
      const steps = [];
      let sorteia, nota = "";

      // A referência: a AAS exata, para a cobertura e a linha do histograma.
      const ref = urna(N, K, n);
      let coverAAS = 0, below = 0, above = 0;
      ref.pmf.forEach((w, i) => {
        const k = ref.a0 + i;
        if (hitOf(k / n)) coverAAS += w; else if (k < n * truth) below += w; else above += w;
      });

      steps.push([T("Eleitores de A na população, e a proporção verdadeira:", "Voters for A in the population, and the true proportion:"),
        `K = ${texNum(K)}, \\quad ${tone("P", 3)} = \\dfrac{${texNum(K)}}{${texNum(N)}} ${approx(truth, 6)} ${tone(texNum(truth, 6), 3)}`]);
      steps.push([T(`Valor crítico da t com ${dof(n - 1)}, para ${confTxt}:`, `Critical value of t with ${dof(n - 1)}, for ${confTxt}:`), `t ${approx(t, 5)} ${texNum(t, 5)}`]);
      steps.push([T("Erro padrão de p̂ numa amostra aleatória simples, com a correção de população finita:", "Standard error of p̂ in a simple random sample, with the finite population correction:"),
        `\\sqrt{\\dfrac{${texNum(N)} - ${texNum(n)}}{${texNum(N)} - 1} \\cdot \\dfrac{${texNum(truth, 6)} \\cdot ${texNum(1 - truth, 6)}}{${texNum(n)}}} ${approx(se, 6)} ${texNum(se, 6)}`]);

      if (desenho === "aas") {
        sorteia = () => ref.draw(rand()) / n;
        steps.push([T("Margem de uma pesquisa que acertasse p̂ = P em cheio:", "Margin of a poll that hit p̂ = P exactly:"),
          `${texNum(t, 5)} \\cdot ${texNum(se, 6)} ${approx(t * se, 6)} ${texNum(t * se, 6)} = ${texNum(t * se * 100, 2)}\\text{ p.p.}`]);
        const kIn = ref.pmf.map((_, i) => ref.a0 + i).filter(k => hitOf(k / n));
        if (kIn.length) {
          steps.push([T(`Cada pesquisa calcula a margem com o próprio p̂. O intervalo contém P quando k vai de ${fmt(kIn[0])} a ${fmt(kIn[kIn.length - 1])}; somando a probabilidade hipergeométrica desses k:`,
            `Each poll computes the margin with its own p̂. The interval contains P when k runs from ${fmt(kIn[0])} to ${fmt(kIn[kIn.length - 1])}; adding up the hypergeometric probability of those k:`),
            `${tone("C", 1)} = \\sum_{k=${texNum(kIn[0])}}^{${texNum(kIn[kIn.length - 1])}} \\dfrac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}} ${approx(coverAAS * 100, 4)} ${tone(texNum(coverAAS * 100, 4), 1)}\\%`]);
        }
      } else if (desenho === "conglomerados") {
        if (!Number.isInteger(b) || b < 1) return { error: T("As pessoas por bairro precisam ser um inteiro positivo.", "People per neighbourhood must be a positive integer.") };
        const minTam = Math.min(...tamanhos);
        if (b > minTam) return { error: T(`Use no máximo ${fmt(minTam)} pessoas por bairro, o tamanho do menor bairro.`, `Use at most ${fmt(minTam)} people per neighbourhood, the size of the smallest one.`) };
        if (n % b) return { error: T(`O tamanho da amostra (${fmt(n)}) precisa ser múltiplo das pessoas por bairro (${fmt(b)}).`, `The sample size (${fmt(n)}) must be a multiple of the people per neighbourhood (${fmt(b)}).`) };
        const m = n / b;
        if (m > C) return { error: T(`Seriam ${fmt(m)} bairros, mas a população só tem ${fmt(C)}; aumente as pessoas por bairro.`, `That would take ${fmt(m)} neighbourhoods, but the population has only ${fmt(C)}; increase the people per neighbourhood.`) };
        const urnas = tamanhos.map((Nt, c) => urna(Nt, Kc[c], b));
        const idx = Array.from({ length: C }, (_, i) => i);
        sorteia = () => {
          let k = 0;
          for (let i = 0; i < m; i++) {
            const j = i + Math.floor(rand() * (C - i));
            const x = idx[i]; idx[i] = idx[j]; idx[j] = x;
            k += urnas[idx[i]].draw(rand());
          }
          return k / n;
        };
        const rr = rhoReal(tamanhos, Kc, truth), deffK = 1 + (b - 1) * rr;
        // Variância exata do desenho em dois estágios (bairros sem reposição,
        // pessoas sem reposição dentro de cada um), com o estimador p̂ = k/n.
        const Pc = Kc.map((k, c) => k / tamanhos[c]);
        const S1 = Pc.reduce((acc, x) => acc + (x - truth) ** 2, 0) / (C - 1);
        const S2 = tamanhos.reduce((acc, x, c) => acc + (1 - b / x) * x / (x - 1) * Pc[c] * (1 - Pc[c]) / b, 0) / C;
        const deffT = ((1 - m / C) * S1 / m + S2 / m) / (se * se);
        steps.push([T(`Sorteiam-se ${fmt(m)} dos ${fmt(C)} bairros e ${fmt(b)} pessoas em cada um. Vizinhos votam parecido, e a regra de Kish dá o efeito de desenho pela correlação intraclasse ρ da população:`,
          `${fmt(m)} of the ${fmt(C)} neighbourhoods are drawn, and ${fmt(b)} people in each. Neighbours vote alike, and Kish's rule gives the design effect from the population's intraclass correlation ρ:`),
          `\\text{deff} \\approx 1 + (b - 1)\\,\\rho = 1 + ${texNum(b - 1)} \\cdot ${texNum(rr, 4)} ${approx(deffK, 3)} ${texNum(deffK, 3)}`]);
        steps.push([T(`A regra supõe poucos bairros sorteados entre muitos. Aqui entram ${fmt(m / C * 100, 0)}% deles, e a variância exata dos dois estágios desconta isso:`,
          `The rule assumes few neighbourhoods drawn out of many. Here ${fmt(m / C * 100, 0)}% of them are drawn, and the exact two-stage variance accounts for that:`),
          `\\text{deff} = \\dfrac{\\left(1 - \\frac{${texNum(m)}}{${texNum(C)}}\\right)\\frac{S_1^2}{${texNum(m)}} + \\frac{\\bar{S}_2^2}{${texNum(m)}}}{\\operatorname{Var}_{\\text{${T("AAS", "SRS")}}}} ${approx(deffT, 3)} ${tone(texNum(deffT, 3), 5)}`]);
        nota = T(` Pelo desenho, o efeito esperado é ${fmt(deffT, 2)}: a margem certa seria √${fmt(deffT, 2)} ≈ ${fmt(Math.sqrt(deffT), 2)} vez a publicada.`,
          ` From the design, the expected effect is ${fmt(deffT, 2)}: the right margin would be √${fmt(deffT, 2)} ≈ ${fmt(Math.sqrt(deffT), 2)} times the published one.`);
      } else {
        // Quatro regiões com bairros parecidos entre si.
        const ordem = Array.from({ length: C }, (_, i) => i).sort((x, y) => Kc[x] / tamanhos[x] - Kc[y] / tamanhos[y]);
        const H = 4, grupos = Array.from({ length: H }, (_, h) => ordem.slice(Math.round(h * C / H), Math.round((h + 1) * C / H)));
        const Nh = grupos.map(g => g.reduce((s, c) => s + tamanhos[c], 0));
        const Kh = grupos.map(g => g.reduce((s, c) => s + Kc[c], 0));
        const nh = apportion(n, Nh).out;
        if (nh.some(x => x < 1)) return { error: T("A amostra é pequena demais para os 4 estratos; aumente n.", "The sample is too small for the 4 strata; increase n.") };
        const urnas = Nh.map((x, h) => urna(x, Kh[h], nh[h]));
        sorteia = () => urnas.reduce((s, u, h) => s + Nh[h] / N * u.draw(rand()) / nh[h], 0);
        const vEst = Nh.reduce((s, x, h) => { const ph = Kh[h] / x; return s + (x / N) ** 2 * (x - nh[h]) / (x - 1) * ph * (1 - ph) / nh[h]; }, 0);
        const deffT = vEst / (se * se);
        steps.push([T(`Os bairros, ordenados pela proporção de A, formam 4 regiões; cada uma recebe uma parte de n proporcional ao seu tamanho (${list(nh.map(x => fmt(x)))} entrevistas), e o p̂ é a média das regiões, pesada pelo tamanho:`,
          `The neighbourhoods, sorted by their share of A, form 4 regions; each gets a part of n proportional to its size (${list(nh.map(x => fmt(x)))} interviews), and p̂ is the size-weighted mean of the regions:`),
          `P_h = ${Kh.map((k, h) => texNum(k / Nh[h] * 100, 1) + "\\%").join(",\\ ")}, \\qquad \\text{deff} = \\dfrac{\\operatorname{Var}_{\\text{${T("estr", "strat")}}}}{\\operatorname{Var}_{\\text{${T("AAS", "SRS")}}}} ${approx(deffT, 3)} ${tone(texNum(deffT, 3), 5)}`]);
        nota = T(` Pelo desenho, o efeito esperado é ${fmt(deffT, 2)}: as regiões são diferentes entre si, e cada uma é medida à parte, sem o sorteio desequilibrar quanto se ouve de cada.`,
          ` From the design, the expected effect is ${fmt(deffT, 2)}: the regions differ from each other, and each one is measured separately, without the draw unbalancing how much is heard from each.`);
      }

      // As M pesquisas.
      const qs = new Float64Array(M);
      const last = [], path = [];
      let sum = 0, sum2 = 0, covered = 0;
      const every = Math.max(1, Math.floor(M / 400));
      for (let j = 1; j <= M; j++) {
        const q = sorteia();
        qs[j - 1] = q;
        sum += q; sum2 += q * q;
        const hit = hitOf(q);
        if (hit) covered++;
        if (j > M - 30) { const h = t * Math.sqrt(fpc * q * (1 - q) / n); last.push({ lo: q - h, hi: q + h, mid: q, hit, j }); }
        if (j % every === 0 || j === M) path.push([j, covered / j * 100]);
      }
      const mean = sum / M;
      const sdObs = M > 1 ? Math.sqrt(Math.max(0, (sum2 - M * mean * mean) / (M - 1))) : NaN;
      const covObs = covered / M;
      const deffObs = sdObs * sdObs / (se * se);
      const mc = Math.sqrt(Math.max(covObs, 0.01) * (1 - Math.min(covObs, 0.99)) / M);
      // Cobertura se a margem levasse em conta o efeito observado.
      let coveredD = 0;
      if (desenho !== "aas" && M >= 30) {
        const f = Math.sqrt(deffObs);
        for (let j = 0; j < M; j++) { const q = qs[j], h = f * t * Math.sqrt(fpc * q * (1 - q) / n); if (q - h <= truth && truth <= q + h) coveredD++; }
      }

      // Histograma de p̂, em faixas de 1/n (ou de vários 1/n), com a AAS
      // exata em linha como referência. Em destaque, onde o intervalo erra P.
      let lo = Math.min(truth - 5 * se, ...(M <= 5000 ? Array.from(qs) : [truth - 5 * se * Math.max(1, Math.sqrt(deffObs))]));
      let hi = Math.max(truth + 5 * se, ...(M <= 5000 ? Array.from(qs) : [truth + 5 * se * Math.max(1, Math.sqrt(deffObs))]));
      const w = Math.max(1, Math.ceil((hi - lo) * n / 70));
      const bw = w / n;
      lo = (Math.floor(lo * n / w) * w - 0.5) / n;
      const nb = Math.ceil((hi - lo) / bw) + 1;
      const counts = new Array(nb).fill(0), exp = new Array(nb).fill(0);
      qs.forEach(q => { const i = Math.floor((q - lo) / bw); if (i >= 0 && i < nb) counts[i]++; });
      ref.pmf.forEach((p, i) => { const k = (ref.a0 + i) / n, j = Math.floor((k - lo) / bw); if (j >= 0 && j < nb) exp[j] += p; });
      const bins = [], pts = [];
      for (let i = 0; i < nb; i++) {
        const x0 = (lo + i * bw) * 100, x1 = (lo + (i + 1) * bw) * 100;
        const mid = (lo + (i + 0.5) * bw);
        bins.push({ x0, x1, y: counts[i] / M * 100, count: counts[i], exp: exp[i] * 100, miss: !hitOf(Math.min(1, Math.max(0, mid))), mid });
        pts.push([x0, exp[i] * 100], [x1, exp[i] * 100]);
      }
      while (bins.length > 1 && !bins[0].count && bins[0].exp < 1e-3) { bins.shift(); pts.splice(0, 2); }
      while (bins.length > 1 && !bins[bins.length - 1].count && bins[bins.length - 1].exp < 1e-3) { bins.pop(); pts.splice(-2, 2); }
      const yMax = Math.max(...bins.map(x => Math.max(x.y, x.exp)));

      const charts = [{
        type: "hist", height: 250,
        label: T(`Distribuição de p̂ em ${fmt(M)} pesquisas sorteadas, com a distribuição exata da amostra aleatória simples em linha; em destaque, os resultados cujo intervalo não contém P`,
          `Distribution of p̂ over ${fmt(M)} simulated polls, with the exact distribution under simple random sampling as a line; highlighted, the outcomes whose interval misses P`),
        xLabel: T(`p̂ (%), barras: frequência observada; linha: ${desenho === "aas" ? "probabilidade exata" : "como seria por AAS"} (%)`, `p̂ (%), bars: observed frequency; line: ${desenho === "aas" ? "exact probability" : "what SRS would give"} (%)`),
        xMin: bins[0].x0, xMax: bins[bins.length - 1].x1, yMax,
        bins, pts, lineCls: "chart-line is-exact",
        binTip: x => [T(`${fmt(x.count)} ${x.count === 1 ? "pesquisa" : "pesquisas"} (${fmt(x.y, 2)}%)`, `${fmt(x.count)} poll${x.count === 1 ? "" : "s"} (${fmt(x.y, 2)}%)`),
          T(`p̂ entre ${fmt(x.x0, 2)}% e ${fmt(x.x1, 2)}%; AAS: ${fmt(x.exp, 2)}%${x.miss ? "; intervalo erra P" : ""}`, `p̂ between ${fmt(x.x0, 2)}% and ${fmt(x.x1, 2)}%; SRS: ${fmt(x.exp, 2)}%${x.miss ? "; interval misses P" : ""}`)],
      }];

      const from = M >= 100 ? 20 : 1;
      const run = path.filter(([j]) => j >= from);
      if (run.length > 1) {
        const ys = run.map(([, y]) => y).concat(conf, coverAAS * 100);
        const ylo = Math.min(...ys), yhi = Math.max(...ys), pad = Math.max(0.3, (yhi - ylo) * 0.1);
        charts.push({
          type: "curve", height: 210,
          label: T(`Cobertura acumulada dos intervalos ao longo das pesquisas; linhas em ${confTxt} (nominal) e ${pp(coverAAS)}% (exata da AAS)`,
            `Running coverage of the intervals across polls; lines at ${confTxt} (nominal) and ${pp(coverAAS)}% (exact for SRS)`),
          xLabel: T(`cobertura acumulada (%) por pesquisas sorteadas${from > 1 ? ` (da ${from}ª em diante)` : ""} · tracejada: nominal · cheia: exata da AAS`,
            `running coverage (%) by polls drawn${from > 1 ? ` (from the ${from}th on)` : ""} · dashed: nominal · solid: exact for SRS`),
          xMin: run[0][0], xMax: run[run.length - 1][0],
          yMin: Math.max(0, ylo - pad), yMax: Math.min(100, yhi + pad),
          pts: run,
          hlines: [{ y: conf, cls: "chart-ref" }, { y: coverAAS * 100, cls: "chart-truth" }],
          tipAt: x => {
            let best = run[0];
            for (const rr of run) if (Math.abs(rr[0] - x) < Math.abs(best[0] - x)) best = rr;
            return [`${fmt(best[1], 2)}%`, T(`cobertura após ${fmt(best[0])} pesquisas`, `coverage after ${fmt(best[0])} polls`)];
          },
        });
      }

      const span = Math.max(...last.map(x => Math.max(truth - x.lo, x.hi - truth)));
      const lastMiss = last.filter(x => !x.hit).length;
      charts.push({
        type: "intervals", height: 260,
        label: T(`Os últimos ${last.length} intervalos de ${confTxt}; ${lastMiss} não contêm P = ${pp(truth)}%`,
          `The last ${last.length} ${confTxt} intervals; ${lastMiss} miss P = ${pp(truth)}%`),
        xLabel: T("intervalos das últimas pesquisas (%)", "intervals of the latest polls (%)"),
        xMin: (truth - span * 1.1) * 100, xMax: (truth + span * 1.1) * 100, truth: truth * 100,
        rows: last.map(x => ({ lo: x.lo * 100, hi: x.hi * 100, mid: x.mid * 100, hit: x.hit, j: x.j })),
        tip: x => [`${fmt(x.lo, 2)}% – ${fmt(x.hi, 2)}%`,
          T(`pesquisa ${fmt(x.j)}: p̂ = ${fmt(x.mid, 2)}%${x.hit ? "" : ", erra P"}`, `poll ${fmt(x.j)}: p̂ = ${fmt(x.mid, 2)}%${x.hit ? "" : ", misses P"}`)],
      });

      let note = T(`Em ${fmt(M)} ${M === 1 ? "pesquisa" : "pesquisas"}, ${fmt(covered)} ${covered === 1 ? "intervalo conteve" : "intervalos contiveram"} P: cobertura observada de ${pp(covObs)}%`,
        `In ${fmt(M)} poll${M === 1 ? "" : "s"}, ${fmt(covered)} interval${covered === 1 ? "" : "s"} contained P: observed coverage of ${pp(covObs)}%`)
        + (desenho === "aas" ? T(`, contra a exata de ${pp(coverAAS)}%.`, `, against the exact ${pp(coverAAS)}%.`)
          : T(`, contra ${pp(coverAAS)}% se as mesmas ${fmt(n)} entrevistas fossem uma amostra aleatória simples.`, `, against ${pp(coverAAS)}% if the same ${fmt(n)} interviews were a simple random sample.`));
      if (M >= 30) {
        note += T(` Com esse número de pesquisas, o erro de Monte Carlo da cobertura é de ±${pp(mc)} ${mc * 100 >= 2 ? "pontos" : "ponto"}.`,
          ` With this many polls, the Monte Carlo error of the coverage is ±${pp(mc)} points.`);
        note += T(` O desvio padrão observado de p̂ foi ${pp(sdObs, 3)}%, contra ${pp(se, 3)}% da AAS`, ` The observed standard deviation of p̂ was ${pp(sdObs, 3)}%, against ${pp(se, 3)}% under SRS`)
          + (desenho === "aas" ? "." : T(`: o efeito de desenho observado é ${fmt(deffObs, 2)}.`, `: the observed design effect is ${fmt(deffObs, 2)}.`));
        note += nota;
        if (desenho !== "aas") {
          note += T(` Com a margem multiplicada por √${fmt(deffObs, 2)}, como faz a <a href="${PAGE("margem-de-erro")}?n=${n}&amp;p=${fmt(P, 4).replace(/\./g, "")}&amp;conf=${conf}&amp;N=${N}&amp;deff=${fmt(deffObs, 2)}">calculadora de margem de erro</a> com o campo deff, a cobertura seria ${pp(coveredD / M)}%.`,
            ` With the margin multiplied by √${fmt(deffObs, 2)}, as the <a href="${PAGE("margem-de-erro")}?n=${n}&amp;p=${P}&amp;conf=${conf}&amp;N=${N}&amp;deff=${fmt(deffObs, 2)}">margin of error calculator</a> does with its deff field, the coverage would be ${pp(coveredD / M)}%.`);
        }
      } else {
        note += T(" Use os botões para sortear mais pesquisas e ver a cobertura observada se firmar.", " Use the buttons to draw more polls and watch the observed coverage settle.");
      }
      if (desenho === "aas" && Math.abs(coverAAS * 100 - conf) >= 0.01) {
        note += T(` A cobertura exata não é ${confTxt}: das que erram, ${pp(below)}% ficam abaixo de P e ${pp(above)}% acima, porque k só anda de 1 em 1 e o erro padrão de cada pesquisa é estimado.`,
          ` The exact coverage is not ${confTxt}: of the misses, ${pp(below)}% fall below P and ${pp(above)}% above, because k moves in steps of 1 and each poll's standard error is estimated.`);
      }
      note += T(` A conta inteira, passo a passo, está no post <a href="/margem-de-erro-pesquisa-eleitoral-amostragem/">de onde sai a margem de erro de uma pesquisa</a>.`,
        ` The whole calculation, step by step, is in the post <a href="/polling-margin-of-error-sampling/">where a poll's margin of error comes from</a>.`);

      return {
        result: `${T("\\text{cobertura}", "\\text{coverage}")} = ${tone(texNum(covObs * 100, 2), 1)}\\% \\quad (${desenho === "aas" ? T("\\text{exata}", "\\text{exact}") : T("\\text{AAS}", "\\text{SRS}")}\\ ${texNum(coverAAS * 100, 2)}\\%)`,
        chart: charts,
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
      // Dispersão com a reta: os pontos se arrastam e os campos x e y seguem.
      // A previsão entra na faixa do eixo para o anel não cair fora da figura.
      const pad = (lo, hi) => { const s = hi - lo || Math.abs(hi) || 1; return [lo - s * 0.12, hi + s * 0.12]; };
      const pred = x0.length ? [x0[0], b0 + b1 * x0[0]] : null;
      const [xMin, xMax] = pad(Math.min(...x, ...(pred ? [pred[0]] : [])), Math.max(...x, ...(pred ? [pred[0]] : [])));
      const [yMin, yMax] = pad(Math.min(...y, ...(pred ? [pred[1]] : [])), Math.max(...y, ...(pred ? [pred[1]] : [])));
      const chart = {
        type: "scatter", height: 300, xMin, xMax, yMin, yMax, pred,
        dots: x.map((v, i) => [v, y[i]]),
        fields: ["x", "y"],
        label: T("Pontos (x, y) com a reta de mínimos quadrados e os resíduos", "Points (x, y) with the least-squares line and the residuals"),
        xLabel: "x",
        hint: T("Arraste os pontos e veja a reta se ajustar; toque num espaço vazio para acrescentar um. Pelo teclado: setas movem o ponto em foco (com Shift, dez vezes mais), Delete o remove. As linhas tracejadas são os resíduos, cujos quadrados a reta minimiza.",
          "Drag the points and watch the line adjust; tap an empty spot to add one. With the keyboard: arrows move the focused point (ten times as far with Shift), Delete removes it. The dashed lines are the residuals, whose squares the line minimises."),
      };
      return { result: line, steps, note, chart };
    },

    // Problema do aniversário. A conta vai pelo complemento, fator a fator,
    // sem fatoriais: 365! não cabe num double. A simulação usa a mesma
    // semente para dar sempre o mesmo resultado com os mesmos valores.
    aniversario({ n, d, seed }) {
      if (!Number.isInteger(d) || d < 1) return { error: T("O número de dias precisa ser um inteiro positivo.", "The number of days must be a positive integer.") };
      if (d > 1e6) return { error: T("Use no máximo 1.000.000 de dias.", "Use at most 1,000,000 days.") };
      if (!Number.isInteger(n) || n < 1) return { error: T("O tamanho do grupo precisa ser um inteiro positivo.", "The group size must be a positive integer.") };
      if (n > 1e5) return { error: T("Use no máximo 100.000 pessoas.", "Use at most 100,000 people.") };
      if (!Number.isInteger(seed)) return { error: T("A semente precisa ser um número inteiro.", "The seed must be a whole number.") };

      // q[k]: chance de k pessoas terem todas aniversários diferentes. A curva
      // vai até onde a coincidência passa de 99,9% (ou um pouco além de n).
      const q = [1];
      let n50 = null, n99 = null;
      for (let k = 1; k <= d + 1 && (k <= Math.ceil(n * 1.25) || q[k - 1] > 0.001); k++) {
        q[k] = q[k - 1] * (d - k + 1) / d;
        if (n50 === null && 1 - q[k] >= 0.5) n50 = k;
        if (n99 === null && 1 - q[k] >= 0.99) n99 = k;
      }
      const qn = n > d ? 0 : q[n], p = 1 - qn;
      const K = q.length - 1;
      const every = Math.max(1, Math.ceil(K / 400));
      const pts = [];
      for (let k = 1; k <= K; k += every) pts.push([k, 100 * (1 - q[k])]);
      if (pts[pts.length - 1][0] !== K) pts.push([K, 100 * (1 - q[K])]);

      // Acima de 99,99% o arredondamento escreveria 100%, que é certeza.
      const near = x => x > 0.9999 && x < 1;
      const pTex = x => (near(x) ? `>${braces(fmt(99.99, 2))}\\%` : pctTex(x));
      const pTxt = x => (near(x) ? T("mais de 99,99%", "over 99.99%") : `${fmtSci(x * 100, 2)}%`);

      const D = tone(texNum(d, 0), 2), N = tone(texNum(n, 0), 3);
      const frac = k => `\\dfrac{${texNum(d - k, 0)}}{${texNum(d, 0)}}`;
      const prod = n <= 4
        ? Array.from({ length: n }, (_, k) => frac(k)).join(" \\cdot ")
        : `${frac(0)} \\cdot ${frac(1)} \\cdots ${frac(n - 1)}`;
      const steps = n > d
        ? [[T(`Com mais pessoas (${fmt(n)}) que dias (${fmt(d)}), algum dia se repete com certeza: é o princípio da casa dos pombos.`, `With more people (${fmt(n)}) than days (${fmt(d)}), some day must repeat: it is the pigeonhole principle.`),
          `P(\\text{${T("todos diferentes", "all different")}}) = 0 \\quad\\Rightarrow\\quad P(A) = 1`]]
        : [[T("Calcule a chance de todos os aniversários serem diferentes: a primeira pessoa pode nascer em qualquer dia, a segunda em qualquer um menos o da primeira, e assim por diante.",
            "Compute the chance that all birthdays are different: the first person can be born on any day, the second on any day but the first one's, and so on."),
          `\\dfrac{${D}!}{(${D} - ${N})!\\, ${D}^{\\,${N}}} = ${prod} ${approx(qn, 6)} ${texSci(qn, 4)}`],
          [T("A coincidência é o complemento:", "A shared birthday is the complement:"),
            `P(A) = 1 - ${texSci(qn, 4)} ${approx(p, 6)} ${tone(pTex(p), 1)}`]];

      const pairs = n * (n - 1) / 2;
      if (n >= 2 && n <= d) {
        const aprox = 1 - Math.exp(-pairs / d);
        steps.push([T(`O que pesa são os pares: ${fmt(n)} pessoas formam ${fmt(pairs)} deles, cada um com chance 1/${fmt(d)} de coincidir. Tratar os pares como independentes dá uma boa aproximação:`,
          `What matters is the pairs: ${fmt(n)} people form ${fmt(pairs)} of them, each with a 1/${fmt(d)} chance of matching. Treating the pairs as independent gives a good approximation:`),
        `\\dbinom{${N}}{2} = ${texNum(pairs, 0)}, \\qquad 1 - e^{-${texNum(pairs, 0)}/${texNum(d, 0)}} ${approx(aprox, 6)} ${pTex(aprox)}`]);
      }

      // Simulação: até 10 mil grupos, menos se o grupo for grande. Cada grupo
      // para no primeiro dia repetido; o carimbo evita zerar o vetor a cada vez.
      // Com uma pessoa só não há o que sortear.
      const G = Math.max(20, Math.min(10000, Math.floor(2e6 / n)));
      const rand = rng(seed), seen = new Int32Array(n >= 2 ? d : 0);
      let hits = 0;
      for (let g = 1; g <= G && n >= 2; g++) {
        for (let i = 0; i < n; i++) {
          const day = Math.floor(rand() * d);
          if (seen[day] === g) { hits++; break; }
          seen[day] = g;
        }
      }
      if (n >= 2) steps.push([T(`Confira sorteando: em ${fmt(G)} grupos de ${fmt(n)} pessoas com aniversários ao acaso, tantos tiveram um dia repetido:`,
        `Check it by drawing: in ${fmt(G)} groups of ${fmt(n)} people with random birthdays, this many had a repeated day:`),
      `\\dfrac{${texNum(hits, 0)}}{${texNum(G, 0)}} ${approx(hits / G, 6)} ${pctTex(hits / G)}`]);

      let note = "";
      if (n50 && n99) note += T(`Com ${fmt(d)} dias, bastam ${fmt(n50)} pessoas para a chance passar de 50% e ${fmt(n99)} para passar de 99%.`,
        `With ${fmt(d)} days, ${fmt(n50)} people are enough for the chance to pass 50%, and ${fmt(n99)} to pass 99%.`);
      if (n >= 2 && d >= 2) {
        const mine = 1 - ((d - 1) / d) ** (n - 1);
        note += T(` O paradoxo está na pergunta: a chance de alguém do grupo fazer aniversário no <em>seu</em> dia é bem menor, ${pTxt(mine)}, porque aí só contam os ${fmt(n - 1)} pares que incluem você.`,
          ` The paradox lies in the question: the chance that someone in the group shares <em>your</em> birthday is much lower, ${pTxt(mine)}, because then only the ${fmt(n - 1)} pairs that include you count.`);
      }
      note += T(" A fórmula supõe todos os dias igualmente prováveis; nos dados reais os nascimentos se concentram em alguns meses, o que só aumenta a chance de coincidência.",
        " The formula assumes every day is equally likely; in real data births cluster in some months, which only raises the chance of a match.");

      return {
        result: `P(A) ${approx(p, 6)} ${tone(pTex(p), 1)}`,
        steps, note,
        chart: {
          type: "line", xMin: 1, xMax: Math.max(2, K), yMin: 0, yMax: 100, pts,
          marker: n <= K ? [n, 100 * p] : null,
          hlines: [{ y: 50, cls: "chart-ref" }],
          label: T(`Chance de coincidência de 1 a ${K} pessoas, com ${d} dias`, `Chance of a shared birthday from 1 to ${K} people, with ${d} days`),
          xLabel: T("pessoas no grupo (n) · chance em % · tracejado: 50%", "people in the group (n) · chance in % · dashed: 50%"),
          tipAt: x => {
            const k = Math.min(K, Math.max(1, Math.round(x)));
            return [pTxt(1 - q[k]), `n = ${fmt(k)}`];
          },
        },
      };
    },

    dp({ x }) {
      const n = x.length;
      if (n < 2) return { error: T("Informe pelo menos dois valores.", "Enter at least two values.") };
      if (n > 200) return { error: T("Use no máximo 200 valores.", "Use at most 200 values.") };
      const sum = x.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const dev = x.map(v => v - mean);
      const ss = dev.reduce((a, d) => a + d * d, 0);
      const v = ss / (n - 1), s = Math.sqrt(v), pop = Math.sqrt(ss / n);
      const near = dev.filter(d => Math.abs(d) <= s + 1e-9).length;
      const SS = tone(texNum(ss), 3), N1 = tone(n - 1, 4);
      const meanLine = n <= 6
        ? `\\bar{x} = \\dfrac{${x.map(u => paren(u, texNum(u))).join(" + ")}}{${n}} ${approx(mean)} ${texNum(mean)}`
        : `\\bar{x} = \\dfrac{${texNum(sum)}}{${n}} ${approx(mean)} ${texNum(mean)}`;
      const table = n > MAX_TABLE
        ? T(`\\textstyle\\sum (x_i - \\bar{x})^2 ${approx(ss)} ${SS} \\quad \\text{(${n} valores: a tabela ficaria longa demais)}`,
          `\\textstyle\\sum (x_i - \\bar{x})^2 ${approx(ss)} ${SS} \\quad \\text{(${n} values: the table would be too long)}`)
        : `\\begin{array}{c|c|c|c} i & x_i & x_i - \\bar{x} & (x_i - \\bar{x})^2 \\\\ \\hline `
          + x.map((u, i) => `${i + 1} & ${texNum(u)} & ${texNum(dev[i])} & ${texNum(dev[i] ** 2)}`).join(" \\\\ ")
          + ` \\\\ \\hline \\Sigma & & & ${SS} \\end{array}`;
      const lo = Math.min(...x, mean - s), hi = Math.max(...x, mean + s);
      const pad = (hi - lo) * 0.06 || 1;
      const r4 = u => Number(u.toFixed(4));
      return {
        result: `s ${approx(s)} ${tone(texNum(s), 1)}`,
        chart: {
          type: "intervals", height: Math.max(150, Math.min(320, 50 + n * 22)),
          label: T(`Cada valor ligado à média ${fmt(mean)} por um segmento; destacados os ${n - near} que ficam a mais de um desvio padrão dela`,
            `Each value joined to the mean ${fmt(mean)} by a segment; highlighted, the ${n - near} lying more than one standard deviation from it`),
          xLabel: T("valores · linha vertical: média · destaque: a mais de 1 s da média", "values · vertical line: mean · highlighted: more than 1 s from the mean"),
          xMin: lo - pad, xMax: hi + pad, truth: mean,
          rows: x.map(u => ({ lo: Math.min(u, mean), hi: Math.max(u, mean), hit: Math.abs(u - mean) <= s + 1e-9 })),
          tip: (r, i) => [fmt(x[i]), T(`valor ${i + 1}: desvio de ${fmt(dev[i])} (${fmt(s ? dev[i] / s : 0, 2)} s)`, `value ${i + 1}: deviation of ${fmt(dev[i])} (${fmt(s ? dev[i] / s : 0, 2)} s)`)],
        },
        steps: [
          [T("Calcule a média:", "Compute the mean:"), meanLine],
          [T("Subtraia a média de cada valor e eleve ao quadrado; some os quadrados:", "Subtract the mean from each value and square it; add up the squares:"), table],
          [T("Divida pela quantidade de valores menos um. O resultado é a variância:", "Divide by the number of values minus one. The result is the variance:"),
            `s^2 = \\dfrac{${SS}}{${N1}} ${approx(v)} ${texNum(v)}`],
          [T("Tire a raiz quadrada, para voltar à unidade dos dados:", "Take the square root, to get back to the units of the data:"),
            `s = \\sqrt{${texNum(v)}} ${approx(s)} ${tone(texNum(s), 1)}`],
        ],
        note: T(`${near} de ${n} valores estão a até um desvio padrão da média, entre ${fmt(mean - s)} e ${fmt(mean + s)}.`
          + ` Dividir por n − 1, e não por n, compensa o fato de os desvios serem medidos a partir de x̄, que fica mais perto dos dados do que a média verdadeira:`
          + ` sem essa correção, a amostra subestimaria a variabilidade. Se os valores forem a população inteira, divida por n: σ ${approx(pop) === "=" ? "=" : "≈"} ${fmt(pop)}.`
          + (s > 0 ? ` Com estes valores, veja o <a href="${PAGE("z-score")}?mu=${r4(mean)}&amp;sd=${r4(s)}&amp;x=${x[0]}">z-score</a>`
          + ` ou o <a href="${PAGE("teorema-chebyshev")}?mu=${r4(mean)}&amp;sd=${r4(s)}&amp;k=2">teorema de Chebyshev</a>.` : ""),
          `${near} of ${n} values lie within one standard deviation of the mean, between ${fmt(mean - s)} and ${fmt(mean + s)}.`
          + ` Dividing by n − 1 rather than n makes up for the deviations being measured from x̄, which sits closer to the data than the true mean does:`
          + ` without that correction, the sample would understate the spread. If the values are the whole population, divide by n: σ ${approx(pop) === "=" ? "=" : "≈"} ${fmt(pop)}.`
          + (s > 0 ? ` With these values, see the <a href="${PAGE("z-score")}?mu=${r4(mean)}&amp;sd=${r4(s)}&amp;x=${x[0]}">z-score</a>`
          + ` or <a href="${PAGE("teorema-chebyshev")}?mu=${r4(mean)}&amp;sd=${r4(s)}&amp;k=2">Chebyshev's theorem</a>.` : "")),
      };
    },

    esperanca({ x, p }) {
      if (x.length !== p.length) return { error: T(`Há ${x.length} valores e ${p.length} probabilidades; as listas precisam ter o mesmo tamanho.`, `There are ${x.length} values and ${p.length} probabilities; the lists must have the same length.`) };
      const n = x.length;
      if (n < 2) return { error: T("Informe pelo menos dois valores possíveis.", "Enter at least two possible values.") };
      if (n > 50) return { error: T("Use no máximo 50 valores.", "Use at most 50 values.") };
      if (p.some(v => v < 0)) return { error: T("As probabilidades não podem ser negativas.", "Probabilities cannot be negative.") };
      const sum = a => a.reduce((s, v) => s + v, 0);
      const tot = sum(p);
      const pct = Math.abs(tot - 100) < 1e-6;
      if (!pct && Math.abs(tot - 1) > 1e-6) return { error: T(`As probabilidades somam ${fmt(tot, 6)}; precisam somar 1 (ou 100, em %).`, `The probabilities add up to ${fmt(tot, 6)}; they must add up to 1 (or 100, in %).`) };
      const ps = pct ? p.map(v => v / 100) : p;
      const prod = x.map((v, i) => v * ps[i]);
      const e = sum(prod);
      const e2 = sum(x.map((v, i) => v * v * ps[i]));
      const sd = Math.sqrt(Math.max(0, e2 - e * e));
      const E = tone(texNum(e), 1);
      const table = n > MAX_TABLE
        ? `\\textstyle\\sum x_i \\cdot P(x_i) ${approx(e)} ${E}`
        : `\\begin{array}{c|c|c} ${tone("x_i", 3)} & ${tone("P(x_i)", 4)} & x_i \\cdot P(x_i) \\\\ \\hline `
          + x.map((v, i) => `${texNum(v)} & ${texNum(ps[i], 6)} & ${texNum(prod[i], 6)}`).join(" \\\\ ")
          + ` \\\\ \\hline & ${texNum(sum(ps), 6)} & ${E} \\end{array}`;
      const steps = [];
      if (pct) steps.push([T("As probabilidades vieram em %; escreva-as como proporção:", "The probabilities came in %; write them as proportions:"),
        ps.slice(0, 8).map((v, i) => `P(${texNum(x[i])}) = ${texNum(v, 6)}`).join(", \\quad ") + (n > 8 ? ", \\quad \\ldots" : "")]);
      steps.push([T("Multiplique cada valor pela sua probabilidade:", "Multiply each value by its probability:"), table]);
      steps.push([T("Some os produtos:", "Add up the products:"), n <= 6
        ? `E[X] = ${prod.map(v => paren(v, texNum(v, 6))).join(" + ")} ${approx(e)} ${E}`
        : `E[X] = \\textstyle\\sum x_i \\cdot P(x_i) ${approx(e)} ${E}`]);
      // Valores inteiros e próximos viram barras; o resto fica sem gráfico.
      let chart;
      const lo = Math.min(...x), hi = Math.max(...x);
      if (x.every(Number.isInteger) && hi - lo <= 60) {
        const xs = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
        const ys = xs.map(k => sum(ps.filter((_, i) => x[i] === k)));
        chart = discreteChart(T(`Distribuição de X; valor esperado ${fmt(e)}`, `Distribution of X; expected value ${fmt(e)}`),
          T(`valor de X · valor esperado: ${fmt(e)}`, `value of X · expected value: ${fmt(e)}`), xs, ys, Math.round(e), "X");
      }
      const r4 = u => Number(u.toFixed(4));
      const possible = x.some(v => Math.abs(v - e) < 1e-9);
      return {
        result: `E[X] ${approx(e)} ${E}`,
        chart,
        steps,
        note: T(`É a média de longo prazo: repetindo o experimento muitas vezes, a média dos resultados se aproxima de ${fmt(e)}.`
          + (possible ? "" : " Repare que esse valor nem precisa ser um resultado possível de X.")
          + ` A dispersão em torno dele vem da variância, E[X²] − E[X]² ≈ ${fmt(sd * sd)}, cuja raiz é o desvio padrão σ ≈ ${fmt(sd)}.`
          + (sd > 0 ? ` Com essa média e esse desvio, o <a href="${PAGE("teorema-chebyshev")}?mu=${r4(e)}&amp;sd=${r4(sd)}&amp;k=2">teorema de Chebyshev</a> garante quanto da distribuição fica perto de ${fmt(e)}.` : ""),
          `It is the long-run average: repeat the experiment many times and the mean of the outcomes approaches ${fmt(e)}.`
          + (possible ? "" : " Note that this value need not even be a possible outcome of X.")
          + ` The spread around it comes from the variance, E[X²] − E[X]² ≈ ${fmt(sd * sd)}, whose square root is the standard deviation σ ≈ ${fmt(sd)}.`
          + (sd > 0 ? ` With this mean and standard deviation, <a href="${PAGE("teorema-chebyshev")}?mu=${r4(e)}&amp;sd=${r4(sd)}&amp;k=2">Chebyshev's theorem</a> guarantees how much of the distribution lies near ${fmt(e)}.` : "")),
      };
    },

    geom({ p, k }) {
      if (p <= 0 || p > 100) return { error: T("A probabilidade de sucesso precisa ser maior que 0 e no máximo 100%.", "The probability of success must be above 0 and at most 100%.") };
      if (!Number.isInteger(k) || k < 1) return { error: T("k precisa ser um inteiro positivo: o primeiro sucesso vem na 1ª, 2ª, 3ª… tentativa.", "k must be a positive integer: the first success comes on trial 1, 2, 3…") };
      if (k > 500) return { error: T("Use k de no máximo 500.", "Use k of at most 500.") };
      const pp = p / 100, q = 1 - pp;
      const pmf = i => (i === 1 ? pp : q ** (i - 1) * pp);
      const res = pmf(k);
      // Até onde vai 99% da distribuição, sem passar de 200 barras (ou de k).
      const q99 = q > 0 ? Math.ceil(Math.log(0.01) / Math.log(q)) : 1;
      const top = Math.max(k, Math.min(q99, 200), 5);
      const xs = Array.from({ length: top }, (_, i) => i + 1);
      const ys = xs.map(pmf);
      const fail = q ** (k - 1);
      const P = tone(texNum(pp, 6), 2), Q = texNum(q, 6);
      return {
        result: `P(X = ${k}) ${approx(res, 6)} ${tone(pctTex(res), 1)}`,
        chart: discreteChart(T(`Distribuição geométrica com p = ${fmt(pp, 4)}`, `Geometric distribution with p = ${fmt(pp, 4)}`), T("tentativa do primeiro sucesso k", "trial of the first success k"), xs, ys, k, "X"),
        steps: [
          [T("Escreva p como proporção; a falha tem probabilidade 1 − p:", "Write p as a proportion; failure has probability 1 − p:"), `p = ${P}, \\qquad 1 - p = ${Q}`],
          [k === 1
            ? T("Com k = 1 não há falhas antes: o termo das falhas vira 1.", "With k = 1 there are no failures first: the failure term becomes 1.")
            : T(`As ${k - 1} primeiras tentativas precisam falhar:`, `The first ${k - 1} trials must fail:`),
            `(1-p)^{k-1} = ${Q}^{${k - 1}} ${approx(fail, 6)} ${tone(texSci(fail, 6), 4)}`],
          [T(`Multiplique pela chance de acertar justamente na ${k}ª:`, `Multiply by the chance of succeeding on trial ${k}:`),
            `P(X = ${k}) = ${tone(texSci(fail, 6), 4)} \\cdot ${P} ${approx(res, 6)} ${tone(texSci(res, 6), 1)}`],
        ],
        note: T(`Acumulando: a chance de o primeiro sucesso vir até a ${k}ª tentativa é P(X ≤ ${k}) = 1 − (1 − p)^${k} ≈ ${fmt((1 - q ** k) * 100, 2)}%.`
          + ` Em média, são 1/p = ${fmt(1 / pp, 2)} tentativas até o primeiro sucesso.`
          + " A geométrica não tem memória: depois de várias falhas, a chance de acertar na próxima continua sendo p — não existe sucesso “atrasado”."
          + ` Cada tentativa é uma <a href="${PAGE("distribuicao-bernoulli")}?p=${p}&amp;k=1">Bernoulli</a>.`,
          `Cumulative: the chance that the first success comes by trial ${k} is P(X ≤ ${k}) = 1 − (1 − p)^${k} ≈ ${fmt((1 - q ** k) * 100, 2)}%.`
          + ` On average, it takes 1/p = ${fmt(1 / pp, 2)} trials to get the first success.`
          + " The geometric distribution has no memory: after many failures, the chance of success on the next trial is still p — no success is ever “due”."
          + ` Each trial is a <a href="${PAGE("distribuicao-bernoulli")}?p=${p}&amp;k=1">Bernoulli</a> trial.`),
      };
    },

    expo({ lambda, x }) {
      if (lambda <= 0) return { error: T("A taxa λ precisa ser maior que zero.", "The rate λ must be greater than zero.") };
      if (x < 0) return { error: T("x precisa ser maior ou igual a zero: a exponencial mede tempos e distâncias.", "x must be zero or more: the exponential measures times and distances.") };
      const lx = lambda * x;
      const ex = Math.exp(-lx), f = lambda * ex, cdf = 1 - ex;
      const hi = Math.max(x * 1.15, 5 / lambda);
      const pts = Array.from({ length: 201 }, (_, i) => { const v = hi * i / 200; return [v, lambda * Math.exp(-lambda * v)]; });
      const L = tone(texNum(lambda), 2), X = texNum(x);
      const EX = tone(texSci(ex, 6), 3);
      return {
        result: `f(${X}) ${approx(f, 6)} ${tone(texSci(f, 6), 1)}, \\qquad P(X \\le ${X}) ${approx(cdf, 6)} ${pctTex(cdf)}`,
        chart: {
          type: "curve", label: T(`Densidade exponencial com taxa ${fmt(lambda)}; área sombreada até x = ${fmt(x)}`, `Exponential density with rate ${fmt(lambda)}; area shaded up to x = ${fmt(x)}`),
          xLabel: "x", xMin: 0, xMax: hi, yMax: lambda, pts, shadeTo: x, marker: [x, f],
          tipAt: v => [`f = ${fmtSci(lambda * Math.exp(-lambda * v), 6)}`, `x = ${fmt(v, 2)}, P(X ≤ x) ≈ ${fmt((1 - Math.exp(-lambda * v)) * 100, 1)}%`],
        },
        steps: [
          [T("Multiplique a taxa pelo valor:", "Multiply the rate by the value:"), `\\lambda x = ${L} \\cdot ${X} ${approx(lx)} ${texNum(lx)}`],
          [T("Calcule a exponencial:", "Compute the exponential:"), `e^{-\\lambda x} = e^{-${texNum(lx)}} ${approx(ex, 6)} ${EX}`],
          [T("Multiplique pela taxa para obter a densidade:", "Multiply by the rate to get the density:"), `f(${X}) = ${L} \\cdot ${EX} ${approx(f, 6)} ${tone(texSci(f, 6), 1)}`],
          [T("A área sob a curva até x é a probabilidade acumulada:", "The area under the curve up to x is the cumulative probability:"),
            `P(X \\le ${X}) = 1 - e^{-\\lambda x} = 1 - ${EX} ${approx(cdf, 6)} ${texSci(cdf, 6)}`],
        ],
        note: T(`f(x) é densidade, não probabilidade; a probabilidade é a área sombreada. A chance de passar de ${fmt(x)} é e^(−λx) ≈ ${fmt(ex * 100, 2)}%.`
          + ` A média é 1/λ = ${fmt(1 / lambda, 4)} e o desvio padrão também. Como a geométrica, a exponencial não tem memória:`
          + ` já ter esperado não muda quanto falta esperar. Se os eventos chegam numa <a href="${PAGE("distribuicao-poisson")}?lambda=${lambda}&amp;k=1">Poisson de taxa λ</a>, o tempo entre eles é exponencial com essa mesma taxa.`,
          `f(x) is a density, not a probability; the probability is the shaded area. The chance of going past ${fmt(x)} is e^(−λx) ≈ ${fmt(ex * 100, 2)}%.`
          + ` The mean is 1/λ = ${fmt(1 / lambda, 4)}, and so is the standard deviation. Like the geometric, the exponential has no memory:`
          + ` having waited already doesn't change how much longer the wait is. If events arrive as a <a href="${PAGE("distribuicao-poisson")}?lambda=${lambda}&amp;k=1">Poisson process with rate λ</a>, the time between them is exponential with that same rate.`),
      };
    },

    ep({ sd, n }) {
      if (sd <= 0) return sdError;
      if (!Number.isInteger(n) || n < 1) return { error: T("O tamanho da amostra precisa ser um inteiro positivo.", "The sample size must be a positive integer.") };
      if (n > 1e7) return { error: T("Use n de no máximo 10.000.000.", "Use n of at most 10,000,000.") };
      const rn = Math.sqrt(n), se = sd / rn;
      const top = Math.max(4 * n, 20);
      const at = m => sd / Math.sqrt(m);
      const pts = Array.from({ length: 201 }, (_, i) => { const m = 1 + (top - 1) * i / 200; return [m, at(m)]; });
      const S = tone(texNum(sd), 2), RN = tone(texNum(rn), 3);
      return {
        result: `${T("EP", "SE")} ${approx(se)} ${tone(texNum(se), 1)}`,
        chart: {
          type: "curve", label: T(`Erro padrão em função do tamanho da amostra, com σ = ${fmt(sd)}; marcado n = ${fmt(n)}`, `Standard error as a function of the sample size, with σ = ${fmt(sd)}; n = ${fmt(n)} marked`),
          xLabel: T("tamanho da amostra n", "sample size n"), xMin: 1, xMax: top, yMax: sd, pts, marker: [n, se],
          tipAt: m => { const k = Math.max(1, Math.round(m)); return [fmt(at(k)), `n = ${fmt(k)}`]; },
        },
        steps: [
          [T("Tire a raiz quadrada do tamanho da amostra:", "Take the square root of the sample size:"), `\\sqrt{n} = \\sqrt{${texNum(n)}} ${approx(rn)} ${RN}`],
          [T("Divida o desvio padrão por ela:", "Divide the standard deviation by it:"), `${T("EP", "SE")} = \\dfrac{${S}}{${RN}} ${approx(se)} ${tone(texNum(se), 1)}`],
        ],
        note: T(`O desvio padrão mede a variação de cada valor; o erro padrão, a variação da média de ${fmt(n)} valores — ${fmt(sd / se, 2)} vezes menor.`
          + ` Com 95% de confiança, a média da amostra fica a até 1,96 · EP ≈ ${fmt(1.96 * se)} da média verdadeira.`
          + ` Como o n está sob a raiz, cortar o erro pela metade exige quadruplicar a amostra: com n = ${fmt(4 * n)}, ele cai para ${fmt(se / 2)}.`
          + ` Veja o <a href="${PAGE("intervalo-confianca")}?sd=${sd}&amp;n=${n}">intervalo de confiança com estes valores</a> e o <a href="${PAGE("teorema-central-limite")}">teorema central do limite</a>, que explica por que a média se comporta assim.`,
          `The standard deviation measures how much each value varies; the standard error, how much the mean of ${fmt(n)} values varies — ${fmt(sd / se, 2)} times less.`
          + ` At 95% confidence, the sample mean lies within 1.96 · SE ≈ ${fmt(1.96 * se)} of the true mean.`
          + ` Since n sits under the root, halving the error takes four times the sample: with n = ${fmt(4 * n)}, it drops to ${fmt(se / 2)}.`
          + ` See the <a href="${PAGE("intervalo-confianca")}?sd=${sd}&amp;n=${n}">confidence interval with these values</a> and the <a href="${PAGE("teorema-central-limite")}">central limit theorem</a>, which explains why the mean behaves this way.`),
      };
    },

    geo({ x }) {
      const n = x.length;
      if (n < 2) return { error: T("Informe pelo menos dois valores.", "Enter at least two values.") };
      if (n > 200) return { error: T("Use no máximo 200 valores.", "Use at most 200 values.") };
      if (x.some(v => v <= 0)) return { error: T("A média geométrica só faz sentido para valores positivos.", "The geometric mean only makes sense for positive values.") };
      const sum = a => a.reduce((s, v) => s + v, 0);
      const ls = sum(x.map(Math.log));
      const g = Math.exp(ls / n);
      const prod = x.reduce((a, b) => a * b, 1);
      const arith = sum(x) / n, harm = n / sum(x.map(v => 1 / v));
      const G = tone(texNum(g), 1);
      const direct = n <= 6 && prod > 1e-9 && prod < 1e15;
      const steps = direct
        ? [[T("Multiplique os valores:", "Multiply the values:"), `${x.map(v => texNum(v)).join(" \\cdot ")} ${approx(prod, 6)} ${tone(texNum(prod, 6), 3)}`],
          [T(`Tire a raiz de índice ${n}, o número de valores:`, `Take the root of index ${n}, the number of values:`),
            `G = \\sqrt[${tone(n, 2)}]{${tone(texNum(prod, 6), 3)}} ${approx(g)} ${G}`]]
        : [[T("O produto ficaria grande ou pequeno demais; some os logaritmos, que dá no mesmo:", "The product would get too large or too small; add up the logarithms instead, which is equivalent:"),
            `\\textstyle\\sum \\ln x_i ${approx(ls, 6)} ${tone(texNum(ls, 6), 3)}`],
          [T("Divida por n e volte com a exponencial:", "Divide by n and undo the logarithm with the exponential:"),
            `G = e^{${tone(texNum(ls, 6), 3)} / ${tone(n, 2)}} ${approx(g)} ${G}`]];
      const q = new URLSearchParams({ x: x.join(" ") });
      return {
        result: `G ${approx(g)} ${G}`,
        steps,
        note: T(`Para estes valores, a média aritmética é ${fmt(arith)} e a <a href="${PAGE("media-harmonica")}?${q}">harmônica</a> é ${fmt(harm)}: sempre harmônica ≤ geométrica ≤ aritmética, com igualdade só se os valores forem todos iguais.`
          + ` A geométrica é a média certa para fatores que se multiplicam. Se os valores forem fatores de crescimento, como 1,10 para +10%,`
          + ` G − 1 ≈ ${fmt((g - 1) * 100, 2)}% é a taxa média por período: aplicada todo período, leva ao mesmo resultado final.`
          + ` A média aritmética dos fatores daria ${fmt((arith - 1) * 100, 2)}% e superestimaria o crescimento.`,
          `For these values, the arithmetic mean is ${fmt(arith)} and the <a href="${PAGE("media-harmonica")}?${q}">harmonic mean</a> is ${fmt(harm)}: always harmonic ≤ geometric ≤ arithmetic, with equality only when all values are equal.`
          + ` The geometric mean is the right average for factors that multiply. If the values are growth factors, such as 1.10 for +10%,`
          + ` G − 1 ≈ ${fmt((g - 1) * 100, 2)}% is the average rate per period: applied every period, it leads to the same final result.`
          + ` The arithmetic mean of the factors would give ${fmt((arith - 1) * 100, 2)}% and overstate the growth.`),
      };
    },

    // Tabela de contingência: uma linha por categoria da primeira variável.
    chiind({ o }) {
      const r = o.length, c = o[0].length;
      if (o.some(row => row.length !== c)) return { error: T("Todas as linhas precisam ter o mesmo número de valores.", "Every row must have the same number of values.") };
      if (r < 2 || c < 2) return { error: T("A tabela precisa de pelo menos 2 linhas e 2 colunas. Separe as linhas com ponto e vírgula.", "The table needs at least 2 rows and 2 columns. Separate the rows with semicolons.") };
      if (r > 10 || c > 10) return { error: T("Use no máximo 10 linhas e 10 colunas.", "Use at most 10 rows and 10 columns.") };
      if (o.some(row => row.some(v => v < 0))) return { error: T("As frequências não podem ser negativas.", "Frequencies cannot be negative.") };
      const sum = a => a.reduce((s, v) => s + v, 0);
      const R = o.map(sum), C = o[0].map((_, j) => sum(o.map(row => row[j]))), N = sum(R);
      if (R.some(v => v <= 0) || C.some(v => v <= 0)) return { error: T("Toda linha e toda coluna precisa ter total maior que zero.", "Every row and every column must have a total above zero.") };
      const E = R.map(ri => C.map(cj => ri * cj / N));
      const parts = o.map((row, i) => row.map((v, j) => (v - E[i][j]) ** 2 / E[i][j]));
      const chi2 = sum(parts.map(sum));
      const df = (r - 1) * (c - 1);
      const p = chiSurvival(chi2, df);
      const V = Math.sqrt(chi2 / (N * (Math.min(r, c) - 1)));
      // Com totals, a tabela ganha a coluna e a linha dos totais.
      const head = ` & ${o[0].map((_, j) => `C_{${j + 1}}`).join(" & ")}`;
      const grid = (f, totals) => `\\begin{array}{c|${"c".repeat(c)}${totals ? "|c" : ""}} ${head}${totals ? " & \\text{total}" : ""} \\\\ \\hline `
        + o.map((row, i) => `L_{${i + 1}} & ${row.map((v, j) => f(i, j)).join(" & ")}${totals ? ` & ${texNum(R[i])}` : ""}`).join(" \\\\ ")
        + (totals ? ` \\\\ \\hline \\text{total} & ${C.map(v => texNum(v)).join(" & ")} & ${texNum(N)}` : "")
        + " \\end{array}";
      const X2 = tone(texNum(chi2), 1);
      const pequenas = E.flat().some(v => v < 5)
        ? T(` ${warn} há frequência esperada menor que 5; a aproximação pela qui-quadrado fica pouco confiável. Numa tabela 2 × 2, use o teste exato de Fisher.`,
          ` ${warn} some expected frequency is below 5; the chi-square approximation becomes unreliable. In a 2 × 2 table, use Fisher's exact test.`)
        : "";
      const veredito = p < 0.05
        ? T("Ao nível de 5%, rejeita-se H₀: as duas variáveis parecem associadas.", "At the 5% level, H₀ is rejected: the two variables appear to be associated.")
        : T("Ao nível de 5%, não se rejeita H₀: os dados são compatíveis com variáveis independentes.", "At the 5% level, H₀ is not rejected: the data are consistent with independent variables.");
      return {
        result: `\\chi^2 ${approx(chi2)} ${X2}`,
        steps: [
          [T("Some cada linha e cada coluna:", "Add up each row and each column:"), grid((i, j) => tone(texNum(o[i][j]), 3), true)],
          [T("Se as variáveis fossem independentes, cada célula receberia (total da linha × total da coluna) / total geral:", "If the variables were independent, each cell would get (row total × column total) / grand total:"),
            `\\begin{gathered} E_{11} = \\dfrac{${texNum(R[0])} \\cdot ${texNum(C[0])}}{${texNum(N)}} ${approx(E[0][0])} ${texNum(E[0][0])} \\\\[0.8em] `
            + grid((i, j) => tone(texNum(E[i][j]), 4)) + " \\end{gathered}"],
          [T("Calcule a parcela de cada célula, (O − E)² / E:", "Compute each cell's term, (O − E)² / E:"), grid((i, j) => texNum(parts[i][j]))],
          [T("Some todas as parcelas:", "Add up all the terms:"),
            r * c <= 6
              ? `\\chi^2 = ${parts.flat().map(v => texNum(v)).join(" + ")} ${approx(chi2)} ${X2}`
              : `\\chi^2 = \\textstyle\\sum_{i,j} \\dfrac{(O_{ij} - E_{ij})^2}{E_{ij}} ${approx(chi2)} ${X2}`],
        ],
        note: T(`Com (r − 1)(c − 1) = ${dof(df)}, o valor-p é ${pValueText(p)}. ${veredito}`
          + ` A força da associação vem do V de Cramér: V = √(χ² / (N · (min(r, c) − 1))) ≈ ${fmt(V, 3)}, de 0 (nenhuma) a 1 (total).`
          + (r === 2 && c === 2 ? " O cálculo é sem a correção de continuidade de Yates." : "") + pequenas,
          `With (r − 1)(c − 1) = ${dof(df)}, the p-value is ${pValueText(p)}. ${veredito}`
          + ` The strength of the association comes from Cramér's V: V = √(χ² / (N · (min(r, c) − 1))) ≈ ${fmt(V, 3)}, from 0 (none) to 1 (complete).`
          + (r === 2 && c === 2 ? " The calculation has no Yates continuity correction." : "") + pequenas),
      };
    },

    nmedia({ conf, sd, e }) {
      if (conf <= 0 || conf >= 100) return confError;
      if (sd <= 0) return sdError;
      if (e <= 0) return { error: T("A margem de erro precisa ser maior que zero, na mesma unidade dos dados.", "The margin of error must be greater than zero, in the same units as the data.") };
      const z = zCrit(conf);
      const num = z * z * sd * sd, den = e * e;
      const n0 = num / den, n = ceilInt(n0);
      const Z = tone(texNum(z), 2), S = tone(texNum(sd), 3), Ee = tone(texNum(e), 4);
      return {
        result: `n = ${tone(texNum(n), 1)}`,
        steps: [
          [T(`Encontre o valor crítico para ${fmt(conf, 2)}% de confiança, como na tabela Z:`, `Find the critical value for ${fmt(conf, 2)}% confidence, as in the Z table:`), `z \\approx ${Z}`],
          [T("Substitua na fórmula:", "Plug into the formula:"),
            `n = \\dfrac{${Z}^2 \\cdot ${S}^2}{${Ee}^2} ${approx(num, 6)} \\dfrac{${texNum(num, 6)}}{${texNum(den, 6)}} ${approx(n0, 2)} ${texNum(n0, 2)}`],
          [T("Arredonde sempre para cima: para baixo, a margem ficaria maior que a pedida.", "Always round up: rounding down would leave the margin larger than requested."), `n = ${tone(texNum(n), 1)}`],
        ],
        note: T(`Com ${fmt(n)} observações, a média fica estimada com margem de ±${fmt(e)} e ${fmt(conf, 2)}% de confiança, numa população grande.`
          + " O σ costuma vir de um estudo piloto ou de pesquisas anteriores; na dúvida, erre para mais."
          + ` Como E está ao quadrado, pedir o dobro de precisão (E = ${fmt(e / 2)}) quadruplica a amostra.`
          + ` Se a população for pequena, <a href="${PAGE("correcao-populacao-finita")}?n0=${n}">aplique a correção para população finita</a>;`
          + ` para estimar uma proporção, use a <a href="${PAGE("cochran-formula")}">fórmula de Cochran</a>.`,
          `With ${fmt(n)} observations, the mean is estimated within ±${fmt(e)} at ${fmt(conf, 2)}% confidence, in a large population.`
          + " σ usually comes from a pilot study or earlier research; if in doubt, err on the high side."
          + ` Since E is squared, asking for twice the precision (E = ${fmt(e / 2)}) quadruples the sample.`
          + ` If the population is small, <a href="${PAGE("correcao-populacao-finita")}?n0=${n}">apply the finite population correction</a>;`
          + ` to estimate a proportion, use <a href="${PAGE("cochran-formula")}">Cochran's formula</a>.`),
      };
    },

    hiper({ N, K, n, k }) {
      const int = v => Number.isInteger(v) && v >= 0;
      if (!int(N) || N < 1) return { error: T("O tamanho da população N precisa ser um inteiro positivo.", "The population size N must be a positive integer.") };
      if (N > 1e6) return { error: T("Use N de no máximo 1.000.000.", "Use N of at most 1,000,000.") };
      if (!int(K) || K > N) return { error: T(`K precisa ser um inteiro entre 0 e ${fmt(N)}.`, `K must be an integer between 0 and ${fmt(N)}.`) };
      if (!int(n) || n < 1 || n > N) return { error: T(`O tamanho da amostra n precisa ser um inteiro entre 1 e ${fmt(N)}.`, `The sample size n must be an integer between 1 and ${fmt(N)}.`) };
      const lo = Math.max(0, n - (N - K)), hi = Math.min(n, K);
      if (!Number.isInteger(k) || k < lo || k > hi) return { error: T(`Com esses valores, k precisa ser um inteiro entre ${lo} e ${hi}.`, `With these values, k must be an integer between ${lo} and ${hi}.`) };
      const lc = (a, b) => lgamma(a + 1) - lgamma(b + 1) - lgamma(a - b + 1);
      const pmf = j => Math.exp(lc(K, j) + lc(N - K, n - j) - lc(N, n));
      const mean = n * K / N;
      const sd = Math.sqrt(mean * (1 - K / N) * (N - n) / Math.max(1, N - 1));
      const a = hi - lo <= 200 ? lo : Math.max(lo, Math.min(k, Math.floor(mean - 6 * sd)));
      const b = hi - lo <= 200 ? hi : Math.min(hi, Math.max(k, Math.ceil(mean + 6 * sd)));
      const xs = Array.from({ length: b - a + 1 }, (_, i) => a + i);
      const ys = xs.map(pmf);
      const res = pmf(k);
      let le = 0;
      for (let j = lo; j <= k; j++) le += pmf(j);
      const ge = 1 - le + res;
      const comb = (x, y) => { const v = Math.exp(lc(x, y)); return v < 1e15 ? texNum(Math.round(v)) : texSci(v); };
      const A = tone(comb(K, k), 2), B = tone(comb(N - K, n - k), 3), D = tone(comb(N, n), 4);
      const pb = K / N;
      const bin = binPmf(n, pb, k);
      return {
        result: `P(X = ${k}) ${approx(res, 6)} ${tone(pctTex(res), 1)}`,
        chart: discreteChart(T(`Distribuição hipergeométrica com N = ${fmt(N)}, K = ${fmt(K)} e n = ${fmt(n)}`, `Hypergeometric distribution with N = ${fmt(N)}, K = ${fmt(K)} and n = ${fmt(n)}`),
          T("número de sucessos na amostra k", "number of successes in the sample k"), xs, ys, k, "X"),
        steps: [
          [T(`Conte as formas de tirar ${k} dos ${fmt(K)} sucessos:`, `Count the ways to draw ${k} of the ${fmt(K)} successes:`), `\\dbinom{${K}}{${k}} = ${A}`],
          [T(`Conte as formas de completar a amostra com ${n - k} dos ${fmt(N - K)} fracassos:`, `Count the ways to fill the rest of the sample with ${n - k} of the ${fmt(N - K)} failures:`), `\\dbinom{${N - K}}{${n - k}} = ${B}`],
          [T(`Conte todas as amostras possíveis de ${fmt(n)} entre ${fmt(N)}:`, `Count every possible sample of ${fmt(n)} out of ${fmt(N)}:`), `\\dbinom{${N}}{${n}} = ${D}`],
          [T("Divida os casos favoráveis pelo total:", "Divide the favorable cases by the total:"), `P(X = ${k}) = \\dfrac{${A} \\cdot ${B}}{${D}} ${approx(res, 6)} ${tone(texSci(res, 6), 1)}`],
        ],
        note: T(`Acumulando: P(X ≤ ${k}) ≈ ${fmt(le * 100, 2)}% e P(X ≥ ${k}) ≈ ${fmt(ge * 100, 2)}%. A média é n · K/N = ${fmt(mean, 3)}.`
          + ` O sorteio é sem reposição: cada item tirado muda a composição do que sobra. Com reposição, valeria a <a href="${PAGE("distribuicao-binomial")}?n=${n}&amp;p=${Number((pb * 100).toFixed(4))}&amp;k=${k}">binomial com p = K/N</a>,`
          + ` que daria ${fmt(bin * 100, 2)}%. A diferença some quando a amostra é uma fração pequena da população; a variância da hipergeométrica é a da binomial vezes (N − n)/(N − 1), a correção para população finita.`,
          `Cumulative: P(X ≤ ${k}) ≈ ${fmt(le * 100, 2)}% and P(X ≥ ${k}) ≈ ${fmt(ge * 100, 2)}%. The mean is n · K/N = ${fmt(mean, 3)}.`
          + ` The draw is without replacement: every item taken changes what is left. With replacement, the <a href="${PAGE("distribuicao-binomial")}?n=${n}&amp;p=${Number((pb * 100).toFixed(4))}&amp;k=${k}">binomial with p = K/N</a> would apply,`
          + ` giving ${fmt(bin * 100, 2)}%. The gap vanishes when the sample is a small fraction of the population; the hypergeometric variance is the binomial one times (N − n)/(N − 1), the finite population correction.`),
      };
    },

    welch({ x1, s1, n1, x2, s2, n2 }) {
      if (s1 <= 0 || s2 <= 0) return sdError;
      if (![n1, n2].every(v => Number.isInteger(v) && v >= 2)) return { error: T("Cada grupo precisa de um tamanho inteiro de pelo menos 2.", "Each group needs an integer size of at least 2.") };
      const v1 = s1 * s1 / n1, v2 = s2 * s2 / n2;
      const se = Math.sqrt(v1 + v2), diff = x1 - x2, t = diff / se;
      const df = (v1 + v2) ** 2 / (v1 * v1 / (n1 - 1) + v2 * v2 / (n2 - 1));
      const p = tTwoTail(Math.abs(t), df);
      const tc = tCrit(0.05, df);
      const lo = diff - tc * se, hi = diff + tc * se;
      const sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2));
      const dC = diff / sp;
      const tpdf = v => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log1p(v * v / df));
      const R = Math.max(4, Math.abs(t) + 1);
      const pts = Array.from({ length: 201 }, (_, i) => { const v = -R + 2 * R * i / 200; return [v, tpdf(v)]; });
      const vline = v => ({ pts: [[v, 0], [v, tpdf(v)]], cls: "chart-fit" });
      const SE = tone(texNum(se), 3), DF = tone(texNum(df, 2), 4);
      const veredito = p < 0.05
        ? T("Ao nível de 5%, rejeita-se H₀: as médias dos dois grupos diferem.", "At the 5% level, H₀ is rejected: the two group means differ.")
        : T("Ao nível de 5%, não se rejeita H₀: a diferença observada é compatível com o acaso.", "At the 5% level, H₀ is not rejected: the observed difference is consistent with chance.");
      return {
        result: `t ${approx(t)} ${tone(texNum(t), 1)}, \\qquad ${T("gl", "df")} ${approx(df, 2)} ${DF}`,
        chart: {
          type: "curve", label: T(`Distribuição t com ${fmt(df, 1)} graus de liberdade; marcado t = ${fmt(t, 3)} e, em linhas, os valores críticos ±${fmt(tc, 3)}`, `t distribution with ${fmt(df, 1)} degrees of freedom; t = ${fmt(t, 3)} marked and, as lines, the critical values ±${fmt(tc, 3)}`),
          xLabel: T(`t · linhas escuras: valores críticos de 5% (±${fmt(tc, 2)})`, `t · dark lines: 5% critical values (±${fmt(tc, 2)})`),
          xMin: -R, xMax: R, yMax: tpdf(0), pts, marker: [t, tpdf(t)], lines: [vline(-tc), vline(tc)],
          tipAt: v => [`t = ${fmt(v, 2)}`, T(`P(|T| ≥ ${fmt(Math.abs(v), 2)}) ≈ ${fmt(tTwoTail(Math.abs(v), df), 4)}`, `P(|T| ≥ ${fmt(Math.abs(v), 2)}) ≈ ${fmt(tTwoTail(Math.abs(v), df), 4)}`)],
        },
        steps: [
          [T("Calcule a variância da média de cada grupo, s²/n:", "Compute the variance of each group's mean, s²/n:"),
            `\\dfrac{s_1^2}{n_1} = \\dfrac{${texNum(s1)}^2}{${n1}} ${approx(v1)} ${texNum(v1)}, \\qquad \\dfrac{s_2^2}{n_2} = \\dfrac{${texNum(s2)}^2}{${n2}} ${approx(v2)} ${texNum(v2)}`],
          [T("Some e tire a raiz: é o erro padrão da diferença.", "Add them and take the root: this is the standard error of the difference."),
            `${T("EP", "SE")} = \\sqrt{${texNum(v1)} + ${texNum(v2)}} ${approx(se)} ${SE}`],
          [T("Divida a diferença das médias pelo erro padrão:", "Divide the difference of the means by the standard error:"),
            `t = \\dfrac{${tone(texNum(x1), 2)} - ${paren(x2, tone(texNum(x2), 2))}}{${SE}} ${approx(t)} ${tone(texNum(t), 1)}`],
          [T("Os graus de liberdade vêm da aproximação de Welch–Satterthwaite:", "The degrees of freedom come from the Welch–Satterthwaite approximation:"),
            `${T("gl", "df")} = \\dfrac{(${texNum(v1)} + ${texNum(v2)})^2}{\\dfrac{${texNum(v1)}^2}{${n1 - 1}} + \\dfrac{${texNum(v2)}^2}{${n2 - 1}}} ${approx(df, 2)} ${DF}`],
        ],
        note: T(`Com ${fmt(df, 2)} graus de liberdade, o valor-p bilateral é ${pValueText(p)}. ${veredito}`
          + ` O intervalo de 95% para a diferença μ₁ − μ₂ vai de ${fmt(lo)} a ${fmt(hi)}${lo > 0 || hi < 0 ? ", e não contém o zero" : ", e contém o zero"}.`
          + ` O tamanho do efeito é d de Cohen ≈ ${fmt(dC, 2)}; para planejar um estudo que detecte esse efeito, use o <a href="${PAGE("poder-estatistico")}?d=${Math.abs(Number(dC.toFixed(2)))}&amp;g=2">poder estatístico</a>.`
          + " Welch não supõe variâncias iguais nos dois grupos, e por isso é o padrão recomendado (e o do R).",
          `With ${fmt(df, 2)} degrees of freedom, the two-sided p-value is ${pValueText(p)}. ${veredito}`
          + ` The 95% interval for the difference μ₁ − μ₂ runs from ${fmt(lo)} to ${fmt(hi)}${lo > 0 || hi < 0 ? ", and doesn't contain zero" : ", and contains zero"}.`
          + ` The effect size is Cohen's d ≈ ${fmt(dC, 2)}; to plan a study that detects this effect, use <a href="${PAGE("poder-estatistico")}?d=${Math.abs(Number(dC.toFixed(2)))}&amp;g=2">statistical power</a>.`
          + " Welch doesn't assume equal variances in the two groups, which is why it is the recommended default (and R's)."),
      };
    },

    r2({ x, y }) {
      const d = paired(x, y, v => `\\bar{${v}}`);
      if (d.error) return d;
      if (d.sxx === 0) return { error: T("Os valores de x são todos iguais: não há reta para ajustar.", "The x values are all equal: there is no line to fit.") };
      if (d.syy === 0) return { error: T("Os valores de y são todos iguais: não há variação para explicar.", "The y values are all equal: there is no variation to explain.") };
      const b1 = d.sxy / d.sxx, b0 = d.my - b1 * d.mx;
      const yh = x.map(v => b0 + b1 * v), res = y.map((v, i) => v - yh[i]);
      const sqt = d.syy, sqres = res.reduce((s, v) => s + v * v, 0), sqreg = sqt - sqres;
      const r2v = sqreg / sqt, n = d.n;
      const adj = n > 2 ? 1 - (1 - r2v) * (n - 1) / (n - 2) : NaN;
      const T1 = tone(texNum(sqt), 3), T2 = tone(texNum(sqres), 2);
      const table = d.table([
        ["i", i => i + 1, "\\Sigma"],
        ["y_i", i => texNum(y[i])],
        ["(y_i - \\bar{y})^2", i => texNum(d.dy[i] ** 2), T1],
        ["\\hat{y}_i", i => texNum(yh[i])],
        ["(y_i - \\hat{y}_i)^2", i => texNum(res[i] ** 2), T2],
      ]);
      const pad = (lo, hi) => { const s = hi - lo || Math.abs(hi) || 1; return [lo - s * 0.12, hi + s * 0.12]; };
      const [xMin, xMax] = pad(Math.min(...x), Math.max(...x));
      const [yMin, yMax] = pad(Math.min(...y), Math.max(...y));
      return {
        result: `R^2 ${approx(r2v)} ${tone(texNum(r2v), 1)}`,
        chart: {
          type: "scatter", height: 300, xMin, xMax, yMin, yMax, pred: null,
          dots: x.map((v, i) => [v, y[i]]), fields: ["x", "y"],
          label: T("Pontos (x, y) com a reta de mínimos quadrados e os resíduos", "Points (x, y) with the least-squares line and the residuals"),
          xLabel: "x",
          hint: T("Arraste os pontos e veja o R² mudar: quanto menores os resíduos (as linhas tracejadas) perto da variação total de y, mais perto de 1. Toque num espaço vazio para acrescentar um ponto; pelo teclado, as setas movem o ponto em foco e Delete o remove.",
            "Drag the points and watch R² change: the smaller the residuals (the dashed lines) next to the total variation of y, the closer it gets to 1. Tap an empty spot to add a point; with the keyboard, the arrows move the focused point and Delete removes it."),
        },
        steps: [
          d.meansStep,
          [T("Ajuste a reta de mínimos quadrados e compare, ponto a ponto, a variação total de y com o que sobra depois da reta:", "Fit the least-squares line and compare, point by point, the total variation of y with what is left after the line:"),
            `\\hat{y} = ${texNum(b0)} ${b1 < 0 ? "-" : "+"} ${texNum(Math.abs(b1))}\\,x \\qquad ${table}`],
          [T("Divida a soma dos quadrados dos resíduos pela soma total e subtraia de 1:", "Divide the residual sum of squares by the total sum and subtract from 1:"),
            `R^2 = 1 - \\dfrac{${T2}}{${T1}} ${approx(r2v)} ${tone(texNum(r2v), 1)}`],
        ],
        note: T(`A reta explica ${fmt(r2v * 100, 1)}% da variação de y; os outros ${fmt((1 - r2v) * 100, 1)}% ficam nos resíduos.`
          + ` Na regressão simples, R² é o quadrado do <a href="${d.link(PAGE("coeficiente-pearson"))}">coeficiente de Pearson</a> (r ≈ ${fmt(Math.sign(b1) * Math.sqrt(r2v), 4)}) — mas perde o sinal: não diz se a relação sobe ou desce.`
          + (n > 2 ? ` O R² ajustado, que desconta o número de parâmetros, é ${fmt(adj)}.` : "")
          + ` R² alto não prova causa nem que a reta seja o modelo certo: confira os resíduos na <a href="${d.link(PAGE("regressao-linear"))}">regressão linear</a>.`,
          `The line explains ${fmt(r2v * 100, 1)}% of the variation in y; the other ${fmt((1 - r2v) * 100, 1)}% stays in the residuals.`
          + ` In simple regression, R² is the square of the <a href="${d.link(PAGE("coeficiente-pearson"))}">Pearson coefficient</a> (r ≈ ${fmt(Math.sign(b1) * Math.sqrt(r2v), 4)}) — but it loses the sign: it doesn't say whether the relationship goes up or down.`
          + (n > 2 ? ` The adjusted R², which discounts the number of parameters, is ${fmt(adj)}.` : "")
          + ` A high R² proves neither cause nor that a line is the right model: check the residuals in <a href="${d.link(PAGE("regressao-linear"))}">linear regression</a>.`),
      };
    },

    odds({ o, conf }) {
      if (conf <= 0 || conf >= 100) return confError;
      if (o.length !== 2 || o.some(r => r.length !== 2)) return { error: T("Informe uma tabela 2 × 2: duas linhas de dois valores, separadas por ponto e vírgula.", "Enter a 2 × 2 table: two rows of two values, separated by a semicolon.") };
      if (o.flat().some(v => v < 0 || !Number.isInteger(v))) return { error: T("As contagens precisam ser inteiros não negativos.", "The counts must be non-negative integers.") };
      let [[a, b], [c, dd]] = o;
      if (a + b === 0 || c + dd === 0) return { error: T("Cada grupo precisa ter pelo menos uma pessoa.", "Each group needs at least one person.") };
      // Célula zero: correção de Haldane, meio a mais em todas as células.
      const zero = [a, b, c, dd].includes(0);
      if (zero) { a += 0.5; b += 0.5; c += 0.5; dd += 0.5; }
      const z = zCrit(conf);
      const or = a * dd / (b * c);
      const p1 = a / (a + b), p0 = c / (c + dd), rr = p1 / p0;
      const seOr = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / dd);
      const seRr = Math.sqrt(1 / a - 1 / (a + b) + 1 / c - 1 / (c + dd));
      const ciOr = [Math.exp(Math.log(or) - z * seOr), Math.exp(Math.log(or) + z * seOr)];
      const ciRr = [Math.exp(Math.log(rr) - z * seRr), Math.exp(Math.log(rr) + z * seRr)];
      const excl = ci => ci[0] > 1 || ci[1] < 1;
      const A = tone(texNum(a), 2), D = tone(texNum(dd), 2), B = tone(texNum(b), 3), C = tone(texNum(c), 3);
      const lo = Math.min(ciOr[0], ciRr[0], 1), hi = Math.max(ciOr[1], ciRr[1], 1);
      const confTxt = `${fmt(conf, 2)}%`;
      return {
        result: `OR ${approx(or)} ${tone(texNum(or), 1)}, \\qquad RR ${approx(rr)} ${texNum(rr)}`,
        chart: {
          type: "intervals", height: 150,
          label: T(`Intervalos de ${confTxt} para a razão de chances e o risco relativo; a linha vertical marca 1, nenhuma associação`, `${confTxt} intervals for the odds ratio and the relative risk; the vertical line marks 1, no association`),
          xLabel: T("linha vertical: 1 (sem associação) · em cima: OR · embaixo: RR · destaque: o intervalo não contém 1", "vertical line: 1 (no association) · top: OR · bottom: RR · highlighted: the interval excludes 1"),
          xMin: Math.max(0, lo - (hi - lo) * 0.08), xMax: hi + (hi - lo) * 0.08, truth: 1,
          rows: [{ lo: ciOr[0], hi: ciOr[1], hit: !excl(ciOr) }, { lo: ciRr[0], hi: ciRr[1], hit: !excl(ciRr) }],
          tip: (r, i) => [`${fmt(r.lo, 3)} – ${fmt(r.hi, 3)}`, i ? T("risco relativo", "relative risk") : T("razão de chances", "odds ratio")],
        },
        steps: [
          ...(zero ? [[T("Há uma célula com zero, que zeraria ou tornaria infinita a razão: some 0,5 a todas as células (correção de Haldane).", "There is a cell with zero, which would make the ratio zero or infinite: add 0.5 to every cell (Haldane's correction)."),
            `a = ${texNum(a)}, \\quad b = ${texNum(b)}, \\quad c = ${texNum(c)}, \\quad d = ${texNum(dd)}`]] : []),
          [T("A razão de chances multiplica a diagonal principal e divide pela outra:", "The odds ratio multiplies the main diagonal and divides by the other one:"),
            `OR = \\dfrac{${A} \\cdot ${D}}{${B} \\cdot ${C}} ${approx(or)} ${tone(texNum(or), 1)}`],
          [T("O risco relativo compara as proporções com o desfecho em cada grupo:", "The relative risk compares the share with the outcome in each group:"),
            `RR = \\dfrac{${texNum(a)} / ${texNum(a + b)}}{${texNum(c)} / ${texNum(c + dd)}} = \\dfrac{${texNum(p1)}}{${texNum(p0)}} ${approx(rr)} ${texNum(rr)}`],
          [T(`O intervalo de ${confTxt} se calcula na escala do logaritmo e depois volta com a exponencial:`, `The ${confTxt} interval is computed on the log scale and then brought back with the exponential:`),
            `e^{\\ln OR \\,\\pm\\, ${texNum(z)} \\sqrt{\\frac{1}{a} + \\frac{1}{b} + \\frac{1}{c} + \\frac{1}{d}}} = ${interval(ciOr[0], ciOr[1])}`],
        ],
        note: T(`No grupo exposto, a chance do desfecho é ${fmt(or, 2)} vezes a do grupo não exposto; o risco, ${fmt(rr, 2)} vezes.`
          + ` O intervalo de ${confTxt} da razão de chances vai de ${fmt(ciOr[0], 3)} a ${fmt(ciOr[1], 3)}${excl(ciOr) ? " e não contém 1: a associação é significativa" : " e contém 1: os dados são compatíveis com nenhuma associação"}.`
          + ` As duas medidas só ficam parecidas quando o desfecho é raro. Num estudo de caso-controle, em que as proporções de doentes foram escolhidas pelo pesquisador, só a razão de chances vale.`
          + ` Para testar a associação, veja o <a href="${PAGE("qui-quadrado-independencia")}?o=${encodeURIComponent(o.map(r => r.join(" ")).join("; "))}">qui-quadrado com esta tabela</a>.`,
          `In the exposed group, the odds of the outcome are ${fmt(or, 2)} times those of the unexposed group; the risk, ${fmt(rr, 2)} times.`
          + ` The ${confTxt} interval for the odds ratio runs from ${fmt(ciOr[0], 3)} to ${fmt(ciOr[1], 3)}${excl(ciOr) ? " and excludes 1: the association is significant" : " and includes 1: the data are consistent with no association"}.`
          + ` The two measures only agree when the outcome is rare. In a case-control study, where the share of cases was chosen by the researcher, only the odds ratio is valid.`
          + ` To test the association, see the <a href="${PAGE("qui-quadrado-independencia")}?o=${encodeURIComponent(o.map(r => r.join(" ")).join("; "))}">chi-square with this table</a>.`),
      };
    },

    quartis({ x }) {
      const n = x.length;
      if (n < 4) return { error: T("Informe pelo menos quatro valores.", "Enter at least four values.") };
      if (n > 1000) return { error: T("Use no máximo 1.000 valores.", "Use at most 1,000 values.") };
      const s = x.slice().sort((p, q) => p - q);
      // Método 7 de Hyndman e Fan, o padrão do R e do QUARTIL do Excel.
      const q = p => { const h = (n - 1) * p, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); };
      const q1 = q(0.25), q2 = q(0.5), q3 = q(0.75), iqr = q3 - q1;
      const f1 = q1 - 1.5 * iqr, f2 = q3 + 1.5 * iqr;
      const out = s.filter(v => v < f1 || v > f2);
      const inside = s.filter(v => v >= f1 && v <= f2);
      const wLo = Math.min(...inside), wHi = Math.max(...inside);
      const pos = p => { const h = (n - 1) * p, lo = Math.floor(h), fr = h - lo;
        return fr < 1e-9
          ? `Q = x_{(${lo + 1})} = ${texNum(s[lo])}`
          : `Q = x_{(${lo + 1})} + ${texNum(fr, 4)} \\cdot (x_{(${lo + 2})} - x_{(${lo + 1})}) = ${texNum(s[lo])} + ${texNum(fr, 4)} \\cdot (${texNum(s[lo + 1])} - ${paren(s[lo], texNum(s[lo]))}) ${approx(q(p))} ${texNum(q(p))}`; };
      const sorted = n <= 20 ? s.map(v => texNum(v)).join(",\\ ") : `${s.slice(0, 5).map(v => texNum(v)).join(",\\ ")},\\ \\ldots,\\ ${s.slice(-3).map(v => texNum(v)).join(",\\ ")}`;
      const span = Math.max(...s) - Math.min(...s) || 1;
      const Q1 = tone(texNum(q1), 2), Q3 = tone(texNum(q3), 3);
      const qs = new URLSearchParams({ x: x.join(" ") });
      return {
        result: `Q_1 ${approx(q1)} ${Q1}, \\quad Q_3 ${approx(q3)} ${Q3}, \\quad IQR ${approx(iqr)} ${tone(texNum(iqr), 1)}`,
        chart: {
          type: "box", height: 150, xMin: Math.min(...s) - span * 0.06, xMax: Math.max(...s) + span * 0.06,
          label: T(`Boxplot: caixa de ${fmt(q1)} a ${fmt(q3)}, mediana ${fmt(q2)}, ${out.length} ${out.length === 1 ? "valor atípico" : "valores atípicos"}`, `Boxplot: box from ${fmt(q1)} to ${fmt(q3)}, median ${fmt(q2)}, ${out.length} outlier${out.length === 1 ? "" : "s"}`),
          xLabel: T("valores · caixa: Q₁ a Q₃ · traço: mediana · pontos: valores atípicos", "values · box: Q₁ to Q₃ · line: median · dots: outliers"),
          box: { q1, q2, q3, wLo, wHi, out },
          tip: [`IQR = ${fmt(iqr)}`, T(`Q₁ = ${fmt(q1)}, mediana = ${fmt(q2)}, Q₃ = ${fmt(q3)}`, `Q₁ = ${fmt(q1)}, median = ${fmt(q2)}, Q₃ = ${fmt(q3)}`)],
        },
        steps: [
          [T(`Ordene os ${n} valores:`, `Sort the ${n} values:`), sorted],
          [T(`Q₁ fica na posição 1 + (n − 1) · 0,25 = ${fmt(1 + (n - 1) * 0.25, 2)}; entre dois valores, interpole:`, `Q₁ sits at position 1 + (n − 1) · 0.25 = ${fmt(1 + (n - 1) * 0.25, 2)}; between two values, interpolate:`), pos(0.25).replace("Q =", "Q_1 =")],
          [T(`A mediana fica na posição ${fmt(1 + (n - 1) * 0.5, 2)}, e Q₃ na ${fmt(1 + (n - 1) * 0.75, 2)}:`, `The median sits at position ${fmt(1 + (n - 1) * 0.5, 2)}, and Q₃ at ${fmt(1 + (n - 1) * 0.75, 2)}:`),
            `${pos(0.5).replace("Q =", "Q_2 =")} \\\\ ${pos(0.75).replace("Q =", "Q_3 =")}`.replace(/^(.*)$/, "\\begin{gathered}$1\\end{gathered}")],
          [T("A amplitude interquartil é a largura da caixa:", "The interquartile range is the width of the box:"), `IQR = ${Q3} - ${paren(q1, Q1)} ${approx(iqr)} ${tone(texNum(iqr), 1)}`],
          [T("Valores além de 1,5 · IQR das bordas da caixa são atípicos:", "Values more than 1.5 · IQR beyond the edges of the box are outliers:"),
            `${texNum(q1)} - 1{,}5 \\cdot ${texNum(iqr)} ${approx(f1)} ${texNum(f1)}, \\qquad ${texNum(q3)} + 1{,}5 \\cdot ${texNum(iqr)} ${approx(f2)} ${texNum(f2)}`.replace(/1\{,\}5/g, EN ? "1.5" : "1{,}5")],
        ],
        note: (out.length
          ? T(`${out.length === 1 ? "Um valor fica" : `${out.length} valores ficam`} fora dessa faixa e ${out.length === 1 ? "aparece" : "aparecem"} como ponto no boxplot: ${list(out.map(v => fmt(v)))}.`,
            `${out.length === 1 ? "One value lies" : `${out.length} values lie`} outside that range and ${out.length === 1 ? "shows" : "show"} as a dot in the boxplot: ${list(out.map(v => fmt(v)))}.`)
          : T("Nenhum valor fica fora dessa faixa; os bigodes vão do mínimo ao máximo.", "No value lies outside that range; the whiskers run from the minimum to the maximum."))
          + T(` Metade dos dados está entre ${fmt(q1)} e ${fmt(q3)}. Diferente do <a href="${PAGE("desvio-padrao")}?${qs}">desvio padrão destes valores</a>, a IQR quase não se mexe com valores extremos.`
            + " Há vários métodos de quartil, que dão números um pouco diferentes em amostras pequenas; este é o padrão do R e da função QUARTIL do Excel.",
            ` Half the data lie between ${fmt(q1)} and ${fmt(q3)}. Unlike the <a href="${PAGE("desvio-padrao")}?${qs}">standard deviation of these values</a>, the IQR barely moves with extreme values.`
            + " There are several quartile methods, which give slightly different numbers in small samples; this is the default in R and in Excel's QUARTILE."),
      };
    },

    lgn({ tipo, n, seed }) {
      if (!Number.isInteger(n) || n < 1 || n > 100000) return { error: T("O número de lançamentos precisa ser um inteiro entre 1 e 100.000.", "The number of throws must be an integer between 1 and 100,000.") };
      if (!Number.isInteger(seed) || seed < 0) return { error: T("A semente precisa ser um inteiro não negativo.", "The seed must be a non-negative integer.") };
      const dado = tipo === "dado";
      const mu = dado ? 3.5 : 0.5, sd = dado ? Math.sqrt(35 / 12) : 0.5;
      const rand = rng(seed);
      // Guarda a média acumulada em ~400 pontos, mais densos no começo.
      const keep = new Set(Array.from({ length: 400 }, (_, i) => Math.max(1, Math.round(n ** (i / 399)))));
      const path = [];
      let sum = 0;
      for (let k = 1; k <= n; k++) {
        sum += dado ? Math.floor(rand() * 6) + 1 : (rand() < 0.5 ? 1 : 0);
        if (keep.has(k)) path.push([k, sum / k]);
      }
      const mean = sum / n, err = mean - mu, se = sd / Math.sqrt(n);
      const band = s => ({ pts: path.map(([k]) => [k, mu + s * 2 * sd / Math.sqrt(k)]), cls: "chart-band" });
      const lo = dado ? 1 : 0, hi = dado ? 6 : 1;
      const MU = tone(texNum(mu), 2);
      return {
        result: `\\bar{X}_{${texNum(n)}} ${approx(mean, 6)} ${tone(texNum(mean, 6), 1)}`,
        chart: {
          type: "curve", label: T(`Média acumulada de ${fmt(n)} ${dado ? "lançamentos de um dado" : "lançamentos de uma moeda (1 = cara)"}, aproximando-se de ${fmt(mu)}`, `Running mean of ${fmt(n)} ${dado ? "rolls of a die" : "tosses of a coin (1 = heads)"}, approaching ${fmt(mu)}`),
          xLabel: T(`lançamentos, em escala logarítmica · tracejada fina: ±2 erros padrão em torno de ${fmt(mu)}`, `throws, on a log scale · thin dashed: ±2 standard errors around ${fmt(mu)}`),
          xMin: 1, xMax: Math.max(n, 2), logX: true, yMin: lo, yMax: hi, pts: path,
          hlines: [{ y: mu, cls: "chart-ref" }], lines: [band(1), band(-1)],
          tipAt: v => { let best = path[0]; for (const p of path) if (Math.abs(p[0] - v) < Math.abs(best[0] - v)) best = p; return [fmt(best[1], 4), T(`média após ${fmt(best[0])} lançamentos`, `mean after ${fmt(best[0])} throws`)]; },
        },
        steps: [
          [T(`Cada ${dado ? "lançamento do dado" : "lançamento da moeda"} tem valor esperado e desvio padrão:`, `Each ${dado ? "roll of the die" : "toss of the coin"} has an expected value and a standard deviation:`),
            `\\mu = ${MU}, \\qquad \\sigma ${approx(sd, 4)} ${texNum(sd, 4)}`],
          [T(`A simulação fez ${fmt(n)} lançamentos e tirou a média:`, `The simulation made ${fmt(n)} throws and took the mean:`),
            `\\bar{X}_{${texNum(n)}} = \\dfrac{${texNum(sum)}}{${texNum(n)}} ${approx(mean, 6)} ${tone(texNum(mean, 6), 1)}`],
          [T("Compare o erro com o erro padrão σ/√n, a distância típica nessa altura:", "Compare the error with the standard error σ/√n, the typical distance at this point:"),
            `\\bar{X}_{${texNum(n)}} - \\mu ${approx(err, 6)} ${texNum(err, 6)}, \\qquad \\dfrac{\\sigma}{\\sqrt{n}} ${approx(se, 6)} ${texNum(se, 6)}`],
        ],
        note: T(`A média acumulada oscila muito no começo e vai se acomodando em torno de ${fmt(mu)}: a faixa tracejada encolhe como 1/√n. Aumente n ou sorteie de novo para ver outro caminho chegar ao mesmo lugar.`
          + " A lei não diz que os resultados “compensam”: depois de uma sequência de valores altos, o próximo lançamento não fica mais propenso a dar baixo. As sequências passadas só ficam diluídas entre muitos lançamentos novos."
          + ` Veja o <a href="${PAGE("valor-esperado")}">valor esperado</a>, para onde a média vai, e o <a href="${PAGE("erro-padrao")}">erro padrão</a>, o quanto ela ainda erra.`,
          `The running mean swings a lot at first and settles around ${fmt(mu)}: the dashed band shrinks like 1/√n. Increase n or draw again to watch another path reach the same place.`
          + " The law doesn't say outcomes “even out”: after a streak of high values, the next throw is no more likely to come out low. Past streaks just get diluted among many new throws."
          + ` See the <a href="${PAGE("valor-esperado")}">expected value</a>, where the mean is headed, and the <a href="${PAGE("erro-padrao")}">standard error</a>, how far off it still is.`),
      };
    },

    anova({ o }) {
      const k = o.length;
      if (k < 2) return { error: T("Informe pelo menos dois grupos, um por linha, separados por ponto e vírgula.", "Enter at least two groups, one per row, separated by semicolons.") };
      if (k > 12) return { error: T("Use no máximo 12 grupos.", "Use at most 12 groups.") };
      if (o.some(g => g.length < 2)) return { error: T("Cada grupo precisa de pelo menos dois valores.", "Each group needs at least two values.") };
      const sum = a => a.reduce((s, v) => s + v, 0);
      const N = sum(o.map(g => g.length));
      if (N > 2000) return { error: T("Use no máximo 2.000 valores ao todo.", "Use at most 2,000 values in all.") };
      const ns = o.map(g => g.length), means = o.map(g => sum(g) / g.length);
      const grand = sum(o.map(sum)) / N;
      const sqe = sum(ns.map((n, i) => n * (means[i] - grand) ** 2));
      const sqdg = o.map((g, i) => sum(g.map(v => (v - means[i]) ** 2)));
      const sqd = sum(sqdg), sqt = sqe + sqd;
      const df1 = k - 1, df2 = N - k;
      if (sqd === 0) return { error: T("Não há variação dentro dos grupos: todos os valores de cada grupo são iguais.", "There is no variation within the groups: every value in each group is the same.") };
      const qme = sqe / df1, qmd = sqd / df2, F = qme / qmd;
      const p = betainc(df2 / (df2 + df1 * F), df2 / 2, df1 / 2);
      const eta = sqe / sqt;
      const all = o.flat(), lo = Math.min(...all), hi = Math.max(...all), span = hi - lo || 1;
      const boxes = o.map((g, i) => ({ ...boxStats(g), label: `${T("Grupo", "Group")} ${i + 1}` }));
      const SE = tone(texNum(sqe), 2), SD = tone(texNum(sqd), 3), Fv = tone(texNum(F), 1);
      const groupRows = o.map((g, i) => `${i + 1} & ${ns[i]} & ${texNum(means[i])} & ${texNum(sqdg[i])}`).join(" \\\\ ");
      const veredito = p < 0.05
        ? T("Ao nível de 5%, rejeita-se H₀: pelo menos uma média difere das outras. A ANOVA não diz qual; para isso há os testes de comparações múltiplas, como o de Tukey.",
          "At the 5% level, H₀ is rejected: at least one mean differs from the others. ANOVA doesn't say which; that is what multiple-comparison tests such as Tukey's are for.")
        : T("Ao nível de 5%, não se rejeita H₀: as diferenças entre as médias são compatíveis com o acaso.", "At the 5% level, H₀ is not rejected: the differences between the means are consistent with chance.");
      return {
        result: `F ${approx(F)} ${Fv}, \\qquad \\text{${T("valor-p", "p-value")}} ${p < 0.0001 ? "< 0{,}0001".replace("{,}", EN ? "." : "{,}") : `${approx(p, 4)} ${texNum(p, 4)}`}`,
        chart: {
          type: "box", height: Math.min(360, 60 + k * 50), xMin: lo - span * 0.06, xMax: hi + span * 0.06, boxes, truth: grand,
          label: T(`Boxplot de cada um dos ${k} grupos, com a média geral ${fmt(grand)} marcada`, `Boxplot of each of the ${k} groups, with the grand mean ${fmt(grand)} marked`),
          xLabel: T(`valores · um boxplot por grupo, de cima para baixo · linha vertical: média geral`, `values · one boxplot per group, top to bottom · vertical line: grand mean`),
          tip: null,
        },
        steps: [
          [T("Calcule o tamanho, a média e a soma dos quadrados dentro de cada grupo:", "Compute the size, mean and within sum of squares of each group:"),
            `\\begin{array}{c|c|c|c} ${T("\\text{grupo}", "\\text{group}")} & n_i & \\bar{x}_i & \\sum (x - \\bar{x}_i)^2 \\\\ \\hline ${groupRows} \\\\ \\hline & ${N} & \\bar{x} = ${texNum(grand)} & ${SD} \\end{array}`],
          [T("A variação entre grupos mede o quanto as médias se afastam da média geral:", "The between-group variation measures how far the means are from the grand mean:"),
            `${T("SQ", "SS")}_{\\text{${T("entre", "between")}}} = \\textstyle\\sum n_i (\\bar{x}_i - \\bar{x})^2 ${approx(sqe)} ${SE}`],
          [T("Divida cada soma pelos seus graus de liberdade e faça a razão:", "Divide each sum by its degrees of freedom and take the ratio:"),
            `F = \\dfrac{${SE} / ${df1}}{${SD} / ${df2}} = \\dfrac{${texNum(qme)}}{${texNum(qmd)}} ${approx(F)} ${Fv}`],
        ],
        note: T(`Com ${df1} e ${df2} graus de liberdade, o valor-p é ${pValueText(p)}. ${veredito}`
          + ` As diferenças entre grupos explicam η² ≈ ${fmt(eta * 100, 1)}% da variação total.`
          + ` O valor crítico também pode ser lido na <a href="/ftable.html">tabela F</a>. Com só dois grupos, a ANOVA equivale ao teste t com variâncias iguais: F = t².`,
          `With ${df1} and ${df2} degrees of freedom, the p-value is ${pValueText(p)}. ${veredito}`
          + ` Differences between groups explain η² ≈ ${fmt(eta * 100, 1)}% of the total variation.`
          + ` The critical value can also be read from the <a href="/ftable.html">F table</a>. With only two groups, ANOVA is equivalent to the equal-variance t-test: F = t².`),
      };
    },

    tpar({ x, y }) {
      if (x.length !== y.length) return { error: T(`Há ${x.length} valores antes e ${y.length} depois; cada pessoa precisa dos dois.`, `There are ${x.length} values before and ${y.length} after; each person needs both.`) };
      const n = x.length;
      if (n < 2) return { error: T("Informe pelo menos dois pares.", "Enter at least two pairs.") };
      if (n > 500) return { error: T("Use no máximo 500 pares.", "Use at most 500 pairs.") };
      const sum = a => a.reduce((s, v) => s + v, 0);
      const d = y.map((v, i) => v - x[i]);
      const md = sum(d) / n, sd = Math.sqrt(sum(d.map(v => (v - md) ** 2)) / (n - 1));
      if (sd === 0) return { error: T("Todas as diferenças são iguais: sem variação, o teste não se aplica.", "All the differences are equal: with no variation, the test doesn't apply.") };
      const se = sd / Math.sqrt(n), t = md / se, df = n - 1;
      const p = tTwoTail(Math.abs(t), df), tc = tCrit(0.05, df);
      // O teste errado, tratando antes e depois como grupos independentes (Welch).
      const mx = sum(x) / n, my = sum(y) / n;
      const vx = sum(x.map(v => (v - mx) ** 2)) / (n - 1), vy = sum(y.map(v => (v - my) ** 2)) / (n - 1);
      const seW = Math.sqrt(vx / n + vy / n), tW = (my - mx) / seW;
      const dfW = (vx / n + vy / n) ** 2 / ((vx / n) ** 2 / (n - 1) + (vy / n) ** 2 / (n - 1));
      const pW = tTwoTail(Math.abs(tW), dfW);
      const lo = Math.min(0, ...d), hi = Math.max(0, ...d), pad = (hi - lo) * 0.08 || 1;
      const table = n > MAX_TABLE
        ? T(`\\text{(${n} pares: a tabela ficaria longa demais)}`, `\\text{(${n} pairs: the table would be too long)}`)
        : `\\begin{array}{c|c|c|c} i & ${T("\\text{antes}", "\\text{before}")} & ${T("\\text{depois}", "\\text{after}")} & d_i \\\\ \\hline `
          + x.map((v, i) => `${i + 1} & ${texNum(v)} & ${texNum(y[i])} & ${tone(texNum(d[i]), 2)}`).join(" \\\\ ") + " \\end{array}";
      const SE = tone(texNum(se), 3);
      return {
        result: `t ${approx(t)} ${tone(texNum(t), 1)}, \\qquad ${T("gl", "df")} = ${df}`,
        chart: {
          type: "intervals", height: Math.max(150, Math.min(320, 50 + n * 22)),
          label: T("A diferença de cada pessoa, de zero até o valor dela; destacadas as que diminuíram", "Each person's difference, from zero to its value; the decreases highlighted"),
          xLabel: T("diferença depois − antes · linha vertical: zero · destaque: diminuiu", "difference after − before · vertical line: zero · highlighted: decreased"),
          xMin: lo - pad, xMax: hi + pad, truth: 0,
          rows: d.map(v => ({ lo: Math.min(0, v), hi: Math.max(0, v), hit: v >= 0 })),
          tip: (r, i) => [fmt(d[i]), T(`pessoa ${i + 1}: de ${fmt(x[i])} para ${fmt(y[i])}`, `person ${i + 1}: from ${fmt(x[i])} to ${fmt(y[i])}`)],
        },
        steps: [
          [T("Calcule a diferença de cada pessoa, depois menos antes:", "Compute each person's difference, after minus before:"), table],
          [T("Tire a média e o desvio padrão das diferenças:", "Take the mean and standard deviation of the differences:"),
            `\\bar{d} ${approx(md)} ${tone(texNum(md), 2)}, \\qquad s_d ${approx(sd)} ${texNum(sd)}`],
          [T("Divida a média pelo erro padrão, como num teste t de uma amostra:", "Divide the mean by its standard error, as in a one-sample t-test:"),
            `t = \\dfrac{${tone(texNum(md), 2)}}{${texNum(sd)} / \\sqrt{${n}}} = \\dfrac{${tone(texNum(md), 2)}}{${SE}} ${approx(t)} ${tone(texNum(t), 1)}`],
        ],
        note: T(`Com ${dof(df)}, o valor-p bilateral é ${pValueText(p)}; ${p < 0.05 ? "a mudança média é significativa a 5%" : "a mudança média não é significativa a 5%"}.`
          + ` O intervalo de 95% para a mudança média vai de ${fmt(md - tc * se)} a ${fmt(md + tc * se)}.`
          + ` Se os mesmos dados fossem tratados, por engano, como dois grupos independentes, o <a href="${PAGE("t-duas-amostras")}">teste de Welch</a> daria t ≈ ${fmt(tW, 3)} e p ≈ ${fmt(pW, 4)}:`
          + " a variação entre pessoas, que o pareamento elimina, voltaria a esconder a mudança.",
          `With ${dof(df)}, the two-sided p-value is ${pValueText(p)}; ${p < 0.05 ? "the mean change is significant at 5%" : "the mean change is not significant at 5%"}.`
          + ` The 95% interval for the mean change runs from ${fmt(md - tc * se)} to ${fmt(md + tc * se)}.`
          + ` If the same data were wrongly treated as two independent groups, <a href="${PAGE("t-duas-amostras")}">Welch's test</a> would give t ≈ ${fmt(tW, 3)} and p ≈ ${fmt(pW, 4)}:`
          + " the variation between people, which pairing removes, would hide the change again."),
      };
    },

    spearman({ x, y }) {
      const d0 = paired(x, y, v => `\\bar{${v}}`);
      if (d0.error) return d0;
      const n = x.length;
      const rank = a => {
        const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
        const r = new Array(a.length);
        for (let i = 0; i < idx.length;) {
          let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
          for (let m = i; m <= j; m++) r[idx[m][1]] = (i + j) / 2 + 1;
          i = j + 1;
        }
        return r;
      };
      const rx = rank(x), ry = rank(y);
      const corr = (a, b) => { const ma = a.reduce((s, v) => s + v, 0) / a.length, mb = b.reduce((s, v) => s + v, 0) / b.length;
        let sab = 0, saa = 0, sbb = 0; a.forEach((v, i) => { sab += (v - ma) * (b[i] - mb); saa += (v - ma) ** 2; sbb += (b[i] - mb) ** 2; });
        return saa && sbb ? sab / Math.sqrt(saa * sbb) : NaN; };
      const rs = corr(rx, ry), rp = corr(x, y);
      if (!Number.isFinite(rs)) return { error: T("Todos os valores de x ou de y são iguais: não há ordem para correlacionar.", "All the x or y values are equal: there is no order to correlate.") };
      const dd = rx.map((v, i) => v - ry[i]), sd2 = dd.reduce((s, v) => s + v * v, 0);
      const ties = new Set(x).size < n || new Set(y).size < n;
      const short = 1 - 6 * sd2 / (n * (n * n - 1));
      const tS = n > 2 && Math.abs(rs) < 1 ? rs * Math.sqrt((n - 2) / (1 - rs * rs)) : Infinity;
      const p = n > 2 ? (Number.isFinite(tS) ? tTwoTail(Math.abs(tS), n - 2) : 0) : NaN;
      const table = n > MAX_TABLE
        ? T(`\\textstyle\\sum d_i^2 = ${texNum(sd2)} \\quad \\text{(${n} pares: a tabela ficaria longa demais)}`, `\\textstyle\\sum d_i^2 = ${texNum(sd2)} \\quad \\text{(${n} pairs: the table would be too long)}`)
        : `\\begin{array}{c|c|c|c|c|c} x_i & ${T("\\text{posto}", "\\text{rank}")}(x_i) & y_i & ${T("\\text{posto}", "\\text{rank}")}(y_i) & d_i & d_i^2 \\\\ \\hline `
          + x.map((v, i) => `${texNum(v)} & ${texNum(rx[i])} & ${texNum(y[i])} & ${texNum(ry[i])} & ${texNum(dd[i])} & ${texNum(dd[i] ** 2)}`).join(" \\\\ ")
          + ` \\\\ \\hline & & & & & ${tone(texNum(sd2), 2)} \\end{array}`;
      const pad = (a, b) => { const s = b - a || Math.abs(b) || 1; return [a - s * 0.12, b + s * 0.12]; };
      const [xMin, xMax] = pad(Math.min(...x), Math.max(...x));
      const [yMin, yMax] = pad(Math.min(...y), Math.max(...y));
      return {
        result: `r_s ${approx(rs)} ${tone(texNum(rs), 1)}, \\qquad r_{\\text{Pearson}} ${approx(rp)} ${texNum(rp)}`,
        chart: {
          type: "scatter", height: 300, xMin, xMax, yMin, yMax, pred: null,
          dots: x.map((v, i) => [v, y[i]]), fields: ["x", "y"],
          label: T("Pontos (x, y) com a reta de Pearson", "Points (x, y) with the Pearson line"), xLabel: "x",
          hint: T("Arraste um ponto para bem longe dos outros e compare: a correlação de Pearson despenca, a de Spearman quase não muda. Toque num espaço vazio para acrescentar um ponto; pelo teclado, as setas movem o ponto em foco e Delete o remove.",
            "Drag one point far away from the rest and compare: Pearson's correlation plunges, Spearman's barely moves. Tap an empty spot to add a point; with the keyboard, the arrows move the focused point and Delete removes it."),
        },
        steps: [
          [T("Troque cada valor pela sua posição na ordem (o posto); empates recebem a média das posições. Depois, subtraia os postos de cada par:", "Replace each value by its position in order (its rank); ties get the average of their positions. Then subtract the ranks in each pair:"), table],
          [ties
            ? T("Com empates, a fórmula curta é só uma aproximação; o valor exato é a correlação de Pearson calculada sobre os postos:", "With ties, the short formula is only an approximation; the exact value is Pearson's correlation computed on the ranks:")
            : T("Aplique a fórmula:", "Apply the formula:"),
            `1 - \\dfrac{6 \\cdot ${tone(texNum(sd2), 2)}}{${tone(n, 3)}(${n}^2 - 1)} ${approx(short)} ${texNum(short)}${ties ? `, \\qquad r_s ${approx(rs)} ${tone(texNum(rs), 1)}` : ""}`],
        ],
        note: T(`Spearman mede se y sobe (ou desce) junto com x, de qualquer forma; Pearson, se sobe em linha reta.`
          + ` Aqui, r_s ≈ ${fmt(rs, 3)} e r ≈ ${fmt(rp, 3)}${Math.abs(rs) - Math.abs(rp) > 0.05 ? ": a relação é monótona, mas não é uma reta" : ""}.`
          + (n > 2 ? ` Pela aproximação t com ${n - 2} graus de liberdade, o valor-p é ${Number.isFinite(p) ? pValueText(p) : "0"}.` : "")
          + ` Veja a <a href="${d0.link(PAGE("coeficiente-pearson"))}">correlação de Pearson com estes dados</a>.`,
          `Spearman measures whether y rises (or falls) along with x, in any shape; Pearson, whether it rises in a straight line.`
          + ` Here, r_s ≈ ${fmt(rs, 3)} and r ≈ ${fmt(rp, 3)}${Math.abs(rs) - Math.abs(rp) > 0.05 ? ": the relationship is monotonic, but not a straight line" : ""}.`
          + (n > 2 ? ` By the t approximation with ${n - 2} degrees of freedom, the p-value is ${Number.isFinite(p) ? pValueText(p) : "0"}.` : "")
          + ` See the <a href="${d0.link(PAGE("coeficiente-pearson"))}">Pearson correlation with these data</a>.`),
      };
    },

    multiplas({ k, alpha, seed }) {
      if (!Number.isInteger(k) || k < 1 || k > 1000) return { error: T("O número de testes precisa ser um inteiro entre 1 e 1.000.", "The number of tests must be an integer between 1 and 1,000.") };
      if (alpha <= 0 || alpha >= 100) return { error: T("O nível de significância precisa estar entre 0 e 100%, como 5.", "The significance level must be between 0 and 100%, such as 5.") };
      if (!Number.isInteger(seed) || seed < 0) return { error: T("A semente precisa ser um inteiro não negativo.", "The seed must be a non-negative integer.") };
      const a = alpha / 100, fw = 1 - (1 - a) ** k, ab = a / k, fwB = 1 - (1 - ab) ** k;
      const top = Math.max(50, Math.min(1000, 2 * k));
      const ptsN = Array.from({ length: 200 }, (_, i) => { const m = 1 + (top - 1) * i / 199; return [m, (1 - (1 - a) ** m) * 100]; });
      const ptsB = ptsN.map(([m]) => [m, (1 - (1 - a / m) ** m) * 100]);
      // Simulação: 1.000 estudos, cada um com k testes em que nada acontece
      // de verdade; sob H₀ o valor-p é uniforme entre 0 e 1.
      const rand = rng(seed), S = 1000;
      let hit = 0, hitB = 0;
      for (let s = 0; s < S; s++) {
        let mn = 1;
        for (let j = 0; j < k; j++) mn = Math.min(mn, rand());
        if (mn < a) hit++;
        if (mn < ab) hitB++;
      }
      const A = tone(texNum(a, 4), 2);
      return {
        result: `P(\\text{${T("pelo menos um falso positivo", "at least one false positive")}}) ${approx(fw, 4)} ${tone(pctTex(fw), 1)}`,
        chart: {
          type: "curve", label: T(`Chance de pelo menos um falso positivo conforme o número de testes, com α = ${fmt(alpha)}%, sem e com a correção de Bonferroni`, `Chance of at least one false positive by number of tests, with α = ${fmt(alpha)}%, without and with the Bonferroni correction`),
          xLabel: T(`número de testes · colorida: sem correção · escura: com Bonferroni · tracejada: ${fmt(alpha)}%`, `number of tests · colored: uncorrected · dark: with Bonferroni · dashed: ${fmt(alpha)}%`),
          xMin: 1, xMax: top, yMin: 0, yMax: 100, pts: ptsN, lines: [{ pts: ptsB, cls: "chart-fit" }], hlines: [{ y: alpha, cls: "chart-ref" }],
          marker: k <= top ? [k, fw * 100] : null,
          tipAt: m => { const kk = Math.max(1, Math.round(m)); return [`${fmt((1 - (1 - a) ** kk) * 100, 1)}%`, T(`com ${kk} testes; com Bonferroni, ${fmt((1 - (1 - a / kk) ** kk) * 100, 2)}%`, `with ${kk} tests; with Bonferroni, ${fmt((1 - (1 - a / kk) ** kk) * 100, 2)}%`)]; },
        },
        steps: [
          [T(`Num teste sem efeito real, a chance de não dar falso positivo é 1 − α. Com ${k} testes independentes, todos precisam acertar:`, `In a test with no real effect, the chance of no false positive is 1 − α. With ${k} independent tests, all must get it right:`),
            `(1 - ${A})^{${k}} ${approx(1 - fw, 4)} ${tone(texNum(1 - fw, 4), 3)}`],
          [T("A chance de pelo menos um falso positivo é o complemento:", "The chance of at least one false positive is the complement:"),
            `1 - ${tone(texNum(1 - fw, 4), 3)} ${approx(fw, 4)} ${tone(pctTex(fw), 1)}`],
          [T(`Bonferroni divide o nível pelo número de testes; a chance de algum falso positivo volta a ficar abaixo de α:`, `Bonferroni divides the level by the number of tests; the chance of any false positive goes back below α:`),
            `\\alpha' = \\dfrac{${texNum(a, 4)}}{${k}} ${approx(ab, 6)} ${tone(texSci(ab, 4), 4)}, \\qquad 1 - (1 - \\alpha')^{${k}} ${approx(fwB, 4)} ${pctTex(fwB)}`],
          [T(`A simulação fez ${fmt(S)} estudos de ${k} testes, todos sem efeito nenhum:`, `The simulation ran ${fmt(S)} studies of ${k} tests, all with no effect at all:`),
            `\\text{${T("sem correção", "uncorrected")}}: ${texNum(hit / S * 100, 1)}\\%, \\qquad \\text{${T("com Bonferroni", "with Bonferroni")}}: ${texNum(hitB / S * 100, 1)}\\%`],
        ],
        note: T(`Fazendo ${k} testes a ${fmt(alpha)}% sem que nada esteja acontecendo, ${fmt(fw * 100, 1)}% das vezes ao menos um sai “significativo” por puro acaso — é assim que nascem muitas descobertas que não se repetem.`
          + " Bonferroni resolve exigindo valor-p abaixo de α/k em cada teste. É simples e seguro, mas conservador: com muitos testes, perde a capacidade de achar efeitos reais."
          + " Alternativas menos rígidas são o método de Holm e, para controlar a proporção de falsos positivos entre os achados, o de Benjamini–Hochberg.",
          `Running ${k} tests at ${fmt(alpha)}% when nothing is going on, ${fmt(fw * 100, 1)}% of the time at least one comes out “significant” by pure chance — this is how many findings that fail to replicate are born.`
          + " Bonferroni fixes it by requiring a p-value below α/k in each test. It is simple and safe, but conservative: with many tests, it loses the power to find real effects."
          + " Less rigid alternatives are Holm's method and, to control the share of false positives among the findings, Benjamini–Hochberg's."),
      };
    },

    bootstrap({ x, stat, B, conf, seed }) {
      const n = x.length;
      if (n < 3) return { error: T("Informe pelo menos três valores.", "Enter at least three values.") };
      if (n > 1000) return { error: T("Use no máximo 1.000 valores.", "Use at most 1,000 values.") };
      if (!Number.isInteger(B) || B < 100 || B > 20000) return { error: T("O número de reamostragens precisa ser um inteiro entre 100 e 20.000.", "The number of resamples must be an integer between 100 and 20,000.") };
      if (conf <= 0 || conf >= 100) return confError;
      if (!Number.isInteger(seed) || seed < 0) return { error: T("A semente precisa ser um inteiro não negativo.", "The seed must be a non-negative integer.") };
      const media = stat === "media";
      const f = a => { if (media) return a.reduce((s, v) => s + v, 0) / a.length; const s = a.slice().sort((p, q) => p - q), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
      const theta = f(x);
      const rand = rng(seed);
      const boot = new Float64Array(B), buf = new Array(n);
      for (let b = 0; b < B; b++) { for (let i = 0; i < n; i++) buf[i] = x[Math.floor(rand() * n)]; boot[b] = f(buf); }
      const sorted = Array.from(boot).sort((p, q) => p - q);
      const al = (1 - conf / 100) / 2;
      const q = p => { const h = (B - 1) * p, lo = Math.floor(h); return sorted[lo] + (h - lo) * ((sorted[lo + 1] ?? sorted[lo]) - sorted[lo]); };
      const lo = q(al), hi = q(1 - al);
      const mb = sorted.reduce((s, v) => s + v, 0) / B, seB = Math.sqrt(sorted.reduce((s, v) => s + (v - mb) ** 2, 0) / (B - 1));
      const mn = sorted[0], mx = sorted[B - 1], span = mx - mn || 1, NB = 30, w = span / NB;
      const counts = new Array(NB).fill(0);
      sorted.forEach(v => { counts[Math.min(NB - 1, Math.floor((v - mn) / w))]++; });
      const bins = counts.map((c, i) => { const x0 = mn + i * w, x1 = x0 + w; return { x0, x1, count: c, y: c, miss: x1 <= lo || x0 >= hi }; });
      const nome = media ? T("média", "mean") : T("mediana", "median");
      let tLine = "";
      if (media) {
        const s = Math.sqrt(x.reduce((a, v) => a + (v - theta) ** 2, 0) / (n - 1));
        const tc = tCrit(1 - conf / 100, n - 1);
        tLine = T(` O intervalo t clássico, que supõe normalidade, daria de ${fmt(theta - tc * s / Math.sqrt(n))} a ${fmt(theta + tc * s / Math.sqrt(n))}.`,
          ` The classic t interval, which assumes normality, would give ${fmt(theta - tc * s / Math.sqrt(n))} to ${fmt(theta + tc * s / Math.sqrt(n))}.`);
      }
      return {
        result: `IC_{${texNum(conf, 2)}\\%} ${approx(lo) === "=" && approx(hi) === "=" ? "=" : "\\approx"} ${tone(interval(lo, hi), 1)}`.replace("IC_", T("IC_", "CI_")),
        chart: {
          type: "hist", label: T(`Histograma das ${fmt(B)} ${nome}s reamostradas; destacadas as que ficam fora do intervalo de ${fmt(conf, 2)}%`, `Histogram of the ${fmt(B)} resampled ${nome}s; highlighted, those outside the ${fmt(conf, 2)}% interval`),
          xLabel: T(`${nome} de cada reamostragem · destaque: fora do intervalo`, `${nome} of each resample · highlighted: outside the interval`),
          xMin: mn, xMax: mx + w * 0.001, yMax: Math.max(...counts), bins, pts: [],
          binTip: bb => [T(`${fmt(bb.count)} reamostragens`, `${fmt(bb.count)} resamples`), T(`${nome} entre ${fmt(bb.x0, 2)} e ${fmt(bb.x1, 2)}`, `${nome} between ${fmt(bb.x0, 2)} and ${fmt(bb.x1, 2)}`)],
        },
        steps: [
          [T(`Calcule a ${nome} da amostra original, de ${n} valores:`, `Compute the ${nome} of the original sample of ${n} values:`), `\\hat{\\theta} ${approx(theta)} ${texNum(theta)}`],
          [T(`Sorteie ${fmt(B)} novas amostras de ${n} valores, com reposição, a partir dos próprios dados, e calcule a ${nome} de cada uma:`, `Draw ${fmt(B)} new samples of ${n} values, with replacement, from the data themselves, and compute the ${nome} of each:`),
            `\\hat{\\theta}^*_1, \\ldots, \\hat{\\theta}^*_{${B}}, \\qquad \\text{${T("desvio padrão", "standard deviation")}} ${approx(seB)} ${texNum(seB)}`],
          [T(`Ordene-as e corte ${fmt(al * 100, 2)}% de cada ponta:`, `Sort them and cut ${fmt(al * 100, 2)}% off each end:`),
            `\\hat{\\theta}^*_{(${texNum(al, 4)})} ${approx(lo)} ${tone(texNum(lo), 2)}, \\qquad \\hat{\\theta}^*_{(${texNum(1 - al, 4)})} ${approx(hi)} ${tone(texNum(hi), 3)}`],
        ],
        note: T(`O bootstrap trata a amostra como se fosse a população e repete o sorteio no computador: a dispersão das ${nome}s reamostradas, ${fmt(seB)}, estima o erro padrão sem fórmula nenhuma.`
          + tLine
          + ` A vantagem é valer para estatísticas sem fórmula simples de erro padrão, como a mediana; a limitação é depender de a amostra representar bem a população — com poucos dados, o intervalo fica estreito demais. Sorteie de novo para ver quanto ele oscila.`,
          `The bootstrap treats the sample as if it were the population and repeats the draw on the computer: the spread of the resampled ${nome}s, ${fmt(seB)}, estimates the standard error with no formula at all.`
          + tLine
          + ` Its strength is working for statistics with no simple standard-error formula, such as the median; its limitation is relying on the sample representing the population well — with little data, the interval comes out too narrow. Draw again to see how much it moves.`),
      };
    },

    icp({ k, n, conf }) {
      if (!Number.isInteger(n) || n < 1 || n > 1e6) return { error: T("O tamanho da amostra precisa ser um inteiro entre 1 e 1.000.000.", "The sample size must be an integer between 1 and 1,000,000.") };
      if (!Number.isInteger(k) || k < 0 || k > n) return { error: T(`O número de sucessos precisa ser um inteiro entre 0 e ${fmt(n)}.`, `The number of successes must be an integer between 0 and ${fmt(n)}.`) };
      if (conf <= 0 || conf >= 100) return confError;
      const z = zCrit(conf);
      const wald = kk => { const p = kk / n, h = z * Math.sqrt(p * (1 - p) / n); return [p - h, p + h]; };
      const wilson = kk => { const p = kk / n, c = 1 + z * z / n, mid = (p + z * z / (2 * n)) / c, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / c; return [Math.max(0, mid - h), Math.min(1, mid + h)]; };
      const ph = k / n, [wl, wh] = wald(k), [sl, sh] = wilson(k);
      const se = Math.sqrt(ph * (1 - ph) / n);
      // Cobertura exata de cada método para cada proporção verdadeira p.
      let chart = null;
      if (n <= 2000) {
        const cover = (meth, p) => { let c = 0; for (let kk = 0; kk <= n; kk++) { const [a, b] = meth(kk); if (a <= p && p <= b) c += binPmf(n, p, kk); } return c * 100; };
        const ps = Array.from({ length: 199 }, (_, i) => 0.005 + 0.99 * i / 198);
        const cw = ps.map(p => [p * 100, cover(wald, p)]), cs = ps.map(p => [p * 100, cover(wilson, p)]);
        const yLo = Math.max(0, Math.min(...cw.map(q => q[1]), ...cs.map(q => q[1])) - 5);
        chart = {
          type: "curve", label: T(`Cobertura real dos intervalos de ${fmt(conf, 2)}% com n = ${fmt(n)}, para cada proporção verdadeira`, `Actual coverage of the ${fmt(conf, 2)}% intervals with n = ${fmt(n)}, for each true proportion`),
          xLabel: T(`proporção verdadeira (%) · colorida: Wilson · escura: Wald · tracejada: ${fmt(conf, 2)}% prometidos`, `true proportion (%) · colored: Wilson · dark: Wald · dashed: the promised ${fmt(conf, 2)}%`),
          xMin: 0, xMax: 100, yMin: yLo, yMax: 100, pts: cs, lines: [{ pts: cw, cls: "chart-fit" }], hlines: [{ y: conf, cls: "chart-ref" }],
          tipAt: v => { const i = Math.max(0, Math.min(198, Math.round((v / 100 - 0.005) / 0.99 * 198))); return [`Wilson ${fmt(cs[i][1], 1)}% · Wald ${fmt(cw[i][1], 1)}%`, T(`cobertura com p = ${fmt(cs[i][0], 1)}%`, `coverage at p = ${fmt(cs[i][0], 1)}%`)]; },
        };
      }
      const fora = wl < 0 || wh > 1, zero = k === 0 || k === n;
      return {
        result: `\\text{Wald}: ${interval(wl * 100, wh * 100)}\\%, \\qquad \\text{Wilson}: ${tone(`${interval(sl * 100, sh * 100)}\\%`, 1)}`,
        chart,
        steps: [
          [T("Calcule a proporção da amostra e o erro padrão dela:", "Compute the sample proportion and its standard error:"),
            `\\hat{p} = \\dfrac{${k}}{${n}} ${approx(ph, 6)} ${tone(texNum(ph, 6), 2)}, \\qquad \\sqrt{\\dfrac{\\hat{p}(1 - \\hat{p})}{n}} ${approx(se, 6)} ${tone(texNum(se, 6), 4)}`],
          [T(`O intervalo de Wald é a fórmula do livro: p̂ mais ou menos z = ${fmt(z, 2)} erros padrão.`, `The Wald interval is the textbook formula: p̂ plus or minus z = ${fmt(z, 2)} standard errors.`),
            `${tone(texNum(ph, 6), 2)} \\pm ${tone(texNum(z), 3)} \\cdot ${tone(texNum(se, 6), 4)} = ${interval(wl, wh)}`],
          [T("O de Wilson inverte o teste da proporção: puxa o centro para 1/2 e nunca sai de [0, 1].", "Wilson's inverts the proportion test: it pulls the centre towards 1/2 and never leaves [0, 1]."),
            `\\dfrac{\\hat{p} + \\frac{z^2}{2n} \\pm z\\sqrt{\\frac{\\hat{p}(1 - \\hat{p})}{n} + \\frac{z^2}{4n^2}}}{1 + \\frac{z^2}{n}} = ${tone(interval(sl, sh), 1)}`],
        ],
        note: (fora
          ? T(`${warn} o intervalo de Wald sai de [0, 1] e inclui proporções impossíveis. `, `${warn} the Wald interval leaves [0, 1] and includes impossible proportions. `)
          : zero
            ? T(`${warn} com ${k === 0 ? "nenhum sucesso" : "só sucessos"}, o erro padrão de Wald é zero e o intervalo encolhe a um ponto, como se não houvesse incerteza. Wilson continua dando uma faixa razoável. `,
              `${warn} with ${k === 0 ? "no successes" : "only successes"}, Wald's standard error is zero and the interval shrinks to a point, as if there were no uncertainty. Wilson still gives a sensible range. `)
            : "")
          + T(`O gráfico mostra a cobertura real de cada método: a de Wald despenca perto de 0 e de 100%, e em amostras pequenas fica abaixo dos ${fmt(conf, 2)}% prometidos mesmo no meio; a de Wilson fica perto do nível nominal quase sempre. Por isso Wilson é o recomendado.`
            + ` Com amostras grandes e p̂ longe das pontas, os dois praticamente coincidem. Veja também a <a href="${PAGE("margem-de-erro")}">margem de erro</a> e o <a href="${PAGE("simulador-pesquisa")}">simulador de pesquisa</a>.`,
            `The chart shows each method's actual coverage: Wald's plunges near 0 and 100%, and in small samples falls short of the promised ${fmt(conf, 2)}% even in the middle; Wilson's stays near the nominal level almost everywhere. That is why Wilson is recommended.`
            + ` With large samples and p̂ away from the ends, the two practically coincide. See also the <a href="${PAGE("margem-de-erro")}">margin of error</a> and the <a href="${PAGE("simulador-pesquisa")}">poll simulator</a>.`),
      };
    },

    simpson({ o }) {
      const g = o.length;
      if (g < 2 || g > 10) return { error: T("Informe de 2 a 10 grupos, um por linha.", "Enter from 2 to 10 groups, one per row.") };
      if (o.some(r => r.length !== 4)) return { error: T("Cada linha precisa de quatro números: sucessos de A, total de A, sucessos de B, total de B.", "Each row needs four numbers: successes of A, total of A, successes of B, total of B.") };
      if (o.some(([a, na, b, nb]) => [a, na, b, nb].some(v => !Number.isInteger(v) || v < 0) || na < 1 || nb < 1 || a > na || b > nb))
        return { error: T("Use contagens inteiras, totais maiores que zero e sucessos que não passem do total.", "Use whole counts, totals above zero and successes no larger than the total.") };
      const sum = i => o.reduce((s, r) => s + r[i], 0);
      const A = sum(0), NA = sum(1), B = sum(2), NB = sum(3);
      const ra = o.map(r => r[0] / r[1]), rb = o.map(r => r[2] / r[3]);
      const ta = A / NA, tb = B / NB;
      const aGrupos = ra.every((v, i) => v > rb[i]), bGrupos = ra.every((v, i) => v < rb[i]);
      const inverte = (aGrupos && ta < tb) || (bGrupos && ta > tb);
      const pct = v => texNum(v * 100, 1);
      const rows = o.map((r, i) => `${i + 1} & ${r[0]}/${r[1]} = ${pct(ra[i])}\\% & ${r[2]}/${r[3]} = ${pct(rb[i])}\\%`).join(" \\\\ ");
      const table = `\\begin{array}{c|c|c} ${T("\\text{grupo}", "\\text{group}")} & A & B \\\\ \\hline ${rows} \\\\ \\hline \\text{total} & ${A}/${NA} = ${tone(`${pct(ta)}\\%`, 1)} & ${B}/${NB} = ${tone(`${pct(tb)}\\%`, 1)} \\end{array}`;
      const wA = o.map(r => r[1] / NA), wB = o.map(r => r[3] / NB);
      const lab = [...o.map((_, i) => `${T("grupo", "group")} ${i + 1}`), "total"];
      const pa = [...ra, ta], pb = [...rb, tb];
      const lo = Math.min(...pa, ...pb) * 100, hi = Math.max(...pa, ...pb) * 100, pad = (hi - lo) * 0.1 || 2;
      return {
        result: inverte
          ? T(`\\text{${aGrupos ? "A" : "B"} vence em todos os grupos, mas ${aGrupos ? "B" : "A"} vence no total}`, `\\text{${aGrupos ? "A" : "B"} wins in every group, but ${aGrupos ? "B" : "A"} wins overall}`)
          : T("\\text{sem inversão: o total concorda com os grupos}", "\\text{no reversal: the total agrees with the groups}"),
        chart: {
          type: "intervals", height: Math.max(150, 50 + (g + 1) * 30),
          label: T("Para cada grupo e para o total, um segmento entre as taxas de A e de B; destacados aqueles em que B é melhor", "For each group and the total, a segment between the rates of A and B; highlighted, those where B is better"),
          xLabel: T("taxa de sucesso (%) · ponto cheio: A · vazado: B · de cima para baixo: grupos e, por último, o total", "success rate (%) · filled dot: A · hollow: B · top to bottom: the groups and, last, the total"),
          xMin: lo - pad, xMax: hi + pad, truth: null,
          rows: pa.map((v, i) => ({ lo: Math.min(v, pb[i]) * 100, hi: Math.max(v, pb[i]) * 100, a: v * 100, b: pb[i] * 100, hit: v >= pb[i] })),
          tip: (r, i) => [`A ${fmt(pa[i] * 100, 1)}% · B ${fmt(pb[i] * 100, 1)}%`, lab[i]],
        },
        steps: [
          [T("Calcule a taxa de sucesso de A e de B em cada grupo e no total:", "Compute the success rate of A and B in each group and overall:"), table],
          [T("A taxa total é a média das taxas dos grupos, ponderada pela fração de casos de cada grupo — e os pesos de A e de B são diferentes:", "The overall rate is the average of the group rates, weighted by each group's share of cases — and A's and B's weights differ:"),
            `p_A = ${o.map((_, i) => `${texNum(wA[i], 3)} \\cdot ${texNum(ra[i], 3)}`).join(" + ")} ${approx(ta, 4)} ${texNum(ta, 4)} \\\\ p_B = ${o.map((_, i) => `${texNum(wB[i], 3)} \\cdot ${texNum(rb[i], 3)}`).join(" + ")} ${approx(tb, 4)} ${texNum(tb, 4)}`.replace(/^(.*)$/, "\\begin{gathered}$1\\end{gathered}")],
        ],
        note: (inverte
          ? T("É o paradoxo de Simpson. A inversão vem dos pesos: cada tratamento foi aplicado em proporções diferentes nos grupos, e os grupos têm taxas de sucesso muito diferentes entre si. O grupo funciona como uma variável de confusão.",
            "This is Simpson's paradox. The reversal comes from the weights: each treatment was applied in different proportions across the groups, and the groups have very different success rates. The group acts as a confounding variable.")
          : T("Aqui não há inversão, mas os pesos de cada grupo no total continuam diferentes entre A e B; mude os números para ver o paradoxo aparecer.",
            "There is no reversal here, but each group's weight in the total still differs between A and B; change the numbers to make the paradox appear."))
          + T(" Qual comparação vale depende da história causal: se o grupo influencia tanto a escolha do tratamento quanto o resultado, compare dentro dos grupos.",
            " Which comparison counts depends on the causal story: if the group influences both the choice of treatment and the outcome, compare within the groups."),
      };
    },

    kappa({ o }) {
      const k = o.length;
      if (k < 2 || k > 10 || o.some(r => r.length !== k)) return { error: T("Informe uma tabela quadrada, de 2 × 2 a 10 × 10: uma linha por categoria do avaliador 1, uma coluna por categoria do avaliador 2.", "Enter a square table, from 2 × 2 to 10 × 10: one row per category of rater 1, one column per category of rater 2.") };
      if (o.flat().some(v => v < 0)) return { error: T("As contagens não podem ser negativas.", "Counts cannot be negative.") };
      const sum = a => a.reduce((s, v) => s + v, 0);
      const R = o.map(sum), C = o[0].map((_, j) => sum(o.map(r => r[j]))), N = sum(R);
      if (N <= 0) return { error: T("A tabela precisa ter pelo menos um caso.", "The table needs at least one case.") };
      const diag = sum(o.map((r, i) => r[i]));
      const po = diag / N, pe = sum(R.map((r, i) => r * C[i])) / (N * N);
      if (pe === 1) return { error: T("Os dois avaliadores usaram uma única categoria: a concordância esperada é total e o kappa não se define.", "Both raters used a single category: expected agreement is total and kappa is undefined.") };
      const kap = (po - pe) / (1 - pe);
      const se = Math.sqrt(po * (1 - po) / (N * (1 - pe) ** 2));
      const z = 1.96;
      const nivel = kap < 0 ? T("pior que o acaso", "worse than chance") : kap < 0.2 ? T("leve", "slight") : kap < 0.4 ? T("razoável", "fair") : kap < 0.6 ? T("moderada", "moderate") : kap < 0.8 ? T("substancial", "substantial") : T("quase perfeita", "almost perfect");
      const head = ` & ${o.map((_, j) => `C_{${j + 1}}`).join(" & ")} & \\text{total}`;
      const grid = `\\begin{array}{c|${"c".repeat(k)}|c} ${head} \\\\ \\hline `
        + o.map((r, i) => `L_{${i + 1}} & ${r.map((v, j) => (i === j ? tone(texNum(v), 2) : texNum(v))).join(" & ")} & ${texNum(R[i])}`).join(" \\\\ ")
        + ` \\\\ \\hline \\text{total} & ${C.map(v => texNum(v)).join(" & ")} & ${texNum(N)} \\end{array}`;
      const PO = tone(texNum(po, 4), 2), PE = tone(texNum(pe, 4), 3);
      return {
        result: `\\kappa ${approx(kap, 4)} ${tone(texNum(kap, 4), 1)}`,
        steps: [
          [T("Some a diagonal: são os casos em que os dois avaliadores concordaram.", "Add up the diagonal: these are the cases where the two raters agreed."), grid],
          [T("A concordância observada é a fração da diagonal:", "The observed agreement is the diagonal's share:"), `p_o = \\dfrac{${texNum(diag)}}{${texNum(N)}} ${approx(po, 4)} ${PO}`],
          [T("A esperada por acaso multiplica, em cada categoria, as frações de uso dos dois avaliadores:", "The agreement expected by chance multiplies, for each category, how often each rater used it:"),
            `p_e = \\dfrac{${R.map((r, i) => `${texNum(r)} \\cdot ${texNum(C[i])}`).join(" + ")}}{${texNum(N)}^2} ${approx(pe, 4)} ${PE}`],
          [T("O kappa é quanto da concordância possível além do acaso foi alcançado:", "Kappa is how much of the agreement possible beyond chance was achieved:"),
            `\\kappa = \\dfrac{${PO} - ${PE}}{1 - ${PE}} ${approx(kap, 4)} ${tone(texNum(kap, 4), 1)}`],
        ],
        note: T(`Os avaliadores concordaram em ${fmt(po * 100, 1)}% dos casos, mas ${fmt(pe * 100, 1)}% já viriam do acaso. Pela escala de Landis e Koch, κ ≈ ${fmt(kap, 2)} é uma concordância ${nivel}.`
          + ` O intervalo de 95% aproximado vai de ${fmt(kap - z * se, 3)} a ${fmt(kap + z * se, 3)}.`
          + " Com categorias ordenadas, como leve, média e grave, o kappa ponderado dá crédito parcial a discordâncias pequenas.",
          `The raters agreed on ${fmt(po * 100, 1)}% of the cases, but ${fmt(pe * 100, 1)}% would come from chance alone. On the Landis and Koch scale, κ ≈ ${fmt(kap, 2)} is ${nivel} agreement.`
          + ` The approximate 95% interval runs from ${fmt(kap - z * se, 3)} to ${fmt(kap + z * se, 3)}.`
          + " With ordered categories, such as mild, moderate and severe, weighted kappa gives partial credit to small disagreements."),
      };
    },

    pond({ x, w, n }) {
      if (x.length !== w.length) return { error: T(`Há ${x.length} valores e ${w.length} pesos; as listas precisam ter o mesmo tamanho.`, `There are ${x.length} values and ${w.length} weights; the lists must have the same length.`) };
      const g = x.length;
      if (g < 2 || g > 50) return { error: T("Informe de 2 a 50 valores.", "Enter from 2 to 50 values.") };
      if (w.some(v => v < 0) || w.every(v => v === 0)) return { error: T("Os pesos precisam ser não negativos, e pelo menos um maior que zero.", "Weights must be non-negative, with at least one above zero.") };
      const sum = a => a.reduce((s, v) => s + v, 0);
      const sw = sum(w), swx = sum(x.map((v, i) => v * w[i])), mw = swx / sw, mean = sum(x) / g;
      const steps = [
        [T("Multiplique cada valor pelo seu peso e some:", "Multiply each value by its weight and add up:"),
          `\\textstyle\\sum w_i x_i = ${g <= 6 ? x.map((v, i) => `${texNum(w[i])} \\cdot ${paren(v, texNum(v))}`).join(" + ") : ""} ${approx(swx)} ${tone(texNum(swx), 2)}`],
        [T("Divida pela soma dos pesos:", "Divide by the sum of the weights:"), `\\bar{x}_w = \\dfrac{${tone(texNum(swx), 2)}}{${tone(texNum(sw), 3)}} ${approx(mw)} ${tone(texNum(mw), 1)}`],
      ];
      let extra = "";
      if (n.length) {
        if (n.length !== g || n.some(v => !Number.isInteger(v) || v < 1)) return { error: T("Os entrevistados precisam ser um inteiro positivo por grupo, na mesma ordem.", "Respondents must be one positive integer per group, in the same order.") };
        const N = sum(n);
        const bruta = sum(x.map((v, i) => v * n[i])) / N;
        // Peso de cada entrevistado: participação na população ÷ na amostra.
        const a = w.map((v, i) => (v / sw) / (n[i] / N));
        const neff = sum(n.map((m, i) => m * a[i])) ** 2 / sum(n.map((m, i) => m * a[i] * a[i]));
        steps.push([T("Cada entrevistado recebe peso = participação do grupo na população ÷ participação na amostra:", "Each respondent gets weight = the group's share of the population ÷ its share of the sample:"),
          a.slice(0, 8).map((v, i) => `a_{${i + 1}} = \\dfrac{${texNum(w[i] / sw, 4)}}{${texNum(n[i] / N, 4)}} ${approx(v, 4)} ${texNum(v, 4)}`).join(", \\quad ")]);
        steps.push([T("O tamanho efetivo de Kish mede quanto os pesos desiguais custam em precisão:", "Kish's effective sample size measures how much unequal weights cost in precision:"),
          `n_{\\text{${T("ef", "eff")}}} = \\dfrac{(\\sum n_i a_i)^2}{\\sum n_i a_i^2} ${approx(neff, 1)} ${texNum(neff, 1)}`]);
        extra = T(` Sem ponderar, a média dos ${fmt(N)} entrevistados seria ${fmt(bruta)}: a amostra tem gente demais de alguns grupos e de menos de outros, e os pesos corrigem isso.`
          + ` O preço é precisão: os ${fmt(N)} entrevistados valem como uma amostra simples de cerca de ${fmt(Math.round(neff))} (efeito de desenho ${fmt(N / neff, 2)}), e a <a href="${PAGE("margem-de-erro")}">margem de erro</a> deve usar esse tamanho.`,
          ` Without weighting, the mean of the ${fmt(N)} respondents would be ${fmt(bruta)}: the sample has too many people from some groups and too few from others, and the weights fix that.`
          + ` The price is precision: the ${fmt(N)} respondents count as a simple sample of about ${fmt(Math.round(neff))} (design effect ${fmt(N / neff, 2)}), and the <a href="${PAGE("margem-de-erro")}">margin of error</a> should use that size.`);
      }
      return {
        result: `\\bar{x}_w ${approx(mw)} ${tone(texNum(mw), 1)}`,
        steps,
        note: T(`A média simples dos ${g} valores, sem pesos, seria ${fmt(mean)}. Valores com peso maior puxam a média ponderada para perto de si.`,
          `The simple mean of the ${g} values, without weights, would be ${fmt(mean)}. Values with a larger weight pull the weighted mean towards themselves.`) + extra,
      };
    },

    beta({ a, b, k, n }) {
      if (a <= 0 || b <= 0) return { error: T("Os parâmetros α e β precisam ser maiores que zero.", "The parameters α and β must be greater than zero.") };
      if (a > 1e4 || b > 1e4) return { error: T("Use α e β de no máximo 10.000.", "Use α and β of at most 10,000.") };
      if (!Number.isInteger(n) || n < 0 || n > 1e5) return { error: T("O número de tentativas precisa ser um inteiro entre 0 e 100.000.", "The number of trials must be an integer between 0 and 100,000.") };
      if (!Number.isInteger(k) || k < 0 || k > n) return { error: T(`Os sucessos precisam ser um inteiro entre 0 e ${fmt(n)}.`, `Successes must be an integer between 0 and ${fmt(n)}.`) };
      const a2 = a + k, b2 = b + n - k;
      const lB = (p, q) => lgamma(p) + lgamma(q) - lgamma(p + q);
      const pdf = (x, p, q) => (x <= 0 || x >= 1 ? 0 : Math.exp((p - 1) * Math.log(x) + (q - 1) * Math.log(1 - x) - lB(p, q)));
      const quant = (u, p, q) => { let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (betainc(m, p, q) < u) lo = m; else hi = m; } return (lo + hi) / 2; };
      const m1 = a / (a + b), m2 = a2 / (a2 + b2);
      const lo = quant(0.025, a2, b2), hi = quant(0.975, a2, b2);
      const xs = Array.from({ length: 401 }, (_, i) => 0.0005 + 0.999 * i / 400);
      const post = xs.map(x => [x, pdf(x, a2, b2)]), prior = xs.map(x => [x, pdf(x, a, b)]);
      const yMax = Math.min(Math.max(...post.map(p => p[1]), ...prior.map(p => p[1])), Math.max(...post.map(p => p[1])) * 1.5);
      const mle = n ? k / n : NaN;
      return {
        result: `\\text{Beta}(${texNum(a)}, ${texNum(b)}) \\to ${tone(`\\text{Beta}(${texNum(a2)}, ${texNum(b2)})`, 1)}`,
        chart: {
          type: "curve", label: T(`Distribuição inicial Beta(${fmt(a)}, ${fmt(b)}) e final Beta(${fmt(a2)}, ${fmt(b2)}) da proporção`, `Prior Beta(${fmt(a)}, ${fmt(b)}) and posterior Beta(${fmt(a2)}, ${fmt(b2)}) of the proportion`),
          xLabel: T("proporção p · escura: antes dos dados · colorida: depois", "proportion p · dark: before the data · colored: after"),
          xMin: 0, xMax: 1, yMax, pts: post, lines: [{ pts: prior, cls: "chart-fit" }], marker: [m2, pdf(m2, a2, b2)],
          tipAt: v => [`${fmt(pdf(v, a2, b2), 3)}`, T(`densidade final em p = ${fmt(v, 3)}; P(p ≤ ${fmt(v, 3)}) ≈ ${fmt(betainc(v, a2, b2) * 100, 1)}%`, `posterior density at p = ${fmt(v, 3)}; P(p ≤ ${fmt(v, 3)}) ≈ ${fmt(betainc(v, a2, b2) * 100, 1)}%`)],
        },
        steps: [
          [T("Some os sucessos a α e os fracassos a β:", "Add the successes to α and the failures to β:"),
            `\\alpha' = ${texNum(a)} + ${k} = ${tone(texNum(a2), 2)}, \\qquad \\beta' = ${texNum(b)} + ${n - k} = ${tone(texNum(b2), 3)}`],
          [T("A média da proporção passa de α/(α + β) para α′/(α′ + β′):", "The mean of the proportion moves from α/(α + β) to α′/(α′ + β′):"),
            `\\dfrac{${texNum(a)}}{${texNum(a + b)}} ${approx(m1, 4)} ${texNum(m1, 4)} \;\\to\; \\dfrac{${texNum(a2)}}{${texNum(a2 + b2)}} ${approx(m2, 4)} ${tone(texNum(m2, 4), 1)}`],
          [T("O intervalo central de 95% da distribuição final vem dos percentis 2,5 e 97,5:", "The central 95% interval of the posterior comes from the 2.5th and 97.5th percentiles:"),
            `P(${texNum(lo, 4)} \\le p \\le ${texNum(hi, 4)}) = 0{,}95`.replace("0{,}95", EN ? "0.95" : "0{,}95")],
        ],
        note: T((n ? `A média final, ${fmt(m2, 4)}, fica entre a crença inicial (${fmt(m1, 4)}) e a proporção observada (${fmt(mle, 4)})` : "Sem dados, a distribuição final é a própria inicial") + `: α e β funcionam como sucessos e fracassos “imaginários” já vistos antes, e pesam tanto quanto α + β = ${fmt(a + b)} observações.`
          + " Com muitos dados, a inicial perde importância. Beta(1, 1) é a distribuição uniforme: nenhuma preferência por valor algum."
          + ` É o <a href="${PAGE("teorema-bayes")}">teorema de Bayes</a> aplicado a uma proporção; compare com o <a href="${PAGE("ic-proporcao")}?k=${k}&amp;n=${n}">intervalo de confiança clássico</a>.`,
          (n ? `The posterior mean, ${fmt(m2, 4)}, lies between the prior belief (${fmt(m1, 4)}) and the observed proportion (${fmt(mle, 4)})` : "With no data, the posterior is just the prior") + `: α and β act as “imaginary” successes and failures seen before, and weigh as much as α + β = ${fmt(a + b)} observations.`
          + " With plenty of data, the prior fades. Beta(1, 1) is the uniform distribution: no preference for any value."
          + ` It is <a href="${PAGE("teorema-bayes")}">Bayes' theorem</a> applied to a proportion; compare with the <a href="${PAGE("ic-proporcao")}?k=${k}&amp;n=${n}">classical confidence interval</a>.`),
      };
    },

    diag({ sens, esp, prev }) {
      if ([sens, esp].some(v => v <= 0 || v > 100)) return { error: T("Sensibilidade e especificidade precisam estar entre 0 e 100%, sem o zero.", "Sensitivity and specificity must be between 0 and 100%, excluding zero.") };
      if (prev <= 0 || prev >= 100) return { error: T("A prevalência precisa estar entre 0 e 100%, sem os extremos.", "Prevalence must be strictly between 0 and 100%.") };
      const S = sens / 100, E = esp / 100, p = prev / 100, N = 10000;
      const doentes = N * p, sadios = N - doentes;
      const vp = S * doentes, fn = doentes - vp, vn = E * sadios, fp = sadios - vn;
      const vpp = vp / (vp + fp), vpn = vn / (vn + fn);
      const lrp = E < 1 ? S / (1 - E) : Infinity;
      const ppv = q => S * q / (S * q + (1 - E) * (1 - q)), npv = q => E * (1 - q) / (E * (1 - q) + (1 - S) * q);
      const qs = Array.from({ length: 300 }, (_, i) => 10 ** (-1 + Math.log10(99 / 0.1) * i / 299));
      const c = v => texNum(Math.round(v * 10) / 10);
      const VP = tone(c(vp), 2), FP = tone(c(fp), 3);
      return {
        result: `VPP ${approx(vpp, 4)} ${tone(pctTex(vpp), 1)}, \\qquad VPN ${approx(vpn, 4)} ${pctTex(vpn)}`.replace(/VPP/, T("VPP", "PPV")).replace(/VPN/, T("VPN", "NPV")),
        chart: {
          type: "curve", label: T("Valor preditivo positivo e negativo conforme a prevalência, com esta sensibilidade e especificidade", "Positive and negative predictive value by prevalence, with this sensitivity and specificity"),
          xLabel: T(`prevalência (%), em escala logarítmica · colorida: VPP · escura: VPN`, `prevalence (%), on a log scale · colored: PPV · dark: NPV`),
          xMin: 0.1, xMax: 99, logX: true, yMin: 0, yMax: 100,
          pts: qs.map(q => [q, ppv(q / 100) * 100]), lines: [{ pts: qs.map(q => [q, npv(q / 100) * 100]), cls: "chart-fit" }],
          marker: [prev, vpp * 100],
          tipAt: v => [`${T("VPP", "PPV")} ${fmt(ppv(v / 100) * 100, 1)}% · ${T("VPN", "NPV")} ${fmt(npv(v / 100) * 100, 1)}%`, T(`com prevalência de ${fmt(v, 2)}%`, `at a prevalence of ${fmt(v, 2)}%`)],
        },
        steps: [
          [T(`Imagine ${fmt(N)} pessoas testadas. Com prevalência de ${fmt(prev)}%, quantas estão doentes, e como o teste as classifica:`, `Picture ${fmt(N)} people tested. With a prevalence of ${fmt(prev)}%, how many are ill, and how the test sorts them:`),
            `\\begin{array}{l|c|c|c} & ${T("\\text{doentes}", "\\text{ill}")} & ${T("\\text{sadios}", "\\text{healthy}")} & \\text{total} \\\\ \\hline ${T("\\text{positivo}", "\\text{positive}")} & ${VP} & ${FP} & ${c(vp + fp)} \\\\ ${T("\\text{negativo}", "\\text{negative}")} & ${c(fn)} & ${c(vn)} & ${c(fn + vn)} \\\\ \\hline \\text{total} & ${c(doentes)} & ${c(sadios)} & ${texNum(N)} \\end{array}`],
          [T("Entre os positivos, a fração que está de fato doente:", "Among the positives, the share actually ill:"),
            `${T("VPP", "PPV")} = \\dfrac{${VP}}{${VP} + ${FP}} ${approx(vpp, 4)} ${tone(pctTex(vpp), 1)}`],
          [T("Entre os negativos, a fração que está de fato sadia:", "Among the negatives, the share actually healthy:"),
            `${T("VPN", "NPV")} = \\dfrac{${c(vn)}}{${c(vn)} + ${c(fn)}} ${approx(vpn, 4)} ${pctTex(vpn)}`],
        ],
        note: T(`Um positivo neste teste significa doença em ${fmt(vpp * 100, 1)}% dos casos. Sensibilidade e especificidade são do teste; os valores preditivos dependem também de quem é testado: com a doença rara, mesmo um teste muito específico produz mais falsos positivos que verdadeiros, como mostra o gráfico.`
          + ` A razão de verossimilhança positiva, S/(1 − E) ≈ ${Number.isFinite(lrp) ? fmt(lrp, 2) : "∞"}, diz quantas vezes um positivo multiplica a chance de doença. É o <a href="${PAGE("teorema-bayes")}">teorema de Bayes</a> em forma de tabela.`,
          `A positive on this test means illness in ${fmt(vpp * 100, 1)}% of cases. Sensitivity and specificity belong to the test; the predictive values also depend on who is tested: when the disease is rare, even a very specific test produces more false positives than true ones, as the chart shows.`
          + ` The positive likelihood ratio, S/(1 − E) ≈ ${Number.isFinite(lrp) ? fmt(lrp, 2) : "∞"}, says how many times a positive multiplies the odds of illness. It is <a href="${PAGE("teorema-bayes")}">Bayes' theorem</a> in table form.`),
      };
    },

    mannw({ x, y }) {
      const n1 = x.length, n2 = y.length;
      if (n1 < 2 || n2 < 2) return { error: T("Cada grupo precisa de pelo menos dois valores.", "Each group needs at least two values.") };
      if (n1 + n2 > 2000) return { error: T("Use no máximo 2.000 valores ao todo.", "Use at most 2,000 values in all.") };
      const all = x.map(v => [v, 0]).concat(y.map(v => [v, 1])).sort((p, q) => p[0] - q[0]);
      const N = all.length, rk = new Array(N);
      let tieSum = 0;
      for (let i = 0; i < N;) { let j = i; while (j + 1 < N && all[j + 1][0] === all[i][0]) j++; const t = j - i + 1; tieSum += t ** 3 - t; for (let m = i; m <= j; m++) rk[m] = (i + j) / 2 + 1; i = j + 1; }
      let R1 = 0; all.forEach((p, i) => { if (p[1] === 0) R1 += rk[i]; });
      const U1 = R1 - n1 * (n1 + 1) / 2, U2 = n1 * n2 - U1, U = Math.min(U1, U2);
      const mu = n1 * n2 / 2, sg = Math.sqrt(n1 * n2 / 12 * ((N + 1) - tieSum / (N * (N - 1))));
      let p, metodo;
      if (!tieSum && n1 <= 25 && n2 <= 25) {
        // Distribuição exata de U sem empates: f(i, j, u) = f(i − 1, j, u − j) + f(i, j − 1, u).
        let prev = Array.from({ length: n2 + 1 }, () => [1]);
        for (let i = 1; i <= n1; i++) {
          const cur = [[1]];
          for (let j = 1; j <= n2; j++) {
            const a = prev[j], b = cur[j - 1], row = new Array(i * j + 1).fill(0);
            for (let u = 0; u <= i * j; u++) row[u] = (u - j >= 0 && u - j < a.length ? a[u - j] : 0) + (u < b.length ? b[u] : 0);
            cur.push(row);
          }
          prev = cur;
        }
        const dist = prev[n2], tot = dist.reduce((s, v) => s + v, 0);
        let le = 0; for (let u = 0; u <= Math.floor(U + 1e-9); u++) le += dist[u];
        p = Math.min(1, 2 * le / tot); metodo = "exato";
      } else {
        const zc = (Math.abs(U1 - mu) - 0.5) / sg;
        p = Math.min(1, 2 * (1 - phi(Math.max(0, zc)))); metodo = "normal";
      }
      const z = (U1 - mu) / sg;
      const ps = U1 / (n1 * n2);
      const all2 = x.concat(y), lo = Math.min(...all2), hi = Math.max(...all2), span = hi - lo || 1;
      const R1T = tone(texNum(R1), 2);
      const rankList = all.length <= 30 ? all.map((q, i) => `${q[1] ? "" : "\\underline{"}${texNum(q[0])}${q[1] ? "" : "}"}_{(${texNum(rk[i])})}`).join(",\\ ") : "";
      return {
        result: `U ${approx(U)} ${tone(texNum(U), 1)}, \\qquad ${T("\\text{valor-p}", "\\text{p-value}")} ${p < 0.0001 ? "<" : "\\approx"} ${texNum(Math.max(p, 0.0001), 4)}`,
        chart: {
          type: "box", height: 170, xMin: lo - span * 0.06, xMax: hi + span * 0.06,
          boxes: [{ ...boxStats(x), label: T("Grupo 1", "Group 1") }, { ...boxStats(y), label: T("Grupo 2", "Group 2") }],
          label: T("Boxplot de cada grupo", "Boxplot of each group"), xLabel: T("valores · em cima: grupo 1 · embaixo: grupo 2", "values · top: group 1 · bottom: group 2"), tip: null,
        },
        steps: [
          [T("Junte os dois grupos, ordene e dê a cada valor sua posição (empates recebem a média). Sublinhados, os do grupo 1:", "Pool the two groups, sort them and give each value its position (ties get the average). Underlined, those from group 1:"),
            rankList || T(`\\text{(${N} valores: a lista ficaria longa demais)}`, `\\text{(${N} values: the list would be too long)}`)],
          [T("Some as posições do grupo 1:", "Add up the positions of group 1:"), `R_1 = ${R1T}`],
          [T("Desconte a menor soma possível para o grupo 1; o resultado é quantas vezes um valor do grupo 1 supera um do grupo 2:", "Subtract the smallest sum group 1 could have; the result is how many times a value from group 1 beats one from group 2:"),
            `U_1 = ${R1T} - \\dfrac{${tone(n1, 3)}(${n1} + 1)}{2} ${approx(U1)} ${texNum(U1)}, \\qquad U_2 = ${n1} \\cdot ${n2} - U_1 ${approx(U2)} ${texNum(U2)}`],
        ],
        note: T(`O valor-p ${metodo === "exato" ? "é exato, pela contagem de todas as ordenações possíveis" : `vem da aproximação normal, z ≈ ${fmt(z, 3)}${tieSum ? ", com correção para os empates" : ""}`}: ${pValueText(p)}. ${p < 0.05 ? "Ao nível de 5%, os dois grupos diferem." : "Ao nível de 5%, não há evidência de diferença."}`
          + ` A chance de um valor do grupo 1 superar um do grupo 2 é U₁/(n₁n₂) ≈ ${fmt(ps * 100, 1)}%; sem diferença nenhuma, seria 50%.`
          + ` Não supõe normalidade, e um valor extremo pesa só como “o maior”. Com dados normais, o <a href="${PAGE("t-duas-amostras")}">teste t</a> tem um pouco mais de poder.`,
          `The p-value ${metodo === "exato" ? "is exact, from counting every possible ordering" : `comes from the normal approximation, z ≈ ${fmt(z, 3)}${tieSum ? ", corrected for ties" : ""}`}: ${pValueText(p)}. ${p < 0.05 ? "At the 5% level, the two groups differ." : "At the 5% level, there is no evidence of a difference."}`
          + ` The chance that a value from group 1 beats one from group 2 is U₁/(n₁n₂) ≈ ${fmt(ps * 100, 1)}%; with no difference at all, it would be 50%.`
          + ` It doesn't assume normality, and an extreme value counts only as “the largest”. With normal data, the <a href="${PAGE("t-duas-amostras")}">t-test</a> has a bit more power.`),
      };
    },

    perm({ n, k, tipo }) {
      if (!Number.isInteger(n) || n < 0 || n > 1000) return { error: T("n precisa ser um inteiro entre 0 e 1.000.", "n must be an integer between 0 and 1,000.") };
      if (tipo !== "perm" && (!Number.isInteger(k) || k < 0 || k > 1000)) return { error: T("k precisa ser um inteiro entre 0 e 1.000.", "k must be an integer between 0 and 1,000.") };
      if ((tipo === "arr" || tipo === "comb") && k > n) return { error: T("Sem repetição, k não pode passar de n.", "Without repetition, k cannot exceed n.") };
      const prod = (a, b) => { let r = 1n; for (let i = BigInt(a); i <= BigInt(b); i++) r *= i; return r; };
      const fact = m => prod(1, m);
      // Número inteiro exato; grande demais, vira notação científica.
      const big = v => { const s = v.toString(); if (s.length <= 18) return texNum(Number(v)); return `${texNum(Number(s.slice(0, 5)) / 1e4, 4)} \\times 10^{${s.length - 1}}`; };
      const bigTxt = v => { const s = v.toString(); return s.length <= 18 ? fmt(Number(v)) : `${fmt(Number(s.slice(0, 5)) / 1e4, 4)} × 10^${s.length - 1} (${fmt(s.length)} ${T("dígitos", "digits")})`; };
      const val = {
        perm: fact(n),
        arr: k <= n ? prod(n - k + 1, n) : 0n,
        arrrep: BigInt(n) ** BigInt(k),
        comb: k <= n ? prod(n - k + 1, n) / fact(k) : 0n,
        combrep: n + k - 1 >= 0 && n > 0 ? prod(n, n + k - 1) / fact(k) : (k === 0 ? 1n : 0n),
      };
      const res = val[tipo];
      const R = tone(big(res), 1);
      const step = {
        perm: [T(`Permutação: todas as ordens possíveis dos ${n} itens. O primeiro lugar tem ${n} opções, o segundo ${Math.max(n - 1, 0)}, e assim por diante:`, `Permutation: every possible order of the ${n} items. The first place has ${n} options, the second ${Math.max(n - 1, 0)}, and so on:`),
          `P_{${n}} = ${n}! = ${R}`],
        arr: [T(`Arranjo: escolher ${k} dos ${n} itens, e a ordem importa. São ${n} opções para o primeiro, ${Math.max(n - 1, 0)} para o segundo, até ${n - k + 1} para o último:`, `Arrangement: choose ${k} of the ${n} items, and order matters. There are ${n} options for the first, ${Math.max(n - 1, 0)} for the second, down to ${n - k + 1} for the last:`),
          `A_{${n},${k}} = \\dfrac{${tone(`${n}!`, 2)}}{${tone(`${n - k}!`, 3)}} = ${R}`],
        arrrep: [T(`Com repetição e ordem, cada uma das ${k} posições tem as ${n} opções:`, `With repetition and order, each of the ${k} positions has all ${n} options:`), `${n}^{${k}} = ${R}`],
        comb: [T(`Combinação: escolher ${k} dos ${n} itens sem importar a ordem. É o arranjo dividido pelas ${k}! ordens de cada escolha:`, `Combination: choose ${k} of the ${n} items regardless of order. It is the arrangement divided by the ${k}! orders of each choice:`),
          `\\dbinom{${n}}{${k}} = \\dfrac{${n}!}{${k}!\\,(${n - k})!} = ${R}`],
        combrep: [T(`Combinação com repetição: escolher ${k} itens entre ${n} tipos, podendo repetir e sem ordem — o mesmo que distribuir ${k} bolinhas em ${n} caixas:`, `Combination with repetition: choose ${k} items from ${n} kinds, repeats allowed and order ignored — the same as putting ${k} balls into ${n} boxes:`),
          `\\dbinom{${n} + ${k} - 1}{${k}} = ${R}`],
      }[tipo];
      const nomes = { perm: T("permutações", "permutations"), arr: T("arranjos", "arrangements"), arrrep: T("arranjos com repetição", "arrangements with repetition"), comb: T("combinações", "combinations"), combrep: T("combinações com repetição", "combinations with repetition") };
      const outros = Object.keys(val).filter(t => t !== tipo && !(t === "perm") && !((t === "arr" || t === "comb") && k > n));
      return {
        result: `${R}\\ \\text{${nomes[tipo]}}`,
        steps: [step],
        note: T(`Para comparar, com n = ${n} e k = ${k}: ${outros.map(t => `${nomes[t]}, ${bigTxt(val[t])}`).join("; ")}.`
          + " As perguntas que decidem a fórmula são duas: a ordem importa (senha, pódio) ou não (time, mão de cartas)? Pode repetir (dígitos de um PIN) ou não (pessoas de uma fila)?"
          + ` Veja também o <a href="${PAGE("coeficiente-binomial")}?n=${n}&amp;k=${Math.min(k, n)}">coeficiente binomial</a>.`,
          `For comparison, with n = ${n} and k = ${k}: ${outros.map(t => `${nomes[t]}, ${bigTxt(val[t])}`).join("; ")}.`
          + " Two questions decide the formula: does order matter (password, podium) or not (team, hand of cards)? Can items repeat (digits of a PIN) or not (people in a queue)?"
          + ` See also the <a href="${PAGE("coeficiente-binomial")}?n=${n}&amp;k=${Math.min(k, n)}">binomial coefficient</a>.`),
      };
    },

    gama({ k, lambda, x }) {
      if (k <= 0 || k > 1000) return { error: T("A forma k precisa estar entre 0 e 1.000, sem o zero.", "The shape k must be between 0 and 1,000, excluding zero.") };
      if (lambda <= 0) return { error: T("A taxa λ precisa ser maior que zero.", "The rate λ must be greater than zero.") };
      if (x < 0) return { error: T("x precisa ser maior ou igual a zero.", "x must be zero or more.") };
      const lpdf = v => k * Math.log(lambda) + (k - 1) * Math.log(v) - lambda * v - lgamma(k);
      const pdf = v => (v <= 0 ? (k === 1 ? lambda : k < 1 ? Infinity : 0) : Math.exp(lpdf(v)));
      const cdf = v => 1 - gammaQ(k, lambda * v);
      const f = pdf(x), F = x > 0 ? cdf(x) : 0;
      const mean = k / lambda, sd = Math.sqrt(k) / lambda;
      const hi = Math.max(x * 1.15, mean + 4 * sd);
      const pts = Array.from({ length: 241 }, (_, i) => { const v = hi * (i + (k < 1 ? 0.5 : 0)) / 240; return [v, pdf(v)]; }).filter(p => Number.isFinite(p[1]));
      const yMax = Math.min(Math.max(...pts.map(p => p[1])), k < 1 ? pdf(mean) * 6 : Infinity);
      const inteiro = Number.isInteger(k);
      let pois = "";
      if (inteiro && x > 0) {
        let s = 0; for (let j = 0; j < k; j++) s += poisPmf(lambda * x, j);
        pois = T(` Com k inteiro, esperar o ${k}º evento passar de x é o mesmo que ter menos de ${k} eventos até x: P(X ≤ ${fmt(x)}) = 1 − P(Poisson(${fmt(lambda * x)}) < ${k}) = 1 − ${fmt(s, 4)}, como dá a <a href="${PAGE("distribuicao-poisson")}?lambda=${Number((lambda * x).toFixed(6))}&amp;k=${k - 1}">Poisson</a>.`,
          ` With integer k, waiting past x for event number ${k} is the same as having fewer than ${k} events by x: P(X ≤ ${fmt(x)}) = 1 − P(Poisson(${fmt(lambda * x)}) < ${k}) = 1 − ${fmt(s, 4)}, as the <a href="${PAGE("distribuicao-poisson")}?lambda=${Number((lambda * x).toFixed(6))}&amp;k=${k - 1}">Poisson</a> gives.`);
      }
      const K = texNum(k), L = texNum(lambda), X = texNum(x);
      return {
        result: `f(${X}) ${approx(f, 6)} ${tone(texSci(f, 6), 1)}, \\qquad P(X \\le ${X}) ${approx(F, 6)} ${pctTex(F)}`,
        chart: {
          type: "curve", label: T(`Densidade Gama com forma ${fmt(k)} e taxa ${fmt(lambda)}; área sombreada até x = ${fmt(x)}`, `Gamma density with shape ${fmt(k)} and rate ${fmt(lambda)}; area shaded up to x = ${fmt(x)}`),
          xLabel: "x", xMin: 0, xMax: hi, yMax, pts, shadeTo: x, marker: Number.isFinite(f) && f <= yMax ? [x, f] : null,
          tipAt: v => [`f = ${fmtSci(pdf(v), 4)}`, `x = ${fmt(v, 2)}, P(X ≤ x) ≈ ${fmt(cdf(v) * 100, 1)}%`],
        },
        steps: [
          [T("Calcule cada parte da densidade:", "Compute each part of the density:"),
            `\\lambda^k = ${L}^{${K}} ${approx(lambda ** k, 6)} ${tone(texSci(lambda ** k, 4), 2)}, \\quad x^{k-1} = ${X}^{${texNum(k - 1)}} ${approx(x ** (k - 1), 6)} ${tone(texSci(x ** (k - 1), 4), 3)}, \\quad e^{-\\lambda x} ${approx(Math.exp(-lambda * x), 6)} ${tone(texSci(Math.exp(-lambda * x), 4), 4)}, \\quad \\Gamma(${K}) ${approx(Math.exp(lgamma(k)), 6)} ${tone(texSci(Math.exp(lgamma(k)), 4), 5)}`],
          [T("Junte tudo:", "Put it all together:"), `f(${X}) ${approx(f, 6)} ${tone(texSci(f, 6), 1)}`],
          [T("A probabilidade acumulada é a área sombreada, pela função gama incompleta:", "The cumulative probability is the shaded area, from the incomplete gamma function:"),
            `P(X \\le ${X}) ${approx(F, 6)} ${texNum(F, 6)}`],
        ],
        note: T(`A média é k/λ = ${fmt(mean, 4)} e o desvio padrão √k/λ = ${fmt(sd, 4)}.${inteiro ? ` Com k inteiro, a Gama é a soma de ${k} esperas <a href="${PAGE("distribuicao-exponencial")}?lambda=${lambda}&amp;x=${x}">exponenciais</a> de taxa λ: o tempo até o ${k}º evento.` : ""} Com k = 1, ela é a própria exponencial; com k grande, fica parecida com uma normal.`,
          `The mean is k/λ = ${fmt(mean, 4)} and the standard deviation √k/λ = ${fmt(sd, 4)}.${inteiro ? ` With integer k, the Gamma is the sum of ${k} <a href="${PAGE("distribuicao-exponencial")}?lambda=${lambda}&amp;x=${x}">exponential</a> waits with rate λ: the time until event number ${k}.` : ""} With k = 1 it is the exponential itself; with large k it looks like a normal.`) + pois,
      };
    },

    forma({ x }) {
      const n = x.length;
      if (n < 4) return { error: T("Informe pelo menos quatro valores.", "Enter at least four values.") };
      if (n > 5000) return { error: T("Use no máximo 5.000 valores.", "Use at most 5,000 values.") };
      const mean = x.reduce((s, v) => s + v, 0) / n;
      const mom = r => x.reduce((s, v) => s + (v - mean) ** r, 0) / n;
      const m2 = mom(2), m3 = mom(3), m4 = mom(4);
      if (m2 === 0) return { error: T("Todos os valores são iguais: não há forma para medir.", "All the values are equal: there is no shape to measure.") };
      const g1 = m3 / m2 ** 1.5, g2 = m4 / (m2 * m2) - 3;
      const G1 = g1 * Math.sqrt(n * (n - 1)) / (n - 2), G2 = ((n + 1) * g2 + 6) * (n - 1) / ((n - 2) * (n - 3));
      const jb = n / 6 * (g1 * g1 + g2 * g2 / 4), pjb = chiSurvival(jb, 2);
      const sd = Math.sqrt(m2 * n / (n - 1));
      const lo = Math.min(...x), hi = Math.max(...x), span = hi - lo, B = Math.max(5, Math.min(30, Math.round(Math.sqrt(n) * 1.5))), w = span / B;
      const counts = new Array(B).fill(0); x.forEach(v => { counts[Math.min(B - 1, Math.floor((v - lo) / w))]++; });
      const bins = counts.map((c, i) => ({ x0: lo + i * w, x1: lo + (i + 1) * w, count: c, y: c / (n * w) }));
      const pts = Array.from({ length: 161 }, (_, i) => { const v = lo - span * 0.1 + span * 1.2 * i / 160; return [v, normPdf(v, mean, sd)]; });
      const lado = Math.abs(g1) < 0.5 ? T("quase simétrica", "nearly symmetric") : g1 > 0 ? T("assimétrica à direita: a cauda longa fica nos valores altos", "right-skewed: the long tail is on the high side") : T("assimétrica à esquerda: a cauda longa fica nos valores baixos", "left-skewed: the long tail is on the low side");
      const cauda = g2 > 0.5 ? T("caudas mais pesadas que as da normal (mais valores extremos)", "heavier tails than the normal (more extreme values)") : g2 < -0.5 ? T("caudas mais leves que as da normal", "lighter tails than the normal") : T("caudas parecidas com as da normal", "tails similar to the normal's");
      const qs = new URLSearchParams({ x: x.join(" ") });
      return {
        result: `g_1 ${approx(g1)} ${tone(texNum(g1), 1)}, \\qquad g_2 ${approx(g2)} ${texNum(g2)}`,
        chart: {
          type: "hist", label: T("Histograma dos dados com a curva normal de mesma média e desvio padrão", "Histogram of the data with the normal curve of the same mean and standard deviation"),
          xLabel: T("valores · curva: normal de mesma média e desvio padrão", "values · curve: normal with the same mean and standard deviation"),
          xMin: lo - span * 0.1, xMax: hi + span * 0.1, yMax: Math.max(...bins.map(b => b.y), normPdf(mean, mean, sd)), bins, pts,
          binTip: b => [T(`${b.count} ${b.count === 1 ? "valor" : "valores"}`, `${b.count} value${b.count === 1 ? "" : "s"}`), T(`entre ${fmt(b.x0, 2)} e ${fmt(b.x1, 2)}`, `between ${fmt(b.x0, 2)} and ${fmt(b.x1, 2)}`)],
        },
        steps: [
          [T("Calcule a média e os momentos centrais: a média das potências 2, 3 e 4 dos desvios.", "Compute the mean and the central moments: the mean of the 2nd, 3rd and 4th powers of the deviations."),
            `\\bar{x} ${approx(mean)} ${texNum(mean)}, \\quad m_2 ${approx(m2)} ${tone(texNum(m2), 3)}, \\quad m_3 ${approx(m3)} ${tone(texNum(m3), 2)}, \\quad m_4 ${approx(m4)} ${texNum(m4)}`],
          [T("A assimetria divide m₃ pelo desvio padrão ao cubo; a curtose, m₄ pelo desvio padrão à quarta, menos 3 (o valor da normal):", "Skewness divides m₃ by the standard deviation cubed; kurtosis, m₄ by the standard deviation to the fourth, minus 3 (the normal's value):"),
            `g_1 = \\dfrac{${tone(texNum(m3), 2)}}{${tone(texNum(m2), 3)}^{3/2}} ${approx(g1)} ${tone(texNum(g1), 1)}, \\qquad g_2 = \\dfrac{${texNum(m4)}}{${texNum(m2)}^2} - 3 ${approx(g2)} ${texNum(g2)}`],
          [T("Programas como Excel e SPSS mostram as versões corrigidas para amostra:", "Software such as Excel and SPSS shows the sample-corrected versions:"),
            `G_1 ${approx(G1)} ${texNum(G1)}, \\qquad G_2 ${n > 3 ? `${approx(G2)} ${texNum(G2)}` : ""}`],
        ],
        note: T(`A distribuição é ${lado}, com ${cauda}. Na normal, as duas medidas valem 0.`
          + ` O teste de Jarque–Bera junta as duas: JB = n/6 · (g₁² + g₂²/4) ≈ ${fmt(jb, 3)}, valor-p ${pValueText(pjb)}${pjb < 0.05 ? ", e a normalidade é rejeitada a 5%" : ""}.`
          + ` Com dados assimétricos, a média é puxada pela cauda: vale olhar a mediana e os <a href="${PAGE("quartis-iqr")}?${qs}">quartis destes valores</a>.`,
          `The distribution is ${lado}, with ${cauda}. For the normal, both measures are 0.`
          + ` The Jarque–Bera test combines them: JB = n/6 · (g₁² + g₂²/4) ≈ ${fmt(jb, 3)}, p-value ${pValueText(pjb)}${pjb < 0.05 ? ", and normality is rejected at 5%" : ""}.`
          + ` With skewed data, the mean is dragged by the tail: it is worth looking at the median and the <a href="${PAGE("quartis-iqr")}?${qs}">quartiles of these values</a>.`),
      };
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

    pg({ a, r, n }) {
      if (!Number.isInteger(n) || n < 1) return { error: T("O número de termos n precisa ser um inteiro positivo.", "The number of terms n must be a positive integer.") };
      if (n > 1000) return { error: T("Use n de no máximo 1.000.", "Use n of at most 1,000.") };
      if (a === 0) return { error: T("O primeiro termo a precisa ser diferente de zero.", "The first term a must not be zero.") };
      const sums = [];
      let s = 0, term = a;
      for (let k = 1; k <= n; k++) { s += term; sums.push([k, s]); term *= r; }
      const rn = r ** n;
      const S = sums[n - 1][1];
      const A = tone(texNum(a), 2), R = paren(r, texNum(r));
      const conv = Math.abs(r) < 1, lim = a / (1 - r);
      const ys = sums.map(p => p[1]).concat(conv ? [lim] : []);
      const lo = Math.min(0, ...ys), hi = Math.max(...ys);
      const pad = (hi - lo) * 0.08 || 1;
      const steps = r === 1
        ? [[T("Com r = 1, todos os termos são iguais a a; a fórmula dividiria por zero, e a soma é só n · a:", "With r = 1, every term equals a; the formula would divide by zero, and the sum is just n · a:"),
          `S_{${n}} = ${n} \\cdot ${A} = ${tone(texNum(S), 1)}`]]
        : [[T(`Calcule a razão elevada a n = ${n}:`, `Raise the ratio to the power n = ${n}:`), `r^{n} = ${R}^{${n}} ${approx(rn, 6)} ${texSci(rn, 6)}`],
          [T("Calcule o numerador e o denominador:", "Compute the numerator and the denominator:"),
            `1 - r^{n} ${approx(1 - rn, 6)} ${tone(texSci(1 - rn, 6), 3)}, \\qquad 1 - r = ${tone(texNum(1 - r, 6), 4)}`],
          [T("Junte tudo:", "Put it all together:"),
            `S_{${n}} = ${A} \\cdot \\dfrac{${tone(texSci(1 - rn, 6), 3)}}{${tone(texNum(1 - r, 6), 4)}} ${approx(S, 6)} ${tone(texSci(S, 6), 1)}`]];
      if (conv) steps.push([T("Como |r| < 1, rⁿ vai a zero quando n cresce, e a soma infinita converge:", "Since |r| < 1, rⁿ goes to zero as n grows, and the infinite sum converges:"),
        `S_{\\infty} = \\dfrac{${A}}{1 - ${R}} ${approx(lim, 6)} ${texNum(lim, 6)}`]);
      return {
        result: `S_{${n}} ${approx(S, 6)} ${tone(texSci(S, 6), 1)}`,
        chart: {
          type: "curve", label: T(`Somas parciais da progressão geométrica com a = ${fmt(a)} e r = ${fmt(r)}${conv ? `; linha no limite ${fmt(lim)}` : ""}`, `Partial sums of the geometric series with a = ${fmt(a)} and r = ${fmt(r)}${conv ? `; line at the limit ${fmt(lim)}` : ""}`),
          xLabel: T(`número de termos somados${conv ? " · tracejada: soma infinita" : ""}`, `number of terms added${conv ? " · dashed: infinite sum" : ""}`),
          xMin: 1, xMax: Math.max(n, 2), yMin: lo - pad, yMax: hi + pad, pts: sums,
          hlines: conv ? [{ y: lim, cls: "chart-ref" }] : [], marker: [n, S],
          tipAt: v => { const k = Math.min(n, Math.max(1, Math.round(v))); return [fmt(sums[k - 1][1], 6), T(`soma dos ${k} primeiros termos`, `sum of the first ${k} terms`)]; },
        },
        steps,
        note: (conv
          ? T(`Faltam ${fmtSci(Math.abs(lim - S), 3)} para a soma infinita, ${fmt(lim, 6)}: cada termo novo cobre uma fração fixa do que falta.`,
            `The infinite sum, ${fmt(lim, 6)}, is ${fmtSci(Math.abs(lim - S), 3)} away: each new term covers a fixed share of what is left.`)
          : T("Como |r| ≥ 1, os termos não encolhem e a soma infinita não converge: ela cresce sem limite ou oscila.",
            "Since |r| ≥ 1, the terms don't shrink and the infinite sum doesn't converge: it grows without bound or oscillates."))
          + T(` A mesma soma aparece na estatística: na <a href="${PAGE("distribuicao-geometrica")}">distribuição geométrica</a>, a chance de o primeiro sucesso vir até a tentativa k é p(1 + q + … + q^(k−1)) = 1 − q^k.`,
            ` The same sum shows up in statistics: in the <a href="${PAGE("distribuicao-geometrica")}">geometric distribution</a>, the chance that the first success comes by trial k is p(1 + q + … + q^(k−1)) = 1 − q^k.`),
      };
    },

    stirling({ n }) {
      if (!Number.isInteger(n) || n < 1) return { error: T("n precisa ser um inteiro positivo.", "n must be a positive integer.") };
      if (n > 1e6) return { error: T("Use n de no máximo 1.000.000.", "Use n of at most 1,000,000.") };
      const lnExact = lgamma(n + 1);
      const lnRoot = 0.5 * Math.log(2 * Math.PI * n), lnPow = n * (Math.log(n) - 1);
      const lnApprox = lnRoot + lnPow;
      const rel = n2 => 1 - Math.exp(0.5 * Math.log(2 * Math.PI * n2) + n2 * (Math.log(n2) - 1) - lgamma(n2 + 1));
      const err = rel(n);
      // Número grande pela mantissa e pelo expoente, já que n! passa de 1e308.
      const big = ln => { const l10 = ln / Math.LN10, e = Math.floor(l10); return e < 15 ? texNum(Math.exp(ln), e < 0 ? 6 : 4) : `${texNum(10 ** (l10 - e), 4)} \\times 10^{${e}}`; };
      const exactTex = n <= 20 ? texNum(Math.round(Math.exp(lnExact))) : big(lnExact);
      const top = Math.max(20, Math.min(2 * n, 200));
      const pts = Array.from({ length: top }, (_, i) => [i + 1, rel(i + 1) * 100]);
      return {
        result: `${n}! \\approx ${tone(big(lnApprox), 1)}`,
        chart: {
          type: "curve", label: T("Erro relativo da aproximação de Stirling, em %, para cada n", "Relative error of Stirling's approximation, in %, for each n"),
          xLabel: T("n · erro relativo (%)", "n · relative error (%)"), xMin: 1, xMax: top, yMax: rel(1) * 100, pts,
          marker: n <= top ? [n, err * 100] : null,
          tipAt: v => { const k = Math.min(top, Math.max(1, Math.round(v))); return [`${fmt(rel(k) * 100, 3)}%`, `n = ${k}`]; },
        },
        steps: [
          [T("Calcule a raiz:", "Compute the root:"), `\\sqrt{2\\pi \\cdot ${n}} ${approx(Math.exp(lnRoot))} ${tone(texNum(Math.exp(lnRoot)), 2)}`],
          [T("Calcule a potência; e ≈ 2,71828:", "Compute the power; e ≈ 2.71828:"), `\\left(\\dfrac{${n}}{e}\\right)^{${n}} \\approx ${tone(big(lnPow), 3)}`],
          [T("Multiplique:", "Multiply:"), `${n}! \\approx ${tone(texNum(Math.exp(lnRoot)), 2)} \\cdot ${tone(big(lnPow), 3)} \\approx ${tone(big(lnApprox), 1)}`],
          [T("Compare com o valor exato:", "Compare with the exact value:"), `${n}! = ${exactTex}, \\qquad \\text{${T("erro relativo", "relative error")}} \\approx ${texNum(err * 100, 4)}\\%`],
        ],
        note: T(`A aproximação fica abaixo do valor exato por cerca de 1/(12n) ≈ ${fmt(100 / (12 * n), 4)}%: o erro relativo some conforme n cresce, embora a diferença absoluta continue enorme.`
          + " É assim que se lida com fatoriais grandes demais para a calculadora: em logaritmos, ln n! ≈ n ln n − n + ½ ln(2πn)."
          + ` É o que está por trás das contas do <a href="${PAGE("coeficiente-binomial")}">coeficiente binomial</a>, da <a href="${PAGE("distribuicao-binomial")}">binomial</a> e do <a href="${PAGE("problema-aniversario")}">problema do aniversário</a> com números grandes.`,
          `The approximation falls short of the exact value by about 1/(12n) ≈ ${fmt(100 / (12 * n), 4)}%: the relative error vanishes as n grows, even though the absolute gap stays huge.`
          + " This is how factorials too large for a calculator are handled: in logarithms, ln n! ≈ n ln n − n + ½ ln(2πn)."
          + ` It is what lies behind the calculations of the <a href="${PAGE("coeficiente-binomial")}">binomial coefficient</a>, the <a href="${PAGE("distribuicao-binomial")}">binomial distribution</a> and the <a href="${PAGE("problema-aniversario")}">birthday problem</a> with large numbers.`),
      };
    },

    elim({ n }) {
      if (!(n >= 1)) return { error: T("n precisa ser maior ou igual a 1.", "n must be at least 1.") };
      if (n > 1e12) return { error: T("Use n de no máximo 10¹².", "Use n of at most 10¹².") };
      // log1p evita perder casas em 1 + 1/n quando n é grande.
      const val = m => Math.exp(m * Math.log1p(1 / m));
      const v = val(n), gap = Math.E - v;
      const top = Math.max(30, Math.min(n, 1000));
      const pts = Array.from({ length: 300 }, (_, i) => { const m = 1 + (top - 1) * i / 299; return [m, val(m)]; });
      const casos = [[1, T("anual", "yearly")], [12, T("mensal", "monthly")], [365, T("diária", "daily")], [8760, T("por hora", "hourly")]];
      return {
        result: `\\left(1 + \\dfrac{1}{${texNum(n)}}\\right)^{${texNum(n)}} ${approx(v, 8)} ${tone(texNum(v, 8), 3)}`,
        chart: {
          type: "curve", label: T(`Valor de (1 + 1/n)^n de n = 1 a ${fmt(top)}, aproximando-se de e`, `Value of (1 + 1/n)^n from n = 1 to ${fmt(top)}, approaching e`),
          xLabel: T("n · tracejada: e ≈ 2,71828", "n · dashed: e ≈ 2.71828"), xMin: 1, xMax: top, yMin: 1.9, yMax: 2.8, pts,
          hlines: [{ y: Math.E, cls: "chart-ref" }], marker: n <= top ? [n, v] : null,
          tipAt: m => { const k = Math.max(1, Math.round(m)); return [fmt(val(k), 6), `n = ${fmt(k)}`]; },
        },
        steps: [
          [T("Divida 1 por n e some 1:", "Divide 1 by n and add 1:"), `1 + \\dfrac{1}{${texNum(n)}} ${approx(1 + 1 / n, 10)} ${texNum(1 + 1 / n, 10)}`],
          [T(`Eleve a ${fmt(n)}:`, `Raise it to the power ${fmt(n)}:`), `\\left(${texNum(1 + 1 / n, 10)}\\right)^{${texNum(n)}} ${approx(v, 8)} ${tone(texNum(v, 8), 3)}`],
          [T("Compare com e:", "Compare with e:"), `${tone("e", 1)} - ${texNum(v, 8)} ${approx(gap, 8)} ${texSci(gap, 4)}`],
        ],
        note: T(`Ainda faltam ${fmtSci(gap, 3)} para e, perto de e/(2n) ≈ ${fmtSci(Math.E / (2 * n), 3)}: o limite chega devagar.`
          + ` Em juros, é R$ 1 a 100% ao ano: capitalizando ${casos.map(([m, t]) => `${t}, vira R$ ${fmt(val(m), 4)}`).join("; ")}; e, de forma contínua, R$ e ≈ ${fmt(Math.E, 4)}.`
          + ` Com taxa r, o limite vira e^r. É de onde vêm a <a href="${PAGE("distribuicao-exponencial")}">distribuição exponencial</a> e a <a href="${PAGE("distribuicao-poisson")}">de Poisson</a>.`,
          `e is still ${fmtSci(gap, 3)} away, close to e/(2n) ≈ ${fmtSci(Math.E / (2 * n), 3)}: the limit arrives slowly.`
          + ` In interest terms, it is $1 at 100% a year: compounded ${casos.map(([m, t]) => `${t}, it becomes $${fmt(val(m), 4)}`).join("; ")}; and, continuously, $e ≈ ${fmt(Math.E, 4)}.`
          + ` With a rate r, the limit becomes e^r. This is where the <a href="${PAGE("distribuicao-exponencial")}">exponential</a> and <a href="${PAGE("distribuicao-poisson")}">Poisson</a> distributions come from.`),
      };
    },

    riemann({ f, a, b, n, m }) {
      const FUNCS = {
        x2: { tex: "x^2", f: x => x * x, F: x => x ** 3 / 3 },
        exp: { tex: "e^{x}", f: Math.exp, F: Math.exp },
        inv: { tex: "\\tfrac{1}{x}", f: x => 1 / x, F: Math.log, min: 0, strict: true },
        sqrt: { tex: "\\sqrt{x}", f: Math.sqrt, F: x => 2 / 3 * x ** 1.5, min: 0 },
        normal: { tex: "\\varphi(x)", f: x => normPdf(x, 0, 1), F: phi },
      };
      const fn = FUNCS[f];
      const nome = { x2: "x²", exp: "eˣ", inv: "1/x", sqrt: "√x", normal: "φ(x)" }[f];
      if (!(a < b)) return { error: T("O início a precisa ser menor que o fim b.", "The start a must be less than the end b.") };
      if (fn.min != null && (fn.strict ? a <= fn.min : a < fn.min)) return { error: T(`Para ${nome}, o intervalo precisa começar em ${f === "inv" ? "um valor maior que 0" : "0 ou depois"}.`, `For ${nome}, the interval must start ${f === "inv" ? "above 0" : "at 0 or later"}.`) };
      if (b - a > 1000) return { error: T("Use um intervalo de no máximo 1.000 de largura.", "Use an interval at most 1,000 wide.") };
      if (f === "exp" && b > 50) return { error: T("Para eˣ, use b de no máximo 50.", "For eˣ, use b of at most 50.") };
      if (!Number.isInteger(n) || n < 1 || n > 500) return { error: T("O número de retângulos precisa ser um inteiro entre 1 e 500.", "The number of rectangles must be an integer between 1 and 500.") };
      const off = { esq: 0, meio: 0.5, dir: 1 }[m];
      const area = k => { const d = (b - a) / k; let s = 0; for (let i = 0; i < k; i++) s += fn.f(a + (i + off) * d) * d; return s; };
      const dx = (b - a) / n, S = area(n);
      const exact = fn.F(b) - fn.F(a), err = S - exact, err2 = area(2 * n) - exact;
      const xi = i => a + (i + off) * dx;
      const bins = Array.from({ length: n }, (_, i) => ({ x0: a + i * dx, x1: a + (i + 1) * dx, y: fn.f(xi(i)), count: 0, i }));
      const pts = Array.from({ length: 201 }, (_, i) => { const x = a + (b - a) * i / 200; return [x, fn.f(x)]; });
      const yMax = Math.max(...pts.map(p => p[1]), ...bins.map(q => q.y));
      const where = { esq: T("na borda esquerda", "at the left edge"), meio: T("no ponto médio", "at the midpoint"), dir: T("na borda direita", "at the right edge") }[m];
      const show = n <= 4 ? bins.map(q => q.i) : [0, 1, n - 1];
      const DX = tone(texNum(dx, 6), 4);
      return {
        result: `\\int_{${texNum(a)}}^{${texNum(b)}} ${fn.tex}\\,dx \\approx ${tone(texNum(S, 6), 1)}`,
        chart: {
          type: "hist", label: T(`${n} retângulos sob a curva de ${nome} entre ${fmt(a)} e ${fmt(b)}, com altura tomada ${where}`, `${n} rectangles under the curve of ${nome} between ${fmt(a)} and ${fmt(b)}, with the height taken ${where}`),
          xLabel: "x", xMin: a, xMax: b, yMax, bins, pts,
          binTip: q => [fmt(q.y * dx, 6), T(`retângulo ${q.i + 1}: altura ${fmt(q.y, 4)}, de x = ${fmt(q.x0, 3)} a ${fmt(q.x1, 3)}`, `rectangle ${q.i + 1}: height ${fmt(q.y, 4)}, from x = ${fmt(q.x0, 3)} to ${fmt(q.x1, 3)}`)],
        },
        steps: [
          [T("Divida o intervalo em n partes iguais:", "Split the interval into n equal parts:"), `\\Delta x = \\dfrac{${texNum(b)} - ${paren(a, texNum(a))}}{${n}} ${approx(dx, 6)} ${DX}`],
          [T(`Em cada parte, tome a altura da curva ${where}:`, `In each part, take the height of the curve ${where}:`),
            show.map(i => `f(${texNum(xi(i), 4)}) ${approx(fn.f(xi(i)), 4)} ${tone(texNum(fn.f(xi(i)), 4), 3)}`).join(", \\quad ").replace(/(.*), \\quad /, n > 4 ? "$1, \\quad \\ldots, \\quad " : "$1, \\quad ")],
          [T("Some as áreas dos retângulos, altura vezes largura:", "Add up the areas of the rectangles, height times width:"),
            `${tone("\\textstyle\\sum", 2)} f(x_i^*) \\cdot ${DX} ${approx(S, 6)} ${tone(texNum(S, 6), 1)}`],
          [T("Compare com a área exata, pela primitiva:", "Compare with the exact area, from the antiderivative:"),
            `\\int_{${texNum(a)}}^{${texNum(b)}} ${fn.tex}\\,dx ${approx(exact, 6)} ${texNum(exact, 6)}, \\qquad \\text{${T("erro", "error")}} ${approx(err, 6)} ${texSci(err, 4)}`],
        ],
        note: T(`Com ${2 * n} retângulos, o erro seria ${fmtSci(err2, 3)}: ${m === "meio" ? "pelo ponto médio, dobrar n divide o erro por cerca de 4" : "pela borda, dobrar n divide o erro por cerca de 2; o ponto médio converge bem mais rápido"}.`
          + ` No limite, com n indo ao infinito, a soma vira a integral. É a ideia por trás de "probabilidade é área sob a curva": escolha φ(x) e o resultado é a chance de uma <a href="${PAGE("distribuicao-normal")}">normal padrão</a> cair entre a e b.`,
          `With ${2 * n} rectangles, the error would be ${fmtSci(err2, 3)}: ${m === "meio" ? "with the midpoint, doubling n divides the error by about 4" : "with an edge, doubling n divides the error by about 2; the midpoint converges much faster"}.`
          + ` In the limit, as n goes to infinity, the sum becomes the integral. It is the idea behind "probability is area under the curve": pick φ(x) and the result is the chance that a <a href="${PAGE("distribuicao-normal")}">standard normal</a> falls between a and b.`),
      };
    },

    taylor({ f, x, N }) {
      const FUNCS = {
        exp: { tex: "e^{x}", f: Math.exp, c: k => 1 / Math.exp(lgamma(k + 1)), lo: -3, hi: 3 },
        sin: { tex: "\\operatorname{sen} x", en: "\\sin x", f: Math.sin, c: k => (k % 2 ? (-1) ** ((k - 1) / 2) / Math.exp(lgamma(k + 1)) : 0), lo: -2 * Math.PI, hi: 2 * Math.PI },
        cos: { tex: "\\cos x", f: Math.cos, c: k => (k % 2 ? 0 : (-1) ** (k / 2) / Math.exp(lgamma(k + 1))), lo: -2 * Math.PI, hi: 2 * Math.PI },
        ln: { tex: "\\ln(1 + x)", f: Math.log1p, c: k => (k ? (-1) ** (k + 1) / k : 0), lo: -0.95, hi: 2 },
      };
      const fn = FUNCS[f];
      const nome = { exp: "eˣ", sin: T("sen x", "sin x"), cos: "cos x", ln: "ln(1 + x)" }[f];
      const ftex = EN && fn.en ? fn.en : fn.tex;
      if (!Number.isInteger(N) || N < 0 || N > 40) return { error: T("O grau N precisa ser um inteiro entre 0 e 40.", "The degree N must be an integer between 0 and 40.") };
      if (Math.abs(x) > 20) return { error: T("Use x entre −20 e 20.", "Use x between −20 and 20.") };
      if (f === "ln" && x <= -1) return { error: T("ln(1 + x) só existe para x maior que −1.", "ln(1 + x) only exists for x greater than −1.") };
      const poly = v => { let s = 0; for (let k = 0; k <= N; k++) s += fn.c(k) * v ** k; return s; };
      const P = poly(x), exact = fn.f(x), err = P - exact;
      const terms = [];
      for (let k = 0; k <= N; k++) if (fn.c(k) !== 0) terms.push(k);
      const termTex = k => {
        const c = fn.c(k);
        const den = f === "ln" ? k : `${k}!`;
        const body = k === 0 ? "1" : `\\dfrac{${tone(`x^{${k}}`, 5)}}{${tone(den, 4)}}`;
        return { sign: c < 0 ? "-" : "+", body };
      };
      const shown = terms.slice(0, 6).map(termTex);
      const poly_tex = shown.map((t, i) => (i === 0 ? (t.sign === "-" ? "-" : "") : ` ${t.sign} `) + t.body).join("") + (terms.length > 6 ? " + \\cdots" : "");
      const lo = Math.max(fn.lo === -0.95 ? -0.95 : -20, Math.min(fn.lo, x - 1)), hi = Math.min(20, Math.max(fn.hi, x + 1));
      const fpts = Array.from({ length: 241 }, (_, i) => { const v = lo + (hi - lo) * i / 240; return [v, fn.f(v)]; });
      const ppts = fpts.map(([v]) => [v, poly(v)]);
      const fy = fpts.map(p => p[1]);
      const yLo = Math.min(...fy, P), yHi = Math.max(...fy, P), pad = (yHi - yLo) * 0.15 || 1;
      const diverge = f === "ln" && x > 1;
      return {
        result: `P_{${N}}(${texNum(x)}) ${approx(P, 6)} ${tone(texNum(P, 6), 1)}`,
        chart: {
          type: "curve", label: T(`Curva de ${nome} e polinômio de Taylor de grau ${N} em torno de 0`, `Curve of ${nome} and Taylor polynomial of degree ${N} around 0`),
          xLabel: T(`x · cheia colorida: a função · escura: o polinômio de grau ${N}`, `x · colored: the function · dark: the degree-${N} polynomial`),
          xMin: lo, xMax: hi, yMin: yLo - pad, yMax: yHi + pad, pts: fpts, lines: [{ pts: ppts, cls: "chart-fit" }],
          tipAt: v => [`P = ${fmt(poly(v), 4)}`, T(`f(x) = ${fmt(fn.f(v), 4)} em x = ${fmt(v, 2)}`, `f(x) = ${fmt(fn.f(v), 4)} at x = ${fmt(v, 2)}`)],
        },
        steps: [
          [T(`Escreva os termos até o grau ${N}${f === "sin" || f === "cos" ? "; as derivadas de seno e cosseno em 0 alternam entre 0, 1 e −1, então metade dos termos some" : ""}:`,
            `Write out the terms up to degree ${N}${f === "sin" || f === "cos" ? "; the derivatives of sine and cosine at 0 cycle through 0, 1 and −1, so half the terms drop out" : ""}:`),
            terms.length ? `P_{${N}}(x) = ${poly_tex}` : `P_{${N}}(x) = 0`],
          [T(`Substitua x = ${fmt(x)} e some:`, `Plug in x = ${fmt(x)} and add up:`), `P_{${N}}(${texNum(x)}) ${approx(P, 6)} ${tone(texNum(P, 6), 1)}`],
          [T("Compare com o valor exato:", "Compare with the exact value:"),
            `${ftex.replace(/x/g, `{${texNum(x)}}`)} ${approx(exact, 6)} ${texNum(exact, 6)}, \\qquad \\text{${T("erro", "error")}} ${approx(err, 6)} ${texSci(err, 4)}`],
        ],
        note: (diverge
          ? T(`${warn} a série de ln(1 + x) só converge para −1 < x ≤ 1. Com x = ${fmt(x)}, somar mais termos piora o resultado em vez de melhorar.`,
            `${warn} the series for ln(1 + x) only converges for −1 < x ≤ 1. With x = ${fmt(x)}, adding more terms makes the result worse, not better.`)
          : T(`Perto de 0 o polinômio cola na curva; longe, ele se descola. Cada termo a mais estende a faixa em que a aproximação é boa — suba N e veja no gráfico.`,
            `Near 0 the polynomial hugs the curve; further out, it peels away. Each extra term widens the range where the approximation is good — raise N and watch the chart.`))
          + (f === "exp"
            ? T(` A série de eˣ é a que faz as probabilidades da <a href="${PAGE("distribuicao-poisson")}">Poisson</a> somarem 1: Σ λᵏ/k! = e^λ.`,
              ` The series for eˣ is what makes the <a href="${PAGE("distribuicao-poisson")}">Poisson</a> probabilities add up to 1: Σ λᵏ/k! = e^λ.`)
            : ""),
      };
    },

    inv2({ a, b, c, d, y1, y2 }) {
      if ((y1 == null) !== (y2 == null)) return { error: T("Preencha y₁ e y₂, ou deixe os dois em branco para calcular só a inversa.", "Fill in both y₁ and y₂, or leave both blank to compute just the inverse.") };
      const det = a * d - b * c;
      const mat = (m, t) => `\\begin{pmatrix} ${m.map(r => r.map(v => (t ? t(v) : texNum(v, 6))).join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
      const A = mat([[a, b], [c, d]]);
      const D = tone(texNum(det, 6), 2);
      // Paralelogramo: para onde a matriz leva o quadrado unitário.
      const par = [[0, 0], [a, c], [a + b, c + d], [b, d], [0, 0]];
      const sq = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
      const xs = par.concat(sq).map(p => p[0]), ys = par.concat(sq).map(p => p[1]);
      const span = (v) => { const lo = Math.min(...v), hi = Math.max(...v), pad = (hi - lo) * 0.1 || 1; return [lo - pad, hi + pad]; };
      let [x0, x1] = span(xs), [yMin, yMax] = span(ys);
      // Mesma escala nos dois eixos, para o quadrado parecer quadrado: a área
      // útil do gráfico mede 578 × 232 (veja renderChart).
      const ratio = (640 - 48 - 14) / (280 - 14 - 34);
      if ((x1 - x0) / (yMax - yMin) < ratio) { const h = (yMax - yMin) * ratio / 2, m = (x0 + x1) / 2; x0 = m - h; x1 = m + h; }
      else { const h = (x1 - x0) / ratio / 2, m = (yMin + yMax) / 2; yMin = m - h; yMax = m + h; }
      const chart = {
        type: "curve", height: 280,
        label: T(`O quadrado unitário e o paralelogramo em que a matriz o transforma, de área ${fmt(Math.abs(det))}`, `The unit square and the parallelogram the matrix turns it into, with area ${fmt(Math.abs(det))}`),
        xLabel: T(`escura: quadrado unitário · colorida: sua imagem, área |det| = ${fmt(Math.abs(det))}`, `dark: unit square · colored: its image, area |det| = ${fmt(Math.abs(det))}`),
        xMin: x0, xMax: x1, yMin, yMax, pts: par, lines: [{ pts: sq, cls: "chart-fit" }],
      };
      const detStep = [T("Calcule o determinante: diagonal principal menos diagonal secundária.", "Compute the determinant: main diagonal minus the other diagonal."),
        `\\det A = ${paren(a, texNum(a))} \\cdot ${paren(d, texNum(d))} - ${paren(b, texNum(b))} \\cdot ${paren(c, texNum(c))} ${approx(det, 6)} ${D}`];
      if (Math.abs(det) < 1e-12) {
        return {
          error: T("O determinante é zero: a matriz não tem inversa. Ela achata o plano numa reta (as duas colunas são proporcionais), e não há como desfazer isso. Um sistema com essa matriz tem infinitas soluções ou nenhuma.",
            "The determinant is zero: the matrix has no inverse. It flattens the plane onto a line (the two columns are proportional), and that can't be undone. A system with this matrix has infinitely many solutions or none."),
        };
      }
      const inv = [[d / det, -b / det], [-c / det, a / det]];
      const eq = inv.flat().every(v => approx(v, 6) === "=") ? "=" : "\\approx";
      const steps = [
        detStep,
        [T("Troque de lugar os elementos da diagonal principal e mude o sinal dos outros dois:", "Swap the entries on the main diagonal and change the sign of the other two:"),
          tone(mat([[d, -b], [-c, a]]), 3)],
        [T("Divida tudo pelo determinante:", "Divide everything by the determinant:"),
          `A^{-1} = \\dfrac{1}{${D}} ${tone(mat([[d, -b], [-c, a]]), 3)} ${eq} ${tone(mat(inv), 1)}`],
        [T("Confira: A vezes a inversa dá a identidade.", "Check: A times its inverse gives the identity."),
          `${A} \\cdot ${mat(inv)} = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}`],
      ];
      const hasY = y1 != null && y2 != null;
      let sol = "";
      if (hasY) {
        const s1 = inv[0][0] * y1 + inv[0][1] * y2, s2 = inv[1][0] * y1 + inv[1][1] * y2;
        steps.push([T("Para resolver o sistema A · x = y, multiplique a inversa pelo vetor y:", "To solve the system A · x = y, multiply the inverse by the vector y:"),
          `\\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix} = ${mat(inv)} ${mat([[y1], [y2]])} ${approx(s1, 6) === "=" && approx(s2, 6) === "=" ? "=" : "\\approx"} ${mat([[s1], [s2]], v => tone(texNum(v, 6), 1))}`]);
        // Equação legível: sem "1x", sem "+ −2x" e sem o termo de coeficiente zero.
        const co = v => (v === 1 ? "" : v === -1 ? "−" : fmt(v).replace("-", "−"));
        const eqn = (p, q, y) => {
          const t1 = p ? `${co(p)}x₁` : "", t2 = q ? `${co(Math.abs(q))}x₂` : "";
          const mid = t1 && t2 ? ` ${q < 0 ? "−" : "+"} ${t2}` : t2 ? `${q < 0 ? "−" : ""}${t2}` : "";
          return `${t1}${mid} = ${fmt(y)}`;
        };
        sol = T(` O sistema ${eqn(a, b, y1)} e ${eqn(c, d, y2)} tem solução única: x₁ = ${fmt(s1, 6)} e x₂ = ${fmt(s2, 6)}.`,
          ` The system ${eqn(a, b, y1)} and ${eqn(c, d, y2)} has a unique solution: x₁ = ${fmt(s1, 6)} and x₂ = ${fmt(s2, 6)}.`);
      }
      return {
        result: `\\det A ${approx(det, 6)} ${D}, \\qquad A^{-1} ${eq} ${tone(mat(inv), 1)}`,
        chart,
        steps,
        note: T(`O determinante diz quanto a matriz estica as áreas: o quadrado unitário vira um paralelogramo de área |det A| = ${fmt(Math.abs(det))}${det < 0 ? ", espelhado (o sinal negativo inverte a orientação)" : ""}.`
          + " A inversa desfaz a transformação, por isso divide pelo determinante — e não existe quando ele é zero.",
          `The determinant says how much the matrix stretches areas: the unit square becomes a parallelogram of area |det A| = ${fmt(Math.abs(det))}${det < 0 ? ", mirrored (the negative sign flips the orientation)" : ""}.`
          + " The inverse undoes the transformation, which is why it divides by the determinant — and doesn't exist when that is zero.")
          + sol
          + T(` Na estatística, é um sistema 2 × 2 assim que dá os coeficientes da <a href="${PAGE("regressao-linear")}">regressão linear simples</a>: as equações normais têm a matriz (n, Σx; Σx, Σx²), de determinante n · Σ(x − x̄)².`,
            ` In statistics, a 2 × 2 system like this gives the coefficients of <a href="${PAGE("regressao-linear")}">simple linear regression</a>: the normal equations have the matrix (n, Σx; Σx, Σx²), with determinant n · Σ(x − x̄)².`),
      };
    },

    logistica({ b0, b1, x }) {
      const z = b0 + b1 * x, ez = Math.exp(-z), p = 1 / (1 + ez), odds = Math.exp(z);
      const mid = b1 !== 0 ? -b0 / b1 : x;
      const w = b1 !== 0 ? Math.min(1e6, 6 / Math.abs(b1)) : 5;
      const lo = Math.min(x, mid - w), hi = Math.max(x, mid + w);
      const sig = v => 1 / (1 + Math.exp(-(b0 + b1 * v)));
      const pts = Array.from({ length: 201 }, (_, i) => { const v = lo + (hi - lo) * i / 200; return [v, sig(v)]; });
      const Z = tone(texNum(z), 3);
      const fator = Math.exp(b1);
      return {
        result: `p ${approx(p, 6)} ${tone(texNum(p, 6), 1)}, \\qquad ${T("chance", "odds")} = \\dfrac{p}{1 - p} ${approx(odds, 6)} ${texNum(odds, 6)}`,
        chart: {
          type: "curve", label: T(`Curva logística com β₀ = ${fmt(b0)} e β₁ = ${fmt(b1)}; marcado x = ${fmt(x)}`, `Logistic curve with β₀ = ${fmt(b0)} and β₁ = ${fmt(b1)}; x = ${fmt(x)} marked`),
          xLabel: T("x · tracejada: p = 0,5", "x · dashed: p = 0.5"), xMin: lo, xMax: hi, yMin: 0, yMax: 1, pts, marker: [x, p],
          hlines: [{ y: 0.5, cls: "chart-ref" }],
          tipAt: v => [`p ≈ ${fmt(sig(v), 4)}`, `x = ${fmt(v, 2)}`],
        },
        steps: [
          [T("Calcule o preditor linear z:", "Compute the linear predictor z:"), `z = ${texNum(b0)} + ${paren(b1, texNum(b1))} \\cdot ${paren(x, texNum(x))} ${approx(z)} ${Z}`],
          [T("Calcule a exponencial de −z:", "Compute the exponential of −z:"), `e^{-z} = e^{${texNum(-z)}} ${approx(ez, 6)} ${tone(texSci(ez, 6), 2)}`],
          [T("Aplique a função logística, que leva qualquer número para entre 0 e 1:", "Apply the logistic function, which maps any number to between 0 and 1:"),
            `p = \\dfrac{1}{1 + ${tone(texSci(ez, 6), 2)}} ${approx(p, 6)} ${tone(texNum(p, 6), 1)}`],
          [T("A chance é p/(1 − p), que é o mesmo que eᶻ:", "The odds are p/(1 − p), the same as eᶻ:"), `\\dfrac{${texNum(p, 6)}}{${texNum(1 - p, 6)}} = e^{${texNum(z)}} ${approx(odds, 6)} ${texNum(odds, 6)}`],
        ],
        note: T(`O logaritmo da chance, ln(p/(1 − p)) = z, é uma reta em x: cada unidade a mais em x soma β₁ ao log da chance e multiplica a chance por e^β₁ ≈ ${fmt(fator, 4)}.`
          + ` Esse fator é uma <a href="${PAGE("razao-chances")}">razão de chances</a>, e é assim que se lêem os coeficientes de uma regressão logística.`
          + (b1 !== 0 ? ` A chance chega a 50% em x = −β₀/β₁ ≈ ${fmt(mid, 4)}.` : "")
          + " Perto de p = 0,5 a curva é quase reta; nas pontas, achata: somar a z mexe pouco numa probabilidade que já está perto de 0 ou de 1.",
          `The log of the odds, ln(p/(1 − p)) = z, is a straight line in x: each extra unit of x adds β₁ to the log-odds and multiplies the odds by e^β₁ ≈ ${fmt(fator, 4)}.`
          + ` That factor is an <a href="${PAGE("razao-chances")}">odds ratio</a>, and it is how the coefficients of a logistic regression are read.`
          + (b1 !== 0 ? ` The chance reaches 50% at x = −β₀/β₁ ≈ ${fmt(mid, 4)}.` : "")
          + " Near p = 0.5 the curve is almost straight; at the ends it flattens: adding to z barely moves a probability already close to 0 or 1."),
      };
    },

    aportes({ P, A, i, n }) {
      if (!Number.isInteger(n) || n < 1 || n > 1200) return { error: T("O número de períodos precisa ser um inteiro entre 1 e 1.200.", "The number of periods must be an integer between 1 and 1,200.") };
      if (P < 0 || A < 0) return { error: T("O valor inicial e o aporte não podem ser negativos.", "The initial amount and the contribution cannot be negative.") };
      if (i <= -100) return { error: T("A taxa precisa ser maior que −100%.", "The rate must be greater than −100%.") };
      const r = i / 100, f = (1 + r) ** n;
      const fvP = P * f, fvA = r === 0 ? A * n : A * (f - 1) / r;
      const M = fvP + fvA, pago = P + A * n, juros = M - pago;
      const cur = T("R\\$\\,", "\\$");
      const money = v => `${cur}${texNum(v, 2)}`;
      const moneyTxt = v => `${T("R$ ", "$")}${fmt(v, 2)}`;
      const saldo = k => P * (1 + r) ** k + (r === 0 ? A * k : A * ((1 + r) ** k - 1) / r);
      const step = Math.max(1, Math.ceil(n / 300));
      const ks = []; for (let k = 0; k <= n; k += step) ks.push(k); if (ks[ks.length - 1] !== n) ks.push(n);
      const F = tone(texNum(f, 6), 4);
      return {
        result: `M ${approx(M, 2)} ${tone(money(M), 1)}`,
        chart: {
          type: "curve", label: T(`Saldo ao longo de ${n} períodos e total aportado`, `Balance over ${n} periods and total contributed`),
          xLabel: T("períodos · colorida: saldo · escura: total aportado", "periods · colored: balance · dark: total contributed"),
          xMin: 0, xMax: n, yMax: Math.max(M, pago), pts: ks.map(k => [k, saldo(k)]),
          lines: [{ pts: ks.map(k => [k, P + A * k]), cls: "chart-fit" }], marker: [n, M],
          tipAt: v => { const k = Math.min(n, Math.max(0, Math.round(v))); return [moneyTxt(saldo(k)), T(`após ${k} períodos (aportado: ${moneyTxt(P + A * k)})`, `after ${k} periods (contributed: ${moneyTxt(P + A * k)})`)]; },
        },
        steps: [
          [T("Calcule o fator de crescimento do período inteiro:", "Compute the growth factor over the whole term:"), `(1 + i)^n = ${texNum(1 + r, 6)}^{${n}} ${approx(f, 6)} ${F}`],
          [T("O valor inicial cresce por esse fator:", "The initial amount grows by that factor:"), `${tone(texNum(P, 2), 2)} \\cdot ${F} ${approx(fvP, 2)} ${money(fvP)}`],
          [r === 0
            ? T("Com taxa zero, os aportes só se somam:", "With a zero rate, the contributions just add up:")
            : T("Cada aporte cresce pelo tempo que ainda falta; somados, formam uma progressão geométrica:", "Each contribution grows for the time still left; added up, they form a geometric series:"),
            r === 0 ? `${tone(texNum(A, 2), 3)} \\cdot ${n} = ${money(fvA)}`
              : `${tone(texNum(A, 2), 3)} \\cdot \\dfrac{${F} - 1}{${tone(texNum(r, 6), 5)}} ${approx(fvA, 2)} ${money(fvA)}`],
          [T("Some as duas partes:", "Add the two parts:"), `M = ${money(fvP)} + ${money(fvA)} ${approx(M, 2)} ${tone(money(M), 1)}`],
        ],
        note: T(`Do total, ${moneyTxt(pago)} saíram do bolso (${moneyTxt(P)} no início e ${n} aportes de ${moneyTxt(A)}) e ${moneyTxt(juros)} são juros, ${fmt(pago ? juros / M * 100 : 0, 1)}% do saldo final.`
          + " Os juros ganham peso com o tempo: no gráfico, o saldo se afasta da linha do que foi aportado cada vez mais depressa."
          + (r > 0 ? ` A parte dos aportes é uma <a href="${PAGE("soma-pg")}?a=${A}&amp;r=${Number((1 + r).toFixed(8))}&amp;n=${n}">soma de progressão geométrica</a> de razão 1 + i.` : "")
          + " A taxa e os aportes precisam estar no mesmo período: com taxa mensal, aportes mensais e n em meses.",
          `Of the total, ${moneyTxt(pago)} came out of pocket (${moneyTxt(P)} up front and ${n} contributions of ${moneyTxt(A)}) and ${moneyTxt(juros)} is interest, ${fmt(pago ? juros / M * 100 : 0, 1)}% of the final balance.`
          + " Interest gains weight over time: in the chart, the balance pulls away from the contributed line faster and faster."
          + (r > 0 ? ` The contributions part is a <a href="${PAGE("soma-pg")}?a=${A}&amp;r=${Number((1 + r).toFixed(8))}&amp;n=${n}">geometric series</a> with ratio 1 + i.` : "")
          + " The rate and the contributions must use the same period: with a monthly rate, monthly contributions and n in months."),
      };
    },

    derivada({ f, x, h }) {
      const FUNCS = {
        x2: { tex: "x^2", f: v => v * v, d: v => 2 * v },
        x3: { tex: "x^3", f: v => v ** 3, d: v => 3 * v * v },
        exp: { tex: "e^{x}", f: Math.exp, d: Math.exp },
        sin: { tex: T("\\operatorname{sen} x", "\\sin x"), f: Math.sin, d: Math.cos },
        ln: { tex: "\\ln x", f: Math.log, d: v => 1 / v, pos: true },
        sqrt: { tex: "\\sqrt{x}", f: Math.sqrt, d: v => 0.5 / Math.sqrt(v), pos: true },
      };
      const fn = FUNCS[f];
      if (h === 0) return { error: T("h não pode ser zero: a conta viraria 0/0. A derivada é o limite quando h se aproxima de zero.", "h cannot be zero: the calculation would become 0/0. The derivative is the limit as h approaches zero.") };
      if (Math.abs(h) > 10 || Math.abs(x) > 50) return { error: T("Use |x| ≤ 50 e |h| ≤ 10.", "Use |x| ≤ 50 and |h| ≤ 10.") };
      if (fn.pos && (x <= 0 || x + h <= 0)) return { error: T("Para ln x e √x, x e x + h precisam ser positivos.", "For ln x and √x, x and x + h must be positive.") };
      const fx = fn.f(x), fxh = fn.f(x + h), q = (fxh - fx) / h, exact = fn.d(x), err = q - exact;
      const cen = fn.pos && x - h <= 0 ? NaN : (fn.f(x + h) - fn.f(x - h)) / (2 * h);
      const w = Math.max(2, Math.abs(h) * 1.6);
      let lo = x - w, hi = x + w;
      if (fn.pos) lo = Math.max(lo, Math.min(x, x + h) / 4);
      const pts = Array.from({ length: 241 }, (_, i) => { const v = lo + (hi - lo) * i / 240; return [v, fn.f(v)]; });
      const ys = pts.map(p => p[1]).filter(Number.isFinite);
      const yLo = Math.min(...ys), yHi = Math.max(...ys), pad = (yHi - yLo) * 0.12 || 1;
      // Reta de inclinação m pelo ponto (x0, y0), em vários pontos para ser
      // cortada direito onde sai da faixa do eixo y.
      const line = (m, x0, y0) => Array.from({ length: 81 }, (_, j) => { const v = lo + (hi - lo) * j / 80; return [v, y0 + m * (v - x0)]; });
      const ftex = fn.tex;
      const at = v => ftex.replace(/x/g, `{${texNum(v, 6)}}`);
      return {
        result: `\\dfrac{f(x + h) - f(x)}{h} ${approx(q, 6)} ${tone(texNum(q, 6), 1)}, \\qquad f'(${texNum(x)}) ${approx(exact, 6)} ${texNum(exact, 6)}`,
        chart: {
          type: "curve", label: T(`Curva de f, a secante entre x = ${fmt(x)} e x + h = ${fmt(x + h)} e a tangente em x`, `Curve of f, the secant between x = ${fmt(x)} and x + h = ${fmt(x + h)}, and the tangent at x`),
          xLabel: T("x · escura: secante · tracejada: tangente", "x · dark: secant · dashed: tangent"),
          xMin: lo, xMax: hi, yMin: yLo - pad, yMax: yHi + pad, pts,
          lines: [{ pts: line(q, x, fx), cls: "chart-fit" }, { pts: line(exact, x, fx), cls: "chart-tangent" }],
          tipAt: v => [`f = ${fmt(fn.f(v), 4)}`, `x = ${fmt(v, 2)}`],
        },
        steps: [
          [T("Calcule a função no ponto e um passo h adiante:", "Evaluate the function at the point and one step h ahead:"),
            `f(${texNum(x)}) = ${at(x)} ${approx(fx, 6)} ${texNum(fx, 6)}, \\qquad f(${texNum(x + h, 6)}) = ${at(x + h)} ${approx(fxh, 6)} ${tone(texNum(fxh, 6), 3)}`],
          [T("Divida a variação de f pela variação de x: é a inclinação da secante.", "Divide the change in f by the change in x: this is the slope of the secant."),
            `\\dfrac{${tone(texNum(fxh, 6), 3)} - ${paren(fx, texNum(fx, 6))}}{${tone(texNum(h, 6), 4)}} ${approx(q, 6)} ${tone(texNum(q, 6), 1)}`],
          [T("Compare com a derivada exata, o limite com h indo a zero:", "Compare with the exact derivative, the limit as h goes to zero:"),
            `f'(${texNum(x)}) ${approx(exact, 6)} ${texNum(exact, 6)}, \\qquad \\text{${T("erro", "error")}} ${approx(err, 6)} ${texSci(err, 4)}`],
        ],
        note: T(`Diminua h e veja a secante girar até coincidir com a tangente: o erro cai mais ou menos na proporção de h.`
          + (Number.isFinite(cen) ? ` A diferença central, [f(x + h) − f(x − h)] / (2h) ≈ ${fmt(cen, 6)}, erra bem menos, na proporção de h².` : "")
          + ` Com h = 0 a conta vira 0/0, a mesma indeterminação que a <a href="${PAGE("regra-lhopital")}">regra de L'Hôpital</a> resolve. Cuidado com h pequeno demais, como 10⁻¹²: o arredondamento do computador passa a dominar.`,
          `Shrink h and watch the secant swing round until it matches the tangent: the error falls roughly in proportion to h.`
          + (Number.isFinite(cen) ? ` The central difference, [f(x + h) − f(x − h)] / (2h) ≈ ${fmt(cen, 6)}, errs much less, in proportion to h².` : "")
          + ` With h = 0 the calculation becomes 0/0, the same indeterminate form <a href="${PAGE("regra-lhopital")}">L'Hôpital's rule</a> resolves. Beware of h too small, like 10⁻¹²: the computer's rounding starts to dominate.`),
      };
    },

    newton({ a, b, c, x0, k }) {
      if (a === 0 && b === 0) return { error: T("Com a = b = 0 não há equação para resolver.", "With a = b = 0 there is no equation to solve.") };
      if (!Number.isInteger(k) || k < 1 || k > 50) return { error: T("O número de iterações precisa ser um inteiro entre 1 e 50.", "The number of iterations must be an integer between 1 and 50.") };
      const f = v => a * v * v + b * v + c, d = v => 2 * a * v + b;
      const it = [];
      let xn = x0, stop = "";
      for (let j = 0; j < k; j++) {
        const fv = f(xn), dv = d(xn);
        if (dv === 0) { stop = "zero"; break; }
        const nx = xn - fv / dv;
        it.push({ j, xn, fv, dv, nx });
        if (!Number.isFinite(nx) || Math.abs(nx) > 1e12) { stop = "diverge"; break; }
        if (Math.abs(nx - xn) < 1e-14 * Math.max(1, Math.abs(nx))) { xn = nx; stop = "ok"; break; }
        xn = nx;
      }
      const disc = b * b - 4 * a * c;
      const roots = a === 0 ? [-c / b] : disc >= 0 ? [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)] : [];
      const show = it.slice(0, 6);
      const xsAll = [x0, ...show.map(r => r.nx), ...roots].filter(v => Math.abs(v) < 1e6);
      const lo0 = Math.min(...xsAll), hi0 = Math.max(...xsAll), sp = (hi0 - lo0) || 2;
      const lo = lo0 - sp * 0.25, hi = hi0 + sp * 0.25;
      const pts = Array.from({ length: 241 }, (_, i) => { const v = lo + (hi - lo) * i / 240; return [v, f(v)]; });
      const ys = pts.map(p => p[1]).concat(0);
      const yLo = Math.min(...ys), yHi = Math.max(...ys), pad = (yHi - yLo) * 0.1 || 1;
      const seg = (p, q) => Array.from({ length: 41 }, (_, j) => [p[0] + (q[0] - p[0]) * j / 40, p[1] + (q[1] - p[1]) * j / 40]);
      const lines = show.flatMap(r => [{ pts: seg([r.xn, r.fv], [r.nx, 0]), cls: "chart-fit" }, { pts: seg([r.nx, 0], [r.nx, f(r.nx)]), cls: "chart-tangent" }]);
      const rows = it.slice(0, 12).map(r => `${r.j} & ${texNum(r.xn, 10)} & ${texSci(r.fv, 3)} & ${texNum(r.dv, 6)} & ${texNum(r.nx, 10)}`).join(" \\\\ ");
      const table = `\\begin{array}{c|c|c|c|c} n & x_n & f(x_n) & f'(x_n) & x_{n+1} \\\\ \\hline ${rows}${it.length > 12 ? " \\\\ \\vdots & & & & " : ""} \\end{array}`;
      const last = it.length ? it[it.length - 1].nx : x0;
      // ax² + bx + c sem coeficiente 1 escrito e sem os termos zerados.
      const ftx = [[a, "x^2"], [b, "x"], [c, ""]].filter(([v]) => v !== 0).map(([v, x], j) => {
        const mag = Math.abs(v) === 1 && x ? "" : texNum(Math.abs(v));
        return `${j ? (v < 0 ? " - " : " + ") : (v < 0 ? "-" : "")}${mag}${x}`;
      }).join("");
      const near = roots.length ? roots.reduce((p, q) => (Math.abs(q - last) < Math.abs(p - last) ? q : p)) : NaN;
      const qs = `a=${a}&amp;b=${b}&amp;c=${c}`;
      return {
        result: stop === "zero" && !it.length ? `f'(x_0) = 0` : `x_{${it.length}} ${approx(last, 10)} ${tone(texNum(last, 10), 1)}`,
        chart: {
          type: "curve", height: 280, label: T("Curva de f e as tangentes de cada iteração até o eixo x", "Curve of f and the tangent of each iteration down to the x axis"),
          xLabel: T("x · escuras: tangentes de cada iteração · tracejada: subida até a curva", "x · dark: each iteration's tangent · dashed: back up to the curve"),
          xMin: lo, xMax: hi, yMin: yLo - pad, yMax: yHi + pad, pts, lines, hlines: [{ y: 0, cls: "chart-ref" }],
          tipAt: v => [`f = ${fmt(f(v), 4)}`, `x = ${fmt(v, 3)}`],
        },
        steps: [
          [T("Para f(x) = ax² + bx + c, a derivada é f'(x) = 2ax + b. Cada passo segue a tangente até o eixo x:", "For f(x) = ax² + bx + c, the derivative is f'(x) = 2ax + b. Each step follows the tangent down to the x axis:"),
            `f(x) = ${ftx}, \\qquad x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}`],
          ...(it.length ? [[T("Itere a partir do chute inicial:", "Iterate from the initial guess:"), table]] : []),
        ],
        note: (stop === "zero"
          ? T(`${warn} a derivada zerou em x = ${fmt(xn)}: a tangente é horizontal e não cruza o eixo x. Tente outro chute inicial.`, `${warn} the derivative hit zero at x = ${fmt(xn)}: the tangent is horizontal and never crosses the x axis. Try another initial guess.`)
          : stop === "diverge"
            ? T(`${warn} as iterações escaparam para muito longe. Tente um chute mais perto da raiz.`, `${warn} the iterations ran off very far. Try a guess closer to the root.`)
            : !roots.length
              ? T(`${warn} esta equação não tem raiz real (discriminante ${fmt(disc)} < 0), e as iterações ficam vagando sem convergir.`, `${warn} this equation has no real root (discriminant ${fmt(disc)} < 0), and the iterations wander without converging.`)
              : T(`A raiz exata mais próxima é ${fmt(near, 12)}; o erro final é ${fmtSci(Math.abs(last - near), 2)}. Perto da raiz, o número de casas certas mais ou menos dobra a cada passo.`,
                `The nearest exact root is ${fmt(near, 12)}; the final error is ${fmtSci(Math.abs(last - near), 2)}. Near the root, the number of correct digits roughly doubles each step.`))
          + T(` Para conferir, veja a <a href="${PAGE("formula-quadratica")}?${qs}">fórmula quadrática com estes coeficientes</a>. Newton vale para qualquer função derivável, não só para polinômios de grau 2 — é assim que calculadoras e programas acham raízes.`,
            ` To check, see the <a href="${PAGE("formula-quadratica")}?${qs}">quadratic formula with these coefficients</a>. Newton works for any differentiable function, not just degree-2 polynomials — it is how calculators and software find roots.`),
      };
    },

    gauss({ a, L, n }) {
      if (a <= 0) return { error: T("a precisa ser maior que zero; com a ≤ 0, a área é infinita.", "a must be greater than zero; with a ≤ 0, the area is infinite.") };
      if (L <= 0 || L > 50) return { error: T("O limite L precisa estar entre 0 e 50.", "The limit L must be between 0 and 50.") };
      if (!Number.isInteger(n) || n < 1 || n > 500) return { error: T("O número de retângulos precisa ser um inteiro entre 1 e 500.", "The number of rectangles must be an integer between 1 and 500.") };
      const g = v => Math.exp(-a * v * v);
      const dx = 2 * L / n;
      let S = 0;
      const bins = [];
      for (let i = 0; i < n; i++) { const m = -L + (i + 0.5) * dx, y = g(m); S += y * dx; bins.push({ x0: -L + i * dx, x1: -L + (i + 1) * dx, y, count: 0, i }); }
      const full = Math.sqrt(Math.PI / a), finite = full * (2 * phi(L * Math.sqrt(2 * a)) - 1);
      const R = Math.max(L, 3 / Math.sqrt(a));
      const pts = Array.from({ length: 241 }, (_, i) => { const v = -R + 2 * R * i / 240; return [v, g(v)]; });
      const sigma = 1 / Math.sqrt(2 * a);
      // Com a = 1, e^{-x^2} e √π, sem o “1” escrito.
      const A = a === 1 ? "" : texNum(a), PI = a === 1 ? "\\sqrt{\\pi}" : `\\sqrt{\\pi / ${texNum(a)}}`;
      return {
        result: `\\int_{-${texNum(L)}}^{${texNum(L)}} e^{-${A}x^2}\\,dx \\approx ${tone(texNum(S, 6), 1)}, \\qquad ${PI} ${approx(full, 6)} ${texNum(full, 6)}`,
        chart: {
          type: "hist", label: T(`${n} retângulos sob e^(−${fmt(a)}x²) entre −${fmt(L)} e ${fmt(L)}`, `${n} rectangles under e^(−${fmt(a)}x²) between −${fmt(L)} and ${fmt(L)}`),
          xLabel: "x", xMin: -R, xMax: R, yMax: 1, bins, pts,
          binTip: q => [fmt(q.y * dx, 6), T(`retângulo ${q.i + 1}: altura ${fmt(q.y, 4)}`, `rectangle ${q.i + 1}: height ${fmt(q.y, 4)}`)],
        },
        steps: [
          [T("Não há primitiva elementar de e^(−ax²); some retângulos pelo ponto médio:", "e^(−ax²) has no elementary antiderivative; add up rectangles at the midpoint:"),
            `\\Delta x = \\dfrac{2 \\cdot ${texNum(L)}}{${n}} ${approx(dx, 6)} ${tone(texNum(dx, 6), 4)}, \\qquad \\textstyle\\sum e^{-${A}\\,x_i^2} \\cdot \\Delta x ${approx(S, 6)} ${tone(texNum(S, 6), 1)}`],
          [T("Fora de [−L, L] a curva quase some: a área exata nesse trecho é", "Outside [−L, L] the curve almost vanishes: the exact area over that stretch is"),
            `\\int_{-${texNum(L)}}^{${texNum(L)}} e^{-${A}x^2}\\,dx ${approx(finite, 6)} ${texNum(finite, 6)}`],
          [T("E a área na reta inteira, pelo truque de Gauss (elevar ao quadrado e passar a coordenadas polares):", "And the area over the whole line, by Gauss's trick (square it and switch to polar coordinates):"),
            `\\int_{-\\infty}^{\\infty} e^{-${A}x^2}\\,dx = ${tone(PI, 2)} ${approx(full, 6)} ${texNum(full, 6)}`],
        ],
        note: T(`A soma erra a área entre −${fmt(L)} e ${fmt(L)} por ${fmtSci(S - finite, 2)}, e a cauda além de ±${fmt(L)} vale ${fmtSci(full - finite, 2)}.`
          + ` Com a = 1/(2σ²) — aqui, σ ≈ ${fmt(sigma, 4)} —, a área √(π/a) vira σ√(2π): é exatamente o número que divide a densidade da <a href="${PAGE("distribuicao-normal")}">distribuição normal</a>, para a área total sob ela dar 1.`
          + ` Para ver a mesma soma com outras funções, use a <a href="${PAGE("soma-riemann")}">soma de Riemann</a>.`,
          `The sum misses the area between −${fmt(L)} and ${fmt(L)} by ${fmtSci(S - finite, 2)}, and the tail beyond ±${fmt(L)} is worth ${fmtSci(full - finite, 2)}.`
          + ` With a = 1/(2σ²) — here, σ ≈ ${fmt(sigma, 4)} — the area √(π/a) becomes σ√(2π): exactly the number that divides the density of the <a href="${PAGE("distribuicao-normal")}">normal distribution</a>, so that the total area under it is 1.`
          + ` To see the same sum with other functions, use the <a href="${PAGE("soma-riemann")}">Riemann sum</a>.`),
      };
    },

    monty({ d, n, seed }) {
      if (!Number.isInteger(d) || d < 3 || d > 100) return { error: T("O número de portas precisa ser um inteiro entre 3 e 100.", "The number of doors must be an integer between 3 and 100.") };
      if (!Number.isInteger(n) || n < 1 || n > 100000) return { error: T("O número de jogos precisa ser um inteiro entre 1 e 100.000.", "The number of games must be an integer between 1 and 100,000.") };
      if (!Number.isInteger(seed) || seed < 0) return { error: T("A semente precisa ser um inteiro não negativo.", "The seed must be a non-negative integer.") };
      const fica = 1 / d, troca = 1 - fica;
      const rand = rng(seed);
      const keep = new Set(Array.from({ length: 400 }, (_, i) => Math.max(1, Math.round(n ** (i / 399)))));
      const pFica = [], pTroca = [];
      let wf = 0;
      for (let k = 1; k <= n; k++) {
        // O apresentador abre todas as outras portas vazias menos uma: quem
        // fica ganha só se acertou de primeira; quem troca ganha nos outros casos.
        const carro = Math.floor(rand() * d), escolha = Math.floor(rand() * d);
        if (carro === escolha) wf++;
        if (keep.has(k)) { pFica.push([k, wf / k]); pTroca.push([k, 1 - wf / k]); }
      }
      const sf = wf / n, st = 1 - sf;
      const F = tone(texNum(fica, 4), 3), Tr = tone(texNum(troca, 4), 1);
      const abre = d - 2;
      return {
        result: `P(\\text{${T("ganhar trocando", "win by switching")}}) = 1 - \\dfrac{1}{${tone(d, 2)}} ${approx(troca, 4)} ${tone(pctTex(troca), 1)}`,
        chart: {
          type: "curve", label: T(`Fração de vitórias ao longo de ${fmt(n)} jogos com ${d} portas, para quem troca e para quem fica`, `Share of wins over ${fmt(n)} games with ${d} doors, for switching and for staying`),
          xLabel: T(`jogos, em escala logarítmica · colorida: troca · escura: fica · tracejadas: ${fmt(troca * 100, 1)}% e ${fmt(fica * 100, 1)}%`, `games, on a log scale · colored: switch · dark: stay · dashed: ${fmt(troca * 100, 1)}% and ${fmt(fica * 100, 1)}%`),
          xMin: 1, xMax: Math.max(n, 2), logX: true, yMin: 0, yMax: 1, pts: pTroca,
          lines: [{ pts: pFica, cls: "chart-fit" }], hlines: [{ y: troca, cls: "chart-ref" }, { y: fica, cls: "chart-ref" }],
          tipAt: v => { let j = 0; for (let i = 0; i < pTroca.length; i++) if (Math.abs(pTroca[i][0] - v) < Math.abs(pTroca[j][0] - v)) j = i; return [`${fmt(pTroca[j][1] * 100, 1)}% × ${fmt(pFica[j][1] * 100, 1)}%`, T(`troca × fica, após ${fmt(pTroca[j][0])} jogos`, `switch × stay, after ${fmt(pTroca[j][0])} games`)]; },
        },
        steps: [
          [T(`Sua primeira escolha acerta o carro com chance 1 em ${d}, e nada do que o apresentador faz depois muda isso:`, `Your first pick finds the car with a 1 in ${d} chance, and nothing the host does afterwards changes that:`),
            `P(\\text{${T("ganhar ficando", "win by staying")}}) = \\dfrac{1}{${d}} ${approx(fica, 4)} ${F}`],
          [T(`O apresentador, que sabe onde está o carro, abre ${abre} ${abre === 1 ? "porta vazia" : "portas vazias"} entre as outras. Se você errou de primeira, a porta que sobra fechada é o carro:`,
            `The host, who knows where the car is, opens ${abre} empty door${abre === 1 ? "" : "s"} among the others. If your first pick was wrong, the door left closed is the car:`),
            `P(\\text{${T("ganhar trocando", "win by switching")}}) = P(\\text{${T("errar de primeira", "first pick wrong")}}) = 1 - \\dfrac{1}{${d}} ${approx(troca, 4)} ${Tr}`],
          [T(`A simulação jogou ${fmt(n)} vezes:`, `The simulation played ${fmt(n)} times:`),
            `\\text{${T("ficando", "staying")}}: ${texNum(sf * 100, 2)}\\%, \\qquad \\text{${T("trocando", "switching")}}: ${texNum(st * 100, 2)}\\%`],
        ],
        note: T(`Trocar ganha ${fmt(troca * 100, 1)}% das vezes, ${fmt(troca / fica, 2)} vezes mais que ficar. A intuição de “agora é 50%” falha porque o apresentador não abre portas ao acaso: ele evita o carro, e isso concentra na porta que sobra toda a chance das que ele abriu.`
          + " Se ele abrisse uma porta qualquer e por sorte ela estivesse vazia, aí sim trocar e ficar empatariam."
          + ` É uma conta de probabilidade condicional, que o <a href="${PAGE("teorema-bayes")}">teorema de Bayes</a> faz formalmente. Com mais portas a vantagem fica gritante: experimente 100.`,
          `Switching wins ${fmt(troca * 100, 1)}% of the time, ${fmt(troca / fica, 2)} times as often as staying. The “it's 50-50 now” intuition fails because the host doesn't open doors at random: he avoids the car, which concentrates on the remaining door all the chance of the ones he opened.`
          + " If he opened any door and it just happened to be empty, then switching and staying would be even."
          + ` It is a conditional probability calculation, which <a href="${PAGE("teorema-bayes")}">Bayes' theorem</a> does formally. With more doors the advantage becomes glaring: try 100.`),
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

  // Dispersão editável. Durante o arraste a figura não é refeita (isso
  // soltaria o ponteiro): aqui mesmo se move o ponto e se recalcula a reta,
  // com a escala parada. Cada passo vai para os campos por "chart-edit"; ao
  // soltar, o desenho é refeito inteiro, já com a escala dos dados novos.
  let clipId = 0;
  function scatter(box, root, spec, g) {
    const { W, H, m, iw, ih, X, Y, xMin, xMax, yMin, yMax } = g;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    // Arredonda a um décimo da marca do eixo, para os campos não receberem
    // quinze casas decimais a cada pixel.
    const grain = s => { const d = Math.max(0, -Math.floor(Math.log10(s))); return v => Number((Math.round(v / s) * s).toFixed(d)); };
    const dx = niceStep(xMax - xMin, 6) / 10, dy = niceStep(yMax - yMin, 4) / 10;
    const sx = grain(dx), sy = grain(dy);
    const at = e => {
      const r = root.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width * W, cy = (e.clientY - r.top) / r.height * H;
      return [sx(clamp(xMin + (cx - m.l) / iw * (xMax - xMin), xMin, xMax)),
        sy(clamp(yMin + (m.t + ih - cy) / ih * (yMax - yMin), yMin, yMax))];
    };
    const coord = ([a, b]) => `(${fmt(a)}${T(";", ",")} ${fmt(b)})`;

    const pts = spec.dots.map(p => p.slice());
    const id = `chart-clip-${++clipId}`;
    svg("rect", { x: m.l, y: m.t, width: iw, height: ih }, svg("clipPath", { id }, root));
    const bg = svg("rect", { x: m.l, y: m.t, width: iw, height: ih, class: "chart-hit chart-add" }, root);
    const lay = svg("g", { "clip-path": `url(#${id})` }, root);
    const res = pts.map(() => svg("line", { class: "chart-ref" }, lay));
    const fit = svg("path", { class: "chart-fit" }, lay);
    const pred = spec.pred && svg("circle", { r: 5, class: "chart-pred" }, lay);
    const dots = pts.map(() => svg("circle", { r: 6, class: "chart-pt" }, root));
    const hits = pts.map(() => svg("circle", { r: 16, class: "chart-hit chart-grab", tabindex: "0", role: "button" }, root));

    function draw() {
      const n = pts.length;
      const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
      const sxx = pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
      const b1 = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / sxx, b0 = my - b1 * mx;
      const ok = sxx > 0;
      const yh = v => b0 + b1 * v;
      fit.setAttribute("d", ok ? `M${X(xMin)},${Y(yh(xMin))}L${X(xMax)},${Y(yh(xMax))}` : "");
      pts.forEach((p, i) => {
        const a = { x1: X(p[0]), x2: X(p[0]), y1: Y(p[1]), y2: ok ? Y(yh(p[0])) : Y(p[1]) };
        for (const k in a) res[i].setAttribute(k, a[k]);
        for (const c of [dots[i], hits[i]]) { c.setAttribute("cx", X(p[0])); c.setAttribute("cy", Y(p[1])); }
        hits[i].setAttribute("aria-label", T(`Ponto ${i + 1} de ${n}: ${coord(p)}`, `Point ${i + 1} of ${n}: ${coord(p)}`));
      });
      if (pred) {
        pred.setAttribute("visibility", ok ? "visible" : "hidden");
        if (ok) { pred.setAttribute("cx", X(spec.pred[0])); pred.setAttribute("cy", Y(yh(spec.pred[0]))); }
      }
    }

    const emit = focus => {
      if (focus != null) box.dataset.focus = focus;
      box.dispatchEvent(new CustomEvent("chart-edit", { bubbles: true, detail: { fields: spec.fields, pts } }));
    };

    hits.forEach((hit, i) => {
      hit.addEventListener("pointerdown", e => {
        e.preventDefault();
        hit.setPointerCapture(e.pointerId);
        box.dataset.drag = "1";
        root.classList.add("is-dragging");
      });
      hit.addEventListener("pointermove", e => {
        if (!box.dataset.drag) { g.showTip(e, coord(pts[i]), T(`ponto ${i + 1}`, `point ${i + 1}`)); return; }
        pts[i] = at(e);
        draw();
        g.showTip(e, coord(pts[i]), T(`ponto ${i + 1}`, `point ${i + 1}`));
        emit();
      });
      const drop = () => {
        if (!box.dataset.drag) return;
        delete box.dataset.drag;
        emit();
      };
      hit.addEventListener("pointerup", drop);
      hit.addEventListener("pointercancel", drop);
      hit.addEventListener("keydown", e => {
        const k = e.shiftKey ? 10 : 1;
        const step = { ArrowLeft: [-dx, 0], ArrowRight: [dx, 0], ArrowUp: [0, dy], ArrowDown: [0, -dy] }[e.key];
        if (step) {
          pts[i] = [sx(pts[i][0] + step[0] * k), sy(pts[i][1] + step[1] * k)];
        } else if ((e.key === "Delete" || e.key === "Backspace") && pts.length > 2) {
          pts.splice(i, 1);
          i = Math.min(i, pts.length - 1);
        } else return;
        e.preventDefault();
        emit(i);
      });
    });
    bg.addEventListener("click", e => {
      pts.push(at(e));
      emit();
    });

    draw();
    const p = document.createElement("p");
    p.className = "chart-hint";
    p.textContent = spec.hint;
    box.appendChild(p);
    if (box.dataset.focus != null) {
      hits[Math.min(Number(box.dataset.focus), hits.length - 1)].focus({ preventScroll: true });
      delete box.dataset.focus;
    }
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
    // Sem yMin, o eixo y começa em 0 e ganha 8% de folga no topo; com yMin,
    // a faixa é exatamente [yMin, yMax].
    const yMin = spec.yMin ?? 0;
    const yMax = spec.yMin == null ? spec.yMax * 1.08 || 1 : spec.yMax;
    // Com logX (só para xMin > 0), o eixo x é logarítmico: potências de 10
    // ficam igualmente espaçadas.
    const X = spec.logX
      ? v => m.l + Math.log(v / xMin) / Math.log(xMax / xMin) * iw
      : v => m.l + (v - xMin) / (xMax - xMin) * iw;
    const xAt = f => (spec.logX ? xMin * (xMax / xMin) ** f : xMin + f * (xMax - xMin));
    const Y = v => m.t + ih - (v - yMin) / (yMax - yMin) * ih;

    // Grade e eixo y: linhas finas, recessivas.
    const ys = niceStep(yMax - yMin, 4);
    for (let v = Math.ceil(yMin / ys - 1e-9) * ys; !["intervals", "box"].includes(spec.type) && v <= yMax + 1e-12; v += ys) {
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
      const ticks = [];
      if (spec.logX) {
        for (let v = 10 ** Math.ceil(Math.log10(xMin) - 1e-9); v <= xMax * (1 + 1e-9); v *= 10) ticks.push(v);
      } else {
        const xs = niceStep(xMax - xMin, 6);
        for (let v = Math.ceil(xMin / xs) * xs; v <= xMax + 1e-9; v += xs) ticks.push(v);
      }
      ticks.forEach(v => {
        svg("text", { x: X(v), y: H - m.b + 16, class: "chart-label", "text-anchor": "middle" }, root).textContent = fmt(v, 2);
      });
      svg("text", { x: m.l + iw / 2, y: H - 2, class: "chart-label", "text-anchor": "middle" }, root).textContent = spec.xLabel;

      // Um segmento por intervalo, empilhados; os que erram o valor real
      // ganham a cor de destaque, e a linha vertical marca esse valor.
      if (spec.type === "intervals") {
        const rh = ih / spec.rows.length;
        if (spec.truth != null) svg("line", { x1: X(spec.truth), x2: X(spec.truth), y1: m.t, y2: m.t + ih, class: "chart-truth" }, root);
        spec.rows.forEach((r, i) => {
          const y = m.t + (i + 0.5) * rh;
          svg("line", { x1: X(r.lo), x2: X(r.hi), y1: y, y2: y, class: r.hit ? "chart-seg" : "chart-seg is-miss" }, root);
          // Com a e b, as pontas viram pontos: cheio para a, vazado para b.
          if (r.a != null) {
            svg("circle", { cx: X(r.a), cy: y, r: 5, class: "chart-dot" }, root);
            svg("circle", { cx: X(r.b), cy: y, r: 5, class: "chart-dot-b" }, root);
          }
          const hit = svg("rect", { x: m.l, y: y - rh / 2, width: iw, height: rh, class: "chart-hit" }, root);
          const t = spec.tip(r, i);
          hit.addEventListener("pointermove", e => showTip(e, t[0], t[1]));
        });
      }
      // Boxplot horizontal: caixa de Q1 a Q3, traço na mediana, bigodes até
      // o último valor dentro de 1,5 · IQR e os atípicos como pontos.
      // Com boxes (vários grupos), um boxplot por faixa, de cima para baixo,
      // e truth vira uma linha vertical de referência.
      if (spec.type === "box") {
        const boxes = spec.boxes || [spec.box];
        const rh = ih / boxes.length;
        if (spec.truth != null) svg("line", { x1: X(spec.truth), x2: X(spec.truth), y1: m.t, y2: m.t + ih, class: "chart-ref" }, root);
        boxes.forEach((bx, i) => {
          const { q1, q2, q3, wLo, wHi, out } = bx;
          const cy = m.t + (i + 0.5) * rh, bh = Math.min(56, rh * 0.6);
          svg("line", { x1: X(wLo), x2: X(q1), y1: cy, y2: cy, class: "chart-whisker" }, root);
          svg("line", { x1: X(q3), x2: X(wHi), y1: cy, y2: cy, class: "chart-whisker" }, root);
          [wLo, wHi].forEach(v => svg("line", { x1: X(v), x2: X(v), y1: cy - bh / 4, y2: cy + bh / 4, class: "chart-whisker" }, root));
          svg("rect", { x: X(q1), y: cy - bh / 2, width: Math.max(1, X(q3) - X(q1)), height: bh, rx: 3, class: "chart-box" }, root);
          svg("line", { x1: X(q2), x2: X(q2), y1: cy - bh / 2, y2: cy + bh / 2, class: "chart-truth" }, root);
          out.forEach(v => svg("circle", { cx: X(v), cy, r: 4, class: "chart-dot" }, root));
          const t = spec.tip || [bx.label, T(`Q₁ = ${fmt(q1)}, mediana = ${fmt(q2)}, Q₃ = ${fmt(q3)}`, `Q₁ = ${fmt(q1)}, median = ${fmt(q2)}, Q₃ = ${fmt(q3)}`)];
          const hit = svg("rect", { x: m.l, y: cy - rh / 2, width: iw, height: rh, class: "chart-hit" }, root);
          hit.addEventListener("pointermove", e => showTip(e, t[0], t[1]));
        });
      }
      if (spec.type === "hist") {
        spec.bins.forEach(b => {
          const x0 = X(b.x0) + 1, w = Math.max(1, X(b.x1) - X(b.x0) - 2);
          const h = Math.max(0, Y(0) - Y(b.y));
          if (h > 0) svg("path", { d: barPath(x0, Y(b.y), w, h), class: b.miss ? "chart-hi" : "chart-base" }, root);
          const hit = svg("rect", { x: X(b.x0), y: m.t, width: X(b.x1) - X(b.x0), height: ih, class: "chart-hit" }, root);
          const t = spec.binTip ? spec.binTip(b)
            : [T(`${fmt(b.count)} médias`, `${fmt(b.count)} means`), T(`entre ${fmt(b.x0, 2)} e ${fmt(b.x1, 2)}`, `between ${fmt(b.x0, 2)} and ${fmt(b.x1, 2)}`)];
          hit.addEventListener("pointermove", e => showTip(e, t[0], t[1]));
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
      if (line) svg("path", { d: line, class: spec.lineCls || "chart-line" }, root);
      // Linhas extras (como o polinômio de Taylor), interrompidas onde saem
      // da faixa do eixo y em vez de riscar o gráfico.
      (spec.lines || []).forEach(l => {
        let d = "", pen = false;
        l.pts.forEach(([x, y]) => {
          if (!Number.isFinite(y) || y < yMin || y > yMax) { pen = false; return; }
          d += `${pen ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`;
          pen = true;
        });
        if (d) svg("path", { d, class: l.cls }, root);
      });
      // Linhas horizontais de referência; a legenda delas vai no xLabel.
      (spec.hlines || []).forEach(h => {
        svg("line", { x1: m.l, x2: W - m.r, y1: Y(h.y), y2: Y(h.y), class: h.cls }, root);
      });
      if (spec.marker) {
        const [mx, my] = spec.marker;
        svg("line", { x1: X(mx), x2: X(mx), y1: Y(0), y2: Y(my), class: "chart-rule" }, root);
        svg("circle", { cx: X(mx), cy: Y(my), r: 5, class: "chart-dot" }, root);
      }
      if (spec.type === "scatter") scatter(box, root, spec, { W, H, m, iw, ih, X, Y, xMin, xMax, yMin, yMax, showTip, hideTip });
      if (spec.tipAt) {
        const hit = svg("rect", { x: m.l, y: m.t, width: iw, height: ih, class: "chart-hit" }, root);
        hit.addEventListener("pointermove", e => {
          const r = root.getBoundingClientRect();
          const x = xAt(((e.clientX - r.left) / r.width * W - m.l) / iw);
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
    const inputs = Array.from(section.querySelectorAll("input[name], select[name]"));
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
    // Campo com data-matrix vira uma tabela: linhas separadas por ponto e
    // vírgula (ou quebra de linha), valores por espaço (e, em inglês, vírgula).
    // Campo com data-list vira um array, separado por espaço ou ponto e vírgula
    // (e, em inglês, também por vírgula). Com data-optional, pode ficar vazio:
    // a lista vira [], o número vira null.
    const read = i => {
      if (i.tagName === "SELECT") return i.value;
      if ("matrix" in i.dataset) {
        const rows = i.value.split(/[;\n]+/).map(r => r.trim()).filter(Boolean)
          .map(r => r.split(EN ? /[\s,]+/ : /\s+/).filter(Boolean).map(parse));
        return !rows.length || rows.some(r => r.some(Number.isNaN)) ? NaN : rows;
      }
      if (!("list" in i.dataset)) return "optional" in i.dataset && i.value.trim() === "" ? null : parse(i.value);
      const xs = i.value.split(EN ? /[\s;,]+/ : /[\s;]+/).filter(Boolean).map(parse);
      return xs.some(Number.isNaN) || (!xs.length && !("optional" in i.dataset)) ? NaN : xs;
    };

    const params = new URLSearchParams(location.search);
    inputs.forEach(i => { if (params.has(i.name)) i.value = params.get(i.name); });

    // Campo com data-mostra="campo:valor1,valor2" só aparece quando o outro
    // campo tem um desses valores (como as opções de cada desenho amostral).
    const condicionais = Array.from(section.querySelectorAll("[data-mostra]"));
    function update() {
      condicionais.forEach(el => {
        const [nome, vals] = el.dataset.mostra.split(":");
        const alvo = inputs.find(i => i.name === nome);
        el.hidden = !!alvo && !vals.split(",").includes(alvo.value);
      });
      const v = Object.fromEntries(inputs.map(i => [i.name, read(i)]));
      inputs.forEach(i => i.setAttribute("aria-invalid", String(Number.isNaN(v[i.name]))));
      const out = Object.values(v).some(Number.isNaN)
        ? { error: T("Preencha todos os campos com números.", "Fill in every field with a number.") }
        : calc(v);

      section.classList.toggle("has-error", !!out.error);
      steps.replaceChildren();
      // Um gráfico ou uma lista deles, cada um no seu painel.
      // Com um ponto sendo arrastado, quem desenha é o próprio gráfico.
      if (chart && !chart.dataset.drag) {
        const specs = out.error ? [] : [].concat(out.chart || []);
        if (specs.length === 1) renderChart(chart, specs[0]);
        else {
          chart.replaceChildren();
          specs.forEach(spec => {
            const panel = document.createElement("div");
            panel.className = "calc-chart-panel";
            chart.appendChild(panel);
            renderChart(panel, spec);
          });
        }
      }
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

    // Botões que mexem num campo: data-add="campo:passo" soma ao valor,
    // data-reseed="campo" sorteia um inteiro novo, data-play="campo" soma
    // sozinho até data-max. Os valores vão sem separador de milhar, que o
    // parse em português leria como decimal.
    const field = name => inputs.find(i => i.name === name);
    const set = (i, v) => { i.value = String(v); section.dispatchEvent(new Event("input")); };
    // Gráfico editável: os pontos voltam para os campos, sem separador de
    // milhar e com o decimal do idioma.
    section.addEventListener("chart-edit", e => {
      const { fields: [fx, fy], pts } = e.detail;
      const num = v => String(v).replace(".", DEC);
      field(fx).value = pts.map(p => num(p[0])).join(" ");
      field(fy).value = pts.map(p => num(p[1])).join(" ");
      section.dispatchEvent(new Event("input"));
    });
    let timer = null;
    const stop = btn => {
      clearInterval(timer);
      timer = null;
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = btn.dataset.labelPlay;
    };
    section.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", () => {
      const [name, by] = btn.dataset.add.split(":");
      const i = field(name), v = read(i), max = Number(i.dataset.max) || Infinity;
      set(i, Math.min(max, (Number.isFinite(v) ? Math.round(v) : 0) + Number(by)));
    }));
    section.querySelectorAll("[data-reseed]").forEach(btn => btn.addEventListener("click", () => {
      set(field(btn.dataset.reseed), Math.floor(Math.random() * 1e6));
    }));
    section.querySelectorAll("[data-play]").forEach(btn => {
      btn.dataset.labelPlay = btn.textContent;
      btn.addEventListener("click", () => {
        if (timer) { stop(btn); return; }
        const i = field(btn.dataset.play), max = Number(i.dataset.max) || Infinity;
        btn.setAttribute("aria-pressed", "true");
        btn.textContent = btn.dataset.labelPause;
        // Começa de uma em uma e acelera, para dar tempo de ver as primeiras.
        timer = setInterval(() => {
          const v = Number.isFinite(read(i)) ? Math.round(read(i)) : 0;
          if (v >= max) { stop(btn); return; }
          set(i, Math.min(max, v + Math.max(1, Math.floor(v / 20))));
        }, 150);
      });
    });
    update();
  }

  document.querySelectorAll(".calc[data-calc]").forEach(initCalc);
  // Exemplos resolvidos fixos, escritos direto no HTML (L'Hôpital).
  document.querySelectorAll(".worked [data-tex]").forEach(el => math(el, "\\displaystyle " + el.dataset.tex));

  if (document.querySelector(".formula-wrap")) initFormula();
  else if (document.getElementById("filtro")) initIndex();
})();
