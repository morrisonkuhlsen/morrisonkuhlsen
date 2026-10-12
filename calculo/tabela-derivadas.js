/* Tabela de derivadas: um card por regra (licao.js). Cada um calcula a
 * derivada de duas formas — pela definição, com um passo minúsculo, e pela
 * regra — e desenha a função com a tangente no ponto.
 */
(() => {
  const { fmt, texNum } = Licao;
  const SEN = "\\operatorname{sen}";

  // Derivada numérica com extrapolação de Richardson: erro da ordem de h⁴,
  // pequeno o bastante para bater com a regra em todas as casas exibidas.
  const D = (f, x, h = 1e-3) => (8 * (f(x + h) - f(x - h)) - (f(x + 2 * h) - f(x - 2 * h))) / (12 * h);
  const num = v => texNum(v, 6);
  const def = (ftex, x, d) => [`\\lim_{h \\to 0} \\dfrac{f(${x} + h) - f(${x})}{h} \\approx ${num(d)} \\qquad f(x) = ${ftex}`, d];

  // Gráfico pequeno da função com a tangente em x.
  function mini(f, x, d, from = x - 2.5) {
    return fig => {
      const x0 = Math.max(from, x - 2.5), x1 = x + 2.5;
      const ys = Array.from({ length: 121 }, (_, i) => f(x0 + (x1 - x0) * i / 120)).filter(Number.isFinite).sort((p, q) => p - q);
      const lo = ys[Math.floor(ys.length * 0.03)], hi = ys[Math.ceil(ys.length * 0.97) - 1];
      const pad = (hi - lo) * 0.15 || 1;
      const p = Grafico.plot(fig, { x0, x1, y0: Math.min(lo, f(x)) - pad, y1: Math.max(hi, f(x)) + pad, height: W => Math.max(150, W * 0.34), label: `Gráfico da função com a tangente em x = ${x}` });
      p.curve(f, "plot-curve", x0, x1, 300);
      p.line(x, f(x), d, "plot-tangent");
      p.dot(x, f(x), "plot-dot is-a");
    };
  }

  // Monta um card: f e a regra em JS, os textos em LaTeX.
  function rule(f, ftex, rtex, r, x, note, from) {
    const d = D(f, x);
    return { lhs: def(ftex, x, d), rhs: [`${rtex} = ${num(r)}`, r], note, draw: mini(f, x, r, from) };
  }

  const VARS = {
    x: { min: 1, max: 6, value: 2 },
    n: { min: -3, max: 5, value: 3 },
    a: { min: 2, max: 10, value: 2 },
    c: { min: -5, max: 9, value: 4 },
  };

  const RULES = {
    constante: ({ c, x }) => rule(() => c, texNum(c), "f'(x) = 0", 0, x, "A tangente é a própria reta horizontal."),
    variavel: ({ x }) => rule(v => v, "x", "f'(x) = 1", 1, x, ""),
    reta: ({ a, c, x }) => rule(v => a * v + c, `${a}x ${c < 0 ? "-" : "+"} ${Math.abs(c)}`, `f'(x) = ${a}`, a, x, "A tangente de uma reta é ela mesma."),
    potencia: ({ n, x }) => rule(v => v ** n, `x^{${n}}`, `f'(x) = ${n} \\cdot ${x}^{${n - 1}}`, n * x ** (n - 1), x,
      n === 0 ? "Com n = 0, x⁰ = 1 é uma constante, e a derivada é 0." : n === 1 ? "Com n = 1, volta a regra da própria variável." : n < 0 ? "Com expoente negativo, a regra vale igual: o expoente desce e diminui uma unidade." : ""),
    raiz: ({ x }) => rule(Math.sqrt, "\\sqrt{x}", `f'(x) = \\dfrac{1}{2\\sqrt{${x}}}`, 0.5 / Math.sqrt(x), x, "", 0.02),
    inverso: ({ x }) => rule(v => 1 / v, "\\dfrac{1}{x}", `f'(x) = -\\dfrac{1}{${x}^2}`, -1 / (x * x), x, "", 0.2),
    exp: ({ x }) => rule(Math.exp, "e^{x}", `f'(x) = e^{${x}}`, Math.exp(x), x, `Em x = ${x}, a altura e a inclinação valem o mesmo: ${fmt(Math.exp(x), 4)}.`),
    expa: ({ a, x }) => rule(v => a ** v, `${a}^{x}`, `f'(x) = ${a}^{${x}} \\ln ${a}`, a ** x * Math.log(a), x,
      `ln ${a} ≈ ${fmt(Math.log(a), 4)}: ${Math.log(a) > 1 ? "maior que 1, então a inclinação passa da altura" : "menor que 1, então a inclinação fica abaixo da altura"}.`),
    ln: ({ x }) => rule(Math.log, "\\ln x", `f'(x) = \\dfrac{1}{${x}}`, 1 / x, x, "", 0.05),
    loga: ({ a, x }) => rule(v => Math.log(v) / Math.log(a), `\\log_{${a}} x`, `f'(x) = \\dfrac{1}{${x} \\ln ${a}}`, 1 / (x * Math.log(a)), x, "", 0.05),
    sen: ({ x }) => rule(Math.sin, `${SEN} x`, `f'(x) = \\cos ${x}`, Math.cos(x), x, ""),
    cos: ({ x }) => rule(Math.cos, "\\cos x", `f'(x) = -${SEN} ${x}`, -Math.sin(x), x, ""),
    tan: ({ x }) => rule(Math.tan, "\\tan x", `f'(x) = \\dfrac{1}{\\cos^2 ${x}}`, 1 / Math.cos(x) ** 2, x, "Perto dos pontos em que o cosseno zera, a tangente dispara e a inclinação também."),
    soma: ({ n, x }) => rule(v => v ** n + Math.sin(v), `x^{${n}} + ${SEN} x`, `f'(x) = ${n} \\cdot ${x}^{${n - 1}} + \\cos ${x}`, n * x ** (n - 1) + Math.cos(x), x, ""),
    multc: ({ c, n, x }) => rule(v => c * v ** n, `${c} x^{${n}}`, `f'(x) = ${c} \\cdot ${n} \\cdot ${x}^{${n - 1}}`, c * n * x ** (n - 1), x, ""),
    produto: ({ n, x }) => rule(v => v ** n * Math.exp(v), `x^{${n}} e^{x}`, `f'(x) = ${n} \\cdot ${x}^{${n - 1}} e^{${x}} + ${x}^{${n}} e^{${x}}`,
      n * x ** (n - 1) * Math.exp(x) + x ** n * Math.exp(x), x, "Aqui f = xⁿ e g = eˣ: derive um de cada vez, mantendo o outro, e some."),
    quociente: ({ x }) => rule(v => Math.sin(v) / v, `\\dfrac{${SEN} x}{x}`, `f'(x) = \\dfrac{${x} \\cos ${x} - ${SEN} ${x}}{${x}^2}`, (x * Math.cos(x) - Math.sin(x)) / (x * x), x,
      "Aqui f = sen x e g = x, com g′ = 1."),
    cadeia: ({ a, x }) => rule(v => Math.sin(a * v), `${SEN}(${a}x)`, `f'(x) = ${a} \\cos(${a} \\cdot ${x})`, a * Math.cos(a * x), x,
      `A função de dentro, ${a}x, anda ${a} vezes mais rápido que x; por isso o seno de fora oscila ${a} vezes mais depressa e a inclinação é multiplicada por ${a}.`),
  };

  Licao.renderTex();
  Licao.regras(VARS, RULES, [], { sides: ["Pela definição", "Pela regra"] });
})();
