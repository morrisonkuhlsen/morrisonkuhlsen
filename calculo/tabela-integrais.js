/* Tabela de integrais: um card por regra (licao.js). Cada um mede a área de
 * a até b com a regra de Simpson, em 20 mil faixas, compara com
 * F(b) − F(a) pela primitiva e desenha a área sob a curva.
 */
(() => {
  const { texNum } = Licao;
  const SEN = "\\operatorname{sen}";

  // Regra de Simpson com n faixas (par); com a > b, a área sai com sinal trocado.
  function simpson(f, a, b, n = 20000) {
    if (a === b) return 0;
    const h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return s * h / 3;
  }
  const num = v => texNum(v, 6);

  // Gráfico da função com a área de a até b sombreada.
  function mini(f, a, b, min = -Infinity) {
    return fig => {
      const lo = Math.min(a, b), hi = Math.max(a, b);
      const x0 = Math.max(min, lo - 0.6), x1 = hi + 0.6;
      const ys = Array.from({ length: 121 }, (_, i) => f(x0 + (x1 - x0) * i / 120)).filter(Number.isFinite);
      const y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys), pad = (y1 - y0) * 0.1 || 1;
      const p = Grafico.plot(fig, { x0, x1, y0: y0 - pad, y1: y1 + pad, height: W => Math.max(150, W * 0.34), label: `Área sob a curva de ${a} a ${b}` });
      p.area(f, lo, hi);
      p.curve(f, "plot-curve", x0, x1, 300);
      p.dot(a, f(a), "plot-dot is-a", 4.5);
      p.dot(b, f(b), "plot-dot is-b", 4.5);
    };
  }

  // Monta um card: a função, a primitiva e os textos em LaTeX.
  function rule({ f, F, ftex, Ftex, a, b, note, min }) {
    const area = simpson(f, a, b), conta = F(b) - F(a);
    return {
      lhs: [`\\int_{${a}}^{${b}} ${ftex}\\,dx \\approx ${num(area)}`, area],
      rhs: [`\\Big[\\,${Ftex}\\,\\Big]_{${a}}^{${b}} = F(${b}) - F(${a}) = ${num(conta)}`, conta],
      note,
      draw: mini(f, a, b, min),
    };
  }

  const VARS = {
    a: { min: 1, max: 5, value: 1 },
    b: { min: 1, max: 6, value: 3 },
    n: { min: -3, max: 5, value: 2, skip: -1 },
    c: { min: -5, max: 9, value: 3 },
    k: { min: 1, max: 5, value: 2 },
  };

  const RULES = {
    constante: ({ c, a, b }) => rule({ f: () => c, F: x => c * x, ftex: texNum(c), Ftex: `${texNum(c)}\\,x`, a, b,
      note: `Um retângulo de altura ${c} e largura ${b - a}: área ${c * (b - a)}.` }),
    potencia: ({ n, a, b }) => rule({ f: x => x ** n, F: x => x ** (n + 1) / (n + 1), ftex: `x^{${n}}`, Ftex: `\\dfrac{x^{${n + 1}}}{${n + 1}}`, a, b,
      note: n === 0 ? "Com n = 0, x⁰ = 1: a área de um retângulo de altura 1." : n < 0 ? "Com expoente negativo a regra vale igual — só não para n = −1, que o slider pula." : "" }),
    inverso: ({ a, b }) => rule({ f: x => 1 / x, F: Math.log, ftex: "\\dfrac{1}{x}", Ftex: "\\ln x", a, b, min: 0.15,
      note: a === 1 ? `A área de 1 até ${b} é ln ${b}: é assim que o logaritmo natural pode ser definido.` : "" }),
    raiz: ({ a, b }) => rule({ f: Math.sqrt, F: x => (2 / 3) * x ** 1.5, ftex: "\\sqrt{x}", Ftex: "\\tfrac{2}{3}\\,x^{3/2}", a, b, min: 0 }),
    exp: ({ a, b }) => rule({ f: Math.exp, F: Math.exp, ftex: "e^{x}", Ftex: "e^{x}", a, b }),
    expk: ({ k, a, b }) => rule({ f: x => Math.exp(k * x), F: x => Math.exp(k * x) / k, ftex: `e^{${k}x}`, Ftex: `\\dfrac{e^{${k}x}}{${k}}`, a, b }),
    exp2: ({ a, b }) => rule({ f: x => 2 ** x, F: x => 2 ** x / Math.LN2, ftex: "2^{x}", Ftex: "\\dfrac{2^{x}}{\\ln 2}", a, b }),
    ln: ({ a, b }) => rule({ f: Math.log, F: x => x * Math.log(x) - x, ftex: "\\ln x", Ftex: "x \\ln x - x", a, b, min: 0.15 }),
    sen: ({ a, b }) => rule({ f: Math.sin, F: x => -Math.cos(x), ftex: `${SEN} x`, Ftex: "-\\cos x", a, b,
      note: "Trechos abaixo do eixo entram com sinal negativo." }),
    cos: ({ a, b }) => rule({ f: Math.cos, F: Math.sin, ftex: "\\cos x", Ftex: `${SEN} x`, a, b }),
    senk: ({ k, a, b }) => rule({ f: x => Math.sin(k * x), F: x => -Math.cos(k * x) / k, ftex: `${SEN}(${k}x)`, Ftex: `-\\dfrac{\\cos(${k}x)}{${k}}`, a, b }),
    soma: ({ n, a, b }) => rule({ f: x => x ** n + Math.cos(x), F: x => x ** (n + 1) / (n + 1) + Math.sin(x), ftex: `\\left(x^{${n}} + \\cos x\\right)`, Ftex: `\\dfrac{x^{${n + 1}}}{${n + 1}} + ${SEN} x`, a, b,
      note: "Cada parcela integrada pela sua regra, e somadas." }),
    multc: ({ c, n, a, b }) => rule({ f: x => c * x ** n, F: x => c * x ** (n + 1) / (n + 1), ftex: `${texNum(c)}\\,x^{${n}}`, Ftex: `${texNum(c)} \\cdot \\dfrac{x^{${n + 1}}}{${n + 1}}`, a, b }),
    substituicao: ({ a, b }) => rule({ f: x => 2 * x * Math.cos(x * x), F: x => Math.sin(x * x), ftex: "2x\\cos(x^2)", Ftex: `${SEN}(x^2)`, a, b,
      note: "Com u = x², du = 2x dx e a integral vira ∫ cos u du = sen u. A curva oscila cada vez mais depressa porque x² cresce rápido." }),
    partes: ({ a, b }) => rule({ f: x => x * Math.exp(x), F: x => (x - 1) * Math.exp(x), ftex: "x\\,e^{x}", Ftex: "(x - 1)\\,e^{x}", a, b,
      note: "Com u = x e dv = eˣ dx: uv − ∫ v du = x eˣ − ∫ eˣ dx = x eˣ − eˣ." }),
  };

  Licao.renderTex();
  Licao.regras(VARS, RULES, [], { sides: ["Área medida", "Pela primitiva"] });
})();
