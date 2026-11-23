/* Matrizes: o produto linha por coluna com as matrizes que o leitor digita
 * (clicar numa casa do resultado mostra a conta dela, e a ordem trocada BA
 * aparece ao lado quando existe), e a inversa 2×2 pelo determinante, com a
 * conferência A·A⁻¹ = I e o sistema que ela resolve. Os utilitários vêm de
 * licao.js.
 */
(() => {
  const { fmt, tone, math, el, saveParams } = Licao;

  /* ---------------------------------------------------------------- frações */

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const F = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const ftex = p => (p.d === 1 ? `${p.n}` : `${p.n < 0 ? "-" : ""}\\frac{${Math.abs(p.n)}}{${p.d}}`);
  const pm = linhas => `\\begin{pmatrix} ${linhas.map(l => l.join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
  const par = v => (v < 0 ? `(${v})` : `${v}`);

  /* ---------------------------------------------------------------- 1. produto */

  const PADRAO_A = [[2, 1, 3], [1, 0, 2], [0, 4, 1]];
  const PADRAO_B = [[3, 1, 0], [2, 5, 1], [1, 2, 4]];

  function initProduto(section) {
    const q = new URLSearchParams(location.search);
    const dims = {};
    ["m", "k", "n"].forEach(d => {
      const inp = section.querySelector(`input[name=${d}]`);
      const v = Number(q.get(d));
      if (q.has(d) && [1, 2, 3].includes(v)) inp.value = v;
      dims[d] = inp;
    });
    const ler = (s, padrao) => {
      const v = (s || "").split(",").map(Number);
      return padrao.map((l, i) => l.map((x, j) => (Number.isInteger(v[i * 3 + j]) && Math.abs(v[i * 3 + j]) <= 99 ? v[i * 3 + j] : x)));
    };
    const A = ler(q.get("A"), PADRAO_A), B = ler(q.get("B"), PADRAO_B);
    let sel = [0, 0];
    const boxA = section.querySelector(".mat-a"), boxB = section.querySelector(".mat-b"), boxC = section.querySelector(".mat-c");
    const conta = section.querySelector(".mat-conta"), dimTxt = section.querySelector(".mat-dims"), ba = section.querySelector(".mat-ba");

    // Uma grade de campos (para A e B) ou de botões (para o resultado).
    function grade(box, linhas, colunas, valor, opts = {}) {
      box.replaceChildren();
      box.style.setProperty("--cols", colunas);
      for (let i = 0; i < linhas; i++) for (let j = 0; j < colunas; j++) {
        let c;
        if (opts.editavel) {
          c = el("input", "mat-cell");
          Object.assign(c, { type: "number", min: -99, max: 99, step: 1, value: valor(i, j) });
          c.setAttribute("inputmode", "numeric");
          c.setAttribute("aria-label", `${opts.nome} linha ${i + 1}, coluna ${j + 1}`);
          c.addEventListener("input", () => { const v = parseInt(c.value, 10); if (Number.isInteger(v)) { opts.matriz[i][j] = Math.max(-99, Math.min(99, v)); draw(); } });
        } else {
          c = el("button", "mat-cell is-res", fmt(valor(i, j)));
          c.type = "button";
          c.setAttribute("aria-label", `Resultado, linha ${i + 1}, coluna ${j + 1}: ${valor(i, j)}`);
          c.addEventListener("click", () => { sel = [i, j]; draw(); });
        }
        c.dataset.i = i; c.dataset.j = j;
        box.appendChild(c);
      }
    }

    const produto = (X, Y, m, k, n) => Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => {
      let s = 0; for (let l = 0; l < k; l++) s += X[i][l] * Y[l][j]; return s;
    }));

    let montado = "";
    function draw() {
      const m = Number(dims.m.value), k = Number(dims.k.value), n = Number(dims.n.value);
      section.querySelectorAll(".out-m, .out-k, .out-n").forEach(o => (o.textContent = { "out-m": m, "out-k": k, "out-n": n }[o.className]));
      if (sel[0] >= m || sel[1] >= n) sel = [0, 0];
      const C = produto(A, B, m, k, n);
      // As grades de entrada só se refazem quando o tamanho muda (para não
      // tirar o foco de quem está digitando).
      const chave = `${m}${k}${n}`;
      if (chave !== montado) {
        grade(boxA, m, k, (i, j) => A[i][j], { editavel: true, matriz: A, nome: "A" });
        grade(boxB, k, n, (i, j) => B[i][j], { editavel: true, matriz: B, nome: "B" });
        montado = chave;
      }
      grade(boxC, m, n, (i, j) => C[i][j]);
      const [si, sj] = sel;
      boxA.querySelectorAll(".mat-cell").forEach(c => c.classList.toggle("is-on", Number(c.dataset.i) === si));
      boxB.querySelectorAll(".mat-cell").forEach(c => c.classList.toggle("is-on", Number(c.dataset.j) === sj));
      boxC.querySelectorAll(".mat-cell").forEach(c => c.classList.toggle("is-on", Number(c.dataset.i) === si && Number(c.dataset.j) === sj));

      const termos = [], vals = [];
      for (let l = 0; l < k; l++) { termos.push(`${tone(par(A[si][l]), 2)} \\cdot ${tone(par(B[l][sj]), 5)}`); vals.push(A[si][l] * B[l][sj]); }
      math(conta, `\\displaystyle c_{${si + 1}${sj + 1}} = ${termos.join(" + ")}${k > 1 ? ` = ${vals.map(par).join(" + ")}` : ""} = ${tone(C[si][sj], 1)}`);
      dimTxt.innerHTML = `A tem ${m} ${m === 1 ? "linha" : "linhas"} e ${k} ${k === 1 ? "coluna" : "colunas"}; B tem ${k} ${k === 1 ? "linha" : "linhas"} e ${n} ${n === 1 ? "coluna" : "colunas"}. O <strong>${k}</strong> de dentro tem de ser igual — cada linha de A precisa de um parceiro em cada coluna de B — e o resultado fica com o tamanho de fora: <strong>${m} × ${n}</strong>. A casa destacada usa a linha ${si + 1} de A e a coluna ${sj + 1} de B; clique em outra casa do resultado.`;

      if (m === n) {
        const D = produto(B, A, k, n, k);
        const igual = k === m && D.every((l, i) => l.every((v, j) => v === C[i][j]));
        math(ba, `\\displaystyle AB = ${pm(C)} \\qquad BA = ${pm(D)}`);
        ba.insertAdjacentHTML("beforeend", `<p class="mat-ba-txt">${k !== m ? `AB é ${m} × ${m}, mas BA é ${k} × ${k}: nem do mesmo tamanho elas são.` : igual ? "Aqui AB e BA deram iguais — acontece, mas é exceção. Mude um número e veja." : "<strong>AB ≠ BA</strong>: na multiplicação de matrizes, a ordem importa."}</p>`);
      } else {
        ba.innerHTML = `<p class="mat-ba-txt">BA nem existe: B tem ${n} ${n === 1 ? "coluna" : "colunas"} e A tem ${m} ${m === 1 ? "linha" : "linhas"}, e esses números teriam de ser iguais.</p>`;
      }
      saveParams({ m, k, n, A: A.flat().join(","), B: B.flat().join(",") });
    }

    section.querySelectorAll("input[name=m], input[name=k], input[name=n]").forEach(i => i.addEventListener("input", draw));
    section.querySelectorAll("[data-exemplo]").forEach(b => b.addEventListener("click", () => {
      const [dm, dk, dn, sa, sb] = b.dataset.exemplo.split("|");
      dims.m.value = dm; dims.k.value = dk; dims.n.value = dn;
      const va = sa.split(",").map(Number), vb = sb.split(",").map(Number);
      // Os valores vêm em ordem de leitura do tamanho escolhido.
      for (let i = 0; i < Number(dm); i++) for (let j = 0; j < Number(dk); j++) A[i][j] = va[i * Number(dk) + j];
      for (let i = 0; i < Number(dk); i++) for (let j = 0; j < Number(dn); j++) B[i][j] = vb[i * Number(dn) + j];
      montado = ""; sel = [0, 0];
      draw();
    }));
    draw();
  }

  /* ---------------------------------------------------------------- 2. inversa 2×2 */

  function initInversa(section) {
    const nomes = ["ia", "ib", "ic", "id"], ins = {}, outs = {};
    const q = new URLSearchParams(location.search);
    nomes.forEach(n => {
      ins[n] = section.querySelector(`input[name=${n}]`);
      outs[n] = section.querySelector(`.out-${n}`);
      const v = Number(q.get(n));
      if (q.has(n) && Number.isInteger(v) && v >= -5 && v <= 5) ins[n].value = v;
    });
    const res = section.querySelector(".calc-result"), list = section.querySelector(".calc-steps"), note = section.querySelector(".calc-note");

    function draw() {
      const [a, b, c, d] = nomes.map(n => Number(ins[n].value));
      nomes.forEach((n, i) => (outs[n].textContent = fmt([a, b, c, d][i])));
      const det = a * d - b * c;
      const A = pm([[a, b], [c, d]]);
      const passos = [];
      passos.push({ tag: "Determinante", html: "Multiplique a diagonal principal e subtraia a outra diagonal.",
        tex: `\\det A = ${par(a)} \\cdot ${par(d)} - ${par(b)} \\cdot ${par(c)} = ${a * d} - ${par(b * c)} = ${tone(det, det === 0 ? 4 : 1)}` });
      if (det === 0) {
        math(res, `\\displaystyle A = ${A} \\qquad \\det A = 0`);
        passos.push({ tag: "Sem inversa", html: "Para inverter seria preciso dividir pelo determinante, e ele é zero. As linhas de A são proporcionais: uma é a outra multiplicada por um número. É o caso das retas paralelas ou coincidentes dos <a href=\"sistemas.html\">sistemas</a>.",
          tex: `A^{-1} = \\frac{1}{0} \\cdots \\quad \\text{não existe}` });
        note.innerHTML = "Uma matriz com determinante zero achata o plano numa reta (ou num ponto): informação se perde, e não há como desfazer.";
      } else {
        const inv = [[F(d, det), F(-b, det)], [F(-c, det), F(a, det)]];
        const invT = pm(inv.map(l => l.map(ftex)));
        math(res, `\\displaystyle A^{-1} = ${tone(invT, 1)}`);
        passos.push({ tag: "Troque e inverta", html: "Troque de lugar os dois números da diagonal principal, troque o sinal dos outros dois, e divida tudo pelo determinante.",
          tex: `A^{-1} = \\frac{1}{${det}} ${pm([[d, -b], [-c, a]])} = ${invT}` });
        passos.push({ tag: "Prova", html: "A vezes a inversa tem de dar a identidade I: 1 na diagonal, 0 fora dela. A identidade faz nas matrizes o papel do 1 nos números.",
          tex: `A \\cdot A^{-1} = ${A} ${invT} = ${pm([[1, 0], [0, 1]])} = I` });
        // ax + by sem "1x", "+ −" nem termos nulos.
        const eqTxt = (p, r) => {
          const t = [[p, "x"], [r, "y"]].filter(([v]) => v !== 0).map(([v, l], i) => {
            const abs = Math.abs(v) === 1 ? l : `${Math.abs(v)}${l}`;
            return i === 0 ? `${v < 0 ? "−" : ""}${abs}` : ` ${v < 0 ? "−" : "+"} ${abs}`;
          });
          return t.join("");
        };
        note.innerHTML = `Com A⁻¹, o sistema ${eqTxt(a, b)} = e e ${eqTxt(c, d)} = f se resolve para qualquer lado direito (e, f) multiplicando: (x, y) = A⁻¹ · (e, f). É o mesmo número a₁b₂ − a₂b₁ da página de <a href="sistemas.html#casos">sistemas</a> que decide se há uma solução.`;
      }
      list.replaceChildren();
      passos.forEach(p => {
        const li = el("li");
        const s = el("span"); s.innerHTML = `<strong>${p.tag}.</strong> ${p.html}`;
        const mm = el("span", "calc-math"); math(mm, `\\displaystyle ${p.tex}`);
        li.append(s, mm); list.appendChild(li);
      });
      saveParams({ ia: a, ib: b, ic: c, id: d });
    }

    section.addEventListener("input", draw);
    draw();
  }

  Licao.renderTex();
  const s1 = document.querySelector("#produto");
  if (s1) initProduto(s1);
  const s2 = document.querySelector("#inversa");
  if (s2) initInversa(s2);
})();
