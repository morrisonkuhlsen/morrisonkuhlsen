/* "Calcule com os seus dados" na página de um teste: o leitor cola os dados
 * e vê a estatística, o valor-p na curva, a decisão, o tamanho de efeito, o
 * passo a passo e a frase para o relatório.
 *
 * O layout teste-estatistico.html deixa um <section class="tc"
 * data-calc="nome"> nos testes que têm `calc` no _data; CALCS[nome] diz que
 * campos montar e faz a conta. As distribuições vêm de MKCalc
 * (assets/js/stat-calc-core.js), as mesmas das tabelas t, F e χ².
 * Segue o padrão do R e do SciPy que a própria ficha mostra: Welch no t
 * independente, Yates no χ² 2 × 2, Mann-Whitney exato sem empates e com
 * amostras pequenas. Serve às duas línguas, pelo lang da página.
 */
(() => {
  const C = window.MKCalc;
  const section = document.querySelector(".tc[data-calc]");
  if (!C || !section) return;

  const EN = document.documentElement.lang.startsWith("en");
  const T = (pt, en) => (EN ? en : pt);
  const LOCALE = EN ? "en-US" : "pt-BR";

  const nf = (d, min = 0) => new Intl.NumberFormat(LOCALE, { maximumFractionDigits: d, minimumFractionDigits: min, useGrouping: false });
  const fmt = (v, d = 3) => nf(d).format(Math.abs(v) < 5e-13 ? 0 : v).replace("-", "−");
  const fix = (v, d) => nf(d, d).format(v).replace("-", "−");
  // Valor-p como nos relatórios: três casas, e "< 0,001" abaixo disso.
  const pTxt = p => (p < 0.001 ? `< ${fix(0.001, 3)}` : `= ${fix(p, 3)}`);
  const texN = (v, d = 3) => fmt(v, d).replace(/[.,]/g, c => `{${c}}`);
  const tex = (el, src) => (window.katex ? katex.render(src, el, { throwOnError: false }) : (el.textContent = src));
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  /* ---------------------------------------------------------------- leitura */

  // Português: vírgula decimal, então só espaço, quebra de linha e ponto e
  // vírgula separam. Inglês: ponto decimal, e a vírgula também separa.
  function readList(s) {
    const parts = s.trim().split(EN ? /[\s;,]+/ : /[\s;]+/).filter(Boolean);
    const xs = parts.map(p => Number(EN ? p : p.replace(",", ".")));
    return xs.some(Number.isNaN) ? null : xs;
  }

  // Uma linha por grupo; um "rótulo:" no começo é opcional.
  function readGroups(s) {
    const lines = s.split("\n").map(l => l.trim()).filter(Boolean);
    return lines.map((l, i) => {
      const m = l.match(/^([^:\d−-][^:]*):\s*(.*)$/);
      return { name: m ? m[1].trim() : T(`Grupo ${i + 1}`, `Group ${i + 1}`), xs: readList(m ? m[2] : l) };
    });
  }

  function readTable(s) {
    const rows = s.split("\n").map(l => l.trim()).filter(Boolean).map(l => l.split(/[\s;,]+/).filter(Boolean).map(Number));
    if (!rows.length || rows.some(r => r.some(v => !Number.isInteger(v) || v < 0))) return null;
    return rows;
  }

  const sum = xs => xs.reduce((a, b) => a + b, 0);
  const mean = xs => sum(xs) / xs.length;
  const variance = xs => { const m = mean(xs); return sum(xs.map(x => (x - m) ** 2)) / (xs.length - 1); };

  // P(T ≥ t), P(T ≤ t) ou bilateral, conforme a hipótese alternativa.
  const tP = (t, df, alt) => (alt === "maior" ? 1 - C.tcdf(t, df) : alt === "menor" ? C.tcdf(t, df) : 2 * (1 - C.tcdf(Math.abs(t), df)));

  /* ---------------------------------------------------------------- curvas */

  function curveT(t, df, alt) {
    const x1 = Math.max(4, Math.abs(t) + 1), x0 = -x1, a = Math.abs(t);
    const bands = alt === "maior" ? [[t, x1]] : alt === "menor" ? [[x0, t]] : [[x0, -a], [a, x1]];
    return { dens: x => C.tpdf(x, df), x0, x1, bands, mark: t, label: `t(${fmt(df, 1)})` };
  }

  // F e χ²: só a cauda direita. O eixo vai até onde a curva ainda se vê; se
  // a estatística passar muito disso, a figura não a persegue (a curva
  // viraria um risco no canto) e a legenda avisa.
  function curveRight(stat, dens, xNat, label) {
    return { dens, x0: 0, x1: Math.max(xNat, Math.min(stat * 1.15, xNat * 2)), bands: [[stat, Infinity]], mark: stat, label };
  }

  /* ---------------------------------------------------------------- calculadoras */

  const ALT_T = [
    ["bilateral", T("diferentes (bilateral)", "different (two-sided)")],
    ["maior", T("A maior que B", "A greater than B")],
    ["menor", T("A menor que B", "A less than B")],
  ];

  const CALCS = {
    "t-independente": {
      fields: [
        ["a", T("Grupo A", "Group A"), "23 25 28 30 31 33 35 27 29 32"],
        ["b", T("Grupo B", "Group B"), "20 22 24 25 26 27 21 23 28 24"],
      ],
      options: [
        ["alt", T("Hipótese alternativa: as médias são", "Alternative hypothesis: the means are"), ALT_T],
        ["var", T("Variâncias", "Variances"), [["welch", T("Welch (não supõe iguais)", "Welch (not assumed equal)")], ["student", T("Student (supõe iguais)", "Student (assumed equal)")]]],
      ],
      run({ a, b }, { alt, var: v }, alpha) {
        a = readList(a); b = readList(b);
        if (!a || !b) return { error: T("Use só números, separados por espaço ou ponto e vírgula.", "Use numbers only, separated by spaces or commas.") };
        if (a.length < 2 || b.length < 2) return { error: T("Cada grupo precisa de pelo menos 2 valores.", "Each group needs at least 2 values.") };
        const [n1, n2] = [a.length, b.length], [m1, m2] = [mean(a), mean(b)], [v1, v2] = [variance(a), variance(b)];
        if (v1 === 0 && v2 === 0) return { error: T("Os dois grupos não variam: não há como estimar o erro.", "Neither group varies: the error can't be estimated.") };
        const sp = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
        const welch = v === "welch";
        const se = welch ? Math.sqrt(v1 / n1 + v2 / n2) : sp * Math.sqrt(1 / n1 + 1 / n2);
        const df = welch ? (v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1)) : n1 + n2 - 2;
        const t = (m1 - m2) / se, p = tP(t, df, alt);
        const d = (m1 - m2) / sp;
        const q = C.tinv(1 - alpha / 2, df), lo = m1 - m2 - q * se, hi = m1 - m2 + q * se;
        const dfTxt = fmt(df, welch ? 1 : 0);
        return {
          head: `t(${dfTxt}) = ${fmt(t, 2)} · p ${pTxt(p)}`,
          p,
          curve: curveT(t, df, alt),
          table: [[T("Grupo", "Group"), "n", T("Média", "Mean"), T("DP", "SD")],
            ["A", n1, fmt(m1), fmt(Math.sqrt(v1))], ["B", n2, fmt(m2), fmt(Math.sqrt(v2))]],
          steps: [
            [T("Diferença entre as médias:", "Difference between the means:"), `\\bar{x}_A - \\bar{x}_B = ${texN(m1)} - ${texN(m2)} = ${texN(m1 - m2)}`],
            welch
              ? [T("Erro padrão de Welch, com a variância de cada grupo:", "Welch standard error, with each group's own variance:"),
                `EP = \\sqrt{\\dfrac{${texN(v1)}}{${n1}} + \\dfrac{${texN(v2)}}{${n2}}} = ${texN(se)}`]
              : [T("Erro padrão com a variância combinada:", "Standard error with the pooled variance:"),
                `EP = s_p\\sqrt{\\tfrac{1}{${n1}} + \\tfrac{1}{${n2}}} = ${texN(sp)} \\cdot ${texN(Math.sqrt(1 / n1 + 1 / n2))} = ${texN(se)}`],
            [T("Estatística t:", "t statistic:"), `t = \\dfrac{${texN(m1 - m2)}}{${texN(se)}} = ${texN(t)}`],
            [welch ? T("Graus de liberdade de Welch–Satterthwaite (não inteiros):", "Welch–Satterthwaite degrees of freedom (not whole):") : T("Graus de liberdade:", "Degrees of freedom:"),
              welch ? `gl \\approx ${texN(df, 2)}` : `gl = n_A + n_B - 2 = ${df}`],
            [T(`Intervalo de ${fmt(100 * (1 - alpha), 0)}% para a diferença:`, `${fmt(100 * (1 - alpha), 0)}% interval for the difference:`),
              `${texN(m1 - m2)} \\pm ${texN(q)} \\cdot ${texN(se)} = [${texN(lo)};\\ ${texN(hi)}]`],
            [T("Tamanho de efeito, d de Cohen (DP combinado):", "Effect size, Cohen's d (pooled SD):"), `d = \\dfrac{${texN(m1 - m2)}}{${texN(sp)}} = ${texN(d, 2)}`],
          ],
          report: `t(${dfTxt}) = ${fmt(t, 2)}; p ${pTxt(p)}; d = ${fmt(d, 2)}${welch ? " (Welch)" : ""}`,
          h0: T("as médias dos dois grupos são iguais", "the two group means are equal"),
        };
      },
    },

    "t-pareado": {
      fields: [
        ["a", T("Antes", "Before"), "72 75 80 68 77 82 70 74 79 73"],
        ["b", T("Depois", "After"), "70 71 78 66 73 80 69 70 77 72"],
      ],
      options: [["alt", T("Hipótese alternativa: a diferença depois − antes é", "Alternative hypothesis: the difference after − before is"),
        [["bilateral", T("diferente de zero", "not zero")], ["maior", T("maior que zero", "greater than zero")], ["menor", T("menor que zero", "less than zero")]]]],
      run({ a, b }, { alt }, alpha) {
        a = readList(a); b = readList(b);
        if (!a || !b) return { error: T("Use só números, separados por espaço ou ponto e vírgula.", "Use numbers only, separated by spaces or commas.") };
        if (a.length !== b.length) return { error: T(`Os pares não fecham: ${a.length} valores antes e ${b.length} depois.`, `The pairs don't match: ${a.length} values before and ${b.length} after.`) };
        if (a.length < 2) return { error: T("São precisos pelo menos 2 pares.", "At least 2 pairs are needed.") };
        const d = b.map((x, i) => x - a[i]), n = d.length, md = mean(d), sd = Math.sqrt(variance(d));
        if (sd === 0) return { error: T("Todas as diferenças são iguais: o desvio padrão é zero e o t não existe.", "All differences are equal: the SD is zero and t is undefined.") };
        const se = sd / Math.sqrt(n), t = md / se, df = n - 1, p = tP(t, df, alt), dz = md / sd;
        const shown = d.slice(0, 12).map(v => texN(v)).join(",\\ ") + (n > 12 ? ",\\ \\ldots" : "");
        return {
          head: `t(${df}) = ${fmt(t, 2)} · p ${pTxt(p)}`,
          p,
          curve: curveT(t, df, alt),
          table: [["", "n", T("Média", "Mean"), T("DP", "SD")],
            [T("Antes", "Before"), n, fmt(mean(a)), fmt(Math.sqrt(variance(a)))],
            [T("Depois", "After"), n, fmt(mean(b)), fmt(Math.sqrt(variance(b)))],
            [T("Diferença", "Difference"), n, fmt(md), fmt(sd)]],
          steps: [
            [T("Diferença de cada par (depois − antes):", "Difference in each pair (after − before):"), `d = ${shown}`],
            [T("Média e desvio padrão das diferenças:", "Mean and SD of the differences:"), `\\bar{d} = ${texN(md)} \\qquad s_d = ${texN(sd)}`],
            [T("Estatística t, com n − 1 graus de liberdade:", "t statistic, with n − 1 degrees of freedom:"), `t = \\dfrac{${texN(md)}}{${texN(sd)} / \\sqrt{${n}}} = ${texN(t)}, \\quad gl = ${df}`],
            [T("Tamanho de efeito na escala das diferenças:", "Effect size on the scale of the differences:"), `d_z = \\dfrac{${texN(md)}}{${texN(sd)}} = ${texN(dz, 2)}`],
          ],
          report: `t(${df}) = ${fmt(t, 2)}; p ${pTxt(p)}; d_z = ${fmt(dz, 2)}`,
          h0: T("a média das diferenças é zero", "the mean difference is zero"),
          note: T("Repare que o teste só usa as diferenças: o mesmo par de listas, analisado como dois grupos independentes, daria outro resultado.", "Note that the test only uses the differences: the same two lists analysed as independent groups would give a different result."),
        };
      },
    },

    anova: {
      fields: [["g", T("Um grupo por linha (um rótulo com dois-pontos no começo é opcional)", "One group per line (an optional label with a colon at the start)"),
        T("Método A: 78 82 85 80 76 84\nMétodo B: 72 75 70 78 74 73\nMétodo C: 85 88 90 84 86 89", "Method A: 78 82 85 80 76 84\nMethod B: 72 75 70 78 74 73\nMethod C: 85 88 90 84 86 89"), 4]],
      options: [],
      run({ g }) {
        const groups = readGroups(g);
        if (groups.some(x => !x.xs)) return { error: T("Use só números em cada linha, depois do rótulo.", "Use numbers only on each line, after the label.") };
        if (groups.length < 2) return { error: T("São precisos pelo menos 2 grupos, um por linha.", "At least 2 groups are needed, one per line.") };
        if (groups.some(x => x.xs.length < 2)) return { error: T("Cada grupo precisa de pelo menos 2 valores.", "Each group needs at least 2 values.") };
        const all = groups.flatMap(x => x.xs), N = all.length, k = groups.length, gm = mean(all);
        const ssb = sum(groups.map(x => x.xs.length * (mean(x.xs) - gm) ** 2));
        const ssw = sum(groups.map(x => sum(x.xs.map(v => (v - mean(x.xs)) ** 2))));
        if (ssw === 0) return { error: T("Não há variação dentro dos grupos: o F não existe.", "There's no variation within groups: F is undefined.") };
        const df1 = k - 1, df2 = N - k, msb = ssb / df1, msw = ssw / df2, F = msb / msw;
        const p = 1 - C.fcdf(F, df1, df2), eta = ssb / (ssb + ssw);
        return {
          head: `F(${df1}, ${df2}) = ${fmt(F, 2)} · p ${pTxt(p)}`,
          p,
          curve: curveRight(F, x => C.fpdf(x, df1, df2), Math.max(5, C.finv(0.995, df1, df2)), `F(${df1}, ${df2})`),
          table: [[T("Grupo", "Group"), "n", T("Média", "Mean"), T("DP", "SD")],
            ...groups.map(x => [x.name, x.xs.length, fmt(mean(x.xs)), fmt(Math.sqrt(variance(x.xs)))])],
          table2: [[T("Fonte", "Source"), T("SQ", "SS"), T("gl", "df"), T("QM", "MS"), "F"],
            [T("Entre grupos", "Between groups"), fmt(ssb, 2), df1, fmt(msb, 2), fmt(F, 2)],
            [T("Dentro dos grupos", "Within groups"), fmt(ssw, 2), df2, fmt(msw, 2), ""],
            ["Total", fmt(ssb + ssw, 2), N - 1, "", ""]],
          steps: [
            [T("Média geral, de todos os valores juntos:", "Grand mean, of all values together:"), `\\bar{x} = ${texN(gm)}`],
            [T("Variação entre os grupos — quanto a média de cada grupo se afasta da geral:", "Between-group variation — how far each group mean is from the grand mean:"),
              `SQ_{\\text{entre}} = \\sum n_j(\\bar{x}_j - \\bar{x})^2 = ${texN(ssb, 2)}`],
            [T("Variação dentro dos grupos — quanto cada valor se afasta da média do seu grupo:", "Within-group variation — how far each value is from its group mean:"),
              `SQ_{\\text{dentro}} = \\sum\\sum (x_{ij} - \\bar{x}_j)^2 = ${texN(ssw, 2)}`],
            [T("Divida cada uma pelos graus de liberdade e compare:", "Divide each by its degrees of freedom and compare:"),
              `F = \\dfrac{${texN(ssb, 2)} / ${df1}}{${texN(ssw, 2)} / ${df2}} = \\dfrac{${texN(msb, 2)}}{${texN(msw, 2)}} = ${texN(F)}`],
            [T("Tamanho de efeito:", "Effect size:"), `\\eta^2 = \\dfrac{${texN(ssb, 2)}}{${texN(ssb + ssw, 2)}} = ${texN(eta, 2)}`],
          ],
          report: `F(${df1}, ${df2}) = ${fmt(F, 2)}; p ${pTxt(p)}; η² = ${fmt(eta, 2)}`,
          h0: T("todas as médias são iguais", "all means are equal"),
          note: p < 0.05
            ? T("A ANOVA diz que alguma média difere, mas não qual: para isso, um pós-teste como o de Tukey.", "ANOVA says some mean differs, but not which: for that, a post hoc test such as Tukey's.")
            : "",
          noteLink: p < 0.05 ? (EN ? "../tukey-hsd/" : "../tukey/") : null,
        };
      },
    },

    "qui-quadrado-independencia": {
      fields: [["tab", T("Tabela de contagens: uma linha por categoria de uma variável, colunas separadas por espaço", "Table of counts: one row per category of one variable, columns separated by spaces"), "30 45 25\n20 35 45", 4]],
      options: [["yates", T("Correção de Yates em tabelas 2 × 2", "Yates correction for 2 × 2 tables"), [["sim", T("sim (padrão do R e do SciPy)", "yes (R and SciPy default)")], ["nao", T("não", "no")]]]],
      run({ tab }, { yates }) {
        const O = readTable(tab);
        if (!O) return { error: T("Use só contagens: inteiros a partir de 0.", "Use counts only: whole numbers from 0.") };
        const r = O.length, c = O[0].length;
        if (O.some(row => row.length !== c)) return { error: T("Todas as linhas precisam ter o mesmo número de colunas.", "All rows need the same number of columns.") };
        if (r < 2 || c < 2) return { error: T("A tabela precisa de pelo menos 2 linhas e 2 colunas.", "The table needs at least 2 rows and 2 columns.") };
        const R = O.map(sum), Cs = O[0].map((_, j) => sum(O.map(row => row[j]))), N = sum(R);
        if (R.includes(0) || Cs.includes(0)) return { error: T("Há uma linha ou coluna só com zeros: retire-a.", "There's a row or column of zeros only: remove it.") };
        const E = O.map((row, i) => row.map((_, j) => R[i] * Cs[j] / N));
        const corr = yates === "sim" && r === 2 && c === 2;
        let x2 = 0, x2raw = 0;
        O.forEach((row, i) => row.forEach((o, j) => {
          const e = E[i][j], dev = Math.abs(o - e);
          x2raw += dev ** 2 / e;
          x2 += (corr ? Math.max(0, dev - Math.min(0.5, dev)) : dev) ** 2 / e;
        }));
        const df = (r - 1) * (c - 1), p = C.chi2sf(x2, df);
        const V = Math.sqrt(x2raw / (N * (Math.min(r, c) - 1)));
        const small = E.flat().filter(e => e < 5).length;
        let note = small
          ? T(`${small} de ${r * c} células têm contagem esperada abaixo de 5, e a aproximação pelo χ² perde precisão.`, `${small} of ${r * c} cells have an expected count below 5, and the χ² approximation loses accuracy.`)
            + (r === 2 && c === 2 ? T(" Numa 2 × 2, prefira o teste exato de Fisher.", " In a 2 × 2 table, prefer Fisher's exact test.") : "")
          : "";
        if (corr) note += T(" Com a correção de Yates, cada |O − E| perde 0,5 antes de ser elevado ao quadrado. O V de Cramér usa o χ² sem correção.", " With the Yates correction, each |O − E| loses 0.5 before squaring. Cramér's V uses the uncorrected χ².");
        return {
          head: `χ²(${df}, N = ${N}) = ${fmt(x2, 2)} · p ${pTxt(p)}`,
          p,
          curve: curveRight(x2, x => C.chi2pdf(x, df), df + 6 * Math.sqrt(2 * df), `χ²(${df})`),
          table: [["", ...Cs.map((_, j) => `${T("Col.", "Col.")} ${j + 1}`), "Total"],
            ...O.map((row, i) => [`${T("Linha", "Row")} ${i + 1}`, ...row.map((o, j) => `${o} (${fmt(E[i][j], 1)})`), R[i]]),
            ["Total", ...Cs, N]],
          tableNote: T("Entre parênteses, a contagem esperada se não houvesse associação.", "In brackets, the expected count if there were no association."),
          steps: [
            [T("Contagem esperada em cada célula, se as variáveis fossem independentes: total da linha × total da coluna ÷ total geral. Por exemplo, na primeira célula:", "Expected count in each cell if the variables were independent: row total × column total ÷ grand total. For example, in the first cell:"),
              `E_{11} = \\dfrac{${R[0]} \\cdot ${Cs[0]}}{${N}} = ${texN(E[0][0], 2)}`],
            [T("Some, em todas as células, a distância entre o observado e o esperado:", "Add up, over all cells, the distance between observed and expected:"),
              `\\chi^2 = \\sum \\dfrac{(${corr ? "|O - E| - 0{,}5" : "O - E"})^2}{E} = ${texN(x2)}`],
            [T("Graus de liberdade:", "Degrees of freedom:"), `gl = (${r} - 1)(${c} - 1) = ${df}`],
            [T("Tamanho de efeito, V de Cramér:", "Effect size, Cramér's V:"), `V = \\sqrt{\\dfrac{${texN(x2raw, 2)}}{${N} \\cdot ${Math.min(r, c) - 1}}} = ${texN(V, 2)}`],
          ],
          report: `χ²(${df}, N = ${N}) = ${fmt(x2, 2)}; p ${pTxt(p)}; V = ${fmt(V, 2)}`,
          h0: T("as duas variáveis são independentes", "the two variables are independent"),
          note,
        };
      },
    },

    "mann-whitney": {
      fields: [
        ["a", T("Grupo A", "Group A"), "12 15 17 21 25 28 31"],
        ["b", T("Grupo B", "Group B"), "9 11 14 16 18 19 22"],
      ],
      options: [["alt", T("Hipótese alternativa: os valores de A tendem a ser", "Alternative hypothesis: values in A tend to be"),
        [["bilateral", T("diferentes dos de B (bilateral)", "different from B (two-sided)")], ["maior", T("maiores que os de B", "greater than B")], ["menor", T("menores que os de B", "less than B")]]]],
      run({ a, b }, { alt }) {
        a = readList(a); b = readList(b);
        if (!a || !b) return { error: T("Use só números, separados por espaço ou ponto e vírgula.", "Use numbers only, separated by spaces or commas.") };
        if (a.length < 2 || b.length < 2) return { error: T("Cada grupo precisa de pelo menos 2 valores.", "Each group needs at least 2 values.") };
        const n1 = a.length, n2 = b.length, N = n1 + n2;
        // Postos de todos juntos, com a média dos postos nos empates.
        const all = a.map(v => [v, 0]).concat(b.map(v => [v, 1])).sort((x, y) => x[0] - y[0]);
        const rank = new Array(N);
        let ties = 0;
        for (let i = 0; i < N;) {
          let j = i;
          while (j + 1 < N && all[j + 1][0] === all[i][0]) j++;
          const t = j - i + 1;
          if (t > 1) ties += t ** 3 - t;
          for (let k = i; k <= j; k++) rank[k] = (i + j) / 2 + 1;
          i = j + 1;
        }
        const R1 = sum(all.map((x, i) => (x[1] === 0 ? rank[i] : 0)));
        const U1 = R1 - n1 * (n1 + 1) / 2; // o W do R
        const U = n1 * n2 - U1;            // a fórmula da ficha
        const mu = n1 * n2 / 2;
        const sigma = Math.sqrt(n1 * n2 / 12 * ((N + 1) - ties / (N * (N - 1))));
        // Aproximação normal com correção de continuidade, como o R.
        const cc = alt === "maior" ? 0.5 : alt === "menor" ? -0.5 : Math.sign(U1 - mu) * 0.5;
        const z = (U1 - mu - cc) / sigma;
        const exact = !ties && n1 < 50 && n2 < 50;
        let p;
        if (exact) {
          const dist = uDist(n1, n2), total = sum(dist);
          const cdf = u => sum(dist.slice(0, Math.floor(u + 1e-9) + 1)) / total;
          const sf = u => 1 - cdf(u - 1);
          p = alt === "maior" ? sf(U1) : alt === "menor" ? cdf(U1) : Math.min(1, 2 * Math.min(cdf(U1), sf(U1)));
        } else {
          p = alt === "maior" ? 1 - C.ncdf(z) : alt === "menor" ? C.ncdf(z) : 2 * (1 - C.ncdf(Math.abs(z)));
        }
        const r = Math.abs(z) / Math.sqrt(N);
        return {
          head: `U = ${fmt(U, 1)} · p ${pTxt(p)}`,
          p,
          curve: { dens: C.npdf, x0: -Math.max(4, Math.abs(z) + 1), x1: Math.max(4, Math.abs(z) + 1),
            bands: alt === "maior" ? [[z, Infinity]] : alt === "menor" ? [[-Infinity, z]] : [[-Infinity, -Math.abs(z)], [Math.abs(z), Infinity]], mark: z, label: "z" },
          table: [[T("Grupo", "Group"), "n", T("Soma dos postos", "Rank sum"), T("Mediana", "Median")],
            ["A", n1, fmt(R1, 1), fmt(median(a))], ["B", n2, fmt(N * (N + 1) / 2 - R1, 1), fmt(median(b))]],
          steps: [
            [T("Junte os dois grupos, ordene e dê postos (1 para o menor; empates recebem a média dos postos). Some os postos de A:", "Pool both groups, sort and rank them (1 for the smallest; ties get the average rank). Add up A's ranks:"),
              `R_A = ${texN(R1, 1)}`],
            [T("Estatística U, pela fórmula da ficha:", "U statistic, by the formula above:"),
              `U = n_A n_B + \\dfrac{n_A(n_A + 1)}{2} - R_A = ${n1 * n2} + ${n1 * (n1 + 1) / 2} - ${texN(R1, 1)} = ${texN(U, 1)}`],
            [T("Sob H₀, U fica em torno de n_A n_B / 2. A distância padronizada é o z:", "Under H₀, U is centred on n_A n_B / 2. The standardised distance is z:"),
              `z = \\dfrac{U_A - ${texN(mu, 1)}}{${texN(sigma, 2)}} = ${texN(z, 2)}`],
            [T("Tamanho de efeito:", "Effect size:"), `r = \\dfrac{|z|}{\\sqrt{N}} = \\dfrac{${texN(Math.abs(z), 2)}}{\\sqrt{${N}}} = ${texN(r, 2)}`],
          ],
          report: `U = ${fmt(U, 1)}; z = ${fmt(z, 2)}; p ${pTxt(p)}; r = ${fmt(r, 2)}`,
          h0: T("os dois grupos vêm da mesma distribuição", "both groups come from the same distribution"),
          note: (exact
            ? T("Sem empates e com amostras pequenas, o valor-p é exato: conta todas as maneiras de repartir os postos entre os grupos. O z serve só para o tamanho de efeito.", "With no ties and small samples, the p-value is exact: it counts every way of splitting the ranks between the groups. z is used only for the effect size.")
            : T("Com empates ou amostras grandes, o valor-p vem da aproximação normal, com correção de continuidade e de empates.", "With ties or large samples, the p-value comes from the normal approximation, with continuity and tie corrections."))
            + T(` O R mostra W = ${fmt(U1, 1)}, que é o U contado a partir do grupo A (U_A = R_A − n_A(n_A + 1)/2); os dois somam n_A n_B.`, ` R reports W = ${fmt(U1, 1)}, the U counted from group A (U_A = R_A − n_A(n_A + 1)/2); the two add up to n_A n_B.`),
        };
      },
    },
  };

  function median(xs) {
    const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  // Quantas maneiras há de cada U (de A) sem empates: f(n, m, u) =
  // f(n − 1, m, u − m) + f(n, m − 1, u), o maior valor ficando em A ou em B.
  function uDist(n, m) {
    const memo = new Map();
    const f = (i, j) => {
      const key = i * 1000 + j;
      if (memo.has(key)) return memo.get(key);
      let out;
      if (i === 0 || j === 0) out = [1];
      else {
        const A = f(i - 1, j), B = f(i, j - 1);
        out = new Array(i * j + 1).fill(0);
        A.forEach((c, u) => { out[u + j] += c; });
        B.forEach((c, u) => { out[u] += c; });
      }
      memo.set(key, out);
      return out;
    };
    return f(n, m);
  }

  /* ---------------------------------------------------------------- interface */

  const spec = CALCS[section.dataset.calc];
  if (!spec) return;
  section.hidden = false;
  const body = section.querySelector(".tc-body");

  const form = el("div", "tc-form");
  const inputs = {};
  spec.fields.forEach(([name, label, example, rows = 2]) => {
    const lab = el("label", "tc-field");
    lab.appendChild(el("span", null, label));
    const ta = el("textarea");
    Object.assign(ta, { name, rows, spellcheck: false, value: example });
    ta.setAttribute("autocomplete", "off");
    lab.appendChild(ta);
    form.appendChild(lab);
    inputs[name] = ta;
  });
  const opts = {};
  const optRow = el("div", "tc-options");
  spec.options.forEach(([name, label, choices]) => {
    const lab = el("label", "tc-field");
    lab.appendChild(el("span", null, label));
    const sel = el("select");
    sel.name = name;
    choices.forEach(([v, t]) => { const o = el("option", null, t); o.value = v; sel.appendChild(o); });
    lab.appendChild(sel);
    optRow.appendChild(lab);
    opts[name] = sel;
  });
  const alphaLab = el("label", "tc-field");
  alphaLab.appendChild(el("span", null, T("Nível de significância α", "Significance level α")));
  const alphaSel = el("select");
  [0.01, 0.05, 0.1].forEach(a => { const o = el("option", null, fmt(a, 2)); o.value = a; if (a === 0.05) o.selected = true; alphaSel.appendChild(o); });
  alphaLab.appendChild(alphaSel);
  optRow.appendChild(alphaLab);
  form.appendChild(optRow);

  const out = el("div", "tc-out");
  const head = el("p", "tc-head");
  const decision = el("p", "tc-decision");
  const plot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  plot.setAttribute("viewBox", "0 0 320 150");
  plot.setAttribute("class", "calc-plot tc-plot");
  plot.setAttribute("role", "img");
  const plotNote = el("p", "tc-plot-note");
  const tables = el("div", "tc-tables");
  const stepsTitle = el("h3", "tc-sub", T("Passo a passo", "Step by step"));
  const steps = el("ol", "tc-steps");
  const reportTitle = el("h3", "tc-sub", T("Para o relatório", "For your report"));
  const report = el("p", "fd-report tc-report");
  const note = el("p", "tc-note");
  out.append(head, decision, plot, plotNote, tables, stepsTitle, steps, reportTitle, report, note);
  body.append(form, out);

  function table(rows, caption) {
    const wrap = el("div", "tc-table-wrap");
    const t = el("table", "tc-table");
    rows.forEach((r, i) => {
      const tr = (i ? t.createTBody() : t.createTHead()).insertRow();
      r.forEach(c => { const cell = el(i ? "td" : "th", null, String(c)); tr.appendChild(cell); });
    });
    wrap.appendChild(t);
    if (caption) wrap.appendChild(el("p", "tc-table-note", caption));
    return wrap;
  }

  function update() {
    const alpha = Number(alphaSel.value);
    const res = spec.run(
      Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, v.value])),
      Object.fromEntries(Object.entries(opts).map(([k, v]) => [k, v.value])),
      alpha);
    out.classList.toggle("has-error", !!res.error);
    if (res.error) {
      head.textContent = "";
      decision.textContent = res.error;
      [plot, tables, steps, report, note].forEach(e => e.replaceChildren());
      return;
    }
    head.textContent = res.head;
    const reject = res.p < alpha;
    decision.className = `tc-decision ${reject ? "is-reject" : "is-keep"}`;
    decision.textContent = reject
      ? T(`p < α = ${fmt(alpha, 2)}: rejeita-se H₀, a hipótese de que ${res.h0}. O resultado é estatisticamente significativo a ${fmt(100 * alpha, 0)}%.`,
        `p < α = ${fmt(alpha, 2)}: H₀, the hypothesis that ${res.h0}, is rejected. The result is statistically significant at ${fmt(100 * alpha, 0)}%.`)
      : T(`p ≥ α = ${fmt(alpha, 2)}: não se rejeita H₀, a hipótese de que ${res.h0}. Isso não prova H₀ — só diz que os dados não bastam para descartá-la.`,
        `p ≥ α = ${fmt(alpha, 2)}: H₀, the hypothesis that ${res.h0}, is not rejected. That doesn't prove H₀ — the data just aren't enough to rule it out.`);

    const cv = res.curve;
    C.pintar(plot, cv.bands.map(([a, b]) => [Math.max(a, cv.x0), Math.min(b, cv.x1)]), [cv.mark], cv.dens, cv.x0, cv.x1);
    plot.setAttribute("aria-label", T(`Curva ${cv.label} com a área do valor-p sombreada`, `${cv.label} curve with the p-value area shaded`));
    plotNote.textContent = cv.mark > cv.x1 || cv.mark < cv.x0
      ? T(`A estatística (${fmt(cv.mark, 2)}) fica além do fim da figura: a área do valor-p, lá na cauda, é pequena demais para aparecer.`,
        `The statistic (${fmt(cv.mark, 2)}) lies beyond the end of the figure: the p-value area, far out in the tail, is too small to show.`)
      : T(`Curva ${cv.label} sob H₀; a área sombreada é o valor-p.`, `${cv.label} curve under H₀; the shaded area is the p-value.`);

    tables.replaceChildren(table(res.table, res.tableNote));
    if (res.table2) tables.appendChild(table(res.table2));

    steps.replaceChildren();
    res.steps.forEach(([t, src]) => {
      const li = el("li");
      li.appendChild(el("span", null, t));
      const m = el("span", "tc-math");
      tex(m, src);
      li.appendChild(m);
      steps.appendChild(li);
    });
    report.textContent = res.report;
    note.textContent = res.note || "";
    if (res.noteLink) {
      const a = el("a", null, T(" Ver o teste de Tukey →", " See Tukey's test →"));
      a.href = res.noteLink;
      note.appendChild(a);
    }
  }

  body.addEventListener("input", update);
  body.addEventListener("change", update);
  update();
})();
