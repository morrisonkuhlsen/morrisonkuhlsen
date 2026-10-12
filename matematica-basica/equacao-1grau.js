/* Equação do 1º grau: a balança do início (tirar o mesmo dos dois pratos,
 * repartir nos dois pratos) e a calculadora que resolve qualquer equação
 * do 1º grau em x, passo a passo, com a prova no fim. O parser e as frações
 * exatas vêm de expressao.js; os utilitários, de licao.js.
 */
(() => {
  const { tone, math, el, svg, saveParams } = Licao;
  const E = Expr;

  /* ---------------------------------------------------------------- balança */

  function initBalanca(section) {
    const ins = {};
    ["ba", "bb", "bx"].forEach(k => { ins[k] = section.querySelector(`input[name=${k}]`); });
    const outs = {};
    ["ba", "bb", "bx"].forEach(k => { outs[k] = section.querySelector(`.out-${k}`); });
    const btns = section.querySelectorAll("[data-passo]");
    const fig = section.querySelector(".bal-figure");
    const eq = section.querySelector(".bal-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    Object.entries(ins).forEach(([k, i]) => { if (q.has(k)) i.value = q.get(k); });
    let passo = 0;

    function draw() {
      const a = Number(ins.ba.value), b = Number(ins.bb.value), x = Number(ins.bx.value);
      const c = a * x + b;
      Object.entries(outs).forEach(([k, o]) => { o.textContent = ins[k].value; });
      // Sem b, não há o que tirar: o passo 1 é o mesmo que o 0.
      btns.forEach(btn => {
        const k = Number(btn.dataset.passo);
        btn.setAttribute("aria-pressed", k === passo);
        btn.disabled = (k === 1 && b === 0) || (k === 2 && a === 1 && b === 0);
      });

      // Travessão no alto, pratos embaixo; até 4 fileiras de bolinhas cabem
      // entre os dois.
      const W = 640, H = 270, PW = 220, CX = [W * 0.25, W * 0.75], BY = 46, PY = 222, S = 22, G = 6, PER = 7;
      const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "bal-svg", role: "img",
        "aria-label": `Balança em equilíbrio: ${a} ${a === 1 ? "caixa" : "caixas"} x e ${b} ${b === 1 ? "bolinha" : "bolinhas"} de um lado, ${c} bolinhas do outro` });
      svg("path", { d: `M${W / 2 - 34},${H - 2} L${W / 2 + 34},${H - 2} L${W / 2 + 5},${BY} L${W / 2 - 5},${BY} Z`, class: "bal-stand" }, g);
      CX.forEach(cx => {
        svg("line", { x1: cx, x2: cx - PW / 2 + 8, y1: BY, y2: PY, class: "bal-rope" }, g);
        svg("line", { x1: cx, x2: cx + PW / 2 - 8, y1: BY, y2: PY, class: "bal-rope" }, g);
        svg("path", { d: `M${cx - PW / 2},${PY} Q${cx},${PY + 24} ${cx + PW / 2},${PY} Z`, class: "bal-pan" }, g);
      });
      svg("line", { x1: CX[0], x2: CX[1], y1: BY, y2: BY, class: "bal-beam" }, g);
      svg("circle", { cx: W / 2, cy: BY, r: 7, class: "bal-pivot" }, g);

      // Coloca os objetos de um prato em fileiras de PER, de baixo para cima.
      function pile(cx, items) {
        const n = items.length;
        items.forEach((it, i) => {
          const row = Math.floor(i / PER), col = i % PER;
          const inRow = Math.min(PER, n - row * PER);
          const x = cx - (inRow * (S + G) - G) / 2 + col * (S + G);
          const y = PY - 4 - (row + 1) * (S + G) + G;
          if (it.kind === "x") {
            svg("rect", { x, y, width: S, height: S, rx: 4, class: `bal-x${it.cls || ""}` }, g);
            const t = svg("text", { x: x + S / 2, y: y + S / 2 + 5, class: `bal-xlabel${it.cls || ""}`, "text-anchor": "middle" }, g);
            t.textContent = "x";
          } else {
            svg("circle", { cx: x + S / 2, cy: y + S / 2, r: S / 2 - 2, class: `bal-u${it.cls || ""}` }, g);
          }
        });
      }

      const xs = cls => Array.from({ length: a }, (_, i) => ({ kind: "x", cls: cls(i) }));
      const us = (n, cls) => Array.from({ length: n }, (_, i) => ({ kind: "u", cls: cls(i) }));
      if (passo === 0) {
        pile(CX[0], [...xs(() => ""), ...us(b, () => "")]);
        pile(CX[1], us(c, () => ""));
      } else if (passo === 1) {
        pile(CX[0], [...xs(() => ""), ...us(b, () => " is-out")]);
        pile(CX[1], us(c, i => (i >= c - b ? " is-out" : "")));
      } else {
        // Cada caixa x fica com um grupo igual de bolinhas: destaca o primeiro.
        pile(CX[0], xs(i => (i === 0 ? " is-pick" : " is-dim")));
        pile(CX[1], us(c - b, i => (Math.floor(i / x) === 0 ? " is-pick" : ` is-g${Math.floor(i / x) % 2} is-dim`)));
      }
      fig.replaceChildren(g);

      const ax = a === 1 ? "x" : `${a}x`;
      if (passo === 0) {
        math(eq, `\\displaystyle ${tone(ax, 2)}${b ? ` + ${tone(b, 5)}` : ""} = ${tone(c, 1)}`);
        text.innerHTML = `<p>A balança está equilibrada: ${a === 1 ? "uma caixa" : `${a} caixas`} de peso desconhecido x${b ? ` e ${b} ${b === 1 ? "bolinha" : "bolinhas"}` : ""} pesam o mesmo que ${c} bolinhas. Isso é a equação. Quanto pesa cada caixa?</p>`
          + `<p>A única regra: <strong>o que se fizer num prato, faz-se no outro</strong>, e a balança continua equilibrada.</p>`;
      } else if (passo === 1) {
        math(eq, `\\displaystyle ${tone(ax, 2)} + ${tone(b, 5)} ${tone(`- ${b}`, 4)} = ${tone(c, 1)} ${tone(`- ${b}`, 4)} \\quad\\Rightarrow\\quad ${tone(ax, 2)} = ${tone(c - b, 1)}`);
        text.innerHTML = `<p>Tire ${b} ${b === 1 ? "bolinha" : "bolinhas"} <strong>dos dois pratos</strong>. A balança continua equilibrada, e do lado esquerdo sobra${a === 1 ? " só a caixa" : `m só as ${a} caixas`}: ${ax} = ${c - b}.</p>`;
      } else {
        math(eq, a === 1
          ? `\\displaystyle ${tone("x", 2)} = ${tone(c - b, 1)}`
          : `\\displaystyle \\frac{${tone(ax, 2)}}{${a}} = \\frac{${tone(c - b, 1)}}{${a}} \\quad\\Rightarrow\\quad ${tone("x", 2)} = ${tone(x, 1)}`);
        text.innerHTML = a === 1
          ? `<p>Já sobrou uma caixa só: <strong>x = ${x}</strong>.</p>`
          : `<p>Agora ${a} caixas pesam ${c - b}. Reparta <strong>os dois pratos</strong> em ${a} partes iguais: cada caixa fica com ${c - b} ÷ ${a} = ${x} bolinhas. <strong>x = ${x}</strong>.</p>`;
      }
      saveParams({ ba: a, bb: b, bx: x });
    }

    btns.forEach(btn => btn.addEventListener("click", () => { passo = Number(btn.dataset.passo); draw(); }));
    section.addEventListener("input", () => { passo = 0; draw(); });
    draw();
  }

  const { lin, linTex, termTex, subst } = E;
  const L0 = { a: E.Q(0), b: E.Q(0) };

  function solve(src) {
    const parts = src.split("=");
    if (parts.length !== 2) throw new Error(parts.length < 2 ? "Falta o sinal de igual: uma equação tem dois lados, como 3x + 5 = 20." : "Use um sinal de igual só.");
    const [TL, TR] = parts.map(s => E.parse(s, { allowX: true }));
    const Lf = lin(TL), Rf = lin(TR);
    const has = t => JSON.stringify(t).includes('"t":"x"');
    if (!has(TL) && !has(TR)) throw new Error("Não há x na equação. Escreva a incógnita como x, como em 3x + 5 = 20.");

    const steps = [];
    const start = `${E.toTex(TL)} = ${E.toTex(TR)}`;
    steps.push({ tag: null, html: "A equação, como foi escrita:", tex: start });

    if (E.toTex(TL) !== linTex(Lf) || E.toTex(TR) !== linTex(Rf)) {
      steps.push({ tag: "Simplifique", html: "Em cada lado, tire os parênteses (multiplicando o que está fora por cada termo de dentro) e junte os termos semelhantes — x com x, número com número.",
        tex: `${linTex(Lf)} = ${linTex(Rf)}` });
    }

    // Com x só do lado direito, inverter os lados poupa um passo: 7 = x.
    let F1 = Lf, F2 = Rf;
    if (E.isZero(Lf.a) && !E.isZero(Rf.a)) {
      [F1, F2] = [Rf, Lf];
      steps.push({ tag: "Inverta", html: "O x está só do lado direito. Inverta os lados — a = b é o mesmo que b = a — para trabalhar com ele à esquerda.",
        tex: `${linTex(F1)} = ${linTex(F2)}` });
    }

    let { a: a1, b: b1 } = F1;
    const { a: a2 } = F2;
    let b2 = F2.b;
    if (!E.isZero(a2)) {
      const A = E.sub(a1, a2);
      const desc = a2.n > 0 ? `subtraia ${E.text(a2) === "1" ? "" : E.text(a2)}x dos dois lados` : `some ${E.text(E.neg(a2)) === "1" ? "" : E.text(E.neg(a2))}x aos dois lados`;
      steps.push({ tag: "Junte os x", html: `Traga os termos com x para o lado esquerdo: ${desc}. Do lado direito, os x se cancelam.`,
        tex: `\\begin{aligned} ${linTex(F1)} ${tone(termTex(E.neg(a2), "x"), 4)} &= ${linTex(F2)} ${tone(termTex(E.neg(a2), "x"), 4)} \\\\ ${linTex({ a: A, b: b1 })} &= ${linTex({ a: L0.a, b: b2 })} \\end{aligned}` });
      a1 = A;
    }

    // Os x se cancelaram: sobra uma igualdade entre números, verdadeira ou falsa.
    if (E.isZero(a1)) {
      const ok = E.text(b1) === E.text(b2);
      steps.push({ tag: ok ? "Sempre vale" : "Nunca vale", html: ok
        ? `Os x sumiram e sobrou ${E.text(b1)} = ${E.text(b2)}, uma igualdade sempre verdadeira: qualquer número serve. A equação tem <strong>infinitas soluções</strong> — os dois lados eram a mesma expressão escrita de jeitos diferentes.`
        : `Os x sumiram e sobrou ${E.text(b1)} = ${E.text(b2)}, uma igualdade falsa: nenhum número serve. A equação <strong>não tem solução</strong> — os dois lados têm o mesmo x, mas números diferentes.`,
        tex: `${E.tex(b1)} ${ok ? "=" : "\\ne"} ${E.tex(b2)}` });
      return { steps, kind: ok ? "todas" : "nenhuma", start };
    }

    if (!E.isZero(b1)) {
      const C = E.sub(b2, b1);
      const desc = b1.n > 0 ? `subtraia ${E.text(b1)} dos dois lados` : `some ${E.text(E.neg(b1))} aos dois lados`;
      steps.push({ tag: "Isole o x", html: `Deixe o termo com x sozinho: ${desc}.`,
        tex: `\\begin{aligned} ${linTex({ a: a1, b: b1 })} ${tone(termTex(E.neg(b1), ""), 4)} &= ${E.tex(b2)} ${tone(termTex(E.neg(b1), ""), 4)} \\\\ ${linTex({ a: a1, b: L0.b })} &= ${E.tex(C)} \\end{aligned}` });
      b2 = C;
    }

    const X = E.div(b2, a1);
    if (!(a1.n === 1 && a1.d === 1)) {
      const isMinus1 = a1.n === -1 && a1.d === 1;
      steps.push({ tag: "Divida", html: isMinus1
        ? "Sobrou −x. Multiplique os dois lados por −1 (troque os dois sinais)."
        : `O x está multiplicado por ${E.text(a1)}. Divida os dois lados por ${E.text(a1)}.`,
        tex: isMinus1 ? `x = ${tone(E.tex(X), 1)}` : `\\dfrac{${linTex({ a: a1, b: L0.b })}}{${E.tex(a1)}} = \\dfrac{${E.tex(b2)}}{${E.tex(a1)}} \\quad\\Rightarrow\\quad x = ${tone(E.tex(X), 1)}` });
    }

    // Prova: x na equação original. Se já era x = número, não há o que provar.
    if (steps.some(st => st.tag && st.tag !== "Inverta")) {
      const vL = E.add(E.mul(Lf.a, X), Lf.b), vR = E.add(E.mul(Rf.a, X), Rf.b);
      const lado = (T, v) => { const t = E.toTex(subst(T, X)); return t === E.tex(v) ? t : `${t} = ${E.tex(v)}`; };
      steps.push({ tag: "Prova", html: `Ponha x = ${E.text(X)} na equação original. Os dois lados têm de dar o mesmo número${E.text(vL) === E.text(vR) ? ` — e dão: ${E.text(vL)}` : ""}.`,
        tex: `\\begin{aligned} &\\text{esquerdo: } ${lado(TL, vL)} \\\\ &\\text{direito: } ${lado(TR, vR)} \\end{aligned}` });
    }
    return { steps, kind: "uma", X, start };
  }

  function initCalc(section) {
    const input = section.querySelector("input[name=eq]");
    const result = section.querySelector(".calc-result");
    const list = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("eq")) input.value = q.get("eq");

    function update() {
      saveParams({ eq: input.value.trim() });
      list.replaceChildren();
      let out;
      try { out = solve(input.value); } catch (e) {
        input.setAttribute("aria-invalid", "true");
        section.classList.add("has-error");
        result.textContent = "";
        const msg = e.message.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
        note.innerHTML = msg.replace("página da equação do 2º grau", '<a href="equacao-2grau.html">página da equação do 2º grau</a>');
        return;
      }
      input.setAttribute("aria-invalid", "false");
      section.classList.remove("has-error");
      out.steps.forEach(s => {
        const li = el("li");
        const p = el("span");
        p.innerHTML = s.tag ? `<strong>${s.tag}.</strong> ${s.html}` : s.html;
        li.appendChild(p);
        const m = el("span", "calc-math");
        math(m, s.tex);
        li.appendChild(m);
        list.appendChild(li);
      });
      if (out.kind === "uma") {
        math(result, `x = ${tone(E.tex(out.X), 1)}`);
        note.textContent = E.casas(out.X) < 0 ? `Em decimal, x ≈ ${Licao.fmt(E.val(out.X), 4)}.` : "";
      } else {
        result.textContent = out.kind === "todas" ? "Infinitas soluções" : "Sem solução";
        note.textContent = "";
      }
    }

    section.addEventListener("input", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      input.value = btn.dataset.exemplo;
      update();
    }));
    update();
  }

  Licao.renderTex();
  const bal = document.querySelector("#balanca");
  if (bal) initBalanca(bal);
  const calc = document.querySelector("#calc");
  if (calc) initCalc(calc);
})();
