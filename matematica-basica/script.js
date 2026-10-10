/* Matemática básica: o índice e as páginas de cada assunto.
 *
 * Cada calculadora é um <section class="calc" data-calc="nome"> com um campo
 * name="n" para a lista de inteiros. CALCS[nome] recebe a lista já conferida
 * e devolve o resultado, os passos (texto + LaTeX), uma nota em HTML e, se
 * houver, os blocos extras da página (tabela de divisões, divisores…).
 * O estado fica em ?n=, como nas fórmulas, para o resultado poder ser
 * compartilhado.
 */
(() => {
  const MAX = 1e6;    // maior número aceito
  const MAX_COUNT = 8; // quantos números de uma vez

  const fmt = n => n.toLocaleString("pt-BR");
  // No KaTeX, ponto e vírgula entre chaves não ganham espaço de pontuação.
  const texNum = n => fmt(n).replace(/[.,]/g, c => `{${c}}`);
  const tone = (t, n) => `\\htmlData{tone=${n}}{${t}}`;
  const args = ns => ns.map(texNum).join(",\\ ");

  // \htmlData só para pintar trechos com data-tone; nada além disso é confiável.
  const MATH_OPTS = { throwOnError: false, strict: false, trust: c => c.command === "\\htmlData" };
  const math = (el, src) => (window.katex ? katex.render(src, el, MATH_OPTS) : (el.textContent = src));

  /* ---------------------------------------------------------------- aritmética */

  const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };

  // Fatoração por tentativa: com números até 10⁶, basta testar até 1000.
  function factor(n) {
    const fs = new Map();
    for (let p = 2; p * p <= n; p += p === 2 ? 1 : 2) {
      while (n % p === 0) { fs.set(p, (fs.get(p) || 0) + 1); n /= p; }
    }
    if (n > 1) fs.set(n, (fs.get(n) || 0) + 1);
    return fs;
  }

  const smallestPrime = n => { for (let p = 2; p * p <= n; p++) if (n % p === 0) return p; return n; };

  // 2⁴ · 3 · 7. Primos em `hi` saem pintados com a cor do resultado.
  function texFactors(fs, hi) {
    if (!fs.size) return "1";
    return Array.from(fs).map(([p, e]) => {
      const t = e > 1 ? `${texNum(p)}^{${e}}` : texNum(p);
      return hi && hi.has(p) ? tone(t, 1) : t;
    }).join(" \\cdot ");
  }

  const aligned = rows => `\\begin{aligned}${rows.join(" \\\\ ")}\\end{aligned}`;

  function divisors(n) {
    const lo = [], hi = [];
    for (let d = 1; d * d <= n; d++) {
      if (n % d) continue;
      lo.push(d);
      if (d * d !== n) hi.unshift(n / d);
    }
    return lo.concat(hi);
  }

  /* ---------------------------------------------------------------- calculadoras */

  const CALCS = {
    mdc(ns) {
      if (ns.length < 2) return { error: "Digite pelo menos dois números." };
      if (ns.includes(0)) return { error: "Use números a partir de 1: todo número divide o zero, então o MDC com 0 não diz nada de útil." };

      const g = ns.reduce(gcd);
      const facts = ns.map(factor);
      // Primos que aparecem em todos, com o menor expoente.
      const common = new Map();
      for (const [p, e] of facts[0]) {
        if (facts.every(f => f.has(p))) common.set(p, Math.min(e, ...facts.map(f => f.get(p))));
      }
      const commonSet = new Set(common.keys());

      const steps = [
        ["Fatore cada número em primos. Os primos que aparecem em todos estão destacados:",
          aligned(ns.map((n, i) => `${texNum(n)} &= ${texFactors(facts[i], commonSet)}`))],
        common.size
          ? ["Multiplique os primos comuns, cada um com o menor expoente em que aparece:",
            `\\text{MDC} = ${texFactors(common)} = ${tone(texNum(g), 1)}`]
          : ["Nenhum primo aparece em todos, então o único divisor comum é 1:",
            `\\text{MDC} = ${tone("1", 1)}`],
      ];

      // Euclides de dois em dois: MDC(a, b, c) = MDC(MDC(a, b), c).
      let acc = ns[0];
      ns.slice(1).forEach((x, k) => {
        let a = Math.max(acc, x), b = Math.min(acc, x);
        const rows = [];
        while (b) {
          const q = Math.floor(a / b), r = a % b;
          rows.push(`${texNum(a)} &= ${texNum(q)} \\cdot ${r ? texNum(b) : tone(texNum(b), 1)} + ${texNum(r)}`);
          [a, b] = [b, r];
        }
        const label = ns.length > 2 ? ` — MDC(${fmt(Math.max(acc, x))}, ${fmt(Math.min(acc, x))})` : "";
        steps.push([
          (k === 0 ? "Confira pelo algoritmo de Euclides: divida o maior pelo menor e troque o par por (divisor, resto) até o resto dar zero. O último divisor é o MDC"
            : "Continue com o próximo número") + label + ":",
          aligned(rows),
        ]);
        acc = gcd(acc, x);
      });

      const quocientes = ns.map(n => `${fmt(n)} ÷ ${fmt(g)} = ${fmt(n / g)}`);
      let note = `Conferindo: ${quocientes.join("; ")}. Nenhuma divisão deixa resto, e nenhum número maior que ${fmt(g)} divide todos.`;
      if (g === 1) note += " Quando o MDC é 1, dizemos que os números são <strong>primos entre si</strong>.";
      note += ` <a href="mmc.html?n=${ns.join(",")}">Veja o MMC dos mesmos números →</a>`;

      return {
        result: `\\text{MDC}(${args(ns)}) = ${tone(texNum(g), 1)}`,
        steps,
        note,
        divisors: ns.length <= 4 ? { ns, g } : null,
      };
    },

    mmc(ns) {
      if (ns.length < 2) return { error: "Digite pelo menos dois números." };
      if (ns.includes(0)) return { error: "Use números a partir de 1: o único múltiplo comum com o 0 é o próprio 0." };

      const l = ns.reduce((a, b) => a / gcd(a, b) * b);
      if (!Number.isSafeInteger(l)) return { error: "O MMC desses números passa de 9 quatrilhões, além do que dá para calcular com exatidão aqui. Tente números menores." };

      // A tabela de divisões: divide todos pelo menor primo que divide algum
      // deles; quem não é divisível desce igual.
      const rows = [];
      let cur = ns.slice();
      while (cur.some(n => n > 1)) {
        const p = Math.min(...cur.filter(n => n > 1).map(smallestPrime));
        const hit = cur.map(n => n % p === 0);
        rows.push({ vals: cur, p, hit });
        cur = cur.map((n, i) => (hit[i] ? n / p : n));
      }
      rows.push({ vals: cur, p: null, hit: cur.map(() => false) });

      const primes = rows.filter(r => r.p).map(r => r.p);
      const facts = ns.map(factor);
      const top = new Map();
      facts.forEach(f => f.forEach((e, p) => top.set(p, Math.max(e, top.get(p) || 0))));
      const sorted = new Map(Array.from(top).sort((a, b) => a[0] - b[0]));
      // Destaca, em cada número, o primo que entra com o maior expoente.
      const winner = f => new Set(Array.from(f).filter(([p, e]) => e === top.get(p)).map(([p]) => p));

      const steps = [
        ["Na tabela acima, divida todos pelo menor primo que divide algum deles; quem não for divisível desce igual. Repita até a última linha ser toda de 1.", null],
        ["Multiplique os primos da coluna da direita:",
          `${primes.map(texNum).join(" \\cdot ")} = ${texFactors(sorted)} = ${tone(texNum(l), 1)}`],
        ["Confira pela fatoração: o MMC leva cada primo com o maior expoente em que ele aparece (destacado):",
          aligned(ns.map((n, i) => `${texNum(n)} &= ${texFactors(facts[i], winner(facts[i]))}`)
            .concat(`\\text{MMC} &= ${texFactors(sorted)} = ${tone(texNum(l), 1)}`))],
      ];
      if (ns.length === 2) {
        const g = gcd(ns[0], ns[1]);
        steps.push(["Com dois números, há um atalho: o produto deles é igual a MDC × MMC.",
          `\\text{MMC} = \\dfrac{${texNum(ns[0])} \\cdot ${texNum(ns[1])}}{\\text{MDC}(${args(ns)})} = \\dfrac{${texNum(ns[0] * ns[1])}}{${texNum(g)}} = ${tone(texNum(l), 1)}`]);
      }

      const vezes = ns.map(n => `${fmt(l)} = ${fmt(l / n)} × ${fmt(n)}`);
      const note = `Conferindo: ${vezes.join("; ")}. ${fmt(l)} está na tabuada de todos, e nenhum número menor está.`
        + ` <a href="mdc.html?n=${ns.join(",")}">Veja o MDC dos mesmos números →</a>`;

      return {
        result: `\\text{MMC}(${args(ns)}) = ${tone(texNum(l), 1)}`,
        steps,
        note,
        ladder: rows,
        multiples: ns.length <= 4 && l / Math.min(...ns) <= 30 ? { ns, l } : null,
      };
    },
  };

  /* ---------------------------------------------------------------- blocos extras */

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  function renderLadder(box, rows) {
    const table = el("table", "ladder");
    const cap = el("caption", "visually-hidden", "Tabela de divisões sucessivas: cada linha divide os números pelo primo da direita.");
    table.appendChild(cap);
    const body = table.createTBody();
    rows.forEach(r => {
      const tr = body.insertRow();
      r.vals.forEach((v, i) => {
        const td = tr.insertCell();
        td.textContent = fmt(v);
        if (r.hit[i]) td.className = "is-hit";
      });
      const td = tr.insertCell();
      td.className = "ladder-prime";
      td.textContent = r.p ? fmt(r.p) : "";
    });
    box.replaceChildren(table);
  }

  // Uma linha de "chips" por número; os comuns ganham contorno, o MDC é cheio.
  function renderDivisors(box, { ns, g }) {
    const lists = ns.map(divisors);
    const common = new Set(divisors(g));
    box.replaceChildren();
    ns.forEach((n, i) => {
      const row = el("div", "chips");
      row.appendChild(el("span", "chips-label", `Divisores de ${fmt(n)}`));
      const ul = el("ul");
      lists[i].forEach(d => {
        const li = el("li", d === g ? "is-best" : common.has(d) ? "is-common" : "", fmt(d));
        ul.appendChild(li);
      });
      row.appendChild(ul);
      box.appendChild(row);
    });
    box.appendChild(el("p", "chips-legend",
      `Com contorno, os divisores comuns: ${Array.from(common).map(fmt).join(", ")}. O maior deles, ${fmt(g)}, é o MDC.`));
  }

  function renderMultiples(box, { ns, l }) {
    box.replaceChildren();
    ns.forEach(n => {
      const row = el("div", "chips");
      row.appendChild(el("span", "chips-label", `Múltiplos de ${fmt(n)}`));
      const ul = el("ul");
      for (let m = n; m <= l; m += n) ul.appendChild(el("li", m === l ? "is-best" : "", fmt(m)));
      row.appendChild(ul);
      box.appendChild(row);
    });
    box.appendChild(el("p", "chips-legend",
      `Cada lista para no primeiro número que aparece em todas: ${fmt(l)}, o MMC.`));
  }

  /* ---------------------------------------------------------------- calculadora */

  function readList(s) {
    const parts = s.split(/[\s,;]+/).filter(Boolean);
    if (!parts.length) return { error: "Digite os números separados por vírgula ou espaço." };
    if (parts.some(p => !/^\d+$/.test(p))) return { error: "Use só números inteiros positivos, sem pontos, vírgulas decimais ou sinais." };
    const ns = parts.map(Number);
    if (ns.length > MAX_COUNT) return { error: `Use no máximo ${MAX_COUNT} números de uma vez.` };
    if (ns.some(n => n > MAX)) return { error: `Use números até ${fmt(MAX)}.` };
    return { ns };
  }

  function initCalc(section) {
    const calc = CALCS[section.dataset.calc];
    const input = section.querySelector("input[name]");
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const extras = {
      ladder: [section.querySelector(".ladder-box"), renderLadder],
      divisors: [section.querySelector(".divisors-box"), renderDivisors],
      multiples: [section.querySelector(".multiples-box"), renderMultiples],
    };

    const params = new URLSearchParams(location.search);
    if (params.has(input.name)) input.value = params.get(input.name);

    function update() {
      const read = readList(input.value);
      const out = read.error ? read : calc(read.ns);
      input.setAttribute("aria-invalid", String(!!read.error));
      section.classList.toggle("has-error", !!out.error);
      steps.replaceChildren();
      Object.entries(extras).forEach(([key, [box, render]]) => {
        if (!box) return;
        const data = out.error ? null : out[key];
        box.closest("[data-extra]").hidden = !data;
        if (data) render(box, data);
      });
      if (out.error) {
        result.textContent = "";
        note.textContent = out.error;
        return;
      }
      math(result, out.result);
      out.steps.forEach(([text, src]) => {
        const li = el("li");
        li.appendChild(el("span", null, text));
        if (src) {
          const m = el("span", "calc-math");
          math(m, src);
          li.appendChild(m);
        }
        steps.appendChild(li);
      });
      note.innerHTML = out.note;
    }

    // replaceState, não pushState: cada tecla viraria uma entrada no histórico.
    input.addEventListener("input", () => {
      update();
      const q = new URLSearchParams(location.search);
      q.set(input.name, input.value.trim());
      history.replaceState(null, "", `${location.pathname}?${q}${location.hash}`);
    });

    // Exemplos clicáveis: <button data-exemplo="12, 18">.
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      input.value = btn.dataset.exemplo;
      input.dispatchEvent(new Event("input"));
    }));

    update();
  }

  document.querySelectorAll(".calc[data-calc]").forEach(initCalc);
  document.querySelectorAll("[data-tex]").forEach(e => math(e, "\\displaystyle " + e.dataset.tex));
})();
