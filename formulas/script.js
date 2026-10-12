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
    "kruskal-wallis": "kruskal-wallis-test", "assimetria-curtose": "skewness-kurtosis",
    "anova-um-fator": "one-way-anova", "mann-whitney": "mann-whitney-test", "funcao-logistica": "logistic-function", "paradoxo-simpson": "simpsons-paradox",
    "numero-e": "number-e-limit", "soma-pa": "arithmetic-series", "tempo-duplicacao": "doubling-time",
    "equacao-reta": "line-through-two-points",
    "matriz-inversa-2x2": "inverse-2x2-matrix", "covariancia": "covariance", "entropia-shannon": "shannon-entropy", "logaritmo-mudanca-base": "logarithm-change-of-base",
    "neyman-allocation": "neyman-allocation", "juros-aportes": "compound-interest-contributions", "media-geometrica": "geometric-mean",
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
    "quartis-iqr": "quartiles-iqr", "suavizacao-exponencial": "exponential-smoothing",
    "derivada": "derivative-definition", "qui-quadrado": "chi-square-test", "probabilidade-condicional": "conditional-probability",
    "comparacoes-multiplas": "multiple-comparisons",
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
    const count = document.querySelector(".filter-count");
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
      // A faixa ocupa quase a tela: sem a contagem, o filtro parece não fazer nada.
      if (!count) return;
      const n = cards.filter(c => !c.parentElement.hidden).length;
      const en = document.documentElement.lang === "en";
      count.textContent = !terms.length ? ""
        : !n ? (en ? "No formula found." : "Nenhuma fórmula encontrada.")
        : en ? `${n} ${n === 1 ? "formula" : "formulas"} found — Enter opens ${n === 1 ? "it" : "the first"}.`
        : `${n} ${n === 1 ? "fórmula encontrada" : "fórmulas encontradas"} — Enter abre ${n === 1 ? "ela" : "a primeira"}.`;
    });

    // Enter abre a primeira fórmula que sobrou.
    input.addEventListener("keydown", e => {
      if (e.key !== "Enter" || !input.value.trim()) return;
      const first = cards.find(c => !c.parentElement.hidden);
      if (first) location.href = first.href;
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

    mm({ x, k }) {
      const n = x.length;
      if (n < 3) return { error: T("Informe pelo menos três valores da série.", "Enter at least three values of the series.") };
      if (n > 2000) return { error: T("Use no máximo 2.000 valores.", "Use at most 2,000 values.") };
      if (!Number.isInteger(k) || k < 2 || k > n) return { error: T(`A janela k precisa ser um inteiro entre 2 e ${n}.`, `The window k must be an integer between 2 and ${n}.`) };
      const mm = [];
      let s = 0;
      for (let t = 0; t < n; t++) { s += x[t]; if (t >= k) s -= x[t - k]; if (t >= k - 1) mm.push([t + 1, s / k]); }
      const lo = Math.min(...x), hi = Math.max(...x), pad = (hi - lo) * 0.1 || 1;
      const last = mm[mm.length - 1][1];
      const show = n - k + 1 <= 6 ? mm : [mm[0], mm[1], null, mm[mm.length - 1]];
      // Janela longa vira "primeiro + ⋯ + último".
      const soma = t => (k > 6 ? `${texNum(x[t - k])} + \\cdots + ${texNum(x[t - 1])}` : x.slice(t - k, t).map(u => texNum(u)).join(" + "));
      const line = ([t, v]) => `${T("MM", "MA")}_{${t}} = \\dfrac{${soma(t)}}{${tone(k, 2)}} ${approx(v)} ${tone(texNum(v), 1)}`;
      return {
        result: `${T("MM", "MA")}_{${n}} ${approx(last)} ${tone(texNum(last), 1)}`,
        chart: {
          type: "curve", label: T(`Série de ${n} valores e a média móvel de ${k} períodos`, `Series of ${n} values and its ${k}-period moving average`),
          xLabel: T(`período · escura: a série · colorida: média móvel de ${k}`, `period · dark: the series · colored: ${k}-period moving average`),
          xMin: 1, xMax: n, yMin: lo - pad, yMax: hi + pad, pts: mm, lines: [{ pts: x.map((v, i) => [i + 1, v]), cls: "chart-fit" }],
          tipAt: v => { const t = Math.min(n, Math.max(1, Math.round(v))); const m = mm.find(p => p[0] === t); return [m ? fmt(m[1]) : "—", T(`período ${t}: valor ${fmt(x[t - 1])}`, `period ${t}: value ${fmt(x[t - 1])}`)]; },
        },
        steps: [
          [T(`Cada ponto é a média dos ${k} valores mais recentes; a janela anda um período por vez:`, `Each point is the mean of the ${k} most recent values; the window moves one period at a time:`),
            `\\begin{gathered}${show.map(p => (p ? line(p) : "\\vdots")).join(" \\\\ ")}\\end{gathered}`],
        ],
        note: T(`A média móvel apaga as oscilações curtas e deixa a tendência. Janela maior suaviza mais, mas reage mais devagar: a média de ${k} períodos fica atrasada cerca de ${fmt((k - 1) / 2, 1)} período(s) em relação à série.`
          + " Com dados sazonais, uma janela do tamanho do ciclo (12 meses, 4 trimestres, 7 dias) cancela a sazonalidade inteira."
          + ` A última média, ${fmt(last)}, é uma previsão ingênua para o próximo período; a <a href="${PAGE("suavizacao-exponencial")}?x=${encodeURIComponent(x.join(" "))}">suavização exponencial</a> faz isso dando mais peso ao recente.`,
          `The moving average wipes out short swings and leaves the trend. A larger window smooths more but reacts more slowly: a ${k}-period average lags the series by about ${fmt((k - 1) / 2, 1)} period(s).`
          + " With seasonal data, a window the length of the cycle (12 months, 4 quarters, 7 days) cancels the seasonality entirely."
          + ` The last average, ${fmt(last)}, is a naive forecast for the next period; <a href="${PAGE("suavizacao-exponencial")}?x=${encodeURIComponent(x.join(" "))}">exponential smoothing</a> does the same while giving more weight to recent values.`),
      };
    },

    ses({ x, alpha }) {
      const n = x.length;
      if (n < 3) return { error: T("Informe pelo menos três valores da série.", "Enter at least three values of the series.") };
      if (n > 2000) return { error: T("Use no máximo 2.000 valores.", "Use at most 2,000 values.") };
      if (!(alpha > 0 && alpha <= 1)) return { error: T("α precisa estar entre 0 e 1, sem o zero; 0,3 é um ponto de partida comum.", "α must be between 0 and 1, excluding zero; 0.3 is a common starting point.") };
      const run = a => { const S = [x[0]]; let sse = 0; for (let t = 1; t < n; t++) { sse += (x[t] - S[t - 1]) ** 2; S.push(a * x[t] + (1 - a) * S[t - 1]); } return { S, sse }; };
      const { S, sse } = run(alpha);
      let best = 0.01, bestSse = Infinity;
      for (let a = 0.01; a <= 1.0001; a += 0.01) { const r = run(a).sse; if (r < bestSse) { bestSse = r; best = a; } }
      const lo = Math.min(...x), hi = Math.max(...x), pad = (hi - lo) * 0.1 || 1;
      const A = tone(texNum(alpha), 2), A1 = tone(texNum(1 - alpha, 4), 4);
      const ex = [1, 2].filter(t => t < n).map(t => `S_{${t + 1}} = ${A} \\cdot ${tone(texNum(x[t]), 3)} + ${A1} \\cdot ${tone(texNum(S[t - 1]), 5)} ${approx(S[t])} ${texNum(S[t])}`);
      const rmse = Math.sqrt(sse / (n - 1));
      return {
        result: `${T("\\text{previsão}", "\\text{forecast}")} = S_{${n}} ${approx(S[n - 1])} ${tone(texNum(S[n - 1]), 1)}`,
        chart: {
          type: "curve", label: T(`Série de ${n} valores e a suavização exponencial com α = ${fmt(alpha)}`, `Series of ${n} values and its exponential smoothing with α = ${fmt(alpha)}`),
          xLabel: T(`período · escura: a série · colorida: suavizada (α = ${fmt(alpha)})`, `period · dark: the series · colored: smoothed (α = ${fmt(alpha)})`),
          xMin: 1, xMax: n, yMin: lo - pad, yMax: hi + pad, pts: S.map((v, i) => [i + 1, v]), lines: [{ pts: x.map((v, i) => [i + 1, v]), cls: "chart-fit" }],
          tipAt: v => { const t = Math.min(n, Math.max(1, Math.round(v))); return [fmt(S[t - 1]), T(`período ${t}: valor ${fmt(x[t - 1])}`, `period ${t}: value ${fmt(x[t - 1])}`)]; },
        },
        steps: [
          [T("Comece com o primeiro valor da série:", "Start with the first value of the series:"), `S_1 = x_1 = ${texNum(x[0])}`],
          [T("Cada novo valor suavizado mistura a observação nova (peso α) com o suavizado anterior (peso 1 − α):", "Each new smoothed value blends the new observation (weight α) with the previous smoothed value (weight 1 − α):"),
            `\\begin{gathered}${ex.join(" \\\\ ")}${n > 3 ? " \\\\ \\vdots" : ""}\\end{gathered}`],
          [T(`O último valor suavizado é a previsão para o período ${n + 1}:`, `The last smoothed value is the forecast for period ${n + 1}:`), `S_{${n}} ${approx(S[n - 1])} ${tone(texNum(S[n - 1]), 1)}`],
        ],
        note: T(`Desdobrando a conta, o valor de j períodos atrás pesa α(1 − α)ʲ: os pesos caem em <a href="${PAGE("soma-pg")}?a=${alpha}&amp;r=${Number((1 - alpha).toFixed(6))}&amp;n=${n}">progressão geométrica</a> e somam 1. α perto de 1 segue a série de perto; perto de 0, suaviza muito.`
          + ` Com α = ${fmt(alpha)}, o erro típico das previsões um passo à frente é ${fmt(rmse)}; o α que minimiza esse erro nesta série é ${fmt(best, 2)}.`
          + " A previsão é uma linha reta horizontal: com tendência ou sazonalidade, use as extensões de Holt e de Holt–Winters.",
          `Unrolling the calculation, the value from j periods ago weighs α(1 − α)ʲ: the weights fall in a <a href="${PAGE("soma-pg")}?a=${alpha}&amp;r=${Number((1 - alpha).toFixed(6))}&amp;n=${n}">geometric series</a> and add up to 1. α near 1 follows the series closely; near 0, it smooths a lot.`
          + ` With α = ${fmt(alpha)}, the typical one-step-ahead forecast error is ${fmt(rmse)}; the α that minimizes that error on this series is ${fmt(best, 2)}.`
          + " The forecast is a flat line: with trend or seasonality, use Holt's and Holt–Winters' extensions."),
      };
    },

    acf({ x, L }) {
      const n = x.length;
      if (n < 5) return { error: T("Informe pelo menos cinco valores da série.", "Enter at least five values of the series.") };
      if (n > 5000) return { error: T("Use no máximo 5.000 valores.", "Use at most 5,000 values.") };
      if (!Number.isInteger(L) || L < 1 || L > n - 2) return { error: T(`A defasagem máxima precisa ser um inteiro entre 1 e ${n - 2}.`, `The maximum lag must be an integer between 1 and ${n - 2}.`) };
      const mean = x.reduce((s, v) => s + v, 0) / n;
      const d = x.map(v => v - mean), den = d.reduce((s, v) => s + v * v, 0);
      if (den === 0) return { error: T("Todos os valores são iguais: não há variação para correlacionar.", "All the values are equal: there is no variation to correlate.") };
      const r = Array.from({ length: L }, (_, i) => { const k = i + 1; let s = 0; for (let t = 0; t < n - k; t++) s += d[t] * d[t + k]; return s / den; });
      const band = 1.96 / Math.sqrt(n);
      const Q = n * (n + 2) * r.reduce((s, v, i) => s + v * v / (n - i - 1), 0), pQ = chiSurvival(Q, L);
      const kmax = r.reduce((b, v, i) => (Math.abs(v) > Math.abs(r[b]) ? i : b), 0) + 1;
      const fora = r.map((v, i) => i + 1).filter(k => Math.abs(r[k - 1]) > band);
      const num1 = d.slice(0, n - 1).reduce((s, v, t) => s + v * d[t + 1], 0);
      const yl = Math.max(1, ...r.map(Math.abs)) * 1;
      return {
        result: `r_1 ${approx(r[0], 4)} ${tone(texNum(r[0], 4), 1)}, \\qquad Q(${L}) ${approx(Q, 3)} ${texNum(Q, 3)}`,
        chart: {
          type: "bars", label: T(`Autocorrelação nas defasagens 1 a ${L}, com as faixas de ±${fmt(band, 3)}`, `Autocorrelation at lags 1 to ${L}, with the ±${fmt(band, 3)} bands`),
          xLabel: T(`defasagem k · tracejadas: ±1,96/√n · destaque: fora da faixa`, `lag k · dashed: ±1.96/√n · highlighted: outside the band`),
          xs: r.map((_, i) => i + 1), ys: r, xMin: 0.5, xMax: L + 0.5, yMin: -yl, yMax: yl,
          hlines: [{ y: band, cls: "chart-ref" }, { y: -band, cls: "chart-ref" }],
          hi: k => Math.abs(r[k - 1]) > band,
          tip: (k, v) => [fmt(v, 4), T(`autocorrelação na defasagem ${k}`, `autocorrelation at lag ${k}`)],
        },
        steps: [
          [T("Subtraia a média de cada valor e some os quadrados: é o denominador comum.", "Subtract the mean from each value and add up the squares: this is the common denominator."),
            `\\bar{x} ${approx(mean)} ${texNum(mean)}, \\qquad \\textstyle\\sum (x_t - \\bar{x})^2 ${approx(den)} ${tone(texNum(den), 3)}`],
          [T("Para a defasagem 1, multiplique cada desvio pelo do período seguinte e some:", "For lag 1, multiply each deviation by the next period's and add up:"),
            `r_1 = \\dfrac{${tone(texNum(num1), 2)}}{${tone(texNum(den), 3)}} ${approx(r[0], 4)} ${tone(texNum(r[0], 4), 1)}`],
          [T(`Repita para as outras defasagens, até ${L}:`, `Repeat for the other lags, up to ${L}:`),
            r.slice(0, 8).map((v, i) => `r_{${i + 1}} ${approx(v, 4)} ${texNum(v, 4)}`).join(", \\quad ") + (L > 8 ? ", \\quad \\ldots" : "")],
          [T("O teste de Ljung–Box junta as defasagens para perguntar se há autocorrelação em alguma delas:", "The Ljung–Box test pools the lags to ask whether there is autocorrelation at any of them:"),
            `Q = n(n + 2) \\textstyle\\sum_{k=1}^{${L}} \\dfrac{r_k^2}{n - k} ${approx(Q, 3)} ${texNum(Q, 3)}`],
        ],
        note: T(`A maior autocorrelação, em módulo, está na defasagem ${kmax} (r ≈ ${fmt(r[kmax - 1], 3)})${fora.length ? `; ${fora.length === 1 ? "a defasagem" : "as defasagens"} ${list(fora.map(String))} ${fora.length === 1 ? "sai" : "saem"} da faixa de ±1,96/√n` : "; nenhuma sai da faixa de ±1,96/√n"}.`
          + ` Um pico numa defasagem como 4 ou 12 sugere sazonalidade trimestral ou anual. Pelo Ljung–Box, com ${dof(L)}, o valor-p é ${pValueText(pQ)}${pQ < 0.05 ? ": a série não é ruído branco" : ": os dados são compatíveis com ruído branco"}.`
          + " Em resíduos de regressão, r₁ é o que o teste de Durbin–Watson examina: d ≈ 2(1 − r₁).",
          `The largest autocorrelation in absolute value is at lag ${kmax} (r ≈ ${fmt(r[kmax - 1], 3)})${fora.length ? `; lag${fora.length === 1 ? "" : "s"} ${list(fora.map(String))} ${fora.length === 1 ? "falls" : "fall"} outside the ±1.96/√n band` : "; none falls outside the ±1.96/√n band"}.`
          + ` A spike at a lag such as 4 or 12 suggests quarterly or yearly seasonality. By Ljung–Box, with ${dof(L)}, the p-value is ${pValueText(pQ)}${pQ < 0.05 ? ": the series is not white noise" : ": the data are consistent with white noise"}.`
          + " In regression residuals, r₁ is what the Durbin–Watson test examines: d ≈ 2(1 − r₁)."),
      };
    },

    lognorm({ mu, sigma, x }) {
      if (sigma <= 0) return { error: T("σ precisa ser maior que zero.", "σ must be greater than zero.") };
      if (x <= 0) return { error: T("x precisa ser maior que zero: a lognormal só assume valores positivos.", "x must be greater than zero: the lognormal only takes positive values.") };
      if (Math.abs(mu) > 50 || sigma > 10) return { error: T("Use |μ| ≤ 50 e σ ≤ 10.", "Use |μ| ≤ 50 and σ ≤ 10.") };
      const pdf = v => (v <= 0 ? 0 : Math.exp(-((Math.log(v) - mu) ** 2) / (2 * sigma * sigma)) / (v * sigma * Math.sqrt(2 * Math.PI)));
      const z = (Math.log(x) - mu) / sigma, F = phi(z), f = pdf(x);
      const med = Math.exp(mu), mean = Math.exp(mu + sigma * sigma / 2), moda = Math.exp(mu - sigma * sigma);
      const hi = Math.max(x * 1.15, Math.exp(mu + 2.58 * sigma));
      const pts = Array.from({ length: 241 }, (_, i) => { const v = hi * (i + 0.5) / 240; return [v, pdf(v)]; });
      const yMax = Math.max(...pts.map(p => p[1]));
      const lx = Math.log(x), X = texNum(x);
      return {
        result: `f(${X}) ${approx(f, 6)} ${tone(texSci(f, 6), 1)}, \\qquad P(X \\le ${X}) ${approx(F, 6)} ${pctTex(F)}`,
        chart: {
          type: "curve", label: T(`Densidade lognormal com μ = ${fmt(mu)} e σ = ${fmt(sigma)}; área sombreada até x = ${fmt(x)}`, `Lognormal density with μ = ${fmt(mu)} and σ = ${fmt(sigma)}; area shaded up to x = ${fmt(x)}`),
          xLabel: "x", xMin: 0, xMax: hi, yMax, pts, shadeTo: x, marker: f <= yMax ? [x, f] : null,
          tipAt: v => [`f = ${fmtSci(pdf(v), 4)}`, `x = ${fmt(v, 2)}, P(X ≤ x) ≈ ${fmt(phi((Math.log(Math.max(v, 1e-300)) - mu) / sigma) * 100, 1)}%`],
        },
        steps: [
          [T("Passe x para a escala do logaritmo, onde a distribuição é normal:", "Move x to the log scale, where the distribution is normal:"),
            `\\ln ${X} ${approx(lx)} ${texNum(lx)}, \\qquad z = \\dfrac{${texNum(lx)} - ${paren(mu, texNum(mu))}}{${texNum(sigma)}} ${approx(z)} ${texNum(z)}`],
          [T("A densidade é a da normal nesse ponto, dividida por x:", "The density is the normal's at that point, divided by x:"),
            `f(${X}) = \\dfrac{1}{${tone(`${X} \\cdot ${texNum(sigma)} \\sqrt{2\\pi}`, 2)}} \\, ${tone(`e^{-${texNum(z * z / 2)}}`, 3)} ${approx(f, 6)} ${tone(texSci(f, 6), 1)}`],
          [T("A probabilidade acumulada vem direto da normal padrão:", "The cumulative probability comes straight from the standard normal:"),
            `P(X \\le ${X}) = \\Phi(${texNum(z)}) ${approx(F, 6)} ${texNum(F, 6)}`],
        ],
        note: T(`A mediana é e^μ ≈ ${fmt(med, 4)}, a média e^(μ + σ²/2) ≈ ${fmt(mean, 4)} e a moda e^(μ − σ²) ≈ ${fmt(moda, 4)}: a cauda longa à direita puxa a média para cima da mediana.`
          + " É o modelo de quantidades que crescem por fatores multiplicados, e não somados — renda, preços, tamanhos de arquivos, tempo de permanência: o logaritmo transforma o produto numa soma, e o"
          + ` <a href="${PAGE("teorema-central-limite")}">teorema central do limite</a> faz o resto. Veja a <a href="${PAGE("distribuicao-normal")}?mu=${mu}&amp;sd=${sigma}&amp;x=${Number(lx.toFixed(4))}">normal de ln x</a>.`,
          `The median is e^μ ≈ ${fmt(med, 4)}, the mean e^(μ + σ²/2) ≈ ${fmt(mean, 4)} and the mode e^(μ − σ²) ≈ ${fmt(moda, 4)}: the long right tail pulls the mean above the median.`
          + " It models quantities that grow by multiplied factors rather than added ones — income, prices, file sizes, time on a page: the logarithm turns the product into a sum, and the"
          + ` <a href="${PAGE("teorema-central-limite")}">central limit theorem</a> does the rest. See the <a href="${PAGE("distribuicao-normal")}?mu=${mu}&amp;sd=${sigma}&amp;x=${Number(lx.toFixed(4))}">normal of ln x</a>.`),
      };
    },

    negbin({ p, r, k }) {
      if (p <= 0 || p > 100) return { error: T("A probabilidade de sucesso precisa ser maior que 0 e no máximo 100%.", "The probability of success must be above 0 and at most 100%.") };
      if (!Number.isInteger(r) || r < 1 || r > 1000) return { error: T("O número de sucessos r precisa ser um inteiro entre 1 e 1.000.", "The number of successes r must be an integer between 1 and 1,000.") };
      if (!Number.isInteger(k) || k < r || k > 100000) return { error: T(`k precisa ser um inteiro de pelo menos ${r}: não dá para ter ${r} sucessos em menos de ${r} tentativas.`, `k must be an integer of at least ${r}: you can't get ${r} successes in fewer than ${r} trials.`) };
      const pp = p / 100, q = 1 - pp;
      const lc = (a, b) => lgamma(a + 1) - lgamma(b + 1) - lgamma(a - b + 1);
      const pmf = j => (j < r ? 0 : q === 0 ? (j === r ? 1 : 0) : Math.exp(lc(j - 1, r - 1) + r * Math.log(pp) + (j - r) * Math.log(q)));
      const res = pmf(k);
      const mean = r / pp, sd = Math.sqrt(r * q) / pp;
      const top = Math.min(Math.max(k, Math.ceil(mean + 4 * sd), r + 5), r + 400);
      const xs = Array.from({ length: Math.max(top, k) - r + 1 }, (_, i) => r + i), ys = xs.map(pmf);
      let le = 0; for (let j = r; j <= k; j++) le += pmf(j);
      const c = Math.exp(lc(k - 1, r - 1)), C = tone(c < 1e15 ? texNum(Math.round(c)) : texSci(c), 2);
      const P = tone(texSci(pp ** r, 6), 3), Q = tone(texSci(q ** (k - r), 6), 4);
      return {
        result: `P(X = ${k}) ${approx(res, 6)} ${tone(pctTex(res), 1)}`,
        chart: discreteChart(T(`Binomial negativa com r = ${r} e p = ${fmt(pp, 4)}`, `Negative binomial with r = ${r} and p = ${fmt(pp, 4)}`), T(`tentativa do ${r}º sucesso k`, `trial of success number ${r}, k`), xs, ys, k, "X"),
        steps: [
          [T(`A última tentativa, a ${k}ª, precisa ser o ${r}º sucesso. Conte de quantas formas os outros ${r - 1} sucessos se espalham pelas ${k - 1} tentativas anteriores:`, `The last trial, number ${k}, must be success number ${r}. Count how many ways the other ${r - 1} successes spread over the ${k - 1} earlier trials:`),
            `\\dbinom{${k - 1}}{${r - 1}} = ${C}`],
          [T(`Calcule a chance de uma sequência específica com ${r} sucessos e ${k - r} fracassos:`, `Compute the chance of one specific sequence with ${r} successes and ${k - r} failures:`),
            `p^{${r}} = ${texNum(pp, 6)}^{${r}} ${approx(pp ** r, 6)} ${P}, \\qquad (1 - p)^{${k - r}} = ${texNum(q, 6)}^{${k - r}} ${approx(q ** (k - r), 6)} ${Q}`],
          [T("Multiplique:", "Multiply:"), `P(X = ${k}) = ${C} \\cdot ${P} \\cdot ${Q} ${approx(res, 6)} ${tone(texSci(res, 6), 1)}`],
        ],
        note: T(`Acumulando, a chance de chegar ao ${r}º sucesso em até ${k} tentativas é ${fmt(le * 100, 2)}%. Em média, são r/p = ${fmt(mean, 2)} tentativas, com desvio padrão ${fmt(sd, 2)}.`
          + ` Com r = 1, ela vira a <a href="${PAGE("distribuicao-geometrica")}?p=${p}&amp;k=${k}">distribuição geométrica</a>.`
          + ` Na outra forma de escrever, que conta os fracassos, ela é o modelo para contagens com variância maior que a média — quando a <a href="${PAGE("distribuicao-poisson")}">Poisson</a> subestima a dispersão, como em número de acidentes ou de sinistros.`,
          `Cumulatively, the chance of reaching success number ${r} within ${k} trials is ${fmt(le * 100, 2)}%. On average it takes r/p = ${fmt(mean, 2)} trials, with standard deviation ${fmt(sd, 2)}.`
          + ` With r = 1 it becomes the <a href="${PAGE("distribuicao-geometrica")}?p=${p}&amp;k=${k}">geometric distribution</a>.`
          + ` In the other way of writing it, which counts failures, it is the model for counts whose variance exceeds the mean — when the <a href="${PAGE("distribuicao-poisson")}">Poisson</a> understates the spread, as with numbers of accidents or insurance claims.`),
      };
    },

    weibull({ k, lambda, x }) {
      if (k <= 0 || k > 50) return { error: T("A forma k precisa estar entre 0 e 50, sem o zero.", "The shape k must be between 0 and 50, excluding zero.") };
      if (lambda <= 0) return { error: T("A escala λ precisa ser maior que zero.", "The scale λ must be greater than zero.") };
      if (x < 0) return { error: T("x precisa ser maior ou igual a zero.", "x must be zero or more.") };
      const pdf = v => (v <= 0 ? (k === 1 ? 1 / lambda : k < 1 ? Infinity : 0) : (k / lambda) * (v / lambda) ** (k - 1) * Math.exp(-((v / lambda) ** k)));
      const cdf = v => 1 - Math.exp(-((Math.max(v, 0) / lambda) ** k));
      const haz = v => (k / lambda) * (v / lambda) ** (k - 1);
      const f = pdf(x), F = cdf(x), h = x > 0 ? haz(x) : NaN;
      const mean = lambda * Math.exp(lgamma(1 + 1 / k)), med = lambda * Math.log(2) ** (1 / k);
      const hi = Math.max(x * 1.15, lambda * (-Math.log(0.005)) ** (1 / k));
      const pts = Array.from({ length: 241 }, (_, i) => { const v = hi * (i + 0.5) / 240; return [v, pdf(v)]; });
      const yMax = Math.max(...pts.map(p => p[1]).filter(Number.isFinite));
      const ratio = x / lambda, pw = ratio ** k;
      const forma = k < 1 ? T("decrescente: falhas são mais prováveis no começo, como defeitos de fabricação (mortalidade infantil)", "decreasing: failures are likelier early on, like manufacturing defects (infant mortality)")
        : k === 1 ? T("constante: a falha não depende da idade, e a Weibull vira a exponencial", "constant: failure doesn't depend on age, and the Weibull becomes the exponential")
          : T("crescente: quanto mais velho, maior o risco de falhar, como num desgaste", "increasing: the older it is, the greater the risk of failing, as with wear");
      const X = texNum(x);
      return {
        result: `P(X \\le ${X}) ${approx(F, 6)} ${tone(pctTex(F), 1)}, \\qquad f(${X}) ${approx(f, 6)} ${texSci(f, 6)}`,
        chart: {
          type: "curve", label: T(`Densidade Weibull com forma ${fmt(k)} e escala ${fmt(lambda)}; área sombreada até x = ${fmt(x)}`, `Weibull density with shape ${fmt(k)} and scale ${fmt(lambda)}; area shaded up to x = ${fmt(x)}`),
          xLabel: "x", xMin: 0, xMax: hi, yMax: k < 1 ? Math.min(yMax, pdf(hi / 40) * 1.2) : yMax, pts, shadeTo: x, marker: Number.isFinite(f) && f <= yMax ? [x, f] : null,
          tipAt: v => [`f = ${fmtSci(pdf(v), 4)}`, `x = ${fmt(v, 2)}, P(X ≤ x) ≈ ${fmt(cdf(v) * 100, 1)}%`],
        },
        steps: [
          [T("Divida x pela escala e eleve à forma:", "Divide x by the scale and raise it to the shape:"),
            `\\left(\\dfrac{${X}}{${texNum(lambda)}}\\right)^{${texNum(k)}} = ${texNum(ratio, 6)}^{${texNum(k)}} ${approx(pw, 6)} ${tone(texNum(pw, 6), 4)}`],
          [T("A chance de falhar até x é um menos a de sobreviver até lá:", "The chance of failing by x is one minus the chance of surviving until then:"),
            `P(X \\le ${X}) = 1 - e^{-${tone(texNum(pw, 6), 4)}} ${approx(F, 6)} ${tone(texNum(F, 6), 1)}`],
          [T("A densidade junta a taxa de falha e a sobrevivência:", "The density combines the failure rate and survival:"),
            `f(${X}) = ${tone(`\\dfrac{${texNum(k)}}{${texNum(lambda)}}`, 2)} \\cdot ${tone(`${texNum(ratio, 6)}^{${texNum(k - 1)}}`, 3)} \\cdot e^{-${texNum(pw, 6)}} ${approx(f, 6)} ${texSci(f, 6)}`],
        ],
        note: T(`Com forma k = ${fmt(k)}, a taxa de falha é ${forma}.${Number.isFinite(h) ? ` Em x = ${fmt(x)}, ela vale ${fmtSci(h, 4)} por unidade de tempo.` : ""}`
          + ` A vida média é λΓ(1 + 1/k) ≈ ${fmt(mean, 4)} e a mediana λ(ln 2)^(1/k) ≈ ${fmt(med, 4)}.`
          + ` É o modelo padrão em confiabilidade e engenharia; com k = 1 é a <a href="${PAGE("distribuicao-exponencial")}?lambda=${Number((1 / lambda).toFixed(6))}&amp;x=${x}">exponencial</a> de taxa 1/λ.`,
          `With shape k = ${fmt(k)}, the failure rate is ${forma}.${Number.isFinite(h) ? ` At x = ${fmt(x)}, it is ${fmtSci(h, 4)} per unit of time.` : ""}`
          + ` The mean life is λΓ(1 + 1/k) ≈ ${fmt(mean, 4)} and the median λ(ln 2)^(1/k) ≈ ${fmt(med, 4)}.`
          + ` It is the standard model in reliability and engineering; with k = 1 it is the <a href="${PAGE("distribuicao-exponencial")}?lambda=${Number((1 / lambda).toFixed(6))}&amp;x=${x}">exponential</a> with rate 1/λ.`),
      };
    },

    cadeia({ f, g, x }) {
      const SEN = T("\\operatorname{sen}", "\\sin");
      const OUT = {
        sin: { t: u => `${SEN}(${u})`, d: u => `\\cos(${u})`, f: Math.sin, df: Math.cos },
        cos: { t: u => `\\cos(${u})`, d: u => `-${SEN}(${u})`, f: Math.cos, df: v => -Math.sin(v) },
        exp: { t: u => `e^{${u}}`, d: u => `e^{${u}}`, f: Math.exp, df: Math.exp },
        ln: { t: u => `\\ln(${u})`, d: u => `\\dfrac{1}{${u}}`, f: Math.log, df: v => 1 / v, pos: true },
        sqrt: { t: u => `\\sqrt{${u}}`, d: u => `\\dfrac{1}{2\\sqrt{${u}}}`, f: Math.sqrt, df: v => 0.5 / Math.sqrt(v), pos: true },
        cube: { t: u => `(${u})^3`, d: u => `3(${u})^2`, f: v => v ** 3, df: v => 3 * v * v },
      };
      const IN = {
        x2: { t: "x^2", d: "2x", f: v => v * v, df: v => 2 * v },
        lin: { t: "3x + 1", d: "3", f: v => 3 * v + 1, df: () => 3 },
        sin: { t: `${SEN} x`, d: "\\cos x", f: Math.sin, df: Math.cos },
        exp: { t: "e^{x}", d: "e^{x}", f: Math.exp, df: Math.exp },
        poly: { t: "x^3 - x", d: "3x^2 - 1", f: v => v ** 3 - v, df: v => 3 * v * v - 1 },
      };
      const o = OUT[f], i = IN[g];
      if (Math.abs(x) > 20) return { error: T("Use x entre −20 e 20.", "Use x between −20 and 20.") };
      const u = i.f(x);
      if (o.pos && !(u > 0)) return { error: T(`Aqui g(x) = ${fmt(u, 4)}, e ${f === "ln" ? "ln" : "√"} só aceita valores positivos. Tente outro x.`, `Here g(x) = ${fmt(u, 4)}, and ${f === "ln" ? "ln" : "√"} only takes positive values. Try another x.`) };
      const du = i.df(x), dfu = o.df(u), d = dfu * du;
      const h = 1e-5, num = (o.f(i.f(x + h)) - o.f(i.f(x - h))) / (2 * h);
      const comp = v => o.f(i.f(v));
      const lo = x - 2, hi = x + 2;
      const pts = Array.from({ length: 241 }, (_, j) => { const v = lo + (hi - lo) * j / 240; return [v, comp(v)]; }).filter(p => Number.isFinite(p[1]));
      const ys = pts.map(p => p[1]).sort((a, b) => a - b);
      const yLo = ys[Math.floor(ys.length * 0.02)], yHi = ys[Math.ceil(ys.length * 0.98) - 1], pad = (yHi - yLo) * 0.15 || 1;
      const y0 = comp(x);
      const tan = Array.from({ length: 81 }, (_, j) => { const v = lo + (hi - lo) * j / 80; return [v, y0 + d * (v - x)]; });
      const G = `(${i.t})`.replace(/^\((x\^2|e\^\{x\})\)$/, "$1");
      const X = texNum(x);
      return {
        result: `\\dfrac{d}{dx}\\,${o.t(i.t)} = ${tone(o.d(i.t), 2)} \\cdot ${tone(i.d, 3)}, \\qquad \\text{${T("em", "at")}}\\ x = ${X}: ${approx(d, 6)} ${tone(texNum(d, 6), 1)}`,
        chart: {
          type: "curve", label: T(`Curva de f(g(x)) perto de x = ${fmt(x)}, com a reta tangente de inclinação ${fmt(d, 4)}`, `Curve of f(g(x)) near x = ${fmt(x)}, with the tangent line of slope ${fmt(d, 4)}`),
          xLabel: T("x · tracejada: tangente no ponto", "x · dashed: tangent at the point"),
          xMin: lo, xMax: hi, yMin: Math.min(yLo, y0) - pad, yMax: Math.max(yHi, y0) + pad, pts, lines: [{ pts: tan, cls: "chart-tangent" }],
          tipAt: v => [fmt(comp(v), 4), `x = ${fmt(v, 2)}`],
        },
        steps: [
          [T("Separe a função de dentro e a de fora:", "Separate the inside function from the outside one:"), `g(x) = ${i.t}, \\qquad f(u) = ${o.t("u")}`],
          [T("Derive cada uma separadamente:", "Differentiate each one separately:"), `g'(x) = ${tone(i.d, 3)}, \\qquad f'(u) = ${o.d("u")}`],
          [T("Troque u por g(x) na derivada de fora e multiplique pela de dentro:", "Replace u by g(x) in the outer derivative and multiply by the inner one:"),
            `\\dfrac{d}{dx}\\,${o.t(i.t)} = ${tone(o.d(i.t), 2)} \\cdot ${tone(i.d, 3)}`],
          [T(`Calcule em x = ${fmt(x)}:`, `Evaluate at x = ${fmt(x)}:`),
            `g(${X}) ${approx(u, 6)} ${texNum(u, 6)}, \\quad f'(g(${X})) ${approx(dfu, 6)} ${tone(texNum(dfu, 6), 2)}, \\quad g'(${X}) ${approx(du, 6)} ${tone(texNum(du, 6), 3)} \\quad \\Rightarrow \\quad ${tone(texNum(d, 6), 1)}`],
        ],
        note: T(`Conferindo pela definição, com um passo pequeno: [f(g(x + h)) − f(g(x − h))] / (2h) ≈ ${fmt(num, 6)}.`
          + ` A ideia: se g muda ${fmt(du, 3)} vezes mais depressa que x, e f muda ${fmt(dfu, 3)} vezes mais depressa que g, a composta muda o produto, ${fmt(d, 3)} vezes mais depressa que x.`
          + ` Veja também a <a href="${PAGE("derivada")}">derivada pela definição</a>.`,
          `Checking against the definition, with a small step: [f(g(x + h)) − f(g(x − h))] / (2h) ≈ ${fmt(num, 6)}.`
          + ` The idea: if g changes ${fmt(du, 3)} times as fast as x, and f changes ${fmt(dfu, 3)} times as fast as g, the composite changes by the product, ${fmt(d, 3)} times as fast as x.`
          + ` See also the <a href="${PAGE("derivada")}">derivative from the definition</a>.`),
      };
    },

    benford({ fonte, n, x }) {
      const benf = Array.from({ length: 9 }, (_, i) => Math.log10(1 + 1 / (i + 1)));
      const counts = new Array(9).fill(0);
      let total = 0;
      const lead = l10 => Math.floor(10 ** (l10 - Math.floor(l10)) + 1e-9);
      if (fonte === "dados") {
        const xs = x.filter(v => v !== 0 && Number.isFinite(v));
        if (xs.length < 10) return { error: T("Informe pelo menos dez valores diferentes de zero.", "Enter at least ten non-zero values.") };
        xs.forEach(v => { const d = lead(Math.log10(Math.abs(v))); counts[Math.min(9, Math.max(1, d)) - 1]++; });
        total = xs.length;
      } else {
        if (!Number.isInteger(n) || n < 10 || n > 100000) return { error: T("A quantidade de termos precisa ser um inteiro entre 10 e 100.000.", "The number of terms must be an integer between 10 and 100,000.") };
        const phiL = Math.log10((1 + Math.sqrt(5)) / 2), s5 = Math.log10(Math.sqrt(5));
        let fa = 1, fb = 1;
        for (let k = 1; k <= n; k++) {
          let l;
          if (fonte === "pot2") l = k * Math.LOG10E * Math.LN2;
          else if (fonte === "fat") l = lgamma(k + 1) / Math.LN10;
          else if (k <= 70) { l = Math.log10(fa); [fa, fb] = [fb, fa + fb]; } else l = k * phiL - s5;
          counts[Math.min(9, Math.max(1, lead(l))) - 1]++;
        }
        total = n;
      }
      const obs = counts.map(c => c / total);
      const chi2 = counts.reduce((s, c, i) => s + (c - total * benf[i]) ** 2 / (total * benf[i]), 0), p = chiSurvival(chi2, 8);
      const nomes = { pot2: T("potências de 2", "powers of 2"), fib: T("números de Fibonacci", "Fibonacci numbers"), fat: T("fatoriais", "factorials"), dados: T("seus dados", "your data") };
      const rows = benf.map((b, i) => `${i + 1} & ${texNum(b * 100, 1)}\\% & ${counts[i]} & ${texNum(obs[i] * 100, 1)}\\%`).join(" \\\\ ");
      const q = new URLSearchParams({ o: counts.join(" "), e: benf.map(b => b.toFixed(6)).join(" ") });
      return {
        result: `P(d = 1) = \\log_{10} 2 ${approx(benf[0], 4)} ${tone(pctTex(benf[0], 1), 1)}, \\qquad ${T("\\text{observado}", "\\text{observed}")}: ${pctTex(obs[0], 1)}`,
        chart: {
          type: "curve", label: T(`Frequência do primeiro dígito pela lei de Benford e nos ${fmt(total)} ${nomes[fonte]}`, `First-digit frequency under Benford's law and in the ${fmt(total)} ${nomes[fonte]}`),
          xLabel: T("primeiro dígito · colorida: Benford · escura: observado", "first digit · colored: Benford · dark: observed"),
          xMin: 1, xMax: 9, yMin: 0, yMax: Math.max(...benf, ...obs) * 100 * 1.1, pts: benf.map((b, i) => [i + 1, b * 100]),
          lines: [{ pts: obs.map((v, i) => [i + 1, v * 100]), cls: "chart-fit" }],
          tipAt: v => { const d = Math.min(9, Math.max(1, Math.round(v))); return [`${fmt(benf[d - 1] * 100, 1)}% × ${fmt(obs[d - 1] * 100, 1)}%`, T(`primeiro dígito ${d}: Benford × observado`, `first digit ${d}: Benford × observed`)]; },
        },
        steps: [
          [T(`Conte o primeiro dígito de cada um dos ${fmt(total)} ${nomes[fonte]} e compare com log₁₀(1 + 1/d):`, `Count the first digit of each of the ${fmt(total)} ${nomes[fonte]} and compare with log₁₀(1 + 1/d):`),
            `\\begin{array}{c|c|c|c} d & \\text{Benford} & ${T("\\text{contagem}", "\\text{count}")} & ${T("\\text{observado}", "\\text{observed}")} \\\\ \\hline ${rows} \\end{array}`],
          [T("Um teste qui-quadrado de aderência mede a distância até Benford, com 8 graus de liberdade:", "A chi-square goodness-of-fit test measures the distance from Benford, with 8 degrees of freedom:"),
            `\\chi^2 ${approx(chi2, 3)} ${texNum(chi2, 3)}`],
        ],
        note: T(`O valor-p é ${pValueText(p)}${p < 0.05 ? ": os dígitos se afastam de Benford mais do que o acaso explicaria" : ": os dígitos são compatíveis com Benford"}. Confira no <a href="${PAGE("qui-quadrado")}?${q}">teste qui-quadrado com estas contagens</a>.`
          + " A lei aparece em números que se espalham por várias ordens de grandeza e crescem por multiplicação: populações, preços, contas de luz, potências. Num gráfico em escala logarítmica, o trecho de 1 a 2 ocupa 30% de cada década."
          + " Por isso auditores usam Benford para farejar dados inventados: quem chuta números costuma espalhar os primeiros dígitos por igual.",
          `The p-value is ${pValueText(p)}${p < 0.05 ? ": the digits stray from Benford more than chance would explain" : ": the digits are consistent with Benford"}. Check it in the <a href="${PAGE("qui-quadrado")}?${q}">chi-square test with these counts</a>.`
          + " The law shows up in numbers that spread over several orders of magnitude and grow by multiplication: populations, prices, electricity bills, powers. On a log scale, the stretch from 1 to 2 takes up 30% of every decade."
          + " That is why auditors use Benford to sniff out made-up data: people inventing numbers tend to spread first digits evenly."),
      };
    },

    uniao({ pa, pb, pab }) {
      if ([pa, pb, pab].some(v => v < 0 || v > 100)) return probRange;
      if (pab > Math.min(pa, pb) + 1e-9) return { error: T("A interseção não pode ser maior que P(A) nem que P(B): ela está dentro dos dois.", "The intersection can't be larger than P(A) or P(B): it lies inside both.") };
      if (pa + pb - pab > 100 + 1e-9) return { error: T(`Com esses valores, a união daria ${fmt(pa + pb - pab)}%, mais que 100%: a interseção precisa ser de pelo menos ${fmt(pa + pb - 100)}%.`, `With these values the union would be ${fmt(pa + pb - pab)}%, over 100%: the intersection must be at least ${fmt(pa + pb - 100)}%.`) };
      const a = pa / 100, b = pb / 100, ab = pab / 100, u = a + b - ab;
      const ind = Math.abs(ab - a * b) < 1e-9;
      return {
        result: `P(A \\cup B) ${approx(u, 6)} ${tone(pctTex(u), 1)}`,
        chart: {
          type: "venn", height: 240,
          label: T(`Diagrama de Venn: só A ${fmt((a - ab) * 100)}%, A e B ${fmt(ab * 100)}%, só B ${fmt((b - ab) * 100)}%, nenhum ${fmt((1 - u) * 100)}%`, `Venn diagram: A only ${fmt((a - ab) * 100)}%, A and B ${fmt(ab * 100)}%, B only ${fmt((b - ab) * 100)}%, neither ${fmt((1 - u) * 100)}%`),
          regions: [`${fmt((a - ab) * 100, 2)}%`, `${fmt(ab * 100, 2)}%`, `${fmt((b - ab) * 100, 2)}%`, T(`nenhum: ${fmt((1 - u) * 100, 2)}%`, `neither: ${fmt((1 - u) * 100, 2)}%`)],
        },
        steps: [
          [T("Somar P(A) e P(B) conta duas vezes quem está nos dois:", "Adding P(A) and P(B) counts those in both twice:"),
            `${tone(texNum(a, 4), 2)} + ${tone(texNum(b, 4), 3)} = ${texNum(a + b, 4)}`],
          [T("Subtraia a interseção uma vez:", "Subtract the intersection once:"),
            `P(A \\cup B) = ${texNum(a + b, 4)} - ${tone(texNum(ab, 4), 4)} ${approx(u, 6)} ${tone(texNum(u, 6), 1)}`],
        ],
        note: T(`Só A: ${fmt((a - ab) * 100, 2)}%; só B: ${fmt((b - ab) * 100, 2)}%; os dois: ${fmt(ab * 100, 2)}%; nenhum: ${fmt((1 - u) * 100, 2)}%.`
          + (ab === 0 ? " Como a interseção é zero, A e B são mutuamente exclusivos, e a união é a soma simples." : "")
          + (ind ? " Aqui P(A ∩ B) = P(A) · P(B): os eventos são independentes." : ` Se fossem independentes, a interseção seria P(A) · P(B) = ${fmt(a * b * 100, 2)}%; ${ab > a * b ? "é maior, então A e B tendem a andar juntos" : "é menor, então A e B tendem a se excluir"}.`)
          + ` Para a chance de A sabendo que B aconteceu, use a <a href="${PAGE("probabilidade-condicional")}">probabilidade condicional</a>.`,
          `A only: ${fmt((a - ab) * 100, 2)}%; B only: ${fmt((b - ab) * 100, 2)}%; both: ${fmt(ab * 100, 2)}%; neither: ${fmt((1 - u) * 100, 2)}%.`
          + (ab === 0 ? " Since the intersection is zero, A and B are mutually exclusive, and the union is a plain sum." : "")
          + (ind ? " Here P(A ∩ B) = P(A) · P(B): the events are independent." : ` If they were independent, the intersection would be P(A) · P(B) = ${fmt(a * b * 100, 2)}%; it is ${ab > a * b ? "larger, so A and B tend to go together" : "smaller, so A and B tend to exclude each other"}.`)
          + ` For the chance of A given that B happened, use <a href="${PAGE("probabilidade-condicional")}">conditional probability</a>.`),
      };
    },

    markov({ mu, a }) {
      if (mu <= 0) return { error: T("A média precisa ser maior que zero (e a variável, nunca negativa).", "The mean must be greater than zero (and the variable never negative).") };
      if (a <= 0) return { error: T("O limite a precisa ser maior que zero.", "The threshold a must be greater than zero.") };
      const bound = Math.min(1, mu / a), expo = Math.exp(-a / mu);
      const hi = Math.max(a * 1.5, mu * 6), lo = mu * 0.25;
      const as = Array.from({ length: 241 }, (_, i) => lo + (hi - lo) * i / 240);
      return {
        result: `P(X \\ge ${texNum(a)}) \\le ${approx(bound, 6) === "=" ? "" : "\\approx\\,"}${tone(pctTex(bound), 1)}`,
        chart: {
          type: "curve", label: T(`Limite de Markov μ/a conforme a, com média ${fmt(mu)}, comparado com a cauda exata de uma exponencial de mesma média`, `Markov bound μ/a as a varies, with mean ${fmt(mu)}, compared with the exact tail of an exponential with the same mean`),
          xLabel: T("a · colorida: limite de Markov · escura: cauda de uma exponencial com a mesma média", "a · colored: Markov bound · dark: tail of an exponential with the same mean"),
          xMin: lo, xMax: hi, yMin: 0, yMax: 100, pts: as.map(v => [v, Math.min(1, mu / v) * 100]), lines: [{ pts: as.map(v => [v, Math.exp(-v / mu) * 100]), cls: "chart-fit" }],
          marker: [a, bound * 100],
          tipAt: v => [`≤ ${fmt(Math.min(1, mu / v) * 100, 1)}%`, T(`P(X ≥ ${fmt(v, 2)}); numa exponencial, ${fmt(Math.exp(-v / mu) * 100, 2)}%`, `P(X ≥ ${fmt(v, 2)}); for an exponential, ${fmt(Math.exp(-v / mu) * 100, 2)}%`)],
        },
        steps: [
          [T("Divida a média pelo limite:", "Divide the mean by the threshold:"), `\\dfrac{${tone(texNum(mu), 2)}}{${tone(texNum(a), 3)}} ${approx(mu / a, 6)} ${texNum(mu / a, 6)}`],
          [T(mu >= a ? "Como passa de 1, o limite não diz nada além do óbvio: uma probabilidade nunca passa de 100%." : "Essa é a fração máxima que pode estar em a ou acima, qualquer que seja a distribuição:", mu >= a ? "Since it exceeds 1, the bound says nothing beyond the obvious: a probability never exceeds 100%." : "That is the largest share that can lie at a or above, whatever the distribution:"),
            `P(X \\ge ${texNum(a)}) \\le ${tone(pctTex(bound), 1)}`],
        ],
        note: T(`O raciocínio: se mais de ${fmt(bound * 100, 2)}% dos valores fossem ${fmt(a)} ou mais, só eles já fariam a média passar de ${fmt(mu)}. Vale para qualquer variável que nunca é negativa, conhecendo só a média.`
          + ` O preço é ser folgado: numa exponencial com a mesma média, a chance real é ${fmtSci(expo, 3)}. Sabendo também o desvio padrão, o <a href="${PAGE("teorema-chebyshev")}">teorema de Chebyshev</a> dá um limite bem mais apertado — e ele sai justamente de aplicar Markov a (X − μ)².`,
          `The reasoning: if more than ${fmt(bound * 100, 2)}% of the values were ${fmt(a)} or more, they alone would push the mean above ${fmt(mu)}. It holds for any variable that is never negative, knowing only the mean.`
          + ` The price is looseness: for an exponential with the same mean, the real chance is ${fmtSci(expo, 3)}. Knowing the standard deviation too, <a href="${PAGE("teorema-chebyshev")}">Chebyshev's theorem</a> gives a much tighter bound — and it comes precisely from applying Markov to (X − μ)².`),
      };
    },

    ruina({ i, N, p }) {
      if (!Number.isInteger(N) || N < 2 || N > 100000) return { error: T("A meta N precisa ser um inteiro entre 2 e 100.000.", "The target N must be an integer between 2 and 100,000.") };
      if (!Number.isInteger(i) || i < 1 || i >= N) return { error: T(`O capital inicial precisa ser um inteiro entre 1 e ${N - 1}.`, `The starting capital must be an integer between 1 and ${N - 1}.`) };
      if (p <= 0 || p >= 100) return { error: T("A chance de ganhar cada rodada precisa estar entre 0 e 100%, sem os extremos.", "The chance of winning each round must be strictly between 0 and 100%.") };
      const pp = p / 100, q = 1 - pp, r = q / pp, justo = Math.abs(pp - 0.5) < 1e-12;
      // (r^j − 1)/(r^N − 1) em logaritmos, para N grande não estourar.
      const ganha = j => {
        if (justo) return j / N;
        if (r > 1) { const a = j * Math.log(r), b = N * Math.log(r); return Math.exp(a - b) * (1 - Math.exp(-a)) / (1 - Math.exp(-b)); }
        return (1 - r ** j) / (1 - r ** N);
      };
      const P = ganha(i);
      const dur = justo ? i * (N - i) : i / (q - pp) - N / (q - pp) * P;
      const js = Array.from({ length: Math.min(N, 400) + 1 }, (_, k) => Math.round(k * N / Math.min(N, 400)));
      const R = tone(texNum(r, 6), 2);
      return {
        result: `P(\\text{${T("chegar a", "reach")}}\\ ${N}) ${approx(P, 6)} ${tone(pctTex(P), 1)}`,
        chart: {
          type: "curve", label: T(`Chance de chegar a ${N} antes de quebrar, para cada capital inicial`, `Chance of reaching ${N} before going broke, for each starting capital`),
          xLabel: T("capital inicial · colorida: este jogo · escura: jogo justo (p = 50%)", "starting capital · colored: this game · dark: a fair game (p = 50%)"),
          xMin: 0, xMax: N, yMin: 0, yMax: 100, pts: js.map(j => [j, ganha(j) * 100]), lines: [{ pts: js.map(j => [j, j / N * 100]), cls: "chart-fit" }],
          marker: [i, P * 100],
          tipAt: v => { const j = Math.min(N, Math.max(0, Math.round(v))); return [`${fmt(ganha(j) * 100, 2)}%`, T(`começando com ${j}`, `starting with ${j}`)]; },
        },
        steps: justo
          ? [[T("Num jogo justo, a chance é só a fração do caminho já percorrida:", "In a fair game, the chance is just the share of the way already covered:"), `P_{${i}} = \\dfrac{${i}}{${N}} ${approx(P, 6)} ${tone(texNum(P, 6), 1)}`]]
          : [[T("Calcule a razão entre perder e ganhar uma rodada:", "Compute the ratio of losing to winning a round:"), `\\dfrac{q}{p} = \\dfrac{${texNum(q, 4)}}{${texNum(pp, 4)}} ${approx(r, 6)} ${R}`],
            [T("Aplique a fórmula:", "Apply the formula:"), `P_{${i}} = \\dfrac{1 - ${R}^{${i}}}{1 - ${R}^{${N}}} ${approx(P, 6)} ${tone(texSci(P, 6), 1)}`]],
        note: T(`Começando com ${i} e apostando 1 por rodada, a chance de chegar a ${N} antes de zerar é ${fmt(P * 100, 2)}%${justo ? "" : `; num jogo justo seria ${fmt(i / N * 100, 1)}%`}. Em média, o jogo dura cerca de ${fmt(Math.round(dur))} rodadas.`
          + (pp < 0.5 ? " Uma desvantagem pequena por rodada vira uma desvantagem enorme no longo prazo: quanto mais rodadas, mais a casa ganha. Num jogo desfavorável, apostar alto e jogar poucas vezes dá mais chance de chegar à meta do que apostar pouco muitas vezes." : "")
          + " É também um passeio aleatório entre duas barreiras, o mesmo modelo de uma partícula que se difunde ou do preço de um ativo.",
          `Starting with ${i} and betting 1 per round, the chance of reaching ${N} before hitting zero is ${fmt(P * 100, 2)}%${justo ? "" : `; in a fair game it would be ${fmt(i / N * 100, 1)}%`}. On average, the game lasts about ${fmt(Math.round(dur))} rounds.`
          + (pp < 0.5 ? " A small edge per round becomes a huge one in the long run: the more rounds, the more the house wins. In an unfavourable game, betting big and playing few times gives a better chance of reaching the target than betting small many times." : "")
          + " It is also a random walk between two barriers, the same model as a diffusing particle or an asset's price."),
      };
    },

    cv({ x, y }) {
      const stats = v => {
        const n = v.length, m = v.reduce((a, b) => a + b, 0) / n;
        const s = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1));
        return { n, m, s, cv: s / Math.abs(m) };
      };
      for (const [v, nome] of [[x, "x"], [y, "y"]]) {
        if (!v.length) continue;
        if (v.length < 2) return { error: T(`Informe pelo menos dois valores em ${nome}.`, `Enter at least two values in ${nome}.`) };
        if (v.length > 500) return { error: T("Use no máximo 500 valores por lista.", "Use at most 500 values per list.") };
      }
      const A = stats(x);
      if (A.m === 0) return { error: T("A média é zero: o coeficiente de variação não se define.", "The mean is zero: the coefficient of variation is undefined.") };
      const B = y.length ? stats(y) : null;
      if (B && B.m === 0) return { error: T("A média do segundo grupo é zero: o coeficiente de variação não se define.", "The second group's mean is zero: the coefficient of variation is undefined.") };
      const nivel = c => (c < 0.15 ? T("baixa dispersão", "low spread") : c < 0.3 ? T("dispersão média", "moderate spread") : T("alta dispersão", "high spread"));
      const steps = [
        [T("Calcule a média e o desvio padrão:", "Compute the mean and the standard deviation:"),
          `\\bar{x} ${approx(A.m)} ${tone(texNum(A.m), 3)}, \\qquad s ${approx(A.s)} ${tone(texNum(A.s), 2)}`],
        [T("Divida o desvio padrão pela média:", "Divide the standard deviation by the mean:"),
          `CV = \\dfrac{${tone(texNum(A.s), 2)}}{${tone(texNum(Math.abs(A.m)), 3)}} ${approx(A.cv)} ${tone(pctTex(A.cv), 1)}`],
      ];
      if (B) steps.push([T("Faça o mesmo com o segundo grupo:", "Do the same for the second group:"),
        `\\bar{y} ${approx(B.m)} ${texNum(B.m)}, \\quad s ${approx(B.s)} ${texNum(B.s)}, \\quad CV ${approx(B.cv)} ${pctTex(B.cv)}`]);
      const cmp = B ? T(` O segundo grupo tem CV de ${fmt(B.cv * 100, 1)}%: ${Math.abs(A.cv - B.cv) < 0.005 ? "os dois variam o mesmo, em termos relativos" : A.cv > B.cv ? "em termos relativos, o primeiro varia mais" : "em termos relativos, o segundo varia mais"}, ainda que os desvios padrão, ${fmt(A.s)} e ${fmt(B.s)}, estejam em escalas que não se comparam.`,
        ` The second group has a CV of ${fmt(B.cv * 100, 1)}%: ${Math.abs(A.cv - B.cv) < 0.005 ? "both vary the same, in relative terms" : A.cv > B.cv ? "in relative terms, the first varies more" : "in relative terms, the second varies more"}, even though the standard deviations, ${fmt(A.s)} and ${fmt(B.s)}, are on scales that don't compare.`) : "";
      return {
        result: `CV ${approx(A.cv)} ${tone(pctTex(A.cv), 1)}${B ? `, \\qquad CV_y ${approx(B.cv)} ${pctTex(B.cv)}` : ""}`,
        steps,
        note: T(`O desvio padrão é ${fmt(A.cv * 100, 1)}% da média — ${nivel(A.cv)}, pela régua comum de 15% e 30%.`, `The standard deviation is ${fmt(A.cv * 100, 1)}% of the mean — ${nivel(A.cv)}, by the common 15% and 30% yardstick.`)
          + cmp
          + T(` Por não ter unidade, o CV compara a variabilidade de coisas medidas em escalas diferentes. Só faz sentido para grandezas com zero de verdade, como peso ou preço — não para temperatura em graus Celsius. Veja o <a href="${PAGE("desvio-padrao")}?x=${encodeURIComponent(x.join(" "))}">desvio padrão destes valores</a>.`,
            ` Being unitless, the CV compares the variability of things measured on different scales. It only makes sense for quantities with a true zero, such as weight or price — not for temperature in degrees Celsius. See the <a href="${PAGE("desvio-padrao")}?x=${encodeURIComponent(x.join(" "))}">standard deviation of these values</a>.`),
      };
    },

    unif({ a, b, x1, x2 }) {
      if (!(b > a)) return { error: T("O fim b precisa ser maior que o começo a.", "The end b must be greater than the start a.") };
      if (!(x2 >= x1)) return { error: T("O intervalo pedido precisa ter x₂ ≥ x₁.", "The requested interval must have x₂ ≥ x₁.") };
      const lo = Math.max(a, x1), hi = Math.min(b, x2), len = Math.max(0, hi - lo);
      const h = 1 / (b - a), P = len * h;
      const pad = (b - a) * 0.15;
      return {
        result: `P(${texNum(x1)} \\le X \\le ${texNum(x2)}) ${approx(P, 6)} ${tone(pctTex(P), 1)}`,
        chart: {
          type: "hist", label: T(`Densidade uniforme entre ${fmt(a)} e ${fmt(b)}, com o trecho de ${fmt(x1)} a ${fmt(x2)} em destaque`, `Uniform density between ${fmt(a)} and ${fmt(b)}, with the stretch from ${fmt(x1)} to ${fmt(x2)} highlighted`),
          xLabel: "x", xMin: a - pad, xMax: b + pad, yMax: h,
          bins: [{ x0: a, x1: b, y: h, count: 0 }, ...(len > 0 ? [{ x0: lo, x1: hi, y: h, count: 0, miss: true }] : [])],
          binTip: bb => [fmt(bb.y, 4), bb.miss ? T(`área do trecho: ${fmt(P * 100, 2)}%`, `area of the stretch: ${fmt(P * 100, 2)}%`) : T("densidade constante", "constant density")],
          pts: [],
        },
        steps: [
          [T("A altura da densidade é 1 dividido pela largura do intervalo, para a área total dar 1:", "The density's height is 1 over the width of the interval, so the total area is 1:"),
            `f(x) = \\dfrac{1}{${texNum(b)} - ${paren(a, texNum(a))}} ${approx(h, 6)} ${tone(texNum(h, 6), 2)}`],
          [T("A probabilidade é a área de um retângulo: a parte do trecho que cai dentro de [a, b], vezes a altura:", "The probability is the area of a rectangle: the part of the stretch inside [a, b], times the height:"),
            `P = (${texNum(hi)} - ${paren(lo, texNum(lo))}) \\cdot ${texNum(h, 6)} ${approx(P, 6)} ${tone(texNum(P, 6), 1)}`],
        ],
        note: T(`Na uniforme, todos os trechos do mesmo tamanho têm a mesma chance: só importa a largura. A média é (a + b)/2 = ${fmt((a + b) / 2)} e o desvio padrão (b − a)/√12 ≈ ${fmt((b - a) / Math.sqrt(12), 4)}.`
          + " É o modelo do “sem preferência nenhuma” — a chegada num ponto de ônibus sem horário, o erro de arredondamento — e a base dos sorteios do computador: os números aleatórios entre 0 e 1 são uniformes, e as outras distribuições são construídas a partir deles.",
          `In the uniform, every stretch of the same size has the same chance: only the width matters. The mean is (a + b)/2 = ${fmt((a + b) / 2)} and the standard deviation (b − a)/√12 ≈ ${fmt((b - a) / Math.sqrt(12), 4)}.`
          + " It is the model of “no preference at all” — arriving at a bus stop with no timetable, a rounding error — and the basis of computer draws: random numbers between 0 and 1 are uniform, and the other distributions are built from them."),
      };
    },

    icvar({ s, n, conf }) {
      if (s <= 0) return sdError;
      if (!Number.isInteger(n) || n < 2 || n > 100000) return { error: T("O tamanho da amostra precisa ser um inteiro entre 2 e 100.000.", "The sample size must be an integer between 2 and 100,000.") };
      if (conf <= 0 || conf >= 100) return confError;
      const df = n - 1, al = 1 - conf / 100;
      // Quantil da qui-quadrado: busca binária sobre a cauda superior.
      const chiQ = u => { let lo = 0, hi = df + 20 * Math.sqrt(2 * df) + 50; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (1 - chiSurvival(m, df) < u) lo = m; else hi = m; } return (lo + hi) / 2; };
      const qLo = chiQ(al / 2), qHi = chiQ(1 - al / 2);
      const SS = df * s * s;
      const vLo = SS / qHi, vHi = SS / qLo;
      const lpdf = x => (df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.LN2 - lgamma(df / 2);
      const top = qHi + 4 * Math.sqrt(2 * df);
      const pts = Array.from({ length: 241 }, (_, i) => { const x = top * (i + 0.5) / 240; return [x, Math.exp(lpdf(x))]; });
      const confTxt = `${fmt(conf, 2)}%`;
      return {
        result: `\\sigma \\in ${tone(interval(Math.sqrt(vLo), Math.sqrt(vHi)), 1)}, \\qquad \\sigma^2 \\in ${interval(vLo, vHi)}`,
        chart: {
          type: "curve", label: T(`Distribuição qui-quadrado com ${df} graus de liberdade; sombreada, a faixa central de ${confTxt}`, `Chi-square distribution with ${df} degrees of freedom; shaded, the central ${confTxt}`),
          xLabel: T(`χ² com ${df} graus de liberdade · sombreada: a faixa central de ${confTxt}`, `χ² with ${df} degrees of freedom · shaded: the central ${confTxt}`),
          xMin: 0, xMax: top, yMax: Math.max(...pts.map(p => p[1])), pts, shadeRanges: [[qLo, qHi]],
          tipAt: x => [`x = ${fmt(x, 2)}`, `P(χ² ≤ x) ≈ ${fmt((1 - chiSurvival(x, df)) * 100, 1)}%`],
        },
        steps: [
          [T(`Ache os valores da qui-quadrado com ${dof(df)} que deixam ${fmt(al / 2 * 100, 2)}% em cada cauda:`, `Find the chi-square values with ${dof(df)} that leave ${fmt(al / 2 * 100, 2)}% in each tail:`),
            `\\chi^2_{${texNum(al / 2, 4)}} ${approx(qLo, 4)} ${tone(texNum(qLo, 4), 4)}, \\qquad \\chi^2_{${texNum(1 - al / 2, 4)}} ${approx(qHi, 4)} ${tone(texNum(qHi, 4), 3)}`],
          [T("Multiplique a variância da amostra pelos graus de liberdade:", "Multiply the sample variance by the degrees of freedom:"),
            `(n - 1)s^2 = ${df} \\cdot ${texNum(s)}^2 ${approx(SS)} ${tone(texNum(SS), 2)}`],
          [T("Divida pelos dois valores — o maior dá o limite de baixo:", "Divide by the two values — the larger one gives the lower bound:"),
            `\\sigma^2 \\in \\left[\\dfrac{${tone(texNum(SS), 2)}}{${tone(texNum(qHi, 4), 3)}};\\ \\dfrac{${tone(texNum(SS), 2)}}{${tone(texNum(qLo, 4), 4)}}\\right] ${approx(vLo) === "=" && approx(vHi) === "=" ? "=" : "\\approx"} ${interval(vLo, vHi)}`.replace(";", T(";", ","))],
          [T("Tire a raiz dos dois limites para ter o intervalo do desvio padrão:", "Take the square root of both bounds for the standard deviation's interval:"),
            `\\sigma \\in ${tone(interval(Math.sqrt(vLo), Math.sqrt(vHi)), 1)}`],
        ],
        note: T(`Com ${confTxt} de confiança, o desvio padrão da população fica entre ${fmt(Math.sqrt(vLo))} e ${fmt(Math.sqrt(vHi))}. O intervalo não é simétrico em torno de s = ${fmt(s)}: a qui-quadrado é assimétrica, e a variância não pode ser negativa.`
          + " Ele supõe dados normais e é sensível a isso — bem mais que o intervalo para a média. Com amostras pequenas, fica largo: estimar variabilidade pede muitos dados.",
          `With ${confTxt} confidence, the population standard deviation lies between ${fmt(Math.sqrt(vLo))} and ${fmt(Math.sqrt(vHi))}. The interval isn't symmetric around s = ${fmt(s)}: the chi-square is skewed, and a variance can't be negative.`
          + " It assumes normal data and is sensitive to that — much more than the interval for the mean. With small samples it is wide: estimating variability takes a lot of data."),
      };
    },

    pval({ z, cauda, alpha }) {
      if (Math.abs(z) > 10) return { error: T("Use |z| de no máximo 10.", "Use |z| of at most 10.") };
      if (alpha <= 0 || alpha >= 100) return { error: T("O nível de significância precisa estar entre 0 e 100%, como 5.", "The significance level must be between 0 and 100%, such as 5.") };
      const a = alpha / 100;
      const p = cauda === "bi" ? 2 * (1 - phi(Math.abs(z))) : cauda === "dir" ? 1 - phi(z) : phi(z);
      const R = Math.max(4, Math.abs(z) + 0.8);
      const pts = Array.from({ length: 401 }, (_, i) => { const v = -R + 2 * R * i / 400; return [v, normPdf(v, 0, 1)]; });
      const ranges = cauda === "bi" ? [[-R, -Math.abs(z)], [Math.abs(z), R]] : cauda === "dir" ? [[z, R]] : [[-R, z]];
      const zc = cauda === "bi" ? probit(1 - a / 2) : probit(1 - a);
      const rej = p < a;
      const pTex = p < 1e-4 ? texSci(p, 2) : texNum(p, 4);
      const tail = { bi: T("as duas caudas, além de ±|z|", "both tails, beyond ±|z|"), dir: T("a cauda à direita de z", "the tail to the right of z"), esq: T("a cauda à esquerda de z", "the tail to the left of z") }[cauda];
      return {
        result: `p ${approx(p, 6)} ${tone(pTex, 1)}`,
        chart: {
          type: "curve", label: T(`Normal padrão com ${tail} sombreada`, `Standard normal with ${tail} shaded`),
          xLabel: T(`z · sombreado: ${tail}`, `z · shaded: ${tail}`), xMin: -R, xMax: R, yMax: normPdf(0, 0, 1), pts, shadeRanges: ranges,
          marker: [z, normPdf(z, 0, 1)],
          tipAt: v => [`z = ${fmt(v, 2)}`, T(`P(Z ≥ ${fmt(v, 2)}) ≈ ${fmt((1 - phi(v)) * 100, 2)}%`, `P(Z ≥ ${fmt(v, 2)}) ≈ ${fmt((1 - phi(v)) * 100, 2)}%`)],
        },
        steps: [
          [T(`Suponha que H₀ é verdadeira: a estatística segue a normal padrão. O valor-p é a área de ${tail}:`, `Assume H₀ is true: the statistic follows the standard normal. The p-value is the area of ${tail}:`),
            cauda === "bi" ? `p = 2 \\cdot P(Z \\ge ${texNum(Math.abs(z))}) = 2 \\cdot (1 - \\Phi(${texNum(Math.abs(z))})) ${approx(p, 6)} ${tone(pTex, 1)}`
              : cauda === "dir" ? `p = P(Z \\ge ${texNum(z)}) = 1 - \\Phi(${texNum(z)}) ${approx(p, 6)} ${tone(pTex, 1)}`
                : `p = P(Z \\le ${texNum(z)}) = \\Phi(${texNum(z)}) ${approx(p, 6)} ${tone(pTex, 1)}`],
          [T(`Compare com o nível de significância α = ${fmt(alpha)}%:`, `Compare with the significance level α = ${fmt(alpha)}%:`),
            `${pTex} ${rej ? "<" : "\\ge"} ${texNum(a, 4)} \\quad\\Longrightarrow\\quad \\text{${rej ? T("rejeita-se H₀", "reject H₀") : T("não se rejeita H₀", "do not reject H₀")}}`.replace(/H₀/g, "}H_0\\text{")],
        ],
        note: T(`O valor-p é a chance de, <strong>se H₀ fosse verdadeira</strong>, aparecer um resultado tão extremo quanto este ou mais. Ele <strong>não</strong> é a probabilidade de H₀ ser verdadeira, nem diz o tamanho do efeito: um efeito minúsculo dá p pequeno com amostra grande.`
          + ` Equivalente: com α = ${fmt(alpha)}%, rejeita-se H₀ quando ${cauda === "bi" ? `|z| passa de ${fmt(zc, 3)}` : cauda === "dir" ? `z passa de ${fmt(zc, 3)}` : `z fica abaixo de ${fmt(-zc, 3)}`}.`
          + ` Com muitos testes, valores-p pequenos aparecem por acaso — veja <a href="${PAGE("comparacoes-multiplas")}">comparações múltiplas</a>. E a chance de detectar um efeito real é o <a href="${PAGE("poder-estatistico")}">poder estatístico</a>.`,
          `The p-value is the chance, <strong>if H₀ were true</strong>, of a result as extreme as this one or more. It is <strong>not</strong> the probability that H₀ is true, nor does it give the size of the effect: a tiny effect yields a small p with a large sample.`
          + ` Equivalently: with α = ${fmt(alpha)}%, H₀ is rejected when ${cauda === "bi" ? `|z| exceeds ${fmt(zc, 3)}` : cauda === "dir" ? `z exceeds ${fmt(zc, 3)}` : `z falls below ${fmt(-zc, 3)}`}.`
          + ` With many tests, small p-values turn up by chance — see <a href="${PAGE("comparacoes-multiplas")}">multiple comparisons</a>. And the chance of detecting a real effect is <a href="${PAGE("poder-estatistico")}">statistical power</a>.`),
      };
    },

    mcnemar({ o }) {
      if (o.length !== 2 || o.some(r => r.length !== 2)) return { error: T("Informe uma tabela 2 × 2: duas linhas de dois valores, separadas por ponto e vírgula.", "Enter a 2 × 2 table: two rows of two values, separated by a semicolon.") };
      if (o.flat().some(v => !Number.isInteger(v) || v < 0)) return { error: T("As contagens precisam ser inteiros não negativos.", "The counts must be non-negative integers.") };
      const [[a, b], [c, d]] = o, m = b + c, N = a + b + c + d;
      if (m === 0) return { error: T("Não há pares discordantes (b + c = 0): ninguém mudou, e o teste não tem o que comparar.", "There are no discordant pairs (b + c = 0): nobody changed, and the test has nothing to compare.") };
      const chi = (b - c) ** 2 / m, p = chiSurvival(chi, 1);
      const chiC = Math.max(0, Math.abs(b - c) - 1) ** 2 / m, pC = chiSurvival(chiC, 1);
      // Exato: sob H₀, cada discordante vai para um lado com chance 1/2.
      let pe = 0; for (let k = 0; k <= Math.min(b, c); k++) pe += binPmf(m, 0.5, k);
      pe = Math.min(1, 2 * pe);
      const B = tone(texNum(b), 2), C = tone(texNum(c), 3);
      const antes = (a + b) / N, depois = (a + c) / N;
      return {
        result: `\\chi^2 ${approx(chi)} ${tone(texNum(chi), 1)}, \\qquad p ${approx(p, 4)} ${texNum(p, 4)}`,
        steps: [
          [T("Separe os pares que mudaram de resposta: b mudou de sim para não, c de não para sim. Os que não mudaram (a e d) não dizem nada sobre a mudança.", "Pick out the pairs that changed answer: b went from yes to no, c from no to yes. Those that didn't change (a and d) say nothing about change."),
            `\\begin{array}{c|cc} & ${T("\\text{depois sim}", "\\text{after yes}")} & ${T("\\text{depois não}", "\\text{after no}")} \\\\ \\hline ${T("\\text{antes sim}", "\\text{before yes}")} & ${texNum(a)} & ${B} \\\\ ${T("\\text{antes não}", "\\text{before no}")} & ${C} & ${texNum(d)} \\end{array}`],
          [T("Se não houvesse efeito, as mudanças seriam meio a meio. Compare b com c:", "If there were no effect, the changes would split half and half. Compare b with c:"),
            `\\chi^2 = \\dfrac{(${B} - ${C})^2}{${B} + ${C}} ${approx(chi)} ${tone(texNum(chi), 1)}`],
          [T("Com 1 grau de liberdade, o valor-p:", "With 1 degree of freedom, the p-value:"), `p ${approx(p, 4)} ${texNum(p, 4)}`],
        ],
        note: T(`A proporção de “sim” passou de ${fmt(antes * 100, 1)}% para ${fmt(depois * 100, 1)}%. ${p < 0.05 ? "Ao nível de 5%, a mudança é significativa." : "Ao nível de 5%, a mudança não é significativa."}`
          + ` Com a correção de continuidade, χ² ≈ ${fmt(chiC, 3)} e p ≈ ${fmt(pC, 4)}; pelo teste exato binomial, p ≈ ${fmt(pe, 4)}${m < 25 ? " — com poucos pares discordantes, como aqui, prefira o exato" : ""}.`
          + ` É o teste para proporções <strong>pareadas</strong>, as mesmas pessoas medidas duas vezes; para grupos diferentes, use o <a href="${PAGE("qui-quadrado-independencia")}?o=${encodeURIComponent(o.map(r => r.join(" ")).join("; "))}">qui-quadrado de independência</a>.`,
          `The share of “yes” went from ${fmt(antes * 100, 1)}% to ${fmt(depois * 100, 1)}%. ${p < 0.05 ? "At the 5% level, the change is significant." : "At the 5% level, the change is not significant."}`
          + ` With the continuity correction, χ² ≈ ${fmt(chiC, 3)} and p ≈ ${fmt(pC, 4)}; by the exact binomial test, p ≈ ${fmt(pe, 4)}${m < 25 ? " — with few discordant pairs, as here, prefer the exact one" : ""}.`
          + ` It is the test for <strong>paired</strong> proportions, the same people measured twice; for different groups, use the <a href="${PAGE("qui-quadrado-independencia")}?o=${encodeURIComponent(o.map(r => r.join(" ")).join("; "))}">chi-square test of independence</a>.`),
      };
    },

    pa({ a1, r, n }) {
      if (!Number.isInteger(n) || n < 1 || n > 100000) return { error: T("O número de termos precisa ser um inteiro entre 1 e 100.000.", "The number of terms must be an integer between 1 and 100,000.") };
      const an = a1 + (n - 1) * r, S = n * (a1 + an) / 2;
      const show = Math.min(n, 60);
      const xs = Array.from({ length: show }, (_, i) => i + 1), ys = xs.map(i => a1 + (i - 1) * r);
      const A1 = tone(texNum(a1), 3), AN = tone(texNum(an), 3), N = tone(n, 2);
      return {
        result: `S_{${n}} ${approx(S)} ${tone(texNum(S), 1)}`,
        chart: ys.every(v => v >= 0) ? {
          type: "bars", label: T(`Os ${show} primeiros termos da progressão aritmética`, `The first ${show} terms of the arithmetic series`),
          xLabel: T(`termo${n > show ? ` (os ${show} primeiros de ${n})` : ""}`, `term${n > show ? ` (the first ${show} of ${n})` : ""}`),
          xs, ys, xMin: 0.5, xMax: show + 0.5, yMax: Math.max(...ys, 1e-9), hi: () => false,
          tip: (i, v) => [fmt(v), T(`termo ${i}`, `term ${i}`)],
        } : null,
        steps: [
          [T("Ache o último termo: o primeiro mais (n − 1) vezes a razão.", "Find the last term: the first plus (n − 1) times the common difference."),
            `a_n = ${texNum(a1)} + (${n} - 1) \\cdot ${paren(r, texNum(r))} ${approx(an)} ${AN}`],
          [T("Some o primeiro com o último, multiplique por n e divida por 2:", "Add the first and the last, multiply by n and divide by 2:"),
            `S_{${n}} = \\dfrac{${N} \\cdot (${A1} + ${AN})}{2} ${approx(S)} ${tone(texNum(S), 1)}`],
        ],
        note: T(`A ideia, que se conta do jovem Gauss somando 1 + 2 + … + 100: escreva a soma de trás para a frente embaixo dela mesma. Cada coluna soma a₁ + aₙ = ${fmt(a1 + an)}, e há ${n} colunas — mas assim cada termo entrou duas vezes, daí a divisão por 2.`
          + ` A média dos termos é a média do primeiro com o último, ${fmt((a1 + an) / 2)}: a soma é essa média vezes o número de termos. Compare com a <a href="${PAGE("soma-pg")}">soma da progressão geométrica</a>, em que os termos se multiplicam em vez de se somar.`,
          `The idea, told of the young Gauss adding 1 + 2 + … + 100: write the sum backwards under itself. Each column adds up to a₁ + aₙ = ${fmt(a1 + an)}, and there are ${n} columns — but that way every term went in twice, hence the division by 2.`
          + ` The mean of the terms is the mean of the first and last, ${fmt((a1 + an) / 2)}: the sum is that mean times the number of terms. Compare with the <a href="${PAGE("soma-pg")}">geometric series</a>, where the terms multiply instead of add.`),
      };
    },

    sist({ N, n, r }) {
      if (!Number.isInteger(N) || N < 2 || N > 1e7) return { error: T("O tamanho da população precisa ser um inteiro entre 2 e 10 milhões.", "The population size must be an integer between 2 and 10 million.") };
      if (!Number.isInteger(n) || n < 1 || n > N) return { error: T(`O tamanho da amostra precisa ser um inteiro entre 1 e ${fmt(N)}.`, `The sample size must be an integer between 1 and ${fmt(N)}.`) };
      const k = N / n, kInt = Number.isInteger(k);
      const kMax = Math.ceil(k);
      if (r == null) r = 1;
      if (!Number.isInteger(r) || r < 1 || r > (kInt ? k : Math.floor(k))) return { error: T(`O começo precisa ser um inteiro entre 1 e ${fmt(kInt ? k : Math.floor(k))}, sorteado nesse intervalo.`, `The start must be an integer between 1 and ${fmt(kInt ? k : Math.floor(k))}, drawn from that range.`) };
      // Com k fracionário, arredonda-se cada posição para baixo: r + ⌊i·k⌋.
      const unit = i => r + Math.floor(i * k + 1e-9);
      const units = Array.from({ length: Math.min(n, 12) }, (_, i) => unit(i));
      const last = unit(n - 1);
      const kTex = kInt ? texNum(k) : texNum(k, 4);
      const show = units.map(u => texNum(u)).join(",\\ ") + (n > 12 ? `,\\ \\ldots,\\ ${texNum(last)}` : "");
      const showTxt = units.map(u => fmt(u)).join(", ") + (n > 12 ? `, …, ${fmt(last)}` : "");
      return {
        result: `k ${approx(k, 4)} ${tone(kTex, 1)}, \\qquad ${T("\\text{amostra}", "\\text{sample}")}: ${show}`,
        steps: [
          [T("Divida a população pela amostra para ter o intervalo de seleção:", "Divide the population by the sample to get the sampling interval:"),
            `k = \\dfrac{${tone(texNum(N), 2)}}{${tone(texNum(n), 3)}} ${approx(k, 4)} ${tone(kTex, 1)}`],
          [T(`Sorteie o começo entre 1 e ${kInt ? fmt(k) : fmt(Math.floor(k))}. Aqui:`, `Draw the start between 1 and ${kInt ? fmt(k) : fmt(Math.floor(k))}. Here:`), `r = ${tone(texNum(r), 4)}`],
          [kInt ? T("Daí em diante, pule de k em k:", "From there on, step k at a time:")
            : T("Daí em diante, pule de k em k, arredondando cada posição para baixo:", "From there on, step k at a time, rounding each position down:"),
            `${tone(texNum(r), 4)},\\ ${tone(texNum(r), 4)} + ${kTex}${kInt ? "" : "\\ (\\lfloor\\cdot\\rfloor)"},\\ \\ldots \\;\\to\\; ${show}`],
        ],
        note: T(`Com ${fmt(N)} unidades numa lista, sai uma amostra de ${fmt(n)} unidades — ${showTxt}. Só o começo é sorteado: o resto é consequência dele, então cada unidade tem a mesma chance, 1 em ${fmt(k, 4)}, de entrar.`
          + " É mais simples de executar que o sorteio unidade por unidade — basta contar na fila, no arquivo ou na linha de produção — e, se a lista estiver ordenada por algo ligado à variável, espalha a amostra por toda a lista, como uma estratificação implícita."
          + ` ${warn} se a lista tiver um ciclo que coincide com k — um turno a cada ${fmt(kMax)} peças, um mesmo dia da semana a cada 7 registros —, a amostra cai sempre no mesmo ponto do ciclo e fica viciada. Para ver o efeito da aleatoriedade numa pesquisa, use o <a href="${PAGE("simulador-pesquisa")}">simulador de pesquisa</a>.`,
          `With ${fmt(N)} units on a list, this gives a sample of ${fmt(n)} units — ${showTxt}. Only the start is drawn: the rest follows from it, so each unit has the same chance, 1 in ${fmt(k, 4)}, of being picked.`
          + " It is simpler to carry out than drawing unit by unit — you just count along the queue, the file or the production line — and, if the list is sorted by something related to the variable, it spreads the sample over the whole list, like an implicit stratification."
          + ` ${warn} if the list has a cycle matching k — a shift every ${fmt(kMax)} parts, the same weekday every 7 records —, the sample always lands at the same point of the cycle and is biased. To see the effect of randomness in a survey, try the <a href="${PAGE("simulador-pesquisa")}">survey simulator</a>.`),
      };
    },

    propal({ n, Nh }) {
      const k = Nh.length;
      if (!Number.isInteger(n) || n < 1) return { error: T("A amostra total precisa ser um inteiro positivo.", "The total sample must be a positive integer.") };
      if (k < 2) return { error: T("Informe o tamanho de pelo menos dois estratos.", "Enter the size of at least two strata.") };
      if (k > 30) return { error: T("Use no máximo 30 estratos.", "Use at most 30 strata.") };
      if (Nh.some(x => x <= 0)) return { error: T("O tamanho de cada estrato precisa ser maior que zero.", "Each stratum size must be greater than zero.") };
      const N = Nh.reduce((s, x) => s + x, 0);
      if (n > N) return { error: T(`A amostra total (${fmt(n)}) é maior que a população (${fmt(N)}).`, `The total sample (${fmt(n)}) is larger than the population (${fmt(N)}).`) };
      const al = apportion(n, Nh);
      const NT = texNum(N);
      const t = `\\def\\arraystretch{2.4}\\begin{array}{c|c|l|c} h & N_h & n_h = n \\cdot N_h / N & \\text{${T("arredondado", "rounded")}} \\\\ \\hline `
        + Nh.map((x, i) => `${i + 1} & ${tone(texNum(x), 3)} & ${tone(texNum(n), 2)} \\cdot \\dfrac{${texNum(x)}}{${tone(NT, 4)}} ${approx(al.exact[i], 2)} ${texNum(al.exact[i], 2)} & ${tone(texNum(al.out[i]), 1)}`).join(" \\\\ ")
        + ` \\end{array}`;
      const f = n / N;
      return {
        result: `n_h = ${tone(al.out.map(x => texNum(x)).join(",\\ "), 1)}`,
        chart: {
          type: "bars", label: T(`Amostra de cada um dos ${k} estratos`, `Sample from each of the ${k} strata`),
          xLabel: T("estrato h · altura: a amostra n_h", "stratum h · height: the sample n_h"),
          xs: al.out.map((_, i) => i + 1), ys: al.out, xMin: 0.5, xMax: k + 0.5, yMax: Math.max(...al.out),
          hi: () => false,
          tip: (h, v) => [fmt(v), T(`estrato ${h}: ${fmt(Nh[h - 1])} na população (${fmt(Nh[h - 1] / N * 100, 1)}%)`, `stratum ${h}: ${fmt(Nh[h - 1])} in the population (${fmt(Nh[h - 1] / N * 100, 1)}%)`)],
        },
        steps: [
          [T("Some os estratos para ter a população:", "Add up the strata to get the population:"),
            k <= 6 ? `N = ${Nh.map(x => texNum(x)).join(" + ")} = ${tone(NT, 4)}` : `N = ${tone(NT, 4)}`],
          [T("Dê a cada estrato a mesma fração da amostra que ele tem da população, e arredonde:", "Give each stratum the same share of the sample that it has of the population, and round:"), t],
        ],
        note: T(`Todos os estratos são amostrados na mesma fração, n/N ≈ ${fmt(f * 100, 2)}%, então cada unidade da população tem a mesma chance de entrar: a amostra é autoponderada, e a média simples dela já estima a média da população, sem pesos.`
          + " Comparada à amostra aleatória simples, garante que nenhum estrato fique de fora ou sobre por azar, e nunca piora a precisão."
          + ` Quando a variável varia muito mais num estrato que nos outros, a <a href="${PAGE("neyman-allocation")}">alocação de Neyman</a> faz melhor, levando mais amostra para onde há mais variação. Os arredondamentos usam o método dos maiores restos, para que a soma dê exatamente n.`,
          `Every stratum is sampled at the same fraction, n/N ≈ ${fmt(f * 100, 2)}%, so each unit in the population has the same chance of being picked: the sample is self-weighting, and its plain mean already estimates the population mean, without weights.`
          + " Compared with a simple random sample, it ensures no stratum is left out or overrepresented by bad luck, and never loses precision."
          + ` When the variable varies much more in one stratum than in the others, <a href="${PAGE("neyman-allocation")}">Neyman allocation</a> does better, moving more of the sample to where the variation is. Rounding uses the largest remainder method, so the parts add up to exactly n.`),
      };
    },

    holt({ x, alpha, beta, h }) {
      const n = x.length;
      if (n < 3) return { error: T("Informe pelo menos três valores da série.", "Enter at least three values of the series.") };
      if (n > 2000) return { error: T("Use no máximo 2.000 valores.", "Use at most 2,000 values.") };
      if (!(alpha > 0 && alpha <= 1)) return { error: T("α precisa estar entre 0 e 1, sem o zero.", "α must be between 0 and 1, excluding zero.") };
      if (!(beta > 0 && beta <= 1)) return { error: T("β precisa estar entre 0 e 1, sem o zero.", "β must be between 0 and 1, excluding zero.") };
      if (!Number.isInteger(h) || h < 1 || h > 100) return { error: T("O horizonte precisa ser um inteiro entre 1 e 100.", "The horizon must be an integer between 1 and 100.") };
      const run = (a, b) => {
        const L = [x[0]], B = [x[1] - x[0]]; let sse = 0;
        for (let t = 1; t < n; t++) {
          const f = L[t - 1] + B[t - 1]; sse += (x[t] - f) ** 2;
          L.push(a * x[t] + (1 - a) * f);
          B.push(b * (L[t] - L[t - 1]) + (1 - b) * B[t - 1]);
        }
        return { L, B, sse };
      };
      const { L, B, sse } = run(alpha, beta);
      const Ln = L[n - 1], Bn = B[n - 1], F = Ln + h * Bn;
      const fc = Array.from({ length: h + 1 }, (_, j) => [n + j, Ln + j * Bn]);
      const ys = [...x, ...L, ...fc.map(p => p[1])];
      const lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo) * 0.1 || 1;
      // Erro do mesmo período pela suavização simples, para comparar.
      let S = x[0], sseS = 0; for (let t = 1; t < n; t++) { sseS += (x[t] - S) ** 2; S = alpha * x[t] + (1 - alpha) * S; }
      const rmse = Math.sqrt(sse / (n - 1)), rmseS = Math.sqrt(sseS / (n - 1));
      const A = tone(texNum(alpha), 0), Bt = tone(texNum(beta), 0);
      const ex = n > 2 ? [
        `L_2 = ${A} \\cdot ${texNum(x[1])} + ${texNum(1 - alpha, 4)} \\cdot (${texNum(L[0])} + ${paren(B[0], texNum(B[0]))}) ${approx(L[1])} ${texNum(L[1])}`,
        `T_2 = ${Bt} \\cdot (${texNum(L[1])} - ${paren(L[0], texNum(L[0]))}) + ${texNum(1 - beta, 4)} \\cdot ${paren(B[0], texNum(B[0]))} ${approx(B[1])} ${texNum(B[1])}`,
      ] : [];
      return {
        result: `\\hat{x}_{${n + h}} = ${tone(texNum(Ln), 2)} + ${tone(texNum(h), 0)} \\cdot ${paren(Bn, tone(texNum(Bn), 3))} ${approx(F)} ${tone(texNum(F), 1)}`,
        chart: {
          type: "curve", label: T(`Série de ${n} valores, o nível suavizado por Holt e a previsão para ${h} ${h === 1 ? "período" : "períodos"}`, `Series of ${n} values, Holt's smoothed level and the forecast for ${h} ${h === 1 ? "period" : "periods"}`),
          xLabel: T("período · escura: a série · colorida: o nível · tracejada: a previsão", "period · dark: the series · colored: the level · dashed: the forecast"),
          xMin: 1, xMax: n + h, yMin: lo - pad, yMax: hi + pad, pts: L.map((v, i) => [i + 1, v]),
          lines: [{ pts: x.map((v, i) => [i + 1, v]), cls: "chart-fit" }, { pts: fc, cls: "chart-tangent" }],
          tipAt: v => {
            const t = Math.max(1, Math.round(v));
            if (t > n) return [fmt(Ln + (t - n) * Bn), T(`previsão para o período ${t}`, `forecast for period ${t}`)];
            return [fmt(L[t - 1]), T(`período ${t}: valor ${fmt(x[t - 1])}, tendência ${fmt(B[t - 1])}`, `period ${t}: value ${fmt(x[t - 1])}, trend ${fmt(B[t - 1])}`)];
          },
        },
        steps: [
          [T("Comece o nível no primeiro valor e a tendência na primeira diferença:", "Start the level at the first value and the trend at the first difference:"),
            `L_1 = ${texNum(x[0])}, \\qquad T_1 = ${texNum(x[1])} - ${paren(x[0], texNum(x[0]))} = ${texNum(B[0])}`],
          [T("A cada período, o nível mistura o valor novo com a previsão anterior (L + T), e a tendência mistura a última subida do nível com a tendência anterior:", "Each period, the level blends the new value with the previous forecast (L + T), and the trend blends the level's latest rise with the previous trend:"),
            `\\begin{gathered}L_t = \\alpha\\,x_t + (1 - \\alpha)(L_{t-1} + T_{t-1}) \\\\ T_t = \\beta\\,(L_t - L_{t-1}) + (1 - \\beta)\\,T_{t-1} \\\\ ${ex.join(" \\\\ ")}${n > 3 ? " \\\\ \\vdots" : ""}\\end{gathered}`],
          [T(`No último período, o nível e a tendência são:`, `In the last period, the level and the trend are:`),
            `L_{${n}} ${approx(Ln)} ${tone(texNum(Ln), 2)}, \\qquad T_{${n}} ${approx(Bn)} ${tone(texNum(Bn), 3)}`],
          [T(`Projete a reta ${h} ${h === 1 ? "período" : "períodos"} à frente:`, `Project the line ${h} ${h === 1 ? "period" : "periods"} ahead:`),
            `\\hat{x}_{${n} + ${h}} = ${tone(texNum(Ln), 2)} + ${tone(texNum(h), 0)} \\cdot ${paren(Bn, tone(texNum(Bn), 3))} ${approx(F)} ${tone(texNum(F), 1)}`],
        ],
        note: T(`A previsão é uma reta que parte do nível atual e sobe ${fmt(Bn)} por período. O erro típico das previsões um passo à frente é ${fmt(rmse)}; pela <a href="${PAGE("suavizacao-exponencial")}?x=${encodeURIComponent(x.join(" "))}&amp;alpha=${alpha}">suavização exponencial simples</a>, com o mesmo α, seria ${fmt(rmseS)} — numa série com tendência, a simples fica sempre um passo atrás.`
          + " β controla a rapidez com que a tendência se ajusta: perto de 0, ela quase não muda; perto de 1, segue cada oscilação. Projetada muito à frente, a reta cresce sem limite — por isso se usa às vezes uma tendência amortecida. Com sazonalidade, a extensão é a de Holt–Winters.",
          `The forecast is a line starting at the current level and rising ${fmt(Bn)} per period. The typical one-step-ahead forecast error is ${fmt(rmse)}; with <a href="${PAGE("suavizacao-exponencial")}?x=${encodeURIComponent(x.join(" "))}&amp;alpha=${alpha}">simple exponential smoothing</a>, with the same α, it would be ${fmt(rmseS)} — on a series with a trend, the simple one is always a step behind.`
          + " β controls how fast the trend adjusts: near 0, it hardly changes; near 1, it follows every wiggle. Projected far ahead, the line grows without limit — which is why a damped trend is sometimes used. With seasonality, the extension is Holt–Winters'."),
      };
    },

    figurinhas({ N, k }) {
      if (!Number.isInteger(N) || N < 2 || N > 100000) return { error: T("O álbum precisa ter um número inteiro de figurinhas entre 2 e 100.000.", "The album must have a whole number of stickers between 2 and 100,000.") };
      if (!Number.isInteger(k) || k < 1 || k > N) return { error: T(`O pacote precisa ter um inteiro entre 1 e ${fmt(N)} figurinhas.`, `A pack must hold a whole number of stickers between 1 and ${fmt(N)}.`) };
      // H[j] = 1 + 1/2 + … + 1/j.
      const H = [0]; for (let j = 1; j <= N; j++) H.push(H[j - 1] + 1 / j);
      let S2 = 0; for (let j = 1; j <= N; j++) S2 += 1 / (j * j);
      const E = N * H[N], sd = Math.sqrt(N * N * S2 - E), packs = E / k;
      const Ej = j => N * (H[N] - H[N - j]);
      const half = Ej(Math.ceil(N / 2)), lastTen = E - Ej(Math.max(0, N - 10));
      const step = Math.max(1, Math.round(N / 300));
      const pts = []; for (let j = 0; j <= N; j += step) pts.push([j, Ej(j)]);
      if (pts[pts.length - 1][0] !== N) pts.push([N, E]);
      const sum = N <= 5 ? Array.from({ length: N }, (_, i) => (i ? `\\tfrac{1}{${i + 1}}` : "1")).join(" + ") : `1 + \\tfrac{1}{2} + \\tfrac{1}{3} + \\cdots + \\tfrac{1}{${texNum(N)}}`;
      return {
        result: `E[T] ${approx(E, 2)} ${tone(texNum(E, 0), 1)}\\ ${T("\\text{figurinhas}", "\\text{stickers}")}${k > 1 ? ` \\approx ${texNum(packs, 0)}\\ ${T("\\text{pacotes}", "\\text{packs}")}` : ""}`,
        chart: {
          type: "curve", label: T(`Figurinhas compradas, em média, até ter j diferentes, de 0 a ${fmt(N)}`, `Stickers bought, on average, until having j different ones, from 0 to ${fmt(N)}`),
          xLabel: T("figurinhas diferentes já coladas · altura: compradas até lá, em média", "different stickers already in the album · height: bought by then, on average"),
          xMin: 0, xMax: N, yMax: E, pts, marker: [Math.ceil(N / 2), half],
          tipAt: v => { const j = Math.min(N, Math.max(0, Math.round(v))); return [fmt(Ej(j), 0), T(`compradas, em média, até ter ${fmt(j)} diferentes`, `bought, on average, until having ${fmt(j)} different ones`)]; },
        },
        steps: [
          [T(`Com j figurinhas já coladas, a chance de a próxima ser nova é (N − j)/N, e a espera por ela é, em média, N/(N − j). Somando de j = 0 até ${fmt(N - 1)}:`, `With j stickers already in the album, the chance that the next one is new is (N − j)/N, and the wait for it is, on average, N/(N − j). Adding from j = 0 to ${fmt(N - 1)}:`),
            `E[T] = \\dfrac{N}{N} + \\dfrac{N}{N - 1} + \\cdots + \\dfrac{N}{1} = ${tone(texNum(N), 2)} \\left(${tone(sum, 3)}\\right)`],
          [T("A soma entre parênteses é o número harmônico, que cresce como ln N + 0,5772:", "The sum in brackets is the harmonic number, which grows like ln N + 0.5772:"),
            `H_{${texNum(N)}} ${approx(H[N], 4)} ${tone(texNum(H[N], 4), 3)}, \\qquad \\ln ${texNum(N)} + 0{,}5772 \\approx ${texNum(Math.log(N) + 0.5772, 4)}`.replace("0{,}5772", T("0{,}5772", "0.5772"))],
          [T("Multiplique:", "Multiply:"), `E[T] = ${tone(texNum(N), 2)} \\cdot ${tone(texNum(H[N], 4), 3)} ${approx(E, 2)} ${tone(texNum(E, 2), 1)}`],
          ...(k > 1 ? [[T(`Em pacotes de ${fmt(k)}:`, `In packs of ${fmt(k)}:`), `\\dfrac{${texNum(E, 2)}}{${texNum(k)}} \\approx ${texNum(packs, 1)}`]] : []),
        ],
        note: T(`Para um álbum de ${fmt(N)}, a conta dá ${fmt(E, 0)} figurinhas, ${fmt(E / N, 2)} vezes o tamanho do álbum, com desvio padrão de cerca de ${fmt(sd, 0)}. A primeira metade sai rápido: ${fmt(half, 0)} figurinhas, em média. As últimas ${fmt(Math.min(10, N))} custam ${fmt(lastTen, 0)} — a última sozinha pede ${fmt(N)}, porque só 1 em ${fmt(N)} serve.`
          + ` A curva mostra isso: plana no começo, quase vertical no fim. A conta supõe figurinhas igualmente comuns e ignora repetidas dentro do mesmo pacote. Na prática, trocar as repetidas muda tudo: com amigos completando juntos, cada repetida de um serve ao outro. É o mesmo raciocínio das <a href="${PAGE("distribuicao-geometrica")}">esperas da distribuição geométrica</a>, uma para cada figurinha nova.`,
          `For an album of ${fmt(N)}, the sum gives ${fmt(E, 0)} stickers, ${fmt(E / N, 2)} times the album size, with a standard deviation of about ${fmt(sd, 0)}. The first half comes quickly: ${fmt(half, 0)} stickers, on average. The last ${fmt(Math.min(10, N))} cost ${fmt(lastTen, 0)} — the last one alone takes ${fmt(N)}, because only 1 in ${fmt(N)} will do.`
          + ` The curve shows it: flat at the start, almost vertical at the end. The calculation assumes equally common stickers and ignores duplicates within a pack. In practice, swapping duplicates changes everything: with friends filling albums together, each one's duplicate serves another. It is the same reasoning as the <a href="${PAGE("distribuicao-geometrica")}">waits of the geometric distribution</a>, one for each new sticker.`),
      };
    },

    inflacao({ i, v }) {
      const n = i.length;
      if (!n) return { error: T("Informe pelo menos uma taxa.", "Enter at least one rate.") };
      if (n > 600) return { error: T("Use no máximo 600 taxas.", "Use at most 600 rates.") };
      if (i.some(x => x <= -100)) return { error: T("Cada taxa precisa ser maior que −100%.", "Each rate must be greater than −100%.") };
      if (v != null && !(v > 0)) return { error: T("O valor inicial precisa ser maior que zero.", "The starting value must be greater than zero.") };
      const acc = []; let f = 1;
      i.forEach(x => { f *= 1 + x / 100; acc.push((f - 1) * 100); });
      const I = f - 1, soma = i.reduce((s, x) => s + x, 0) / 100;
      const media = f ** (1 / n) - 1, perda = 1 - 1 / f;
      const fat = n <= 6 ? i.map(x => `${texNum(1 + x / 100, 6)}`).join(" \\cdot ") : `${texNum(1 + i[0] / 100, 6)} \\cdot ${texNum(1 + i[1] / 100, 6)} \\cdots ${texNum(1 + i[n - 1] / 100, 6)}`;
      const lo = Math.min(0, ...acc), hi = Math.max(0, ...acc);
      return {
        result: `I ${approx(I, 6)} ${tone(pctTex(I), 1)}`,
        chart: {
          type: "bars", label: T(`Inflação acumulada mês a mês, ao longo de ${n} ${n === 1 ? "período" : "períodos"}`, `Cumulative inflation period by period, over ${n} ${n === 1 ? "period" : "periods"}`),
          xLabel: T("período · altura: a inflação acumulada até ele (%)", "period · height: the inflation accumulated up to it (%)"),
          xs: acc.map((_, t) => t + 1), ys: acc, xMin: 0.5, xMax: n + 0.5, yMin: lo - (hi - lo) * 0.08, yMax: hi + (hi - lo) * 0.08 || 1,
          hi: t => t === n,
          tip: (t, y) => [`${fmt(y, 2)}%`, T(`acumulada até o período ${t}; no período: ${fmt(i[t - 1], 2)}%`, `accumulated up to period ${t}; in the period: ${fmt(i[t - 1], 2)}%`)],
        },
        steps: [
          [T("Transforme cada taxa num fator: 1 mais a taxa em decimal.", "Turn each rate into a factor: 1 plus the rate as a decimal."),
            n <= 6 ? i.map(x => `${texNum(x)}\\% \\to ${tone(texNum(1 + x / 100, 6), 2)}`).join(", \\quad ") : `${texNum(i[0])}\\% \\to ${tone(texNum(1 + i[0] / 100, 6), 2)}, \\quad \\ldots`],
          [T("Multiplique os fatores e tire 1:", "Multiply the factors and subtract 1:"),
            `I = ${fat} - 1 ${approx(I, 6)} ${tone(pctTex(I), 1)}`],
          [T("A taxa média por período é a média geométrica dos fatores, menos 1:", "The average rate per period is the geometric mean of the factors, minus 1:"),
            `\\sqrt[${n}]{${texNum(f, 6)}} - 1 ${approx(media, 6)} ${pctTex(media)}`],
          ...(v != null ? [[T("Corrija o valor inicial:", "Adjust the starting value:"),
            `${texNum(v)} \\cdot ${texNum(f, 6)} ${approx(v * f, 2)} ${tone(texNum(v * f, 2), 1)}`]] : []),
        ],
        note: T(`Em ${n} ${n === 1 ? "período" : "períodos"}, os preços subiram ${fmt(I * 100, 2)}%. Somar as taxas daria ${fmt(soma * 100, 2)}% — ${Math.abs(I - soma) < 5e-5 ? "praticamente o mesmo aqui" : I > soma ? "menos, porque a soma esquece que cada aumento incide sobre preços que já tinham subido" : "diferente, porque cada taxa incide sobre a base já alterada pelas anteriores"}: é o mesmo juro sobre juro dos <a href="${PAGE("juros-aportes")}">juros compostos</a>.`
          + ` O poder de compra caiu ${fmt(perda * 100, 2)}%: o que custava 100 passou a custar ${fmt(100 * f, 2)}, e 100 compram hoje o que ${fmt(100 / f, 2)} compravam antes.${v != null ? ` Os ${fmt(v)} do começo equivalem a ${fmt(v * f, 2)} no fim.` : ""} A taxa média por período, ${fmt(media * 100, 4)}%, é uma <a href="${PAGE("media-geometrica")}">média geométrica</a>, não a aritmética.`,
          `Over ${n} ${n === 1 ? "period" : "periods"}, prices rose ${fmt(I * 100, 2)}%. Adding the rates would give ${fmt(soma * 100, 2)}% — ${Math.abs(I - soma) < 5e-5 ? "practically the same here" : I > soma ? "less, because the sum forgets that each rise applies to prices that had already gone up" : "different, because each rate applies to a base already changed by the previous ones"}: it is the same interest on interest as in <a href="${PAGE("juros-aportes")}">compound interest</a>.`
          + ` Purchasing power fell ${fmt(perda * 100, 2)}%: what cost 100 now costs ${fmt(100 * f, 2)}, and 100 now buys what ${fmt(100 / f, 2)} bought before.${v != null ? ` The starting ${fmt(v)} is worth ${fmt(v * f, 2)} at the end.` : ""} The average rate per period, ${fmt(media * 100, 4)}%, is a <a href="${PAGE("media-geometrica")}">geometric mean</a>, not the arithmetic one.`),
      };
    },

    entropia({ p }) {
      const k = p.length;
      if (k < 2) return { error: T("Informe pelo menos duas probabilidades ou contagens.", "Enter at least two probabilities or counts.") };
      if (k > 200) return { error: T("Use no máximo 200 valores.", "Use at most 200 values.") };
      if (p.some(x => x < 0)) return { error: T("Probabilidades e contagens não podem ser negativas.", "Probabilities and counts cannot be negative.") };
      const tot = p.reduce((s, x) => s + x, 0);
      if (tot <= 0) return { error: T("Pelo menos um valor precisa ser maior que zero.", "At least one value must be greater than zero.") };
      const norm = Math.abs(tot - 1) > 1e-9;
      const q = p.map(x => x / tot);
      const c = q.map(x => (x > 0 ? -x * Math.log2(x) : 0));
      const Hb = c.reduce((s, x) => s + x, 0), Hmax = Math.log2(k), ef = Hb / Hmax;
      const terms = q.slice(0, 6).map(x => (x > 0 ? `${tone(texNum(x, 4), 2)} \\log_2 ${texNum(x, 4)}` : "0")).join(" + ") + (k > 6 ? " + \\cdots" : "");
      const igual = q.every(x => Math.abs(x - 1 / k) < 1e-9);
      return {
        result: `H ${approx(Hb, 6)} ${tone(texNum(Hb, 4), 1)}\\ \\text{bits}`,
        chart: {
          type: "bars", label: T(`As ${k} probabilidades e quanto cada uma contribui para a entropia`, `The ${k} probabilities and how much each one adds to the entropy`),
          xLabel: T("resultado i · altura: a probabilidade", "outcome i · height: the probability"),
          xs: q.map((_, i) => i + 1), ys: q, xMin: 0.5, xMax: k + 0.5, yMax: Math.max(...q),
          hi: () => false,
          tip: (i, y) => [fmt(y, 4), T(`resultado ${i}: surpresa −log₂ p = ${y > 0 ? fmt(-Math.log2(y), 3) : "∞"} bits; contribui ${fmt(c[i - 1], 4)}`, `outcome ${i}: surprise −log₂ p = ${y > 0 ? fmt(-Math.log2(y), 3) : "∞"} bits; adds ${fmt(c[i - 1], 4)}`)],
        },
        steps: [
          ...(norm ? [[T("Os valores não somam 1: trate-os como contagens e divida cada um pelo total.", "The values don't add up to 1: treat them as counts and divide each by the total."),
            `p_i = \\dfrac{n_i}{${texNum(tot)}} \\;\\to\\; ${q.slice(0, 6).map(x => texNum(x, 4)).join(",\\ ")}${k > 6 ? ",\\ \\ldots" : ""}`]] : []),
          [T("Para cada resultado, multiplique a probabilidade pelo log na base 2 dela, some e troque o sinal:", "For each outcome, multiply the probability by its base-2 log, add up and flip the sign:"),
            `H = -\\left(${terms}\\right) ${approx(Hb, 6)} ${tone(texNum(Hb, 4), 1)}`],
          [T(`Compare com o máximo para ${k} resultados, quando são todos igualmente prováveis:`, `Compare with the maximum for ${k} outcomes, when they are all equally likely:`),
            `H_{\\max} = \\log_2 ${k} ${approx(Hmax, 4)} ${texNum(Hmax, 4)}, \\qquad \\dfrac{H}{H_{\\max}} ${approx(ef, 4)} ${pctTex(ef)}`],
        ],
        note: T(`A entropia é a surpresa média: um resultado de probabilidade p surpreende −log₂ p bits, e H é o <a href="${PAGE("valor-esperado")}">valor esperado</a> dessa surpresa. Aqui, ${fmt(Hb, 4)} bits — em média, ${fmt(Hb, 2)} perguntas de sim ou não bem escolhidas bastam para descobrir o resultado, e é o mínimo de bits por símbolo que uma compressão sem perdas consegue.`
          + ` ${igual ? `Com ${k} resultados igualmente prováveis, a entropia é a máxima possível: nenhuma pergunta é mais esperta que as outras.` : `É ${fmt(ef * 100, 1)}% do máximo, log₂ ${k} ≈ ${fmt(Hmax, 3)} bits: quanto mais desigual a distribuição, mais previsível o resultado, e menor a entropia.`}`
          + ` Uma moeda honesta tem 1 bit; uma viciada, menos; um resultado certo, 0. Em logaritmo natural, a mesma conta dá ${fmt(Hb * Math.LN2, 4)} nats.`,
          `Entropy is the average surprise: an outcome of probability p surprises −log₂ p bits, and H is the <a href="${PAGE("valor-esperado")}">expected value</a> of that surprise. Here, ${fmt(Hb, 4)} bits — on average, ${fmt(Hb, 2)} well-chosen yes-or-no questions are enough to find out the outcome, and it is the fewest bits per symbol any lossless compression can achieve.`
          + ` ${igual ? `With ${k} equally likely outcomes, the entropy is the highest possible: no question is cleverer than the others.` : `It is ${fmt(ef * 100, 1)}% of the maximum, log₂ ${k} ≈ ${fmt(Hmax, 3)} bits: the more uneven the distribution, the more predictable the outcome, and the lower the entropy.`}`
          + ` A fair coin has 1 bit; a biased one, less; a certain outcome, 0. With the natural log, the same calculation gives ${fmt(Hb * Math.LN2, 4)} nats.`),
      };
    },

    reta({ x1, y1, x2, y2, x }) {
      if (x1 === x2) return { error: T(y1 === y2 ? "Os dois pontos são o mesmo: por um ponto só passam infinitas retas." : "Os dois pontos têm o mesmo x: a reta é vertical, x = " + fmt(x1) + ", e não tem inclinação definida.",
        y1 === y2 ? "The two points are the same: infinitely many lines pass through a single point." : "The two points have the same x: the line is vertical, x = " + fmt(x1) + ", and has no defined slope.") };
      const dy = y2 - y1, dx = x2 - x1, m = dy / dx, b = y1 - m * x1;
      const f = t => m * t + b;
      const xs = [x1, x2, ...(x != null ? [x] : []), 0];
      let lo = Math.min(...xs), hi = Math.max(...xs); const pad = (hi - lo) * 0.15 || 1; lo -= pad; hi += pad;
      const ys = [f(lo), f(hi), y1, y2, 0];
      const yl = Math.min(...ys), yh = Math.max(...ys), yp = (yh - yl) * 0.1 || 1;
      const M = tone(texNum(m, 6), 1), B = tone(texNum(b, 6), 4);
      const eqTex = `y = ${m === 0 ? "" : `${M}\\,x`} ${m === 0 ? B : b < 0 ? `- ${tone(texNum(-b, 6), 4)}` : `+ ${B}`}`;
      const eqTxt = `y = ${m === 0 ? fmt(b, 6) : `${fmt(m, 6)}x ${b < 0 ? "−" : "+"} ${fmt(Math.abs(b), 6)}`}`;
      const steps = [
        [T("A inclinação é quanto y sobe dividido por quanto x anda entre os dois pontos:", "The slope is how much y rises divided by how far x moves between the two points:"),
          `m = \\dfrac{${texNum(y2)} - ${paren(y1, texNum(y1))}}{${texNum(x2)} - ${paren(x1, texNum(x1))}} = \\dfrac{${tone(texNum(dy, 6), 2)}}{${tone(texNum(dx, 6), 3)}} ${approx(m, 6)} ${M}`],
        [T("O intercepto sai de pôr um dos pontos na equação y = mx + b:", "The intercept comes from putting one of the points into y = mx + b:"),
          `b = y_1 - m\\,x_1 = ${texNum(y1)} - ${paren(m, texNum(m, 6))} \\cdot ${paren(x1, texNum(x1))} ${approx(b, 6)} ${B}`],
        [T("A equação da reta:", "The line's equation:"), eqTex],
      ];
      if (x != null) steps.push([T(`Em x = ${fmt(x)}:`, `At x = ${fmt(x)}:`), `y = ${texNum(m, 6)} \\cdot ${paren(x, texNum(x))} ${b < 0 ? "-" : "+"} ${texNum(Math.abs(b), 6)} ${approx(f(x), 6)} ${tone(texNum(f(x), 6), 0)}`]);
      return {
        result: eqTex + (x != null ? `, \\qquad y(${texNum(x)}) ${approx(f(x), 6)} ${texNum(f(x), 6)}` : ""),
        chart: {
          type: "curve", label: T(`A reta ${eqTxt} pelos pontos (${fmt(x1)}, ${fmt(y1)}) e (${fmt(x2)}, ${fmt(y2)})`, `The line ${eqTxt} through the points (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2)})`),
          xLabel: T("x · tracejado: o quanto x anda e o quanto y sobe entre os pontos", "x · dashed: how far x moves and how much y rises between the points"),
          xMin: lo, xMax: hi, yMin: yl - yp, yMax: yh + yp, pts: [[lo, f(lo)], [hi, f(hi)]],
          lines: [{ pts: [[x1, y1], [x2, y1], [x2, y2]], cls: "chart-ref" }],
          marker: x != null ? [x, f(x)] : [x2, y2],
          tipAt: t => [fmt(f(t), 4), `x = ${fmt(t, 3)}`],
        },
        steps,
        note: T(`A reta sobe ${fmt(m, 4)} a cada unidade de x${m < 0 ? " — como m é negativo, na verdade desce" : ""}, e corta o eixo y em ${fmt(b, 4)}, o valor quando x = 0.`
          + " É o modelo de tudo que tem uma parte fixa e uma parte proporcional: a bandeirada e o preço por quilômetro, a assinatura e o preço por minuto."
          + ` A inclinação entre dois pontos de uma curva qualquer é a da reta secante; aproximando os pontos até coincidirem, ela vira a <a href="${PAGE("derivada")}">derivada</a>. Com muitos pontos que não caem todos numa reta, a melhor reta é a da <a href="${PAGE("regressao-linear")}">regressão linear</a>.`,
          `The line rises ${fmt(m, 4)} for each unit of x${m < 0 ? " — since m is negative, it actually falls" : ""}, and crosses the y axis at ${fmt(b, 4)}, the value when x = 0.`
          + " It is the model of anything with a fixed part and a proportional part: a taxi's flag fare and price per kilometre, a subscription and a price per minute."
          + ` The slope between two points of any curve is that of the secant line; bringing the points together until they meet turns it into the <a href="${PAGE("derivada")}">derivative</a>. With many points that don't all lie on a line, the best line is the <a href="${PAGE("regressao-linear")}">linear regression</a> one.`),
      };
    },

    cramer({ a1, b1, c1, a2, b2, c2 }) {
      if ((a1 === 0 && b1 === 0) || (a2 === 0 && b2 === 0)) return { error: T("Em cada equação, a ou b precisa ser diferente de zero.", "In each equation, a or b must be nonzero.") };
      const D = a1 * b2 - a2 * b1, Dx = c1 * b2 - c2 * b1, Dy = a1 * c2 - a2 * c1;
      const det = (p, q, r, s) => `\\begin{vmatrix} ${texNum(p)} & ${texNum(q)} \\\\ ${texNum(r)} & ${texNum(s)} \\end{vmatrix}`;
      const sing = Math.abs(D) < 1e-12;
      const sx = sing ? 0 : Dx / D, sy = sing ? 0 : Dy / D;
      // Cada equação vira uma reta; com b = 0, é vertical.
      // O trecho de cada reta dentro do quadro (o gráfico descarta pontos fora dele).
      const seg = (a, b, c, lo, hi, ylo, yhi) => {
        if (b === 0) return [[c / a, ylo], [c / a, yhi]];
        let x0 = lo, x1 = hi;
        if (a !== 0) { const p = (c - b * ylo) / a, q = (c - b * yhi) / a; x0 = Math.max(lo, Math.min(p, q)); x1 = Math.min(hi, Math.max(p, q)); }
        return Array.from({ length: 41 }, (_, k) => { const x = x0 + (x1 - x0) * k / 40; return [x, (c - a * x) / b]; });
      };
      const R = sing ? 6 : Math.max(5, Math.abs(sx) * 1.6, Math.abs(sy) * 1.6);
      const cx = sing ? 0 : sx, cy = sing ? 0 : sy;
      const ratio = (640 - 48 - 14) / (280 - 14 - 34);
      const xMin = cx - R * ratio / 1.6, xMax = cx + R * ratio / 1.6, yMin = cy - R / 1.6, yMax = cy + R / 1.6;
      const eqn = (a, b, c) => {
        const co = v => (v === 1 ? "" : v === -1 ? "-" : texNum(v));
        const t1 = a ? `${co(a)}x` : "", t2 = b ? `${co(Math.abs(b))}y` : "";
        return `${t1}${t1 && t2 ? ` ${b < 0 ? "-" : "+"} ${t2}` : t2 ? `${b < 0 ? "-" : ""}${t2}` : ""} = ${texNum(c)}`;
      };
      const sys = `\\begin{cases} ${eqn(a1, b1, c1)} \\\\ ${eqn(a2, b2, c2)} \\end{cases}`;
      const chart = {
        type: "curve", height: 280,
        label: T("As duas retas do sistema" + (sing ? "" : `, que se cruzam em (${fmt(sx, 4)}, ${fmt(sy, 4)})`), "The system's two lines" + (sing ? "" : `, crossing at (${fmt(sx, 4)}, ${fmt(sy, 4)})`)),
        xLabel: T("colorida: a primeira equação · escura: a segunda · o ponto: a solução", "colored: the first equation · dark: the second · the dot: the solution"),
        xMin, xMax, yMin, yMax, pts: seg(a1, b1, c1, xMin, xMax, yMin, yMax),
        lines: [{ pts: seg(a2, b2, c2, xMin, xMax, yMin, yMax), cls: "chart-fit" }],
        hlines: [{ y: 0, cls: "chart-ref" }],
        marker: sing ? null : [sx, sy],
      };
      const steps = [
        [T("Calcule o determinante dos coeficientes:", "Compute the determinant of the coefficients:"),
          `D = ${det(a1, b1, a2, b2)} = ${paren(a1, texNum(a1))} \\cdot ${paren(b2, texNum(b2))} - ${paren(b1, texNum(b1))} \\cdot ${paren(a2, texNum(a2))} = ${tone(texNum(D, 6), 3)}`],
      ];
      if (sing) {
        const same = Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12;
        steps.push([T("Com D = 0, as retas são paralelas. Veja se são a mesma reta:", "With D = 0, the lines are parallel. Check whether they are the same line:"),
          `D_x = ${texNum(Dx, 6)}, \\qquad D_y = ${texNum(Dy, 6)}`]);
        return {
          result: same ? T("\\text{infinitas soluções}", "\\text{infinitely many solutions}") : T("\\text{nenhuma solução}", "\\text{no solution}"),
          chart, steps,
          note: same ? T("As duas equações descrevem a mesma reta — uma é múltipla da outra. Todos os pontos dela resolvem o sistema: há infinitas soluções, e falta uma informação nova para fixar uma só.", "The two equations describe the same line — one is a multiple of the other. Every point on it solves the system: there are infinitely many solutions, and a new piece of information is missing to pin down one.")
            : T("As retas são paralelas e distintas: nunca se cruzam, e o sistema não tem solução. As equações se contradizem.", "The lines are parallel and distinct: they never cross, and the system has no solution. The equations contradict each other."),
        };
      }
      steps.push(
        [T("Troque a coluna de x pelos termos independentes:", "Replace the x column with the constants:"),
          `D_x = ${det(c1, b1, c2, b2)} = ${tone(texNum(Dx, 6), 2)}`],
        [T("Troque a coluna de y pelos termos independentes:", "Replace the y column with the constants:"),
          `D_y = ${det(a1, c1, a2, c2)} = ${tone(texNum(Dy, 6), 5)}`],
        [T("Divida cada um por D:", "Divide each by D:"),
          `x = \\dfrac{${tone(texNum(Dx, 6), 2)}}{${tone(texNum(D, 6), 3)}} ${approx(sx, 6)} ${tone(texNum(sx, 6), 1)}, \\qquad y = \\dfrac{${tone(texNum(Dy, 6), 5)}}{${tone(texNum(D, 6), 3)}} ${approx(sy, 6)} ${tone(texNum(sy, 6), 4)}`],
      );
      return {
        result: `${sys} \\;\\Rightarrow\\; x ${approx(sx, 6)} ${tone(texNum(sx, 6), 1)}, \\quad y ${approx(sy, 6)} ${tone(texNum(sy, 6), 4)}`,
        chart, steps,
        note: T(`Cada equação é uma reta, e a solução é o ponto onde elas se cruzam: (${fmt(sx, 4)}, ${fmt(sy, 4)}). Confira: ${fmt(a1)}·${fmt(sx, 4)} + ${fmt(b1)}·${fmt(sy, 4)} = ${fmt(a1 * sx + b1 * sy, 4)}.`
          + " Quando D = 0, as retas são paralelas: não se cruzam (nenhuma solução) ou são a mesma (infinitas). Quanto mais perto de zero está D, mais as retas se parecem com paralelas, e um erro pequeno nos coeficientes desloca muito a solução."
          + ` A regra de Cramer é prática em 2 × 2 e 3 × 3; em sistemas grandes, usa-se eliminação. É o mesmo sistema que a <a href="${PAGE("matriz-inversa-2x2")}">matriz inversa</a> resolve.`,
          `Each equation is a line, and the solution is the point where they cross: (${fmt(sx, 4)}, ${fmt(sy, 4)}). Check: ${fmt(a1)}·${fmt(sx, 4)} + ${fmt(b1)}·${fmt(sy, 4)} = ${fmt(a1 * sx + b1 * sy, 4)}.`
          + " When D = 0, the lines are parallel: they don't cross (no solution) or they are the same (infinitely many). The closer D is to zero, the more the lines look parallel, and a small error in the coefficients moves the solution a lot."
          + ` Cramer's rule is handy for 2 × 2 and 3 × 3; for large systems, elimination is used. It is the same system the <a href="${PAGE("matriz-inversa-2x2")}">inverse matrix</a> solves.`),
      };
    },

    logb({ x, b }) {
      if (!(x > 0)) return { error: T("O logaritmo só existe para x maior que zero.", "The logarithm only exists for x greater than zero.") };
      if (!(b > 0) || b === 1) return { error: T("A base precisa ser positiva e diferente de 1.", "The base must be positive and different from 1.") };
      const L = Math.log(x) / Math.log(b);
      const top = Math.max(x, b, 1) * 1.25;
      const Rg = Math.max(3, Math.abs(L) * 1.25, Math.abs(Math.log(top) / Math.log(b)) * 1.1);
      const pts = []; for (let i = 1; i <= 600; i++) { const t = top * i / 600, y = Math.log(t) / Math.log(b); if (Math.abs(y) <= Rg) pts.push([t, y]); }
      const ln = v => texNum(Math.log(v), 6);
      const back = b ** L;
      const bTex = texNum(b), xTex = texNum(x);
      return {
        result: `\\log_{${bTex}} ${xTex} ${approx(L, 6)} ${tone(texNum(L, 6), 1)}`,
        chart: {
          type: "curve", label: T(`A curva y = log na base ${fmt(b)} de x, com o ponto x = ${fmt(x)}`, `The curve y = log base ${fmt(b)} of x, with the point x = ${fmt(x)}`),
          xLabel: T(`x · a curva corta o eixo em x = 1 e passa por (${fmt(b)}, 1)`, `x · the curve crosses the axis at x = 1 and passes through (${fmt(b)}, 1)`),
          xMin: 0, xMax: top, yMin: -Rg, yMax: Rg, pts, hlines: [{ y: 0, cls: "chart-ref" }], marker: [x, L],
          tipAt: t => (t > 0 ? [fmt(Math.log(t) / Math.log(b), 4), `x = ${fmt(t, 3)}`] : ["—", "x = 0"]),
        },
        steps: [
          [T("Tire o logaritmo natural de x e da base:", "Take the natural log of x and of the base:"),
            `\\ln ${xTex} ${approx(Math.log(x), 6)} ${tone(ln(x), 2)}, \\qquad \\ln ${bTex} ${approx(Math.log(b), 6)} ${tone(ln(b), 3)}`],
          [T("Divida um pelo outro:", "Divide one by the other:"),
            `\\log_{${bTex}} ${xTex} = \\dfrac{${tone(ln(x), 2)}}{${tone(ln(b), 3)}} ${approx(L, 6)} ${tone(texNum(L, 6), 1)}`],
          [T("Confira: a base elevada ao resultado devolve x.", "Check: the base raised to the result gives back x."),
            `${paren(b, bTex)}^{${texNum(L, 6)}} ${approx(back, 6)} ${texNum(back, 6)}`],
        ],
        note: T(`O logaritmo responde a quantas vezes é preciso multiplicar ${fmt(b)} por si mesmo para chegar a ${fmt(x)}: ${fmt(L, 4)} vezes. Na base 10, log ${fmt(x)} ≈ ${fmt(Math.log10(x), 4)} (quantos dígitos, mais ou menos); na base e, ln ${fmt(x)} ≈ ${fmt(Math.log(x), 4)}; na base 2, ≈ ${fmt(Math.log2(x), 4)} (quantas vezes dobrar).`
          + ` A troca de base mostra que todos os logaritmos são o mesmo, a menos de uma escala: log na base ${fmt(b)} é ln dividido por ${fmt(Math.log(b), 4)}. Por isso as curvas de todas as bases têm a mesma forma, e por isso a <a href="${PAGE("entropia-shannon")}">entropia</a> em bits e em nats difere só por um fator ln 2.`
          + " Os logaritmos transformam produtos em somas — log(ab) = log a + log b —, o que faz deles a escala natural para crescimentos multiplicativos, como juros, populações e a escala Richter.",
          `The logarithm answers how many times ${fmt(b)} must be multiplied by itself to reach ${fmt(x)}: ${fmt(L, 4)} times. In base 10, log ${fmt(x)} ≈ ${fmt(Math.log10(x), 4)} (roughly how many digits); in base e, ln ${fmt(x)} ≈ ${fmt(Math.log(x), 4)}; in base 2, ≈ ${fmt(Math.log2(x), 4)} (how many doublings).`
          + ` The change of base shows that all logarithms are the same, up to a scale: log base ${fmt(b)} is ln divided by ${fmt(Math.log(b), 4)}. That is why the curves for all bases have the same shape, and why <a href="${PAGE("entropia-shannon")}">entropy</a> in bits and in nats differs only by a factor of ln 2.`
          + " Logarithms turn products into sums — log(ab) = log a + log b —, which makes them the natural scale for multiplicative growth, such as interest, populations and the Richter scale."),
      };
    },

    dobra({ r }) {
      if (!(r > -100) || r === 0) return { error: T("A taxa precisa ser maior que −100% e diferente de zero.", "The rate must be greater than −100% and nonzero.") };
      const g = r / 100, cai = g < 0, alvo = cai ? 0.5 : 2;
      const Tt = Math.log(alvo) / Math.log(1 + g);
      const r70 = 70 / Math.abs(r), r72 = 72 / Math.abs(r), r69 = 69.3 / Math.abs(r);
      const top = Math.min(Tt * 3.2, 1e6);
      const pts = Array.from({ length: 301 }, (_, i) => { const t = top * i / 300; return [t, (1 + g) ** t]; });
      const lv = cai ? [1, 0.5, 0.25, 0.125] : [1, 2, 4, 8];
      const verbo = cai ? T("cair à metade", "halve") : T("dobrar", "double");
      return {
        result: `T ${approx(Tt, 4)} ${tone(texNum(Tt, 4), 1)}\\ ${T("\\text{períodos}", "\\text{periods}")}`,
        chart: {
          type: "curve", label: T(`Crescimento de ${fmt(r)}% por período: o valor ${cai ? "cai à metade" : "dobra"} a cada ${fmt(Tt, 2)} períodos`, `Growth of ${fmt(r)}% per period: the value ${cai ? "halves" : "doubles"} every ${fmt(Tt, 2)} periods`),
          xLabel: T(`períodos · tracejadas: ${cai ? "1/2, 1/4 e 1/8" : "2, 4 e 8"} vezes o valor inicial`, `periods · dashed: ${cai ? "1/2, 1/4 and 1/8" : "2, 4 and 8"} times the starting value`),
          xMin: 0, xMax: top, yMin: 0, yMax: cai ? 1.05 : Math.max(...pts.map(p => p[1])) * 1.05, pts,
          hlines: lv.slice(1).map(y => ({ y, cls: "chart-ref" })), marker: [Tt, alvo],
          tipAt: t => [fmt((1 + g) ** t, 4) + "×", T(`depois de ${fmt(t, 2)} períodos`, `after ${fmt(t, 2)} periods`)],
        },
        steps: [
          [T(`Depois de T períodos, o valor fica multiplicado por (1 + r)ᵀ. Para ${verbo}, isso precisa dar ${cai ? "1/2" : "2"}:`, `After T periods, the value is multiplied by (1 + r)ᵀ. To ${verbo}, that must equal ${cai ? "1/2" : "2"}:`),
            `(1 + ${paren(g, texNum(g, 6))})^{T} = ${cai ? "\\tfrac{1}{2}" : "2"}`],
          [T("Tire o logaritmo dos dois lados e isole T:", "Take the log of both sides and solve for T:"),
            `T = \\dfrac{${tone(cai ? "\\ln \\tfrac{1}{2}" : "\\ln 2", 2)}}{${tone(`\\ln(${texNum(1 + g, 6)})`, 3)}} = \\dfrac{${texNum(Math.log(alvo), 6)}}{${texNum(Math.log(1 + g), 6)}} ${approx(Tt, 4)} ${tone(texNum(Tt, 4), 1)}`],
          [T("Compare com as regras de bolso:", "Compare with the rules of thumb:"),
            `\\dfrac{70}{${texNum(Math.abs(r))}} ${approx(r70, 4)} ${texNum(r70, 4)}, \\qquad \\dfrac{72}{${texNum(Math.abs(r))}} ${approx(r72, 4)} ${texNum(r72, 4)}`],
        ],
        note: T(`${cai ? "Caindo" : "A"} ${fmt(Math.abs(r))}% por período, o valor ${cai ? "cai à metade" : "dobra"} a cada ${fmt(Tt, 2)} períodos — e de novo nos ${fmt(Tt, 2)} seguintes: ${cai ? "a meia-vida" : "o tempo de duplicação"} não depende de quanto já se tem. A regra dos 70 dá ${fmt(r70, 2)} e a dos 72, ${fmt(r72, 2)}.`
          + ` Elas vêm de ln 2 ≈ 0,693: para taxas pequenas, ln(1 + r) ≈ r, e T ≈ 69,3/r%. Usa-se 70 ou 72 porque são mais fáceis de dividir de cabeça, e o 72 compensa melhor taxas entre 5% e 10%. Com taxas altas, as regras pioram: a conta exata usa o <a href="${PAGE("logaritmo-mudanca-base")}">logaritmo</a>.`
          + ` ${cai ? "É a conta da meia-vida de um remédio no sangue ou de um isótopo radioativo." : `É a conta dos <a href="${PAGE("juros-aportes")}">juros compostos</a>, da inflação e do crescimento de populações.`}`,
          `${cai ? "Falling" : "At"} ${fmt(Math.abs(r))}% per period, the value ${cai ? "halves" : "doubles"} every ${fmt(Tt, 2)} periods — and again over the next ${fmt(Tt, 2)}: the ${cai ? "half-life" : "doubling time"} doesn't depend on how much there already is. The rule of 70 gives ${fmt(r70, 2)} and the rule of 72, ${fmt(r72, 2)}.`
          + ` They come from ln 2 ≈ 0.693: for small rates, ln(1 + r) ≈ r, and T ≈ 69.3/r%. People use 70 or 72 because they are easier to divide in your head, and 72 compensates better for rates between 5% and 10%. With high rates, the rules get worse: the exact calculation uses the <a href="${PAGE("logaritmo-mudanca-base")}">logarithm</a>.`
          + ` ${cai ? "It is the calculation for the half-life of a drug in the blood or of a radioactive isotope." : `It is the calculation behind <a href="${PAGE("juros-aportes")}">compound interest</a>, inflation and population growth.`}`)
          + (Math.abs(r69 - Tt) / Tt > 0.15 ? T(` ${warn} com ${fmt(r)}% por período, as regras de bolso erram por mais de 15%.`, ` ${warn} at ${fmt(r)}% per period, the rules of thumb are off by more than 15%.`) : ""),
      };
    },

    price({ P, i, n }) {
      if (!(P > 0)) return { error: T("O valor financiado precisa ser maior que zero.", "The amount financed must be greater than zero.") };
      if (!(i >= 0) || i > 100) return { error: T("A taxa precisa estar entre 0% e 100% por período.", "The rate must be between 0% and 100% per period.") };
      if (!Number.isInteger(n) || n < 1 || n > 1200) return { error: T("O número de parcelas precisa ser um inteiro entre 1 e 1.200.", "The number of instalments must be an integer between 1 and 1,200.") };
      const r = i / 100, v = (1 + r) ** -n;
      const pmt = r === 0 ? P / n : P * r / (1 - v);
      const rows = []; let saldo = P;
      for (let k = 1; k <= n; k++) { const j = saldo * r, am = pmt - j; saldo -= am; rows.push({ k, j, am, saldo: Math.abs(saldo) < 1e-6 * P ? 0 : saldo }); }
      const total = pmt * n, juros = total - P, sac = P * r * (n + 1) / 2;
      const money = v => fmt(v, 2);
      return {
        result: `PMT ${approx(pmt, 2)} ${tone(texNum(pmt, 2), 1)}`,
        chart: {
          type: "curve", label: T(`Juros e amortização em cada uma das ${n} parcelas, de ${money(pmt)}`, `Interest and principal in each of the ${n} instalments of ${money(pmt)}`),
          xLabel: T("parcela · colorida: juros · escura: amortização · tracejada: a prestação", "instalment · colored: interest · dark: principal · dashed: the payment"),
          xMin: 1, xMax: Math.max(2, n), yMax: pmt, pts: rows.map(o => [o.k, o.j]), lines: [{ pts: rows.map(o => [o.k, o.am]), cls: "chart-fit" }],
          hlines: [{ y: pmt, cls: "chart-ref" }],
          tipAt: t => { const o = rows[Math.min(n, Math.max(1, Math.round(t))) - 1]; return [T(`juros ${money(o.j)} · amortização ${money(o.am)}`, `interest ${money(o.j)} · principal ${money(o.am)}`), T(`parcela ${o.k}; saldo depois dela: ${money(o.saldo)}`, `instalment ${o.k}; balance after it: ${money(o.saldo)}`)]; },
          table: {
            title: T("Tabela de amortização", "Amortization table"),
            head: T(["Parcela", "Prestação", "Juros", "Amortização", "Saldo"], ["Instalment", "Payment", "Interest", "Principal", "Balance"]),
            rows: rows.map(o => ({ cells: [String(o.k), money(pmt), money(o.j), money(o.am), money(o.saldo)] })),
          },
        },
        steps: r === 0 ? [[T("Sem juros, a prestação é só o valor dividido pelo número de parcelas:", "With no interest, the payment is just the amount divided by the number of instalments:"),
          `PMT = \\dfrac{${texNum(P)}}{${texNum(n)}} ${approx(pmt, 2)} ${tone(texNum(pmt, 2), 1)}`]] : [
          [T("Calcule o fator de desconto de todo o prazo:", "Compute the discount factor for the whole term:"),
            `(1 + ${texNum(r, 6)})^{-${n}} ${approx(v, 6)} ${texNum(v, 6)}`],
          [T("Aplique a fórmula:", "Apply the formula:"),
            `PMT = \\dfrac{${tone(texNum(P), 2)} \\cdot ${tone(texNum(r, 6), 3)}}{${tone(`1 - ${texNum(v, 6)}`, 4)}} ${approx(pmt, 2)} ${tone(texNum(pmt, 2), 1)}`],
          [T("Na primeira parcela, os juros incidem sobre o valor todo; o resto da prestação amortiza a dívida:", "In the first instalment, interest applies to the full amount; the rest of the payment reduces the debt:"),
            `${T("\\text{juros}", "\\text{interest}")} = ${texNum(P)} \\cdot ${texNum(r, 6)} ${approx(rows[0].j, 2)} ${texNum(rows[0].j, 2)}, \\qquad ${T("\\text{amortização}", "\\text{principal}")} ${approx(rows[0].am, 2)} ${texNum(rows[0].am, 2)}`],
          [T("No total:", "In total:"), `${texNum(n)} \\cdot ${texNum(pmt, 2)} ${approx(total, 2)} ${texNum(total, 2)}, \\qquad ${T("\\text{juros}", "\\text{interest}")} ${approx(juros, 2)} ${texNum(juros, 2)}`],
        ],
        note: T(`Pela Tabela Price, as ${n} prestações são iguais, de ${money(pmt)}, e somam ${money(total)}: ${money(juros)} de juros, ${fmt(juros / P * 100, 1)}% do valor financiado. No começo, a maior parte da prestação é juro; no fim, quase tudo é amortização — o gráfico mostra as duas linhas se cruzando.`
          + (r > 0 ? ` No sistema SAC, com amortizações iguais, as prestações começam mais altas e caem, e os juros totais seriam ${money(sac)}, ${money(juros - sac)} a menos, porque a dívida cai mais depressa.` : "")
          + ` A fórmula é a soma de uma <a href="${PAGE("soma-pg")}">progressão geométrica</a>: o valor financiado é igual à soma das prestações trazidas a valor presente. É a conta inversa dos <a href="${PAGE("juros-aportes")}">juros com aportes</a>.`,
          `With the French (Price) system, the ${n} payments are equal, ${money(pmt)}, and add up to ${money(total)}: ${money(juros)} of interest, ${fmt(juros / P * 100, 1)}% of the amount financed. At first, most of the payment is interest; at the end, almost all of it is principal — the chart shows the two lines crossing.`
          + (r > 0 ? ` With constant amortization (SAC), the payments start higher and fall, and total interest would be ${money(sac)}, ${money(juros - sac)} less, because the debt falls faster.` : "")
          + ` The formula is the sum of a <a href="${PAGE("soma-pg")}">geometric series</a>: the amount financed equals the sum of the payments brought to present value. It is the reverse of <a href="${PAGE("juros-aportes")}">compound interest with contributions</a>.`),
      };
    },

    autoval({ a, b, c, d }) {
      const tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det;
      const mat = `\\begin{pmatrix} ${texNum(a)} & ${texNum(b)} \\\\ ${texNum(c)} & ${texNum(d)} \\end{pmatrix}`;
      const circ = Array.from({ length: 121 }, (_, k) => { const t = 2 * Math.PI * k / 120; return [Math.cos(t), Math.sin(t)]; });
      const img = circ.map(([x, y]) => [a * x + b * y, c * x + d * y]);
      const real = disc >= -1e-12, sq = Math.sqrt(Math.max(0, disc));
      const l1 = (tr + sq) / 2, l2 = (tr - sq) / 2;
      const vec = l => {
        let v = Math.abs(b) > 1e-12 ? [b, l - a] : Math.abs(c) > 1e-12 ? [l - d, c] : null;
        if (!v) v = Math.abs(l - a) < 1e-12 ? [1, 0] : [0, 1];
        const nn = Math.hypot(v[0], v[1]); return [v[0] / nn, v[1] / nn];
      };
      const v1 = real ? vec(l1) : null, v2 = real ? (Math.abs(l1 - l2) < 1e-12 && Math.abs(b) < 1e-12 && Math.abs(c) < 1e-12 ? [0, 1] : vec(l2)) : null;
      const all = img.concat(circ);
      let R = Math.max(1.2, ...all.map(p => Math.max(Math.abs(p[0]), Math.abs(p[1])))) * 1.1;
      const ratio = (640 - 48 - 14) / (280 - 14 - 34);
      const lines = [{ pts: circ, cls: "chart-fit" }];
      // Cada direção vai até a borda do quadro, que mede R · ratio por R.
      if (real) [v1, v2].forEach(v => { const t = Math.min(Math.abs(v[0]) > 1e-12 ? R * ratio / Math.abs(v[0]) : Infinity, Math.abs(v[1]) > 1e-12 ? R / Math.abs(v[1]) : Infinity) * 0.999; lines.push({ pts: [[-v[0] * t, -v[1] * t], [v[0] * t, v[1] * t]], cls: "chart-ref" }); });
      const vt = v => `\\begin{pmatrix} ${texNum(v[0], 4)} \\\\ ${texNum(v[1], 4)} \\end{pmatrix}`;
      const steps = [
        [T("Calcule o traço (soma da diagonal) e o determinante:", "Compute the trace (sum of the diagonal) and the determinant:"),
          `\\operatorname{tr} A = ${texNum(a)} + ${paren(d, texNum(d))} = ${tone(texNum(tr, 6), 2)}, \\qquad \\det A = ${paren(a, texNum(a))} \\cdot ${paren(d, texNum(d))} - ${paren(b, texNum(b))} \\cdot ${paren(c, texNum(c))} = ${texNum(det, 6)}`],
        [T("Os autovalores são as raízes de λ² − (tr A) λ + det A = 0. O discriminante:", "The eigenvalues are the roots of λ² − (tr A) λ + det A = 0. The discriminant:"),
          `\\Delta = ${paren(tr, texNum(tr, 6))}^2 - 4 \\cdot ${paren(det, texNum(det, 6))} = ${tone(texNum(disc, 6), 3)}`],
      ];
      if (!real) {
        const re = tr / 2, im = Math.sqrt(-disc) / 2;
        steps.push([T("Com Δ negativo, as raízes são complexas:", "With a negative Δ, the roots are complex:"),
          `\\lambda = ${texNum(re, 4)} \\pm ${texNum(im, 4)}\\,i`]);
        return {
          result: `\\lambda = ${tone(`${texNum(re, 4)} \\pm ${texNum(im, 4)}\\,i`, 1)}`,
          chart: { type: "curve", height: 280, label: T("O círculo unitário e a sua imagem pela matriz", "The unit circle and its image under the matrix"), xLabel: T("escura: círculo unitário · colorida: sua imagem · nenhuma direção fica parada: a matriz gira o plano", "dark: unit circle · colored: its image · no direction stays put: the matrix rotates the plane"), xMin: -R * ratio, xMax: R * ratio, yMin: -R, yMax: R, pts: img, lines },
          steps,
          note: T(`Sem autovalores reais, nenhuma direção do plano é só esticada: a matriz gira tudo. O módulo dos autovalores, √det ≈ ${fmt(Math.sqrt(det), 4)}, diz quanto ela estica em média, e o ângulo de giro por aplicação é cerca de ${fmt(Math.atan2(im, re) * 180 / Math.PI, 1)}°. Uma matriz de rotação pura, como (0, −1; 1, 0), tem λ = ±i.`,
            `With no real eigenvalues, no direction of the plane is just stretched: the matrix rotates everything. The eigenvalues' modulus, √det ≈ ${fmt(Math.sqrt(det), 4)}, says how much it stretches on average, and the rotation angle per application is about ${fmt(Math.atan2(im, re) * 180 / Math.PI, 1)}°. A pure rotation matrix, such as (0, −1; 1, 0), has λ = ±i.`),
        };
      }
      steps.push(
        [T("Aplique a fórmula quadrática:", "Apply the quadratic formula:"),
          `\\lambda = \\dfrac{${tone(texNum(tr, 6), 2)} \\pm \\sqrt{${tone(texNum(disc, 6), 3)}}}{2} \\;\\Rightarrow\\; \\lambda_1 ${approx(l1, 6)} ${tone(texNum(l1, 6), 1)}, \\quad \\lambda_2 ${approx(l2, 6)} ${tone(texNum(l2, 6), 1)}`],
        [T("Para cada autovalor, o autovetor é a direção que a matriz só estica (A v = λ v):", "For each eigenvalue, the eigenvector is the direction the matrix only stretches (A v = λ v):"),
          `v_1 = ${vt(v1)}, \\qquad v_2 = ${vt(v2)}`],
        [T("Confira: a soma dos autovalores é o traço, e o produto, o determinante.", "Check: the eigenvalues add up to the trace and multiply to the determinant."),
          `${texNum(l1, 6)} + ${paren(l2, texNum(l2, 6))} ${approx(l1 + l2, 6)} ${texNum(l1 + l2, 6)}, \\qquad ${texNum(l1, 6)} \\cdot ${paren(l2, texNum(l2, 6))} ${approx(l1 * l2, 6)} ${texNum(l1 * l2, 6)}`],
      );
      const sym = Math.abs(b - c) < 1e-12;
      return {
        result: `\\lambda_1 ${approx(l1, 6)} ${tone(texNum(l1, 6), 1)}, \\qquad \\lambda_2 ${approx(l2, 6)} ${tone(texNum(l2, 6), 1)}`,
        chart: {
          type: "curve", height: 280, label: T(`O círculo unitário, a sua imagem pela matriz ${"(" + [a, b, c, d].map(v => fmt(v)).join(", ") + ")"} e as duas direções dos autovetores`, `The unit circle, its image under the matrix and the two eigenvector directions`),
          xLabel: T("escura: círculo unitário · colorida: sua imagem · tracejadas: os autovetores", "dark: unit circle · colored: its image · dashed: the eigenvectors"),
          xMin: -R * ratio, xMax: R * ratio, yMin: -R, yMax: R, pts: img, lines,
        },
        steps,
        note: T(`A matriz leva o círculo unitário numa elipse. Ao longo de v₁, ela só multiplica por ${fmt(l1, 4)}; ao longo de v₂, por ${fmt(l2, 4)}${l2 < 0 || l1 < 0 ? " (um autovalor negativo inverte o sentido)" : ""}${Math.abs(l2) < 1e-9 ? " — com um autovalor zero, o plano é achatado numa reta" : ""}.`
          + (sym ? " Como a matriz é simétrica, os autovalores são reais e os autovetores, perpendiculares: são os eixos da elipse." : " Como a matriz não é simétrica, os autovetores não precisam ser perpendiculares.")
          + ` Numa <a href="${PAGE("covariancia")}">matriz de covariância</a>, os autovetores são as direções principais dos dados e os autovalores, a variância em cada uma — é a análise de componentes principais (PCA). As raízes vêm da <a href="${PAGE("formula-quadratica")}">fórmula quadrática</a>, aplicada ao polinômio característico.`,
          `The matrix maps the unit circle to an ellipse. Along v₁, it only multiplies by ${fmt(l1, 4)}; along v₂, by ${fmt(l2, 4)}${l2 < 0 || l1 < 0 ? " (a negative eigenvalue flips the direction)" : ""}${Math.abs(l2) < 1e-9 ? " — with a zero eigenvalue, the plane is flattened onto a line" : ""}.`
          + (sym ? " Since the matrix is symmetric, the eigenvalues are real and the eigenvectors perpendicular: they are the ellipse's axes." : " Since the matrix isn't symmetric, the eigenvectors needn't be perpendicular.")
          + ` In a <a href="${PAGE("covariancia")}">covariance matrix</a>, the eigenvectors are the data's principal directions and the eigenvalues the variance along each one — this is principal component analysis (PCA). The roots come from the <a href="${PAGE("formula-quadratica")}">quadratic formula</a>, applied to the characteristic polynomial.`),
      };
    },

    regra3({ x1, y1, x2, tipo }) {
      if (x1 === 0 || x2 === 0) return { error: T("As grandezas x₁ e x₂ precisam ser diferentes de zero.", "The quantities x₁ and x₂ must be nonzero.") };
      const inv = tipo === "inversa";
      if (inv && (x1 < 0 || x2 < 0)) return { error: T("Na proporção inversa, use valores positivos de x.", "For inverse proportion, use positive values of x.") };
      const y2 = inv ? y1 * x1 / x2 : y1 * x2 / x1, k = inv ? x1 * y1 : y1 / x1;
      const hi = Math.max(Math.abs(x1), Math.abs(x2)) * 1.4, lo = inv ? hi / 40 : Math.min(0, x1, x2) * 1.4;
      const f = t => (inv ? k / t : k * t);
      const pts = Array.from({ length: 241 }, (_, i) => { const t = lo + (hi - lo) * i / 240; return [t, f(t)]; });
      const ys = inv ? [0, y1, y2].concat([y1, y2].map(v => v * 2.2)) : pts.map(p => p[1]).concat(0);
      const yl = Math.min(...ys), yh = Math.max(...ys), yp = (yh - yl) * 0.08 || 1;
      const X1 = tone(texNum(x1), 3), Y1 = tone(texNum(y1), 2), X2 = tone(texNum(x2), 4), Y2 = tone(texNum(y2, 6), 1);
      return {
        result: `y_2 ${approx(y2, 6)} ${Y2}`,
        chart: {
          type: "curve", label: T(inv ? `Hipérbole x · y = ${fmt(k)}, com os pontos (${fmt(x1)}, ${fmt(y1)}) e (${fmt(x2)}, ${fmt(y2, 4)})` : `Reta y = ${fmt(k, 4)} x, com os pontos (${fmt(x1)}, ${fmt(y1)}) e (${fmt(x2)}, ${fmt(y2, 4)})`,
            inv ? `Hyperbola x · y = ${fmt(k)}, with the points (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2, 4)})` : `Line y = ${fmt(k, 4)} x, with the points (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2, 4)})`),
          xLabel: T(inv ? "x · o produto x · y é constante: uma hipérbole" : "x · a razão y / x é constante: uma reta pela origem", inv ? "x · the product x · y is constant: a hyperbola" : "x · the ratio y / x is constant: a line through the origin"),
          xMin: lo, xMax: hi, yMin: Math.min(0, yl) - (yl < 0 ? yp : 0), yMax: yh + yp, pts: pts.filter(p => p[1] >= Math.min(0, yl) - yp && p[1] <= yh + yp),
          lines: [{ pts: [[x1, 0], [x1, y1]], cls: "chart-ref" }], marker: [x2, y2],
          tipAt: t => [fmt(f(t), 4), `x = ${fmt(t, 3)}`],
        },
        steps: inv ? [
          [T("Grandezas inversamente proporcionais têm produto constante:", "Inversely proportional quantities have a constant product:"),
            `x_1 \\cdot y_1 = x_2 \\cdot y_2 \\;\\Rightarrow\\; ${X1} \\cdot ${paren(y1, Y1)} = ${X2} \\cdot y_2`],
          [T("Isole y₂:", "Solve for y₂:"), `y_2 = \\dfrac{${X1} \\cdot ${paren(y1, Y1)}}{${X2}} ${approx(y2, 6)} ${Y2}`],
        ] : [
          [T("Grandezas diretamente proporcionais têm razão constante:", "Directly proportional quantities have a constant ratio:"),
            `\\dfrac{y_1}{x_1} = \\dfrac{y_2}{x_2} \\;\\Rightarrow\\; \\dfrac{${Y1}}{${X1}} = \\dfrac{y_2}{${X2}}`],
          [T("Multiplique cruzado e isole y₂:", "Cross-multiply and solve for y₂:"), `y_2 = ${Y1} \\cdot \\dfrac{${X2}}{${X1}} ${approx(y2, 6)} ${Y2}`],
        ],
        note: (inv ? T(`Aqui, x · y vale sempre ${fmt(k)}: quando x é multiplicado por ${fmt(x2 / x1, 4)}, y é dividido pelo mesmo fator. É o caso de trabalhadores e prazo, velocidade e tempo de viagem, preço unitário e quantidade com a mesma verba. O gráfico é uma hipérbole: nunca toca os eixos.`,
            `Here, x · y is always ${fmt(k)}: when x is multiplied by ${fmt(x2 / x1, 4)}, y is divided by the same factor. It is the case of workers and deadline, speed and travel time, unit price and quantity on a fixed budget. The graph is a hyperbola: it never touches the axes.`)
          : T(`Aqui, y / x vale sempre ${fmt(k, 4)}: quando x é multiplicado por ${fmt(x2 / x1, 4)}, y também é. É o caso de quantidade e preço, distância e combustível, receita e porções. O gráfico é uma reta que passa pela origem — uma <a href="${PAGE("equacao-reta")}">reta</a> com intercepto zero.`,
            `Here, y / x is always ${fmt(k, 4)}: when x is multiplied by ${fmt(x2 / x1, 4)}, so is y. It is the case of quantity and price, distance and fuel, a recipe and servings. The graph is a line through the origin — a <a href="${PAGE("equacao-reta")}">line</a> with zero intercept.`))
          + T(" Antes de usar a regra de três, vale perguntar se a proporção existe de fato: dobrar os pedreiros não corta o prazo pela metade se eles se atrapalham, e o preço por quilo costuma cair no atacado.",
            " Before using the rule of three, it is worth asking whether the proportion really holds: doubling the builders doesn't halve the deadline if they get in each other's way, and the price per kilo often falls in bulk."),
      };
    },

    dist({ x1, y1, x2, y2 }) {
      const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
      if (d === 0) return { error: T("Os dois pontos são o mesmo: a distância é zero.", "The two points are the same: the distance is zero.") };
      const circ = Array.from({ length: 181 }, (_, k) => { const t = 2 * Math.PI * k / 180; return [x1 + d * Math.cos(t), y1 + d * Math.sin(t)]; });
      const R = d * 1.15, ratio = (640 - 48 - 14) / (280 - 14 - 34);
      const DX = tone(texNum(dx, 6), 2), DY = tone(texNum(dy, 6), 3), D = tone(texNum(d, 6), 1);
      const sgn = v => (v < 0 ? "-" : "+");
      const circTex = `(x ${sgn(-x1)} ${texNum(Math.abs(x1))})^2 + (y ${sgn(-y1)} ${texNum(Math.abs(y1))})^2 = ${texNum(d * d, 6)}`;
      return {
        result: `d ${approx(d, 6)} ${D}`,
        chart: {
          type: "curve", height: 280, label: T(`Os pontos (${fmt(x1)}, ${fmt(y1)}) e (${fmt(x2)}, ${fmt(y2)}), a distância ${fmt(d, 4)} entre eles e a circunferência de centro no primeiro`, `The points (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2)}), the distance ${fmt(d, 4)} between them and the circle centred on the first`),
          xLabel: T("tracejados: os catetos Δx e Δy · escuro: a distância, a hipotenusa · colorida: a circunferência", "dashed: the legs Δx and Δy · dark: the distance, the hypotenuse · colored: the circle"),
          xMin: x1 - R * ratio, xMax: x1 + R * ratio, yMin: y1 - R, yMax: y1 + R, pts: circ,
          lines: [{ pts: [[x1, y1], [x2, y2]], cls: "chart-fit" }, { pts: [[x1, y1], [x2, y1], [x2, y2]], cls: "chart-ref" }],
          marker: [x2, y2],
        },
        steps: [
          [T("Calcule quanto x e y mudam entre os pontos — os catetos de um triângulo retângulo:", "Compute how much x and y change between the points — the legs of a right triangle:"),
            `\\Delta x = ${texNum(x2)} - ${paren(x1, texNum(x1))} = ${DX}, \\qquad \\Delta y = ${texNum(y2)} - ${paren(y1, texNum(y1))} = ${DY}`],
          [T("Pelo teorema de Pitágoras, a distância é a hipotenusa:", "By Pythagoras' theorem, the distance is the hypotenuse:"),
            `d = \\sqrt{${paren(dx, DX)}^2 + ${paren(dy, DY)}^2} = \\sqrt{${texNum(dx * dx, 6)} + ${texNum(dy * dy, 6)}} ${approx(d, 6)} ${D}`],
          [T("Os pontos a essa distância do primeiro formam a circunferência:", "The points at that distance from the first one form the circle:"), circTex],
        ],
        note: T(`A distância entre (${fmt(x1)}, ${fmt(y1)}) e (${fmt(x2)}, ${fmt(y2)}) é ${fmt(d, 4)}${Number.isInteger(d) && Number.isInteger(dx) && Number.isInteger(dy) ? ` — um terno pitagórico: ${fmt(Math.abs(dx))}² + ${fmt(Math.abs(dy))}² = ${fmt(d)}²` : ""}. A circunferência é o conjunto de todos os pontos a essa mesma distância do centro, e a equação dela é a fórmula da distância elevada ao quadrado.`
          + ` Em mais dimensões, a conta é a mesma: some os quadrados das diferenças em cada eixo e tire a raiz. É a distância que algoritmos de agrupamento e de vizinhos mais próximos usam, e é parente do <a href="${PAGE("desvio-padrao")}">desvio padrão</a>, que também é a raiz de uma soma de quadrados.`,
          `The distance between (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2)}) is ${fmt(d, 4)}${Number.isInteger(d) && Number.isInteger(dx) && Number.isInteger(dy) ? ` — a Pythagorean triple: ${fmt(Math.abs(dx))}² + ${fmt(Math.abs(dy))}² = ${fmt(d)}²` : ""}. The circle is the set of all points at that same distance from the centre, and its equation is the distance formula squared.`
          + ` In more dimensions, the calculation is the same: add the squares of the differences along each axis and take the root. It is the distance clustering and nearest-neighbour algorithms use, and a relative of the <a href="${PAGE("desvio-padrao")}">standard deviation</a>, also the root of a sum of squares.`),
      };
    },

    vertice({ a, b, c }) {
      if (a === 0) return { error: T("Com a = 0, não há parábola: a função é uma reta.", "With a = 0, there is no parabola: the function is a line.") };
      const h = -b / (2 * a), D = b * b - 4 * a * c, k = -D / (4 * a);
      const f = x => a * x * x + b * x + c;
      const w = D > 0 ? Math.max(1, Math.sqrt(D) / Math.abs(2 * a) * 1.8) : Math.max(1, 2 / Math.sqrt(Math.abs(a)));
      const pts = Array.from({ length: 241 }, (_, i) => { const x = h - w + 2 * w * i / 240; return [x, f(x)]; });
      const ys = pts.map(p => p[1]).concat(0), yl = Math.min(...ys), yh = Math.max(...ys), yp = (yh - yl) * 0.08 || 1;
      const H = tone(texNum(h, 6), 2), K = tone(texNum(k, 6), 3);
      const can = `${texNum(a)}\\,(x ${h < 0 ? "+" : "-"} ${tone(texNum(Math.abs(h), 6), 2)})^2 ${k < 0 ? "-" : "+"} ${tone(texNum(Math.abs(k), 6), 3)}`;
      const rts = D > 0 ? [h - Math.sqrt(D) / Math.abs(2 * a), h + Math.sqrt(D) / Math.abs(2 * a)] : D === 0 ? [h] : [];
      return {
        result: `V = (${H},\\ ${K})`,
        chart: {
          type: "curve", label: T(`Parábola com vértice em (${fmt(h, 4)}, ${fmt(k, 4)}) e o eixo de simetria x = ${fmt(h, 4)}`, `Parabola with vertex at (${fmt(h, 4)}, ${fmt(k, 4)}) and the axis of symmetry x = ${fmt(h, 4)}`),
          xLabel: T("x · tracejada: o eixo de simetria · o ponto: o vértice", "x · dashed: the axis of symmetry · the dot: the vertex"),
          xMin: h - w, xMax: h + w, yMin: yl - yp, yMax: yh + yp, pts,
          lines: [{ pts: [[h, yl - yp * 0.9], [h, yh + yp * 0.9]], cls: "chart-ref" }], hlines: [{ y: 0, cls: "chart-ref" }], marker: [h, k],
          tipAt: x => [fmt(f(x), 4), `x = ${fmt(x, 3)}`],
        },
        steps: [
          [T("O vértice fica no meio das raízes, em x = −b / 2a:", "The vertex sits midway between the roots, at x = −b / 2a:"),
            `x_V = -\\dfrac{${paren(b, texNum(b))}}{2 \\cdot ${paren(a, texNum(a))}} ${approx(h, 6)} ${H}`],
          [T("A altura do vértice é o valor da função nesse ponto:", "The vertex's height is the function's value at that point:"),
            `y_V = f(${texNum(h, 6)}) = -\\dfrac{\\Delta}{4a} = -\\dfrac{${texNum(D, 6)}}{${texNum(4 * a, 6)}} ${approx(k, 6)} ${K}`],
          [T("Na forma canônica, o vértice aparece direto:", "In vertex form, the vertex shows up directly:"), `f(x) = ${can}`],
        ],
        note: T(`Como a ${a > 0 ? "é positivo, a parábola abre para cima e o vértice é o ponto de <strong>mínimo</strong>" : "é negativo, a parábola abre para baixo e o vértice é o ponto de <strong>máximo</strong>"}: f(x) = ${fmt(k, 4)} em x = ${fmt(h, 4)}. ${rts.length === 2 ? `As raízes, ${fmt(rts[0], 4)} e ${fmt(rts[1], 4)}, ficam simétricas em torno de x = ${fmt(h, 4)}.` : rts.length === 1 ? "O vértice toca o eixo x: a raiz é dupla." : "A parábola não cruza o eixo x: não há raízes reais."} Veja as <a href="${PAGE("formula-quadratica")}?a=${a}&amp;b=${b}&amp;c=${c}">raízes pela fórmula quadrática</a>.`
          + ` O vértice é onde a inclinação é zero: a <a href="${PAGE("derivada")}">derivada</a> 2ax + b se anula em x = −b/2a. É a conta do lucro máximo, da altura máxima de um arremesso e da variância mínima.`,
          `Since a is ${a > 0 ? "positive, the parabola opens upward and the vertex is the <strong>minimum</strong>" : "negative, the parabola opens downward and the vertex is the <strong>maximum</strong>"}: f(x) = ${fmt(k, 4)} at x = ${fmt(h, 4)}. ${rts.length === 2 ? `The roots, ${fmt(rts[0], 4)} and ${fmt(rts[1], 4)}, are symmetric about x = ${fmt(h, 4)}.` : rts.length === 1 ? "The vertex touches the x axis: the root is double." : "The parabola doesn't cross the x axis: there are no real roots."} See the <a href="${PAGE("formula-quadratica")}?a=${a}&amp;b=${b}&amp;c=${c}">roots by the quadratic formula</a>.`
          + ` The vertex is where the slope is zero: the <a href="${PAGE("derivada")}">derivative</a> 2ax + b vanishes at x = −b/2a. It is the calculation for maximum profit, the peak height of a throw and minimum variance.`),
      };
    },

    binomio({ a, b, n }) {
      if (!Number.isInteger(n) || n < 0 || n > 30) return { error: T("O expoente n precisa ser um inteiro entre 0 e 30.", "The exponent n must be an integer between 0 and 30.") };
      const C = [1]; for (let k = 1; k <= n; k++) C.push(C[k - 1] * (n - k + 1) / k);
      const t = C.map((c, k) => c * a ** (n - k) * b ** k), sum = t.reduce((s, v) => s + v, 0), exact = (a + b) ** n;
      const pw = (base, e) => (e === 0 ? "" : e === 1 ? base : `${base}^{${e}}`);
      const sym = C.map((c, k) => `${c === 1 ? "" : texNum(c)}${pw("a", n - k)}${pw("b", k)}` || "1").join(" + ");
      const symShow = n <= 7 ? sym : C.slice(0, 3).map((c, k) => `${c === 1 ? "" : texNum(c)}${pw("a", n - k)}${pw("b", k)}`).join(" + ") + ` + \\cdots + ${pw("b", n)}`;
      const prob = a >= 0 && b >= 0 && Math.abs(a + b - 1) < 1e-9 && n >= 1;
      const neg = t.some(v => v < 0), lo = Math.min(0, ...t), hi = Math.max(0, ...t);
      return {
        result: `(${texNum(a)} + ${paren(b, texNum(b))})^{${n}} ${approx(exact, 6)} ${tone(texNum(exact, 6), 1)}`,
        chart: {
          type: "bars", label: T(`Os ${n + 1} termos da expansão de (${fmt(a)} + ${fmt(b)})^${n}`, `The ${n + 1} terms of the expansion of (${fmt(a)} + ${fmt(b)})^${n}`),
          xLabel: T("k · altura: o termo C(n, k) · aⁿ⁻ᵏ · bᵏ", "k · height: the term C(n, k) · aⁿ⁻ᵏ · bᵏ"),
          xs: t.map((_, k) => k), ys: t, xMin: -0.5, xMax: n + 0.5, ...(neg ? { yMin: lo * 1.08, yMax: hi * 1.08 || 1 } : { yMax: hi || 1 }),
          hi: () => false,
          tip: (k, v) => [fmt(v, 6), T(`k = ${k}: C(${n}, ${k}) = ${fmt(C[k])}`, `k = ${k}: C(${n}, ${k}) = ${fmt(C[k])}`)],
        },
        steps: [
          [T(`Os coeficientes são a linha ${n} do triângulo de Pascal, C(n, k):`, `The coefficients are row ${n} of Pascal's triangle, C(n, k):`),
            n <= 14 ? tone(C.map(c => texNum(c)).join(",\\ "), 2) : tone(`${C.slice(0, 4).map(c => texNum(c)).join(",\\ ")},\\ \\ldots`, 2)],
          [T("Expanda: em cada termo, os expoentes de a e b somam n.", "Expand: in each term, the exponents of a and b add up to n."), `(a + b)^{${n}} = ${symShow}`],
          [T("Com os valores de a e b, cada termo vale:", "With the values of a and b, each term is:"),
            t.slice(0, 7).map((v, k) => `${texNum(v, 6)}`).join(" + ") + (n > 6 ? " + \\cdots" : "") + ` ${approx(sum, 6)} ${tone(texNum(sum, 6), 1)}`],
        ],
        note: T(`O coeficiente C(n, k) conta de quantas maneiras se escolhem os k fatores que contribuem com b, entre os n parênteses de (a + b)(a + b)⋯ — por isso é o <a href="${PAGE("coeficiente-binomial")}?n=${n}&amp;k=${Math.floor(n / 2)}">coeficiente binomial</a>. Os coeficientes somam 2ⁿ = ${fmt(2 ** n)}, o caso a = b = 1.`
          + (prob ? ` Como a + b = 1, cada termo é uma probabilidade: a chance de k sucessos em ${n} tentativas com probabilidade ${fmt(b)} — a <a href="${PAGE("distribuicao-binomial")}?n=${n}&amp;p=${b}&amp;k=${Math.round(n * b)}">distribuição binomial</a>. E a soma dá 1, como tem de dar.` : " Se a e b forem probabilidades que somam 1, os termos viram a distribuição binomial e somam 1."),
          `The coefficient C(n, k) counts the ways to choose the k factors that contribute b among the n brackets of (a + b)(a + b)⋯ — which is why it is the <a href="${PAGE("coeficiente-binomial")}?n=${n}&amp;k=${Math.floor(n / 2)}">binomial coefficient</a>. The coefficients add up to 2ⁿ = ${fmt(2 ** n)}, the case a = b = 1.`
          + (prob ? ` Since a + b = 1, each term is a probability: the chance of k successes in ${n} trials with probability ${fmt(b)} — the <a href="${PAGE("distribuicao-binomial")}?n=${n}&amp;p=${b}&amp;k=${Math.round(n * b)}">binomial distribution</a>. And the sum is 1, as it must be.` : " If a and b are probabilities that add up to 1, the terms become the binomial distribution and add up to 1.")),
      };
    },

    dizima({ I, ante, per }) {
      if (!Number.isInteger(I) || I < 0 || I > 1e9) return { error: T("A parte inteira precisa ser um inteiro entre 0 e 1 bilhão.", "The whole part must be an integer between 0 and 1 billion.") };
      if (!/^\d{0,8}$/.test(ante)) return { error: T("O anteperíodo precisa ter só dígitos, no máximo 8, ou ficar em branco.", "The non-repeating part must be digits only, at most 8, or blank.") };
      if (!/^\d{1,8}$/.test(per)) return { error: T("O período precisa ter de 1 a 8 dígitos.", "The repeating block must have 1 to 8 digits.") };
      const m = ante.length, k = per.length;
      const big = s => BigInt(s || "0");
      let N = big(`${I}${ante}${per}`) - big(`${I}${ante}`), D = (10n ** BigInt(k) - 1n) * 10n ** BigInt(m);
      const g0 = (x, y) => { while (y) [x, y] = [y, x % y]; return x; };
      const g = g0(N, D), Nr = N / g, Dr = D / g;
      const dec = T("{,}", ".");
      const xTex = `${I}${dec}${ante}\\overline{${per}}`;
      const xTxt = `${I}${T(",", ".")}${ante}${per}${per}${per}…`;
      const nines = "9".repeat(k) + "0".repeat(m);
      const value = Number(Nr) / Number(Dr);
      const P = Number(per), a1 = P / 10 ** (m + k), r = 10 ** -k, base = I + (m ? Number(ante) / 10 ** m : 0);
      const S = j => base + a1 * (1 - r ** j) / (1 - r);
      const js = Array.from({ length: 6 }, (_, i) => i + 1);
      const s1 = S(1), lim = value, gap = Math.max(lim - s1, 1e-12);
      const fracTex = Dr === 1n ? `${Nr}` : `\\dfrac{${Nr}}{${Dr}}`;
      const allNine = /^9+$/.test(per);
      return {
        result: `${xTex} = ${tone(fracTex, 1)}`,
        chart: {
          type: "curve", label: T(`Somas parciais da PG que forma ${xTxt}, chegando a ${Dr === 1n ? String(Nr) : `${Nr}/${Dr}`}`, `Partial sums of the geometric series that forms ${xTxt}, approaching ${Dr === 1n ? String(Nr) : `${Nr}/${Dr}`}`),
          xLabel: T("quantas repetições do período · tracejada: o valor exato", "how many repetitions of the block · dashed: the exact value"),
          xMin: 1, xMax: 6, yMin: s1 - gap * 0.15, yMax: lim + gap * 0.15, pts: js.map(j => [j, S(j)]),
          hlines: [{ y: lim, cls: "chart-ref" }],
          tipAt: v => { const j = Math.max(1, Math.round(v)); return [fmt(S(j), 12), T(`com ${j} ${j === 1 ? "repetição" : "repetições"}; falta ${lim - S(j) > 1e-15 ? fmtSci(lim - S(j)) : "0"}`, `with ${j} ${j === 1 ? "repetition" : "repetitions"}; missing ${lim - S(j) > 1e-15 ? fmtSci(lim - S(j)) : "0"}`)]; },
        },
        steps: [
          [T("O período se repete como os termos de uma PG, cada um 10ᵏ vezes menor que o anterior:", "The block repeats like the terms of a geometric series, each 10ᵏ times smaller than the last:"),
            `${xTex} = ${ante ? `${I}${dec}${ante}` : I} + \\dfrac{${per}}{10^{${m + k}}} + \\dfrac{${per}}{10^{${m + 2 * k}}} + \\cdots, \\qquad ${tone(`a = \\dfrac{${per}}{10^{${m + k}}}`, 2)},\\ ${tone(`r = 10^{-${k}}`, 3)}`],
          [T("A soma da PG infinita é a / (1 − r):", "The infinite series sums to a / (1 − r):"),
            `\\dfrac{${tone(`${per} / 10^{${m + k}}`, 2)}}{${tone(`1 - 10^{-${k}}`, 3)}} = \\dfrac{${per}}{${nines}}`],
          [T("Junte tudo numa fração — o atalho é: número sem a vírgula, menos o que vem antes do período, sobre tantos noves quantos dígitos tem o período, seguidos de tantos zeros quantos tem o anteperíodo:", "Put it all in one fraction — the shortcut is: the number without the decimal point, minus what comes before the block, over as many nines as the block has digits, followed by as many zeros as the non-repeating part has:"),
            `\\dfrac{${I}${ante}${per} - ${I}${ante || ""}}{${nines}} = \\dfrac{${N}}{${D}}${g > 1n ? ` = ${tone(fracTex, 1)}` : ""}`],
        ],
        note: (allNine ? T(`Aqui o período é só de noves, e a fração dá ${Dr === 1n ? `exatamente ${Nr}` : `${Nr}/${Dr}, um decimal finito`}: ${xTxt} e ${fmt(value, 8)} são o mesmo número, escrito de dois jeitos. Não é que "chega perto": a soma infinita é, por definição, o limite das somas parciais, e esse limite é exatamente esse valor. Se fossem diferentes, haveria um número entre eles — e não há.`,
            `Here the block is all nines, and the fraction comes out ${Dr === 1n ? `as exactly ${Nr}` : `as ${Nr}/${Dr}, a terminating decimal`}: ${xTxt} and ${fmt(value, 8)} are the same number, written two ways. It doesn't "get close": the infinite sum is, by definition, the limit of the partial sums, and that limit is exactly this value. If they were different, there would be a number between them — and there isn't.`)
          : T(`A dízima ${xTxt} é a fração ${Dr === 1n ? Nr : `${Nr}/${Dr}`}. Toda dízima periódica é uma fração, e toda fração é um decimal finito ou uma dízima periódica: é isso que distingue os racionais dos irracionais, como √2 e π, cujos dígitos nunca se repetem em bloco.`,
            `The repeating decimal ${xTxt} is the fraction ${Dr === 1n ? Nr : `${Nr}/${Dr}`}. Every repeating decimal is a fraction, and every fraction is a terminating or a repeating decimal: that is what separates rationals from irrationals, such as √2 and π, whose digits never repeat in a block.`))
          + T(` A conta é a da <a href="${PAGE("soma-pg")}?a=${a1}&amp;r=${r}&amp;n=10">soma da progressão geométrica</a> com razão ${fmt(r, 10)}: como |r| < 1, a soma infinita converge.`,
            ` The calculation is the <a href="${PAGE("soma-pg")}?a=${a1}&amp;r=${r}&amp;n=10">geometric series sum</a> with ratio ${fmt(r, 10)}: since |r| < 1, the infinite sum converges.`),
      };
    },

    matmul({ A, B }) {
      const ok = M => M.length === 2 && M.every(r => r.length === 2);
      if (!ok(A) || !ok(B)) return { error: T("Cada matriz precisa ter 2 linhas de 2 números, como 2 0; 0 1.", "Each matrix must have 2 rows of 2 numbers, such as 2 0; 0 1.") };
      const mul = (P, Q) => [[P[0][0] * Q[0][0] + P[0][1] * Q[1][0], P[0][0] * Q[0][1] + P[0][1] * Q[1][1]], [P[1][0] * Q[0][0] + P[1][1] * Q[1][0], P[1][0] * Q[0][1] + P[1][1] * Q[1][1]]];
      const AB = mul(A, B), BA = mul(B, A);
      const det = M => M[0][0] * M[1][1] - M[0][1] * M[1][0];
      const mat = (M, t) => `\\begin{pmatrix} ${M.map(r => r.map(v => (t ? t(v) : texNum(v, 6))).join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
      const sq = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
      const ap = (M, p) => p.map(([x, y]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y]);
      const pB = ap(B, sq), pAB = ap(AB, sq);
      const all = sq.concat(pB, pAB);
      const span = v => { const lo = Math.min(...v), hi = Math.max(...v), pad = (hi - lo) * 0.12 || 1; return [lo - pad, hi + pad]; };
      let [x0, x1] = span(all.map(p => p[0])), [yMin, yMax] = span(all.map(p => p[1]));
      const ratio = (640 - 48 - 14) / (280 - 14 - 34);
      if ((x1 - x0) / (yMax - yMin) < ratio) { const h = (yMax - yMin) * ratio / 2, mm = (x0 + x1) / 2; x0 = mm - h; x1 = mm + h; }
      else { const h = (x1 - x0) / ratio / 2, mm = (yMin + yMax) / 2; yMin = mm - h; yMax = mm + h; }
      const cell = (i, j) => `${paren(A[i][0], texNum(A[i][0]))} \\cdot ${paren(B[0][j], texNum(B[0][j]))} + ${paren(A[i][1], texNum(A[i][1]))} \\cdot ${paren(B[1][j], texNum(B[1][j]))}`;
      const same = AB.flat().every((v, i) => Math.abs(v - BA.flat()[i]) < 1e-12);
      return {
        result: `AB = ${tone(mat(AB), 1)}`,
        chart: {
          type: "curve", height: 280, label: T("O quadrado unitário, a sua imagem por B e a imagem por AB — primeiro B, depois A", "The unit square, its image under B and its image under AB — first B, then A"),
          xLabel: T("escura: quadrado unitário · tracejada: depois de B · colorida: depois de B e A, ou seja, AB", "dark: unit square · dashed: after B · colored: after B and then A, that is, AB"),
          xMin: x0, xMax: x1, yMin, yMax, pts: pAB, lines: [{ pts: sq, cls: "chart-fit" }, { pts: pB, cls: "chart-ref" }],
        },
        steps: [
          [T("Cada elemento de AB é uma linha de A vezes uma coluna de B: multiplique termo a termo e some.", "Each entry of AB is a row of A times a column of B: multiply term by term and add."),
            `\\begin{aligned} (AB)_{11} &= ${cell(0, 0)} = ${texNum(AB[0][0], 6)} \\\\ (AB)_{12} &= ${cell(0, 1)} = ${texNum(AB[0][1], 6)} \\\\ (AB)_{21} &= ${cell(1, 0)} = ${texNum(AB[1][0], 6)} \\\\ (AB)_{22} &= ${cell(1, 1)} = ${texNum(AB[1][1], 6)} \\end{aligned}`],
          [T("O resultado:", "The result:"), `${tone(mat(A), 2)} ${tone(mat(B), 3)} = ${tone(mat(AB), 1)}`],
          [T("Na ordem inversa:", "In the reverse order:"), `BA = ${mat(BA)}`],
          [T("O determinante do produto é o produto dos determinantes:", "The determinant of the product is the product of the determinants:"),
            `\\det(AB) = ${texNum(det(A), 6)} \\cdot ${paren(det(B), texNum(det(B), 6))} = ${texNum(det(AB), 6)}`],
        ],
        note: T(`Multiplicar matrizes é compor transformações: AB aplica primeiro B e depois A, por isso o gráfico mostra o quadrado passando por B (tracejado) antes de chegar a AB. ${same ? "Aqui, AB e BA dão o mesmo — as duas transformações comutam, o que é a exceção." : "Aqui, AB ≠ BA: girar e depois esticar não é o mesmo que esticar e depois girar. A ordem importa, e essa é a grande diferença em relação aos números."}`
          + ` As áreas se multiplicam: det(AB) = det A · det B. Por isso o produto só tem <a href="${PAGE("matriz-inversa-2x2")}">inversa</a> se as duas têm, e (AB)⁻¹ = B⁻¹A⁻¹ — desfaz-se na ordem contrária.`,
          `Multiplying matrices composes transformations: AB applies B first and then A, which is why the chart shows the square going through B (dashed) before reaching AB. ${same ? "Here, AB and BA are the same — the two transformations commute, which is the exception." : "Here, AB ≠ BA: rotating then stretching is not the same as stretching then rotating. Order matters, and that is the big difference from numbers."}`
          + ` Areas multiply: det(AB) = det A · det B. That is why the product only has an <a href="${PAGE("matriz-inversa-2x2")}">inverse</a> if both do, and (AB)⁻¹ = B⁻¹A⁻¹ — undone in the opposite order.`),
      };
    },

    modulo({ a, r, tipo }) {
      if (r < 0) return { error: T("O raio r não pode ser negativo: um módulo nunca é menor que zero.", "The radius r can't be negative: an absolute value is never below zero.") };
      const menor = tipo === "menor";
      const lo = a - r, hi = a + r, w = Math.max(1, r) * 2.2;
      const x0 = a - w, x1 = a + w;
      const pts = Array.from({ length: 241 }, (_, i) => { const t = x0 + (x1 - x0) * i / 240; return [t, Math.abs(t - a)]; });
      const L = tone(texNum(lo, 6), 2), H = tone(texNum(hi, 6), 3);
      const sol = menor ? `${L} \\le x \\le ${H}` : `x \\le ${L} \\ \\text{${T("ou", "or")}}\\ x \\ge ${H}`;
      const solTxt = menor ? T(`de ${fmt(lo, 4)} a ${fmt(hi, 4)}`, `from ${fmt(lo, 4)} to ${fmt(hi, 4)}`) : T(`até ${fmt(lo, 4)} ou a partir de ${fmt(hi, 4)}`, `up to ${fmt(lo, 4)} or from ${fmt(hi, 4)} on`);
      const xa = a === 0 ? "x" : `x ${a < 0 ? "+" : "-"} ${texNum(Math.abs(a))}`;
      const ineq = `|${xa}| ${menor ? "\\le" : "\\ge"} ${texNum(r)}`;
      return {
        result: `${ineq} \\iff ${sol}`,
        chart: {
          type: "curve", label: T(`A função |x − ${fmt(a)}| e a linha y = ${fmt(r)}; sombreados, os x ${solTxt}`, `The function |x − ${fmt(a)}| and the line y = ${fmt(r)}; shaded, the x ${solTxt}`),
          xLabel: T(`x · tracejada: y = r · sombreado: a solução, ${solTxt}`, `x · dashed: y = r · shaded: the solution, ${solTxt}`),
          xMin: x0, xMax: x1, yMax: w, pts, hlines: [{ y: r, cls: "chart-ref" }],
          shadeRanges: menor ? [[lo, hi]] : [[x0, lo], [hi, x1]],
          tipAt: t => [`|x − ${fmt(a)}| = ${fmt(Math.abs(t - a), 4)}`, `x = ${fmt(t, 3)}: ${(menor ? Math.abs(t - a) <= r : Math.abs(t - a) >= r) ? T("satisfaz", "satisfies") : T("não satisfaz", "doesn't satisfy")}`],
        },
        steps: [
          [T(`|x − a| é a distância de x até ${fmt(a)} na reta. A desigualdade pede os x a uma distância ${menor ? "de no máximo" : "de pelo menos"} ${fmt(r)}:`, `|x − a| is the distance from x to ${fmt(a)} on the line. The inequality asks for the x at a distance of ${menor ? "at most" : "at least"} ${fmt(r)}:`),
            menor ? `-${texNum(r)} \\le ${xa} \\le ${texNum(r)}` : `${xa} \\le -${texNum(r)} \\ \\text{${T("ou", "or")}}\\ ${xa} \\ge ${texNum(r)}`],
          [T(`Some ${fmt(a)} em todos os lados:`, `Add ${fmt(a)} to every side:`), sol],
        ],
        note: (menor ? T(`A solução é o intervalo ${solTxt}, centrado em ${fmt(a)} e de raio ${fmt(r)}: tudo o que está perto o bastante do centro. É a forma de uma tolerância — uma peça de ${fmt(a)} mm aceita com folga de ${fmt(r)} mm — e de uma <a href="${PAGE("margem-de-erro")}">margem de erro</a>: dizer que |p̂ − p| ≤ E é dizer que p está entre p̂ − E e p̂ + E.`,
            `The solution is the interval ${solTxt}, centred on ${fmt(a)} with radius ${fmt(r)}: everything close enough to the centre. It is the shape of a tolerance — a ${fmt(a)} mm part accepted within ${fmt(r)} mm — and of a <a href="${PAGE("margem-de-erro")}">margin of error</a>: saying |p̂ − p| ≤ E is saying p lies between p̂ − E and p̂ + E.`)
          : T(`A solução é tudo o que fica longe do centro: ${solTxt}, duas semirretas. É a forma de uma região de rejeição num teste bilateral, |z| ≥ 1,96: os resultados a mais de 1,96 desvios do centro, para qualquer lado.`,
            `The solution is everything far from the centre: ${solTxt}, two rays. It is the shape of a rejection region in a two-sided test, |z| ≥ 1.96: results more than 1.96 standard deviations from the centre, on either side.`))
          + T(" No gráfico, a função |x − a| é um V com a ponta em a; a solução são os x em que o V fica " + (menor ? "abaixo" : "acima") + " da linha tracejada.",
            " On the chart, the function |x − a| is a V with its tip at a; the solution is the x where the V lies " + (menor ? "below" : "above") + " the dashed line."),
      };
    },

    funcexp({ b, x }) {
      if (!(b > 0) || b === 1) return { error: T("A base precisa ser positiva e diferente de 1.", "The base must be positive and different from 1.") };
      if (Math.abs(x * Math.log(b)) > 50) return { error: T("Esse expoente dá um número grande ou pequeno demais para o gráfico; use |x · ln b| até 50.", "That exponent gives a number too large or too small for the chart; keep |x · ln b| up to 50."), };
      const y = b ** x, lb = Math.log(b);
      const ratio = (640 - 48 - 14) / (280 - 14 - 34);
      const R = Math.min(12, Math.max(3, Math.abs(x) + 1, Math.min(y, 10) + 1));
      // Mesma escala nos dois eixos, com folga para o ponto e o seu reflexo.
      const Y0 = -R * 0.45, Y1 = R * 1.05, Wd = (Y1 - Y0) * ratio, X0 = -Wd * 0.35, X1 = X0 + Wd;
      const inY = p => p[1] >= Y0 && p[1] <= Y1;
      const ex = Array.from({ length: 401 }, (_, i) => { const t = X0 + (X1 - X0) * i / 400; return [t, b ** t]; }).filter(inY);
      const lg = Array.from({ length: 401 }, (_, i) => { const t = 1e-4 + X1 * i / 400; return [t, Math.log(t) / lb]; }).filter(inY);
      const diag = [[Math.max(X0, Y0), Math.max(X0, Y0)], [Math.min(X1, Y1), Math.min(X1, Y1)]];
      const show = Math.abs(y) <= Y1 && Math.abs(x) <= X1;
      const B = texNum(b), Xt = tone(texNum(x, 6), 2), Yt = tone(texNum(y, 6), 1);
      return {
        result: `${paren(b, B)}^{${texNum(x, 6)}} ${approx(y, 6)} ${Yt}, \\qquad \\log_{${B}} ${texNum(y, 6)} = ${Xt}`,
        chart: {
          type: "curve", height: 280, label: T(`A exponencial ${fmt(b)}^x e a sua inversa, o logaritmo na base ${fmt(b)}, espelhadas na reta y = x`, `The exponential ${fmt(b)}^x and its inverse, the base-${fmt(b)} logarithm, mirrored in the line y = x`),
          xLabel: T("colorida: a exponencial · escura: o logaritmo · tracejada: y = x, o espelho", "colored: the exponential · dark: the logarithm · dashed: y = x, the mirror"),
          xMin: X0, xMax: X1, yMin: Y0, yMax: Y1, pts: ex,
          lines: [{ pts: lg, cls: "chart-fit" }, { pts: diag, cls: "chart-ref" }, ...(show ? [{ pts: [[x, y], [y, x]], cls: "chart-ref" }] : [])],
          hlines: [{ y: 0, cls: "chart-ref" }], marker: show ? [x, y] : null,
          tipAt: t => [`${fmt(b)}^x = ${fmt(b ** t, 4)}`, t > 0 ? `x = ${fmt(t, 3)} · log = ${fmt(Math.log(t) / lb, 4)}` : `x = ${fmt(t, 3)}`],
        },
        steps: [
          [T(`Eleve a base ao expoente:`, `Raise the base to the exponent:`), `${paren(b, B)}^{${Xt}} = e^{${texNum(x, 6)} \\cdot \\ln ${B}} ${approx(y, 6)} ${Yt}`],
          [T("O logaritmo desfaz a exponencial e devolve o expoente:", "The logarithm undoes the exponential and gives back the exponent:"),
            `\\log_{${B}} ${Yt} = \\dfrac{\\ln ${texNum(y, 6)}}{\\ln ${B}} ${approx(x, 6)} ${Xt}`],
          [T(`Somar no expoente é multiplicar na exponencial — e o logaritmo faz o caminho contrário:`, `Adding in the exponent is multiplying in the exponential — and the logarithm goes the other way:`),
            `b^{x + y} = b^x \\cdot b^y \\iff \\log_b (uv) = \\log_b u + \\log_b v`],
        ],
        note: T(`Com base ${b > 1 ? "maior que 1, a exponencial cresce" : "entre 0 e 1, a exponencial decresce"}: cada passo de 1 em x multiplica o valor por ${fmt(b, 4)}. O logaritmo é a função inversa: troca x e y, e o gráfico dele é o da exponencial espelhado na reta y = x — o ponto (${fmt(x, 3)}, ${fmt(y, 3)}) de uma vira (${fmt(y, 3)}, ${fmt(x, 3)}) na outra.`
          + ` A exponencial é sempre positiva e passa por (0, 1); o logaritmo só existe para x > 0 e passa por (1, 0). Entre todas as bases, a de <a href="${PAGE("numero-e")}">e ≈ 2,718</a> é a natural: é a única em que a inclinação da curva é igual à própria altura. Para quanto tempo leva para dobrar, veja o <a href="${PAGE("tempo-duplicacao")}">tempo de duplicação</a>; para trocar de base, a <a href="${PAGE("logaritmo-mudanca-base")}">mudança de base</a>.`,
          `With a base ${b > 1 ? "greater than 1, the exponential grows" : "between 0 and 1, the exponential decays"}: each step of 1 in x multiplies the value by ${fmt(b, 4)}. The logarithm is the inverse function: it swaps x and y, and its graph is the exponential's mirrored in the line y = x — the point (${fmt(x, 3)}, ${fmt(y, 3)}) on one becomes (${fmt(y, 3)}, ${fmt(x, 3)}) on the other.`
          + ` The exponential is always positive and passes through (0, 1); the logarithm only exists for x > 0 and passes through (1, 0). Of all the bases, <a href="${PAGE("numero-e")}">e ≈ 2.718</a> is the natural one: the only one where the curve's slope equals its own height. For how long it takes to double, see the <a href="${PAGE("tempo-duplicacao")}">doubling time</a>; to switch bases, the <a href="${PAGE("logaritmo-mudanca-base")}">change of base</a>.`),
      };
    },

    pa2({ x, n }) {
      if (x.length < 3) return { error: T("Informe pelo menos os três primeiros termos.", "Enter at least the first three terms.") };
      if (x.length > 50) return { error: T("Use no máximo 50 termos.", "Use at most 50 terms.") };
      if (!Number.isInteger(n) || n < 1 || n > 1e6) return { error: T("A posição n precisa ser um inteiro entre 1 e 1 milhão.", "The position n must be an integer between 1 and 1 million.") };
      const d1 = x.slice(1).map((v, i) => v - x[i]), d2 = d1.slice(1).map((v, i) => v - d1[i]);
      const D1 = d1[0], D2 = d2[0];
      const ok = d2.every(v => Math.abs(v - D2) < 1e-9 * Math.max(1, Math.abs(D2)));
      const term = k => x[0] + (k - 1) * D1 + (k - 1) * (k - 2) / 2 * D2;
      const an = term(n), Sn = n * x[0] + n * (n - 1) / 2 * D1 + n * (n - 1) * (n - 2) / 6 * D2;
      const m = Math.min(Math.max(n, x.length), 40), ks = Array.from({ length: m }, (_, i) => i + 1), ys = ks.map(term);
      const neg = ys.some(v => v < 0);
      const row = (lab, v) => `${lab} & ${v.slice(0, 8).map(u => texNum(u, 6)).join(" & ")}${v.length > 8 ? " & \\cdots" : ""}`;
      const N = tone(texNum(n), 0);
      return {
        result: `a_{${texNum(n)}} ${approx(an, 6)} ${tone(texNum(an, 6), 1)}, \\qquad S_{${texNum(n)}} ${approx(Sn, 6)} ${texNum(Sn, 6)}`,
        chart: {
          type: "bars", label: T(`Os primeiros ${m} termos da sequência`, `The first ${m} terms of the sequence`),
          xLabel: T(`posição · destaque: o termo ${fmt(n)}${n > m ? " (fora do gráfico)" : ""}`, `position · highlighted: term ${fmt(n)}${n > m ? " (off the chart)" : ""}`),
          xs: ks, ys, xMin: 0.5, xMax: m + 0.5, ...(neg ? { yMin: Math.min(...ys) * 1.08, yMax: Math.max(0, ...ys) * 1.08 || 1 } : { yMax: Math.max(...ys) || 1 }),
          hi: k => k === n,
          tip: (k, v) => [fmt(v, 6), T(`termo ${k}`, `term ${k}`)],
        },
        steps: [
          [T("Tire as diferenças entre termos vizinhos, e depois as diferenças das diferenças:", "Take the differences between neighbouring terms, and then the differences of the differences:"),
            `\\begin{array}{l|${"c".repeat(Math.min(x.length, 8) + (x.length > 8 ? 1 : 0))}} ${row("a_n", x)} \\\\ ${row("\\Delta", d1)} \\\\ ${row("\\Delta^2", d2)} \\end{array}`],
          [T(ok ? "As segundas diferenças são constantes: é uma progressão de segunda ordem, com" : "As segundas diferenças não são todas iguais; usando só os três primeiros termos,", ok ? "The second differences are constant: it is a second-order progression, with" : "The second differences aren't all equal; using just the first three terms,"),
            `\\Delta_1 = ${tone(texNum(D1, 6), 2)}, \\qquad \\Delta_2 = ${tone(texNum(D2, 6), 3)}`],
          [T(`O termo na posição ${fmt(n)}:`, `The term at position ${fmt(n)}:`),
            `a_{${N}} = ${texNum(x[0], 6)} + (${N} - 1) \\cdot ${tone(texNum(D1, 6), 2)} + \\dfrac{(${N} - 1)(${N} - 2)}{2} \\cdot ${tone(texNum(D2, 6), 3)} ${approx(an, 6)} ${tone(texNum(an, 6), 1)}`],
          [T(`A soma dos ${fmt(n)} primeiros termos:`, `The sum of the first ${fmt(n)} terms:`),
            `S_{${N}} = ${N} \\cdot ${texNum(x[0], 6)} + \\dbinom{${N}}{2} \\cdot ${texNum(D1, 6)} + \\dbinom{${N}}{3} \\cdot ${texNum(D2, 6)} ${approx(Sn, 6)} ${texNum(Sn, 6)}`],
        ],
        note: T(`Numa <a href="${PAGE("soma-pa")}">progressão aritmética</a>, as diferenças são constantes e o termo cresce em linha reta. Aqui são as diferenças das diferenças que se repetem, e o termo geral é um polinômio de grau 2 em n: o gráfico curva como uma parábola.`
          + ` O caso clássico são os números triangulares, 1, 3, 6, 10…: Tₙ = n(n + 1)/2, as bolas num triângulo de n linhas. Também é o número de apertos de mão entre n + 1 pessoas, o <a href="${PAGE("coeficiente-binomial")}?n=${Math.min(n + 1, 1000)}&amp;k=2">coeficiente binomial</a> C(n + 1, 2).`
          + (ok ? "" : ` ${warn} as segundas diferenças variam, então a sequência não é de segunda ordem; a fórmula usa só os três primeiros termos e não reproduz os demais.`),
          `In an <a href="${PAGE("soma-pa")}">arithmetic progression</a>, the differences are constant and the term grows in a straight line. Here it is the differences of the differences that repeat, and the general term is a degree-2 polynomial in n: the chart curves like a parabola.`
          + ` The classic case is the triangular numbers, 1, 3, 6, 10…: Tₙ = n(n + 1)/2, the balls in a triangle with n rows. It is also the number of handshakes among n + 1 people, the <a href="${PAGE("coeficiente-binomial")}?n=${Math.min(n + 1, 1000)}&amp;k=2">binomial coefficient</a> C(n + 1, 2).`
          + (ok ? "" : ` ${warn} the second differences vary, so the sequence isn't second-order; the formula uses only the first three terms and doesn't reproduce the rest.`)),
      };
    },

    kruskal({ o }) {
      const k = o.length;
      if (k < 2) return { error: T("Informe pelo menos dois grupos, um por linha, separados por ponto e vírgula.", "Enter at least two groups, one per row, separated by semicolons.") };
      if (k > 12) return { error: T("Use no máximo 12 grupos.", "Use at most 12 groups.") };
      if (o.some(g => g.length < 1)) return { error: T("Cada grupo precisa de pelo menos um valor.", "Each group needs at least one value.") };
      const all = o.flatMap((g, j) => g.map(v => [v, j])).sort((p, q) => p[0] - q[0]);
      const N = all.length;
      if (N > 2000) return { error: T("Use no máximo 2.000 valores ao todo.", "Use at most 2,000 values in all.") };
      if (N < 3) return { error: T("Use pelo menos três valores ao todo.", "Use at least three values in all.") };
      const R = new Array(k).fill(0), ns = o.map(g => g.length);
      let ties = 0;
      for (let i = 0; i < N;) { let j = i; while (j + 1 < N && all[j + 1][0] === all[i][0]) j++; const t = j - i + 1; ties += t ** 3 - t; for (let m = i; m <= j; m++) R[all[m][1]] += (i + j) / 2 + 1; i = j + 1; }
      const C = 1 - ties / (N ** 3 - N);
      if (C <= 0) return { error: T("Todos os valores são iguais: não há postos para comparar.", "All values are equal: there are no ranks to compare.") };
      const sumR = R.reduce((s, r, j) => s + r * r / ns[j], 0);
      const H0 = 12 / (N * (N + 1)) * sumR - 3 * (N + 1), H = H0 / C, df = k - 1;
      const p = chiSurvival(H, df), eps = H / (N - 1);
      const mr = R.map((r, j) => r / ns[j]);
      const flat = o.flat(), lo = Math.min(...flat), hi = Math.max(...flat), span = hi - lo || 1;
      const boxes = o.map((g, i) => ({ ...boxStats(g), label: `${T("Grupo", "Group")} ${i + 1}` }));
      const Ht = tone(texNum(H, 4), 1);
      const rows = R.map((r, j) => `${j + 1} & ${ns[j]} & ${tone(texNum(r), 2)} & ${texNum(mr[j], 3)}`).join(" \\\\ ");
      const veredito = p < 0.05
        ? T("Ao nível de 5%, rejeita-se H₀: pelo menos um grupo tende a ter valores maiores que outro. Para saber quais, o seguimento usual é o teste de Dunn.", "At the 5% level, H₀ is rejected: at least one group tends to have larger values than another. To find which, the usual follow-up is Dunn's test.")
        : T("Ao nível de 5%, não se rejeita H₀: as diferenças entre os postos médios são compatíveis com o acaso.", "At the 5% level, H₀ is not rejected: the differences between the mean ranks are consistent with chance.");
      const enc = encodeURIComponent(o.map(g => g.join(" ")).join("; "));
      return {
        result: `H ${approx(H, 4)} ${Ht}, \\qquad p ${p < 1e-4 ? "<" : "\\approx"} ${p < 1e-4 ? "0{,}0001".replace("{,}", T("{,}", ".")) : texNum(p, 4)}`,
        chart: {
          type: "box", height: Math.min(360, 60 + k * 50), xMin: lo - span * 0.06, xMax: hi + span * 0.06, boxes,
          label: T(`Caixas dos ${k} grupos`, `Boxes of the ${k} groups`), xLabel: T("valores · uma caixa por grupo", "values · one box per group"),
        },
        steps: [
          [T(`Junte os ${N} valores, ordene e dê postos de 1 a ${N}; empates recebem a média dos postos que ocupariam. Some os postos de cada grupo:`, `Pool the ${N} values, sort them and rank them 1 to ${N}; ties get the average of the ranks they would take. Add up each group's ranks:`),
            `\\begin{array}{c|c|c|c} ${T("\\text{grupo}", "\\text{group}")} & n_j & R_j & R_j / n_j \\\\ \\hline ${rows} \\end{array}`],
          [T("Compare as somas de postos com o que se esperaria se os grupos fossem iguais:", "Compare the rank sums with what would be expected if the groups were the same:"),
            `H = \\dfrac{12}{${N} \\cdot ${N + 1}} \\left(${R.slice(0, 5).map((r, j) => `\\dfrac{${tone(texNum(r), 2)}^2}{${ns[j]}}`).join(" + ")}${k > 5 ? " + \\cdots" : ""}\\right) - 3 \\cdot ${N + 1} ${approx(H0, 4)} ${texNum(H0, 4)}`],
          ...(ties ? [[T("Com empates, divida pela correção:", "With ties, divide by the correction:"),
            `C = 1 - \\dfrac{${texNum(ties)}}{${N}^3 - ${N}} ${approx(C, 6)} ${texNum(C, 6)}, \\qquad H = \\dfrac{${texNum(H0, 4)}}{${texNum(C, 6)}} ${approx(H, 4)} ${Ht}`]] : []),
          [T(`Compare com a qui-quadrado com ${dof(df)}:`, `Compare with the chi-square with ${dof(df)}:`),
            `p = P(\\chi^2_{${df}} \\ge ${texNum(H, 4)}) ${p < 1e-4 ? "<" : "\\approx"} ${p < 1e-4 ? T("0{,}0001", "0.0001") : tone(texNum(p, 4), 3)}`],
        ],
        note: `${veredito} `
          + T(`O tamanho do efeito ε² = H/(N − 1) ≈ ${fmt(eps, 3)}. O teste usa só a ordem dos valores, então resiste a valores extremos e não supõe normalidade — é a <a href="${PAGE("anova-um-fator")}?o=${enc}">ANOVA de um fator</a> feita sobre postos, e, com dois grupos, equivale ao <a href="${PAGE("mann-whitney")}">Mann-Whitney</a>. A aproximação pela qui-quadrado pede uns cinco valores por grupo; com menos, o p é aproximado.`,
            `The effect size ε² = H/(N − 1) ≈ ${fmt(eps, 3)}. The test only uses the order of the values, so it resists extreme values and doesn't assume normality — it is the <a href="${PAGE("anova-um-fator")}?o=${enc}">one-way ANOVA</a> done on ranks, and, with two groups, it is equivalent to <a href="${PAGE("mann-whitney")}">Mann-Whitney</a>. The chi-square approximation wants about five values per group; with fewer, the p is approximate.`),
      };
    },

    reglog({ x, y, x0 }) {
      const n = x.length;
      if (n !== y.length) return { error: T(`Há ${n} valores de x e ${y.length} de y; as listas precisam ter o mesmo tamanho.`, `There are ${n} values of x and ${y.length} of y; the lists must have the same length.`) };
      if (n < 4) return { error: T("Informe pelo menos quatro observações.", "Enter at least four observations.") };
      if (n > 1000) return { error: T("Use no máximo 1.000 observações.", "Use at most 1,000 observations.") };
      if (y.some(v => v !== 0 && v !== 1)) return { error: T("Os valores de y precisam ser 0 ou 1.", "The values of y must be 0 or 1.") };
      const s1 = y.reduce((s, v) => s + v, 0);
      if (s1 === 0 || s1 === n) return { error: T("Todos os y são iguais: é preciso ter zeros e uns.", "All the y are the same: there must be both zeros and ones.") };
      if (x0 != null && x0.length > 1) return { error: T("Informe um único x para a previsão, ou deixe em branco.", "Enter a single x for the prediction, or leave it blank.") };
      const sig = z => 1 / (1 + Math.exp(-z));
      let b0 = Math.log(s1 / (n - s1)), b1 = 0, it = 0, I = null;
      for (; it < 100; it++) {
        let g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
        x.forEach((v, i) => { const p = sig(b0 + b1 * v), w = p * (1 - p); g0 += y[i] - p; g1 += (y[i] - p) * v; h00 += w; h01 += w * v; h11 += w * v * v; });
        const det = h00 * h11 - h01 * h01;
        if (!(det > 1e-300)) break;
        const d0 = (h11 * g0 - h01 * g1) / det, d1 = (h00 * g1 - h01 * g0) / det;
        b0 += d0; b1 += d1; I = [h00, h01, h11, det];
        if (Math.abs(d0) + Math.abs(d1) < 1e-10) break;
      }
      if (!I || !Number.isFinite(b1) || Math.abs(b1) > 1e3 || it >= 100) return { error: T("O ajuste não converge: provavelmente há separação perfeita — um valor de x divide os zeros dos uns sem nenhuma exceção, e o coeficiente iria ao infinito.", "The fit doesn't converge: there is probably perfect separation — some x value splits the zeros from the ones with no exception, and the coefficient would go to infinity.") };
      // Recalcula a informação no ponto final.
      let h00 = 0, h01 = 0, h11 = 0, LL = 0;
      x.forEach((v, i) => { const p = sig(b0 + b1 * v), w = p * (1 - p); h00 += w; h01 += w * v; h11 += w * v * v; LL += y[i] ? Math.log(p) : Math.log(1 - p); });
      const det = h00 * h11 - h01 * h01, se1 = Math.sqrt(h00 / det), se0 = Math.sqrt(h11 / det);
      const pb = s1 / n, LL0 = s1 * Math.log(pb) + (n - s1) * Math.log(1 - pb);
      const LR = 2 * (LL - LL0), pLR = chiSurvival(LR, 1), r2 = 1 - LL / LL0;
      const z = b1 / se1, pz = 2 * (1 - phi(Math.abs(z))), OR = Math.exp(b1);
      const lo = Math.min(...x), hi = Math.max(...x), pad = (hi - lo) * 0.1 || 1;
      const pts = Array.from({ length: 201 }, (_, i) => { const v = lo - pad + (hi - lo + 2 * pad) * i / 200; return [v, sig(b0 + b1 * v)]; });
      const B0 = tone(texNum(b0, 4), 2), B1 = tone(texNum(b1, 4), 3);
      const has = x0 != null && x0.length === 1, v0 = has ? x0[0] : null, p0 = has ? sig(b0 + b1 * v0) : null;
      const steps = [
        [T("Ajuste por máxima verossimilhança: o método de Newton parte de β₁ = 0 e corrige os coeficientes até a verossimilhança parar de subir.", "Fit by maximum likelihood: Newton's method starts from β₁ = 0 and corrects the coefficients until the likelihood stops rising."),
          `\\beta_0 ${approx(b0, 4)} ${B0}, \\qquad \\beta_1 ${approx(b1, 4)} ${B1} \\qquad (${it + 1}\\ ${T("\\text{iterações}", "\\text{iterations}")})`],
        [T("A razão de chances: cada unidade a mais de x multiplica as chances por e elevado a β₁.", "The odds ratio: each extra unit of x multiplies the odds by e to the β₁."),
          `OR = e^{${texNum(b1, 4)}} ${approx(OR, 4)} ${tone(texNum(OR, 4), 1)}, \\qquad IC_{95\\%} = ${interval(Math.exp(b1 - 1.96 * se1), Math.exp(b1 + 1.96 * se1))}`],
        [T("Teste de Wald para β₁ — o erro padrão sai da curvatura da verossimilhança:", "Wald test for β₁ — the standard error comes from the curvature of the likelihood:"),
          `z = \\dfrac{${texNum(b1, 4)}}{${texNum(se1, 4)}} ${approx(z, 4)} ${texNum(z, 4)}, \\qquad p ${approx(pz, 4)} ${texNum(pz, 4)}`],
        [T("Teste da razão de verossimilhança, contra o modelo sem x, e o R² de McFadden:", "Likelihood ratio test, against the model without x, and McFadden's R²:"),
          `G = 2(${texNum(LL, 4)} - ${paren(LL0, texNum(LL0, 4))}) ${approx(LR, 4)} ${texNum(LR, 4)}, \\quad p ${approx(pLR, 4)} ${texNum(pLR, 4)}, \\quad R^2_{\\text{McF}} ${approx(r2, 3)} ${texNum(r2, 3)}`],
      ];
      if (has) steps.push([T(`Probabilidade prevista em x = ${fmt(v0)}:`, `Predicted probability at x = ${fmt(v0)}:`),
        `\\hat{p} = \\dfrac{1}{1 + e^{-(${texNum(b0, 4)} ${b1 < 0 ? "-" : "+"} ${texNum(Math.abs(b1), 4)} \\cdot ${paren(v0, texNum(v0))})}} ${approx(p0, 4)} ${tone(texNum(p0, 4), 1)}`]);
      return {
        result: `\\ln\\dfrac{p}{1 - p} = ${B0} ${b1 < 0 ? "-" : "+"} ${tone(texNum(Math.abs(b1), 4), 3)}\\,x${has ? `, \\qquad \\hat{p}(${texNum(v0)}) ${approx(p0, 4)} ${texNum(p0, 4)}` : ""}`,
        chart: {
          type: "curve", label: T(`Curva logística ajustada a ${n} observações de 0 e 1`, `Logistic curve fitted to ${n} observations of 0 and 1`),
          xLabel: T("x · pontos: as observações (0 ou 1) · curva: a probabilidade ajustada", "x · dots: the observations (0 or 1) · curve: the fitted probability"),
          xMin: lo - pad, xMax: hi + pad, yMin: -0.08, yMax: 1.08, pts, dots: x.map((v, i) => [v, y[i]]),
          hlines: [{ y: 0.5, cls: "chart-ref" }], marker: has ? [v0, p0] : null,
          tipAt: v => [`p = ${fmt(sig(b0 + b1 * v), 4)}`, `x = ${fmt(v, 3)}`],
        },
        steps,
        note: T(`Cada unidade a mais de x multiplica as chances de y = 1 por ${fmt(OR, 3)}${OR > 1 ? `, um aumento de ${fmt((OR - 1) * 100, 1)}%` : `, uma queda de ${fmt((1 - OR) * 100, 1)}%`} — o efeito é constante nas chances, não na probabilidade, que segue a curva em S. A probabilidade cruza 50% em x = ${fmt(-b0 / b1, 3)}. Pela razão de verossimilhança, p ${pValueText(pLR)}${pLR < 0.05 ? ": x ajuda a prever y" : ": os dados não mostram efeito de x"}.`
          + ` Para explorar a curva com estes coeficientes, abra a <a href="${PAGE("funcao-logistica")}?b0=${Number(b0.toFixed(4))}&amp;b1=${Number(b1.toFixed(4))}&amp;x=${has ? v0 : Number((-b0 / b1).toFixed(3))}">função logística</a>. Com amostras pequenas, os testes de Wald e da razão de verossimilhança podem discordar; o segundo é mais confiável.`,
          `Each extra unit of x multiplies the odds of y = 1 by ${fmt(OR, 3)}${OR > 1 ? `, a ${fmt((OR - 1) * 100, 1)}% increase` : `, a ${fmt((1 - OR) * 100, 1)}% drop`} — the effect is constant on the odds, not on the probability, which follows the S curve. The probability crosses 50% at x = ${fmt(-b0 / b1, 3)}. By the likelihood ratio, p ${pValueText(pLR)}${pLR < 0.05 ? ": x helps predict y" : ": the data show no effect of x"}.`
          + ` To explore the curve with these coefficients, open the <a href="${PAGE("funcao-logistica")}?b0=${Number(b0.toFixed(4))}&amp;b1=${Number(b1.toFixed(4))}&amp;x=${has ? v0 : Number((-b0 / b1).toFixed(3))}">logistic function</a>. With small samples, the Wald and likelihood ratio tests can disagree; the second is more reliable.`),
      };
    },

    parcial({ x, y, z }) {
      const n = x.length;
      if (y.length !== n || z.length !== n) return { error: T("As três listas precisam ter o mesmo número de valores.", "The three lists must have the same number of values.") };
      if (n < 4) return { error: T("Informe pelo menos quatro observações.", "Enter at least four observations.") };
      if (n > 5000) return { error: T("Use no máximo 5.000 observações.", "Use at most 5,000 observations.") };
      const mean = a => a.reduce((s, v) => s + v, 0) / n;
      const mx = mean(x), my = mean(y), mz = mean(z);
      const cov = (a, ma, b, mb) => a.reduce((s, v, i) => s + (v - ma) * (b[i] - mb), 0);
      const sxx = cov(x, mx, x, mx), syy = cov(y, my, y, my), szz = cov(z, mz, z, mz);
      if (!sxx || !syy || !szz) return { error: T("Cada variável precisa variar: uma das listas tem todos os valores iguais.", "Each variable must vary: one of the lists has all values equal.") };
      const rxy = cov(x, mx, y, my) / Math.sqrt(sxx * syy), rxz = cov(x, mx, z, mz) / Math.sqrt(sxx * szz), ryz = cov(y, my, z, mz) / Math.sqrt(syy * szz);
      const den = (1 - rxz * rxz) * (1 - ryz * ryz);
      if (den <= 1e-14) return { error: T("z explica x ou y por completo (correlação ±1): não sobra nada para correlacionar.", "z fully explains x or y (correlation ±1): nothing is left to correlate.") };
      const r = (rxy - rxz * ryz) / Math.sqrt(den);
      const df = n - 3, t = r * Math.sqrt(df / Math.max(1e-300, 1 - r * r)), p = df > 0 ? tTwoTail(t, df) : NaN;
      // Resíduos de x e de y depois de tirar a reta em z.
      const bx = cov(x, mx, z, mz) / szz, by = cov(y, my, z, mz) / szz;
      const ex = x.map((v, i) => v - mx - bx * (z[i] - mz)), ey = y.map((v, i) => v - my - by * (z[i] - mz));
      const sl = ex.reduce((s, v, i) => s + v * ey[i], 0) / ex.reduce((s, v) => s + v * v, 0);
      const xl = Math.min(...ex), xh = Math.max(...ex), yl = Math.min(...ey), yh = Math.max(...ey);
      const px = (xh - xl) * 0.1 || 1, py = (yh - yl) * 0.1 || 1;
      const R1 = tone(texNum(rxy, 4), 2), R2 = tone(texNum(rxz, 4), 3), R3 = tone(texNum(ryz, 4), 4);
      return {
        result: `r_{xy \\cdot z} ${approx(r, 4)} ${tone(texNum(r, 4), 1)}, \\qquad r_{xy} ${approx(rxy, 4)} ${texNum(rxy, 4)}`,
        chart: {
          type: "curve", label: T("Resíduos de x contra resíduos de y, depois de tirar o efeito de z", "Residuals of x against residuals of y, after removing the effect of z"),
          xLabel: T("o que sobra de x sem z · altura: o que sobra de y sem z", "what is left of x without z · height: what is left of y without z"),
          xMin: xl - px, xMax: xh + px, yMin: yl - py, yMax: yh + py, pts: Array.from({ length: 101 }, (_, i) => { const v = xl - px + (xh - xl + 2 * px) * i / 100; return [v, sl * v]; }).filter(q => q[1] >= yl - py && q[1] <= yh + py),
          dots: ex.map((v, i) => [v, ey[i]]), hlines: [{ y: 0, cls: "chart-ref" }],
        },
        steps: [
          [T("Calcule as três correlações de Pearson, duas a duas:", "Compute the three Pearson correlations, pair by pair:"),
            `r_{xy} ${approx(rxy, 4)} ${R1}, \\qquad r_{xz} ${approx(rxz, 4)} ${R2}, \\qquad r_{yz} ${approx(ryz, 4)} ${R3}`],
          [T("Tire de r_xy a parte que passa por z e reescale:", "Remove from r_xy the part that goes through z and rescale:"),
            `r_{xy \\cdot z} = \\dfrac{${R1} - ${paren(rxz, R2)} \\cdot ${paren(ryz, R3)}}{\\sqrt{(1 - ${paren(rxz, texNum(rxz, 4))}^2)(1 - ${paren(ryz, texNum(ryz, 4))}^2)}} ${approx(r, 4)} ${tone(texNum(r, 4), 1)}`],
          ...(df > 0 ? [[T(`Teste se a correlação parcial é zero, com ${dof(df)} (perde-se um a mais, por z):`, `Test whether the partial correlation is zero, with ${dof(df)} (one more is lost, to z):`),
            `t = ${texNum(r, 4)} \\sqrt{\\dfrac{${df}}{1 - ${paren(r, texNum(r, 4))}^2}} ${approx(t, 4)} ${texNum(t, 4)}, \\qquad p ${approx(p, 4)} ${texNum(p, 4)}`]] : []),
        ],
        note: T(`Sem controlar nada, x e y têm correlação ${fmt(rxy, 3)}; mantendo z fixo, ela ${Math.abs(r) < Math.abs(rxy) * 0.5 ? "quase some" : Math.abs(r) < Math.abs(rxy) ? "diminui" : "não diminui"}: ${fmt(r, 3)}. ${Math.abs(r) < Math.abs(rxy) * 0.5 ? "Boa parte da relação entre x e y vinha de z, que mexe com as duas ao mesmo tempo — a correlação era, em grande parte, espúria." : "A relação entre x e y não se explica por z."}`
          + ` A correlação parcial é a correlação entre o que sobra de x e de y depois de tirar a reta de cada um em z — os pontos do gráfico. Ela só controla o que z explica em linha reta, e só controla z: outras variáveis de fora continuam podendo confundir. É a mesma ideia de pôr z como covariável numa regressão. Veja a <a href="${PAGE("coeficiente-pearson")}?x=${encodeURIComponent(x.join(" "))}&amp;y=${encodeURIComponent(y.join(" "))}">correlação simples de x e y</a> e o <a href="${PAGE("paradoxo-simpson")}">paradoxo de Simpson</a>.`
          + (df > 0 ? ` Teste: p ${pValueText(p)}.` : ""),
          `Without controlling for anything, x and y have a correlation of ${fmt(rxy, 3)}; holding z fixed, it ${Math.abs(r) < Math.abs(rxy) * 0.5 ? "almost disappears" : Math.abs(r) < Math.abs(rxy) ? "shrinks" : "doesn't shrink"}: ${fmt(r, 3)}. ${Math.abs(r) < Math.abs(rxy) * 0.5 ? "Much of the relationship between x and y came from z, which moves both at once — the correlation was largely spurious." : "The relationship between x and y isn't explained by z."}`
          + ` The partial correlation is the correlation between what is left of x and of y after removing each one's line in z — the chart's dots. It only controls for what z explains linearly, and only for z: other outside variables can still confound. It is the same idea as putting z as a covariate in a regression. See the <a href="${PAGE("coeficiente-pearson")}?x=${encodeURIComponent(x.join(" "))}&amp;y=${encodeURIComponent(y.join(" "))}">simple correlation of x and y</a> and <a href="${PAGE("paradoxo-simpson")}">Simpson's paradox</a>.`
          + (df > 0 ? ` Test: p ${pValueText(p)}.` : "")),
      };
    },

    predint({ x, y, x0, conf }) {
      const n = x.length;
      if (n !== y.length) return { error: T(`Há ${n} valores de x e ${y.length} de y; as listas precisam ter o mesmo tamanho.`, `There are ${n} values of x and ${y.length} of y; the lists must have the same length.`) };
      if (n < 3) return { error: T("Informe pelo menos três pares de valores.", "Enter at least three pairs of values.") };
      if (n > 5000) return { error: T("Use no máximo 5.000 pares.", "Use at most 5,000 pairs.") };
      if (conf <= 0 || conf >= 100) return confError;
      const mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
      const sxx = x.reduce((s, v) => s + (v - mx) ** 2, 0);
      if (!sxx) return { error: T("Todos os valores de x são iguais: não há reta.", "All values of x are equal: there is no line.") };
      const b1 = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / sxx, b0 = my - b1 * mx;
      const sse = y.reduce((s, v, i) => s + (v - b0 - b1 * x[i]) ** 2, 0), df = n - 2, s = Math.sqrt(sse / df);
      const tc = tCrit(1 - conf / 100, df);
      const yh = b0 + b1 * x0;
      const hm = s * Math.sqrt(1 / n + (x0 - mx) ** 2 / sxx), hp = s * Math.sqrt(1 + 1 / n + (x0 - mx) ** 2 / sxx);
      const lo = Math.min(...x, x0), hi = Math.max(...x, x0), pad = (hi - lo) * 0.08 || 1;
      const band = (k, sgn) => Array.from({ length: 121 }, (_, i) => { const v = lo - pad + (hi - lo + 2 * pad) * i / 120; return [v, b0 + b1 * v + sgn * tc * s * Math.sqrt(k + 1 / n + (v - mx) ** 2 / sxx)]; });
      const bs = [band(1, 1), band(1, -1), band(0, 1), band(0, -1)];
      const ys = y.concat(bs.flat().map(q => q[1])), yl = Math.min(...ys), yu = Math.max(...ys), py = (yu - yl) * 0.05;
      const fora = x0 < Math.min(...x) || x0 > Math.max(...x);
      const confTxt = `${fmt(conf, 2)}%`;
      const Y = tone(texNum(yh, 4), 1), TC = tone(texNum(tc, 4), 3), S = tone(texNum(s, 4), 2);
      return {
        result: `\\hat{y} ${approx(yh, 4)} ${Y}, \\qquad ${T("\\text{predição}", "\\text{prediction}")} \\in ${tone(interval(yh - tc * hp, yh + tc * hp), 1)}`,
        chart: {
          type: "curve", label: T(`Reta ajustada a ${n} pontos, com a faixa de confiança da média e a faixa de predição, mais larga`, `Line fitted to ${n} points, with the confidence band for the mean and the wider prediction band`),
          xLabel: T(`x · tracejadas internas: confiança da média · externas: predição de um novo valor (${confTxt})`, `x · inner dashed: confidence for the mean · outer: prediction of a new value (${confTxt})`),
          xMin: lo - pad, xMax: hi + pad, yMin: yl - py, yMax: yu + py,
          pts: [[lo - pad, b0 + b1 * (lo - pad)], [hi + pad, b0 + b1 * (hi + pad)]],
          lines: [{ pts: bs[0], cls: "chart-ref" }, { pts: bs[1], cls: "chart-ref" }, { pts: bs[2], cls: "chart-fit" }, { pts: bs[3], cls: "chart-fit" }],
          dots: x.map((v, i) => [v, y[i]]), marker: [x0, yh],
        },
        steps: [
          [T("Ajuste a reta por mínimos quadrados e calcule o erro padrão dos resíduos:", "Fit the line by least squares and compute the residual standard error:"),
            `\\hat{y} = ${texNum(b0, 4)} ${b1 < 0 ? "-" : "+"} ${texNum(Math.abs(b1), 4)}\\,x, \\qquad s = \\sqrt{\\dfrac{${texNum(sse, 4)}}{${df}}} ${approx(s, 4)} ${S}`],
          [T(`Previsão no ponto x₀ = ${fmt(x0)}:`, `Prediction at x₀ = ${fmt(x0)}:`), `\\hat{y}_0 = ${texNum(b0, 4)} ${b1 < 0 ? "-" : "+"} ${texNum(Math.abs(b1), 4)} \\cdot ${paren(x0, texNum(x0))} ${approx(yh, 4)} ${Y}`],
          [T(`Valor crítico t com ${dof(df)}:`, `Critical t value with ${dof(df)}:`), `t ${approx(tc, 4)} ${TC}`],
          [T("Intervalo de confiança para a média de y nesse x — a incerteza só da reta:", "Confidence interval for the mean of y at that x — the uncertainty of the line alone:"),
            `${texNum(yh, 4)} \\pm ${TC} \\cdot ${S} \\sqrt{\\tfrac{1}{${n}} + \\tfrac{(${texNum(x0)} - ${paren(mx, texNum(mx, 4))})^2}{${texNum(sxx, 4)}}} = ${interval(yh - tc * hm, yh + tc * hm)}`],
          [T("Intervalo de predição para um novo valor — soma a variação de cada ponto em torno da reta, o 1 dentro da raiz:", "Prediction interval for a new value — adds each point's variation around the line, the 1 inside the root:"),
            `${texNum(yh, 4)} \\pm ${TC} \\cdot ${S} \\sqrt{${tone("1", 4)} + \\tfrac{1}{${n}} + \\tfrac{(${texNum(x0)} - ${paren(mx, texNum(mx, 4))})^2}{${texNum(sxx, 4)}}} = ${tone(interval(yh - tc * hp, yh + tc * hp), 1)}`],
        ],
        note: T(`Com ${confTxt} de confiança, a média de y em x = ${fmt(x0)} está entre ${fmt(yh - tc * hm)} e ${fmt(yh + tc * hm)}; já um novo valor observado nesse x deve cair entre ${fmt(yh - tc * hp)} e ${fmt(yh + tc * hp)}, uma faixa ${fmt(hp / hm, 2)} vezes mais larga.`
          + " A diferença é o 1 dentro da raiz: a média fica cada vez mais precisa com mais dados, mas um valor individual sempre varia em torno da reta, e essa variação não some com n grande. As duas faixas se abrem longe do centro dos dados, em x̄."
          + (fora ? ` ${warn} x₀ está fora da faixa dos dados: a extrapolação supõe que a reta continua valendo lá, o que os dados não garantem.` : "")
          + ` Veja a <a href="${PAGE("regressao-linear")}?x=${encodeURIComponent(x.join(" "))}&amp;y=${encodeURIComponent(y.join(" "))}&amp;x0=${x0}">regressão linear destes dados</a>.`,
          `With ${confTxt} confidence, the mean of y at x = ${fmt(x0)} lies between ${fmt(yh - tc * hm)} and ${fmt(yh + tc * hm)}; a new value observed at that x, though, should fall between ${fmt(yh - tc * hp)} and ${fmt(yh + tc * hp)}, a band ${fmt(hp / hm, 2)} times wider.`
          + " The difference is the 1 inside the root: the mean gets ever more precise with more data, but an individual value always varies around the line, and that variation doesn't vanish with large n. Both bands widen away from the centre of the data, at x̄."
          + (fora ? ` ${warn} x₀ is outside the range of the data: extrapolating assumes the line still holds there, which the data don't guarantee.` : "")
          + ` See the <a href="${PAGE("regressao-linear")}?x=${encodeURIComponent(x.join(" "))}&amp;y=${encodeURIComponent(y.join(" "))}&amp;x0=${x0}">linear regression of these data</a>.`),
      };
    },

    friedman({ o }) {
      const n = o.length, k = o[0] ? o[0].length : 0;
      if (n < 2) return { error: T("Informe pelo menos dois blocos (linhas), separados por ponto e vírgula.", "Enter at least two blocks (rows), separated by semicolons.") };
      if (k < 2 || o.some(r => r.length !== k)) return { error: T("Todas as linhas precisam ter o mesmo número de tratamentos, pelo menos dois.", "Every row must have the same number of treatments, at least two.") };
      if (n * k > 3000) return { error: T("Use no máximo 3.000 valores ao todo.", "Use at most 3,000 values in all.") };
      let ties = 0;
      const rk = o.map(row => {
        const idx = row.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]), r = new Array(k);
        for (let i = 0; i < k;) { let j = i; while (j + 1 < k && idx[j + 1][0] === idx[i][0]) j++; const t = j - i + 1; ties += t ** 3 - t; for (let m = i; m <= j; m++) r[idx[m][1]] = (i + j) / 2 + 1; i = j + 1; }
        return r;
      });
      const R = Array.from({ length: k }, (_, j) => rk.reduce((s, r) => s + r[j], 0));
      const C = 1 - ties / (n * (k ** 3 - k));
      if (C <= 0) return { error: T("Em todos os blocos os valores são iguais: não há ordem para comparar.", "In every block the values are equal: there is no order to compare.") };
      const Q0 = 12 / (n * k * (k + 1)) * R.reduce((s, r) => s + r * r, 0) - 3 * n * (k + 1), Q = Q0 / C, df = k - 1;
      const p = chiSurvival(Q, df), W = Q / (n * (k - 1));
      const mr = R.map(r => r / n);
      const show = Math.min(n, 8);
      const tab = `\\begin{array}{c|${"c".repeat(k)}} ${T("\\text{bloco}", "\\text{block}")} & ${R.map((_, j) => `T_{${j + 1}}`).join(" & ")} \\\\ \\hline `
        + rk.slice(0, show).map((r, i) => `${i + 1} & ${r.map(v => texNum(v)).join(" & ")}`).join(" \\\\ ") + (n > show ? ` \\\\ \\vdots & ${R.map(() => "\\vdots").join(" & ")}` : "")
        + ` \\\\ \\hline R_j & ${R.map(r => tone(texNum(r), 2)).join(" & ")} \\end{array}`;
      const Qt = tone(texNum(Q, 4), 1);
      return {
        result: `\\chi^2_F ${approx(Q, 4)} ${Qt}, \\qquad p ${p < 1e-4 ? "<" : "\\approx"} ${p < 1e-4 ? T("0{,}0001", "0.0001") : texNum(p, 4)}`,
        chart: {
          type: "bars", label: T(`Posto médio de cada um dos ${k} tratamentos`, `Mean rank of each of the ${k} treatments`),
          xLabel: T(`tratamento · altura: posto médio, de 1 a ${k} · tracejada: o esperado sem diferença, ${fmt((k + 1) / 2, 2)}`, `treatment · height: mean rank, 1 to ${k} · dashed: expected with no difference, ${fmt((k + 1) / 2, 2)}`),
          xs: mr.map((_, j) => j + 1), ys: mr, xMin: 0.5, xMax: k + 0.5, yMax: k, hlines: [{ y: (k + 1) / 2, cls: "chart-ref" }],
          hi: j => Math.abs(mr[j - 1] - (k + 1) / 2) === Math.max(...mr.map(v => Math.abs(v - (k + 1) / 2))),
          tip: (j, v) => [fmt(v, 3), T(`tratamento ${j}: soma de postos ${fmt(R[j - 1])}`, `treatment ${j}: rank sum ${fmt(R[j - 1])}`)],
        },
        steps: [
          [T(`Em cada bloco, ordene os ${k} tratamentos e dê postos de 1 a ${k}; empates recebem a média. Some os postos de cada tratamento:`, `Within each block, sort the ${k} treatments and rank them 1 to ${k}; ties get the average. Add up each treatment's ranks:`), tab],
          [T("Compare as somas com o que se esperaria se a ordem fosse ao acaso:", "Compare the sums with what would be expected if the order were random:"),
            `\\chi^2_F = \\dfrac{12}{${n} \\cdot ${k} \\cdot ${k + 1}} \\left(${R.slice(0, 6).map(r => `${tone(texNum(r), 2)}^2`).join(" + ")}${k > 6 ? " + \\cdots" : ""}\\right) - 3 \\cdot ${n} \\cdot ${k + 1} ${approx(Q0, 4)} ${texNum(Q0, 4)}`],
          ...(ties ? [[T("Com empates, divida pela correção:", "With ties, divide by the correction:"), `C ${approx(C, 6)} ${texNum(C, 6)}, \\qquad \\chi^2_F = \\dfrac{${texNum(Q0, 4)}}{${texNum(C, 6)}} ${approx(Q, 4)} ${Qt}`]] : []),
          [T(`Compare com a qui-quadrado com ${dof(df)}, e calcule o W de Kendall:`, `Compare with the chi-square with ${dof(df)}, and compute Kendall's W:`),
            `p ${approx(p, 4)} ${tone(texNum(p, 4), 3)}, \\qquad W = \\dfrac{${texNum(Q, 4)}}{${n} \\cdot ${k - 1}} ${approx(W, 3)} ${texNum(W, 3)}`],
        ],
        note: (p < 0.05 ? T("Ao nível de 5%, rejeita-se H₀: os tratamentos não ficam na mesma posição — algum tende a ficar acima ou abaixo dos outros dentro dos blocos.", "At the 5% level, H₀ is rejected: the treatments don't sit in the same position — some tends to rank above or below the others within the blocks.")
          : T("Ao nível de 5%, não se rejeita H₀: a ordem dos tratamentos dentro dos blocos é compatível com o acaso.", "At the 5% level, H₀ is not rejected: the order of the treatments within the blocks is consistent with chance."))
          + T(` O W de Kendall, ${fmt(W, 3)}, mede a concordância entre os blocos, de 0 (nenhuma) a 1 (todos ordenam igual). Como os postos são dados dentro de cada bloco, as diferenças entre blocos — um provador mais exigente, um paciente mais forte — saem da conta: é a versão por postos da ANOVA de medidas repetidas. Para grupos independentes, o análogo é o <a href="${PAGE("kruskal-wallis")}">Kruskal-Wallis</a>; com dois tratamentos, o teste do sinal.`,
            ` Kendall's W, ${fmt(W, 3)}, measures agreement between the blocks, from 0 (none) to 1 (all rank the same). Because ranks are given within each block, differences between blocks — a stricter taster, a stronger patient — drop out: it is the rank version of repeated-measures ANOVA. For independent groups, the analogue is <a href="${PAGE("kruskal-wallis")}">Kruskal-Wallis</a>; with two treatments, the sign test.`),
      };
    },

    dunn({ o }) {
      const k = o.length;
      if (k < 3) return { error: T("Informe pelo menos três grupos; com dois, use o Mann-Whitney.", "Enter at least three groups; with two, use Mann-Whitney.") };
      if (k > 10) return { error: T("Use no máximo 10 grupos.", "Use at most 10 groups.") };
      if (o.some(g => g.length < 1)) return { error: T("Cada grupo precisa de pelo menos um valor.", "Each group needs at least one value.") };
      const all = o.flatMap((g, j) => g.map(v => [v, j])).sort((p, q) => p[0] - q[0]);
      const N = all.length;
      if (N > 2000) return { error: T("Use no máximo 2.000 valores ao todo.", "Use at most 2,000 values in all.") };
      const R = new Array(k).fill(0), ns = o.map(g => g.length);
      let ties = 0;
      for (let i = 0; i < N;) { let j = i; while (j + 1 < N && all[j + 1][0] === all[i][0]) j++; const t = j - i + 1; ties += t ** 3 - t; for (let m = i; m <= j; m++) R[all[m][1]] += (i + j) / 2 + 1; i = j + 1; }
      const mr = R.map((r, j) => r / ns[j]);
      const v0 = N * (N + 1) / 12 - ties / (12 * (N - 1));
      if (v0 <= 0) return { error: T("Todos os valores são iguais: não há postos para comparar.", "All values are equal: there are no ranks to compare.") };
      const pairs = [];
      for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) {
        const se = Math.sqrt(v0 * (1 / ns[a] + 1 / ns[b])), z = (mr[a] - mr[b]) / se, p = 2 * (1 - phi(Math.abs(z)));
        pairs.push({ a, b, z, p, se });
      }
      const m = pairs.length;
      // Holm: ordena os p, multiplica o i-ésimo por (m − i) e mantém a sequência crescente.
      const ord = pairs.map((q, i) => i).sort((i, j) => pairs[i].p - pairs[j].p);
      let run = 0; ord.forEach((i, r) => { run = Math.max(run, Math.min(1, pairs[i].p * (m - r))); pairs[i].holm = run; });
      pairs.forEach(q => { q.bonf = Math.min(1, q.p * m); });
      const sig = pairs.filter(q => q.holm < 0.05);
      const pt = v => (v < 1e-4 ? T("<0{,}0001", "<0.0001") : texNum(v, 4));
      const rows = pairs.slice(0, 15).map(q => `${q.a + 1} \\text{ – } ${q.b + 1} & ${texNum(mr[q.a] - mr[q.b], 3)} & ${texNum(q.z, 3)} & ${pt(q.p)} & ${q.holm < 0.05 ? tone(pt(q.holm), 1) : pt(q.holm)}`).join(" \\\\ ");
      const enc = encodeURIComponent(o.map(g => g.join(" ")).join("; "));
      const inv = new Set(sig.flatMap(q => [q.a + 1, q.b + 1]));
      return {
        result: sig.length ? `${T("\\text{diferem:}", "\\text{differ:}")}\\ ${sig.map(q => tone(`${q.a + 1}\\text{ – }${q.b + 1}`, 1)).join(",\\ ")}` : T("\\text{nenhum par difere a } 5\\%", "\\text{no pair differs at } 5\\%"),
        chart: {
          type: "bars", label: T(`Posto médio de cada um dos ${k} grupos`, `Mean rank of each of the ${k} groups`),
          xLabel: T("grupo · altura: posto médio · destaque: grupos em algum par significativo (Holm, 5%)", "group · height: mean rank · highlighted: groups in some significant pair (Holm, 5%)"),
          xs: mr.map((_, j) => j + 1), ys: mr, xMin: 0.5, xMax: k + 0.5, yMax: Math.max(...mr), hlines: [{ y: (N + 1) / 2, cls: "chart-ref" }],
          hi: j => inv.has(j), tip: (j, v) => [fmt(v, 2), T(`grupo ${j}, com ${ns[j - 1]} valores`, `group ${j}, with ${ns[j - 1]} values`)],
        },
        steps: [
          [T(`Dê postos a todos os ${N} valores juntos, como no Kruskal-Wallis, e calcule o posto médio de cada grupo:`, `Rank all ${N} values together, as in Kruskal-Wallis, and compute each group's mean rank:`),
            mr.map((v, j) => `\\bar{R}_{${j + 1}} ${approx(v, 3)} ${tone(texNum(v, 3), 2)}`).join(", \\quad ")],
          [T("Para cada par, divida a diferença dos postos médios pelo seu erro padrão:", "For each pair, divide the difference in mean ranks by its standard error:"),
            `z_{ij} = \\dfrac{\\bar{R}_i - \\bar{R}_j}{\\sqrt{\\left(\\dfrac{N(N+1)}{12} - \\dfrac{\\sum (t^3 - t)}{12(N - 1)}\\right)\\left(\\dfrac{1}{n_i} + \\dfrac{1}{n_j}\\right)}}`],
          [T(`Com ${m} comparações, ajuste os valores-p pelo método de Holm:`, `With ${m} comparisons, adjust the p-values by Holm's method:`),
            `\\begin{array}{c|c|c|c|c} ${T("\\text{par}", "\\text{pair}")} & \\bar{R}_i - \\bar{R}_j & z & p & p_{\\text{Holm}} \\\\ \\hline ${rows}${m > 15 ? " \\\\ \\vdots & & & &" : ""} \\end{array}`],
        ],
        note: T(`${sig.length ? `Ao nível de 5%, depois do ajuste, ${sig.length === 1 ? "difere o par" : "diferem os pares"} ${list(sig.map(q => `${q.a + 1}–${q.b + 1}`))}.` : "Ao nível de 5%, depois do ajuste, nenhum par difere."} O teste de Dunn é o seguimento natural do <a href="${PAGE("kruskal-wallis")}?o=${enc}">Kruskal-Wallis</a>: este diz se algum grupo difere; o de Dunn diz quais. Usa os mesmos postos, o que mantém as comparações coerentes com o teste global.`
          + ` Como são ${m} comparações, o risco de algum falso positivo cresce; o ajuste de Holm controla isso e é sempre pelo menos tão poderoso quanto o de Bonferroni — veja as <a href="${PAGE("comparacoes-multiplas")}">comparações múltiplas</a>.`,
          `${sig.length ? `At the 5% level, after adjustment, the ${sig.length === 1 ? "pair that differs is" : "pairs that differ are"} ${list(sig.map(q => `${q.a + 1}–${q.b + 1}`))}.` : "At the 5% level, after adjustment, no pair differs."} Dunn's test is the natural follow-up to <a href="${PAGE("kruskal-wallis")}?o=${enc}">Kruskal-Wallis</a>: that one says whether any group differs; Dunn's says which. It uses the same ranks, which keeps the comparisons consistent with the global test.`
          + ` With ${m} comparisons, the risk of some false positive grows; Holm's adjustment controls that and is always at least as powerful as Bonferroni's — see <a href="${PAGE("comparacoes-multiplas")}">multiple comparisons</a>.`),
      };
    },

    anova2({ o, b }) {
      if (!Number.isInteger(b) || b < 2) return { error: T("O fator B precisa ter um número inteiro de níveis, pelo menos 2.", "Factor B must have a whole number of levels, at least 2.") };
      if (o.length % b) return { error: T(`Há ${o.length} linhas, que não se dividem em ${b} níveis de B: o número de linhas precisa ser (níveis de A) × (níveis de B).`, `There are ${o.length} rows, which don't split into ${b} levels of B: the number of rows must be (levels of A) × (levels of B).`) };
      const a = o.length / b, r = o[0].length;
      if (a < 2) return { error: T("O fator A precisa de pelo menos 2 níveis.", "Factor A needs at least 2 levels.") };
      if (r < 2 || o.some(c => c.length !== r)) return { error: T("Todas as células precisam ter o mesmo número de repetições, pelo menos 2.", "Every cell must have the same number of replicates, at least 2.") };
      if (a * b * r > 3000) return { error: T("Use no máximo 3.000 valores ao todo.", "Use at most 3,000 values in all.") };
      const sum = v => v.reduce((s, x) => s + x, 0);
      const cell = (i, j) => o[i * b + j];
      const cm = Array.from({ length: a }, (_, i) => Array.from({ length: b }, (_, j) => sum(cell(i, j)) / r));
      const N = a * b * r, G = sum(o.flat()) / N;
      const mA = cm.map(row => sum(row) / b), mB = Array.from({ length: b }, (_, j) => sum(cm.map(row => row[j])) / a);
      const ssA = b * r * sum(mA.map(m => (m - G) ** 2)), ssB = a * r * sum(mB.map(m => (m - G) ** 2));
      const ssAB = r * sum(cm.flatMap((row, i) => row.map((m, j) => (m - mA[i] - mB[j] + G) ** 2)));
      const ssE = sum(o.flatMap((c, idx) => c.map(v => (v - cm[Math.floor(idx / b)][idx % b]) ** 2)));
      const dA = a - 1, dB = b - 1, dAB = dA * dB, dE = a * b * (r - 1);
      if (ssE === 0) return { error: T("Não há variação dentro das células: as repetições de cada célula são todas iguais.", "There is no variation within the cells: each cell's replicates are all equal.") };
      const msE = ssE / dE;
      const test = (ss, d) => { const F = ss / d / msE; return { ss, d, ms: ss / d, F, p: betainc(dE / (dE + d * F), dE / 2, d / 2), eta: ss / (ss + ssE) }; };
      const A = test(ssA, dA), B = test(ssB, dB), AB = test(ssAB, dAB);
      const pt = v => (v < 1e-4 ? T("<0{,}0001", "<0.0001") : texNum(v, 4));
      const row = (lab, t, tn) => `${lab} & ${texNum(t.ss, 2)} & ${t.d} & ${texNum(t.ms, 2)} & ${tone(texNum(t.F, 3), tn)} & ${pt(t.p)}`;
      const flat = o.flat(), yl = Math.min(...cm.flat()), yh = Math.max(...cm.flat()), py = (yh - yl) * 0.15 || 1;
      const lines = cm.slice(1).map(rowm => ({ pts: rowm.map((m, j) => [j + 1, m]), cls: "chart-fit" }));
      const inter = AB.p < 0.05;
      return {
        result: `F_A ${approx(A.F, 3)} ${tone(texNum(A.F, 3), 2)}, \\quad F_B ${approx(B.F, 3)} ${tone(texNum(B.F, 3), 3)}, \\quad F_{AB} ${approx(AB.F, 3)} ${tone(texNum(AB.F, 3), 4)}`,
        chart: {
          type: "curve", label: T(`Gráfico de interação: média de cada combinação, uma linha por nível de A`, `Interaction plot: mean of each combination, one line per level of A`),
          xLabel: T(`nível de B · colorida: A = 1 · escuras: os outros níveis de A · linhas paralelas: sem interação`, `level of B · colored: A = 1 · dark: the other levels of A · parallel lines: no interaction`),
          xMin: 0.8, xMax: b + 0.2, yMin: yl - py, yMax: yh + py, pts: cm[0].map((m, j) => [j + 1, m]), lines,
          dots: cm.flatMap(rowm => rowm.map((m, j) => [j + 1, m])),
          tipAt: v => { const j = Math.min(b, Math.max(1, Math.round(v))); return [cm.map((rowm, i) => `A${i + 1}: ${fmt(rowm[j - 1], 2)}`).join(" · "), T(`médias em B = ${j}`, `means at B = ${j}`)]; },
        },
        steps: [
          [T(`Calcule as médias de cada combinação (célula), de cada nível de A, de cada nível de B e a geral:`, `Compute the means of each combination (cell), of each level of A, of each level of B and overall:`),
            `\\begin{array}{c|${"c".repeat(b)}|c} & ${mB.map((_, j) => `B_{${j + 1}}`).join(" & ")} & \\bar{y}_{A} \\\\ \\hline ${cm.map((rowm, i) => `A_{${i + 1}} & ${rowm.map(m => texNum(m, 3)).join(" & ")} & ${texNum(mA[i], 3)}`).join(" \\\\ ")} \\\\ \\hline \\bar{y}_{B} & ${mB.map(m => texNum(m, 3)).join(" & ")} & ${texNum(G, 3)} \\end{array}`],
          [T("Reparta a variação total em quatro partes — A, B, a interação e o erro dentro das células — e divida cada uma pela sua média quadrática do erro:", "Split the total variation into four parts — A, B, the interaction and the error within cells — and divide each by the error mean square:"),
            `\\begin{array}{l|r|r|r|r|r} & ${T("SQ & gl & QM", "SS & df & MS")} & F & p \\\\ \\hline ${row("A", A, 2)} \\\\ ${row("B", B, 3)} \\\\ ${row("A \\times B", AB, 4)} \\\\ ${T("\\text{erro}", "\\text{error}")} & ${texNum(ssE, 2)} & ${dE} & ${texNum(msE, 2)} & & \\end{array}`],
        ],
        note: T(`${inter ? `<strong>A interação é significativa</strong> (p ${pValueText(AB.p)}): o efeito de B depende do nível de A — as linhas do gráfico não são paralelas. Nesse caso, os efeitos principais sozinhos enganam; vale comparar B dentro de cada nível de A.` : `A interação não é significativa (p ${pValueText(AB.p)}): as linhas do gráfico são aproximadamente paralelas, e os efeitos de A e de B podem ser lidos separadamente.`}`
          + ` Efeito de A: p ${pValueText(A.p)}, η² parcial ${fmt(A.eta, 3)}. Efeito de B: p ${pValueText(B.p)}, η² parcial ${fmt(B.eta, 3)}.`
          + ` A ANOVA de dois fatores estende a <a href="${PAGE("anova-um-fator")}">de um fator</a> e supõe resíduos normais com variâncias iguais entre as células; aqui o desenho é balanceado, com ${r} repetições em cada uma das ${a * b} combinações.`,
          `${inter ? `<strong>The interaction is significant</strong> (p ${pValueText(AB.p)}): the effect of B depends on the level of A — the chart's lines aren't parallel. In that case, the main effects alone mislead; it is worth comparing B within each level of A.` : `The interaction isn't significant (p ${pValueText(AB.p)}): the chart's lines are roughly parallel, and the effects of A and B can be read separately.`}`
          + ` Effect of A: p ${pValueText(A.p)}, partial η² ${fmt(A.eta, 3)}. Effect of B: p ${pValueText(B.p)}, partial η² ${fmt(B.eta, 3)}.`
          + ` Two-way ANOVA extends the <a href="${PAGE("anova-um-fator")}">one-way</a> version and assumes normal residuals with equal variances across cells; here the design is balanced, with ${r} replicates in each of the ${a * b} combinations.`),
      };
    },

    shapiro({ x }) {
      const n = x.length;
      if (n < 3) return { error: T("Informe pelo menos três valores.", "Enter at least three values.") };
      if (n > 5000) return { error: T("Use no máximo 5.000 valores.", "Use at most 5,000 values.") };
      const s = x.slice().sort((p, q) => p - q), mean = s.reduce((t, v) => t + v, 0) / n;
      const ss = s.reduce((t, v) => t + (v - mean) ** 2, 0);
      if (ss === 0) return { error: T("Todos os valores são iguais: não há variação para testar.", "All values are equal: there is no variation to test.") };
      // Coeficientes e valor-p pela aproximação de Royston (1992, 1995).
      const m = Array.from({ length: n }, (_, i) => probit((i + 1 - 0.375) / (n + 0.25)));
      const mm = m.reduce((t, v) => t + v * v, 0), u = 1 / Math.sqrt(n);
      const poly = (c, z) => c.reduce((t, ci, i) => t + ci * z ** i, 0);
      const a = new Array(n);
      if (n === 3) { a[0] = -Math.SQRT1_2; a[1] = 0; a[2] = Math.SQRT1_2; }
      else {
        const an = poly([m[n - 1] / Math.sqrt(mm), 0.221157, -0.147981, -2.07119, 4.434685, -2.706056], u);
        if (n > 5) {
          const an1 = poly([m[n - 2] / Math.sqrt(mm), 0.042981, -0.293762, -1.752461, 5.682633, -3.582633], u);
          const ph = (mm - 2 * m[n - 1] ** 2 - 2 * m[n - 2] ** 2) / (1 - 2 * an ** 2 - 2 * an1 ** 2);
          for (let i = 2; i < n - 2; i++) a[i] = m[i] / Math.sqrt(ph);
          a[0] = -an; a[1] = -an1; a[n - 2] = an1; a[n - 1] = an;
        } else {
          const ph = (mm - 2 * m[n - 1] ** 2) / (1 - 2 * an ** 2);
          for (let i = 1; i < n - 1; i++) a[i] = m[i] / Math.sqrt(ph);
          a[0] = -an; a[n - 1] = an;
        }
      }
      const num = a.reduce((t, ai, i) => t + ai * s[i], 0);
      const Wv = Math.min(1, num * num / ss);
      let p;
      if (n === 3) p = Math.max(0, Math.min(1, 6 / Math.PI * (Math.asin(Math.sqrt(Wv)) - Math.asin(Math.sqrt(0.75)))));
      else if (n <= 11) {
        const g = 0.459 * n - 2.273, w = -Math.log(g - Math.log(1 - Wv));
        const mu = poly([0.544, -0.39978, 0.025054, -6.714e-4], n), sg = Math.exp(poly([1.3822, -0.77857, 0.062767, -0.0020322], n));
        p = 1 - phi((w - mu) / sg);
      } else {
        const L = Math.log(n), w = Math.log(1 - Wv);
        const mu = poly([-1.5861, -0.31082, -0.083751, 0.0038915], L), sg = Math.exp(poly([-0.4803, -0.082676, 0.0030302], L));
        p = 1 - phi((w - mu) / sg);
      }
      const sd = Math.sqrt(ss / (n - 1));
      const q0 = m[0], q1 = m[n - 1], pad = (q1 - q0) * 0.08;
      const yl = Math.min(s[0], mean + sd * (q0 - pad)), yh = Math.max(s[n - 1], mean + sd * (q1 + pad)), py = (yh - yl) * 0.06;
      const show = Math.min(5, Math.floor(n / 2));
      const pairs = Array.from({ length: show }, (_, i) => `${texNum(a[n - 1 - i], 4)}(${texNum(s[n - 1 - i])} - ${paren(s[i], texNum(s[i]))})`).join(" + ") + (Math.floor(n / 2) > show ? " + \\cdots" : "");
      return {
        result: `W ${approx(Wv, 4)} ${tone(texNum(Wv, 4), 1)}, \\qquad p ${p < 1e-4 ? "<" : "\\approx"} ${p < 1e-4 ? T("0{,}0001", "0.0001") : tone(texNum(p, 4), 3)}`,
        chart: {
          type: "curve", label: T(`Gráfico quantil-quantil: os ${n} valores ordenados contra os quantis esperados da normal`, `Quantile-quantile plot: the ${n} sorted values against the expected normal quantiles`),
          xLabel: T("quantil esperado da normal padrão · pontos: os dados ordenados · reta: onde cairiam se fossem normais", "expected standard normal quantile · dots: the sorted data · line: where they would fall if normal"),
          xMin: q0 - pad, xMax: q1 + pad, yMin: yl - py, yMax: yh + py, pts: [[q0 - pad, mean + sd * (q0 - pad)], [q1 + pad, mean + sd * (q1 + pad)]],
          dots: s.map((v, i) => [m[i], v]),
          tipAt: v => { const i = m.reduce((b, q, j) => (Math.abs(q - v) < Math.abs(m[b] - v) ? j : b), 0); return [fmt(s[i]), T(`${i + 1}º menor valor; quantil esperado ${fmt(m[i], 3)}`, `${i + 1}th smallest value; expected quantile ${fmt(m[i], 3)}`)]; },
        },
        steps: [
          [T("Ordene os valores e calcule a soma dos quadrados dos desvios:", "Sort the values and compute the sum of squared deviations:"),
            `\\textstyle\\sum (x_i - \\bar{x})^2 ${approx(ss, 4)} ${tone(texNum(ss, 4), 2)}`],
          [T("Combine os valores ordenados com os pesos aᵢ, tirados dos quantis esperados de uma amostra normal — os pares das pontas pesam mais:", "Combine the sorted values with the weights aᵢ, taken from the expected quantiles of a normal sample — the pairs at the ends weigh most:"),
            `\\textstyle\\sum a_i\\, x_{(i)} = ${pairs} ${approx(num, 4)} ${texNum(num, 4)}`],
          [T("W é o quadrado disso dividido pela soma dos quadrados:", "W is the square of that divided by the sum of squares:"),
            `W = \\dfrac{${texNum(num, 4)}^2}{${tone(texNum(ss, 4), 2)}} ${approx(Wv, 4)} ${tone(texNum(Wv, 4), 1)}`],
          [T(n === 3 ? "Com n = 3, o valor-p é exato:" : "O valor-p vem da aproximação de Royston, que leva W a uma normal:", n === 3 ? "With n = 3, the p-value is exact:" : "The p-value comes from Royston's approximation, which maps W to a normal:"),
            `p ${p < 1e-4 ? "<" : "\\approx"} ${p < 1e-4 ? T("0{,}0001", "0.0001") : tone(texNum(p, 4), 3)}`],
        ],
        note: T(`${p < 0.05 ? `Ao nível de 5%, rejeita-se a normalidade (p ${pValueText(p)}): os pontos se afastam da reta do gráfico de forma sistemática.` : `Ao nível de 5%, não se rejeita a normalidade (p ${pValueText(p)}): os dados são compatíveis com uma normal.`}`
          + ` W vai de 0 a 1 e é, em essência, o quadrado da correlação entre os dados ordenados e os quantis da normal: perto de 1, os pontos caem sobre a reta. O gráfico costuma dizer mais que o p — caudas que se abrem nas pontas indicam caudas pesadas; uma curva em arco, assimetria.`
          + ` Cuidado com o tamanho da amostra: com poucos dados, o teste quase nunca rejeita; com milhares, rejeita desvios minúsculos que não atrapalham um <a href="${PAGE("t-student")}">teste t</a>. Para ver a forma, veja também a <a href="${PAGE("assimetria-curtose")}?x=${encodeURIComponent(x.join(" "))}">assimetria e curtose</a> destes dados.`,
          `${p < 0.05 ? `At the 5% level, normality is rejected (p ${pValueText(p)}): the dots move away from the chart's line systematically.` : `At the 5% level, normality is not rejected (p ${pValueText(p)}): the data are consistent with a normal.`}`
          + ` W runs from 0 to 1 and is, in essence, the squared correlation between the sorted data and the normal quantiles: near 1, the dots fall on the line. The chart often says more than the p — ends that peel away suggest heavy tails; an arc, skewness.`
          + ` Mind the sample size: with little data, the test almost never rejects; with thousands, it rejects tiny departures that don't hurt a <a href="${PAGE("t-student")}">t test</a>. For the shape, see also the <a href="${PAGE("assimetria-curtose")}?x=${encodeURIComponent(x.join(" "))}">skewness and kurtosis</a> of these data.`),
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

    // Diagrama de Venn de dois eventos, com o rótulo de cada região.
    if (spec.type === "venn") {
      const cy = H / 2, r = Math.min(95, H / 2 - 22), dx = r * 0.72;
      svg("rect", { x: 1, y: 1, width: W - 2, height: H - 2, rx: 6, class: "chart-venn-frame" }, root);
      [W / 2 - dx, W / 2 + dx].forEach(cx => svg("circle", { cx, cy, r, class: "chart-box" }, root));
      const txt = (x, y, t, cls, anchor = "middle") => { svg("text", { x, y, class: cls, "text-anchor": anchor }, root).textContent = t; };
      txt(W / 2 - dx - r * 0.55, cy - r * 0.78, "A", "chart-venn-name");
      txt(W / 2 + dx + r * 0.55, cy - r * 0.78, "B", "chart-venn-name");
      const [sa, both, sb, none] = spec.regions;
      txt(W / 2 - dx - r * 0.35, cy + 6, sa, "chart-venn-num");
      txt(W / 2, cy + 6, both, "chart-venn-num");
      txt(W / 2 + dx + r * 0.35, cy + 6, sb, "chart-venn-num");
      txt(W - 14, H - 12, none, "chart-label", "end");
      return;
    }

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
        const cx = X(x), top = Math.min(Y(y), Y(0)), h = Math.abs(Y(0) - Y(y));
        const hi = spec.hi(x);
        if (h > 0) svg("path", { d: barPath(cx - bw / 2, top, bw, h), class: hi ? "chart-hi" : "chart-base" }, root);
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
      (spec.hlines || []).forEach(h => {
        svg("line", { x1: m.l, x2: W - m.r, y1: Y(h.y), y2: Y(h.y), class: h.cls }, root);
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
      // shadeRanges: vários trechos sombreados, como as duas caudas de um teste.
      (spec.shadeRanges || []).forEach(([lo, hi]) => {
        const under = spec.pts.filter(([x]) => x >= lo && x <= hi);
        if (under.length > 1) {
          const d = `M${X(under[0][0])},${Y(0)}` + under.map(([x, y]) => `L${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join("")
            + `L${X(under[under.length - 1][0])},${Y(0)}Z`;
          svg("path", { d, class: "chart-area" }, root);
        }
      });
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
      // Pontos fixos dos dados, sem arrastar (o arrastável é o tipo scatter).
      (spec.dots || []).forEach(([dx, dy]) => svg("circle", { cx: X(dx), cy: Y(dy), r: 4, class: "chart-pt" }, root));
      if (spec.marker) {
        const [mx, my] = spec.marker;
        // O traço desce até o zero, ou até a borda quando o zero está fora do gráfico.
        svg("line", { x1: X(mx), x2: X(mx), y1: Y(Math.min(yMax, Math.max(yMin, 0))), y2: Y(my), class: "chart-rule" }, root);
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
      // Com data-raw, o texto vai como está: dígitos em que o zero à esquerda conta.
      if ("raw" in i.dataset) return i.value.trim();
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
