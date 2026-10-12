/* Expressões numéricas: a calculadora que resolve uma operação por passo,
 * na ordem — parênteses de dentro para fora, potências, multiplicações e
 * divisões, somas e subtrações —, e os cards de regra. O parser e as
 * frações exatas vêm de expressao.js; os utilitários, de licao.js.
 */
(() => {
  const { tone, math, el, saveParams } = Licao;
  const E = Expr;

  const NIVEL = { "^": 3, "*": 2, "/": 2, "+": 1, "-": 1 };
  const NOMEOP = { "^": "potência", "*": "multiplicação", "/": "divisão", "+": "soma", "-": "subtração" };
  const SINAL = { "^": "^", "*": "×", "/": "÷", "+": "+", "-": "−" };

  /* ---------------------------------------------------------------- passos */

  // Tira o que não é conta: −(número) vira número negativo, e parênteses em
  // volta de um número só somem.
  function fold(n) {
    if (n.t === "neg") {
      const a = fold(n.a);
      return a.t === "num" ? { t: "num", q: E.neg(a.q) } : { t: "neg", a };
    }
    if (n.t === "grp") {
      const a = fold(n.a);
      return a.t === "num" ? a : { t: "grp", kind: n.kind, a };
    }
    if (n.t === "bin") return { ...n, a: fold(n.a), b: fold(n.b) };
    return n;
  }

  // As operações prontas para fazer (os dois lados já são números), com a
  // profundidade dos parênteses, o nível e a posição da esquerda para a
  // direita. scope é o grupo em que a operação está (null: a expressão toda).
  function candidates(root) {
    const out = [];
    let pos = 0;
    (function walk(n, depth, scope, under) {
      if (n.t === "bin") {
        walk(n.a, depth, scope, under);
        const me = pos++;
        if (n.a.t === "num" && n.b.t === "num") out.push({ n, depth, scope, pos: me, under });
        walk(n.b, depth, scope, under);
      } else if (n.t === "grp") walk(n.a, depth + 1, n, under);
      else if (n.t === "neg") walk(n.a, depth, scope, true);
    })(root, 0, null, false);
    return out;
  }

  // As operações do mesmo grupo, fora de grupos mais internos.
  function opsIn(root, scope) {
    const ops = [];
    (function walk(n, inScope) {
      if (n.t === "bin") {
        walk(n.a, inScope);
        if (inScope) ops.push(n);
        walk(n.b, inScope);
      } else if (n.t === "grp") walk(n.a, n === scope);
      else if (n.t === "neg") walk(n.a, inScope);
    })(scope || root, true);
    return ops;
  }

  const replace = (n, target, by) => {
    if (n === target) return by;
    if (n.t === "bin") return { ...n, a: replace(n.a, target, by), b: replace(n.b, target, by) };
    if (n.t === "grp" || n.t === "neg") return { ...n, a: replace(n.a, target, by) };
    return n;
  };

  function apply(op, p, q) {
    if (op === "+") return E.add(p, q);
    if (op === "-") return E.sub(p, q);
    if (op === "*") return E.mul(p, q);
    if (op === "/") {
      if (E.isZero(q)) throw new Error("Divisão por zero: nenhum número vezes 0 dá um número diferente de 0, então essa conta não tem resultado.");
      return E.div(p, q);
    }
    return E.pow(p, q);
  }

  // Por que esta operação vem agora.
  function reason(root, c) {
    const lvl = NIVEL[c.n.op];
    const ops = opsIn(root, c.scope).filter(o => o !== c.n);
    const lower = ops.some(o => NIVEL[o.op] < lvl);
    const same = ops.some(o => NIVEL[o.op] === lvl);
    const parts = [];
    if (c.depth) {
      const nome = E.NOME[c.scope.kind];
      parts.push(`Primeiro o que está dentro ${nome === "chaves" ? "das" : "dos"} ${nome}${c.depth > 1 ? ` mais internos` : ""}`.replace("das chaves mais internos", "das chaves mais internas"));
    }
    if (!ops.length) { if (!c.depth) parts.push("só resta esta operação"); }
    else if (lvl === 3) parts.push(lower ? "potência antes de multiplicar, dividir, somar ou subtrair" : "potência");
    else if (lvl === 2) {
      parts.push(lower ? "multiplicação e divisão antes de soma e subtração" : "só há multiplicações e divisões");
      if (same) parts.push("entre elas, a que aparece primeiro, da esquerda para a direita");
    } else parts.push("só restam somas e subtrações: a que aparece primeiro, da esquerda para a direita");
    const s = parts.join("; ");
    return s[0].toUpperCase() + s.slice(1) + ".";
  }

  // Em texto: 3 × (−1), (−3)², (1/2)³.
  function conta(op, p, q) {
    const t = x => (x.n < 0 ? `(${E.text(x)})` : E.text(x));
    if (op === "^") return `${p.n < 0 || !E.isInt(p) ? `(${E.text(p)})` : E.text(p)}${Licao.sup(q.n)}`;
    return `${E.text(p)} ${SINAL[op]} ${t(q)}`;
  }

  function solve(tree) {
    const steps = [];
    let cur = fold(tree);
    for (let guard = 0; cur.t !== "num" && guard < 80; guard++) {
      const cs = candidates(cur);
      cs.sort((p, q) => q.depth - p.depth || NIVEL[q.n.op] - NIVEL[p.n.op] || p.pos - q.pos);
      const c = cs[0];
      const { op, a, b } = c.n;
      const before = E.toTex(cur, new Map([[c.n, 2]]));
      const why = reason(cur, c);
      let r;
      try { r = apply(op, a.q, b.q); } catch (e) {
        steps.push({ why, before, err: e.message, op });
        return { steps, err: e.message };
      }
      const res = { t: "num", q: r };
      const next = fold(replace(cur, c.n, res));
      const sinal = c.under && op === "^" ? ` O sinal de menos na frente fica de fora: ele só entra depois da potência.` : "";
      steps.push({
        op, why: why + sinal,
        conta: `${conta(op, a.q, b.q)} = ${E.text(r)}`,
        before,
        after: E.toTex(next, new Map(next.t === "num" ? [[next, 1]] : findNum(next, res) ? [[res, 1]] : [])),
      });
      cur = next;
    }
    return { steps, value: cur.q };
  }

  // O nó do resultado depois do fold (o próprio, ou o número que o substituiu
  // quando os parênteses em volta caíram).
  function findNum(root, res) {
    let hit = null;
    (function walk(n) {
      if (hit) return;
      if (n === res) { hit = n; return; }
      if (n.t === "bin") { walk(n.a); walk(n.b); } else if (n.t === "grp" || n.t === "neg") walk(n.a);
    })(root);
    return hit;
  }

  /* ---------------------------------------------------------------- calculadora */

  function initCalc(section) {
    const input = section.querySelector("input[name=expr]");
    const result = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("expr")) input.value = q.get("expr");

    function update() {
      const src = input.value;
      saveParams({ expr: src.trim() });
      steps.replaceChildren();
      let tree;
      try { tree = Expr.parse(src); } catch (e) {
        input.setAttribute("aria-invalid", "true");
        section.classList.add("has-error");
        result.textContent = "";
        note.textContent = e.message;
        return;
      }
      input.setAttribute("aria-invalid", "false");
      const out = solve(tree);
      section.classList.toggle("has-error", !!out.err);

      const add = (label, html, src) => {
        const li = el("li");
        const p = el("span");
        p.innerHTML = label ? `<strong>${label}.</strong> ${html}` : html;
        li.appendChild(p);
        if (src) { const m = el("span", "calc-math"); math(m, src); li.appendChild(m); }
        steps.appendChild(li);
      };
      const start = E.toTex(fold(tree));
      add(null, out.steps.length ? "A expressão, como foi escrita:" : "Não há operação para fazer: é um número só.", start);
      out.steps.forEach(s => {
        const nome = NOMEOP[s.op][0].toUpperCase() + NOMEOP[s.op].slice(1);
        if (s.err) add(nome, `${s.why} Mas aqui a conta para: ${s.err}`, s.before);
        else add(nome, `${s.why} ${s.conta}.`, `${s.before} \\;=\\; ${s.after}`);
      });

      if (out.err) {
        result.textContent = "";
        note.textContent = out.err;
        return;
      }
      math(result, `${start} = ${tone(E.tex(out.value), 1)}`);
      const n = out.steps.length;
      note.innerHTML = n
        ? `${n} ${n === 1 ? "operação" : "operações"}, uma por passo. A operação da vez está em laranja; o resultado dela, em azul.${E.casas(out.value) < 0 ? ` O resultado não termina em decimal: ${E.text(out.value)} ≈ ${Licao.fmt(E.val(out.value), 4)}.` : ""}`
        : "";
    }

    section.addEventListener("input", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      input.value = btn.dataset.exemplo;
      update();
    }));
    update();
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    a: { min: 1, max: 12, value: 2 },
    b: { min: 1, max: 12, value: 3 },
    c: { min: 1, max: 12, value: 4 },
  };

  const RULES = {
    // a + b × c: a multiplicação primeiro.
    multAntes({ a, b, c }) {
      return {
        lhs: [`${a} + ${tone(`${b} \\times ${c}`, 2)} = ${a} + ${b * c} = ${a + b * c}`, a + b * c],
        rhs: [`${a} + (${b} \\times ${c}) = ${a + b * c}`, a + b * c],
        note: `Da esquerda para a direita, sem a regra, daria (${a} + ${b}) × ${c} = ${(a + b) * c}${(a + b) * c === a + b * c ? " — aqui coincide, mas mude os valores" : ", outro número"}.`,
      };
    },
    // a − b + c: na ordem em que aparecem.
    esqDir({ a, b, c }) {
      return {
        lhs: [`${a} - ${b} + ${c} = ${a - b} + ${c} = ${a - b + c}`, a - b + c],
        rhs: [`${a} - (${b} + ${c}) = ${a} - ${b + c} = ${a - b - c}`, a - b - c],
        note: "Somar primeiro é como pôr parênteses que não estavam lá: o c passa a ser subtraído. Soma e subtração têm a mesma força — vale a ordem da leitura.",
      };
    },
    // a ÷ b × c: na ordem em que aparecem.
    divMult({ a, b, c }) {
      const l = (a / b) * c, r = a / (b * c);
      return {
        lhs: [`${a} \\div ${b} \\times ${c} = ${Licao.texNum(a / b)} \\times ${c} = ${Licao.texNum(l)}`, l],
        rhs: [`${a} \\div (${b} \\times ${c}) = ${a} \\div ${b * c} = ${Licao.texNum(r)}`, r],
        note: "Multiplicação não vem antes da divisão: as duas têm a mesma força, e a conta segue da esquerda para a direita.",
      };
    },
  };

  Licao.renderTex();
  const calc = document.querySelector("#calc");
  if (calc) initCalc(calc);
  Licao.regras(VARS, RULES);
})();
