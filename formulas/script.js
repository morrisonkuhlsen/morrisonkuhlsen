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
    const X = v => m.l + (v - xMin) / (xMax - xMin) * iw;
    const Y = v => m.t + ih - (v - yMin) / (yMax - yMin) * ih;

    // Grade e eixo y: linhas finas, recessivas.
    const ys = niceStep(yMax - yMin, 4);
    for (let v = Math.ceil(yMin / ys - 1e-9) * ys; spec.type !== "intervals" && v <= yMax + 1e-12; v += ys) {
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
    // Campo com data-list vira um array, separado por espaço ou ponto e vírgula
    // (e, em inglês, também por vírgula). Com data-optional, pode ficar vazio:
    // a lista vira [], o número vira null.
    const read = i => {
      if (i.tagName === "SELECT") return i.value;
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
