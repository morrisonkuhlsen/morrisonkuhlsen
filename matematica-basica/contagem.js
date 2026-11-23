/* Contagem: a árvore de escolhas do princípio multiplicativo; arranjos e
 * combinações com a lista dos grupos (cada grupo aparece k! vezes quando a
 * ordem importa); o triângulo de Pascal ligado aos mesmos n e k; e os
 * cards de regra. Os utilitários vêm de licao.js.
 */
(() => {
  const { fmt, tone, math, el, svg, saveParams } = Licao;

  const fat = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
  const arr = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; };
  const comb = (n, k) => (k < 0 || k > n ? 0 : Math.round(arr(n, k) / fat(k)));
  const LETRAS = "ABCDEFGHIJ";

  /* ---------------------------------------------------------------- 1. a árvore */

  const ROTULOS = [["A", "B", "C", "D"], ["1", "2", "3", "4"], ["x", "y", "z"]];
  const NOMES = [["camisa", "camisas"], ["calça", "calças"], ["tênis", "tênis"]];

  function initArvore(section) {
    const q = new URLSearchParams(location.search);
    const ins = ["e1", "e2", "e3"].map(n => section.querySelector(`input[name=${n}]`));
    const outs = ["e1", "e2", "e3"].map(n => section.querySelector(`.out-${n}`));
    ins.forEach(i => { const v = Number(q.get(i.name)); if (q.has(i.name) && Number.isInteger(v) && v >= Number(i.min) && v <= Number(i.max)) i.value = v; });
    const fig = section.querySelector(".arvore-box");
    const eq = section.querySelector(".calc-result");
    const text = section.querySelector(".intro-text");

    function draw() {
      const e = ins.map(i => Number(i.value));
      outs.forEach((o, i) => (o.textContent = e[i]));
      const total = e[0] * e[1] * e[2];
      const W = 640, passo = 15, H = Math.max(120, total * passo + 24);
      const XS = [24, 190, 350, 500];
      const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot arvore", role: "img",
        "aria-label": `Árvore com ${e[0]} × ${e[1]} × ${e[2]} = ${total} caminhos` });
      // Folhas em ordem; cada nó fica na média das folhas abaixo dele.
      let folha = 0;
      const no = (nivel, prefixo) => {
        if (nivel === 3) {
          const y = 12 + passo * folha++ + passo / 2;
          const tx = svg("text", { x: XS[3] + 12, y: y + 4, class: "plot-tick arvore-folha" }, g);
          tx.textContent = prefixo;
          return y;
        }
        const ys = [];
        for (let i = 0; i < e[nivel]; i++) {
          const yFilho = no(nivel + 1, prefixo + ROTULOS[nivel][i]);
          ys.push([yFilho, i]);
        }
        const y = ys.reduce((s, [v]) => s + v, 0) / ys.length;
        ys.forEach(([yf, i]) => {
          svg("line", { x1: XS[nivel], y1: y, x2: XS[nivel + 1], y2: yf, class: `arvore-ramo n${nivel}` }, g);
          svg("circle", { cx: XS[nivel + 1], cy: yf, r: nivel === 2 ? 3.5 : 5, class: `arvore-no n${nivel}` }, g);
          // No último nível, o nome da folha (A1x) já diz qual é o tênis.
          if (nivel < 2) {
            const lt = svg("text", { x: XS[nivel + 1] - 4, y: yf - 7, class: `plot-label arvore-rot n${nivel}`, "text-anchor": "end" }, g);
            lt.textContent = ROTULOS[nivel][i];
          }
        });
        return y;
      };
      const yr = no(0, "");
      svg("circle", { cx: XS[0], cy: yr, r: 5, class: "arvore-no raiz" }, g);
      fig.replaceChildren(g);

      math(eq, `\\displaystyle ${tone(e[0], 2)} \\times ${tone(e[1], 5)} \\times ${tone(e[2], 3)} = ${tone(fmt(total), 1)}`);
      const nome = (i, v) => `${v} ${NOMES[i][v === 1 ? 0 : 1]}`;
      text.innerHTML = `<p>Cada uma das ${nome(0, e[0])} pode ir com cada uma das ${nome(1, e[1])}: são ${e[0]} × ${e[1]} = ${e[0] * e[1]} pares. Cada par ainda pode ir com cada um dos ${nome(2, e[2])}: ${e[0] * e[1]} × ${e[2]} = <strong>${total} roupas diferentes</strong>, uma por folha da árvore.</p>`
        + "<p>É o <strong>princípio multiplicativo</strong>: quando uma escolha é feita em etapas, e cada opção de uma etapa combina com todas as da seguinte, o total é o produto. Somar (" + `${e[0]} + ${e[1]} + ${e[2]} = ${e[0] + e[1] + e[2]}` + ") contaria peças soltas, não roupas.</p>";
      saveParams({ e1: e[0], e2: e[1], e3: e[2] });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- 2. ordem e Pascal */

  function grupos(n, k) {
    const out = [];
    const rec = (ini, atual) => {
      if (atual.length === k) { out.push(atual.slice()); return; }
      for (let i = ini; i < n; i++) { atual.push(LETRAS[i]); rec(i + 1, atual); atual.pop(); }
    };
    rec(0, []);
    return out;
  }
  function ordens(g) {
    if (g.length <= 1) return [g.join("")];
    const out = [];
    g.forEach((c, i) => ordens([...g.slice(0, i), ...g.slice(i + 1)]).forEach(r => out.push(c + r)));
    return out;
  }

  function initOrdem(section, pascal) {
    const inN = section.querySelector("input[name=n]"), inK = section.querySelector("input[name=k]");
    const outN = section.querySelector(".out-n"), outK = section.querySelector(".out-k");
    const q = new URLSearchParams(location.search);
    // cn e ck, e não n e k: esses nomes são dos cards de regra.
    const n0 = Number(q.get("cn")), k0 = Number(q.get("ck"));
    if (q.has("cn") && Number.isInteger(n0) && n0 >= 2 && n0 <= 10) { inN.value = n0; inK.max = n0; }
    if (q.has("ck") && Number.isInteger(k0) && k0 >= 1) inK.value = k0;
    const result = section.querySelector(".calc-result");
    const lista = section.querySelector(".grupos");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const pRes = pascal.querySelector(".calc-result"), pBox = pascal.querySelector(".pascal"), pText = pascal.querySelector(".intro-text");

    function draw() {
      const n = Number(inN.value);
      inK.max = n;
      if (Number(inK.value) > n) inK.value = n;
      const k = Number(inK.value);
      outN.textContent = n; outK.textContent = k;
      const A = arr(n, k), C = comb(n, k), kf = fat(k);

      const r1 = el("span", "res-part"), r2 = el("span", "res-part");
      math(r1, `\\displaystyle A_{${n},${k}} = ${tone(fmt(A), 2)}`);
      math(r2, `\\displaystyle \\binom{${n}}{${k}} = ${tone(fmt(C), 1)}`);
      result.replaceChildren(r1, el("span", "res-sep", " · "), r2);

      // Os grupos, e as ordens de cada um.
      const gs = grupos(n, k), MAX = 8;
      lista.replaceChildren();
      gs.slice(0, MAX).forEach(gr => {
        const li = el("li", "grupo");
        li.appendChild(el("span", "grupo-set", `{${gr.join(", ")}}`));
        const os = ordens(gr);
        const mostra = os.slice(0, 6);
        li.appendChild(el("span", "grupo-ordens", mostra.join(" ") + (os.length > 6 ? ` … (${fmt(os.length)} ordens)` : "")));
        lista.appendChild(li);
      });
      if (gs.length > MAX) lista.appendChild(el("li", "grupo is-mais", `… e mais ${fmt(gs.length - MAX)} ${gs.length - MAX === 1 ? "grupo" : "grupos"}, cada um com ${fmt(kf)} ${kf === 1 ? "ordem" : "ordens"}.`));

      const fatores = Array.from({ length: k }, (_, i) => n - i);
      const P = [
        { tag: "Com ordem (arranjo)", html: k === 1 ? `Um lugar só: ${n} opções.`
          : `Escolha o 1º (${n} opções), depois o 2º (${n - 1} opções, porque um já foi)${k > 2 ? ", e assim por diante" : ""}: ${k} etapas do princípio multiplicativo.`,
          tex: `A_{${n},${k}} = ${fatores.join(" \\times ")} = ${tone(fmt(A), 2)}` },
        { tag: "Cada grupo, várias vezes", html: `Na contagem com ordem, o grupo {${LETRAS.slice(0, k).split("").join(", ")}} aparece uma vez para cada fila que dá para formar com ele: ${k}! = ${fmt(kf)} vezes. Veja na lista: cada linha tem ${fmt(kf)} ${kf === 1 ? "ordem" : "ordens"}.`,
          tex: `${k}! = ${k > 1 ? Array.from({ length: k }, (_, i) => k - i).join(" \\times ") + " = " : ""}${fmt(kf)}` },
        { tag: "Sem ordem (combinação)", html: "Para contar cada grupo uma vez só, divida pelo número de vezes que ele se repete.",
          tex: `\\binom{${n}}{${k}} = \\frac{A_{${n},${k}}}{${k}!} = \\frac{${fmt(A)}}{${fmt(kf)}} = ${tone(fmt(C), 1)}` },
        { tag: "A fórmula", html: `É a mesma conta escrita só com fatoriais: o ${n}! dividido por ${n - k}! deixa os ${k} primeiros fatores, que é o arranjo.`,
          tex: `\\binom{n}{k} = \\frac{n!}{k!\\,(n - k)!} = \\frac{${n}!}{${k}!\\,${n - k}!} = ${fmt(C)}` },
      ];
      steps.replaceChildren();
      P.forEach(p => {
        const li = el("li");
        const s = el("span"); s.innerHTML = `<strong>${p.tag}.</strong> ${p.html}`;
        const m = el("span", "calc-math"); math(m, `\\displaystyle ${p.tex}`);
        li.append(s, m); steps.appendChild(li);
      });
      note.innerHTML = `Com ${n} corredores, há ${fmt(A)} pódios de ${k} ${k === 1 ? "lugar" : "lugares"} (a ordem importa), mas só ${fmt(C)} ${C === 1 ? "comissão" : "comissões"} de ${k} ${k === 1 ? "pessoa" : "pessoas"} (a ordem não importa).`;

      // Pascal: a casa C(n, k) e as duas de cima que somam nela.
      // Dois blocos: no celular a linha quebra antes do segundo =.
      const p1 = el("span", "res-part"), p2 = el("span", "res-part");
      math(p1, `\\displaystyle \\binom{${n}}{${k}} = \\binom{${n - 1}}{${k - 1}} + \\binom{${n - 1}}{${k}}`);
      math(p2, `\\displaystyle {} = ${tone(fmt(comb(n - 1, k - 1)), 2)} + ${tone(fmt(comb(n - 1, k)), 5)} = ${tone(fmt(C), 1)}`);
      pRes.replaceChildren(p1, " ", p2);
      pBox.querySelectorAll(".pascal-cell").forEach(c => {
        const cn = Number(c.dataset.n), ck = Number(c.dataset.k);
        c.classList.toggle("is-alvo", cn === n && ck === k);
        c.classList.toggle("is-pai1", cn === n - 1 && ck === k - 1);
        c.classList.toggle("is-pai2", cn === n - 1 && ck === k);
      });
      pText.innerHTML = `<p>Por que somar as duas de cima? Pense na letra ${LETRAS[n - 1]}, a última das ${n}. Um grupo de ${k} ou <strong>tem</strong> o ${LETRAS[n - 1]} — e aí falta escolher ${k - 1} entre as outras ${n - 1}: ${fmt(comb(n - 1, k - 1))} jeitos — ou <strong>não tem</strong>, e os ${k} saem todos das outras ${n - 1}: ${fmt(comb(n - 1, k))} jeitos. Clique numa casa do triângulo para escolher outros n e k.</p>`;
      saveParams({ cn: n, ck: k });
    }

    // O triângulo, montado uma vez.
    for (let r = 0; r <= 10; r++) {
      const row = el("div", "pascal-row");
      for (let c = 0; c <= r; c++) {
        const b = el("button", "pascal-cell", fmt(comb(r, c)));
        b.type = "button";
        b.dataset.n = r; b.dataset.k = c;
        b.setAttribute("aria-label", `C(${r}, ${c}) = ${comb(r, c)}`);
        b.addEventListener("click", () => {
          if (r < 2 || c < 1) return; // fora dos sliders
          inN.value = r; inK.max = r; inK.value = c;
          draw();
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        row.appendChild(b);
      }
      pBox.appendChild(row);
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    n: { min: 4, max: 12, value: 6 },
    k: { min: 0, max: 4, value: 2 },
  };
  const C = (n, k) => `\\tbinom{${n}}{${k}}`;

  const RULES = {
    simetria({ n, k }) {
      return { lhs: [`${C(n, k)} = ${fmt(comb(n, k))}`, comb(n, k)], rhs: [`${C(n, n - k)} = ${fmt(comb(n, n - k))}`, comb(n, n - k)],
        note: `Escolher os ${k} que entram é o mesmo que escolher os ${n - k} que ficam de fora.` };
    },
    pascal({ n, k }) {
      const a = comb(n - 1, k - 1), b = comb(n - 1, k);
      return { lhs: [`${C(n, k)} = ${fmt(comb(n, k))}`, comb(n, k)], rhs: [`${C(n - 1, k - 1)} + ${C(n - 1, k)} = ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}`, a + b],
        note: k === 0 ? "Com k = 0, o primeiro termo é zero (não dá para escolher −1 elementos) e sobra 1 = 1." : "Os grupos que têm o último elemento mais os que não têm." };
    },
    linha({ n }) {
      let s = 0; const ts = [];
      for (let i = 0; i <= n; i++) { s += comb(n, i); ts.push(fmt(comb(n, i))); }
      return { lhs: [`${ts.join(" + ")} = ${fmt(s)}`, s], rhs: [`2^{${n}} = ${fmt(2 ** n)}`, 2 ** n],
        note: `Cada um dos ${n} elementos entra ou não entra: 2 opções, ${n} vezes. A linha soma todos os tamanhos de grupo.` };
    },
    arranjo({ n, k }) {
      const A = arr(n, k);
      return { lhs: [`A_{${n},${k}} = ${fmt(A)}`, A], rhs: [`${C(n, k)} \\cdot ${k}! = ${fmt(comb(n, k))} \\cdot ${fmt(fat(k))} = ${fmt(comb(n, k) * fat(k))}`, comb(n, k) * fat(k)],
        note: "Escolher o grupo e depois a ordem dentro dele dá o arranjo." };
    },
    erroFat({ n, k }) {
      const errado = fat(n) / fat(k);
      return { lhs: [`${C(n, k)} = ${fmt(comb(n, k))}`, comb(n, k)], rhs: [`\\frac{${n}!}{${k}!} = ${fmt(errado)}`, errado],
        note: n - k <= 1 ? `Coincide porque (n − k)! = ${fat(n - k)}. Aumente n ou diminua k.` : `Falta dividir por (n − k)! = ${fmt(fat(n - k))}: sem isso, os ${n - k} de fora também são contados em fila.` };
    },
  };

  Licao.renderTex();
  const s1 = document.querySelector("#arvore");
  if (s1) initArvore(s1);
  const s2 = document.querySelector("#ordem"), s3 = document.querySelector("#pascal");
  if (s2 && s3) initOrdem(s2, s3);
  Licao.regras(VARS, RULES);
})();
