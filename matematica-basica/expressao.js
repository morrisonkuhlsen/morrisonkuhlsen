/* Expressões que o leitor digita, divididas pela ordem das operações e pela
 * equação do 1º grau: frações exatas, o parser e a escrita em LaTeX.
 *
 * Os números são frações exatas { n, d } (d > 0): 1 ÷ 3 × 3 dá 1, não
 * 0,9999…. A árvore tem nós
 *   { t: "num", q } · { t: "x" } · { t: "neg", a } · { t: "grp", kind, a }
 *   { t: "bin", op, a, b, implicit }
 * com op em + − * / ^. Os parênteses, colchetes e chaves que o leitor
 * escreveu viram nós grp, para a conta mostrar a expressão como ele a
 * escreveu; implicit marca o produto sem sinal, como 2(3 + 4) ou 3x.
 */
window.Expr = (() => {
  const { fmt, tone } = Licao;

  /* ---------------------------------------------------------------- frações */

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  function Q(n, d = 1) {
    if (d === 0) throw new Error("Divisão por zero: nenhum número vezes 0 dá um número diferente de 0, então a conta não tem resultado.");
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    n /= g; d /= g;
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d)) throw new Error("Os números ficaram grandes demais para a conta exata. Tente números menores.");
    return { n: n === 0 ? 0 : n, d };
  }
  const add = (p, q) => Q(p.n * q.d + q.n * p.d, p.d * q.d);
  const sub = (p, q) => Q(p.n * q.d - q.n * p.d, p.d * q.d);
  const mul = (p, q) => Q(p.n * q.n, p.d * q.d);
  const div = (p, q) => Q(p.n * q.d, p.d * q.n);
  const neg = p => Q(-p.n, p.d);
  const isZero = p => p.n === 0;
  const isInt = p => p.d === 1;
  const val = p => p.n / p.d;
  function pow(p, e) {
    if (!isInt(e)) throw new Error("Expoente fracionário é raiz, não potência inteira — veja a página de raízes.");
    const k = e.n;
    if (Math.abs(k) > 60) throw new Error("Expoente grande demais para a conta exata.");
    if (k < 0 && isZero(p)) throw new Error("Zero elevado a expoente negativo seria 1 ÷ 0: não existe.");
    if (k === 0 && isZero(p)) throw new Error("0⁰ é indeterminado: a regra a⁰ = 1 pede 1, e a regra 0ⁿ = 0 pede 0.");
    let r = Q(1);
    for (let i = 0; i < Math.abs(k); i++) r = mul(r, p);
    return k < 0 ? div(Q(1), r) : r;
  }

  // Quantas casas decimais a fração tem, se terminar em até `max` casas
  // (só quando o denominador é feito de 2 e 5); senão, -1.
  function casas(p, max = 8) {
    let d = p.d, k = 0;
    while (d % 10 === 0) { d /= 10; k++; }
    while (d % 2 === 0) { d /= 2; k++; }
    while (d % 5 === 0) { d /= 5; k++; }
    return d === 1 && k <= max ? k : -1;
  }

  // Em texto: 3, −2, 0,25, 1/3.
  function text(p) {
    const k = casas(p);
    return k >= 0 ? fmt(val(p), k) : `${p.n < 0 ? "−" : ""}${Math.abs(p.n)}/${p.d}`;
  }

  // Em LaTeX: 3, -2, 0{,}25, \frac{1}{3}.
  function tex(p) {
    const k = casas(p);
    if (k >= 0) return fmt(val(p), k).replace("−", "-").replace(/[.,]/g, c => `{${c}}`);
    return `${p.n < 0 ? "-" : ""}\\frac{${Math.abs(p.n)}}{${p.d}}`;
  }

  /* ---------------------------------------------------------------- parser */

  const CLOSE = { "(": ")", "[": "]", "{": "}" };
  const NOME = { "(": "parênteses", "[": "colchetes", "{": "chaves" };

  function tokens(src, allowX) {
    const out = [];
    const s = src.replace(/\s+/g, "");
    if (!s) throw new Error("Digite uma expressão.");
    for (let i = 0; i < s.length;) {
      const c = s[i];
      const m = /^\d+(,\d+)?/.exec(s.slice(i));
      if (m) {
        const [ip, fp = ""] = m[0].split(",");
        if (ip.length + fp.length > 12) throw new Error("Números com no máximo 12 algarismos.");
        out.push({ t: "num", q: Q(Number(ip + fp), 10 ** fp.length) });
        i += m[0].length;
        if (s[i] === ".") throw new Error("Use vírgula para os decimais (3,5) e não use ponto de milhar.");
        continue;
      }
      if (c === ".") throw new Error("Use vírgula para os decimais (3,5) e não use ponto de milhar.");
      if (allowX && /[xX]/.test(c)) { out.push({ t: "x" }); i++; continue; }
      if ("+".includes(c)) out.push({ t: "op", op: "+" });
      else if ("-−–".includes(c)) out.push({ t: "op", op: "-" });
      else if ("*×·".includes(c)) out.push({ t: "op", op: "*" });
      else if ("/÷:".includes(c)) out.push({ t: "op", op: "/" });
      else if (c === "^") out.push({ t: "op", op: "^" });
      else if ("([{".includes(c)) out.push({ t: "open", kind: c });
      else if (")]}".includes(c)) out.push({ t: "close", kind: c });
      else if ("²³".includes(c)) { out.push({ t: "op", op: "^" }, { t: "num", q: Q(c === "²" ? 2 : 3) }); }
      else if (!allowX && /[xX]/.test(c)) throw new Error("Para multiplicar, use * ou ×. Para resolver uma equação com x, veja a página da equação do 1º grau.");
      else throw new Error(`Não reconheci o símbolo “${c}”. Use números, + − × ÷ ^ e parênteses.`);
      i++;
    }
    return out;
  }

  // expr := term (± term)* · term := unary ((× | ÷) unary | produto implícito)*
  // unary := − unary | power · power := primary (^ unary)?
  function parse(src, { allowX = false } = {}) {
    const ts = tokens(src, allowX);
    let i = 0;
    const peek = () => ts[i];
    const isOp = op => ts[i]?.t === "op" && ts[i].op === op;

    function expr() {
      let a = term();
      while (isOp("+") || isOp("-")) {
        const op = ts[i++].op;
        a = { t: "bin", op, a, b: term() };
      }
      return a;
    }
    function term() {
      let a = unary();
      for (;;) {
        if (isOp("*") || isOp("/")) {
          const op = ts[i++].op;
          a = { t: "bin", op, a, b: unary() };
        } else if (peek() && (peek().t === "open" || peek().t === "x" || (peek().t === "num" && (a.t === "grp" || a.t === "x")))) {
          a = { t: "bin", op: "*", a, b: power(), implicit: true };
        } else return a;
      }
    }
    function unary() {
      if (isOp("-")) { i++; return { t: "neg", a: unary() }; }
      if (isOp("+")) { i++; return unary(); }
      return power();
    }
    function power() {
      const a = primary();
      if (isOp("^")) { i++; return { t: "bin", op: "^", a, b: unary() }; }
      return a;
    }
    function primary() {
      const tk = ts[i++];
      if (!tk) throw new Error("A expressão terminou no meio: falta um número depois do último sinal.");
      if (tk.t === "num") return { t: "num", q: tk.q };
      if (tk.t === "x") return { t: "x" };
      if (tk.t === "open") {
        if (peek()?.t === "close") throw new Error(`Há ${NOME[tk.kind]} vazios.`);
        const a = expr();
        const c = ts[i++];
        if (!c || c.t !== "close") throw new Error(`Faltou fechar ${NOME[tk.kind] === "chaves" ? "as" : "os"} ${NOME[tk.kind]} com “${CLOSE[tk.kind]}”.`);
        if (c.kind !== CLOSE[tk.kind]) throw new Error(`Abriu com “${tk.kind}” e fechou com “${c.kind}”: feche com “${CLOSE[tk.kind]}”.`);
        return { t: "grp", kind: tk.kind, a };
      }
      if (tk.t === "close") throw new Error(`Há um “${tk.kind}” fechando sem ter sido aberto.`);
      throw new Error(`Faltou um número antes de “${{ "*": "×", "/": "÷" }[tk.op] || tk.op}”.`);
    }

    const tree = expr();
    if (i < ts.length) {
      const tk = ts[i];
      throw new Error(tk.t === "close" ? `Há um “${tk.kind}” fechando sem ter sido aberto.` : "Sobrou alguma coisa no fim da expressão: confira os sinais.");
    }
    return tree;
  }

  /* ---------------------------------------------------------------- LaTeX */

  const OPTEX = { "+": "+", "-": "-", "*": "\\times", "/": "\\div" };
  const PAREN = { "(": ["\\left(", "\\right)"], "[": ["\\left[", "\\right]"], "{": ["\\left\\{", "\\right\\}"] };

  // hl: Map nó → tom. Número negativo ganha parênteses quando vem depois de
  // um sinal ou é base de potência: 2 − (−3), (−3)².
  function toTex(node, hl = new Map()) {
    function go(n, ctx) {
      let s;
      if (n.t === "num") {
        s = tex(n.q);
        const wrap = (n.q.n < 0 && (ctx === "right" || ctx === "base" || ctx === "neg")) || (ctx === "base" && !isInt(n.q));
        if (wrap) s = `(${s})`;
      } else if (n.t === "x") s = "x";
      else if (n.t === "neg") {
        s = `-${n.a.t === "neg" ? `(${go(n.a, "in")})` : go(n.a, "neg")}`;
        if (ctx === "right" || ctx === "base") s = `(${s})`;
      }
      else if (n.t === "grp") s = `${PAREN[n.kind][0]}${go(n.a, "in")}${PAREN[n.kind][1]}`;
      else if (n.op === "^") s = `{${go(n.a, "base")}}^{${go(n.b, "in")}}`;
      else if (n.implicit) s = `${go(n.a, "left")}${n.b.t === "num" ? "\\cdot " : ""}${go(n.b, "right")}`;
      else s = `${go(n.a, "left")} ${OPTEX[n.op]} ${go(n.b, "right")}`;
      return hl.has(n) ? tone(s, hl.get(n)) : s;
    }
    return go(node, "top");
  }

  return { Q, add, sub, mul, div, neg, pow, isZero, isInt, val, casas, text, tex, parse, toTex, NOME };
})();
