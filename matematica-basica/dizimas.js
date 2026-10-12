/* Dízimas periódicas: a divisão que mostra por que os restos se repetem
 * (e os algarismos com eles), a calculadora da fração geratriz a partir da
 * notação com parênteses — 0,1(6) — e o card de 0,999… = 1. Os utilitários
 * vêm de licao.js.
 */
(() => {
  const { tone, math, el, saveParams } = Licao;
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

  /* ---------------------------------------------------------------- os restos */

  // A divisão n/d depois da vírgula: algarismos, restos e onde o ciclo começa.
  function expand(n, d) {
    const inteiro = Math.floor(n / d);
    let r = n % d;
    const digits = [], rests = [], seen = new Map();
    while (r !== 0 && !seen.has(r) && digits.length < 60) {
      seen.set(r, digits.length);
      rests.push(r);
      r *= 10;
      digits.push(Math.floor(r / d));
      r %= d;
    }
    return { inteiro, digits, rests, start: r === 0 ? -1 : seen.get(r), fim: r };
  }

  function initRestos(section) {
    const inN = section.querySelector("input[name=dn]");
    const inD = section.querySelector("input[name=dd]");
    const outN = section.querySelector(".out-dn");
    const outD = section.querySelector(".out-dd");
    const eq = section.querySelector(".diz-eq");
    const list = section.querySelector(".restos");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("dn")) inN.value = q.get("dn");
    if (q.has("dd")) inD.value = q.get("dd");

    function draw() {
      const n = Number(inN.value), d = Number(inD.value);
      outN.textContent = n;
      outD.textContent = d;
      const g = gcd(n, d);
      const { inteiro, digits, rests, start } = expand(n, d);
      const ante = start < 0 ? digits.join("") : digits.slice(0, start).join("");
      const per = start < 0 ? "" : digits.slice(start).join("");
      const dec = `${inteiro}${digits.length ? "{,}" : ""}${ante}${per ? `\\overline{${tone(per, 1)}}` : ""}`;
      math(eq, `\\displaystyle \\frac{${n}}{${d}} = ${dec}${per ? ` = ${inteiro}{,}${ante}${(per.repeat(Math.ceil(8 / per.length))).slice(0, Math.max(8, per.length))}\\ldots` : ""}`);

      // Uma linha por passo: resto, ×10, algarismo.
      list.replaceChildren(...rests.map((r, i) => {
        const li = el("li", start >= 0 && i >= start ? "is-ciclo" : null);
        if (start >= 0 && i === start) li.classList.add("is-volta");
        li.append(el("span", "resto", String(r)), el("span", "resto-op", `${r * 10} ÷ ${d} = ${digits[i]}`), el("span", "resto-dig", String(digits[i])));
        return li;
      }));
      const p = per.length, dr = d / g;
      const so25 = (() => { let x = dr; while (x % 2 === 0) x /= 2; while (x % 5 === 0) x /= 5; return x === 1; })();
      text.innerHTML = start < 0
        ? `<p>O resto chegou a <strong>0</strong>: a divisão acaba, e ${n}/${d} é um <strong>decimal exato</strong>. ${g > 1 ? `Simplificada, a fração é ${n / g}/${dr}, e ` : "O "}${dr === 1 ? "denominador é 1" : `denominador ${dr} só tem os fatores primos 2 e 5`} — os mesmos de 10, 100, 1000. É sempre assim que um decimal termina.</p>`
        : `<p>Na divisão por ${d}, cada resto é um número de 1 a ${d - 1}: só há ${d - 1} possibilidades. Quando um resto <strong>se repete</strong> (o ${rests[start]}, destacado), a conta volta a fazer exatamente o que já fez, e os algarismos se repetem para sempre. O período, <strong>${per}</strong>, tem ${p} ${p === 1 ? "algarismo" : "algarismos"} — nunca mais que ${d - 1}.</p>`
          + `<p>${so25 ? "" : `${dr} tem um fator primo diferente de 2 e 5, por isso a divisão nunca acaba. `}${ante ? `Antes do período vem o anteperíodo, <strong>${ante}</strong>: é a parte que vem do fator 2 ou 5 de ${dr}.` : "Não há anteperíodo: o período começa logo depois da vírgula. A dízima é <strong>simples</strong>."}</p>`;
      saveParams({ dn: n, dd: d });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- geratriz */

  // "2,1(45)" → { neg, I: "2", A: "1", P: "45" }; aceita também 0,333... e 0,1666...
  function parse(s) {
    s = s.replace(/\s/g, "").replace("−", "-").replace(/…/g, "...");
    let m = /^(-?)(\d{1,9}),(\d{0,8})\((\d{1,8})\)$/.exec(s);
    if (m) return { neg: m[1] === "-", I: m[2], A: m[3], P: m[4] };
    // Reticências: o período é o menor bloco que se repete no fim (pelo menos 2 vezes).
    m = /^(-?)(\d{1,9}),(\d{2,16})\.\.\.$/.exec(s);
    if (!m) return null;
    const ds = m[3];
    for (let p = 1; p <= ds.length / 2; p++) {
      for (let a = 0; a + 2 * p <= ds.length; a++) {
        const P = ds.slice(a, a + p), rest = ds.slice(a);
        if ((P.repeat(Math.ceil(rest.length / p) + 1)).startsWith(rest)) return { neg: m[1] === "-", I: m[2], A: ds.slice(0, a), P, adivinhado: true };
      }
    }
    return null;
  }

  function initCalc(section) {
    const input = section.querySelector("input[name=diz]");
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("diz")) input.value = q.get("diz");

    function update() {
      saveParams({ diz: input.value.trim() });
      steps.replaceChildren();
      const x = parse(input.value);
      input.setAttribute("aria-invalid", String(!x));
      section.classList.toggle("has-error", !x);
      if (!x) {
        result.textContent = "";
        note.textContent = "Escreva o período entre parênteses, como 0,(3), 0,1(6) ou 2,1(45), ou com reticências depois de pelo menos duas repetições, como 0,1666...";
        return;
      }
      const { I, A, P } = x;
      const a = A.length, p = P.length;
      // x · 10^(a+p) − x · 10^a = inteiro: os períodos se cancelam.
      const big = BigInt(I + A + P), small = BigInt(I + A);
      let num = big - small, den = BigInt("9".repeat(p) + "0".repeat(a));
      const B = (u, v) => { while (v) [u, v] = [v, u % v]; return u; };
      const g = B(num, den);
      const sn = num / g, sd = den / g;
      const s = x.neg ? "-" : "";
      const per = `\\overline{${P}}`;
      const xTex = `${I}{,}${A}${per}`;
      const add = (html, src) => {
        const li = el("li");
        const sp = el("span");
        sp.innerHTML = html;
        li.appendChild(sp);
        if (src) { const mm = el("span", "calc-math"); math(mm, src); li.appendChild(mm); }
        steps.appendChild(li);
      };
      const rep = `${P.repeat(Math.max(2, Math.ceil(6 / p)))}\\ldots`;
      if (x.adivinhado) add(`Pelas reticências, o período é <strong>${P}</strong>${A ? ` e o anteperíodo, ${A}` : ""}. Se a intenção era outra, escreva com parênteses.`, null);
      add(`Chame a dízima de x.`, `x = ${I}{,}${A}${rep}`);
      if (a) add(`Multiplique por 10${a === 1 ? "" : Licao.sup(a)} = ${10 ** a} para levar o anteperíodo, ${A}, para antes da vírgula. Assim, depois da vírgula só sobra o período.`, `${10 ** a}x = ${I}${A}{,}${rep}`);
      add(`Multiplique por ${(10n ** BigInt(a + p)).toString()}, para passar também um período inteiro (${p} ${p === 1 ? "casa" : "casas"} a mais). Depois da vírgula fica a mesma cauda infinita.`, `${(10n ** BigInt(a + p)).toString()}x = ${I}${A}${P}{,}${rep}`);
      add(`<strong>Subtraia</strong> as duas: as caudas infinitas são iguais e se cancelam. Sobra uma conta com inteiros.`,
        `${(10n ** BigInt(a + p)).toString()}x - ${a ? (10n ** BigInt(a)).toString() : ""}x = ${big} - ${small} \\;\\Rightarrow\\; ${den}x = ${num}`);
      add(`Divida e simplifique${g > 1n ? ` pelo MDC, ${g}` : " (a fração já está na forma mais simples)"}.`, `x = \\frac{${num}}{${den}}${g > 1n ? ` = ${tone(`\\frac{${sn}}{${sd}}`, 1)}` : ""}`);
      math(result, `${s}${xTex} = ${tone(sd === 1n ? `${s}${sn}` : `${s}\\frac{${sn}}{${sd}}`, 1)}`);
      note.innerHTML = sd === 1n
        ? `Deu um inteiro: é o caso do período 9, como 0,999… = 1. Veja abaixo por quê.`
        : `Atalho: o numerador é “tudo até o fim do período, menos o que vem antes do período” (${big} − ${small}); o denominador tem um 9 para cada algarismo do período e um 0 para cada algarismo do anteperíodo (${den}). <a href="fracoes.html?conv=${sn}/${sd}#converter">Confira dividindo ${sn}/${sd} →</a>`;
    }

    section.addEventListener("input", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      input.value = btn.dataset.exemplo;
      update();
    }));
    update();
  }

  Licao.renderTex();
  const restos = document.querySelector("#restos");
  if (restos) initRestos(restos);
  const calc = document.querySelector("#calc");
  if (calc) initCalc(calc);
})();
