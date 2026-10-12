/* Inequação do 1º grau: o desenho de por que o sinal vira ao multiplicar por
 * um negativo e a calculadora que resolve passo a passo, com o conjunto
 * solução na reta e em intervalo. O parser e a forma a·x + b vêm de
 * expressao.js; os utilitários, de licao.js.
 */
(() => {
  const { fmt, texNum, tone, math, el, svg, saveParams } = Licao;
  const E = Expr;
  const { lin, linTex, termTex, subst } = E;

  const REL_TEX = { "<": "<", "<=": "\\le", ">": ">", ">=": "\\ge" };
  const REL_TXT = { "<": "<", "<=": "≤", ">": ">", ">=": "≥" };
  const FLIP = { "<": ">", "<=": ">=", ">": "<", ">=": "<=" };
  const holds = (l, r, rel) => (rel === "<" ? l < r : rel === "<=" ? l <= r : rel === ">" ? l > r : l >= r);

  /* ---------------------------------------------------------------- por que vira */

  function initVira(section) {
    const ins = {}, outs = {};
    ["vp", "vq", "vk"].forEach(k => {
      ins[k] = section.querySelector(`input[name=${k}]`);
      outs[k] = section.querySelector(`.out-${k}`);
    });
    const fig = section.querySelector(".vira-figure");
    const eq = section.querySelector(".vira-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    Object.entries(ins).forEach(([k, i]) => { if (q.has(k)) i.value = q.get(k); });

    function draw(moved) {
      // O fator nunca é zero: pula na direção em que o slider andou.
      if (Number(ins.vk.value) === 0) ins.vk.value = moved === ins.vk && Number(ins.vk.dataset.last) < 0 ? 1 : -1;
      ins.vk.dataset.last = ins.vk.value;
      const p = Number(ins.vp.value), r = Number(ins.vq.value), k = Number(ins.vk.value);
      Object.entries(outs).forEach(([key, o]) => { o.textContent = fmt(Number(ins[key].value)); });
      const P = k * p, R = k * r;

      const W = 640, H = 170, L = 24, Rm = 24, Y1 = 40, Y2 = 130;
      const lo = Math.min(-6, P, R), hi = Math.max(6, P, R);
      const X = v => L + (v - lo) / (hi - lo) * (W - L - Rm);
      const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot reta", role: "img",
        "aria-label": `${p} e ${r} na reta de cima; multiplicados por ${k}, ${P} e ${R} na de baixo` });
      const every = hi - lo > 24 ? 3 : hi - lo > 14 ? 2 : 1;
      [Y1, Y2].forEach(Y => {
        svg("line", { x1: L - 8, x2: W - Rm + 8, y1: Y, y2: Y, class: "plot-axis is-x" }, g);
        for (let v = Math.ceil(lo); v <= hi; v++) {
          if (v % every && v !== 0) continue;
          svg("line", { x1: X(v), x2: X(v), y1: Y - 4, y2: Y + 4, class: v === 0 ? "plot-axis" : "plot-grid" }, g);
          const tt = svg("text", { x: X(v), y: Y + 20, class: `plot-tick${v === 0 ? " is-zero" : ""}`, "text-anchor": "middle" }, g);
          tt.textContent = fmt(v);
        }
      });
      // Cada número desce até a sua imagem: com k negativo, as linhas se cruzam.
      svg("line", { x1: X(p), y1: Y1, x2: X(P), y2: Y2, class: "vira-map is-p" }, g);
      svg("line", { x1: X(r), y1: Y1, x2: X(R), y2: Y2, class: "vira-map is-q" }, g);
      [[p, Y1, "reta-a"], [P, Y2, "reta-a"], [r, Y1, "reta-q"], [R, Y2, "reta-q"]].forEach(([v, Y, cls]) => svg("circle", { cx: X(v), cy: Y, r: 6, class: `plot-dot ${cls}` }, g));
      fig.replaceChildren(g);

      const rel = (a, b) => (a < b ? "<" : a > b ? ">" : "=");
      const r1 = rel(p, r), r2 = rel(P, R);
      const kp = k < 0 ? `(${fmt(k)})` : fmt(k);
      math(eq, `\\displaystyle ${tone(texNum(p), 2)} ${r1} ${tone(texNum(r), 5)} \\quad\\xrightarrow{\\;\\times\\, ${texNum(k).replace("−", "-")}\\;}\\quad ${tone(texNum(P), 2)} ${r2} ${tone(texNum(R), 5)}`);
      text.innerHTML = p === r
        ? `<p>Com os dois números iguais, não há desigualdade para virar. Afaste-os.</p>`
        : k > 0
          ? `<p>Multiplicar por ${fmt(k)}, positivo, estica a reta${k === 1 ? " (aqui, nem isso)" : ""} mas mantém a ordem: quem estava à esquerda continua à esquerda. ${fmt(p)} ${r1} ${fmt(r)} e ${fmt(P)} ${r2} ${fmt(R)}: <strong>o sinal se mantém</strong>.</p>`
          : `<p>Multiplicar por ${kp}, negativo, <strong>espelha a reta</strong> em torno do zero: o que estava à esquerda vai para a direita. As linhas se cruzam, e ${fmt(p)} ${r1} ${fmt(r)} vira ${fmt(P)} ${r2} ${fmt(R)}: <strong>o sinal vira</strong>.</p>`
            + `<p>Por isso, numa inequação, multiplicar ou dividir os dois lados por um número negativo obriga a trocar &lt; por &gt; (e ≤ por ≥).</p>`;
      saveParams({ vp: p, vq: r, vk: k });
    }

    section.addEventListener("input", e => draw(e.target));
    draw();
  }

  /* ---------------------------------------------------------------- a solução na reta */

  function drawSolution(box, X, rel) {
    const W = 640, H = 70, L = 24, R = 24, Y = 30;
    const x0 = E.val(X), c = Math.round(x0);
    const lo = c - 6, hi = c + 6;
    const P = v => L + (v - lo) / (hi - lo) * (W - L - R);
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot reta", role: "img",
      "aria-label": `Solução: x ${REL_TXT[rel]} ${E.text(X)}` });
    svg("line", { x1: L - 8, x2: W - R + 8, y1: Y, y2: Y, class: "plot-axis is-x" }, g);
    for (let v = lo; v <= hi; v++) {
      svg("line", { x1: P(v), x2: P(v), y1: Y - 4, y2: Y + 4, class: v === 0 ? "plot-axis" : "plot-grid" }, g);
      const tt = svg("text", { x: P(v), y: Y + 22, class: `plot-tick${v === 0 ? " is-zero" : ""}`, "text-anchor": "middle" }, g);
      tt.textContent = fmt(v);
    }
    const right = rel[0] === ">";
    const end = right ? W - R + 6 : L - 6;
    svg("line", { x1: P(x0), x2: end, y1: Y, y2: Y, class: "ineq-ray" }, g);
    const dir = right ? 1 : -1;
    svg("path", { d: `M${end + dir * 8},${Y} l${-dir * 12},-7 l0,14 z`, class: "ineq-head" }, g);
    svg("circle", { cx: P(x0), cy: Y, r: 7, class: `ineq-dot${rel.length === 1 ? " is-open" : ""}` }, g);
    box.replaceChildren(g);
  }

  // ]−∞, 5[ · [5, +∞[ — a notação brasileira de intervalos.
  function intervalo(X, rel) {
    const v = E.tex(X);
    if (rel === "<") return `\\left]-\\infty,\\ ${v}\\right[`;
    if (rel === "<=") return `\\left]-\\infty,\\ ${v}\\right]`;
    if (rel === ">") return `\\left]${v},\\ +\\infty\\right[`;
    return `\\left[${v},\\ +\\infty\\right[`;
  }

  /* ---------------------------------------------------------------- resolver */

  function solve(src) {
    const m = src.match(/<=|>=|≤|≥|<|>/g);
    if (!m) throw new Error("Falta o sinal da desigualdade: use <, >, ≤ (ou <=) ou ≥ (ou >=), como em 3x + 5 < 20. Com =, é uma equação.");
    if (m.length > 1) throw new Error("Use um sinal de desigualdade só. Inequações duplas, como 1 < x < 5, resolva como duas.");
    if (src.includes("=") && !/[<>]=/.test(src)) throw new Error("Há um = além da desigualdade: use um sinal só.");
    let rel = { "≤": "<=", "≥": ">=" }[m[0]] || m[0];
    const [sl, sr] = src.split(m[0]);
    const TL = E.parse(sl, { allowX: true }), TR = E.parse(sr, { allowX: true });
    const Lf = lin(TL), Rf = lin(TR);
    if (!JSON.stringify([TL, TR]).includes('"t":"x"')) throw new Error("Não há x na inequação. Escreva a incógnita como x.");

    const steps = [];
    const R = () => REL_TEX[rel];
    steps.push({ html: "A inequação, como foi escrita:", tex: `${E.toTex(TL)} ${R()} ${E.toTex(TR)}` });
    if (E.toTex(TL) !== linTex(Lf) || E.toTex(TR) !== linTex(Rf)) {
      steps.push({ tag: "Simplifique", html: "Em cada lado, tire os parênteses e junte os termos semelhantes. Nada disso mexe no sinal.", tex: `${linTex(Lf)} ${R()} ${linTex(Rf)}` });
    }

    let F1 = Lf, F2 = Rf;
    if (E.isZero(Lf.a) && !E.isZero(Rf.a)) {
      [F1, F2] = [Rf, Lf];
      rel = FLIP[rel];
      steps.push({ tag: "Inverta", html: `O x está só do lado direito. Leia a desigualdade ao contrário — “${E.text(Lf.b)} é menor que…” é o mesmo que “… é maior que ${E.text(Lf.b)}” —, e a ponta do sinal continua apontando para o mesmo número.`,
        tex: `${linTex(F1)} ${R()} ${linTex(F2)}` });
    }

    let { a: a1, b: b1 } = F1;
    let b2 = F2.b;
    const a2 = F2.a;
    const L0 = E.Q(0);
    if (!E.isZero(a2)) {
      const A = E.sub(a1, a2);
      const desc = a2.n > 0 ? `subtraia ${E.text(a2) === "1" ? "" : E.text(a2)}x dos dois lados` : `some ${E.text(E.neg(a2)) === "1" ? "" : E.text(E.neg(a2))}x aos dois lados`;
      steps.push({ tag: "Junte os x", html: `Traga os x para a esquerda: ${desc}. Somar ou subtrair dos dois lados não mexe no sinal.`,
        tex: `\\begin{aligned} ${linTex(F1)} ${tone(termTex(E.neg(a2), "x"), 4)} &${R()} ${linTex(F2)} ${tone(termTex(E.neg(a2), "x"), 4)} \\\\ ${linTex({ a: A, b: b1 })} &${R()} ${linTex({ a: L0, b: b2 })} \\end{aligned}` });
      a1 = A;
    }

    if (E.isZero(a1)) {
      const ok = holds(E.val(b1), E.val(b2), rel);
      steps.push({ tag: ok ? "Sempre vale" : "Nunca vale", html: ok
        ? `Os x sumiram e sobrou ${E.text(b1)} ${REL_TXT[rel]} ${E.text(b2)}, que é verdade: vale para <strong>todo número real</strong>.`
        : `Os x sumiram e sobrou ${E.text(b1)} ${REL_TXT[rel]} ${E.text(b2)}, que é falso: <strong>nenhum número</strong> serve.`,
        tex: `${E.tex(b1)} ${R()} ${E.tex(b2)}` });
      return { steps, kind: ok ? "todos" : "nenhum" };
    }

    if (!E.isZero(b1)) {
      const C = E.sub(b2, b1);
      const desc = b1.n > 0 ? `subtraia ${E.text(b1)} dos dois lados` : `some ${E.text(E.neg(b1))} aos dois lados`;
      steps.push({ tag: "Isole o x", html: `Deixe o termo com x sozinho: ${desc}.`,
        tex: `\\begin{aligned} ${linTex({ a: a1, b: b1 })} ${tone(termTex(E.neg(b1), ""), 4)} &${R()} ${E.tex(b2)} ${tone(termTex(E.neg(b1), ""), 4)} \\\\ ${linTex({ a: a1, b: L0 })} &${R()} ${E.tex(C)} \\end{aligned}` });
      b2 = C;
    }

    const X = E.div(b2, a1);
    if (!(a1.n === 1 && a1.d === 1)) {
      const negativo = a1.n < 0, antes = rel;
      if (negativo) rel = FLIP[rel];
      steps.push({ tag: negativo ? "Divida e vire" : "Divida", html: negativo
        ? `O x está multiplicado por ${E.text(a1)}, um número <strong>negativo</strong>. Divida os dois lados por ${E.text(a1)} e <strong>vire o sinal</strong>: ${REL_TXT[antes]} passa a ser ${REL_TXT[rel]}.`
        : `O x está multiplicado por ${E.text(a1)}, positivo. Divida os dois lados por ${E.text(a1)}; o sinal fica como está.`,
        tex: `\\dfrac{${linTex({ a: a1, b: L0 })}}{${E.tex(a1)}} \\;${negativo ? tone(REL_TEX[rel], 4) : R()}\\; \\dfrac{${E.tex(b2)}}{${E.tex(a1)}} \\quad\\Rightarrow\\quad x ${negativo ? tone(REL_TEX[rel], 4) : R()} ${tone(E.tex(X), 1)}` });
    }

    // Prova: um número de cada lado da fronteira, na inequação original.
    const val = q => [E.add(E.mul(Lf.a, q), Lf.b), E.add(E.mul(Rf.a, q), Rf.b)];
    const relOrig = { "≤": "<=", "≥": ">=" }[m[0]] || m[0];
    const dentro = E.add(X, E.Q(rel[0] === ">" ? 1 : -1)), fora = E.add(X, E.Q(rel[0] === ">" ? -1 : 1));
    const teste = q => {
      const [l, r] = val(q);
      const ok = holds(E.val(l), E.val(r), relOrig);
      return `x = ${E.tex(q)}:\\quad ${E.toTex(subst(TL, q))} ${REL_TEX[relOrig]} ${E.toTex(subst(TR, q))} \\;\\Rightarrow\\; ${E.tex(l)} ${REL_TEX[relOrig]} ${E.tex(r)}\\ ${ok ? "\\checkmark" : "\\text{(falso)}"}`;
    };
    const t1 = teste(dentro), t2 = teste(fora);
    steps.push({ tag: "Prova", html: `Teste um número de cada lado de ${E.text(X)} na inequação original: ${E.text(dentro)} tem de servir, ${E.text(fora)} não.${rel.length === 2 ? ` E o próprio ${E.text(X)} serve, porque o sinal tem o igual.` : ` O próprio ${E.text(X)} não serve: com ele os dois lados ficam iguais, e o sinal não tem o igual.`}`,
      tex: `\\begin{aligned} &${t1} \\\\ &${t2} \\end{aligned}` });
    return { steps, kind: "uma", X, rel };
  }

  function initCalc(section) {
    const input = section.querySelector("input[name=ineq]");
    const result = section.querySelector(".calc-result");
    const fig = section.querySelector(".ineq-figure");
    const list = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("ineq")) input.value = q.get("ineq");

    function update() {
      saveParams({ ineq: input.value.trim() });
      list.replaceChildren();
      let out;
      try { out = solve(input.value); } catch (e) {
        input.setAttribute("aria-invalid", "true");
        section.classList.add("has-error");
        result.textContent = "";
        fig.replaceChildren();
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
        const mm = el("span", "calc-math");
        math(mm, s.tex);
        li.appendChild(mm);
        list.appendChild(li);
      });
      if (out.kind === "uma") {
        math(result, `x ${REL_TEX[out.rel]} ${tone(E.tex(out.X), 1)} \\qquad S = ${intervalo(out.X, out.rel)}`);
        drawSolution(fig, out.X, out.rel);
        note.textContent = `Na reta, a bolinha ${out.rel.length === 2 ? "cheia" : "vazia"} marca o ${E.text(out.X)}: ${out.rel.length === 2 ? "ele faz parte da solução" : "ele fica de fora"}. No intervalo, o colchete ${out.rel.length === 2 ? "virado para dentro inclui" : "virado para fora exclui"} a ponta; o infinito sempre leva colchete para fora.`;
      } else {
        result.textContent = out.kind === "todos" ? "Todo número real é solução" : "Nenhum número é solução";
        fig.replaceChildren();
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
  const vira = document.querySelector("#vira");
  if (vira) initVira(vira);
  const calc = document.querySelector("#calc");
  if (calc) initCalc(calc);
})();
