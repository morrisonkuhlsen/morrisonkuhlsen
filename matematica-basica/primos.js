/* Primos e divisibilidade: o crivo de Eratóstenes passo a passo, os
 * critérios de divisibilidade aplicados ao número do leitor e a fatoração
 * em divisões sucessivas, com os divisores. A tabela de divisões e os chips
 * de divisores usam as classes do MDC e do MMC. Os utilitários vêm de
 * licao.js.
 */
(() => {
  const { fmt, tone, math, el, saveParams, factor } = Licao;

  /* ---------------------------------------------------------------- crivo */

  function initCrivo(section) {
    const grid = section.querySelector(".crivo");
    const text = section.querySelector(".crivo-text");
    const count = section.querySelector(".crivo-count");
    const nav = {};
    section.querySelectorAll("[data-nav]").forEach(b => { nav[b.dataset.nav] = b; });
    const N = 100;

    // Os passos: cada primo até √100 risca os próprios múltiplos.
    const marca = new Array(N + 1).fill(0); // primo que riscou cada número
    const passos = [];
    for (let p = 2; p * p <= N; p++) {
      if (marca[p]) continue;
      const novos = [];
      for (let m = p * p; m <= N; m += p) if (!marca[m]) { marca[m] = p; novos.push(m); }
      passos.push({ p, novos });
    }
    const cells = [];
    for (let n = 1; n <= N; n++) {
      const c = el("li", "crivo-cell", String(n));
      cells[n] = c;
      grid.appendChild(c);
    }
    const q = new URLSearchParams(location.search);
    let k = Math.max(0, Math.min(passos.length + 1, Number(q.get("crivo")) || 0));

    function draw() {
      // k = 0: nada feito; 1…passos.length: primos já usados; o último: fim.
      const feitos = passos.slice(0, Math.min(k, passos.length));
      const riscadoPor = new Map();
      feitos.forEach(({ p, novos }) => novos.forEach(m => riscadoPor.set(m, p)));
      const atual = k >= 1 && k <= passos.length ? passos[k - 1].p : null;
      const fim = k > passos.length;
      for (let n = 1; n <= N; n++) {
        const c = cells[n];
        c.className = "crivo-cell";
        delete c.dataset.p;
        if (n === 1) c.classList.add("is-um");
        else if (riscadoPor.has(n)) {
          c.classList.add("is-out");
          c.dataset.p = riscadoPor.get(n);
          if (riscadoPor.get(n) === atual) c.classList.add("is-now");
        } else if (feitos.some(f => f.p === n) || fim) c.classList.add("is-prime");
        if (n === atual) c.classList.add("is-cur");
      }
      const primos = Array.from({ length: N }, (_, i) => i + 1).filter(n => n > 1 && !riscadoPor.has(n));
      if (k === 0) {
        text.innerHTML = `<p>Escreva os números de 1 a 100. O 1 fica de fora — não é primo (veja abaixo). Agora vá riscando: o primeiro número não riscado é primo, e todos os múltiplos dele não são.</p>`;
      } else if (!fim) {
        const { p, novos } = passos[k - 1];
        text.innerHTML = `<p>O <strong>${p}</strong> não foi riscado: é primo. Risque os múltiplos dele — ${novos.slice(0, 6).join(", ")}${novos.length > 6 ? "…" : ""} (${novos.length} novos).${p > 2 ? ` Comece no ${p}² = ${p * p}: os menores, como ${p} × 2, já foram riscados por primos menores.` : ""}</p>`;
      } else {
        text.innerHTML = `<p>Depois do 7, o próximo candidato seria 11, mas 11² = 121 já passa de 100: todo número composto até 100 tem um fator primo menor que 10, e já foi riscado. O que sobrou são os <strong>${primos.length} primos até 100</strong>.</p>`;
      }
      count.textContent = fim ? "Fim" : `Passo ${k} de ${passos.length + 1}`;
      nav.first.disabled = nav.prev.disabled = k === 0;
      nav.next.disabled = nav.last.disabled = fim;
      saveParams({ crivo: k });
    }

    nav.first.addEventListener("click", () => { k = 0; draw(); });
    nav.prev.addEventListener("click", () => { k = Math.max(0, k - 1); draw(); });
    nav.next.addEventListener("click", () => { k = Math.min(passos.length + 1, k + 1); draw(); });
    nav.last.addEventListener("click", () => { k = passos.length + 1; draw(); });
    draw();
  }

  /* ---------------------------------------------------------------- critérios */

  const soma = s => s.split("").reduce((t, d) => t + Number(d), 0);
  const CRITERIOS = [
    [2, s => `Termina em ${s.at(-1)}, ${Number(s.at(-1)) % 2 ? "ímpar" : "par"}.`, s => Number(s.at(-1)) % 2 === 0, "o último algarismo é par"],
    [3, s => `Soma dos algarismos: ${s.split("").join(" + ")} = ${soma(s)}${soma(s) >= 10 ? ` (e ${soma(s)} ${soma(s) % 3 ? "não é" : "é"} múltiplo de 3)` : ""}.`, s => soma(s) % 3 === 0, "a soma dos algarismos é múltiplo de 3"],
    [4, s => `Os dois últimos formam ${Number(s.slice(-2))}, que ${Number(s.slice(-2)) % 4 ? "não é" : "é"} múltiplo de 4.`, s => Number(s.slice(-2)) % 4 === 0, "os dois últimos algarismos formam múltiplo de 4"],
    [5, s => `Termina em ${s.at(-1)}.`, s => /[05]$/.test(s), "termina em 0 ou 5"],
    [6, s => `${Number(s.at(-1)) % 2 ? "Não é par" : "É par"} e ${soma(s) % 3 ? "não é" : "é"} divisível por 3.`, s => Number(s.at(-1)) % 2 === 0 && soma(s) % 3 === 0, "é divisível por 2 e por 3"],
    [8, s => `Os três últimos formam ${Number(s.slice(-3))}, que ${Number(s.slice(-3)) % 8 ? "não é" : "é"} múltiplo de 8.`, s => Number(s.slice(-3)) % 8 === 0, "os três últimos formam múltiplo de 8"],
    [9, s => `Soma dos algarismos: ${soma(s)}.`, s => soma(s) % 9 === 0, "a soma dos algarismos é múltiplo de 9"],
    [10, s => `Termina em ${s.at(-1)}.`, s => s.at(-1) === "0", "termina em 0"],
    [11, s => {
      const ds = s.split("").reverse().map(Number);
      const imp = ds.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0), par = ds.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);
      return `Alternando a partir da direita: ${imp} − ${par} = ${fmt(imp - par)}${(imp - par) % 11 ? "" : `, múltiplo de 11`}.`;
    }, s => {
      const ds = s.split("").reverse().map(Number);
      return ds.reduce((t, d, i) => t + (i % 2 ? -d : d), 0) % 11 === 0;
    }, "a soma alternada dos algarismos é múltiplo de 11"],
  ];

  function divisors(n) {
    const out = [];
    for (let d = 1; d * d <= n; d++) if (n % d === 0) { out.push(d); if (d * d !== n) out.push(n / d); }
    return out.sort((a, b) => a - b);
  }

  function initCalc(section) {
    const input = section.querySelector("input[name=num]");
    const result = section.querySelector(".calc-result");
    const crit = section.querySelector(".crit-box");
    const ladder = section.querySelector(".ladder-box");
    const divs = section.querySelector(".divisors-box");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("num")) input.value = q.get("num");

    function update() {
      const s = input.value.trim().replace(/\./g, "");
      saveParams({ num: s });
      const ok = /^\d{1,9}$/.test(s) && Number(s) >= 2;
      input.setAttribute("aria-invalid", String(!ok));
      section.classList.toggle("has-error", !ok);
      steps.replaceChildren();
      if (!ok) {
        result.textContent = "";
        [crit, ladder, divs].forEach(b => b.replaceChildren());
        note.textContent = "Digite um inteiro de 2 até 999.999.999.";
        return;
      }
      const n = Number(s), str = String(n);
      const fs = factor(n);
      const primo = fs.size === 1 && fs.get(n) === 1;

      // Critérios: uma linha por divisor, com a conta feita no número.
      const ul = el("ul", "crit-list");
      CRITERIOS.forEach(([d, how, test, regra]) => {
        const yes = test(str);
        const li = el("li", yes ? "is-yes" : "is-no");
        li.append(el("strong", null, `${yes ? "✓" : "✗"} ${d}`), el("span", "crit-rule", `${regra[0].toUpperCase()}${regra.slice(1)}.`), el("span", null, how(str)));
        ul.appendChild(li);
      });
      crit.replaceChildren(ul);

      // Divisões sucessivas pelo menor primo que divide.
      const table = el("table", "ladder");
      const body = table.createTBody();
      let m = n;
      for (const [p, e] of fs) for (let i = 0; i < e; i++) {
        const tr = body.insertRow();
        tr.insertCell().textContent = fmt(m);
        const c = tr.insertCell();
        c.className = "ladder-prime";
        c.textContent = fmt(p);
        m /= p;
      }
      const last = body.insertRow();
      last.insertCell().textContent = "1";
      last.insertCell().className = "ladder-prime";
      ladder.replaceChildren(table);

      const tex = [...fs].map(([p, e]) => (e > 1 ? `${p}^{${e}}` : `${p}`)).join(" \\times ");
      math(result, primo ? `${fmt(n).replace(/\./g, "{.}")} \\text{ é } ${tone("\\text{primo}", 1)}` : `${fmt(n).replace(/\./g, "{.}")} = ${tone(tex, 1)}`);

      const nd = [...fs.values()].reduce((t, e) => t * (e + 1), 1);
      if (n <= 100000) {
        const row = el("div", "chips");
        row.appendChild(el("span", "chips-label", `Os ${nd} divisores de ${fmt(n)}`));
        const list = el("ul");
        divisors(n).forEach(d => list.appendChild(el("li", d === 1 || d === n ? "" : "is-common", fmt(d))));
        row.appendChild(list);
        divs.replaceChildren(row);
      } else divs.replaceChildren();

      const add = (html, src) => {
        const li = el("li");
        const p = el("span");
        p.innerHTML = html;
        li.appendChild(p);
        if (src) { const mm = el("span", "calc-math"); math(mm, src); li.appendChild(mm); }
        steps.appendChild(li);
      };
      if (primo) {
        add(`Nenhum primo até √${fmt(n)} ≈ ${fmt(Math.sqrt(n), 1)} divide ${fmt(n)}. Se ${fmt(n)} tivesse um divisor maior que a raiz, teria também um menor — o outro fator. Então <strong>${fmt(n)} é primo</strong>: só tem os divisores 1 e ele mesmo.`, null);
      } else {
        add(`Divida pelo menor primo que dá divisão exata e repita com o quociente, até chegar a 1. Os primos da coluna da direita, multiplicados, dão o número.`, `${fmt(n).replace(/\./g, "{.}")} = ${tex}`);
        add(`<strong>Quantos divisores.</strong> Cada divisor escolhe, para cada primo, um expoente de 0 até o máximo: ${[...fs].map(([p, e]) => `${e + 1} ${e + 1 === 1 ? "opção" : "opções"} para o ${p}`).join(", ")}.`,
          `${[...fs.values()].map(e => `(${e} + 1)`).join(" \\times ")} = ${nd} \\text{ divisores}`);
      }
      note.innerHTML = primo ? "" : `Com a fatoração de dois números, o <a href="mdc.html">MDC</a> e o <a href="mmc.html">MMC</a> saem comparando os expoentes.`;
    }

    section.addEventListener("input", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      input.value = btn.dataset.exemplo;
      update();
    }));
    update();
  }

  Licao.renderTex();
  const crivo = document.querySelector("#crivo");
  if (crivo) initCrivo(crivo);
  const calc = document.querySelector("#calc");
  if (calc) initCalc(calc);
})();
