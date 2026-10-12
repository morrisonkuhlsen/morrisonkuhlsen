/* Fatorial: a escada de 0! a n! (que explica 0! = 1), as filas de letras que
 * mostram o que n! conta, a calculadora exata (com BigInt) que também
 * cancela n!/k! e os cards de regra. Os utilitários vêm de licao.js.
 */
(() => {
  const { fmt, sup, tone, math, el, saveParams } = Licao;

  // 3628800 → 3.628.800; com mais de 60 algarismos, notação científica.
  const milhar = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  function fact(n) {
    let r = 1n;
    for (let i = 2n; i <= BigInt(n); i++) r *= i;
    return r;
  }
  // log10(n!) para o tamanho e a mantissa, sem precisar do número inteiro.
  const log10f = n => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log10(i); return s; };
  function sci(n) {
    const L = log10f(n), k = Math.floor(L), m = 10 ** (L - k);
    return { k, m, tex: `${fmt(m, 3).replace(",", "{,}")} \\times 10^{${k}}`, txt: `${fmt(m, 3)} × 10${sup(k)}` };
  }
  const bigTex = b => milhar(b.toString()).replace(/\./g, "{.}");

  /* ---------------------------------------------------------------- escada */

  function initEscada(section) {
    const input = section.querySelector("input[name=n]");
    const out = section.querySelector(".out-n");
    const expand = section.querySelector(".fat-expand");
    const ladder = section.querySelector(".ladder-steps");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("n")) input.value = q.get("n");

    function draw() {
      const n = Number(input.value);
      out.textContent = n;
      const fatores = Array.from({ length: n }, (_, i) => n - i);
      math(expand, n === 0
        ? `0! = ${tone(1, 1)}`
        : `${n}! = ${n === 1 ? "1" : `\\underbrace{${fatores.join(" \\times ")}}_{${n}\\ \\text{fatores}}`} = ${tone(bigTex(fact(n)), 1)}`);

      // De 0! até 10!: de um degrau para o seguinte, × o número novo.
      ladder.replaceChildren();
      for (let k = 0; k <= 10; k++) {
        if (k > 0) ladder.appendChild(el("li", "ladder-op", `× ${k}`));
        const li = el("li", k === n ? "ladder-step is-on" : "ladder-step");
        const top = el("span", "ladder-pow");
        math(top, `${k}!`);
        const bottom = el("span", "ladder-val");
        math(bottom, bigTex(fact(k)));
        li.append(top, bottom);
        ladder.appendChild(li);
      }
      const on = ladder.querySelector(".is-on");
      if (on) ladder.scrollLeft = on.offsetLeft - (ladder.clientWidth - on.offsetWidth) / 2;

      text.innerHTML = n === 0
        ? `<p>Zero fatores? Desça a escada: cada degrau para a esquerda <strong>divide</strong> pelo número que tinha entrado. 1! = 1, e 1 ÷ 1 = <strong>1</strong>. Por isso 0! = 1 — e ele também conta direito: há exatamente um jeito de enfileirar zero objetos, que é não fazer nada.</p>`
        : n === 1
          ? `<p>Um fator só: <strong>1! = 1</strong>. Uma coisa só tem um jeito de ficar em fila.</p>`
          : `<p><strong>${n}!</strong> (lê-se “${n} fatorial”) é o produto de todos os inteiros de ${n} até 1. Na escada, cada degrau é o anterior vezes o número novo: ${n}! = ${n} × ${n - 1}! = ${n} × ${milhar(fact(n - 1).toString())}.</p>`
            + (n >= 8 ? `<p>Repare como cresce: ${n}! já tem ${fact(n).toString().length} algarismos.</p>` : "");
      saveParams({ n });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- filas */

  function perms(arr) {
    if (arr.length <= 1) return [arr];
    return arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]));
  }

  function initFilas(section) {
    const input = section.querySelector("input[name=letras]");
    const out = section.querySelector(".out-letras");
    const list = section.querySelector(".fila-list");
    const text = section.querySelector(".fila-text");
    const q = new URLSearchParams(location.search);
    if (q.has("letras")) input.value = q.get("letras");

    function draw() {
      const n = Number(input.value);
      out.textContent = n;
      const letras = "ABCDE".slice(0, n).split("");
      const ps = perms(letras);
      list.replaceChildren(...ps.map(p => {
        // A cor vem da primeira letra: (n − 1)! filas em cada grupo.
        const li = el("li", "fila");
        li.dataset.first = p[0];
        li.textContent = p.join("");
        return li;
      }));
      const escolhas = Array.from({ length: n }, (_, i) => n - i);
      text.innerHTML = `<p>Para o 1º lugar da fila há ${n} ${n === 1 ? "escolha" : "escolhas"}${n > 1 ? `; escolhido ele, sobram ${n - 1} para o 2º` : ""}${n > 2 ? `, ${n - 2} para o 3º` : ""}${n > 3 ? " e assim por diante" : ""}. Cada escolha se combina com todas as seguintes, então se multiplica: <strong>${escolhas.join(" × ")} = ${ps.length}</strong> filas.</p>`
        + (n > 1 ? `<p>As cores agrupam as filas pela primeira letra: são ${n} grupos de ${ps.length / n} — porque, fixada a primeira, as outras ${n - 1} se arrumam de ${n - 1}! = ${ps.length / n} jeitos.</p>` : "");
      saveParams({ letras: n });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- calculadora */

  function initCalc(section) {
    const inN = section.querySelector("input[name=fn]");
    const inK = section.querySelector("input[name=fk]");
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("fn")) inN.value = q.get("fn");
    if (q.has("fk")) inK.value = q.get("fk");

    function update() {
      const sn = inN.value.trim(), sk = inK.value.trim();
      saveParams({ fn: sn, fk: sk });
      steps.replaceChildren();
      const okN = /^\d{1,4}$/.test(sn) && Number(sn) <= 1000;
      const okK = !sk || (/^\d{1,4}$/.test(sk) && Number(sk) <= Number(sn));
      inN.setAttribute("aria-invalid", String(!okN));
      inK.setAttribute("aria-invalid", String(okN && !okK));
      section.classList.toggle("has-error", !okN || !okK);
      if (!okN || !okK) {
        result.textContent = "";
        note.textContent = !okN ? "Digite um inteiro de 0 a 1000." : "O k precisa ser um inteiro entre 0 e n.";
        return;
      }
      const n = Number(sn);
      const add = (html, src) => {
        const li = el("li");
        const p = el("span");
        p.innerHTML = html;
        li.appendChild(p);
        if (src) { const mm = el("span", "calc-math"); math(mm, src); li.appendChild(mm); }
        steps.appendChild(li);
      };

      if (!sk) {
        const F = fact(n), s = F.toString();
        const exato = s.length <= 60;
        math(result, `${n}! = ${tone(exato ? bigTex(F) : sci(n).tex, 1)}`);
        if (n >= 2) add(`Multiplique de ${n} até 1${n > 8 ? " (aqui, abreviado)" : ""}.`, `${n}! = ${n <= 8 ? Array.from({ length: n }, (_, i) => n - i).join(" \\times ") : `${n} \\times ${n - 1} \\times ${n - 2} \\times \\cdots \\times 2 \\times 1`}`);
        add(`O resultado tem <strong>${milhar(String(s.length))} ${s.length === 1 ? "algarismo" : "algarismos"}</strong>${n >= 25 ? `, dos quais os últimos ${s.length - s.replace(/0+$/, "").length} são zeros — cada par 2 × 5 entre os fatores gera um zero no fim` : ""}.`,
          exato ? null : `${n}! \\approx ${sci(n).tex}`);
        if (!exato) add(`Os primeiros algarismos do número exato: ${s.slice(0, 30)}…`, null);
        if (n >= 10) {
          const st = Math.sqrt(2 * Math.PI * n) * (n / Math.E) ** n;
          add(`A <a href="/formulas/aproximacao-stirling.html">aproximação de Stirling</a> chega perto sem multiplicar nada${Number.isFinite(st) ? `: √(2π·${n}) · (${n}/e)${sup(n)} ≈ ${fmt(st / 10 ** sci(n).k, 3)} × 10${sup(sci(n).k)}` : ""}.`, null);
        }
        note.textContent = n === 0 ? "0! = 1: o produto de nenhum fator é 1, como a soma de nenhuma parcela é 0." : "";
        return;
      }

      // n!/k!: o k! de baixo cancela o fim do n! de cima.
      const k = Number(sk);
      let R = 1n;
      for (let i = BigInt(k) + 1n; i <= BigInt(n); i++) R *= i;
      const sobra = Array.from({ length: n - k }, (_, i) => n - i);
      const curta = sobra.length <= 8 ? sobra.join(" \\times ") : `${n} \\times ${n - 1} \\times \\cdots \\times ${k + 1}`;
      const Rs = R.toString();
      math(result, `\\dfrac{${n}!}{${k}!} = ${tone(Rs.length <= 60 ? bigTex(R) : `${fmt(Number(Rs.slice(0, 4)) / 1000, 3).replace(",", "{,}")} \\times 10^{${Rs.length - 1}}`, 1)}`);
      add(`Não calcule os dois fatoriais: escreva o de cima até chegar no ${k}!.`, `\\dfrac{${n}!}{${k}!} = \\dfrac{${n === k ? `${k}!` : `${curta} \\times ${k}!`}}{${k}!}`);
      add(`O ${k}! de cima e o de baixo se cancelam. Sobram ${n - k === 0 ? "nenhum fator: o resultado é 1" : `${n - k} ${n - k === 1 ? "fator" : "fatores"}, do ${n} até o ${k + 1}`}.`, `\\dfrac{${n}!}{${k}!} = ${n === k ? "1" : curta}${n - k > 1 && Rs.length <= 60 ? ` = ${bigTex(R)}` : ""}`);
      note.innerHTML = n - k >= 1 && n <= 60
        ? `É o número de filas de ${n - k} ${n - k === 1 ? "pessoa escolhida" : "pessoas escolhidas"} entre ${n} (um <a href="/formulas/permutacoes-arranjos.html">arranjo</a>). Dividindo ainda por ${n - k}!, para a ordem não importar, sai o <a href="/formulas/coeficiente-binomial.html">coeficiente binomial</a> C(${n}, ${n - k}).`
        : "";
    }

    section.addEventListener("input", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      [inN.value, inK.value = ""] = btn.dataset.exemplo.split(";");
      update();
    }));
    update();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    n: { min: 1, max: 8, value: 5 },
    m: { min: 1, max: 5, value: 3 },
  };
  const f = k => Number(fact(k));

  const RULES = {
    recursiva({ n }) {
      return {
        lhs: [`${n}! = ${f(n)}`, f(n)],
        rhs: [`${n} \\times ${n - 1}! = ${n} \\times ${f(n - 1)} = ${f(n)}`, n * f(n - 1)],
        note: "Cada fatorial é o anterior vezes o número novo. Com n = 1, isso só funciona porque 0! = 1.",
      };
    },
    soma({ n, m }) {
      return {
        lhs: [`(${n} + ${m})! = ${n + m}! = ${milhar(String(f(n + m))).replace(/\./g, "{.}")}`, f(n + m)],
        rhs: [`${n}! + ${m}! = ${f(n)} + ${f(m)} = ${f(n) + f(m)}`, f(n) + f(m)],
        note: "O fatorial não se distribui sobre a soma: (n + m)! é muito maior que n! + m!.",
      };
    },
    dobro({ n }) {
      return {
        lhs: [`(2 \\times ${n})! = ${2 * n}! = ${milhar(String(f(2 * n))).replace(/\./g, "{.}")}`, f(2 * n)],
        rhs: [`2 \\times ${n}! = 2 \\times ${f(n)} = ${2 * f(n)}`, 2 * f(n)],
        note: n === 1 ? "Com n = 1, coincide: 2! = 2 × 1!. Aumente n." : `(2n)! tem ${2 * n} fatores; 2 × n! tem ${n} e mais um 2.`,
      };
    },
    divisao({ n, m }) {
      const k = Math.min(m, n);
      const sobra = Array.from({ length: n - k }, (_, i) => n - i);
      return {
        lhs: [`\\dfrac{${n}!}{${k}!} = \\dfrac{${f(n)}}{${f(k)}} = ${f(n) / f(k)}`, f(n) / f(k)],
        rhs: [`${sobra.length ? sobra.join(" \\times ") : "1"} = ${f(n) / f(k)}`, sobra.reduce((s, v) => s * v, 1)],
        note: m > n ? `Com m maior que n, o card usa k = n.` : "Só sobram os fatores de n até k + 1: o resto se cancela.",
      };
    },
  };

  Licao.renderTex();
  const escada = document.querySelector("#escada");
  if (escada) initEscada(escada);
  const filas = document.querySelector("#filas");
  if (filas) initFilas(filas);
  const calc = document.querySelector("#calc");
  if (calc) initCalc(calc);
  Licao.regras(VARS, RULES);
})();
